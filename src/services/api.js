/**
 * ThreatGuardAI — Firebase Realtime Database Service
 * Migrated from Firestore to Realtime Database
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFbProfile,
  updatePassword as updateFbPassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { ref, push, get, set, update, remove } from 'firebase/database';
import { rtdb, auth } from '../firebase';
import { getErrorMessage } from './errorMessages';
import { runThreatGuardInference } from './inference';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function asAppError(error, fallbackTitle = 'Error') {
  if (error?.title && error?.message) return error;

  // Preserve raw runtime message whenever available (critical for scan debugging)
  if (error?.message && String(error.message).trim()) {
    const err = new Error(String(error.message).replace(/^Error:\s*/i, ''));
    err.title = fallbackTitle;
    return err;
  }

  const mapped = getErrorMessage(error);
  const err = new Error(mapped.message);
  err.title = mapped.title || fallbackTitle;
  return err;
}

function requireAuthUser(actionMessage = 'Please sign in to perform this action.') {
  const user = auth.currentUser;
  if (!user) {
    const err = new Error(actionMessage);
    err.title = 'Authentication Required';
    throw err;
  }
  return user;
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                       */
/* -------------------------------------------------------------------------- */

export async function apiRegister({ fullName, email, password }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateFbProfile(user, { displayName: fullName });
    const token = await user.getIdToken();

    const userProfile = {
      fullName,
      email,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // non-blocking profile write
    set(ref(rtdb, `users/${user.uid}`), userProfile).catch((err) => {
      console.warn('⚠️ Could not save user profile to Realtime DB:', err?.message || err);
    });

    return { user: { id: user.uid, fullName, email, role: 'user' }, token };
  } catch (error) {
    throw asAppError(error, 'Registration Failed');
  }
}

export async function apiLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    const profile = { fullName: user.displayName, email: user.email, role: 'user' };
    return { user: { id: user.uid, ...profile }, token };
  } catch (error) {
    throw asAppError(error, 'Login Failed');
  }
}

export async function apiGetMe(token) {
  try {
    const user = requireAuthUser('Please sign in to continue.');
    return {
      id: user.uid,
      fullName: user.displayName || 'User',
      email: user.email,
      role: 'user'
    };
  } catch (error) {
    throw asAppError(error, 'Authentication Required');
  }
}

/* -------------------------------------------------------------------------- */
/* Seeding                                                                    */
/* -------------------------------------------------------------------------- */

export async function seedDefaultUsers() {
  try {
    const defaults = [
      { fullName: 'System Administrator', email: 'admin@threatguard.ai', password: 'Admin@123', role: 'admin' },
      { fullName: 'Standard User', email: 'user@threatguard.ai', password: 'User@123', role: 'user' }
    ];

    for (const u of defaults) {
      try {
        const usersRef = ref(rtdb, 'users');
        const snapshot = await get(usersRef);
        let exists = false;

        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            if (child.val()?.email === u.email) exists = true;
          });
        }

        if (!exists) {
          console.log(`Seeding default user: ${u.email}`);
          const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
          const user = cred.user;

          await updateFbProfile(user, { displayName: u.fullName });

          await set(ref(rtdb, `users/${user.uid}`), {
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            createdAt: new Date().toISOString()
          });

          console.log(`Successfully seeded: ${u.email}`);
        }
      } catch (err) {
        if (err?.code !== 'auth/email-already-in-use') {
          console.warn(`Note: Default user ${u.email} not available:`, err?.message || err);
        }
      }
    }
  } catch (err) {
    console.warn('Seeding process encountered an issue:', err?.message || err);
  }
}

/* -------------------------------------------------------------------------- */
/* Detection                                                                  */
/* -------------------------------------------------------------------------- */

export async function detectSingle(features, token) {
  try {
    const user = requireAuthUser('Please sign in to run a detection scan.');

    const result = await runThreatGuardInference(features);

    const detectionData = {
      userId: user.uid,
      inputMode: 'manual',
      verdict: result.verdict,
      confidence: result.confidence,
      features,
      topFeaturesJson: JSON.stringify(result.topFeatures),
      engine: result.engine,
      createdAt: new Date().toISOString()
    };

    let saved = {
      id: `local-${Date.now()}`,
      ...detectionData,
      timestamp: new Date().toISOString()
    };

    try {
      const detectionsRef = ref(rtdb, 'detections');
      const newDetectionRef = push(detectionsRef);
      await set(newDetectionRef, detectionData);
      saved = { id: newDetectionRef.key, ...detectionData, timestamp: new Date().toISOString() };
    } catch (saveErr) {
      console.warn('⚠️ Could not persist detection to Realtime DB:', saveErr?.message || saveErr);
      saved = { ...saved, rtdbSaved: false };
    }

    return { ...result, detection: saved };
  } catch (error) {
    // IMPORTANT: preserve exact runtime/inference error details
    throw asAppError(error, 'Detection Failed');
  }
}

export async function detectBatch(records, filename, token) {
  try {
    const user = requireAuthUser('Please sign in to run a detection scan.');

    const results = await Promise.all(records.map((r) => runThreatGuardInference(r)));
    const attackCount = results.filter((r) => r.verdict === 'ATTACK').length;
    const avgConf = results.reduce((a, b) => a + b.confidence, 0) / results.length;

    const summary = {
      total: records.length,
      attack_count: attackCount,
      normal_count: records.length - attackCount,
      summary_verdict: attackCount > 0 ? 'ATTACK' : 'NORMAL',
      confidence: avgConf,
      results
    };

    const detectionData = {
      userId: user.uid,
      inputMode: 'csv',
      verdict: summary.summary_verdict,
      confidence: summary.confidence,
      filename,
      totalRecords: summary.total,
      attackCount: summary.attack_count,
      normalCount: summary.normal_count,
      topFeaturesJson: JSON.stringify(results[0]?.topFeatures || []),
      engine: results[0]?.engine || 'ONNX',
      createdAt: new Date().toISOString()
    };

    let saved = {
      id: `local-${Date.now()}`,
      ...detectionData,
      timestamp: new Date().toISOString()
    };

    try {
      const detectionsRef = ref(rtdb, 'detections');
      const newDetectionRef = push(detectionsRef);
      await set(newDetectionRef, detectionData);
      saved = { id: newDetectionRef.key, ...detectionData, timestamp: new Date().toISOString() };
    } catch (saveErr) {
      console.warn('⚠️ Could not persist batch detection to Realtime DB:', saveErr?.message || saveErr);
      saved = { ...saved, rtdbSaved: false };
    }

    return { ...summary, detection: saved };
  } catch (error) {
    throw asAppError(error, 'Batch Analysis Failed');
  }
}

/* -------------------------------------------------------------------------- */
/* Stats / Admin                                                              */
/* -------------------------------------------------------------------------- */

export async function getStats(token) {
  try {
    const user = auth.currentUser;
    if (!user) return { total: 0, attacks: 0, normals: 0, avgConf: 0, activity: [], recent: [] };

    const snapshot = await get(ref(rtdb, 'detections'));
    if (!snapshot.exists()) return { total: 0, attacks: 0, normals: 0, avgConf: 0, activity: [], recent: [] };

    const detections = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (data?.userId === user.uid) detections.push({ id: child.key, ...data });
    });

    const total = detections.length;
    const attacks = detections.filter((d) => d.verdict === 'ATTACK').length;
    const normals = total - attacks;
    const totalConf = detections.reduce((sum, d) => sum + (d.confidence || 0), 0);
    const avgConf = total > 0 ? Math.round((totalConf / total) * 100) : 0;

    const activityMap = {};
    detections.forEach((d) => {
      try {
        const day = d.createdAt
          ? new Date(d.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        if (!activityMap[day]) activityMap[day] = { day, count: 0, attacks: 0 };
        activityMap[day].count += 1;
        if (d.verdict === 'ATTACK') activityMap[day].attacks += 1;
      } catch (err) {
        console.warn('Date conversion error:', err);
      }
    });

    const activity = Object.values(activityMap).sort((a, b) => a.day.localeCompare(b.day)).slice(-7);
    const recent = detections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return { total, attacks, normals, avgConf, activity, recent };
  } catch (err) {
    console.error('Error fetching stats:', err);
    return { total: 0, attacks: 0, normals: 0, avgConf: 0, activity: [], recent: [] };
  }
}

export async function getAdminStats(token) {
  const user = auth.currentUser;
  if (!user) return { total_users: 0, total_scans: 0, total_attacks: 0, roles: [], user_activity: [] };

  try {
    let total_users = 0;
    let total_scans = 0;
    let total_attacks = 0;

    try {
      const usersSnapshot = await get(ref(rtdb, 'users'));
      total_users = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
    } catch (err) {
      console.warn('Error counting users:', err);
    }

    try {
      const detectionsSnapshot = await get(ref(rtdb, 'detections'));
      if (detectionsSnapshot.exists()) {
        const detections = detectionsSnapshot.val();
        total_scans = Object.keys(detections).length;
        Object.values(detections).forEach((d) => {
          if (d.verdict === 'ATTACK') total_attacks += 1;
        });
      }
    } catch (err) {
      console.warn('Error counting detections:', err);
    }

    let roles = [];
    let user_activity = [];

    try {
      const usersSnapshot = await get(ref(rtdb, 'users'));
      if (usersSnapshot.exists()) {
        const roleMap = {};
        const userActivityMap = {};

        usersSnapshot.forEach((child) => {
          const data = child.val();
          const role = data.role || 'user';
          roleMap[role] = (roleMap[role] || 0) + 1;

          if (data.createdAt) {
            const createdDay = new Date(data.createdAt).toISOString().split('T')[0];
            userActivityMap[createdDay] = (userActivityMap[createdDay] || 0) + 1;
          }
        });

        roles = Object.entries(roleMap).map(([role, count]) => ({ role, count }));
        user_activity = Object.entries(userActivityMap)
          .map(([day, count]) => ({ day, count }))
          .sort((a, b) => b.day.localeCompare(a.day))
          .slice(0, 7)
          .reverse();
      }
    } catch (err) {
      console.warn('Error processing users:', err);
    }

    return { total_users, total_scans, total_attacks, roles, user_activity };
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return { total_users: 0, total_scans: 0, total_attacks: 0, roles: [], user_activity: [] };
  }
}

export async function getAdminReportsSummary(token) {
  try {
    let total_users = 0;
    let total_scans = 0;
    let total_attacks = 0;
    const modeMap = {};
    const userMap = {};

    try {
      const usersSnapshot = await get(ref(rtdb, 'users'));
      total_users = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;
    } catch (err) {
      console.warn('Error getting users:', err);
    }

    try {
      const detectionsSnapshot = await get(ref(rtdb, 'detections'));
      if (detectionsSnapshot.exists()) {
        const detections = detectionsSnapshot.val();
        total_scans = Object.keys(detections).length;

        Object.values(detections).forEach((d) => {
          if (d.verdict === 'ATTACK') {
            total_attacks += 1;
            const mode = d.inputMode || 'manual';
            modeMap[mode] = (modeMap[mode] || 0) + 1;
          }
          userMap[d.userId] = (userMap[d.userId] || 0) + 1;
        });
      }
    } catch (err) {
      console.warn('Error getting detections:', err);
    }

    let top_users = [];
    try {
      const usersSnapshot = await get(ref(rtdb, 'users'));
      if (usersSnapshot.exists()) {
        usersSnapshot.forEach((child) => {
          top_users.push({
            fullName: child.val().fullName,
            scanCount: userMap[child.key] || 0
          });
        });
        top_users = top_users.sort((a, b) => b.scanCount - a.scanCount).slice(0, 5);
      }
    } catch (err) {
      console.warn('Error getting top users:', err);
    }

    const attacks_by_mode = Object.entries(modeMap).map(([inputMode, val]) => ({ inputMode, val }));

    return {
      total_users: [{ val: total_users }],
      total_scans: [{ val: total_scans }],
      total_attacks: [{ val: total_attacks }],
      attacks_by_mode,
      top_users
    };
  } catch (err) {
    console.error('Error fetching admin reports:', err);
    return {
      total_users: [{ val: 0 }],
      total_scans: [{ val: 0 }],
      total_attacks: [{ val: 0 }],
      attacks_by_mode: [],
      top_users: []
    };
  }
}

export async function getAdminDetections({ limit: l = 50 } = {}, token) {
  try {
    const detectionsSnapshot = await get(ref(rtdb, 'detections'));
    if (!detectionsSnapshot.exists()) return { rows: [] };

    const usersSnapshot = await get(ref(rtdb, 'users'));
    const userLookup = {};
    if (usersSnapshot.exists()) {
      usersSnapshot.forEach((child) => {
        userLookup[child.key] = child.val();
      });
    }

    const rows = [];
    detectionsSnapshot.forEach((child) => {
      const data = child.val();
      const user = userLookup[data.userId] || {};
      rows.push({
        id: child.key,
        ...data,
        userName: user.fullName || 'Unknown',
        userEmail: user.email || 'Unknown',
        createdAt: data.createdAt
      });
    });

    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    rows.splice(l);
    return { rows };
  } catch (err) {
    console.error('Error fetching admin detections:', err);
    return { rows: [] };
  }
}

export async function getAdminLogs(l = 100, token) {
  return [];
}

export async function getAdminUsers(search, token) {
  try {
    const snapshot = await get(ref(rtdb, 'users'));

    let users = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => users.push({ id: child.key, ...child.val() }));
    }

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(s)) ||
          (u.email && u.email.toLowerCase().includes(s))
      );
    }

    return users;
  } catch (error) {
    throw asAppError(error, 'User Query Failed');
  }
}

export async function updateAdminUser(id, data, token) {
  try {
    await update(ref(rtdb, `users/${id}`), data);
    return { success: true };
  } catch (error) {
    throw asAppError(error, 'User Update Failed');
  }
}

export async function deleteAdminUser(id, token) {
  try {
    await remove(ref(rtdb, `users/${id}`));

    const snapshot = await get(ref(rtdb, 'detections'));
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        if (child.val().userId === id) {
          remove(ref(rtdb, `detections/${child.key}`)).catch((err) => {
            console.warn('Error deleting detection:', err);
          });
        }
      });
    }

    return { success: true };
  } catch (error) {
    throw asAppError(error, 'User Deletion Failed');
  }
}

export async function getHistory({ limit: l = 50, offset = 0, verdict = 'all', search = '' } = {}, token) {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const snapshot = await get(ref(rtdb, 'detections'));
    if (!snapshot.exists()) return [];

    const rows = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.userId === user.uid) {
        if (verdict === 'all' || data.verdict === verdict.toUpperCase()) {
          rows.push({ id: child.key, ...data, createdAt: data.createdAt });
        }
      }
    });

    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return rows.slice(offset, offset + l);
  } catch (error) {
    throw asAppError(error, 'History Load Failed');
  }
}

export async function updateProfile(fields, token) {
  try {
    const user = requireAuthUser('Please sign in to perform this action.');

    if (fields.fullName) {
      await updateFbProfile(user, { displayName: fields.fullName });
      await update(ref(rtdb, `users/${user.uid}`), { fullName: fields.fullName });
    }

    return { success: true };
  } catch (error) {
    throw asAppError(error, 'Profile Update Failed');
  }
}

export async function changePassword({ currentPassword, newPassword }, token) {
  try {
    const user = requireAuthUser('Please sign in to perform this action.');

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    } catch (err) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        const e = new Error('Your current password is incorrect. Please try again.');
        e.title = 'Invalid Password';
        throw e;
      }
      throw err;
    }

    await updateFbPassword(user, newPassword);
    return { success: true };
  } catch (error) {
    throw asAppError(error, 'Password Change Failed');
  }
}

export async function clearHistory(token) {
  try {
    const user = requireAuthUser('Please sign in to perform this action.');

    const snapshot = await get(ref(rtdb, 'detections'));
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        if (child.val().userId === user.uid) {
          remove(ref(rtdb, `detections/${child.key}`)).catch((err) => {
            console.warn('Error deleting detection:', err);
          });
        }
      });
    }

    return { success: true };
  } catch (error) {
    throw asAppError(error, 'History Clear Failed');
  }
}

export async function getApiKeys(token) {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const snapshot = await get(ref(rtdb, 'apiKeys'));
    const keys = [];

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const data = child.val();
        if (data.userId === user.uid) keys.push({ id: child.key, ...data });
      });
    }

    return keys;
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return [];
  }
}

export async function createApiKey(keyName, token) {
  try {
    const user = requireAuthUser('Please sign in to create an API key.');

    const apiKey = `tg_${Math.random().toString(36).slice(2, 18)}`;
    const data = {
      userId: user.uid,
      keyName,
      apiKey,
      createdAt: new Date().toISOString()
    };

    const newKeyRef = push(ref(rtdb, 'apiKeys'));
    await set(newKeyRef, data);

    return { id: newKeyRef.key, ...data };
  } catch (error) {
    throw asAppError(error, 'API Key Creation Failed');
  }
}

export async function deleteApiKey(id, token) {
  try {
    await remove(ref(rtdb, `apiKeys/${id}`));
    return { success: true };
  } catch (error) {
    throw asAppError(error, 'API Key Deletion Failed');
  }
}

export async function healthCheck() {
  return { status: 'ok', engine: 'Firebase Realtime DB' };
}