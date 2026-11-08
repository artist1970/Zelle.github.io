/* Zelle public dialogue v2 — deterministic, local-only, no remote provider or authority. */
(function(global){"use strict";
const normalize=s=>String(s??"").normalize("NFKC").toLowerCase().replace(/[’]/g,"'").replace(/[^a-z0-9' ]/g," ").replace(/\s+/g," ").trim();
const tokenize=s=>normalize(s).split(" ").filter(w=>w.length>2);
const stops=new Set(["the","and","for","that","this","with","how","what","when","where","which","could","would","should","about","into","from","today","your","you","can","are","have","does","their","they","want","some","make","making","best","way","tell","please","help","art","artist","work"]);
const stem=w=>w.replace(/(ing|ed|es|s)$/,"");
const cleanQuestion=s=>normalize(s).replace(/^(hello|hi|hey) (zelle )?/,"");
const pick=rows=>Array.isArray(rows)?rows.find(r=>r&&typeof r.text==="string"&&r.text.trim()&&Number(r.weight)>0)?.text||"":""; 
function create(records=[]){
 let memory={subject:null,activity:null,step:null,turn:0,lastQuestion:"",lastReply:""};
 let library=[]; 
 function setRecords(rows){library=Array.isArray(rows)?rows.filter(r=>r&&r.status==="approved"&&typeof r.question==="string"&&Array.isArray(r.responses)):[];return library.length}
 setRecords(records);
 function finish(reply,subject,activity=null){
   if(subject)memory.subject=subject;
   if(activity)memory.activity=activity;
   memory.lastReply=reply;memory.turn++;return reply;
 }
 function answer(raw){
   const msg=String(raw||"").trim().slice(0,1200),s=normalize(msg);
   if(!s)return "Tell me what you are exploring, and we can begin with one small step.";
   memory.lastQuestion=msg;
   // Safeguards take precedence over any text matching or contextual guessing.
   if(/\b(password|access token|api key|secret key|private key|student record|social security number|credit card)\b/i.test(msg))
     return finish("Please do not share credentials or private records here. We can work with a general, non-identifying art question instead.");
   if(/\b(kill myself|suicide|self harm|self-harm|immediate danger|being attacked)\b/i.test(msg))
     return finish("If you or someone else is in immediate danger, contact local emergency services or a trusted person nearby. This art chatbot cannot provide emergency help.");
   if(/^(hello|hi|hey|good morning|good afternoon)( zelle)?( how are you( today)?)?$/.test(s)||/\bhow are you( today)?\b/.test(s))
     return finish("Hello! I'm here and ready to explore your art with you. What are you making or imagining?");
   if(/\b(programming you|coding you|building you|developing you)\b/.test(s))
     return finish("You're shaping my art-guidance experience! I currently use a reviewed question bank and local conversation rules, not a live language model. What would you like me to understand better?");
   if(/\b(favorite|favourite)\b.*\b(art|medium|style)\b/.test(s))
     return finish("I don't have personal favorites as a human would, but I especially enjoy exploring expressive color, visual storytelling, and unusual mixed-media combinations. What kind of art makes you curious?");
   if(/\b(creative spark|need inspiration|stuck for ideas)\b/.test(s))
     return finish("Creative Spark is a separate studio for developing original ideas. We can also begin here: choose a color, object, or feeling and make three tiny thumbnail sketches. The Creative Spark doorway is linked below the chat.","ideas");
   if(/\b(aurora|breath|grounding|overwhelmed|need a break)\b/.test(s))
     return finish("Aurora offers a separate, gentle grounding space. If you'd like a creative pause, notice your feet on the floor, relax your grip, and take a comfortable breath. You can visit Aurora using the link below.","wellness");
   if(/\b(do you draw|can you draw|do you make drawings)\b/.test(s))
     return finish("I can guide you through drawing ideas and techniques, though I do not physically draw on this page. Would you like to sketch a face, object, or imagined scene?","drawing");
   if(/\b(draw a face|drawing a face|draw faces|sketch a face|portrait face|best way to draw a face)\b/.test(s) || /^(a |the )?face$/.test(s)&&memory.subject==="portrait")
     return finish("For a face, sketch the head as a simple oval, mark a light vertical centerline and eye-level guide, then compare the placement of eyes, nose, and mouth. Draw from observation and adjust proportions before detailing. Would you like a quick portrait exercise?","portrait","portrait-practice");
   if(/\b(circle|circles|infinite|infinity)\b/.test(s)&&!/\bhow do i draw a circle\b/.test(s))
     return finish("I love that connection between circles and infinity as a visual idea. A circle can suggest continuity, cycles, or possibility. Would you like to make a composition using repeated circles of different sizes?","circles","circle-composition");
   if(/\b(what can i paint|what should i paint|painting idea|paint today|something to paint)\b/.test(s))
     return finish("Try one of three painting prompts: a window in changing light, a still life in only three colors, or an imaginary garden built from circles. Which sounds exciting? I can help you pick supplies and the first step.","painting","painting-prompt");
   if(/\b(suppl|materials|what do i need|tools needed|what should i bring)\b/.test(s)){
     if(memory.subject==="portrait")
       return finish("For a portrait sketch, start with paper, an HB or 2B pencil, and an eraser. A mirror or reference with permission is useful. Keep the first marks light.","portrait","portrait-practice");
     if(memory.subject==="painting"||memory.activity==="painting-prompt")
       return finish("For today's painting, gather paper or canvas, a suitable paint set, one large and one small brush, water if your paint is water-based, a palette, and a cloth. Choose a protected work surface and follow the material's safety instructions. Do you want watercolor or acrylic?","painting","painting-prompt");
     return finish("Tell me whether you're drawing, painting, photographing, or making a collage, and I'll suggest a simple starter kit.");
   }
   if(/^(yes|yes i would|yes please|sure|okay|ok|let's do it|lets do it|that sounds good)$/.test(s)){
     if(memory.activity==="painting-prompt")return finish("Wonderful. Choose the imaginary garden, the three-color still life, or the window study. For the garden, start with three large shapes and add one unexpected color. Which would you like?","painting","painting-prompt");
     if(memory.activity==="portrait-practice")return finish("Let's begin: lightly draw an oval, find the centerline, and compare the distance between the eyes. Don't worry about perfect detail yet. Would you like help with shading next?","portrait","portrait-practice");
     if(memory.activity==="circle-composition")return finish("Try three overlapping circles in different sizes. Let the overlap suggest an infinite path, then choose one color accent for the focal point.","circles","circle-composition");
     return finish("Absolutely. Tell me which art idea you'd like to try, and we'll work out the first step together.");
   }
   if(/\b(i love painting|love to paint|i like painting|painting is my favorite)\b/.test(s))
     return finish("Painting offers so many ways to explore light and emotion. Would you prefer watercolor, acrylic, or something experimental today?","painting","painting-prompt");
   const key=cleanQuestion(s);
   const direct=library.find(r=>cleanQuestion(r.question)===key||(r.alternateQuestions||[]).some(x=>cleanQuestion(x)===key));
   if(direct)return finish(pick(direct.responses)||"Let's explore that art question together.",direct.topic);
   // Specific content words must agree, not generic words like art or how.
   const inputTerms=new Set(tokenize(s).filter(w=>!stops.has(w)).map(stem));
   const scored=library.map(r=>{
     const qTerms=new Set(tokenize(r.question).filter(w=>!stops.has(w)).map(stem));
     const matches=[...inputTerms].filter(w=>qTerms.has(w)).length;
     const keywords=(r.keywords||[]).filter(k=>{const n=normalize(k);return n.length>4 && (n.includes(" ")?s.includes(n):inputTerms.has(stem(n)))}).length;
     const hasRareMatch=matches>=2 || matches>=1&&keywords>=1;
     const similarity=hasRareMatch ? matches/(Math.max(3,qTerms.size))+keywords*0.08:0;
     return {r,similarity,matches};
   }).filter(x=>x.similarity>=0.46&&x.matches>=1).sort((a,b)=>b.similarity-a.similarity);
   if(scored.length&&(scored.length===1||scored[0].similarity>=scored[1].similarity+0.12))
     return finish(pick(scored[0].r.responses),scored[0].r.topic);
   return null;
 }
 function reset(){memory={subject:null,activity:null,step:null,turn:0,lastQuestion:"",lastReply:""}}
 return Object.freeze({answer,setRecords,reset,snapshot:()=>({...memory}),count:()=>library.length});
}
global.ZelleDialogue=Object.freeze({create});
})(typeof globalThis!=="undefined"?globalThis:this);
