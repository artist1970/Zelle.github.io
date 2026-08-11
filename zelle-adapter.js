const ROUTES = Object.freeze([
  { id:"bazaar-art", label:"Bazaar Art", words:["paint","painting","draw","drawing","sketch","canvas","visual","art","sculpt","craft","color","palette","photo","photography"], url:"https://vervenveda.com/bazaarart.github.io/" },
  { id:"the-refrain", label:"The Refrain", words:["music","song","melody","rhythm","chord","compose","composition","sound","keyboard","instrument"], url:"https://vervenveda.com/the_refrain.github.io/" },
  { id:"arshif", label:"ARSHIF", words:["history","archive","tradition","culture","literature","read","reading","reference","research","symbolism"], url:"https://vervenveda.com/Arshif.github.io/" },
  { id:"aurora", label:"Aurora", words:["journal","journaling","reflect","reflection","mood","feeling","calm","inspiration","affirmation","color"], url:"https://vervenveda.com/aurora.github.io/" },
  { id:"proresources", label:"PROSE / ProReSources", words:["write","writing","edit","editing","essay","story","poem","poetry","script","words"], url:"https://vervenveda.com/proresource_hub.github.io/" },
  { id:"creative-spark", label:"Creative Spark", words:["idea","ideas","prompt","stuck","block","spark","theme","symbol","style"], url:"https://artist1970.github.io/creative-spark.github.io/" }
]);
function normalizeText(value="") { return String(value||"").toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu," "); }
function rankRoutes(message="") { const text=normalizeText(message); return ROUTES.map(route=>({...route,score:route.words.reduce((n,w)=>n+(text.includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score||a.label.localeCompare(b.label)); }
export const ZelleAdapter = Object.freeze({
  id:"zelle", name:"Zelle", version:"0.1.0",
  capabilities:Object.freeze(["creative-intake","creative-pathway-selection","creative-prompt-composition","creative-block-support","cross-medium-translation","resource-matching","structured-handoff-preparation","age-adaptive-guidance"]),
  availability:"handoff-ready",
  canExecute(){ return {allowed:false,reason:"handoff-ready-specialist",note:"Zelle 0.1.0 prepares guidance and handoffs but does not execute remote resources."}; },
  prepare(context={}){ const message=String(context.message||context.query||""); const ranked=rankRoutes(message); const positive=ranked.filter(x=>x.score>0); const choices=(positive.length?positive:ranked).slice(0,3); return {specialist:"zelle",status:"prepared",intent:message,routes:choices.map(({id,label,url,score})=>({id,label,url,score})),requiresUserAction:true,authority:"creative-guidance-and-resource-handoff",note:"Route suggestions are creative pathways, not remote executions."}; },
  async execute(context={}){ return {specialist:"zelle",status:"handoff-required",executed:false,prepared:this.prepare(context),note:"User action is required to open or use a destination resource."}; }
});
export function getZelleRoutes(message=""){ return rankRoutes(message).map(({id,label,url,score})=>({id,label,url,score})); }
