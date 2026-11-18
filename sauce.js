/* =========================================================
   Sauce Bar 调料台 — a self-serve malatang sauce counter.
   Every container is drawn as SVG from the data below.
   Exposes window.SauceBar for app.js.
   ========================================================= */
(() => {
  const O = '#6b4a3a';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const f = (n) => (Math.round(n * 10) / 10).toString();

  /* ---------- deterministic randomness so art never "jumps" ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const shade = (h, k) => '#' + hex(h).map((v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))).toString(16).padStart(2, '0')).join('');

  /* ======================= DATA ======================= */
  // tex = texture recipe, c = texture colours, liq = [colour, strength] it adds to the dip,
  // bowl = [texture, amount] of bits it leaves floating in the dip.
  const BINS = [
    // back row
    { id: 'oyster', en: 'Oyster Sauce', cn: '蚝油', base: '#2b1a12', tex: 'smooth', c: { swirl: '#5a3a26' }, gloss: 1, desc: 'Savory, sweet umami glaze', spice: 0, liq: ['#2b1a12', 0.9] },
    { id: 'garlicchili', en: 'Garlic Chili Sauce', cn: '蒜蓉辣酱', base: '#df5a2a', tex: 'chunky', c: { cols: ['#fff3dc', '#f7e3bd', '#b8341a'], n: 46, r: [0.9, 2] }, gloss: 1, desc: 'Garlicky, tangy & spicy', spice: 2, liq: ['#df5a2a', 0.7], bowl: ['chunky', 0.35] },
    { id: 'choppedchili', en: 'Chopped Pickled Chili', cn: '剁椒', base: '#c81f17', tex: 'chunky', c: { cols: ['#e8321f', '#f2564a', '#a3150f', '#ff6a4f'], n: 52, r: [1.6, 3.2], seeds: ['#f6d36a', '#f9e08c'] }, gloss: 1, desc: 'Bright, salty & sour-hot', spice: 3, liq: ['#d32a1c', 0.5], bowl: ['chunky', 0.3] },
    { id: 'furu', en: 'Fermented Bean Curd Sauce', cn: '腐乳汁', base: '#d99686', tex: 'smooth', c: { swirl: '#f1c6b6' }, gloss: 1, desc: 'Funky, salty & cheesy-smooth', spice: 0, liq: ['#d99686', 0.9] },
    { id: 'chive', en: 'Chive Flower Sauce', cn: '韭花酱', base: '#55662a', tex: 'chunky', c: { cols: ['#3e4d1c', '#6f8236', '#7d8f40', '#4a5a22'], n: 60, r: [0.8, 1.8] }, gloss: 1, desc: 'Grassy, salty & pungent', spice: 0, liq: ['#55662a', 0.6], bowl: ['chunky', 0.25] },
    { id: 'shacha', en: 'Sha Cha Sauce', cn: '沙茶酱', base: '#a25a28', tex: 'chunky', c: { cols: ['#c27a3a', '#7e4219', '#e59a6a', '#f2b48a'], n: 70, r: [0.6, 1.5] }, gloss: 1, desc: 'Smoky, seafood-savory & oily', spice: 1, liq: ['#a25a28', 0.7], bowl: ['chunky', 0.25] },
    { id: 'mushroom', en: 'Mushroom Sauce', cn: '香菇酱', base: '#4a2c1a', tex: 'chunky', c: { cols: ['#7a5233', '#8e6440', '#5e3c22', '#a37850'], n: 34, r: [1.8, 3.4] }, gloss: 1, desc: 'Earthy, meaty umami', spice: 1, liq: ['#4a2c1a', 0.6], bowl: ['chunky', 0.3] },
    { id: 'beef', en: 'Beef Sauce', cn: '牛肉酱', base: '#8a3420', tex: 'chunky', c: { cols: ['#5a2414', '#6e2c18', '#b8442a', '#4a1e10'], n: 40, r: [1.6, 3] }, gloss: 1, desc: 'Meaty, chunky & spicy', spice: 2, liq: ['#8a3420', 0.6], bowl: ['chunky', 0.3] },
    // front row
    { id: 'crushedpeanut', en: 'Crushed Peanuts', cn: '花生碎', base: '#d9a457', tex: 'crushed', utensil: 'scoop', desc: 'Crunchy roasted peanut', spice: 0, bowl: ['crushed', 0.35], front: 1 },
    { id: 'garlic', en: 'Minced Garlic', cn: '蒜泥', base: '#efe5c8', tex: 'minced', c: { cols: ['#fffaf0', '#e2d4ad', '#f6eed8', '#d9c99c'] }, gloss: 1, desc: 'Sharp, punchy raw garlic', spice: 0, liq: ['#efe5c8', 0.2], bowl: ['minced', 0.3], front: 1 },
    { id: 'peanut', en: 'Peanut Sauce', cn: '花生酱', base: '#c9853a', tex: 'grainy', c: { cols: ['#b06f2a', '#dda05a', '#a8662a', '#e6ad66'] }, gloss: 1, desc: 'Sweet, roasty & thick', spice: 0, liq: ['#c9853a', 1.1], front: 1 },
    { id: 'sesame', en: 'Sesame Paste', cn: '芝麻酱', base: '#b88a5a', tex: 'smooth', c: { swirl: '#d6ae80' }, gloss: 1, utensil: 'ribbon', big: 1, desc: 'Nutty, rich & creamy: the signature dip', spice: 0, liq: ['#b88a5a', 1.3], front: 1 },
    { id: 'chilioil', en: 'Chili Oil with Flakes', cn: '红油辣子', base: '#7c1a10', tex: 'oilflakes', c: { cols: ['#5e1209', '#9e2414', '#7a180c', '#b8301a'] }, desc: 'Fragrant, toasty heat with crunchy flakes', spice: 3, liq: ['#d8321c', 0.8], bowl: ['flakes', 0.3], oil: '#e8381f', front: 1 },
    { id: 'chilicrisp', en: 'Chili Crisp', cn: '香辣脆', base: '#5a1c0f', tex: 'crisp', desc: 'Crunchy, savory & garlicky heat', spice: 2, liq: ['#6e2414', 0.4], bowl: ['crisp', 0.3], front: 1 },
    { id: 'sesameseed', en: 'Toasted Sesame Seeds', cn: '熟芝麻', base: '#ead9b2', tex: 'seeds', utensil: 'scoop', desc: 'Toasty, nutty crunch', spice: 0, bowl: ['seeds', 0.3], front: 1 },
  ];

  const SQUEEZE = [
    { id: 'sriracha', en: 'Sriracha', cn: '是拉差辣椒酱', col: '#e3421f', cap: '#3c9a4e', desc: 'Garlicky, tangy & bright', spice: 2, liq: ['#e3421f', 0.6] },
    { id: 'hotsauce', en: 'Hot Sauce', cn: '辣椒酱', col: '#e01d17', cap: '#fbf6ee', thin: 1, desc: 'Thin, vinegary & fiery', spice: 3, liq: ['#e01d17', 0.5] },
    { id: 'sweetchili', en: 'Sweet Chili Sauce', cn: '甜辣酱', col: '#f0602a', alpha: 0.72, cap: '#e8603c', flecks: ['#b8180f', '#f8d36a'], desc: 'Sweet, sticky & mildly hot', spice: 1, liq: ['#f0702e', 0.5], bowl: ['flecks', 0.25] },
    { id: 'hoisin', en: 'Hoisin Sauce', cn: '海鲜酱', col: '#4a1b15', cap: '#3b3536', desc: 'Sweet, thick & savory', spice: 0, liq: ['#4a1b15', 0.7] },
    { id: 'sesamedressing', en: 'Roasted Sesame Dressing', cn: '焙煎芝麻酱', col: '#e6d1a5', cap: '#c9a46a', desc: 'Creamy, toasty & tangy', spice: 0, liq: ['#e6d1a5', 0.6] },
    { id: 'garlicchilipaste', en: 'Garlic Chili Paste', cn: '蒜蓉辣椒', col: '#cf2f1d', cap: '#3b3536', flecks: ['#fff3dc', '#f6e6c4'], desc: 'Garlicky, salty chili kick', spice: 2, liq: ['#cf2f1d', 0.5], bowl: ['flecks', 0.2] },
    { id: 'spicymayo', en: 'Mayo-style Spicy Sauce', cn: '辣味沙拉酱', col: '#f4a468', cap: '#f8dc8c', desc: 'Creamy with a gentle kick', spice: 1, liq: ['#f4a468', 0.6] },
  ];

  const POURS = [
    { id: 'sesameoil', en: 'Toasted Sesame Oil', cn: '香油', col: '#c7832a', alpha: 0.85, desc: 'Deep, toasty sesame aroma', spice: 0, liq: ['#c7832a', 0.35], oil: '#e0a040' },
    { id: 'malaoil', en: 'Sichuan Pepper Oil', cn: '花椒油', col: '#e8c65a', alpha: 0.7, corns: '#b8321f', desc: 'Tingly, numbing Sichuan buzz', spice: 1, liq: ['#e8c65a', 0.25], oil: '#f0cf6a' },
    { id: 'greenoil', en: 'Green Sichuan Pepper Oil', cn: '藤椒油', col: '#d6dc86', alpha: 0.72, corns: '#5f8f2e', desc: 'Bright, citrusy & numbing', spice: 1, liq: ['#d6dc86', 0.25], oil: '#dfe39a' },
    { id: 'clearchilioil', en: 'Clear Chili Oil', cn: '辣椒油', col: '#e2241a', alpha: 0.75, desc: 'Clean, fragrant heat', spice: 2, liq: ['#e2241a', 0.4], oil: '#ef3b25' },
    { id: 'lightsoy', en: 'Light Soy Sauce', cn: '生抽', col: '#8a3a1a', alpha: 0.8, desc: 'Salty, savory & light', spice: 0, liq: ['#8a3a1a', 0.45] },
    { id: 'darksoy', en: 'Dark Soy Sauce', cn: '老抽', col: '#1d0f09', alpha: 0.95, desc: 'Rich, caramel-sweet & dark', spice: 0, liq: ['#1d0f09', 0.6] },
    { id: 'blackvinegar', en: 'Black Vinegar', cn: '香醋', col: '#2b170e', alpha: 0.88, desc: 'Malty, mellow & tangy', spice: 0, liq: ['#2b170e', 0.45] },
    { id: 'ricevinegar', en: 'Rice Vinegar', cn: '白醋', col: '#efecde', alpha: 0.35, desc: 'Clean, bright & sour', spice: 0, liq: ['#efecde', 0.12] },
    { id: 'scallionoil', en: 'Scallion Oil', cn: '葱油', col: '#e0ae42', alpha: 0.75, bits: 1, desc: 'Sweet, fragrant & toasty', spice: 0, liq: ['#e0ae42', 0.3], oil: '#ebbe58', bowl: ['scallionbits', 0.4] },
  ];

  const HERBS = [
    { id: 'cilantro', en: 'Cilantro', cn: '香菜', base: '#4f9a3c', tex: 'leafy', desc: 'Fresh, bright & citrusy', spice: 0 },
    { id: 'scallion', en: 'Scallions', cn: '葱花', base: '#7cbf5a', tex: 'rings', c: { cols: ['#4ea83c', '#6cc35b', '#e9f5d6', '#d8eec0'], fill: '#f3fbe8' }, desc: 'Mild, fresh oniony crunch', spice: 0 },
    { id: 'celery', en: 'Chopped Celery', cn: '芹菜末', base: '#b6d986', tex: 'cubes', c: { cols: ['#c7e59a', '#a9d47a', '#d8efb4'], edge: '#7fae55' }, desc: 'Crisp, cool & aromatic', spice: 0 },
    { id: 'redchili', en: 'Fresh Red Chili Rings', cn: '小米辣', base: '#d9281c', tex: 'chilirings', c: { cols: ['#e8261b', '#c81810', '#f2402e'] }, desc: "Fiery fresh bird's eye chili", spice: 3 },
    { id: 'greenchili', en: 'Fresh Green Chili Rings', cn: '青椒圈', base: '#5aa83a', tex: 'chilirings', c: { cols: ['#3f9a2e', '#5bb544', '#2f8a26'] }, desc: 'Fresh, grassy mild heat', spice: 1 },
    { id: 'mustard', en: 'Pickled Mustard Greens', cn: '榨菜', base: '#b8b84a', tex: 'shred', c: { cols: ['#c9c75a', '#a8a83a', '#dcd774', '#9aa33a'] }, desc: 'Salty, sour & crunchy', spice: 0 },
    { id: 'radish', en: 'Pickled Radish', cn: '萝卜干', base: '#b5844c', tex: 'cubes', c: { cols: ['#c4945a', '#a8743e', '#d2a66c'], edge: '#7d5428' }, desc: 'Sweet-salty & chewy', spice: 0 },
    { id: 'shallots', en: 'Fried Shallots', cn: '油葱酥', base: '#b9772e', tex: 'flaky', c: { cols: ['#c98636', '#a6621f', '#dda04c', '#8e521a'] }, desc: 'Crispy, sweet & savory', spice: 0 },
    { id: 'friedgarlic', en: 'Fried Garlic', cn: '蒜酥', base: '#d4a042', tex: 'flaky', c: { cols: ['#e3b553', '#c88f2e', '#efc66a', '#b87e24'] }, small: 1, desc: 'Crispy, toasty garlic', spice: 0 },
    { id: 'chives', en: 'Chopped Chives', cn: '韭菜', base: '#2e6a2c', tex: 'fine', c: { cols: ['#2f7a2e', '#3c8f38', '#235c22'] }, desc: 'Garlicky-fresh & grassy', spice: 0 },
  ];

  const DRY = [
    { id: 'salt', en: 'Salt', cn: '盐', base: '#f7f7f4', tex: 'crystals', holder: 'shaker', desc: 'Pure, clean saltiness', spice: 0 },
    { id: 'sugar', en: 'Sugar', cn: '糖', base: '#fbfbf8', tex: 'crystals', holder: 'jar', sparkle: 1, desc: 'Sweet; rounds out the heat', spice: 0 },
    { id: 'msg', en: 'MSG', cn: '味精', base: '#f5f6f6', tex: 'needles', holder: 'jar', desc: 'Pure savory umami', spice: 0 },
    { id: 'bouillon', en: 'Chicken Bouillon', cn: '鸡精', base: '#f1d98a', tex: 'granules', c: { cols: ['#f6e3a0', '#e9cc6e', '#fbeebb'] }, holder: 'jar', desc: 'Savory chicken umami', spice: 0 },
    { id: 'whitepepper', en: 'White Pepper', cn: '白胡椒粉', base: '#ebe2cc', tex: 'dust', c: { cols: ['#d9ceb2', '#f6f0e0', '#c9bd9c'] }, holder: 'shaker', desc: 'Sharp, earthy warmth', spice: 1 },
    { id: 'chilipowder', en: 'Chili Powder', cn: '辣椒面', base: '#d5502a', tex: 'flakes', c: { cols: ['#b8341a', '#e8683a', '#9e2a14', '#f08a4a'] }, holder: 'shaker', desc: 'Smoky, toasty heat', spice: 2 },
    { id: 'sichuanpowder', en: 'Sichuan Peppercorn Powder', cn: '花椒粉', base: '#8c4630', tex: 'dust', c: { cols: ['#6e3020', '#a65a3e', '#7a3a26'] }, holder: 'shaker', desc: 'Tingly & numbing', spice: 1 },
    { id: 'cumin', en: 'Cumin', cn: '孜然', base: '#9a6a3a', tex: 'cumin', holder: 'jar', desc: 'Warm, earthy & smoky', spice: 0 },
    { id: 'fivespice', en: 'Five-Spice Powder', cn: '五香粉', base: '#8a5a38', tex: 'dust', c: { cols: ['#6e4428', '#a3714a', '#7c4e2e'] }, holder: 'shaker', desc: 'Warm, sweet-spiced', spice: 0 },
  ];

  const BLENDS = [
    { id: 'classic', en: 'Classic', cn: '经典', items: ['sesame', 'garlic', 'lightsoy', 'sesameoil', 'cilantro', 'scallion'] },
    { id: 'mala', en: 'Spicy Mala', cn: '麻辣', items: ['chilioil', 'malaoil', 'garlic', 'chilipowder', 'crushedpeanut', 'cilantro'] },
    { id: 'sour', en: 'Sour & Spicy', cn: '酸辣', items: ['blackvinegar', 'chilioil', 'lightsoy', 'garlic', 'redchili', 'cilantro'] },
  ];

  // What actually sits on the counter (kept short on purpose).
  const SHOW = {
    bins: ['oyster', 'choppedchili', 'crushedpeanut', 'peanut', 'sesame', 'chilioil', 'garlic', 'sesameseed'],
    squeeze: ['sriracha', 'sweetchili', 'hoisin', 'spicymayo'],
    herbs: ['cilantro', 'scallion', 'celery', 'redchili', 'mustard', 'shallots'],
    dry: ['salt', 'sugar', 'msg', 'chilipowder', 'sichuanpowder', 'cumin'],
  };
  const ITEM = {};
  BINS.forEach((i) => (ITEM[i.id] = { ...i, kind: 'bin', motion: i.utensil === 'scoop' ? 'scoop' : 'ladle' }));
  SQUEEZE.forEach((i) => (ITEM[i.id] = { ...i, kind: 'squeeze', motion: 'squeeze', bowl: i.bowl }));
  POURS.forEach((i) => (ITEM[i.id] = { ...i, kind: 'pour', motion: 'pour', bowl: i.bowl || (i.corns ? ['corns', 0.5] : null) }));
  HERBS.forEach((i) => (ITEM[i.id] = { ...i, kind: 'herb', motion: 'tongs', bowl: [i.tex, i.small ? 0.25 : 0.32] }));
  DRY.forEach((i) => (ITEM[i.id] = { ...i, kind: 'dry', motion: i.holder === 'shaker' ? 'shake' : 'spoon', bowl: [i.tex, 0.3] }));

  /* ======================= TEXTURES ======================= */
  const dot = (x, y, r, fill, op = 1) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  function blob(x, y, r, R, fill, stroke = '') {
    const n = 5 + Math.floor(R() * 3);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + R() * 0.5;
      const rr = r * (0.55 + R() * 0.55);
      pts.push(`${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${fill}" ${stroke}/>`;
  }
  const seedS = (x, y, R, fill) =>
    `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.7" ry="0.95" transform="rotate(${Math.round(R() * 180)} ${f(x)} ${f(y)})" fill="${fill}"/>`;
  const ring = (x, y, r, stroke, w, fill = 'none') =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
  const sq = (x, y, s, R, fill, edge) =>
    `<rect x="${f(x - s / 2)}" y="${f(y - s / 2)}" width="${f(s)}" height="${f(s)}" rx="${f(s * 0.2)}" fill="${fill}" stroke="${edge}" stroke-width=".5" transform="rotate(${Math.round(R() * 90)} ${f(x)} ${f(y)})"/>`;

  function tex(kind, c, R, pt, scale = 1) {
    let s = '';
    const pick = (a) => a[Math.floor(R() * a.length)];
    const N = (k) => Math.max(1, Math.round(k * scale));
    const rep = (n, fn) => { for (let i = 0; i < n; i++) { const p = pt(R); s += fn(p.x, p.y); } };
    switch (kind) {
      case 'smooth':
        rep(N(4), (x, y) => `<path d="M${f(x - 12)} ${f(y)} q6 -${f(2 + R() * 3)} 12 0 t12 0" fill="none" stroke="${c.swirl}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`);
        break;
      case 'grainy':
        rep(N(90), (x, y) => dot(x, y, 0.45 + R() * 0.7, pick(c.cols)));
        break;
      case 'flakes':
        rep(N(46), (x, y) => blob(x, y, 1 + R() * 1.8, R, pick(c.cols)));
        rep(N(12), (x, y) => seedS(x, y, R, '#f2dfb0'));
        break;
      case 'crisp':
        rep(N(30), (x, y) => blob(x, y, 1.8 + R() * 2.6, R, pick(['#a8331c', '#4a140a', '#c2481f', '#8a2412'])));
        rep(N(12), (x, y) => blob(x, y, 1.1 + R() * 1.4, R, pick(['#f0cc80', '#e2b05c'])));
        rep(N(6), (x, y) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="3.1" ry="2.3" fill="#d2a25a" stroke="#7a5a33" stroke-width=".8" transform="rotate(${Math.round(R() * 180)} ${f(x)} ${f(y)})"/>`);
        break;
      case 'minced':
        rep(N(110), (x, y) => blob(x, y, 0.7 + R() * 1.2, R, pick(c.cols)));
        break;
      case 'chunky':
        rep(N(c.n || 30), (x, y) => blob(x, y, c.r[0] + R() * (c.r[1] - c.r[0]), R, pick(c.cols)));
        if (c.seeds) rep(N(18), (x, y) => seedS(x, y, R, pick(c.seeds)));
        break;
      case 'crushed':
        rep(N(55), (x, y) => blob(x, y, 1.7 + R() * 2.2, R, pick(['#e8bb72', '#c98f45', '#f3d59c', '#d9a457', '#b97c36']), 'stroke="#a5703a" stroke-width=".4"'));
        rep(N(14), (x, y) => dot(x, y, 0.6, '#8a4a2a'));
        break;
      case 'seeds':
        rep(N(150), (x, y) => seedS(x, y, R, R() < 0.18 ? '#2a2422' : pick(['#f6ecd2', '#ecdcb4', '#fff7e4', '#e2c894'])));
        break;
      case 'leafy':
        rep(N(30), (x, y) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2.2 + R() * 1.6)}" ry="${f(1.4 + R() * 0.8)}" transform="rotate(${Math.round(R() * 180)} ${f(x)} ${f(y)})" fill="${pick(['#3f9a3e', '#56b24a', '#2f8a3a', '#68c05a'])}"/>`);
        rep(N(10), (x, y) => `<path d="M${f(x)} ${f(y)} l${f(R() * 6 - 3)} ${f(R() * 4 + 2)}" stroke="#a6d77a" stroke-width="1" stroke-linecap="round"/>`);
        break;
      case 'rings':
        rep(N(30), (x, y) => ring(x, y, 1.5 + R() * 1.2, pick(c.cols), 1.1, c.fill));
        break;
      case 'cubes':
        rep(N(34), (x, y) => sq(x, y, 2.1 + R() * 1.3, R, pick(c.cols), c.edge));
        break;
      case 'chilirings':
        rep(N(22), (x, y) => ring(x, y, 1.9 + R(), pick(c.cols), 1.4, '#fbe7c6') + dot(x + 0.4, y - 0.3, 0.55, '#f6d36a') + dot(x - 0.6, y + 0.4, 0.5, '#f6d36a'));
        break;
      case 'shred':
        rep(N(36), (x, y) => `<path d="M${f(x - 3.5)} ${f(y)} q3.5 -${f(1 + R() * 2)} 7 0" fill="none" stroke="${pick(c.cols)}" stroke-width="1.5" stroke-linecap="round" transform="rotate(${Math.round(R() * 180)} ${f(x)} ${f(y)})"/>`);
        break;
      case 'flaky':
        rep(N(40), (x, y) => blob(x, y, 1.2 + R() * 2, R, pick(c.cols)));
        break;
      case 'fine':
        rep(N(50), (x, y) => `<path d="M${f(x)} ${f(y)} l${f(R() * 3 - 1.5)} ${f(1.8 + R() * 1.6)}" stroke="${pick(c.cols)}" stroke-width="1.3" stroke-linecap="round"/>`);
        break;
      case 'dust':
        rep(N(110), (x, y) => dot(x, y, 0.35 + R() * 0.5, pick(c.cols)));
        break;
      case 'crystals':
        rep(N(60), (x, y) => sq(x, y, 0.9 + R() * 0.8, R, '#ffffff', '#c3cdd5'));
        rep(N(6), (x, y) => `<path d="M${f(x)} ${f(y - 1.8)} v3.6 M${f(x - 1.8)} ${f(y)} h3.6" stroke="#fff" stroke-width=".8" stroke-linecap="round"/>`);
        break;
      case 'needles':
        rep(N(55), (x, y) => `<path d="M${f(x)} ${f(y)} l${f(R() * 3 - 1.5)} ${f(R() * 3 - 1.5)}" stroke="#c9d1d7" stroke-width="1.6" stroke-linecap="round"/><path d="M${f(x)} ${f(y)} l${f(R() * 2 - 1)} ${f(R() * 2 - 1)}" stroke="#fff" stroke-width=".8" stroke-linecap="round"/>`);
        break;
      case 'granules':
        rep(N(70), (x, y) => dot(x, y, 0.55 + R() * 0.6, pick(c.cols)));
        break;
      case 'cumin':
        rep(N(40), (x, y) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.9" ry=".7" transform="rotate(${Math.round(R() * 180)} ${f(x)} ${f(y)})" fill="${pick(['#6e4826', '#8a5e34', '#5a3a1c'])}"/>`);
        rep(N(50), (x, y) => dot(x, y, 0.4, pick(['#a87a46', '#b88a54'])));
        break;
      case 'corns':
        rep(N(5), (x, y) => dot(x, y, 1.5, c.col) + dot(x - 0.5, y - 0.5, 0.45, '#ffffff', 0.6));
        break;
      case 'scallionbits':
        rep(N(12), (x, y) => blob(x, y, 1 + R() * 1.1, R, pick(['#6a4a1c', '#8a6a2a', '#4e6a2a'])));
        break;
      case 'flecks':
        rep(N(26), (x, y) => blob(x, y, 0.6 + R() * 0.8, R, pick(c.cols)));
        break;
      case 'oil':
        rep(N(6), (x, y) => { const r = 1.5 + R() * 2.6; return dot(x, y, r, c.col, 0.7) + dot(x - r * 0.35, y - r * 0.35, r * 0.3, '#ffffff', 0.55); });
        break;
    }
    return s;
  }

  /* ======================= CONTAINERS ======================= */
  const svg = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${inner}</svg>`;
  const steelLine = (d, w = 6) =>
    `<path d="${d}" fill="none" stroke="#6f7a82" stroke-width="${w}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#eef2f4" stroke-width="${w * 0.45}" stroke-linecap="round"/>`;

  function binSVG(it) {
    const R = rng(hash(it.id));
    const x0 = 14, y0 = 29, w = 92, h = 51;
    const pt = (r) => ({ x: x0 + 2 + r() * (w - 4), y: y0 + 2 + r() * (h - 4) });
    let s =
      `<rect x="6" y="15" width="110" height="80" rx="10" fill="rgba(60,40,30,.16)"/>` +
      `<rect x="4" y="10" width="112" height="80" rx="10" fill="url(#sb-steel)" stroke="#6f7a82" stroke-width="2"/>` +
      `<rect x="11" y="16" width="98" height="68" rx="6" fill="#7f8b93"/>` +
      `<rect x="12" y="17" width="96" height="15" rx="5" fill="#b3bdc4"/>` +
      `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4" fill="${it.base}"/>`;
    if (it.tex === 'oilflakes') {
      s += tex('flakes', { cols: ['#5e1209', '#9e2414', '#7a180c', '#b8301a'] }, R, pt, 1.6);
      s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4" fill="#e8361f" opacity=".52"/>`;
      s += `<path d="M${x0 + 6} ${y0 + 12} q20 -5 40 -1 t40 -2" stroke="#ff8a5a" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>`;
    } else if (it.tex === 'crisp') {
      s += tex('crisp', {}, R, pt, 1.5);
      s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4" fill="#b8361a" opacity=".22"/>`;
    } else {
      s += tex(it.tex, it.c || {}, R, pt);
    }
    if (it.gloss || it.tex === 'oilflakes' || it.tex === 'crisp') {
      s += `<path d="M${x0 + 8} ${y0 + 7} Q${x0 + 30} ${y0 + 2.5} ${x0 + 54} ${y0 + 6}" stroke="#fff" stroke-width="3" opacity=".55" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="${x0 + w - 16}" cy="${y0 + h - 9}" rx="7" ry="2.4" fill="#fff" opacity=".3"/>`;
    }
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="2"/>`;

    const dark = shade(it.base, -0.25);
    if (it.utensil === 'ribbon') {
      // ladle lifted with a slow ribbon of paste folding back into the bin
      s += `<ellipse cx="57" cy="60" rx="15" ry="4.5" fill="none" stroke="${shade(it.base, 0.25)}" stroke-width="2" opacity=".8"/>` +
        `<ellipse cx="56" cy="60" rx="8" ry="2.6" fill="none" stroke="${shade(it.base, 0.3)}" stroke-width="1.8" opacity=".8"/>` +
        `<path d="M50 30 C47 38 56 42 52 48 C48 54 57 56 55 60" fill="none" stroke="${it.base}" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M49 31 C46 38 54 42 51 47" fill="none" stroke="${shade(it.base, 0.4)}" stroke-width="1.4" stroke-linecap="round"/>` +
        steelLine('M68 22 L114 2', 6) +
        `<path d="M42 22 a16 9 0 0 0 32 0 Z" fill="#a9b4bb" stroke="#6f7a82" stroke-width="2"/>` +
        `<ellipse cx="58" cy="22" rx="16" ry="5" fill="${it.base}" stroke="#6f7a82" stroke-width="2"/>` +
        `<path d="M47 21 q8 -3 16 -1" stroke="${shade(it.base, 0.35)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>` +
        `<path d="M44 25 q-1 6 2 9" stroke="${it.base}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    } else if (it.utensil === 'scoop') {
      s += steelLine('M74 50 L104 26', 5) +
        `<path d="M50 50 h22 a4 4 0 0 1 4 4 v6 a4 4 0 0 1 -4 4 h-22 a8 8 0 0 1 0 -14 Z" fill="url(#sb-steel)" stroke="#6f7a82" stroke-width="2"/>` +
        `<path d="M52 53 h19 v8 h-19 a4 4 0 0 1 0 -8Z" fill="${it.base}"/>` +
        tex(it.tex, it.c || {}, rng(hash(it.id) + 7), (r) => ({ x: 52 + r() * 19, y: 53 + r() * 8 }), 0.12);
    } else {
      s += steelLine('M74 50 L113 3', 6.5) +
        `<ellipse cx="64" cy="56" rx="14" ry="8" fill="${dark}" stroke="#7d878e" stroke-width="2.6"/>` +
        `<path d="M52 53 q12 -6 24 0" stroke="#eef2f4" stroke-width="1.4" fill="none" opacity=".9"/>`;
    }
    // ladle rest beside the bin
    s += `<ellipse cx="103" cy="93" rx="11" ry="4.6" fill="url(#sb-steel)" stroke="#6f7a82" stroke-width="1.5"/><ellipse cx="103" cy="92.4" rx="6" ry="2" fill="#9aa5ad"/>`;
    return svg('0 0 120 100', s);
  }

  function squeezeSVG(it) {
    const R = rng(hash(it.id));
    const c = it.col;
    let s =
      `<ellipse cx="52" cy="56" rx="40" ry="38" fill="rgba(60,40,30,.18)"/>` +
      // bottle shoulder seen from above (clear plastic showing the sauce)
      `<circle cx="50" cy="50" r="40" fill="${c}" opacity="${it.alpha || 0.95}"/>` +
      `<circle cx="50" cy="50" r="40" fill="none" stroke="${O}" stroke-width="2.5"/>` +
      `<circle cx="50" cy="50" r="35" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/>`;
    if (it.flecks) s += tex('flecks', { cols: it.flecks }, R, (r) => { const a = r() * Math.PI * 2, d = 25 + r() * 11; return { x: 50 + Math.cos(a) * d, y: 50 + Math.sin(a) * d }; }, 0.9);
    s +=
      // screw cap with ridges
      `<circle cx="50" cy="50" r="23" fill="${it.cap}" stroke="${O}" stroke-width="2.5"/>` +
      Array.from({ length: 16 }, (_, k) => {
        const a = (k / 16) * Math.PI * 2;
        return `<path d="M${f(50 + Math.cos(a) * 19)} ${f(50 + Math.sin(a) * 19)} L${f(50 + Math.cos(a) * 22.5)} ${f(50 + Math.sin(a) * 22.5)}" stroke="${shade(it.cap, -0.2)}" stroke-width="1.6"/>`;
      }).join('') +
      `<circle cx="50" cy="50" r="13" fill="${shade(it.cap, 0.12)}" stroke="${shade(it.cap, -0.25)}" stroke-width="1.5"/>` +
      // pointed tip (cone seen from above) with a little drip
      `<circle cx="50" cy="50" r="7.5" fill="${shade(it.cap, -0.08)}" stroke="${O}" stroke-width="1.6"/>` +
      `<path d="M50 43 L53 50 L50 57 L47 50 Z" fill="${shade(it.cap, 0.3)}" opacity=".6"/>` +
      `<circle cx="50" cy="50" r="2.4" fill="${c}" stroke="${O}" stroke-width="1"/>` +
      `<path d="M53 52 q6 4 4 10 q-5 -1 -4 -10Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width=".7"/>` +
      // shine
      `<path d="M22 34 A32 32 0 0 1 40 18" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>` +
      `<path d="M38 36 A14 14 0 0 1 46 30" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
    return svg('0 0 100 100', s);
  }

  function herbSVG(it) {
    const R = rng(hash(it.id));
    const pt = (r) => ({ x: 12 + r() * 46, y: 31 + r() * 44 });
    let s =
      `<ellipse cx="35" cy="81" rx="28" ry="3" fill="rgba(60,40,30,.18)"/>` +
      `<rect x="7" y="22" width="56" height="58" rx="11" fill="rgba(255,255,255,.4)" stroke="#a9bcc6" stroke-width="1.4"/>` +
      `<path d="M9 34 Q35 26 61 34 L61 70 Q61 78 53 78 L17 78 Q9 78 9 70 Z" fill="${it.base}"/>` +
      tex(it.tex, it.c || {}, R, pt, 1.1) +
      `<path d="M9 34 Q35 26 61 34" stroke="#fff" stroke-width="1.2" fill="none" opacity=".5"/>` +
      steelLine('M37 44 L56 4', 4.4) + steelLine('M43 46 L62 7', 4.4) +
      `<path d="M54 9 L61 11" stroke="#6f7a82" stroke-width="3" stroke-linecap="round"/>` +
      `<rect x="7" y="22" width="56" height="58" rx="11" fill="url(#sb-glass)" stroke="${O}" stroke-width="2"/>` +
      `<ellipse cx="35" cy="22" rx="28" ry="4.6" fill="rgba(255,255,255,.25)" stroke="${O}" stroke-width="2"/>` +
      `<rect x="12" y="30" width="4" height="42" rx="2" fill="#fff" opacity=".6"/>`;
    return svg('5 0 62 84', s);
  }

  function drySVG(it) {
    const R = rng(hash(it.id));
    let s = `<ellipse cx="25" cy="77" rx="18" ry="2.6" fill="rgba(60,40,30,.18)"/>`;
    if (it.holder === 'shaker') {
      const pt = (r) => ({ x: 12 + r() * 26, y: 40 + r() * 33 });
      s += `<rect x="9" y="26" width="32" height="50" rx="7" fill="rgba(255,255,255,.45)" stroke="#a9bcc6" stroke-width="1.2"/>` +
        `<rect x="11" y="38" width="28" height="36" rx="5" fill="${it.base}"/>` +
        tex(it.tex, it.c || {}, R, pt, 0.55) +
        `<rect x="9" y="26" width="32" height="50" rx="7" fill="url(#sb-glass)" stroke="${O}" stroke-width="2"/>` +
        `<rect x="13" y="31" width="3.5" height="40" rx="1.7" fill="#fff" opacity=".6"/>` +
        `<path d="M9 23 Q25 2 41 23 Z" fill="url(#sb-steel)" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>` +
        `<rect x="8" y="20" width="34" height="7" rx="2.5" fill="url(#sb-steel)" stroke="${O}" stroke-width="2"/>` +
        dot(20, 14, 1.1, '#5a646b') + dot(25, 11, 1.1, '#5a646b') + dot(30, 14, 1.1, '#5a646b') + dot(25, 16, 1.1, '#5a646b');
    } else {
      const pt = (r) => ({ x: 11 + r() * 28, y: 40 + r() * 32 });
      s += `<rect x="7" y="30" width="36" height="46" rx="9" fill="rgba(255,255,255,.45)" stroke="#a9bcc6" stroke-width="1.2"/>` +
        `<rect x="9" y="38" width="32" height="36" rx="7" fill="${it.base}"/>` +
        tex(it.tex, it.c || {}, R, pt, 0.55) +
        `<ellipse cx="25" cy="38" rx="16" ry="4" fill="${shade(it.base, it.base > '#e' ? -0.06 : 0.12)}"/>` +
        tex(it.tex, it.c || {}, R, (r) => ({ x: 13 + r() * 24, y: 36 + r() * 4 }), 0.12) +
        steelLine('M27 37 L41 8', 3.2) +
        `<ellipse cx="25" cy="38.5" rx="5" ry="2.4" fill="url(#sb-steel)" stroke="#6f7a82" stroke-width="1.2"/>` +
        `<rect x="7" y="30" width="36" height="46" rx="9" fill="url(#sb-glass)" stroke="${O}" stroke-width="2"/>` +
        `<ellipse cx="25" cy="30" rx="18" ry="4.4" fill="none" stroke="${O}" stroke-width="2"/>` +
        `<rect x="11" y="36" width="3.5" height="34" rx="1.7" fill="#fff" opacity=".6"/>`;
      if (it.sparkle) s += `<path d="M34 50 v5 M31.5 52.5 h5 M18 62 v4 M16 64 h4" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>`;
    }
    return svg('6 0 38 80', s);
  }

  const utensils = {
    ladle: (it) => svg('0 0 70 70', steelLine('M26 40 L66 4', 6) + `<path d="M4 40 a20 12 0 0 0 40 0 Z" fill="#a9b4bb" stroke="#6f7a82" stroke-width="2"/><ellipse cx="24" cy="40" rx="20" ry="6" fill="${it.base}" stroke="#6f7a82" stroke-width="2"/>`),
    scoop: (it) => svg('0 0 70 70', steelLine('M36 40 L64 14', 5) + `<path d="M8 32 h26 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-26 a9 9 0 0 1 0 -16Z" fill="url(#sb-steel)" stroke="#6f7a82" stroke-width="2"/><path d="M10 35 h23 v10 h-23 a5 5 0 0 1 0 -10Z" fill="${it.base}"/>`),
    tongs: (it) => svg('0 0 70 70', steelLine('M30 46 L60 6', 4.4) + steelLine('M38 48 L66 10', 4.4) + `<circle cx="30" cy="52" r="7" fill="${it.base}" stroke="${O}" stroke-width="1"/>`),
  };

  /* ======================= DIPPING BOWL ======================= */
  function mix(list) {
    let r = 0, g = 0, b = 0, w = 0;
    list.forEach((id) => {
      const L = ITEM[id] && ITEM[id].liq;
      if (!L) return;
      const [cr, cg, cb] = hex(L[0]);
      r += cr * L[1]; g += cg * L[1]; b += cb * L[1]; w += L[1];
    });
    if (!w) return null;
    const c = '#' + [r, g, b].map((v) => Math.round(v / w).toString(16).padStart(2, '0')).join('');
    return { color: c, w };
  }
  const PASTES = ['sesame', 'peanut', 'furu', 'oyster', 'hoisin', 'sesamedressing', 'spicymayo'];
  function bowlSVG(list, cid) {
    const m = mix(list);
    const amount = m ? Math.min(1, 0.35 + m.w * 0.18) : 0;
    const rx = 44 + amount * 20, ry = 12 + amount * 7;
    const pt = (r) => {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.92;
      return { x: 80 + Math.cos(a) * rx * d, y: 39 + Math.sin(a) * ry * d };
    };
    let liquid = '';
    if (m) {
      liquid = `<ellipse cx="80" cy="39" rx="${f(rx)}" ry="${f(ry)}" fill="${m.color}" opacity="${f(Math.min(1, 0.55 + m.w * 0.22))}"/>`;
      if (list.some((id) => PASTES.includes(id))) {
        const R = rng(list.length * 31 + 5);
        liquid += tex('smooth', { swirl: shade(m.color, 0.3) }, R, pt, 0.8);
      }
      liquid += `<path d="M${f(80 - rx * 0.6)} ${f(39 - ry * 0.45)} q${f(rx * 0.4)} -${f(ry * 0.25)} ${f(rx * 0.8)} -2" stroke="#fff" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/>`;
    }
    let parts = '';
    list.forEach((id, i) => {
      const it = ITEM[id];
      if (!it) return;
      const R = rng(hash(id) + i * 7919);
      if (it.oil) parts += tex('oil', { col: it.oil }, R, pt, 0.8);
      if (it.bowl) {
        const [k, sc] = it.bowl;
        const c = k === 'flecks' ? { cols: it.flecks } : k === 'corns' ? { col: it.corns } : it.c || {};
        parts += tex(k === 'chunky' ? 'chunky' : k, c, R, pt, sc);
      }
      if (it.kind === 'squeeze') {
        const y = 39 + (R() - 0.5) * ry;
        parts += `<path d="M${f(80 - rx * 0.55)} ${f(y)} q${f(rx * 0.18)} -6 ${f(rx * 0.36)} 0 t${f(rx * 0.36)} 0 t${f(rx * 0.36)} 0" fill="none" stroke="${it.col}" stroke-width="2.6" stroke-linecap="round"/>`;
      }
    });
    return svg('0 0 160 100',
      `<ellipse cx="80" cy="93" rx="48" ry="5" fill="rgba(60,40,30,.18)"/>` +
      `<path d="M8 36 Q14 89 80 91 Q146 89 152 36 Z" fill="#fffdf8" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M22 60 Q80 82 138 60" stroke="#8fb0d6" stroke-width="3" fill="none"/>` +
      `<path d="M26 67 Q80 87 134 67" stroke="#8fb0d6" stroke-width="1.5" fill="none"/>` +
      `<ellipse cx="80" cy="36" rx="72" ry="24" fill="#fffdf8" stroke="${O}" stroke-width="3"/>` +
      `<ellipse cx="80" cy="39" rx="64" ry="19.5" fill="#efe9de"/>` +
      `<clipPath id="${cid}"><ellipse cx="80" cy="39" rx="64" ry="19.5"/></clipPath>` +
      `<g clip-path="url(#${cid})">${liquid}${parts}</g>` +
      `<path d="M20 30 Q40 18 70 16" stroke="#fff" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`);
  }

  /* ======================= BUILD THE BAR ======================= */
  // Short names so every label fits on one line in a same-size card (full names stay in the tooltip).
  const SHORT = {
    cilantro: 'Cilantro', scallion: 'Scallions', celery: 'Celery', redchili: 'Red Chili', mustard: 'Pickles', shallots: 'Shallots',
    salt: 'Salt', sugar: 'Sugar', msg: 'MSG', chilipowder: 'Chili', sichuanpowder: 'Peppercorn', cumin: 'Cumin',
    sriracha: 'Sriracha', sweetchili: 'Sweet Chili', hoisin: 'Hoisin', spicymayo: 'Spicy Mayo',
    oyster: 'Oyster', choppedchili: 'Pickled Chili', crushedpeanut: 'Peanuts', peanut: 'Peanut Sauce',
    sesame: 'Sesame Paste', chilioil: 'Chili Oil', garlic: 'Garlic', sesameseed: 'Sesame Seeds',
  };
  const itemBtn = (it, art, cls = '') =>
    `<button class="sb-item ${cls}" data-id="${it.id}" aria-label="${it.en} (${it.cn}). ${it.desc}. Add to bowl">
      <span class="sb-art">${art}</span><span class="sb-label">${SHORT[it.id] || it.en}</span></button>`;

  function build(root) {
    const pick = (ids) => ids.map((id) => ITEM[id]);
    root.innerHTML = `
      <div class="sb-wall">
        <div class="sb-lamps" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="sb-top">
          <div class="sb-shelf">
            <div class="sb-group">
              <h3 class="sb-cat">Fresh herbs &amp; toppings <span class="cn">香料小料</span></h3>
              <div class="sb-grid">${pick(SHOW.herbs).map((it) => itemBtn(it, herbSVG(it), 'jar')).join('')}</div>
            </div>
            <div class="sb-group">
              <h3 class="sb-cat">Dry seasonings <span class="cn">干调料</span></h3>
              <div class="sb-grid">${pick(SHOW.dry).map((it) => itemBtn(it, drySVG(it), 'shaker')).join('')}</div>
            </div>
            <div class="sb-plank" aria-hidden="true"></div>
          </div>
          <div class="sb-chalk">
            <h3>House Blends <span class="cn">招牌配方</span></h3>
            ${BLENDS.map((b) => `<button class="sb-recipe" data-blend="${b.id}"><strong>${b.en} <span class="cn">${b.cn}</span></strong><span>${b.items.map((id) => ITEM[id].en.replace(' with Flakes', '').toLowerCase()).join(' + ')}</span></button>`).join('')}
            <small>tap a recipe to make it</small>
          </div>
        </div>
      </div>
      <div class="sb-counter">
        <div class="sb-main">
          <div class="sb-side">
            <h3 class="sb-cat">Squeeze bottles <span class="cn">挤挤瓶</span></h3>
            <div class="sb-caddy">${pick(SHOW.squeeze).map((it) => itemBtn(it, squeezeSVG(it), 'bottle')).join('')}</div>
          </div>
          <div class="sb-center">
            <h3 class="sb-cat">Sauces <span class="cn">酱料</span></h3>
            <div class="sb-well">${pick(SHOW.bins).map((it) => itemBtn(it, binSVG(it), 'bin' + (it.big ? ' big' : ''))).join('')}</div>
          </div>
        </div>
      </div>`;
  }

  /* ======================= INTERACTION ======================= */
  let bowl = [];
  let gen = 0;
  let queue = Promise.resolve();
  const MAX = 36;
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const api = { onDone: null, onBack: null };

  function renderBowl() {
    const b = $('#sbBowl');
    if (b) b.innerHTML = bowlSVG(bowl, 'sbClip');
    const counts = {};
    bowl.forEach((id) => (counts[id] = (counts[id] || 0) + 1));
    const chips = $('#sbChips');
    if (chips) {
      chips.innerHTML = bowl.length
        ? Object.entries(counts).map(([id, n]) => `<span class="sb-chip">${ITEM[id].en}${n > 1 ? ` ×${n}` : ''}</span>`).join('')
        : '<span class="sb-empty">Empty. Tap any sauce to add it!</span>';
    }
    const heat = bowl.reduce((s, id) => s + ITEM[id].spice, 0);
    const lvl = !bowl.length ? 0 : heat < 2 ? 1 : heat < 5 ? 2 : 3;
    const h = $('#sbHeat');
    if (h) h.textContent = bowl.length ? ['', 'mild', 'medium 🌶️', 'spicy 🌶️🌶️🌶️'][lvl] : '';
  }

  function tip(el, show) {
    const t = $('#sauceTip');
    if (!t) return;
    if (!show) { t.hidden = true; return; }
    const it = ITEM[el.dataset.id];
    t.innerHTML = `<strong>${it.en} <span class="cn">${it.cn}</span></strong><span>${it.desc}</span>` +
      `<em>${it.spice ? '🌶️'.repeat(it.spice) : '<span class="nohot">no heat</span>'}</em>`;
    t.hidden = false;
    const r = el.getBoundingClientRect();
    const tw = t.offsetWidth, th = t.offsetHeight;
    let x = r.left + r.width / 2 - tw / 2;
    x = Math.max(8, Math.min(window.innerWidth - tw - 8, x));
    let y = r.top - th - 8;
    if (y < 8) y = r.bottom + 8;
    t.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  // flying utensil + falling bits, then the bowl updates
  async function animateAdd(id, el) {
    const it = ITEM[id];
    const bowlEl = $('#sbBowl');
    if (reduce() || !el || !bowlEl || !bowlEl.offsetParent) return;
    const from = el.querySelector('.sb-art').getBoundingClientRect();
    const to = bowlEl.getBoundingClientRect();
    const g = document.createElement('div');
    g.className = 'sb-ghost';
    let art, w, h;
    if (it.kind === 'bin') { art = utensils[it.motion](it); w = h = 70; }
    else if (it.kind === 'herb') { art = utensils.tongs(it); w = h = 70; }
    else { art = el.querySelector('.sb-art').innerHTML; w = from.width; h = from.height; }
    g.innerHTML = `<div class="sb-ghost-in">${art}</div>`;
    g.style.width = w + 'px';
    g.style.height = h + 'px';
    document.body.appendChild(g);
    const sx = from.left + from.width / 2 - w / 2, sy = from.top + from.height / 2 - h / 2;
    const tx = to.left + to.width / 2 - w / 2;
    const ty = to.top - h * (it.kind === 'bin' || it.kind === 'herb' || it.kind === 'squeeze' ? 0.45 : 0.8);
    const lift = Math.min(sy, ty) - 90;
    await g.animate([
      { transform: `translate(${sx}px, ${sy}px)` },
      { transform: `translate(${(sx + tx) / 2}px, ${lift}px) rotate(-8deg)`, offset: 0.5 },
      { transform: `translate(${tx}px, ${ty}px)` },
    ], { duration: 560, easing: 'cubic-bezier(.45,0,.35,1)', fill: 'forwards' }).finished;

    const inner = g.firstElementChild;
    const ACT = {
      ladle: [[{ transform: 'rotate(0)' }, { transform: 'rotate(-55deg)' }], 420],
      scoop: [[{ transform: 'rotate(0)' }, { transform: 'rotate(-70deg)' }], 380],
      tongs: [[{ transform: 'scale(1)' }, { transform: 'scale(1.08) rotate(-6deg)' }, { transform: 'scale(1)' }], 360],
      squeeze: [[{ transform: 'scale(1)' }, { transform: 'scale(.82, .9)', offset: 0.3 }, { transform: 'scale(1)', offset: 0.55 }, { transform: 'scale(.82, .9)', offset: 0.8 }, { transform: 'scale(1)' }], 620],
      pour: [[{ transform: 'rotate(0)' }, { transform: 'rotate(118deg)', offset: 0.4 }, { transform: 'rotate(118deg)' }], 620],
      shake: [[{ transform: 'rotate(0)' }, { transform: 'rotate(165deg)', offset: 0.3 }, { transform: 'rotate(165deg) translateY(-6px)', offset: 0.45 }, { transform: 'rotate(165deg) translateY(4px)', offset: 0.6 }, { transform: 'rotate(165deg) translateY(-6px)', offset: 0.75 }, { transform: 'rotate(165deg)' }], 640],
      spoon: [[{ transform: 'rotate(0)' }, { transform: 'rotate(120deg)' }], 420],
    }[it.motion];

    // falling bits / drops
    const col = it.col || it.base;
    const n = it.kind === 'dry' ? 14 : it.kind === 'herb' ? 8 : 7;
    const cx = to.left + to.width / 2, surf = to.top + to.height * 0.36;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i');
      d.className = 'sb-drop ' + (it.kind === 'dry' ? 'dust' : it.kind === 'herb' ? 'bit' : 'liquid');
      d.style.background = it.kind === 'herb' && it.c && it.c.cols ? it.c.cols[i % it.c.cols.length] : col;
      d.style.left = '0px';
      d.style.top = '0px';
      document.body.appendChild(d);
      const x0 = cx + (Math.random() - 0.5) * 18, y0 = ty + h * 0.55;
      const x1 = cx + (Math.random() - 0.5) * to.width * 0.5;
      d.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(.6)`, opacity: 0 },
        { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1, offset: 0.1 },
        { transform: `translate(${x1}px, ${surf}px) scale(.8)`, opacity: 1, offset: 0.92 },
        { transform: `translate(${x1}px, ${surf}px) scale(.3)`, opacity: 0 },
      ], { duration: 420, delay: 140 + i * (ACT[1] / n) * 0.6, easing: 'ease-in', fill: 'forwards' }).finished.then(() => d.remove());
    }
    await inner.animate(ACT[0], { duration: ACT[1], easing: 'ease-in-out', fill: 'forwards' }).finished;
    await g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }).finished;
    g.remove();
  }

  function add(id, el) {
    const my = gen;
    queue = queue.then(async () => {
      if (my !== gen) return;
      if (bowl.length >= MAX) { flash('Your dipping bowl is full! 🥣'); return; }
      el = el || $(`.sb-item[data-id="${id}"]`);
      try { await animateAdd(id, el); } catch (e) { /* animation unsupported */ }
      if (my !== gen) return;
      bowl.push(id);
      renderBowl();
      const b = $('#sbBowl');
      if (b) { b.classList.remove('plop'); void b.offsetWidth; b.classList.add('plop'); }
    }).catch((err) => console.warn('sauce add failed', err));
    return queue;
  }

  let flashT;
  function flash(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(flashT);
    flashT = setTimeout(() => (t.hidden = true), 2200);
  }

  function reset() {
    gen++;
    queue = Promise.resolve();
    bowl = [];
    $$('.sb-ghost, .sb-drop').forEach((n) => n.remove());
    renderBowl();
  }

  function blend(bid) {
    const b = BLENDS.find((x) => x.id === bid);
    if (!b) return;
    reset();
    closeMenu();
    flash(`Making the ${b.en} ${b.cn} blend…`);
    b.items.forEach((id) => add(id));
  }

  function closeMenu() {
    const m = $('#sbMenu');
    if (m) m.hidden = true;
    const btn = $('#sbBlendBtn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function wire(root) {
    root.addEventListener('click', (e) => {
      const r = e.target.closest('.sb-recipe');
      if (r) return blend(r.dataset.blend);
      const el = e.target.closest('.sb-item');
      if (!el) return;
      const btn = el;
      btn.classList.remove('tapped'); void btn.offsetWidth; btn.classList.add('tapped');
      add(el.dataset.id, el);
    });
    root.addEventListener('pointerover', (e) => {
      const el = e.target.closest('.sb-item');
      if (el && e.pointerType === 'mouse') tip(el, true);
    });
    root.addEventListener('pointerout', (e) => {
      const el = e.target.closest('.sb-item');
      if (el && !el.contains(e.relatedTarget)) tip(el, false);
    });
    let tipT;
    root.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.sb-item');
      if (el && e.pointerType !== 'mouse') {
        tip(el, true);
        clearTimeout(tipT);
        tipT = setTimeout(() => tip(el, false), 1800);
      }
    });
    root.addEventListener('focusin', (e) => { const el = e.target.closest('.sb-item'); if (el) tip(el, true); });
    root.addEventListener('focusout', (e) => { const el = e.target.closest('.sb-item'); if (el) tip(el, false); });
    window.addEventListener('scroll', () => { const t = $('#sauceTip'); if (t) t.hidden = true; }, { passive: true });

    $('#sbReset').addEventListener('click', reset);
    $('#sbBlendBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      const m = $('#sbMenu');
      m.hidden = !m.hidden;
      $('#sbBlendBtn').setAttribute('aria-expanded', String(!m.hidden));
    });
    $('#sbMenu').innerHTML = BLENDS.map((b) =>
      `<button data-blend="${b.id}"><strong>${b.en} <span class="cn">${b.cn}</span></strong><small>${b.items.map((id) => ITEM[id].en).join(', ')}</small></button>`).join('');
    $('#sbMenu').addEventListener('click', (e) => { const b = e.target.closest('[data-blend]'); if (b) blend(b.dataset.blend); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.st-blend')) closeMenu(); });
    $('#sbDone').addEventListener('click', () => api.onDone && api.onDone());
    $('#sbBack').addEventListener('click', () => api.onBack && api.onBack());
  }

  let mounted = false;
  function mount() {
    if (mounted) return;
    const root = $('#sauceBar');
    if (!root) return;
    build(root);
    wire(root);
    mounted = true;
    renderBowl();
  }

  Object.assign(api, {
    mount,
    enter() { mount(); renderBowl(); },
    get: () => bowl.slice(),
    set(list) { bowl = (list || []).filter((id) => ITEM[id]); renderBowl(); },
    reset,
    bowlSVG,
    ITEM,
  });
  window.SauceBar = api;
})();
