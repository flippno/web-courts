// Import the MindARThree class from MindAR's production build.
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

export function setupAR() {
  // IMPORTANT: Provide the correct path to your image target file.
  const mindarThree = new MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets.mind"  // <-- Your MindAR image target file
  });
  
  const { renderer, scene, camera } = mindarThree;
  
  // Add an anchor for the first target (index 0)
  const anchor = mindarThree.addAnchor(0);
  const loader = new THREE.GLTFLoader();
  
  // Load a 3D model (e.g. Earth) to display on the detected target
  loader.load("assets/earth.glb", (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    anchor.group.add(gltf.scene);
  });
  
  mindarThree.start();
  
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

export function triggerAR(planets) {
  // This function can be used to trigger additional AR behavior.
  planets.forEach(planet => {
    let planetModel = document.querySelector(`#${planet}-model`);
    if (planetModel) {
      planetModel.setAttribute("visible", "true");
      planetModel.setAttribute("animation", "property: scale; from: 0 0 0; to: 0.5 0.5 0.5; dur: 500");
    }
  });
}
