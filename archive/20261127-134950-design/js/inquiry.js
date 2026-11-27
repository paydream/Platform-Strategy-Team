/* 예스폼싸인 · 고객센터 문의하기 — 동작 (입력 제한은 기존 화면 yesformsign.com/support/qna.php 와 같게)
   · 문의 내용: 1000자까지 · 아래 글자 수(0/1000)가 따라 바뀜
   · 연락처: 숫자만 들어감 (13자까지)
   · [첨부파일 추가]: 파일 고르는 창이 열리고, 고른 파일 이름이 왼쪽 칸에 보임
   · [문의하기]: 보낸 뒤 화면이 시안에 없어서 눌러도 아무 일 없음 */
(function () {
  var form = document.querySelector('[data-qna]');
  if (!form) return;
  var msg = form.querySelector('#qnaMessage');
  var count = form.querySelector('[data-count]');
  var phone = form.querySelector('#qnaPhone');
  var file = form.querySelector('#qnaFile');
  var fileName = form.querySelector('#qnaFileName');

  msg.addEventListener('input', function () { count.textContent = msg.value.length + '/1000'; });
  phone.addEventListener('input', function () {
    var v = phone.value.replace(/\D/g, '');
    if (v !== phone.value) phone.value = v;
  });
  form.querySelector('[data-file-btn]').addEventListener('click', function () { file.click(); });
  file.addEventListener('change', function () {
    fileName.value = file.files.length ? file.files[0].name : '';
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
})();
