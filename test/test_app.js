const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Paths to files
const htmlPath = path.join(__dirname, '..', 'index.html');
const jsPath = path.join(__dirname, '..', 'app.js');

async function runTest() {
    console.log("=========================================");
    console.log("STARTING MULTI-AGENT SMM & SAVDO PLATFORMASI TESTS");
    console.log("=========================================\n");

    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const jsContent = fs.readFileSync(jsPath, 'utf-8');

    // Create JSDOM instance
    const dom = new JSDOM(htmlContent, {
        runScripts: "dangerously",
        resources: "usable"
    });

    const { window } = dom;
    const { document } = window;

    // --- Mocks for Browser APIs ---
    window.lucide = {
        createIcons: () => {
            // Mock lucide icons replacement
        }
    };

    // Mock clipboard
    window.__clipboardText = "";
    window.navigator.clipboard = {
        writeText: async (text) => {
            window.__clipboardText = text;
            return Promise.resolve();
        }
    };

    // Mock URL.createObjectURL
    window.URL.createObjectURL = (blob) => {
        return "blob:mock-url-reels-script";
    };

    // Inject document load and execute app.js
    const scriptEl = document.createElement("script");
    scriptEl.textContent = jsContent;
    document.body.appendChild(scriptEl);

    // Dispatch DOMContentLoaded to trigger app.js event registration
    const domLoadedEvent = document.createEvent('Event');
    domLoadedEvent.initEvent('DOMContentLoaded', true, true);
    document.dispatchEvent(domLoadedEvent);

    // Helper to sleep
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Assert helper
    const assert = (condition, message) => {
        if (!condition) {
            console.error(`❌ FAIL: ${message}`);
            process.exit(1);
        } else {
            console.log(`✅ PASS: ${message}`);
        }
    };

    console.log("--- 1. Testing Initial State ---");
    const activeTab = document.querySelector('.tab.active');
    assert(activeTab && activeTab.id === 'tab-supervisor', "Initial tab is Supervisor (Assistent)");

    const activePane = document.querySelector('.pane.active');
    assert(activePane && activePane.id === 'pane-supervisor', "Initial pane is pane-supervisor");

    const prodNameInput = document.getElementById('product-name');
    assert(prodNameInput && prodNameInput.value === 'Smart Termos Pro 500ml', "Product name default is correct");

    const prodPriceInput = document.getElementById('product-price');
    assert(prodPriceInput && prodPriceInput.value === '180000', "Product price default is correct");

    const logs = document.getElementById('log-box').innerHTML;
    assert(logs.includes('Tizim tayyor. Agentlar tablarini tanlang va vazifa bering.'), "Initial log is recorded");

    console.log("\n--- 2. Testing Tab Switch Navigation ---");
    const tabMarketer = document.getElementById('tab-marketer');
    tabMarketer.click();
    assert(document.getElementById('tab-marketer').classList.contains('active'), "Marketolog tab is active after click");
    assert(document.getElementById('pane-marketer').classList.contains('active'), "Marketolog pane is active after click");

    const tabDesigner = document.getElementById('tab-designer');
    tabDesigner.click();
    assert(document.getElementById('tab-designer').classList.contains('active'), "Dizayner tab is active after click");

    const tabCopywriter = document.getElementById('tab-copywriter');
    tabCopywriter.click();
    assert(document.getElementById('tab-copywriter').classList.contains('active'), "Kopirayter tab is active after click");

    const tabSeller = document.getElementById('tab-seller');
    tabSeller.click();
    assert(document.getElementById('tab-seller').classList.contains('active'), "Sotuvchi tab is active after click");

    console.log("\n--- 3. Testing Marketolog Workflow ---");
    tabMarketer.click();
    const marketerBtn = document.getElementById('start-marketer');
    marketerBtn.click();

    assert(document.getElementById('loading-marketer').classList.contains('hidden') === false, "Marketolog loading spinner visible after run");
    assert(document.getElementById('badge-marketer').textContent === "Ishlamoqda...", "Marketolog badge says Ishlamoqda...");

    console.log("Waiting for Marketolog simulation (2.5s)...");
    await sleep(2500);

    assert(document.getElementById('loading-marketer').classList.contains('hidden') === true, "Marketolog loading spinner hidden after completion");
    assert(document.getElementById('result-marketer').classList.contains('hidden') === false, "Marketolog results container visible");
    assert(document.getElementById('badge-marketer').textContent === "Tayyor ✓", "Marketolog badge says Tayyor ✓");
    assert(document.getElementById('r-audience').textContent.includes('Yosh sayohatchilar'), "Target Audience is generated correctly");
    assert(document.getElementById('r-triggers').textContent.includes('24 soat harorat saqlash'), "Emotional Triggers are generated correctly");
    assert(document.getElementById('r-hashtags').children.length > 0, "Hashtags are generated");

    // Copy hashtags test
    const copyHashtagsBtn = document.getElementById('copy-hashtags');
    copyHashtagsBtn.click();
    assert(window.__clipboardText.includes('#termosuz'), "Hashtags copied to clipboard");

    console.log("\n--- 4. Testing Dizayner Workflow ---");
    tabDesigner.click();
    const designerBtn = document.getElementById('start-designer');
    designerBtn.click();

    assert(document.getElementById('loading-designer').classList.contains('hidden') === false, "Dizayner loading spinner visible after run");
    console.log("Waiting for Dizayner simulation (2.8s)...");
    await sleep(2800);

    assert(document.getElementById('loading-designer').classList.contains('hidden') === true, "Dizayner loading spinner hidden after completion");
    assert(document.getElementById('result-designer').classList.contains('hidden') === false, "Dizayner results container visible");
    assert(document.getElementById('badge-designer').textContent === "Tayyor ✓", "Dizayner badge says Tayyor ✓");
    
    const rawImg = document.getElementById('compare-raw').src;
    const designedImg = document.getElementById('compare-designed').src;
    assert(rawImg.includes('unsplash.com') && designedImg.includes('unsplash.com'), "Designed image URLs are set correctly");

    console.log("\n--- 5. Testing Kopirayter Workflow ---");
    tabCopywriter.click();
    const copywriterBtn = document.getElementById('start-copywriter');
    copywriterBtn.click();

    assert(document.getElementById('loading-copywriter').classList.contains('hidden') === false, "Kopirayter loading spinner visible after run");
    console.log("Waiting for Kopirayter simulation (3.1s)...");
    await sleep(3100);

    assert(document.getElementById('loading-copywriter').classList.contains('hidden') === true, "Kopirayter loading spinner hidden after completion");
    assert(document.getElementById('result-copywriter').classList.contains('hidden') === false, "Kopirayter results container visible");
    assert(document.getElementById('badge-copywriter').textContent === "Tayyor ✓", "Kopirayter badge says Tayyor ✓");

    const captionText = document.getElementById('r-caption').value;
    assert(captionText.includes('Smart Termos Pro 500ml') && captionText.includes('180,000'), "Post caption is dynamically customized");

    // Copy caption test
    const copyCaptionBtn = document.getElementById('copy-caption');
    copyCaptionBtn.click();
    assert(window.__clipboardText.includes('Muzdek suv yoki issiq choy'), "Caption copied to clipboard");

    console.log("\n--- 6. Testing Sotuvchi Workflow ---");
    tabSeller.click();
    const sellerBtn = document.getElementById('start-seller');
    sellerBtn.click();

    assert(document.getElementById('loading-seller').classList.contains('hidden') === false, "Sotuvchi loading spinner visible after run");
    console.log("Waiting for Sotuvchi simulation (1.8s)...");
    await sleep(1800);

    assert(document.getElementById('loading-seller').classList.contains('hidden') === true, "Sotuvchi loading spinner hidden after completion");
    assert(document.getElementById('result-seller').classList.contains('hidden') === false, "Sotuvchi DM simulator container visible");
    assert(document.getElementById('badge-seller').textContent === "Faol ✓", "Sotuvchi badge says Faol ✓");

    // Test DM Auto-reply
    console.log("Testing DM chat: Sending 'Narxi qancha?'...");
    const dmInput = document.getElementById('dm-input');
    const dmForm = document.getElementById('dm-form');
    dmInput.value = "Narxi qancha?";
    
    // Dispatch submit event
    const submitEvent = window.document.createEvent('Event');
    submitEvent.initEvent('submit', true, true);
    dmForm.dispatchEvent(submitEvent);

    // Verify client bubble is added immediately
    const dmBubbles = document.getElementById('dm-messages');
    assert(dmBubbles.innerHTML.includes('Narxi qancha?'), "Client DM message bubble added to chat");

    console.log("Waiting for Sotuvchi auto-reply (1.7s)...");
    await sleep(1700);

    assert(dmBubbles.innerHTML.includes('180,000 so\'m'), "Sotuvchi agent auto-replied with dynamic price details");
    console.log("Received Reply:", dmBubbles.lastChild.textContent);

    console.log("\n--- 7. Testing Assistent Auto-Review & Export ---");
    // Since Marketer, Designer, and Copywriter are done, the Assistent auto-review should have triggered
    assert(document.getElementById('tab-supervisor').classList.contains('active'), "Auto-switched to Supervisor tab");
    assert(document.getElementById('export-card').classList.contains('unlocked'), "Export card is unlocked");

    // Test Instagram publishing
    console.log("Testing Instagram publishing...");
    const publishBtn = document.getElementById('exp-publish');
    publishBtn.click();

    assert(publishBtn.innerHTML.includes('Joylanmoqda...'), "Publish button status changed to Joylanmoqda...");

    console.log("Waiting for Instagram publishing simulation (2.3s)...");
    await sleep(2300);

    assert(publishBtn.innerHTML.includes('Joylandi!'), "Publish button status changed to Joylandi!");
    assert(document.getElementById('log-box').innerHTML.includes('Post Instagram sahifasiga muvaffaqiyatli joylandi!'), "Success log recorded");

    console.log("\n=========================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("=========================================");
}

runTest().catch(err => {
    console.error("❌ TEST RUNNER FAILED DUE TO UNEXPECTED ERROR:", err);
    process.exit(1);
});
