/* 예스폼싸인 2차 고도화 — 템플릿 관리 (2026-11-10) */

/* 표 행 — 행을 누르면 아래에 메뉴(계약 시작하기 · 수정하기 · 템플릿명 변경 · 삭제)가 펼쳐짐
   · [계약 시작하기] → 문서 업로드 (대량 전송 템플릿 upload.html?type=bulk · 일반 계약 템플릿 upload.html?type=normal)
     그 행의 템플릿명(tpl) · 역할(roles)도 함께 넘겨, 문서 업로드에서 그 템플릿이 선택된 상태로 보임
     roles 는 [{ role, name, contact, preset, auth, self }] (auth: 켠 추가 인증 이름들 · self: 서명 요청자 본인) — preset: true = 정보를 미리 입력한 역할(실선 라벨, 이름 · 연락처 있음)
                                                 false = 보낼 때 입력하는 역할(점선 라벨, 역할만)
   · 한 번에 한 행만 펼침 · 다시 누르면 접힘
   · 핀을 누르면 상단 고정 표시만 켜고 끔 (행 순서는 그대로)
   · 역할 칸: 같은 종류(미리 입력 · 보낼 때 입력) 역할이 2개 이상이면 "첫 역할 외 N개" 라벨 하나로 묶음 (Figma 54451:36056)
     숨긴 역할도 [계약 시작하기] 때 그대로 넘어감 · 묶은 라벨에 마우스를 올리면 전체 역할 이름 */
/* 템플릿 빈 화면 (Figma 54169:29120) — 표에 행이 없거나 index.html?empty 로 열면 표 대신 안내 상자를 보임 */
(function () {
  var box = document.querySelector('[data-tpl-empty]');
  var table = document.querySelector('.table');
  if (!box || !table) return;
  var empty = /[?&]empty(=|&|$)/.test(location.search) || !document.querySelector('[data-rows] .row');
  table.hidden = empty;
  box.hidden = !empty;
})();

(function () {
  [].forEach.call(document.querySelectorAll('[data-rows] .col-role'), function (cell) {
    var all = [].slice.call(cell.querySelectorAll('.role'));
    all.forEach(function (r) { r.setAttribute('data-role', r.textContent.trim()); });
    [all.filter(function (r) { return !r.classList.contains('role--empty'); }),
     all.filter(function (r) { return r.classList.contains('role--empty'); })].forEach(function (group) {
      if (group.length < 2) return;
      var first = group[0];
      var more = document.createElement('span');
      more.className = 'role__more';
      more.textContent = ' 외 ' + (group.length - 1) + '개';
      first.appendChild(more);
      first.title = group.map(function (r) { return r.getAttribute('data-role'); }).join(', ');
      group.slice(1).forEach(function (r) { r.hidden = true; });
    });
  });
})();

(function () {
  var list = document.querySelector('[data-rows]');
  var tpl = document.getElementById('row-actions');
  if (!list || !tpl) return;
  var rows = [].slice.call(list.querySelectorAll('.row'));

  function setOpen(row, open) {
    var btn = row.querySelector('.row__toggle');
    var panel = row.querySelector('.row__actions');
    row.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '메뉴 접기' : '메뉴 펼치기');
    if (open && !panel) row.appendChild(tpl.content.cloneNode(true));
    if (!open && panel) panel.remove();
  }

  // 펼친 메뉴의 [계약 시작하기] — 문서 업로드로 이동 (유형에 따라 ?type=bulk · ?type=normal)
  // 템플릿명 · 역할 이름도 넘김 → 문서 업로드에서 이 템플릿이 고른 상태로 보임
  list.addEventListener('click', function (e) {
    var send = e.target.closest('.act--send');
    if (!send) return;
    if (window.signNoQuota) { window.signNoQuota(send); return; } // 잔여 건수 0 — 결제 안내 모달
    var row = send.closest('.row');
    if (!row) return;
    var roles = [].map.call(row.querySelectorAll('.col-role .role'), function (r) {
      var preset = !r.classList.contains('role--empty');
      var auth = (r.getAttribute('data-auth') || '').split(',').map(function (a) { return a.trim(); }).filter(Boolean);
      return { role: (r.getAttribute('data-role') || r.textContent).trim(), name: preset ? r.getAttribute('data-name') || '' : '', contact: preset ? r.getAttribute('data-contact') || '' : '', preset: preset, auth: auth,
        self: r.getAttribute('data-self') === 'true' };
    });
    location.href = 'pages/upload.html?type=' + (row.querySelector('.type--bulk') ? 'bulk' : 'normal') +
      '&tpl=' + encodeURIComponent(row.querySelector('.row__title').textContent.trim()) +
      '&roles=' + encodeURIComponent(JSON.stringify(roles));
  });

  rows.forEach(function (row) {
    if (row.classList.contains('is-open')) setOpen(row, true);
    row.querySelector('.row__main').addEventListener('click', function (e) {
      var pin = e.target.closest('.pin');
      if (pin) {
        var on = !pin.classList.contains('is-on');
        pin.classList.toggle('is-on', on);
        pin.setAttribute('aria-pressed', on ? 'true' : 'false');
        return;
      }
      var open = !row.classList.contains('is-open');
      rows.forEach(function (r) { if (r !== row && r.classList.contains('is-open')) setOpen(r, false); });
      setOpen(row, open);
    });
  });
})();

/* 템플릿명 검색 — 입력한 글자가 들어간 템플릿만 보임 (띄어쓰기 · 대소문자 무시) */
(function () {
  var input = document.querySelector('[data-search]');
  var list = document.querySelector('[data-rows]');
  var empty = document.querySelector('[data-empty]');
  if (!input || !list) return;
  var rows = [].slice.call(list.querySelectorAll('.row'));
  function norm(s) { return s.replace(/\s+/g, '').toLowerCase(); }
  input.addEventListener('input', function () {
    var q = norm(input.value);
    var shown = 0;
    rows.forEach(function (row) {
      var hit = !q || norm(row.querySelector('.row__title').textContent).indexOf(q) > -1;
      row.hidden = !hit;
      if (hit) shown++;
    });
    empty.hidden = shown > 0;
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && input.value) { input.value = ''; input.dispatchEvent(new Event('input')); }
  });
})();

/* 템플릿 유형 선택 모달 — "템플릿 만들기"를 누르면 열림
   · [다음] → 문서 업로드 (대량 전송 upload.html?type=bulk · 일반 계약 upload.html?type=normal)
     템플릿 만들기 흐름이라 주소에 &flow=tpl 을 붙임 → 위쪽 2단계 이름이 "역할 설정"
   · 취소 · 바깥(어두운 곳) · Esc 로 닫힘
   · 열 때마다 "일반 계약"이 골라진 상태로 시작 · 닫으면 "템플릿 만들기" 버튼으로 초점이 돌아감 */
(function () {
  var opener = null;
  function open(dim, from) {
    opener = from || null;
    var first = dim.querySelector('input[type="radio"]');
    if (first) first.checked = true;
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    var checked = dim.querySelector('input[type="radio"]:checked');
    if (checked) checked.focus({ preventScroll: true });
  }
  function close(dim) {
    dim.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
    var dim = document.getElementById(btn.getAttribute('data-modal-open'));
    if (!dim) return;
    btn.addEventListener('click', function () { open(dim, btn); });
    dim.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-next]')) {
        // 다음 → 문서 업로드 화면 (고른 유형을 주소에 붙여 넘김)
        var picked = dim.querySelector('input[type="radio"]:checked');
        location.href = 'pages/upload.html?type=' + (picked && picked.value === 'bulk' ? 'bulk' : 'normal') + '&flow=tpl';
        return;
      }
      if (e.target === dim || e.target.closest('[data-modal-close]')) close(dim);
    });
    document.addEventListener('keydown', function (e) {
      if (dim.hidden) return;
      if (e.key === 'Escape') { close(dim); return; }
      if (e.key !== 'Tab') return;
      // Tab 키가 모달 밖으로 나가지 않게 (고른 카드 → 취소 → 다음 → 다시 처음)
      var items = [dim.querySelector('input[type="radio"]:checked')].concat([].slice.call(dim.querySelectorAll('.modal__btn')));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      else if (i === -1) { e.preventDefault(); items[0].focus(); }
    });
  });
})();

/* 잔여 건수 없음 (Figma 01_03_이용제한모달) — index.html?quota=0&modal=1 · modal=2
   · 왼쪽 메뉴 "잔여 건수 0건" · [계약 시작하기](왼쪽 메뉴 · 펼친 행)를 누르면 결제 안내 모달
   · 01 (54568:42307) 카드 2장 · 02 (54330:31462) 그림 카드 2장 — 주소의 modal 값으로 고름 (없으면 01)
   · 시안 바로가기에서 들어오면 바로 열린 상태로 보임 · 닫기(X) · 바깥 · Esc 로 닫힘 */
(function () {
  if (!/[?&]quota=0(&|$)/.test(location.search)) return;
  var m = location.search.match(/[?&]modal=(\d)/);
  var dim = document.getElementById('quota-modal-' + (m && m[1] === '2' ? '2' : '1'));
  if (!dim) return;
  var q = document.querySelector('[data-quota]');
  if (q) q.textContent = '잔여 건수 0건';
  var opener = null;
  function open(from) {
    opener = from || null;
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    dim.querySelector('.quota').focus({ preventScroll: true }); // 모달 상자에 초점 (닫기 버튼에 테두리가 생기지 않게)
  }
  function close() {
    dim.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus({ preventScroll: true });
  }
  window.signNoQuota = open;
  var start = document.querySelector('[data-start]');
  if (start) start.addEventListener('click', function () { open(start); });
  dim.querySelector('[data-quota-close]').addEventListener('click', close);
  dim.addEventListener('click', function (e) { if (e.target === dim) close(); });
  document.addEventListener('keydown', function (e) { if (!dim.hidden && e.key === 'Escape') close(); });
  open(start);
})();
