function openSkill(id){document.getElementById('sk-'+id).classList.add('open');document.body.style.overflow='hidden';document.body.classList.add('modal-open')}
function closeSkill(id){document.getElementById('sk-'+id).classList.remove('open');document.body.style.overflow='';document.body.classList.remove('modal-open')}

/* == ACCORDEON == */
function toggleAcc(header){
  var item = header.parentElement;
  item.classList.toggle('open');
}

/* == MUSIQUE CAROUSEL == */
function switchMusic(idx){
  document.querySelectorAll('.music-slide').forEach(function(s,i){return s.style.display=i===idx?'block':'none';});
  document.querySelectorAll('.music-info-panel').forEach(function(p,i){return p.style.display=i===idx?'block':'none';});
  document.querySelectorAll('.music-nav-btn').forEach(function(b,i){
    b.style.background = i===idx ? 'rgba(155,63,181,.18)' : 'transparent';
  });
}

/* == EFFETS CANVAS PAR THEME == */
var FX_CONFIGS = {
  unjudged:{ type:'paradise',  color:'#86efac', glow:'rgba(134,239,172,' },
  priest:  { type:'horror',    color:'#ef4444', glow:'rgba(239,68,68,' },
  city:    { type:'cityneon',   color:'#00d4ff', glow:'rgba(0,212,255,' },
  tower:   { type:'garden',    color:'#a3e635', glow:'rgba(163,230,53,' },
  silence: { type:'darkness',  color:'#6b7280', glow:'rgba(107,114,128,' },
  musiques:{ type:'music',     color:'#d070f0', glow:'rgba(208,112,240,' },
  juiceup: { type:'juice',     color:'#c084fc', glow:'rgba(192,132,252,' },
  coaching:{ type:'neon',      color:'#f4a033', glow:'rgba(244,160,51,' },
  mira:    { type:'garden',    color:'#34d399', glow:'rgba(52,211,153,' },
  streaming:{ type:'stream',   color:'#9b72d0', glow:'rgba(155,114,208,' },
};

var _fxCanvas = document.createElement('canvas');
_fxCanvas.style.cssText = 'position:fixed;inset:0;z-index:199;pointer-events:none;display:none;opacity:0.78;';
document.body.appendChild(_fxCanvas);
var _fxRaf = null;
var _fxLastTime = 0;
var _FX_FPS = 30; // throttle a 30fps

// Pause FX quand page cachee
document.addEventListener('visibilitychange', function() {
  if (document.hidden && _fxRaf) { cancelAnimationFrame(_fxRaf); _fxRaf = null; }
});

function startFx(projId) {
  stopFx();
  var cfg = FX_CONFIGS[projId];
  if (!cfg) return;
  var cv = _fxCanvas;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  cv.style.display = 'block';
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var t = 0;

  // Zones de bord elargies pour plus de visibilite
  var BL = W * 0.32;  // bord gauche (0 -> BL)
  var BR = W * 0.68;  // bord droit  (BR -> W)
  var BT = H * 0.28;  // bord haut   (0 -> BT)
  var BB = H * 0.72;  // bord bas    (BB -> H)

  // Cadre lumineux permanent sur les bords de la fenetre modale
  function drawBorderFrameRaw(ctx, W, H, color, alpha) {
    var thickness = 2;
    var cornerSize = 60;
    var grad = ctx.createLinearGradient(0,0,W,0);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.15, color.replace(')',','+alpha+')').replace('rgb','rgba'));
    grad.addColorStop(0.5, color.replace(')',','+(alpha*1.6)+')').replace('rgb','rgba'));
    grad.addColorStop(0.85, color.replace(')',','+alpha+')').replace('rgb','rgba'));
    grad.addColorStop(1, 'transparent');

    // Lignes de bord
    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = thickness;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.rect(4, 4, W-8, H-8);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Coins lumineux
    var corners = [[4,4],[W-4,4],[W-4,H-4],[4,H-4]];
    var angles  = [[0,1],[Math.PI/2,Math.PI/2+1],[Math.PI,Math.PI+1],[Math.PI*1.5,Math.PI*1.5+1]];
    ctx.lineWidth = 3;
    ctx.shadowBlur = 18;
    ctx.shadowColor = color;
    corners.forEach(function(c,i) {
      ctx.beginPath();
      ctx.arc(c[0], c[1], cornerSize, angles[i][0], angles[i][1]);
      ctx.stroke();
    });

    // Petits carres aux coins
    ctx.shadowBlur = 8;
    corners.forEach(function(c) {
      ctx.strokeRect(c[0]-6, c[1]-6, 12, 12);
    });

    // Scan lines horizontales animees
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Le cadre ne change pas d'une image a l'autre : on le dessine une fois (flous couteux), puis on le recopie
  var _frameCv = null, _frameKey = '';
  function drawBorderFrame(ctx, W, H, color, alpha) {
    var key = W+'x'+H+color+alpha;
    if (_frameKey !== key) {
      _frameCv = document.createElement('canvas'); _frameCv.width = W; _frameCv.height = H;
      drawBorderFrameRaw(_frameCv.getContext('2d'), W, H, color, alpha); _frameKey = key;
    }
    ctx.drawImage(_frameCv, 0, 0);
  }

  // Position aleatoire sur les bords UNIQUEMENT
  function bp() {
    var z = Math.floor(Math.random()*4);
    if(z===0) return {x:Math.random()*BL,            y:Math.random()*H};   // gauche
    if(z===1) return {x:BR+Math.random()*(W-BR),     y:Math.random()*H};   // droite
    if(z===2) return {x:Math.random()*W,             y:Math.random()*BT};  // haut
    return           {x:Math.random()*W,             y:BB+Math.random()*(H-BB)}; // bas
  }
  // Position ponderee : 60% cotes gauche/droite, 40% haut/bas
  function bpSide() {
    var z = Math.random();
    if(z<0.3) return {x:Math.random()*BL,         y:Math.random()*H};
    if(z<0.6) return {x:BR+Math.random()*(W-BR),  y:Math.random()*H};
    if(z<0.8) return {x:Math.random()*W,          y:Math.random()*BT};
    return           {x:Math.random()*W,          y:BB+Math.random()*(H-BB)};
  }
  // Position strictement sur le bord (tres proche des bords)
  function bpEdge() {
    var z = Math.floor(Math.random()*4);
    if(z===0) return {x:Math.random()*BL*0.4,           y:Math.random()*H};
    if(z===1) return {x:BR+(Math.random()*(W-BR)*0.6),  y:Math.random()*H};
    if(z===2) return {x:Math.random()*W,                y:Math.random()*BT*0.4};
    return           {x:Math.random()*W,                y:BB+(Math.random()*(H-BB)*0.6)};
  }

  // -- PARADISE / UNJUDGED -------------------------------------
  if (cfg.type === 'paradise') {
    var particles = [];
    // Lucioles - concentrees sur les bords
    for(var i=0;i<85;i++){
      var p0=bpSide();
      particles.push({kind:'fly',x:p0.x,y:p0.y,r:4+Math.random()*7,
        ph:Math.random()*Math.PI*2, vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.6,
        sp:.008+Math.random()*.02, col:Math.random()>.5?'rgba(134,239,172,':'rgba(250,230,120,'});
    }
    // Petales - tombent depuis le haut
    var pch=['\u273F','\u2740','\u2726','\u2727','\u22C6'];
    for(var i=0;i<8;i++){
      particles.push({kind:'petal',x:Math.random()*W,y:-50-Math.random()*H,
        vy:.4+Math.random()*.9, vx:(Math.random()-.5)*.5,
        rot:Math.random()*Math.PI*2, vr:(Math.random()-.5)*.03,
        s:20+Math.random()*30, al:.7+Math.random()*.4,
        e:pch[Math.floor(Math.random()*pch.length)]});
    }
    // Rayons de lumiere sur les cotes

    // Grandes icones fixes dans les coins
    var cornerIcons=[
      {x:BL*.4,y:BT*.5,e:'\uD83C\uDF3F',s:55,al:.35,ph:0,sp:.006},
      {x:W-BL*.4,y:BT*.5,e:'\uD83C\uDF38',s:55,al:.35,ph:1,sp:.007},
      {x:BL*.4,y:H-BT*.5,e:'\u273F',s:55,al:.35,ph:2,sp:.005},
      {x:W-BL*.4,y:H-BT*.5,e:'\uD83C\uDF3A',s:55,al:.35,ph:3,sp:.006},
      {x:BL*.6,y:H*.5,e:'\uD83C\uDF43',s:48,al:.28,ph:.5,sp:.008},
      {x:W-BL*.6,y:H*.5,e:'\u2740',s:48,al:.28,ph:1.5,sp:.007},
      {x:W*.5,y:BT*.6,e:'\u2726',s:44,al:.28,ph:2.5,sp:.009},
      {x:W*.5,y:H-BT*.6,e:'\uD83C\uDF3C',s:44,al:.28,ph:3.5,sp:.006},
    ];
    var rays=[];
    for(var i=0;i<5;i++) rays.push({
      x:i<3?Math.random()*BL:(BR+Math.random()*(W-BR)),
      w:20+Math.random()*60, al:.04+Math.random()*.05, ph:Math.random()*Math.PI*2
    });


    var cornerIcons=[
      {x:BL*.3,y:BT*.5,e:'\uD83C\uDFAE',s:60,al:.42,ph:0,sp:.009},
      {x:W-BL*.3,y:BT*.5,e:'\uD83D\uDC9C',s:60,al:.42,ph:1,sp:.010},
      {x:BL*.3,y:H-BT*.5,e:'\uD83C\uDFC6',s:58,al:.40,ph:2,sp:.008},
      {x:W-BL*.3,y:H-BT*.5,e:'\u26A1',s:58,al:.40,ph:3,sp:.009},
      {x:BL*.5,y:H*.42,e:'\uD83D\uDC7E',s:55,al:.35,ph:.5,sp:.011},
      {x:W-BL*.5,y:H*.42,e:'\uD83D\uDD79\uFE0F',s:55,al:.35,ph:1.5,sp:.010},
      {x:BL*.5,y:H*.70,e:'\uD83D\uDCAC',s:52,al:.32,ph:2.5,sp:.009},
      {x:W-BL*.5,y:H*.70,e:'\uD83C\uDFAF',s:52,al:.32,ph:3.5,sp:.011},
    ];
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.28); t+=.012;
      // Icones de coins fixes
      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        var ial=ic.al*(Math.sin(ic.ph)*.25+.75);
        ctx.save(); ctx.globalAlpha=ial;
        ctx.font=ic.s+'px serif';
        ctx.shadowBlur=14; ctx.shadowColor=cfg.color;
        ctx.fillText(ic.e,ic.x,ic.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      // Rayons de lumiere
      rays.forEach(function(r){
        r.ph+=.008;
        var al=r.al*(Math.sin(r.ph)*.3+.7);
        var g2=ctx.createLinearGradient?null:null; // skip webgl
        ctx.save(); ctx.globalAlpha=al;
        var gr=ctx.createLinearGradient(r.x-r.w/2,0,r.x+r.w/2,H*.8);
        gr.addColorStop(0,'rgba(180,255,200,.75)'); gr.addColorStop(1,'transparent');
        ctx.fillStyle=gr; ctx.fillRect(r.x-r.w/2,0,r.w,H*.8);
        ctx.globalAlpha=1; ctx.restore();
      });
      particles.forEach(function(p){
        if(p.kind==='fly'){
          p.x+=p.vx+Math.sin(p.ph)*.7; p.y+=p.vy+Math.cos(p.ph*.7)*.5; p.ph+=p.sp;
          // Rebond sur les bords pour garder les lucioles dans les marges
          if(p.x<0)p.x=BL*2; if(p.x>W)p.x=BR-(W-BR)*2;
          if(p.y<0)p.y=H; if(p.y>H)p.y=0;
          var al=(Math.sin(p.ph*1.5)*.45+.55)*.85;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=p.col+al+')';
          ctx.shadowBlur=5; ctx.shadowColor=cfg.color; ctx.fill(); ctx.shadowBlur=0;
        } else {
          p.y+=p.vy; p.x+=Math.sin(p.rot*.4)*.7+p.vx; p.rot+=p.vr;
          if(p.y>H+60){p.y=-60; p.x=Math.random()*W;}
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
          ctx.globalAlpha=p.al; ctx.font='bold '+p.s+'px serif'; ctx.fillStyle=cfg.color;
          ctx.shadowBlur=4; ctx.shadowColor=cfg.color;
          ctx.fillText(p.e,-p.s/2,-p.s/2); ctx.shadowBlur=0;
          ctx.globalAlpha=1; ctx.restore();
        }
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- HORROR / DEVOURING PRIEST -------------------------------
  else if (cfg.type === 'horror') {
    var particles = [];
    // Gouttes de sang - surtout sur les cotes et haut
    for(var i=0;i<50;i++){
      var px=Math.random()<.5?Math.random()*BL:BR+Math.random()*(W-BR);
      particles.push({kind:'drip',x:px,y:-80-Math.random()*H,
        vy:1.2+Math.random()*3, r:3+Math.random()*6,
        len:30+Math.random()*70, al:.5+Math.random()*.5});
    }
    // Symboles tenebreux - bords gauche et droit
    var syms=['\u2020','\u271D','\u2629','\u26E7','\uD81A\uDD10','\u263D','\u26B0'];

    var cornerIcons=[
      {x:BL*.35,y:BT*.6,e:'\u2629',s:60,al:.4,ph:0,sp:.004},
      {x:W-BL*.35,y:BT*.6,e:'\u2620',s:60,al:.4,ph:1,sp:.005},
      {x:BL*.35,y:H-BT*.6,e:'\u26E7',s:60,al:.4,ph:2,sp:.004},
      {x:W-BL*.35,y:H-BT*.6,e:'\uD83D\uDC80',s:60,al:.4,ph:3,sp:.005},
      {x:BL*.5,y:H*.35,e:'\u2020',s:70,al:.35,ph:.8,sp:.003},
      {x:W-BL*.5,y:H*.35,e:'\u2020',s:70,al:.35,ph:2,sp:.003},
      {x:BL*.5,y:H*.65,e:'\uD83E\uDE78',s:50,al:.3,ph:1.5,sp:.006},
      {x:W-BL*.5,y:H*.65,e:'\uD83E\uDE78',s:50,al:.3,ph:2.5,sp:.006},
    ];
    for(var i=0;i<25;i++){
      var ps=bpSide();
      particles.push({kind:'sym',x:ps.x,y:ps.y,
        s:48+Math.random()*72, al:.12+Math.random()*.25,
        e:syms[Math.floor(Math.random()*syms.length)],
        fl:Math.random()*Math.PI*2, fsp:.015+Math.random()*.035});
    }
    // Vignette rouge sur les bords
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.28); t++;

      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        var ial=ic.al*(Math.sin(ic.ph)*.35+.65);
        ctx.save(); ctx.globalAlpha=ial;
        ctx.font='bold '+ic.s+'px serif';
        ctx.fillStyle=cfg.color;
        ctx.shadowBlur=40; ctx.shadowColor=cfg.color;
        ctx.fillText(ic.e,ic.x,ic.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      // Halo rouge sur les 4 bords
      var vg=ctx.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.8);
      vg.addColorStop(0,'transparent');
      vg.addColorStop(1,'rgba(160,0,0,'+(0.20+Math.sin(t*.02)*.08)+')');
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
      // Halo supplementaire sur les cotes
      ['left','right'].forEach(function(side){
        var sg=ctx.createLinearGradient(side==='left'?0:W,0,side==='left'?BL*1.5:W-BL*1.5,0);
        sg.addColorStop(0,'rgba(180,0,0,0.18)'); sg.addColorStop(1,'transparent');
        ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
      });
      particles.forEach(function(p){
        if(p.kind==='drip'){
          p.y+=p.vy;
          if(p.y>H+p.len){
            p.y=-p.len-Math.random()*100;
            p.x=Math.random()<.5?Math.random()*BL:BR+Math.random()*(W-BR);
          }
          var g=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.len);
          g.addColorStop(0,'transparent'); g.addColorStop(1,cfg.glow+p.al+')');
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,p.y+p.len);
          ctx.strokeStyle=g; ctx.lineWidth=p.r*.55;
          ctx.shadowBlur=6; ctx.shadowColor=cfg.color; ctx.stroke(); ctx.shadowBlur=0;
          ctx.beginPath(); ctx.arc(p.x,p.y+p.len,p.r*.9,0,Math.PI*2);
          ctx.fillStyle=cfg.glow+(p.al*.9)+')'; ctx.fill();
        } else {
          p.fl+=p.fsp;
          var fal=p.al*(Math.sin(p.fl)*.35+.65);
          ctx.save(); ctx.globalAlpha=fal;
          ctx.font='bold '+p.s+'px serif'; ctx.fillStyle=cfg.color;
          ctx.shadowBlur=5; ctx.shadowColor=cfg.color;
          ctx.fillText(p.e,p.x,p.y); ctx.shadowBlur=0;
          ctx.globalAlpha=1; ctx.restore();
        }
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- NEON / CITY RIDER ---------------------------------------
  else if (cfg.type === 'neon') {
    var particles = [];
    // Trainees qui traversent l'ecran en entrant par les cotes
    for(var i=0;i<16;i++){
      var fromLeft=Math.random()>.5;
      particles.push({kind:'streak',
        x:fromLeft?-200-Math.random()*300:W+Math.random()*300,
        y:Math.random()*H,
        vx:(fromLeft?1:-1)*(7+Math.random()*12),
        len:60+Math.random()*180, al:.25+Math.random()*.45,
        w:1+Math.random()*2.5,
        col:Math.random()>.5?cfg.glow:'rgba(255,100,255,'});
    }
    // Symboles neon sur les cotes
    var nsyms=['\u25C8','\u25C9','\u2B21','\u25B6','\u25C0','\u2B1F','\u2B22','\u25C6'];

    var cornerIcons=[
      {x:BL*.35,y:BT*.6,e:'\u26A1',s:58,al:.4,ph:0,sp:.012},
      {x:W-BL*.35,y:BT*.6,e:'\u25C8',s:58,al:.4,ph:1,sp:.010},
      {x:BL*.35,y:H-BT*.6,e:'\u25B6',s:55,al:.4,ph:2,sp:.011},
      {x:W-BL*.35,y:H-BT*.6,e:'\u25C6',s:55,al:.4,ph:3,sp:.012},
      {x:BL*.5,y:H*.4,e:'\u2B21',s:52,al:.32,ph:.5,sp:.009},
      {x:W-BL*.5,y:H*.4,e:'\u2B22',s:52,al:.32,ph:1.5,sp:.009},
      {x:BL*.5,y:H*.7,e:'\u25C9',s:50,al:.28,ph:2,sp:.013},
      {x:W-BL*.5,y:H*.7,e:'\u2605',s:50,al:.28,ph:3,sp:.011},
    ];
    for(var i=0;i<8;i++){
      var ps2=bpSide();
      particles.push({kind:'sym',x:ps2.x,y:ps2.y,
        s:34+Math.random()*58, al:.1+Math.random()*.2,
        e:nsyms[Math.floor(Math.random()*nsyms.length)],
        fl:Math.random()*Math.PI*2, fsp:.02+Math.random()*.04, col:cfg.glow});
    }
    // Grille perspective au bas de l'ecran
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.28); t+=.01;

      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        var ial=ic.al*(Math.sin(ic.ph)*.3+.7);
        ctx.save(); ctx.globalAlpha=ial;
        ctx.font='bold '+ic.s+'px serif';
        ctx.fillStyle=cfg.color;
        ctx.shadowBlur=5; ctx.shadowColor=cfg.color;
        ctx.fillText(ic.e,ic.x,ic.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      // Grille perspective (road)
      ctx.save(); ctx.globalAlpha=.06; ctx.strokeStyle=cfg.color; ctx.lineWidth=.8;
      var vp={x:W/2,y:H*.55};
      for(var l=0;l<10;l++){
        var y=H*.55+l*28*(1+l*.12);
        if(y>H) break;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
      for(var l=-10;l<=10;l++){
        ctx.beginPath(); ctx.moveTo(vp.x,vp.y); ctx.lineTo(vp.x+l*(W*.09),H); ctx.stroke();
      }
      ctx.globalAlpha=1; ctx.restore();
      // Glow sur les bords gauche/droit
      ['left','right'].forEach(function(side){
        var sg=ctx.createLinearGradient(side==='left'?0:W,0,side==='left'?BL:W-BL,0);
        sg.addColorStop(0,cfg.glow+'0.22)'); sg.addColorStop(1,'transparent');
        ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
      });
      particles.forEach(function(p){
        if(p.kind==='streak'){
          p.x+=p.vx;
          if(p.vx>0&&p.x>W+p.len){p.x=-p.len-Math.random()*200;p.y=Math.random()*H;}
          if(p.vx<0&&p.x<-p.len){p.x=W+Math.random()*200;p.y=Math.random()*H;}
          var g=ctx.createLinearGradient(p.x,p.y,p.x+p.len*(p.vx>0?1:-1),p.y);
          g.addColorStop(0,'transparent'); g.addColorStop(.5,p.col+p.al+')'); g.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.len*(p.vx>0?1:-1),p.y);
          ctx.strokeStyle=g; ctx.lineWidth=p.w;
          ctx.shadowBlur=4; ctx.shadowColor=cfg.color; ctx.stroke(); ctx.shadowBlur=0;
        } else {
          p.fl+=p.fsp;
          var fal=p.al*(Math.sin(p.fl)*.3+.7);
          ctx.save(); ctx.globalAlpha=fal;
          ctx.font='bold '+p.s+'px serif'; ctx.fillStyle=cfg.color;
          ctx.shadowBlur=6; ctx.shadowColor=cfg.color;
          ctx.fillText(p.e,p.x,p.y); ctx.shadowBlur=0;
          ctx.globalAlpha=1; ctx.restore();
        }
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- CITY NEON / CYBERPUNK -----------------------------------
  else if (cfg.type === 'cityneon') {
    var particles = [];
    // Streaks cyan + violet
    for(var i=0;i<22;i++){
      var fl=Math.random()>.5;
      particles.push({kind:'streak',
        x:fl?-200:W+200, y:Math.random()*H,
        vx:(fl?1:-1)*(5+Math.random()*9),
        len:120+Math.random()*360, al:.5+Math.random()*.5,
        w:1.5+Math.random()*3.5,
        col:Math.random()>.5?'rgba(0,212,255,':'rgba(167,139,250,'});
    }
    // Dots sur les bords
    for(var i=0;i<55;i++){
      var pd=bpEdge();
      particles.push({kind:'dot',x:pd.x,y:pd.y,
        r:1.5+Math.random()*4, ph:Math.random()*Math.PI*2,
        sp:.015+Math.random()*.03,
        col:Math.random()>.5?'rgba(0,212,255,':'rgba(167,139,250,'});
    }
    var gridOff = 0;
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.45); t+=.008;
      gridOff = (gridOff + 0.4) % 60;

      // Grille cyberpunk qui defilent vers le bas (bords)
      ctx.save();
      ctx.strokeStyle='rgba(0,212,255,0.07)'; ctx.lineWidth=1;
      // Lignes verticales sur les bords
      for(var x=0;x<BL;x+=40){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for(var x=BR;x<W;x+=40){
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      // Lignes horizontales haut/bas
      for(var y=gridOff;y<BT;y+=40){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
      for(var y=BB+(gridOff%40);y<H;y+=40){
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
      ctx.restore();

      // Scanline qui descend
      var scanY = (t * 80) % H;
      var sg = ctx.createLinearGradient(0, scanY-3, 0, scanY+3);
      sg.addColorStop(0,'transparent'); sg.addColorStop(.5,'rgba(0,212,255,0.15)'); sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg; ctx.fillRect(0, scanY-3, W, 6);

      // Halos neon sur les 4 bords
      ['left','right','top','bottom'].forEach(function(side){
        var sg2;
        if(side==='left') sg2=ctx.createLinearGradient(0,0,BL,0);
        else if(side==='right') sg2=ctx.createLinearGradient(W,0,BR,0);
        else if(side==='top') sg2=ctx.createLinearGradient(0,0,0,BT);
        else sg2=ctx.createLinearGradient(0,H,0,BB);
        sg2.addColorStop(0,'rgba(0,212,255,0.18)'); sg2.addColorStop(1,'transparent');
        ctx.fillStyle=sg2; ctx.fillRect(0,0,W,H);
      });

      particles.forEach(function(p){
        if(p.kind==='dot'){
          p.ph+=p.sp;
          var al=(Math.sin(p.ph)*.4+.55)*.9;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=p.col+al+')';
          ctx.shadowBlur=8; ctx.shadowColor=cfg.color; ctx.fill(); ctx.shadowBlur=0;
        } else {
          p.x+=p.vx;
          if(p.x<-400||p.x>W+400){
            p.x=p.vx>0?-200:W+200;
            p.y=Math.random()*H;
          }
          ctx.save();
          var g2=ctx.createLinearGradient(p.x,0,p.x+(p.vx>0?p.len:-p.len),0);
          g2.addColorStop(0,p.col+p.al+')'); g2.addColorStop(1,'transparent');
          ctx.strokeStyle=g2; ctx.lineWidth=p.w;
          ctx.shadowBlur=10; ctx.shadowColor=p.col+'1)';
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+(p.vx>0?-p.len:p.len),p.y);
          ctx.stroke(); ctx.shadowBlur=0; ctx.restore();
        }
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- GARDEN / TOWER & MIRA -----------------------------------
  else if (cfg.type === 'garden') {
    var particles = [];
    var gc=['\u273F','\u2740','\u2741','\u273E','\uD83C\uDF38','\uD83C\uDF3A','\uD83C\uDF43','\uD83C\uDF3F','\u2698','\u2726','\uD83C\uDF40'];
    var cornerIcons=[
      {x:BL*.25,y:BT*.5,e:'\uD83C\uDF44',s:72,al:.75,ph:0,sp:.005},
      {x:W-BL*.25,y:BT*.5,e:'\uD83C\uDF3B',s:72,al:.75,ph:1,sp:.006},
      {x:BL*.25,y:H-BT*.5,e:'\uD83D\uDC1B',s:68,al:.70,ph:2,sp:.005},
      {x:W-BL*.25,y:H-BT*.5,e:'\uD83E\uDD8B',s:68,al:.70,ph:3,sp:.006},
      {x:BL*.45,y:H*.35,e:'\uD83C\uDF31',s:62,al:.60,ph:.5,sp:.007},
      {x:W-BL*.45,y:H*.35,e:'\u2698',s:62,al:.60,ph:1.8,sp:.007},
      {x:BL*.45,y:H*.65,e:'\uD83C\uDF40',s:60,al:.58,ph:1.2,sp:.008},
      {x:W-BL*.45,y:H*.65,e:'\u273E',s:60,al:.58,ph:2.8,sp:.007},
      {x:W*.25,y:BT*.35,e:'\uD83C\uDF38',s:55,al:.50,ph:.8,sp:.006},
      {x:W*.75,y:BT*.35,e:'\uD83C\uDF3F',s:55,al:.50,ph:2.2,sp:.006},
      {x:W*.25,y:H-BT*.35,e:'\u2740',s:52,al:.48,ph:1.5,sp:.007},
      {x:W*.75,y:H-BT*.35,e:'\uD83C\uDF43',s:52,al:.48,ph:3.2,sp:.007},
    ];
    // Petales tombants
    for(var i=0;i<35;i++){
      particles.push({kind:'petal',x:Math.random()*W,y:-70-Math.random()*H,
        vy:.35+Math.random()*1.1, vx:(Math.random()-.5)*.8,
        rot:Math.random()*Math.PI*2, vr:(Math.random()-.5)*.04,
        s:24+Math.random()*38, al:.75+Math.random()*.35,
        e:gc[Math.floor(Math.random()*gc.length)],
        sw:Math.random()*Math.PI*2, sws:.007+Math.random()*.015});
    }
    // Points lumineux sur les bords
    for(var i=0;i<80;i++){
      var pd=bpEdge();
      particles.push({kind:'dot',x:pd.x,y:pd.y,r:2.5+Math.random()*5,
        ph:Math.random()*Math.PI*2, sp:.012+Math.random()*.025,
        col:Math.random()>.5?cfg.glow:'rgba(180,255,120,'});
    }
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.45); t+=.008;

      // Halo verdoyant fort sur les cotes
      ['left','right','top','bottom'].forEach(function(side){
        var sg;
        if(side==='left'){sg=ctx.createLinearGradient(0,0,BL,0);}
        else if(side==='right'){sg=ctx.createLinearGradient(W,0,BR,0);}
        else if(side==='top'){sg=ctx.createLinearGradient(0,0,0,BT);}
        else{sg=ctx.createLinearGradient(0,H,0,BB);}
        sg.addColorStop(0,cfg.glow+'0.35)'); sg.addColorStop(1,'transparent');
        ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
      });

      // Icones de coins (une seule fois)
      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        var ial=ic.al*(Math.sin(ic.ph)*.2+.8);
        ctx.save(); ctx.globalAlpha=ial;
        ctx.font=ic.s+'px serif';
        ctx.shadowBlur=18; ctx.shadowColor=cfg.color;
        ctx.fillText(ic.e,ic.x,ic.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });

      particles.forEach(function(p){
        if(p.kind==='dot'){
          p.ph+=p.sp;
          var al=(Math.sin(p.ph)*.45+.55)*.85;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=p.col+al+')';
          ctx.shadowBlur=8; ctx.shadowColor=cfg.color; ctx.fill(); ctx.shadowBlur=0;
        } else {
          p.sw+=p.sws; p.y+=p.vy; p.x+=p.vx+Math.sin(p.sw)*1.5; p.rot+=p.vr;
          if(p.y>H+70){p.y=-70; p.x=Math.random()*W;}
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
          ctx.globalAlpha=p.al; ctx.font='bold '+p.s+'px serif'; ctx.fillStyle=cfg.color;
          ctx.shadowBlur=10; ctx.shadowColor=cfg.color;
          ctx.fillText(p.e,-p.s/2,-p.s/2); ctx.shadowBlur=0;
          ctx.globalAlpha=1; ctx.restore();
        }
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- DARKNESS / THE SILENCE ----------------------------------
  else if (cfg.type === 'darkness') {
    // Ondes sonores depuis les 4 coins + bords
    var phrases=['...','shhh','?','listen','...','silence','\u25C9','\u2205'];
    var textPs=[];
    for(var i=0;i<16;i++){
      var pt=bpSide();
      textPs.push({x:pt.x,y:pt.y,text:phrases[i%phrases.length],
        al:0,maxAl:.28+Math.random()*.32,s:16+Math.random()*34,
        growing:true,sp:.002+Math.random()*.004});
    }

    var cornerIcons=[
      {x:BL*.3,y:BT*.5,e:'\u25C9',s:60,al:.3,ph:0,sp:.002},
      {x:W-BL*.3,y:BT*.5,e:'\u25C9',s:60,al:.3,ph:1.5,sp:.002},
      {x:BL*.3,y:H-BT*.5,e:'\u2205',s:60,al:.28,ph:3,sp:.003},
      {x:W-BL*.3,y:H-BT*.5,e:'\u2205',s:60,al:.28,ph:4.5,sp:.003},
      {x:BL*.5,y:H*.5,e:'\uD83D\uDC41',s:50,al:.25,ph:.8,sp:.0015},
      {x:W-BL*.5,y:H*.5,e:'\uD83D\uDC41',s:50,al:.25,ph:2.3,sp:.0015},
    ];
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.38); t+=.006;
      // Ondes depuis les coins - plus visibles
      [[0,0],[W,0],[0,H],[W,H],[W/2,0],[W/2,H],[0,H/2],[W,H/2]].forEach(function(pt,idx){
        var r=(t*35+idx*55)%(Math.max(W,H)*.85);
        var al=Math.max(0,.32-(r/(Math.max(W,H)*.85))*.32);
        ctx.beginPath(); ctx.arc(pt[0],pt[1],r,0,Math.PI*2);
        ctx.strokeStyle=cfg.glow+al+')'; ctx.lineWidth=2.5;
        ctx.shadowBlur=8; ctx.shadowColor=cfg.color; ctx.stroke(); ctx.shadowBlur=0;
      });

      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        var ial=ic.al*(Math.sin(ic.ph)*.5+.5);
        ctx.save(); ctx.globalAlpha=ial;
        ctx.font='bold '+ic.s+'px serif';
        ctx.fillStyle='#9ca3af';
        ctx.shadowBlur=4; ctx.shadowColor='#6b7280';
        ctx.fillText(ic.e,ic.x,ic.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      // Vignette sombre sur les bords
      var vg=ctx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.9);
      vg.addColorStop(0,'transparent');
      vg.addColorStop(1,'rgba(0,0,0,'+(0.20+Math.sin(t*.4)*.06)+')');
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
      // Textes fantomes sur les bords
      textPs.forEach(function(p){
        if(p.growing){p.al+=p.sp; if(p.al>=p.maxAl)p.growing=false;}
        else{p.al-=p.sp*.5; if(p.al<=0){p.al=0;p.growing=true;var nb=bpSide();p.x=nb.x;p.y=nb.y;}}
        ctx.save(); ctx.globalAlpha=p.al;
        ctx.font='bold italic '+p.s+'px monospace'; ctx.fillStyle='#9ca3af';
        ctx.shadowBlur=6; ctx.shadowColor='#6b7280';
        ctx.fillText(p.text,p.x,p.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- MUSIC / MUSIQUES ----------------------------------------
  else if (cfg.type === 'music') {
    var particles = [];
    var nc=['\u2669','\u266A','\u266B','\u266C','\uD834\uDD1E','\uD834\uDD22'];
    for(var i=0;i<30;i++){
      var pm=bpSide();
      particles.push({kind:'note',x:pm.x,y:pm.y,
        vy:-.55-Math.random()*1.1, vx:(Math.random()-.5)*.5,
        n:nc[Math.floor(Math.random()*nc.length)],
        s:22+Math.random()*38, al:.6+Math.random()*.5,rot:(Math.random()-.5)*.3});
    }
    // Barres d'egaliseur sur les bords gauche et droit
    var bars=[];
    for(var i=0;i<24;i++) bars.push({h:20+Math.random()*80,th:Math.random()*Math.PI*2,sp:.05+Math.random()*.09,side:i<10?'left':'right'});

    var cornerIcons=[
      {x:BL*.3,y:BT*.5,e:'\uD834\uDD1E',s:65,al:.4,ph:0,sp:.01},
      {x:W-BL*.3,y:BT*.5,e:'\uD834\uDD22',s:65,al:.4,ph:1,sp:.009},
      {x:BL*.3,y:H-BT*.5,e:'\uD83C\uDFB5',s:55,al:.38,ph:2,sp:.011},
      {x:W-BL*.3,y:H-BT*.5,e:'\uD83C\uDFB6',s:55,al:.38,ph:3,sp:.010},
      {x:BL*.5,y:H*.45,e:'\u266B',s:60,al:.35,ph:.5,sp:.012},
      {x:W-BL*.5,y:H*.45,e:'\u266C',s:60,al:.35,ph:1.5,sp:.011},
      {x:BL*.5,y:H*.72,e:'\uD83C\uDFB9',s:50,al:.30,ph:2.5,sp:.009},
      {x:W-BL*.5,y:H*.72,e:'\uD83C\uDFBA',s:50,al:.30,ph:3.5,sp:.010},
    ];
    var staffY=H*.08;
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.28); t+=.018;

      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        var ial=ic.al*(Math.sin(ic.ph)*.3+.7);
        ctx.save(); ctx.globalAlpha=ial;
        ctx.font='bold '+ic.s+'px serif';
        ctx.fillStyle=cfg.color;
        ctx.shadowBlur=5; ctx.shadowColor=cfg.color;
        ctx.fillText(ic.e,ic.x,ic.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      // Portees musicales en haut
      ctx.save(); ctx.globalAlpha=.08; ctx.strokeStyle=cfg.color; ctx.lineWidth=1;
      for(var l=0;l<5;l++){
        ctx.beginPath(); ctx.moveTo(0,staffY+l*14); ctx.lineTo(W,staffY+l*14); ctx.stroke();
      }
      ctx.globalAlpha=1; ctx.restore();
      // EQ gauche
      bars.forEach(function(b,i){
        b.th+=b.sp; b.h=40+Math.abs(Math.sin(b.th+i*.2))*180;
        var bx=b.side==='left'?i*((BL*.9)/10):BR+(i-10)*((W-BR)*.9/10);
        var bw2=(b.side==='left'?BL*.9:W-BR)*.9/10;
        var g=ctx.createLinearGradient(0,H,0,H-b.h);
        g.addColorStop(0,cfg.glow+'.75)'); g.addColorStop(1,cfg.glow+'.04)');
        ctx.fillStyle=g; ctx.fillRect(bx,H-b.h,bw2,b.h);
      });
      // Notes qui montent
      particles.forEach(function(p){
        p.y+=p.vy; p.x+=p.vx; p.al-=.001;
        if(p.y<-40||p.al<.04){var nb=bpSide();p.y=nb.y;p.x=nb.x;p.al=.5+Math.random()*.4;}
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.globalAlpha=p.al; ctx.font='bold '+p.s+'px serif'; ctx.fillStyle=cfg.color;
        ctx.shadowBlur=6; ctx.shadowColor=cfg.color;
        ctx.fillText(p.n,0,0); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- FLAMES / DRACONIUM --------------------------------------
  else if (cfg.type === 'flames') {
    var particles = [];
    var syms2=['\uD83D\uDD25','\u2694\uFE0F','\uD83D\uDC09','\uD83E\uDDEA','\u2620\uFE0F','\u2697\uFE0F','\uD83D\uDDE1\uFE0F','\u26A1'];
    // Sprites pre-rendus : braises, emojis lumineux, colonnes de flammes, halo
    function mk(w,h,fn){ var c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); return c; }
    var emberSpr={};
    ['rgba(255,140,56,','rgba(255,60,10,'].forEach(function(col){
      emberSpr[col]=mk(64,64,function(g,w,h){ var r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,col+'1)'); r.addColorStop(.35,col+'.75)'); r.addColorStop(1,col+'0)'); g.fillStyle=r; g.fillRect(0,0,w,h); });
    });
    var colSpr=mk(110,512,function(g,w,h){ var r=g.createLinearGradient(0,h,0,0); r.addColorStop(0,'rgba(255,80,0,.75)'); r.addColorStop(.4,'rgba(255,150,50,.42)'); r.addColorStop(1,'rgba(255,150,50,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); });
    var haloSpr=mk(4,256,function(g,w,h){ var r=g.createLinearGradient(0,0,0,h); r.addColorStop(0,'rgba(160,40,0,0)'); r.addColorStop(1,'rgba(160,40,0,.14)'); g.fillStyle=r; g.fillRect(0,0,w,h); });
    var emoSpr={};
    function emo(e,sz){
      var k=e+sz; if(emoSpr[k]) return emoSpr[k];
      var pad=14; return emoSpr[k]=mk(Math.ceil(sz*1.3)+pad*2,Math.ceil(sz*1.3)+pad*2,function(g,w,h){ g.font=sz+'px serif'; g.textBaseline='alphabetic'; g.fillStyle=cfg.color; g.shadowBlur=6; g.shadowColor=cfg.color; g.fillText(e,pad,pad+sz); });
    }
    function drawEmo(e,sz,x,y,al){ var sp=emo(e,sz); ctx.globalAlpha=al; ctx.drawImage(sp,x-14,y-14-sz); }
    // Braises - depuis le bas et les cotes
    for(var i=0;i<40;i++){
      var pb=Math.random()<.6?
        {x:Math.random()<.5?Math.random()*BL:BR+Math.random()*(W-BR), y:H+Math.random()*80}:
        {x:Math.random()*W, y:H+Math.random()*80};
      particles.push({kind:'ember',x:pb.x,y:pb.y,
        vx:(Math.random()-.5)*2.8, vy:-(1.8+Math.random()*4),
        r:2.5+Math.random()*6, life:.8+Math.random()*.2, decay:.004+Math.random()*.01,
        col:Math.random()>.5?'rgba(255,140,56,':'rgba(255,60,10,'});
    }
    // Symboles medievaux - bords gauche et droit
    for(var i=0;i<10;i++){
      var ps3=bpSide();
      particles.push({kind:'sym',x:ps3.x,y:ps3.y,
        s:Math.round((30+Math.random()*55)/5)*5, al:.1+Math.random()*.25,
        e:syms2[Math.floor(Math.random()*syms2.length)],
        fl:Math.random()*Math.PI*2, fsp:.012+Math.random()*.03});
    }
    // Colonnes de flammes - exclusivement sur les bords gauche/droit
    var cols=[];
    for(var i=0;i<9;i++) cols.push({
      x:i<4?Math.random()*BL:(BR+Math.random()*(W-BR)),
      phase:Math.random()*Math.PI*2, sp:.025+Math.random()*.035
    });

    var cornerIcons=[
      {x:BL*.3,y:BT*.5,e:'\uD83D\uDC09',s:65,al:.45,ph:0,sp:.006},
      {x:W-BL*.3,y:BT*.5,e:'\uD83D\uDD25',s:65,al:.45,ph:1,sp:.007},
      {x:BL*.3,y:H-BT*.5,e:'\u2694\uFE0F',s:60,al:.42,ph:2,sp:.005},
      {x:W-BL*.3,y:H-BT*.5,e:'\u2697\uFE0F',s:60,al:.42,ph:3,sp:.006},
      {x:BL*.5,y:H*.45,e:'\uD83D\uDDE1\uFE0F',s:55,al:.35,ph:.8,sp:.007},
      {x:W-BL*.5,y:H*.45,e:'\u2620\uFE0F',s:55,al:.35,ph:2,sp:.006},
      {x:BL*.5,y:H*.72,e:'\uD83E\uDDEA',s:52,al:.32,ph:1.5,sp:.008},
      {x:W-BL*.5,y:H*.72,e:'\uD83D\uDC80',s:52,al:.32,ph:3.2,sp:.007},
    ];
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.28); t+=.02;

      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        drawEmo(ic.e,ic.s,ic.x,ic.y,ic.al*(Math.sin(ic.ph)*.25+.75));
      });
      ctx.globalAlpha=1;
      // Halo de braise en bas
      ctx.drawImage(haloSpr,0,H*.65,W,H*.35);
      // Colonnes de flammes sur les bords
      cols.forEach(function(c){
        c.phase+=c.sp;
        var h=280+Math.sin(c.phase)*180;
        ctx.drawImage(colSpr,c.x-55+Math.sin(c.phase*1.4)*18,H-h,110,h);
      });
      particles.forEach(function(p){
        if(p.kind==='ember'){
          p.x+=p.vx+Math.sin(t*2+p.y*.01)*1.0; p.y+=p.vy;
          p.vx*=.99; p.vy*=.99; p.life-=p.decay;
          if(p.life<=0||p.y<-20){
            var side=Math.random()<.6;
            p.x=side?(Math.random()<.5?Math.random()*BL:BR+Math.random()*(W-BR)):Math.random()*W;
            p.y=H+Math.random()*60;
            p.vx=(Math.random()-.5)*2.8; p.vy=-(1.8+Math.random()*4); p.life=.8+Math.random()*.2;
          }
          var r2=Math.max(0,p.r*p.life)*2.2;
          ctx.globalAlpha=Math.min(1,p.life*.9);
          ctx.drawImage(emberSpr[p.col],p.x-r2,p.y-r2,r2*2,r2*2);
        } else {
          p.fl+=p.fsp;
          drawEmo(p.e,p.s,p.x,p.y,p.al*(Math.sin(p.fl)*.28+.72));
        }
      });
      ctx.globalAlpha=1;
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- STREAM / TWITCH -----------------------------------------
  else if (cfg.type === 'stream') {
    var particles = [];
    var gsyms=['\uD83C\uDFAE','\uD83D\uDC7E','\uD83D\uDD79\uFE0F','\u26A1','\uD83D\uDC9C','\uD83C\uDFC6','\uD83C\uDFAF','\uD83D\uDCAC','\u25B6','\u25C9','\u2B21','\u2605'];
    for(var i=0;i<10;i++){
      var ps4=bpSide();
      particles.push({kind:'sym',x:ps4.x,y:ps4.y,
        s:26+Math.random()*52, al:.14+Math.random()*.22,
        e:gsyms[Math.floor(Math.random()*gsyms.length)],
        fl:Math.random()*Math.PI*2, fsp:.014+Math.random()*.03,
        vx:(Math.random()-.5)*.15, vy:(Math.random()-.5)*.12});
    }
    for(var i=0;i<8;i++){
      particles.push({kind:'bubble',
        x:BR+Math.random()*(W-BR)*0.9, y:H+Math.random()*200,
        vy:-0.8-Math.random()*1.4, r:6+Math.random()*16,
        al:.15+Math.random()*.3, sp:.008+Math.random()*.015,
        ph:Math.random()*Math.PI*2});
    }
    for(var i=0;i<18;i++){
      var fromLeft2=Math.random()>.5;
      particles.push({kind:'streak',
        x:fromLeft2?-200:W+200, y:Math.random()*H,
        vx:(fromLeft2?1:-1)*(4+Math.random()*7),
        len:150+Math.random()*320, al:.55+Math.random()*.45, w:1.5+Math.random()*3.5});
    }
    for(var i=0;i<16;i++){
      var pp=bpSide();
      particles.push({kind:'pixel',x:pp.x,y:pp.y,
        size:3+Math.random()*8, al:.2+Math.random()*.5,
        ph:Math.random()*Math.PI*2, sp:.03+Math.random()*.06});
    }

    var cornerIcons=[
      {x:BL*.3,y:BT*.5,e:'\uD83C\uDFAE',s:60,al:.42,ph:0,sp:.009},
      {x:W-BL*.3,y:BT*.5,e:'\uD83D\uDC9C',s:60,al:.42,ph:1,sp:.010},
      {x:BL*.3,y:H-BT*.5,e:'\uD83C\uDFC6',s:58,al:.40,ph:2,sp:.008},
      {x:W-BL*.3,y:H-BT*.5,e:'\u26A1',s:58,al:.40,ph:3,sp:.009},
      {x:BL*.5,y:H*.42,e:'\uD83D\uDC7E',s:55,al:.35,ph:.5,sp:.011},
      {x:W-BL*.5,y:H*.42,e:'\uD83D\uDD79\uFE0F',s:55,al:.35,ph:1.5,sp:.010},
      {x:BL*.5,y:H*.70,e:'\uD83D\uDCAC',s:52,al:.32,ph:2.5,sp:.009},
      {x:W-BL*.5,y:H*.70,e:'\uD83C\uDFAF',s:52,al:.32,ph:3.5,sp:.011},
    ];
    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.28); t+=.012;

      cornerIcons.forEach(function(ic){
        ic.ph+=ic.sp;
        var ial=ic.al*(Math.sin(ic.ph)*.3+.7);
        ctx.save(); ctx.globalAlpha=ial;
        ctx.font=ic.s+'px serif';
        ctx.fillStyle=cfg.color;
        ctx.shadowBlur=14; ctx.shadowColor=cfg.color;
        ctx.fillText(ic.e,ic.x,ic.y); ctx.shadowBlur=0;
        ctx.globalAlpha=1; ctx.restore();
      });
      ['left','right'].forEach(function(side){
        var sg=ctx.createLinearGradient(side==='left'?0:W,0,side==='left'?BL:W-BL,0);
        sg.addColorStop(0,cfg.glow+'0.18)'); sg.addColorStop(1,'transparent');
        ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
      });
      var vg=ctx.createLinearGradient(0,H*.7,0,H);
      vg.addColorStop(0,'transparent'); vg.addColorStop(1,cfg.glow+'0.15)');
      ctx.fillStyle=vg; ctx.fillRect(0,H*.7,W,H*.3);
      particles.forEach(function(p){
        if(p.kind==='sym'){
          p.fl+=p.fsp; p.x+=p.vx; p.y+=p.vy;
          if(p.x<0||p.x>W) p.vx*=-1;
          if(p.y<0||p.y>H) p.vy*=-1;
          var fal=p.al*(Math.sin(p.fl)*.35+.65);
          ctx.save(); ctx.globalAlpha=fal;
          ctx.font=p.s+'px serif'; ctx.fillStyle=cfg.color;
          ctx.shadowBlur=5; ctx.shadowColor=cfg.color;
          ctx.fillText(p.e,p.x,p.y); ctx.shadowBlur=0;
          ctx.globalAlpha=1; ctx.restore();
        } else if(p.kind==='bubble'){
          p.y+=p.vy; p.ph+=p.sp; p.x+=Math.sin(p.ph)*0.8;
          if(p.y<-30){p.y=H+Math.random()*150;p.x=BR+Math.random()*(W-BR)*0.9;}
          var al2=p.al*(Math.sin(p.ph*2)*.2+.8);
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.strokeStyle=cfg.glow+al2+')'; ctx.lineWidth=1.5;
          ctx.shadowBlur=8; ctx.shadowColor=cfg.color; ctx.stroke(); ctx.shadowBlur=0;
          ctx.fillStyle=cfg.glow+(al2*.4)+')';
          ctx.fillRect(p.x-p.r*.25,p.y-p.r*.25,p.r*.5,p.r*.5);
        } else if(p.kind==='streak'){
          p.x+=p.vx;
          if(p.vx>0&&p.x>W+p.len){p.x=-p.len;p.y=Math.random()*H;}
          if(p.vx<0&&p.x<-p.len){p.x=W+p.len;p.y=Math.random()*H;}
          var g2=ctx.createLinearGradient(p.x,p.y,p.x+p.len*(p.vx>0?1:-1),p.y);
          g2.addColorStop(0,'transparent'); g2.addColorStop(.5,cfg.glow+p.al+')'); g2.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.len*(p.vx>0?1:-1),p.y);
          ctx.strokeStyle=g2; ctx.lineWidth=p.w;
          ctx.shadowBlur=8; ctx.shadowColor=cfg.color; ctx.stroke(); ctx.shadowBlur=0;
        } else if(p.kind==='pixel'){
          p.ph+=p.sp;
          var pal=p.al*(Math.sin(p.ph)*.5+.5);
          ctx.save(); ctx.globalAlpha=pal;
          ctx.fillStyle=cfg.color;
          ctx.shadowBlur=10; ctx.shadowColor=cfg.color;
          ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
          ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.restore();
        }
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }

  // -- JUICE / GAME FEEL -------------------------------------------
  else if (cfg.type === 'juice') {
    function hexToRgb(hex) {
      var r=parseInt(hex.slice(1,3),16);
      var g=parseInt(hex.slice(3,5),16);
      var b=parseInt(hex.slice(5,7),16);
      return r+','+g+','+b;
    }
    var particles = [];
    var juiceColors = ['#c084fc','#f0abfc','#00d4ff','#facc15','#f87171','#4ade80','#fb923c','#60a5fa'];

    // Explosions de particules sur les bords
    for(var i=0;i<60;i++){
      var pd=bpEdge();
      var col=juiceColors[Math.floor(Math.random()*juiceColors.length)];
      particles.push({kind:'burst',
        x:pd.x, y:pd.y,
        vx:(Math.random()-.5)*2.5, vy:(Math.random()-.5)*2.5,
        r:2+Math.random()*5, life:Math.random(), decay:0.008+Math.random()*0.012,
        col:col, shape:Math.random()>.5?'circle':'square', size:4+Math.random()*10
      });
    }
    // Particules rebondissantes (squash & stretch)
    for(var i=0;i<20;i++){
      var pd2=bpSide();
      particles.push({kind:'bounce',
        x:pd2.x, y:pd2.y,
        vx:(Math.random()-.5)*3, vy:-2-Math.random()*4,
        vy0:0, gravity:0.12,
        scaleX:1, scaleY:1, squash:0,
        col:juiceColors[Math.floor(Math.random()*juiceColors.length)],
        size:8+Math.random()*14
      });
    }
    // Stars qui clignotent sur les bords
    for(var i=0;i<35;i++){
      var pe=bpEdge();
      particles.push({kind:'star',
        x:pe.x, y:pe.y,
        ph:Math.random()*Math.PI*2, sp:0.04+Math.random()*0.08,
        r:3+Math.random()*6,
        col:juiceColors[Math.floor(Math.random()*juiceColors.length)]
      });
    }

    var flashTimer = 0;
    var hitStop = 0;

    var draw=function(){
      ctx.clearRect(0,0,W,H); drawBorderFrame(ctx,W,H,cfg.color,0.45); t+=.01;

      // Flash edge aleatoire (hitstop simule)
      flashTimer -= 1;
      if(Math.random()<0.008){ flashTimer=4; hitStop=4; }
      if(flashTimer>0){
        ctx.save();
        ctx.fillStyle='rgba(192,132,252,0.04)';
        ctx.fillRect(0,0,W,H);
        ctx.restore();
      }

      // Halos multi-couleurs sur les bords
      juiceColors.slice(0,4).forEach(function(col,idx){
        var sg;
        var angle = t*0.5 + idx*Math.PI/2;
        if(idx===0) sg=ctx.createLinearGradient(0,0,BL,0);
        else if(idx===1) sg=ctx.createLinearGradient(W,0,BR,0);
        else if(idx===2) sg=ctx.createLinearGradient(0,0,0,BT);
        else sg=ctx.createLinearGradient(0,H,0,BB);
        var al=(Math.sin(angle)*.15+.15);
        var rgb=hexToRgb(col);
        sg.addColorStop(0,'rgba('+rgb+','+al+')');
        sg.addColorStop(1,'transparent');
        ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
      });

      particles.forEach(function(p){
        if(p.kind==='burst'){
          if(hitStop>0){hitStop--;return;}
          p.life -= p.decay;
          if(p.life<=0){
            var pd=bpEdge();
            p.x=pd.x; p.y=pd.y;
            p.life=0.8+Math.random()*0.4;
            p.col=juiceColors[Math.floor(Math.random()*juiceColors.length)];
            p.vx=(Math.random()-.5)*2.5; p.vy=(Math.random()-.5)*2.5;
          }
          p.x+=p.vx; p.y+=p.vy;
          ctx.save(); ctx.globalAlpha=p.life;
          ctx.fillStyle=p.col;
          ctx.shadowBlur=8; ctx.shadowColor=p.col;
          if(p.shape==='circle'){
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill();
          } else {
            var s=p.size*p.life; ctx.fillRect(p.x-s/2,p.y-s/2,s,s);
          }
          ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.restore();

        } else if(p.kind==='bounce'){
          p.x+=p.vx; p.y+=p.vy; p.vy+=p.gravity;
          // Rebond sur les bords
          var inBorder=(p.x<BL||p.x>BR||p.y<BT||p.y>BB);
          if(!inBorder){ p.x=Math.random()<.5?Math.random()*BL:BR+Math.random()*(W-BR); }
          if(p.y>H-10){p.y=H-10;p.vy*=-0.7;p.scaleX=1.4;p.scaleY=0.6;}
          else{p.scaleX+=(1-p.scaleX)*0.15;p.scaleY+=(1-p.scaleY)*0.15;}
          if(p.y<0){p.vy=Math.abs(p.vy);}
          ctx.save(); ctx.globalAlpha=0.9;
          ctx.translate(p.x,p.y); ctx.scale(p.scaleX,p.scaleY);
          ctx.fillStyle=p.col;
          ctx.shadowBlur=12; ctx.shadowColor=p.col;
          ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
          ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.restore();

        } else if(p.kind==='star'){
          p.ph+=p.sp;
          var sal=Math.pow(Math.sin(p.ph),2)*0.9;
          ctx.save(); ctx.globalAlpha=sal;
          ctx.fillStyle=p.col;
          ctx.shadowBlur=12; ctx.shadowColor=p.col;
          // Etoile 4 branches
          ctx.translate(p.x,p.y); ctx.rotate(p.ph);
          ctx.beginPath();
          for(var a=0;a<8;a++){
            var r2=a%2===0?p.r:p.r*0.4;
            var ang=a*Math.PI/4;
            a===0?ctx.moveTo(r2*Math.cos(ang),r2*Math.sin(ang)):ctx.lineTo(r2*Math.cos(ang),r2*Math.sin(ang));
          }
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.restore();
        }
      });
      _fxRaf=requestAnimationFrame(draw);
    }; draw();
  }
}



window.addEventListener('resize', function() {
  if (_fxCanvas) { _fxCanvas.width = window.innerWidth; _fxCanvas.height = window.innerHeight; }
});

function stopFx() {
  if (_fxRaf) { cancelAnimationFrame(_fxRaf); _fxRaf = null; }
  if (_fxCanvas) {
    var ctx = _fxCanvas.getContext('2d');
    ctx.clearRect(0,0,_fxCanvas.width,_fxCanvas.height);
    _fxCanvas.style.display = 'none';
  }
}

/* == SYSTEME AUDIO - Sons UI + Ambiances synthetisees par projet == */

var _ambCtx = null;
var _ambNodes = [];
var _ambLoop = null;
var _ambMuted = false;
var _ambGain = null;
var _ambCurrentId = null;

// Protect AudioContext from non-finite values globally
var _safeGain = function(g, v) {
  try { if(isFinite(v)) g.gain.value = v; } catch(e){}
};

function _ambInit() {
  if (_ambCtx) return;
  _ambCtx = new (window.AudioContext || window.webkitAudioContext)();
  _ambGain = _ambCtx.createGain();
  _ambGain.gain.value = 0;
  // Limiteur : evite la saturation quand on remonte le volume des ambiances rehaussees
  var _lim = _ambCtx.createDynamicsCompressor();
  _lim.threshold.value = -8; _lim.knee.value = 4; _lim.ratio.value = 20; _lim.attack.value = 0.003; _lim.release.value = 0.2;
  _ambGain.connect(_lim); _lim.connect(_ambCtx.destination);
}

function _ambStop() {
  clearTimeout(_ambLoop);
  _ambNodes.forEach(function(n){ try{ if(n && typeof n.stop==='function') n.stop(); }catch(e){} });
  // Arret immediat des elements audio HTML
  if (_ambNodes._dracEl) {
    var el = _ambNodes._dracEl;
    try { el.pause(); el.currentTime=0; el.src = ''; } catch(e){}
    try { if(el.parentNode) el.parentNode.removeChild(el); } catch(e){}
    _ambNodes._dracEl = null;
    _ambNodes._dracToken = null;
  }
  if (_ambNodes._cityEl) {
    var cel = _ambNodes._cityEl;
    try { cel.pause(); cel.currentTime=0; cel.src = ''; } catch(e){}
    try { if(cel.parentNode) cel.parentNode.removeChild(cel); } catch(e){}
    _ambNodes._cityEl = null;
    _ambNodes._cityToken = null;
  }
  if (_ambNodes._towerEl) {
    var tel = _ambNodes._towerEl;
    try { tel.pause(); tel.currentTime=0; tel.src = ''; } catch(e){}
    try { if(tel.parentNode) tel.parentNode.removeChild(tel); } catch(e){}
    _ambNodes._towerEl = null;
    _ambNodes._towerToken = null; // invalide tout tryPlay en cours
  }
  _ambNodes = [];
  _ambCurrentId = null;
  if (_ambGain && _ambCtx) {
    try {
      var now = _ambCtx.currentTime;
      if (!isFinite(now)) return;
      _ambGain.gain.cancelScheduledValues(now);
      var cur = _ambGain.gain.value;
      if (!isFinite(cur) || isNaN(cur)) cur = 0.001;
      _ambGain.gain.setValueAtTime(Math.max(0.001, cur), now);
      _ambGain.gain.linearRampToValueAtTime(0.001, now + 1.0);
    } catch(e) {}
  }
}

function _ambFadeIn() {
  try {
    var now = _ambCtx.currentTime;
    if (!isFinite(now)) return;
    _ambGain.gain.cancelScheduledValues(now);
    _ambGain.gain.setValueAtTime(0.001, now);
    _ambGain.gain.linearRampToValueAtTime((_ambMuted || (typeof _audio !== 'undefined' && _audio.muted)) ? 0.001 : Math.max(0.001, _ambGainTarget()), now + 2.0);
  } catch(e) { console.warn('ambFadeIn error:', e); }
}

// Cree un oscillateur permanent
function _osc(type, freq, gainVal) {
  var o = _ambCtx.createOscillator();
  var g = _ambCtx.createGain();
  o.type = type; o.frequency.value = freq; g.gain.value = gainVal;
  o.connect(g); g.connect(_ambGain); o.start();
  _ambNodes.push(o);
  return { osc: o, gain: g };
}

// Cree un filtre
function _filter(src, type, freq, q) {
  var f = _ambCtx.createBiquadFilter();
  f.type = type; f.frequency.value = freq; if(q) f.Q.value = q;
  src.connect(f); f.connect(_ambGain);
  return f;
}

// Note ponctuelle avec enveloppe
function _note(freq, type, vol, attack, sustain, release, delay) {
  if (!_ambCtx || !_ambGain) return;
  try {
    var t = _ambCtx.currentTime + (delay||0);
    var safeVol = Math.max(0.001, isFinite(vol) ? vol : 0.05);
    var o = _ambCtx.createOscillator();
    var g = _ambCtx.createGain();
    o.type = type||'sine';
    o.frequency.value = isFinite(freq) ? freq : 440;
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(safeVol, t + attack);
    g.gain.setValueAtTime(safeVol, t + attack + sustain);
    g.gain.exponentialRampToValueAtTime(0.001, t + attack + sustain + release);
    o.connect(g); g.connect(_ambGain);
    o.start(t); o.stop(t + attack + sustain + release + 0.05);
  } catch(e) {}
}

// Noise buffer
function _noise(gainVal, filterFreq, filterType) {
  var buf = _ambCtx.createBuffer(1, _ambCtx.sampleRate * 4, _ambCtx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i=0;i<d.length;i++) d[i] = Math.random()*2-1;
  var src = _ambCtx.createBufferSource();
  var g = _ambCtx.createGain();
  var f = _ambCtx.createBiquadFilter();
  f.type = filterType||'lowpass'; f.frequency.value = filterFreq||400;
  src.buffer = buf; src.loop = true;
  g.gain.value = gainVal;
  src.connect(f); f.connect(g); g.connect(_ambGain);
  src.start(); _ambNodes.push(src);
}

/* == COMPOSITIONS CINEMATIQUES PAR PROJET == */

/* Volume cible des musiques (elements <audio>) : respecte le volume et la sourdine choisis par le visiteur */
function _ambTargetVol() {
  if (_audio.muted) return 0;
  var v = _audio.volume;
  if (v === undefined) { try { var sv = localStorage.getItem('portfolio_volume'); if (sv !== null) v = parseFloat(sv); } catch(e) {} }
  if (v === undefined || isNaN(v)) v = 0.5;
  return 0.45 * (v / 0.5);
}
/* Egalisation : chaque ambiance est calee sur le meme niveau percu (mesure ponderee K, cible -32 dB)
   pour un reglage de volume identique. Valeurs = multiplicateurs du gain de base (0.28). */
var _AMB_TRIM = {unjudged:3.9, priest:0.97, silence:1.12, mira:4.8, entretien:2.45, coaching:1.1, streaming:2.26, juiceup:2.3, musiques:1.6};
function _ambGainTarget() {
  var v = _audio.volume;
  if (v === undefined) { try { var sv = localStorage.getItem('portfolio_volume'); if (sv !== null) v = parseFloat(sv); } catch(e) {} }
  if (v === undefined || isNaN(v)) v = 0.5;
  return 0.28 * (v / 0.5) * (_AMB_TRIM[_ambCurrentId] || 1);
}
function _ambElVol(a) { return Math.min(1, _ambTargetVol() * (a._k || 1)); }
function _ambFadeEl(a, stillValid) {
  var v = 0, fi = setInterval(function() {
    if (!stillValid()) { clearInterval(fi); return; }
    var t = _ambTargetVol() * (a._k || 1);
    v = Math.min(v + 0.018, t); a.volume = v;
    if (v >= t) clearInterval(fi);
  }, 60);
}

var _AMBIENCES = {

  unjudged: function() {
    var ctx=_ambCtx, out=_ambGain;

    // -- Bruit de nature / foret filtree (tres bas, chaleureux) --
    var wb=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate);
    var wd=wb.getChannelData(0);
    for(var i=0;i<wd.length;i++) wd[i]=(Math.random()*2-1)*0.004;
    var ws=ctx.createBufferSource();
    // Double filtre passe-bas pour supprimer TOUT le haut spectre
    var f1=ctx.createBiquadFilter(), f2=ctx.createBiquadFilter();
    f1.type='lowpass'; f1.frequency.value=280;
    f2.type='lowpass'; f2.frequency.value=220;
    var wg=ctx.createGain(); wg.gain.value=1.2;
    ws.buffer=wb; ws.loop=true;
    ws.connect(f1); f1.connect(f2); f2.connect(wg); wg.connect(out);
    ws.start(); _ambNodes.push(ws);

    // -- Drone grave et chaleureux - fondation --
    [[65.4,0.018],[98,0.012],[130.8,0.008]].forEach(function(p){
      var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      f.type='lowpass'; f.frequency.value=400;
      o.type='sine'; o.frequency.value=p[0];
      // Gain fixe - pas de LFO sur le gain (evite les NaN)
      g.gain.value=p[1];
      o.connect(f); f.connect(g); g.connect(out); o.start(); _ambNodes.push(o);
    });

    // -- Clochettes tres douces - uniquement dans le registre moyen-grave --
    // Notes : Sol3(392), La3(440), Si3(493), Re4(587) - pas de frequences aigues
    var bells=[392, 440, 493.9, 587.3, 349.2, 523.2];
    function bell(){
      if(_ambCurrentId!=='unjudged') return;
      var f=bells[Math.floor(Math.random()*bells.length)];
      var o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
      flt.type='lowpass'; flt.frequency.value=800; // Coupe tout ce qui est au-dessus de 800Hz
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0.028, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+4.5);
      o.connect(flt); flt.connect(g); g.connect(out);
      o.start(); o.stop(ctx.currentTime+4.6);
      _ambLoop=setTimeout(bell, 1400+Math.random()*2800);
    }
    bell();

    // -- Pad de cordes tres doux - chaleur grave --
    [[196,0.009],[261.6,0.006],[293.7,0.005]].forEach(function(f){
      var o=ctx.createOscillator(),g=ctx.createGain(),fl=ctx.createBiquadFilter();
      fl.type='lowpass'; fl.frequency.value=500;
      o.type='triangle'; o.frequency.value=f; g.gain.value=0;
      // Swell tres lent
      g.gain.setValueAtTime(0,ctx.currentTime);
      g.gain.linearRampToValueAtTime(f===196?0.009:f===261.6?0.006:0.005, ctx.currentTime+4);
      o.connect(fl); fl.connect(g); g.connect(out); o.start(); _ambNodes.push(o);
    });
  },

  priest: function() {
    /* Cassette hantee : nappe dissonante qui ondule, souffle de bande, coeur qui s'accelere, cloche lointaine, boite a musique desaccordee */
    var ctx=_ambCtx,out=_ambGain,tok=(window._pxTok=(window._pxTok||0)+1);
    function alive(){ return _ambCurrentId==='priest' && tok===window._pxTok; }
    function later(fn,a,b){ setTimeout(function(){ if(alive()) fn(); },a+Math.random()*(b-a)); }
    function osc(type,f,dest,gain){ var o=ctx.createOscillator(),g=ctx.createGain(); o.type=type; o.frequency.value=f; g.gain.value=gain; o.connect(g); g.connect(dest); o.start(); _ambNodes.push(o); return o; }
    function lfo(f,depth,param){ var o=ctx.createOscillator(),g=ctx.createGain(); o.frequency.value=f; g.gain.value=depth; o.connect(g); g.connect(param); o.start(); _ambNodes.push(o); }
    // -- nappe grave : trois dents de scie desaccordees (seconde mineure et triton), filtre qui respire, pitch qui flotte comme une vieille bande
    var dflt=ctx.createBiquadFilter(); dflt.type='lowpass'; dflt.frequency.value=230; dflt.Q.value=2; dflt.connect(out);
    lfo(0.06,110,dflt.frequency);
    [55,58.27,77.78].forEach(function(f,i){ var o=osc('sawtooth',f,dflt,0.05); lfo(0.5+i*0.17,9,o.detune); });
    osc('sine',36.7,out,0.09);
    // -- voix lointaines : deux sinus legerement desaccordes dans un filtre de voyelle, qui gonflent et retombent
    var vf=ctx.createBiquadFilter(); vf.type='bandpass'; vf.frequency.value=700; vf.Q.value=5; var vg=ctx.createGain(); vg.gain.value=0.012; vf.connect(vg); vg.connect(out);
    lfo(0.045,0.011,vg.gain); lfo(0.03,260,vf.frequency);
    [220,233.1,261.6].forEach(function(f){ osc('sawtooth',f,vf,0.5); });
    // -- souffle de bande + grondement
    var nb=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate), nd=nb.getChannelData(0); for(var i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
    function noiseSrc(type,freq,gain,q){ var s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(); s.buffer=nb; s.loop=true; f.type=type; f.frequency.value=freq; if(q) f.Q.value=q; g.gain.value=gain; s.connect(f); f.connect(g); g.connect(out); s.start(); _ambNodes.push(s); }
    noiseSrc('highpass',4200,0.007); noiseSrc('bandpass',130,0.035,0.4);
    // -- coeur : s'accelere quand le visiteur descend dans la page
    function heart(){
      if(!alive()) return;
      var m=document.getElementById('pm-priest'), p=0; if(m){ var mx=m.scrollHeight-m.clientHeight; p=mx>0?Math.min(1,m.scrollTop/mx):0; }
      var t=ctx.currentTime, vol=0.26+p*0.1;
      [[t,55,vol],[t+0.16-p*0.05,46,vol*1.1]].forEach(function(b){ var o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(b[1],b[0]); o.frequency.exponentialRampToValueAtTime(28,b[0]+0.12); g.gain.setValueAtTime(b[2],b[0]); g.gain.exponentialRampToValueAtTime(0.001,b[0]+0.2); o.connect(g); g.connect(out); o.start(b[0]); o.stop(b[0]+0.22); });
      setTimeout(heart,(1500-p*800)+Math.random()*120);
    }
    heart();
    // -- cloche lointaine, inharmonique
    function bell(){
      var t=ctx.currentTime, base=[174.6,185,164.8][Math.floor(Math.random()*3)], lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2200; lp.connect(out);
      [[1,1],[2.0,.6],[2.76,.45],[5.4,.25],[8.9,.12]].forEach(function(r){ var o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=base*r[0]; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.045*r[1],t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+7/r[0]+1.5); o.connect(g); g.connect(lp); o.start(t); o.stop(t+9); });
      later(bell,24000,42000);
    }
    later(bell,6000,12000);
    // -- boite a musique desaccordee : une berceuse qui deraille
    function box(){
      var t=ctx.currentTime, notes=[659.25,587.33,523.25,587.33,659.25,659.25,659.25], n=4+Math.floor(Math.random()*4), lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3200; lp.connect(out);
      for(var i=0;i<n;i++){
        var f=notes[i]*Math.pow(2,(Math.random()*30-18)/1200), tt=t+i*0.52+(i>3?Math.random()*0.12:0), o=ctx.createOscillator(),g=ctx.createGain(), o2=ctx.createOscillator();
        o.type='sine'; o.frequency.value=f; o2.type='triangle'; o2.frequency.value=f*2.01; g.gain.setValueAtTime(0.0001,tt); g.gain.exponentialRampToValueAtTime(0.04,tt+0.008); g.gain.exponentialRampToValueAtTime(0.0001,tt+0.9);
        o.connect(g); o2.connect(g); g.connect(lp); o.start(tt); o2.start(tt); o.stop(tt+1); o2.stop(tt+1);
      }
      later(box,20000,38000);
    }
    later(box,9000,16000);
    // -- souffle a l'envers : une vague de bruit qui monte et se coupe net
    function breath(){
      var t=ctx.currentTime, s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(); s.buffer=nb; s.loop=true; f.type='bandpass'; f.Q.value=1.5; f.frequency.setValueAtTime(500,t); f.frequency.exponentialRampToValueAtTime(2600,t+2.4);
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.06,t+2.3); g.gain.setValueAtTime(0.0001,t+2.35);
      s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t+2.5);
      later(breath,18000,34000);
    }
    later(breath,12000,20000);
    // -- coups sourds et grincements
    function knock(){
      var t=ctx.currentTime, k=1+Math.floor(Math.random()*3);
      for(var i=0;i<k;i++){ var o=ctx.createOscillator(),g=ctx.createGain(),tt=t+i*(0.35+Math.random()*0.2); o.type='sine'; o.frequency.setValueAtTime(95,tt); o.frequency.exponentialRampToValueAtTime(40,tt+0.1); g.gain.setValueAtTime(0.3,tt); g.gain.exponentialRampToValueAtTime(0.001,tt+0.25); o.connect(g); g.connect(out); o.start(tt); o.stop(tt+0.3); }
      later(knock,26000,55000);
    }
    later(knock,15000,30000);
    function creak(){
      var t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      f.type='bandpass'; f.frequency.value=200+Math.random()*300; f.Q.value=2; o.type='sawtooth'; o.frequency.setValueAtTime(150+Math.random()*200,t); o.frequency.linearRampToValueAtTime(110+Math.random()*120,t+1);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.03,t+0.2); g.gain.exponentialRampToValueAtTime(0.001,t+1.1);
      o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t+1.2);
      later(creak,7000,17000);
    }
    later(creak,4000,9000);
    function whisper(){
      var wb=ctx.createBuffer(1,ctx.sampleRate*0.6,ctx.sampleRate), wd=wb.getChannelData(0);
      for(var j=0;j<wd.length;j++) wd[j]=(Math.random()*2-1)*Math.sin(Math.PI*j/wd.length)*Math.exp(-j/(ctx.sampleRate*0.2));
      var ws=ctx.createBufferSource(),wg=ctx.createGain(),wf=ctx.createBiquadFilter(),pn=ctx.createStereoPanner?ctx.createStereoPanner():null;
      wf.type='bandpass'; wf.frequency.value=3000; wf.Q.value=0.8; wg.gain.value=0.05; ws.buffer=wb; ws.connect(wf); wf.connect(wg);
      if(pn){ pn.pan.value=Math.random()*2-1; wg.connect(pn); pn.connect(out); } else wg.connect(out);
      ws.start();
      later(whisper,9000,22000);
    }
    later(whisper,7000,14000);
  },

  city: function() {
    if (_ambNodes._cityEl) {
      var old = _ambNodes._cityEl;
      try { old.pause(); old.currentTime=0; old.src=''; } catch(e){}
      try { if(old.parentNode) old.parentNode.removeChild(old); } catch(e){}
      _ambNodes._cityEl = null;
    }
    var a = document.createElement('audio');
    a.loop = true; a.preload = 'auto'; a.volume = 0; a._k = 0.18; // niveau cale sur les autres ambiances
    document.body.appendChild(a);
    _ambNodes._cityEl = a;
    var token = {};
    _ambNodes._cityToken = token;
    var urls = [
      'assets/audio/cityrider.mp3',
      'https://mollymo31.github.io/Portfolio_Leo_Lussan/assets/audio/cityrider.mp3'
    ];
    var tried = 0;
    function doFade() {
      _ambFadeEl(a, function(){ return _ambNodes._cityToken===token && _ambNodes._cityEl; });
    }
    function tryPlay() {
      if (_ambNodes._cityToken !== token) return;
      if (tried >= urls.length) return;
      a.src = urls[tried]; a.load();
      var p = a.play();
      if (p && p.then) {
        p.then(function() {
          if (_ambNodes._cityToken !== token) { a.pause(); return; }
          doFade();
        }).catch(function(e) {
          tried++;
          setTimeout(tryPlay, 300);
        });
      } else {
        doFade();
      }
    }
    setTimeout(tryPlay, 100);
  },

  tower: function() {
    // Stop net de tout audio en cours
    if (_ambNodes._towerEl) {
      var old = _ambNodes._towerEl;
      try { old.pause(); old.currentTime=0; old.src=''; } catch(e){}
      try { if(old.parentNode) old.parentNode.removeChild(old); } catch(e){}
      _ambNodes._towerEl = null;
    }

    var a = document.createElement('audio');
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0; a._k = 0.53; // niveau cale sur les autres ambiances
    document.body.appendChild(a);
    _ambNodes._towerEl = a;

    // Token de session - invalide les tryPlay anterieurs
    var token = {};
    _ambNodes._towerToken = token;

    var urls = [
      'assets/audio/towerdefense.mp3',
      'https://mollymo31.github.io/Portfolio_Leo_Lussan/assets/audio/towerdefense.mp3'
    ];
    var tried = 0;
    function tryPlay() {
      // Si le token a change, cette session est annulee
      if (_ambNodes._towerToken !== token) return;
      if (tried >= urls.length) return;
      a.src = urls[tried];
      a.load();
      var p = a.play();
      if (p && p.then) {
        p.then(function() {
          if (_ambNodes._towerToken !== token) { a.pause(); return; }
          _ambFadeEl(a, function(){ return _ambNodes._towerToken===token && _ambNodes._towerEl; });
        }).catch(function(){ tried++; setTimeout(tryPlay,200); });
      } else {
        _ambFadeEl(a, function(){ return _ambNodes._towerToken===token && _ambNodes._towerEl; });
      }
    }
    setTimeout(tryPlay, 50);
  },

  silence: function() {
    var ctx=_ambCtx,out=_ambGain;
    
    // Drone infrasonique ultra-grave et oppressant
    var sub=ctx.createOscillator(),sg=ctx.createGain();
    sub.type='sine';sub.frequency.value=19;sg.gain.value=0.18;
    sub.connect(sg);sg.connect(out);sub.start();_ambNodes.push(sub);
    
    // Deuxième drone grave (27Hz) pour l'effet "battement" créant une tension
    var sub2=ctx.createOscillator(),sg2=ctx.createGain();
    sub2.type='sine';sub2.frequency.value=27;sg2.gain.value=0.14;
    sub2.connect(sg2);sg2.connect(out);sub2.start();_ambNodes.push(sub2);
    
    // Bruit blanc fortement filtré - effet de "vide urbain"
    var noiseBuf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*8),ctx.sampleRate);
    var noiseData=noiseBuf.getChannelData(0);
    for(var i=0;i<noiseData.length;i++) noiseData[i]=(Math.random()*2-1)*0.003;
    var noiseSource=ctx.createBufferSource();
    var noiseLowpass=ctx.createBiquadFilter();
    noiseLowpass.type='lowpass';
    noiseLowpass.frequency.value=150;
    var notchFilter=ctx.createBiquadFilter();
    notchFilter.type='notch';
    notchFilter.frequency.value=60;
    notchFilter.Q.value=8;
    var noiseGain=ctx.createGain();
    noiseGain.gain.value=0.35;
    noiseSource.buffer=noiseBuf;
    noiseSource.loop=true;
    noiseSource.connect(noiseLowpass);
    noiseLowpass.connect(notchFilter);
    notchFilter.connect(noiseGain);
    noiseGain.connect(out);
    noiseSource.start();
    _ambNodes.push(noiseSource);
    
    // Pad évanescent grave très sombre
    [[88,0.028],[73.4,0.022],[110,0.018]].forEach(function(p){
      var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      f.type='lowpass';f.frequency.value=420;
      o.type='sine';o.frequency.value=p[0];g.gain.value=p[1];
      o.connect(f);f.connect(g);g.connect(out);o.start();_ambNodes.push(o);
    });
    
    // Bruit de vent étouffé (buffers courts avec decay exponentiel)
    function windGust(){
      if(_ambCurrentId!=='silence')return;
      var wb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.4),ctx.sampleRate);
      var wd=wb.getChannelData(0);
      for(var j=0;j<wd.length;j++){
        var env=Math.exp(-4*j/wd.length);
        wd[j]=(Math.random()*2-1)*0.0012*env;
      }
      var ws=ctx.createBufferSource(),wf=ctx.createBiquadFilter(),wg=ctx.createGain();
      wf.type='lowpass';wf.frequency.value=280;
      wg.gain.value=0.24;
      ws.buffer=wb;ws.connect(wf);wf.connect(wg);wg.connect(out);ws.start();
      _ambLoop=setTimeout(windGust,8000+Math.random()*12000);
    }
    windGust();
    
    // Sons évanescents lointains - très grave et triste
    function distantEcho(){
      if(_ambCurrentId!=='silence')return;
      var freq=32+Math.random()*45;
      var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      f.type='lowpass';f.frequency.value=320;o.type='sine';
      o.frequency.setValueAtTime(freq,ctx.currentTime);
      o.frequency.linearRampToValueAtTime(freq*0.4,ctx.currentTime+5.2);
      g.gain.setValueAtTime(0.001,ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.045,ctx.currentTime+1.5);
      g.gain.linearRampToValueAtTime(0.001,ctx.currentTime+6.2);
      o.connect(f);f.connect(g);g.connect(out);o.start();o.stop(ctx.currentTime+6.3);
      _ambLoop=setTimeout(distantEcho,9000+Math.random()*11000);
    }
    distantEcho();
    
    // Glitch/stutter sombre périodique
    function stutter(){
      if(_ambCurrentId!=='silence')return;
      var sb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.14),ctx.sampleRate);
      var sd=sb.getChannelData(0);
      for(var j=0;j<sd.length;j++){
        sd[j]=(Math.random()*2-1)*Math.exp(-2*j/sd.length)*0.001;
      }
      var ss=ctx.createBufferSource(),sf=ctx.createBiquadFilter(),sg3=ctx.createGain();
      sf.type='lowpass';sf.frequency.value=240;
      sg3.gain.value=0.13;
      ss.buffer=sb;ss.connect(sf);sf.connect(sg3);sg3.connect(out);ss.start();
      _ambLoop=setTimeout(stutter,11000+Math.random()*9000);
    }
    stutter();
  },

  draconium: function() {
    // Stop net de tout audio en cours
    if (_ambNodes._dracEl) {
      var old = _ambNodes._dracEl;
      try { old.pause(); old.currentTime=0; old.src=''; } catch(e){}
      try { if(old.parentNode) old.parentNode.removeChild(old); } catch(e){}
      _ambNodes._dracEl = null;
    }
    var a = document.createElement('audio');
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0; a._k = 0.25; // niveau cale sur les autres ambiances
    document.body.appendChild(a);
    _ambNodes._dracEl = a;

    // Token de session - invalide les tryPlay anterieurs
    var token = {};
    _ambNodes._dracToken = token;

    var urls = ['assets/audio/medieval.mp3','https://mollymo31.github.io/Portfolio_Leo_Lussan/assets/audio/medieval.mp3'];
    var tried = 0;
    function tryPlay() {
      if (_ambNodes._dracToken !== token) return;
      if (tried >= urls.length) return;
      a.src = urls[tried];
      a.load();
      var p = a.play();
      if (p && p.then) {
        p.then(function() {
          if (_ambNodes._dracToken !== token) { a.pause(); return; }
          _ambFadeEl(a, function(){ return _ambNodes._dracToken===token && _ambNodes._dracEl; });
        }).catch(function(){ tried++; setTimeout(tryPlay,200); });
      } else {
        _ambFadeEl(a, function(){ return _ambNodes._dracToken===token && _ambNodes._dracEl; });
      }
    }
    setTimeout(tryPlay, 50);
  },

  musiques: function() {
    var ctx=_ambCtx,out=_ambGain;
    [220,277.2,329.6,415.3].forEach(function(f){
      var o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
      flt.type='lowpass';flt.frequency.value=1600;o.type='sawtooth';o.frequency.value=f;g.gain.value=0.026;
      var vib=ctx.createOscillator(),vg=ctx.createGain();
      vib.frequency.value=0.22;vg.gain.value=1.8;vib.connect(vg);vg.connect(o.frequency);vib.start();_ambNodes.push(vib);
      o.connect(flt);flt.connect(g);g.connect(out);o.start();_ambNodes.push(o);
    });
    function kick(){
      if(_ambCurrentId!=='musiques')return;
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(180,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(42,ctx.currentTime+0.2);
      g.gain.setValueAtTime(0.22,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.28);
      o.connect(g);g.connect(out);o.start();o.stop(ctx.currentTime+0.3);
      setTimeout(kick,500);
    }
    kick();
    var ht2=0;
    function hat2(){
      if(_ambCurrentId!=='musiques')return;
      ht2++;
      var open=ht2%4===0;
      var hb=ctx.createBuffer(1,ctx.sampleRate*(open?0.18:0.04),ctx.sampleRate);
      var hd=hb.getChannelData(0);
      for(var j=0;j<hd.length;j++)hd[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*(open?0.06:0.014)));
      var hs=ctx.createBufferSource(),hg=ctx.createGain(),hf=ctx.createBiquadFilter();
      hf.type='highpass';hf.frequency.value=10000;hg.gain.value=0.04;hs.buffer=hb;
      hs.connect(hf);hf.connect(hg);hg.connect(out);hs.start();
      setTimeout(hat2,250);
    }
    hat2();
    var bSeq=[55,55,73.4,82.4,55,55,82.4,73.4];
    var bii=0;
    function mBass(){
      if(_ambCurrentId!=='musiques')return;
      var f=bSeq[bii%bSeq.length];bii++;
      var o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
      flt.type='lowpass';flt.frequency.value=480;flt.Q.value=2.5;o.type='sawtooth';o.frequency.value=f;
      g.gain.setValueAtTime(0.18,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.46);
      o.connect(flt);flt.connect(g);g.connect(out);o.start();o.stop(ctx.currentTime+0.5);
      setTimeout(mBass,500);
    }
    mBass();
  },
};

_AMBIENCES.mira = function() {
    var ctx=_ambCtx, out=_ambGain;
    var wb=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate);
    var wd=wb.getChannelData(0);
    for(var i=0;i<wd.length;i++) wd[i]=(Math.random()*2-1)*0.003;
    var ws=ctx.createBufferSource(),wf=ctx.createBiquadFilter(),wg=ctx.createGain();
    wf.type='lowpass'; wf.frequency.value=300; wg.gain.value=1.0;
    ws.buffer=wb; ws.loop=true; ws.connect(wf); wf.connect(wg); wg.connect(out); ws.start(); _ambNodes.push(ws);
    [[73.4,0.015],[110,0.010],[146.8,0.007]].forEach(function(p){
      var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      f.type='lowpass'; f.frequency.value=500; o.type='sine'; o.frequency.value=p[0]; g.gain.value=p[1];
      o.connect(f); f.connect(g); g.connect(out); o.start(); _ambNodes.push(o);
    });
    var notes=[261.6,329.6,392,523.2,392,329.6,261.6,220];
    var ni=0;
    function playNote(){
      if(_ambCurrentId!=='mira') return;
      var f=notes[ni%notes.length]; ni++;
      var o=ctx.createOscillator(),g=ctx.createGain(),fl=ctx.createBiquadFilter();
      fl.type='lowpass'; fl.frequency.value=900;
      o.type='triangle'; o.frequency.value=f;
      g.gain.setValueAtTime(0.035,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+3.5);
      o.connect(fl); fl.connect(g); g.connect(out); o.start(); o.stop(ctx.currentTime+3.6);
      _ambLoop=setTimeout(playNote,1800+Math.random()*2200);
    }
    playNote();
  };
/* Entretien d'embauche : valse de cirque en la mineur, orgue de barbarie un peu faux */
_AMBIENCES.entretien = function() {
  var ctx=_ambCtx, out=_ambGain, bpm=138, beat=60/bpm, n=0, next=ctx.currentTime+0.2;
  var A=55, F=function(semi){ return A*Math.pow(2,semi/12); };
  // progression : Am Am E7 Am | Dm Am E7 Am  (racine, accord)
  var BASS=[0,0,-5,0,5,0,-5,0], CH=[[12,15,19],[12,15,19],[11,15,18],[12,15,19],[17,21,24],[12,15,19],[11,15,18],[12,15,19]];
  // melodie (une note par temps, 3 temps par mesure, 8 mesures) en demi-tons au-dessus de A3
  var MEL=[24,27,31, 29,27,24, 23,26,29, 28,24,24, 29,33,36, 33,29,27, 26,23,26, 24,24,-1];
  function env(g,t,peak,att,dur){ g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(peak,t+att); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); }
  function tone(t,type,freq,peak,dur,cut,att,detune){ var o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(); o.type=type; o.frequency.value=freq; if(detune) o.detune.value=detune; f.type='lowpass'; f.frequency.value=cut||2000; env(g,t,peak,att||0.01,dur); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t+dur+0.05); }
  function schedule(){
    if(_ambCurrentId!=='entretien') return;
    while(next<ctx.currentTime+0.6){
      var bar=Math.floor(n/3)%8, b=n%3, t=next, mi=(Math.floor(n/3)%8)*3+b;
      if(b===0){ tone(t,'triangle',F(BASS[bar]),0.32,beat*0.9,500,0.01); }
      else { CH[bar].forEach(function(s){ tone(t,'square',F(s),0.05,beat*0.45,1400,0.005); }); }
      var m=MEL[mi]; if(m>=0){ tone(t,'sawtooth',F(m),0.07,beat*0.95,2600,0.03,(mi%2?9:-9)); tone(t,'sine',F(m+12),0.025,beat*0.9,3000,0.04,14); }
      n++; next+=beat;
    }
    _ambLoop=setTimeout(schedule,120);
  }
  schedule();
};

/* Coaching : boucle synthetique motivante (la ligne precedente pointait vers une ambiance inexistante, d'ou le silence) */
_AMBIENCES.coaching = function() {
  var ctx=_ambCtx, out=_ambGain, bpm=104, step=60/bpm/4, n=0, next=ctx.currentTime+0.15;
  var nb=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.25),ctx.sampleRate), nd=nb.getChannelData(0);
  for(var i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
  // Am - F - C - G
  var ROOT=[55,43.65,65.41,49], CH=[[220,261.63,329.63,440],[174.61,220,261.63,349.23],[261.63,329.63,392,523.25],[196,246.94,293.66,392]];
  function env(g,t,peak,dur){ g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(peak,t+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); }
  function kick(t){ var o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(42,t+0.14); env(g,t,0.55,0.28); o.connect(g); g.connect(out); o.start(t); o.stop(t+0.3); }
  function noise(t,type,freq,peak,dur,q){ var s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(); s.buffer=nb; f.type=type; f.frequency.value=freq; if(q) f.Q.value=q; env(g,t,peak,dur); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t+dur+0.02); }
  function tone(t,type,freq,peak,dur,cut){ var o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(); o.type=type; o.frequency.value=freq; f.type='lowpass'; f.frequency.value=cut||2400; env(g,t,peak,dur); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t+dur+0.02); }
  function schedule(){
    if(_ambCurrentId!=='coaching') return;
    while(next<ctx.currentTime+0.5){
      var s=n%16, bar=Math.floor(n/16)%4, t=next;
      if(s%4===0) kick(t);
      if(s===4||s===12) noise(t,'bandpass',1900,0.22,0.16,0.9);
      if(s%2===1) noise(t,'highpass',7500,0.07,0.05);
      if([0,3,6,8,11,14].indexOf(s)!==-1) tone(t,'sawtooth',ROOT[bar]*(s===8||s===14?2:1),0.2,step*2.2,420);
      var arp=CH[bar][[0,1,2,3,2,1,2,3][s%8]]; tone(t,'triangle',arp,s%2===0?0.075:0.05,step*1.6,3200);
      if(s===0){ CH[bar].forEach(function(f){ tone(t,'sine',f/2,0.035,step*15.5,900); }); }
      n++; next+=step;
    }
    _ambLoop=setTimeout(schedule,120);
  }
  schedule();
};
_AMBIENCES.streaming = function() {
    var ctx=_ambCtx, out=_ambGain;
    // Ambiance lofi streaming - pad doux + basse subtile
    [[110,0.022],[138.6,0.016],[165,0.012]].forEach(function(p){
      var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      f.type='lowpass'; f.frequency.value=600; o.type='triangle'; o.frequency.value=p[0]; g.gain.value=p[1];
      var vib=ctx.createOscillator(),vg=ctx.createGain();
      vib.frequency.value=0.18; vg.gain.value=1.2; vib.connect(vg); vg.connect(o.frequency); vib.start(); _ambNodes.push(vib);
      o.connect(f); f.connect(g); g.connect(out); o.start(); _ambNodes.push(o);
    });
    // Kick lofi lent
    function kick(){
      if(_ambCurrentId!=='streaming') return;
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(120,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(35,ctx.currentTime+0.25);
      g.gain.setValueAtTime(0.18,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
      o.connect(g); g.connect(out); o.start(); o.stop(ctx.currentTime+0.32);
      setTimeout(kick,750);
    }
    kick();
    // Hi-hat doux
    var ht=0;
    function hat(){
      if(_ambCurrentId!=='streaming') return;
      ht++;
      var hb=ctx.createBuffer(1,ctx.sampleRate*0.06,ctx.sampleRate);
      var hd=hb.getChannelData(0);
      for(var j=0;j<hd.length;j++) hd[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*0.018));
      var hs=ctx.createBufferSource(),hg=ctx.createGain(),hf=ctx.createBiquadFilter();
      hf.type='highpass'; hf.frequency.value=8000; hg.gain.value=ht%2===0?0.025:0.012;
      hs.buffer=hb; hs.connect(hf); hf.connect(hg); hg.connect(out); hs.start();
      setTimeout(hat,375);
    }
    hat();
    // Basse rythmique lofi
    var bSeq=[110,110,82.4,98,110,82.4,110,98];
    var bi=0;
    function bass(){
      if(_ambCurrentId!=='streaming') return;
      var f=bSeq[bi%bSeq.length]; bi++;
      var o=ctx.createOscillator(),g=ctx.createGain(),fl=ctx.createBiquadFilter();
      fl.type='lowpass'; fl.frequency.value=400; o.type='sawtooth'; o.frequency.value=f;
      g.gain.setValueAtTime(0.12,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.55);
      o.connect(fl); fl.connect(g); g.connect(out); o.start(); o.stop(ctx.currentTime+0.6);
      setTimeout(bass,750);
    }
    bass();
  };
_AMBIENCES.juiceup = function() {
  /* Boucle pop joyeuse et chaude : kick doux, clap, shaker, basse ronde, accords et petite melodie pentatonique */
  var ctx=_ambCtx, out=_ambGain, tok=(window._jxTok=(window._jxTok||0)+1);
  var step=(60/104)/2, next=ctx.currentTime+0.12, n=0;
  var chords=[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];
  var roots=[65.41,55,43.65,49];
  var mel=[
    [[0,659.25],[3,783.99],[5,659.25],[6,587.33]],
    [[0,523.25],[2,659.25],[4,783.99],[7,659.25]],
    [[0,523.25],[3,587.33],[5,659.25],[6,523.25]],
    [[0,587.33],[2,783.99],[4,880],[6,783.99]]
  ];
  var noiseBuf=ctx.createBuffer(1,ctx.sampleRate*0.2,ctx.sampleRate), nd=noiseBuf.getChannelData(0);
  for(var i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
  function tone(type,f,t,dur,vol,lp){
    var o=ctx.createOscillator(), g=ctx.createGain(), d=g;
    o.type=type; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    if(lp){ var fl=ctx.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=lp; o.connect(fl); fl.connect(g); } else o.connect(g);
    g.connect(out); o.start(t); o.stop(t+dur+0.05);
  }
  function noise(t,dur,vol,type,freq){
    var s=ctx.createBufferSource(), fl=ctx.createBiquadFilter(), g=ctx.createGain();
    s.buffer=noiseBuf; fl.type=type; fl.frequency.value=freq;
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(fl); fl.connect(g); g.connect(out); s.start(t); s.stop(t+dur+0.02);
  }
  function kick(t){
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(130,t); o.frequency.exponentialRampToValueAtTime(42,t+0.1);
    g.gain.setValueAtTime(0.34,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
    o.connect(g); g.connect(out); o.start(t); o.stop(t+0.25);
  }
  function play(k,t){
    var bar=Math.floor(k/8)%4, s=k%8, ch=chords[bar];
    if(s===0||s===4||(s===7&&bar%2===1)) kick(t);
    if(s===2||s===6) noise(t,0.11,0.09,'bandpass',1900);
    noise(t,0.035,s%2?0.035:0.02,'highpass',7000);
    if(s===0||s===3||s===6) tone('triangle',roots[bar]*2,t,0.28,0.2,500);
    if(s===1||s===5) ch.forEach(function(f){ tone('triangle',f,t,0.2,0.045,2400); });
    mel[bar].forEach(function(m){ if(m[0]===s){ tone('sine',m[1],t,0.34,0.075); tone('triangle',m[1]*2,t,0.12,0.012); } });
  }
  (function sched(){
    if(_ambCurrentId!=='juiceup'||tok!==window._jxTok) return;
    while(next<ctx.currentTime+0.45){ play(n,next); next+=step; n++; }
    setTimeout(sched,120);
  })();
};


/* Contexte audio partage pour les sons d'interface : un seul, cree a la demande (en creer un par clic finit par etre refuse par le navigateur) */
var _uiAudioCtx = null;
function _uiCtx() {
  var c = _ambCtx;
  if (!c) { if (!_uiAudioCtx) _uiAudioCtx = new (window.AudioContext||window.webkitAudioContext)(); c = _uiAudioCtx; }
  if (c.state === 'suspended' && c.resume) c.resume();
  return c;
}

/* == API publique == */
var _audio = {
  muted: false,
  init: function() {},
  startAmbient: function(id) {
    _ambInit();
    if (_ambCtx.state === 'suspended') _ambCtx.resume();
    _ambStop();
    _ambCurrentId = id;
    setTimeout(function() {
      if (_ambCurrentId !== id) return;
      _ambFadeIn();
      try { if (_AMBIENCES[id]) _AMBIENCES[id](); } catch(e) { console.warn('Ambient error for '+id, e); }
    }, 200);
  },
  stopAmbient: function() {
    _ambStop();
  },
  toggle: function() {
    this.muted = !this.muted;
    var vol = this.muted ? 0 : (this.volume !== undefined ? this.volume : 0.5);
    // Mute Web Audio API
    if (_ambGain) _ambGain.gain.value = this.muted ? 0 : _ambGainTarget();
    // Mute elements HTML audio (tower + draco)
    ['_towerEl','_dracEl','_cityEl'].forEach(function(k) {
      if (_ambNodes[k]) _ambNodes[k].volume = this.muted ? 0 : _ambElVol(_ambNodes[k]);
    }.bind(this));
    var btn = document.getElementById('audio-btn');
    if (btn) btn.textContent = this.muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
    var slider = document.getElementById('volume-slider');
    if (slider) slider.disabled = this.muted;
    if (slider) slider.style.opacity = this.muted ? '.35' : '1';
  },
  setVolume: function(val) {
    this.volume = val;
    try { localStorage.setItem('portfolio_volume', val); } catch(e) {}
    if (this.muted) return;
    // Web Audio API
    if (_ambGain) _ambGain.gain.value = _ambGainTarget();
    // HTML audio elements
    ['_towerEl','_dracEl','_cityEl'].forEach(function(k) {
      if (_ambNodes[k]) _ambNodes[k].volume = _ambElVol(_ambNodes[k]);
    });
  },
  playClick: function() {
    if (this.muted) return;
    try {
      var ctx = _uiCtx();
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine'; o.frequency.setValueAtTime(720,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(320,ctx.currentTime+.12);
      g.gain.setValueAtTime(.15,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.14);
      o.start(); o.stop(ctx.currentTime+.15);
    } catch(e){}
  },
  playHover: function() {
    if (this.muted) return;
    try {
      var ctx = _uiCtx();
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine'; o.frequency.value=540;
      g.gain.setValueAtTime(.045,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.08);
      o.start(); o.stop(ctx.currentTime+.09);
    } catch(e){}
  },
  playModalOpen: function() {
    if (this.muted) return;
    try {
      var ctx = _uiCtx();
      [220,330,440,550].forEach(function(f,i){
        var o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='sine'; o.frequency.value=f;
        g.gain.setValueAtTime(0,ctx.currentTime+i*.04);
        g.gain.linearRampToValueAtTime(.07,ctx.currentTime+i*.04+.02);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.04+.2);
        o.start(ctx.currentTime+i*.04); o.stop(ctx.currentTime+i*.04+.22);
      });
    } catch(e){}
  },
  playModalClose: function() {
    if (this.muted) return;
    try {
      var ctx = _uiCtx();
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sine';
      o.frequency.setValueAtTime(440,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(110,ctx.currentTime+.18);
      g.gain.setValueAtTime(.08,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.2);
      o.start(); o.stop(ctx.currentTime+.22);
    } catch(e){}
  },
};

// Panneau volume - visible seulement quand un projet est ouvert
(function() {
  // Conteneur principal
  var panel = document.createElement('div');
  panel.id = 'audio-panel';
  panel.style.cssText = [
    'position:fixed','bottom:2rem','right:2rem','z-index:9999',
    'display:none','flex-direction:column','align-items:center','gap:.4rem',
    'background:rgba(10,10,10,.95)','backdrop-filter:blur(10px)',
    'border:2px solid rgba(200,169,110,.5)','padding:.6rem .7rem',
    'box-shadow:0 0 18px rgba(200,169,110,.2)'
  ].join(';');

  // Bouton mute
  var btn = document.createElement('button');
  btn.id = 'audio-btn';
  btn.textContent = '\uD83D\uDD0A';
  btn.title = 'Couper / activer le son';
  btn.style.cssText = [
    'background:none','border:none','color:#c8a96e',
    'font-size:1.1rem','cursor:pointer','width:36px','height:36px',
    'display:flex','align-items:center','justify-content:center',
    'transition:all .2s','border-radius:0'
  ].join(';');
  btn.addEventListener('mouseenter',function(){this.style.color='#fff';});
  btn.addEventListener('mouseleave',function(){this.style.color='#c8a96e';});
  btn.addEventListener('click',function(){ _ambInit(); _audio.toggle(); });

  // Slider volume
  var slider = document.createElement('input');
  slider.id = 'volume-slider';
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1';
  slider.step = '0.02';
  slider.value = '0.5';
  slider.title = 'Volume';
  slider.style.cssText = [
    '-webkit-appearance:none','appearance:none',
    'width:80px','height:3px','border-radius:0',
    'background:rgba(200,169,110,.3)','outline:none',
    'cursor:pointer','transition:opacity .2s'
  ].join(';');
  slider.addEventListener('input', function() {
    _ambInit();
    var val = parseFloat(this.value);
    if (val > 0 && _audio.muted) {
      _audio.muted = false;
      btn.textContent = '\uD83D\uDD0A';
    }
    _audio.setVolume(val);
    if (val === 0) {
      _audio.muted = true;
      btn.textContent = '\uD83D\uDD07';
    }
  });

  // Label volume
  var label = document.createElement('div');
  label.style.cssText = 'font-family:Space Mono,monospace;font-size:.45rem;color:rgba(200,169,110,.6);letter-spacing:.1em;text-transform:uppercase';
  label.textContent = 'VOL';

  // Assemblage
  panel.appendChild(btn);
  panel.appendChild(slider);
  panel.appendChild(label);
  // Restore saved volume
  try {
    var savedVol = localStorage.getItem('portfolio_volume');
    if (savedVol !== null) {
      var vol = parseFloat(savedVol);
      slider.value = vol;
      _audio.volume = vol;
    }
  } catch(e) {}

  document.body.appendChild(panel);

  // Auto-demarrer le son au premier clic utilisateur sur la page
  var _audioStarted = false;
  document.addEventListener('click', function() {
    if (_audioStarted) return;
    _audioStarted = true;
    // Si un modal est ouvert, demarrer l'ambiance
    var openModal = document.querySelector('.proj-modal-overlay.open');
    if (openModal) {
      _ambInit();
      var id = openModal.id.replace('pm-', '');
      _audio.startAmbient(id);
    }
  }, { once: false });
})();

// Bouton mute visible uniquement quand un projet est ouvert
(function(){
  var btn=document.getElementById('audio-panel');
  if(btn){ btn.style.display='none'; }
})();

// Sons UI au clic / hover
// Son clic désactivé pour performance
// Sons hover désactivés pour performance
// var _hoverT;



/* == EFFETS D'INTERACTION GLOBAUX == */
(function(){
  // Ripple effect désactivé pour performance
  var style = document.createElement('style');
  style.textContent='@keyframes ripple-out{from{transform:scale(0);opacity:.8}to{transform:scale(2.5);opacity:0}}';
  document.head.appendChild(style);

  // Magnetic effect désactivé pour performance

  // Skill card tilt désactivé pour performance
})();


/* == PROJECT MODALS == */
function openProj(id){
  document.getElementById('pm-'+id).classList.add('open');
  document.body.style.overflow='hidden';
  document.body.classList.add('modal-open');
  initCar(id);
  _audio.init();
  _audio.playModalOpen();
  var btn=document.getElementById('audio-panel');
  if(btn) btn.style.display='flex';
  // Afficher le selecteur de langue dans le modal
  var mlb=document.getElementById('modal-lang-bar');
  if(mlb){
    mlb.style.display='flex';
    // Sync etat actif avec la langue courante
    ['fr','en'].forEach(function(l){
      var b=document.getElementById('mlang-'+l);
      if(b) b.style.opacity=(_currentLang===l)?'1':'.35';
    });
  }
  // Le travail lourd (canvas, musique) attend la fin de l'animation d'ouverture pour ne pas la faire saccader
  var _op=document.getElementById('pm-'+id), _still=function(){ return _op.classList.contains('open'); };
  setTimeout(function(){ if(_still()) drawIso(id); }, 80);
  setTimeout(function(){ if(_still()) _audio.startAmbient(id); }, 350);
  setTimeout(function(){ if(_still()) startFx(id); }, 650);
}
function closeProj(id){
  document.getElementById('pm-'+id).classList.remove('open');
  [].forEach.call(document.querySelectorAll('#pm-'+id+' iframe.mira-yt'),function(f){ f.src=f.src; });
  document.body.style.overflow='';
  document.body.classList.remove('modal-open');
  stopFx();
  _audio.playModalClose();
  _audio.stopAmbient();
  var btn=document.getElementById('audio-panel');
  if(btn) btn.style.display='none';
  var mlb=document.getElementById('modal-lang-bar');
  if(mlb) mlb.style.display='none';
}

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    document.querySelectorAll('.proj-modal-overlay.open,.skill-modal-overlay.open').forEach(function(o){
      var id = o.id ? o.id.replace('pm-','').replace('sm-','') : null;
      o.classList.remove('open'); document.body.style.overflow=''; document.body.classList.remove('modal-open');
      stopFx();
      _audio.stopAmbient();
      var btn=document.getElementById('audio-panel');
      if(btn) btn.style.display='none';
    });
  }
});

/* == AUDIO FEEDBACK ON INTERACTIONS == */
(function(){
  // Hover feedback sur les project rows
  document.querySelectorAll('.project-row,.sel-item,.sel-go').forEach(function(el){
    el.addEventListener('mouseenter',function(){ _audio.playHover(); });
    el.addEventListener('click',function(){ _audio.playClick(); });
  });
  
  // Hover feedback sur les skill cards
  document.querySelectorAll('.skill-card').forEach(function(el){
    el.addEventListener('mouseenter',function(){ _audio.playHover(); });
    el.addEventListener('click',function(){ _audio.playClick(); });
  });
  
  // Hover sur les nav links
  document.querySelectorAll('.nav-links a').forEach(function(el){
    el.addEventListener('mouseenter',function(){ _audio.playHover(); });
    el.addEventListener('click',function(){ _audio.playClick(); el.classList.remove('nav-pop'); void el.offsetWidth; el.classList.add('nav-pop'); });
  });
  
  // CTA button
  var ctaBtn=document.querySelector('.nav-cta');
  if(ctaBtn){
    ctaBtn.addEventListener('mouseenter',function(){ _audio.playHover(); });
    ctaBtn.addEventListener('click',function(){ _audio.playClick(); });
  }
})();

/* == CAROUSELS == */
var CS={};
/* Carrousel : la piste glisse par transform (fluide meme en cliquant vite).
   Si tous les slides ne contiennent qu'une image, la hauteur s'adapte a l'image affichee. */
function carFit(id){
  var t=document.getElementById('ct-'+id),s=CS[id];
  if(!t||!s||!s.adapt)return;
  var sl=t.children[s.cur],h=sl&&sl.offsetHeight;
  if(h)t.style.height=h+'px';
}
function initCar(id){
  var t=document.getElementById('ct-'+id);if(!t)return;
  if(CS[id]){carFit(id);return;}
  var slides=t.querySelectorAll('.carousel-slide');
  var d=document.getElementById('cd-'+id);if(!d)return;
  var adapt=Array.prototype.every.call(slides,function(sl){return sl.children.length===1&&sl.firstElementChild.tagName==='IMG';});
  CS[id]={cur:0,n:slides.length,adapt:adapt};
  carCap(id);
  if(adapt){
    t.classList.add('car-adapt');
    Array.prototype.forEach.call(t.querySelectorAll('img'),function(im){im.addEventListener('load',function(){carFit(id);});});
    carFit(id);
  }
  d.innerHTML='';
  slides.forEach(function(_,i){
    var dot=document.createElement('div');
    dot.className='carousel-dot'+(i===0?' active':'');
    dot.onclick=function(){return carTo(id,i);};
    d.appendChild(dot);
  });
  var x0=null;
  t.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
  t.addEventListener('touchend',function(e){
    if(x0===null)return;
    var dx=e.changedTouches[0].clientX-x0;x0=null;
    if(Math.abs(dx)>40)carTo(id,CS[id].cur+(dx<0?1:-1));
  });
}
function carTo(id,i){
  var t=document.getElementById('ct-'+id),s=CS[id];if(!t||!s)return;
  s.cur=Math.max(0,Math.min(s.n-1,i));
  t.style.setProperty('--car-i',s.cur);
  carFit(id);
  document.querySelectorAll('#cd-'+id+' .carousel-dot').forEach(function(d,j){return d.classList.toggle('active',j===s.cur);});
  carCap(id);
}
/* Legende sous le carrousel : reprend le texte alt de l'image affichee */
function carCap(id){
  var cap=document.getElementById('cc-'+id),t=document.getElementById('ct-'+id),s=CS[id];if(!cap||!t||!s)return;
  var im=t.querySelectorAll('.carousel-slide')[s.cur];im=im&&im.querySelector('img');cap.textContent=im?im.alt:'';
}
new MutationObserver(function(){for(var id in CS)carCap(id);}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
function carNav(id,dir){var s=CS[id];if(s)carTo(id,s.cur+dir)}
window.addEventListener('resize',function(){for(var id in CS)carFit(id);});

/* == ISO MAP RENDERER == */
var ISO={
  // Unjudged - jardin paradisiaque, verdure, lumiere
  unjudged:{p:['#1a2e1e','#2d5a35','#4a8c55','#6bbf78','#a8e6b5','#0d1f11'],
    m:[[1,1,1,1,1,1,2,1,1,1],[1,0,0,0,0,0,0,0,0,1],[1,0,3,0,4,0,4,0,3,1],[1,0,0,0,0,0,0,0,0,1],[1,0,3,0,0,0,0,0,3,1],[1,0,0,4,0,0,4,0,0,1],[1,1,1,1,1,1,1,1,1,1]]},
  // Devouring Priest - pierre, sang, ruines
  priest:{p:['#1a0308','#3d0a12','#6b1020','#8b0000','#cc2233','#0f0205'],
    m:[[1,0,1,1,1,1,1,0,1],[1,0,0,2,0,2,0,0,1],[0,0,3,0,0,0,3,0,0],[1,0,0,0,4,0,0,0,1],[1,0,3,0,0,0,3,0,1],[1,1,0,0,2,0,0,1,1]]},
  // City Rider - ville neon cyberpunk
  city:{p:['#0a0a1a','#1a1a3a','#2a2a5a','#00d4ff','#a78bfa','#1e1e4a'],
    m:[
      [3,2,1,1,1,1,1,2,3],
      [3,2,1,3,2,3,1,2,3],
      [1,1,1,1,4,1,1,1,1],
      [2,2,1,2,2,2,1,3,2],
      [3,2,1,1,4,1,1,2,3],
      [1,1,1,1,1,1,1,1,1],
      [2,3,1,2,2,2,1,2,3],
      [3,2,1,3,2,3,1,2,2],
    ]},
  // Tower Defense - Panique Vegetale : cloture, etang, champignon, chemin pierres
  // Palette : herbe verte, pierre grise, eau, bois, champignon rouge
  // Types: 0=vide, 1=herbe, 2=herbe haute, 3=pierre/rocher, 4=eau, 5=cloture bois
  tower:{p:['#1a3a08','#2e6b14','#4a9e22','#7ec850','#c8f080','#0d1f04'],
    m:[
      [5,5,5,5,5,5,5,5,5,5,5,5],
      [5,1,1,2,1,1,1,2,1,4,4,5],
      [5,1,1,1,1,3,1,1,1,4,4,5],
      [5,2,3,1,1,1,1,1,2,1,1,5],
      [5,1,1,1,3,1,3,1,1,1,2,5],
      [5,1,3,1,1,2,1,1,3,1,1,5],
      [5,2,1,1,2,1,2,1,1,1,3,5],
      [5,1,1,3,1,1,1,2,1,1,1,5],
      [5,5,5,5,5,5,5,5,5,5,5,5],
    ]},
  // Mira - blocs Minecraft, herbe, hub
  mira:{p:['#0a1f0c','#154020','#206030','#2e8f48','#4dbf66','#061008'],
    m:[[0,0,1,1,1,1,1,0,0],[0,1,2,2,2,2,2,1,0],[1,2,3,3,4,3,3,2,1],[1,2,3,4,3,4,3,2,1],[1,2,3,3,4,3,3,2,1],[0,1,2,2,2,2,2,1,0],[0,0,1,1,1,1,1,0,0]]},
};

function drawIso(projId){
  var cv=document.getElementById('iso-'+projId);if(!cv)return;
  var cfg=ISO[projId];if(!cfg)return;
  var ctx=cv.getContext('2d');
  var W=cv.offsetWidth||cv.width,H=cv.height;
  cv.width=W;
  ctx.clearRect(0,0,W,H);
  var map=cfg.m,pal=cfg.p;
  var rows=map.length,cols=map[0].length;
  var TW=Math.min(52,Math.floor(W/(cols+3)));
  var TH=TW*.5;
  var offX=W/2,offY=H*.25;
  // Heights per type: 0=empty,1=grass,2=tall grass,3=rock,4=water,5=fence
  var hs=[0,TH*.4,TH*1.2,TH*1.8,TH*.1,TH*2.8];
  // Special palettes per type
  var CP=projId==='city'?{1:{top:'#1a1a2e',right:'#0f0f1a',left:'#080810'},2:{top:'#1e3a5a',right:'#142a42',left:'#0e1e2e'},3:{top:'#2a1a5a',right:'#1a1040',left:'#120c2e'},4:{top:'#00d4ff',right:'#0090bb',left:'#006080'}}:null;
  var palettes={
    1:{top:pal[2],right:pal[1],left:pal[0]},
    2:{top:pal[3],right:pal[2],left:pal[1]},
    3:{top:'#8a8a7a',right:'#5a5a50',left:'#3a3a30'},
    4:{top:'#3ab8c8',right:'#1a7888',left:'#0e5060'},
    5:{top:'#8b5e2a',right:'#5a3a16',left:'#3a2508'},
  };
  function iso(r,c){return{x:offX+(c-r)*TW/2,y:offY+(c+r)*TH/2}}
  for(var r=0;r<rows;r++){
    for(var c=0;c<cols;c++){
      var t=map[r][c];if(!t)continue;
      var _d=iso(r,c); var x=_d.x; var y=_d.y;
      var h=hs[t]||TH*.4;
      var p2=(CP&&CP[t])||palettes[t]||palettes[1];
      // top face
      ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x+TW/2,y-h+TH/2);ctx.lineTo(x,y-h+TH);ctx.lineTo(x-TW/2,y-h+TH/2);ctx.closePath();
      ctx.fillStyle=p2.top;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=.5;ctx.stroke();
      // right face
      ctx.beginPath();ctx.moveTo(x+TW/2,y-h+TH/2);ctx.lineTo(x+TW/2,y+TH/2);ctx.lineTo(x,y+TH);ctx.lineTo(x,y-h+TH);ctx.closePath();
      ctx.fillStyle=p2.right;ctx.fill();ctx.stroke();
      // left face
      ctx.beginPath();ctx.moveTo(x-TW/2,y-h+TH/2);ctx.lineTo(x-TW/2,y+TH/2);ctx.lineTo(x,y+TH);ctx.lineTo(x,y-h+TH);ctx.closePath();
      ctx.fillStyle=p2.left;ctx.fill();ctx.stroke();
      // Details pour la cloture (ligne verticale)
      if(t===5){
        ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x,y-h-TH*.8);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+TW/2,y-h+TH/2);ctx.lineTo(x+TW/2,y-h+TH/2-TH*.8);ctx.stroke();
      }
      // Details eau (reflet)
      if(t===4){
        ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=.8;
        ctx.beginPath();ctx.moveTo(x-TW*.15,y-h+TH*.55);ctx.lineTo(x+TW*.15,y-h+TH*.55);ctx.stroke();
      }
    }
  }
  // Champignon au centre-gauche (3D simple)
  var mushr=iso(3,3);
  ctx.beginPath();ctx.ellipse(mushr.x,mushr.y-TH*3.5,TW*.65,TH*.8,0,0,Math.PI*2);
  ctx.fillStyle='#d42020';ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.8;ctx.stroke();
  // Taches blanches
  ctx.fillStyle='rgba(255,255,255,.75)';
  [[-.3,-.15,.18],[.2,-.25,.14],[-.05,-.05,.12]].forEach(function(arr){
    var dx=arr[0],dy=arr[1],r=arr[2];
    ctx.beginPath();ctx.ellipse(mushr.x+dx*TW,mushr.y-TH*3.5+dy*TH,r*TW,r*.6*TH,0,0,Math.PI*2);ctx.fill();
  });
  // Pied champignon
  ctx.fillStyle='#f0e0c0';
  ctx.beginPath();ctx.ellipse(mushr.x,mushr.y-TH*2.2,TW*.18,TH*.55,0,0,Math.PI*2);ctx.fill();
}

/* == BURGER MENU == */
function toggleMenu(){
  var m=document.getElementById('mobile-menu');
  var b=document.getElementById('nav-burger');
  var open=m.style.display==='flex';
  m.style.display=open?'none':'flex';
  b.textContent=open?'\u2630':'\u2715';
}
function closeMenu(){
  document.getElementById('mobile-menu').style.display='none';
  document.getElementById('nav-burger').textContent='\u2630';
}
// Show burger on mobile
(function(){
  function check(){
    var burger=document.getElementById('nav-burger');
    if(!burger)return;
    if(window.innerWidth<=900){burger.style.display='block';}
    else{burger.style.display='none';closeMenu();}
  }
  check();
  window.addEventListener('resize',check);
})();

/* == SCROLL FADE-IN == */
const obs=new IntersectionObserver(es=>{
  es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
},{threshold:.1});
document.querySelectorAll('.fade-in').forEach((el,i)=>{el.style.transitionDelay=(i%5)*.07+'s';obs.observe(el)});

/* == CROSSHAIR - CORNER BRACKETS == */
(function(){
  var dot = document.getElementById('crosshair-dot');
  var ring = document.getElementById('crosshair-ring');
  if(!dot||!ring)return;
  var mouseX=window.innerWidth/2, mouseY=window.innerHeight/2;
  var ringX=mouseX, ringY=mouseY;

  // Le petit carre (dot) suit directement la souris - il DIRIGE
  function place(e){
    mouseX=e.clientX; mouseY=e.clientY;
    dot.style.transform='translate3d('+mouseX+'px,'+mouseY+'px,0) translate(-50%,-50%)';
  }
  // Masque tant que la souris n'est pas dans la page
  document.body.classList.add('ch-out');
  document.addEventListener('mousemove',function(e){
    if(document.body.classList.contains('ch-out')){ringX=e.clientX;ringY=e.clientY;document.body.classList.remove('ch-out');}
    place(e);
  });
  // Souris qui quitte la fenetre (2e ecran) : on masque le curseur du site, il revient a l'entree
  document.documentElement.addEventListener('mouseleave',function(){document.body.classList.add('ch-out');});
  document.documentElement.addEventListener('mouseenter',function(e){ringX=e.clientX;ringY=e.clientY;place(e);document.body.classList.remove('ch-out');});
  // Sur une video integree (YouTube) le navigateur garde son curseur : on masque celui du site pour n'en avoir qu'un
  document.querySelectorAll('iframe').forEach(function(f){
    f.addEventListener('mouseenter',function(){document.body.classList.add('ch-out');});
    f.addEventListener('mouseleave',function(){document.body.classList.remove('ch-out');});
  });

  // Le grand carre (ring) suit avec lag - il SUIT le petit
  function animateRing(){
    ringX+=(mouseX-ringX)*.25; ringY+=(mouseY-ringY)*.25;
    ring.style.transform='translate3d('+ringX+'px,'+ringY+'px,0) translate(-50%,-50%)';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  var sel='a,button,[onclick],.skill-card,.project-row,.sel-item,.sel-go,.sm-project-row,.carousel-btn,.nav-cta,.proj-modal-close,.skill-modal-close,.acc-header,.music-nav-btn,.flip-card-wrapper,.contact-row';
  document.addEventListener('mouseover',function(e){if(e.target.closest(sel))document.body.classList.add('ch-hover')});
  document.addEventListener('mouseout', function(e){if(e.target.closest(sel))document.body.classList.remove('ch-hover')});
})();


/* == CHARGEMENT DIFFERE DU MODULE 3D DE CITY RIDER (three.js r150, ~1 Mo) ==
   Charge apres le chargement de la page, pendant un moment d'inactivite. */
window.loadCity3D=function(cb){
  if(window.initCity3D){if(cb)cb();return;}
  var s=document.getElementById('city3d-module');
  if(!s){
    s=document.createElement('script');s.type='module';s.id='city3d-module';s.src='assets/js/city-3d.js';
    document.body.appendChild(s);
  }
  if(cb)s.addEventListener('load',cb);
};
window.addEventListener('load',function(){
  (window.requestIdleCallback||function(f){setTimeout(f,2000);})(function(){window.loadCity3D();},{timeout:5000});
});

/* == TELECHARGEMENT DES PROJETS (zips publies dans les Releases GitHub) ==
   Les boutons .dl-zip restent caches tant que le fichier n'existe pas sur la release "projets".
   Le poids est lu automatiquement : ajouter ou remplacer un zip sur la release suffit. */
(function(){
  var REPO='MollyMo31/Portfolio_Leo_Lussan', TAG='projets', KEY='dl_assets_v1';
  var btns=[].slice.call(document.querySelectorAll('.dl-zip'));
  if(!btns.length) return;
  function norm(n){return String(n).toLowerCase().replace(/\.zip$/,'').replace(/[^a-z0-9]/g,'');}
  function fmt(b){
    var en=document.documentElement.lang==='en', mb=b/1048576, v, u;
    if(mb>=1024){v=(mb/1024).toFixed(1); u=en?' GB':' Go';}
    else {v=mb>=10?String(Math.round(mb)):mb.toFixed(1); u=en?' MB':' Mo';}
    return (en?v:v.replace('.',','))+u;
  }
  function render(){
    btns.forEach(function(a){
      var n=a.getAttribute('data-bytes'), s=a.querySelector('.dl-size');
      if(n&&s) s.textContent=fmt(+n);
    });
  }
  function apply(list){
    list.forEach(function(x){
      if(!x||typeof x.url!=='string'||x.url.indexOf('https://github.com/')!==0) return;
      btns.forEach(function(a){
        if(norm(a.getAttribute('data-asset'))===norm(x.name)){
          a.href=x.url; a.setAttribute('data-bytes',x.size); a.hidden=false;
        }
      });
    });
    render();
  }
  var cached=null;
  try{cached=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(e){}
  if(cached&&cached.t>Date.now()-600000){ apply(cached.a); }
  else {
    fetch('https://api.github.com/repos/'+REPO+'/releases/tags/'+TAG,{headers:{Accept:'application/vnd.github+json'}})
      .then(function(r){return r.ok?r.json():null;})
      .then(function(j){
        if(!j||!j.assets) return;
        var list=j.assets.map(function(x){return {name:x.name,size:x.size,url:x.browser_download_url};});
        try{sessionStorage.setItem(KEY,JSON.stringify({t:Date.now(),a:list}));}catch(e){}
        apply(list);
      }).catch(function(){});
  }
  // le poids suit la langue (Mo / MB)
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();

/* == PARTICULES AU SURVOL DU BOUTON DE TELECHARGEMENT == */
(function(){
  var btns=[].slice.call(document.querySelectorAll('.dl-zip'));
  if(!btns.length||!window.Element||!Element.prototype.animate) return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var MAX=40;
  function spawn(a){
    if(a.querySelectorAll('.dl-p').length>=MAX) return;
    var w=a.offsetWidth,h=a.offsetHeight,side=Math.random()*(2*w+2*h),x,y,dx,dy;
    // point aleatoire sur le pourtour, direction vers l'exterieur
    if(side<w){x=side;y=0;dx=0;dy=-1;}
    else if(side<w+h){x=w;y=side-w;dx=1;dy=0;}
    else if(side<2*w+h){x=side-w-h;y=h;dx=0;dy=1;}
    else {x=0;y=side-2*w-h;dx=-1;dy=0;}
    var d=10+Math.random()*16, p=document.createElement('i');
    p.className='dl-p';
    p.style.left=(x-1.5)+'px'; p.style.top=(y-1.5)+'px';
    p.style.background=getComputedStyle(a).borderTopColor;
    p.style.boxShadow='0 0 6px '+getComputedStyle(a).borderTopColor;
    var s=(Math.random()<.5?2:3.5); p.style.width=p.style.height=s+'px';
    a.appendChild(p);
    var mx=dx*d+(Math.random()-.5)*(dx?8:d), my=dy*d+(Math.random()-.5)*(dy?8:d);
    var an=p.animate([{transform:'translate(0,0) scale(1)',opacity:.95},{transform:'translate('+mx+'px,'+my+'px) scale(.2)',opacity:0}],
      {duration:650+Math.random()*450,easing:'ease-out'});
    an.onfinish=function(){p.remove();};
  }
  btns.forEach(function(a){
    var t=null;
    a.addEventListener('mouseenter',function(){
      if(t) return;
      spawn(a);spawn(a);
      t=setInterval(function(){spawn(a);spawn(a);},90);
    });
    a.addEventListener('mouseleave',function(){clearInterval(t);t=null;});
  });
})();

/* == COORDONNEES PROTEGEES CONTRE LES BOTS ==
   L'email et le telephone ne sont pas dans le HTML : ils sont reconstruits ici, uniquement quand le
   visiteur passe le bouton sur "Actif". Par defaut : "Cache" (rien a lire ni a selectionner). */
(function(){
  var D={email:'bW9jLmxpYW1nQG5hc3N1bC5vZWw=',phone:'NDIgNjIgNzcgOTYgNyAzMys='};
  function val(k){ try{ return atob(D[k]).split('').reverse().join(''); }catch(e){ return ''; } }
  var active=false, toggles=[];
  function fr(){ return (document.documentElement.lang||'fr')!=='en'; }
  function render(){
    [].forEach.call(document.querySelectorAll('[data-mail]'),function(el){
      if(active){ el.textContent=val(el.getAttribute('data-mail')); el.classList.remove('mail-off'); }
      else{ el.textContent=''; el.classList.add('mail-off'); }
    });
    [].forEach.call(document.querySelectorAll('[data-mail-link]'),function(a){
      if(active) a.setAttribute('href','mailto:'+val('email')); else a.setAttribute('href','#contact');
    });
    toggles.forEach(function(t){
      t.classList.toggle('on',active);
      t.setAttribute('aria-pressed',active?'true':'false');
      t.querySelector('.mt-txt').textContent=active?(fr()?'Actif':'Active'):(fr()?'Caché':'Hidden');
      t.title=fr()?(active?'Cacher mes coordonnées':'Afficher mes coordonnées'):(active?'Hide my contact details':'Show my contact details');
    });
  }
  function set(v){ active=v; render(); }
  // un petit bouton Cache / Actif a cote de chaque coordonnee
  [].forEach.call(document.querySelectorAll('[data-mail="email"]'),function(el){
    var host=el.closest('[data-mail-link]')||el;
    var t=document.createElement('button');
    t.type='button'; t.className='mail-toggle';
    t.innerHTML='<span class="mt-dot"></span><span class="mt-txt"></span>';
    t.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); set(!active); });
    host.parentNode.insertBefore(t,host.nextSibling); toggles.push(t);
    if(host.tagName==='A'&&host.classList.contains('fc-link')){ host.appendChild(t); }
  });
  // liens "mailto" proteges : tant que c'est cache, un clic sur un lien de contact l'active puis ouvre la messagerie
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-mail-link],[data-mail-cta]');
    if(!a) return;
    if(a.hasAttribute('data-mail-cta')){ e.preventDefault(); set(true); window.location.href='mailto:'+val('email'); return; }
    if(!active) e.preventDefault();
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();

/* == SELECTEUR DE PROJETS : survol / clavier pour choisir, clic pour entrer == */
(function(){
  var root=document.getElementById('sel'); if(!root) return;
  var stage=document.getElementById('sel-stage'), items=[].slice.call(root.querySelectorAll('.sel-item')), cur=null;
  [].forEach.call(root.querySelectorAll('.ln'),function(n){ n.setAttribute('pathLength','1'); });
  function select(id,focus){
    if(cur===id) return; cur=id;
    items.forEach(function(it){ var on=it.getAttribute('data-id')===id; it.classList.toggle('active',on); it.setAttribute('aria-selected',on?'true':'false'); if(on){ stage.style.setProperty('--c',it.style.getPropertyValue('--c')); stage.style.setProperty('--c2',it.style.getPropertyValue('--c2')); if(focus) it.focus({preventScroll:true}); } });
    [].forEach.call(stage.querySelectorAll('.sel-info'),function(n){ n.hidden=n.getAttribute('data-id')!==id; });
    [].forEach.call(stage.querySelectorAll('.sel-emblem'),function(n){ n.classList.toggle('on',n.getAttribute('data-id')===id); });
  }
  function open(id,ev){
    var o=document.getElementById('pm-'+id); if(!o) return;
    var x=ev&&ev.clientX, y=ev&&ev.clientY;
    if(!x&&!y){ var r=stage.getBoundingClientRect(); x=r.left+r.width/2; y=r.top+r.height/2; }
    o.style.setProperty('--ox',x+'px'); o.style.setProperty('--oy',y+'px');
    [].forEach.call(o.querySelectorAll('.proj-modal-tags .tag'),function(t,i){ t.style.setProperty('--i',i); });
    openProj(id);
  }
  var canHover=window.matchMedia&&matchMedia('(hover:hover)').matches;
  items.forEach(function(it,i){
    var id=it.getAttribute('data-id');
    // intention de survol : on ne change de projet que si le curseur s'arrete un instant sur la ligne,
    // pour ne pas basculer en traversant la liste vers la scene
    var tm=null;
    it.addEventListener('mouseenter',function(){ if(!canHover) return; clearTimeout(tm); tm=setTimeout(function(){ select(id); },cur===id?0:170); });
    it.addEventListener('mouseleave',function(){ clearTimeout(tm); });
    it.addEventListener('focus',function(){ select(id); });
    it.addEventListener('click',function(e){ if(canHover||cur===id&&!canHover&&false) open(id,e); else select(id); });
    it.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(id,null); }
      else if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); var n=items[i+(e.key==='ArrowDown'?1:-1)]; if(n) n.focus(); }
    });
  });
  [].forEach.call(stage.querySelectorAll('.sel-go'),function(b){ b.addEventListener('click',function(e){ open(b.getAttribute('data-id'),e); }); });
  stage.addEventListener('mousemove',function(e){ var r=stage.getBoundingClientRect(); stage.style.setProperty('--mx',(e.clientX-r.left)+'px'); stage.style.setProperty('--my',(e.clientY-r.top)+'px'); });
  select(items[0].getAttribute('data-id'));
})();

/* == Mira : chasse aux references (lampe torche + clic) == */
(function(){
  var box=document.getElementById('ref-hunt'); if(!box) return;
  var chips=[].slice.call(box.querySelectorAll('.ref-chip')), nEl=box.querySelector('.ref-n');
  function count(){ nEl.textContent=box.querySelectorAll('.ref-chip.found').length; }
  box.addEventListener('mousemove',function(e){
    chips.forEach(function(c){ var r=c.getBoundingClientRect(); c.style.setProperty('--lx',(e.clientX-r.left)+'px'); c.style.setProperty('--ly',(e.clientY-r.top)+'px'); });
  });
  box.addEventListener('mouseleave',function(){ chips.forEach(function(c){ c.style.setProperty('--lx','-999px'); }); });
  chips.forEach(function(c){ c.addEventListener('click',function(){ c.classList.add('found'); count(); }); });
  box.querySelector('.ref-all').addEventListener('click',function(){ chips.forEach(function(c){ c.classList.add('found'); }); count(); });
})();

/* == Streaming : onglets de jeux == */
(function(){
  var root=document.getElementById('pm-streaming'); if(!root) return;
  var tabs=[].slice.call(root.querySelectorAll('.st-tab')), panels=[].slice.call(root.querySelectorAll('.st-panel'));
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      var id=t.getAttribute('data-t');
      tabs.forEach(function(x){ x.classList.toggle('active',x===t); });
      panels.forEach(function(p){ p.hidden=p.getAttribute('data-p')!==id; });
    });
  });
})();

/* == Competences : bascule d'affichage, tableau et mur de logos == */
(function(){
  [].forEach.call(document.querySelectorAll('.wl-open'),function(b){
    b.addEventListener('click',function(){ var id=b.getAttribute('data-go'); if(document.getElementById('pm-'+id)) openProj(id); });
  });
  var USES={unity:['priest','draconium','juiceup'],unreal:['unjudged','city','silence','tower'],inky:['unjudged','silence'],twine:['silence','entretien'],miro:['unjudged','priest','draconium'],adobe:['unjudged','silence','mira'],ldtk:['tower','draconium'],hacknplan:['tower'],git:['unjudged','mira','draconium']};
  var tools=[].slice.call(document.querySelectorAll('.wl-tool')), projs=[].slice.call(document.querySelectorAll('.wl-proj')), pw=document.querySelector('.wl-projs'), tw=document.querySelector('.wl-tools'), st=document.getElementById('wl-status'), panel=document.getElementById('wl-panel'), cur=null;
  function clear(){ cur=null; if(panel){ panel.hidden=true; panel.innerHTML=''; } tools.forEach(function(t){ t.classList.remove('on'); t.setAttribute('aria-pressed','false'); }); projs.forEach(function(p){ p.classList.remove('on','sel'); }); pw.classList.remove('has-sel'); tw.classList.remove('has-sel'); st.textContent=''; }
  function lbl(t){ return t.querySelector('.wl-n').textContent; }
  tools.forEach(function(t){ t.addEventListener('click',function(){
    if(t.classList.contains('on')){ clear(); return; }
    clear(); var id=t.getAttribute('data-tool'), list=USES[id]||[];
    cur=id; showTool(t,id); t.classList.add('on'); t.setAttribute('aria-pressed','true'); tw.classList.add('has-sel'); pw.classList.add('has-sel');
    projs.forEach(function(p){ p.classList.toggle('on',list.indexOf(p.getAttribute('data-proj'))>-1); });
    st.textContent=lbl(t)+' → '+list.length+((document.documentElement.lang==='en')?' project(s) — click one for a preview':' projet(s) — clique sur l\'un d\'eux pour un aperçu');
  }); });
  // un clic sur un projet affiche son apercu ; un second clic revient a la description de l'outil
  [].forEach.call(document.querySelectorAll('.wl-pname'),function(b){ b.addEventListener('click',function(){
    var id=b.getAttribute('data-pick'), pr=b.parentNode, active=pr.classList.contains('is-pick');
    projs.forEach(function(p){ p.classList.remove('is-pick'); });
    if(active){ var t=document.querySelector('.wl-tool.on'); if(t) showTool(t,cur); return; }
    pr.classList.add('is-pick'); showProject(id);
  }); });
  // le contenu du panneau est copie dans la langue du moment : on le referme si la langue change
  new MutationObserver(function(){ clear(); }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function show(node){ panel.innerHTML=''; panel.appendChild(node); panel.hidden=false; }
  function showTool(t,id){
    var src=document.querySelector('#sk-'+id+' .skill-modal-body'); if(!src||!panel) return;
    var d=document.createElement('div'); d.className='wl-tdesc';
    var l=t.querySelector('.vw-logo').cloneNode(true);
    var box=document.createElement('div'); box.className='wl-tbody'; box.innerHTML='<div class="wl-tname">'+t.querySelector('.wl-n').textContent+'</div>'+src.innerHTML;
    d.appendChild(l); d.appendChild(box); show(d);
  }
  function showProject(id){
    var it=document.querySelector('.sel-item[data-id="'+id+'"]'), info=document.querySelector('.sel-info[data-id="'+id+'"]'), em=document.querySelector('.sel-emblem[data-id="'+id+'"]');
    if(!it||!info||!panel) return;
    var d=document.createElement('div'); d.className='wl-prev';
    d.style.setProperty('--c',it.style.getPropertyValue('--c')); d.style.setProperty('--c2',it.style.getPropertyValue('--c2'));
    var art=document.createElement('div'); art.className='wl-prev-art';
    if(em){ var c=em.cloneNode(true); c.classList.add('on'); art.appendChild(c); }
    var body=document.createElement('div'); body.className='wl-prev-body'; body.innerHTML=info.innerHTML;
    var go=body.querySelector('.sel-go'); if(go) go.addEventListener('click',function(){ openProj(id); });
    d.appendChild(art); d.appendChild(body); show(d);
  }
})();

/* == Process : parcours en etapes == */
(function(){
  var root=document.getElementById('ps'); if(!root) return;
  var ns=[].slice.call(root.querySelectorAll('.ps-n')), ps=[].slice.call(root.querySelectorAll('.ps-p'));
  var prev=root.querySelector('.ps-prev'), next=root.querySelector('.ps-next'), bar=root.querySelector('.ps-bar i'), card=root.querySelector('.ps-card'), cur=-1;
  function go(i){
    i=Math.max(0,Math.min(ps.length-1,i)); if(i===cur) return; cur=i;
    ns.forEach(function(n,k){ n.classList.toggle('on',k===i); n.setAttribute('aria-current',k===i?'step':'false'); });
    ps.forEach(function(p,k){ p.hidden=k!==i; });
    card.style.setProperty('--pc',ps[i].style.getPropertyValue('--pc'));
    bar.style.width=((i+1)/ps.length*100)+'%';
    prev.disabled=i===0; next.disabled=i===ps.length-1;
  }
  ns.forEach(function(n,k){ n.addEventListener('click',function(){ go(k); }); });
  prev.addEventListener('click',function(){ go(cur-1); });
  next.addEventListener('click',function(){ go(cur+1); });
  root.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){ go(cur+1); e.preventDefault(); } else if(e.key==='ArrowLeft'){ go(cur-1); e.preventDefault(); }
  });
  go(0);
})();

/* == Process : agrandissement des exemples au clic == */
(function(){
  [].forEach.call(document.querySelectorAll('#process .tl-ex'),function(f){
    function open(){
      var img=f.querySelector('img'), z=document.createElement('div'); z.className='ba-zoom'; var i=document.createElement('img'); i.src=img.src; i.alt=img.alt; z.appendChild(i);
      function close(){ z.remove(); document.removeEventListener('keydown',k); } function k(e){ if(e.key==='Escape') close(); }
      z.addEventListener('click',close); document.addEventListener('keydown',k); document.body.appendChild(z);
    }
    f.addEventListener('click',open); f.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); } });
  });
})();


/* == Pages de projet sur mesure : JuiceUp (jouissif) et Devouring Priest (horreur) == */
(function(){
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = null; // {id, ov, layer, off(), timers, ...}
  function el(tag, cls, parent){ var e=document.createElement(tag); if(cls) e.className=cls; if(parent) parent.appendChild(e); return e; }
  function rnd(a,b){ return a+Math.random()*(b-a); }
  function lang(){ return (typeof _currentLang!=='undefined' && _currentLang==='en') ? 'en' : 'fr'; }
  function snd(fn){ try{ if(typeof _ambCtx!=='undefined' && _ambCtx && _ambGain && !(typeof _audio!=='undefined' && _audio.muted)) fn(_ambCtx,_ambGain); }catch(e){} }

  /* ---------- JuiceUp ---------- */
  function startJuice(ov){
    var layer=el('div','jx-layer',ov), modal=ov.querySelector('.proj-modal'), hero=ov.querySelector('.proj-modal-hero');
    var combo=el('div','jx-combo',layer), count=0, idle=null, last=0, on=true;
    var tg=el('button','jx-toggle',hero); tg.type='button'; tg.setAttribute('aria-pressed','true');
    tg.innerHTML='<span class="jx-tl">JUICE</span><span class="jx-sw"><i></i></span><span class="jx-ts">ON</span>';
    tg.addEventListener('click',function(e){
      e.stopPropagation(); on=!on; ov.classList.toggle('jx-off',!on);
      tg.setAttribute('aria-pressed',on?'true':'false'); tg.querySelector('.jx-ts').textContent=on?'ON':'OFF';
      if(on) burst(e.clientX,e.clientY,26); 
    });
    // titre : lettres qui rebondissent
    var title=hero.querySelector('.proj-modal-title'), letters=[];
    if(title && !title.dataset.jx){
      title.dataset.jx='1';
      [].slice.call(title.childNodes).forEach(function(nd){
        if(nd.nodeType===3){ var f=document.createDocumentFragment(); nd.textContent.split('').forEach(function(ch){ var s=document.createElement('span'); s.className='jx-l'; s.textContent=ch; f.appendChild(s); }); title.replaceChild(f,nd); }
        else if(nd.nodeType===1){ var t=nd.textContent; nd.textContent=''; t.split('').forEach(function(ch){ var s=document.createElement('span'); s.className='jx-l'; s.textContent=ch; nd.appendChild(s); }); }
      });
      [].forEach.call(title.querySelectorAll('.jx-l'),function(l,i){ l.style.setProperty('--i',i); letters.push(l); });
    }
    // apparition au scroll
    var targets=[].slice.call(ov.querySelectorAll('.pm-section-title,.pm-label,.proj-modal-body figure,.proj-modal-body [style*="grid-template-columns"] > div,.proj-modal-body > p'));
    var io=null;
    if('IntersectionObserver' in window){
      io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('jx-in'); io.unobserve(en.target); } }); },{root:ov,threshold:.12});
      targets.forEach(function(t,i){ t.classList.add('jx-rv'); t.style.setProperty('--d',((i%4)*60)+'ms'); io.observe(t); });
    }
    function pop(c){
      snd(function(ctx,out){
        var t=ctx.currentTime, f=420*Math.pow(2,Math.min(c,12)/12*1.0), o=ctx.createOscillator(), g=ctx.createGain();
        o.type='sine'; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*2,t+0.07);
        g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.18,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.16);
        o.connect(g); g.connect(out); o.start(t); o.stop(t+0.2);
        var o2=ctx.createOscillator(), g2=ctx.createGain(); o2.type='triangle'; o2.frequency.setValueAtTime(f*1.5,t); g2.gain.setValueAtTime(0.0001,t); g2.gain.exponentialRampToValueAtTime(0.06,t+0.01); g2.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
        o2.connect(g2); g2.connect(out); o2.start(t); o2.stop(t+0.15);
      });
    }
    var COLS=['#c084fc','#f472b6','#facc15','#4ade80','#38bdf8','#fb923c'];
    function burst(x,y,nb){
      if(RM) return;
      for(var i=0;i<nb;i++){
        var p=el('i','jx-p',layer), a=rnd(0,Math.PI*2), d=rnd(40,150), sz=rnd(5,13);
        p.style.cssText='left:'+x+'px;top:'+y+'px;width:'+sz+'px;height:'+sz+'px;background:'+COLS[i%COLS.length]+';border-radius:'+(i%3?'50%':'2px');
        var an=p.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(calc(-50% + '+Math.cos(a)*d+'px),calc(-50% + '+(Math.sin(a)*d+rnd(10,50))+'px)) scale(0) rotate('+rnd(-240,240)+'deg)',opacity:0}],{duration:rnd(450,800),easing:'cubic-bezier(.12,.8,.3,1)'});
        an.onfinish=(function(q){ return function(){ q.remove(); }; })(p);
      }
    }
    function shake(k){
      if(RM||!modal) return;
      var m=k*6; modal.animate([{transform:'translate(0,0)'},{transform:'translate('+(-m)+'px,'+(m/2)+'px)'},{transform:'translate('+m+'px,'+(-m/2)+'px)'},{transform:'translate('+(-m/2)+'px,0)'},{transform:'translate(0,0)'}],{duration:240,easing:'ease-out'});
    }
    function onClick(e){
      if(!on||e.target.closest('.proj-modal-close,.jx-toggle,#modal-lang-bar')) return;
      var now=Date.now(); count=(now-last<1300)?count+1:1; last=now;
      burst(e.clientX,e.clientY,10+Math.min(count,10)*2); shake(Math.min(1+count/4,3)); pop(count);
      combo.textContent='x'+count; combo.classList.remove('hot'); void combo.offsetWidth; combo.classList.add('hot');
      combo.style.setProperty('--h',Math.min(count*14,200));
      clearTimeout(idle); idle=setTimeout(function(){ count=0; combo.classList.remove('hot'); combo.textContent=''; },1500);
      var c=e.target.closest('.proj-modal-body figure,.proj-modal-body [style*="grid-template-columns"] > div'); 
      if(c && c.animate && !RM) c.animate([{transform:'scale(1)'},{transform:'scale(1.12,.88)'},{transform:'scale(.94,1.08)'},{transform:'scale(1)'}],{duration:380,easing:'ease-out'});
    }
    var lastMove=0;
    function onMove(e){
      if(!on||RM) return; var n=Date.now(); if(n-lastMove<70) return; lastMove=n;
      var p=el('i','jx-s',layer); p.style.cssText='left:'+e.clientX+'px;top:'+e.clientY+'px;background:'+COLS[(n>>6)%COLS.length];
      var an=p.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.9},{transform:'translate(-50%,calc(-50% + 18px)) scale(0)',opacity:0}],{duration:520,easing:'ease-out'}); an.onfinish=function(){ p.remove(); };
    }
    ov.addEventListener('click',onClick); ov.addEventListener('mousemove',onMove);
    ov.classList.add('jx');
    return function(){
      ov.removeEventListener('click',onClick); ov.removeEventListener('mousemove',onMove);
      clearTimeout(idle); if(io) io.disconnect();
      targets.forEach(function(t){ t.classList.remove('jx-rv','jx-in'); t.style.removeProperty('--d'); });
      layer.remove(); tg.remove(); ov.classList.remove('jx','jx-off');
    };
  }

  /* ---------- Devouring Priest : cassette VHS / found footage ---------- */
  function startHorror(ov){
    var layer=el('div','hx-layer',document.body), timers=[], t0=Date.now(), modal=ov.querySelector('.proj-modal');
    el('div','hx-grain',layer); el('div','hx-scan',layer); el('div','hx-vig',layer); var bar=el('div','hx-bar',layer);
    ['tl','tr','bl','br'].forEach(function(c){ el('i','hx-br hx-p'+c,layer); });
    var hud=el('div','hx-hud',layer); hud.innerHTML='<b></b>REC <span class="hx-tc">00:00:00</span>';
    var tc=hud.querySelector('.hx-tc');
    function pad(n){ return (n<10?'0':'')+n; }
    function tick(){ var s=Math.floor((Date.now()-t0)/1000); tc.textContent=pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60); }
    timers.push(setInterval(tick,1000));
    // le coeur s'accelere quand on descend dans la page
    function prog(){ var m=ov.scrollHeight-ov.clientHeight, p=m>0?ov.scrollTop/m:0; layer.style.setProperty('--beat',(1.5-p*0.9).toFixed(2)+'s'); }
    ov.addEventListener('scroll',prog,{passive:true}); prog();
    function later(fn,a,b){ var t=setTimeout(function(){ fn(); later(fn,a,b); },rnd(a,b)); timers.push(t); }
    if(!RM){
      // defaut de bande : barre de tracking + decalage
      later(function(){
        bar.animate([{top:'-12%',opacity:.9},{top:'105%',opacity:.9}],{duration:rnd(500,900),easing:'linear'});
        if(modal) modal.animate([{transform:'translateX(0)'},{transform:'translateX(-7px) skewX(-.6deg)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'translateX(0)'}],{duration:260,easing:'steps(5)'});
        layer.classList.add('hx-tear'); setTimeout(function(){ layer.classList.remove('hx-tear'); },260);
      },6000,13000);
    }
    ov.classList.add('hx');
    return function(){
      ov.removeEventListener('scroll',prog);
      timers.forEach(function(t){ clearTimeout(t); clearInterval(t); }); layer.remove(); ov.classList.remove('hx');
    };
  }

  /* ---------- Draconium : le grimoire, entre le dragon (or) et l'alchimiste (vert acide) ---------- */
  function startDraco(ov){
    var hero=ov.querySelector('.proj-modal-hero'), fx=el('div','dx-fx',hero), layer=el('div','dx-layer',document.body), dead=false, raf=0, mx=.5, timers=[];
    // lumieres de la salle : torche du dragon a gauche, lampe de l'alchimiste a droite, teinte qui vire au vert quand on descend
    el('div','dx-tint',layer); el('div','dx-torch dx-tl',layer); el('div','dx-torch dx-tr',layer); el('div','dx-vig',layer);
    var rail=el('div','dx-rail',layer); var fill=el('i','',rail), tint=layer.querySelector('.dx-tint');
    if(!RM){
      for(var i=0;i<8;i++){ var e=el('i','dx-ember',fx); e.style.cssText='left:'+rnd(2,46)+'%;--s:'+rnd(3,7).toFixed(1)+'px;--d:'+rnd(4,8).toFixed(1)+'s;--w:'+rnd(-24,24).toFixed(0)+'px;animation-delay:'+(-rnd(0,8)).toFixed(1)+'s'; }
      for(var j=0;j<7;j++){ var b=el('i','dx-bubble',fx); b.style.cssText='left:'+rnd(54,98)+'%;--s:'+rnd(6,15).toFixed(0)+'px;--d:'+rnd(5,9).toFixed(1)+'s;--w:'+rnd(-14,14).toFixed(0)+'px;animation-delay:'+(-rnd(0,9)).toFixed(1)+'s'; }
    }
    // progression : la page descend du dragon vers le laboratoire
    function prog(){ var m=ov.scrollHeight-ov.clientHeight, p=m>0?Math.min(1,ov.scrollTop/m):0; fill.style.transform='scaleY('+p.toFixed(3)+')'; tint.style.opacity=(p*.9).toFixed(2); }
    ov.addEventListener('scroll',prog,{passive:true}); prog();
    // apparition des sections, comme un livre qui s'ecrit
    var targets=[].slice.call(ov.querySelectorAll('.pm-section-title,.pm-label,.proj-modal-body > p,.proj-modal-body > div[style*="grid-template-columns"] > div,.proj-modal-body > div[style*="border-left"],.dr-card,.dr-mob,.dr-tl li,.dr-lead,.dr-key')), io=null;
    if('IntersectionObserver' in window && !RM){
      io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('dx-in'); io.unobserve(en.target); } }); },{root:ov,threshold:.1});
      targets.forEach(function(t,i){ t.classList.add('dx-rv'); t.style.setProperty('--d',((i%4)*70)+'ms'); io.observe(t); });
    }
    // souris : lueur du bandeau, logo en parallaxe, braises qui suivent le curseur
    var COL=['#ffd27a','#ff9a2e','#ff6a1a'], GRN=['#c8ff9a','#7bd34a','#a8e87c'], lastM=0;
    function isToxic(t){ var n=t&&t.closest&&t.closest('[class*="dx-"],.proj-modal-body > div,.proj-modal-body strong,.proj-modal-tags .tag'); if(!n) return false; if(n.matches('strong')) return getComputedStyle(n).color.indexOf('123')>=0; var c=getComputedStyle(n).borderLeftColor||''; return c.indexOf('123, 211')>=0||c.indexOf('123,211')>=0||(n.matches('.tag')&&getComputedStyle(n).color.indexOf('168')>=0); }
    function spark(x,y,tox,big){
      if(RM) return; var p=el('i','dx-s',layer), sz=big?rnd(6,12):rnd(3,6), cs=tox?GRN:COL;
      p.style.cssText='left:'+x+'px;top:'+y+'px;width:'+sz+'px;height:'+sz+'px;background:'+cs[Math.floor(Math.random()*cs.length)]+(tox?';border:1px solid rgba(220,255,190,.7)':';box-shadow:0 0 8px #ff8a2a');
      var dx=big?rnd(-70,70):rnd(-14,14), dy=big?rnd(-80,30):rnd(-34,-8);
      var an=p.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.95},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.2)',opacity:0}],{duration:big?rnd(500,850):rnd(500,800),easing:'ease-out'}); an.onfinish=function(){ p.remove(); };
    }
    function mv(e){
      mx=e.clientX/window.innerWidth;
      if(!raf) raf=requestAnimationFrame(function(){ raf=0; hero.style.setProperty('--mx',(mx*100).toFixed(1)+'%'); hero.style.setProperty('--px',((mx-.5)*2).toFixed(2)); });
      var n=Date.now(); if(n-lastM>55){ lastM=n; spark(e.clientX,e.clientY,isToxic(e.target),false); }
    }
    function clk(e){
      if(e.target.closest('.proj-modal-close,#modal-lang-bar,.carousel-btn')) return;
      var tox=isToxic(e.target);
      for(var k=0;k<(tox?12:16);k++) spark(e.clientX,e.clientY,tox,true);
    }
    ov.addEventListener('mousemove',mv); ov.addEventListener('click',clk);
    ov.classList.add('dx');
    return function(){
      dead=true; if(io) io.disconnect(); if(raf) cancelAnimationFrame(raf);
      ov.removeEventListener('mousemove',mv); ov.removeEventListener('click',clk); ov.removeEventListener('scroll',prog);
      targets.forEach(function(t){ t.classList.remove('dx-rv','dx-in'); t.style.removeProperty('--d'); });
      fx.remove(); layer.remove(); hero.style.removeProperty('--mx'); hero.style.removeProperty('--px'); ov.classList.remove('dx');
    };
  }

  /* ---------- Cycle de vie ---------- */
  function stop(){ if(cur){ try{ cur.off(); }catch(e){} cur=null; } }
  var _open=openProj, _close=closeProj;
  openProj=function(id){
    _open(id); stop();
    var ov=document.getElementById('pm-'+id); if(!ov) return;
    try{
      if(id==='juiceup') cur={id:id,ov:ov,off:startJuice(ov)};
      else if(id==='priest') cur={id:id,ov:ov,off:startHorror(ov)};
      else if(id==='draconium') cur={id:id,ov:ov,off:startDraco(ov)};
    }catch(e){ console.warn('page fx',e); }
  };
  closeProj=function(id){ _close(id); if(cur&&cur.id===id) stop(); };
  // fermeture par Echap ou autre : on surveille l'etat du modal
  setInterval(function(){ if(cur && !cur.ov.classList.contains('open')) stop(); },600);
})();

/* Fiche ouverte : on masque la barre de defilement de la page derriere (il ne reste que celle de la fiche) */
(function(){
  function sync(){ document.documentElement.classList.toggle('has-modal', document.body.classList.contains('modal-open')); }
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  sync();
})();
