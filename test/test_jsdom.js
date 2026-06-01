const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const htmlPath = path.join(__dirname, '..', 'index.html');
const jsPath = path.join(__dirname, '..', 'app.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const jsContent = fs.readFileSync(jsPath, 'utf-8');

const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", (err) => {
    console.error("JSDOM Error:", err.stack, err.detail);
});
virtualConsole.on("log", (...args) => console.log("JSDOM Log:", ...args));
virtualConsole.on("error", (...args) => console.error("JSDOM Error log:", ...args));

const dom = new JSDOM(htmlContent, {
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
});

const { window } = dom;
const { document } = window;

window.lucide = {
    createIcons: () => {}
};

window.navigator.clipboard = {
    writeText: async (text) => {
        window.__clipboardText = text;
        return Promise.resolve();
    }
};

window.URL.createObjectURL = (blob) => {
    return "blob:mock-url";
};

// Execute script via eval
try {
    window.eval(jsContent);
} catch (e) {
    console.error("Eval Error:", e);
}

// Dispatch DOMContentLoaded
const domLoadedEvent = document.createEvent('Event');
domLoadedEvent.initEvent('DOMContentLoaded', true, true);
document.dispatchEvent(domLoadedEvent);

console.log("Initialization finished.");
