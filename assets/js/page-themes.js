/* == Effets de page propres a chaque projet (Unjudged, City Rider, Tower Defense, The Silence, Entretien,
   Mira, Coaching, Streaming, Musiques). Draconium, Devouring Priest et JuiceUp ont leurs effets dans main.js.
   Tout est leger : des elements animes en CSS (transform / opacity) et quelques particules a la demande. == */
(function(){
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SMALL = window.innerWidth < 700;
  function el(tag, cls, parent){ var e=document.createElement(tag); if(cls) e.className=cls; if(parent) parent.appendChild(e); return e; }
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  function mkLayer(id){ return el('div','pt-layer pt-'+id, document.body); }

  /* n particules animees en CSS ; fn(i) renvoie les variables CSS de chacune */
  function spawn(L, n, cls, fn, html){
    if(RM) return;
    n = SMALL ? Math.ceil(n*.55) : n;
    for(var i=0;i<n;i++){
      var e=el('i',cls,L), v=fn(i)||{}, css='';
      for(var k in v) css+=k+':'+v[k]+';';
      e.style.cssText=css; if(html) e.textContent=typeof html==='function'?html(i):html;
    }
  }
  /* eclat a la demande (clic) : particules lancees avec l'API d'animation */
  function burst(L, x, y, n, cls, opt){
    if(RM) return; opt=opt||{};
    for(var i=0;i<n;i++){
      var e=el('i','pt-b '+cls,L), a=rnd(0,Math.PI*2), d=rnd(opt.min||30,opt.max||130), up=opt.up||0;
      e.style.left=x+'px'; e.style.top=y+'px';
      if(opt.html) e.textContent=typeof opt.html==='function'?opt.html(i):opt.html;
      if(opt.style) opt.style(e,i);
      var an=e.animate([{transform:'translate(-50%,-50%) scale(1) rotate(0)',opacity:1},
        {transform:'translate(calc(-50% + '+Math.cos(a)*d+'px),calc(-50% + '+(Math.sin(a)*d-up)+'px)) scale('+(opt.end==null?.2:opt.end)+') rotate('+rnd(-200,200)+'deg)',opacity:0}],
        {duration:rnd(opt.t0||500,opt.t1||900),easing:'cubic-bezier(.15,.8,.3,1)'});
      an.onfinish=(function(q){ return function(){ q.remove(); }; })(e);
    }
  }
  function ring(L, x, y, cls, size, dur, delay){
    if(RM) return; var e=el('i','pt-ring '+cls,L); e.style.left=x+'px'; e.style.top=y+'px';
    var an=e.animate([{transform:'translate(-50%,-50%) scale(.1)',opacity:.9},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:dur||900,delay:delay||0,easing:'ease-out',fill:'backwards'});
    e.style.width=e.style.height=(size||200)+'px'; an.onfinish=function(){ e.remove(); };
  }
  /* element qui suit le curseur (lueur, reticule...) */
  function follow(L, cls){
    var e=el('i','pt-follow '+cls,L), x=-200, y=-200, raf=0;
    function ap(){ raf=0; e.style.transform='translate3d('+x+'px,'+y+'px,0) translate(-50%,-50%)'; }
    return { node:e, move:function(ev){ x=ev.clientX; y=ev.clientY; if(!raf) raf=requestAnimationFrame(ap); }, stop:function(){ if(raf) cancelAnimationFrame(raf); } };
  }
  /* branche les ecouteurs de la fiche et renvoie la fonction de nettoyage */
  function wire(ov, L, o){
    var fol=o.follow?follow(L,o.follow):null, last=0;
    function mv(e){ if(fol) fol.move(e); if(o.move){ var n=Date.now(); if(n-last>(o.every||60)){ last=n; o.move(e); } } }
    function ck(e){
      if(e.target.closest('.proj-modal-close,#modal-lang-bar,.carousel-btn,.pr-rail,.dx-rail')) return;
      if(o.click) o.click(e);
    }
    ov.addEventListener('mousemove',mv); ov.addEventListener('click',ck);
    return function(){ ov.removeEventListener('mousemove',mv); ov.removeEventListener('click',ck); if(fol) fol.stop(); };
  }

  var T = {};

  /* --- apparition des textes : chaque theme choisit son animation (classe pt-in ajoutee quand l'element entre a l'ecran) --- */
  function reveal(ov, sel){
    if(RM || !('IntersectionObserver' in window)) return function(){};
    var t=[].slice.call(ov.querySelectorAll(sel)), io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('pt-in'); io.unobserve(en.target); } }); },{root:ov,threshold:.12});
    t.forEach(function(e,i){ e.classList.add('pt-rv'); e.style.setProperty('--d',((i%4)*70)+'ms'); io.observe(e); });
    return function(){ io.disconnect(); t.forEach(function(e){ e.classList.remove('pt-rv','pt-in'); e.style.removeProperty('--d'); }); };
  }
  var RV_ALL='.pm-section-title,.pm-label,.proj-modal-body > p,.proj-modal-body > div[style*="grid-template-columns"] > div,.proj-modal-body figure';
  function svgNS(tag,attrs,parent){ var e=document.createElementNS('http://www.w3.org/2000/svg',tag); for(var k in attrs) e.setAttribute(k,attrs[k]); if(parent) parent.appendChild(e); return e; }

  /* ---------- Unjudged : le corps et l'ame, le verdict ---------- */
  T.unjudged = function(ov){
    var L=mkLayer('unjudged'); el('div','pt-edge pt-edge-l',L); el('div','pt-edge pt-edge-r',L);
    var rv=reveal(ov,RV_ALL), raf=0, gx=0, gy=0;
    function mv(e){ gx=(e.clientX/window.innerWidth-.5)*14; gy=(e.clientY/window.innerHeight-.5)*8; if(!raf) raf=requestAnimationFrame(function(){ raf=0; ov.style.setProperty('--gx',gx.toFixed(1)+'px'); ov.style.setProperty('--gy',gy.toFixed(1)+'px'); }); }
    ov.addEventListener('mousemove',mv);
    ov.classList.add('pt','pt-unjudged');
    return function(){ ov.removeEventListener('mousemove',mv); if(raf) cancelAnimationFrame(raf); rv(); L.remove(); ov.style.removeProperty('--gx'); ov.style.removeProperty('--gy'); ov.classList.remove('pt','pt-unjudged'); };
  };

  /* ---------- City Rider : la ville la nuit, depuis la moto ---------- */
  T.city = function(ov){
    var hero=ov.querySelector('.proj-modal-hero'), sky=el('div','pt-sky',hero), W=1200, H=200;
    var svg=svgNS('svg',{viewBox:'0 0 '+(W*2)+' '+H,preserveAspectRatio:'none','aria-hidden':'true'},sky);
    [['#2b1a70',.7,60,130],['#140a3c',1,40,170]].forEach(function(lay,li){
      var g=svgNS('g',{},svg), x=0, k=0;
      while(x<W*2){ var w=rnd(24,62), h=rnd(lay[2],lay[3]), d=li?0:0; svgNS('rect',{x:x,y:H-h,width:w,height:h,fill:lay[0],opacity:lay[1]},g);
        if(li){ for(var wy=H-h+10;wy<H-8;wy+=14){ for(var wx=x+6;wx<x+w-8;wx+=11){ if(Math.random()<.32){ var r=svgNS('rect',{x:wx,y:wy,width:4,height:6,fill:pick(['#fde68a','#00d4ff','#ff2fd1']),opacity:rnd(.5,.95).toFixed(2)},g); if(Math.random()<.18){ r.setAttribute('class','pt-win'); r.style.animationDelay=(-rnd(0,6)).toFixed(1)+'s'; } } } } }
        x+=w+rnd(2,10); k++; }
    });
    var L=mkLayer('city'); el('div','pt-lane pt-lane-l',L); el('div','pt-lane pt-lane-r',L);
    var rv=reveal(ov,RV_ALL), raf=0;
    function mv(e){ var p=(e.clientX/window.innerWidth-.5)*-40; if(!raf) raf=requestAnimationFrame(function(){ raf=0; sky.style.setProperty('--px',p.toFixed(1)+'px'); }); }
    ov.addEventListener('mousemove',mv);
    ov.classList.add('pt','pt-city');
    return function(){ ov.removeEventListener('mousemove',mv); if(raf) cancelAnimationFrame(raf); rv(); sky.remove(); L.remove(); ov.classList.remove('pt','pt-city'); };
  };

  /* ---------- Tower Defense : une carte de tower defense dans le bandeau ---------- */
  T.tower = function(ov){
    var hero=ov.querySelector('.proj-modal-hero'), sc=el('div','pt-td',hero);
    var svg=svgNS('svg',{viewBox:'0 0 600 170',preserveAspectRatio:'xMaxYMax slice','aria-hidden':'true'},sc);
    var path='M-10 130 C60 130 90 60 170 70 S250 140 320 120 S400 40 470 60 S560 120 620 90';
    svgNS('path',{d:path,fill:'none',stroke:'rgba(101,163,13,.28)','stroke-width':'22','stroke-linecap':'round'},svg);
    svgNS('path',{d:path,fill:'none',stroke:'rgba(190,242,100,.5)','stroke-width':'2','stroke-dasharray':'3 7','stroke-linecap':'round'},svg);
    [[120,118],[260,60],[370,150],[500,110]].forEach(function(t,i){
      var g=svgNS('g',{},svg); var c=svgNS('circle',{cx:t[0],cy:t[1],r:46,fill:'rgba(163,230,53,.05)',stroke:'rgba(163,230,53,.4)','stroke-width':'1','stroke-dasharray':'4 4'},g);
      var a=svgNS('animate',{attributeName:'r',values:'38;50;38',dur:(4+i)+'s',repeatCount:'indefinite'},c);
      svgNS('rect',{x:t[0]-8,y:t[1]-8,width:16,height:16,rx:3,fill:'#a3e635',stroke:'#365314','stroke-width':'2'},g);
      svgNS('rect',{x:t[0]-3,y:t[1]-13,width:6,height:8,rx:2,fill:'#d9f99d'},g);
    });
    if(!RM) for(var i=0;i<5;i++){ var d=svgNS('g',{},svg); svgNS('circle',{r:6,fill:'#ef4444',stroke:'#7f1d1d','stroke-width':'2'},d); svgNS('animateMotion',{path:path,dur:'16s',begin:(-i*3.2)+'s',repeatCount:'indefinite'},d); }
    var L=mkLayer('tower'); el('div','pt-vine pt-vine-l',L); el('div','pt-vine pt-vine-r',L);
    var rv=reveal(ov,RV_ALL);
    ov.classList.add('pt','pt-tower');
    return function(){ rv(); sc.remove(); L.remove(); ov.classList.remove('pt','pt-tower'); };
  };

  /* ---------- Mira : le monde de blocs, tout se construit bloc par bloc ---------- */
  T.mira = function(ov){
    var hero=ov.querySelector('.proj-modal-hero'), sc=el('div','pt-mc',hero);
    el('i','pt-sun',sc); for(var i=0;i<4;i++){ var c=el('i','pt-cloud',sc); c.style.cssText='top:'+rnd(8,46).toFixed(0)+'%;--d:'+rnd(70,120).toFixed(0)+'s;--dl:-'+rnd(0,100).toFixed(0)+'s;scale:'+rnd(.8,1.5).toFixed(2); }
    el('i','pt-ground',sc);
    var rv=reveal(ov,RV_ALL);
    ov.classList.add('pt','pt-mira');
    return function(){ rv(); sc.remove(); ov.classList.remove('pt','pt-mira'); };
  };

  /* ---------- Coaching : l'analyse de replay ---------- */
  T.coaching = function(ov){
    var hero=ov.querySelector('.proj-modal-hero'), tl=el('div','pt-vod',hero); el('i','pt-vod-track',tl); el('i','pt-vod-play',tl);
    [12,27,41,58,73,88].forEach(function(p,i){ var m=el('i','pt-vod-mark',tl); m.style.left=p+'%'; m.style.setProperty('--k',i%2?'#f4a033':'#ffd9a0'); });
    var rv=reveal(ov,RV_ALL+',.proj-modal-body strong');
    var L=mkLayer('coaching');
    // au clic : un cercle d'annotation trace a la main, comme un coach sur un replay
    function ck(e){
      if(RM||e.target.closest('.proj-modal-close,#modal-lang-bar,.carousel-btn,.pr-rail,.dx-rail,a,button')) return;
      var s=svgNS('svg',{width:110,height:80,viewBox:'0 0 110 80','aria-hidden':'true'},L); s.style.cssText='position:absolute;left:'+(e.clientX-55)+'px;top:'+(e.clientY-40)+'px;overflow:visible';
      var pth=svgNS('path',{d:'M55 6 C95 4 108 30 96 52 C84 74 30 78 14 54 C0 32 22 8 62 8 C80 8 92 14 92 14',fill:'none',stroke:'#f4a033','stroke-width':'3.5','stroke-linecap':'round',pathLength:'1','stroke-dasharray':'1','stroke-dashoffset':'1'},s);
      pth.style.filter='drop-shadow(0 0 5px rgba(244,160,51,.8))';
      pth.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{duration:420,fill:'forwards',easing:'ease-out'});
      s.animate([{opacity:1},{opacity:1,offset:.7},{opacity:0}],{duration:1700}).onfinish=function(){ s.remove(); };
    }
    ov.addEventListener('click',ck);
    ov.classList.add('pt','pt-coaching');
    return function(){ ov.removeEventListener('click',ck); rv(); tl.remove(); L.remove(); ov.classList.remove('pt','pt-coaching'); };
  };

  /* ---------- The Silence : brume, poussiere, sonar au clic ---------- */
  T.silence = function(ov){
    var L=mkLayer('silence'); el('div','pt-fog pt-fog1',L); el('div','pt-fog pt-fog2',L); el('div','pt-dark',L); el('div','pt-noise',L);
    spawn(L,22,'pt-rise pt-dust',function(){ return {'--x':rnd(0,100)+'%','--d':rnd(16,32)+'s','--dl':-rnd(0,30)+'s','--w':rnd(-40,40)+'px','--r':'0deg','--o':rnd(.15,.4).toFixed(2),'--s':rnd(1.5,3.5).toFixed(1)+'px'}; });
    var off=wire(ov,L,{click:function(e){ ring(L,e.clientX,e.clientY,'pt-ring-s',160,1500); ring(L,e.clientX,e.clientY,'pt-ring-s',300,1900,350); ring(L,e.clientX,e.clientY,'pt-ring-s',460,2300,700); }});
    ov.classList.add('pt','pt-silence');
    return function(){ off(); L.remove(); ov.classList.remove('pt','pt-silence'); };
  };

  /* ---------- Entretien d'embauche : chapiteau, ampoules, projecteur ---------- */
  T.entretien = function(ov){
    var L=mkLayer('entretien'), U=mkLayer('entretien'); U.classList.add('pt-under');   // chapiteau et ampoules passent derriere la fiche (boutons toujours visibles)
    el('div','pt-tent',U); el('div','pt-bulbs pt-bl-a',U); el('div','pt-bulbs pt-bl-b',U); el('div','pt-bulbs pt-br-a',U); el('div','pt-bulbs pt-br-b',U);
    var COL=['#be123c','#fbbf24','#fde68a','#2dd4bf','#f472b6'];
    var off=wire(ov,L,{follow:'pt-spot',click:function(e){
      burst(L,e.clientX,e.clientY,22,'pt-conf',{max:170,up:60,end:.6,t0:700,t1:1300,style:function(q,i){ q.style.background=COL[i%COL.length]; q.style.width=rnd(5,10)+'px'; q.style.height=rnd(3,6)+'px'; }});
      burst(L,e.clientX,e.clientY,1,'pt-star',{max:1,end:2.4,html:'★'}); }});
    ov.classList.add('pt','pt-entretien');
    return function(){ off(); L.remove(); U.remove(); ov.classList.remove('pt','pt-entretien'); };
  };

  /* ---------- Streaming : ambiance de live, chat fantome, coeurs ---------- */
  T.streaming = function(ov){
    var L=mkLayer('streaming'), live=el('div','pt-live',L); el('b','',live); live.appendChild(document.createTextNode('LIVE'));
    var chat=el('div','pt-chat',L), col=el('div','pt-chat-in',chat);
    for(var r=0;r<20;r++){ var row=el('div','pt-msg',col); var d=el('i','',row); d.style.background=pick(['#9b72d0','#f472b6','#60a5fa','#facc15','#34d399']); var b=el('u','',row); b.style.width=rnd(40,118)+'px'; }
    spawn(L,14,'pt-rise pt-heart',function(){ return {'--x':rnd(2,98)+'%','--d':rnd(9,18)+'s','--dl':-rnd(0,16)+'s','--w':rnd(-50,50)+'px','--r':rnd(-25,25)+'deg','--o':rnd(.3,.65).toFixed(2),'--fs':rnd(12,26).toFixed(0)+'px','--c':pick(['#9b72d0','#f472b6','#c084fc','#ef4444'])}; },'♥');
    var off=wire(ov,L,{click:function(e){ burst(L,e.clientX,e.clientY,12,'pt-hrt',{max:130,up:70,end:.5,t0:700,t1:1300,html:'♥',style:function(q){ q.style.color=pick(['#9b72d0','#f472b6','#c084fc','#ef4444']); q.style.fontSize=rnd(12,24)+'px'; }}); }});
    ov.classList.add('pt','pt-streaming');
    return function(){ off(); L.remove(); ov.classList.remove('pt','pt-streaming'); };
  };

  /* ---------- Musiques : egaliseur qui suit vraiment la musique, vinyle, notes ---------- */
  T.musiques = function(ov){
    var L=mkLayer('musiques'), eq=el('div','pt-eq',L), bars=[], N=SMALL?24:44, raf=0, an=null, data=null, dead=false, lastT=0;
    for(var i=0;i<N;i++){ bars.push(el('i','',eq)); }
    el('div','pt-vinyl',L);
    spawn(L,11,'pt-rise pt-note',function(){ return {'--x':rnd(2,98)+'%','--d':rnd(10,20)+'s','--dl':-rnd(0,18)+'s','--w':rnd(-60,60)+'px','--r':rnd(-30,30)+'deg','--o':rnd(.3,.6).toFixed(2),'--fs':rnd(16,32).toFixed(0)+'px','--c':pick(['#d070f0','#f0a8ff','#9b3fb5','#c084fc'])}; },function(){ return pick(['♪','♫','♩','♬']); });
    function loop(ts){
      if(dead) return; raf=requestAnimationFrame(loop);
      if(ts-lastT<33) return; lastT=ts;
      if(!an && typeof _ambCtx!=='undefined' && _ambCtx && typeof _ambGain!=='undefined' && _ambGain){ try{ an=_ambCtx.createAnalyser(); an.fftSize=128; an.smoothingTimeConstant=.78; _ambGain.connect(an); data=new Uint8Array(an.frequencyBinCount); }catch(e){ an=null; } }
      var t=ts/1000;
      if(an) an.getByteFrequencyData(data);
      for(var i=0;i<N;i++){
        var v=an?data[Math.floor(i*data.length*.7/N)]/255:0; // bas et moyens de la musique
        var idle=.08+.06*Math.sin(t*2+i*.7);
        bars[i].style.transform='scaleY('+Math.max(idle,Math.min(1,v*1.5)).toFixed(3)+')';
      }
    }
    if(!RM) raf=requestAnimationFrame(loop);
    var off=wire(ov,L,{click:function(e){ burst(L,e.clientX,e.clientY,10,'pt-bnote',{max:130,up:60,end:.6,t0:700,t1:1300,html:function(){ return pick(['♪','♫','♩','♬']); },style:function(q){ q.style.color=pick(['#d070f0','#f0a8ff','#c084fc']); q.style.fontSize=rnd(16,30)+'px'; }}); }});
    ov.classList.add('pt','pt-musiques');
    return function(){ dead=true; if(raf) cancelAnimationFrame(raf); if(an){ try{ _ambGain.disconnect(an); }catch(e){} } off(); L.remove(); ov.classList.remove('pt','pt-musiques'); };
  };

  /* ---------- Cycle de vie ---------- */
  var cur=null;
  function stop(){ if(cur){ try{ cur.off(); }catch(e){} cur=null; } }
  var _open=openProj, _close=closeProj;
  openProj=function(id){
    _open(id); stop();
    var ov=document.getElementById('pm-'+id);
    if(ov) [].forEach.call(ov.querySelectorAll('img[loading="lazy"]'),function(i){ i.loading='eager'; });
    if(!ov||!T[id]) return;
    try{ SMALL=window.innerWidth<700; cur={id:id,ov:ov,off:T[id](ov)}; }catch(e){ console.warn('page theme',e); }
  };
  closeProj=function(id){ _close(id); if(cur&&cur.id===id) stop(); };
  setInterval(function(){ if(cur && !cur.ov.classList.contains('open')) stop(); },600);
})();
