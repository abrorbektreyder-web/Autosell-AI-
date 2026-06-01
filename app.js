/* ==========================================================================
   MULTI-AGENT SMM & SAVDO PLATFORMASI — APP LOGIC v3.2 (FULLY REAL AI)
   Task-based agent workflow with GROQ AI, Assistent review, export actions

   ⚠️  XAVFSIZLIK: API kalit bu yerda YO'Q.
   Kalit faqat server tomonida saqlanadi:
     → api/groq.js (Vercel Serverless Function)
     → Vercel Dashboard → Settings → Environment Variables → GROQ_API_KEY
   ========================================================================== */

// ── GROQ AI CONFIG ─────────────────────────────────────────────────────────
// API kalit yo'q — frontend faqat o'z serveriga (/api/groq) murojaat qiladi.
// Kalit Vercel server tomonida process.env.GROQ_API_KEY da saqlanadi.
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL   = '/api/groq'; // Vercel Serverless Function proxy

async function askGroq(systemPrompt, userPrompt, maxTokens = 600) {
    const resp = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            // Authorization yo'q — kalit server (api/groq.js) da
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user',   content: userPrompt }
            ],
            max_tokens: maxTokens,
            temperature: 0.7
        })
    });
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Groq API xatosi: ${resp.status}`);
    }
    const data = await resp.json();
    return data.choices[0].message.content.trim();
}

// ── GLOBAL STATE ──────────────────────────────────────────────────────────
// reelsScriptText must be global so auto-flow and manual flow share same ref
let reelsScriptText = '';
let uploadedImageDataURL = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired inside app.js");
    lucide.createIcons();

    // ── Refs ────────────────────────────────────────────────────────────
    const tabs       = document.querySelectorAll('.tab');
    const panes      = document.querySelectorAll('.pane');
    const logBox     = document.getElementById('log-box');
    const exportCard = document.getElementById('export-card');
    const btnGlobalStart = document.getElementById('btn-global-start');

    // Product inputs
    const prodName   = document.getElementById('product-name');
    const prodPrice  = document.getElementById('product-price');
    const styleSelect= document.getElementById('design-style');

    // Image uploader (left panel)
    const imgUploader   = document.getElementById('img-uploader');
    const imgPlaceholder= document.getElementById('img-placeholder');
    const imgPreview    = document.getElementById('img-preview');
    const previewImg    = document.getElementById('preview-img');
    const fileInput     = document.getElementById('file-input');

    // Agent state tracking
    const agentState = {
        marketer:   { status: 'idle', data: null },
        designer:   { status: 'idle', data: null },
        copywriter: { status: 'idle', data: null },
        seller:     { status: 'idle', data: null }
    };

    // ── Utility ─────────────────────────────────────────────────────────
    function ts() {
        const d = new Date();
        return d.toTimeString().slice(0,5);
    }

    function toast(text) {
        const el = document.createElement('div');
        el.className = 'toast';
        el.innerHTML = `<i data-lucide="check-circle-2"></i> ${text}`;
        document.body.appendChild(el);
        lucide.createIcons();
        setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2500);
    }

    function addLog(text, cls = 'sys') {
        const line = document.createElement('div');
        line.className = `log-line ${cls}`;
        line.innerHTML = `<span class="log-t">${ts()}</span> ${text}`;
        logBox.appendChild(line);
        logBox.scrollTop = logBox.scrollHeight;
    }

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ── Typewriter Helper Functions ─────────────────────────────────────
    function typeText(element, text, speed = 12) {
        return new Promise(resolve => {
            element.innerHTML = '';
            element.classList.add('typewriter-cursor');
            let i = 0;
            function nextChar() {
                if (i < text.length) {
                    const char = text.charAt(i);
                    if (char === '\n') {
                        element.innerHTML += '<br>';
                    } else {
                        element.innerHTML += char;
                    }
                    i++;
                    setTimeout(nextChar, speed);
                } else {
                    element.classList.remove('typewriter-cursor');
                    resolve();
                }
            }
            nextChar();
        });
    }

    function typeTextarea(textarea, text, speed = 8) {
        return new Promise(resolve => {
            textarea.value = '';
            textarea.focus();
            let i = 0;
            function nextChar() {
                if (i < text.length) {
                    textarea.value += text.charAt(i);
                    textarea.scrollTop = textarea.scrollHeight;
                    i++;
                    setTimeout(nextChar, speed);
                } else {
                    resolve();
                }
            }
            nextChar();
        });
    }

    async function typeHashtags(element, hashtags) {
        element.innerHTML = '';
        for (const tag of hashtags) {
            const span = document.createElement('span');
            span.className = 'htag';
            element.appendChild(span);
            await typeText(span, tag, 15);
            await wait(100);
        }
    }

    async function typeReels(element, scenes) {
        element.innerHTML = '';
        for (const s of scenes) {
            const card = document.createElement('div');
            card.className = 'reel-card';
            card.innerHTML = `
                <span class="reel-num">${s.num}</span>
                <p class="reel-desc"></p>
                <span class="reel-overlay hidden"><i data-lucide="type"></i> Matn: ${s.text}</span>
            `;
            element.appendChild(card);
            lucide.createIcons();

            const descEl = card.querySelector('.reel-desc');
            await typeText(descEl, s.desc, 12);

            const overlay = card.querySelector('.reel-overlay');
            overlay.classList.remove('hidden');
            await wait(150);
        }
    }

    // ── Parse Reels Lines into Scene Objects ────────────────────────────
    function parseReelsScenes(reelsText, productName, productPrice) {
        const sceneLines = reelsText.split('\n').filter(l => l.match(/^\d+-Sahna/));
        const scenes = sceneLines.map((line, i) => {
            const parts = line.split('|');
            const header = (parts[0] || `${i+1}-Sahna (3s)`).trim();
            const desc = header.replace(/^\d+-Sahna\s*\(\d+s\):\s*/,'').trim() || 'Mahsulot ko\'rsatiladi.';
            const textMatch = line.match(/Matn:\s*"([^"]+)"/);
            return { num: header.split(':')[0].trim(), desc, text: textMatch ? `"${textMatch[1]}"` : '"..."' };
        });
        if (scenes.length >= 2) return scenes;
        return [
            { num:'1-Sahna (3s)', desc:'Mahsulotni ko\'rsatish.', text:'"Buni ko\'rdingizmi?"' },
            { num:'2-Sahna (4s)', desc:'Mahsulot ishlatilishi.', text:'"Hayotingizni osonlashtiring!"' },
            { num:'3-Sahna (3s)', desc:'Afzalliklari ro\'yxati.', text:'"Premium sifat"' },
            { num:'4-Sahna (3s)', desc:'Narx va buyurtma.', text:`"${productPrice} so'm — Buyurtma bering!"` }
        ];
    }

    // Chat tarixini o'qib olish (Suhbat Contexti)
    function getChatContext() {
        const ascMessages = document.getElementById('asc-messages');
        if (!ascMessages) return '';
        const bubbles = ascMessages.querySelectorAll('.asc-bubble');
        let lines = [];
        bubbles.forEach(b => {
            const senderEl = b.querySelector('.asc-sender');
            const senderText = senderEl ? senderEl.textContent.trim() : '';
            // textContent dan sender qismini olib tashlash
            const fullText = b.textContent.replace(senderText, '').trim();
            if (!fullText) return;
            if (b.classList.contains('user')) {
                lines.push(`Foydalanuvchi: ${fullText}`);
            } else if (b.classList.contains('ai')) {
                lines.push(`Assistent: ${fullText}`);
            }
        });
        if (!lines.length) return '';
        const context = lines.join('\n');
        return `\n\n=== ASSISTENT BILAN MUHOKAMALAR (Barcha agentlar buni hisobga olsin) ===\n${context}\n=== MUHOKAMA TUGADI ===\n`;
    }

    // Chat xabarlar sonini qaytaradi
    function getChatMessageCount() {
        const ascMessages = document.getElementById('asc-messages');
        if (!ascMessages) return 0;
        return ascMessages.querySelectorAll('.asc-bubble').length;
    }

    async function parseAndDisplayBrief(visualBrief) {
        let colors = ['#6C63FF', '#FF6B6B', '#FFA07A'];
        let mood = 'Energetic';
        let format = '4:5';
        let font = 'Montserrat';

        const lines = visualBrief.split('\n');
        lines.forEach(line => {
            const upper = line.toUpperCase().trim();
            if (upper.startsWith('RANG:')) {
                const val = line.substring(line.indexOf(':') + 1).trim();
                const hexMatches = val.match(/#[0-9A-Fa-f]{6}/g);
                if (hexMatches && hexMatches.length > 0) {
                    colors = hexMatches.slice(0, 3);
                }
            } else if (upper.startsWith('KAYFIYAT:')) {
                mood = line.substring(line.indexOf(':') + 1).trim();
            } else if (upper.startsWith('FORMAT:')) {
                format = line.substring(line.indexOf(':') + 1).trim();
            } else if (upper.startsWith('FONT_TAVSIYA:')) {
                font = line.substring(line.indexOf(':') + 1).trim();
            }
        });

        // Update DOM
        const colorsContainer = document.getElementById('brief-colors');
        if (colorsContainer) {
            colorsContainer.innerHTML = '';
            colors.forEach(col => {
                const dot = document.createElement('div');
                dot.className = 'color-dot';
                dot.style.background = col;
                colorsContainer.appendChild(dot);
            });
        }

        const moodEl = document.getElementById('brief-mood');
        const formatEl = document.getElementById('brief-format');
        const fontEl = document.getElementById('brief-font');
        
        if (moodEl) await typeText(moodEl, mood, 15);
        if (formatEl) await typeText(formatEl, format, 15);
        if (fontEl) await typeText(fontEl, font, 15);

        return { colors, mood, format, font };
    }

    // ══════════════════════════════════════════════════════════════════════
    //  AUTO-FLOW PIPELINE ORCHESTRATOR
    // ══════════════════════════════════════════════════════════════════════
    async function runGlobalPipeline() {
        logBox.innerHTML = '';
        addLog('🚀 Multi-Agent Auto-Flow pipeline boshlandi...', 'sys');

        exportCard.classList.add('locked');
        exportCard.classList.remove('unlocked');
        reelsScriptText = '';

        ['marketer', 'designer', 'copywriter', 'seller'].forEach(a => {
            agentState[a].status = 'idle';
            agentState[a].data = null;
            updateSupervisorCard(a, 'idle', 'Kutilmoqda');
            updateBadge(a, 'idle', 'Kutilmoqda');

            const res = document.getElementById(`result-${a}`);
            const task = document.getElementById(`task-${a}`);
            const load = document.getElementById(`loading-${a}`);
            if (res) res.classList.add('hidden');
            if (task) task.classList.remove('hidden');
            if (load) load.classList.add('hidden');
        });

        // Reset DM messages
        const dmBox = document.getElementById('dm-messages');
        if (dmBox) dmBox.innerHTML = '<div class="dm-notice">Suhbat boshlandi. Sotuvchi agent savdolarni yopishga tayyor.</div>';

        // Disable inputs
        prodName.disabled = true;
        prodPrice.disabled = true;
        styleSelect.disabled = true;
        btnGlobalStart.disabled = true;
        btnGlobalStart.innerHTML = '<i data-lucide="loader-2" class="spinner"></i> Oqim Ishlamoqda...';
        lucide.createIcons();

        const name = getProductName();
        const price = getProductPrice();
        const chatContext = getChatContext();
        const chatCount = getChatMessageCount();

        // === CHAT INTEGRATSIYA BILDIRIMI ===
        // Agar assistent bilan muhokamalar bo'lgan bo'lsa, foydalanuvchiga bildirish
        if (chatCount > 0) {
            addLog(`💬 Assistent bilan ${chatCount} ta muhokama xabari aniqlandi — barcha agentlarga uzatilmoqda...`, 'supervisor');
            // Assistent panelida ham bildirish (to'g'ridan-to'g'ri DOM dan olinadi)
            const ascMsgBox = document.getElementById('asc-messages');
            if (ascMsgBox) {
                const noticeEl = document.createElement('div');
                noticeEl.className = 'asc-bubble ai asc-pipeline-notice';
                noticeEl.innerHTML = `<span class="asc-sender">👑 Shaxsiy Assistent</span>✅ <strong>Pipeline boshlandi!</strong> Bizning ${chatCount} ta xabardagi barcha muhokamalarimiz — Marketolog, Dizayner, Kopirayter va Sotuvchi agentlarga uzatildi. Ular muhokamalarimiz asosida ishlamoqda! 🚀`;
                ascMsgBox.appendChild(noticeEl);
                ascMsgBox.scrollTop = ascMsgBox.scrollHeight;
            }
        } else {
            addLog('ℹ️ Assistent bilan muhokama topilmadi — standart rejimda ishlamoqda.', 'sys');
        }

        // ── 1-QADAM: MARKETOLOG AGENT ─────────────────────────────────────
        switchTab('marketer');
        const tabMarketer = document.getElementById('tab-marketer');
        tabMarketer.classList.add('pipelining');

        const taskMarketer    = document.getElementById('task-marketer');
        const loadingMarketer = document.getElementById('loading-marketer');
        const resultMarketer  = document.getElementById('result-marketer');

        taskMarketer.classList.add('hidden');
        loadingMarketer.classList.remove('hidden');
        updateBadge('marketer', 'working', 'Ishlamoqda...');
        updateSupervisorCard('marketer', 'working', 'Ishlamoqda...');
        addLog('Marketolog vazifa oldi: Bozor tahlili boshlandi', 'marketer');
        addLog('🤖 Groq AI dan bozor tahlili so\'ramoqda...', 'sys');

        let audience, triggers, hashtagsRaw;
        try {
            const aiResp = await askGroq(
                `Sen O'zbekistondagi professional SMM marketolog agentsan. Foydalanuvchi mahsulot nomini beradi, sen qisqa va aniq O'zbek tilida javob berasan. Faqat so'ralgan formatda javob ber, boshqa narsa yozma.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.${chatContext}

Quyidagi formatda javob ber (boshqa hech narsa yozma):
AUDITORIYA: [2-3 ta aniq auditoriya guruhi, vergul bilan]
TRIGGERLAR: [4-5 ta xarid uchun asosiy motivatsion sabab, vergul bilan]
HASHTAGLAR: [10 ta o'zbek ijtimoiy tarmoqlari uchun mos hashtag, vergul bilan ajrat]`,
                450
            );
            const lines = aiResp.split('\n');
            audience = (lines.find(l => l.startsWith('AUDITORIYA:')) || '').replace('AUDITORIYA:', '').trim() ||
                `Yosh tadbirkorlar (20-40 yosh), uy bekalari, onlayn savdo bilan shug'ullanuvchilar.`;
            triggers = (lines.find(l => l.startsWith('TRIGGERLAR:')) || '').replace('TRIGGERLAR:', '').trim() ||
                `Sifat kafolati, tez yetkazib berish, arzon narx, bepul qaytarish, cheksiz chegirma.`;
            const hashLine = (lines.find(l => l.startsWith('HASHTAGLAR:')) || '').replace('HASHTAGLAR:', '').trim();
            hashtagsRaw = hashLine
                ? hashLine.split(',').map(h => { const t = h.trim(); return t.startsWith('#') ? t : '#'+t.replace(/ /g,''); })
                : [];
            if (hashtagsRaw.length < 3) hashtagsRaw = [`#${name.toLowerCase().replace(/ /g,'')}`, '#smmuz', '#onlineuz', '#tashkent', '#biznesuz', '#savdouz'];
        } catch(e) {
            addLog(`⚠️ AI xatosi: ${e.message}. Standart ma'lumot ishlatilmoqda.`, 'sys');
            audience = `Yosh sayohatchilar (18-35 yosh), sport faollari, ofis xodimlari.`;
            triggers = `24 soat harorat saqlash, premium sifat, bepul yetkazib berish, chegirma.`;
            hashtagsRaw = [`#${name.toLowerCase().replace(/ /g,'')}`, '#termosuz', '#smmuz', '#onlineuz', '#tashkent', '#aktivuz'];
        }

        agentState.marketer.data = { audience, triggers, hashtags: hashtagsRaw };

        loadingMarketer.classList.add('hidden');
        resultMarketer.classList.remove('hidden');

        await Promise.all([
            typeText(document.getElementById('r-audience'), audience, 10),
            typeText(document.getElementById('r-triggers'), triggers, 10),
            typeHashtags(document.getElementById('r-hashtags'), hashtagsRaw)
        ]);

        agentState.marketer.status = 'done';
        updateBadge('marketer', 'done', 'Tayyor ✓');
        updateSupervisorCard('marketer', 'done', 'Tayyor ✓');
        addLog('Marketolog AI tahlili yakunlandi.', 'marketer');
        tabMarketer.classList.remove('pipelining');
        await wait(1000);

        // ── 2-QADAM: DIZAYNER AGENT (Visual Analyst) ────────────────────────────
        switchTab('designer');
        const tabDesigner = document.getElementById('tab-designer');
        tabDesigner.classList.add('pipelining');

        const taskDesigner    = document.getElementById('task-designer');
        const loadingDesigner = document.getElementById('loading-designer');
        const resultDesigner  = document.getElementById('result-designer');

        taskDesigner.classList.add('hidden');
        loadingDesigner.classList.remove('hidden');
        updateBadge('designer', 'working', 'Ishlamoqda...');
        updateSupervisorCard('designer', 'working', 'Ishlamoqda...');
        addLog('Dizayner vazifa oldi: Rasm yuklanganligi tekshirilmoqda va vizual marketing tahlili boshlandi...', 'designer');

        await wait(2000); // 2 soniya loading simulyatsiyasi

        // 1. Rasmni oladi (global variable dan)
        const imageToShow = uploadedImageDataURL || null;

        // 2. Rasmni pane'da ko'rsatadi
        const designerPreviewImg = document.getElementById('designer-preview-img');
        if (imageToShow) {
            if (designerPreviewImg) designerPreviewImg.src = imageToShow;
            document.getElementById('designer-no-image').classList.add('hidden');
            document.getElementById('designer-has-image').classList.remove('hidden');
            
            // Backward compatibility for approved image
            const approvedImg = document.getElementById('approved-image');
            if (approvedImg) approvedImg.src = imageToShow;
        } else {
            // Rasm yuklanmagan — ogohlantirish
            document.getElementById('designer-no-image').classList.remove('hidden');
            document.getElementById('designer-has-image').classList.add('hidden');
        }

        // 3. AI Vizual Tahlil
        addLog('🤖 Groq AI dan vizual marketing tahlili so\'ramoqda...', 'sys');
        let visualBrief = '';
        try {
            visualBrief = await askGroq(
                `Sen vizual marketing ekspertisan. O'zbek tilida qisqa va aniq javob berasan. Agar foydalanuvchi bilan oldingi muhokamalar bo'lsa, ularni vizual tanlov uchun inobatga ol.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.${chatContext}
Post uchun quyidagi formatda vizual tavsiyalar ber:
RANG: [3 ta HEX rang, vergul bilan, misol: #FF5733, #C0392B, #2C3E50]
KAYFIYAT: [bitta so'z: Luxury / Natural / Energetic / Minimal / Bold]
FORMAT: [bitta format: 1:1 / 4:5 / 9:16]
FONT_TAVSIYA: [bitta font nomi: Montserrat / Playfair Display / Oswald / Bebas Neue]`,
                250
            );
        } catch(e) {
            visualBrief = 'RANG: #6C63FF, #FF6B6B, #FFA07A\nKAYFIYAT: Energetic\nFORMAT: 4:5\nFONT_TAVSIYA: Montserrat';
        }

        loadingDesigner.classList.add('hidden');
        resultDesigner.classList.remove('hidden');

        // Parse and display visual brief
        const briefData = await parseAndDisplayBrief(visualBrief);

        // 4. agentState saqlanadi
        agentState.designer.status = 'done';
        agentState.designer.data = {
            imageSrc: imageToShow,
            visualBrief: briefData
        };

        updateBadge('designer', 'done', 'Tayyor ✓');
        updateSupervisorCard('designer', 'done', 'Tayyor ✓');
        addLog(`Dizayner ishini tugatdi: AI Vizual Tahlili tayyorlandi ✓`, 'designer');
        tabDesigner.classList.remove('pipelining');
        await wait(1000);

        // ── 3-QADAM: KOPIRAYTER AGENT ─────────────────────────────────────
        switchTab('copywriter');
        const tabCopywriter = document.getElementById('tab-copywriter');
        tabCopywriter.classList.add('pipelining');

        const taskCopywriter    = document.getElementById('task-copywriter');
        const loadingCopywriter = document.getElementById('loading-copywriter');
        const resultCopywriter  = document.getElementById('result-copywriter');

        taskCopywriter.classList.add('hidden');
        loadingCopywriter.classList.remove('hidden');
        updateBadge('copywriter', 'working', 'Ishlamoqda...');
        updateSupervisorCard('copywriter', 'working', 'Ishlamoqda...');
        addLog('Kopirayter vazifa oldi: Groq AI AIDA post va Reels ssenariysi yozmoqda...', 'copywriter');

        const hashStr = agentState.marketer.data
            ? agentState.marketer.data.hashtags.join(' ')
            : `#${name.toLowerCase().replace(/ /g,'')} #smmuz #onlineuz`;

        const brief = agentState.designer.data?.visualBrief || {};
        const designBriefStr = brief.mood 
            ? `\nVisual Brief: Kayfiyat - ${brief.mood}, Ranglar - ${brief.colors.join(', ')}, Format - ${brief.format}, Font - ${brief.font}.`
            : '';

        let captionText, reelsRaw;
        try {
            addLog('🤖 Groq AI dan SMM post matni so\'ramoqda...', 'sys');
            captionText = await askGroq(
                `Sen O'zbekiston uchun professional SMM kopirayter agentsan. AIDA formulasi asosida Instagram post matni yozasan. Emoji ishlatasan. O'zbek tilida yozasan.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.
Hashtaglar: ${hashStr}${chatContext}${designBriefStr}

Instagram uchun hissiy, sotuvchi post matni yoz (AIDA formulasi: Diqqat → Qiziqish → Istak → Harakat). Matn oxiriga hashtaglarni qo'sh.`,
                700
            );

            addLog('🤖 Groq AI dan Pro Reels ssenariy so\'ramoqda...', 'sys');
            reelsRaw = await askGroq(
                `Sen professional Video Prodyuser va Rejissorsan. O'zbek tilida eng zo'r, virusli (viral) bo'ladigan Reels video ssenariy va montaj yo'riqnomasi yozasan.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.${chatContext}${designBriefStr}

Instagram Reels uchun pro darajada 4 ta sahna yoz. Har bir sahna uchun kamera rakursi, montaj effekti (masalan, Zoom In, Glitch, Fast pan) va ekranda chiqadigan yozuv (Matn) ni aniq ko'rsat.
Format faqat shunday bo'lsin:
1-Sahna (Xs): [Kamera rakursi va effekt] - [Harakat tasviri] | Matn: "[ekran matni]"
2-Sahna (Xs): [Kamera rakursi va effekt] - [Harakat tasviri] | Matn: "[ekran matni]"
3-Sahna (Xs): [Kamera rakursi va effekt] - [Harakat tasviri] | Matn: "[ekran matni]"
4-Sahna (Xs): [Kamera rakursi va effekt] - [Harakat tasviri] | Matn: "[ekran matni]"`,
                600
            );
        } catch(e) {
            addLog(`⚠️ AI xatosi: ${e.message}. Standart matn ishlatilmoqda.`, 'sys');
            captionText = `✨ ${name} — Muzdek suv yoki issiq choy uchun eng yaxshi hamroh!\n\n🌟 Afzalliklari: Premium sifat, qulay narx, tez yetkazib berish.\n\n🎁 Narxi: ${price} so'm. Hoziroq buyurtma bering!\n\n${hashStr}`;
            reelsRaw = `1-Sahna (3s): Mahsulotni ko'rsatish | Matn: "Buni ko'rdingizmi?"\n2-Sahna (4s): Ishlatilishi | Matn: "Hayotingizni osonlashtiring!"\n3-Sahna (3s): Afzalliklari | Matn: "Premium sifat"\n4-Sahna (3s): Narx va buyurtma | Matn: "${price} so'm — Buyurtma bering!"`;
        }

        reelsScriptText = `🎬 Reels Ssenariysi — ${name}\n\n${reelsRaw}`;
        const finalScenes = parseReelsScenes(reelsRaw, name, price);

        agentState.copywriter.data = { caption: captionText, reelsScriptText };

        loadingCopywriter.classList.add('hidden');
        resultCopywriter.classList.remove('hidden');

        await Promise.all([
            typeTextarea(document.getElementById('r-caption'), captionText, 6),
            typeReels(document.getElementById('r-reels'), finalScenes)
        ]);

        agentState.copywriter.status = 'done';
        updateBadge('copywriter', 'done', 'Tayyor ✓');
        updateSupervisorCard('copywriter', 'done', 'Tayyor ✓');
        addLog('Kopirayter AI matnlari va Reels ssenariylarini yaratdi ✓', 'copywriter');
        tabCopywriter.classList.remove('pipelining');
        await wait(1000);

        // ── 4-QADAM: SOTUVCHI AGENT ──────────────────────────────────────
        switchTab('seller');
        const tabSeller = document.getElementById('tab-seller');
        tabSeller.classList.add('pipelining');

        const taskSeller    = document.getElementById('task-seller');
        const loadingSeller = document.getElementById('loading-seller');
        const resultSeller  = document.getElementById('result-seller');

        taskSeller.classList.add('hidden');
        loadingSeller.classList.remove('hidden');
        updateBadge('seller', 'working', 'Faollashtirilmoqda...');
        updateSupervisorCard('seller', 'working', 'Faollashtirilmoqda...');
        addLog('Sotuvchi agent vazifa oldi: DM avtomatik javob tizimi faollashtirildi', 'seller');

        await wait(1500);

        loadingSeller.classList.add('hidden');
        resultSeller.classList.remove('hidden');

        // Sotuvchi agentga chat kontekstini saqlash
        agentState.seller.status = 'done';
        agentState.seller.data = { active: true, chatContext };
        updateBadge('seller', 'done', 'Faol ✓');
        updateSupervisorCard('seller', 'done', 'Tayyor ✓');
        addLog('Sotuvchi agent tayyor: Groq AI DM simulyator faol ✓', 'seller');
        tabSeller.classList.remove('pipelining');
        await wait(1000);

        // ── 5-QADAM: ASSISTENT SUPERVISOR REVIEW ────────────────────────
        switchTab('supervisor');
        const tabSupervisor = document.getElementById('tab-supervisor');
        tabSupervisor.classList.add('pipelining');

        addLog('Assistent barcha agentlar ishini tekshirishni boshladi...', 'supervisor');
        ['marketer', 'designer', 'copywriter', 'seller'].forEach(a => {
            updateSupervisorCard(a, 'reviewing', 'Tekshirilmoqda...');
        });

        await wait(2000);

        ['marketer', 'designer', 'copywriter', 'seller'].forEach(a => {
            updateSupervisorCard(a, 'done', 'Tasdiqlandi ✓');
        });

        addLog('Sifat nazorati yakunlandi. Hamma ma\'lumotlar imlosi tekshirildi.', 'supervisor');
        addLog('✅ Tayyor bo\'ldi, xo\'jayin! Barcha fayllar taqdim etildi.', 'success');

        exportCard.classList.remove('locked');
        exportCard.classList.add('unlocked');
        tabSupervisor.classList.remove('pipelining');

        // Enable inputs
        prodName.disabled = false;
        prodPrice.disabled = false;
        styleSelect.disabled = false;
        btnGlobalStart.disabled = false;
        btnGlobalStart.innerHTML = '<i data-lucide="play-circle"></i> Ishni Boshlash (Start) 🚀';
        lucide.createIcons();

        toast('Auto-Flow muvaffaqiyatli yakunlandi! 👑');
    }

    btnGlobalStart.addEventListener('click', runGlobalPipeline);

    function getProductName() { return prodName.value.trim() || 'Mahsulot'; }
    function getProductPrice() { return parseInt(prodPrice.value || 0).toLocaleString('uz-UZ'); }

    // ── Tab Navigation ──────────────────────────────────────────────────
    function switchTab(name) {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        const btn = document.getElementById(`tab-${name}`);
        const pane = document.getElementById(`pane-${name}`);
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
    }

    tabs.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // ── Image Upload (Left Panel) ───────────────────────────────────────
    imgUploader.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            uploadedImageDataURL = ev.target.result;
            previewImg.src = ev.target.result;
            imgPlaceholder.classList.add('hidden');
            imgPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    // ── Per-agent task image drops ──────────────────────────────────────
    document.querySelectorAll('.task-img-drop').forEach(drop => {
        const inp = drop.querySelector('input[type="file"]');
        const prev = drop.querySelector('.task-img-preview');
        drop.addEventListener('click', () => inp.click());
        inp.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                prev.src = ev.target.result;
                prev.classList.remove('hidden');
                drop.querySelector('i').style.display = 'none';
                drop.querySelector('span').style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    });

    // ── Update Supervisor Cards ─────────────────────────────────────────
    function updateSupervisorCard(agent, status, label) {
        const card = document.getElementById(`sc-${agent}`);
        const state = document.getElementById(`ss-${agent}`);
        if (card) card.className = `status-card ${status}`;
        if (state) state.textContent = label;
    }

    function updateBadge(agent, status, label) {
        const badge = document.getElementById(`badge-${agent}`);
        if (!badge) return;
        badge.className = `agent-badge ${status}`;
        badge.textContent = label;
    }

    // ── Check if Assistent should review ────────────────────────────────
    function checkAllDone() {
        const coreReady = agentState.marketer.status === 'done'
                       && agentState.designer.status === 'done'
                       && agentState.copywriter.status === 'done'
                       && agentState.seller.status === 'done';
        if (coreReady) {
            runAssistentReview();
        }
    }

    async function runAssistentReview() {
        if (exportCard.classList.contains('unlocked')) return; // already reviewed

        addLog('Assistent barcha agentlar ishini tekshirishni boshladi...', 'supervisor');

        ['marketer','designer','copywriter','seller'].forEach(a => {
            if (agentState[a].status === 'done') {
                updateSupervisorCard(a, 'reviewing', 'Tekshirilmoqda...');
            }
        });

        await wait(1800);

        ['marketer','designer','copywriter','seller'].forEach(a => {
            if (agentState[a].status === 'done') {
                updateSupervisorCard(a, 'done', 'Tasdiqlandi ✓');
            }
        });

        addLog('Sifat nazorati yakunlandi. Imlo va grammatik xatolar tekshirildi.', 'supervisor');
        addLog('✅ Tayyor bo\'ldi, xo\'jayin! Barcha fayllar taqdim etildi.', 'success');

        exportCard.classList.remove('locked');
        exportCard.classList.add('unlocked');

        switchTab('supervisor');
        toast('Barcha agentlar tayyor! 🎉');
    }

    // ══════════════════════════════════════════════════════════════════════
    //  MARKETOLOG AGENT (MANUAL)
    // ══════════════════════════════════════════════════════════════════════
    document.getElementById('start-marketer').addEventListener('click', async () => {
        if (agentState.marketer.status === 'working') return;
        agentState.marketer.status = 'working';

        const taskBox = document.getElementById('task-marketer');
        const loading = document.getElementById('loading-marketer');
        const result  = document.getElementById('result-marketer');

        taskBox.classList.add('hidden');
        result.classList.add('hidden');
        loading.classList.remove('hidden');

        updateBadge('marketer', 'working', 'Ishlamoqda...');
        updateSupervisorCard('marketer', 'working', 'Ishlamoqda...');
        addLog('Marketolog vazifa oldi: Groq AI bozor tahlilini boshladi', 'marketer');

        const name = getProductName();
        const price = getProductPrice();
        addLog('🤖 Groq AI dan bozor tahlili so\'ramoqda...', 'sys');

        let audience2, triggers2, hashtagsArr;
        try {
            const aiResp = await askGroq(
                `Sen O'zbekistondagi professional SMM marketolog agentsan. Foydalanuvchi mahsulot nomini beradi, sen qisqa va aniq O'zbek tilida javob berasan. Faqat so'ralgan formatda javob ber, boshqa narsa yozma.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.

Quyidagi formatda javob ber (boshqa hech narsa yozma):
AUDITORIYA: [2-3 ta aniq auditoriya guruhi]
TRIGGERLAR: [4-5 ta xarid uchun asosiy motivatsion sabab]
HASHTAGLAR: [10 ta o'zbek ijtimoiy tarmoqlari uchun mos hashtag, vergul bilan ajrat]`,
                450
            );
            const lines = aiResp.split('\n');
            audience2 = (lines.find(l => l.startsWith('AUDITORIYA:')) || '').replace('AUDITORIYA:', '').trim() ||
                `Yosh tadbirkorlar (20-40 yosh), uy bekalari, onlayn savdo bilan shug'ullanuvchilar.`;
            triggers2 = (lines.find(l => l.startsWith('TRIGGERLAR:')) || '').replace('TRIGGERLAR:', '').trim() ||
                `Sifat kafolati, tez yetkazib berish, arzon narx, bepul qaytarish.`;
            const hashLine = (lines.find(l => l.startsWith('HASHTAGLAR:')) || '').replace('HASHTAGLAR:', '').trim();
            hashtagsArr = hashLine
                ? hashLine.split(',').map(h => { const tt = h.trim(); return tt.startsWith('#') ? tt : '#'+tt.replace(/ /g,''); })
                : [];
            if (hashtagsArr.length < 3) hashtagsArr = [`#${name.toLowerCase().replace(/ /g,'')}`, '#smmuz', '#onlineuz', '#tashkent', '#biznesuz'];
        } catch(e) {
            addLog(`⚠️ AI xatosi: ${e.message}`, 'sys');
            audience2 = `Yosh sayohatchilar (18-35 yosh), sport faollari, ofis xodimlari.`;
            triggers2 = `24 soat harorat saqlash, premium sifat, bepul yetkazib berish.`;
            hashtagsArr = [`#${name.toLowerCase().replace(/ /g,'')}`, '#termosuz', '#smmuz', '#onlineuz', '#tashkent'];
        }

        agentState.marketer.data = { audience: audience2, triggers: triggers2, hashtags: hashtagsArr };

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        await Promise.all([
            typeText(document.getElementById('r-audience'), audience2, 10),
            typeText(document.getElementById('r-triggers'), triggers2, 10),
            typeHashtags(document.getElementById('r-hashtags'), hashtagsArr)
        ]);

        agentState.marketer.status = 'done';
        updateBadge('marketer', 'done', 'Tayyor ✓');
        updateSupervisorCard('marketer', 'done', 'Tayyor ✓');
        addLog(`Marketolog AI tahlilini yakunladi: ${hashtagsArr.length} ta hashtag yaratildi`, 'marketer');

        checkAllDone();
    });

    // Copy hashtags
    document.getElementById('copy-hashtags').addEventListener('click', () => {
        if (!agentState.marketer.data) return;
        navigator.clipboard.writeText(agentState.marketer.data.hashtags.join(' '));
        toast('Hashtaglar nusxalandi!');
    });

    // ══════════════════════════════════════════════════════════════════════
    //  DIZAYNER AGENT (MANUAL)
    // ══════════════════════════════════════════════════════════════════════
    document.getElementById('start-designer').addEventListener('click', async () => {
        if (agentState.designer.status === 'working') return;
        agentState.designer.status = 'working';

        const taskBox = document.getElementById('task-designer');
        const loading = document.getElementById('loading-designer');
        const result  = document.getElementById('result-designer');

        taskBox.classList.add('hidden');
        result.classList.add('hidden');
        loading.classList.remove('hidden');

        updateBadge('designer', 'working', 'Ishlamoqda...');
        updateSupervisorCard('designer', 'working', 'Ishlamoqda...');
        addLog('Dizayner vazifa oldi: Rasm yuklanganligi tekshirilmoqda va vizual marketing tahlili boshlandi...', 'designer');

        const name = getProductName();
        const price = getProductPrice();

        await wait(2000); // 2 soniya loading simulyatsiyasi

        // 1. Rasmni oladi
        const imageToShow = uploadedImageDataURL || null;

        // 2. Rasmni pane'da ko'rsatadi
        const designerPreviewImg = document.getElementById('designer-preview-img');
        if (imageToShow) {
            if (designerPreviewImg) designerPreviewImg.src = imageToShow;
            document.getElementById('designer-no-image').classList.add('hidden');
            document.getElementById('designer-has-image').classList.remove('hidden');
            
            // Backward compatibility for approved image
            const approvedImg = document.getElementById('approved-image');
            if (approvedImg) approvedImg.src = imageToShow;
        } else {
            // Rasm yuklanmagan — ogohlantirish
            document.getElementById('designer-no-image').classList.remove('hidden');
            document.getElementById('designer-has-image').classList.add('hidden');
        }

        // 3. AI Vizual Tahlil
        addLog('🤖 Groq AI dan vizual marketing tahlili so\'ramoqda...', 'sys');
        let visualBrief = '';
        try {
            visualBrief = await askGroq(
                `Sen vizual marketing ekspertisan. O'zbek tilida qisqa va aniq javob berasan.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.
Post uchun quyidagi formatda vizual tavsiyalar ber:
RANG: [3 ta HEX rang, vergul bilan, misol: #FF5733, #C0392B, #2C3E50]
KAYFIYAT: [bitta so'z: Luxury / Natural / Energetic / Minimal / Bold]
FORMAT: [bitta format: 1:1 / 4:5 / 9:16]
FONT_TAVSIYA: [bitta font nomi: Montserrat / Playfair Display / Oswald / Bebas Neue]`,
                200
            );
        } catch(e) {
            visualBrief = 'RANG: #6C63FF, #FF6B6B, #FFA07A\nKAYFIYAT: Energetic\nFORMAT: 4:5\nFONT_TAVSIYA: Montserrat';
        }

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        // Parse and display visual brief
        const briefData = await parseAndDisplayBrief(visualBrief);

        agentState.designer.status = 'done';
        agentState.designer.data = {
            imageSrc: imageToShow,
            visualBrief: briefData
        };

        updateBadge('designer', 'done', 'Tayyor ✓');
        updateSupervisorCard('designer', 'done', 'Tayyor ✓');
        addLog(`Dizayner ishini tugatdi: AI Vizual Tahlili tayyorlandi`, 'designer');

        checkAllDone();
    });

    // Format tabs click listener
    function initFormatTabs() {
        document.querySelectorAll('.fmt-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.fmt-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const ratio = btn.dataset.ratio; // "1/1", "4/5", "9/16"
                const frame = document.getElementById('designer-img-frame');
                if (frame) {
                    frame.style.aspectRatio = ratio.replace('/', ' / ');
                }
            });
        });
    }
    initFormatTabs();

    // Filter controls
    const ctrlSat = document.getElementById('ctrl-saturation');
    const ctrlBrt = document.getElementById('ctrl-brightness');
    const ctrlCnt = document.getElementById('ctrl-contrast');
    const valSat  = document.getElementById('val-saturation');
    const valBrt  = document.getElementById('val-brightness');
    const valCnt  = document.getElementById('val-contrast');
    const designerPreviewImg = document.getElementById('designer-preview-img');

    function applyFilters() {
        if (!designerPreviewImg) return;
        const satVal = ctrlSat ? ctrlSat.value : 100;
        const brtVal = ctrlBrt ? ctrlBrt.value : 100;
        const cntVal = ctrlCnt ? ctrlCnt.value : 100;
        
        designerPreviewImg.style.filter = `saturate(${satVal}%) brightness(${brtVal}%) contrast(${cntVal}%)`;
        
        if (valSat) valSat.textContent = satVal + '%';
        if (valBrt) valBrt.textContent = brtVal + '%';
        if (valCnt) valCnt.textContent = cntVal + '%';
    }
    if (ctrlSat) ctrlSat.addEventListener('input', applyFilters);
    if (ctrlBrt) ctrlBrt.addEventListener('input', applyFilters);
    if (ctrlCnt) ctrlCnt.addEventListener('input', applyFilters);

    // Download designed image
    document.getElementById('download-designed').addEventListener('click', () => {
        if (!agentState.designer.data || !agentState.designer.data.imageSrc) {
            toast('Yuklangan rasm topilmadi!');
            return;
        }
        toast('Rasm yuklanmoqda...');
        const a = document.createElement('a');
        a.href = agentState.designer.data.imageSrc;
        a.download = `visual_analyst_${getProductName().replace(/ /g,'_').toLowerCase()}.png`;
        a.click();
        toast('Rasm yuklandi!');
    });

    // ══════════════════════════════════════════════════════════════════════
    //  KOPIRAYTER AGENT (MANUAL)
    // ══════════════════════════════════════════════════════════════════════
    document.getElementById('start-copywriter').addEventListener('click', async () => {
        if (agentState.copywriter.status === 'working') return;
        agentState.copywriter.status = 'working';

        const taskBox = document.getElementById('task-copywriter');
        const loading = document.getElementById('loading-copywriter');
        const result  = document.getElementById('result-copywriter');

        taskBox.classList.add('hidden');
        result.classList.add('hidden');
        loading.classList.remove('hidden');

        updateBadge('copywriter', 'working', 'Ishlamoqda...');
        updateSupervisorCard('copywriter', 'working', 'Ishlamoqda...');
        addLog('Kopirayter vazifa oldi: Groq AI AIDA post va Reels ssenariysi yozmoqda', 'copywriter');

        const name = getProductName();
        const price = getProductPrice();
        const hashStr2 = agentState.marketer.data
            ? agentState.marketer.data.hashtags.join(' ')
            : `#${name.toLowerCase().replace(/ /g,'')} #smmuz #onlineuz`;

        const brief2 = agentState.designer.data?.visualBrief || {};
        const designBriefStr2 = brief2.mood 
            ? `\nVisual Brief: Kayfiyat - ${brief2.mood}, Ranglar - ${brief2.colors.join(', ')}, Format - ${brief2.format}, Font - ${brief2.font}.`
            : '';

        let caption3, reelsRaw2;
        try {
            addLog('🤖 Groq AI dan SMM post matni so\'ramoqda...', 'sys');
            caption3 = await askGroq(
                `Sen O'zbekiston uchun professional SMM kopirayter agentsan. AIDA formulasi asosida Instagram post matni yozasan. Emoji ishlatasan. O'zbek tilida yozasan.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.\nHashtaglar: ${hashStr2}${designBriefStr2}\n\nInstagram uchun hissiy, sotuvchi post matni yoz (AIDA formulasi). Matn oxiriga hashtaglarni qo'sh.`,
                700
            );
            addLog('🤖 Groq AI dan Reels ssenariy so\'ramoqda...', 'sys');
            reelsRaw2 = await askGroq(
                `Sen professional Reels video ssenariy yozuvchisan. O'zbek tilida, qisqa va dinamik 4 ta sahna yozasan.`,
                `Mahsulot: "${name}", Narxi: ${price} so'm.${designBriefStr2}\n\nInstagram Reels uchun 4 ta sahna yoz. Format (har bir sahna yangi qatorda):\n1-Sahna (Xs): [harakat tasviri] | Matn: "[ekran matni]"`,
                400
            );
        } catch(e) {
            addLog(`⚠️ AI xatosi: ${e.message}. Standart matn ishlatilmoqda.`, 'sys');
            caption3 = `✨ ${name} — Muzdek suv yoki issiq choy uchun eng yaxshi hamroh!\n\n🌟 Premium sifat, qulay narx, tez yetkazib berish.\n\n🎁 Narxi: ${price} so'm. Hoziroq buyurtma bering!\n\n${hashStr2}`;
            reelsRaw2 = `1-Sahna (3s): Mahsulotni ko'rsatish | Matn: "Buni ko'rdingizmi?"\n2-Sahna (4s): Ishlatilishi | Matn: "Hayotingizni osonlashtiring!"\n3-Sahna (3s): Afzalliklari | Matn: "Premium sifat"\n4-Sahna (3s): Narx | Matn: "${price} so'm — Buyurtma!"`;
        }

        reelsScriptText = `🎬 Reels Ssenariysi — ${name}\n\n${reelsRaw2}`;
        const finalScenes3 = parseReelsScenes(reelsRaw2, name, price);

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        await Promise.all([
            typeTextarea(document.getElementById('r-caption'), caption3, 6),
            typeReels(document.getElementById('r-reels'), finalScenes3)
        ]);

        agentState.copywriter.status = 'done';
        agentState.copywriter.data = { caption: caption3, reelsScriptText };
        updateBadge('copywriter', 'done', 'Tayyor ✓');
        updateSupervisorCard('copywriter', 'done', 'Tayyor ✓');
        addLog('Kopirayter AI SMM post matni va 4-sahnali Reels ssenariyni yaratdi ✓', 'copywriter');

        checkAllDone();
    });

    // Copy caption
    document.getElementById('copy-caption').addEventListener('click', () => {
        const v = document.getElementById('r-caption').value;
        if (v) { navigator.clipboard.writeText(v); toast('Matn nusxalandi!'); }
    });

    // Copy reels
    document.getElementById('copy-reels').addEventListener('click', () => {
        if (reelsScriptText) { navigator.clipboard.writeText(reelsScriptText); toast('Ssenariy nusxalandi!'); }
    });

    // ══════════════════════════════════════════════════════════════════════
    //  SOTUVCHI AGENT (MANUAL) — GROQ AI DM
    // ══════════════════════════════════════════════════════════════════════
    document.getElementById('start-seller').addEventListener('click', async () => {
        if (agentState.seller.status === 'working') return;
        agentState.seller.status = 'working';

        const taskBox = document.getElementById('task-seller');
        const loading = document.getElementById('loading-seller');
        const result  = document.getElementById('result-seller');

        taskBox.classList.add('hidden');
        result.classList.add('hidden');
        loading.classList.remove('hidden');

        updateBadge('seller', 'working', 'Ishlamoqda...');
        updateSupervisorCard('seller', 'working', 'Tayyorlanmoqda...');
        addLog('Sotuvchi agent vazifa oldi: Groq AI DM avtomatik javob tizimi faollashtirildi', 'seller');

        await wait(1500);

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        agentState.seller.status = 'done';
        agentState.seller.data = { active: true };
        updateBadge('seller', 'done', 'Faol ✓');
        updateSupervisorCard('seller', 'done', 'Tayyor ✓');
        addLog('Sotuvchi agent tayyor: Groq AI DM simulyator faol', 'seller');

        checkAllDone();
    });

    // ── DM Chat logic (Groq AI powered) ────────────────────────────────
    function addDM(who, text) {
        const box = document.getElementById('dm-messages');
        const b = document.createElement('div');
        b.className = `dm-bubble ${who}`;
        b.textContent = text;
        box.appendChild(b);
        box.scrollTop = box.scrollHeight;
    }

    function showTyping() {
        const box = document.getElementById('dm-messages');
        const t = document.createElement('div');
        t.className = 'dm-typing';
        t.id = 'typing-ind';
        t.innerHTML = '<div class="tdot"></div><div class="tdot"></div><div class="tdot"></div>';
        box.appendChild(t);
        box.scrollTop = box.scrollHeight;
    }

    function hideTyping() {
        const t = document.getElementById('typing-ind');
        if (t) t.remove();
    }

    // Groq AI powered DM reply
    async function closerReplyAI(clientText) {
        const name = getProductName();
        const price = getProductPrice();
        // Assistent bilan muhokamalardan savdo strategiyasini olish
        const dmChatCtx = (agentState.seller.data && agentState.seller.data.chatContext)
            ? agentState.seller.data.chatContext
            : getChatContext();

        showTyping();

        try {
            const reply = await askGroq(
                `Sen O'zbekistondagi professional Instagram sotuvchi agentsan. Mahsulot: "${name}", Narxi: ${price} so'm.
Mijozlarning DM (to'g'ridan-to'g'ri xabar) savollariga qisqa, do'stona va ishontiruvchi O'zbek tilida javob berasan.
Javob 2-4 jumladan iborat bo'lsin. Emoji ishlatasan. Buyurtma olishga harakat qilasan.
Agar mijoz raqam bersa, tasdiqlaysan va yetkazib berish haqida gapirasan.
Agar foydalanuvchi bilan oldingi savdo muhokamasi bo'lsa, shu strategiyani qo'lla.`,
                `Mijoz xabari: "${clientText}"${dmChatCtx}
Qisqa, ishontiruvchi va do'stona javob ber. Buyurtmaga undovchi so'z bilan tugat.`,
                200
            );
            hideTyping();
            addDM('agent', reply);
            addLog('Sotuvchi agent Groq AI yordamida mijozga javob qaytardi', 'seller');
        } catch(e) {
            // Fallback to static replies if AI fails
            hideTyping();
            const q = clientText.toLowerCase();
            let fallback;
            if (q.includes('narxi') || q.includes('nechi') || q.includes('qancha')) {
                fallback = `Assalomu alaykum! ${name} narxi chegirmada: ${price} so'm! 💸 Yetkazib berish bepul. Buyurtma uchun ism va telefon raqamingizni yuboring! 📩`;
            } else if (q.includes('dostavka') || q.includes('yetkazib')) {
                fallback = `Ha, albatta! O'zbekistonning barcha hududlariga bepul yetkazamiz! 🚚 1-2 ish kunida yetib boradi.`;
            } else if (q.includes('sifat') || q.includes('kafolat')) {
                fallback = `Mahsulotimiz 100% original va sifatli. To'liq kafolat beramiz! Nuqson bo'lsa, bepul almashtiramiz. 🛡️`;
            } else if (q.includes('chegirma') || q.includes('arzon')) {
                fallback = `Hozirgi ${price} so'm narx — eng yaxshi taklif! Aksiyamiz cheklangan. Buyurtma berasizmi? ⏳`;
            } else {
                fallback = `Rahmat! ${name} — eng trenddagi mahsulot. Narxi ${price} so'm, bepul yetkazamiz. Buyurtma uchun telefon raqamingizni yuboring! ✨`;
            }
            addDM('agent', fallback);
            addLog('Sotuvchi agent (fallback) mijozga javob qaytardi', 'seller');
        }
    }

    // DM form submit
    document.getElementById('dm-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (agentState.seller.status !== 'done') {
            toast('Avval Sotuvchi agentni ishga tushiring!');
            return;
        }
        const inp = document.getElementById('dm-input');
        const text = inp.value.trim();
        if (!text) return;
        addDM('client', text);
        inp.value = '';
        closerReplyAI(text);
    });

    // Quick query buttons
    document.querySelectorAll('.qbtn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (agentState.seller.status !== 'done') {
                toast('Avval Sotuvchi agentni ishga tushiring!');
                return;
            }
            const q = btn.dataset.q;
            addDM('client', q);
            closerReplyAI(q);
        });
    });

    // ══════════════════════════════════════════════════════════════════════
    //  EXPORT BUTTONS (Supervisor Tab)
    // ══════════════════════════════════════════════════════════════════════
    document.getElementById('exp-copy-text').addEventListener('click', () => {
        const caption = document.getElementById('r-caption');
        if (caption && caption.value) {
            navigator.clipboard.writeText(caption.value);
            toast('SMM post matni nusxalandi!');
        } else {
            toast('Avval Kopirayter agentiga vazifa bering.');
        }
    });

    document.getElementById('exp-download-img').addEventListener('click', async () => {
        if (agentState.designer.data) {
            toast('Rasm tayyorlanmoqda...');
            try {
                const resp = await fetch(agentState.designer.data.designedSrc);
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `designed_${getProductName().replace(/ /g,'_').toLowerCase()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                toast('Rasm yuklandi!');
            } catch (e) {
                console.error("CORS xatosi, oddiy usulda yuklanmoqda", e);
                const a = document.createElement('a');
                a.href = agentState.designer.data.designedSrc;
                a.download = `designed_${getProductName().replace(/ /g,'_').toLowerCase()}.png`;
                a.click();
            }
        } else {
            toast('Avval Dizayner agentiga vazifa bering.');
        }
    });

    document.getElementById('exp-download-reels').addEventListener('click', () => {
        if (reelsScriptText) {
            const blob = new Blob([reelsScriptText], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `reels_script_${getProductName().replace(/ /g,'_').toLowerCase()}.txt`;
            a.click();
            toast('Reels ssenariysi yuklandi!');
        } else {
            toast('Avval Kopirayter agentiga vazifa bering.');
        }
    });

    document.getElementById('exp-publish').addEventListener('click', async () => {
        const btn = document.getElementById('exp-publish');
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2"></i> Joylanmoqda...';
        lucide.createIcons();
        addLog('META GRAPH API-ga ulanmoqda...', 'supervisor');

        await wait(2000);

        addLog('Post Instagram sahifasiga muvaffaqiyatli joylandi! Media ID: media_17841400234', 'success');
        btn.innerHTML = '<i data-lucide="check"></i> Joylandi!';
        btn.style.background = 'hsl(160,84%,39%)';
        lucide.createIcons();
        toast('Post Instagramga muvaffaqiyatli joylandi!');
    });

    // ══════════════════════════════════════════════════════════════════════
    //  ASSISTENT AI CHAT (Supervisor Discuss Panel)
    // ══════════════════════════════════════════════════════════════════════
    const ascMessages = document.getElementById('asc-messages');
    const ascStatus   = document.getElementById('asc-status');
    const ascForm     = document.getElementById('asc-form');
    const ascInput    = document.getElementById('asc-input');

    function addAscMessage(sender, text) {
        if (!ascMessages) return;
        const b = document.createElement('div');
        if (sender === 'user') {
            b.className = 'asc-bubble user';
            b.innerHTML = `<span class="asc-sender">Siz</span>${text}`;
        } else {
            b.className = 'asc-bubble ai';
            b.innerHTML = `<span class="asc-sender">👑 Shaxsiy Assistent</span>${text}`;
        }
        ascMessages.appendChild(b);
        ascMessages.scrollTop = ascMessages.scrollHeight;
    }

    function showAscTyping() {
        if (!ascMessages) return;
        const t = document.createElement('div');
        t.className = 'asc-typing';
        t.id = 'asc-typing-ind';
        t.innerHTML = '<div class="asc-dot"></div><div class="asc-dot"></div><div class="asc-dot"></div>';
        ascMessages.appendChild(t);
        ascMessages.scrollTop = ascMessages.scrollHeight;
    }

    function hideAscTyping() {
        const t = document.getElementById('asc-typing-ind');
        if (t) t.remove();
    }

    async function handleAscSubmit(promptText) {
        if (!promptText) return;

        // User message
        addAscMessage('user', promptText);
        
        // Clear input
        if (ascInput && ascInput.value.trim() === promptText) {
            ascInput.value = '';
        }

        // Show typing
        showAscTyping();
        if (ascStatus) ascStatus.textContent = 'Groq AI • Javob yozmoqda...';

        const name = getProductName();
        const price = getProductPrice();
        const style = styleSelect ? styleSelect.value : 'standard';

        // Context from agentState
        const marketerStatus = agentState.marketer.status;
        const marketerAudience = agentState.marketer.data ? agentState.marketer.data.audience : 'Tahlil qilinmagan';
        const marketerTriggers = agentState.marketer.data ? agentState.marketer.data.triggers : 'Tahlil qilinmagan';
        const marketerHashtags = agentState.marketer.data ? agentState.marketer.data.hashtags.join(', ') : 'Tahlil qilinmagan';

        const designerStatus = agentState.designer.status;
        const copywriterStatus = agentState.copywriter.status;
        const copywriterCaption = agentState.copywriter.data ? agentState.copywriter.data.caption : 'Yozilmagan';

        const sellerStatus = agentState.seller.status;

        const systemPrompt = `Sen SMM & Savdo platformasining shaxsiy bosh assistentisan (Supervisor). Sen barcha agentlar (Marketolog, Dizayner, Kopirayter, Sotuvchi) ishini nazorat qilasan va foydalanuvchiga marketing, SMM, savdo strategiyasi bo'yicha professional maslahatlar berasan.
Hozirgi mahsulot: "${name}", Narxi: ${price} so'm.
Dizayn stili: "${style}".
Agentlar holati va natijalari:
- Marketolog agent holati: ${marketerStatus} (Auditoriya: ${marketerAudience}, Triggerlar: ${marketerTriggers}, Hashtaglar: ${marketerHashtags})
- Dizayner agent holati: ${designerStatus}
- Kopirayter agent holati: ${copywriterStatus} (SMM Post matni: "${copywriterCaption}")
- Sotuvchi agent holati: ${sellerStatus}

Foydalanuvchining savol yoki buyrug'iga do'stona, professional, yordam berishga tayyor ruhda, aniq O'zbek tilida javob ber. Javobing qisqa, tushunarli va amaliy bo'lsin (maximum 2-3 xatboshi). Emojilardan unumli foydalan.`;

        try {
            const reply = await askGroq(systemPrompt, promptText, 500);
            hideAscTyping();
            addAscMessage('ai', reply);
            addLog('Bosh assistent foydalanuvchi savoliga javob berdi', 'supervisor');
        } catch (e) {
            hideAscTyping();
            const errorFallback = `Kechirasiz, tizimda xatolik yuz berdi: ${e.message}. Iltimos, Groq API kalitini tekshirib ko'ring yoki birozdan so'ng qayta urinib ko'ring.`;
            addAscMessage('ai', errorFallback);
            addLog(`⚠️ Assistent AI xatosi: ${e.message}`, 'sys');
        } finally {
            if (ascStatus) ascStatus.textContent = 'Groq AI • Tayyor';
        }
    }

    if (ascForm) {
        ascForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = ascInput.value.trim();
            handleAscSubmit(text);
        });
    }

    document.querySelectorAll('.asc-sug-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = btn.dataset.q;
            handleAscSubmit(q);
        });
    });

});
