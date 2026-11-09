/* Zelle's public narrator choices: full browser palette, Samantha profile by default.
 * Reuses the existing Polyglot mentor profile for rate 1.10 and pitch 1.45.
 * Voice selection is optional; only voice identity may be stored on this device.
 */
(()=>{"use strict";
const host=document.getElementById("zelle-conversation");if(!host)return;
const log=host.querySelector("[data-zelle-log]"),actions=host.querySelector(".zelle-chat-actions");if(!log||!actions)return;
const speakBtn=document.createElement("button"),stopBtn=document.createElement("button"),preview=document.createElement("button"),state=document.createElement("p");
for(const button of [speakBtn,stopBtn,preview]){button.type="button";button.className="secondary";}
speakBtn.textContent="Listen to Zelle";stopBtn.textContent="Stop audio";preview.textContent="Preview voice";
state.setAttribute("role","status");state.setAttribute("aria-live","polite");state.className="zelle-chat-status";
const group=document.createElement("div");group.style.cssText="display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:15px 0;padding:13px;border:1px solid #b58b46;border-radius:7px";
const label=document.createElement("label");label.textContent="Zelle's voice";label.htmlFor="zelle-voice-select";label.style.cssText="font-size:16px";
const select=document.createElement("select");select.id="zelle-voice-select";select.style.cssText="flex:1;min-width:180px;max-width:100%;padding:10px;background:#f4f0e7;color:#243038;border:1px solid #b58b46;border-radius:7px;font:inherit;font-size:16px";
group.append(label,select,preview);actions.after(group);
actions.append(speakBtn,stopBtn);group.after(state);
const supported=("speechSynthesis" in window)&&("SpeechSynthesisUtterance" in window);
const fallback=Object.freeze({voiceName:"Samantha",lang:"en-US",rate:1.10,pitch:1.45});
const profile=()=>window.PolyglotMentorVoiceProfiles?.get?.("zelle")||fallback;
const key=v=>JSON.stringify([v.voiceURI||"",v.name||"",v.lang||"",!!v.localService]);
const pref="vnv.public.voice.zelle.v1";
let voices=[],choice="auto";
try{const saved=localStorage.getItem(pref);if(saved&&saved.length<500)choice=saved;}catch{}
const labelVoice=v=>(v.name||"Unnamed")+" · "+(v.lang||"unknown")+(v.localService?" · device":" · browser/service");
function automatic(){
 const p=profile();
 return voices.find(v=>v.name===p.voiceName&&/^en-US$/i.test(v.lang||""))
 ||voices.find(v=>/^en-US$/i.test(v.lang||"")&&v.localService)
 ||voices.find(v=>/^en/i.test(v.lang||"")&&v.localService)
 ||voices.find(v=>/^en/i.test(v.lang||""))||voices[0]||null;
}
function selected(){return choice==="auto"?automatic():voices.find(v=>key(v)===choice)||automatic();}
function refresh(){
 if(!supported)return;
 voices=Array.from(window.speechSynthesis.getVoices()||[]);
 select.replaceChildren();const d=document.createElement("option");d.value="auto";d.textContent="Automatic · Samantha (Polyglot)";select.append(d);
 const seen=new Set();
 for(const v of voices){const k=key(v);if(seen.has(k))continue;seen.add(k);const o=document.createElement("option");o.value=k;o.textContent=labelVoice(v);select.append(o);}
 if(choice!=="auto"&&!seen.has(choice)&&voices.length){choice="auto";state.textContent="The previous voice is unavailable. Zelle's automatic Polyglot voice has been restored.";}
 select.value=choice;
}
function setStatus(msg){state.textContent=msg;}
function speak(text){
 if(!supported){setStatus("Speech playback is unavailable; Zelle's text chat remains available.");return;}
 try{
 const p=profile(),v=selected();window.speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(String(text||"").slice(0,1800));
 utterance.lang=v?.lang||p.lang;utterance.rate=p.rate;utterance.pitch=p.pitch;
 if(v)utterance.voice=v;
 utterance.onstart=()=>setStatus("Speaking with "+(v?.name||"browser default")+" · "+p.rate.toFixed(2)+"× rate · "+p.pitch.toFixed(2)+" pitch.");
 utterance.onend=()=>setStatus("Playback finished.");
 utterance.onerror=e=>{if(e.error!=="canceled"&&e.error!=="interrupted")setStatus("Speech playback could not start.")};
 window.speechSynthesis.speak(utterance);
 }catch{setStatus("Speech playback could not start.");}
}
function replies(){return [...log.querySelectorAll("p")].filter(p=>p.querySelector("strong")?.textContent?.trim().startsWith("Zelle:"));}
function reply(p){return (p?.textContent||"").replace(/^Zelle:\s*/,"").trim();}
function decorate(){for(const p of replies()){
 if(p.querySelector(".zelle-replay"))continue;
 const t=reply(p),b=document.createElement("button");b.type="button";b.className="secondary zelle-replay";b.textContent="Listen to this reply";b.style.cssText="display:block;margin-top:8px;font-size:16px";
 b.addEventListener("click",()=>speak(t));p.append(b);
}}
decorate();if("MutationObserver" in window){const observer=new MutationObserver(decorate);observer.observe(log,{childList:true});}
speakBtn.addEventListener("click",()=>{const r=replies().at(-1);if(r)speak(reply(r));else setStatus("Zelle has no reply to read yet.");});
preview.addEventListener("click",()=>speak("Hello, I am Zelle! Shall we make something wonderful today?"));
stopBtn.addEventListener("click",()=>{if(supported)window.speechSynthesis.cancel();setStatus("Speech stopped.");});
select.addEventListener("change",()=>{choice=select.value||"auto";try{localStorage.setItem(pref,choice);}catch{}setStatus("Voice: "+(selected()?labelVoice(selected()):"browser default"));});
if(supported){refresh();window.speechSynthesis.addEventListener?.("voiceschanged",refresh);}
else{select.disabled=true;preview.disabled=true;speakBtn.disabled=true;stopBtn.disabled=true;setStatus("Speech playback is unavailable in this browser.");}
window.addEventListener("pagehide",()=>{if(supported)window.speechSynthesis.cancel();});
})();
