/* 예스폼싸인 2차 고도화 — 템플릿 만들기 4단계 검토 (2026-11-10)
   Figma 검토 (54320:48060)

   앞 단계에서 넘어온 내용으로 채움 — 주소 ?d=… { type, order, doc, roles: [{ role, name, contact, self, auth }] }
   · 템플릿명: 문서 이름(확장자 뺀 것)이 처음 값 · 글자 수 /50
   · 문서 · 서명 순서(순서대로 / 순서없이) · 템플릿 유형(일반 계약 / 대량 전송)
   · 역할 (n): 역할마다 카드 — 순번 · {역할명} · 서명 요청자 본인 또는 이름 · 연락처 · 추가 인증(접근 암호 · 휴대폰 번호 / 추가 인증 없음)
     카드 위 띠 · 순번 색은 역할 순서대로 (서명 조건 설정과 같은 색 순서 53693:29199)
   · [자주 사용하는 템플릿에 추가] 누르면 켜고 끔 · 고정 첨부 문서 X → 빼기
   · [계약 작성 완료] → 템플릿 관리(index.html)
   주소에 내용이 없으면 Figma 예시로 보임 (아래 SAMPLE) */
(function () {
  var COLORS = ['#EF565D', '#EEC10F', '#F07F23', '#189648', '#1CAEC0', '#4675FA', '#39539C', '#8558E4', '#C844AC', '#995A17'];
  var SAMPLE = {
    type: 'normal', order: 'order', doc: '2차적저작물 이용허락 계약서.pdf',
    roles: [
      { role: '홍길동', self: true, auth: [] },
      { role: '홍길동', self: true, auth: ['접근 암호', '휴대폰 번호'] },
      { role: '홍길동', self: true, auth: [] }
    ]
  };
  var data = null;
  try {
    var m = location.search.match(/[?&]d=([^&]+)/);
    if (m) data = JSON.parse(decodeURIComponent(m[1]));
  } catch (e) { data = null; }
  if (!data || !data.roles || !data.roles.length) data = SAMPLE;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tint(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  // 문서 · 템플릿명
  var doc = data.doc || SAMPLE.doc;
  document.querySelector('[data-doc]').textContent = doc;
  var name = document.querySelector('[data-name]');
  var count = document.querySelector('[data-count]');
  name.value = doc.replace(/\.[a-z0-9]{2,5}$/i, '').slice(0, 50);
  function sync() { count.textContent = String(name.value.length); }
  name.addEventListener('input', sync);
  sync();

  // 서명 순서 · 템플릿 유형
  document.querySelector('[data-order]').textContent = data.order === 'any' ? '순서없이 서명하기' : '순서대로 서명하기';
  var type = document.querySelector('[data-type]');
  if (data.type === 'bulk') { type.className = 'type type--bulk'; type.textContent = '대량 전송'; }

  // 역할 카드
  var roles = data.roles;
  document.querySelector('[data-role-count]').textContent = '(' + roles.length + ')';
  document.querySelector('[data-roles]').innerHTML = roles.map(function (r, i) {
    var c = COLORS[i % COLORS.length];
    var title = String(r.role || '').trim() || (i + 1) + '번째 참여자';
    var sub = r.self ? '서명 요청자 본인' : [r.name, r.contact].filter(Boolean).join(' · ');
    var auth = r.auth && r.auth.length ?
      '<img src="../images/ic-shield-on-16.svg" width="16" height="16" alt="">' + r.auth.map(function (a) { return '<span class="auth-tag">' + esc(a) + '</span>'; }).join('') :
      '<img src="../images/ic-shield-off-16.svg" width="16" height="16" alt=""><span class="rv-role__none">추가 인증 없음</span>';
    return '<li class="rv-role" style="--c:' + c + '">' +
      '<div class="rv-role__body">' +
        '<div class="rv-role__head">' +
          '<span class="rv-role__num" style="background:' + tint(c, 0.1) + ';color:' + c + '">' + (i + 1) + '</span>' +
          '<span class="rv-role__text"><span class="rv-role__name">' + esc(title) + '</span>' +
          '<span class="rv-role__sub">' + (sub ? esc(sub) : '&nbsp;') + '</span></span>' +
        '</div>' +
        '<i class="rv-role__line"></i>' +
        '<div class="rv-role__auth">' + auth + '</div>' +
      '</div></li>';
  }).join('');

  // 자주 사용하는 템플릿에 추가 — 켜고 끔
  var fav = document.querySelector('[data-fav]');
  fav.addEventListener('click', function () {
    var on = fav.getAttribute('aria-pressed') !== 'true';
    fav.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  // 고정 첨부 문서 빼기
  var del = document.querySelector('[data-attach-del]');
  if (del) del.addEventListener('click', function () { del.closest('.rv-file').remove(); });

  // 계약 작성 완료 → 템플릿 관리
  document.querySelector('[data-done]').addEventListener('click', function () { location.href = '../index.html'; });
})();
