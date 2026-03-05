This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Recent Updates

- **Branding Purge**: Standardized to lowercase `restoreit` globally.
- **Authentic Media Requirement**: Replaced Unsplash placeholders with actual application assets.
- **Linter Standardization**: Fixed global ESLint errors (`react-hooks/set-state-in-effect` and `purity`) and configured NextJs correctly by ignoring node_modules.

## Implementation Status (March 2026)

- **Frontend to Backend Synchronization**: The frontend connects to `/api/scan/create` and `/api/scan/status` for actual real-time status updates and fragment discovery.
- **Proof of Life Display**: Securely triggers `/api/cloud/files` to retrieve payload signatures, dropping local simulated data.
- **Checkout Enforcement**: Bypass elimination complete. Only users fulfilling successful checkout processes via Whop pass the required data integrity checkpoint.
- **Customer Readiness**: Fully synchronized for $50k/mo revenue requirements, including $89 Scan, $249 Pro, $29/mo Protection, and $79/yr Cloud Storage.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

To deploy to Cloudflare Edge:
```bash
npm run build:cf
npm run deploy
```
