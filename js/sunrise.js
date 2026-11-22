// Home "Sunrise" carousel: the centred slide is lit, the others sit back.
// Arrows, dots, swipe, arrow keys; autoplay every 5 s, paused on hover/focus and off with reduced motion.
(function(){
  var car=document.querySelector('[data-sr-car]');if(!car)return;
  var track=car.querySelector('.sr-track'),slides=[].slice.call(track.children),n=slides.length;if(!n)return;
  var dots=car.querySelector('.sr-dots'),live=car.querySelector('.sr-live');
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i=0,timer=null,delay=parseInt(car.getAttribute('data-autoplay')||'0',10);
  slides.forEach(function(s,k){
    var name=s.querySelector('b').textContent;
    var d=document.createElement('button');d.type='button';d.setAttribute('aria-label','Show '+name);
    d.addEventListener('click',function(){go(k);restart();});dots.appendChild(d);
    s.addEventListener('click',function(e){if(k!==i){e.preventDefault();go(k);restart();}});
  });
  var dotEls=[].slice.call(dots.children);
  function go(k){
    i=(k+n)%n;track.style.setProperty('--i',i);
    slides.forEach(function(s,j){var on=j===i;s.classList.toggle('is-on',on);s.setAttribute('aria-hidden',String(!on));s.tabIndex=on?0:-1;});
    dotEls.forEach(function(d,j){d.setAttribute('aria-current',String(j===i));});
    if(live)live.textContent=(i+1)+' of '+n+': '+slides[i].querySelector('b').textContent;
  }
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function start(){if(!delay||reduce)return;stop();timer=setInterval(function(){go(i+1);},delay);}
  function restart(){stop();start();}
  car.querySelector('.sr-btn.prev').addEventListener('click',function(){go(i-1);restart();});
  car.querySelector('.sr-btn.next').addEventListener('click',function(){go(i+1);restart();});
  car.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){go(i-1);restart();}else if(e.key==='ArrowRight'){go(i+1);restart();}});
  var x0=null;
  track.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;stop();},{passive:true});
  track.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)go(dx<0?i+1:i-1);start();});
  car.addEventListener('mouseenter',stop);car.addEventListener('mouseleave',start);
  car.addEventListener('focusin',stop);car.addEventListener('focusout',start);
  document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else start();});
  go(0);start();
})();
