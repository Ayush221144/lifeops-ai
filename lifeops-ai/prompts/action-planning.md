# Action planning (rule-based today)

Priority and recommended order are computed in `backend/src/utils/priority.ts` and `services/pipeline.ts`, not by a model.

| Condition | Priority |
|---|---|
| Amount at least 25% above the category average, or due in 3 days or fewer | HIGH |
| Due in 4 to 14 days | MEDIUM |
| Later, or no deadline | LOW |

Ordering: HIGH, then MEDIUM, then LOW; ties broken by days left.

A model-written explanation could be added later. If so, it must only restate these rules and the document's own facts.
