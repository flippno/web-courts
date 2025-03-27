import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { setWasmPath, loadTFLiteModel} from 'tfjs-tflite'

// Load GLTF model function
import { loadGLTF } from './loader.js';

// Set the WASM path for tfjs-tflite before loading your model
setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@latest/dist/');

// Initialize MindARThree
const mindarThree = new MindARThree({
  container: document.querySelector("#container"),
  imageTargetSrc: "./assets/targets/planets.mind"
});

const {renderer, scene, camera} = mindarThree;
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// Load 3D models
const planets = {
  earth: await loadGLTF('../../assets/models/earth/scene.gltf'),
  jupiter: await loadGLTF('../../assets/models/jupiter/scene.gltf'),
  mars: await loadGLTF('../../assets/models/mars/scene.gltf'),
  mercury: await loadGLTF('../../assets/models/mercury/scene.gltf'),
  neptune: await loadGLTF('../../assets/models/neptune/scene.gltf'),
  saturn: await loadGLTF('../../assets/models/saturn/scene.gltf'),
  uranus: await loadGLTF('../../assets/models/uranus/scene.gltf'),
  venus: await loadGLTF('../../assets/models/venus/scene.gltf'),
};

const anchors = {};
let index = 0;
for (const [key, model] of Object.entries(planets)) {
  model.scene.scale.set(0.3, 0.3, 0.3);
  model.scene.position.set(0, -0.4, 0);
  model.scene.visible = false;
  anchors[key] = mindarThree.addAnchor(index++);
  anchors[key].group.add(model.scene);
}

const p = document.getElementById("planet");
p.style.display = "none";

// Load the TFLite model
const loadModel = async () => {
  const tfliteModel = await loadTFLiteModel("./model.tflite");
  return tfliteModel;
};

const start = async () => {
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  const video = mindarThree.video;
  let skipCount = 0;

  const detect = async () => {
    if (skipCount < 10) {
      skipCount++;
      requestAnimationFrame(detect);
      return;
    }
    skipCount = 0;

    // Run inference
    const inputTensor = tf.browser.fromPixels(video).expandDims(0);
    const output = await tfliteModel.predict(inputTensor);
    inputTensor.dispose();

    // Parse YOLO output (bounding boxes, classes, scores)
    const detections = parseYOLOOutput(output);

    for (const detection of detections) {
      if (detection.score >= 0.75) {
        console.log(`${detection.class}, ${detection.score.toFixed(2)}`);
        p.style.display = "block";
        p.innerHTML = detection.class;
      }
    }

    requestAnimationFrame(detect);
  };

  requestAnimationFrame(detect);
};

// Parse YOLO output function
const parseYOLOOutput = (output) => {
  const data = output.dataSync();
  const detections = [];
  for (let i = 0; i < data.length; i += 6) {
    const classIndex = data[i];
    const score = data[i + 1];
    const className = getClassName(classIndex);
    detections.push({ class: className, score });
  }
  return detections;
};

const getClassName = (index) => {
  const classMap = [
    'venus', 'saturn', 'earth', 'jupiter',
    'mars', 'mercury', 'neptune', 'uranus'
  ];
  return classMap[index] || "unknown";
};

document.getElementById("planet").addEventListener("click", () => {
  for (const planet in planets) {
    planets[planet].scene.visible = (p.innerText.toLowerCase() === planet);
  }
});

document.getElementById("startButton").addEventListener("click", start);
document.getElementById("stopButton").addEventListener("click", () => {
  mindarThree.stop();
  mindarThree.renderer.setAnimationLoop(null);
});

(async () => {
  const tfliteModel = await loadModel();
  // Use tfliteModel in your detection function, e.g., assign to a global variable
})();