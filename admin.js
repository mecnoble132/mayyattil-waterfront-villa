// ============ ADMIN PANEL: manage unavailable dates ============
(function initAdmin() {
  const C = window.VillaCal;
  const cfg = window.VILLA_SUPABASE || {};
  const loginCard = document.getElementById('loginCard');
  const panelCard = document.getElementById('panelCard');
  const loginError = document.getElementById('loginError');
  const toast = document.getElementById('adminToast');

  const configured = cfg.url && cfg.anonKey && !/YOUR_/.test(cfg.url + cfg.anonKey);
  if (!configured || !window.supabase) {
    loginError.textContent = 'Supabase is not configured. Fill in supabase-config.js first.';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }
  const client = window.supabase.createClient(cfg.url, cfg.anonKey);

  const today = C.today();
  const blocked = new Map(); // date -> note
  let rangeMode = false;
  let anchor = null;
  let cal = null;

  function showToast(msg, isError) {
    toast.textContent = msg;
    toast.className = 'admin-toast' + (isError ? ' is-error' : '');
    toast.hidden = false;
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => { toast.hidden = true; }, 3000);
  }

  // ---------- Data ----------
  async function load() {
    const { data, error } = await client.from('blocked_dates').select('date,note').gte('date', today).order('date').limit(5000);
    if (error) { showToast('Could not load dates: ' + error.message, true); return; }
    blocked.clear();
    data.forEach((r) => blocked.set(r.date, r.note || ''));
    refresh();
  }

  async function applyChange(dates, makeBlocked) {
    const snapshot = new Map(blocked);
    const note = document.getElementById('blockNote').value.trim();
    dates.forEach((d) => { if (makeBlocked) blocked.set(d, note); else blocked.delete(d); });
    refresh(); // optimistic

    const res = makeBlocked
      ? await client.from('blocked_dates').upsert(dates.map((d) => ({ date: d, note: note || null })))
      : await client.from('blocked_dates').delete().in('date', dates);

    if (res.error) {
      blocked.clear();
      snapshot.forEach((v, k) => blocked.set(k, v));
      refresh();
      showToast('Save failed: ' + res.error.message, true);
    } else {
      showToast(makeBlocked ? 'Marked unavailable' : 'Marked available');
    }
  }

  // ---------- Calendar ----------
  function datesBetween(a, b) {
    const [from, to] = a <= b ? [a, b] : [b, a];
    const out = [];
    for (let d = from; d <= to; d = C.addDays(d, 1)) if (d >= today) out.push(d);
    return out;
  }

  function onDayClick(d) {
    if (!rangeMode) {
      applyChange([d], !blocked.has(d));
      return;
    }
    if (!anchor) {
      anchor = d;
      refresh();
      return;
    }
    // Range applies the opposite of the anchor's current state.
    const makeBlocked = !blocked.has(anchor);
    const dates = datesBetween(anchor, d);
    anchor = null;
    applyChange(dates, makeBlocked);
  }

  function buildCalendar() {
    cal = C.create(document.getElementById('adminCalendar'), {
      months: window.innerWidth > 700 ? 2 : 1,
      minDate: today,
      dayState(d) {
        if (d < today) return { disabled: true, classes: ['is-past'] };
        const classes = [];
        if (blocked.has(d)) classes.push('is-blocked');
        if (d === today) classes.push('is-today');
        if (d === anchor) classes.push('is-anchor');
        return { classes };
      },
      onDayClick
    });
  }

  // ---------- List of upcoming blocks (consecutive dates grouped) ----------
  function renderList() {
    const list = document.getElementById('blockedList');
    const dates = Array.from(blocked.keys()).sort();
    const groups = [];
    dates.forEach((d) => {
      const g = groups[groups.length - 1];
      if (g && C.addDays(g.last, 1) === d && g.note === blocked.get(d)) g.last = d;
      else groups.push({ first: d, last: d, note: blocked.get(d) });
    });

    list.innerHTML = '';
    if (!groups.length) {
      list.innerHTML = '<p class="admin-hint">Nothing blocked — the villa shows as fully available.</p>';
      return;
    }
    groups.forEach((g) => {
      const row = document.createElement('div');
      row.className = 'admin-row';
      const label = g.first === g.last ? C.display(g.first) : `${C.display(g.first)} → ${C.display(g.last)}`;
      const nights = C.diffDays(g.first, g.last) + 1;
      const span = document.createElement('span');
      span.textContent = `${label} · ${nights} night${nights > 1 ? 's' : ''}`;
      if (g.note) {
        const small = document.createElement('small');
        small.textContent = g.note;
        span.appendChild(small);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Make available';
      btn.addEventListener('click', () => applyChange(datesBetween(g.first, g.last), false));
      row.append(span, btn);
      list.appendChild(row);
    });
  }

  function refresh() {
    if (cal) cal.render();
    renderList();
  }

  // ---------- Mode toggle ----------
  const modeTap = document.getElementById('modeTap');
  const modeRangeBtn = document.getElementById('modeRange');
  const hint = document.getElementById('adminHint');
  function setMode(range) {
    rangeMode = range;
    anchor = null;
    modeTap.classList.toggle('is-active', !range);
    modeRangeBtn.classList.toggle('is-active', range);
    hint.textContent = range
      ? 'Tap the first date, then the last date. If the first date is available the whole range is blocked; if it is blocked the whole range is freed.'
      : 'Tap a date to mark it unavailable (red) or available again. A blocked date means that night is taken; guests can still check out that morning.';
    refresh();
  }
  modeTap.addEventListener('click', () => setMode(false));
  modeRangeBtn.addEventListener('click', () => setMode(true));

  // ---------- Auth ----------
  function showPanel(signedIn) {
    loginCard.hidden = signedIn;
    panelCard.hidden = !signedIn;
    if (signedIn) {
      if (!cal) buildCalendar();
      load();
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const { error } = await client.auth.signInWithPassword({
      email: document.getElementById('adminEmail').value.trim(),
      password: document.getElementById('adminPassword').value
    });
    if (error) loginError.textContent = 'Sign-in failed: ' + error.message;
  });

  document.getElementById('logoutBtn').addEventListener('click', () => client.auth.signOut());

  client.auth.onAuthStateChange((_event, session) => showPanel(!!session));
  client.auth.getSession().then(({ data }) => showPanel(!!data.session));

  if (typeof lucide !== 'undefined') lucide.createIcons();
})();
