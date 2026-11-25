# Bila-G2P middleware v1.0
CQN is preserved (NFC); CVNSS4.0 is an alternate input. Ambiguous decoding is rejected by default. Canonical decoding requires explicit consent. SEA-G2P remains the phoneme authority. The output is an engine-specific phoneme string, not a universal IPA inventory. Audio adapters consume the versioned IR; no voice model is bundled.

## Local use
Node 18+: npm test; npm pack --dry-run. Install the existing Python core with pip install -e . then python middleware/server.py. The adapter binds to 127.0.0.1:8765, is not a public server, and deliberately has no cross-origin access. Node usage:
```js
import {BilaG2P,httpPhonemizer} from './docs/sdk/index.js';
const g = new BilaG2P({phonemize:httpPhonemizer('http://127.0.0.1:8765/phonemize')});
console.log(await g.process('Tôi yêu tiếng Việt'));
```
Browser: serve docs/ over HTTP. The static site performs conversion locally; an HTTPS G2P endpoint must explicitly allow the site origin if cross-origin. Browser speech is CQN preview, not phoneme-driven synthesis.

## Publishing
Verify converter redistribution permission, npm scope ownership and CI before publishing. Run npm login, npm publish --access public. Pin released versions in CDN imports; for GitHub jsDelivr use an immutable commit SHA rather than a moving branch. Enable Pages under Settings > Pages > GitHub Actions. The workflow deploys docs/ on main only. No secrets in browser code.

## Audio
Pass an async synthesize(ir, options) adapter to BilaG2P. The adapter is responsible for voice model, phoneme compatibility, sample rate and PCM/WAV output. No audio export until a real backend is configured.

## Attribution
SEA-G2P upstream: Pham Nguyen Ngoc Bao. Preserve upstream LICENSE. CVNSS4.0 converter supplied by repository owner; verify separate redistribution terms before npm publication.
