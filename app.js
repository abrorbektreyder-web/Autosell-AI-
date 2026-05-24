/* ==========================================================================
   MULTI-AGENT SMM & SAVDO PLATFORMASI — APP LOGIC v3.0
   Task-based agent workflow, Assistent review, export actions
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
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

    // Design image themes
    const themes = {
        minimalist_studio: {
            raw: 'https://images.unsplash.com/photo-1577938659054-e0c1f24d1663?w=500&auto=format&fit=crop&q=60',
            designed: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'
        },
        nature_fresh: {
            raw: 'https://images.unsplash.com/photo-1577938659054-e0c1f24d1663?w=500&auto=format&fit=crop&q=60',
            designed: 'https://images.unsplash.com/photo-1518081461904-9d8f136351c2?w=500&auto=format&fit=crop&q=60'
        },
        neon_cyberpunk: {
            raw: 'https://images.unsplash.com/photo-1577938659054-e0c1f24d1663?w=500&auto=format&fit=crop&q=60',
            designed: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60'
        },
        luxury_gold: {
            raw: 'https://images.unsplash.com/photo-1577938659054-e0c1f24d1663?w=500&auto=format&fit=crop&q=60',
            designed: 'https://images.unsplash.com/photo-1618005198143-d5668e1a7206?w=500&auto=format&fit=crop&q=60'
        }
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

    // ── Auto-Flow Pipeline Orchestrator ─────────────────────────────────
    async function runGlobalPipeline() {
        logBox.innerHTML = '';
        addLog('🚀 Multi-Agent Auto-Flow pipeline boshlandi...', 'sys');
        
        exportCard.classList.add('locked');
        exportCard.classList.remove('unlocked');
        
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

        // Disable input elements
        prodName.disabled = true;
        prodPrice.disabled = true;
        styleSelect.disabled = true;
        btnGlobalStart.disabled = true;
        btnGlobalStart.innerHTML = '<i data-lucide="loader-2" class="spinner"></i> Oqim Ishlamoqda...';
        lucide.createIcons();

        // ── 1-QADAM: MARKETOLOG AGENT ───────────────────────────────────────
        switchTab('marketer');
        const tabMarketer = document.getElementById('tab-marketer');
        tabMarketer.classList.add('pipelining');
        
        const taskMarketer = document.getElementById('task-marketer');
        const loadingMarketer = document.getElementById('loading-marketer');
        const resultMarketer = document.getElementById('result-marketer');

        taskMarketer.classList.add('hidden');
        loadingMarketer.classList.remove('hidden');
        updateBadge('marketer', 'working', 'Ishlamoqda...');
        updateSupervisorCard('marketer', 'working', 'Ishlamoqda...');
        addLog(`Marketolog vazifa oldi: Bozor tahlili boshlandi`, 'marketer');

        await wait(2200);

        const name = getProductName();
        const price = getProductPrice();
        const audience = `Yosh sayohatchilar (18-35 yosh), sport faollari, ofis xodimlari va sog'lom turmush tarziga rioya qiluvchi ayollar va erkaklar.`;
        const triggers = `24 soat harorat saqlash kafolati, LCD sensorli displey, ekologik toza material, bepul yetkazib berish.`;
        const hashtags = [`#${name.toLowerCase().replace(/ /g,'')}`, '#termosuz', '#smmshop', '#onlineuz', '#tashkent', '#aktivuz', '#sportuz', '#sovg\'a', '#trenduz'];

        agentState.marketer.data = { audience, triggers, hashtags };

        loadingMarketer.classList.add('hidden');
        resultMarketer.classList.remove('hidden');

        await Promise.all([
            typeText(document.getElementById('r-audience'), audience, 10),
            typeText(document.getElementById('r-triggers'), triggers, 10),
            typeHashtags(document.getElementById('r-hashtags'), hashtags)
        ]);

        agentState.marketer.status = 'done';
        updateBadge('marketer', 'done', 'Tayyor ✓');
        updateSupervisorCard('marketer', 'done', 'Tayyor ✓');
        addLog(`Marketolog tahlili yakunlandi.`, 'marketer');
        tabMarketer.classList.remove('pipelining');
        await wait(1200);

        // ── 2-QADAM: DIZAYNER AGENT ─────────────────────────────────────────
        switchTab('designer');
        const tabDesigner = document.getElementById('tab-designer');
        tabDesigner.classList.add('pipelining');

        const taskDesigner = document.getElementById('task-designer');
        const loadingDesigner = document.getElementById('loading-designer');
        const resultDesigner = document.getElementById('result-designer');

        taskDesigner.classList.add('hidden');
        loadingDesigner.classList.remove('hidden');
        updateBadge('designer', 'working', 'Ishlamoqda...');
        updateSupervisorCard('designer', 'working', 'Ishlamoqda...');
        addLog(`Dizayner vazifa oldi: Photoroom API fonni tozalamoqda`, 'designer');

        const style = styleSelect.value;
        const t = themes[style] || themes.minimalist_studio;

        await wait(2500);

        document.getElementById('compare-raw').src = t.raw;
        document.getElementById('compare-designed').src = t.designed;
        setComparePosition(0);

        loadingDesigner.classList.add('hidden');
        resultDesigner.classList.remove('hidden');

        let pos = 0;
        await new Promise(resolve => {
            const iv = setInterval(() => {
                if (pos < 50) {
                    pos += 2;
                    setComparePosition(pos);
                } else {
                    clearInterval(iv);
                    resolve();
                }
            }, 15);
        });

        agentState.designer.status = 'done';
        agentState.designer.data = { designedSrc: t.designed };
        updateBadge('designer', 'done', 'Tayyor ✓');
        updateSupervisorCard('designer', 'done', 'Tayyor ✓');
        addLog(`Dizayner premium reklama dizaynini yaratdi.`, 'designer');
        tabDesigner.classList.remove('pipelining');
        await wait(1200);

        // ── 3-QADAM: KOPIRAYTER AGENT ───────────────────────────────────────
        switchTab('copywriter');
        const tabCopywriter = document.getElementById('tab-copywriter');
        tabCopywriter.classList.add('pipelining');

        const taskCopywriter = document.getElementById('task-copywriter');
        const loadingCopywriter = document.getElementById('loading-copywriter');
        const resultCopywriter = document.getElementById('result-copywriter');

        taskCopywriter.classList.add('hidden');
        loadingCopywriter.classList.remove('hidden');
        updateBadge('copywriter', 'working', 'Ishlamoqda...');
        updateSupervisorCard('copywriter', 'working', 'Ishlamoqda...');
        addLog(`Kopirayter vazifa oldi: AIDA post va Reels ssenariysi yozilmoqda`, 'copywriter');

        const hashStr = hashtags.join(' ');
        const caption =
`Muzdek suv yoki issiq choy har doim yoningizda bo'lishini xohlaysizmi?

Yorqin va zamonaviy ${name} bilan kun davomida optimal harorat kafolatlanadi! Uni ofisda, sayohatda yoki mashg'ulotlarda o'zingiz bilan olib yuring.

🌟 Afzalliklari:
• Haroratni 24 soat davomida saqlab beradi
• LCD sensorli displey orqali suv issiqligini ko'rish
• Zanglamaydigan, mustahkam va ekologik toza material

🎁 Hoziroq buyurtma bering va butun O'zbekiston bo'ylab mutlaqo BEPUL yetkazib berish xizmatiga ega bo'ling! Narxi: ${price} so'm

👇 Xarid qilish uchun izohda "+" qoldiring yoki Direct'ga yozing!

${hashStr}`;

        reelsScriptText =
`🎬 Reels Slayd-shou Ssenariysi — ${name}

1-Sahna (3s): Termos yuzidagi sensorli displeyga bosib haroratni ko'rsatish.
Matn: "Buni bilarmidingiz?"

2-Sahna (4s): Termosga suv va muz bo'laklari solinishi.
Matn: "24 soat davomida muzdek saqlaydi!"

3-Sahna (3s): Termos qutisini ochish (unboxing) jarayoni.
Matn: "Premium sifat va qulaylik"

4-Sahna (3s): Bepul yetkazib berish kafolati ko'rinadi.
Matn: "Narxi: ${price} so'm. Direct'ga yozing!"`;

        const scenes = [
            { num:'1-Sahna (3s)', desc:'Termos sensorli displeyga bosib haroratni ko\'rsatish.', text:'"Buni bilarmidingiz?"' },
            { num:'2-Sahna (4s)', desc:'Termosga suv va muz bo\'laklari solinishi.', text:'"24 soat davomida muzdek!"' },
            { num:'3-Sahna (3s)', desc:'Termos unboxing (qutidan olish) jarayoni.', text:'"Premium sifat va qulaylik"' },
            { num:'4-Sahna (3s)', desc:'Bepul yetkazib berish kafolati ko\'rinadi.', text:`"Narxi: ${price} so'm. Direct'ga yozing!"` },
        ];

        agentState.copywriter.data = { caption, reelsScriptText };

        loadingCopywriter.classList.add('hidden');
        resultCopywriter.classList.remove('hidden');

        await Promise.all([
            typeTextarea(document.getElementById('r-caption'), caption, 6),
            typeReels(document.getElementById('r-reels'), scenes)
        ]);

        agentState.copywriter.status = 'done';
        updateBadge('copywriter', 'done', 'Tayyor ✓');
        updateSupervisorCard('copywriter', 'done', 'Tayyor ✓');
        addLog(`Kopirayter matnlar va Reels ssenariylarini yozib tugatdi.`, 'copywriter');
        tabCopywriter.classList.remove('pipelining');
        await wait(1200);

        // ── 4-QADAM: SHAXSIY ASSISTENT (SUPERVISOR) ─────────────────────────
        switchTab('supervisor');
        const tabSupervisor = document.getElementById('tab-supervisor');
        tabSupervisor.classList.add('pipelining');

        addLog('Assistent barcha agentlar ishini tekshirishni boshladi...', 'supervisor');
        ['marketer', 'designer', 'copywriter'].forEach(a => {
            updateSupervisorCard(a, 'reviewing', 'Tekshirilmoqda...');
        });

        await wait(2000);

        ['marketer', 'designer', 'copywriter'].forEach(a => {
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

    function getProductName() { return prodName.value || 'Mahsulot'; }
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
        card.className = `status-card ${status}`;
        state.textContent = label;
    }

    function updateBadge(agent, status, label) {
        const badge = document.getElementById(`badge-${agent}`);
        if (!badge) return;
        badge.className = `agent-badge ${status}`;
        badge.textContent = label;
    }

    // ── Check if Assistent should review ────────────────────────────────
    function checkAllDone() {
        const agents = ['marketer', 'designer', 'copywriter', 'seller'];
        const doneCount = agents.filter(a => agentState[a].status === 'done').length;
        // Review requires at least 3 agents done (marketer + designer + copywriter)
        const coreReady = agentState.marketer.status === 'done'
                       && agentState.designer.status === 'done'
                       && agentState.copywriter.status === 'done';
        if (coreReady) {
            runAssistentReview();
        }
    }

    async function runAssistentReview() {
        if (exportCard.classList.contains('unlocked')) return; // already reviewed

        addLog('Assistent barcha agentlar ishini tekshirishni boshladi...', 'supervisor');

        // Simulate review
        ['marketer','designer','copywriter','seller'].forEach(a => {
            if (agentState[a].status === 'done') {
                updateSupervisorCard(a, 'reviewing', 'Tekshirilmoqda...');
            }
        });

        await wait(1800);

        // Mark reviewed
        ['marketer','designer','copywriter','seller'].forEach(a => {
            if (agentState[a].status === 'done') {
                updateSupervisorCard(a, 'done', 'Tasdiqlandi ✓');
            }
        });

        addLog('Sifat nazorati yakunlandi. Imlo va grammatik xatolar tekshirildi.', 'supervisor');
        addLog('✅ Tayyor bo\'ldi, xo\'jayin! Barcha fayllar taqdim etildi.', 'success');

        // Unlock export
        exportCard.classList.remove('locked');
        exportCard.classList.add('unlocked');

        // Auto-switch to supervisor tab
        switchTab('supervisor');
    }

    // ══════════════════════════════════════════════════════════════════════
    //  MARKETOLOG AGENT
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
        addLog(`Marketolog vazifa oldi: bozor tahlili boshlandi`, 'marketer');

        await wait(2200);

        // Generate data
        const name = getProductName();
        const audience = `Yosh sayohatchilar (18-35 yosh), sport faollari, ofis xodimlari va sog'lom turmush tarziga rioya qiluvchi ayollar va erkaklar.`;
        const triggers = `24 soat harorat saqlash kafolati, LCD sensorli displey, ekologik toza material, bepul yetkazib berish.`;
        const hashtags = [`#${name.toLowerCase().replace(/ /g,'')}`, '#termosuz', '#smmshop', '#onlineuz', '#tashkent', '#aktivuz', '#sportuz', '#sovg\'a', '#trenduz'];

        agentState.marketer.data = { audience, triggers, hashtags };

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        // Typewriter reveal
        await Promise.all([
            typeText(document.getElementById('r-audience'), audience, 10),
            typeText(document.getElementById('r-triggers'), triggers, 10),
            typeHashtags(document.getElementById('r-hashtags'), hashtags)
        ]);

        agentState.marketer.status = 'done';
        updateBadge('marketer', 'done', 'Tayyor ✓');
        updateSupervisorCard('marketer', 'done', 'Tayyor ✓');
        addLog(`Marketolog ishini tugatdi: auditoriya, triggerlar, ${hashtags.length} ta hashtag`, 'marketer');

        checkAllDone();
    });

    // Copy hashtags
    document.getElementById('copy-hashtags').addEventListener('click', () => {
        if (!agentState.marketer.data) return;
        navigator.clipboard.writeText(agentState.marketer.data.hashtags.join(' '));
        toast('Hashtaglar nusxalandi!');
    });

    // ══════════════════════════════════════════════════════════════════════
    //  DIZAYNER AGENT
    // ══════════════════════════════════════════════════════════════════════
    let isDragging = false;

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
        addLog(`Dizayner vazifa oldi: Photoroom API fonni tozalamoqda`, 'designer');

        const style = styleSelect.value;
        const t = themes[style] || themes.minimalist_studio;

        await wait(2500);

        // Set images
        document.getElementById('compare-raw').src = t.raw;
        document.getElementById('compare-designed').src = t.designed;

        // Reset slider to 50%
        setComparePosition(50);

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        // Animate slider reveal
        let pos = 0;
        const iv = setInterval(() => {
            if (pos < 50) { pos += 2; setComparePosition(pos); }
            else clearInterval(iv);
        }, 15);

        agentState.designer.status = 'done';
        agentState.designer.data = { designedSrc: t.designed };
        updateBadge('designer', 'done', 'Tayyor ✓');
        updateSupervisorCard('designer', 'done', 'Tayyor ✓');
        addLog(`Dizayner ishini tugatdi: "${style}" stilda premium rasm yaratildi`, 'designer');

        checkAllDone();
    });

    // Slider logic
    function setComparePosition(pct) {
        const clamped = Math.max(0, Math.min(100, pct));
        const handle = document.getElementById('compare-handle');
        const clip   = document.getElementById('compare-clip');
        if (handle) handle.style.left = clamped + '%';
        if (clip)   clip.style.width  = clamped + '%';
    }

    const compareHandle = document.getElementById('compare-handle');
    const compareWrapper = document.querySelector('.compare-wrapper');

    if (compareHandle && compareWrapper) {
        compareHandle.addEventListener('mousedown', () => isDragging = true);
        compareHandle.addEventListener('touchstart', () => isDragging = true, {passive:true});
        document.addEventListener('mouseup', () => isDragging = false);
        document.addEventListener('touchend', () => isDragging = false);

        function onMove(e) {
            if (!isDragging) return;
            const rect = compareWrapper.getBoundingClientRect();
            const cx = (e.touches ? e.touches[0].clientX : e.clientX);
            const pct = ((cx - rect.left) / rect.width) * 100;
            setComparePosition(pct);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, {passive:true});
    }

    // Filter controls
    const ctrlSat = document.getElementById('ctrl-saturation');
    const ctrlBrt = document.getElementById('ctrl-brightness');
    const valSat  = document.getElementById('val-saturation');
    const valBrt  = document.getElementById('val-brightness');
    const designedImg = document.getElementById('compare-designed');

    function applyFilters() {
        if (!designedImg) return;
        designedImg.style.filter = `saturate(${ctrlSat.value}%) brightness(${ctrlBrt.value}%)`;
        valSat.textContent = ctrlSat.value + '%';
        valBrt.textContent = ctrlBrt.value + '%';
    }
    if (ctrlSat) ctrlSat.addEventListener('input', applyFilters);
    if (ctrlBrt) ctrlBrt.addEventListener('input', applyFilters);

    // Download designed image
    document.getElementById('download-designed').addEventListener('click', () => {
        if (!agentState.designer.data) return;
        const a = document.createElement('a');
        a.href = agentState.designer.data.designedSrc;
        a.download = `designed_${getProductName().replace(/ /g,'_').toLowerCase()}.png`;
        a.click();
        toast('Rasm yuklanmoqda...');
    });

    // ══════════════════════════════════════════════════════════════════════
    //  KOPIRAYTER AGENT
    // ══════════════════════════════════════════════════════════════════════
    let reelsScriptText = '';

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
        addLog(`Kopirayter vazifa oldi: AIDA matn va Reels ssenariy yozilmoqda`, 'copywriter');

        const name = getProductName();
        const price = getProductPrice();
        const hashStr = agentState.marketer.data
            ? agentState.marketer.data.hashtags.join(' ')
            : '#termosuz #smmshop #onlineuz';

        await wait(2800);

        const caption =
`Muzdek suv yoki issiq choy har doim yoningizda bo'lishini xohlaysizmi?

Yorqin va zamonaviy ${name} bilan kun davomida optimal harorat kafolatlanadi! Uni ofisda, sayohatda yoki mashg'ulotlarda o'zingiz bilan olib yuring.

🌟 Afzalliklari:
• Haroratni 24 soat davomida saqlab beradi
• LCD sensorli displey orqali suv issiqligini ko'rish
• Zanglamaydigan, mustahkam va ekologik toza material

🎁 Hoziroq buyurtma bering va butun O'zbekiston bo'ylab mutlaqo BEPUL yetkazib berish xizmatiga ega bo'ling! Narxi: ${price} so'm

👇 Xarid qilish uchun izohda "+" qoldiring yoki Direct'ga yozing!

${hashStr}`;

        reelsScriptText =
`🎬 Reels Slayd-shou Ssenariysi — ${name}

1-Sahna (3s): Termos yuzidagi sensorli displeyga bosib haroratni ko'rsatish.
Matn: "Buni bilarmidingiz?"

2-Sahna (4s): Termosga suv va muz bo'laklari solinishi.
Matn: "24 soat davomida muzdek saqlaydi!"

3-Sahna (3s): Termos qutisini ochish (unboxing) jarayoni.
Matn: "Premium sifat va qulaylik"

4-Sahna (3s): Bepul yetkazib berish kafolati ko'rinadi.
Matn: "Narxi: ${price} so'm. Direct'ga yozing!"`;

        const scenes = [
            { num:'1-Sahna (3s)', desc:'Termos sensorli displeyga bosib haroratni ko\'rsatish.', text:'"Buni bilarmidingiz?"' },
            { num:'2-Sahna (4s)', desc:'Termosga suv va muz bo\'laklari solinishi.', text:'"24 soat davomida muzdek!"' },
            { num:'3-Sahna (3s)', desc:'Termos unboxing (qutidan olish) jarayoni.', text:'"Premium sifat va qulaylik"' },
            { num:'4-Sahna (3s)', desc:'Bepul yetkazib berish kafolati ko\'rinadi.', text:`"Narxi: ${price} so'm. Direct'ga yozing!"` },
        ];

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        // Typewriter outputs
        await Promise.all([
            typeTextarea(document.getElementById('r-caption'), caption, 6),
            typeReels(document.getElementById('r-reels'), scenes)
        ]);

        agentState.copywriter.status = 'done';
        agentState.copywriter.data = { caption, reelsScriptText };
        updateBadge('copywriter', 'done', 'Tayyor ✓');
        updateSupervisorCard('copywriter', 'done', 'Tayyor ✓');
        addLog(`Kopirayter ishini tugatdi: SMM post matni va 4-sahnali Reels ssenariy`, 'copywriter');

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
    //  SOTUVCHI AGENT (SALES CLOSER DM)
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
        addLog(`Sotuvchi agent vazifa oldi: DM avtomatik javob tizimi faollashtirildi`, 'seller');

        await wait(1500);

        loading.classList.add('hidden');
        result.classList.remove('hidden');

        agentState.seller.status = 'done';
        agentState.seller.data = { active: true };
        updateBadge('seller', 'done', 'Faol ✓');
        updateSupervisorCard('seller', 'done', 'Tayyor ✓');
        addLog(`Sotuvchi agent tayyor: DM simulyator faol`, 'seller');

        checkAllDone();
    });

    // DM chat logic
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

    function closerReply(clientText) {
        const q = clientText.toLowerCase();
        const name = getProductName();
        const price = getProductPrice();
        let reply;

        if (q.includes('narxi') || q.includes('nechi') || q.includes('qancha') || q.includes('pul')) {
            reply = `Assalomu alaykum! ${name} ning narxi ayni vaqtda chegirmada: ${price} so'm! 💸 Yetkazib berish bepul. Buyurtma uchun ism va telefon raqamingizni yuboring! 📩`;
        } else if (q.includes('dostavka') || q.includes('yetkazib') || q.includes('viloyat')) {
            reply = `Ha, albatta! O'zbekistonning barcha hududlariga, uyingizgacha bepul yetkazib beramiz! 🚚 1-2 ish kunida yetib boradi. To'lovni termos qo'lingizga tekkanidan so'ng qilsangiz ham bo'ladi.`;
        } else if (q.includes('sifat') || q.includes('original') || q.includes('kafolat')) {
            reply = `Mahsulotimiz 100% original. Zanglamaydigan po'latdan, sensorli LCD ekranli. Issiq va sovuqni 24 soat saqlashiga to'liq kafolat beramiz! Nuqson bo'lsa, bepul almashtiramiz. 🛡️`;
        } else if (q.includes('chegirma') || q.includes('arzon') || q.includes('skidka')) {
            reply = `Hozirgi ${price} so'm narx bepul yetkazib berish bilan birga eng yaxshi taklif! Aksiyamiz cheklangan. Buyurtma berasizmi? ⏳`;
        } else if (q.includes('raqam') || q.includes('telefon') || q.includes('998') || q.match(/\d{9,}/)) {
            reply = `Ajoyib! Raqamingiz qabul qilindi. 📲 Tez orada siz bilan bog'lanamiz va manzilingizni tasdiqlaymiz. Xaridingiz xayrli bo'lsin! 🛍️`;
        } else {
            reply = `Rahmat! ${name} — eng trenddagi mahsulot. Narxi ${price} so'm, bepul yetkazamiz. Buyurtma uchun telefon raqamingizni yuboring! ✨`;
        }

        showTyping();
        setTimeout(() => {
            hideTyping();
            addDM('agent', reply);
            addLog(`Sotuvchi agent mijozga javob qaytardi`, 'seller');
        }, 1400);
    }

    // DM form submit
    document.getElementById('dm-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const inp = document.getElementById('dm-input');
        const text = inp.value.trim();
        if (!text) return;
        addDM('client', text);
        inp.value = '';
        closerReply(text);
    });

    // Quick query buttons
    document.querySelectorAll('.qbtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = btn.dataset.q;
            addDM('client', q);
            closerReply(q);
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

    document.getElementById('exp-download-img').addEventListener('click', () => {
        if (agentState.designer.data) {
            const a = document.createElement('a');
            a.href = agentState.designer.data.designedSrc;
            a.download = `designed_${getProductName().replace(/ /g,'_').toLowerCase()}.png`;
            a.click();
            toast('Rasm yuklanmoqda...');
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
});
