/* 예스폼싸인 2차 고도화 — 라벨 설정 모달 (Figma 53702:42429 · 53702:42494 · 2026-11-20)

   쓰는 화면: bulk-list.html · bulk-detail.html · bulk-settings.html
   · [라벨 설정] 버튼을 누르면 이 창이 뜸 (창은 이 파일이 화면 맨 아래에 만들어 붙임)
   · 라벨이 붙는 자리(라벨 칸)는 data-labels="라벨1|라벨2" 를 가진 요소
     그 안의 .chip 에 "라벨1 외 1개" 처럼 보여 주고, 라벨이 없으면 "-"
   · 버튼에 data-label-open="선택자" 를 달면 그 선택자의 라벨 칸을 대상으로 엶 (상세 · 전송 설정)
     목록 화면은 js/bulk-list.js 가 체크한 행 / 추가 메뉴를 연 행을 대상으로 labelModal.open() 을 부름

   창 안
   · 체크한 라벨 → [설정하기]를 누르면 대상 라벨 칸에 붙음 · [닫기] · 바깥 · Esc → 붙이지 않음
     (대상이 하나면 지금 붙은 라벨을 체크한 채로 열림 · 여럿이면 모두에 붙은 라벨만 체크)
   · 맨 위 체크박스 — 보이는 라벨 모두 선택 / 일부만 고르면 가운데 줄
   · 라벨명 검색 — 띄어쓰기 무시
   · 연필 → 그 줄이 입력 칸 + [취소] [수정]으로 바뀜 (Enter 수정 · Esc 취소)
   · 휴지통 → 그 줄이 회색 바탕 + 주황 안내 + [취소] [삭제]로 바뀜
     삭제하면 그 라벨이 붙어 있던 계약은 라벨 없음("-")으로 바뀜
   · 아래 라벨명(최대 20자) + [라벨 추가하기] → 목록 맨 아래에 추가하고 체크해 둠 (Enter 로도 추가)
     같은 이름이 있으면 빨간 테두리 + "이미 있는 라벨명입니다."
   · 라벨 추가 · 수정 · 삭제는 누르는 즉시 반영 ([닫기]를 눌러도 남음)

   저장 — sessionStorage 'signLabels'(라벨 목록) · 'signLabelMap'(바꾼 이름 이전 → 새 이름)
   같은 탭 안의 다른 화면에서도 같은 목록을 씀 · 지운 라벨 / 바꾼 이름은 화면을 열 때 라벨 칸에도 반영
   라벨 칸이 바뀌면 document 에 'labels:change' 이벤트를 보냄 */
(function () {
  var KEY = 'signLabels';
  var MAP = 'signLabelMap';
  var DEF = ['표준 근로계약서_2026년 05월', '신규 입사자_11월', '근로계약서_2026년 12월', '외주 계약', '보안 서약'];
  var MAX = 20;
  var src = (document.currentScript && document.currentScript.src) || '';
  var IMG = src.replace(/js\/label-modal\.js.*$/, '') + 'images/';

  function load(k, d) {
    try { var v = JSON.parse(sessionStorage.getItem(k)); return v || d; } catch (e) { return d; }
  }
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(labels)); sessionStorage.setItem(MAP, JSON.stringify(map)); } catch (e) {}
  }
  var labels = load(KEY, DEF.slice());
  var map = load(MAP, {});

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function norm(s) { return (s || '').replace(/\s+/g, '').toLowerCase(); }
  function fmt(list) { return !list.length ? '' : list.length === 1 ? list[0] : list[0] + ' 외 ' + (list.length - 1) + '개'; }

  // 라벨 칸 — data-labels 읽기 · 쓰기 · 보여 주기
  function get(h) { var v = h.getAttribute('data-labels') || ''; return v ? v.split('|') : []; }
  function clean(list) { // 바뀐 이름 반영 · 지운 라벨 빼기 · 겹침 빼기
    var out = [];
    list.forEach(function (n) {
      n = map[n] || n;
      if (labels.indexOf(n) > -1 && out.indexOf(n) < 0) out.push(n);
    });
    return out;
  }
  function render(h) {
    var list = get(h);
    var chip = h.querySelector('.chip');
    var none = h.querySelector('[data-none]');
    if (!chip) { chip = document.createElement('span'); chip.className = 'chip'; h.insertBefore(chip, h.firstChild); }
    if (!none) { none = document.createElement('span'); none.className = 'lbl-none'; none.setAttribute('data-none', ''); none.textContent = '-'; h.appendChild(none); }
    chip.textContent = fmt(list);
    chip.title = list.join(', ');
    chip.hidden = !list.length;
    none.hidden = !!list.length;
  }
  function set(h, list) { h.setAttribute('data-labels', list.join('|')); render(h); }
  function holders() { return [].slice.call(document.querySelectorAll('[data-labels]')); }
  function changed() { document.dispatchEvent(new CustomEvent('labels:change')); }
  function syncAll() { holders().forEach(function (h) { set(h, clean(get(h))); }); }
  syncAll();

  // 창 만들기
  var dim = document.createElement('div');
  dim.className = 'dim';
  dim.id = 'label-modal';
  dim.hidden = true;
  dim.innerHTML =
    '<div class="modal lm" role="dialog" aria-modal="true" aria-labelledby="lm-title" tabindex="-1">' +
      '<div class="lm__body">' +
        '<h2 class="lm__title" id="lm-title">라벨 설정</h2>' +
        '<div class="lm__main">' +
          '<div class="lm__top">' +
            '<label class="search lm__search"><input type="search" placeholder="라벨명 검색" aria-label="라벨명 검색" data-lm-search><img src="' + IMG + 'ic-search-24.svg" width="24" height="24" alt=""></label>' +
            '<div class="lm-list" data-lm-list>' +
              '<div class="lm-row lm-row--head">' +
                '<label class="cbox"><input type="checkbox" aria-label="보이는 라벨 모두 선택" data-lm-all><span></span></label>' +
                '<span class="lm-row__name">라벨명</span><span class="lm-row__set">설정</span>' +
              '</div>' +
              '<ul class="lm-rows" data-lm-rows></ul>' +
              '<p class="lm-empty" data-lm-empty hidden></p>' +
            '</div>' +
          '</div>' +
          '<div class="lm-add">' +
            '<div class="lm-add__field">' +
              '<label class="lm-add__label" for="lm-new">라벨명</label>' +
              '<input class="lm-input" id="lm-new" type="text" maxlength="' + MAX + '" placeholder="라벨명을 입력해주세요. (최대 ' + MAX + '자)" autocomplete="off" aria-describedby="lm-new-err" data-lm-new>' +
              '<p class="lm-add__err" id="lm-new-err" data-lm-err hidden>이미 있는 라벨명입니다.</p>' +
            '</div>' +
            '<button class="lm-addbtn" type="button" data-lm-add>라벨 추가하기</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal__btns">' +
        '<button class="modal__btn" type="button" data-lm-close>닫기</button>' +
        '<button class="modal__btn modal__btn--primary" type="button" data-lm-ok>설정하기</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(dim);

  var modal = dim.querySelector('.lm');
  var search = dim.querySelector('[data-lm-search]');
  var list = dim.querySelector('[data-lm-list]');
  var rowsEl = dim.querySelector('[data-lm-rows]');
  var all = dim.querySelector('[data-lm-all]');
  var empty = dim.querySelector('[data-lm-empty]');
  var newIn = dim.querySelector('[data-lm-new]');
  var err = dim.querySelector('[data-lm-err]');

  var targets = [];
  var from = null;
  var sel = [];      // 체크한 라벨
  var mode = null;   // { type: 'edit' | 'del', name }

  function shown() {
    var k = norm(search.value);
    return labels.filter(function (n) { return !k || norm(n).indexOf(k) > -1; });
  }
  function cbox(name, label, disabled) {
    return '<label class="cbox"><input type="checkbox" data-lm-check aria-label="' + esc(label) + '"' +
      (sel.indexOf(name) > -1 ? ' checked' : '') + (disabled ? ' disabled' : '') + '><span></span></label>';
  }
  function row(n) {
    var on = mode && mode.name === n;
    if (on && mode.type === 'edit') {
      return '<li class="lm-row lm-row--edit" data-name="' + esc(n) + '">' + cbox(n, n + ' 선택', true) +
        '<div class="lm-edit">' +
          '<span class="lm-field"><input class="lm-field__input" type="text" maxlength="' + MAX + '" value="' + esc(n) + '" aria-label="라벨명 수정" autocomplete="off" data-lm-edit-input>' +
          '<button class="lm-field__clear" type="button" aria-label="입력한 라벨명 지우기" data-lm-clear><img src="' + IMG + 'ic-input-clear-20.svg" width="20" height="20" alt=""></button></span>' +
          '<span class="lm-edit__btns"><button class="lm-btn lm-btn--dark" type="button" data-lm-cancel>취소</button>' +
          '<button class="lm-btn lm-btn--blue" type="button" data-lm-save>수정</button></span>' +
        '</div></li>';
    }
    if (on && mode.type === 'del') {
      return '<li class="lm-row lm-row--del" data-name="' + esc(n) + '">' + cbox(n, n + ' 선택', true) +
        '<div class="lm-del"><p class="lm-del__name" title="' + esc(n) + '">' + esc(n) + '</p>' +
          '<p class="lm-del__msg" id="lm-del-msg">해당 라벨을 삭제하시겠습니까?<br>계약서는 삭제 없이 기본 라벨로 변경됩니다.</p></div>' +
        '<span class="lm-del__btns">' +
          '<button class="lm-btn lm-btn--sm" type="button" data-lm-cancel>취소</button>' +
          '<button class="lm-btn lm-btn--sm" type="button" aria-describedby="lm-del-msg" data-lm-delete>삭제</button>' +
        '</span></li>';
    }
    return '<li class="lm-row" data-name="' + esc(n) + '">' + cbox(n, n + ' 선택', false) +
      '<span class="lm-row__name" title="' + esc(n) + '">' + esc(n) + '</span>' +
      '<span class="lm-row__icons">' +
        '<button class="lm-ic" type="button" aria-label="' + esc(n) + ' 라벨명 수정" data-lm-edit><img src="' + IMG + 'ic-edit-20.svg" width="20" height="20" alt=""></button>' +
        '<button class="lm-ic" type="button" aria-label="' + esc(n) + ' 라벨 삭제" data-lm-del><img src="' + IMG + 'ic-trash-label-20.svg" width="20" height="20" alt=""></button>' +
      '</span></li>';
  }
  function draw() {
    var v = shown();
    rowsEl.innerHTML = v.map(row).join('');
    empty.hidden = v.length > 0;
    empty.textContent = labels.length ? '검색 결과가 없습니다.' : '라벨이 없습니다. 아래에서 라벨을 추가해 주세요.';
    syncHead();
  }
  function syncHead() {
    var v = shown();
    var n = v.filter(function (x) { return sel.indexOf(x) > -1; }).length;
    all.disabled = !v.length;
    all.checked = v.length > 0 && n === v.length;
    all.indeterminate = n > 0 && n < v.length;
  }
  function rowOf(name) {
    return [].filter.call(rowsEl.children, function (li) { return li.getAttribute('data-name') === name; })[0];
  }
  function setMode(m, focusSel) {
    mode = m;
    draw();
    var li = m && rowOf(m.name);
    if (li) scrollInto(li);
    if (m && m.type === 'edit' && li) {
      var inp = li.querySelector('[data-lm-edit-input]');
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
      syncClear(li);
    } else if (m && m.type === 'del' && li) {
      li.querySelector('[data-lm-cancel]').focus();
    } else if (focusSel) {
      var back = focusSel.name && rowOf(focusSel.name);
      var b = back && back.querySelector(focusSel.btn);
      (b || search).focus();
    }
  }
  function scrollInto(li) { // 목록 안에서만 — 줄 전체가 보이게 (머리줄 48 아래)
    var top = li.offsetTop - 48;
    var bottom = li.offsetTop + li.offsetHeight - list.clientHeight;
    if (list.scrollTop > top) list.scrollTop = top;
    else if (list.scrollTop < bottom) list.scrollTop = bottom;
  }
  function syncClear(li) {
    var inp = li.querySelector('[data-lm-edit-input]');
    li.querySelector('[data-lm-clear]').hidden = !inp.value;
  }

  // 이름 바꾸기 · 지우기 — 체크 상태 · 화면의 라벨 칸까지 같이 바꿈
  function rename(old, nw) {
    labels[labels.indexOf(old)] = nw;
    Object.keys(map).forEach(function (k) { if (map[k] === old) map[k] = nw; });
    map[old] = nw;
    delete map[nw];
    var i = sel.indexOf(old);
    if (i > -1) sel[i] = nw;
    save();
    syncAll();
    changed();
  }
  function remove(name) {
    labels.splice(labels.indexOf(name), 1);
    Object.keys(map).forEach(function (k) { if (map[k] === name) delete map[k]; });
    sel = sel.filter(function (x) { return x !== name; });
    save();
    syncAll();
    changed();
  }
  function exists(name, except) {
    return labels.some(function (x) { return x !== except && norm(x) === norm(name); });
  }

  // 목록 안 클릭
  list.addEventListener('change', function (e) {
    var t = e.target;
    if (t === all) {
      mode = null; // 수정 · 삭제 확인 중이면 그만두고 모두 선택
      shown().forEach(function (n) {
        var i = sel.indexOf(n);
        if (all.checked && i < 0) sel.push(n);
        if (!all.checked && i > -1) sel.splice(i, 1);
      });
      draw();
      return;
    }
    if (!t.hasAttribute('data-lm-check')) return;
    var name = t.closest('.lm-row').getAttribute('data-name');
    var i = sel.indexOf(name);
    if (t.checked && i < 0) sel.push(name);
    if (!t.checked && i > -1) sel.splice(i, 1);
    syncHead();
  });
  list.addEventListener('click', function (e) {
    var li = e.target.closest('.lm-row');
    if (!li || li.classList.contains('lm-row--head')) return;
    var name = li.getAttribute('data-name');
    if (e.target.closest('[data-lm-edit]')) { setMode({ type: 'edit', name: name }); return; }
    if (e.target.closest('[data-lm-del]')) { setMode({ type: 'del', name: name }); return; }
    if (e.target.closest('[data-lm-cancel]')) { setMode(null, { name: name, btn: mode && mode.type === 'del' ? '[data-lm-del]' : '[data-lm-edit]' }); return; }
    if (e.target.closest('[data-lm-clear]')) {
      var inp = li.querySelector('[data-lm-edit-input]');
      inp.value = '';
      inp.classList.remove('is-err');
      syncClear(li);
      inp.focus();
      return;
    }
    if (e.target.closest('[data-lm-save]')) { saveEdit(li); return; }
    if (e.target.closest('[data-lm-delete]')) { remove(name); setMode(null, {}); }
  });
  list.addEventListener('input', function (e) {
    if (!e.target.hasAttribute('data-lm-edit-input')) return;
    e.target.classList.remove('is-err');
    e.target.removeAttribute('aria-invalid');
    syncClear(e.target.closest('.lm-row'));
  });
  list.addEventListener('keydown', function (e) {
    if (!e.target.hasAttribute('data-lm-edit-input')) return;
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); saveEdit(e.target.closest('.lm-row')); }
  });
  function saveEdit(li) {
    var old = li.getAttribute('data-name');
    var inp = li.querySelector('[data-lm-edit-input]');
    var nw = inp.value.trim().slice(0, MAX);
    if (!nw) { inp.focus(); return; }
    if (nw !== old && exists(nw, old)) {
      inp.classList.add('is-err');
      inp.setAttribute('aria-invalid', 'true');
      inp.title = '이미 있는 라벨명입니다.';
      inp.focus();
      return;
    }
    if (nw !== old) rename(old, nw);
    setMode(null, { name: nw, btn: '[data-lm-edit]' });
  }

  // 검색
  search.addEventListener('input', function () { mode = null; draw(); });

  // 라벨 추가
  function add() {
    var name = newIn.value.trim().slice(0, MAX);
    if (!name) { newIn.focus(); return; }
    if (exists(name)) {
      newIn.classList.add('is-err');
      newIn.setAttribute('aria-invalid', 'true');
      err.hidden = false;
      newIn.focus();
      return;
    }
    labels.push(name);
    sel.push(name);
    save();
    changed();
    newIn.value = '';
    search.value = '';
    mode = null;
    draw();
    var li = rowOf(name);
    if (li) scrollInto(li); // 추가한 줄이 보이게
    newIn.focus();
  }
  function clearErr() { newIn.classList.remove('is-err'); newIn.removeAttribute('aria-invalid'); err.hidden = true; }
  newIn.addEventListener('input', clearErr);
  newIn.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); add(); } });
  dim.querySelector('[data-lm-add]').addEventListener('click', add);

  // 열기 · 닫기 · 설정하기
  function open(hs, opener) {
    targets = (hs || []).filter(Boolean);
    from = opener || null;
    sel = [];
    if (targets.length) {
      sel = clean(get(targets[0])).filter(function (n) {
        return targets.every(function (h) { return clean(get(h)).indexOf(n) > -1; });
      });
    }
    mode = null;
    search.value = '';
    newIn.value = '';
    clearErr();
    draw();
    list.scrollTop = 0;
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.focus({ preventScroll: true });
  }
  function close() {
    dim.hidden = true;
    document.body.style.overflow = '';
    mode = null;
    if (from && document.contains(from) && !from.disabled) from.focus({ preventScroll: true });
    targets = [];
  }
  dim.querySelector('[data-lm-close]').addEventListener('click', close);
  dim.querySelector('[data-lm-ok]').addEventListener('click', function () {
    var pick = labels.filter(function (n) { return sel.indexOf(n) > -1; }); // 목록 순서대로
    targets.forEach(function (h) { set(h, pick); });
    if (targets.length) changed();
    close();
  });
  dim.addEventListener('click', function (e) { if (e.target === dim) close(); });
  document.addEventListener('keydown', function (e) {
    if (dim.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (mode) { var m = mode; setMode(null, { name: m.name, btn: m.type === 'del' ? '[data-lm-del]' : '[data-lm-edit]' }); return; }
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    var items = [].filter.call(modal.querySelectorAll('button, input'), function (el) { return !el.disabled && el.offsetParent !== null; });
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    else if (i === -1) { e.preventDefault(); items[0].focus(); }
  });

  // [라벨 설정] 버튼 — data-label-open="선택자"
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-label-open]');
    if (!b) return;
    open([].slice.call(document.querySelectorAll(b.getAttribute('data-label-open'))), b);
  });

  window.labelModal = {
    open: open,
    fmt: fmt,
    get: get,
    set: function (h, list) { set(h, clean(list)); },
    labels: function () { return labels.slice(); }
  };
})();
