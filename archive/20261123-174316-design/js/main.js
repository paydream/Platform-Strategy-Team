/* 예스폼 멤버십 이용요금 (2026-11-23)
   시안01 Figma 6366:14703 · 시안02 Figma 6366:14009 — 두 시안이 같은 동작을 쓰고, 시안마다 따로 움직임 */

var SIANS = [].slice.call(document.querySelectorAll('.sian'));
if (!SIANS.length) SIANS = [document.body];

/* 결제 주기 · 비즈니스 인원
   · 연 결제(처음 값): 프리미엄 10,000원/월 (1년 120,000원) · 비즈니스 7,500원/월·1인 (1년 90,000원) — 시안 금액
   · 월 결제: 프리미엄 12,000원/월 · 비즈니스 9,000원/월·1인 · "12개월 약정 · 매달 결제" — 기획 시안(yesform-custom.vercel.app/pricing) 금액
   · 주소 뒤 ?billing=month 로 열면 월 결제로 시작
   · 인원은 2명부터 99명까지 (99명은 시안에 없어 새로 정함) */
var PRICE = {
  year:  { premium: 10000, premiumNote: '1년 120,000원 한 번에 결제',
           business: 7500, businessNote: '1년 90,000원 (1인) 한 번에 결제', seat: 90000, per: '년' },
  month: { premium: 12000, premiumNote: '12개월 약정 · 매달 결제',
           business: 9000, businessNote: '12개월 약정 · 매달 결제', seat: 9000, per: '월' }
};
var won = function (n) { return n.toLocaleString('ko-KR') + '원'; };

SIANS.forEach(function (root) {
  var $ = function (s) { return root.querySelector(s); };
  var btns = [].slice.call(root.querySelectorAll('[data-billing]'));
  var minus = $('[data-step="-1"]'), plus = $('[data-step="1"]');
  if (!btns.length || !minus) return;
  var MIN = 2, MAX = 99;
  var mode = /[?&]billing=month/.test(location.search) ? 'month' : 'year';
  var seats = MIN;

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
});

/* 프리미엄 혜택 탭 (시안01) — 고른 탭만 파란색 (다른 탭 내용은 시안에 없어 버튼 모양만 바뀜) */
SIANS.forEach(function (root) {
  var pills = [].slice.call(root.querySelectorAll('.pill'));
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      pills.forEach(function (x) {
        var on = x === p;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    });
  });
});

/* 펼침 목록 — 누른 것만 펼치고 나머지는 접음 (처음엔 시안대로 첫 번째가 열림)
   · 자주 묻는 질문(.faq__item) · 시안02 프리미엄 혜택(.s2-acc__item) */
SIANS.forEach(function (root) {
  [['.faq__item', '.faq__q'], ['.s2-acc__item', '.s2-acc__q']].forEach(function (k) {
    var items = [].slice.call(root.querySelectorAll(k[0]));
    items.forEach(function (item) {
      item.querySelector(k[1]).addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        items.forEach(function (x) {
          var on = x === item && open;
          x.classList.toggle('is-open', on);
          x.querySelector(k[1]).setAttribute('aria-expanded', on ? 'true' : 'false');
        });
      });
    });
  });
});

/* 가로 흐름 — 시안01 통합 멤버십 카드 · 시안02 파트너사 로고
   · 화면 폭 + 한 벌 이상이 되도록 복제 (복제본은 읽기 프로그램에서 숨김) → 한 벌만큼 왼쪽으로 옮기며 끊김 없이 반복
   · 속도는 초당 약 40px — 시안에 없어 새로 정함 · 안 보이는 시안은 탭을 바꿀 때 다시 계산 */
(function () {
  var lists = [].slice.call(document.querySelectorAll('[data-flow]'));
  var speed = 40;
  lists.forEach(function (list) { list._items = [].slice.call(list.children); });
  function fill(list) {
    var box = list.parentNode.offsetWidth;
    if (!box) return;
    var gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    var set = list._items.reduce(function (w, li) { return w + li.offsetWidth + gap; }, 0);
    var need = Math.ceil((box + set) / set);
    for (var have = list.children.length / list._items.length; have < need; have++) {
      list._items.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        list.appendChild(c);
      });
    }
    list.style.setProperty('--flow-set', set + 'px');
    list.style.setProperty('--flow-time', (set / speed) + 's');
  }
  function all() { lists.forEach(fill); }
  all();
  window.addEventListener('resize', all);
  window.addEventListener('sian:change', all);
})();
