/* 예스폼싸인 2차 고도화 — 대량 전송 목록 (pages/bulk-list.html · Figma 54552:47470)

   · 행을 누르면 대량 전송 상세(bulk-detail.html) — 체크박스 · [⋯] 칸을 누를 때는 이동하지 않음
   · 체크박스: 맨 위 칸은 모두 선택 / 일부만 고르면 가운데 줄 표시
   · 발송 상태 · 라벨 고르기 + 문서 또는 참여자 검색 → 조건에 맞는 행만 보임 (위치 표시 "대량 전송(N건)"도 바뀜)
   · [⋯] → 추가 메뉴(계약 재발송 · 라벨 설정 · 계약 삭제) — 바깥 · Esc · 항목을 누르면 닫힘 (항목 동작은 디자인 없음) */
(function () {
  var table = document.querySelector('[data-table]');
  if (!table) return;
  var rows = [].slice.call(table.querySelectorAll('[data-rows] .bl-row'));
  var all = table.querySelector('[data-check-all]');
  var empty = table.querySelector('[data-empty]');
  var status = document.querySelector('[data-filter-status]');
  var label = document.querySelector('[data-filter-label]');
  var search = document.querySelector('[data-search]');
  var count = document.querySelector('[data-crumb-count]');
  var mini = table.querySelector('[data-mini]');

  // 행 누르기 → 상세
  rows.forEach(function (row) {
    row.addEventListener('click', function (e) {
      if (e.target.closest('.cbox, .bl-col-more, a')) return;
      location.href = row.querySelector('.bl-title').getAttribute('href');
    });
  });

  // 체크박스
  function visible() { return rows.filter(function (r) { return !r.hidden; }); }
  function syncAll() {
    var v = visible();
    var n = v.filter(function (r) { return r.querySelector('[data-check]').checked; }).length;
    all.checked = n > 0 && n === v.length;
    all.indeterminate = n > 0 && n < v.length;
    rows.forEach(function (r) { r.classList.toggle('is-checked', r.querySelector('[data-check]').checked); });
  }
  table.addEventListener('change', function (e) { if (e.target.hasAttribute('data-check')) syncAll(); });
  all.addEventListener('change', function () {
    visible().forEach(function (r) { r.querySelector('[data-check]').checked = all.checked; });
    syncAll();
  });

  // 거르기 — 발송 상태 · 라벨 · 검색어 (계약명 · 참여자 이름, 띄어쓰기 무시)
  function norm(s) { return (s || '').replace(/\s+/g, '').toLowerCase(); }
  function filter() {
    var st = status.value;
    var lb = label.value;
    var q = norm(search.value);
    var shown = 0;
    rows.forEach(function (r) {
      var rowStatus = r.querySelector('.bdg').textContent.trim();
      var chip = r.querySelector('.chip');
      var rowLabel = chip ? chip.textContent.trim() : '';
      var text = norm(r.querySelector('.bl-title').textContent + ' ' + (r.getAttribute('data-people') || ''));
      var hit = (!st || rowStatus === st) && (!lb || rowLabel === lb) && (!q || text.indexOf(q) > -1);
      r.hidden = !hit;
      if (hit) shown++;
    });
    empty.hidden = shown > 0;
    count.textContent = '대량 전송(' + shown + '건)';
    [status, label].forEach(function (s) { s.classList.toggle('is-set', !!s.value); });
    closeMini();
    syncAll();
  }
  status.addEventListener('change', filter);
  label.addEventListener('change', filter);
  search.addEventListener('input', filter);
  search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && search.value) { search.value = ''; filter(); }
  });

  // [⋯] 추가 메뉴 — 누른 버튼 오른쪽 끝 + 10 에 맞추고 아래로 5 띄움 (Figma 위치)
  var opener = null;
  function openMini(btn) {
    closeMini();
    opener = btn;
    btn.setAttribute('aria-expanded', 'true');
    mini.hidden = false;
    var t = table.getBoundingClientRect();
    var b = btn.getBoundingClientRect();
    mini.style.left = Math.round(b.right - t.left + 10 - mini.offsetWidth) + 'px';
    mini.style.top = Math.round(b.bottom - t.top + 5) + 'px';
    mini.querySelector('.mini__item').focus({ preventScroll: true });
  }
  function closeMini(back) {
    if (mini.hidden) return;
    mini.hidden = true;
    if (opener) {
      opener.setAttribute('aria-expanded', 'false');
      if (back) opener.focus({ preventScroll: true });
    }
    opener = null;
  }
  table.addEventListener('click', function (e) {
    var btn = e.target.closest('.bl-more');
    if (btn) { if (opener === btn) closeMini(); else openMini(btn); return; }
    if (e.target.closest('.mini__item')) closeMini(true);
  });
  document.addEventListener('mousedown', function (e) {
    if (!mini.hidden && !mini.contains(e.target) && !e.target.closest('.bl-more')) closeMini();
  });
  document.addEventListener('keydown', function (e) {
    if (mini.hidden) return;
    if (e.key === 'Escape') { closeMini(true); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var items = [].slice.call(mini.querySelectorAll('.mini__item'));
      var i = items.indexOf(document.activeElement);
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    }
  });

  syncAll();
})();
