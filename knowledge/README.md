# Zelle conversational knowledge · v1

The public page loads `knowledge/questions.json` as an editable, curated topic bank.

Each topic includes `id`, `folder` (adjacent subject category), `keywords`, example `questions`, weighted `responses` and weighted `followups`. Add topics or candidates without changing the engine. Candidate weights must be positive numbers; selection is weighted random (Monte Carlo-style sampling), with a simple immediate-repeat guard.

Example candidate:
```json
{"id":"drawing-r3","text":"Try drawing the shadow shapes first.","weight":2}
```

Unknown questions are automatically categorized and held in the browser's `localStorage` under `zelle-unanswered-v1`, with a maximum of 100 records. The user may export `zelle-unanswered-questions.json` for manual review. The local queue is **not** a shared repository folder, a live moderation queue, or an automatic GitHub upload. Users should avoid entering private details.

Review exported questions before adding them to `knowledge/questions.json`; remove names and sensitive content, check answer quality, then write multiple appropriate responses and follow-ups. Never publish raw user-submitted questions without permission and privacy review.

## Future automatic intake

To collect questions across users, build an authenticated, rate-limited endpoint with spam filtering, opt-in, retention controls, and human curation. It may create proposed files under a private `intake/<folder>/` path or review queue, never push untrusted content directly into the public answer bank. The static page must never contain GitHub write credentials.

## Current limitations

This is a rule-based topic matcher, not an LLM or autonomous learner. It cannot infer intent reliably from every short reply. The question bank requires editorial maintenance, and the knowledge JSON needs an HTTP(S) static server (such as GitHub Pages) for browser fetch.
