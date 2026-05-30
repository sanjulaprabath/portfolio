(() => {
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const body = document.body;
  body.classList.add('locked');
  // Extra petals for loading screen
  const intro = document.querySelector('.intro');
  if (intro) {
    const cluster = document.createElement('div');
    cluster.className = 'intro-petal-cluster';
    for (let i = 0; i < 32; i++) {
      const pet = document.createElement('span');
      pet.style.left = `${Math.random() * 100}%`;
      pet.style.top = `${-10 - Math.random() * 40}%`;
      pet.style.animationDelay = `${Math.random() * -8}s`;
      pet.style.animationDuration = `${6 + Math.random() * 4}s`;
      pet.style.transform = `rotate(${Math.random() * 360}deg)`;
      cluster.appendChild(pet);
    }
    intro.appendChild(cluster);
  }

  const cursor = document.querySelector('.cursor-lantern');
  window.addEventListener('pointermove', (e) => {
    if (hasGsap && cursor) gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: .35, ease: 'power2.out' });
  });

  // Sakura petals canvas
  const canvas = document.getElementById('petals');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, petals = [], currentScene = 'home';
  const settings = {
    home:{count:95,speed:.42,wind:.62,swirl:.55},
    about:{count:72,speed:.38,wind:.45,swirl:.45},
    skills:{count:82,speed:.72,wind:.95,swirl:.82},
    services:{count:76,speed:.56,wind:.72,swirl:.75},
    work:{count:88,speed:.64,wind:.9,swirl:.7},
    process:{count:62,speed:.42,wind:.58,swirl:.55},
    contact:{count:86,speed:.33,wind:.34,swirl:.42}
  };
  function resize(){
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth*dpr); canvas.height = Math.floor(innerHeight*dpr);
    canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0); w=innerWidth; h=innerHeight; seed();
  }
  function petal(y=Math.random()*h){
    const s=settings[currentScene]||settings.home;
    return {x:Math.random()*w,y,size:5+Math.random()*13,rot:Math.random()*Math.PI,spin:(Math.random()-.5)*.035,speed:s.speed*(.55+Math.random()*1.2),wind:s.wind*(.4+Math.random()*1.3),wave:Math.random()*Math.PI*2,op:.45+Math.random()*.45};
  }
  function introFactor(){return body.classList.contains('locked') ? 1.9 : 1;}
  function seed(){const s=settings[currentScene]||settings.home;petals=Array.from({length:Math.round(s.count*introFactor())},()=>petal())}
  function adjust(){const t=Math.round((settings[currentScene]||settings.home).count*introFactor());while(petals.length<t)petals.push(petal(-30));while(petals.length>t)petals.pop()}
  function drawPetal(p){ctx.save();ctx.globalAlpha=p.op;ctx.translate(p.x,p.y);ctx.rotate(p.rot);const g=ctx.createLinearGradient(-p.size,-p.size,p.size,p.size);g.addColorStop(0,'rgba(255,235,240,.96)');g.addColorStop(.58,'rgba(244,167,185,.88)');g.addColorStop(1,'rgba(184,50,60,.55)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-p.size);ctx.bezierCurveTo(p.size*.95,-p.size*.32,p.size*.78,p.size*.68,0,p.size);ctx.bezierCurveTo(-p.size*.78,p.size*.68,-p.size*.95,-p.size*.32,0,-p.size);ctx.fill();ctx.restore()}
  function loop(){ctx.clearRect(0,0,w,h);const s=settings[currentScene]||settings.home;petals.forEach(p=>{p.wave+=.014*s.swirl;p.y+=p.speed;p.x+=p.wind+Math.sin(p.wave)*s.swirl;p.rot+=p.spin;if(p.y>h+40||p.x>w+90){Object.assign(p,petal(-40-Math.random()*90));p.x=Math.random()*w-90}drawPetal(p)});requestAnimationFrame(loop)}
  resize(); addEventListener('resize', resize); loop();

  function setScene(scene){
    currentScene = scene; body.dataset.scene = scene; adjust();
    document.querySelectorAll('.scene').forEach(el=>{
      const active = el.classList.contains(`scene-${scene}`);
      el.classList.toggle('active', active);
      if (hasGsap) gsap.to(el,{autoAlpha:active?1:0,duration:active?.9:.45,ease:'power2.out'});
    });
    document.querySelectorAll('.nav-links a,.chapter-rail a').forEach(a=>a.classList.toggle('active',a.getAttribute('href') === `#${scene}`));
  }

  function closeIntro(){
    const intro = document.querySelector('.intro');
    if(!intro || intro.classList.contains('is-hidden')) return;
    intro.classList.add('is-hidden'); body.classList.remove('locked'); adjust();
    if(hasGsap){
      gsap.to(intro,{autoAlpha:0,yPercent:-5,duration:.9,ease:'power3.inOut',onComplete:()=>intro.remove()});
      gsap.from('.hero-title span',{y:100,opacity:0,stagger:.12,duration:1.1,ease:'power4.out',delay:.12});
      gsap.from('.hero .reveal:not(.hero-title)',{y:45,opacity:0,stagger:.1,duration:.85,ease:'power3.out',delay:.45});
    } else intro.remove();
  }

  const skip = document.querySelector('.skip-button');
  const enter = document.querySelector('.enter-button');
  skip?.addEventListener('click',closeIntro); enter?.addEventListener('click',closeIntro);
  window.addEventListener('keydown',e=>{if(e.key==='Escape') closeIntro()});

  if(hasGsap){
    const tl = gsap.timeline({defaults:{ease:'power3.out'}});
    tl.to('.intro-petal',{opacity:1,duration:.35,delay:.2})
      .to('.intro-petal',{x:'63vw',y:'34vh',rotate:260,duration:2.1,ease:'sine.inOut'})
      .to('.intro-light',{opacity:1,scale:1.8,duration:1.2},'-=1.2')
      .to('.intro-standing',{opacity:.98,duration:1.2},'-=.9')
      .from('.welcome span',{y:90,opacity:0,rotateX:70,stagger:.055,duration:.72},'-=.15')
      .to('.intro-standing',{opacity:.18,duration:.45},'+=.35')
      .to('.intro-bowing',{opacity:.98,duration:.65},'-=.25')
      .to('.welcome span',{y:-38,opacity:0,rotate:()=> (Math.random()-.5)*42,stagger:.05,duration:.62,ease:'power2.in'},'+=.35')
      .to('.intro-name,.intro-role,.enter-button',{opacity:1,y:0,stagger:.14,duration:.82},'-=.1');

    gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 84%'},y:65,opacity:0,duration:.95,ease:'power3.out'}));
    gsap.utils.toArray('.reveal-left').forEach(el=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 84%'},x:-70,opacity:0,duration:.95,ease:'power3.out'}));
    gsap.utils.toArray('.reveal-right').forEach(el=>gsap.from(el,{scrollTrigger:{trigger:el,start:'top 84%'},x:70,opacity:0,duration:.95,ease:'power3.out'}));

    gsap.utils.toArray('.scene img').forEach(img=>{
      gsap.to(img,{scrollTrigger:{trigger:'main',start:'top top',end:'bottom bottom',scrub:true},y:-55,ease:'none'});
    });

    gsap.utils.toArray('.chapter').forEach(sec=>{
      ScrollTrigger.create({trigger:sec,start:'top center',end:'bottom center',onEnter:()=>setScene(sec.dataset.scene),onEnterBack:()=>setScene(sec.dataset.scene)});
    });

    ScrollTrigger.create({
      trigger:'#skills', start:'top 68%', once:true,
      onEnter:()=>{
        document.querySelectorAll('.skill-line').forEach(line=>gsap.to(line.querySelector('i'),{width:`${line.dataset.level}%`,duration:1.2,ease:'power3.out'}));
        document.querySelectorAll('[data-count]').forEach(num=>{const target=+num.dataset.count;const obj={v:0};gsap.to(obj,{v:target,duration:1.25,ease:'power2.out',onUpdate:()=>num.textContent=Math.round(obj.v)})});
      }
    });

    ScrollTrigger.create({trigger:'#contact',start:'top 70%',onEnter:()=>{gsap.fromTo('.scene-contact img',{scale:1.08,y:25},{scale:1.04,y:0,duration:1.15,ease:'power3.out'});}});
  } else {
    document.querySelectorAll('.skill-line').forEach(line=>line.querySelector('i').style.width=`${line.dataset.level}%`);
    document.querySelectorAll('[data-count]').forEach(num=>num.textContent=num.dataset.count);
    const io = new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)setScene(e.target.dataset.scene)}),{threshold:.45});
    document.querySelectorAll('.chapter').forEach(s=>io.observe(s));
  }
  setScene('home');

  // magnetic buttons
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{if(!hasGsap)return;const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.18,duration:.25,ease:'power2.out'});});
    el.addEventListener('pointerleave',()=>{if(hasGsap)gsap.to(el,{x:0,y:0,duration:.55,ease:'elastic.out(1,.35)'});});
  });

  // petal burst on interactive cards
  function burst(x,y,n=9){for(let i=0;i<n;i++){const p=petal(y+(Math.random()-.5)*50);p.x=x+(Math.random()-.5)*80;p.speed=.6+Math.random()*.9;p.wind=(Math.random()-.15)*2;p.op=.88;petals.push(p)}}
  document.querySelectorAll('.service-card,.project-card,.primary,.secondary').forEach(el=>el.addEventListener('pointerenter',()=>{const r=el.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.22,8)}));
})();

// GitHub Pages image path preflight: logs broken image paths in browser console.
window.addEventListener('load', () => {
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete || img.naturalWidth === 0) {
      console.warn('Image failed to load:', img.getAttribute('src'));
    }
  });
});
