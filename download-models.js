const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, 'public', 'models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const files = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1',
    'face_landmark_68_tiny_model-weights_manifest.json',
    'face_landmark_68_tiny_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';

files.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const fileUrl = baseUrl + file;

    console.log(`Downloading ${file}...`);

    https.get(fileUrl, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Failed to download ${file}: Status ${response.statusCode}`);
            return;
        }

        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded ${file}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${file}: ${err.message}`);
    });
});
