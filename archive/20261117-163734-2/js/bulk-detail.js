/* 예스폼싸인 2차 고도화 — 대량 전송 상세 (pages/bulk-detail.html · Figma 54552:48674)

   · 받는 사람 표는 아래 PEOPLE 로 그림 — 줄 하나 = 받는 사람 한 명
     result(발송 결과): ok 발송 성공 · fail 발송 실패 · sending 발송중 · wait 발송 대기
     status(계약 상태 · 발송 성공일 때만): wait 서명 대기중 · ing 진행중 · done 완료됨 · cancel 취소됨
   · 숫자 카드 — 받는 사람(전체 줄) · 발송 성공 · 발송 실패 · 서명 완료(완료됨) / 받는 사람 · 차감 건수(= 발송 성공 · 실패 N건 제외)
   · 발송 실패가 0건이면 발송 실패 카드의 [다시보내기]를 숨김 · 주소에 fail=0 이면 실패 없는 예시(실패 줄을 성공으로 · 들어올 때도 모두 성공)
   · [전체] · [발송 실패] — 표 거르기 · 검색 — 이름 · 연락처 · 계약명 (띄어쓰기 무시)
   · 화면에 들어오면 지금 발송중인 사람부터 4명만 차례로 결과가 나옴 (아래 PLAN · 1.2초 간격)
     발송 대기(흐린 줄 54579:43788) → 발송중(파란 바탕 · 도는 아이콘 54579:46930) → 발송 성공(54579:43782) 또는 발송 실패(빨간 바탕 54579:43785)
     발송 성공이 되면 계약 상태는 서명 대기중 · 숫자 카드와 [발송 실패] 숫자도 같이 바뀜 · 나머지는 발송 대기로 남음 */
(function () {
  var TPL = '비밀유지 서약서';
  var PEOPLE = [
    { name: '홍길동', contact: '010-1234-1234', result: 'ok', status: 'wait' },
    { name: '김가나다라마', contact: '123456465@gmail.com', result: 'fail' },
    { name: '이서연', contact: '010-3456-7890', result: 'ok', status: 'done', date: '2026.09.05' },
    { name: '박지훈', contact: '010-4567-8901', result: 'ok', status: 'done', date: '2026.09.04' },
    { name: '최수아', contact: '010-5678-9012', result: 'ok', status: 'ing' },
    { name: '정도윤', contact: 'doyoon.jung@naver.com', result: 'fail' },
    { name: '강하은', contact: '010-7890-1234', result: 'ok', status: 'wait' },
    { name: '윤지아', contact: '010-9012-3456', result: 'ok', status: 'done', date: '2026.09.06' },
    { name: '장시우', contact: '010-1122-3344', result: 'ok', status: 'cancel' },
    { name: '한예린', contact: '010-3344-5566', result: 'ok', status: 'done', date: '2026.09.08' },
    { name: '오지호', contact: '010-2233-4455', result: 'ok', status: 'ing' },
    { name: '서하준', contact: '010-6677-8899', result: 'ok', status: 'wait' },
    { name: '조은우', contact: '010-8901-2345', result: 'sending' },
    { name: '정다은', contact: '010-1357-2468', result: 'wait' },
    { name: '문서윤', contact: '010-2468-1357', result: 'wait' },
    { name: '임도현', contact: '010-9753-8642', result: 'wait' },
    { name: '배수진', contact: '010-8642-9753', result: 'wait' },
    { name: '송민재', contact: '010-1212-3434', result: 'wait' },
    { name: '신유나', contact: '010-5656-7878', result: 'wait' },
    { name: '홍길동', contact: '123456464446@yesform.com', result: 'wait' }
  ];
  var RESULT = { ok: ['발송 성공', 'res--ok'], fail: ['발송 실패', 'res--fail'], sending: ['<i class="res__spin" aria-hidden="true"></i>발송중', 'res--ok res--sending'], wait: ['발송 대기', 'res--wait'] };
  var PLAN = ['ok', 'fail', 'ok', 'ok']; // 들어올 때 차례로 나오는 결과 (지금 발송중인 사람부터)
  if (/[?&]fail=0(&|$)/.test(location.search)) { // 실패 없는 예시
    PEOPLE.forEach(function (p) { if (p.result === 'fail') { p.result = 'ok'; p.status = 'wait'; } });
    PLAN = ['ok', 'ok', 'ok', 'ok'];
  }
  var STEP = 1200;
  var STATUS = { wait: ['서명 대기중', 'bdg--gray'], ing: ['진행중', 'bdg--blue'], done: ['완료됨', 'bdg--green'], cancel: ['취소됨', 'bdg--gray'] };

  var list = document.querySelector('[data-rows]');
  var empty = document.querySelector('[data-empty]');
  var search = document.querySelector('[data-search]');
  var tabs = [].slice.call(document.querySelectorAll('[data-tab]'));
  var tab = 'all';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function norm(s) { return (s || '').replace(/\s+/g, '').toLowerCase(); }

  // 숫자 카드 · 거르기 숫자
  function n(f) { return PEOPLE.filter(f).length; }
  var retry = document.querySelector('[data-retry]');
  function stats() {
    var ok = n(function (p) { return p.result === 'ok'; });
    var v = {
      all: PEOPLE.length, ok: ok, fail: n(function (p) { return p.result === 'fail'; }),
      done: n(function (p) { return p.result === 'ok' && p.status === 'done'; }), charged: ok // 발송에 성공한 건만 차감
    };
    retry.hidden = v.fail === 0; // 발송 실패가 없으면 [다시보내기] 숨김
    [].forEach.call(document.querySelectorAll('[data-stat]'), function (el) { el.textContent = v[el.getAttribute('data-stat')]; });
    document.querySelector('[data-count-all]').textContent = v.all;
    document.querySelector('[data-count-fail]').textContent = v.fail;
  }

  function row(p, i) {
    var r = RESULT[p.result];
    var s = p.result === 'ok' && p.status ? '<span class="bdg ' + STATUS[p.status][1] + '">' + STATUS[p.status][0] + '</span>' : '-';
    var title = TPL + '_' + p.name;
    return '<li class="bd-row bd-row--' + p.result + '">' +
      '<span class="bd-no">' + (i + 1) + '</span>' +
      '<span class="bd-name" title="' + esc(p.name) + '">' + esc(p.name) + '</span>' +
      '<span class="bd-contact" title="' + esc(p.contact) + '">' + esc(p.contact) + '</span>' +
      '<span class="bd-title" title="' + esc(title) + '">' + esc(title) + '</span>' +
      '<span class="bd-result"><span class="res ' + r[1] + '">' + r[0] + '</span></span>' +
      '<span class="bd-status">' + s + '</span>' +
      '<span class="bd-date">' + (p.status === 'done' && p.date ? p.date : '-') + '</span>' +
      '</li>';
  }
  function render() {
    var q = norm(search.value);
    var html = '';
    var shown = 0;
    PEOPLE.forEach(function (p, i) {
      if (tab === 'fail' && p.result !== 'fail') return;
      if (q && norm(p.name + p.contact + TPL + '_' + p.name).indexOf(q) < 0) return;
      html += row(p, i);
      shown++;
    });
    list.innerHTML = html;
    empty.hidden = shown > 0;
  }

  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      tab = b.getAttribute('data-tab');
      tabs.forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      render();
    });
  });
  search.addEventListener('input', render);
  search.addEventListener('keydown', function (e) { if (e.key === 'Escape' && search.value) { search.value = ''; render(); } });

  stats();
  render();

  // 들어올 때 — 발송중인 사람부터 PLAN 수만큼 차례로 결과가 나옴
  var cur = -1;
  PEOPLE.forEach(function (p, i) { if (cur < 0 && p.result === 'sending') cur = i; });
  var step = 0;
  if (cur > -1) {
    var timer = setInterval(function () {
      var p = PEOPLE[cur];
      p.result = PLAN[step];
      if (p.result === 'ok') p.status = 'wait';
      step++;
      cur++;
      if (step < PLAN.length && PEOPLE[cur] && PEOPLE[cur].result === 'wait') PEOPLE[cur].result = 'sending';
      else clearInterval(timer);
      stats();
      render();
    }, STEP);
  }
})();
