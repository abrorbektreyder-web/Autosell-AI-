from collections.abc import AsyncGenerator
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User

# Using HTTPBearer to support Authorization: Bearer <token>
reusable_oauth2 = HTTPBearer(auto_error=False)


async def get_current_user(
    http_creds: HTTPAuthorizationCredentials | None = Depends(reusable_oauth2),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency to retrieve and authenticate the current user from JWT."""
    if not http_creds:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )
    
    token = http_creds.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user identifier",
        )
        
    try:
        user_uuid = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identifier format",
        )

    result = await db.execute(select(User).filter(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
        
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
        
    return user


async def get_current_business_id(
    current_user: User = Depends(get_current_user),
) -> UUID:
    """Dependency to retrieve the business_id of the current authenticated user."""
    return current_user.business_id


async def get_tenant_db(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AsyncGenerator[AsyncSession, None]:
    """Dependency that applies Row-Level Security tenant context parameter in Postgres."""
    # Start a transaction if not already started
    if not db.in_transaction():
        await db.begin()
    
    # Set the local variable for RLS
    await db.execute(
        text("SELECT set_config('app.current_business_id', :val, true)"),
        {"val": str(current_user.business_id)},
    )
    
    try:
        yield db
        # Commit the transaction if we opened one and it was successful
        await db.commit()
    except Exception:
        await db.rollback()
        raise
