#!/bin/bash

# Firebase Hosting Deployment Helper
# This script helps deploy to Firebase Hosting

PROJECT_ID="threatguardai-45d0b"
BUILD_DIR="./dist"

echo "================================================"
echo "ThreatGuardAI - Firebase Hosting Deployment"
echo "================================================"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Build Directory: $BUILD_DIR"
echo ""

# Check if dist directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Error: Build directory not found!"
    echo "Please run: npm run build"
    exit 1
fi

echo "✓ Build directory found"
echo ""

# Method 1: Using Firebase CLI with token
if [ -n "$FIREBASE_TOKEN" ]; then
    echo "🔑 Using FIREBASE_TOKEN from environment"
    firebase deploy --only hosting --token "$FIREBASE_TOKEN"
    exit 0
fi

# Method 2: Using cached Firebase login
echo "🔍 Checking for cached Firebase authentication..."
if firebase auth:export /dev/null 2>/dev/null; then
    echo "✓ Firebase authentication found"
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    exit 0
fi

echo ""
echo "❌ Firebase authentication not found!"
echo ""
echo "To deploy to Firebase Hosting, you have three options:"
echo ""
echo "1️⃣  GitHub Actions (Recommended):"
echo "   - Add your Firebase service account to GitHub Secrets:"
echo "     FIREBASE_SERVICE_ACCOUNT_THREATGUARDAI_45D0B"
echo "   - Workflow will run automatically on push to main"
echo ""
echo "2️⃣  Local Firebase Login:"
echo "   firebase login"
echo "   firebase deploy --only hosting"
echo ""
echo "3️⃣  Using Firebase Token:"
echo "   export FIREBASE_TOKEN='your-token-here'"
echo "   firebase deploy --only hosting"
echo ""
echo "📚 Firebase Documentation:"
echo "   https://firebase.google.com/docs/hosting/deploying"
echo ""
echo "🌐 Live URL: https://threatguardai-45d0b.web.app"
