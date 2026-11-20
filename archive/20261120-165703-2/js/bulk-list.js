/* 예스폼싸인 2차 고도화 — 대량 전송 목록 (pages/bulk-list.html · Figma 54552:47470)

   · 행을 누르면 대량 전송 상세(bulk-detail.html) — 체크박스 · [⋯] 칸을 누를 때는 이동하지 않음
   · 체크박스: 맨 위 칸은 모두 선택 / 일부만 고르면 가운데 줄 표시
   · 발송 상태 · 라벨 고르기 + 문서 또는 참여자 검색 → 조건에 맞는 행만 보임 (위치 표시 "대량 전송(N건)"도 바뀜)
   · [⋯] → 추가 메뉴(계약 재발송 · 라벨 설정 · 계약 삭제) — 바깥 · Esc · 항목을 누르면 닫힘
   · 삭제 (2026-11-20 · Figma 삭제 모달 54661:48197)
     위 [삭제] — 체크한 행이 없으면 흐림 · 누르면 삭제 모달 → [삭제하기] 체크한 행을 지움
     추가 메뉴 [계약 삭제] — 같은 모달 → [삭제하기] 그 행을 지움 · [닫기] · 바깥 · Esc → 지우지 않음
     (계약 재발송은 디자인이 없어 눌러도 그대로 · 새로 고침하면 지운 행이 돌아옴)
   · 라벨 설정 (2026-11-20 · Figma 53702:42429) — js/label-modal.js
     위 [라벨 설정] → 체크한 행 · 추가 메뉴 [라벨 설정] → 그 행 · [설정하기]로 라벨 칸(data-labels)이 바뀜
     라벨 고르기 목록은 모달의 라벨 목록을 따라감 · 한 행에 라벨이 여럿이면 그중 하나만 맞아도 보임 */
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
    if (delBtn) delBtn.disabled = !checkedRows().length; // 체크한 행이 없으면 [삭제] 흐림
  }
  var delBtn = document.querySelector('[data-del-checked]');
  function checkedRows() { return visible().filter(function (r) { return r.querySelector('[data-check]').checked; }); }
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
      var lh = r.querySelector('[data-labels]');
      var rowLabels = lh && lh.getAttribute('data-labels') ? lh.getAttribute('data-labels').split('|') : [];
      var text = norm(r.querySelector('.bl-title').textContent + ' ' + (r.getAttribute('data-people') || ''));
      var hit = (!st || rowStatus === st) && (!lb || rowLabels.indexOf(lb) > -1) && (!q || text.indexOf(q) > -1);
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
    var item = e.target.closest('.mini__item');
    if (!item) return;
    if (item.hasAttribute('data-mini-label')) {
      // 추가 메뉴 [라벨 설정] → 메뉴를 연 행에 붙일 라벨을 고름
      var lrow = opener && opener.closest('.bl-row');
      var lback = opener;
      closeMini();
      if (lrow && window.labelModal) labelModal.open([lrow.querySelector('[data-labels]')], lback);
      return;
    }
    if (item.hasAttribute('data-mini-del')) {
      // 추가 메뉴 [계약 삭제] → 메뉴를 연 행만 지울 대상으로
      var row = opener && opener.closest('.bl-row');
      var back = opener;
      closeMini();
      if (row) openDel([row], back);
      return;
    }
    closeMini(true);
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

  // [라벨 설정] — 체크한 행에 붙일 라벨을 고름 (체크한 행이 없으면 라벨 추가 · 수정 · 삭제만)
  var labelBtn = document.querySelector('[data-label-checked]');
  if (labelBtn) labelBtn.addEventListener('click', function () {
    if (!window.labelModal) return;
    labelModal.open(checkedRows().map(function (r) { return r.querySelector('[data-labels]'); }), labelBtn);
  });
  // 라벨 고르기 목록 — 라벨 설정 모달의 목록과 맞춤 · 라벨이 바뀌면 다시 거름
  function fillLabels() {
    if (!window.labelModal) return;
    var cur = label.value;
    var names = labelModal.labels();
    label.innerHTML = '<option value="">라벨 미선택</option>' + names.map(function (n) {
      var v = n.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      return '<option value="' + v + '">' + v + '</option>';
    }).join('');
    label.value = names.indexOf(cur) > -1 ? cur : '';
  }
  document.addEventListener('labels:change', function () { fillLabels(); filter(); });
  fillLabels();

  // 삭제 모달 — 지울 행(targets)을 정해 두고 [삭제하기]에서 지움
  var dim = document.getElementById('delete-modal');
  var targets = [];
  var delFrom = null;
  function openDel(list, from) {
    targets = list;
    delFrom = from || null;
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    dim.querySelector('.modal').focus({ preventScroll: true });
  }
  function closeDel(focusEl) {
    dim.hidden = true;
    document.body.style.overflow = '';
    var f = focusEl || delFrom;
    if (f && document.contains(f) && !f.disabled) f.focus({ preventScroll: true });
    targets = [];
  }
  if (delBtn) delBtn.addEventListener('click', function () {
    var list = checkedRows();
    if (list.length) openDel(list, delBtn);
  });
  dim.querySelector('[data-delete-ok]').addEventListener('click', function () {
    targets.forEach(function (r) { r.remove(); });
    rows = rows.filter(function (r) { return targets.indexOf(r) < 0; });
    filter(); // 위치 표시 건수 · 빈 표 안내 · 체크 상태 · [삭제] 흐림 다시 맞춤
    closeDel(search);
  });
  dim.addEventListener('click', function (e) { if (e.target === dim || e.target.closest('[data-delete-close]')) closeDel(); });
  document.addEventListener('keydown', function (e) {
    if (dim.hidden) return;
    if (e.key === 'Escape') { closeDel(); return; }
    if (e.key !== 'Tab') return;
    var items = [].slice.call(dim.querySelectorAll('.modal__btn'));
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    else if (i === -1) { e.preventDefault(); items[0].focus(); }
  });

  syncAll();
})();
