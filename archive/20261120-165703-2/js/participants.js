/* 예스폼싸인 2차 고도화 — 대량 전송 2단계 참여자 설정 (2026-11-10 · 2026-11-19 새 시안)
   Figma 02_03_참여자 설정 (54597:41253 · 예전 54277:30727)
   · 휴대폰 번호 인증은 못 누르게 막아 둠(HTML disabled) → 넘기는 추가 인증은 접근 암호만
   · 템플릿 관리 [수정하기]로 오면(?edit=1&d=…) 그 템플릿의 역할 · 접근 암호 인증이 채워진 채로 시작 · 다음 단계에 edit=1 과 템플릿명을 넘김

   [다음]
   · 역할이 비어 있으면 빨간 테두리와 "역할을 입력해주세요."
   · 적었으면 3단계 서명 조건 설정(signing.html)으로 이동 — 입력한 역할을 주소(?d=…)로 넘김
     (이름 · 연락처는 대량 전송 때 넣으므로 비워서 넘김) */
(function () {
  var HINT = '역할 지정 설명을 적는 힌트 텍스트';
  var input = document.getElementById('pt-role');
  var help = document.getElementById('pt-role-help');
  var next = document.querySelector('[data-next]');
  if (!input || !next) return;
  var field = input.closest('.field');

  function setError(on) {
    field.classList.toggle('is-error', on);
    help.textContent = on ? '역할을 입력해주세요.' : HINT;
    input.setAttribute('aria-invalid', on ? 'true' : 'false');
  }
  input.addEventListener('input', function () {
    if (field.classList.contains('is-error') && input.value.trim()) setError(false);
  });

  // 템플릿 관리 [수정하기]로 왔으면(?edit=1&d=…) 그 템플릿의 첫 역할 · 접근 암호 인증으로 시작
  var edit = null;
  if (/[?&]edit=1(&|$)/.test(location.search)) {
    try { edit = JSON.parse(decodeURIComponent((location.search.match(/[?&]d=([^&]*)/) || [])[1] || '')); } catch (e) { edit = null; }
  }
  if (edit && edit.roles && edit.roles[0]) {
    input.value = edit.roles[0].role || '';
    var pw = document.querySelector('.pt-auth > .chk input[type="checkbox"]');
    if (pw) pw.checked = (edit.roles[0].auth || []).some(function (a) { return a.indexOf('접근') > -1; });
  }
  next.addEventListener('click', function () {
    var role = input.value.trim();
    if (!role) { setError(true); input.focus(); return; }
    // 추가 인증 체크 · 문서 이름도 넘김 (4단계 검토에 보임)
    var checks = document.querySelectorAll('.pt-auth input[type="checkbox"]');
    var auth = [checks[0] && checks[0].checked ? '접근 암호' : '', checks[1] && checks[1].checked ? '휴대폰 번호' : ''].filter(Boolean);
    var dm = location.search.match(/[?&]doc=([^&]*)/);
    var d = { type: 'bulk', doc: dm ? decodeURIComponent(dm[1]) : '', roles: [{ role: role, name: '', contact: '', self: false, auth: auth }] };
    if (edit) { d.name = edit.name; d.pin = !!edit.pin; } // 수정 모드 — 템플릿명 · 상단 고정도 검토까지 넘김
    location.href = 'signing.html?flow=tpl' + (edit ? '&edit=1' : '') + '&d=' + encodeURIComponent(JSON.stringify(d));
  });
})();
