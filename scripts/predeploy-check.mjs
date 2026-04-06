import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'firebase.json',
  'firebase-applet-config.json',
  'public/ids_random_forest.onnx',
  'public/scaler.onnx',
  'src/firebase.ts',
  'src/services/inference.js'
];

const requiredFirebaseKeys = ['apiKey', 'authDomain', 'projectId', 'databaseURL'];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

for (const file of requiredFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    fail(`Missing required file: ${file}`);
  } else {
    ok(`Found ${file}`);
  }
}

let config = null;
try {
  const raw = fs.readFileSync(path.join(root, 'firebase-applet-config.json'), 'utf8');
  config = JSON.parse(raw);
} catch (err) {
  fail(`firebase-applet-config.json is not valid JSON: ${err.message}`);
}

if (config) {
  for (const key of requiredFirebaseKeys) {
    if (!config[key] || String(config[key]).trim() === '') {
      fail(`firebase-applet-config.json is missing required key: ${key}`);
    } else {
      ok(`firebase-applet-config.json has ${key}`);
    }
  }

  if (config.projectId && config.databaseURL && !String(config.databaseURL).includes(config.projectId)) {
    console.warn('⚠️ databaseURL does not include projectId; verify this points to your intended RTDB instance.');
  }
}

const inferenceCode = fs.readFileSync(path.join(root, 'src/services/inference.js'), 'utf8');
if (!inferenceCode.includes('ort.env.wasm.wasmPaths')) {
  fail('inference.js does not configure ort.env.wasm.wasmPaths. This can break Firebase Hosting inference.');
} else {
  ok('inference.js configures ort.env.wasm.wasmPaths');
}

const firebaseCode = fs.readFileSync(path.join(root, 'src/firebase.ts'), 'utf8');
if (!firebaseCode.includes('getDatabase(app, inferredDatabaseUrl)')) {
  fail('firebase.ts does not initialize RTDB with inferredDatabaseUrl.');
} else {
  ok('firebase.ts initializes RTDB with inferredDatabaseUrl');
}

if (process.exitCode) {
  console.error('\nPredeploy check failed. Fix the items above before deploying.');
} else {
  console.log('\n🎉 Predeploy check passed. Safe to run build/deploy.');
}
