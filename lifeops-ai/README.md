# LifeOps

Turns documents, deadlines and obligations into prioritized actions. Upload a document, and LifeOps extracts the obligation, scores its priority with fixed rules, and shows it in an Action Graph and a "What should I do today?" plan.

**Status:** backend logic is tested; frontend, CDK and all AWS calls are written but **not yet built, deployed or verified**. See [docs/limitations.md](docs/limitations.md).

## Run the demo locally (no AWS, no login)
```bash
cd frontend && npm install && npm run dev
```
Click **Try demo**. Demo mode uses synthetic data and never reads or uploads your files.

## Test the backend
```bash
cd backend && npm install && npm test        # Node 22.6+; runs TypeScript directly
npm run typecheck
```

## Deploy to AWS (needs your credentials)
```bash
aws sts get-caller-identity                  # confirm you are connected; screenshot it
cd backend && npm install                    # creates package-lock.json (needed by CDK bundling)
cd ../frontend && npm install && npm run build
cd ../infrastructure && npm install
npx cdk bootstrap
npx cdk synth  -c bedrockModelId=<your-bedrock-model-or-inference-profile-id>
npx cdk deploy -c bedrockModelId=<your-bedrock-model-or-inference-profile-id>
```
The deploy prints `SiteUrl`, `ApiUrl`, bucket and table names. Verify each service (S3 object, Lambda logs, DynamoDB item, `source: "model"` in the upload response, EventBridge-triggered Lambda) and keep screenshots in `docs/proof/`. Run `npx cdk destroy` afterwards to avoid charges, and set a billing alert first.

## Layout
`frontend/` React + Vite + Tailwind + Framer Motion · `backend/` TypeScript Lambdas · `infrastructure/` AWS CDK · `prompts/` model prompts · `docs/` architecture, demo script, limitations.
