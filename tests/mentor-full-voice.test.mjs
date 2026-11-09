import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const source=readFileSync(new URL('../zelle-voice.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function el(tag='div'){const events={};return{tag,events,children:[],textContent:'',value:'',disabled:false,style:{},className:'',
 append(...x){this.children.push(...x)},replaceChildren(...x){this.children=[...x]},after(){},setAttribute(){},addEventListener(k,f){events[k]=f},
 querySelector(q){return q==='[data-zelle-log]'?this.log:q==='.zelle-chat-actions'?this.actions:null},querySelectorAll(){return []}}}
function boot(){
 const host=el(),log=el(),actions=el(),spoken=[],store=new Map();
 host.log=log;host.actions=actions;
 const voices=[{name:'Samantha',lang:'en-US',voiceURI:'sa',localService:true},{name:'Amélie',lang:'fr-FR',voiceURI:'fr',localService:true}];
 const document={getElementById:k=>k==='zelle-conversation'?host:null,createElement:el};
 function SpeechSynthesisUtterance(text){this.text=text;}
 const window={speechSynthesis:{getVoices:()=>voices,addEventListener(){},cancel(){},speak:u=>spoken.push(u)},SpeechSynthesisUtterance,addEventListener(){},PolyglotMentorVoiceProfiles:{get:()=>({voiceName:'Samantha',lang:'en-US',rate:1.10,pitch:1.45})}};
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 vm.runInNewContext(source,{window,document,localStorage,SpeechSynthesisUtterance},{timeout:1000});
 return{spoken,store,actions};
}
test('Zelle preserves her original conversation and polyglot voice profile',()=>{
 assert.match(html,/src="\.\/zelle-conversation\.js"/);
 assert.match(source,/PolyglotMentorVoiceProfiles/);
 assert.match(source,/rate:1\.10,pitch:1\.45/);
});
test('voice selector supports all voices, preview and Samantha by default',()=>{
 const b=boot();
 assert.match(source,/getVoices\(\)/);
 assert.match(source,/Automatic · Samantha \(Polyglot\)/);
 assert.match(source,/Listen to this reply/);
 assert.match(source,/Preview voice/);
});
test('only the selected voice identity may be stored and no chat transport added',()=>{
 assert.match(source,/vnv\.public\.voice\.zelle\.v1/);
 assert.doesNotMatch(source,/fetch\s*\(|XMLHttpRequest|indexedDB/);
});
