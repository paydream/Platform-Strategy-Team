/* 예스폼싸인 2차 고도화 — 대량 전송 1단계 입력 방식 설정 (pages/bulk-send.html)

   화면 01 (기본)
   · 카드는 고르기만 함 — 고른 카드에 파란 테두리 · 파란 이름 · 파란 체크
   · [다음] → 직접 입력: bulk-recipients.html · 엑셀 업로드: 같은 화면에서 "엑셀 파일을 업로드 해주세요"(?view=excel)
   · 엑셀 업로드 화면 — 파일을 끌어 놓거나 [내 PC 업로드] → 바로 bulk-recipients.html?src=excel
     [입력 방식 변경] → 카드 고르는 화면으로 돌아감 · 아래는 [나가기] + 흐린 [다음] (Figma 54554:52139)
   화면 02 (?ux=2 · 간편)
   · 엑셀 업로드를 고르면 카드 아래에 파일 선택 칸이 열림 · 파일을 고르기 전에는 [다음]이 흐림
   주소에 method=excel 이면 엑셀 업로드가 골라진 채로 열림 (참여자 설정의 [엑셀 다시 올리기]) */
(function () {
  var B = window.bulk;
  var radios = [].slice.call(document.querySelectorAll('.bk-opt__radio'));
  var opts = [].slice.call(document.querySelectorAll('.bk-opt'));
  var inline = document.querySelector('[data-inline-file]');
  var fileInput = document.querySelector('[data-file-input]');
  var fileName = document.querySelector('[data-file-name]');
  var next = document.querySelector('[data-next]');
  var views = {
    pick: document.querySelector('[data-view="pick"]'),
    excel: document.querySelector('[data-view="excel"]')
  };
  var picked = ''; // 화면 02 에서 고른 파일 이름

  function method() {
    var r = radios.filter(function (x) { return x.checked; })[0];
    return r ? r.value : 'direct';
  }
  function isExcel(name) { return /\.(xlsx|xls)$/i.test(name || ''); }

  // 카드 · 간편 파일 칸 · [다음] 상태
  function sync() {
    var m = method();
    opts.forEach(function (o) { o.classList.toggle('is-on', o.getAttribute('data-opt') === m); });
    if (B.simple) {
      inline.hidden = m !== 'excel';
      next.disabled = m === 'excel' && !picked;
    }
  }
  radios.forEach(function (r) { r.addEventListener('change', sync); });

  var m0 = B.param('method');
  if (m0 === 'excel' || m0 === 'direct') radios.forEach(function (r) { r.checked = r.value === m0; });

  // 화면 01 — 카드 고르기 ↔ 엑셀 업로드 화면
  function show(v, push) {
    if (B.simple) v = 'pick';
    views.pick.hidden = v !== 'pick';
    views.excel.hidden = v !== 'excel';
    if (!B.simple) next.disabled = v === 'excel'; // 엑셀 업로드 화면 — [다음]은 흐림 (파일을 올리면 바로 다음 화면)
    if (push) history.pushState({ view: v }, '', v === 'excel' ? B.url('bulk-send.html', 'view=excel') : B.url('bulk-send.html', 'method=' + method()));
    window.scrollTo(0, 0);
  }
  window.addEventListener('popstate', function (e) {
    var v = e.state && e.state.view || (/[?&]view=excel(&|$)/.test(location.search) ? 'excel' : 'pick');
    show(v, false);
  });

  function goTable(name) {
    location.href = B.url('bulk-recipients.html', 'src=excel&file=' + encodeURIComponent(name));
  }

  next.addEventListener('click', function () {
    var m = method();
    if (m === 'direct') { location.href = B.url('bulk-recipients.html'); return; }
    if (B.simple) { if (picked) goTable(picked); return; }
    show('excel', true);
  });

  // 화면 02 — 카드 안 파일 선택
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      if (!isExcel(f.name)) { fileInput.value = ''; return; }
      picked = f.name;
      fileName.textContent = f.name;
      fileName.classList.add('is-on');
      sync();
    });
  }

  // 화면 01 — 엑셀 업로드 화면 (끌어 놓기 · 내 PC 업로드)
  var drop = document.querySelector('[data-drop]');
  var pc = document.querySelector('[data-pc-input]');
  var err = document.querySelector('[data-drop-err]');
  function take(f) {
    if (!f) return;
    if (!isExcel(f.name)) { err.hidden = false; drop.classList.add('is-error'); return; }
    err.hidden = true;
    drop.classList.remove('is-error');
    goTable(f.name);
  }
  if (pc) pc.addEventListener('change', function () { take(pc.files && pc.files[0]); pc.value = ''; });
  if (drop) {
    var depth = 0;
    drop.addEventListener('dragenter', function (e) { e.preventDefault(); depth++; drop.classList.add('is-drag'); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); });
    drop.addEventListener('dragleave', function () { if (--depth <= 0) { depth = 0; drop.classList.remove('is-drag'); } });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      depth = 0;
      drop.classList.remove('is-drag');
      take(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
    });
  }
  var change = document.querySelector('[data-change-method]');
  if (change) change.addEventListener('click', function () { show('pick', true); });

  // 처음 열 때 — ?view=excel 이면 엑셀 업로드 화면 (카드는 엑셀 업로드가 골라진 상태)
  var startExcel = !B.simple && /[?&]view=excel(&|$)/.test(location.search);
  if (startExcel) radios.forEach(function (r) { r.checked = r.value === 'excel'; });
  sync();
  show(startExcel ? 'excel' : 'pick', false);
  history.replaceState({ view: startExcel ? 'excel' : 'pick' }, '');
})();
