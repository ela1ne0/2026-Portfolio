(function () {
  'use strict';

  const BUBBLES = [
    { key:'ibm',    emoji:'💼', title:'IBM Z DevOps',
      sub:'Designing for 10k+ enterprise engineers. Zero tolerance for confusion.',
      rx:0.54, ry:0.18, r:32, ph:0,   sp:0.007 },
    { key:'hack',   emoji:'⚡', title:'UI/UX Lead @ HackDuke',
      sub:"Duke's largest hackathon. 80% registration increase, 500+ participants.",
      rx:0.64, ry:0.28, r:27, ph:2.2, sp:0.009 },
    { key:'camera', emoji:'📷', title:'Digital photographer',
      sub:'Canon R50. Every trip becomes a photoset.',
      rx:0.58, ry:0.50, r:23, ph:0.7, sp:0.008 },
    { key:'food',   emoji:'🍜', title:'Serious foodie',
      sub:"Will research a city's restaurant scene before packing.",
      rx:0.76, ry:0.58, r:25, ph:3.0, sp:0.009 },
    { key:'music',  emoji:'🎵', title:'Playlist curator',
      sub:'Every mood gets its own playlist. Indie folk + lo-fi R&B.',
      rx:0.68, ry:0.72, r:21, ph:1.7, sp:0.008 },
  ];

  const ROTATING = [
    'tweaking her portfolio for the Nth time',
    'debugging CSS at midnight',
    'reorganizing Figma components (again)',
    'finding a new restaurant in Durham',
    'making a playlist for this exact mood',
    'asking Claude to help with the fish',
  ];

  const FISH_COLOR = '#5472AA';
  const scriptSrc = document.querySelector('script[src*="main.js"]')?.getAttribute('src') || 'main.js';
  const FISH_SVG_URL = new URL('assets/big-fish.svg', new URL(scriptSrc, location.href)).href;
  const FISH_BASE_W = 160;
  const FISH_BASE_H = FISH_BASE_W * (522 / 681);
  const HERO_FISH_H = 190;
  const FISH_TILT_MAX = 0.15;

  function clampFishTilt(t) {
    return Math.max(-FISH_TILT_MAX, Math.min(FISH_TILT_MAX, t));
  }

  const hasHover = window.matchMedia('(hover: hover)').matches;

  BUBBLES.forEach((b) => { b.scale = 1; });

  const fishImg = new Image();
  let fishImgReady = false;

  function stripFishFilter(svgString) {
    return svgString
      .replace(/<filter id="filter0_g_252_230">[\s\S]*?<\/filter>\s*/i, '')
      .replace(/\s*filter="url\(#filter0_g_252_230\)"/gi, '');
  }

  fetch(FISH_SVG_URL)
    .then((r) => r.text())
    .then(stripFishFilter)
    .then((svgString) => {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      fishImg.onload = () => {
        URL.revokeObjectURL(url);
        fishImgReady = true;
      };
      fishImg.onerror = () => URL.revokeObjectURL(url);
      fishImg.src = url;
    })
    .catch(() => {});

  const curEl = document.getElementById('fish-cur');
  let curMx = window.innerWidth / 2;
  let curMy = window.innerHeight / 2;
  let curVx = 0;
  let curVy = 0;
  let curFacingRight = true;

  if (curEl && hasHover) {
    curEl.style.left = curMx + 'px';
    curEl.style.top = curMy + 'px';

    document.addEventListener('mousemove', (e) => {
      curVx = e.clientX - curMx;
      curVy = e.clientY - curMy;
      curMx = e.clientX;
      curMy = e.clientY;
      curEl.style.left = curMx + 'px';
      curEl.style.top = curMy + 'px';

      const speed = Math.hypot(curVx, curVy);
      if (speed > 0.5) {
        curFacingRight = curVx >= 0;
        curEl.style.setProperty('--cur-flip', curFacingRight ? '-1' : '1');
      }
    });

    document.querySelectorAll('a, button, .work-card, .status-pill').forEach((el) => {
      el.addEventListener('mouseenter', () => curEl.classList.add('hovering'));
      el.addEventListener('mouseleave', () => curEl.classList.remove('hovering'));
    });
  }

  function drawFish(ctx, x, y, facingRight, tilt, scale, tailPhase, opts, spd = 0) {
    if (!fishImgReady) return;
    const ts = Math.sin(tailPhase) * (4 + spd * 5);

    ctx.save();
    ctx.translate(x, y);
    if (tilt) ctx.rotate(tilt);
    if (facingRight) {
      ctx.scale(-1, 1);
    }
    ctx.transform(1, ts * 0.001, 0, 1, 0, 0);
    ctx.scale(scale, scale);
    ctx.drawImage(fishImg, -FISH_BASE_W / 2, -FISH_BASE_H / 2, FISH_BASE_W, FISH_BASE_H);

    if (opts && opts.mouthOpen) {
      const headX = (facingRight ? 1 : -1) * FISH_BASE_W * 0.34;
      ctx.beginPath();
      ctx.arc(headX, FISH_BASE_H * 0.04, FISH_BASE_H * 0.05, 0.15, Math.PI * 0.85);
      ctx.strokeStyle = FISH_COLOR;
      ctx.lineWidth = 2.8 / scale;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  const liveTime = document.getElementById('live-time');
  if (liveTime) {
    function tick() {
      liveTime.textContent = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  const rotEl = document.getElementById('rotating-phrase');
  if (rotEl) {
    let ri = 0;
    setInterval(() => {
      rotEl.style.opacity = '0';
      setTimeout(() => {
        ri = (ri + 1) % ROTATING.length;
        rotEl.textContent = ROTATING[ri];
        rotEl.style.opacity = '1';
      }, 360);
    }, 3400);
  }

  document.querySelectorAll('.reveal').forEach((el) => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
  });

  const ambCanvas = document.getElementById('amb-canvas');
  const fishCanvas = document.getElementById('fish-canvas');
  if (!ambCanvas || !fishCanvas) return;

  const ambCtx = ambCanvas.getContext('2d');
  const fishCtx = fishCanvas.getContext('2d');
  const bubbleTip = document.getElementById('bubble-tip');
  const tipEmoji = document.getElementById('tip-emoji');
  const tipTitle = document.getElementById('tip-title');
  const tipSub = document.getElementById('tip-sub');

  let W = 0;
  let H = 0;
  let dpr = 1;
  let idleT = 0;
  let hoveredBubble = -1;

  const fish = {
    x: 0, y: 0, vx: 0, vy: 0, facingRight: true, tilt: 0, tTilt: 0, tail: 0,
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  const heroEl = document.querySelector('.hero');
  const heroVisual = fishCanvas.parentElement;

  function resize() {
    if (!heroVisual || !heroEl) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = heroVisual.clientWidth;
    H = heroVisual.clientHeight;
    if (W <= 0 || H <= 0) return;
    [ambCanvas, fishCanvas].forEach((c) => {
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.width = W + 'px';
      c.style.height = H + 'px';
    });
    ambCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fishCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (fish.x === 0) {
      fish.x = W * 0.78;
      fish.y = H * 0.72;
      fish.facingRight = false;
      fish.tilt = 0;
      fish.tTilt = 0;
    }
  }

  function getBubblePos(b) {
    let bx = b.rx * W + Math.sin(idleT * b.sp * 62 + b.ph) * 11;
    let by = b.ry * H + Math.cos(idleT * b.sp * 44 + b.ph) * 8;
    bx = Math.max(W * 0.46, bx);
    return { bx, by };
  }

  function drawPersonalityBubble(b, i) {
    const { bx, by } = getBubblePos(b);
    const isHovered = i === hoveredBubble;
    const targetScale = isHovered ? 1.13 : 1.0;
    b.scale += (targetScale - b.scale) * 0.1;
    const r = b.r * b.scale;

    if (isHovered) {
      fishCtx.beginPath();
      fishCtx.arc(bx, by, r + 10, 0, Math.PI * 2);
      fishCtx.fillStyle = 'rgba(168,216,237,0.28)';
      fishCtx.fill();
    }

    fishCtx.beginPath();
    fishCtx.arc(bx, by, r, 0, Math.PI * 2);
    fishCtx.fillStyle = 'rgba(200,232,248,0.30)';
    fishCtx.fill();
    fishCtx.strokeStyle = isHovered ? 'rgba(40,100,160,0.50)' : 'rgba(40,100,160,0.30)';
    fishCtx.lineWidth = 1.1;
    fishCtx.stroke();

    fishCtx.beginPath();
    fishCtx.arc(bx - r * 0.28, by - r * 0.30, r * 0.38, -Math.PI * 0.75, -Math.PI * 0.1);
    fishCtx.strokeStyle = 'rgba(255,255,255,0.65)';
    fishCtx.lineWidth = 1;
    fishCtx.stroke();

    fishCtx.font = Math.round(b.r * 0.7) + 'px sans-serif';
    fishCtx.textAlign = 'center';
    fishCtx.textBaseline = 'middle';
    fishCtx.fillText(b.emoji, bx, by);

    return { bx, by, r };
  }

  function drawHeroScene() {
    const spd = Math.hypot(fish.vx, fish.vy);
    fish.tail += 0.10 + spd * 0.12;
    fishCtx.clearRect(0, 0, W, H);

    let tipPos = null;
    BUBBLES.forEach((b, i) => {
      const pos = drawPersonalityBubble(b, i);
      if (i === hoveredBubble) tipPos = pos;
    });

    drawFish(fishCtx, fish.x, fish.y, fish.facingRight, fish.tilt, HERO_FISH_H / FISH_BASE_H, fish.tail, null, spd);

    if (tipPos && bubbleTip) {
      updateBubbleTip(tipPos.bx, tipPos.by, tipPos.r);
    }
  }

  function drawAmb() {
    ambCtx.clearRect(0, 0, W, H);
  }

  let mouseX = 0;
  let mouseY = 0;
  let mouseInside = false;

  function clampFish() {
    fish.x = Math.max(W * 0.36, fish.x);
    fish.y = Math.max(H * 0.10, Math.min(H * 0.90, fish.y));
  }

  function updateFish() {
    fish.x += fish.vx;
    fish.y += fish.vy;
    fish.vx *= 0.92;
    fish.vy *= 0.92;

    let tx = W * 0.68 + Math.cos(idleT * 0.38) * W * 0.14;
    let ty = H * 0.42 + Math.sin(idleT * 0.26) * H * 0.22;
    const onRight = mouseInside && mouseX > W * 0.36 && hoveredBubble === -1;
    if (onRight) {
      tx = mouseX;
      ty = mouseY;
    }

    const dx = tx - fish.x;
    const dy = ty - fish.y;
    if (onRight) {
      fish.vx = lerp(fish.vx, dx * 0.032, 0.08);
      fish.vy = lerp(fish.vy, dy * 0.032, 0.08);
    } else {
      fish.vx = lerp(fish.vx, dx * 0.012, 0.06);
      fish.vy = lerp(fish.vy, dy * 0.012, 0.06);
    }

    clampFish();

    const spd = Math.hypot(fish.vx, fish.vy);
    if (spd > 0.3) {
      fish.facingRight = fish.vx >= 0;
      fish.tTilt = clampFishTilt(Math.atan2(fish.vy, fish.vx));
    }
    fish.tilt = lerp(fish.tilt, fish.tTilt, 0.05);
  }

  function hideBubbleTip() {
    if (bubbleTip) bubbleTip.style.opacity = '0';
  }

  function updateBubbleTip(bx, by, r) {
    if (!bubbleTip || hoveredBubble < 0) return;
    const b = BUBBLES[hoveredBubble];
    if (!b) return;

    tipEmoji.textContent = b.emoji;
    tipTitle.textContent = b.title;
    tipSub.textContent = b.sub;

    const visualRect = heroVisual.getBoundingClientRect();
    let tx = visualRect.left + bx + r + 14;
    let ty = visualRect.top + by - 20;
    if (tx + 215 > window.innerWidth) tx = visualRect.left + bx - 225;
    if (ty + 90 > window.innerHeight) ty = window.innerHeight - 100;
    if (ty < 8) ty = 8;

    bubbleTip.style.left = tx + 'px';
    bubbleTip.style.top = ty + 'px';
    bubbleTip.style.opacity = '1';
  }

  function hitTestBubbles(mx, my) {
    let hit = -1;
    BUBBLES.forEach((b, i) => {
      const { bx, by } = getBubblePos(b);
      if (Math.hypot(mx - bx, my - by) < b.r + 10) hit = i;
    });
    return hit;
  }

  fishCanvas.addEventListener('mousemove', (e) => {
    const rect = fishCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseInside = true;
    hoveredBubble = hitTestBubbles(mouseX, mouseY);
    fishCanvas.style.cursor = hoveredBubble >= 0 ? 'pointer' : 'none';
    if (hoveredBubble < 0) hideBubbleTip();
  });

  fishCanvas.addEventListener('mouseleave', () => {
    mouseInside = false;
    hoveredBubble = -1;
    fishCanvas.style.cursor = 'none';
    hideBubbleTip();
  });

  function loop() {
    requestAnimationFrame(loop);
    idleT += 0.016;
    updateFish();
    drawAmb();
    drawHeroScene();
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(resize).observe(heroVisual);
  }
  loop();
})();
