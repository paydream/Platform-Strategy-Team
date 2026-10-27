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

/* [내부] 경계 보기 — 주소 뒤 #grid 또는 키보드 G (입력칸에서는 무시) */
(function(){
  function sync(){ document.body.classList.toggle('ys-show-grid', location.hash==='#grid'); }
  sync();
  window.addEventListener('hashchange', sync);
  document.addEventListener('keydown', function(e){
    if((e.key==='g'||e.key==='G') && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)){
      document.body.classList.toggle('ys-show-grid');
    }
  });
})();

/* 2번째 섹션 — 탭(취업/고용 · 물건거래 · 하청/용역 · 기타문서)을 누르면 아래 계약서 미리보기 4장이 바뀜
   탭마다 4번째 칸은 임시로 첫 번째 계약서를 복사해 둠(TEMP_COPY) — 그림·목록을 받으면 4번째 항목을 넣고 TEMP_COPY 를 false 로
   img 가 있으면 그림, 없으면 임시 계약서(제목 · 머리말 · 조항 제목 + 빈칸)를 그려서 보여 줌 */
(function(){
  var LEAD='________________(이하 "갑"이라 한다)과 ________________(이하 "을"이라 한다)은 다음과 같이 계약을 체결한다.';
  var YS_TABS=[
    [ {name:'연봉계약직 고용계약서', img:'images/contract-employ-01.webp'},
      {name:'아르바이트 근로계약서', img:'images/contract-employ-02.webp'},
      {name:'표준근로계약서', img:'images/contract-employ-03.webp'} ],
    [ {name:'납품계약서', clauses:['목 적','납품 물품','납품 기한 및 장소','검 수','대금 지급','하자 보증']},
      {name:'판매계약서', clauses:['목 적','판매 물품','판매 가격','인 도','대금 지급','계약 해제']},
      {name:'공급계약서', clauses:['목 적','공급 물품','공급 기간','단가 및 대금','품질 보증','계약 해지']} ],
    [ {name:'위탁계약서', clauses:['목 적','위탁 업무','계약 기간','위탁 수수료','비밀 유지','계약 해지']},
      {name:'하청계약서', clauses:['목 적','하청 업무의 범위','작업 기간','하청 대금','하자 보수','계약 해제']},
      {name:'용역계약서', clauses:['목 적','용역의 범위','계약 기간','용역 대금','성과물의 귀속','계약 해지']} ],
    [ {name:'자문계약서', clauses:['목 적','자문 범위','계약 기간','자 문 료','비밀 유지','계약 해지']},
      {name:'개인정보 활용 동의서', lead:'본인은 아래와 같이 개인정보를 수집·이용하는 것에 동의합니다.', clauses:['수집 항목','수집·이용 목적','보유 및 이용 기간','제3자 제공','동의 거부 권리']},
      {name:'보안각서', lead:'본인은 회사의 업무를 수행하면서 아래 사항을 지킬 것을 서약합니다.', clauses:['목 적','보안 의무','자료 반출 금지','퇴직 후 의무','위반 시 책임']} ]
  ];
  var TEMP_COPY=true;
  if(TEMP_COPY) YS_TABS.forEach(function(list){ while(list.length<4) list.push(list[list.length-3]); });
  var tabs=[].slice.call(document.querySelectorAll('.ys-start__tab'));
  var list=document.querySelector('.ys-start__docs[data-docs]');
  var panel=document.getElementById('ys-start-panel');
  if(!tabs.length||!list) return;
  function esc(t){ return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function paper(d){
    if(d.img) return '<img alt="'+esc(d.name)+' 미리보기" height="319" src="'+d.img+'" width="226"/>';
    return '<div class="ys-mock" aria-hidden="true"><h4>'+esc(d.name)+'</h4><p>'+esc(d.lead||LEAD)+'</p><dl>'+
      d.clauses.map(function(c,k){ return '<dt>제 '+(k+1)+' 조【 '+esc(c)+' 】</dt><dd></dd>'; }).join('')+'</dl></div>';
  }
  function show(i){
    tabs.forEach(function(t,k){ var on=k===i; t.classList.toggle('is-on',on); t.setAttribute('aria-selected',on?'true':'false'); t.tabIndex=on?0:-1; });
    panel.setAttribute('aria-labelledby','ys-start-tab-'+i);
    list.innerHTML=YS_TABS[i].map(function(d){
      return '<li class="ys-start__doc"><div class="ys-start__paper">'+paper(d)+'</div><p class="ys-start__docname">'+esc(d.name)+'</p></li>'; }).join('');
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){ show(i); });
    t.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown') n=(i+1)%tabs.length;
      if(e.key==='ArrowLeft'||e.key==='ArrowUp') n=(i-1+tabs.length)%tabs.length;
      if(n!==null){ e.preventDefault(); show(n); tabs[n].focus(); }
    });
  });
})();

// 시안02 히어로 제품 화면 — 첫 진입 때 한 번만 올라옴 (css/style2.css 의 ys-shot-rise)
// 애니메이션이 끝나면 data-rise 를 지워서, 시안 탭을 바꿨다가 돌아와도 다시 재생되지 않게 함
document.querySelectorAll('[data-rise]').forEach(function(el){
  el.addEventListener('animationend', function(e){ if(e.target===el) el.removeAttribute('data-rise'); });
});
