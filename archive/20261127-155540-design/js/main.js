/* 예스폼싸인 · 이용요금 — 동작 (시안에 없는 동작은 "새로 정함"이라고 적어 둠) */

/* ---------- 요금제 고르기 — 시안01 밑줄 탭 · 시안02 칩 (요금제 전체 · 소량 이용 · 대량 이용)
   · 누르면 고른 것만 바뀜 — 대량 이용 · 전체 요금제 카드는 시안에 없어 카드는 그대로 (새로 정함) ---------- */
(function () {
  [].forEach.call(document.querySelectorAll('[data-chips]'), function (group) {
    var chips = [].slice.call(group.querySelectorAll('[role="tab"]'));
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) {
          var on = x === c;
          x.classList.toggle('is-on', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
      });
    });
  });
})();

/* ---------- 시안01 주요 기능 아이콘 — 누르면 해당 카드로 부드럽게 이동 (새로 정함) ---------- */
(function () {
  [].forEach.call(document.querySelectorAll('.feat-nav a'), function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ---------- 시안02 다른 통합 멤버십 요금제 보기 (2개)
   · 누르면 비즈니스 · 연결제 상자가 펼쳐지고 글자가 [접기]로 바뀜 (새로 정함) ---------- */
(function () {
  var btn = document.querySelector('[data-mem-toggle]');
  if (!btn) return;
  var label = btn.querySelector('[data-mem-label]');
  var more = [].slice.call(document.querySelectorAll('[data-mem-more]'));
  var OPEN = '다른 통합 멤버십 요금제 접기', CLOSED = label.textContent;
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') !== 'true';
    more.forEach(function (m) { m.hidden = !open; });
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    label.textContent = open ? OPEN : CLOSED;
  });
})();

/* ---------- 시안01 자주 묻는 질문 (2026-11-27)
   · 질문을 누르면 답변이 열리고 화살표가 위로 바뀜 · 다른 질문을 열면 앞의 답변은 닫힘 · 열린 질문을 누르면 닫힘
   · 처음엔 첫 질문이 열려 있음 (Figma 그대로) — 여닫는 동작은 시안에 없어 새로 정함 ---------- */
(function () {
  var list = document.querySelector('[data-qlist]');
  if (!list) return;
  var items = [].slice.call(list.querySelectorAll('.qitem'));
  function set(it, open) {
    it.classList.toggle('is-open', open);
    it.querySelector('.qitem__q').setAttribute('aria-expanded', open ? 'true' : 'false');
    it.querySelector('.qitem__a').hidden = !open;
  }
  items.forEach(function (it) {
    it.querySelector('.qitem__q').addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      items.forEach(function (x) { set(x, x === it ? open : false); });
    });
  });
})();

/* ---------- 링크 자리(#)는 눌러도 화면이 맨 위로 튀지 않게 ---------- */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href="#"]');
  if (a) e.preventDefault();
});
