/* 배율 전환 + 1b 복제 섹션 이미지 참조 */
(function(){
  var bg=document.querySelector('.ys-modal-bg'), modal=document.querySelector('.ys-modal');
  if(!bg||!modal) return;
  var last=null;
  function open(e){ if(e) e.preventDefault(); last=document.activeElement;
    bg.hidden=false; modal.hidden=false;
    var f=modal.querySelector('input'); if(f) f.focus(); }
  function close(){ bg.hidden=true; modal.hidden=true; if(last) last.focus(); }
  document.querySelectorAll('[data-login-open]').forEach(function(el){
    el.addEventListener('click', open);
  });
  bg.addEventListener('click', close);
  modal.addEventListener('click', function(e){ if(e.target===modal) close(); });
  modal.querySelector('.ys-modal-close').addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'&&!modal.hidden) close(); });
  // 임시 화면이라 로그인 동작은 없다
  modal.querySelector('.ys-modal-submit').addEventListener('click', function(e){ e.preventDefault(); });
})();