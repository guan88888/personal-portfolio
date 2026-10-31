'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Reuse the original Neural background without importing its page styling.
const ambientVideo = $('#ambient-video');
ambientVideo.muted = true;
let ambientUnavailable = false;
function syncAmbientVideo() {
  const shouldPause = reducedMotion.matches || document.hidden || !!$('dialog[open]');
  if (shouldPause || ambientUnavailable) {
    ambientVideo.pause();
    if (reducedMotion.matches || ambientUnavailable) ambientVideo.style.visibility = 'hidden';
    else ambientVideo.style.visibility = 'visible';
  } else {
    ambientVideo.style.visibility = 'visible';
    if (ambientVideo.paused) {
      const playback = ambientVideo.play();
      if (playback) playback.catch(() => { /* Autoplay may be restricted; poster remains visible. */ });
    }
  }
}
ambientVideo.addEventListener('error', () => { ambientUnavailable = true; syncAmbientVideo(); });
ambientVideo.addEventListener('loadeddata', syncAmbientVideo);
ambientVideo.addEventListener('play', () => {
  if (reducedMotion.matches || document.hidden || $('dialog[open]')) syncAmbientVideo();
});
document.addEventListener('visibilitychange', syncAmbientVideo);
reducedMotion.addEventListener('change', syncAmbientVideo);
// Some browsers defer media-query change events during video playback.
setInterval(syncAmbientVideo, 1000);
new MutationObserver(syncAmbientVideo).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
syncAmbientVideo();

const projects = {
  lowair: {
    title: '低空经济', category: '行业应用 / 产品开发', image: 'lowair-cover', cover: 'cover-air',
    description: '一个围绕无人机行业的综合应用。我希望把原本分散的培训、工作、设备交易和行业信息连接起来，让用户能在一个地方找到需要的服务。',
    features: [
      ['从学习到工作', '培训机构、预约试听、学习与考试，以及招聘、临时任务和履约流程。'],
      ['交易与社区', '无人机与配件、设备租赁、订单，还有知识分享、行业社区和消息。'],
      ['AI 与飞行服务', '结合 AI 助手、搜索、地图和天气，让行业信息更容易找到。'],
      ['完整产品思考', '兼顾普通用户与企业，设计账户权限、多语言、视觉主题和后端接口。'],
    ], note: '前端 uni-app / 后端 FastAPI。部分真实服务仍需供应商接入。',
  },
  stargate: {
    title: '星门纪元：银河分裂', category: '策略游戏 / 世界构建', image: 'stargate-cover', cover: 'cover-space',
    description: '这是我为热爱策略游戏的自己创造的银河。选择阵营、探索随机星图、经营家园，再让自己的舰队驶向下一场战斗。项目从离线网页桌游，逐步扩展为 Godot 2D 游戏。',
    features: [
      ['每一局都有不同', '随机星图、事件和阵营决策，让扩张、进攻与结盟拥有不同的可能。'],
      ['属于自己的舰队', '建造、升级、升星和部署战舰，搭配卡池补给与材料奖励。'],
      ['战场以外的世界', '家园建筑、资源产出、副本远征和阵营功勋，把战役连接成持续的成长。'],
      ['和真人较量', '支持 ENet 地址直连单挑，让玩家各自选择阵营，进行回合对战。'],
    ], note: '网页离线版与 Godot 2D 版。真人对战使用地址直连。',
  },
  capsule: {
    title: '时空胶囊', category: '生活应用 / 创意设计', image: 'capsule-cover', cover: 'cover-capsule',
    description: '如果未来的自己，可以收到今天写下的一句话，会是什么感觉？时空胶囊想为目标、心情与回忆留一个位置，让记录多一点仪式感，也让成长变得看得见。',
    features: [
      ['封存当下', '用目标胶囊、心境胶囊、感恩胶囊和共享胶囊，承载不同的记忆。'],
      ['留给未来', '围绕未来开启与成长回顾，设计一个与自己对话的数字空间。'],
      ['让记录更轻松', '探索 AI 标题、标签与回顾建议，减少整理文字的负担。'],
      ['从创意到表达', '梳理用户需求、产品价值和使用场景，并制作创意展示网页。'],
    ], note: '展示内容包含产品创意、方案与应用工程探索。',
  },
  snake: {
    title: '贪吃蛇小游戏', category: '经典重制 / 交互体验', image: 'snake-cover', cover: 'cover-snake',
    description: '熟悉的方向键、越来越长的蛇，还有那句“再来一局”。从一个简单的经典玩法出发，我尝试把规则、交互和反馈连成真正可以玩的游戏。',
    features: [
      ['容易开始', '控制方向、吃掉食物、增长身体，挑战更高的分数。'],
      ['亲手实现规则', '处理移动、食物生成、身体增长和碰撞，让每次操作都有明确反馈。'],
      ['电脑与触屏', '方向键或 WASD 操作，同时提供手机上的触控方向按钮。'],
      ['现在就能玩', '作品集内置重新制作的展示版，支持暂停、重新开始和逐渐加速。'],
    ], note: '这里的试玩是为作品集重新制作的展示版。',
  },
};

// Fixed image names keep future image replacement independent from page code.
function mountImage(slot) {
  const key = slot.dataset.image;
  const formats = ['webp', 'jpg', 'png', 'jpeg'];
  let attempt = 0;
  const img = new Image();
  img.className = 'slot-image';
  img.alt = slot.dataset.alt || '项目展示图片';
  img.decoding = 'async';
  img.onload = () => { slot.append(img); slot.classList.add('has-image'); };
  img.onerror = () => {
    attempt += 1;
    if (attempt < formats.length) img.src = `images/${key}.${formats[attempt]}`;
  };
  img.src = `images/${key}.${formats[0]}`;
}
$$('.image-slot').forEach(mountImage);

// Optional private authoring surface: append ?edit=1 to preview local images.
const previewImages = new Map();
if (new URLSearchParams(location.search).get('edit') === '1') {
  const editor = document.createElement('dialog');
  editor.setAttribute('aria-label', '本机图片预览');
  editor.innerHTML = `<div class="dialog-header"><span>本机图片预览</span><button class="icon-button" aria-label="关闭图片预览"><img class="icon" src="assets/icons/x.svg" alt=""></button></div><div class="image-manager"><p>选图后会立即在当前页面预览。正式保存时，请将原图按下列文件名放入 images 文件夹。预览不会自动写入电脑文件。</p>${[['lowair-cover','低空经济'],['stargate-cover','星门纪元'],['capsule-cover','时空胶囊'],['snake-cover','贪吃蛇'],['portrait','个人照片']].map(([key,label])=>`<div class="image-control"><label for="upload-${key}">${label}<small>${key}.jpg / png / webp</small></label><input id="upload-${key}" type="file" accept="image/jpeg,image/png,image/webp" data-preview-key="${key}"></div>`).join('')}<div class="image-manager-status" role="status"></div></div>`;
  document.body.append(editor);
  const editButton = document.createElement('button'); editButton.className = 'image-edit-button'; editButton.textContent = '管理图片';
  $('.site-footer').append(editButton); editButton.addEventListener('click', () => editor.showModal());
  $('.icon-button', editor).addEventListener('click', () => editor.close());
  $$('input', editor).forEach(input => input.addEventListener('change', () => {
    const file = input.files[0]; if (!file) return;
    const status = $('.image-manager-status', editor);
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { status.textContent = '请选择 JPG、PNG 或 WebP 图片。'; return; }
    const key = input.dataset.previewKey, url = URL.createObjectURL(file), check = new Image();
    check.onload = () => {
      const old = previewImages.get(key); if (old) URL.revokeObjectURL(old);
      previewImages.set(key,url);
      $$(`[data-image="${key}"]`).forEach(slot => {
        $('.slot-image',slot)?.remove(); const img = new Image(); img.className='slot-image'; img.alt=slot.dataset.alt; img.src=url; slot.append(img); slot.classList.add('has-image');
      });
      status.textContent = '已更新当前页面预览。刷新页面后使用 images 文件夹中的图片。';
    };
    check.onerror = () => { URL.revokeObjectURL(url); status.textContent = '这张图片无法读取，请换一张试试。'; };
    check.src = url;
  }));
}

// Progressive reveal: without JavaScript, all content stays visible.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('waiting');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
if (!reducedMotion.matches) $$('.reveal').forEach(el => {
  el.classList.add('waiting');
  revealObserver.observe(el);
});

$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button)); });
  $$('.project-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) card.classList.remove('waiting');
  });
}));

const menuButton = $('.menu-toggle');
function closeMenu() { $('#mobile-nav').hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', '打开导航'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  $('#mobile-nav').hidden = !open;
});
$$('#mobile-nav a, #mobile-nav button').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('.nav-link').forEach(link => { if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  });
}, { rootMargin: '-15% 0px -45% 0px' });
['work', 'about'].forEach(id => navObserver.observe(document.getElementById(id)));

// Native dialogs provide focus containment, Escape handling and focus restoration.
const projectDialog = $('#project-dialog');
$$('[data-project]').forEach(button => button.addEventListener('click', () => {
  const p = projects[button.dataset.project];
  const sourceCover = $('.cover-fallback', button).innerHTML;
  $('#detail-content').innerHTML = `<div class="detail-body"><p class="detail-category">${p.category}</p><h2 id="detail-title">${p.title}</h2><p class="detail-description">${p.description}</p><div class="project-cover detail-media image-slot ${p.cover}" data-image="${p.image}" data-alt="${p.title}项目展示"><div class="cover-fallback">${sourceCover}</div></div><ul class="detail-features">${p.features.map(([title, text]) => `<li><h3>${title}</h3><p>${text}</p></li>`).join('')}</ul><div class="detail-footer"><p>${p.note}</p>${button.dataset.project === 'snake' ? '<button class="primary-button" id="detail-play">试玩贪吃蛇 <img class="icon" src="assets/icons/play.svg" alt=""></button>' : '<button class="text-button" id="detail-close">继续浏览作品 ↗</button>'}</div></div>`;
  mountImage($('.image-slot', $('#detail-content')));
  if (previewImages.has(p.image)) {
    const slot = $('.image-slot', $('#detail-content')), img = new Image();
    img.className = 'slot-image'; img.alt = `${p.title}项目展示`; img.src = previewImages.get(p.image); slot.append(img); slot.classList.add('has-image');
  }
  $('#detail-play')?.addEventListener('click', () => { projectDialog.close(); openGame(); });
  $('#detail-close')?.addEventListener('click', () => projectDialog.close());
  projectDialog.showModal();
  projectDialog.scrollTop = 0;
}));
$$('dialog').forEach(dialog => {
  $('.close-dialog', dialog)?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});

// A software-rendered sculptural torus. No remote models or runtime dependencies.
const sculpture = $('#sculpture');
const ctx = sculpture.getContext('2d');
let sculptureVisible = true, sculptureFrame = 0, phase = 0;
const surface = [];
const TAU = Math.PI * 2;
const stepsU = 132, stepsV = 27;
for (let i = 0; i < stepsU; i++) {
  for (let j = 0; j < stepsV; j++) {
    const u = i / stepsU * TAU, v = j / stepsV * TAU;
    const r = 1.27 + .14 * Math.cos(3 * u), tube = .46;
    const x = (r + tube * Math.cos(v)) * Math.cos(u);
    const y = (r + tube * Math.cos(v)) * Math.sin(u);
    const z = tube * Math.sin(v) + .19 * Math.sin(3 * u);
    surface.push({ x, y, z, nx: Math.cos(v) * Math.cos(u), ny: Math.cos(v) * Math.sin(u), nz: Math.sin(v), u, v });
  }
}
function rotatePoint(x, y, z, a, b) {
  const yy = y * Math.cos(a) - z * Math.sin(a), zz = y * Math.sin(a) + z * Math.cos(a);
  return [x * Math.cos(b) + zz * Math.sin(b), yy, -x * Math.sin(b) + zz * Math.cos(b)];
}
function renderSculpture() {
  const w = sculpture.clientWidth, h = sculpture.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (sculpture.width !== Math.round(w * dpr) || sculpture.height !== Math.round(h * dpr)) { sculpture.width = Math.round(w * dpr); sculpture.height = Math.round(h * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const scale = Math.min(w / 4.2, h / 4.1);
  const a = .87 + Math.sin(phase) * .09, b = -.42 + Math.sin(phase * .7) * .18;
  const points = surface.map(p => {
    const [x, y, z] = rotatePoint(p.x, p.y, p.z, a, b);
    const [nx, ny, nz] = rotatePoint(p.nx, p.ny, p.nz, a, b);
    const turn = -.5;
    const xx = x * Math.cos(turn) - y * Math.sin(turn), yy = x * Math.sin(turn) + y * Math.cos(turn);
    const perspective = 6 / (6 - z);
    const light = Math.max(0, nx * -.38 + ny * -.64 + nz * .7);
    return { x: w * .51 + xx * scale * perspective, y: h * .47 + yy * scale * perspective, z, light, u: p.u, v: p.v, front: nz };
  });
  const faces = [];
  for (let i = 0; i < stepsU; i++) for (let j = 0; j < stepsV; j++) {
    const ids = [i * stepsV + j, ((i + 1) % stepsU) * stepsV + j, ((i + 1) % stepsU) * stepsV + (j + 1) % stepsV, i * stepsV + (j + 1) % stepsV];
    faces.push({ ids, z: ids.reduce((sum, id) => sum + points[id].z, 0) / 4 });
  }
  faces.sort((a, b) => a.z - b.z);
  faces.forEach(face => {
    const p = points[face.ids[0]];
    const lum = 14 + p.light * 49 + Math.pow(p.light, 12) * 17;
    ctx.fillStyle = `hsl(140 13% ${lum}%)`;
    ctx.strokeStyle = `hsla(135, 15%, ${Math.min(lum + 13, 90)}%, .32)`;
    ctx.lineWidth = .4;
    ctx.beginPath(); face.ids.forEach((id, n) => { const q = points[id]; if (n === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
}
let lastSculptureTime = 0;
function animateSculpture(time) {
  sculptureFrame = 0;
  if (!sculptureVisible || document.hidden || reducedMotion.matches) return;
  if (time - lastSculptureTime > 44) { phase += .007; renderSculpture(); lastSculptureTime = time; }
  sculptureFrame = requestAnimationFrame(animateSculpture);
}
function startSculpture() { if (!sculptureFrame && sculptureVisible && !document.hidden && !reducedMotion.matches) sculptureFrame = requestAnimationFrame(animateSculpture); }
new ResizeObserver(() => renderSculpture()).observe(sculpture);
new IntersectionObserver(entries => { sculptureVisible = entries[0].isIntersecting; if (sculptureVisible) startSculpture(); else { cancelAnimationFrame(sculptureFrame); sculptureFrame = 0; } }).observe(sculpture);
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { cancelAnimationFrame(sculptureFrame); sculptureFrame = 0; renderSculpture(); } else startSculpture(); });
renderSculpture();

// Snake is intentionally self-contained; historical files are never overwritten.
const gameDialog = $('#game-dialog'), gameCanvas = $('#snake-canvas'), gameCtx = gameCanvas.getContext('2d');
const cells = 20, cellSize = 24;
let snake, direction, nextDirection, food, score, gameState = 'idle', timer = null, turnQueued = false;
function resetSnake() {
  clearTimeout(timer); timer = null;
  snake = [{ x: 7, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 10 }];
  direction = { x: 1, y: 0 }; nextDirection = { ...direction }; score = 0; turnQueued = false;
  $('#snake-score').textContent = '0';
  gameState = 'idle'; createFood(); drawSnake(); setOverlay('准备好了吗？', '吃掉食物，别撞到自己和边界。', '开始游戏');
  $('#pause-game').disabled = true; $('#pause-game').textContent = '暂停';
}
function createFood() {
  const free = [];
  for (let y = 0; y < cells; y++) for (let x = 0; x < cells; x++) if (!snake.some(p => p.x === x && p.y === y)) free.push({ x, y });
  food = free[Math.floor(Math.random() * free.length)] || null;
}
function drawSnake() {
  gameCtx.fillStyle = '#111a14'; gameCtx.fillRect(0, 0, 480, 480);
  gameCtx.strokeStyle = '#223428'; gameCtx.lineWidth = .5;
  for (let i = 1; i < cells; i++) { gameCtx.beginPath(); gameCtx.moveTo(i * cellSize, 0); gameCtx.lineTo(i * cellSize, 480); gameCtx.stroke(); gameCtx.beginPath(); gameCtx.moveTo(0, i * cellSize); gameCtx.lineTo(480, i * cellSize); gameCtx.stroke(); }
  snake.forEach((p, i) => { gameCtx.fillStyle = i === 0 ? '#c9f2da' : '#78b28c'; gameCtx.beginPath(); gameCtx.roundRect(p.x * cellSize + 2, p.y * cellSize + 2, 20, 20, i === 0 ? 5 : 3); gameCtx.fill(); });
  const head = snake[0];
  gameCtx.fillStyle = '#193723';
  const ex = head.x * cellSize + 12 + direction.x * 5, ey = head.y * cellSize + 12 + direction.y * 5;
  for (const offset of [-4, 4]) { gameCtx.beginPath(); gameCtx.arc(ex + (direction.y ? offset : 0), ey + (direction.x ? offset : 0), 1.6, 0, TAU); gameCtx.fill(); }
  if (food) { gameCtx.fillStyle = '#eff1ed'; gameCtx.beginPath(); gameCtx.arc(food.x * cellSize + 12, food.y * cellSize + 12, 6, 0, TAU); gameCtx.fill(); }
}
function setOverlay(title, hint, label) {
  $('#game-overlay').hidden = false; $('#game-status').textContent = title; $('#game-hint').textContent = hint;
  $('#start-game').innerHTML = `${label} <img class="icon" src="assets/icons/play.svg" alt="">`;
}
function startSnake() {
  if (gameState === 'over') resetSnake();
  gameState = 'playing'; $('#game-overlay').hidden = true; $('#pause-game').disabled = false; $('#pause-game').textContent = '暂停';
  clearTimeout(timer); timer = setTimeout(tickSnake, 150);
}
function tickSnake() {
  if (gameState !== 'playing' || !gameDialog.open) return;
  direction = { ...nextDirection }; turnQueued = false;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const eating = food && head.x === food.x && head.y === food.y;
  const body = eating ? snake : snake.slice(0, -1);
  if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells || body.some(p => p.x === head.x && p.y === head.y)) { endSnake(false); return; }
  snake.unshift(head);
  if (eating) { score += 10; $('#snake-score').textContent = String(score); createFood(); if (!food) { drawSnake(); endSnake(true); return; } } else snake.pop();
  drawSnake(); timer = setTimeout(tickSnake, Math.max(68, 155 - score * .55));
}
function endSnake(won) {
  clearTimeout(timer); gameState = 'over'; $('#pause-game').disabled = true;
  setOverlay(won ? '你填满了整个世界！' : '这一局，值得再来。', `本局得分 ${score}，继续挑战自己的记录吧。`, '再来一局');
  $('#game-announcement').textContent = `游戏结束，得分 ${score}`;
}
function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused'; clearTimeout(timer); setOverlay('休息一下。', '准备好了就继续这一局。', '继续游戏'); $('#pause-game').textContent = '继续';
  } else if (gameState === 'paused') startSnake();
}
const vectors = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
function steer(name) { const v = vectors[name]; if (!v || turnQueued || gameState !== 'playing') return; if (v.x === -direction.x && v.y === -direction.y) return; nextDirection = { ...v }; turnQueued = true; }
function openGame() { resetSnake(); gameDialog.showModal(); gameDialog.scrollTop = 0; }
$$('[data-play]').forEach(button => button.addEventListener('click', openGame));
$('#start-game').addEventListener('click', startSnake);
$('#pause-game').addEventListener('click', togglePause);
$('#restart-game').addEventListener('click', () => { resetSnake(); startSnake(); });
$$('[data-direction]').forEach(button => button.addEventListener('click', () => steer(button.dataset.direction)));
const keyDirections = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
document.addEventListener('keydown', event => {
  if (!gameDialog.open) return;
  if (keyDirections[event.key]) { event.preventDefault(); steer(keyDirections[event.key]); }
  if (event.code === 'Space' && event.target.tagName !== 'BUTTON') { event.preventDefault(); if (gameState === 'idle' || gameState === 'over') startSnake(); else togglePause(); }
});
gameDialog.addEventListener('close', () => { clearTimeout(timer); gameState = 'idle'; });
document.addEventListener('visibilitychange', () => { if (document.hidden && gameState === 'playing') togglePause(); if (!document.hidden) startSculpture(); });
resetSnake();
