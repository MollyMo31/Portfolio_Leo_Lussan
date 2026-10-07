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

  /* ---------- Unjudged : le jugement, rayons de lumiere et plumes ---------- */
  T.unjudged = function(ov){
    var L=mkLayer('unjudged'); el('div','pt-rays',L);
    spawn(L,13,'pt-fall pt-feather',function(i){ return {'--x':rnd(2,98)+'%','--d':rnd(11,20)+'s','--dl':-rnd(0,18)+'s','--w':rnd(-90,90)+'px','--r':rnd(120,420)+'deg','--o':rnd(.35,.7).toFixed(2),'--s':rnd(.7,1.3).toFixed(2)}; });
    var off=wire(ov,L,{follow:'pt-glow',click:function(e){ ring(L,e.clientX,e.clientY,'pt-ring-g',240,1100); burst(L,e.clientX,e.clientY,14,'pt-mote',{max:120,up:20}); }});
    ov.classList.add('pt','pt-unjudged');
    return function(){ off(); L.remove(); ov.classList.remove('pt','pt-unjudged'); };
  };

  /* ---------- City Rider : pluie de neon et grille synthwave ---------- */
  T.city = function(ov){
    var L=mkLayer('city'), g=el('div','pt-floor',L); el('div','',g);
    spawn(L,30,'pt-fall pt-streak',function(i){ return {'--x':rnd(-5,100)+'%','--d':rnd(.9,1.9)+'s','--dl':-rnd(0,2)+'s','--w':'-70px','--r':'0deg','--o':rnd(.25,.6).toFixed(2),'--len':rnd(50,130)+'px','--c':pick(['#00d4ff','#a78bfa','#ff2fd1'])}; });
    var off=wire(ov,L,{follow:'pt-glow',click:function(e){
      burst(L,e.clientX,e.clientY,12,'pt-zap',{max:140,end:.1,style:function(q,i){ q.style.setProperty('--c',pick(['#00d4ff','#ff2fd1','#a78bfa'])); q.style.height=rnd(10,26)+'px'; }}); ring(L,e.clientX,e.clientY,'pt-ring-c',180,700); }});
    ov.classList.add('pt','pt-city');
    return function(){ off(); L.remove(); ov.classList.remove('pt','pt-city'); };
  };

  /* ---------- Tower Defense : jardin enchante, lucioles et tours qu'on pose au clic ---------- */
  T.tower = function(ov){
    var L=mkLayer('tower'); el('div','pt-vig',L);
    spawn(L,18,'pt-firefly',function(){ return {'--x':rnd(2,98)+'%','--y':rnd(8,92)+'%','--d':rnd(5,10)+'s','--dl':-rnd(0,10)+'s','--dx':rnd(-60,60)+'px','--dy':rnd(-60,60)+'px'}; });
    spawn(L,9,'pt-fall pt-leaf',function(){ return {'--x':rnd(2,98)+'%','--d':rnd(13,24)+'s','--dl':-rnd(0,22)+'s','--w':rnd(-120,120)+'px','--r':rnd(180,540)+'deg','--o':rnd(.4,.75).toFixed(2),'--c':pick(['#65a30d','#a3e635','#4d7c0f','#84cc16'])}; });
    var placed=[];
    var off=wire(ov,L,{click:function(e){
      var t=el('i','pt-tw',L); t.style.left=e.clientX+'px'; t.style.top=e.clientY+'px'; placed.push(t);
      ring(L,e.clientX,e.clientY,'pt-ring-t',200,1000); burst(L,e.clientX,e.clientY,7,'pt-seed',{max:60,end:.3});
      t.animate([{transform:'translate(-50%,-50%) scale(0)'},{transform:'translate(-50%,-50%) scale(1.2)',offset:.4},{transform:'translate(-50%,-50%) scale(1)',offset:.55},{transform:'translate(-50%,-50%) scale(1)',offset:.85,opacity:1},{transform:'translate(-50%,-50%) scale(.8)',opacity:0}],{duration:2200}).onfinish=function(){ t.remove(); };
    }});
    ov.classList.add('pt','pt-tower');
    return function(){ off(); L.remove(); ov.classList.remove('pt','pt-tower'); };
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

  /* ---------- Mira : monde de blocs, cubes flottants, blocs poses au clic ---------- */
  T.mira = function(ov){
    var L=mkLayer('mira'); el('div','pt-grass',L);
    spawn(L,14,'pt-rise pt-cube',function(i){ var s=rnd(12,26); return {'--x':rnd(2,98)+'%','--d':rnd(12,24)+'s','--dl':-rnd(0,22)+'s','--w':rnd(-40,40)+'px','--r':pick(['0deg','90deg','180deg']),'--o':rnd(.3,.6).toFixed(2),'--sz':s.toFixed(0)+'px','--c1':pick(['#34d399','#a3a3a3','#e9b44c','#60a5fa','#92400e']),'--c2':pick(['#065f46','#525252','#92400e','#1e3a8a','#451a03'])}; });
    var off=wire(ov,L,{click:function(e){
      var gx=Math.round(e.clientX/20)*20, gy=Math.round(e.clientY/20)*20, b=el('i','pt-block',L);
      b.style.left=gx+'px'; b.style.top=gy+'px'; b.style.setProperty('--c1',pick(['#34d399','#a3a3a3','#e9b44c','#60a5fa','#92400e']));
      b.animate([{transform:'translate(-50%,-50%) scale(0)'},{transform:'translate(-50%,-50%) scale(1.25)',offset:.3},{transform:'translate(-50%,-50%) scale(1)',offset:.45},{transform:'translate(-50%,-50%) scale(1)',offset:.8},{transform:'translate(-50%,-50%) scale(1.15)',offset:.9,opacity:1},{transform:'translate(-50%,-50%) scale(.6)',opacity:0}],{duration:1700,easing:'steps(8)'}).onfinish=function(){ b.remove(); };
      setTimeout(function(){ burst(L,gx,gy,8,'pt-frag',{max:70,end:.5,t0:400,t1:700,style:function(q){ q.style.background=pick(['#34d399','#065f46','#a3a3a3','#e9b44c']); }}); },1400);
    }});
    ov.classList.add('pt','pt-mira');
    return function(){ off(); L.remove(); ov.classList.remove('pt','pt-mira'); };
  };

  /* ---------- Coaching : interface de visee, reticule, marqueurs de touche ---------- */
  T.coaching = function(ov){
    var L=mkLayer('coaching'); ['tl','tr','bl','br'].forEach(function(c){ el('i','pt-hud pt-hud-'+c,L); }); el('div','pt-scan',L); el('div','pt-stripes pt-st-l',L); el('div','pt-stripes pt-st-r',L);
    var off=wire(ov,L,{follow:'pt-reticle',click:function(e){
      var h=el('i','pt-hit',L); h.style.left=e.clientX+'px'; h.style.top=e.clientY+'px'; h.animate([{transform:'translate(-50%,-50%) scale(.5) rotate(45deg)',opacity:1},{transform:'translate(-50%,-50%) scale(1.5) rotate(45deg)',opacity:0}],{duration:420,easing:'ease-out'}).onfinish=function(){ h.remove(); };
      ring(L,e.clientX,e.clientY,'pt-ring-o',120,600); }});
    ov.classList.add('pt','pt-coaching');
    return function(){ off(); L.remove(); ov.classList.remove('pt','pt-coaching'); };
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
    var ov=document.getElementById('pm-'+id); if(!ov||!T[id]) return;
    try{ SMALL=window.innerWidth<700; cur={id:id,ov:ov,off:T[id](ov)}; }catch(e){ console.warn('page theme',e); }
  };
  closeProj=function(id){ _close(id); if(cur&&cur.id===id) stop(); };
  setInterval(function(){ if(cur && !cur.ov.classList.contains('open')) stop(); },600);
})();
