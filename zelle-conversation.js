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
    const ranked = topics.map(topic => ({topic, score:score(topic, message)})).sort((a,b) => b.score-a.score);
    let match = ranked[0];
    if (!match || match.score <= 0) {
      const shortAnswer = words(message).length <= 5 && current && !/\b(hello|hi|thanks|thank you)\b/i.test(message);
      if (shortAnswer) match = {topic:topics.find(x => x.id === current),score:0.5};
    }
    if (!match || !match.topic || match.score <= 0) {
      queueUnknown(message);
      return "That's an interesting question, and I don't have a reliable prepared answer yet. Could you tell me a little more about what you'd like to make or learn?";
    }
    current = match.topic.id;
    const response = choose(match.topic.responses);
    lastResponse = response;
    turn++;
    const followup = turn % 2 === 0 ? choose(match.topic.followups) : "";
    return response + (followup ? " " + followup : "");
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
    if (!text || unanswered.some(x => x.question.toLowerCase() === text.toLowerCase())) return;
    unanswered.push({id:"q-"+Date.now()+"-"+Math.floor(Math.random()*100000),folder:category(text),question:text,status:"needs-curation",source:"voluntary-local-session"});
    unanswered = unanswered.slice(-100);
    try { localStorage.setItem(queueKey, JSON.stringify(unanswered)); } catch {}
  }
  add("Zelle","Welcome to my studio. Tell me what you're making, and we'll explore it together.");
  fetch("./knowledge/questions.json", {cache:"no-store"}).then(r => {if(!r.ok) throw Error("Knowledge unavailable");return r.json();}).then(data => {
    if (data.schema !== "zelle-knowledge-v1" || !Array.isArray(data.topics)) throw Error("Invalid knowledge");
    topics = data.topics.filter(x => x && typeof x.id === "string" && Array.isArray(x.keywords));
    status.textContent = "Curated local knowledge ready. Unanswered questions are stored only on this device for optional export.";
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
