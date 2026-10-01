# AWS services

| Service | Use |
|---|---|
| S3 (documents) | Private, encrypted store for uploaded files; 30-day expiry |
| S3 + CloudFront | Hosts the frontend over HTTPS |
| Lambda (2 functions) | API pipeline; daily reminder job |
| API Gateway (REST) | `POST /documents`, `GET /actions`, `GET /plan`, `GET /graph`, `POST /actions/{id}/complete` |
| Bedrock | Document field extraction via Converse API |
| DynamoDB | Obligations table, partition key `user`, sort key `id`, on-demand |
| EventBridge | Daily schedule that triggers reminders |
| IAM | Least-privilege grants per function (Bedrock is `*` for now; tighten to your model ARN) |

Status: all of this is **written but not yet deployed or verified**. See `limitations.md`.
