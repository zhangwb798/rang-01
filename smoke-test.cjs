// Exercise real scene geometry and game events; renderer/DOM are stubs.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const THREE = require('./vendor/three.min.js');
let now=0, nextFrame;
const listeners={};
const elements=new Map();
const node=()=>({style:{setProperty(){}},hidden:false,textContent:'',classList:{add(){},remove(){}},appendChild(){},querySelector(){return node();},closest(){return null;},addEventListener(){},getContext(){return {fillRect(){},fillText(){}};}});
const get=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};
const modes=[node(),node()];modes[0].dataset={mode:'free'};modes[1].dataset={mode:'timed'};
const document={getElementById:get,createElement:node,querySelector:()=>node(),querySelectorAll:()=>modes,addEventListener(type,cb){(listeners[type]||=[]).push(cb);},exitPointerLock(){document.pointerLockElement=null;emit('pointerlockchange');}};
const canvas=node();canvas.requestPointerLock=()=>{document.pointerLockElement=canvas;emit('pointerlockchange');};
class Renderer {constructor(){this.domElement=canvas;this.shadowMap={};}setSize(){}setPixelRatio(){}render(scene){scene.updateMatrixWorld(true);}}
const context={THREE:{...THREE,WebGLRenderer:Renderer,Clock:class{constructor(){this.last=now;}getDelta(){let d=now-this.last;this.last=now;return d;}}},document,innerWidth:1280,innerHeight:720,devicePixelRatio:1,console,localStorage:{getItem(){return 0;},setItem(){}},requestAnimationFrame(cb){nextFrame=cb;}};
context.window=context;context.addEventListener=()=>{};vm.createContext(context);vm.runInContext(fs.readFileSync('game.js','utf8'),context);
function emit(type,event={}){for(const cb of listeners[type]||[])cb({preventDefault(){},target:node(),...event});}
function frames(seconds){for(let t=0;t<seconds;t+=1/60){now+=1/60;nextFrame();}}
const state=()=>context.rangeDebug.getState();
get('start').onclick();frames(.1);assert.equal(state().targets,36);assert.equal(state().locked,true);
// Aim at the body of a front-row bottle in the center lane.
const target=new THREE.Vector3(-2.05,1.45,-16);
const position=new THREE.Vector3(...state().position);
const d=target.clone().sub(position);
const yaw=Math.atan2(-d.x,-d.z),pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));
emit('mousemove',{movementX:-yaw/.002,movementY:-pitch/.002});frames(.1);
emit('mousedown',{button:0});emit('mouseup',{button:0});frames(.15);
assert.equal(state().ammo,29);assert.equal(state().shots,1);assert.equal(state().hits,1);assert.equal(state().targets,35);
emit('keydown',{code:'KeyR'});frames(1.8);assert.equal(state().ammo,30);assert.equal(state().reloading,false);
emit('keydown',{code:'KeyT'});assert.equal(state().targets,36);
emit('keydown',{code:'KeyW'});frames(.3);emit('keyup',{code:'KeyW'});assert.ok(state().position[2]<7);
document.exitPointerLock();const before=state().ammo;emit('mousedown',{button:0});assert.equal(state().ammo,before);assert.equal(get('pause').hidden,false);
get('back').onclick();modes[1].onclick();get('start').onclick();frames(2);const remaining=state().remaining;document.exitPointerLock();frames(3);assert.equal(state().remaining,remaining);
get('resume').onclick();frames(59);assert.equal(state().playing,false);assert.equal(get('results').hidden,false);
console.log('PASS: 36 targets, real raycast hit, ammo, reload, target reset, movement, pause, paused timer, 60-second completion.');
