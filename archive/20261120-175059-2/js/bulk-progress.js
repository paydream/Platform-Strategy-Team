/* 예스폼싸인 2차 고도화 — 대량 전송 발송 진행 (pages/bulk-progress.html · Figma 54550:40583)

   · 받는 사람 = window.bulk.rows() (참여자 설정에서 입력한 사람 · 없으면 예시 12명)
   · 0.7초마다 한 명씩: 발송 대기 → 발송중(파란 바탕 · 도는 아이콘 Figma 54579:46930) → 발송 성공 + 서명 대기중
     2번째 사람은 예시로 발송 실패 (빨간 바탕 · 계약 상태 -)
   · 숫자 카드: 받는 사람 · 발송 성공 · 발송 실패 · 발송 대기(아직 결과가 없는 사람 · 발송 중 N 포함) */
(function () {
  var B = window.bulk;
  var rows = B.rows();
  var STEP = 700;
  var FAIL = 1; // 예시로 실패하는 줄 (0부터)
  var RESULT = { ok: ['발송 성공', 'res--ok'], fail: ['발송 실패', 'res--fail'], sending: ['<i class="res__spin" aria-hidden="true"></i>발송중', 'res--ok res--sending'], wait: ['발송 대기', 'res--wait'], stop: ['발송 중단', 'res--wait'] };
  var state = rows.map(function () { return 'wait'; });

  var list = document.querySelector('[data-rows]');
  var title = document.querySelector('[data-bp-title]');
  var stopBtn = document.querySelector('[data-stop]');
  var note = document.querySelector('[data-sending-note]');
  document.querySelector('[data-bp-name]').textContent = B.title();

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  list.innerHTML = rows.map(function (r, i) {
    return '<li class="bd-row" data-i="' + i + '">' +
      '<span class="bd-no">' + (i + 1) + '</span>' +
      '<span class="bd-name" title="' + esc(r.name) + '">' + esc(r.name) + '</span>' +
      '<span class="bd-contact" title="' + esc(r.phone) + '">' + esc(r.phone) + '</span>' +
      '<span class="bd-title" title="' + esc(r.title) + '">' + esc(r.title) + '</span>' +
      '<span class="bd-result"></span><span class="bd-status">-</span><span class="bd-date">-</span></li>';
  }).join('');
  var lis = [].slice.call(list.children);

  function paint(i) {
    var s = state[i];
    var li = lis[i];
    li.className = 'bd-row' + (s === 'fail' ? ' bd-row--fail' : s === 'sending' ? ' bd-row--sending bd-row--wait' : s === 'wait' || s === 'stop' ? ' bd-row--wait' : ''); // 발송중 · 발송 전은 흐린 글자 (Figma 54550:40583)
    li.querySelector('.bd-result').innerHTML = '<span class="res ' + RESULT[s][1] + '">' + RESULT[s][0] + '</span>';
    li.querySelector('.bd-status').innerHTML = s === 'ok' ? '<span class="bdg bdg--gray">서명 대기중</span>' : '-';
  }
  function count(s) { return state.filter(function (x) { return x === s; }).length; }
  function stats() {
    var v = { all: rows.length, ok: count('ok'), fail: count('fail'), wait: count('wait') + count('sending'), sending: count('sending') };
    [].forEach.call(document.querySelectorAll('[data-stat]'), function (el) { el.textContent = v[el.getAttribute('data-stat')]; });
    note.hidden = !v.sending; // 보내는 사람이 없으면 "발송 중 N 포함" 숨김
  }
  function finish(text) {
    clearInterval(timer);
    timer = null;
    title.textContent = text;
    [].forEach.call(document.querySelectorAll('[data-bp-keep]'), function (el) { el.hidden = true; });
    stopBtn.disabled = true;
  }

  // 한 번에 한 걸음 — 보내던 줄은 결과로, 다음 줄은 발송중으로
  var cur = -1;
  function tick() {
    if (cur > -1) { state[cur] = cur === FAIL ? 'fail' : 'ok'; paint(cur); }
    cur++;
    if (cur >= rows.length) { stats(); finish('대량 전송을 보냈습니다'); return; }
    state[cur] = 'sending';
    paint(cur);
    stats();
  }

  stopBtn.addEventListener('click', function () {
    if (!timer) return;
    state.forEach(function (s, i) { if (s === 'wait' || s === 'sending') { state[i] = 'stop'; paint(i); } });
    stats();
    finish('대량 전송을 중단했습니다');
  });

  rows.forEach(function (r, i) { paint(i); });
  stats();
  var timer = setInterval(tick, STEP);
  tick();
})();
