/* =========================================================================
   AETHERFLARE — Script
   - typing effect for title
   - starfield + falling shooting stars on canvas
   - background mode toggle (gradient / particles / vignette)
   - small UX: avatar drag & drop preview (client-side)
   ========================================================================= */

/* -------------------------
   Helpers
   ------------------------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const rand = (a,b) => a + Math.random()*(b-a);

/* -------------------------
   DOM refs
   ------------------------- */
const typedEl = $('#typed');
const canvas = document.getElementById('stars-canvas');
const grdOverlay = $('#gradient-overlay');
const modeGradient = $('#modeGradient');
const modeParticles = $('#modeParticles');
const modeVignette = $('#modeVignette');
const avatarImg = $('#avatar-img');

/* -------------------------
   Typing effect
   ------------------------- */
(function typingEffect(){
  const text = 'AetherFlare';
  typedEl.textContent = '';
  let i = 0;
  const speed = 70; // ms per char
  function step(){
    if(i < text.length){
      typedEl.textContent += text[i++];
      setTimeout(step, speed + (Math.random()*40));
    } else {
      // caret will continue to blink from CSS
    }
  }
  setTimeout(step, 220); // slight delay before starting
})();

/* -------------------------
   Canvas starfield + falling stars
   - particles for background twinkles
   - occasional shooting star with tail
   ------------------------- */
(function starfield(){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth * devicePixelRatio;
  let H = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.scale(devicePixelRatio, devicePixelRatio);

  window.addEventListener('resize', () => {
    W = canvas.width = innerWidth * devicePixelRatio;
    H = canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    init();
  });

  // particles (stars)
  let stars = [];
  function init(){
    stars = [];
    const count = Math.max(80, Math.round(window.innerWidth / 12));
    for(let i=0;i<count;i++){
      stars.push({
        x: Math.random()*innerWidth,
        y: Math.random()*innerHeight,
        r: Math.random()*1.2 + 0.3,
        alpha: 0.2 + Math.random()*0.8,
        twinkle: Math.random()*0.02 + 0.01,
        drift: (Math.random()-0.5)*0.08
      });
    }
    // create a couple of initial shooting stars schedule
    scheduleShooting();
  }

  // shooting stars list
  let shootList = [];

  function spawnShootingStar(){
    const startX = Math.random()*innerWidth * 0.8 + innerWidth*0.1;
    const startY = Math.random()*innerHeight*0.4 + 10;
    const vx = -(2 + Math.random()*6);
    const vy = 0.8 + Math.random()*2.8;
    const len = 60 + Math.random()*120;
    shootList.push({x:startX, y:startY, vx, vy, len, life:0, maxLife: 80 + Math.random()*40});
  }

  function scheduleShooting(){
    setTimeout(()=>{
      spawnShootingStar();
      scheduleShooting();
    }, 2200 + Math.random()*6000);
  }

  // draw frame
  function draw(){
    ctx.clearRect(0,0, innerWidth, innerHeight);

    // subtle gradient background over dark base (canvas layer)
    const g = ctx.createLinearGradient(0,0,0,innerHeight);
    g.addColorStop(0, 'rgba(2,8,12,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,innerWidth, innerHeight);

    // draw stars (twinkling)
    for(let s of stars){
      s.alpha += (Math.random()*s.twinkle - s.twinkle*0.5);
      if(s.alpha < 0.12) s.alpha = 0.12;
      if(s.alpha > 1) s.alpha = 1;
      s.x += s.drift*0.3;
      if(s.x < -10) s.x = innerWidth + 10;
      if(s.x > innerWidth + 10) s.x = -10;
      ctx.beginPath();
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r*6);
      grad.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
      grad.addColorStop(0.6, `rgba(169,96,255,${s.alpha*0.25})`);
      grad.addColorStop(1, `rgba(20,200,255,${s.alpha*0.05})`);
      ctx.fillStyle = grad;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }

    // draw shooting stars
    for(let i=shootList.length-1;i>=0;i--){
      const sh = shootList[i];
      sh.life++;
      const progress = sh.life / sh.maxLife;
      const x = sh.x + sh.vx * sh.life;
      const y = sh.y + sh.vy * sh.life;
      const tailLen = sh.len * (1 - progress*0.9);
      // bright head
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${1 - progress})`;
      ctx.arc(x, y, 2.6, 0, Math.PI*2);
      ctx.fill();

      // tail
      const tx = x - sh.vx*tailLen*0.4;
      const ty = y - sh.vy*tailLen*0.4;
      const tailGrad = ctx.createLinearGradient(x,y, tx,ty);
      tailGrad.addColorStop(0, `rgba(255,255,255,${0.9 - progress})`);
      tailGrad.addColorStop(1, 'rgba(169,96,255,0.0)');
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      if(sh.life > sh.maxLife) shootList.splice(i,1);
    }

    requestAnimationFrame(draw);
  }

  init();
  draw();
})();

/* -------------------------
   Background mode toggle
   ------------------------- */
(function modeToggle(){
  const setPressed = (btn, val) => btn.setAttribute('aria-pressed', val ? 'true' : 'false');
  const setMode = (mode) => {
    if(mode === 'gradient'){
      $('#stars-canvas').style.display = 'none';
      $('#gradient-overlay').style.display = 'block';
      $('#bg-vignette')?.style?.display = 'none';
      setPressed(modeGradient, true); setPressed(modeParticles, false); setPressed(modeVignette, false);
    } else if(mode === 'particles'){
      $('#stars-canvas').style.display = 'block';
      $('#gradient-overlay').style.display = 'none';
      $('#bg-vignette')?.style?.display = 'none';
      setPressed(modeGradient, false); setPressed(modeParticles, true); setPressed(modeVignette, false);
    } else if(mode === 'vignette'){
      $('#stars-canvas').style.display = 'none';
      $('#gradient-overlay').style.display = 'none';
      $('#bg-vignette')?.style?.display = 'block';
      setPressed(modeGradient, false); setPressed(modeParticles, false); setPressed(modeVignette, true);
    }
    try{ localStorage.setItem('aether_mode', mode); }catch(e){}
  };

  modeGradient.addEventListener('click', ()=> setMode('gradient'));
  modeParticles.addEventListener('click', ()=> setMode('particles'));
  modeVignette.addEventListener('click', ()=> setMode('vignette'));

  // restore
  const saved = localStorage.getItem('aether_mode') || 'particles';
  setTimeout(()=> setMode(saved), 120);
})();

/* -------------------------
   Avatar drag & drop preview (client-side)
   ------------------------- */
(function avatarDrop(){
  const avatar = document.querySelector('.avatar');
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  // allow clicking avatar to choose file
  avatar.addEventListener('click', ()=> inp.click() );
  inp.addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const url = await fileToDataUrl(f);
    avatarImg.src = await cropToSquareDataUrl(url, 900);
  });

  // drag & drop
  avatar.addEventListener('dragover', e => { e.preventDefault(); avatar.style.transform = 'scale(1.02) translateY(-6px)'; });
  avatar.addEventListener('dragleave', () => { avatar.style.transform = ''; });
  avatar.addEventListener('drop', async (e) => {
    e.preventDefault();
    avatar.style.transform = '';
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if(f && f.type.startsWith('image/')){
      const url = await fileToDataUrl(f);
      avatarImg.src = await cropToSquareDataUrl(url, 900);
    }
  });

  function fileToDataUrl(file){
    return new Promise((res, rej)=>{
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  function cropToSquareDataUrl(dataUrl, size){
    return new Promise((res)=>{
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const s = size;
        canvas.width = s; canvas.height = s;
        const ctx = canvas.getContext('2d');
        // center crop
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, s, s);
        // soft vignette
        const g = ctx.createRadialGradient(s*0.5, s*0.35, s*0.1, s*0.5, s*0.5, s*0.9);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, 'rgba(0,0,0,0.12)');
        ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
        res(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    });
  }
})();

/* -------------------------
   Finish up & misc UX
   ------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ========================================================================
   Lots of comments / whitespace below to make the script easy to extend.
   You can safely remove them to reduce file size.
   ======================================================================== */

/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* End of script.js */
