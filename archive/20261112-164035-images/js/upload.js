/* 예스폼싸인 2차 고도화 — 대량 전송 1단계 문서 업로드 (2026-11-10)

   선택한 문서 — 업로드 칸 자리에 쌓이는 목록 (Figma 54169:29231)
   · 내 템플릿 "선택하기" → 그 템플릿이 들어감 (템플릿은 한 개만 · 다른 템플릿을 고르면 바뀜)
     버튼은 "선택됨"(파랑)으로 바뀌고, 다시 누르거나 목록의 X 를 누르면 빠짐
   · 샘플 문서 "선택하기" → 그 문서가 들어감 (여러 개 고를 수 있음)
   · 내 PC 업로드 · 끌어 놓기 → 고른 파일이 들어감 (템플릿 · 샘플 포함 최대 10개)
   · 하나라도 있으면 아래 [다음]이 켜지고, 누르면 2단계로 이동
     템플릿 만들기로 왔으면 역할 설정 (type=normal → participants-normal.html · 그 밖 → participants.html)
     템플릿 관리 [계약하기]로 왔으면(?tpl=…) 참여자 설정 participants-send.html (템플릿 역할을 넘김)
   · 템플릿 관리에서 [계약하기]로 오면 (?tpl=템플릿명&roles=역할,역할) 그 템플릿이 처음부터 선택된 상태
     내 템플릿 목록에 같은 이름이 있으면 그 행을 맨 위로 올려 고르고, 없으면 맨 위에 그 템플릿 행을 만들어 고름
     (역할 칸은 템플릿 관리의 역할로 바꿈) */
(function () {
  var MAX = 10;
  var card = document.querySelector('[data-drop]');
  var box = document.querySelector('[data-drop-box]');
  var picked = document.querySelector('[data-picked]');
  var list = document.querySelector('[data-picked-list]');
  var count = document.querySelector('[data-picked-count]');
  var fileInput = document.querySelector('[data-file]');
  var next = document.querySelector('[data-next]');
  var rows = [].slice.call(document.querySelectorAll('[data-panel="mine"] .imp-row'));      // 내 템플릿
  var samples = [].slice.call(document.querySelectorAll('[data-panel="sample"] .imp-row')); // 샘플 문서
  var items = []; // { name, size, template: true/false, row }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function sizeText(bytes) { return (bytes / 1048576).toFixed(2) + ' MB'; }

  function render() {
    list.innerHTML = '';
    // 템플릿을 맨 위에
    items.sort(function (a, b) { return (b.template ? 1 : 0) - (a.template ? 1 : 0); });
    items.forEach(function (it) {
      var li = el('li', 'picked__item');
      var main = el('div', 'picked__main');
      var grip = el('img'); grip.src = '../images/ic-grip-16.svg'; grip.width = 16; grip.height = 16; grip.alt = '';
      var doc = el('div', 'picked__doc');
      var icon = el('img'); icon.src = '../images/ic-doc-template-35.svg'; icon.width = 35; icon.height = 35; icon.alt = '';
      var text = el('div', 'picked__text');
      var name = el('p', 'picked__name');
      name.appendChild(el('span', '', it.name));
      if (it.template) name.appendChild(el('span', 'picked__tag', '템플릿'));
      text.appendChild(name);
      text.appendChild(el('p', 'picked__size', it.size));
      doc.appendChild(icon); doc.appendChild(text);
      main.appendChild(grip); main.appendChild(doc);
      var del = el('button', 'picked__del'); del.type = 'button'; del.setAttribute('aria-label', it.name + ' 빼기');
      del.addEventListener('click', function () { remove(it); });
      li.appendChild(main); li.appendChild(del);
      list.appendChild(li);
    });
    var has = items.length > 0;
    box.hidden = has;
    picked.hidden = !has;
    count.textContent = String(items.length);
    next.disabled = !has;
    rows.concat(samples).forEach(function (r) {
      var on = items.some(function (it) { return it.row === r; });
      var b = r.querySelector('.imp-row__select');
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? '선택됨' : '선택하기';
    });
  }
  function remove(it) {
    items = items.filter(function (x) { return x !== it; });
    render();
  }

  // 내 템플릿 선택하기 — 한 개만
  function pick(row) {
    var mine = items.filter(function (it) { return it.row === row; })[0];
    if (mine) { remove(mine); return; }
    items = items.filter(function (it) { return !it.template; });
    if (items.length >= MAX) items.pop();
    items.push({ name: row.querySelector('.imp-row__title').textContent, size: row.getAttribute('data-size'), template: true, row: row });
    render();
  }
  rows.forEach(function (row) {
    row.querySelector('.imp-row__select').addEventListener('click', function () { pick(row); });
  });

  // 샘플 문서 선택하기 — 여러 개 (전체 10개까지)
  samples.forEach(function (row) {
    row.querySelector('.imp-row__select').addEventListener('click', function () {
      var mine = items.filter(function (it) { return it.row === row; })[0];
      if (mine) { remove(mine); return; }
      if (items.length >= MAX) return;
      items.push({ name: row.querySelector('.imp-row__title').textContent, size: row.getAttribute('data-size'), template: false, row: row });
      render();
    });
  });

  // 내 PC 업로드 · 끌어 놓기
  function addFiles(files) {
    [].slice.call(files).forEach(function (f) {
      if (items.length >= MAX) return;
      items.push({ name: f.name, size: sizeText(f.size), template: false, row: null });
    });
    render();
  }
  fileInput.addEventListener('change', function () { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(function (t) {
    card.addEventListener(t, function (e) { e.preventDefault(); card.classList.add('is-drag'); });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    card.addEventListener(t, function (e) {
      if (t === 'dragleave' && card.contains(e.relatedTarget)) return;
      e.preventDefault();
      card.classList.remove('is-drag');
      if (t === 'drop' && e.dataTransfer) addFiles(e.dataTransfer.files);
    });
  });

  // 템플릿 관리 [계약하기]에서 넘어온 템플릿 — 처음부터 선택
  function param(k) {
    var m = location.search.match(new RegExp('[?&]' + k + '=([^&]*)'));
    try { return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; } catch (e) { return ''; }
  }
  // 역할 목록 — [{ role, name, contact, preset }] (예전 꼴 "역할,역할" 도 읽음)
  function parseRoles(v) {
    if (!v) return [];
    try {
      var a = JSON.parse(v);
      if (Array.isArray(a)) return a.map(function (x) { return { role: String(x.role || '').trim(), name: x.name || '', contact: x.contact || '', preset: !!x.preset }; });
    } catch (e) { /* 예전 꼴 */ }
    return v.split(',').map(function (x) { return x.trim(); }).filter(Boolean).map(function (r) { return { role: r, name: '', contact: '', preset: false }; });
  }
  var tplName = param('tpl').trim();
  if (tplName) {
    var hit = rows.filter(function (r) { return r.querySelector('.imp-row__title').textContent.trim() === tplName; })[0];
    if (!hit) {
      // 목록에 없으면 첫 행을 본떠 새 행을 만듦
      hit = rows[0].cloneNode(true);
      hit.querySelector('.imp-row__title').textContent = tplName;
      hit.querySelector('.imp-row__select').addEventListener('click', function () { pick(hit); });
      rows[rows.length - 1].remove(); // 한 쪽에 5행 그대로 (마지막 행은 다음 쪽으로 밀린 셈)
    }
    // 역할 칸도 템플릿 관리의 역할로 ("회사 외 2개 역할" 꼴)
    var roleNames = parseRoles(param('roles')).map(function (r) { return r.role; });
    if (roleNames.length) hit.querySelector('.imp-col-role').textContent = roleNames[0] + (roleNames.length > 1 ? ' 외 ' + (roleNames.length - 1) + '개 역할' : '');
    var ul = rows[0].parentNode;
    ul.insertBefore(hit, ul.firstChild); // 고른 템플릿을 목록 맨 위로
    rows = [].slice.call(document.querySelectorAll('[data-panel="mine"] .imp-row'));
    items.push({ name: tplName, size: hit.getAttribute('data-size'), template: true, row: hit });
  }

  // 다음 — [계약하기]로 왔으면 참여자 설정(participants-send.html)
  //        템플릿 만들기로 왔으면 ?type=normal → 일반 계약 역할 설정 · 그 밖 → 대량 전송 역할 설정
  var type = (location.search.match(/[?&]type=([^&]+)/) || [])[1];
  next.addEventListener('click', function () {
    if (next.disabled) return;
    if (tplName) {
      location.href = 'participants-send.html?type=' + (type === 'bulk' ? 'bulk' : 'normal') + '&roles=' + encodeURIComponent(param('roles'));
      return;
    }
    // 고른 문서 이름도 넘김 → 4단계 검토 "문서" 칸 · 템플릿명에 씀
    var doc = items[0].name + (items.length > 1 ? ' 외 ' + (items.length - 1) + '개' : '');
    location.href = (type === 'normal' ? 'participants-normal.html' : 'participants.html') + '?from=upload&doc=' + encodeURIComponent(doc);
  });
  render();
})();

/* 문서명 검색 · 카테고리 — 탭마다 따로 (입력한 글자가 들어간 문서만 보임) */
(function () {
  function norm(s) { return s.replace(/\s+/g, '').toLowerCase(); }
  document.querySelectorAll('[data-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-search]');
    var cat = panel.querySelector('[data-cat]');
    var rows = [].slice.call(panel.querySelectorAll('.imp-row'));
    var empty = panel.querySelector('[data-empty]');
    function filter() {
      var q = norm(input.value);
      var c = cat ? cat.value : '';
      var shown = 0;
      rows.forEach(function (r) {
        var catEl = r.querySelector('.imp-row__cat');
        var hit = (!q || norm(r.querySelector('.imp-row__title').textContent).indexOf(q) > -1) &&
          (!c || (catEl && catEl.textContent === c));
        r.hidden = !hit;
        if (hit) shown++;
      });
      empty.hidden = shown > 0;
    }
    input.addEventListener('input', filter);
    if (cat) cat.addEventListener('change', function () {
      cat.classList.toggle('is-set', !!cat.value);
      filter();
    });
  });
})();

/* 탭 — 내 템플릿 · 샘플 문서 (아래 쪽 번호 전체 수도 탭에 따라 1 · 48) */
(function () {
  var tabs = [].slice.call(document.querySelectorAll('[data-tab]'));
  var total = document.querySelector('[data-pager-total]');
  function show(name) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      var panel = document.querySelector('[data-panel="' + t.getAttribute('data-tab') + '"]');
      panel.hidden = !on;
      if (on && total) total.textContent = panel.getAttribute('data-pages');
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(t.getAttribute('data-tab')); });
  });
})();
