Cloudflare Workers deployment (quickstart)

1) Install Wrangler (Cloudflare CLI):
   npm install -g wrangler

2) Create a Cloudflare Worker project (or use this folder):
   - This repo has `workers/generate/worker.js` ready.

3) Create `wrangler.toml` in `workers/generate/` (or use the provided template):

   # minimal example
   name = "promptlab-pro-generate"
   main = "worker.js"
   compatibility_date = "2026-01-11"
   account_id = "<YOUR_ACCOUNT_ID>"

4) Publish the worker (local):
   cd workers/generate
   npm install -g wrangler
   wrangler login            # opens browser to authorize wrangler
   wrangler secret put GENAI_API_KEY    # paste your GenAI API key when prompted
   wrangler publish

5) Or use GitHub Actions (recommended for repeatable deploys):
   - Add two repo secrets: `CF_API_TOKEN` (Scoped token with Worker:Edit permissions) and `CF_ACCOUNT_ID` (your account id).
   - Push changes to `workers/generate/` and the `.github/workflows/deploy-cloudflare-worker.yml` workflow will publish automatically.

6) Configure the client:
   - After publish, your worker is available at `https://<name>.<your-subdomain>.workers.dev`.
   - Edit `dist/worker-url.txt` and set the worker base URL (e.g. `https://promptlab-pro-generate.<subdomain>.workers.dev`) or the full endpoint `https://.../api/generate`.
   - Commit and push `dist/worker-url.txt`, which will be deployed to your GitHub Pages site.

Notes:
- To create a scoped `CF_API_TOKEN`: go to Cloudflare dashboard → My Profile → API Tokens → Create Token → choose "Edit Cloudflare Workers" template or give `account.workers:Edit` permission.
- To find `CF_ACCOUNT_ID`: go to Cloudflare dashboard → Overview for your account; the account ID is shown in the lower-left.
- CI option: GitHub Actions uses `cloudflare/wrangler-action@2` and requires the two secrets above.

Notes:
- Worker reads `GENAI_API_KEY` from bindings (set via `wrangler secret put`).
- The worker responds to CORS preflight and allows requests from any origin. Adjust headers in `worker.js` if you want to restrict origins.
- If you prefer Cloudflare's dashboard UI, you can also create a Worker there and paste the `worker.js` code.
