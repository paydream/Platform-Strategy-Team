/* 예스폼싸인 2차 고도화 — 대량 전송 4단계 검토 (pages/bulk-review.html)
   Figma 54522:37263 · 받는 사람 목록 모달 54554:52028

   · 전송 요약 — 대량 전송 계약명은 위 문서 줄 값을 그대로 (고치면 바로 바뀜)
   · 서명 참여자 · 예상 차감 건수 = 받는 사람 수 (window.bulk.rows())
   · 동의 체크 → [대량 전송하기] 진해짐 → 확인 모달(54661:48156) → [확인] → 요청 완료 모달(54661:48167) → [확인] → bulk-progress.html
   · 받는 사람 목록 모달 — 이름 · 연락처(숫자만 넣어도 찾음)로 거름 */
(function () {
  var B = window.bulk;
  var rows = B.rows();
  var next = document.querySelector('[data-next]');
  var agree = document.querySelector('[data-agree]');
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  // 전송 요약
  var titleIn = $('[data-bulk-title]');
  var sumTitle = $('[data-sum="title"]');
  function syncTitle() { sumTitle.textContent = B.title(); }
  titleIn.addEventListener('input', syncTitle);
  syncTitle();
  $('[data-sum="rule"]').textContent = '받는 사람별(기본 ' + B.tpl + '_{이름})';
  $('[data-sum="days"]').textContent = (B.param('days') || '14') + '일';
  var label = B.param('label');
  var chip = $('[data-sum="label"]');
  if (label) { chip.textContent = label; chip.title = label; } else chip.title = chip.textContent;
  $('[data-sum="count"]').textContent = rows.length;
  $('[data-sum="charge"]').textContent = rows.length;

  // 동의 → [대량 전송하기]
  function syncNext() { next.disabled = !agree.checked; }
  agree.addEventListener('change', syncNext);
  syncNext();
  /* [대량 전송하기] → 대량 전송 확인 모달 (Figma 54661:48156)
       [닫기] · 바깥 · Esc → 닫힘 · [확인] → 대량 전송 요청 완료 모달 (54661:48167 · 전송 시작 직후)
     요청 완료 모달 [확인] (Esc 도 같음) → 발송 진행 화면 bulk-progress.html
     · 모달의 N명 · N건 = 받는 사람 수 · 주소에 confirm=1 · confirm=2 면 그 모달을 바로 띄움 (시안 확인용) */
  var sendDim = document.getElementById('send-modal');
  var sentDim = document.getElementById('sent-modal');
  [].forEach.call(document.querySelectorAll('[data-send-count]'), function (el) { el.textContent = rows.length; });
  function showDim(d) {
    d.hidden = false;
    document.body.style.overflow = 'hidden';
    d.querySelector('.modal').focus({ preventScroll: true }); // 모달 자체에 초점 (버튼에 테두리가 생기지 않게)
  }
  function hideDim(d) {
    d.hidden = true;
    document.body.style.overflow = '';
  }
  function goProgress() { location.href = B.url('bulk-progress.html'); }
  next.addEventListener('click', function () {
    if (next.disabled) return;
    showDim(sendDim);
  });
  sendDim.querySelector('[data-send-close]').addEventListener('click', function () { hideDim(sendDim); next.focus({ preventScroll: true }); });
  sendDim.querySelector('[data-send-ok]').addEventListener('click', function () { hideDim(sendDim); showDim(sentDim); });
  sendDim.addEventListener('click', function (e) { if (e.target === sendDim) { hideDim(sendDim); next.focus({ preventScroll: true }); } });
  sentDim.querySelector('[data-sent-ok]').addEventListener('click', goProgress);
  document.addEventListener('keydown', function (e) {
    var d = !sendDim.hidden ? sendDim : !sentDim.hidden ? sentDim : null;
    if (!d) return;
    if (e.key === 'Escape') {
      if (d === sendDim) { hideDim(sendDim); next.focus({ preventScroll: true }); } else goProgress(); // 이미 보내기 시작했으니 요청 완료 모달은 닫으면 발송 진행으로
      return;
    }
    if (e.key !== 'Tab') return;
    // Tab 이 모달 밖으로 나가지 않게
    var items = [].slice.call(d.querySelectorAll('.modal__btn'));
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    else if (i === -1) { e.preventDefault(); items[0].focus(); }
  });
  var cm = location.search.match(/[?&]confirm=([12])(&|$)/);
  if (cm) showDim(cm[1] === '2' ? sentDim : sendDim);

  // 받는 사람 목록 모달
  var dim = document.getElementById('rl-modal');
  var opener = $('[data-open-list]');
  var search = $('[data-list-search]');
  var list = $('[data-list-rows]');
  var empty = $('[data-list-empty]');
  $('[data-list-count]').textContent = rows.length;

  function chips(r) {
    var c = ['접근 암호'];
    if (r.auth === 'O') c.push('휴대폰 번호');
    return c.map(function (x) { return '<span class="rl-chip">' + x + '</span>'; }).join('');
  }
  function draw() {
    var k = search.value.trim().toLowerCase();
    var kd = k.replace(/\D/g, '');
    var hit = 0;
    list.innerHTML = rows.map(function (r, i) {
      var ok = !k || r.name.toLowerCase().indexOf(k) > -1 || r.phone.toLowerCase().indexOf(k) > -1 || (kd && r.phone.replace(/\D/g, '').indexOf(kd) > -1);
      if (!ok) return '';
      hit++;
      return '<li class="rl-row">' +
        '<span class="rl-no">' + (i + 1) + '</span>' +
        '<span class="rl-name" title="' + esc(r.name) + '">' + esc(r.name) + '</span>' +
        '<span class="rl-contact" title="' + esc(r.phone) + '">' + esc(r.phone) + '</span>' +
        '<span class="rl-title">' + esc(r.title) + '</span>' +
        '<span class="rl-auth">' + chips(r) + '</span></li>';
    }).join('');
    empty.hidden = hit > 0;
  }
  search.addEventListener('input', draw);

  function open() {
    search.value = '';
    draw();
    dim.hidden = false;
    document.body.style.overflow = 'hidden';
    dim.querySelector('.rl-table').scrollTop = 0;
    dim.querySelector('.modal').focus({ preventScroll: true }); // 모달 자체에 초점 — 검색 칸은 눌러야 파란 테두리
  }
  function close() {
    dim.hidden = true;
    document.body.style.overflow = '';
    opener.focus({ preventScroll: true });
  }
  opener.addEventListener('click', open);
  [].forEach.call(dim.querySelectorAll('[data-list-close]'), function (b) { b.addEventListener('click', close); });
  dim.addEventListener('click', function (e) { if (e.target === dim) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dim.hidden) close(); });

  if (/[?&]modal=1(&|$)/.test(location.search)) open();
})();
