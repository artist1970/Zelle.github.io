import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const existing=read("../knowledge/question-records.json");
const proposal=read("../knowledge/zelle-qa-expansion-180.review.json");
const normalise=s=>String(s??"").normalize("NFKC").trim().toLowerCase().replace(/\s+/g," ").replace(/[.!?。？！]+$/gu,"").trim();
const topicNames=["composition","color-light","drawing-observation","painting-media","photography","mixed-media","illustration-story","portfolio-curation","critique-mentorship","community-guidance","creative-direction","art-history-ethics"];

test("preserves 320 existing approved Zelle records without changing the chat bank",()=>{
  assert.equal(existing.schema,"zelle-question-collection-v1");
  assert.equal(existing.records.length,320);
  assert.ok(existing.records.every(r=>r.status==="approved"));
});
test("stages exactly 180 original, distinct Zelle questions with no existing collisions",()=>{
  assert.equal(proposal.schema,"zelle-qa-editorial-expansion-v1");
  assert.equal(proposal.mentorId,"zelle");
  assert.equal(proposal.status,"pending-editorial-review-not-published");
  assert.equal(proposal.proposedRecords.length,180);
  const known=new Set(existing.records.map(r=>normalise(r.question)));
  const ids=new Set(existing.records.map(r=>r.id));
  const topics=new Map();
  for(const r of proposal.proposedRecords){
    const k=normalise(r.question);
    assert.ok(k&&r.question.endsWith("?"));
    assert.ok(!known.has(k),"duplicate question "+r.question);
    assert.ok(!ids.has(r.id),"duplicate ID "+r.id);
    known.add(k); ids.add(r.id);
    topics.set(r.topic,(topics.get(r.topic)||0)+1);
    assert.equal(r.schema,"zelle-question-v1");
    assert.equal(r.status,"pending-editorial-review");
    assert.ok(Array.isArray(r.keywords));
    assert.ok(Array.isArray(r.responses)&&r.responses.length>0);
    assert.ok(r.responses.every(x=>typeof x.text==="string"&&x.text.length>=60&&x.weight>0));
    assert.ok(Array.isArray(r.alternateQuestions));
    assert.ok(Array.isArray(r.rebuttals));
    assert.ok(Array.isArray(r.followups));
  }
  assert.deepEqual([...topics.keys()].sort(),topicNames.sort());
  for(const [topic,count] of topics)assert.equal(count,15,topic);
});
test("chat loader excludes proposed material until separately approved",()=>{
  const loaded=proposal.proposedRecords.filter(x=>x.status==="approved");
  assert.equal(loaded.length,0);
});
