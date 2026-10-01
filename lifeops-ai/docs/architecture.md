# Architecture

```
Browser (React, CloudFront + S3)
   | POST /documents {filename, contentBase64}
   v
API Gateway (REST) --> Lambda api.ts
                         1. save raw file    -> S3 (private, encrypted)
                         2. extract fields   -> Bedrock Converse
                         3. validate JSON    -> reject bad output, else synthetic fallback
                         4. score priority   -> fixed rules
                         5. save obligation  -> DynamoDB (user, id)
                         6. GET /graph, /plan, /actions build the Action Graph from DynamoDB

EventBridge (daily 03:00 UTC) --> Lambda reminders.ts --> logs open items due within 3 days, marks reminded
```

- Frontend reads `/config.json` (written by CDK at deploy time) to find the API URL. Empty means demo mode.
- Demo mode needs no backend: the frontend uses synthetic data with dates relative to today.
