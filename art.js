/* =========================================================
   Hand-drawn style SVG art for every ingredient.
   Every drawing uses a 100x100 viewBox. `c` = cooked look.
   ========================================================= */
(function () {
  const O = '#6b4a3a';
  const st = (w = 3.5) =>
    `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const S = st();
  const tube = (d, color, w, ow = 3) =>
    `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + ow * 2}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const shine = (cx, cy, rx, ry, rot = -30, op = 0.4) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" opacity="${op}"/>`;
  const wrap = (inner, vb = '0 0 100 100') =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${inner}</svg>`;

  function cluster(capFill, capRx, capRy, tops, stem) {
    let s = '';
    tops.forEach(([x, y]) => {
      s += tube(`M50 84 Q${(50 + x) / 2} ${(84 + y) / 2 + 8} ${x} ${y + capRy - 1}`, stem, 4.5, 2.4);
    });
    tops.forEach(([x, y]) => {
      s += `<ellipse cx="${x}" cy="${y}" rx="${capRx}" ry="${capRy}" fill="${capFill}" ${st(2.8)}/>`;
    });
    s += `<rect x="37" y="76" width="26" height="16" rx="6" fill="#e9d8ad" ${st(3)}/>`;
    return s;
  }

  function spiral(cx, cy, turns, maxR) {
    const pts = [];
    const N = 90;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * turns * 2 * Math.PI;
      const r = 2 + ((maxR - 2) * i) / N;
      pts.push(`${(cx + Math.cos(t) * r).toFixed(1)},${(cy + Math.sin(t) * r).toFixed(1)}`);
    }
    return 'M' + pts.join(' L');
  }

  function star(cx, cy, n, r1, r2) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1;
      const a = (Math.PI * i) / n - Math.PI / 2;
      pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  const cube = (top, left, right, extra = '') =>
    `<polygon points="16,36 50,19 84,36 50,53" fill="${top}" ${S}/>` +
    `<polygon points="16,36 50,53 50,87 16,70" fill="${left}" ${S}/>` +
    `<polygon points="50,53 84,36 84,70 50,87" fill="${right}" ${S}/>` +
    extra;

  /* ---------------- shelf ingredients ---------------- */
  const ART = {
    shiitake: (c) =>
      `<circle cx="50" cy="52" r="35" fill="${c ? '#7b4b2e' : '#985f3a'}" ${S}/>` +
      `<path d="M34 36 L66 68 M66 36 L34 68" stroke="#f4dcae" stroke-width="7" stroke-linecap="round"/>` +
      `<path d="M50 26 v7 M50 71 v7 M24 52 h7 M69 52 h7" stroke="#f4dcae" stroke-width="4" stroke-linecap="round"/>` +
      shine(36, 36, 9, 4, -35, 0.25),

    enoki: (c) =>
      cluster(c ? '#efe4c6' : '#fbf5e4', 6, 5,
        [[22, 26], [32, 16], [45, 10], [58, 12], [70, 17], [80, 28]], c ? '#f1e8cf' : '#fffbef'),

    shimeji: (c) =>
      cluster(c ? '#8f6140' : '#ab7a52', 10, 7,
        [[26, 26], [46, 16], [66, 22], [36, 40], [60, 40]], '#f6ecd2'),

    kingoyster: (c) =>
      `<path d="M37 40 Q34 70 38 88 Q50 95 62 88 Q66 70 63 40 Z" fill="${c ? '#efdcb6' : '#f6e9cb'}" ${S}/>` +
      `<path d="M16 40 Q19 16 50 15 Q81 16 84 40 Q67 49 50 46 Q33 49 16 40Z" fill="${c ? '#946640' : '#b98757'}" ${S}/>` +
      `<path d="M45 56 Q47 70 45 82" stroke="#e1cda3" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      shine(36, 26, 9, 3.5, -12, 0.3),

    woodear: () =>
      `<path d="M20 56 C12 32 40 16 54 29 C69 15 94 32 85 54 C93 76 66 89 52 77 C35 91 10 77 20 56Z" fill="#3e2c30" ${S}/>` +
      `<path d="M33 55 C40 44 50 44 54 53 M58 44 C64 37 73 41 75 50 M40 70 C46 64 54 66 56 70" stroke="#806570" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

    napa: (c) =>
      `<path d="M50 94 C22 84 12 56 20 32 C28 10 72 10 80 32 C88 56 78 84 50 94Z" fill="${c ? '#eeefb2' : '#f6f7cf'}"/>` +
      `<path d="M20 34 C28 9 72 9 80 34 C76 43 64 37 50 44 C36 37 24 43 20 34Z" fill="${c ? '#9cc95e' : '#b6dc7a'}"/>` +
      `<path d="M50 94 C22 84 12 56 20 32 C28 10 72 10 80 32 C88 56 78 84 50 94Z" fill="none" ${S}/>` +
      `<path d="M50 90 L50 30" stroke="#fffdf2" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M50 62 L34 50 M50 62 L66 50 M50 78 L36 68 M50 78 L64 68" stroke="#e3e7a2" stroke-width="3" stroke-linecap="round"/>`,

    bokchoy: (c) => {
      const lf = c ? '#3e9a44' : '#5db54f';
      return `<ellipse cx="33" cy="35" rx="15" ry="25" transform="rotate(-22 33 35)" fill="${lf}" ${S}/>` +
        `<ellipse cx="67" cy="35" rx="15" ry="25" transform="rotate(22 67 35)" fill="${lf}" ${S}/>` +
        `<ellipse cx="50" cy="27" rx="16" ry="23" fill="${c ? '#4aa64c' : '#6cc35b'}" ${S}/>` +
        `<path d="M38 94 C29 74 34 54 42 44 L58 44 C66 54 71 74 62 94 Z" fill="${c ? '#e2efc2' : '#eff8d9'}" ${S}/>` +
        `<path d="M50 50 L50 88" stroke="#cfe5a1" stroke-width="3" stroke-linecap="round"/>`;
    },

    lettuce: (c) =>
      `<path d="M50 92 C22 88 10 64 18 48 C9 37 20 18 34 23 C39 9 61 9 66 23 C80 18 91 37 82 48 C90 64 78 88 50 92Z" fill="${c ? '#8cc356' : '#a9da71'}" ${S}/>` +
      `<path d="M50 88 L50 30 M50 52 L34 38 M50 52 L66 38 M50 70 L32 58 M50 70 L68 58" stroke="#e3f4c2" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,

    spinach: (c) => {
      const a = c ? '#2f7f3e' : '#3c9a4e', b = c ? '#38904a' : '#47aa58';
      return tube('M50 94 L50 62', '#8fc96a', 5, 2.5) +
        `<path d="M50 66 C22 66 12 36 28 16 C42 30 52 46 50 66Z" fill="${a}" ${S}/>` +
        `<path d="M50 66 C78 64 90 34 72 14 C58 30 48 46 50 66Z" fill="${b}" ${S}/>` +
        `<path d="M48 62 C42 48 36 36 30 24 M52 62 C58 48 64 36 70 22" stroke="#8fd08a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    },

    broccoli: (c) => {
      const g = c ? '#2f8a3d' : '#4ea64b';
      return `<path d="M42 92 L44 58 L56 58 L58 92 Z" fill="#b6db7c" ${S}/>` +
        `<circle cx="31" cy="49" r="16" fill="${g}" ${S}/>` +
        `<circle cx="69" cy="49" r="16" fill="${g}" ${S}/>` +
        `<circle cx="50" cy="35" r="19" fill="${g}" ${S}/>` +
        `<circle cx="50" cy="56" r="13" fill="${g}" ${S}/>` +
        `<circle cx="44" cy="30" r="3" fill="#86cf6e"/><circle cx="56" cy="38" r="2.6" fill="#86cf6e"/>` +
        `<circle cx="28" cy="46" r="2.6" fill="#86cf6e"/><circle cx="70" cy="45" r="2.6" fill="#86cf6e"/>`;
    },

    corn: (c) => {
      let s = `<rect x="26" y="12" width="48" height="76" rx="22" fill="${c ? '#efbb2c' : '#f6c838'}" ${S}/>`;
      const rows = [23, 34, 45, 56, 67, 78];
      rows.forEach((y, i) => {
        const cols = i === 0 || i === rows.length - 1 ? [43, 57] : [36, 50, 64];
        cols.forEach((x) => {
          s += `<rect x="${x - 6}" y="${y - 4.5}" width="12" height="9" rx="4" fill="#ffe27a" stroke="#d9a127" stroke-width="2"/>`;
        });
      });
      return s;
    },

    tomato: (c) =>
      `<circle cx="50" cy="56" r="34" fill="${c ? '#d93d2e' : '#ec4b3c'}" ${S}/>` +
      `<path d="M50 27 L55 17 M50 27 l-11 -4 M50 27 l11 -4 M50 27 l-8 7 M50 27 l8 7" stroke="#3f9a4e" stroke-width="5" stroke-linecap="round"/>` +
      shine(36, 44, 8, 5, -35, 0.4),

    lotus: () => {
      let s = `<circle cx="50" cy="50" r="38" fill="#f5e8cf" ${S}/>` +
        `<circle cx="50" cy="50" r="31" fill="none" stroke="#e8d5ae" stroke-width="3"/>` +
        `<circle cx="50" cy="50" r="7" fill="#d7c29a" ${st(2.2)}/>`;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        s += `<ellipse cx="${(50 + Math.cos(a) * 20).toFixed(1)}" cy="${(50 + Math.sin(a) * 20).toFixed(1)}" rx="6.5" ry="5.5" fill="#d7c29a" ${st(2.2)}/>`;
      }
      return s;
    },

    potato: (c) =>
      `<ellipse cx="50" cy="52" rx="37" ry="30" fill="${c ? '#f3dc8e' : '#f7e6ab'}" ${S}/>` +
      `<ellipse cx="50" cy="52" rx="28" ry="22" fill="none" stroke="#ecd283" stroke-width="3"/>` +
      `<circle cx="38" cy="46" r="1.8" fill="#c9a85a"/><circle cx="60" cy="58" r="1.8" fill="#c9a85a"/>`,

    kelp: (c) =>
      tube('M26 80 C8 52 34 20 54 38 C72 54 58 76 42 64 C28 52 52 22 78 26', c ? '#24573e' : '#2f6c4d', 12, 3) +
      `<path d="M30 74 C20 56 36 34 52 44" stroke="#5c9a77" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

    tofu: () => cube('#ffffff', '#f0ebdc', '#e2dbc8') + shine(42, 32, 8, 3, -25, 0.8),

    tofupuff: (c) =>
      cube(c ? '#e7a237' : '#f3b84a', c ? '#d68e23' : '#e4a234', c ? '#c97f1d' : '#d6922a',
        `<circle cx="40" cy="34" r="2.5" fill="#c47a1a"/><circle cx="58" cy="38" r="2" fill="#c47a1a"/>` +
        `<circle cx="30" cy="58" r="2.2" fill="#b56f17"/><circle cx="68" cy="62" r="2.2" fill="#b56f17"/>`),

    frozentofu: () =>
      cube('#f7eec9', '#ebdfb1', '#ded0a0',
        `<ellipse cx="40" cy="34" rx="4" ry="2.5" fill="#d9c890"/><ellipse cx="58" cy="38" rx="3" ry="2" fill="#d9c890"/>` +
        `<ellipse cx="28" cy="56" rx="3" ry="4" fill="#d3c085"/><ellipse cx="38" cy="70" rx="2.5" ry="3.5" fill="#d3c085"/>` +
        `<ellipse cx="64" cy="58" rx="3" ry="4" fill="#cbb77b"/><ellipse cx="74" cy="66" rx="2.5" ry="3" fill="#cbb77b"/>`),

    fishtofu: (c) =>
      `<rect x="14" y="30" width="72" height="48" rx="18" fill="${c ? '#d99a45' : '#e7a957'}" ${S}/>` +
      `<rect x="14" y="24" width="72" height="48" rx="18" fill="${c ? '#eab25e' : '#f4c26c'}" ${S}/>` +
      shine(34, 36, 12, 4, -10, 0.45) +
      `<circle cx="60" cy="52" r="2.5" fill="#cf8a33"/><circle cx="70" cy="44" r="2" fill="#cf8a33"/>`,

    instant: (c) => {
      let s = `<rect x="15" y="20" width="70" height="60" rx="11" fill="${c ? '#f7dc8f' : '#f4cf63'}" ${S}/>`;
      [33, 45, 57, 69].forEach((y) => {
        s += `<path d="M21 ${y} q5 -6 10 0 t10 0 t10 0 t10 0 t10 0 t8 0" fill="none" stroke="#d29f34" stroke-width="3" stroke-linecap="round"/>`;
      });
      return s;
    },

    udon: () =>
      tube('M16 40 C34 20 50 58 66 34 S88 38 84 50', '#fffaf0', 8, 2.5) +
      tube('M14 58 C34 38 52 76 68 52 S88 56 86 66', '#fffaf0', 8, 2.5) +
      tube('M20 76 C38 58 56 90 76 70', '#fffaf0', 8, 2.5),

    glass: () => {
      let s = '';
      const paths = [
        'M14 40 C30 20 46 60 62 36 S86 34 86 48',
        'M14 50 C32 32 50 70 68 46 S88 50 84 60',
        'M16 62 C34 44 52 82 70 58 S88 64 82 72',
        'M20 72 C36 58 54 90 74 70',
        'M18 34 C40 22 56 50 78 30',
      ];
      paths.forEach((d) => (s += tube(d, '#eaf6f6', 3.2, 1.6)));
      return s;
    },

    ricecake: () =>
      `<ellipse cx="40" cy="42" rx="27" ry="16" transform="rotate(-20 40 42)" fill="#fbfaf2" ${S}/>` +
      `<ellipse cx="60" cy="62" rx="27" ry="16" transform="rotate(-20 60 62)" fill="#fffef8" ${S}/>` +
      shine(54, 56, 9, 3, -20, 0.9),

    egg: () =>
      `<ellipse cx="50" cy="52" rx="31" ry="39" fill="#fffdf6" ${S}/>` +
      `<circle cx="50" cy="58" r="16" fill="#f8c23a" ${st(2.6)}/>` +
      shine(54, 54, 5, 3, -30, 0.6),

    quail: (c) => {
      const shell = c ? '#fffaf0' : '#f6ecda';
      let s = '';
      [[34, 60], [64, 56], [49, 34]].forEach(([x, y]) => {
        s += `<ellipse cx="${x}" cy="${y}" rx="14" ry="17" fill="${shell}" ${S}/>`;
        if (!c) {
          s += `<circle cx="${x - 4}" cy="${y - 5}" r="2.4" fill="#8a6a4a"/><circle cx="${x + 5}" cy="${y + 2}" r="3" fill="#8a6a4a"/>` +
            `<circle cx="${x - 2}" cy="${y + 8}" r="1.8" fill="#8a6a4a"/>`;
        } else {
          s += shine(x - 4, y - 6, 4, 2.5, -30, 0.9);
        }
      });
      return s;
    },

    fishball: () =>
      `<circle cx="50" cy="52" r="31" fill="#fbf8ef" ${S}/>` + shine(40, 40, 9, 5, -30, 0.95) +
      `<path d="M38 66 q12 8 24 0" stroke="#ece4d2" stroke-width="3" fill="none" stroke-linecap="round"/>`,

    beefball: (c) =>
      `<circle cx="50" cy="52" r="31" fill="${c ? '#9e7258' : '#b98b6e'}" ${S}/>` + shine(40, 40, 8, 4, -30, 0.35) +
      `<circle cx="58" cy="58" r="2.5" fill="#8d6249"/><circle cx="44" cy="64" r="2" fill="#8d6249"/><circle cx="64" cy="44" r="2" fill="#8d6249"/>`,

    crab: () =>
      `<g transform="rotate(-25 50 50)">` +
      `<rect x="14" y="38" width="72" height="26" rx="10" fill="#fff8f0"/>` +
      `<rect x="14" y="38" width="72" height="12" rx="6" fill="#e8553f"/>` +
      `<rect x="14" y="38" width="72" height="26" rx="10" fill="none" ${S}/>` +
      `<path d="M30 56 h40" stroke="#f1e4d8" stroke-width="2.5" stroke-linecap="round"/></g>`,

    luncheon: (c) =>
      `<rect x="16" y="32" width="68" height="50" rx="8" fill="${c ? '#d97f7b' : '#e48c88'}" ${S}/>` +
      `<rect x="16" y="22" width="68" height="50" rx="8" fill="${c ? '#efa09b' : '#f5aaa5'}" ${S}/>` +
      `<circle cx="30" cy="36" r="2.5" fill="#fbd0cc"/><circle cx="52" cy="44" r="3" fill="#fbd0cc"/>` +
      `<circle cx="70" cy="34" r="2.2" fill="#fbd0cc"/><circle cx="38" cy="58" r="2.4" fill="#fbd0cc"/><circle cx="66" cy="60" r="2.8" fill="#fbd0cc"/>`,

    shrimp: (c) => {
      const body = c ? '#f4794b' : '#c3ccd0';
      const stripe = c ? '#fff1e6' : '#e4eaec';
      return `<path d="M62 60 L82 70 L76 50 Z" fill="${body}" ${S}/>` +
        tube('M72 30 C42 14 18 38 30 62 C40 78 60 76 66 62', body, 17, 3) +
        `<path d="M44 24 q2 8 -4 12 M30 36 q6 4 4 12 M28 56 q8 0 10 8 M44 70 q2 -8 10 -8" stroke="${stripe}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` +
        `<circle cx="72" cy="30" r="2.8" fill="${O}"/>` +
        `<path d="M76 28 q10 -6 14 -16" stroke="${O}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    },

    mussel: (c) =>
      `<ellipse cx="50" cy="50" rx="25" ry="39" transform="rotate(30 50 50)" fill="#2f3a63" ${S}/>` +
      `<ellipse cx="52" cy="51" rx="16" ry="29" transform="rotate(30 52 51)" fill="${c ? '#f29445' : '#f4b27a'}" ${st(2.4)}/>` +
      `<path d="M42 38 q10 10 6 26" stroke="${c ? '#d97a2e' : '#e3965a'}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      shine(36, 24, 6, 3, 30, 0.35),

    /* ---------------- freezer meats ---------------- */
    porkbelly: (c) => {
      const meat = c ? '#efd0bd' : '#f08f8f', fat = c ? '#fff6ee' : '#fff0ea';
      return `<g transform="rotate(-12 50 50)">` +
        `<path d="M10 30 Q30 23 50 30 T90 30 L90 70 Q70 77 50 70 T10 70 Z" fill="${meat}"/>` +
        `<path d="M10 42 Q30 35 50 42 T90 42" stroke="${fat}" stroke-width="7" fill="none"/>` +
        `<path d="M10 58 Q30 51 50 58 T90 58" stroke="${fat}" stroke-width="8" fill="none"/>` +
        `<path d="M10 30 Q30 23 50 30 T90 30 L90 70 Q70 77 50 70 T10 70 Z" fill="none" ${S}/></g>`;
    },

    beef: (c) => {
      const meat = c ? '#a46d58' : '#d8414c', marble = c ? '#e6cbbb' : '#fbe1e1';
      return `<g transform="rotate(-15 50 50)">` +
        `<rect x="12" y="28" width="76" height="44" rx="20" fill="${meat}" ${S}/>` +
        `<path d="M24 40 C34 48 44 34 56 44 S74 40 82 48" stroke="${marble}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
        `<path d="M24 58 C36 64 48 52 60 60 S76 58 82 62" stroke="${marble}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        `<path d="M32 29 C27 42 27 58 32 71" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    },

    lamb: (c) =>
      `<circle cx="50" cy="50" r="35" fill="${c ? '#b88a78' : '#e2676a'}" ${S}/>` +
      `<path d="${spiral(50, 50, 3.2, 29)}" stroke="${c ? '#f2e3d7' : '#fde9e4'}" stroke-width="4" fill="none" stroke-linecap="round"/>`,

    chicken: (c) =>
      `<path d="M18 60 C12 34 46 16 70 24 C90 31 92 56 78 70 C61 85 24 83 18 60Z" fill="${c ? '#fbf0e2' : '#f7c3b4'}" ${S}/>` +
      `<path d="M30 58 C42 50 56 44 72 40 M32 68 C46 62 60 58 76 54 M38 46 C48 40 56 36 66 34" stroke="${c ? '#efdccb' : '#fbd9cf'}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  };

  /* ---------------- broth garnishes ---------------- */
  const GARNISH = {
    chili: () =>
      tube('M20 74 C40 70 64 52 74 30', '#d92f22', 13, 3) +
      tube('M74 30 L82 18', '#4e9a3e', 5, 2.5) + shine(40, 64, 8, 2.5, -30, 0.45),
    peppercorn: () =>
      [[38, 50], [58, 44], [52, 64], [68, 62]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="9" fill="#9a3e2c" ${st(3)}/><path d="M${x - 3} ${y - 2} l5 4" stroke="#5c2016" stroke-width="2"/>`).join(''),
    staranise: () =>
      `<polygon points="${star(50, 50, 8, 38, 12)}" fill="#8a4b2c" ${st(3)}/>` +
      `<circle cx="50" cy="50" r="7" fill="#6a3620"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (Math.PI * i) / 4 - Math.PI / 2;
        return `<ellipse cx="${(50 + Math.cos(a) * 24).toFixed(1)}" cy="${(50 + Math.sin(a) * 24).toFixed(1)}" rx="3" ry="2" fill="#d8a46a"/>`;
      }).join(''),
    garlic: () =>
      `<path d="M50 16 C70 30 76 60 66 80 C60 88 40 88 34 80 C24 60 30 30 50 16Z" fill="#fbf6e6" ${S}/>` +
      `<path d="M50 24 C56 40 56 64 52 80" stroke="#ece2c6" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    scallion: () =>
      `<circle cx="38" cy="44" r="16" fill="#eaf7d8" ${st(3)}/><circle cx="38" cy="44" r="9" fill="none" stroke="#6cbf5a" stroke-width="5"/>` +
      `<circle cx="66" cy="62" r="14" fill="#f1fae4" ${st(3)}/><circle cx="66" cy="62" r="7" fill="none" stroke="#7ccb69" stroke-width="4"/>`,
    bone: () =>
      `<path d="M30 30 a10 10 0 1 1 10 -10 L68 58 a10 10 0 1 1 6 18 a10 10 0 1 1 -18 6 L28 44 a10 10 0 1 1 2 -14Z" fill="#fbf4e3" ${S}/>`,
    goji: () =>
      [[34, 46, -20], [58, 40, 25], [48, 64, 70]].map(([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="13" ry="7.5" transform="rotate(${r} ${x} ${y})" fill="#e5412e" ${st(3)}/>`).join(''),
    ginger: () =>
      `<path d="M18 50 C18 26 46 18 62 26 C82 34 86 60 70 74 C52 88 18 78 18 50Z" fill="#f8e29a" ${S}/>` +
      `<path d="M30 52 C40 40 56 38 70 46" stroke="#e9c86a" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    jujube: () =>
      `<ellipse cx="50" cy="52" rx="24" ry="32" fill="#9b2b2b" ${S}/>` +
      `<path d="M40 36 q4 14 0 30 M58 34 q-4 16 2 32" stroke="#6e1b1b" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      shine(42, 40, 6, 3, -40, 0.4),
    tomatoW: () =>
      `<path d="M14 40 A36 36 0 0 0 86 40 Z" fill="#ec4b3c" ${S}/>` +
      `<path d="M24 44 A26 24 0 0 0 76 44 Z" fill="#f78a6a"/>` +
      `<circle cx="38" cy="54" r="3" fill="#ffe1a8"/><circle cx="50" cy="60" r="3" fill="#ffe1a8"/><circle cx="62" cy="54" r="3" fill="#ffe1a8"/>`,
    onion: () =>
      `<path d="M16 64 C16 30 84 30 84 64" stroke="${O}" stroke-width="13" fill="none" stroke-linecap="round"/>` +
      `<path d="M16 64 C16 30 84 30 84 64" stroke="#f2e6f4" stroke-width="7" fill="none" stroke-linecap="round"/>` +
      `<path d="M30 64 C30 44 70 44 70 64" stroke="${O}" stroke-width="11" fill="none" stroke-linecap="round"/>` +
      `<path d="M30 64 C30 44 70 44 70 64" stroke="#c99bd2" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    cilantro: () =>
      tube('M50 90 L50 50 M50 60 L32 40 M50 56 L70 38', '#7cc062', 3, 2) +
      `<circle cx="30" cy="36" r="11" fill="#5fb24f" ${st(3)}/><circle cx="72" cy="34" r="11" fill="#5fb24f" ${st(3)}/><circle cx="50" cy="40" r="12" fill="#6cc35b" ${st(3)}/>`,
  };

  const mascot = (mood = 'happy') => {
    const eyes = mood === 'wow'
      ? `<circle cx="46" cy="56" r="4.5" fill="#4b6694"/><circle cx="74" cy="56" r="4.5" fill="#4b6694"/>`
      : `<path d="M40 58 q6 -7 12 0 M68 58 q6 -7 12 0" stroke="#4b6694" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    const mouth = mood === 'wow'
      ? `<ellipse cx="60" cy="68" rx="4" ry="5" fill="#e86f6f" stroke="#4b6694" stroke-width="2.5"/>`
      : `<path d="M55 66 q5 6 10 0" stroke="#4b6694" stroke-width="3" fill="#e86f6f" stroke-linecap="round" stroke-linejoin="round"/>`;
    return wrap(
      `<path d="M10 70 C10 30 40 14 60 14 C80 14 110 30 110 70 C110 88 90 95 60 95 C30 95 10 88 10 70Z" fill="#fffaf0" stroke="#5a7aa8" stroke-width="4"/>` +
      `<path d="M60 14 C56 22 52 26 44 29 M60 14 C64 22 68 26 76 29 M60 14 L60 27" stroke="#5a7aa8" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="34" cy="70" rx="8" ry="5" fill="#f6b7c0"/><ellipse cx="86" cy="70" rx="8" ry="5" fill="#f6b7c0"/>` +
      eyes + mouth,
      '0 0 120 100');
  };

  const tongs = () =>
    wrap(
      `<g class="arm arm-l"><path d="M27 18 L24 132 Q23 146 27 152 L31 152 Q32 140 31 132 L31 18 Z" fill="#cfd6db" stroke="#6d757c" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M25 136 h6 M25 141 h6 M25 146 h6" stroke="#8a9299" stroke-width="1.6"/>` +
      `<path d="M28 24 L26 120" stroke="#fff" stroke-width="1.6" opacity=".8"/></g>` +
      `<g class="arm arm-r"><path d="M33 18 L36 132 Q37 146 33 152 L29 152 Q28 140 29 132 L29 18 Z" fill="#bfc7cd" stroke="#6d757c" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M29 136 h6 M29 141 h6 M29 146 h6" stroke="#8a9299" stroke-width="1.6"/></g>` +
      `<circle cx="30" cy="12" r="9" fill="none" stroke="#6d757c" stroke-width="6"/>` +
      `<circle cx="30" cy="12" r="9" fill="none" stroke="#dfe5e9" stroke-width="3"/>` +
      `<rect x="24" y="16" width="12" height="10" rx="3" fill="#e47a4e" stroke="#6b4a3a" stroke-width="2"/>`,
      '0 0 60 160');

  window.MALA_ART = { ART, GARNISH, mascot, tongs, wrap };
})();
