import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const voice=readFileSync(new URL("../zelle-voice.js",import.meta.url),"utf8");

test("Zelle loads Polyglot's shared profile before her opt-in voice player",()=>{
 const shared=html.indexOf("polyglot-mentor-voice-profiles.v1.js"),
       chat=html.indexOf("./zelle-conversation.js"),
       player=html.indexOf("./zelle-voice.js");
 assert.ok(shared>0&&chat>shared&&player>chat);
});
test("Zelle speaks only when user presses Listen; never auto speaks visitor chat",()=>{
 assert.match(voice,/speakBtn\.addEventListener\("click"/);
 assert.match(voice,/stopBtn\.addEventListener\("click"/);
 assert.match(voice,/window\.speechSynthesis\.cancel\(\)/);
 assert.ok(voice.indexOf("speechSynthesis.speak(utterance)")>voice.indexOf('speakBtn.addEventListener("click"'));
});
test("Samantha fallback uses English voice and preserves prescribed voice settings",()=>{
 assert.match(voice,/voiceName:"Samantha",lang:"en-US",rate:1\.10,pitch:1\.45/);
 assert.match(voice,/PolyglotMentorVoiceProfiles/);
 assert.match(voice,/v=>\/\^en-US\$/);
 assert.match(voice,/utterance\.rate=p\.rate;utterance\.pitch=p\.pitch/);
 assert.doesNotMatch(voice,/\b(?:fetch|localStorage|sessionStorage|XMLHttpRequest)\s*\(/);
});
