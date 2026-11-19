/* 예스폼싸인 2차 고도화 — 대량 전송 받는 사람 입력 표 (pages/bulk-recipients.html)
   Figma 54501:40591 (표) · 54548:41966 (데이터 오류 항목)

   · 줄 = 받는 사람 한 명 · 칸 순서: 계약명 · 이름 · 연락처 · 전달 메시지 · 접근 암호 · 휴대폰 인증
   · 확인 규칙 (모두 빈 줄은 건너뜀)
     이름 — 비었으면 "이름을 입력해 주세요."
     연락처 — 비었거나 숫자 11자리(01…)가 아니면 "휴대폰 번호 11자리를 입력해 주세요."
     접근 암호 — 비었거나 4자 미만 · 20자 이상이면 "암호는 4자 이상 20자 미만으로 입력해 주세요."
     휴대폰 인증 — 비어 있거나 O · X 가 아니면 "O 또는 X로 입력해 주세요." (비어 있으면 인증 안 함)
   · 입력 중인 칸은 맞게 고치면 바로 빨간 테두리가 사라지고, 틀린 값은 칸을 벗어날 때 빨간 테두리
   · 위 숫자 — 전체(줄 수) · 데이터 오류 항목(틀린 칸 수) · 받는 사람(오류 없는 줄 수) / 100명 */
(function () {
  var B = window.bulk;
  var MAX = 100;
  var FIELDS = ['title', 'name', 'phone', 'msg', 'pw', 'auth'];
  var LABEL = { title: '계약명', name: '이름', phone: '연락처', msg: '전달 메시지', pw: '접근 암호', auth: '휴대폰 인증' };
  var HOLDER = { title: '{템플릿명}_{이름} 자동', name: '이름', phone: '번호를 입력해 주세요.', msg: '메시지를 입력해 주세요.', pw: '4~20자', auth: 'O / X' };

  var body = document.querySelector('[data-rows]');
  var checkAll = document.querySelector('[data-check-all]');
  var delChecked = document.querySelector('[data-del-checked]');
  var addRow = document.querySelector('[data-add-row]');
  var next = document.querySelector('[data-next]');
  var tabAll = document.querySelector('[data-tab="all"]');
  var tabErr = document.querySelector('[data-tab="error"]');
  var pop = document.getElementById('rcp-errors');
  var popList = pop.querySelector('[data-err-list]');
  var wrap = document.querySelector('.rcp');

  function blank() { return { title: '', auto: true, name: '', phone: '', msg: '', pw: '', auth: '', checked: false, show: false }; }
  function row(name, phone, msg, pw, auth) { var r = blank(); r.name = name; r.phone = phone; r.msg = msg; r.pw = pw; r.auth = auth; return r; }

  // 엑셀에서 불러온 예시 — 오류 5건 (3번 접근 암호 · 4번 연락처 · 7번 휴대폰 인증 · 10번 이름 · 12번 이름)
  var rows = B.param('src') === 'excel' ? [
    row('김민준', '010-2345-6789', '', 'minjun12', 'O'),
    row('이서연', '010-3456-7890', '첫 출근 전에 확인 부탁드립니다.', 'seoyeon1', 'X'),
    row('박지훈', '010-4567-8901', '', '12', 'O'),
    row('최수아', '010-5678-901', '', 'sua2026!', 'O'),
    row('정도윤', '010-6789-0123', '', 'doyoon99', 'X'),
    row('강하은', '010-7890-1234', '', 'haeun777', 'O'),
    row('조은우', '010-8901-2345', '', 'eunwoo01', 'Y'),
    row('윤지아', '010-9012-3456', '', 'jia0412', 'O'),
    row('장시우', '010-1122-3344', '', 'siwoo55', 'X'),
    row('', '010-2233-4455', '', 'abcd1234', 'O'),
    row('한예린', '010-3344-5566', '', 'yerin88', 'O'),
    row('', '010-4455-6677', '', 'qwer5678', 'X')
  ] : [blank()]; // 직접 입력 — 빈 줄 1개로 시작 ([행 추가]로 늘림)

  function autoTitle(r) { return r.name.trim() ? B.tpl + '_' + r.name.trim() : ''; }
  function isEmpty(r) { return !r.name.trim() && !r.phone.trim() && !r.msg.trim() && !r.pw && !r.auth.trim() && (r.auto || !r.title.trim()); }
  function digits(v) { return v.replace(/\D/g, ''); }
  function fmtPhone(v) { var d = digits(v); return d.length === 11 ? d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7) : v; }
  function check(r) {
    var e = {};
    if (isEmpty(r)) return e;
    if (!r.name.trim()) e.name = '이름을 입력해 주세요.';
    var d = digits(r.phone);
    if (d.length !== 11 || !/^01/.test(d)) e.phone = '휴대폰 번호 11자리를 입력해 주세요.';
    if (r.pw.length < 4 || r.pw.length >= 20) e.pw = '암호는 4자 이상 20자 미만으로 입력해 주세요.';
    if (r.auth.trim() && !/^[OX]$/i.test(r.auth.trim())) e.auth = 'O 또는 X로 입력해 주세요.';
    return e;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  // 칸 하나
  function cell(r, i, k) {
    var n = i + 1;
    var v = k === 'title' ? (r.auto ? autoTitle(r) : r.title) : r[k];
    var attr = ' data-k="' + k + '" value="' + esc(v) + '" placeholder="' + esc(HOLDER[k]) + '" aria-label="' + n + '번 ' + LABEL[k] + '"';
    if (k === 'phone') {
      return '<span class="rcp__box rcp__box--phone" data-box="phone"><span class="rcp__ptype" aria-hidden="true"><img src="../images/ic-mobile-18.svg" width="18" height="18" alt=""><img src="../images/ic-trailing-9.svg" width="9" height="6" alt=""></span>' +
        '<input class="rcp__in" type="tel" inputmode="numeric"' + attr + '></span>';
    }
    if (k === 'pw') {
      return '<span class="rcp__box rcp__box--pw" data-box="pw"><input class="rcp__in" type="' + (r.show ? 'text' : 'password') + '" autocomplete="new-password"' + attr + '>' +
        '<button class="rcp__eye' + (r.show ? ' is-show' : '') + '" type="button" data-eye aria-label="' + (r.show ? '암호 숨기기' : '암호 보기') + '"' + (r.pw ? '' : ' hidden') + '></button></span>';
    }
    return '<span class="rcp__box" data-box="' + k + '"><input class="rcp__in" type="text"' + (k === 'auth' ? ' maxlength="1"' : '') + attr + '></span>';
  }
  function rowHtml(r, i) {
    return '<div class="rcp__row" role="row" data-i="' + i + '">' +
      '<span role="cell"><label class="cbox"><input type="checkbox" data-check aria-label="' + (i + 1) + '번 선택"' + (r.checked ? ' checked' : '') + '><span aria-hidden="true"></span></label></span>' +
      '<span class="rcp__no" role="cell">' + (i + 1) + '</span>' +
      FIELDS.map(function (k) { return '<span role="cell">' + cell(r, i, k) + '</span>'; }).join('') +
      '<span role="cell"><button class="rcp__del" type="button" data-del aria-label="' + (i + 1) + '번 삭제"><img src="../images/ic-trash-light-20.svg" width="20" height="20" alt=""></button></span>' +
      '</div>';
  }
  function input(i, k) { return body.querySelector('.rcp__row[data-i="' + i + '"] [data-k="' + k + '"]'); }

  // 오류 — 전체 다시 셈 · 빨간 테두리 (입력 중인 칸은 고쳤을 때만 지움)
  var errs = [];
  var typing = null;
  function collect() {
    errs = [];
    rows.forEach(function (r, i) {
      var e = check(r);
      FIELDS.forEach(function (k) { if (e[k]) errs.push({ i: i, k: k, msg: e[k] }); });
      r.err = e;
    });
  }
  function paint() {
    rows.forEach(function (r, i) {
      FIELDS.forEach(function (k) {
        var el = input(i, k);
        if (!el) return;
        var box = el.closest('.rcp__box');
        var bad = !!r.err[k];
        if (typing && typing.i === i && typing.k === k && bad && !box.classList.contains('is-error')) return;
        box.classList.toggle('is-error', bad);
        if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      });
    });
  }
  function counts() {
    var ok = rows.filter(function (r) { return !isEmpty(r) && !Object.keys(r.err).length; }).length;
    document.querySelector('[data-count-all]').textContent = rows.length;
    document.querySelector('[data-count-error]').textContent = errs.length;
    document.querySelector('[data-count-ok]').textContent = ok;
    tabErr.disabled = !errs.length;
    next.disabled = !(ok > 0 && !errs.length);
    addRow.disabled = rows.length >= MAX;
    var n = rows.filter(function (r) { return r.checked; }).length;
    delChecked.disabled = !n;
    checkAll.checked = n > 0 && n === rows.length;
    checkAll.indeterminate = n > 0 && n < rows.length;
  }
  function refresh() {
    collect();
    paint();
    counts();
    if (!pop.hidden) { if (errs.length) list(); else closePop(false); }
  }
  function render() {
    body.innerHTML = rows.map(rowHtml).join('');
    refresh();
  }

  // 칸 입력
  body.addEventListener('input', function (e) {
    var el = e.target;
    var k = el.getAttribute('data-k');
    if (!k) return;
    var i = +el.closest('.rcp__row').getAttribute('data-i');
    var r = rows[i];
    if (k === 'title') { r.title = el.value; r.auto = !el.value.trim(); }
    else r[k] = el.value;
    if (k === 'name' && r.auto) input(i, 'title').value = autoTitle(r);
    if (k === 'pw') el.parentNode.querySelector('[data-eye]').hidden = !el.value;
    typing = { i: i, k: k };
    refresh();
  });
  body.addEventListener('focusout', function (e) {
    var el = e.target;
    var k = el.getAttribute && el.getAttribute('data-k');
    if (!k) return;
    var i = +el.closest('.rcp__row').getAttribute('data-i');
    var r = rows[i];
    if (k === 'phone' && r.phone) { r.phone = fmtPhone(r.phone); el.value = r.phone; }
    if (k === 'auth' && /^[ox]$/.test(r.auth)) { r.auth = r.auth.toUpperCase(); el.value = r.auth; }
    if (k === 'title' && r.auto) el.value = autoTitle(r);
    typing = null;
    refresh();
  });

  // 체크 · 삭제 · 암호 보기
  body.addEventListener('change', function (e) {
    if (!e.target.hasAttribute('data-check')) return;
    rows[+e.target.closest('.rcp__row').getAttribute('data-i')].checked = e.target.checked;
    counts();
  });
  body.addEventListener('click', function (e) {
    var del = e.target.closest('[data-del]');
    if (del) {
      var i = +del.closest('.rcp__row').getAttribute('data-i');
      rows.splice(i, 1);
      if (!rows.length) rows.push(blank());
      render();
      var focusTo = body.querySelector('.rcp__row[data-i="' + Math.min(i, rows.length - 1) + '"] [data-del]');
      if (focusTo) focusTo.focus();
      return;
    }
    var eye = e.target.closest('[data-eye]');
    if (eye) {
      var j = +eye.closest('.rcp__row').getAttribute('data-i');
      var r = rows[j];
      r.show = !r.show;
      var pw = input(j, 'pw');
      pw.type = r.show ? 'text' : 'password';
      eye.classList.toggle('is-show', r.show);
      eye.setAttribute('aria-label', r.show ? '암호 숨기기' : '암호 보기');
    }
  });
  checkAll.addEventListener('change', function () {
    rows.forEach(function (r) { r.checked = checkAll.checked; });
    [].forEach.call(body.querySelectorAll('[data-check]'), function (c) { c.checked = checkAll.checked; });
    counts();
  });
  delChecked.addEventListener('click', function () {
    rows = rows.filter(function (r) { return !r.checked; });
    if (!rows.length) rows.push(blank());
    render();
    checkAll.focus();
  });
  addRow.addEventListener('click', function () {
    if (rows.length >= MAX) return;
    rows.push(blank());
    render();
    var el = input(rows.length - 1, 'name');
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  // 엑셀에서 복사한 여러 칸 붙여넣기 — 붙여 넣은 칸부터 오른쪽 · 아래로
  body.addEventListener('paste', function (e) {
    var el = e.target;
    var k = el.getAttribute && el.getAttribute('data-k');
    if (!k) return;
    var text = (e.clipboardData || window.clipboardData).getData('text');
    if (!/[\t\n]/.test(text.replace(/\r?\n$/, ''))) return; // 한 칸짜리는 그대로
    e.preventDefault();
    var lines = text.replace(/\r/g, '').replace(/\n+$/, '').split('\n');
    var i0 = +el.closest('.rcp__row').getAttribute('data-i');
    var c0 = FIELDS.indexOf(k);
    lines.forEach(function (line, n) {
      var i = i0 + n;
      if (i >= MAX) return;
      while (rows.length <= i) rows.push(blank());
      line.split('\t').forEach(function (v, m) {
        var f = FIELDS[c0 + m];
        if (!f) return;
        v = v.trim();
        if (f === 'title') { rows[i].title = v; rows[i].auto = !v; }
        else rows[i][f] = f === 'auth' ? v.toUpperCase() : f === 'phone' ? fmtPhone(v) : v;
      });
    });
    render();
    input(i0, k).focus();
  });

  // 데이터 오류 항목 — 목록 팝업
  function setTab(err) {
    tabAll.classList.toggle('is-on', !err);
    tabErr.classList.toggle('is-on', err);
    tabAll.setAttribute('aria-pressed', String(!err));
    tabErr.setAttribute('aria-pressed', String(err));
  }
  function list() {
    popList.innerHTML = errs.map(function (x, n) {
      return '<li><button class="errpop__item" type="button" data-n="' + n + '">' +
        '<span class="errpop__head"><span class="badge badge--line">' + (x.i + 1) + '번</span>' + LABEL[x.k] + '</span>' +
        '<span class="errpop__msg">' + x.msg + '</span></button></li>';
    }).join('');
  }
  function openPop() {
    if (!errs.length) return;
    list();
    setTab(true);
    pop.hidden = false;
    var wr = wrap.getBoundingClientRect();
    var tr = tabErr.getBoundingClientRect();
    pop.style.left = Math.round(tr.left - wr.left - 2) + 'px';
    pop.style.top = Math.round(tr.bottom - wr.top + 4) + 'px';
    var first = popList.querySelector('.errpop__item');
    if (first) first.focus({ preventScroll: true });
  }
  function closePop(back) {
    pop.hidden = true;
    setTab(false);
    if (back) tabErr.focus({ preventScroll: true });
  }
  tabErr.addEventListener('click', function () { if (pop.hidden) openPop(); else closePop(true); });
  tabAll.addEventListener('click', function () { closePop(false); });
  pop.querySelector('[data-err-close]').addEventListener('click', function () { closePop(true); });
  popList.addEventListener('click', function (e) {
    var b = e.target.closest('.errpop__item');
    if (!b) return;
    [].forEach.call(popList.querySelectorAll('.errpop__item'), function (x) { x.classList.toggle('is-on', x === b); });
    var x = errs[+b.getAttribute('data-n')];
    var el = input(x.i, x.k);
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.focus({ preventScroll: true });
  });
  document.addEventListener('mousedown', function (e) {
    if (pop.hidden || pop.contains(e.target) || tabErr.contains(e.target)) return;
    closePop(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !pop.hidden && document.getElementById('exit-modal').hidden) closePop(true);
  });

  // 입력 방식 변경 · 엑셀 다시 올리기 (계약명은 주소에 담아 이어 감)
  document.querySelector('[data-go-method]').addEventListener('click', function (e) {
    e.preventDefault();
    location.href = B.url('bulk-send.html', 'method=' + (B.param('src') === 'excel' ? 'excel' : 'direct'));
  });
  document.querySelector('[data-go-excel]').addEventListener('click', function (e) {
    e.preventDefault();
    location.href = B.url('bulk-send.html', B.simple ? 'method=excel' : 'view=excel');
  });

  // [다음] — 입력한 받는 사람을 담아 두고 3단계 전송 설정으로
  next.addEventListener('click', function () {
    if (next.disabled) return;
    B.saveRows(rows.filter(function (r) { return !isEmpty(r); }).map(function (r) {
      return { title: r.auto ? autoTitle(r) : r.title.trim(), name: r.name.trim(), phone: fmtPhone(r.phone.trim()), msg: r.msg.trim(), pw: r.pw, auth: r.auth.trim().toUpperCase() === 'O' ? 'O' : 'X' };
    }));
    location.href = B.url('bulk-settings.html');
  });

  render();
  if (/[?&]errors=1(&|$)/.test(location.search)) openPop();
})();
