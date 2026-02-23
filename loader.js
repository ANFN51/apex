(() => {
  const LOADER_TOTAL_MS = 4000;
  const EXIT_START_MS = 3600;
  const MODEL_URLS = [
    "models/family-house-realistic.glb",
    "models/family-house.glb",
  ];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileViewport = window.matchMedia("(max-width: 991px)").matches;

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
  let threeRunning = false;
  let renderer = null;
  let scene = null;
  let camera = null;
  let onResize = null;
  let environmentMap = null;

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

  const disposeMaterial = (material) => {
    if (!material) return;

    Object.keys(material).forEach((key) => {
      const value = material[key];
      if (value && value.isTexture && typeof value.dispose === "function") {
        value.dispose();
      }
    });

    if (typeof material.dispose === "function") {
      material.dispose();
    }
  };

  const cleanupThree = () => {
    if (!threeRunning) return;

    cancelAnimationFrame(rafId);

    if (onResize) {
      window.removeEventListener("resize", onResize);
    }

    if (scene) {
      scene.traverse((object) => {
        if (object.geometry && typeof object.geometry.dispose === "function") {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(disposeMaterial);
          } else {
            disposeMaterial(object.material);
          }
        }
      });
    }

    if (environmentMap && typeof environmentMap.dispose === "function") {
      environmentMap.dispose();
      environmentMap = null;
    }

    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }

    renderer = null;
    scene = null;
    camera = null;
    onResize = null;
    threeRunning = false;
  };

  const addEnvironment = (THREE) => {
    if (!renderer || !scene) return;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const envCanvas = document.createElement("canvas");
    envCanvas.width = 128;
    envCanvas.height = 64;

    const ctx = envCanvas.getContext("2d");
    if (!ctx) {
      pmrem.dispose();
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, envCanvas.height);
    gradient.addColorStop(0.0, "#5c7bb6");
    gradient.addColorStop(0.45, "#1e2b44");
    gradient.addColorStop(1.0, "#080b10");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, envCanvas.width, envCanvas.height);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.colorSpace = THREE.SRGBColorSpace;

    environmentMap = pmrem.fromEquirectangular(envTexture).texture;
    scene.environment = environmentMap;

    envTexture.dispose();
    pmrem.dispose();
  };

  const tuneModelMaterials = (THREE, model) => {
    const maxAnisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;

    model.traverse((object) => {
      if (!object.isMesh) return;

      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material) ? object.material : [object.material];

      materials.forEach((material) => {
        if (!material) return;

        if ("roughness" in material) {
          material.roughness = THREE.MathUtils.clamp(material.roughness ?? 0.68, 0.35, 0.95);
        }

        if ("metalness" in material) {
          material.metalness = THREE.MathUtils.clamp(material.metalness ?? 0.08, 0.0, 0.25);
        }

        if ("envMapIntensity" in material) {
          material.envMapIntensity = 1.2;
        }

        if (material.map) {
          material.map.colorSpace = THREE.SRGBColorSpace;
          material.map.anisotropy = Math.min(8, maxAnisotropy);
        }

        material.needsUpdate = true;
      });
    });
  };

  const fitModelToFrame = (THREE, model, pivot) => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    model.position.sub(center);

    const targetDimension = isMobileViewport ? 5.1 : 5.7;
    const scale = targetDimension / maxDimension;
    model.scale.setScalar(scale);

    const fitted = new THREE.Box3().setFromObject(model);
    model.position.y -= fitted.min.y;

    pivot.add(model);
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
      scene.background = new THREE.Color(0x000000);

      camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
      camera.position.set(7.35, 3.4, 7.2);
      camera.lookAt(0, 1.45, 0);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileViewport ? 1.5 : 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      if ("physicallyCorrectLights" in renderer) {
        renderer.physicallyCorrectLights = true;
      }

      renderer.setClearColor(0x000000, 1);

      addEnvironment(THREE);

      const hemi = new THREE.HemisphereLight(0xc7daff, 0x0e131b, 0.46);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xffffff, 1.15);
      key.position.set(8.5, 11.5, 7);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 40;
      key.shadow.camera.left = -12;
      key.shadow.camera.right = 12;
      key.shadow.camera.top = 12;
      key.shadow.camera.bottom = -12;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0x9ec1ff, 0.38);
      fill.position.set(-7, 5.8, 3.5);
      scene.add(fill);

      const rim = new THREE.PointLight(0x8ab6ff, 0.55, 22);
      rim.position.set(-5.8, 4.2, -5.2);
      scene.add(rim);

      const shadowCatcher = new THREE.Mesh(
        new THREE.CircleGeometry(5.9, 64),
        new THREE.ShadowMaterial({ opacity: isMobileViewport ? 0.28 : 0.36 })
      );
      shadowCatcher.rotation.x = -Math.PI / 2;
      shadowCatcher.position.y = 0.001;
      shadowCatcher.receiveShadow = true;
      scene.add(shadowCatcher);

      const pivot = new THREE.Group();
      scene.add(pivot);

      const gltfLoader = new THREE.GLTFLoader();

      const loadModel = (index) => {
        if (index >= MODEL_URLS.length) {
          showFallback();
          cleanupThree();
          return;
        }

        gltfLoader.load(
          MODEL_URLS[index],
          (gltf) => {
            const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
            if (!model) {
              loadModel(index + 1);
              return;
            }

            tuneModelMaterials(THREE, model);
            fitModelToFrame(THREE, model, pivot);
          },
          undefined,
          () => {
            loadModel(index + 1);
          }
        );
      };

      loadModel(0);

      onResize = () => {
        if (!renderer || !camera || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const startedAt = performance.now();

      const animate = (now) => {
        rafId = requestAnimationFrame(animate);

        const t = (now - startedAt) / 1000;
        pivot.rotation.y = t * 0.21;
        pivot.position.y = Math.sin(t * 1.25) * 0.035;

        const orbit = 0.24;
        camera.position.x = 7.35 + Math.cos(t * 0.22) * orbit;
        camera.position.z = 7.2 + Math.sin(t * 0.22) * orbit;
        camera.lookAt(0, 1.45, 0);

        renderer.render(scene, camera);
      };

      onResize();
      window.addEventListener("resize", onResize, { passive: true });
      animate(startedAt);
      threeRunning = true;
    } catch {
      showFallback();
      cleanupThree();
    }
  };

  const startExit = () => {
    if (prefersReducedMotion) {
      body.classList.add("preloader-fade-start");
      return;
    }

    body.classList.add("preloader-exit");
  };

  const finishLoader = () => {
    cleanupThree();
    body.classList.remove("preload-active", "preloader-exit", "preloader-fade-start", "preloader-reduced");
    preloader.remove();
  };

  initThreeLoader();

  window.setTimeout(startExit, EXIT_START_MS);
  window.setTimeout(finishLoader, LOADER_TOTAL_MS);
})();
