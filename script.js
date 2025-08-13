const toggleTheme = document.getElementById('toggle-theme');
const body = document.body;

// Load theme from localStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    body.classList.add(currentTheme);
    toggleTheme.checked = currentTheme === 'light';
}

// Toggle theme
toggleTheme.addEventListener('change', () => {
    if (toggleTheme.checked) {
        body.classList.add('light');
        body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        generateClouds();
    } else {
        body.classList.add('dark');
        body.classList.remove('light');
        localStorage.setItem('theme', 'dark');
        generateStars();
    }
});

// Generate falling stars
function generateStars() {
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.position = 'absolute';
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.opacity = Math.random();
        star.style.animation = `falling-stars ${Math.random() * 3 + 2}s linear infinite`;
        document.body.appendChild(star);
    }
}

// Generate moving clouds
function generateClouds() {
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.width = `${Math.random() * 200 + 100}px`;
        cloud.style.height = `${Math.random() * 100 + 50}px`;
        cloud.style.position = 'absolute';
        cloud.style.top = `${Math.random() * 50}vh`;
        cloud.style.left = '100%';
        cloud.style.opacity = 0.6;
        cloud.style.animation = `moving-clouds ${Math.random() * 40 + 20}s linear infinite`;
        document.body.appendChild(cloud);
    }
}

// Initial call to generate stars or clouds based on theme
if (currentTheme === 'dark') {
    generateStars();
} else {
    generateClouds();
}
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

