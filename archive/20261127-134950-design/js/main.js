/* 예스폼싸인 · 고객센터 FAQ — 동작 (기존 화면 yesformsign.com 과 같은 흐름 · FAQ 탭 시안이 없어 "새로 정함")
   · 분류 탭: [전체] = 분류 상자 6개 · 나머지 = 그 분류의 소분류별 질문 목록
   · [전체] 상자의 질문을 누르면 그 분류 탭으로 넘어가고 해당 질문의 답변이 열림
   · 목록 질문을 누르면 답변이 열리고 화살표가 위로 돎 · 다른 질문을 열면 앞의 답변은 닫힘
   · 검색: Enter 나 돋보기를 누르면 모든 질문·답변에서 찾아 "검색 결과" 목록으로 보여 줌 · 빈칸으로 찾으면 [전체]로 돌아감
   · 자주 묻는 키워드 칩: 누르면 그 말로 바로 검색 */
(function () {
  var root = document.querySelector('[data-faq]');
  if (!root) return;
  var tabs = [].slice.call(root.querySelectorAll('[data-tab]'));
  var panels = [].slice.call(root.querySelectorAll('[data-panel]'));
  var form = root.querySelector('[data-faq-search]');
  var input = form.querySelector('input');
  var sTitle = root.querySelector('[data-search-title]');
  var sList = root.querySelector('[data-search-list]');
  var sEmpty = root.querySelector('[data-search-empty]');
  var sItems = [].slice.call(sList.querySelectorAll('.fitem'));
  var norm = function (s) { return s.replace(/\s+/g, '').toLowerCase(); };
  sItems.forEach(function (it) { it._text = norm(it.textContent); });

  function closeAll() {
    [].forEach.call(root.querySelectorAll('.fitem.is-open'), function (it) {
      it.classList.remove('is-open');
      it.querySelector('.fitem__q').setAttribute('aria-expanded', 'false');
      it.querySelector('.fitem__a').hidden = true;
    });
  }
  function open(it) {
    closeAll();
    it.classList.add('is-open');
    it.querySelector('.fitem__q').setAttribute('aria-expanded', 'true');
    it.querySelector('.fitem__a').hidden = false;
  }
  function show(name) {
    closeAll();
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-tab') === name ? 'true' : 'false'); });
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== name; });
  }

  /* 분류 탭 — 다른 탭으로 가면 검색어는 비움 */
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { input.value = ''; show(t.getAttribute('data-tab')); });
  });

  /* [전체] 상자의 질문 → 분류 탭으로 넘어가 답변 열기 */
  root.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (!go) return;
    show(go.getAttribute('data-cat'));
    var it = root.querySelector('[data-panel="' + go.getAttribute('data-cat') + '"] [data-id="' + go.getAttribute('data-go') + '"]');
    if (it) { open(it); it.scrollIntoView({ block: 'start' }); }
  });

  /* 목록 질문 열고 닫기 */
  root.addEventListener('click', function (e) {
    var q = e.target.closest('.fitem__q');
    if (!q) return;
    var it = q.parentNode;
    if (it.classList.contains('is-open')) closeAll(); else open(it);
  });

  /* 검색 */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = input.value.trim(), word = norm(raw);
    if (!word) { show('전체'); return; }
    show('검색');
    tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
    var n = 0;
    sItems.forEach(function (it) { var hit = it._text.indexOf(word) > -1; it.hidden = !hit; if (hit) n++; });
    sTitle.textContent = '‘' + raw + '’ 검색 결과 ' + n + '건';
    sList.hidden = n === 0;
    sEmpty.hidden = n > 0;
  });

  /* 자주 묻는 키워드 — 누르면 검색칸에 넣고 바로 검색 */
  [].forEach.call(root.querySelectorAll('[data-kw]'), function (b) {
    b.addEventListener('click', function () {
      input.value = b.getAttribute('data-kw');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

})();
