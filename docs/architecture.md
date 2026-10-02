# SplitStream architecture and learning order

SplitStream has two connected concerns, built in order:

```text
OLTP application                         Analytics platform
React → FastAPI → PostgreSQL              Kafka → Spark → MinIO / analytics tables
          ↓                                        ↓
   groups, expenses, settlements           live spending metrics and reports
```

PostgreSQL is optimized for correct, small transactional writes: registering a user, adding an expense, and recording a settlement. Later, the analytics platform will read immutable expense events rather than running expensive groupings against the transactional database.

Phase 1 intentionally contains only authentication. It establishes a secure user identity before later phases add permissions around private groups and their expenses.
