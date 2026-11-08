/* Zelle local-first, curated Monte Carlo-style response engine. No remote AI. */
(() => {
  "use strict";
  const root = document.getElementById("zelle-conversation");
  if (!root) return;
  const output = root.querySelector("[data-zelle-log]");
  const form = root.querySelector("form");
  const input = root.querySelector("textarea");
  const status = root.querySelector("[data-zelle-status]");
  const exportButton = root.querySelector("[data-zelle-export]");
  const queueKey = "zelle-unanswered-v1";
  let topics = [];
  const dialogue = globalThis.ZelleDialogue?.create?.() || null;
  let current = null;
  let lastResponse = "";
  let turn = 0;
  let unanswered = [];
  try { const saved = JSON.parse(localStorage.getItem(queueKey) || "[]"); if (Array.isArray(saved)) unanswered = saved.slice(-100); } catch {}
  function add(speaker, message) {
    const item = document.createElement("p");
    const name = document.createElement("strong");
    name.textContent = speaker + ": ";
    item.append(name, document.createTextNode(message));
    output.append(item);
    output.scrollTop = output.scrollHeight;
  }
  const words = text => (String(text).toLowerCase().match(/[a-z]+/g) || []);
  function score(topic, message) {
    const normalized = message.toLowerCase();
    const tokens = new Set(words(message));
    let value = 0;
    const questionForms = [topic.question, ...(topic.alternateQuestions || [])].filter(Boolean);
    const clean = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g,"").replace(/\s+/g," ").trim();
    const incoming = clean(message);
    if (questionForms.some(q => clean(q) === incoming)) value += 100;
    else if (questionForms.some(q => incoming.includes(clean(q)) && clean(q).length > 12)) value += 30;
    for (const keyword of topic.keywords || []) {
      const key = String(keyword).toLowerCase();
      if (key.includes(" ") ? normalized.includes(key) : tokens.has(key)) value += key.includes(" ") ? 5 : 3;
    }
    if (current === topic.id) value += 0.5;
    return value;
  }
  function choose(candidates) {
    const valid = (candidates || []).filter(x => x && typeof x.text === "string" && x.text.trim() && Number(x.weight) > 0);
    if (!valid.length) return "";
    const fresh = valid.filter(x => x.text !== lastResponse);
    const pool = fresh.length ? fresh : valid;
    const total = pool.reduce((sum, x) => sum + Number(x.weight), 0);
    let pick = Math.random() * total;
    for (const entry of pool) {
      pick -= Number(entry.weight);
      if (pick < 0) return entry.text;
    }
    return pool[pool.length - 1].text;
  }
  function respond(message) {
    // The dialogue layer prioritizes full-turn intent and bounded session context.
    // Never treat a low-confidence word overlap as a reliable answer.
    const reply = dialogue?.answer(message);
    if (typeof reply === "string" && reply.trim()) {
      lastResponse = reply;
      turn++;
      return reply;
    }
    queueUnknown(message);
    return "I don't have a reliable prepared answer for that question yet. Could you tell me what you're trying to draw, paint, or design? I can help you find a starting point.";
  }
  function category(message) {
    const m = message.toLowerCase();
    if (/draw|sketch|pencil|shade/.test(m)) return "drawing";
    if (/paint|color|palette/.test(m)) return "painting";
    if (/photo|camera/.test(m)) return "photography";
    if (/compos|design|layout/.test(m)) return "design";
    if (/report|spam|harass|threat/.test(m)) return "community";
    return "general";
  }
  function queueUnknown(message) {
    // No server upload: user can export for review. Avoid recording duplicates.
    const text = message.trim().slice(0, 500);
    // Browser-local review only: never queue likely personal, secret, or high-risk content.
    if (!text || text.length < 8 ||
        /@|https?:|www\.|(?:\+?\d[\d .()-]{8,}\d)/i.test(text) ||
        /\b(?:password|secret|token|private|student|child|minor|medical|health|diagnos|therapy|suicide|self harm|address|phone|email|my name is|my daughter|my son|credit card|social security|bank account)\b/i.test(text) ||
        unanswered.some(x => x.question.toLowerCase() === text.toLowerCase())) return;
    unanswered.push({id:"q-"+Date.now()+"-"+Math.floor(Math.random()*100000),folder:category(text),question:text,status:"needs-curation",source:"voluntary-local-session"});
    unanswered = unanswered.slice(-100);
    try { localStorage.setItem(queueKey, JSON.stringify(unanswered)); } catch {}
  }
  add("Zelle","Welcome to my studio. Tell me what you're making, and we'll explore it together.");
  fetch("./knowledge/question-records.json", {cache:"no-store"}).then(r => {if(!r.ok) throw Error("Knowledge unavailable");return r.json();}).then(data => {
    if (data.schema !== "zelle-question-collection-v1" || !Array.isArray(data.records)) throw Error("Invalid knowledge");
    topics = data.records.filter(x => x && x.status === "approved" && typeof x.id === "string" && Array.isArray(x.keywords)).map(x => ({...x, folder:x.topic, questions:[x.question,...(x.alternateQuestions || [])]}));
    dialogue?.setRecords(topics);
    status.textContent = "Zelle’s "+topics.length+" reviewed art answers are ready. Unanswered general questions stay on this device for optional export; no remote search or upload is active.";
  }).catch(() => {status.textContent = "Knowledge library unavailable. Please refresh when connected; no questions are being uploaded.";});
  form.addEventListener("submit", event => {
    event.preventDefault();
    const message = input.value.trim().slice(0,2000);
    if (!message) return;
    add("You",message);
    add("Zelle",topics.length ? respond(message) : "My knowledge library is not available yet. Please try again after the page finishes loading.");
    input.value = "";
    input.focus();
  });
  root.querySelector("[data-zelle-clear]").addEventListener("click", () => {
    output.replaceChildren();
    current = null; lastResponse = ""; turn = 0;
    dialogue?.reset();
    add("Zelle","A fresh canvas. What would you like to explore?");
    status.textContent = "Conversation cleared. The separate local unanswered-question queue was not deleted.";
  });
  if (exportButton) exportButton.addEventListener("click", () => {
    const data = JSON.stringify({schema:"zelle-intake-v1",version:1,items:unanswered},null,2);
    const url = URL.createObjectURL(new Blob([data],{type:"application/json"}));
    const a = document.createElement("a");
    a.href = url; a.download = "zelle-unanswered-questions.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  });
})();
