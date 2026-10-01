# Limitations (be honest with judges)

- **Not deployed or verified on AWS.** The CDK stack, Bedrock, S3 and DynamoDB adapters, and EventBridge job were written without AWS access. Expect small fixes on first `cdk synth` / `cdk deploy`.
- **Tested:** backend logic and API handler (8 tests, in-memory stores, demo model). Not tested: frontend build, CDK synth, any real AWS call.
- **No authentication.** Users are an `x-user` header defaulting to `demo`. Do not store real private documents. The API is public and throttled only.
- **Reminders are logged, not delivered.** No email/SMS (SES/SNS) yet. The in-app "reminder" is local state in the frontend.
- **Frontend demo state is in memory** and resets on reload. Live mode keeps uploads in DynamoDB but the dashboard list is not reloaded from `/actions` yet.
- **Single obligation per document**, no OCR beyond what the Bedrock model does, PDFs/images up to 5MB.
- **Priority rules are simple** and duplicated in frontend and backend; keep them in sync.
- **Not ported from the earlier HTML demo:** command palette, "Ask LifeOps" bar, notification drawer.
- Backend scoring uses UTC dates.
