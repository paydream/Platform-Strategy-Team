/* 예스폼싸인 2차 고도화 — 대량 전송 2단계 참여자 설정 (2026-11-10)
   Figma 02_03_참여자 설정 (54277:30727)

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
  next.addEventListener('click', function () {
    var role = input.value.trim();
    if (!role) { setError(true); input.focus(); return; }
    // 추가 인증 체크 · 문서 이름도 넘김 (4단계 검토에 보임)
    var checks = document.querySelectorAll('.pt-auth input[type="checkbox"]');
    var auth = [checks[0] && checks[0].checked ? '접근 암호' : '', checks[1] && checks[1].checked ? '휴대폰 번호' : ''].filter(Boolean);
    var dm = location.search.match(/[?&]doc=([^&]*)/);
    var d = { type: 'bulk', doc: dm ? decodeURIComponent(dm[1]) : '', roles: [{ role: role, name: '', contact: '', self: false, auth: auth }] };
    location.href = 'signing.html?flow=tpl&d=' + encodeURIComponent(JSON.stringify(d));
  });
})();
