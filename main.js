// File: main.js (Handles Model Loading & Object Detection)

// Ensure WebGL is used for TensorFlow.js
tf.setBackend('webgl');

let model;
async function loadModel() {
    console.log("Initializing TensorFlow.js...");

    // Set TensorFlow.js to use WASM
    await tf.setBackend('wasm');
    await tf.ready(); 

    console.log("TensorFlow.js WASM backend ready!");

    // Load the TFLite model
    model = await tflite.loadTFLiteModel('models/planets_model.tflite');
    console.log("TFLite Model Loaded Successfully!");
}

loadModel();

// Function to make predictions
async function detectObjects(imageData) {
  if (!model) return;
  
  let imgTensor = tf.browser.fromPixels(imageData)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(255)
    .expandDims(0);
  
  let predictions = model.predict(imgTensor);
  let scores = predictions.dataSync();
  let detectedPlanets = [];
  
  scores.forEach((score, i) => {
    if (score > 0.5) detectedPlanets.push(labels[i]);
  });
  return detectedPlanets;
}

// Function to update AR Scene
function showARModel(planets) {
  let arContainer = document.getElementById("ar-container");
  arContainer.innerHTML = "";
  planets.forEach(planet => {
    let newEntity = document.createElement("a-entity");
    newEntity.setAttribute("gltf-model", `#${planet}-model`);
    newEntity.setAttribute("animation", "property: scale; from: 0 0 0; to: 0.5 0.5 0.5; dur: 500");
    arContainer.appendChild(newEntity);
  });
}
