# Deployment / Pixel Studio
Use Settings → Pages → Deploy from a branch → main → /docs → Save. The repository previously had a successful default Pages deployment. The custom Pages job was removed from the middleware CI to avoid competing deployment sources; use only the branch source. If the repository is currently configured for GitHub Actions, change it to branch deployment. No custom deploy workflow is needed.
Check Actions → pages build and deployment. Run Published CDN check manually to verify the immutable npm 1.0.0 assets. Rust native and JavaScript tests run separately in Bila middleware; upstream CI retains Python matrix.
The Studio uses local ESM files and can run via python -m http.server 8080 --directory docs. No external font required. Offline WASM is not bundled.
