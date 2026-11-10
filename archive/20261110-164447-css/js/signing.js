/* 예스폼싸인 2차 고도화 — 3단계 서명 조건 설정 (2026-11-10)
   Figma 서명조건설정 (54279:31589)

   역할 — 2단계 참여자 설정에서 입력한 역할을 그대로 씀
   · 2단계 [다음]이 주소 뒤 ?d=… 로 역할 목록을 넘겨줌 { type, roles: [{ role, name, contact, self }] }
   · 왼쪽 패널은 흐름마다 다름
     [템플릿 만들기] (flow=tpl · 바로 열기) — Figma 54320:48376
       "역할" 상자 하나: {역할명} · 이름 · 연락처 · "서명 요청자 본인". 눌러서 다른 역할로 바꿈 + 아래 입력 항목
     [계약하기] (flow=send) — Figma 54376:36659
       "서명 참여자" 카드(li)가 참여자마다 하나씩: {이름} · 연락처 · 역할 라벨 · "서명 요청자 본인" + 카드마다 입력 항목
       카드 머리를 누르면 그 카드의 입력 항목이 접히고 펼쳐짐 · 입력 항목을 누르면 오른쪽 "역할 선택"이 그 참여자로 바뀜
     색은 Figma 색상 순서(53693:29199)대로 1번째 빨강 · 2번째 노랑 · 3번째 주황 …
   · 오른쪽 "역할 선택": 문서에 놓인 도장 칸의 역할. 바꾸면 도장 칸 색도 그 역할 색으로 바뀜
   · 처음엔 서명 요청자 본인 역할(없으면 첫 역할)이 골라져 있음
   · 이 화면을 바로 열면 Figma 예시 역할(회사 · 홍길동 · 1234564@gmail.com · 서명 요청자 본인)로 보임
   오른쪽 설정 칸 — 왼쪽 입력 항목을 누르면 그 항목 설정으로 바뀜
   · 도장 → 도장 설정 (문서 위 도장 칸도 이때만 보임)
   · 공통 항목 [텍스트] → 텍스트 · 공통 항목 설정 (역할 선택 없음 · 읽기전용 고정)
   · 역할 [텍스트] → 텍스트 설정 (누르면 "(1)" 표시 · 항목명이 비면 "필수 입력 항목입니다.")
     문서 위에는 텍스트 칸이 보이고, 칸 색은 "역할 선택"에서 고른 역할 색
   · 공통 항목 [날짜] → 날짜 · 공통 항목 설정 (54293:44177) — 자동 완성 방식 고르기 · 표기 방식
   · 나머지 항목은 디자인이 없어 눌러도 바뀌지 않음
   역할 상자에는 2단계에서 입력한 이름 · 연락처가 같이 보임 · 역할 색은 Figma 색상 순서 (53693:29199)
   그 밖: 확대/축소(50~200%) · 글자 색 · 정렬 고르기 */
(function () {
  // 역할 색 — Figma 색상 순서 (53693:29199): 빨강 · 노랑 · 주황 · 초록 · 청록 · 파랑 · 남색 · 보라 · 자주 · 갈색
  var COLORS = ['#EF565D', '#EEC10F', '#F07F23', '#189648', '#1CAEC0', '#4675FA', '#39539C', '#8558E4', '#C844AC', '#995A17'];
  var SEND = /[?&]flow=send(&|$)/.test(location.search); // [계약하기]로 왔는지

  var data = null;
  try {
    var m = location.search.match(/[?&]d=([^&]+)/);
    if (m) data = JSON.parse(decodeURIComponent(m[1]));
  } catch (e) { data = null; }
  if (!data || !data.roles || !data.roles.length) {
    data = { type: 'normal', roles: [{ role: '회사', name: '홍길동', contact: '1234564@gmail.com', self: true }] };
  }
  var roles = data.roles.map(function (r, i) {
    return { role: String(r.role || '').trim() || (i + 1) + '번째 참여자', name: r.name || '', contact: r.contact || '', self: !!r.self, color: COLORS[i % COLORS.length] };
  });
  var start = Math.max(0, roles.findIndex(function (r) { return r.self; }));

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tint(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function metaLine(r) {
    if (r.name || r.contact) return '<span class="role-sel__meta"><span>' + esc(r.name) + '</span>' + (r.name && r.contact ? '<i></i>' : '') + '<span class="role-sel__contact">' + esc(r.contact) + '</span></span>';
    if (data.type === 'bulk') return '<span class="role-sel__meta"><span>이름 · 연락처는 대량 전송 시 입력</span></span>';
    return '';
  }
  // 왼쪽 큰 상자 — Figma Select box (54287:33348)
  //   역할 + 이름 · 연락처 → h60 (temp_role) · 서명 요청자 본인이면 라벨이 붙어 h84 (temp_role_self)
  function bigHTML(r) {
    return '<span class="role-sel__text"><span class="role-sel__dot" style="background:' + r.color + '"></span>' +
      '<span class="role-sel__name">' + esc(r.role) + '</span>' + metaLine(r) +
      (r.self ? '<span class="self-tag">서명 요청자 본인</span>' : '') + '</span>' +
      '<span class="role-sel__arrow"><img src="../images/ic-trailing-9.svg" width="9" height="6" alt=""></span>';
  }
  // [계약하기] 서명 참여자 카드 머리 — Figma Select box temp (54287:33348): {이름} · 연락처 · 역할 라벨 · 서명 요청자 본인
  function personHTML(r) {
    return '<span class="role-sel__text"><span class="role-sel__dot" style="background:' + r.color + '"></span>' +
      '<span class="role-sel__name">' + esc(r.name || r.role) + '</span>' +
      (r.contact ? '<span class="role-sel__meta"><span class="role-sel__contact">' + esc(r.contact) + '</span></span>' : '') +
      '<span class="role-sel__chips"><span class="role"><img src="../images/ic-user-on-12.svg" width="12" height="12" alt="">' + esc(r.role) + '</span>' +
      (r.self ? '<span class="self-tag">서명 요청자 본인</span>' : '') + '</span></span>' +
      '<span class="role-sel__arrow"><img src="../images/ic-trailing-9.svg" width="9" height="6" alt=""></span>';
  }
  // 오른쪽 작은 상자 (h36) — [계약하기]는 이름 + 역할
  function smallHTML(r) {
    var main = SEND && r.name ? r.name : r.role;
    var sub = SEND && r.name ? r.role : '';
    return '<span class="role-sel__dot" style="background:' + r.color + '"></span>' +
      '<span class="role-sel__line"><span class="role-sel__name">' + esc(main) + '</span>' +
      (sub ? '<span class="role-sel__sub">' + esc(sub) + '</span>' : '') + (r.self ? '<span class="role-sel__sub">요청자 본인</span>' : '') + '</span>' +
      '<span class="role-sel__arrow"><img src="../images/ic-trailing-9.svg" width="9" height="6" alt=""></span>';
  }
  function optionHTML(r, i, cur) {
    var main = SEND && r.name ? r.name : r.role;
    var who = SEND ? (r.name ? r.role : '') : r.name;
    return '<li class="role-menu__item' + (i === cur ? ' is-on' : '') + '" role="option" tabindex="-1" aria-selected="' + (i === cur) + '" data-i="' + i + '">' +
      '<span class="role-sel__dot" style="background:' + r.color + '"></span><span class="role-menu__name">' + esc(main) + '</span>' +
      (r.self ? '<span class="role-sel__sub">요청자 본인</span>' : '') +
      (who ? '<span class="role-menu__who">' + esc(who) + '</span>' : '') + '</li>';
  }

  // 역할 고르는 상자 하나 (왼쪽 · 오른쪽 각각)
  function picker(root, small, onChange) {
    var btn = root.querySelector('[data-role-btn]');
    var menu = root.querySelector('[data-role-menu]');
    var cur = start;
    function draw() {
      var r = roles[cur];
      btn.innerHTML = small ? smallHTML(r) : bigHTML(r);
      if (!small) btn.style.background = tint(r.color, 0.1);
      menu.innerHTML = roles.map(function (x, i) { return optionHTML(x, i, cur); }).join('');
      if (onChange) onChange(r);
    }
    function open(v) {
      menu.hidden = !v;
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      if (v) { var on = menu.querySelector('.is-on'); if (on) on.focus(); }
    }
    btn.addEventListener('click', function () { open(menu.hidden); });
    menu.addEventListener('click', function (e) {
      var it = e.target.closest('[data-i]');
      if (!it) return;
      cur = Number(it.getAttribute('data-i'));
      draw(); open(false); btn.focus();
    });
    menu.addEventListener('keydown', function (e) {
      var items = [].slice.call(menu.children);
      var i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)].focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i > -1) items[i].click(); }
      if (e.key === 'Escape') { open(false); btn.focus(); }
    });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) open(false); });
    draw();
    return { set: function (i) { cur = i; draw(); } };
  }

  var box = document.querySelector('[data-field-box]');
  var note = document.querySelector('[data-self-note]');
  // 왼쪽 패널 — [템플릿 만들기] 역할 상자 하나 · [계약하기] 서명 참여자 카드 여러 장
  (function () {
    var title = document.querySelector('[data-role-title]');
    var body = document.querySelector('[data-role-body]');
    var items = document.querySelector('[data-role-items]');
    if (!body || !items) return;
    if (!SEND) {
      var boxEl = document.createElement('div');
      boxEl.className = 'ed-box ed-box--role';
      boxEl.innerHTML = '<div class="role-pick" data-role-pick><button class="role-sel" type="button" aria-haspopup="listbox" aria-expanded="false" data-role-btn></button>' +
        '<ul class="role-menu" role="listbox" hidden data-role-menu></ul></div>';
      boxEl.appendChild(items);
      body.appendChild(boxEl);
      picker(boxEl.querySelector('[data-role-pick]'), false);
      return;
    }
    title.innerHTML = '서명 참여자<img class="ed-sec__icon" src="../images/ic-info-gray-16.svg" width="16" height="16" alt="">';
    var list = document.createElement('ul');
    list.className = 'role-list';
    list.setAttribute('aria-label', '서명 참여자 목록');
    roles.forEach(function (r, i) {
      var li = document.createElement('li');
      li.className = 'ed-box ed-box--role';
      li.setAttribute('data-person', String(i));
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'role-sel role-sel--person';
      btn.setAttribute('aria-expanded', 'true');
      btn.innerHTML = personHTML(r);
      btn.style.background = tint(r.color, 0.1);
      var group = items.cloneNode(true);
      group.removeAttribute('data-role-items');
      btn.addEventListener('click', function () {
        var open = group.hidden;
        group.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      li.appendChild(btn);
      li.appendChild(group);
      list.appendChild(li);
    });
    items.remove();
    body.appendChild(list);
  })();

  var pickStamp = picker(document.querySelector('[data-field-role-pick="stamp"]'), true, function (r) {
    box.style.background = tint(r.color, 0.16);
    note.hidden = !r.self; // 요청자 본인 안내는 요청자 본인 역할일 때만
  });
  var textBox = document.querySelector('[data-text-box]');
  var pickText = picker(document.querySelector('[data-field-role-pick="text"]'), true, function (r) {
    textBox.style.background = tint(r.color, 0.16);
  });
  // [계약하기] 카드의 입력 항목을 누르면 오른쪽 "역할 선택"을 그 참여자로 (아래 입력 항목 코드에서 부름)
  window.signSetPerson = function (i) { pickStamp.set(i); pickText.set(i); };
  window.signStart = start;
})();

/* 입력 항목 — 누르면 오른쪽 설정 칸이 그 항목으로 바뀜 (설정 디자인이 있는 항목만)
   [계약하기]는 카드마다 입력 항목이 있어, 누른 그 항목에만 고른 표시 */
(function () {
  var left = document.querySelector('.ed-left');
  var panels = [].slice.call(document.querySelectorAll('[data-panel-box]'));
  var field = document.querySelector('[data-field]');
  var textField = document.querySelector('[data-text-field]');
  var right = document.querySelector('.ed-right');
  function select(it) {
    var name = it.getAttribute('data-panel');
    left.querySelectorAll('.ed-item').forEach(function (x) {
      var on = x === it;
      x.classList.toggle('is-on', on);
      if (x.hasAttribute('data-panel')) x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel-box') !== name; });
    field.hidden = name !== 'stamp'; // 문서 위 도장 칸은 도장을 골랐을 때만
    textField.hidden = name !== 'text-role'; // 텍스트 칸은 역할 텍스트를 골랐을 때만
    right.scrollTop = 0;
    var card = it.closest('[data-person]');
    if (card && window.signSetPerson) window.signSetPerson(Number(card.getAttribute('data-person')));
  }
  left.addEventListener('click', function (e) {
    var it = e.target.closest('.ed-item[data-panel]');
    if (!it) return;
    // 역할 텍스트는 누르면 문서에 1개 놓인 것으로 보고 "(1)" 표시
    if (it.getAttribute('data-panel') === 'text-role' && !it.querySelector('.ed-item__count')) {
      var c = document.createElement('span');
      c.className = 'ed-item__count';
      c.textContent = '(1)';
      it.appendChild(c);
    }
    select(it);
  });
  // 처음엔 도장 (계약하기는 서명 요청자 본인 · 없으면 첫 참여자 카드의 도장)
  var startCard = left.querySelector('[data-person="' + (window.signStart || 0) + '"]');
  select((startCard || left).querySelector('.ed-item[data-panel="stamp"]'));
})();

/* 설정 칸 안 — 항목명 필수 확인 · 글자 색 · 정렬 */
(function () {
  // 항목명이 비면 빨간 테두리와 "필수 입력 항목입니다."
  document.querySelectorAll('[data-required]').forEach(function (f) {
    var input = f.querySelector('.ed-input');
    var help = f.querySelector('.ed-help');
    function check() {
      var bad = !input.value.trim();
      f.classList.toggle('is-error', bad);
      help.hidden = !bad;
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    }
    input.addEventListener('input', check);
    check();
  });
  // 글자 색 — 칸을 누르면 색 고르기 창이 열리고, 고른 색이 동그라미와 글자로 보임
  document.querySelectorAll('.ed-color').forEach(function (c) {
    var input = c.querySelector('[data-color]');
    input.addEventListener('input', function () {
      c.querySelector('[data-color-chip]').style.background = input.value;
      c.querySelector('[data-color-text]').textContent = input.value;
    });
  });
  // 날짜 자동 완성 — "서명 참여자 지정 입력"일 때만 아래 안내 문구 (다른 쪽은 디자인이 없음)
  document.querySelectorAll('[data-date-mode]').forEach(function (g) {
    var help = g.querySelector('[data-date-help]');
    function sync() {
      var on = g.querySelector('input:checked');
      help.hidden = !on || on.value !== 'signer';
    }
    g.addEventListener('change', sync);
    sync();
  });
  // 정렬 — 셋 중 하나
  document.querySelectorAll('[data-align]').forEach(function (g) {
    var btns = [].slice.call(g.querySelectorAll('.ed-align__btn'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) {
          x.classList.toggle('is-on', x === b);
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
      });
    });
  });
})();

/* 확대 · 축소 — 문서를 10%씩 (50~200%) */
(function () {
  var doc = document.querySelector('[data-doc]');
  var label = document.querySelector('[data-zoom-label]');
  var z = 100;
  function set(v) {
    z = Math.max(50, Math.min(200, v));
    doc.style.zoom = String(z / 100);
    label.firstChild.nodeValue = z + '%';
  }
  document.querySelectorAll('[data-zoom]').forEach(function (b) {
    b.addEventListener('click', function () { set(z + (b.getAttribute('data-zoom') === 'in' ? 10 : -10)); });
  });
})();

/* 공통 항목 · 역할 안내 툴팁 — 아이콘 오른쪽에, 화살표가 아이콘 가운데를 가리킴
   (왼쪽 칸 스크롤에 잘리지 않게 화면 기준 자리) */
(function () {
  document.querySelectorAll('.ed-tip').forEach(function (tip) {
    var btn = tip.querySelector('.ed-tip__btn');
    var box = tip.querySelector('.ed-tip__box');
    function show() {
      var r = btn.getBoundingClientRect();
      box.style.left = (r.right + 4) + 'px';
      box.style.top = (r.top + r.height / 2 - 17) + 'px'; // 화살표(6 × 34) 가운데 = 위에서 17
      tip.classList.add('is-on');
    }
    function hide() { tip.classList.remove('is-on'); }
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('focus', show);
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('blur', hide);
  });
})();

/* 다음 — 템플릿 만들기면 4단계 검토(review.html)로, 넘겨받은 내용(?d=…)을 그대로 넘김
   [계약하기](flow=send)는 검토 화면 디자인이 없어 움직이지 않음 */
(function () {
  var next = document.querySelector('[data-next]');
  if (!next || /[?&]flow=send(&|$)/.test(location.search)) return;
  next.addEventListener('click', function () {
    var m = location.search.match(/[?&]d=([^&]+)/);
    location.href = 'review.html?flow=tpl' + (m ? '&d=' + m[1] : '');
  });
})();
