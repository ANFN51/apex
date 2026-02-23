(() => {
  const LOADER_TOTAL_MS = 4000;
  const EXIT_START_MS = 3600;
  const MODEL_URL = "models/family-house.glb";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const preloader = document.getElementById("preloader");
  const canvas = document.getElementById("preloader-canvas");
  const fallback = document.getElementById("preloader-fallback");

  if (!preloader) return;

  const body = document.body;
  body.classList.add("preload-active");
  if (prefersReducedMotion) {
    body.classList.add("preloader-reduced");
  }

  let rafId = 0;
  let threeActive = false;
  let renderer = null;
  let scene = null;
  let onResize = null;

  const canUseWebGL = () => {
    try {
      const testCanvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl2") || testCanvas.getContext("webgl"))
      );
    } catch {
      return false;
    }
  };

  const showFallback = () => {
    if (canvas) canvas.style.display = "none";
    if (fallback) fallback.hidden = false;
  };

  const disposeMaterial = (mat) => {
    if (!mat) return;
    Object.keys(mat).forEach((key) => {
      const value = mat[key];
      if (value && value.isTexture && typeof value.dispose === "function") {
        value.dispose();
      }
    });
    if (typeof mat.dispose === "function") {
      mat.dispose();
    }
  };

  const cleanupThree = () => {
    if (!threeActive) return;

    cancelAnimationFrame(rafId);
    if (onResize) {
      window.removeEventListener("resize", onResize);
    }

    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry && typeof obj.geometry.dispose === "function") {
          obj.geometry.dispose();
        }

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(disposeMaterial);
          } else {
            disposeMaterial(obj.material);
          }
        }
      });
    }

    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }

    threeActive = false;
  };

  const initThreeLoader = () => {
    if (
      prefersReducedMotion ||
      !window.THREE ||
      !window.THREE.GLTFLoader ||
      !canvas ||
      !canUseWebGL()
    ) {
      showFallback();
      return;
    }

    const THREE = window.THREE;

    try {
      scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
      camera.position.set(6.4, 3.6, 7.2);
      camera.lookAt(0, 1.5, 0);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.setClearColor(0x000000, 0);

      const ambient = new THREE.HemisphereLight(0xaec8ff, 0x151a23, 0.52);
      scene.add(ambient);

      const key = new THREE.DirectionalLight(0xffffff, 1.18);
      key.position.set(7, 11, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 40;
      key.shadow.camera.left = -12;
      key.shadow.camera.right = 12;
      key.shadow.camera.top = 12;
      key.shadow.camera.bottom = -12;
      scene.add(key);

      const rim = new THREE.PointLight(0x6ea6ff, 0.6, 20);
      rim.position.set(-5, 4, -5);
      scene.add(rim);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 24),
        new THREE.ShadowMaterial({ opacity: 0.4 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      scene.add(ground);

      const housePivot = new THREE.Group();
      scene.add(housePivot);

      const loader = new THREE.GLTFLoader();
      loader.load(
        MODEL_URL,
        (gltf) => {
          const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
          if (!model) {
            showFallback();
            cleanupThree();
            return;
          }

          model.traverse((obj) => {
            if (!obj.isMesh) return;
            obj.castShadow = true;
            obj.receiveShadow = true;

            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((mat) => {
              if (!mat) return;
              if ("roughness" in mat) mat.roughness = Math.max(0.45, mat.roughness ?? 0.8);
              if ("metalness" in mat) mat.metalness = Math.min(0.2, mat.metalness ?? 0.1);
              if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
              mat.needsUpdate = true;
            });
          });

          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;

          model.position.sub(center);

          const targetSize = 5.2;
          const scale = targetSize / maxDim;
          model.scale.setScalar(scale);

          const fitBox = new THREE.Box3().setFromObject(model);
          model.position.y -= fitBox.min.y;

          housePivot.add(model);
        },
        undefined,
        () => {
          showFallback();
          cleanupThree();
        }
      );

      onResize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const start = performance.now();
      const animate = (now) => {
        rafId = requestAnimationFrame(animate);

        const t = (now - start) / 1000;
        housePivot.rotation.y = t * 0.26;
        housePivot.position.y = Math.sin(t * 1.25) * 0.05;

        camera.position.x = 6.4 + Math.cos(t * 0.35) * 0.25;
        camera.position.z = 7.2 + Math.sin(t * 0.35) * 0.25;
        camera.lookAt(0, 1.5, 0);

        renderer.render(scene, camera);
      };

      onResize();
      window.addEventListener("resize", onResize);
      animate(start);
      threeActive = true;
    } catch {
      showFallback();
      cleanupThree();
    }
  };

  const finishLoader = () => {
    cleanupThree();
    body.classList.remove("preload-active", "preloader-exit", "preloader-fade-start", "preloader-reduced");
    preloader.remove();
  };

  initThreeLoader();

  window.setTimeout(() => {
    if (prefersReducedMotion) {
      body.classList.add("preloader-fade-start");
    } else {
      body.classList.add("preloader-exit");
    }
  }, EXIT_START_MS);

  window.setTimeout(finishLoader, LOADER_TOTAL_MS);
})();
