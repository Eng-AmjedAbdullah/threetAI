# ThreatGuardAI — Network Intrusion Detection System

## Overview

ThreatGuardAI is a professional-grade network security monitoring and intrusion detection platform. It leverages a custom-trained Random Forest Machine Learning model to analyze network traffic patterns and identify potential threats in real-time.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The application will be accessible at **http://localhost:5173**

---

## Project Structure

```
threatguardai/
├── ML/                              ← ONNX models & data scalers
├── public/
│   ├── ids_random_forest_model.onnx ← Random Forest model (ONNX format)
│   ├── data_scaler.onnx             ← Feature scaler (ONNX format)
│   └── logo.png                     ← System branding
├── src/
│   ├── pages/
│   │   ├── Landing.jsx              ← Public interface
│   │   ├── Login.jsx & Register.jsx ← Authentication
│   │   ├── Dashboard.jsx            ← Security metrics & analytics
│   │   ├── Detection.jsx            ← Real-time & batch analysis
│   │   ├── Results.jsx              ← Detailed threat forensics
│   │   ├── History.jsx              ← Secure audit trail
│   │   └── Profile.jsx              ← Account & preferences
│   ├── components/
│   │   ├── Navbar.jsx               ← Navigation
│   │   └── soc/                     ← Specialized SOC components
│   ├── context/
│   │   ├── AuthContext.jsx          ← Authentication state
│   │   └── ToastContext.jsx         ← Toast notifications
│   └── services/
│       ├── api.js                   ← Firebase API calls
│       ├── inference.js             ← Browser-side ML inference
│       └── exportService.ts         ← Data export utilities
├── firebase.json                    ← Firebase configuration
├── firestore.rules                  ← Firestore security rules
├── tailwind.config.js               ← Professional design system
└── vite.config.js                   ← Build configuration
```

---

## Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 18 + Vite                      |
| Backend     | Firebase (Firestore, Authentication, Hosting) |
| ML Engine   | ONNX Runtime (browser-side inference) |
| ML Model    | Random Forest Classifier             |
| Styling     | Tailwind CSS                         |
| Icons       | Lucide React                         |
| Charts      | Recharts                             |
| Animations  | motion/react                         |

---

## Machine Learning Integration

The system utilizes a Random Forest model for high-precision network intrusion detection:

1. **Random Forest Model:** Trained on NSL-KDD dataset with 42 network features for accurate attack classification.
2. **Browser-Side Inference:** ONNX Runtime runs model inference directly in the browser using `onnxruntime-web`.
3. **Feature Scaling:** Data scaler model ensures consistent normalization for all input features.
4. **Real-Time Processing:** Analyzes network traffic packets and returns threat classification with confidence scores.
5. **Feature Importance:** Provides granular insights into why specific traffic was flagged as a threat.

---

## Architecture

**Deployed Architecture:**
- **Frontend:** React/Vite SPA hosted on Firebase Hosting
- **Backend Services:** Firebase (Firestore database, Firebase Authentication)
- **ML Inference:** Browser-side ONNX inference (no backend GPU required)
- **Data Storage:** Firestore documents for scans, users, and audit logs

**Development:**
- Local Vite dev server for frontend development
- Firebase Emulator Suite for local testing (optional)

---

## Security & Compliance

- **Firebase Authentication:** Secure user authentication with email/password and session management
- **Role-Based Access Control (RBAC):** Distinct permissions for standard users and system administrators
- **Firestore Security Rules:** Row-level security enforced at the database layer
- **Secure Audit Trail:** Every scan is logged with persistent records for forensic analysis
- **Data Privacy:** All sensitive data stored in Firestore with appropriate access controls

---

## Build & Deployment

```bash
# Generate production build
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

