(function(){
  var _t3d = null;

  function initTower3D() {
    var container = document.getElementById('tower-3d-viewer');
    if (!container || container.dataset.init) return;
    container.dataset.init = '1';
    var W = container.clientWidth, H = container.clientHeight || 420;

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x87CEAA, 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = 'grab';

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEAA);
    scene.fog = new THREE.FogExp2(0x87CEAA, 0.015);

    var camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 200);

    // Eclairage Phong - lumiere ambiante moderee + directionnelle forte
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    var sun = new THREE.DirectionalLight(0xFFF8E0, 3.0);
    sun.position.set(10, 20, 8);
    sun.castShadow = true;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -25;
    sun.shadow.camera.right = sun.shadow.camera.top = 25;
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0xCCEEFF, 0.8);
    fill.position.set(-8, 5, -10);
    scene.add(fill);

    // Couleurs par nom de materiau (fallback si texture absente)
    var MAT_COLORS = {
      'sol':           0x4DB860,
      'herbe_M':       0x55CC70,
      'herbe':         0x4DB860,
      'eauarroisoir_M':0x3AB8C8,
      'M_Water_Ocean': 0x3AB8C8,
      'nenuphard_M':   0x2A7830,
      'roseau4_M':     0x2D7A3A,
      'dalles2_M':     0x8A8870,
      'pot_M':         0xC06040,
      'pneu_M':        0x222222,
      'arrosoir4pot_M':0x888888,
      'arrosoir4bec_M':0x999999,
      'arrosoir4anse_M':0x777777,
      'rateau_M':      0x8B5E2A,
      'parapluie_M':   0xE84040,
      'parapluie_M_2': 0xCC3030,
      'fleur_sol':     0xFFEEAA,
      'chardon_M':     0x8844AA,
      'DefaultMaterial':0x88BB66,
      'WorldGridMaterial':null,
    };

    function getColor(matName) {
      if (!matName) return null;
      var n = matName.toLowerCase();
      for (var k in MAT_COLORS) {
        if (n === k.toLowerCase()) return MAT_COLORS[k];
      }
      // Fallback par mot-cle
      if (n.indexOf('herbe')!==-1) return 0x55CC70;
      if (n.indexOf('eau')!==-1||n.indexOf('water')!==-1) return 0x3AB8C8;
      if (n.indexOf('sol')!==-1||n.indexOf('floor')!==-1) return 0x4DB860;
      if (n.indexOf('bois')!==-1||n.indexOf('wood')!==-1||n.indexOf('barriere')!==-1) return 0x8B5E2A;
      if (n.indexOf('pierre')!==-1||n.indexOf('rock')!==-1||n.indexOf('dalle')!==-1) return 0x8A8870;
      if (n.indexOf('pot')!==-1) return 0xC06040;
      if (n.indexOf('champi')!==-1||n.indexOf('mush')!==-1) return 0xD42020;
      if (n.indexOf('fleur')!==-1||n.indexOf('flower')!==-1) return 0xFFEEAA;
      return null;
    }

    // Overlay chargement
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;background:#0a1a04;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;transition:opacity .6s';
    overlay.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.7rem;color:#a3e635;letter-spacing:.15em;margin-bottom:.8rem">' + ((document.documentElement.lang==='en') ? '// Loading map...' : '// Chargement map...') + '</div>'
      + '<div style="width:180px;height:3px;background:rgba(163,230,53,.2)"><div id="t3d-prog" style="height:100%;background:#a3e635;width:0%;transition:width .3s"></div></div>';
    container.appendChild(overlay);

    var dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
    var gltfLoader = new THREE.GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    var urls = ['assets/models/garden.glb','https://mollymo31.github.io/Portfolio_Leo_Lussan/assets/models/garden.glb'];
    var tried = 0;

    function tryLoad() {
      if (tried >= urls.length) {
        overlay.innerHTML='<div style="font-family:Space Mono,monospace;font-size:.65rem;color:#f87171;text-align:center;padding:1rem">' + ((document.documentElement.lang==='en') ? '// garden.glb not found' : '// garden.glb introuvable') + '</div>';
        return;
      }
      gltfLoader.load(urls[tried],
        function(gltf) {
          var model = gltf.scene;

          // Rotation Unreal Z-up -> Three.js Y-up via pivot
          // On tourne le modele dans un groupe pivot pour eviter le gimbal lock
          var pivot = new THREE.Group();
          pivot.rotation.x = -Math.PI / 2;
          pivot.add(model);

          // Normaliser taille
          var box = new THREE.Box3().setFromObject(model);
          var sz = box.getSize(new THREE.Vector3());
          var sc = 18 / Math.max(sz.x, sz.y, sz.z);
          model.scale.setScalar(sc);

          // Centrer
          box.setFromObject(model);
          var c = box.getCenter(new THREE.Vector3());
          model.position.set(-c.x, -box.min.y, -c.z);

          // Appliquer couleurs par NOM DE MESH - plus fiable que le materiau
          var MESH_COLORS = {
            'Floor':        0x4DB860, // herbe verte
            'Herbe_Herbe':  0x55CC70,
            'Herbe_01':     0x66DD80,
            'herbe_random': 0x44BB60,
            'mare2':        0x3AB8C8, // eau bleue
            'nenuphar2_nenuphar_troue': 0x2A7830,
            'lotus4_EVOLUTION5': 0x2A8830,
            'roseau4_roseau4': 0x2D7A3A,
            'dalles':       0x8A8870, // pierres grises
            'Pave_01':      0x9A9880,
            'Pave_03_Retopo2': 0x8A8870,
            'Pierre_1':     0x7A7A6A,
            'barriere':     0x8B5E2A, // bois brun
            'planche__1_':  0x7A4E1A,
            'planche__2_':  0x7A4E1A,
            'Pot_POT_uv_ok':0xC06040, // terre cuite
            'Rateau1_pCube2':0x8B5E2A,
            'velo_velo1':   0x333333, // velo sombre
            'Pneu':         0x222222,
            'Plane':        0x4DB860,
            'Champi_02':    0xD42020, // champignon rouge
            'Champi_03':    0xE86020,
            'arrosoir_pDisc2': 0x888888,
            'Parapluie_Parapluie_tourelle': 0xE84040,
            'caserneUV':    0xCC8844,
            'SkeletalMeshComponent0': 0xC08840, // gnomes
            'PlaqueDessous':0x8B5E2A,
          };

          model.traverse(function(child) {
            if (!child.isMesh) return;
            var name = child.name || '';

            // Masquer colliders UCX
            if (name.indexOf('UCX_') === 0) { child.visible = false; return; }

            child.castShadow = true;
            child.receiveShadow = true;

            // Chercher la couleur par nom de mesh
            var col = null;
            for (var k in MESH_COLORS) {
              if (name === k || name.indexOf(k) === 0) { col = MESH_COLORS[k]; break; }
            }
            // Fallback par mot-cle dans le nom
            if (col === null) {
              var n = name.toLowerCase();
              if (n.indexOf('herbe')!==-1||n.indexOf('grass')!==-1) col=0x55CC70;
              else if (n.indexOf('floor')!==-1||n.indexOf('sol')!==-1) col=0x4DB860;
              else if (n.indexOf('eau')!==-1||n.indexOf('water')!==-1||n.indexOf('mare')!==-1) col=0x3AB8C8;
              else if (n.indexOf('bois')!==-1||n.indexOf('planche')!==-1||n.indexOf('barriere')!==-1) col=0x8B5E2A;
              else if (n.indexOf('pierre')!==-1||n.indexOf('rock')!==-1||n.indexOf('pave')!==-1) col=0x8A8870;
              else if (n.indexOf('champi')!==-1||n.indexOf('mush')!==-1) col=0xD42020;
              else if (n.indexOf('fleur')!==-1||n.indexOf('flower')!==-1) col=0xFFEEAA;
              else if (n.indexOf('pot')!==-1) col=0xC06040;
              else if (n.indexOf('velo')!==-1||n.indexOf('bike')!==-1) col=0x333333;
              else col=0x88BB66; // vert par defaut
            }

            var isWater = (name.indexOf('mare')!==-1||name.indexOf('lotus')!==-1||name.indexOf('nenuphar')!==-1);
            child.material = new THREE.MeshPhongMaterial({shininess:40,
              color: col,
              side: THREE.DoubleSide,
              transparent: isWater,
              opacity: isWater ? 0.82 : 1.0,
            });
          });

          scene.add(pivot);

          // Centre visible
          var vb = new THREE.Box3();
          pivot.traverse(function(ch) { if (ch.isMesh && ch.visible) vb.expandByObject(ch); });
          var vc = vb.getCenter(new THREE.Vector3());
          var vs = vb.getSize(new THREE.Vector3());
          camTarget.copy(vc);
          camRadius = Math.max(vs.x, vs.z) * 1.1;
          updateCam();

          // Cacher overlay
          overlay.style.opacity = '0';
          setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 700);
          animate();
        },
        function(xhr) {
          var p = document.getElementById('t3d-prog');
          if (p && xhr.total > 0) p.style.width = (xhr.loaded/xhr.total*100) + '%';
        },
        function() { tried++; setTimeout(tryLoad, 300); }
      );
    }
    tryLoad();

    // === CAMERA - Quaternion orbit, liberte totale sans gimbal lock ===
    var camRadius = 20;
    var camTarget = new THREE.Vector3(0, 1, 0);

    // Quaternion representant l'orientation de la camera
    var quat = new THREE.Quaternion();
    // Angle initial : vue 3/4 isometrique
    var qX = new THREE.Quaternion(); qX.setFromAxisAngle(new THREE.Vector3(1,0,0), -0.75);
    var qY = new THREE.Quaternion(); qY.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI*1.25);
    quat.multiplyQuaternions(qY, qX);

    function updateCam() {
      // Position camera depuis quaternion
      var dir = new THREE.Vector3(0, 0, 1);
      dir.applyQuaternion(quat);
      camera.position.copy(camTarget).addScaledVector(dir, camRadius);
      camera.lookAt(camTarget);
    }
    updateCam();

    // === CONTROLES SOURIS - quaternion drag ===
    var drag = false, pm = {x:0, y:0}, autoRot = true;
    var el = renderer.domElement;

    function rotateCamera(dx, dy) {
      // Rotation autour de Y monde (gauche/droite)
      var qy = new THREE.Quaternion();
      qy.setFromAxisAngle(new THREE.Vector3(0,1,0), -dx);
      // Rotation autour de X local (haut/bas)
      var right = new THREE.Vector3(1,0,0).applyQuaternion(quat);
      var qx = new THREE.Quaternion();
      qx.setFromAxisAngle(right, -dy);
      quat.premultiply(qy).premultiply(qx);
      quat.normalize();
      updateCam();
    }

    el.addEventListener('mousedown', function(e) {
      drag = true; autoRot = false;
      pm = {x:e.clientX, y:e.clientY};
      el.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', function() { drag=false; el.style.cursor='grab'; });
    window.addEventListener('mousemove', function(e) {
      if (!drag) return;
      rotateCamera((e.clientX-pm.x)*0.007, (e.clientY-pm.y)*0.007);
      pm = {x:e.clientX, y:e.clientY};
    });
    el.addEventListener('wheel', function(e) {
      e.preventDefault();
      camRadius = Math.max(3, Math.min(50, camRadius + e.deltaY*0.04));
      updateCam();
    }, {passive:false});

    // === CONTROLES TOUCH ===
    var lt = null;
    el.addEventListener('touchstart', function(e) { lt=e.touches[0]; autoRot=false; }, {passive:true});
    el.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (!lt) return;
      var t = e.touches[0];
      rotateCamera((t.clientX-lt.clientX)*0.01, (t.clientY-lt.clientY)*0.01);
      lt = t;
    }, {passive:false});

    // === CONTROLES CLAVIER ZQSD ===
    var keys = {};
    window.addEventListener('keydown', function(e) { keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup',   function(e) { keys[e.key.toLowerCase()] = false; });
    function doKeys() {
      var sp = 0.04, any = false;
      if (keys['z']||keys['w']||keys['arrowup'])    { rotateCamera(0,  sp); any=true; }
      if (keys['s']||keys['arrowdown'])              { rotateCamera(0, -sp); any=true; }
      if (keys['q']||keys['a']||keys['arrowleft'])  { rotateCamera( sp, 0); any=true; }
      if (keys['d']||keys['arrowright'])             { rotateCamera(-sp, 0); any=true; }
      if (keys['e']) { camRadius=Math.max(3,camRadius-0.35); updateCam(); any=true; }
      if (keys['c']) { camRadius=Math.min(50,camRadius+0.35); updateCam(); any=true; }
      if (any) autoRot = false;
    }

    // Info
    var info=document.createElement('div');
    info.style.cssText='position:absolute;bottom:.7rem;left:.8rem;font-family:Space Mono,monospace;font-size:.5rem;color:rgba(10,30,10,.6);z-index:20;line-height:1.8;pointer-events:none';
    info.innerHTML=(document.documentElement.lang==='en')?'Mouse \u2014 Orbit \u00b7 Wheel \u2014 Zoom \u00b7 WASD \u2014 Rotation \u00b7 E/C \u2014 Zoom':'Souris \u2014 Orbiter \u00b7 Molette \u2014 Zoom \u00b7 ZQSD \u2014 Rotation \u00b7 E/C \u2014 Zoom';
    container.appendChild(info);

    // 4 boutons orientation
    var rotDiv=document.createElement('div');
    rotDiv.style.cssText='position:absolute;top:.6rem;right:.8rem;display:flex;gap:.3rem;z-index:20';
    var rotAngles=[0, Math.PI/2, Math.PI, -Math.PI/2]; // orientation
    var rotLabels=['\u2191N','\u2192E','\u2193S','\u2190W'];
    var curRot=0;
    rotAngles.forEach(function(angle,i){
      var btn=document.createElement('button');
      btn.style.cssText='font-family:Space Mono,monospace;font-size:.58rem;color:#c8a96e;background:rgba(0,0,0,.8);border:1px solid rgba(200,169,110,.3);padding:.25rem .5rem;cursor:pointer;min-width:2rem';
      btn.textContent=rotLabels[i];
      btn.onclick=function(){
        pivot.rotation.z = angle;
      };
      rotDiv.appendChild(btn);
    });
    container.appendChild(rotDiv);

    // === ANIMATION ===
    var raf=null, stopped=false, inView=true;
    if(window.IntersectionObserver) new IntersectionObserver(function(en){ inView=en[0].isIntersecting; }).observe(container);
    function animate(){
      if(stopped) return;
      raf=requestAnimationFrame(animate);
      if(!inView) return;
      doKeys();
      if(autoRot){rotateCamera(0.0018,0);}
      renderer.render(scene,camera);
    }

    window.addEventListener('resize',function(){
      var w=container.clientWidth,h=container.clientHeight||420;
      renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
    });
    _t3d={renderer:renderer,stop:function(){stopped=true;cancelAnimationFrame(raf);renderer.dispose();if(renderer.forceContextLoss)renderer.forceContextLoss();}};
  }

  var _o1=window.openProj;
  window.openProj=function(id){
    _o1(id);
    if(id==='tower') setTimeout(initTower3D,200);
    if(id==='city')  setTimeout(function(){ if(window.initCity3D) window.initCity3D(); else if(window.loadCity3D) window.loadCity3D(function(){ if(window.initCity3D) window.initCity3D(); }); },200);
  };
  var _o2=window.closeProj;
  window.closeProj=function(id){
    _o2(id);
    if(id==='tower'&&_t3d){
      _t3d.stop();
      var c=document.getElementById('tower-3d-viewer');
      if(c){c.innerHTML='';delete c.dataset.init;}
      _t3d=null;
    }
  };
})();
