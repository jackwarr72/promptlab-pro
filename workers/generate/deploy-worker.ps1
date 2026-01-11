# Deploy Cloudflare Worker (PowerShell)
# Prereqs: npm i -g wrangler

Write-Host "Check that you're authenticated: wrangler whoami"
wrangler whoami

Write-Host "Set the GENAI API key as a secret (you'll be prompted to paste it):"
wrangler secret put GENAI_API_KEY

Write-Host "Publish the worker"
wrangler publish

Write-Host "Done. If publish succeeds, copy the worker URL and add it to dist/worker-url.txt."