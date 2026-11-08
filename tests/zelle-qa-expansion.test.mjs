import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const live=read("../knowledge/question-records.json");
const proposal=read("../knowledge/zelle-qa-expansion-180.review.json");
const normalize=s=>String(s??"").normalize("NFKC").trim().toLowerCase().replace(/\s+/g," ").replace(/[.!?。？！]+$/gu,"").trim();
const topics=["composition","color-light","drawing-observation","painting-media","photography","mixed-media","illustration-story","portfolio-curation","critique-mentorship","community-guidance","creative-direction","art-history-ethics"];

test("published Zelle bank contains 500 approved, distinct usable responses",()=>{
 assert.equal(live.schema,"zelle-question-collection-v1");
 assert.equal(live.records.length,500);
 const questions=new Set(),ids=new Set();
 for(const row of live.records){
   assert.equal(row.status,"approved");
   assert.equal(row.schema,"zelle-question-v1");
   assert.ok(typeof row.id==="string"&&row.id.length>0);
   assert.ok(typeof row.question==="string"&&row.question.trim().length>0);
   assert.ok(Array.isArray(row.keywords));
   assert.ok(Array.isArray(row.responses) && row.responses.some(x=>typeof x.text==="string"&&x.text.trim()&&Number(x.weight)>0));
   assert.ok(!ids.has(row.id),"duplicate record ID "+row.id);ids.add(row.id);
   const key=normalize(row.question);
   assert.ok(!questions.has(key),"duplicate normalized question "+row.question);questions.add(key);
 }
 assert.equal(questions.size,500);
});

test("180 founder-approved draft questions are published exactly once and originals remain in place",()=>{
 assert.equal(proposal.schema,"zelle-qa-editorial-expansion-v1");
 assert.equal(proposal.proposedRecords.length,180);
 assert.equal(live.records.length-proposal.proposedRecords.length,320);
 const original=live.records.slice(0,320);
 assert.ok(original.every(row=>row.status==="approved"&&!row.id.startsWith("zelle-2026-exp-")));
 const added=live.records.slice(320);
 const byId=new Map(added.map(row=>[row.id,row]));
 assert.equal(byId.size,180);
 const topicCounts=new Map();
 for(const draft of proposal.proposedRecords){
   const row=byId.get(draft.id);
   assert.ok(row,"missing published draft "+draft.id);
   assert.equal(row.question,draft.question);
   assert.equal(row.topic,draft.topic);
   assert.deepEqual(row.responses,draft.responses);
   assert.equal(row.status,"approved");
   assert.equal(draft.status,"pending-editorial-review");
   topicCounts.set(row.topic,(topicCounts.get(row.topic)||0)+1);
 }
 assert.deepEqual([...topicCounts.keys()].sort(),[...topics].sort());
 for(const [topic,count] of topicCounts)assert.equal(count,15,topic);
});

test("published questions load through existing chatbot schema and exact question scoring",()=>{
 const js=readFileSync(new URL("../zelle-conversation.js",import.meta.url),"utf8");
 assert.match(js,/knowledge\/question-records\.json/);
 assert.match(js,/data\.schema !== "zelle-question-collection-v1"/);
 assert.match(js,/x\.status === "approved"/);
 for(const entry of live.records.slice(320)){
   assert.equal(entry.alternateQuestions.length,0);
   assert.ok(entry.responses.every(x=>x.weight>0));
 }
});
