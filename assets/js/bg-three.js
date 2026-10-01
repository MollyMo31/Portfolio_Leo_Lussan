(function(){
  var canvas = document.getElementById('bg-canvas');
  if(!canvas) return;

  var renderer = new THREE.WebGLRenderer({canvas:canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.z = 30;

  function resize(){
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* Palette : contours rouges + blancs tres discrets */
  var MAT_RED  = new THREE.LineBasicMaterial({color:0xe63030, transparent:true, opacity:.18});
  var MAT_WHT  = new THREE.LineBasicMaterial({color:0xffffff,  transparent:true, opacity:.06});

  var cubes = [];
  var N = 28;

  for(var i=0; i<N; i++){
    var size = 0.6 + Math.random() * 2.8;
    var geo  = new THREE.BoxGeometry(size, size, size);
    var edges = new THREE.EdgesGeometry(geo);
    var mat  = Math.random() > 0.45 ? MAT_RED : MAT_WHT;
    var mesh = new THREE.LineSegments(edges, mat);

    mesh.position.set(
      (Math.random()-0.5) * 80,
      (Math.random()-0.5) * 50,
      (Math.random()-0.5) * 40
    );
    mesh.rotation.set(
      Math.random()*Math.PI,
      Math.random()*Math.PI,
      Math.random()*Math.PI
    );

    var speed = 0.0012 + Math.random() * 0.002;
    mesh.userData = {
      vx: (Math.random()-0.5) * 0.022,
      vy: (Math.random()-0.5) * 0.018,
      rx: (Math.random()-0.5) * speed,
      ry: (Math.random()-0.5) * speed,
      rz: (Math.random()-0.5) * speed * 0.5
    };

    scene.add(mesh);
    cubes.push(mesh);
  }

  /* Leger parallaxe souris */
  var mox=0, moy=0;
  document.addEventListener('mousemove', function(e){
    mox = (e.clientX / window.innerWidth  - 0.5) * 0.015;
    moy = (e.clientY / window.innerHeight - 0.5) * 0.010;
  });

  var BOUND_X = 45, BOUND_Y = 28, BOUND_Z = 22;

  var _bgLast = 0;
  function animate(now){
    requestAnimationFrame(animate);
    if (now - _bgLast < 50) return; // max 20fps pour le fond
    if (document.body.classList.contains('modal-open')) return; // fond cache derriere la fiche : on ne le dessine pas
    _bgLast = now;
    cubes.forEach(function(c){
      var d = c.userData;
      c.position.x += d.vx;
      c.position.y += d.vy;
      c.rotation.x += d.rx;
      c.rotation.y += d.ry;
      c.rotation.z += d.rz;
      if(c.position.x >  BOUND_X) c.position.x = -BOUND_X;
      if(c.position.x < -BOUND_X) c.position.x =  BOUND_X;
      if(c.position.y >  BOUND_Y) c.position.y = -BOUND_Y;
      if(c.position.y < -BOUND_Y) c.position.y =  BOUND_Y;
      if(c.position.z >  BOUND_Z) c.position.z = -BOUND_Z;
      if(c.position.z < -BOUND_Z) c.position.z =  BOUND_Z;
    });
    camera.position.x += (mox - camera.position.x) * 0.04;
    camera.position.y += (-moy - camera.position.y) * 0.04;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
  }
  animate();
})();
