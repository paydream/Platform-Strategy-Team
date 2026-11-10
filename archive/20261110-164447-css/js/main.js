/* 예스폼싸인 2차 고도화 — 템플릿 관리 (2026-11-10) */

/* 표 행 — 행을 누르면 아래에 메뉴(계약하기 · 수정하기 · 이름 변경 · 삭제)가 펼쳐짐
   · [계약하기] → 문서 업로드 (대량 전송 템플릿 upload.html?type=bulk · 일반 계약 템플릿 upload.html?type=normal)
     그 행의 템플릿명(tpl) · 역할(roles)도 함께 넘겨, 문서 업로드에서 그 템플릿이 선택된 상태로 보임
     roles 는 [{ role, name, contact, preset, auth, self }] (auth: 켠 추가 인증 이름들 · self: 서명 요청자 본인) — preset: true = 정보를 미리 입력한 역할(실선 라벨, 이름 · 연락처 있음)
                                                 false = 보낼 때 입력하는 역할(점선 라벨, 역할만)
   · 한 번에 한 행만 펼침 · 다시 누르면 접힘
   · 핀을 누르면 상단 고정 표시만 켜고 끔 (행 순서는 그대로) */
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

  // 펼친 메뉴의 [계약하기] — 문서 업로드로 이동 (유형에 따라 ?type=bulk · ?type=normal)
  // 템플릿명 · 역할 이름도 넘김 → 문서 업로드에서 이 템플릿이 고른 상태로 보임
  list.addEventListener('click', function (e) {
    var send = e.target.closest('.act--send');
    if (!send) return;
    var row = send.closest('.row');
    if (!row) return;
    var roles = [].map.call(row.querySelectorAll('.col-role .role'), function (r) {
      var preset = !r.classList.contains('role--empty');
      var auth = (r.getAttribute('data-auth') || '').split(',').map(function (a) { return a.trim(); }).filter(Boolean);
      return { role: r.textContent.trim(), name: preset ? r.getAttribute('data-name') || '' : '', contact: preset ? r.getAttribute('data-contact') || '' : '', preset: preset, auth: auth,
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
