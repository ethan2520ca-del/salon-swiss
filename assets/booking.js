/* DSH demo booking calendar — shared behaviour.
   No backend: availability is derived from the date so the demo looks alive
   while staying deterministic from one reload to the next. */

(function () {
  var MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  var WEEKDAYS = ['вс','пн','вт','ср','чт','пт','сб'];
  var SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  var DAYS_AHEAD = 14;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  /* Stable pseudo-random: same date + slot always yields the same busy state. */
  function busy(dateKey, hour) {
    var h = 0;
    var s = dateKey + ':' + hour;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
    return h % 10 < 3; // roughly 30% of slots are taken
  }

  function init(root) {
    var daysBox = root.querySelector('.bk__days');
    var monthBox = root.querySelector('.bk__month');
    var slotsBox = root.querySelector('.bk__slots');
    var form = root.querySelector('.bk__form');
    var summary = root.querySelector('.bk__summary');
    var submit = root.querySelector('.bk__submit');
    var service = root.querySelector('.bk__field select');
    var nameInput = root.querySelector('.bk__field input[type="text"]');
    var phoneInput = root.querySelector('.bk__field input[type="tel"]');
    if (!daysBox || !slotsBox || !form) return;

    var state = { date: null, hour: null };
    var days = [];

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var i = 0; i < DAYS_AHEAD; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }

    /* ---- days ---- */
    days.forEach(function (d, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bk__day';
      btn.setAttribute('aria-pressed', 'false');
      btn.dataset.date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      var wd = document.createElement('small');
      wd.textContent = index === 0 ? 'сегодня' : WEEKDAYS[d.getDay()];
      var num = document.createElement('b');
      num.textContent = d.getDate();
      btn.appendChild(wd);
      btn.appendChild(num);
      btn.addEventListener('click', function () { selectDay(btn, d); });
      daysBox.appendChild(btn);
    });

    function selectDay(btn, date) {
      daysBox.querySelectorAll('.bk__day').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      state.date = date;
      state.hour = null;
      monthBox.textContent = date.getDate() + ' ' + MONTHS[date.getMonth()];
      renderSlots(date);
      updateSummary();
    }

    function renderSlots(date) {
      slotsBox.innerHTML = '';
      var key = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
      var now = new Date();
      var isToday = date.toDateString() === now.toDateString();

      SLOT_HOURS.forEach(function (hour) {
        var slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'bk__slot';
        slot.textContent = pad(hour) + ':00';
        slot.setAttribute('aria-pressed', 'false');
        slot.dataset.hour = hour;

        var past = isToday && hour <= now.getHours();
        if (past || busy(key, hour)) {
          slot.disabled = true;
        } else {
          slot.addEventListener('click', function () {
            slotsBox.querySelectorAll('.bk__slot').forEach(function (s) {
              s.setAttribute('aria-pressed', String(s === slot));
            });
            state.hour = hour;
            updateSummary();
          });
        }
        slotsBox.appendChild(slot);
      });
    }

    function updateSummary() {
      var ready = Boolean(state.date && state.hour !== null && nameInput.value.trim() && phoneInput.value.trim());
      submit.disabled = !ready;

      if (!state.date) {
        summary.innerHTML = 'Выберите день и время';
        return;
      }
      if (state.hour === null) {
        summary.innerHTML = '<b>' + state.date.getDate() + ' ' + MONTHS[state.date.getMonth()] + '</b> — выберите время';
        return;
      }
      summary.innerHTML =
        '<b>' + state.date.getDate() + ' ' + MONTHS[state.date.getMonth()] + ', ' + pad(state.hour) + ':00</b>' +
        ' · ' + (service && service.value ? service.value : 'услуга');
    }

    [nameInput, phoneInput, service].forEach(function (el) {
      if (el) el.addEventListener('input', updateSummary);
      if (el) el.addEventListener('change', updateSummary);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submit.disabled) return;
      var when = state.date.getDate() + ' ' + MONTHS[state.date.getMonth()] + ', ' + pad(state.hour) + ':00';
      form.innerHTML =
        '<div class="bk__done"><b>Заявка отправлена</b>' +
        '<span>Ждём вас ' + when + '. Это демонстрационная форма — данные никуда не ушли.</span></div>' +
        '<button class="bk__submit" type="button" data-bk-again>Выбрать другое время</button>';
      form.querySelector('[data-bk-again]').addEventListener('click', function () {
        window.location.reload();
      });
    });

    monthBox.textContent = 'выберите дату';
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bk').forEach(init);
  });
})();
