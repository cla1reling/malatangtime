/* =========================================================
   Study Malatang — build a bowl, weigh it, study while it cooks.
   Add ?fast to the URL to make 1 study-minute = 1 second (for testing).
   ========================================================= */
(() => {
  const { ART, GARNISH, mascot, tongs: tongsArt, wrap } = window.MALA_ART;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const O = '#6b4a3a';

  const FAST = new URLSearchParams(location.search).has('fast');
  const UNIT_MS = FAST ? 1000 : 60000;
  const STORE_KEY = 'study-malatang-v1';
  const MAX_ITEMS = 90;

  /* ---------------- data ----------------
     Weights are rough real-life grams for ONE grab with the tongs. */
  const BROTHS = [
    { id: 'mala', name: 'Classic Mala', cn: '经典麻辣', color: '#d5432b', dots: '#f08a3a', spice: 3,
      desc: 'Chili oil, Sichuan peppercorn & star anise. Numbing and hot.',
      garnish: ['chili', 'peppercorn', 'staranise', 'chili', 'garlic'] },
    { id: 'bone', name: 'Bone Broth', cn: '骨汤', color: '#f3e8d2', dots: '#fffaf0', spice: 0,
      desc: 'Milky pork bone soup simmered for hours. Gentle and rich.',
      garnish: ['bone', 'goji', 'ginger', 'scallion', 'jujube'] },
    { id: 'tomato', name: 'Tomato Broth', cn: '番茄汤', color: '#ec6a3a', dots: '#f9a06a', spice: 0,
      desc: 'Sweet and tangy stewed tomatoes. A fan favorite.',
      garnish: ['tomatoW', 'onion', 'tomatoW', 'scallion', 'cilantro'] },
    { id: 'mushroom', name: 'Mushroom Broth', cn: '菌菇汤', color: '#bf9255', dots: '#e0b979', spice: 0,
      desc: 'Earthy wild mushroom stock with a little goji.',
      garnish: ['shiitake', 'enoki', 'kingoyster', 'goji', 'scallion'] },
  ];

  const ITEMS = {
    shiitake: ['Shiitake', 15], enoki: ['Enoki', 40], shimeji: ['Shimeji', 30], kingoyster: ['King oyster', 25],
    woodear: ['Wood ear', 10], napa: ['Napa', 30], bokchoy: ['Bok choy', 35], lettuce: ['Lettuce', 15],
    spinach: ['Spinach', 20], broccoli: ['Broccoli', 20], corn: ['Corn', 60], tomato: ['Tomato', 40],
    lotus: ['Lotus root', 15], potato: ['Potato', 15], kelp: ['Kelp knot', 10], tofu: ['Tofu', 30],
    tofupuff: ['Tofu puff', 8], frozentofu: ['Frozen tofu', 20], fishtofu: ['Fish tofu', 20],
    bamboo: ['Bamboo shoot', 25], udon: ['Udon', 200], glass: ['Glass noodles', 50], ricecake: ['Rice cake', 20],
    egg: ['Egg', 50], quail: ['Quail eggs', 30], fishball: ['Fish ball', 15], beefball: ['Beef ball', 18],
    crab: ['Crab stick', 15], luncheon: ['Luncheon', 25], shrimp: ['Shrimp', 15], mussel: ['Mussel', 20],
    octopus: ['Baby octopus', 25],
    porkbelly: ['Pork belly', 20], beef: ['Beef', 15], lamb: ['Lamb', 15], chicken: ['Chicken', 20],
  };

  const SHELVES = [
    ['shiitake', 'enoki', 'shimeji', 'kingoyster', 'woodear', 'napa', 'bokchoy', 'lettuce'],
    ['spinach', 'broccoli', 'corn', 'tomato', 'lotus', 'potato', 'kelp', 'ricecake'],
    ['tofu', 'tofupuff', 'frozentofu', 'fishtofu', 'bamboo', 'udon', 'glass', 'egg'],
    ['quail', 'fishball', 'beefball', 'crab', 'luncheon', 'shrimp', 'mussel', 'octopus'],
  ];
  const MEATS = ['porkbelly', 'beef', 'lamb', 'chicken'];

  const SPEECH = {
    broth: ['Welcome in! Pick a soup base~', 'happy'],
    shelf: ['Grab whatever looks yummy with the tongs!', 'happy'],
    freezer: ['Brrr! Slide a freezer door open ❄', 'wow'],
    weigh: ['Onto the scale… heavier bowl, longer study!', 'wow'],
    sauce: ['Sauce time! Mix your perfect dip 🥢', 'happy'],
    cook: ['Study while it simmers. I’ll watch the pot 📚', 'happy'],
    done: ['Ding! It’s ready. Enjoy~ 慢慢吃!', 'happy'],
  };

  /* ---------------- state ---------------- */
  const state = {
    stage: 'broth',
    broth: null,
    bowl: [], // {uid, id, bx, by, br, px, py}
    rate: 10,
    timer: null, // {totalMs, endAt, pausedLeft, minutes, grams, done}
    sauce: [],
  };
  let uid = 0;
  let tick = null;

  const save = () => {
    try {
      if (state.timer) localStorage.setItem(STORE_KEY, JSON.stringify({
        broth: state.broth, bowl: state.bowl, rate: state.rate, timer: state.timer, sauce: state.sauce,
      }));
      else localStorage.removeItem(STORE_KEY);
    } catch (e) { /* storage unavailable */ }
  };
  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; }
  };

  /* ---------------- helpers ---------------- */
  const rand = (a, b) => a + Math.random() * (b - a);
  const art = (id, cooked = false) => wrap((ART[id] || GARNISH[id])(cooked));
  const grams = () => state.bowl.reduce((s, p) => s + ITEMS[p.id][1], 0);
  const broth = () => BROTHS.find((b) => b.id === state.broth);
  const fmtClock = (ms) => {
    const t = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };
  const fmtMins = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
  };
  const studyMinutes = (g, rate) => Math.min(300, Math.max(1, Math.round(g / rate)));

  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.hidden = true), 2200);
  }

  /* ---------------- sound (tiny WebAudio blips) ---------------- */
  let actx;
  function blip(freqs, dur = 0.12, type = 'sine', vol = 0.08) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = actx.currentTime;
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f, t0 + i * dur);
        g.gain.setValueAtTime(0.0001, t0 + i * dur);
        g.gain.exponentialRampToValueAtTime(vol, t0 + i * dur + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * dur + dur * 1.8);
        o.connect(g).connect(actx.destination);
        o.start(t0 + i * dur);
        o.stop(t0 + i * dur + dur * 2);
      });
    } catch (e) { /* audio unavailable */ }
  }
  const plop = () => blip([520, 330], 0.06, 'sine', 0.06);
  const chime = () => blip([784, 988, 1175, 1568], 0.18, 'triangle', 0.12);

  /* ---------------- bowl / pot drawings ---------------- */
  const basketBack =
    `<svg class="b-back" viewBox="0 0 300 180" aria-hidden="true">
      <ellipse cx="150" cy="62" rx="132" ry="34" fill="#ea9894" stroke="${O}" stroke-width="4"/>
      <ellipse cx="150" cy="68" rx="112" ry="24" fill="#de7f7c" opacity=".55"/>
      <path d="M18 62 A132 34 0 0 1 282 62" fill="none" stroke="${O}" stroke-width="15"/>
      <path d="M18 62 A132 34 0 0 1 282 62" fill="none" stroke="#fcd6d2" stroke-width="8"/>
    </svg>`;
  const basketFront = (() => {
    let holes = '';
    [[114, 70, 230], [136, 78, 222], [156, 92, 208]].forEach(([y, x0, x1]) => {
      for (let x = x0; x <= x1; x += 19) holes += `<rect x="${x - 6}" y="${y - 5}" width="12" height="10" rx="4" fill="#fbd3cf"/>`;
    });
    return `<svg class="b-front" viewBox="0 0 300 180" aria-hidden="true">
      <path d="M18 62 A132 34 0 0 0 282 62 L262 152 Q258 172 236 172 L64 172 Q42 172 38 152 Z" fill="#f6b2ae" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      ${holes}
      <path d="M40 104 Q46 140 62 160" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".45"/>
      <path d="M18 62 A132 34 0 0 0 282 62" fill="none" stroke="${O}" stroke-width="15"/>
      <path d="M18 62 A132 34 0 0 0 282 62" fill="none" stroke="#fcd6d2" stroke-width="8"/>
    </svg>`;
  })();

  function potBack(b, big = false) {
    let dots = '';
    const n = b.id === 'bone' ? 7 : 14;
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 0.9;
      dots += `<ellipse cx="${(150 + Math.cos(a) * 100 * r).toFixed(1)}" cy="${(86 + Math.sin(a) * 28 * r).toFixed(1)}" rx="${rand(3, 7).toFixed(1)}" ry="${rand(1.5, 3).toFixed(1)}" fill="${b.dots}" opacity=".85"/>`;
    }
    return `<svg class="p-back" viewBox="0 0 300 210" aria-hidden="true">
      <path d="M32 74 C2 70 2 108 32 106" fill="none" stroke="${O}" stroke-width="17" stroke-linecap="round"/>
      <path d="M32 74 C2 70 2 108 32 106" fill="none" stroke="#3b3536" stroke-width="9" stroke-linecap="round"/>
      <path d="M268 74 C298 70 298 108 268 106" fill="none" stroke="${O}" stroke-width="17" stroke-linecap="round"/>
      <path d="M268 74 C298 70 298 108 268 106" fill="none" stroke="#3b3536" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="150" cy="80" rx="125" ry="42" fill="#3b3536" stroke="${O}" stroke-width="4"/>
      <ellipse cx="150" cy="82" rx="114" ry="36" fill="#221e1f"/>
      <ellipse class="broth-surface" cx="150" cy="87" rx="110" ry="32" fill="${b.color}"/>
      <ellipse cx="150" cy="80" rx="96" ry="20" fill="#fff" opacity=".10"/>
      ${dots}
      ${big ? '' : ''}
    </svg>`;
  }
  const potFront =
    `<svg class="p-front" viewBox="0 0 300 210" aria-hidden="true">
      <path d="M25 80 A125 42 0 0 0 275 80 L266 150 Q258 196 150 198 Q42 196 34 150 Z" fill="#3b3536" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 128 Q58 170 104 184" stroke="#6f6768" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M28 84 A122 40 0 0 0 272 84" fill="none" stroke="#5c5455" stroke-width="5"/>
    </svg>`;

  /* ---------------- 1. broth ---------------- */
  const GARNISH_SPOTS = [[108, 82], [176, 74], [144, 98], [204, 94], [92, 100], [150, 70]];
  function renderBroths() {
    $('#brothGrid').innerHTML = BROTHS.map((b) => {
      const g = b.garnish.map((id, i) => {
        const [x, y] = GARNISH_SPOTS[i];
        return `<span class="garnish" style="left:${(x / 300) * 100}%;top:${(y / 210) * 100}%;--r:${Math.round(rand(-40, 40))}deg">${art(id)}</span>`;
      }).join('');
      const chilis = b.spice ? '🌶️'.repeat(b.spice) : 'mild';
      return `<button class="broth-card" data-broth="${b.id}" aria-pressed="false">
        <div class="pot small">${potBack(b)}<div class="garnishes">${g}</div>${potFront}</div>
        <h3>${b.name} <span class="cn">${b.cn}</span></h3>
        <p>${b.desc}</p>
        <span class="spice">${chilis}</span>
      </button>`;
    }).join('');
    $$('.broth-card').forEach((card) =>
      card.addEventListener('click', () => {
        state.broth = card.dataset.broth;
        $$('.broth-card').forEach((c) => c.setAttribute('aria-pressed', c === card));
        $('#toShelf').disabled = false;
        say(`${broth().name}, great choice! Now grab some veggies →`, 'happy');
        blip([660, 880], 0.07);
      })
    );
  }

  /* ---------------- 2. shelf ---------------- */
  function trayPieces(id, n = 3) {
    const spots = [[30, 58, -18], [68, 54, 16], [48, 36, 4], [50, 66, -6]];
    return spots.slice(0, n).map(([x, y, r]) =>
      `<span class="tray-piece" style="left:${x}%;top:${y}%;--r:${r}deg">${art(id)}</span>`).join('');
  }
  function renderShelves() {
    $('#shelves').innerHTML = SHELVES.map((row) =>
      `<div class="shelf-row">${row.map((id) =>
        `<button class="tray grab" data-id="${id}" aria-label="Add ${ITEMS[id][0]} to bowl">
          <span class="tray-box">${trayPieces(id)}</span>
          <span class="tag">${ITEMS[id][0]}</span>
        </button>`).join('')}</div>`
    ).join('');
  }

  /* ---------------- 3. freezer ---------------- */
  function renderFreezer() {
    $('#compartments').innerHTML = MEATS.map((id) => {
      let slices = '';
      for (let i = 0; i < 6; i++) {
        const col = i % 2, row = Math.floor(i / 2);
        slices += `<span class="slice" style="left:${32 + col * 36}%;top:${26 + row * 24}%;--r:${Math.round(rand(-14, 14))}deg">${art(id)}</span>`;
      }
      return `<button class="compartment grab" data-id="${id}" aria-label="Add ${ITEMS[id][0]} to bowl">
        <span class="slices">${slices}</span>
        <span class="tag frosty">${ITEMS[id][0]}</span>
      </button>`;
    }).join('');

    const fz = $('#freezer');
    const setDoor = (side) => {
      const next = fz.dataset.open === side ? '' : side;
      fz.dataset.open = next;
      $('#doorL').setAttribute('aria-label', next === 'left' ? 'Close left door' : 'Slide left door open');
      $('#doorR').setAttribute('aria-label', next === 'right' ? 'Close right door' : 'Slide right door open');
      if (next) {
        const fog = $('#fog');
        fog.className = `fog puff-${next}`;
        void fog.offsetWidth;
        fog.classList.add('go');
        blip([180, 140], 0.1, 'triangle', 0.05);
      }
    };
    $('#doorL').addEventListener('click', () => setDoor('left'));
    $('#doorR').addEventListener('click', () => setDoor('right'));
  }

  /* ---------------- the customer's bowl ---------------- */
  function basketPos(i) {
    const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 0.85;
    const lvl = Math.min(56, Math.floor(i / 7) * 6.5);
    return {
      bx: ((150 + Math.cos(a) * 112 * r) / 300) * 100,
      by: ((62 + Math.sin(a) * 24 * r - lvl) / 180) * 100,
      br: Math.round(rand(-40, 40)),
    };
  }
  function potPos(i) {
    const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 0.92;
    const lvl = Math.min(40, Math.floor(i / 9) * 5);
    return {
      px: ((150 + Math.cos(a) * 100 * r) / 300) * 100,
      py: ((92 + Math.sin(a) * 24 * r - lvl) / 210) * 100,
    };
  }
  const basketPieceHTML = (p, i, extra = '') =>
    `<span class="piece ${extra}" data-uid="${p.uid}" style="left:${p.bx}%;top:${p.by}%;--r:${p.br}deg;z-index:${i + 1}">${art(p.id)}</span>`;

  function basketHTML(list) {
    return `<div class="basket">${basketBack}<div class="pile">${list.map((p, i) => basketPieceHTML(p, i)).join('')}</div>${basketFront}</div>`;
  }
  function renderCounterBasket() {
    $('#basketSlot').innerHTML = basketHTML(state.bowl);
    updateCount();
  }
  function updateCount() {
    const n = state.bowl.length;
    $('#bowlCount').textContent = n ? `${n} item${n > 1 ? 's' : ''}` : 'Empty bowl';
    $('#undoBtn').disabled = !n;
  }
  function addItem(id) {
    if (state.bowl.length >= MAX_ITEMS) { toast('Your bowl is overflowing! 🥣'); return false; }
    const p = { uid: ++uid, id, ...basketPos(state.bowl.length) };
    state.bowl.push(p);
    const pile = $('#basketSlot .pile');
    if (pile) pile.insertAdjacentHTML('beforeend', basketPieceHTML(p, state.bowl.length - 1, 'drop'));
    updateCount();
    plop();
    const b = $('#basketSlot .basket');
    if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    return true;
  }
  $('#undoBtn').addEventListener('click', () => {
    const p = state.bowl.pop();
    if (!p) return;
    const el = $(`#basketSlot .piece[data-uid="${p.uid}"]`);
    if (el) el.remove();
    updateCount();
  });

  /* ---------------- tongs drag & drop ---------------- */
  const tongsEl = $('#tongs');
  const heldEl = $('#held');
  tongsEl.innerHTML = tongsArt();
  let drag = null;

  const tongsStage = () => state.stage === 'shelf' || state.stage === 'freezer';
  function moveTongs(x, y) {
    tongsEl.style.transform = `translate(${x - 30}px, ${y - 150}px)`;
    heldEl.style.transform = `translate(${x - 34}px, ${y - 46}px)`;
  }
  function overBasket(x, y) {
    const b = $('#basketSlot .basket');
    if (!b) return false;
    const r = b.getBoundingClientRect();
    const pad = 28;
    return x > r.left - pad && x < r.right + pad && y > r.top - pad * 2 && y < r.bottom + pad;
  }

  window.addEventListener('pointermove', (e) => {
    const inZone = tongsStage() && !!e.target.closest?.('[data-tongs]');
    const show = drag || (inZone && e.pointerType === 'mouse');
    tongsEl.classList.toggle('show', !!show);
    if (show) moveTongs(e.clientX, e.clientY);
    if (drag) {
      const b = $('#basketSlot .basket');
      if (b) b.classList.toggle('hover', overBasket(e.clientX, e.clientY));
    }
  }, { passive: true });

  document.addEventListener('pointerdown', (e) => {
    const g = e.target.closest('.grab');
    if (!g || !tongsStage() || e.button > 0) return;
    e.preventDefault();
    drag = { id: g.dataset.id, pid: e.pointerId };
    heldEl.innerHTML = art(drag.id);
    heldEl.className = 'held show';
    tongsEl.classList.add('show', 'closed');
    moveTongs(e.clientX, e.clientY);
    g.classList.add('picked');
    setTimeout(() => g.classList.remove('picked'), 250);
  });

  function endDrag(e, cancelled) {
    if (!drag) return;
    const ok = !cancelled && overBasket(e.clientX, e.clientY);
    const b = $('#basketSlot .basket');
    if (b) b.classList.remove('hover');
    if (ok) {
      addItem(drag.id);
      heldEl.className = 'held';
    } else {
      heldEl.className = 'held show miss';
      setTimeout(() => (heldEl.className = 'held'), 300);
    }
    tongsEl.classList.remove('closed');
    if (e.pointerType !== 'mouse') tongsEl.classList.remove('show');
    drag = null;
  }
  window.addEventListener('pointerup', (e) => endDrag(e, false));
  window.addEventListener('pointercancel', (e) => endDrag(e, true));
  document.addEventListener('mouseleave', () => tongsEl.classList.remove('show'));

  // keyboard: Enter/Space on a tray drops one straight in
  document.addEventListener('click', (e) => {
    const g = e.target.closest('.grab');
    if (g && e.detail === 0 && tongsStage()) addItem(g.dataset.id);
  });

  /* ---------------- 4. weigh ---------------- */
  function renderWeigh() {
    const total = grams();
    $('#scaleBowl').innerHTML = basketHTML(state.bowl);
    $('#lcd').textContent = '0';
    $('#scale').classList.remove('loaded');
    const sb = $('#scaleBowl');
    sb.classList.remove('arrive');
    void sb.offsetWidth;
    sb.classList.add('arrive');

    // receipt
    const counts = {};
    state.bowl.forEach((p) => (counts[p.id] = (counts[p.id] || 0) + 1));
    $('#receiptBroth').textContent = `${broth().name} base`;
    $('#receiptList').innerHTML = Object.entries(counts).map(([id, n]) =>
      `<li><span class="ri">${art(id)}</span><span class="rn">${ITEMS[id][0]} <em>× ${n}</em></span><span class="rg">${n * ITEMS[id][1]} g</span></li>`
    ).join('');
    $('#receiptGrams').textContent = `${total} g`;
    $(`input[name="rate"][value="${state.rate}"]`).checked = true;
    $('#studyTime').textContent = '…';
    $('#startCook').disabled = true;

    setTimeout(() => {
      $('#scale').classList.add('loaded');
      const t0 = performance.now(), dur = 1300;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        const wobble = k < 1 ? Math.round(Math.sin(k * 20) * 6 * (1 - k)) : 0;
        $('#lcd').textContent = Math.max(0, Math.round(total * eased) + wobble);
        if (k < 1 && state.stage === 'weigh') requestAnimationFrame(step);
        else { updateStudyTime(); $('#startCook').disabled = false; blip([880], 0.08); }
      };
      requestAnimationFrame(step);
    }, 900);
  }
  function updateStudyTime() {
    const m = studyMinutes(grams(), state.rate);
    $('#studyTime').textContent = fmtMins(m) + (FAST ? ' (fast mode: seconds)' : '');
  }
  $$('input[name="rate"]').forEach((r) =>
    r.addEventListener('change', () => { state.rate = Number(r.value); updateStudyTime(); }));

  /* ---------------- 5. cook ---------------- */
  function renderPot() {
    const b = broth();
    let bubbles = '';
    for (let i = 0; i < 26; i++) {
      const a = rand(0, Math.PI * 2), r = Math.sqrt(Math.random()) * 0.92;
      bubbles += `<i style="left:${((150 + Math.cos(a) * 100 * r) / 300) * 100}%;top:${((87 + Math.sin(a) * 27 * r) / 210) * 100}%;--s:${rand(0.6, 1.4).toFixed(2)};--d:${rand(0, 2).toFixed(2)}s"></i>`;
    }
    const pieces = state.bowl.map((p, i) =>
      `<span class="piece" style="left:${p.px}%;top:${p.py}%;--r:${p.br}deg;z-index:${i + 1}">
        <span class="bob" style="--d:${rand(0, 3).toFixed(2)}s">
          <span class="raw">${art(p.id)}</span><span class="ck">${art(p.id, true)}</span>
        </span></span>`).join('');
    const steam = [0, 1, 2].map((i) =>
      `<svg class="steam-w" style="--i:${i}" viewBox="0 0 40 120" aria-hidden="true"><path d="M20 115 C5 95 35 80 20 60 C5 40 35 25 20 5" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`).join('');
    $('#potWrap').innerHTML =
      `<div class="pot big" id="pot">${potBack(b, true)}<div class="bubbles">${bubbles}</div><div class="pile">${pieces}</div>${potFront}<div class="steam">${steam}</div></div>`;
  }

  function startCooking() {
    const g = grams();
    const minutes = studyMinutes(g, state.rate);
    const totalMs = minutes * UNIT_MS;
    state.bowl.forEach((p, i) => Object.assign(p, potPos(i)));
    state.sauce = window.SauceBar ? window.SauceBar.get() : [];
    state.timer = { totalMs, endAt: Date.now() + totalMs, pausedLeft: null, minutes, grams: g, done: false };
    save();
    try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
    go('cook');
  }

  function enterCook() {
    renderPot();
    const dip = $('#dip');
    const hasDip = window.SauceBar && state.sauce && state.sauce.length;
    dip.hidden = !hasDip;
    dip.innerHTML = hasDip ? window.SauceBar.bowlSVG(state.sauce, 'dipClip') + '<span>your dip</span>' : '';
    const t = state.timer;
    const d = new Date();
    $('#timerDate').textContent = d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', weekday: 'short' }).toUpperCase();
    $('#timerInfo').innerHTML =
      `<div><span>Broth</span><strong>${broth().name}</strong></div>` +
      `<div><span>Bowl</span><strong>${t.grams} g · ${state.bowl.length} items</strong></div>` +
      `<div><span>Study</span><strong>${fmtMins(t.minutes)}${FAST ? ' (fast)' : ''}</strong></div>`;
    $('#enjoy').hidden = true;
    $('#doneActions').hidden = true;
    $('#timerActions').hidden = false;
    $('#stage-cook').classList.remove('done', 'paused');
    $('#pauseBtn').textContent = t.pausedLeft != null ? 'Resume' : 'Pause';
    $('#stage-cook').classList.toggle('paused', t.pausedLeft != null);
    clearInterval(tick);
    if (t.done) { finish(true); return; }
    update();
    tick = setInterval(update, 250);
  }

  const RING_C = 2 * Math.PI * 88;
  function update() {
    const t = state.timer;
    if (!t) return;
    const left = t.pausedLeft != null ? t.pausedLeft : t.endAt - Date.now();
    const prog = Math.min(1, Math.max(0, 1 - left / t.totalMs));
    $('#clock').textContent = fmtClock(left);
    $('#ringFg').style.strokeDashoffset = (RING_C * (1 - prog)).toFixed(1);
    const pot = $('#pot');
    if (pot) pot.style.setProperty('--cook', prog.toFixed(3));
    const msgs = ['adding broth…', 'warming up…', 'simmering…', 'bubbling away…', 'almost ready!'];
    $('#clockSub').textContent = t.pausedLeft != null ? 'paused' : msgs[Math.min(4, Math.floor(prog * 5))];
    document.title = `${fmtClock(left)} · Study Malatang`;
    if (left <= 0 && t.pausedLeft == null) finish(false);
  }

  function finish(restored) {
    clearInterval(tick);
    const t = state.timer;
    t.done = true;
    save();
    const pot = $('#pot');
    if (pot) pot.style.setProperty('--cook', '1');
    $('#clock').textContent = '00:00';
    $('#clockSub').textContent = 'done!';
    $('#ringFg').style.strokeDashoffset = '0';
    $('#stage-cook').classList.remove('paused');
    $('#stage-cook').classList.add('done');
    $('#enjoy').hidden = false;
    $('#timerActions').hidden = true;
    $('#doneActions').hidden = false;
    $('#doneText').innerHTML = `You studied for <strong>${fmtMins(t.minutes)}</strong>. Your ${t.grams} g bowl of ${broth().name.toLowerCase()} malatang is ready!`;
    document.title = 'Enjoy! 🍲 · Study Malatang';
    say(...SPEECH.done);
    if (!restored) {
      chime();
      try {
        if ('Notification' in window && Notification.permission === 'granted')
          new Notification('Your malatang is ready! 🍲', { body: `${fmtMins(t.minutes)} of studying done. Enjoy!` });
      } catch (e) {}
    }
  }

  $('#pauseBtn').addEventListener('click', () => {
    const t = state.timer;
    if (!t || t.done) return;
    if (t.pausedLeft == null) {
      t.pausedLeft = Math.max(0, t.endAt - Date.now());
      $('#pauseBtn').textContent = 'Resume';
      $('#stage-cook').classList.add('paused');
      say('Taking a break? The flame is on low.', 'wow');
    } else {
      t.endAt = Date.now() + t.pausedLeft;
      t.pausedLeft = null;
      $('#pauseBtn').textContent = 'Pause';
      $('#stage-cook').classList.remove('paused');
      say(...SPEECH.cook);
    }
    save();
    update();
  });
  $('#stopBtn').addEventListener('click', () => {
    if (confirm('Give up this session? Your bowl will be thrown out 😢')) reset();
  });
  $('#againBtn').addEventListener('click', reset);

  function reset() {
    clearInterval(tick);
    state.broth = null;
    state.bowl = [];
    state.timer = null;
    state.sauce = [];
    if (window.SauceBar) window.SauceBar.reset();
    save();
    $$('.broth-card').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    $('#toShelf').disabled = true;
    $('#freezer').dataset.open = '';
    document.title = 'Malatang Study Timer';
    go('broth');
  }

  /* ---------------- navigation ---------------- */
  const ORDER = ['broth', 'shelf', 'freezer', 'weigh', 'sauce', 'cook'];
  function say(text, mood = 'happy') {
    $('#bubble').textContent = text;
    $('#mascot').innerHTML = mascot(mood);
    const m = $('#mascot');
    m.classList.remove('hop');
    void m.offsetWidth;
    m.classList.add('hop');
  }
  function go(stage) {
    state.stage = stage;
    $$('.stage').forEach((s) => (s.hidden = s.dataset.stage !== stage));
    const idx = ORDER.indexOf(stage);
    $$('#steps li').forEach((li, i) => {
      li.classList.toggle('active', i === idx);
      li.classList.toggle('done', i < idx);
    });
    const counter = stage === 'shelf' || stage === 'freezer';
    $('#counter').hidden = !counter;
    document.body.classList.toggle('has-counter', counter);
    if (counter) {
      renderCounterBasket();
      $('#counterNext').textContent = stage === 'shelf' ? 'Next: meats →' : 'Weigh it →';
    }
    const tray = stage === 'sauce';
    $('#sauceTray').hidden = !tray;
    document.body.classList.toggle('has-sauce-tray', tray);
    if (!tray) { const tip = $('#sauceTip'); if (tip) tip.hidden = true; }
    if (tray && window.SauceBar) window.SauceBar.enter();
    tongsEl.classList.remove('show');
    if (stage === 'weigh') renderWeigh();
    if (stage === 'cook') enterCook();
    if (!(stage === 'cook' && state.timer && state.timer.done)) say(...SPEECH[stage]);
    // the sauce bar is tall, so jump straight to it instead of the page header
    const top = stage === 'sauce' ? Math.max(0, $('#stage-sauce').getBoundingClientRect().top + window.scrollY - 6) : 0;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  $('#toShelf').addEventListener('click', () => state.broth && go('shelf'));
  $('#counterBack').addEventListener('click', () => go(state.stage === 'shelf' ? 'broth' : 'shelf'));
  $('#counterNext').addEventListener('click', () => {
    if (state.stage === 'shelf') return go('freezer');
    if (!state.bowl.length) return toast('Your bowl is empty! Grab something first 🥢');
    go('weigh');
  });
  $('#backToShelf').addEventListener('click', () => go('shelf'));
  $('#startCook').addEventListener('click', () => go('sauce'));
  if (window.SauceBar) {
    window.SauceBar.onDone = startCooking;
    window.SauceBar.onBack = () => go('weigh');
  }
  $$('#steps li').forEach((li, i) =>
    li.addEventListener('click', () => {
      const cur = ORDER.indexOf(state.stage);
      if (state.stage === 'cook' || i >= cur) return; // only go back, never leave the stove
      go(ORDER[i]);
    }));

  /* ---------------- boot ---------------- */
  renderBroths();
  renderShelves();
  renderFreezer();

  const saved = load();
  if (saved && saved.timer && BROTHS.some((b) => b.id === saved.broth)) {
    state.broth = saved.broth;
    state.bowl = saved.bowl || [];
    state.rate = saved.rate || 10;
    state.timer = saved.timer;
    state.sauce = saved.sauce || [];
    if (window.SauceBar) window.SauceBar.set(state.sauce);
    uid = state.bowl.reduce((m, p) => Math.max(m, p.uid || 0), 0);
    go('cook');
  } else {
    go('broth');
  }
})();
