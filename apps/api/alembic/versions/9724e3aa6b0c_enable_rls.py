"""enable_rls

Revision ID: 9724e3aa6b0c
Revises: 652e006f76ca
Create Date: 2026-07-18 23:19:19.651936

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9724e3aa6b0c'
down_revision: Union[str, Sequence[str], None] = '652e006f76ca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TABLES_WITH_RLS = [
    "users",
    "instagram_accounts",
    "telegram_settings",
    "products",
    "campaigns",
    "campaign_keywords",
    "instagram_comments",
    "conversations",
    "messages",
    "leads",
    "export_jobs",
    "audit_logs",
]


def upgrade() -> None:
    """Upgrade schema."""
    for table in TABLES_WITH_RLS:
        # Enable RLS on table
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
        # Create policy based on current session business ID
        op.execute(
            f"CREATE POLICY tenant_isolation_policy ON {table} "
            f"USING (business_id = current_setting('app.current_business_id', true)::uuid);"
        )


def downgrade() -> None:
    """Downgrade schema."""
    for table in TABLES_WITH_RLS:
        # Drop policy
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation_policy ON {table};")
        # Disable RLS
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")
