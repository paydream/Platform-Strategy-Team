/* 예스폼싸인 2차 고도화 — 대량 전송 화면 공통
   (bulk-send · bulk-recipients · bulk-settings · bulk-review · bulk-progress)

   주소 값
   · 위쪽 단계는 4단계 (입력 방식 설정 · 참여자 설정 · 전송 설정 · 검토 · Figma 54579:43076)
     (화면 02 간편 · 주소 ux=2 는 2026-11-19 에 삭제)
   · tpl=…     템플릿 이름 (없으면 아르바이트 근로계약서)
   · title=…   대량 전송 계약명 (없으면 "템플릿 이름_오늘 날짜")
   · days=…    서명 유효기간 (전송 설정에서 정함 · 없으면 14)
   · label=…   라벨 (전송 설정에서 정함)
   · src=excel 엑셀로 불러온 흐름 (없으면 직접 입력 흐름) — 시안 바로가기 바의 일반 · 엑셀 표시에 씀
   위 값은 다음 화면으로 넘어갈 때 그대로 이어 붙임 (window.bulk.url)
   · sample=1  시안 바로가기 바에서 3 · 4단계를 바로 열 때 — 예시 받는 사람을 새로 담아 둠
               (일반 = 직접 입력 예시 5명 · 엑셀 = 엑셀 예시 12명 · 다음 화면에는 넘기지 않음)

   받는 사람 — 참여자 설정 [다음]에서 sessionStorage 'bulkRows' 에 담아 둠 (window.bulk.saveRows)
   · 전송 설정 · 검토 · 발송 진행 화면은 window.bulk.rows() 로 꺼내 씀
   · 담긴 값이 없으면(화면을 바로 열었을 때) 아래 SAMPLE 12명으로 보여 줌 */
(function () {
  var q = location.search;
  function param(k) {
    var m = q.match(new RegExp('[?&]' + k + '=([^&]*)'));
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null;
  }
  function today() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '_' + p(d.getMonth() + 1) + '_' + p(d.getDate());
  }

  var tpl = param('tpl') || '아르바이트 근로계약서';
  var title = param('title') || tpl + '_' + today();
  var page = (location.pathname.split(/[\\/]/).pop() || '').toLowerCase();

  // 단계 — 입력 방식 설정 1 · 받는 사람 표 2 · 전송 설정 3 · 검토 4
  var STEPS = ['입력 방식 설정', '참여자 설정', '전송 설정', '검토'];
  var ON = { 'bulk-recipients.html': 1, 'bulk-settings.html': 2, 'bulk-review.html': 3 };
  var on = ON[page] || 0;
  var ol = document.querySelector('[data-steps]');
  if (ol) {
    ol.innerHTML = STEPS.map(function (s, i) {
      return '<li class="steps__item' + (i === on ? ' is-on" aria-current="step' : '') + '"><span class="steps__num">' + (i + 1) + '</span>' + s + '</li>';
    }).join('');
  }

  // 문서 줄 — 템플릿 이름 · 대량 전송 계약명
  var nameEl = document.querySelector('[data-tpl-name]');
  if (nameEl) nameEl.textContent = tpl;
  var titleEl = document.querySelector('[data-bulk-title]');
  if (titleEl) titleEl.value = title;
  function curTitle() { return titleEl ? titleEl.value.trim() || title : title; }

  // 다음 화면 주소 — tpl · title (+ days · label 이 있으면) 을 이어 붙임
  function url(file, extra) {
    var s = [];
    s.push('tpl=' + encodeURIComponent(tpl));
    s.push('title=' + encodeURIComponent(curTitle()));
    ['days', 'label', 'src'].forEach(function (k) {
      var v = param(k);
      if (v !== null && !(extra && new RegExp('(^|&)' + k + '=').test(extra))) s.push(k + '=' + encodeURIComponent(v));
    });
    if (extra) s.push(extra);
    return file + '?' + s.join('&');
  }

  // 받는 사람 (계약명 · 이름 · 연락처 · 전달 메시지 · 접근 암호 · 휴대폰 인증 O/X)
  var KEY = 'bulkRows';
  function sample(name, phone, pw, auth) { return { title: tpl + '_' + name, name: name, phone: phone, msg: '', pw: pw, auth: auth }; }
  var SAMPLE = [
    sample('김민준', '010-2345-6789', 'minjun12', 'O'),
    sample('이서연', '010-3456-7890', 'seoyeon1', 'X'),
    sample('박지훈', '010-4567-8901', 'jihoon12', 'O'),
    sample('최수아', '010-5678-9012', 'sua2026!', 'O'),
    sample('정도윤', '010-6789-0123', 'doyoon99', 'X'),
    sample('강하은', '010-7890-1234', 'haeun777', 'O'),
    sample('조은우', '010-8901-2345', 'eunwoo01', 'X'),
    sample('윤지아', '010-9012-3456', 'jia0412', 'O'),
    sample('장시우', '010-1122-3344', 'siwoo55', 'X'),
    sample('서하준', '010-2233-4455', 'abcd1234', 'O'),
    sample('한예린', '010-3344-5566', 'yerin88', 'O'),
    sample('오지호', '010-4455-6677', 'qwer5678', 'X')
  ];
  function rows() {
    try {
      var r = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (r && r.length) return r;
    } catch (e) { /* 저장소를 못 쓰면 예시로 */ }
    return SAMPLE.slice();
  }
  function saveRows(r) {
    try { sessionStorage.setItem(KEY, JSON.stringify(r)); } catch (e) { /* 저장소를 못 쓰면 다음 화면에서 예시로 보임 */ }
  }
  // 시안 바로가기 바로 3 · 4단계를 바로 열면 — 일반(직접 입력) 5명 · 엑셀 12명 예시를 새로 담음
  if (param('sample') === '1') saveRows(param('src') === 'excel' ? SAMPLE.slice() : SAMPLE.slice(0, 5));

  window.bulk = { param: param, tpl: tpl, url: url, title: curTitle, rows: rows, saveRows: saveRows };
})();
