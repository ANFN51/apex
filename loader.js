(() => {
  "use strict";

  // ── Configuration ───────────────────────────────────────
 const MODEL_URL = "models/american_house.glb";
  const MIN_VISIBLE_MS = 8000;
  const FAIL_VISIBLE_MS = 5000;
  const MAX_WAIT_MS = 12000;
  const EXIT_DURATION_MS = 1000;
  
  // ── DOM References ──────────────────────────────────────
  const body = document.body;
  const preloader = document.getElementById("preloader");
  if (!preloader) return;
  preloader.dataset.managed = "true";

  const canvas = document.getElementById("preloader-canvas");
  const barFill = document.getElementById("loading-bar-fill");
  const percentageText = document.getElementById("loading-percentage");
  const statusText = document.getElementById("loading-text");
  const warmModelPromise = (window.__apexPreloaderModelPromise &&
    typeof window.__apexPreloaderModelPromise.then === "function")
    ? window.__apexPreloaderModelPromise
    : null;
  
  const loaderStart = performance.now();
  let scene, camera, renderer, model, pivot, rafId, dracoLoader;
  let isExiting = false;

  // ── Initialize State ─────────────────────────────────────
  body.classList.add("preload-active");

  const updateProgress = (pct) => {
    const p = Math.floor(pct);
    if (barFill) barFill.style.width = `${p}%`;
    if (percentageText) percentageText.textContent = `${p}%`;
    
    if (!statusText) return;
    if (p < 30) statusText.textContent = "INITIALIZING ENGINE...";
    else if (p < 60) statusText.textContent = "DECODING GEOMETRY...";
    else if (p < 90) statusText.textContent = "OPTIMIZING MATERIALS...";
    else statusText.textContent = "PREPARING REVEAL...";
  };

  const loadGltf = (loader) => {
    const parseBuffer = (arrayBuffer) =>
      new Promise((resolve, reject) => {
        const basePath = MODEL_URL.slice(0, MODEL_URL.lastIndexOf("/") + 1);
        loader.parse(arrayBuffer, basePath, resolve, reject);
      });

    if (warmModelPromise) {
      updateProgress(15);
      return warmModelPromise
        .then((arrayBuffer) => {
          if (!(arrayBuffer instanceof ArrayBuffer)) throw new Error("Warm fetch unavailable");
          updateProgress(65);
          return parseBuffer(arrayBuffer);
        })
        .catch(() => new Promise((resolve, reject) => {
          loader.load(
            MODEL_URL,
            resolve,
            (xhr) => {
              if (xhr.lengthComputable) {
                updateProgress((xhr.loaded / xhr.total) * 100);
              }
            },
            reject
          );
        }));
    }

    return new Promise((resolve, reject) => {
      loader.load(
        MODEL_URL,
        resolve,
        (xhr) => {
          if (xhr.lengthComputable) {
            updateProgress((xhr.loaded / xhr.total) * 100);
          }
        },
        reject
      );
    });
  };

  const initThree = () => {
    return new Promise((resolve) => {
      if (!window.THREE || !window.THREE.GLTFLoader) {
        console.error("Preloader: THREE.js dependencies missing.");
        resolve(false);
        return;
      }

      const THREE = window.THREE;
      
      try {
        // Renderer Setup
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "default"
        });
        
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);
        if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if ("outputEncoding" in renderer && THREE.sRGBEncoding !== undefined) {
          renderer.outputEncoding = THREE.sRGBEncoding;
        }
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        // Scene & Camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        camera.position.set(0, 1.5, 6.5);

        // Lighting (Cinematic Studio Setup - Boosted)
        const ambient = new THREE.HemisphereLight(0xffffff, 0x081020, 1.2);
        scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xffecd2, 3.5);
        keyLight.position.set(10, 10, 10);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xd2e9ff, 1.8);
        fillLight.position.set(-10, 5, 5);
        scene.add(fillLight);

        const rimLight = new THREE.PointLight(0xffffff, 25);
        rimLight.position.set(0, 8, -8);
        scene.add(rimLight);

        pivot = new THREE.Group();
        scene.add(pivot);

        // Loader
        const loader = new THREE.GLTFLoader();
        if (typeof THREE.DRACOLoader === "function") {
          dracoLoader = new THREE.DRACOLoader();
          dracoLoader.setDecoderPath("vendor/draco/");
          dracoLoader.setDecoderConfig({ type: "wasm" });
          loader.setDRACOLoader(dracoLoader);
        }
        loadGltf(loader).then((gltf) => {
            model = gltf.scene || gltf.scenes?.[0];
            if (!model) {
              resolve(false);
              return;
            }

            model.traverse((obj) => {
              if (obj.isMesh) obj.frustumCulled = false;
            });
            handleResize();
            
            // Center model exactly around origin first
            model.updateMatrixWorld(true);
            const startBox = new THREE.Box3().setFromObject(model);
            const startCenter = startBox.getCenter(new THREE.Vector3());
            model.position.sub(startCenter);

            // Scale to a stable target size to avoid tiny/oversized framing
            model.updateMatrixWorld(true);
            const centeredBox = new THREE.Box3().setFromObject(model);
            const centeredSize = centeredBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(centeredSize.x, centeredSize.y, centeredSize.z) || 1;
            const scale = 5.4 / maxDim;
            model.scale.setScalar(scale);

            // Re-center after scaling and apply slight optical correction
            model.updateMatrixWorld(true);
            const scaledBox = new THREE.Box3().setFromObject(model);
            const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
            const scaledSize = scaledBox.getSize(new THREE.Vector3());
            model.position.sub(scaledCenter);
            model.position.y -= scaledSize.y * 0.03;

            // Fit camera based on final bounds so the model is centered in view
            model.updateMatrixWorld(true);
            const finalBox = new THREE.Box3().setFromObject(model);
            const finalSize = finalBox.getSize(new THREE.Vector3());
            const fov = THREE.MathUtils.degToRad(camera.fov);
            const height = finalSize.y || 1;
            const width = finalSize.x || 1;
            const distForHeight = (height / 2) / Math.tan(fov / 2);
            const aspect = camera.aspect || 1.6;
            const distForWidth = (width / 2) / (Math.tan(fov / 2) * aspect);
            const camDist = Math.max(6, distForHeight, distForWidth) * 1.35;

            camera.position.set(camDist * 0.22, camDist * 0.12, camDist);
            camera.lookAt(0, 0, 0);
            camera.near = Math.max(0.05, camDist / 120);
            camera.far = camDist * 40;
            camera.updateProjectionMatrix();
            
            pivot.add(model);
            startAnimation();
            resolve(true);
          }).catch((err) => {
            console.error("Preloader: Load error", err);
            resolve(false);
          });

        // Resize handler
        const handleResize = () => {
          const rect = canvas.getBoundingClientRect();
          const w = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 700));
          const h = Math.max(1, Math.floor(rect.height || canvas.clientHeight || Math.floor(w * 0.625)));
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", handleResize);
        handleResize();

      } catch (e) {
        console.error("Preloader: Init error", e);
        resolve(false);
      }
    });
  };

  const startAnimation = () => {
    const animate = (time) => {
      if (isExiting) return;
      rafId = requestAnimationFrame(animate);
      
      const t = time * 0.0006;
      pivot.rotation.y = t * 0.25;
      pivot.position.y = Math.sin(t * 1.5) * 0.1;
      
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);
  };

  const exitPreloader = () => {
    if (isExiting) return;
    isExiting = true;
    
    body.classList.add("preloader-exit");
    
    setTimeout(() => {
      cancelAnimationFrame(rafId);
      if (dracoLoader && typeof dracoLoader.dispose === "function") {
        dracoLoader.dispose();
      }
      if (renderer) renderer.dispose();
      body.classList.remove("preload-active", "preloader-exit");
      if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      window.dispatchEvent(new CustomEvent("preloaderFinished"));
    }, EXIT_DURATION_MS);
  };

  // ── Execution ───────────────────────────────────────────
  const forceExitTimer = window.setTimeout(() => {
    if (isExiting) return;
    updateProgress(100);
    if (statusText) statusText.textContent = "READY";
    exitPreloader();
  }, MAX_WAIT_MS);

  initThree().then((success) => {
    clearTimeout(forceExitTimer);
    const elapsed = performance.now() - loaderStart;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    
    if (success) {
      updateProgress(100);
      if (statusText) statusText.textContent = "WELCOME TO APEX";
      setTimeout(exitPreloader, remaining);
    } else {
      // Immediate exit on fail
      exitPreloader();
    }
  });

})();
