export async function setupTF() {
    // Check if WebGL is available, else fallback to WASM
    if (tf.getBackend() !== 'webgl') {
        console.warn("WebGL not available, switching to WASM");
        await tf.setBackend('wasm');
    }
    console.log("TensorFlow.js Backend:", tf.getBackend());
}

export function preprocessImage(imageData) {
    return tf.browser.fromPixels(imageData)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(255)
        .expandDims(0);
}