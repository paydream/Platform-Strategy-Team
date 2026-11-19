/* 예스폼싸인 2차 고도화 — 템플릿 만들기 4단계 검토 (2026-11-10 · 2026-11-17 새 시안)
   Figma 템플릿 생성_검토 1 (54522:37956)

   앞 단계에서 넘어온 내용으로 채움 — 주소 ?d=… { type, order, doc, roles: [{ role, name, contact, self, auth }] }
   · 템플릿명: 문서 이름(확장자 뺀 것)이 처음 값 · 최대 50자 · [수정하기] → 입력 칸으로 가서 글자를 모두 고름
     비우면 [저장하기]가 흐림
   · 자주 사용하는 템플릿: 처음엔 꺼짐(회색 핀) · 누르면 켜짐(파란 핀 + "자주 사용하는 템플릿에 추가되었습니다.") · 다시 누르면 꺼짐
   · 문서 [미리 보기] → 계약 화면 미리보기 모달 (Figma 54492:36403)
     역할 고르기(앞 단계 역할 · 점 색은 역할 색) · 문서 확대/축소 50~200% (10%씩) · 예시 값 입력
     공통 항목(회사명 · 계약 시작일)은 비어 있으면 빨간 테두리 + "필수 입력 항목입니다." · 현재 선택한 역할은 그 역할 이름으로 채움
     [확인] · 바깥 · Esc 로 닫힘
   · 문서 · 서명 순서(순서대로 / 순서없이) · 템플릿 유형(일반 계약 / 대량 전송)
   · 역할 (n): 역할마다 카드 — 순번 · {역할명} · 서명 요청자 본인 또는 이름 · 연락처 · 추가 인증(접근 암호 · 휴대폰 번호 / 추가 인증 없음)
     카드 위 띠 · 순번 색은 역할 순서대로 (서명 조건 설정과 같은 색 순서 53693:29199) · 순서대로 서명이면 카드 사이에 ›
   · 고정 첨부 문서: X → 빼기 · [파일 추가 (n/5)] → 파일 고르기 (최대 5개)
   · [저장하기] → 템플릿 관리(index.html)
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
  var done = document.querySelector('[data-done]');
  name.value = doc.replace(/\.[a-z0-9]{2,5}$/i, '').slice(0, 50);
  // 템플릿 관리 [수정하기]로 왔으면(edit=1) 템플릿명은 원래 이름 · "자주 사용하는 템플릿"은 목록의 상단 고정 그대로
  var EDIT = /[?&]edit=1(&|$)/.test(location.search);
  if (EDIT && data.name) name.value = String(data.name).slice(0, 50);
  if (EDIT && data.pin) document.querySelector('[data-fav]').setAttribute('aria-pressed', 'true');
  function sync() { done.disabled = !name.value.trim(); }
  name.addEventListener('input', sync);
  sync();
  // [수정하기] → 입력 칸으로 가서 글자를 모두 고름
  document.querySelector('[data-edit]').addEventListener('click', function () { name.focus(); name.select(); });

  // 서명 순서 · 템플릿 유형
  document.querySelector('[data-order]').textContent = data.order === 'any' ? '순서없이 서명하기' : '순서대로 서명하기';
  var type = document.querySelector('[data-type]');
  if (data.type === 'bulk') { type.className = 'type type--bulk'; type.textContent = '대량 전송'; }

  // 역할 카드
  var roles = data.roles;
  var arrow = data.order === 'any' ? '' : '<li class="rv-arrow" aria-hidden="true"><img src="../images/ic-arrow-short-8.svg" width="6" height="8" alt=""></li>'; // 순서대로 서명 — 카드 사이 ›
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
  }).join(arrow);

  // 자주 사용하는 템플릿 — 켜고 끔 (처음엔 꺼짐)
  var fav = document.querySelector('[data-fav]');
  fav.addEventListener('click', function () {
    var on = fav.getAttribute('aria-pressed') !== 'true';
    fav.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  // 고정 첨부 문서 — X 로 빼기 · [파일 추가 (n/5)]로 더하기
  var MAX_FILES = 5;
  var box = document.querySelector('[data-attach]');
  var add = document.querySelector('[data-attach-add]');
  var addInput = document.querySelector('[data-attach-input]');
  var addCount = document.querySelector('[data-attach-count]');
  function files() { return box.querySelectorAll('.rv-file').length; }
  function syncFiles() {
    var n = files();
    addCount.textContent = n;
    addInput.disabled = n >= MAX_FILES;
    add.classList.toggle('is-off', n >= MAX_FILES);
  }
  box.addEventListener('click', function (e) {
    var del = e.target.closest('[data-attach-del]');
    if (!del) return;
    del.closest('.rv-file').remove();
    syncFiles();
  });
  addInput.addEventListener('change', function () {
    var f = addInput.files && addInput.files[0];
    addInput.value = '';
    if (!f || files() >= MAX_FILES) return;
    var chip = document.createElement('span');
    chip.className = 'rv-file';
    chip.innerHTML = '<span class="rv-file__name"></span><button class="rv-file__del" type="button" data-attach-del><img src="../images/ic-close-14.svg" width="14" height="14" alt=""></button>';
    chip.querySelector('.rv-file__name').textContent = f.name;
    chip.querySelector('button').setAttribute('aria-label', f.name + ' 빼기');
    box.insertBefore(chip, add);
    syncFiles();
  });
  syncFiles();

  // 저장하기 → 템플릿 관리
  done.addEventListener('click', function () { if (!done.disabled) location.href = '../index.html'; });

  // 계약 화면 미리보기 모달
  var pv = document.getElementById('pv-modal');
  var pvOpen = document.querySelector('[data-pv-open]');
  var pvRole = pv.querySelector('[data-pv-role]');
  var pvPage = pv.querySelector('[data-pv-page]');
  var pvZoomVal = pv.querySelector('[data-pv-zoom-val]');
  var zoomBtns = [].slice.call(pv.querySelectorAll('[data-pv-zoom]'));
  var zoom = 100;
  function roleName(r, i) { return String(r.role || '').trim() || (i + 1) + '번째 참여자'; }
  function roleSub(r) { return r.self ? '서명 요청자 본인' : (r.preset || r.name) ? '미리 입력' : '보낼 때 입력'; }
  pvRole.innerHTML = roles.map(function (r, i) {
    return '<option value="' + i + '">' + esc(roleName(r, i) + ' · ' + roleSub(r)) + '</option>';
  }).join('');
  function syncRole() {
    var i = +pvRole.value || 0;
    var r = roles[i];
    pv.querySelector('[data-pv-dot]').style.background = COLORS[i % COLORS.length];
    pv.querySelector('[data-pv-name]').textContent = roleName(r, i);
    pv.querySelector('[data-pv-sub]').textContent = roleSub(r);
    // 현재 선택한 역할 — 이름 · 연락처가 있는 역할은 그 값으로 미리 채움 (Figma 예시 "자동입력 홍길동")
    var who = r.name || (r.self ? '홍길동' : '');
    pv.querySelector('[data-pv-rname]').value = who ? '자동입력 ' + who : '';
    pv.querySelector('[data-pv-raddr]').value = who ? '자동입력 ' + who : '';
  }
  pvRole.addEventListener('change', syncRole);
  function setZoom(z) {
    zoom = Math.max(50, Math.min(200, z));
    pvPage.style.width = Math.round(480 * zoom / 100) + 'px';
    pvZoomVal.textContent = zoom + '%';
    zoomBtns[0].disabled = zoom <= 50;
    zoomBtns[1].disabled = zoom >= 200;
  }
  zoomBtns.forEach(function (b) { b.addEventListener('click', function () { setZoom(zoom + 10 * +b.getAttribute('data-pv-zoom')); }); });
  // 공통 항목 — 비어 있으면 빨간 테두리 + 안내
  var reqs = [].slice.call(pv.querySelectorAll('[data-pv-req]'));
  function checkReq(el) { el.closest('.pv-field').classList.toggle('is-error', !el.value.trim()); }
  reqs.forEach(function (el) { el.addEventListener('input', function () { checkReq(el); }); });
  function openPv() {
    pvRole.value = '0';
    syncRole();
    setZoom(100);
    reqs.forEach(checkReq);
    pv.hidden = false;
    document.body.style.overflow = 'hidden';
    pv.querySelector('[data-pv-doc]').scrollTop = 0;
    pv.querySelector('.pv').focus({ preventScroll: true });
  }
  function closePv() {
    pv.hidden = true;
    document.body.style.overflow = '';
    pvOpen.focus({ preventScroll: true });
  }
  pvOpen.addEventListener('click', openPv);
  pv.querySelector('[data-pv-close]').addEventListener('click', closePv);
  pv.addEventListener('click', function (e) { if (e.target === pv) closePv(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pv.hidden) closePv(); });
  if (/[?&]preview=1(&|$)/.test(location.search)) openPv();
})();
