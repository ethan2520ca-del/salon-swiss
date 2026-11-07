/* DSH demo gift cards — shared behaviour.
   Amounts come from the buttons in markup; the certificate preview updates
   live. No backend: submitting only shows the demo confirmation. */

(function () {
  function formatSum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  function init(root) {
    var amounts = Array.prototype.slice.call(root.querySelectorAll('.gc__amount'));
    var sumBox = root.querySelector('.gc__sum');
    var form = root.querySelector('.gc__form');
    var nameInput = root.querySelector('input[data-gc="name"]');
    var phoneInput = root.querySelector('input[data-gc="phone"]');
    if (!amounts.length || !form) return;

    var value = Number(amounts[0].dataset.amount || 0);

    function select(btn) {
      amounts.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      value = Number(btn.dataset.amount || 0);
      if (sumBox) sumBox.textContent = formatSum(value);
    }

    amounts.forEach(function (btn) {
      btn.addEventListener('click', function () { select(btn); });
    });
    select(amounts[0]);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameOk = nameInput && nameInput.value.trim();
      var phoneOk = phoneInput && phoneInput.value.trim();
      if (!nameOk || !phoneOk) {
        [nameInput, phoneInput].forEach(function (i) {
          if (i) i.style.borderBottomColor = i.value.trim() ? '' : 'currentColor';
        });
        return;
      }
      form.innerHTML =
        '<div class="gc__done"><b>Сертификат на ' + formatSum(value) + '</b>' +
        '<span>Заявка принята. Это демонстрационная форма — данные никуда не ушли.</span></div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.gc').forEach(init);
  });
})();
