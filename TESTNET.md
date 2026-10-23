# DelegateLab public Stellar testnet milestone

Recorded 23 October 2026. These are disposable fixture contracts. Do not send assets to them. The vulnerable build intentionally skips the per-invocation amount cap.

## Reproduce without a signer

Clone the sibling repositories described in INTEGRATION.md, then:

```bash
npm ci
node replay-testnet.mjs
node verify-testnet.mjs
```

Offline replay decodes saved diagnostic XDR and recomputes reports. Live verification checks the testnet passphrase, deployed WASM pins and the two transaction receipts through TLS RPC. It needs no secret. RPC retention, contract TTL expiry or testnet resets can prevent later live verification; that is not proof the captured transaction never existed. Offline evidence is not an independent consensus proof.

## Results

The strict account accepted the cap boundary and rejected over-cap, wrong-recipient, wrong-target, zero and negative cases. The vulnerable build accepted the over-cap mutation. All simulations used signed CAP-71 delegated credentials and `authMode=enforce`, not recording-mode authorization bypass. Recording simulation was used only to obtain the invocation/auth skeleton before signing. Exact emitted fixture account and contract error code distinguish a policy rejection from unrelated infrastructure errors.

Two invocations were also submitted and confirmed on testnet. The sink records intent and a counter only; it never transfers tokens. Rejected cases are captured enforced simulations, not claimed on-chain failed transactions.

- strict / at-cap: `a643197e5a7a06408730e1834367f15d659009a486fd4c5d4e5d69eaa0aa25da`, ledger 5347632.
- vulnerable / over-cap: `e38cd1eb4e856a5cdccba50de7b90dff1630a8a41ab5fc5b652cf684a6532d68`, ledger 5347633.

## Deployed fixtures

| Fixture | Contract | WASM SHA-256 |
|---|---|---|
| sink | `CC7ED3SAEIWXUMDZLRT2J3IBF4ACXXYJKZ36574POWS4T37YNZDSAGGN` | `ee683a1482f46eaee73ea707b63c884a04f680b9b9c4ea4705cda1e8fbe5d532` |
| alternateSink | `CDLG3E4N2IJWUBLGPLDUWPCJGMTF7JKLNVDM7RKT5YYVJGSPVEBD45J4` | `ee683a1482f46eaee73ea707b63c884a04f680b9b9c4ea4705cda1e8fbe5d532` |
| strict | `CCJ5FBPZOQWMLDDHFYVK5G3RNOWWLI5VBJSERB2W4PDCX5YD5AM4TUHH` | `d9e3ebe724ff3dc23ff9ff9a3224a382bc63623c681e5d8048554dc69042a390` |
| vulnerable | `CB2XCHOL6BFXY3GAZCYYIDKRRSXQHSNMB4U7UDTX7YXMUNHZZNHUQHTY` | `9d1c5b359136be3dc289c23f58ee9537e1f8bcac664cfff1a7defa2502095412` |

## Run a new disposable pilot

Use official Stellar CLI 28.1.0, Rust stable, pinned soroban-sdk 29.0.1 and the committed Cargo.lock. The backend pins official JavaScript SDK 17.3.0. Testnet protocol was 29 at capture.

```bash
cd ../delegatelab-contracts
node build.mjs
cd ../delegatelab-backend
npm ci
node deploy-testnet.mjs
node run-testnet.mjs
node commit-testnet.mjs
```

These explicit CLI commands generate a new key in ignored .private/ (mode 0600), request disposable Friendbot testnet funding, deploy all four fixtures, run the signed suite, and submit two no-asset invocations. They refuse a non-testnet network. Public captured testnet-evidence.json is not overwritten: your new run remains in .private/run-evidence.json. Never upload .private/ or use a funded production wallet. Review/redact only public run evidence before publishing it. The HTTP server has no signing route or access to these CLI key files.

## Limits

Six cases and one delegate. No arbitrary wallet support, nested-delegate coverage, function mutation, nonce replay, expiry mutation, aggregate spending limits or formal security proof. The cap is per invocation; it is not a rolling spending budget. These fixtures cannot be described as production-safe accounts. All interpretation of external contracts requires a separately reviewed adapter and explicit policy.
