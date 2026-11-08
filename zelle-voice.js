/* Zelle's opt-in speech playback reads the shared Polyglot voice profile.
 * No recordings, account access, network speech provider, or auto-play.
 * Device speech synthesis only, if available in the visitor's browser.
 */
(()=>{"use strict";
const host=document.getElementById("zelle-conversation");
if(!host)return;
const log=host.querySelector("[data-zelle-log]");
const actions=host.querySelector(".zelle-chat-actions");
if(!log||!actions)return;
const speakBtn=document.createElement("button"),stopBtn=document.createElement("button"),state=document.createElement("p");
speakBtn.type="button";speakBtn.className="secondary";speakBtn.textContent="Listen to Zelle";
stopBtn.type="button";stopBtn.className="secondary";stopBtn.textContent="Stop audio";
state.setAttribute("role","status");state.setAttribute("aria-live","polite");
state.className="zelle-chat-status";state.textContent="Voice: Samantha · English · rate 1.10 · pitch 1.45 (when available on your device). Playback is optional.";
actions.append(speakBtn,stopBtn);
actions.after(state);
const supported=("speechSynthesis" in window)&&("SpeechSynthesisUtterance" in window);
const fallback=Object.freeze({voiceName:"Samantha",lang:"en-US",rate:1.10,pitch:1.45});
const cfg=()=>window.PolyglotMentorVoiceProfiles?.get?.("zelle")||fallback;
function chooseVoice(){
 const vs=window.speechSynthesis.getVoices()||[],p=cfg();
 return vs.find(v=>v.name===p.voiceName&&/^en-US$/i.test(v.lang||""))
 ||vs.find(v=>/^en-US$/i.test(v.lang||"")&&v.localService)
 ||vs.find(v=>/^en/i.test(v.lang||"")&&v.localService)
 ||vs.find(v=>/^en/i.test(v.lang||""))
 ||null;
}
function setStatus(msg){state.textContent=msg;}
if(!supported){speakBtn.disabled=true;stopBtn.disabled=true;setStatus("Speech playback is unavailable in this browser. Zelle's text chat remains fully available.");return}
speakBtn.addEventListener("click",()=>{
 const replies=[...log.querySelectorAll("p")].filter(p=>p.querySelector("strong")?.textContent?.trim().startsWith("Zelle:"));
 const last=replies.at(-1);
 const text=last?last.textContent.replace(/^Zelle:\s*/,"").trim():"";
 if(!text){setStatus("Zelle has no reply to read yet.");return}
 const p=cfg(),voice=chooseVoice();
 window.speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(text.slice(0,1800));
 utterance.lang=voice?.lang||p.lang;
 utterance.rate=p.rate;utterance.pitch=p.pitch;
 if(voice)utterance.voice=voice;
 utterance.onstart=()=>setStatus("Speaking with "+(voice?.name||"browser voice")+" · "+p.rate.toFixed(2)+"× rate · "+p.pitch.toFixed(2)+" pitch.");
 utterance.onend=()=>setStatus("Playback finished.");
 utterance.onerror=event=>{if(event.error!=="canceled"&&event.error!=="interrupted")setStatus("Speech playback could not start on this device. Text chat remains available.")};
 if(!voice)setStatus("Samantha is not available; trying the browser voice.");
 window.speechSynthesis.speak(utterance);
});
stopBtn.addEventListener("click",()=>{window.speechSynthesis.cancel();setStatus("Speech stopped.")});
window.addEventListener("pagehide",()=>window.speechSynthesis.cancel());
})();
