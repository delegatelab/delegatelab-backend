# DelegateLab — Local API and testnet evidence adapter

Open-source adversarial testing for Stellar delegated-account authorization. This repository owns the backend component.

Run `npm ci`, `npm test`, `npm start`, `node replay-testnet.mjs`, and optionally `node verify-testnet.mjs`. See TESTNET.md for the disposable pilot. No HTTP route signs or submits a transaction. API.md describes input and persistence boundaries.

Read [INTEGRATION.md](INTEGRATION.md) to run the connected workspace and [ROADMAP.md](ROADMAP.md) for the exact remaining scope. All five repositories: [engine](https://github.com/delegatelab/delegatelab-engine), [contracts](https://github.com/delegatelab/delegatelab-contracts), [backend](https://github.com/delegatelab/delegatelab-backend), [frontend](https://github.com/delegatelab/delegatelab-frontend), [fixtures](https://github.com/delegatelab/delegatelab-fixtures).

MIT licensed. Early fixture-focused testnet MVP, not a production wallet or security certification.
