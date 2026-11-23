/* 예스폼 멤버십 이용요금 (2026-11-23 · Figma 6366:14703) */

/* 결제 주기 · 비즈니스 인원
   · 연 결제(처음 값): 프리미엄 10,000원/월 (1년 120,000원) · 비즈니스 7,500원/월·1인 (1년 90,000원) — 시안 금액
   · 월 결제: 프리미엄 12,000원/월 · 비즈니스 9,000원/월·1인 · "12개월 약정 · 매달 결제" — 기획 시안(yesform-custom.vercel.app/pricing) 금액
   · 주소 뒤 ?billing=month 로 열면 월 결제로 시작
   · 인원은 2명부터 99명까지 (99명은 시안에 없어 새로 정함) */
(function () {
  var PRICE = {
    year:  { premium: 10000, premiumNote: '1년 120,000원 한 번에 결제',
             business: 7500, businessNote: '1년 90,000원 (1인) 한 번에 결제', seat: 90000, per: '년' },
    month: { premium: 12000, premiumNote: '12개월 약정 · 매달 결제',
             business: 9000, businessNote: '12개월 약정 · 매달 결제', seat: 9000, per: '월' }
  };
  var MIN = 2, MAX = 99;
  var mode = /[?&]billing=month/.test(location.search) ? 'month' : 'year';
  var seats = MIN;

  var btns = [].slice.call(document.querySelectorAll('[data-billing]'));
  var $ = function (s) { return document.querySelector(s); };
  var won = function (n) { return n.toLocaleString('ko-KR') + '원'; };
  var minus = $('[data-step="-1"]'), plus = $('[data-step="1"]');

  function render() {
    var p = PRICE[mode];
    btns.forEach(function (b) {
      var on = b.getAttribute('data-billing') === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $('[data-price="premium"]').textContent = won(p.premium);
    $('[data-note="premium"]').textContent = p.premiumNote;
    $('[data-price="business"]').textContent = won(p.business);
    $('[data-note="business"]').textContent = p.businessNote;
    $('[data-year-only]').hidden = mode !== 'year';
    $('[data-seats]').textContent = seats + '명';
    $('[data-total]').textContent = '합계 ' + won(p.seat * seats) + ' / ' + p.per;
    minus.disabled = seats <= MIN;
    plus.disabled = seats >= MAX;
  }

  btns.forEach(function (b) {
    b.addEventListener('click', function () { mode = b.getAttribute('data-billing'); render(); });
  });
  [minus, plus].forEach(function (b) {
    b.addEventListener('click', function () {
      seats = Math.min(MAX, Math.max(MIN, seats + Number(b.getAttribute('data-step'))));
      render();
    });
  });
  render();
})();

/* 프리미엄 혜택 탭 — 고른 탭만 파란색 (다른 탭 내용은 시안에 없어 버튼 모양만 바뀜) */
(function () {
  var pills = [].slice.call(document.querySelectorAll('.pill'));
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      pills.forEach(function (x) {
        var on = x === p;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    });
  });
})();

/* 자주 묻는 질문 — 누른 질문만 펼치고 나머지는 접음 (처음엔 시안대로 첫 질문이 열림) */
(function () {
  var items = [].slice.call(document.querySelectorAll('.faq__item'));
  items.forEach(function (item) {
    item.querySelector('.faq__q').addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      items.forEach(function (x) {
        var on = x === item && open;
        x.classList.toggle('is-open', on);
        x.querySelector('.faq__q').setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    });
  });
})();
