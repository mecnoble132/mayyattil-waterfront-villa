// ============ LIVE AVAILABILITY + WHATSAPP BOOKING REQUEST ============
// Depends on: calendar.js (VillaCal), supabase-config.js, supabase-js (all optional-safe).
(function initAvailability() {
  const calRoot = document.getElementById('availCalendar');
  const form = document.getElementById('availabilityForm');
  if (!calRoot || !form || !window.VillaCal) return;

  const C = window.VillaCal;
  const banner = document.getElementById('availBanner');
  const bannerText = document.getElementById('availBannerText');
  const bannerIcon = document.getElementById('availBannerIcon');
  const summaryIn = document.getElementById('summaryIn');
  const summaryOut = document.getElementById('summaryOut');
  const summaryNights = document.getElementById('summaryNights');
  const suggestBox = document.getElementById('availSuggest');
  const suggestChips = document.getElementById('suggestChips');
  const clearBtn = document.getElementById('availClear');

  const PHONE = '919495840641';
  const today = C.today();

  let blocked = new Set();
  let offline = false;
  let start = null;
  let end = null;

  // ---------- Supabase ----------
  const cfg = window.VILLA_SUPABASE || {};
  const configured = cfg.url && cfg.anonKey && !/YOUR_/.test(cfg.url + cfg.anonKey);
  const client = configured && window.supabase ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;

  async function loadBlocked() {
    if (!client) { offline = true; return; }
    try {
      const { data, error } = await client.from('blocked_dates').select('date').gte('date', today).limit(5000);
      if (error) throw error;
      offline = false;
      blocked = new Set(data.map((r) => r.date));
    } catch (err) {
      offline = true;
    }
  }

  // ---------- Availability logic ----------
  function nightsOf(a, b) {
    const out = [];
    for (let d = a; d < b; d = C.addDays(d, 1)) out.push(d);
    return out;
  }

  function conflictsIn(a, b, set) {
    return nightsOf(a, b).filter((d) => set.has(d));
  }

  // Nearest free windows of the same length, alternating after/before the requested start.
  function findNearbyWindows(startISO, nights, set, limit = 4, horizon = 60) {
    const found = [];
    const overlaps = (s) => found.some((w) => s < w.end && C.addDays(s, nights) > w.start);
    for (let off = 1; off <= horizon && found.length < limit; off++) {
      [off, -off].forEach((o) => {
        if (found.length >= limit) return;
        const s = C.addDays(startISO, o);
        if (s < today) return;
        const e = C.addDays(s, nights);
        if (conflictsIn(s, e, set).length || overlaps(s)) return;
        found.push({ start: s, end: e });
      });
    }
    return found;
  }

  // ---------- Calendar ----------
  const cal = C.create(calRoot, {
    months: 1,
    minDate: today,
    dayState(d) {
      if (d < today) return { disabled: true, classes: ['is-past'] };
      const classes = [];
      if (blocked.has(d)) classes.push('is-blocked');
      if (d === today) classes.push('is-today');
      if (start && d === start) classes.push('is-start');
      if (start && end && d === start) classes.push('has-range');
      if (end && d === end) classes.push('is-end');
      if (start && end && d > start && d < end) classes.push('is-range');
      return { classes };
    },
    onDayClick(d) {
      if (!start || end || d <= start) {
        start = d;
        end = null;
      } else {
        end = d;
      }
      evaluate();
    }
  });

  // ---------- UI ----------
  function setBanner(kind, icon, html) {
    banner.className = `avail-banner is-${kind}`;
    bannerText.innerHTML = html;
    bannerIcon.setAttribute('data-lucide', icon);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function renderSuggestions(list, nights) {
    suggestChips.innerHTML = '';
    if (!list.length) {
      suggestBox.hidden = true;
      return;
    }
    list.forEach((w) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'suggest-chip';
      b.textContent = `${C.short(w.start)} → ${C.short(w.end)}`;
      b.title = `${nights} night${nights > 1 ? 's' : ''}`;
      b.addEventListener('click', () => {
        start = w.start;
        end = w.end;
        cal.showMonthOf(start);
        evaluate();
      });
      suggestChips.appendChild(b);
    });
    suggestBox.hidden = false;
  }

  function evaluate() {
    summaryIn.textContent = start ? C.display(start) : '—';
    summaryOut.textContent = end ? C.display(end) : '—';
    clearBtn.hidden = !start;
    form.hidden = true;
    renderSuggestions([], 0);

    let nights = 0;
    if (start && end) {
      nights = C.diffDays(start, end);
      summaryNights.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
    } else {
      summaryNights.textContent = '—';
    }
    const nightsLabel = `${nights} night${nights > 1 ? 's' : ''}`;

    if (!start) {
      setBanner('info', 'calendar', offline
        ? 'Live availability is unavailable right now. Pick your dates and we will confirm on WhatsApp.'
        : 'Select your check-in date, then your check-out date.');
    } else if (!end) {
      if (!offline && blocked.has(start)) {
        setBanner('bad', 'x-circle', `<strong>${C.short(start)}</strong> is already booked. Please choose another check-in date.`);
      } else {
        setBanner('info', 'calendar', 'Now select your check-out date.');
      }
    } else if (offline) {
      setBanner('info', 'calendar', `${C.short(start)} → ${C.short(end)} · ${nightsLabel}. We will confirm availability on WhatsApp.`);
      form.hidden = false;
    } else {
      const clash = conflictsIn(start, end, blocked);
      if (clash.length) {
        const shown = clash.slice(0, 3).map(C.short).join(', ');
        const more = clash.length > 3 ? ` +${clash.length - 3} more` : '';
        const near = findNearbyWindows(start, nights, blocked);
        setBanner('bad', 'x-circle', `Sorry, the villa is <strong>not available</strong> on ${shown}${more}.` +
          (near.length ? '' : ' Try different dates or message us on WhatsApp.'));
        renderSuggestions(near, nights);
      } else {
        setBanner('good', 'check-circle-2', `<strong>Available!</strong> ${C.short(start)} → ${C.short(end)} · ${nightsLabel}. Fill in your details below.`);
        form.hidden = false;
      }
    }
    cal.render();
  }

  clearBtn.addEventListener('click', () => {
    start = null;
    end = null;
    evaluate();
  });

  // ---------- Guest counters ----------
  function setupCounter(decrId, incrId, valId, hiddenId, min, max) {
    const decr = document.getElementById(decrId);
    const incr = document.getElementById(incrId);
    const val = document.getElementById(valId);
    const hidden = document.getElementById(hiddenId);
    if (!decr || !incr || !val || !hidden) return;
    const set = (n) => {
      val.textContent = n;
      hidden.value = n;
      decr.disabled = n <= min;
      incr.disabled = n >= max;
    };
    decr.addEventListener('click', () => set(Math.max(min, (parseInt(hidden.value, 10) || min) - 1)));
    incr.addEventListener('click', () => set(Math.min(max, (parseInt(hidden.value, 10) || min) + 1)));
    set(parseInt(hidden.value, 10) || min);
  }
  setupCounter('adultsDecr', 'adultsIncr', 'adultsVal', 'adultsCount', 1, 20);
  setupCounter('childrenDecr', 'childrenIncr', 'childrenVal', 'childrenCount', 0, 10);

  // ---------- Submit: WhatsApp booking request ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!start || !end) return;

    // Open the tab synchronously (popup blockers), then re-verify against the latest data.
    const tab = window.open('', '_blank');
    await loadBlocked();
    if (!offline && conflictsIn(start, end, blocked).length) {
      if (tab) tab.close();
      evaluate();
      return;
    }

    const nights = C.diffDays(start, end);
    const adults = document.getElementById('adultsCount').value;
    const children = document.getElementById('childrenCount').value;
    const name = document.getElementById('guestName').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();

    const lines = [
      'Hello Mayyattil Waterfront Villa! 🌴',
      'I would like to request a booking for an exclusive private stay.',
      '',
      `📅 Check-in: ${C.display(start)}`,
      `📅 Check-out: ${C.display(end)}`,
      `🌙 Nights: ${nights}`,
      `👥 Guests: ${adults} Adult(s), ${children} Child(ren)`,
      `🙋 Name: ${name}`,
      `📞 Phone: ${phone}`
    ];
    lines.push('', offline
      ? 'Please confirm availability and pricing.'
      : 'The website shows these dates as available. Please confirm and share pricing.');

    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
    if (tab) tab.location.href = url;
    else window.location.href = url;
  });

  // ---------- Boot + live updates ----------
  loadBlocked().then(evaluate);

  if (client) {
    client.channel('blocked-dates-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_dates' }, () => loadBlocked().then(evaluate))
      .subscribe();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) loadBlocked().then(evaluate);
    });
  }
})();
