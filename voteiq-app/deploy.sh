#!/bin/bash
# ╔══════════════════════════════════════════════════════════╗
# ║  VoteIQ — Cloud Run Deployment Script                   ║
# ║  Run this from inside the voteiq-app/ folder            ║
# ╚══════════════════════════════════════════════════════════╝

set -e  # Exit on any error

# ── CONFIG — edit these ─────────────────────────────────────
PROJECT_ID="your-gcp-project-id"       # e.g. my-project-123456
SERVICE_NAME="voteiq-frontend"
REGION="us-central1"
# ────────────────────────────────────────────────────────────

IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying VoteIQ to Cloud Run..."
echo "   Project : $PROJECT_ID"
echo "   Service : $SERVICE_NAME"
echo "   Region  : $REGION"
echo ""

# 1. Authenticate (skip if already authenticated)
echo "🔐 Step 1/4 — Checking authentication..."
gcloud auth print-access-token > /dev/null 2>&1 || gcloud auth login

# 2. Set project
echo "📁 Step 2/4 — Setting project..."
gcloud config set project "$PROJECT_ID"

# 3. Build & push image via Cloud Build (no Docker needed locally)
echo "🔨 Step 3/4 — Building and pushing image..."
gcloud builds submit --tag "$IMAGE" .

# 4. Deploy to Cloud Run
echo "☁️  Step 4/4 — Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app URL:"
gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --format "value(status.url)"
