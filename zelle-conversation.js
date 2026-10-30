/* Zelle's local-first guided conversation. Not a live AI or moderation service. */
(() => {
  "use strict";
  const root = document.getElementById("zelle-conversation");
  if (!root) return;
  const output = root.querySelector("[data-zelle-log]");
  const form = root.querySelector("form");
  const input = root.querySelector("textarea");
  const status = root.querySelector("[data-zelle-status]");
  const escape = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function add(speaker, message) {
    const item = document.createElement("p");
    const name = document.createElement("strong");
    name.textContent = speaker + ": ";
    item.append(name, document.createTextNode(message));
    output.append(item);
    output.scrollTop = output.scrollHeight;
  }
  const frames = [
    {match:/color|palette|contrast|hue/i, reply:"Try choosing one dominant color, one supporting color, and a small contrasting accent. Which feeling should the palette carry?"},
    {match:/photo|camera|portrait|light/i, reply:"Consider the direction of light, the subject's space in the frame, and what you want viewers to notice first. Which one would you like to explore?"},
    {match:/stuck|block|start|idea/i, reply:"Start with a tiny experiment: make three quick variations of the same idea. What material or subject feels easiest to begin with?"},
    {match:/paint|draw|sketch|illustrat|composition/i, reply:"Try three thumbnails with different focal points. What should draw the viewer's eye first?"},
    {match:/moder|report|harass|spam|bully|threat/i, reply:"Community safety matters. This guided conversation cannot file or review reports. Please use Bazaar Art Live's existing reporting controls; immediate danger should be handled through appropriate emergency services."}
  ];
  function reply(message) {
    return (frames.find(x => x.match.test(message)) || {
      reply:"I can help you explore color, composition, photography, painting, and creative blocks. What are you making, and what would you like to try next?"
    }).reply;
  }
  add("Zelle", "Welcome to my guided creative studio. Tell me what you're making, or choose a topic to explore.");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const message = input.value.trim().slice(0, 2000);
    if (!message) return;
    add("You", message);
    add("Zelle", reply(message));
    input.value = "";
    status.textContent = "Local guided response. No message was sent to a server.";
    input.focus();
  });
  root.querySelector("[data-zelle-clear]").addEventListener("click", () => {
    output.replaceChildren();
    add("Zelle", "A fresh canvas. What would you like to explore?");
    status.textContent = "Conversation cleared from this page.";
  });
})();
