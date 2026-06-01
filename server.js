const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API yo'nalishlari (Vercel kabi)
app.post('/api/groq', async (req, res) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return res.status(500).json({
            error: { message: 'GROQ_API_KEY topilmadi! .env faylni tekshiring.' }
        });
    }

    try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
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
});

// Statik fayllarni xizmat qilish (index.html, styles.css, app.js)
app.use(express.static(path.join(__dirname, '')));



app.listen(PORT, () => {
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
    console.log(`💻 Veb-saytni ochish uchun brauzerda quyidagi manzilni tering: http://localhost:${PORT}`);
});
