import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const source=readFileSync(new URL("../zelle-dialogue-core.js",import.meta.url),"utf8");
const bank=JSON.parse(readFileSync(new URL("../knowledge/question-records.json",import.meta.url),"utf8"));
const sandbox={};vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:"zelle-dialogue-core.js"});
const create=()=>sandbox.ZelleDialogue.create(bank.records);

test("Zelle loads 500 approved questions and maintains art-context through visitor transcript",()=>{
 const z=create();
 assert.equal(z.count(),500);
 const ask=q=>z.answer(q);
 assert.match(ask("Hello Zelle how are you today"),/ready to explore your art/);
 assert.match(ask("i am programming you"),/reviewed question bank/);
 assert.match(ask("what is your favorite kind of art?"),/expressive color/);
 assert.match(ask("do you draw?")||"",/./);
 assert.match(ask("I love painting"),/watercolor|acrylic/);
 assert.match(ask("what can i paint today"),/three painting prompts/);
 assert.match(ask("yes i would"),/imaginary garden/);
 assert.match(ask("what are the suppliwees needed"),/brush/);
 assert.match(ask("what is the best way to draw a face"),/oval/);
 assert.match(ask("a face"),/oval/);
 assert.match(ask("i love circles because they are infinite"),/infinity/);
 assert.match(ask("yes i would"),/overlapping circles/);
});
test("exact approved new Q&A is reachable without the draft keyword metadata",()=>{
 const z=create(),q="What helps prevent a mixed-media piece from becoming cluttered?";
 assert.equal(z.answer(q),bank.records.find(r=>r.question===q).responses[0].text);
});
test("low-confidence queries do not trigger generic unrelated Q&A",()=>{
 const z=create();
 assert.equal(z.answer("zebra submarine telephone"),null);
});
test("safety boundaries and independent mentor referral routes stay explicit",()=>{
 const z=create();
 assert.match(z.answer("can you access my password"),/do not share credentials/);
 assert.match(z.answer("I need Creative Spark"),/linked below/);
 assert.match(z.answer("Aurora grounding"),/separate, gentle grounding space/);
});
test("reset removes session-only activity context",()=>{
 const z=create();
 z.answer("what can i paint today");
 assert.equal(z.snapshot().activity,"painting-prompt");
 z.reset();
 assert.equal(z.snapshot().activity,null);
 assert.match(z.answer("yes i would"),/which art idea/);
});
