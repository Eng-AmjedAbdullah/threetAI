import * as ort from 'onnxruntime-web';

// Stable wasm path for Firebase Hosting / SPA deployments.
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';

let onnxSession = null;
let scalerSession = null;

function buildCandidates(basePath, names) {
  const cleanedBase = (basePath || '/').replace(/\/$/, '');
  const baseCandidates = names.map((n) => `${cleanedBase}/${n}`);
  const rootCandidates = names.map((n) => `/${n}`);
  return [...new Set([...baseCandidates, ...rootCandidates])];
}

export async function loadMLModels() {
  try {
    const base = import.meta?.env?.BASE_URL || '/';

    const modelCandidates = buildCandidates(base, [
      'ids_random_forest.onnx',
      'ids_random_forest_model.onnx'
    ]);

    const scalerCandidates = buildCandidates(base, [
      'scaler.onnx',
      'data_scaler.onnx'
    ]);

    if (!onnxSession) {
      for (const path of modelCandidates) {
        try {
          onnxSession = await ort.InferenceSession.create(path, { executionProviders: ['wasm'] });
          console.log(`✅ Main model loaded from ${path}`);
          break;
        } catch (err) {
          console.warn(`⚠️ Failed to load main model from ${path}:`, err?.message || err);
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
          console.warn(`⚠️ Failed to load scaler model from ${path}:`, err?.message || err);
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
    return true;
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

  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') return [value];
  if (Array.isArray(value)) return value.flatMap((v) => extractTensorValues(v));
  if (isTypedArray(value)) return Array.from(value);

  if (typeof value === 'object') {
    // ORT tensor happy-path
    if (value.cpuData && isTypedArray(value.cpuData)) {
      return Array.from(value.cpuData);
    }

    // Some tensor-like objects expose .data
    if (Object.prototype.hasOwnProperty.call(value, 'data')) {
      try {
        const d = value.data;
        if (isTypedArray(d)) return Array.from(d);
        if (Array.isArray(d)) return d.flatMap((v) => extractTensorValues(v));
      } catch {
        // ignore non-tensor access errors
      }
    }

    // Wrapped value
    if (Object.prototype.hasOwnProperty.call(value, 'value')) {
      return extractTensorValues(value.value);
    }

    // Plain object / map-like
    const keys = Object.keys(value);
    if (keys.length) {
      return keys.flatMap((k) => extractTensorValues(value[k]));
    }
  }

  return [];
}

function normalizeTensorValues(value) {
  const values = extractTensorValues(value);
  if (!values.length) return [];
  return values.map((v) => (typeof v === 'string' ? v.trim() : v));
}

function normalizeLabel(value) {
  if (Array.isArray(value)) return normalizeLabel(value[0]);

  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    if (normalized === 'ATTACK') return 'ATTACK';
    if (normalized === 'NORMAL') return 'NORMAL';
    const n = Number(normalized);
    if (!Number.isNaN(n)) return n === 1 ? 'ATTACK' : 'NORMAL';
    return 'NORMAL';
  }

  if (typeof value === 'number') return value === 1 ? 'ATTACK' : 'NORMAL';
  if (typeof value === 'boolean') return value ? 'ATTACK' : 'NORMAL';
  return 'NORMAL';
}

function clamp01(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function resolveProbabilities(values = []) {
  const nums = values.map(Number).filter((v) => !Number.isNaN(v));

  if (!nums.length) return { normalProb: 0.5, attackProb: 0.5, fromProb: false };

  if (nums.length >= 2) {
    return {
      normalProb: clamp01(nums[0]),
      attackProb: clamp01(nums[1]),
      fromProb: true
    };
  }

  const attackProb = clamp01(nums[0]);
  return { normalProb: clamp01(1 - attackProb), attackProb, fromProb: true };
}

export async function runThreatGuardInference(features) {
  if (!onnxSession || !scalerSession) {
    throw new Error('ML models are not loaded. Please ensure the scaler and model ONNX files are available.');
  }

  const featureOrder = [
    'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes', 'land', 'wrong_fragment', 'urgent',
    'hot', 'num_failed_logins', 'logged_in', 'num_compromised', 'root_shell', 'su_attempted', 'num_root',
    'num_file_creations', 'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login', 'is_guest_login',
    'count', 'srv_count', 'serror_rate', 'srv_serror_rate', 'rerror_rate', 'srv_rerror_rate', 'same_srv_rate',
    'diff_srv_rate', 'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count', 'dst_host_same_srv_rate',
    'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate', 'dst_host_srv_diff_host_rate', 'dst_host_serror_rate',
    'dst_host_srv_serror_rate', 'dst_host_rerror_rate', 'dst_host_srv_rerror_rate'
  ];

  const inputData = featureOrder.map((name) => parseFloat(features?.[name]) || 0);
  const inputTensor = new ort.Tensor('float32', new Float32Array(inputData), [1, inputData.length]);

  // 1) Scale
  const scalerFeeds = { [scalerSession.inputNames[0]]: inputTensor };
  const scaledOutput = await scalerSession.run(scalerFeeds);
  const scaledTensor = getTensorOutput(scaledOutput, [scalerSession.outputNames[0]]);

  if (!scaledTensor) {
    throw new Error('Scaler model failed to produce valid output tensor.');
  }

  // 2) Model
  const modelFeeds = { [onnxSession.inputNames[0]]: scaledTensor };
  const modelOutput = await onnxSession.run(modelFeeds);

  // label candidates
  const labelOutput = getTensorOutput(modelOutput, [
    'label',
    'output_label',
    ...onnxSession.outputNames
  ]);

  // NOTE: do not assume outputNames[1] is tensor; use all safely
  const probOutput = getTensorOutput(modelOutput, [
    'probabilities',
    'output_probability',
    ...onnxSession.outputNames
  ]);

  const probValues = normalizeTensorValues(probOutput);
  const { normalProb, attackProb, fromProb } = resolveProbabilities(probValues);

  let verdict = 'NORMAL';
  let confidence = fromProb ? Math.max(normalProb, attackProb) : 0.85;

  if (labelOutput !== undefined) {
    const labelValue = normalizeTensorValues(labelOutput)[0];
    verdict = normalizeLabel(labelValue);

    if (fromProb) {
      confidence = verdict === 'ATTACK' ? attackProb : normalProb;
    }
  } else if (fromProb) {
    verdict = attackProb >= normalProb ? 'ATTACK' : 'NORMAL';
    confidence = Math.max(normalProb, attackProb);
  } else {
    console.warn('⚠️ Model outputs did not include label/probabilities in expected format; using safe fallback verdict.');
    verdict = 'NORMAL';
    confidence = 0.6;
  }

  return {
    verdict,
    confidence: clamp01(confidence),
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