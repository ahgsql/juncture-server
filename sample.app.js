//SAMPLE APP
import Juncture from './src/index.js';
const app = new Juncture(3000);
const bridge = app.bridge;

// Örnek Handler
bridge.registerHandler('get-message', async (args) => {
    // İşlem mantığınızı buraya yazın
    return "HELLO";
});

//Sürekli Yayın
let progress = 1;
setInterval(() => {
    progress++;
    bridge.broadcast("progress", progress);
}, 100)

app.start();