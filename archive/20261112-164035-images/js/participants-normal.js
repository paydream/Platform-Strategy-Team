/* 예스폼싸인 2차 고도화 — 일반 계약 2단계 참여자 설정 (2026-11-10)
   Figma 02_03_참여자 설정 (54202:37896)

   참여자 카드 (Table/item)
   · 역할을 적으면 카드 머리에 역할 라벨이 붙음
   · [이름 추가하기] · [연락처 추가하기] → 그 칸이 생기고 버튼은 사라짐
     그 칸이 비어 있는 채로 다른 곳을 누르면(포커스가 빠지면) 다시 [추가하기] 버튼으로 돌아감
   · 서명 요청자 본인 스위치 → 이름 · 연락처가 내 정보(김예스 · 010-1234-1234)로 잠기고 머리에 "서명 요청자 본인" 표시
     (한 명만 켤 수 있음 · 다른 카드에서 켜면 앞 카드는 꺼짐)
   · 휴지통 → 그 참여자 빼기 (한 명은 남김) · 순번(1번째 · 2번째 …)은 다시 매김
   · [서명 참여자 추가하기] → 빈 카드 추가 (최대 10명)
   · [다음] → 역할이 빈 카드에 빨간 테두리와 "역할을 입력해주세요."
     모두 적었으면 3단계 서명 조건 설정(signing.html)으로 이동 — 입력한 역할 · 이름 · 연락처를 주소(?d=…)로 넘김

   처음 4명은 Figma 와 같은 상태 — 아래 people 을 고치면 처음 모습이 바뀜
   name / phone: null = 칸 없음(추가하기 버튼) · '' = 빈 칸 · 글자 = 채운 칸
   문서 업로드 [다음]으로 왔을 때(?from=upload)는 첫 번째 참여자(빈 카드) 1명만 보임
   (이 화면을 바로 열면 4명 모두 보임) */
(function () {
  var ME = { name: '김예스', phone: '010-1234-1234' };
  var MAX = 10;
  var people = [
    { role: '', name: null, phone: null, self: false },
    { role: '근로자', name: null, phone: null, self: true },
    { role: '최종 결재자', name: '', phone: '', self: false },
    { role: '', name: null, phone: '', self: false }
  ];
  people.forEach(function (p) { p.pw = false; p.sms = false; p.err = false; });
  // 문서 업로드에서 넘어왔으면 첫 번째 참여자 1명으로 시작
  if (/[?&]from=upload(&|$)/.test(location.search)) people = people.slice(0, 1);

  var box = document.querySelector('[data-people]');
  var addBtn = document.querySelector('[data-add-person]');
  var next = document.querySelector('[data-next-check]');
  var uid = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function nameField(p, id) {
    var locked = p.self;
    return '<div class="field field--name">' +
      '<label class="field__label" for="' + id + '-name">이름</label>' +
      '<input class="field__input' + (locked ? ' is-locked' : '') + '" id="' + id + '-name" type="text" data-k="name" placeholder="이름을 입력해주세요."' +
      ' value="' + esc(locked ? ME.name : p.name) + '"' + (locked ? ' readonly' : '') + '></div>';
  }
  function phoneField(p, id) {
    var locked = p.self;
    return '<div class="field field--phone">' +
      '<label class="field__label" for="' + id + '-phone">연락처</label>' +
      '<div class="phone' + (locked ? ' is-locked' : '') + '">' +
        '<span class="phone__type" aria-hidden="true"><img src="../images/ic-mobile-18.svg" width="18" height="18" alt=""><img src="../images/ic-trailing-9.svg" width="9" height="6" alt=""></span>' +
        '<input class="phone__input" id="' + id + '-phone" type="tel" data-k="phone" placeholder="010-0000-0000" value="' + esc(locked ? ME.phone : p.phone) + '"' + (locked ? ' readonly' : '') + '>' +
      '</div></div>';
  }

  var ADD_BTN = {
    name: '<button class="add-field add-field--name" type="button" data-add="name"><img src="../images/ic-plus-blue-16.svg" width="16" height="16" alt="">이름 추가하기</button>',
    phone: '<button class="add-field add-field--phone" type="button" data-add="phone"><img src="../images/ic-plus-blue-16.svg" width="16" height="16" alt="">연락처 추가하기</button>'
  };

  function render() {
    box.innerHTML = people.map(function (p, i) {
      var id = 'pp' + (++uid);
      var chips = '';
      if (p.role.trim()) chips += '<span class="role"><img src="../images/ic-user-on-12.svg" width="12" height="12" alt="">' + esc(p.role.trim()) + '</span>';
      if (p.self) chips += '<span class="self-tag">서명 요청자 본인</span>';
      var showName = p.self || p.name !== null;
      var showPhone = p.self || p.phone !== null;
      var adds = '';
      if (!showName) adds += ADD_BTN.name;
      if (!showPhone) adds += ADD_BTN.phone;
      return '<div class="pt-item" data-i="' + i + '">' +
        '<div class="pt-item__hd">' +
          '<img src="../images/ic-grip-16.svg" width="16" height="16" alt="">' +
          '<span class="pt-item__no">' + (i + 1) + '번째 참여자</span>' +
          (chips ? '<span class="pt-item__chips">' + chips + '</span>' : '') +
          '<span class="pt-item__tools">' +
            '<label class="tgl"><span>서명 요청자 본인</span><input type="checkbox" data-k="self"' + (p.self ? ' checked' : '') + '><span class="tgl__track" aria-hidden="true"><span class="tgl__knob"></span></span></label>' +
            '<i class="pt-item__bar"></i>' +
            '<button class="pt-item__del" type="button" data-del aria-label="' + (i + 1) + '번째 참여자 빼기"' + (people.length < 2 ? ' disabled' : '') + '></button>' +
          '</span>' +
        '</div>' +
        '<div class="pt-item__body">' +
          '<div class="pt-item__row">' +
            '<div class="field' + (p.err ? ' is-error' : '') + '">' +
              '<label class="field__label" for="' + id + '-role">역할<span class="field__req" aria-hidden="true">*</span></label>' +
              '<input class="field__input" id="' + id + '-role" type="text" data-k="role" placeholder="근로자, 임대인 등" value="' + esc(p.role) + '" required>' +
              '<p class="field__help">' + (p.err ? '역할을 입력해주세요.' : '역할 지정 설명을 적는 힌트 텍스트') + '</p>' +
            '</div>' +
            (showName ? nameField(p, id) : '') +
            (showPhone ? phoneField(p, id) : '') +
            (adds ? '<div class="add-fields">' + adds + '</div>' : '') +
          '</div>' +
          '<div class="pt-auth">' +
            '<span class="pt-auth__title"><img src="../images/ic-shield-16.svg" width="16" height="16" alt="">추가 인증</span>' +
            '<label class="chk"><input type="checkbox" data-k="pw"' + (p.pw ? ' checked' : '') + '><span class="chk__icon" aria-hidden="true"></span>접근 암호 인증</label>' +
            '<label class="chk"><input type="checkbox" data-k="sms"' + (p.sms ? ' checked' : '') + '><span class="chk__icon" aria-hidden="true"></span>휴대폰 번호 인증</label>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    addBtn.disabled = people.length >= MAX;
  }

  function idx(el) { return Number(el.closest('.pt-item').getAttribute('data-i')); }

  // 글자 입력 — 다시 그리지 않고 값만 저장 (역할은 머리 라벨만 고침)
  box.addEventListener('input', function (e) {
    var k = e.target.getAttribute('data-k');
    if (!k || e.target.type === 'checkbox') return;
    var p = people[idx(e.target)];
    if (e.target.readOnly) return;
    p[k] = e.target.value;
    if (k === 'role') {
      var item = e.target.closest('.pt-item');
      if (p.err && p.role.trim()) {
        p.err = false;
        var f = e.target.closest('.field');
        f.classList.remove('is-error');
        f.querySelector('.field__help').textContent = '역할 지정 설명을 적는 힌트 텍스트';
      }
      var chips = item.querySelector('.pt-item__chips');
      var html = (p.role.trim() ? '<span class="role"><img src="../images/ic-user-on-12.svg" width="12" height="12" alt="">' + esc(p.role.trim()) + '</span>' : '') + (p.self ? '<span class="self-tag">서명 요청자 본인</span>' : '');
      if (!chips && html) {
        chips = document.createElement('span');
        chips.className = 'pt-item__chips';
        item.querySelector('.pt-item__no').after(chips);
      }
      if (chips) { if (html) chips.innerHTML = html; else chips.remove(); }
    }
  });

  // 이름 · 연락처 칸이 빈 채로 포커스가 빠지면 [추가하기] 버튼으로 되돌림
  // (카드 전체를 다시 그리지 않고 그 칸만 바꿔, 지금 누른 다른 버튼 · 칸은 그대로 동작)
  box.addEventListener('focusout', function (e) {
    var input = e.target;
    var k = input.getAttribute('data-k');
    if ((k !== 'name' && k !== 'phone') || input.readOnly || input.value.trim() !== '') return;
    var p = people[idx(input)];
    if (!p || p.self) return;
    p[k] = null;
    var row = input.closest('.pt-item__row');
    input.closest('.field').remove();
    var adds = row.querySelector('.add-fields');
    if (!adds) {
      adds = document.createElement('div');
      adds.className = 'add-fields';
      row.appendChild(adds);
    }
    if (k === 'name') adds.insertAdjacentHTML('afterbegin', ADD_BTN.name); // 이름 버튼이 앞
    else adds.insertAdjacentHTML('beforeend', ADD_BTN.phone);
  });

  // 스위치 · 체크
  box.addEventListener('change', function (e) {
    var k = e.target.getAttribute('data-k');
    if (!k || e.target.type !== 'checkbox') return;
    var i = idx(e.target);
    if (k === 'self') {
      var on = e.target.checked;
      people.forEach(function (p, j) { p.self = on && j === i; });
      var focusId = e.target.closest('.pt-item').getAttribute('data-i');
      render();
      var t = box.querySelector('.pt-item[data-i="' + focusId + '"] input[data-k="self"]');
      if (t) t.focus({ preventScroll: true });
      return;
    }
    people[i][k] = e.target.checked;
  });

  // 버튼 — 칸 추가 · 빼기
  box.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var i = idx(add), k = add.getAttribute('data-add');
      people[i][k] = '';
      render();
      var input = box.querySelector('.pt-item[data-i="' + i + '"] [data-k="' + k + '"]');
      if (input) input.focus();
      return;
    }
    var del = e.target.closest('[data-del]');
    if (del && people.length > 1) {
      people.splice(idx(del), 1);
      render();
    }
  });

  addBtn.addEventListener('click', function () {
    if (people.length >= MAX) return;
    people.push({ role: '', name: null, phone: null, self: false, pw: false, sms: false, err: false });
    render();
    var last = box.lastElementChild;
    last.scrollIntoView({ block: 'center', behavior: 'smooth' });
    last.querySelector('[data-k="role"]').focus({ preventScroll: true });
  });

  // 다음 — 역할이 빈 카드 표시 · 모두 적었으면 3단계로 (입력한 역할을 넘김)
  next.addEventListener('click', function () {
    var first = -1;
    people.forEach(function (p, i) { p.err = !p.role.trim(); if (p.err && first < 0) first = i; });
    render();
    if (first > -1) {
      var input = box.querySelector('.pt-item[data-i="' + first + '"] [data-k="role"]');
      input.scrollIntoView({ block: 'center', behavior: 'smooth' });
      input.focus({ preventScroll: true });
      return;
    }
    var order = document.querySelector('input[name="sign-order"]:checked');
    var dm = location.search.match(/[?&]doc=([^&]*)/);
    var d = {
      type: 'normal',
      doc: dm ? decodeURIComponent(dm[1]) : '',
      order: order ? order.value : 'order',
      roles: people.map(function (p) {
        return {
          role: p.role.trim(),
          name: p.self ? ME.name : (p.name || '').trim(),
          contact: p.self ? ME.phone : (p.phone || '').trim(),
          self: p.self,
          auth: [p.pw ? '접근 암호' : '', p.sms ? '휴대폰 번호' : ''].filter(Boolean) // 추가 인증 — 4단계 검토에 보임
        };
      })
    };
    location.href = 'signing.html?flow=tpl&d=' + encodeURIComponent(JSON.stringify(d));
  });

  render();
})();
