/* ==========================================================================
   GROQ API PROXY — Vercel Serverless Function
   API kalit faqat shu yerda (server-side). Frontend da ko'rinmaydi.
   Vercel Dashboard → Settings → Environment Variables ga GROQ_API_KEY qo'shing.
   ========================================================================== */

export default async function handler(req, res) {
    // Faqat POST so'rovlarga ruxsat
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // API kalitni Vercel environment variable dan o'qish
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return res.status(500).json({
            error: {
                message: 'GROQ_API_KEY Vercel environment variables da topilmadi. Vercel Dashboard → Settings → Environment Variables ga qo\'shing.'
            }
        });
    }

    try {
        // Groq API ga so'rov yuborish (server tomonidan)
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type':  'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await groqResponse.json();

        if (!groqResponse.ok) {
            return res.status(groqResponse.status).json(data);
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            error: { message: `Server xatosi: ${error.message}` }
        });
    }
}
