// Visit and download stats (GoatCounter: no cookies, no personal data).
// Dashboard: https://remsplugins.goatcounter.com  (campaigns = ?utm_campaign=... on post links)
(function(){
  var s=document.createElement('script');
  s.async=true;s.src='https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter','https://remsplugins.goatcounter.com/count');
  document.head.appendChild(s);

  // window.track('avent-dl-05') counts a custom event (shows in the dashboard as "dl/avent-dl-05")
  window.track=function(name){
    try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:'event/'+name,title:name,event:true});}catch(e){}
  };

  // every download link / button of the site, counted by file name
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a');if(!a)return;
    var u=a.getAttribute('data-dest')||a.getAttribute('href')||'';
    if(/\.(zip|dmg|pkg|exe|msi|vst3|fxp)(\?|$)/i.test(u)||/releases\/download\//.test(u))
      window.track('dl-'+u.split('/').pop().split('?')[0]);
  },true);
})();
