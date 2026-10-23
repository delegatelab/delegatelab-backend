# Local HTTP API

Loopback only. Host/Origin gates and optional Bearer API_TOKEN apply. No CORS relaxation. Requests are limited to 1 MiB; the SQLite list returns the newest 100 runs. No signing endpoints.

- GET /api/health: local mode and signing=false.
- GET /api/sample: synthetic policy identifiers for the local model.
- POST /api/model: {policy, omitCap:boolean}; generate six cases and local model outcomes. Returns 201 with saved run ID. Model-only, no cryptographic validation.
- POST /api/assess: {corpus, observations}; validate exact deterministic corpus and assess one outcome per case. Imported observations remain unverified regardless of claimed contents. Returns 201.
- GET /api/runs and GET /api/runs/{id}: saved reports and history.
- GET /api/evidence: published captured testnet suite and confirmed transaction receipts. Static evidence, not a live network check.

Validation failures: 422; oversized input: 413; forbidden Host/Origin: 403; missing token: 401; missing run: 404. Failed validation does not write a run. Local databases may contain imported private data: choose retention and access policies before hosting anything. Production multi-user deployment is out of scope.
