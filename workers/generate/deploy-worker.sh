#!/usr/bin/env bash
set -e

# Deploy Cloudflare Worker (bash)
# Prereqs: npm i -g wrangler

echo "Check auth: wrangler whoami"
wrangler whoami

echo "Set GENAI key as secret (you will be prompted):"
wrangler secret put GENAI_API_KEY

echo "Publishing..."
wrangler publish

echo "Published. Copy the worker URL and write it into dist/worker-url.txt"