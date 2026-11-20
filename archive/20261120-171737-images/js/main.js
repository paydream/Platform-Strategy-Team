/* 예스폼싸인 문서/계약 자료실 — 검색 결과 없음 (2026-11-20 · Figma 13394:3827) */

/* 화면이 1920 보다 좁으면 프레임 전체가 보이게 줄임 (예전 시안과 같은 방식) */
(function () {
  var frame = document.getElementById('frame');
  function fit() { frame.style.zoom = Math.min(1, document.documentElement.clientWidth / 1920); }
  fit();
  window.addEventListener('resize', fit);
})();

/* 보기 방식 — 그리드 · 리스트 (결과 목록 디자인이 없어 버튼 모양만 바뀜) */
(function () {
  var btns = [].slice.call(document.querySelectorAll('.view__btn'));
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-on', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  });
})();

/* 계약서 검색 — Enter 로 검색 · 결과가 없을 때의 문구와 [예스폼에서 ○○ 검색하기] 버튼 글자를 바꿈
   · 주소 뒤 ?q=검색어 로 열면 그 검색어로 시작 · 처음 값은 시안대로 "내용증명서"
   · 많이 찾는 서식 칩 → 그 이름으로 검색
   · 파란 버튼은 예스폼(https://www.yesform.com/)을 새 창으로 엶 — 예스폼 검색 주소가 정해지면 YESFORM 만 바꾸면 됨 */
(function () {
  var YESFORM = 'https://www.yesform.com/';
  var DEFAULT = '내용증명서';
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search]');
  var key = document.querySelector('[data-keyword]');
  var label = document.querySelector('[data-yesform-label]');
  var link = document.querySelector('[data-yesform]');

  function show(q) {
    key.textContent = q;
    label.textContent = '예스폼에서 ' + q + ' 검색하기';
    link.href = YESFORM;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) { input.focus(); return; }
    show(q);
  });
  [].forEach.call(document.querySelectorAll('[data-chip]'), function (c) {
    c.addEventListener('click', function () {
      input.value = c.textContent.trim();
      show(input.value);
    });
  });

  var m = location.search.match(/[?&]q=([^&]*)/);
  var q0 = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')).trim() : '';
  if (q0) input.value = q0;
  show(q0 || DEFAULT);
})();
