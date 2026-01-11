Netlify deployment notes

1) Setup
- Connect your GitHub repo to Netlify (Site settings -> Add new site).
- Set the build command: `npm run build` and publish directory: `dist`.
- Add env var `GENAI_API_KEY` (Site -> Site settings -> Build & deploy -> Environment -> Environment variables).

2) Testing locally
- Install Netlify CLI: `npm i -g netlify-cli`
- Run `netlify dev` and test POST to `http://localhost:8888/.netlify/functions/generate` or `http://localhost:8888/api/generate`.

3) Notes
- The client calls `/api/generate` which is redirected to the function via `netlify.toml`.
- Keep your API key secret; do not commit it to the repo.
