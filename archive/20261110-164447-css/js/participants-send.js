/* 예스폼싸인 2차 고도화 — 계약하기 2단계 참여자 설정 (2026-11-10)
   Figma 참여자 설정 (54347:36467)

   참여자 카드 (Table/item)
   · 머리: 순번 · 역할 라벨 · 서명 요청자 본인 표시 · 휴지통
   · 칸: 이름* · 연락처* · 서명 유효기간*(기본 14일) · 전달 메시지
     서명 요청자 본인은 이름 · 연락처가 잠김

   템플릿 역할에 따라 (템플릿 관리 [계약하기] → ?type=…&roles=[{ role, name, contact, preset }])
   · 이름까지 정해진 역할(실선 라벨) → 템플릿에 넣어 둔 이름 · 연락처가 읽기 전용(회색)으로 채워져 있음
     서명 요청자 본인 역할(index.html 라벨의 data-self)이면 역할 라벨 옆에 "서명 요청자 본인" (예: 계약자)
     템플릿에서 켠 추가 인증은 파란 라벨로 보임 (예: 계약자 — 접근 암호 인증 · 휴대폰 번호 인증)
   · 역할만 있는 역할(점선 라벨) → 이름 · 연락처 빈 칸 (이 화면에서 입력)
   · 직접 추가한 참여자 → 점선 "역할 미입력" 
   · 추가 인증: 본인은 "요청자 본인은 추가 인증을 설정하지 않습니다." · 설정한 인증은 파란 라벨 · 없으면 오른쪽 [설정하기]
     ([설정하기] · [주소록에서 불러오기]는 디자인이 없어 눌러도 동작하지 않음)
   · 휴지통 → 빼기 (한 명은 남김) · [서명 참여자 추가하기] → "역할 미입력" 카드 추가 (최대 10명)
   · [다음] → 이름 · 연락처 · 서명 유효기간이 빈 칸에 빨간 테두리
     모두 채웠으면 3단계 서명 조건 설정(signing.html)으로 — 역할 · 이름 · 연락처를 주소(?d=…)로 넘김

   처음 카드: 주소 뒤 ?roles=… 가 있으면 역할마다 한 장
             없으면 Figma 예시 3명 — 아래 SAMPLE 을 고치면 처음 모습이 바뀜 */
(function () {
  var MAX = 10;
  var ME = { name: '홍길동', phone: '010-1234-1234' };
  var SAMPLE = [
    { role: '', self: true, auth: [] },
    { role: '근로자', self: false, auth: ['접근 암호 인증'] },
    { role: '', self: false, auth: [] }
  ];

  function param(k) {
    var m = location.search.match(new RegExp('[?&]' + k + '=([^&]*)'));
    try { return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; } catch (e) { return ''; }
  }
  // 역할 목록 — [{ role, name, contact, preset }] (예전 꼴 "역할,역할" 도 읽음)
  function parseRoles(v) {
    if (!v) return [];
    try {
      var a = JSON.parse(v);
      if (Array.isArray(a)) return a.map(function (x) { return { role: String(x.role || '').trim(), name: x.name || '', contact: x.contact || '', preset: !!x.preset, auth: Array.isArray(x.auth) ? x.auth : [], self: !!x.self }; });
    } catch (e) { /* 예전 꼴 */ }
    return v.split(',').map(function (x) { return x.trim(); }).filter(Boolean).map(function (r) { return { role: r, name: '', contact: '', preset: false, auth: [] }; });
  }
  var type = param('type') === 'bulk' ? 'bulk' : 'normal';
  var roles = parseRoles(param('roles'));
  var people = roles.length ?
    roles.map(function (r) {
      // preset = 이름까지 정해진 역할(값이 채워짐) · 그 밖 = 역할만 있는 역할(빈 칸)
      return { role: r.role, roleKind: r.preset ? 'preset' : 'empty', self: !!r.self, auth: r.auth.slice(), name: r.preset ? r.name : '', phone: r.preset ? r.contact : '',
        days: '14', msg: '', err: {} };
    }) :
    SAMPLE.map(function (p) {
      return { role: p.role, roleKind: p.role ? 'preset' : 'none', self: p.self, auth: p.auth.slice(), name: p.self ? ME.name : '', phone: p.self ? ME.phone : '',
        days: '14', msg: '', err: {} };
    });

  // 카드 머리 유형 라벨 — 대량 전송 · 일반 계약
  var chip = document.querySelector('[data-type-chip]');
  if (chip && type === 'bulk') { chip.className = 'type type--bulk'; chip.textContent = '대량 전송'; }

  var box = document.querySelector('[data-people]');
  var addBtn = document.querySelector('[data-add-person]');
  var next = document.querySelector('[data-next-check]');
  var uid = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function chips(p) {
    var me = p.self ? '<span class="self-tag">서명 요청자 본인</span>' : '';
    if (p.self && !p.role) return me;
    if (p.role && p.roleKind !== 'empty') return '<span class="role"><img src="../images/ic-user-on-12.svg" width="12" height="12" alt="">' + esc(p.role) + '</span>' + me;
    if (p.self) return me;
    return '<span class="role role--empty"><img src="../images/ic-user-off-12.svg" width="12" height="12" alt="">' + esc(p.role || '역할 미입력') + '</span>';
  }
  // 이름 · 연락처 칸 — 서명 요청자 본인 · 이름까지 정해진 역할은 읽기 전용(회색)
  function whoFields(p, id) {
    var fixed = p.self || p.roleKind === 'preset' && !!(p.name || p.phone);
    var lock = fixed ? ' is-locked' : '';
    var ro = fixed ? ' readonly' : '';
    return '<div class="field field--w180' + (p.err.name ? ' is-error' : '') + '">' +
        '<label class="field__label" for="' + id + '-name">이름<span class="field__req" aria-hidden="true">*</span></label>' +
        '<input class="field__input' + lock + '" id="' + id + '-name" type="text" data-k="name" placeholder="이름을 입력해 주세요." value="' + esc(p.name) + '"' + ro + ' required>' +
      '</div>' +
      '<div class="field field--w250' + (p.err.phone ? ' is-error' : '') + '">' +
        '<label class="field__label" for="' + id + '-phone">연락처<span class="field__req" aria-hidden="true">*</span></label>' +
        '<div class="phone' + lock + '">' +
          '<span class="phone__type" aria-hidden="true"><img src="../images/ic-mobile-18.svg" width="18" height="18" alt=""><img src="../images/ic-trailing-9.svg" width="9" height="6" alt=""></span>' +
          '<input class="phone__input" id="' + id + '-phone" type="tel" data-k="phone" placeholder="번호를 입력해 주세요." value="' + esc(p.phone) + '"' + ro + ' required>' +
        '</div>' +
      '</div>';
  }
  function auth(p) {
    var left = '<span class="pt-auth__title"><img src="../images/ic-shield-16.svg" width="16" height="16" alt="">추가 인증</span>';
    if (p.self && !p.auth.length) return left + '<span class="pt-auth__note">요청자 본인은 추가 인증을 설정하지 않습니다.</span>';
    if (p.auth.length) return left + '<span class="auth-tags">' + p.auth.map(function (a) { return '<span class="auth-tag">' + esc(a) + '</span>'; }).join('') + '</span>';
    return left + '<button class="pt-auth__set" type="button">설정하기<img src="../images/ic-arrow-right-orange-16.svg" width="16" height="16" alt=""></button>';
  }

  function render() {
    box.innerHTML = people.map(function (p, i) {
      var id = 'ps' + (++uid);
      return '<div class="pt-item" data-i="' + i + '">' +
        '<div class="pt-item__hd">' +
          '<img src="../images/ic-grip-16.svg" width="16" height="16" alt="">' +
          '<span class="pt-item__no">' + (i + 1) + '번째 참여자</span>' +
          '<span class="pt-item__chips">' + chips(p) + '</span>' +
          '<span class="pt-item__tools"><button class="pt-item__del" type="button" data-del aria-label="' + (i + 1) + '번째 참여자 빼기"' + (people.length < 2 ? ' disabled' : '') + '></button></span>' +
        '</div>' +
        '<div class="pt-item__body">' +
          '<div class="pt-item__row">' +
            whoFields(p, id) +
            '<div class="field field--w90' + (p.err.days ? ' is-error' : '') + '">' +
              '<label class="field__label field__label--12" for="' + id + '-days">서명 유효기간<span class="field__req" aria-hidden="true">*</span></label>' +
              '<div class="days"><input class="days__input" id="' + id + '-days" type="text" inputmode="numeric" maxlength="3" data-k="days" value="' + esc(p.days) + '" required><span>일</span></div>' +
            '</div>' +
            '<div class="field field--grow">' +
              '<label class="field__label field__label--12" for="' + id + '-msg">전달 메시지</label>' +
              '<input class="field__input" id="' + id + '-msg" type="text" data-k="msg" placeholder="메시지를 입력해 주세요." value="' + esc(p.msg) + '">' +
            '</div>' +
          '</div>' +
          '<div class="pt-auth pt-auth--send">' + auth(p) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    addBtn.disabled = people.length >= MAX;
  }

  function idx(el) { return Number(el.closest('.pt-item').getAttribute('data-i')); }

  // 글자 입력 — 값만 저장, 빨간 테두리는 채우면 지움
  box.addEventListener('input', function (e) {
    var k = e.target.getAttribute('data-k');
    if (!k || e.target.readOnly) return;
    if (k === 'days') e.target.value = e.target.value.replace(/[^0-9]/g, '');
    var p = people[idx(e.target)];
    p[k] = e.target.value;
    if (p.err[k] && p[k].trim()) {
      p.err[k] = false;
      e.target.closest('.field').classList.remove('is-error');
    }
  });

  // 휴지통 — 빼기 (한 명은 남김)
  box.addEventListener('click', function (e) {
    var del = e.target.closest('[data-del]');
    if (del && people.length > 1) {
      people.splice(idx(del), 1);
      render();
    }
  });

  addBtn.addEventListener('click', function () {
    if (people.length >= MAX) return;
    people.push({ role: '', roleKind: 'none', self: false, auth: [], name: '', phone: '', days: '14', msg: '', err: {} });
    render();
    var last = box.lastElementChild;
    last.scrollIntoView({ block: 'center', behavior: 'smooth' });
    last.querySelector('[data-k="name"]').focus({ preventScroll: true });
  });

  // 다음 — 필수 칸 확인 → 3단계 서명 조건 설정
  next.addEventListener('click', function () {
    var first = null;
    people.forEach(function (p, i) {
      ['name', 'phone', 'days'].forEach(function (k) {
        p.err[k] = !String(p[k]).trim();
        if (p.err[k] && !first) first = { i: i, k: k };
      });
    });
    render();
    if (first) {
      var input = box.querySelector('.pt-item[data-i="' + first.i + '"] [data-k="' + first.k + '"]');
      input.scrollIntoView({ block: 'center', behavior: 'smooth' });
      input.focus({ preventScroll: true });
      return;
    }
    var order = document.querySelector('input[name="sign-order"]:checked');
    var d = {
      type: type,
      order: order ? order.value : 'order',
      roles: people.map(function (p) { return { role: p.role, name: p.name.trim(), contact: p.phone.trim(), self: p.self }; })
    };
    location.href = 'signing.html?flow=send&d=' + encodeURIComponent(JSON.stringify(d));
  });

  render();
})();
