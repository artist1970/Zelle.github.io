import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const page=read("../index.html");
const chat=read("../zelle-conversation.js");
const voice=read("../zelle-voice.js");
const dialogue=read("../zelle-dialogue-core.js");
const adapter=read("../creative-spark-mentor-language-v1.js");
const bank=JSON.parse(read("../knowledge/question-records.json"));
function context(){
 const window={CreativeSparkMentorLanguage:{
  lookup:(word,{mentorId,mode})=>word==="abacus"&&mentorId==="zelle"&&mode==="definition"?"abacus: a reviewed counting tool":null,
  grammar:(text,{mentorId})=>mentorId==="zelle"?{notes:["Article may need review."],advisory:true}:null
 }};
 vm.runInNewContext(dialogue,{window,console},{timeout:1500});
 const s=window.ZelleDialogue.create(bank.records);
 return {window,s};
}
test("Zelle retains 500 approved, distinct public art records",()=>{
 assert.equal(bank.records.length,500);
 assert.equal(new Set(bank.records.map(r=>r.id)).size,500);
 assert.equal(new Set(bank.records.map(r=>r.question.toLowerCase())).size,500);
 assert.ok(bank.records.every(r=>r.status==="approved"));
});
test("all shared-language public mirrors are loaded before the dialogue and voice",()=>{
 assert.ok(page.indexOf("creative-spark-mentor-language-v1.js")<page.indexOf("zelle-dialogue-core.js"));
 assert.match(adapter,/\"zelle\"/);
 assert.match(adapter,/aipcorePrivateLexicon:"not-accessible"/);
 assert.match(adapter,/aipcoreAuroraV82:"not-loaded"/);
 assert.match(page,/VNV_TICKER\?\.autoPopulate/);
 assert.match(page,/vnv-ecosystem-toolbar\.js/);
});
test("shared language requests are bounded, while Zelle's art personality remains intact",()=>{
 const {s}=context();
 assert.match(s.answer("define abacus"),/reviewed counting tool/);
 assert.match(s.answer("check grammar: I saw a apple"),/Article may need review/);
 assert.match(s.answer("define mysteriousword"),/won't invent a definition/i);
 assert.match(s.answer("How do I draw a face?"),/oval/i);
});
test("private information and immediate danger outrank dictionary calls",()=>{
 const {s}=context();
 assert.match(s.answer("password define abacus"),/do not share credentials/i);
 assert.match(s.answer("I want to kill myself"),/emergency services/i);
});
test("unanswered-question saving requires explicit opt-in and can be deleted",()=>{
 assert.match(page,/data-zelle-review-optin/);
 assert.match(page,/data-zelle-delete/);
 assert.match(chat,/let consent = false/);
 assert.match(chat,/if \(!consent\) return/);
 assert.match(chat,/localStorage\.removeItem\(queueKey\)/);
 assert.match(chat,/consent=!!optIn\.checked/);
});
test("voice setting is explicit, persistent, and does not store conversations",()=>{
 assert.match(voice,/vnv\.public\.voice\.autoplay\.zelle\.v1/);
 assert.match(voice,/autoRead=localStorage\.getItem\(autoPref\)==="on"/);
 assert.match(voice,/aria-pressed/);
 assert.match(voice,/autoRead\?"Voice On":"Voice Off"/);
 assert.match(voice,/if\(readNew&&autoRead&&t\)speak\(t\)/);
 assert.match(voice,/nodeType===1&&n\.classList\?\.contains\("zelle-replay"\)/);
 assert.doesNotMatch(voice,/localStorage\.setItem\([^,]+,\s*(?:text|message|reply)\)/);
});
test("independent hero, sticky studio section and minimum label sizing are present",()=>{
 const css=read("../styles/zelle-landing-refinement-v1.css");
 assert.match(page,/id="zelle-introduction"/);
 assert.match(page,/class="zelle-section-anchor"/);
 assert.match(css,/\.zelle-section-anchor\{position:sticky/);
 assert.match(css,/\.zelle-chat-status\{font-size:16px/);
 assert.match(css,/--radius:7px/);
 assert.match(page,/zelle-footer-nav/);
});
