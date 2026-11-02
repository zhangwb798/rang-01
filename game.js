/* RANGE 01 — standalone local training prototype, Three.js r160. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 if (!window.THREE) { $('error').hidden=false; $('error').textContent='未能加载 3D 引擎。请确认 vendor/three.min.js 文件存在。'; return; }
 const scene = new THREE.Scene(); scene.background=new THREE.Color(0x293437); scene.fog=new THREE.FogExp2(0x293437,.018);
 let renderer;
 try { renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); } catch(e) { $('error').hidden=false; $('error').textContent='无法启动 WebGL。请使用支持硬件加速的桌面浏览器。'; return; }
 renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12; $('viewport').appendChild(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,90); camera.rotation.order='YXZ'; scene.add(camera);
 const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const concrete=mat(0x59615d), dark=mat(0x263233), steel=mat(0x384646,.4,.65), wood=mat(0x7a6041), amber=mat(0xe2a75d), rubber=mat(0x151d20);
 const solids=[], bottles=[], debris=[], marks=[], tracers=[], keys=new Set();
 const box=(w,h,d,x,y,z,m,parent=scene)=>{const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a;};
 const cyl=(r1,r2,h,x,y,z,m,parent=scene)=>{const a=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a;};
 function sign(text,w,h,x,y,z,size=80,color='#ded7bb',bg='#273333') { const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=color;ctx.font=`600 ${size}px Segoe UI, Microsoft YaHei`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const a=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));a.position.set(x,y,z);scene.add(a);return a; }
 // Concrete texture, generated locally without image assets.
 const cv=document.createElement('canvas');cv.width=cv.height=256;const cx=cv.getContext('2d');cx.fillStyle='#656960';cx.fillRect(0,0,256,256);let seed=431;function rand(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}for(let i=0;i<14000;i++){const v=rand()>.5?255:0;cx.fillStyle=`rgba(${v},${v},${v},${rand()*.045})`;cx.fillRect(rand()*256,rand()*256,rand()*3+1,rand()*3+1);}const floorTex=new THREE.CanvasTexture(cv);floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(16,20);floorTex.colorSpace=THREE.SRGBColorSpace;
 box(30,.4,43,0,-.2,-9,new THREE.MeshStandardMaterial({map:floorTex,roughness:1}));
 solids.push(box(30,10,.6,0,5,-29,concrete),box(.6,10,43,-15,5,-8,concrete),box(.6,10,43,15,5,-8,concrete),box(30,10,.5,0,5,12,concrete));
 box(30,.2,43,0,9,-8,dark);
 scene.add(new THREE.HemisphereLight(0xc6e3e4,0x514a35,2.1));
 const sun=new THREE.DirectionalLight(0xffddad,3.2);sun.position.set(9,16,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;sun.shadow.normalBias=.035;scene.add(sun);
 // High windows and steel roof trusses.
 const glow=new THREE.MeshBasicMaterial({color:0xb8dbdc});
 for(let z=-24;z<10;z+=7){box(.08,2.3,4.8,-14.66,6.6,z,glow);box(.12,.08,4.9,-14.55,6.6,z,steel);box(.12,2.4,.08,-14.55,6.6,z,steel);box(30,.34,.28,0,8.3,z,steel);for(const x of [-14.5,14.5])box(.32,8.5,.4,x,4.2,z,steel);box(5,.06,.2,0,8,z,glow);}
 for(let z=-25;z<10;z+=5){box(29,.014,.025,0,.015,z,mat(0x444e49));}
 const lineMat=mat(0xc7a65f);
 for(const x of [-10,-3.35,3.35,10])box(.045,.025,33,x,.025,-10,lineMat);
 box(21,.025,.1,0,.03,1,lineMat);box(21,.025,.08,0,.03,3,lineMat);
 for(let i=0;i<20;i++){const stripe=box(.65,.026,.16,-9.7+i*1.02,.03,1.55,lineMat);stripe.rotation.y=-.65;}
 sign('R A N G E   /   0 1',14,3.5,0,6.4,-28.65,88);
 sign('PRECISION IS A PRACTICE',9,1.3,0,4.1,-28.64,42,'#c49c60');
 for(let i=0;i<3;i++){const x=(i-1)*6.7;sign(`0${i+1}   /   ${[10,15,20][i]} M`,3,.75,x,3.1,-28.6,66,'#dfb571');}
 // Three stepped bottle racks with metal legs.
 const spawnPoints=[];
 for(let lane=0;lane<3;lane++){
   const x=(lane-1)*6.7, z=-[10,16,22][lane];
   for(let row=0;row<2;row++){
     const zz=z-row*1.6, y=1.05+row*.65;
     solids.push(box(5.3,.16,.75,x,y,zz,wood));
     for(const side of [-2.3,2.3])box(.12,y,.18,x+side,y/2,zz,steel);
     box(5.2,.18,.1,x,.35,zz,steel);
     for(let b=0;b<6;b++)spawnPoints.push({x:x-2.05+b*.82,y:y+.08,z:zz,lane});
   }
 }
 // Range furnishings and backstop.
 for(let i=0;i<12;i++)box(2.25,2.2,.5,-12.5+i*2.27,1.1,-27.9,mat(i%2?0x34403c:0x3d4942));
 for(const x of [-12,12]){for(let i=0;i<3;i++)box(1.8,1.1,1.5,x,.55+i*1.13,-23+(i%2)*.2,wood);}
 for(const x of [-6.7,0,6.7]){box(4.4,.12,.8,x,.95,4.1,wood);for(const dx of [-1.9,1.9])box(.12,.95,.65,x+dx,.475,4.1,steel);}
 sign('SAFETY FIRST  /  KEEP YOUR AIM DOWNRANGE',7,.65,0,3.1,11.7,40);
 // Bottles share materials; every broken target produces short lived shards.
 const glassMats=[0x57836c,0x749b87,0x9b7848].map(c=>new THREE.MeshPhysicalMaterial({color:c,roughness:.18,metalness:.12,transparent:true,opacity:.78,clearcoat:1}));
 const bottleGeo=new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.13,.01),new THREE.Vector2(.145,.06),new THREE.Vector2(.145,.43),new THREE.Vector2(.13,.49),new THREE.Vector2(.065,.59),new THREE.Vector2(.057,.78),new THREE.Vector2(.07,.79),new THREE.Vector2(.07,.83),new THREE.Vector2(0,.83)],16);
 const capMat=mat(0xa8a99c,.35,.7),labelMat=mat(0xc4b78d);
 function spawnBottle(p){const group=new THREE.Group();group.position.set(p.x,p.y,p.z);scene.add(group);const mesh=new THREE.Mesh(bottleGeo,glassMats[p.lane]);mesh.castShadow=true;group.add(mesh);cyl(.071,.071,.035,0,.83,0,capMat,group);cyl(.146,.146,.17,0,.27,0,labelMat,group);const target={group,mesh,p,alive:true};group.traverse(c=>{if(c.isMesh)c.userData.target=target;});bottles.push(target);}
 function resetTargets(){for(const b of bottles){scene.remove(b.group);b.group.traverse(c=>{if(c.isMesh&&c.geometry!==bottleGeo)c.geometry.dispose();});}bottles.length=0;spawnPoints.forEach(spawnBottle);for(const d of debris)scene.remove(d.mesh);debris.length=0;}
 resetTargets();
 // View model, attached to camera and independently animated.
 const gun=new THREE.Group();gun.scale.setScalar(.65);camera.add(gun);const gunmetal=mat(0x293036,.32,.78),gunEdge=mat(0x596064,.35,.8);
 const weaponLight=new THREE.PointLight(0xc5d8db,1.5,3);weaponLight.position.set(.1,.5,.1);camera.add(weaponLight);
 box(.16,.19,.66,.0,0,-.08,gunmetal,gun);box(.13,.13,.48,0,.025,-.59,gunmetal,gun);box(.035,.035,.85,0,.125,-.22,gunEdge,gun);
 const barrel=cyl(.025,.028,.35,0,.03,-.99,gunEdge,gun);barrel.rotation.x=Math.PI/2;
 const muzzle=cyl(.042,.036,.1,0,.03,-1.18,gunmetal,gun);muzzle.rotation.x=Math.PI/2;
 box(.12,.13,.35,0,-.015,.41,rubber,gun);box(.18,.23,.07,0,-.025,.61,gunmetal,gun);
 const grip=box(.095,.26,.12,0,-.2,.07,rubber,gun);grip.rotation.x=-.27;
 const magazine=box(.11,.31,.18,0,-.23,-.17,gunmetal,gun);magazine.rotation.x=.17;
 for(let i=0;i<6;i++){box(.155,.018,.025,0,.1,-.39-i*.07,gunEdge,gun);box(.008,.06,.035,.084,.015,-.4-i*.07,rubber,gun);}
 box(.06,.09,.05,0,.19,.14,gunmetal,gun);box(.035,.09,.04,0,.19,-.76,gunmetal,gun);
 const skin=mat(0x8d775e),glove=mat(0x3c423b);
 const arm=box(.14,.15,.42,.12,-.17,.35,glove,gun);arm.rotation.y=-.22;const hand=box(.14,.14,.18,-.05,-.13,-.46,glove,gun);hand.rotation.z=.3;
 const flash=new THREE.Mesh(new THREE.ConeGeometry(.13,.4,6),new THREE.MeshBasicMaterial({color:0xffdc84,transparent:true,opacity:.9}));flash.rotation.x=-Math.PI/2;flash.position.set(0,.03,-1.38);flash.visible=false;gun.add(flash);
 const flashLight=new THREE.PointLight(0xffba55,0,5);flashLight.position.set(0,.1,-1.1);gun.add(flashLight);
 const raycaster=new THREE.Raycaster(),clock=new THREE.Clock();
 let yaw=0,pitch=0,vy=0,grounded=true,playing=false,locked=false,fallback=false,finished=false,mode='free',ammo=30,reloading=false,reloadTime=0,shots=0,hits=0,remaining=60,elapsed=0,lastShot=-10,trigger=false,ads=false,recoil=0,hitTime=0,feedbackTime=0,flashTime=0,resetTime=-1,audioCtx,soundOn=true;
 const active=()=>playing&&(locked||fallback);
 let best=0;try{best=Number(localStorage.getItem('range01-best')||0);}catch(e){}
 const player=new THREE.Vector3(0,1.7,7); const motion=new THREE.Vector3();
 function audio(kind){if(!soundOn)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const t=audioCtx.currentTime;const len=kind==='shot'?.16:kind==='glass'?.22:.12;const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*len,audioCtx.sampleRate), data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,kind==='glass'?1.5:3);const src=audioCtx.createBufferSource();src.buffer=buffer;const filter=audioCtx.createBiquadFilter();filter.type=kind==='glass'?'highpass':'lowpass';filter.frequency.value=kind==='glass'?2200:kind==='shot'?1800:600;const gain=audioCtx.createGain();gain.gain.value=kind==='shot'?.22:kind==='glass'?.12:.09;src.connect(filter).connect(gain).connect(audioCtx.destination);src.start();if(kind==='shot'){const osc=audioCtx.createOscillator(),g=audioCtx.createGain();osc.frequency.setValueAtTime(115,t);osc.frequency.exponentialRampToValueAtTime(40,t+.11);g.gain.setValueAtTime(.17,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);osc.connect(g).connect(audioCtx.destination);osc.start();osc.stop(t+.13);}}catch(e){}}
 function updateHUD(){$('hits').textContent=String(hits).padStart(2,'0');$('accuracy').textContent=shots?Math.round(hits/shots*100)+'%':'—';$('ammo').textContent=String(ammo).padStart(2,'0');$('ammo-bar').style.width=(ammo/30*100)+'%';$('timer').textContent=mode==='free'?'∞':String(Math.ceil(remaining)).padStart(2,'0');}
 function feedback(text){$('feedback').textContent=text;feedbackTime=1.2;}
 const shardGeo=new THREE.TetrahedronGeometry(.07);
 function breakBottle(b,point){b.alive=false;scene.remove(b.group);hits++;hitTime=.13;audio('glass');feedback('命中  +1');for(let i=0;i<13;i++){const mesh=new THREE.Mesh(shardGeo,glassMats[b.p.lane]);mesh.position.copy(point).add(new THREE.Vector3((Math.random()-.5)*.16,(Math.random()-.5)*.4,0));mesh.scale.set(.4+Math.random(),.4+Math.random()*2,.4+Math.random());scene.add(mesh);debris.push({mesh,v:new THREE.Vector3((Math.random()-.5)*3,1+Math.random()*3,(Math.random()-.5)*3),life:2.3});}if(bottles.every(b=>!b.alive)){resetTime=1.5;feedback('全部清空 · 正在补充靶子');}}
 function shoot(){if(!active()||reloading||elapsed-lastShot<.105)return;lastShot=elapsed;if(ammo<=0){audio('empty');reload();return;}ammo--;shots++;audio('shot');flashTime=.045;recoil=Math.min(recoil+.045,.14);
   const spread=ads?.0007:.0025+(motion.length()>.5?.009:0);raycaster.setFromCamera(new THREE.Vector2((Math.random()-.5)*spread,(Math.random()-.5)*spread),camera);
   const targetMeshes=bottles.filter(b=>b.alive).flatMap(b=>b.group.children);const intersects=raycaster.intersectObjects([...targetMeshes,...solids],false);let point=raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction,50);
   if(intersects.length){const hit=intersects[0];point=hit.point;const b=hit.object.userData.target;if(b?.alive)breakBottle(b,point);else{const mark=new THREE.Mesh(new THREE.CircleGeometry(.035,8),new THREE.MeshBasicMaterial({color:0x1e2523,transparent:true,opacity:.75,depthWrite:false}));mark.position.copy(point).addScaledVector(hit.face.normal,.012);mark.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),hit.face.normal);scene.add(mark);marks.push(mark);if(marks.length>70){const old=marks.shift();scene.remove(old);old.geometry.dispose();old.material.dispose();}}}
   const origin=new THREE.Vector3(.3,-.24,-1.3).applyMatrix4(camera.matrixWorld);const geo=new THREE.BufferGeometry().setFromPoints([origin,point]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xf4d799,transparent:true,opacity:.4}));scene.add(line);tracers.push({line,life:.045});pitch=Math.min(1.25,pitch+(ads?.003:.007));updateHUD();
 }
 function reload(){if(!playing||reloading||ammo===30)return;reloading=true;reloadTime=1.65;trigger=false;$('reload').style.display='block';$('reload').querySelector('i').style.animation='none';void $('reload').offsetWidth;$('reload').querySelector('i').style.animation='';audio('reload');}
 function enableFallback(){if(!playing)return;fallback=true;$('pause').hidden=true;feedback('兼容模式 · 按住右键拖动视角 / 方向键微调');document.querySelector('.controls span:nth-child(2)').innerHTML='<kbd>鼠标</kbd> 左键射击 / 右键拖动视角';}
 function lock(){try{const p=renderer.domElement.requestPointerLock();if(p?.catch)p.catch(enableFallback);}catch(e){enableFallback();}}
 document.addEventListener('pointerlockerror',enableFallback);
 function start(){playing=true;finished=false;ammo=30;shots=hits=0;remaining=60;reloading=false;reloadTime=0;resetTime=-1;elapsed=0;lastShot=-10;player.set(0,1.7,7);yaw=0;pitch=0;vy=0;grounded=true;resetTargets();$('menu').hidden=true;$('results').hidden=true;$('pause').hidden=true;$('hud').hidden=false;$('reload').style.display='none';$('timer-label').textContent=mode==='free'?'自由练习':'剩余秒数';$('mode-label').textContent=mode==='free'?'自由练习':'限时挑战';gun.visible=true;updateHUD();lock();}
 function back(){playing=false;finished=false;fallback=false;trigger=false;ads=false;document.exitPointerLock?.();$('menu').hidden=false;$('pause').hidden=true;$('results').hidden=true;$('hud').hidden=true;gun.visible=false;}
 function finish(){finished=true;playing=false;trigger=false;best=Math.max(best,hits);try{localStorage.setItem('range01-best',String(best));}catch(e){}document.exitPointerLock?.();$('results').hidden=false;$('result-hits').textContent=hits;$('result-accuracy').textContent=(shots?Math.round(hits/shots*100):0)+'%';$('result-best').textContent=best;$('result-copy').textContent=`60 秒内发射 ${shots} 发子弹。${hits>=30?'手感火热，继续保持。':'保持节奏，让下一发更精准。'}`;}
 document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode').forEach(el=>el.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode;});
 $('start').onclick=start;$('again').onclick=start;$('resume').onclick=lock;$('back').onclick=back;$('result-back').onclick=back;$('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent='声音 '+(soundOn?'开':'关');};
 document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;if(locked){fallback=false;document.querySelector('.controls span:nth-child(2)').innerHTML='<kbd>鼠标</kbd> 射击 / 右键瞄准';}keys.clear();trigger=false;ads=false;motion.set(0,0,0);if(playing&&!finished)$('pause').hidden=locked;});
 document.addEventListener('mousemove',e=>{if(!active()||(!locked&&!ads))return;const sensitivity=ads?.00115:.002;yaw-=e.movementX*sensitivity;pitch=Math.max(-1.25,Math.min(1.25,pitch-e.movementY*sensitivity));});
 document.addEventListener('keydown',e=>{if(!active())return;if(['Space','KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&fallback){fallback=false;trigger=false;ads=false;keys.clear();$('pause').hidden=false;return;}keys.add(e.code);if(e.code==='KeyR')reload();if(e.code==='KeyT'&&!e.repeat){resetTargets();resetTime=-1;feedback('靶子已重置');}if(e.code==='Space'&&grounded){vy=5.1;grounded=false;}});
 document.addEventListener('keyup',e=>keys.delete(e.code));document.addEventListener('mousedown',e=>{if(!active()||e.target.closest('button'))return;if(e.button===0){trigger=true;shoot();}if(e.button===2)ads=true;});document.addEventListener('mouseup',e=>{if(e.button===0)trigger=false;if(e.button===2)ads=false;});document.addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener('blur',()=>{keys.clear();trigger=false;ads=false;if(locked)document.exitPointerLock?.();if(fallback){fallback=false;$('pause').hidden=!playing;}});
 renderer.domElement.addEventListener('click',()=>{if(playing&&!locked&&!fallback)lock();});
 function collides(x,z){if(x<-13.8||x>13.8||z>10.8||z<-26.5)return true;for(const obstacle of solids){const s=obstacle.geometry.parameters;if(s.height>3)continue;const p=obstacle.position;if(player.y-1.6<p.y+s.height/2&&Math.abs(x-p.x)<s.width/2+.28&&Math.abs(z-p.z)<s.depth/2+.28)return true;}return false;}
 function update(dt){elapsed+=dt;
   if(active()){if(mode==='timed'){remaining=Math.max(0,remaining-dt);$('timer').textContent=String(Math.ceil(remaining)).padStart(2,'0');if(remaining===0){finish();return;}}
     if(fallback){yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*.65;pitch=Math.max(-1.25,Math.min(1.25,pitch+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt*.45));}
     const forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),speed=ads?2.1:keys.has('ShiftLeft')||keys.has('ShiftRight')?6:3.7;
     const len=Math.hypot(forward,side)||1;motion.set((side*Math.cos(yaw)-forward*Math.sin(yaw))/len*speed,0,(-side*Math.sin(yaw)-forward*Math.cos(yaw))/len*speed);
     const nx=player.x+motion.x*dt,nz=player.z+motion.z*dt;if(!collides(nx,player.z))player.x=nx;if(!collides(player.x,nz))player.z=nz;
     vy-=13*dt;player.y+=vy*dt;if(player.y<=1.7){player.y=1.7;vy=0;grounded=true;}
     if(trigger)shoot();if(reloading){reloadTime-=dt;if(reloadTime<=0){reloading=false;ammo=30;$('reload').style.display='none';updateHUD();audio('reload');}}
     if(resetTime>0){resetTime-=dt;if(resetTime<=0)resetTargets();}
     camera.position.copy(player);camera.position.y+=grounded&&motion.length()>.1?Math.sin(elapsed*10)*.025:0;camera.rotation.set(pitch,yaw,0);
     $('stance').textContent=reloading?'换弹中':ads?'瞄准 / 精准射击':motion.length()>.1?'移动 / '+(speed>4?'奔跑':'行进'):'站立 / 就绪';
   }else if(!playing&&!finished){camera.position.set(10.8,4.1,9);camera.lookAt(-1,1.4,-15);gun.visible=false;}
   recoil=THREE.MathUtils.damp(recoil,0,14,dt);const aim=ads?1:0;const bob=playing&&locked&&motion.length()>.1?Math.sin(elapsed*10)*.007:0;
   gun.position.lerp(new THREE.Vector3(.29*(1-aim),-.28+aim*.065+bob,-.46+recoil),1-Math.exp(-15*dt));gun.rotation.set(recoil*1.3+(reloading?Math.sin((1.65-reloadTime)/1.65*Math.PI)*-.5:0),0,reloading?Math.sin((1.65-reloadTime)/1.65*Math.PI)*-.4:0);
   camera.fov=THREE.MathUtils.damp(camera.fov,ads?51:72,13,dt);camera.updateProjectionMatrix();flashTime-=dt;flash.visible=flashTime>0;flash.rotation.y=Math.random()*Math.PI;flashLight.intensity=flashTime>0?3:0;
   hitTime-=dt;$('hitmarker').style.opacity=hitTime>0?'1':'0';feedbackTime-=dt;$('feedback').style.opacity=feedbackTime>0?'1':'0';$('crosshair').style.setProperty('--gap',(ads?4:7+recoil*90+motion.length()*.5)+'px');
   for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.life-=dt;d.v.y-=9*dt;d.mesh.position.addScaledVector(d.v,dt);d.mesh.rotation.x+=dt*4;d.mesh.rotation.z+=dt*3;if(d.mesh.position.y<.03){d.mesh.position.y=.03;d.v.y*=-.25;d.v.x*=.8;d.v.z*=.8;}if(d.life<0){scene.remove(d.mesh);debris.splice(i,1);}}
   for(let i=tracers.length-1;i>=0;i--){const t=tracers[i];t.life-=dt;if(t.life<0){scene.remove(t.line);t.line.geometry.dispose();t.line.material.dispose();tracers.splice(i,1);}}
 }
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 function animate(){requestAnimationFrame(animate);update(Math.min(clock.getDelta(),.04));renderer.render(scene,camera);}animate();
 // Small read-only diagnostic surface for local smoke checks.
 window.rangeDebug={getState:()=>({playing,locked,mode,ammo,shots,hits,remaining,targets:bottles.filter(b=>b.alive).length,position:player.toArray(),reloading}),renderer,scene,camera};
})();
