
/* === Калькулятор дохода — автономный и безопасный === */
(function(){
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    const clients = document.getElementById('clients');
    const days    = document.getElementById('days');
    const hours   = document.getElementById('hours');
    const income  = document.getElementById('income');
    const gauge   = document.querySelector('.gauge');

    if(!clients || !days || !income){ return; }

    const PRICE = 800; // ₽ за клиента
    const fmt = new Intl.NumberFormat('ru-RU');

    function clamp(n,a,b){ return Math.max(a, Math.min(b, n)); }

    function recalc(){
      const c = Number(clients.value || 0);
      const d = Number(days.value || 0);
      const val = c * d * PRICE;

      // число «в месяц»
      income.textContent = fmt.format(val) + ' ₽';

      // прогресс пончика
      if(gauge){
        const maxC = Number(clients.max || 50);
        const maxD = Number(days.max || 31);
        const p = clamp(Math.round((val / (PRICE * maxC * maxD)) * 100), 0, 100);
        gauge.style.setProperty('--p', p + '%');
      }
    }

    ['input','change'].forEach(evt => {
      clients.addEventListener(evt, recalc);
      days.addEventListener(evt, recalc);
      if(hours) hours.addEventListener(evt, recalc);
    });

    recalc();
  });
})();
