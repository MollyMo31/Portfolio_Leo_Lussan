import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

var _c3d = null;

function getMeshColor(name) {
  if (!name) return 0x2255cc;
  var n = name.toLowerCase();
  if (n.indexOf('pile') !== -1) return 0x2266cc;
  if (n.indexOf('car') !== -1 || n.indexOf('vehic') !== -1) return 0xff8c00;
  if (n.indexOf('road') !== -1 || n.indexOf('rue') !== -1 || n.indexOf('sol') !== -1) return 0x444466;
  if (n.indexOf('bat') !== -1 || n.indexOf('build') !== -1) return 0x1a4488;
  if (n.indexOf('vitre') !== -1 || n.indexOf('glass') !== -1) return 0x00eeff;
  if (n.indexOf('fleche') !== -1 || n.indexOf('arrow') !== -1) return 0x00ff88;
  if (n.indexOf('parking') !== -1) return 0x334466;
  if (n.indexOf('barr') !== -1 || n.indexOf('fence') !== -1) return 0xcc88ff;
  if (n.indexOf('panneau') !== -1 || n.indexOf('sign') !== -1) return 0xff4488;
  return 0x2255cc;
}

window.cityOrient = function(dir) {
  if (!_c3d) return;
  var angles = {N:0, E:Math.PI/2, S:Math.PI, W:-Math.PI/2};
  _c3d.setTheta(angles[dir] || 0);
};

window.initCity3D = function() {
  var container = document.getElementById('city-3d-viewer');
  if (!container) return;
  // etat orphelin (init lance mais jamais termine) : on repart de zero
  if (container.dataset.init && !_c3d) { container.innerHTML = ''; delete container.dataset.init; }
  try { initCity3DCore(container); }
  catch (err) {
    console.error('City 3D :', err);
    if (_c3d) { _c3d.stop(); _c3d = null; }
    delete container.dataset.init;
    container.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.65rem;color:#f87171;text-align:center;padding:1rem">' + ((document.documentElement.lang==='en') ? '// 3D error: ' : '// Erreur 3D : ') + String(err && err.message || err).replace(/</g,'&lt;') + '</div>';
  }
};

function initCity3DCore(container) {
  if (container.dataset.init) return;
  container.dataset.init = '1';
  var stopped = false;
  function safe(fn) {
    return function() {
      try { return fn.apply(this, arguments); }
      catch (err) {
        console.error('City 3D :', err);
        overlay.style.opacity = '1';
        overlay.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.65rem;color:#f87171;text-align:center;padding:1rem">' + ((document.documentElement.lang==='en') ? '// 3D error: ' : '// Erreur 3D : ') + String(err && err.message || err).replace(/</g,'&lt;') + '</div>';
      }
    };
  }
  var W = container.clientWidth || 800, H = container.clientHeight || 420;

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
  catch (err) {
    delete container.dataset.init;
    container.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.65rem;color:#f87171;text-align:center;padding:1rem">' + ((document.documentElement.lang==='en') ? '// WebGL unavailable, reload the page' : '// WebGL indisponible, recharge la page') + '</div>';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W, H);
  renderer.setClearColor(0x06061a, 1);
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cursor = 'grab';

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06061a);
  scene.fog = new THREE.Fog(0x06061a, 3000, 8000);

  var camera = new THREE.PerspectiveCamera(55, W/H, 1, 10000);

  // Pas de lumières nécessaires avec MeshBasicMaterial

  // Overlay chargement
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;background:#04040f;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;transition:opacity .6s';
  overlay.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.7rem;color:#00d4ff;letter-spacing:.15em;margin-bottom:.8rem">' + ((document.documentElement.lang==='en') ? '// Loading map...' : '// Chargement map...') + '</div>'
    + '<div style="width:180px;height:3px;background:rgba(0,212,255,.2)"><div id="c3d-prog" style="height:100%;background:#00d4ff;width:0%;transition:width .3s"></div></div>';
  container.appendChild(overlay);

  var dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/libs/draco/');
  var gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  var urls = [
    'assets/models/city_map.glb',
    'https://mollymo31.github.io/Portfolio_Leo_Lussan/assets/models/city_map.glb'
  ];
  var tried = 0;

  function tryLoad() {
    if (tried >= urls.length) {
      overlay.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.65rem;color:#f87171;text-align:center;padding:1rem">' + ((document.documentElement.lang==='en') ? '// city_map.glb not found' : '// city_map.glb introuvable') + '</div>';
      return;
    }
    gltfLoader.load(urls[tried],
      safe(function(gltf) {
        if (stopped) return;
        var model = gltf.scene;

        // Palette réduite - max 8 matériaux pour éviter MAX_FRAGMENT_UNIFORM_VECTORS
        var mats = {
          road:    new THREE.MeshBasicMaterial({ color: 0x0a0a1a, side: THREE.DoubleSide }),
          pile:    new THREE.MeshBasicMaterial({ color: 0x1a3a6a, side: THREE.DoubleSide }),
          car:     new THREE.MeshBasicMaterial({ color: 0xff8c00, side: THREE.DoubleSide }),
          neon:    new THREE.MeshBasicMaterial({ color: 0x00d4ff, side: THREE.DoubleSide }),
          green:   new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide }),
          purple:  new THREE.MeshBasicMaterial({ color: 0xcc88ff, side: THREE.DoubleSide }),
          pink:    new THREE.MeshBasicMaterial({ color: 0xff4488, side: THREE.DoubleSide }),
          default: new THREE.MeshBasicMaterial({ color: 0x152a55, side: THREE.DoubleSide }),
        };
        function pickMat(name) {
          var n = name.toLowerCase();
          if (n.indexOf('pile') !== -1 || n.indexOf('bat') !== -1 || n.indexOf('build') !== -1) return mats.pile;
          if (n.indexOf('car') !== -1 || n.indexOf('vehic') !== -1) return mats.car;
          if (n.indexOf('vitre') !== -1 || n.indexOf('glass') !== -1 || n.indexOf('checkpoint') !== -1 || n.indexOf('arrive') !== -1) return mats.neon;
          if (n.indexOf('fleche') !== -1 || n.indexOf('arrow') !== -1) return mats.green;
          if (n.indexOf('barr') !== -1 || n.indexOf('loopig') !== -1) return mats.purple;
          if (n.indexOf('panneau') !== -1 || n.indexOf('sign') !== -1) return mats.pink;
          if (n.indexOf('road') !== -1 || n.indexOf('sol') !== -1 || n.indexOf('parking') !== -1) return mats.road;
          return mats.default;
        }
        model.traverse(function(child) {
          if (!child.isMesh) return;
          var name = child.name || '';
          if (name.startsWith('UCX_') || name.startsWith('UBX_')) { child.visible = false; return; }
          child.material = pickMat(name);
          child.castShadow = false;
          child.receiveShadow = false;
        });

        // Centrer - forcer la position absolue
        var box = new THREE.Box3().setFromObject(model);
        var center = box.getCenter(new THREE.Vector3());
        var size = box.getSize(new THREE.Vector3());
        // Déplacer le modèle pour que son centre soit à l'origine
        model.position.set(-center.x, -center.y, -center.z);
        scene.add(model);

        // Recalculer bbox après déplacement
        var box2 = new THREE.Box3().setFromObject(model);
        var c2 = box2.getCenter(new THREE.Vector3());

        // Caméra positionnée sur la map
        var maxDim = Math.max(size.x, size.z);
        camRadius = maxDim * 0.9;
        camTarget.set(0, 0, 0);
        phi = 0.75;
        theta = 0.5;
        modelLoaded = true;
        updateCam();

        overlay.style.opacity = '0';
        setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 700);
        animate();
      }),
      function(xhr) {
        var p = document.getElementById('c3d-prog');
        if (p && xhr.total > 0) p.style.width = (xhr.loaded / xhr.total * 100) + '%';
      },
      function() { tried++; setTimeout(tryLoad, 300); }
    );
  }
  tryLoad();

  // Caméra orbit - initialisée après chargement
  var camRadius = 2000, theta = 0, phi = 0.8;
  var camTarget = new THREE.Vector3(0, 0, 0);
  var modelLoaded = false;

  function updateCam() {
    camera.position.set(
      camTarget.x + camRadius * Math.sin(phi) * Math.sin(theta),
      camTarget.y + camRadius * Math.cos(phi),
      camTarget.z + camRadius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(camTarget);
  }

  var drag = false, pm = {x:0, y:0}, autoRot = true;
  var el = renderer.domElement;

  el.addEventListener('mousedown', function(e) { drag=true; autoRot=false; pm={x:e.clientX,y:e.clientY}; el.style.cursor='grabbing'; });
  window.addEventListener('mouseup', function() { drag=false; el.style.cursor='grab'; });
  window.addEventListener('mousemove', function(e) {
    if (!drag) return;
    theta -= (e.clientX - pm.x) * 0.005;
    phi = Math.max(0.1, Math.min(Math.PI/2.2, phi - (e.clientY - pm.y) * 0.004));
    pm = {x:e.clientX, y:e.clientY};
    updateCam();
  });
  el.addEventListener('wheel', function(e) {
    e.preventDefault();
    camRadius = Math.max(200, Math.min(8000, camRadius + e.deltaY * 2.0));
    updateCam();
  }, {passive:false});

  var lt = null;
  el.addEventListener('touchstart', function(e) { lt=e.touches[0]; autoRot=false; }, {passive:true});
  el.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!lt) return;
    var t = e.touches[0];
    theta -= (t.clientX - lt.clientX) * 0.008;
    phi = Math.max(0.1, Math.min(Math.PI/2.2, phi - (t.clientY - lt.clientY) * 0.006));
    lt = t; updateCam();
  }, {passive:false});

  var info = document.createElement('div');
  info.style.cssText = 'position:absolute;bottom:.7rem;left:.8rem;font-family:Space Mono,monospace;font-size:.5rem;color:rgba(0,212,255,.5);z-index:20;line-height:1.8;pointer-events:none';
  info.innerHTML = (document.documentElement.lang==='en') ? 'Mouse — Orbit · Wheel — Zoom' : 'Souris — Orbiter · Molette — Zoom';
  container.appendChild(info);

  var raf = null, inView = true;
  // on ne dessine la 3D que lorsqu'elle est visible a l'ecran
  if (window.IntersectionObserver) new IntersectionObserver(function(en) { inView = en[0].isIntersecting; }).observe(container);
  function animate() {
    if (stopped) return;
    raf = requestAnimationFrame(animate);
    if (!inView) return;
    if (autoRot && modelLoaded) { theta += 0.002; updateCam(); }
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', function() {
    var w = container.clientWidth, h = container.clientHeight || 420;
    renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix();
  });

  _c3d = {
    renderer: renderer,
    stop: function() { stopped = true; cancelAnimationFrame(raf); renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); },
    setTheta: function(v) { theta = v; phi = 0.6; updateCam(); }
  };
}

// Intercepter openProj / closeProj
var _checkInterval = setInterval(function() {
  if (!window.openProj) return;
  clearInterval(_checkInterval);

  var _o1 = window.openProj;
  window.openProj = function(id) {
    _o1(id);
    if (id === 'city') setTimeout(window.initCity3D, 200);
  };
  var _o2 = window.closeProj;
  window.closeProj = function(id) {
    _o2(id);
    if (id === 'city') {
      // meme si le chargement n'est pas fini : on nettoie pour que la reouverture reparte de zero
      if (_c3d) { _c3d.stop(); _c3d = null; }
      var c = document.getElementById('city-3d-viewer');
      if (c) { c.innerHTML = ''; delete c.dataset.init; }
    }
  };
}, 50);
