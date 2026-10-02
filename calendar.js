// Shared month-grid calendar used by the public availability widget and the admin panel.
(function () {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const pad = (n) => String(n).padStart(2, '0');

  // All dates are local 'YYYY-MM-DD' strings (never parsed as UTC).
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const display = (s) => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
  const short = (s) => { const d = parse(s); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`; };
  const today = () => iso(new Date());

  /**
   * create(root, { months, minDate, dayState(iso) -> {disabled, classes[]}, onDayClick(iso) })
   * Builds the toolbar once, re-renders the grids on render().
   */
  function create(root, { months = 1, minDate = null, dayState = () => ({}), onDayClick = () => {} }) {
    const view = new Date();
    view.setDate(1);

    root.classList.add('cal');
    root.innerHTML =
      '<div class="cal-toolbar">' +
        '<button type="button" class="cal-nav-btn" data-dir="-1" aria-label="Previous month"><i data-lucide="chevron-left"></i></button>' +
        '<span class="cal-title"></span>' +
        '<button type="button" class="cal-nav-btn" data-dir="1" aria-label="Next month"><i data-lucide="chevron-right"></i></button>' +
      '</div>' +
      '<div class="cal-months"></div>';

    const title = root.querySelector('.cal-title');
    const grid = root.querySelector('.cal-months');
    const prevBtn = root.querySelector('[data-dir="-1"]');

    function monthHTML(first) {
      const y = first.getFullYear();
      const m = first.getMonth();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      let html = `<div class="cal-month"><div class="cal-month-name">${MONTHS[m]} ${y}</div><div class="cal-grid">`;
      html += DOW.map((d) => `<span class="cal-dow">${d}</span>`).join('');
      for (let i = 0; i < first.getDay(); i++) html += '<span class="cal-blank"></span>';
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${y}-${pad(m + 1)}-${pad(d)}`;
        const st = dayState(key) || {};
        const col = (first.getDay() + d - 1) % 7;
        const edges = [];
        if (col === 0 || d === 1) edges.push('is-row-start');
        if (col === 6 || d === daysInMonth) edges.push('is-row-end');
        const cls = ['cal-day'].concat(edges, st.classes || []).join(' ');
        html += `<button type="button" class="${cls}" data-date="${key}"${st.disabled ? ' disabled' : ''}><span>${d}</span></button>`;
      }
      return html + '</div></div>';
    }

    function render() {
      const parts = [];
      const labels = [];
      for (let i = 0; i < months; i++) {
        const first = new Date(view.getFullYear(), view.getMonth() + i, 1);
        parts.push(monthHTML(first));
        labels.push(`${MONTHS[first.getMonth()]} ${first.getFullYear()}`);
      }
      grid.innerHTML = parts.join('');
      title.textContent = months > 1 ? `${labels[0]} – ${labels[labels.length - 1]}` : labels[0];
      if (minDate) {
        const min = parse(minDate);
        prevBtn.disabled = view.getFullYear() * 12 + view.getMonth() <= min.getFullYear() * 12 + min.getMonth();
      }
    }

    root.addEventListener('click', (e) => {
      const nav = e.target.closest('.cal-nav-btn');
      if (nav) {
        if (nav.disabled) return;
        view.setMonth(view.getMonth() + Number(nav.dataset.dir));
        render();
        return;
      }
      const day = e.target.closest('.cal-day');
      if (day && !day.disabled) onDayClick(day.dataset.date);
    });

    function showMonthOf(dateISO) {
      const d = parse(dateISO);
      view.setFullYear(d.getFullYear(), d.getMonth(), 1);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    render();
    return { render, showMonthOf };
  }

  window.VillaCal = { create, iso, parse, addDays, diffDays, display, short, today, MONTHS };
})();
