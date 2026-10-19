/* =========================================================
   예스폼 에디터 — 메인 화면 · 의견 보내기 모달
   Figma: 6671:48548 의견보내기_수정1 · 6671:48609 수정2_호버(첨부 칸 마우스 올림)
          기타 입력칸 · 첨부 파일 줄은 6657:34077 의견보내기2 · 6657:34285 의견보내기3 흐름 그대로
   · 처음 화면에는 모달 없음
   · 상단 "문서에 문제가 발생했나요?"를 누르면 의견 보내기 모달이 열림
   · 문서 정보는 늘 함께 보냄 (모달 아래 안내 문구로만 알려 줌 — 예전 체크 줄은 없앰)
   · "기타"를 고르면 적는 칸이 열림 (의견보내기2) · 풀면 다시 닫힘
   · 첨부 칸을 누르거나 파일을 끌어다 놓으면 파일 이름 + 휴지통으로 바뀜 (의견보내기3) · 휴지통 = 첨부 취소
   · 닫기 = 모달 닫음 · 보내기 = 모달 닫고 아래에 안내(토스트)
   · 딤드를 눌러도, ESC를 눌러도 닫히지 않음 (적던 내용이 실수로 사라지지 않게 — 메인_편집 모달과 같은 규칙)
   · 실제 전송은 없음 (화면 확인용)
   ========================================================= */

(function () {
  const app = document.getElementById('app');
  const openBtn = document.getElementById('report-open');
  const dim = document.getElementById('fb-dim');
  const modal = dim.querySelector('.fb-modal');
  const form = document.getElementById('fb-form');
  const closeBtn = document.getElementById('fb-close');
  const etc = document.getElementById('fb-etc');
  const etcBox = document.getElementById('fb-etc-box');
  const etcText = document.getElementById('fb-etc-text');
  const upload = document.getElementById('fb-upload');
  const fileInput = document.getElementById('fb-file');
  const fileRow = document.getElementById('fb-file-row');
  const fileName = document.getElementById('fb-file-name');
  const fileRemove = document.getElementById('fb-file-remove');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  let attached = null; // 첨부한 파일 (한 개)
  let toastTimer = 0;

  /* ---------- 열기 · 닫기 ---------- */
  function openModal() {
    resetForm();
    dim.hidden = false;
    app.inert = true; // 뒤 화면은 눌리지 않고 초점도 안 감
    document.body.classList.add('is-modal-open');
    modal.focus();
  }
  function closeModal() {
    dim.hidden = true;
    app.inert = false;
    document.body.classList.remove('is-modal-open');
    openBtn.focus(); // 닫으면 연 버튼으로 초점을 돌려줌
  }
  /* 열 때마다 처음 상태로 — 고른 칸 · 적은 글 · 첨부 파일 모두 비움 */
  function resetForm() {
    form.reset();
    etcBox.hidden = true;
    clearFile();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  /* 딤드 클릭 — 아무 동작 없음 */
  dim.addEventListener('click', (e) => {
    if (e.target === dim) e.stopPropagation();
  });

  /* ---------- 기타 → 적는 칸 (의견보내기2) ---------- */
  etc.addEventListener('change', () => {
    etcBox.hidden = !etc.checked;
    if (etc.checked) etcText.focus();
  });

  /* ---------- 파일 첨부 (의견보내기3) ---------- */
  function showFile(file) {
    if (!file) return;
    attached = file;
    fileName.textContent = file.name;
    fileName.title = file.name;
    upload.hidden = true;
    fileRow.hidden = false;
    fileRemove.focus();
  }
  function clearFile() {
    attached = null;
    fileInput.value = '';
    fileName.textContent = '';
    fileRow.hidden = true;
    upload.hidden = false;
  }

  upload.addEventListener('click', () => fileInput.click());
  upload.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', () => showFile(fileInput.files[0]));
  fileRemove.addEventListener('click', () => { clearFile(); upload.focus(); });

  /* 끌어다 놓기 — 첨부 칸 위에 올리면 파란 점선 */
  ['dragenter', 'dragover'].forEach((type) => upload.addEventListener(type, (e) => {
    e.preventDefault();
    upload.classList.add('is-dragover');
  }));
  ['dragleave', 'dragend'].forEach((type) => upload.addEventListener(type, () => upload.classList.remove('is-dragover')));
  upload.addEventListener('drop', (e) => {
    e.preventDefault();
    upload.classList.remove('is-dragover');
    showFile(e.dataTransfer && e.dataTransfer.files[0]);
  });
  /* 모달 안 다른 곳에 파일을 떨어뜨려도 브라우저가 파일을 열지 않게 */
  dim.addEventListener('dragover', (e) => e.preventDefault());
  dim.addEventListener('drop', (e) => e.preventDefault());

  /* ---------- 보내기 → 닫고 토스트 ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // 화면 확인용 — 실제로는 아래 값을 서버로 보내면 됨
    const data = {
      withDoc: true, // 문서 정보는 늘 함께 보냄
      problems: [...form.querySelectorAll('input[name="problem"]:checked')].map((i) => i.value),
      etcText: etc.checked ? etcText.value.trim() : '',
      file: attached ? attached.name : null,
    };
    console.log('[의견 보내기]', data);
    closeModal();
    showToast('의견을 보냈어요. 빠르게 확인해 고칠게요.');
  });

  function showToast(msg) {
    toastText.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
  }

  /* ---------- 키보드 Tab 이동을 모달 안에서만 돌게 ---------- */
  dim.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = [...modal.querySelectorAll('input:not([type="file"]), textarea, button, [tabindex="0"]')]
      .filter((el) => !el.closest('[hidden]') && !el.disabled);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
