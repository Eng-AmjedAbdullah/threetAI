import fs from 'node:fs';

const required = [
  'firebase.json',
  'firebase-applet-config.json',
  'src/firebase.ts',
  'src/services/inference.js',
  'public/ids_random_forest.onnx',
  'public/scaler.onnx'
];

let failed = false;
for (const f of required) {
  if (!fs.existsSync(f)) {
    console.error(`❌ Missing: ${f}`);
    failed = true;
  } else {
    console.log(`✅ Found: ${f}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log('🎉 Predeploy checks passed.');
