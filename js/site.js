// Shared behaviour for the light pages: email signup before a download (Brevo),
// "notify me" newsletter forms, image switchers, audio players, download counters.
(function(){
  var BREVO='https://83624506.sibforms.com/serve/MUIFAJ_K2-8yEx0hM65dNAN9YlxWxZlgmpC9fWGR0itQIPezsBkQH99aHNgvOY4KgGUBGxujkIrHeq_HbMRT43KHnFZnxmJ1xHBC9fhewqAIb3Ax95mntkHvSg9uKV7A4Je6QgtpwnkqIim0ny_2pGAbpI7oja2ytzHJeillrtfzoJr9FSkmNuVbJqYtO8_J7iMon9HQW-6xR_QWIw==';
  var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function post(form){return fetch(BREVO,{method:'POST',body:new FormData(form),mode:'no-cors'});}

  // email signup before download: any .js-get opens the dialog, then goes to its data-dest
  var dlg=document.getElementById('signup');
  if(dlg&&typeof dlg.showModal==='function'){
    var fm=dlg.querySelector('form'),em=fm.querySelector('[name=EMAIL]'),er=fm.querySelector('.err'),go=fm.querySelector('[type=submit]'),label=go.textContent,dest='download.html';
    document.querySelectorAll('.js-get').forEach(function(a){a.addEventListener('click',function(e){
      e.preventDefault();dest=a.dataset.dest||'download.html';
      var n=dlg.querySelector('.su-name');if(n)n.textContent=a.dataset.plugin||'Rems Plugins';
      er.textContent='';dlg.showModal();em.focus();});});
    dlg.querySelector('.close').addEventListener('click',function(){dlg.close();});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});
    fm.addEventListener('submit',function(e){
      e.preventDefault();
      if(!EMAIL.test(em.value.trim())){er.textContent='Please enter a valid email address.';em.focus();return;}
      go.disabled=true;go.textContent='One moment…';er.textContent='';
      var done=false,t;function next(){if(!done){done=true;location.href=dest;}}
      post(fm).then(next,function(){done=true;clearTimeout(t);go.disabled=false;go.textContent=label;er.textContent='Something went wrong. Please check your connection and try again.';});
      t=setTimeout(next,8000);   // slow network: go on anyway
    });
  }

  // "notify me" / newsletter forms: subscribing is the point, so the consent box is required
  document.querySelectorAll('form.js-notify').forEach(function(fm){
    var em=fm.querySelector('[name=EMAIL]'),ok=fm.querySelector('[name=NEWSLETTER]'),er=fm.querySelector('.err'),go=fm.querySelector('[type=submit]'),done=fm.parentNode.querySelector('.ok'),label=go.textContent;
    fm.addEventListener('submit',function(e){
      e.preventDefault();
      if(!EMAIL.test(em.value.trim())){er.textContent='Please enter a valid email address.';em.focus();return;}
      if(!ok.checked){er.textContent='Tick the box so we can email you.';ok.focus();return;}
      go.disabled=true;go.textContent='One moment…';er.textContent='';
      post(fm).then(function(){fm.hidden=true;if(done)done.hidden=false;},function(){go.disabled=false;go.textContent=label;er.textContent='Something went wrong. Please check your connection and try again.';});
    });
  });

  // image switchers: <div data-switch="imgId"> buttons carry data-src / data-alt, optional data-show="panelId"
  document.querySelectorAll('[data-switch]').forEach(function(box){
    var img=document.getElementById(box.dataset.switch),btns=box.querySelectorAll('button'),attr=btns[0]&&btns[0].getAttribute('role')==='tab'?'aria-selected':'aria-pressed';
    btns.forEach(function(b){b.addEventListener('click',function(){
      if(img&&b.dataset.src){img.src=b.dataset.src;img.alt=b.dataset.alt||img.alt;}
      btns.forEach(function(o){o.setAttribute(attr,o===b?'true':'false');var p=o.dataset.show&&document.getElementById(o.dataset.show);if(p)p.hidden=o!==b;});
      var c=box.dataset.caption&&document.getElementById(box.dataset.caption);if(c&&b.dataset.cap)c.textContent=b.dataset.cap;
    });});
  });

  // thanks toast on the download page
  var th=document.getElementById('thanks');
  if(th){document.querySelectorAll('.js-dl').forEach(function(a){a.addEventListener('click',function(){th.hidden=false;});});
    th.querySelector('.x').addEventListener('click',function(){th.hidden=true;});}

  // copy a terminal command
  document.querySelectorAll('.cmd button').forEach(function(btn){
    var pre=btn.parentNode.querySelector('pre');
    btn.addEventListener('click',function(){
      function sel(){var r=document.createRange();r.selectNodeContents(pre);var s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='Selected';}
      try{navigator.clipboard.writeText(pre.textContent).then(function(){btn.textContent='Copied';},sel);}catch(e){sel();}
    });
  });

  // put the visitor's system first
  try{var ua=navigator.userAgent,os=/Windows/i.test(ua)?'win':(/Linux|X11/i.test(ua)&&!/Android/i.test(ua))?'linux':null;
    if(os)document.querySelectorAll('.dl-os').forEach(function(r){var m=r.querySelector('[data-os=mac]'),f=r.querySelector('[data-os='+os+']');if(!m||!f)return;m.classList.replace('btn-ink','btn-line');f.classList.replace('btn-line','btn-ink');r.insertBefore(f,m);});}catch(e){}

  // download counters: GitHub counts every download of a release asset (see .github/workflows/releases.yml)
  if(document.querySelector('.dl-count'))(function(){
    var KEY='rems-dl-counts',API='https://api.github.com/repos/remsplugins/remsplugins.github.io/releases?per_page=100';
    function show(c){document.querySelectorAll('.dl-count').forEach(function(el){var n=c[el.dataset.plugin]||0;if(n>=1){el.querySelector('b').textContent=n.toLocaleString('en-US');el.querySelector('span').lastChild.textContent=n===1?' download':' downloads';el.hidden=false;}});}
    try{var s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&Date.now()-s.t<6e5){show(s.c);return;}}catch(e){}
    fetch(API,{headers:{'Accept':'application/vnd.github+json'}}).then(function(r){return r.ok?r.json():Promise.reject(r.status);}).then(function(rel){
      var c={};rel.forEach(function(r){(r.assets||[]).forEach(function(a){var p=a.name.split('-')[0];c[p]=(c[p]||0)+a.download_count;});});
      try{sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),c:c}));}catch(e){}
      show(c);
    }).catch(function(){});
  })();

  var ic={play:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',stop:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="currentColor"/></svg>'};

  // audio excerpts: one plays at a time
  (function(){
    var btns=[].slice.call(document.querySelectorAll('.snd'));if(!btns.length)return;
    var a=new Audio();a.preload='none';var cur=null,raf=0;
    function reset(b){b.setAttribute('aria-pressed','false');b.querySelector('.ic').innerHTML=ic.play;b.querySelector('.bar').style.width='0';}
    function tick(){if(cur&&a.duration)cur.querySelector('.bar').style.width=(a.currentTime/a.duration*100)+'%';raf=requestAnimationFrame(tick);}
    function stop(){a.pause();cancelAnimationFrame(raf);if(cur)reset(cur);cur=null;}
    a.addEventListener('ended',stop);
    btns.forEach(function(b){b.querySelector('.ic').innerHTML=ic.play;b.addEventListener('click',function(){
      if(cur===b){stop();return;}
      stop();document.querySelectorAll('video').forEach(function(v){v.pause();});
      cur=b;a.src=b.dataset.src;a.play().catch(stop);
      b.setAttribute('aria-pressed','true');b.querySelector('.ic').innerHTML=ic.stop;tick();
    });});
    document.querySelectorAll('video').forEach(function(v){v.addEventListener('play',stop);});
    window.remsStopSounds=stop;
  })();

  // before / after: both versions play together, the switch picks which one you hear
  (function(){
    var box=document.querySelector('.ab');if(!box)return;
    var A=new Audio(box.dataset.a),B=new Audio(box.dataset.b);A.preload=B.preload='none';A.loop=B.loop=true;B.muted=true;
    var btn=box.querySelector('.ic'),bar=box.querySelector('.ab-track span'),sw=[].slice.call(box.querySelectorAll('.ab-sw button')),on=false,raf=0;
    function tick(){if(A.duration)bar.style.width=(A.currentTime/A.duration*100)+'%';if(Math.abs(B.currentTime-A.currentTime)>.05)B.currentTime=A.currentTime;raf=requestAnimationFrame(tick);}
    function stop(){if(!on)return;on=false;A.pause();B.pause();cancelAnimationFrame(raf);btn.innerHTML=ic.play;btn.setAttribute('aria-label','Play');}
    btn.innerHTML=ic.play;
    btn.addEventListener('click',function(){
      if(on){stop();return;}
      document.querySelectorAll('video').forEach(function(v){v.pause();});if(window.remsStopSounds)window.remsStopSounds();
      on=true;B.currentTime=A.currentTime;Promise.all([A.play(),B.play()]).catch(stop);
      btn.innerHTML=ic.stop;btn.setAttribute('aria-label','Stop');tick();
    });
    sw.forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.k;A.muted=k!=='a';B.muted=k!=='b';sw.forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});});});
    box.querySelector('.ab-track').addEventListener('click',function(e){if(!A.duration)return;var r=e.currentTarget.getBoundingClientRect();A.currentTime=B.currentTime=(e.clientX-r.left)/r.width*A.duration;});
    document.querySelectorAll('video').forEach(function(v){v.addEventListener('play',stop);});
    document.querySelectorAll('.snd').forEach(function(b){b.addEventListener('click',stop);});
  })();
})();
