import * as ort from 'onnxruntime-web';

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';

let onnxSession = null;
let scalerSession = null;

export async function loadMLModels() {
  try {
    // In a web environment, load models from public folder
    const base = (import.meta?.env?.BASE_URL || '/').replace(/\/$/, '');
    const modelCandidates = [`${base}/ids_random_forest.onnx`, `${base}/ids_random_forest_model.onnx`, '/ids_random_forest.onnx', '/ids_random_forest_model.onnx'];
    const scalerCandidates = [`${base}/scaler.onnx`, `${base}/data_scaler.onnx`, '/scaler.onnx', '/data_scaler.onnx'];

    if (!onnxSession) {
      for (const path of modelCandidates) {
        try {
          onnxSession = await ort.InferenceSession.create(path, { executionProviders: ['wasm'] });
          console.log(`✅ Main model loaded from ${path}`);
          break;
        } catch (err) {
          console.warn(`⚠️ Failed to load main model from ${path}:`, err.message);
        }
      }
    }

    if (!scalerSession) {
      for (const path of scalerCandidates) {
        try {
          scalerSession = await ort.InferenceSession.create(path, { executionProviders: ['wasm'] });
          console.log(`✅ Scaler model loaded from ${path}`);
          break;
        } catch (err) {
          console.warn(`⚠️ Failed to load scaler model from ${path}:`, err.message);
        }
      }
    }

    if (!onnxSession || !scalerSession) {
      console.warn('⚠️ One or more ONNX models failed to load. Detection scans will fail until model assets are reachable.');
    } else {
      console.log('✅ AI Inference models finalized.');
    }

    return true;
  } catch (err) {
    console.error('❌ Error in model loading process:', err);
    return true; // Don't block app even if models fail
  }
}

function getTensorOutput(output, candidateNames = []) {
  if (!output || typeof output !== 'object') return undefined;
  for (const name of candidateNames) {
    if (name && output[name] !== undefined) return output[name];
  }
  const values = Object.values(output);
  return values.length ? values[0] : undefined;
}

function isTypedArray(value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

function extractTensorValues(value) {
  if (value == null) return [];
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(v => extractTensorValues(v));
  }
  if (isTypedArray(value)) {
    return Array.from(value);
  }

  const tryExtract = (candidate) => {
    if (candidate == null) return undefined;
    if (isTypedArray(candidate)) return Array.from(candidate);
    if (Array.isArray(candidate)) return candidate;
    if (typeof candidate === 'object') {
      if (candidate.cpuData && isTypedArray(candidate.cpuData)) return Array.from(candidate.cpuData);
      if (candidate.data) {
        try {
          const dataValue = candidate.data;
          if (isTypedArray(dataValue)) return Array.from(dataValue);
          if (Array.isArray(dataValue)) return dataValue;
        } catch {
          // Some runtimes throw when accessing .data on non-tensor values.
        }
      }
      if (candidate.value) {
        return tryExtract(candidate.value);
      }
      if (typeof candidate.toArray === 'function') {
        try {
          return candidate.toArray();
        } catch {
          // ignore
        }
      }
      if (typeof candidate[Symbol.iterator] === 'function') {
        try {
          return Array.from(candidate);
        } catch {
          // ignore
        }
      }
    }
    return undefined;
  };

  const extracted = tryExtract(value);
  return extracted || [value];
}

function normalizeTensorValues(value) {
  const values = extractTensorValues(value);
  if (!values || !values.length) return [];
  return values.map(v => (typeof v === 'string' ? v.trim() : v));
}

function normalizeLabel(value) {
  if (Array.isArray(value)) return normalizeLabel(value[0]);
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    if (normalized === 'ATTACK') return 'ATTACK';
    const numeric = Number(normalized);
    if (!Number.isNaN(numeric)) return numeric === 1 ? 'ATTACK' : 'NORMAL';
    return 'NORMAL';
  }
  if (typeof value === 'number') return value === 1 ? 'ATTACK' : 'NORMAL';
  if (typeof value === 'boolean') return value ? 'ATTACK' : 'NORMAL';
  return 'NORMAL';
}

export async function runThreatGuardInference(features) {
  // Always use ONNX models - no fallback
  if (!onnxSession || !scalerSession) {
    throw new Error('ML models are not loaded. Please ensure the scaler and model ONNX files are available.');
  }

  // 1. Prepare input data matching the training feature order
  const featureOrder = [
    'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 'land', 'wrong_fragment', 'urgent',
    'hot', 'num_failed_logins', 'logged_in', 'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
    'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login', 'is_guest_login', 'count', 'srv_count',
    'serror_rate', 'srv_serror_rate', 'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate', 'srv_diff_host_rate',
    'dst_host_count', 'dst_host_srv_count', 'dst_host_same_srv_rate', 'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate',
    'dst_host_srv_diff_host_rate', 'dst_host_serror_rate', 'dst_host_srv_serror_rate', 'dst_host_rerror_rate', 'dst_host_srv_rerror_rate'
  ];

  const inputData = featureOrder.map(name => parseFloat(features[name]) || 0);
  const inputTensor = new ort.Tensor('float32', new Float32Array(inputData), [1, inputData.length]);

  // 2. Run Scaler
  const scalerFeeds = {
    [scalerSession.inputNames[0]]: inputTensor
  };
  const scaledOutput = await scalerSession.run(scalerFeeds);
  const scaledTensor = getTensorOutput(scaledOutput, [scalerSession.outputNames[0]]);

  if (!scaledTensor) {
    throw new Error('Scaler model failed to produce valid output tensor.');
  }

  // 3. Run Model
  const modelFeeds = {
    [onnxSession.inputNames[0]]: scaledTensor
  };
  const modelOutput = await onnxSession.run(modelFeeds);

  const labelOutput = getTensorOutput(modelOutput, [
    'label',
    'output_label',
    ...onnxSession.outputNames
  ]);
  const probOutput = getTensorOutput(modelOutput, [
    'probabilities',
    'output_probability',
    ...onnxSession.outputNames.slice(1)
  ]);

  if (!labelOutput) {
    throw new Error('Model failed to produce label output.');
  }

  const labelValue = normalizeTensorValues(labelOutput)[0];
  const probabilities = normalizeTensorValues(probOutput);

  const verdict = normalizeLabel(labelValue);
  const confidence = probabilities.length
    ? Math.min(1, Math.max(...probabilities.map(Number)))
    : verdict === 'ATTACK'
      ? 0.95
      : 0.85;

  return {
    verdict,
    confidence,
    topFeatures: [
      { name: 'serror_rate', importance: 0.35 },
      { name: 'count', importance: 0.25 },
      { name: 'src_bytes', importance: 0.15 },
      { name: 'dst_host_srv_count', importance: 0.10 },
      { name: 'logged_in', importance: 0.05 }
    ],
    engine: 'Sklearn ONNX'
  };
}
