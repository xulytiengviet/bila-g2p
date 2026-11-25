# Bila-G2P middleware v1.0
CQN is preserved (NFC); CVNSS4.0 is an alternate input. Ambiguous decoding is rejected by default. Canonical decoding requires explicit consent. SEA-G2P remains the phoneme authority. The output is an engine-specific phoneme string, not a universal IPA inventory. Audio adapters consume the versioned IR; no voice model is bundled.

## Local use
Node 18+: npm test; npm pack --dry-run. Install the existing Python core with pip install -e . then python middleware/server.py. The adapter binds to 127.0.0.1:18765, is not a public server, and deliberately has no cross-origin access. Node usage:
```js
import {BilaG2P,httpPhonemizer} from './docs/sdk/index.js';
const g = new BilaG2P({phonemize:httpPhonemizer('http://127.0.0.1:18765/phonemize')});
console.log(await g.process('Tôi yêu tiếng Việt'));
```
Browser: open http://127.0.0.1:18765/ after launching the adapter; it serves Studio and API on the same origin. GET /health identifies the service; GET /phonemize returns JSON 405, POST accepts JSON text. Use --port 18766 if occupied. Public Pages should use WASM or an explicitly configured HTTPS backend. The static site performs conversion locally; an HTTPS G2P endpoint must explicitly allow the site origin if cross-origin. Browser speech is CQN preview, not phoneme-driven synthesis.

## Publishing
Verify converter redistribution permission, npm scope ownership and CI before publishing. Run npm login, npm publish --access public. Pin released versions in CDN imports; for GitHub jsDelivr use an immutable commit SHA rather than a moving branch. Enable Pages under Settings > Pages > GitHub Actions. The workflow deploys docs/ on main only. No secrets in browser code.

## Audio
Pass an async synthesize(ir, options) adapter to BilaG2P. The adapter is responsible for voice model, phoneme compatibility, sample rate and PCM/WAV output. No audio export until a real backend is configured.

## Attribution
SEA-G2P upstream: Pham Nguyen Ngoc Bao. Preserve upstream LICENSE. CVNSS4.0 converter supplied by repository owner; verify separate redistribution terms before npm publication.

## Official distribution

- npm: https://www.npmjs.com/package/@vietflexmap/bila-g2p
- CDN ESM: https://cdn.jsdelivr.net/npm/@vietflexmap/bila-g2p@1.0.0/docs/sdk/index.js
- Source: https://github.com/xulytiengviet/bila-g2p
- Studio: https://xulytiengviet.github.io/bila-g2p/

```sh
npm install @vietflexmap/bila-g2p
```

The GitHub owner and npm scope differ intentionally. Published 1.0.0 is immutable; subsequent package-content changes require a new version. The static Studio uses local SDK assets, not an external CDN, for reliability.

## Lightweight Wheel Edition 1.0.0

Recommended for Windows x64 with Python 3.10: download the tested Offline ZIP artifact from the [Bila lightweight wheel workflow](https://github.com/xulytiengviet/bila-g2p/actions/workflows/bila-wheel.yml), extract, run install.bat then start-studio.bat. Python must already be installed. No Rust compiler, MSVC or SDK is required. The ZIP bundles the upstream SEA-G2P 0.10.0 binary wheel; WASM runtime is not included. Thin wheel can be installed with `python -m pip install --only-binary=:all: path/to/bila_g2p-1.0.0-py3-none-any.whl`. CLI: `bila-g2p doctor`, `bila-g2p phonemize "Xin chao Viet Nam"`, `bila-g2p studio`. Python API returns a dictionary with CQN and phonemes; CVNSS conversion remains in the Studio JavaScript SDK. Build locally: `python -m pip install build` then `python scripts/build_bila_wheel.py`. No PyPI publication is configured for this independent distribution.
