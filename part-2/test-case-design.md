# Part 2 — Test Case Design: New Feature
## 1. Scope & Risk Assessment
- **Wallet (Balance, Top-up, Withdrawal)** — Auto-invest adds a new debit path that shares the same balance with existing manual transactions.
- **Manual Investment Flow** — Shares tranche capacity with auto-invest, risking unexpected "fully subscribed" errors for manual investors.
- **Tranche Listing & Availability** — Bulk strategy matching queries could degrade performance or break existing tranche listing pages.
- **Onboarding / KYC Workflow** — Auto-invest must respect the existing KYC gate; a gap could let unverified users trigger financial transactions.
- **Portfolio & Dashboard** — Portfolio aggregation logic must account for auto-invested positions without double-counting or missing entries.
- **Statement / Transaction History** — Ledger schema changes for the new transaction type could break existing statement queries or exports.
- **Notification Service** — High-volume auto-invest events could flood the shared queue and delay existing critical notifications (OTP, KYC).
- **User Authentication & Session Management** — Background execution requires a new service auth path that must not weaken existing user session validation.

---

## 2. Test Cases

### TC-01: Happy Path — Scheduled Investment Executes Successfully

| Field | Detail |
|-------|--------|
| **Preconditions** | User has an active account, sufficient wallet balance (e.g., PHP 10,000), a valid schedule (monthly, next execution today), and a target tranche that is open with available capacity. |
| **Steps** | 1. System triggers the scheduled job at the configured date/time. 2. System verifies wallet balance >= investment amount. 3. System verifies tranche is open and has capacity. 4. System debits wallet and creates the investment. 5. System sends confirmation notification. |
| **Expected Result** | Wallet is debited by the exact investment amount; investment appears in the user's portfolio; transaction is logged in the ledger; user receives a success notification. |
| **Automation** | **Automate** — Core revenue path; must run on every build. |

---

### TC-02: Insufficient Wallet Balance at Execution Time

| Field | Detail |
|-------|--------|
| **Preconditions** | User has a valid schedule; wallet balance is less than the scheduled investment amount. |
| **Steps** | 1. Scheduled job triggers. 2. System checks wallet balance — insufficient. |
| **Expected Result** | Investment is **not** executed; no debit occurs; user receives a "failed — insufficient balance" notification; schedule remains active for the next cycle (not cancelled). |
| **Automation** | **Automate** — High-likelihood failure scenario; critical to verify no partial debit occurs. |

---

### TC-03: Tranche No Longer Available at Execution Time

| Field | Detail |
|-------|--------|
| **Preconditions** | User has a valid schedule and sufficient balance; target tranche is fully subscribed or closed before execution. |
| **Steps** | 1. Scheduled job triggers. 2. Balance check passes. 3. Tranche availability check fails. |
| **Expected Result** | Investment is **not** executed; wallet is not debited; user receives a "tranche unavailable" notification with guidance (e.g., choose a new tranche); schedule is paused or flagged for user action. |
| **Automation** | **Automate** — Ensures no money is taken when the product is unavailable. |

---

### TC-04: User Cancels Schedule Before Execution

| Field | Detail |
|-------|--------|
| **Preconditions** | User has an active auto-invest schedule with a future execution date. |
| **Steps** | 1. User navigates to scheduled investments. 2. User cancels the schedule. 3. Original execution date/time arrives. |
| **Expected Result** | No investment is executed; no debit occurs; schedule status is "Cancelled"; no further notifications for this schedule. |
| **Automation** | **Automate** — Validates that cancellation is respected by the scheduler. |

---

### TC-05: User Modifies Schedule Before Execution

| Field | Detail |
|-------|--------|
| **Preconditions** | User has an active schedule (PHP 5,000/month into Tranche A). |
| **Steps** | 1. User changes amount to PHP 8,000 and target to Tranche B. 2. Execution date arrives. |
| **Expected Result** | System invests PHP 8,000 into Tranche B (not the old values); wallet is debited PHP 8,000; audit log reflects the modification history. |
| **Automation** | **Automate** — Prevents stale config from executing a wrong transaction. |

---

### TC-06: API Contract Validation — Create Schedule Endpoint

| Field | Detail |
|-------|--------|
| **Type** | API-level test |
| **Validations** | 1. **Request contract:** Sending a payload missing required fields returns `400 Bad Request` with a descriptive error body. 2. **Success response contract:** A valid request returns `201 Created` with correct fields based on schema. 3. **Idempotency:** Submitting the same request twice does not create a duplicate schedule. |
| **Expected Result** | Response status codes, headers, and body schema match the API specification; no duplicate resources are created. |
| **Automation** | **Automate** — API contract tests are fast, stable, and catch integration-breaking changes early. |

---

### TC-07: Security — Unauthorized Access to Another User's Schedule

| Field | Detail |
|-------|--------|
| **Type** | Security / Access control |
| **Preconditions** | User A has an active schedule (ex ID: `sched-123`). User B is authenticated. |
| **Steps** | 1. User B sends a GET request to fetch user A data. 2.
| **Expected Result** | Request return `403 Forbidden` (or `404 Not Found` to avoid ID enumeration); User A's schedule is unchanged. |
| **Automation** | **Automate** — Security regressions must be caught before deployment. |

---

### TC-08: Concurrent Execution and Double-Debit Prevention

| Field | Detail |
|-------|--------|
| **Preconditions** | User has one schedule; system triggers execution. |
| **Steps** | 1. Simulate the scheduler firing twice for the same schedule in the same cycle (e.g., due to a retry or race condition). |
| **Expected Result** | Only **one** investment is created and **one** debit occurs; the duplicate is rejected or deduplicated; audit log records the duplicate attempt. |
| **Automation** | **Automate** — Prevents financial loss from double-charging; critical for trust and compliance. |

---

### TC-09: Schedule Execution Across Boundary Conditions

| Field | Detail |
|-------|--------|
| **Preconditions** | User has a monthly schedule set to execute on the 31st. |
| **Steps** | 1. Current month is February (28/29 days). 2. Scheduler evaluates the execution date. |
| **Expected Result** | System gracefully handles the missing date (e.g., executes on the last day of the month or per business rules); no error is thrown; user is notified if the date was adjusted. |
| **Automation** | **Manual** — Edge case requiring calendar logic review; automate once business rules are finalized. |

---

### TC-10: Audit Trail and Compliance Logging

| Field | Detail |
|-------|--------|
| **Preconditions** | A schedule has been created, modified, executed, and cancelled across its lifecycle. |
| **Steps** | 1. Query the audit log for all events related to the schedule. |
| **Expected Result** | Every state change (created, modified, executed, failed, cancelled) is logged with timestamp, actor (user or system), IP address, and before/after values. Logs are immutable and tamper-evident. |
| **Automation** | **Monitor in Prod** — Audit log volume and completeness are most meaningful against real traffic patterns; complement with automated spot-checks in staging. |

---

## 3. Test Data Strategy

| Concern | Approach |
|---------|----------|
| **Data Generation** | Use a **factory/seed script** that creates synthetic users, wallets, and tranches with deterministic IDs (e.g., `test-user-001`). Generate data that covers edge cases: zero balance, exact-amount balance, high-value investments, and boundary dates (month-end, leap year). |
| **Data Masking / PII** | In a regulated fintech, **never use real customer data** in non-production environments. All personally identifiable information (names, emails, government IDs) must be generated synthetically or masked using irreversible tokenization. Use libraries like Faker with a fixed seed for reproducibility. |
| **Environment Isolation** | Each test environment (QA, staging, UAT) should have its own **isolated database and wallet ledger** to prevent cross-environment contamination. Scheduled job triggers should use a **test clock/time provider** that can be advanced programmatically rather than waiting for real time. |
| **Data Cleanup** | Implement **transactional rollback** or **teardown scripts** that reset state after each test run to ensure test independence. For integration tests, use a per-test-run schema or namespace. |
| **Regulatory Compliance** | Ensure test data generation and storage comply with data privacy regulations (e.g., Data Privacy Act). Test data should never leave the controlled environment. Audit logs in test environments should be clearly marked as non-production to avoid confusion during regulatory audits. |
| **Tranche Availability Simulation** | Maintain configurable tranche fixtures: open tranche (with capacity), fully-subscribed tranche, closed tranche, and tranche closing mid-cycle — to cover all execution-time scenarios without depending on live market data. |

---

## 4. Automation Decision Summary

| TC# | Test Case | Decision | Rationale |
|-----|-----------|----------|-----------|
| TC-01 | Happy path execution | **Automate** | Core revenue flow; must pass on every build. |
| TC-02 | Insufficient balance | **Automate** | Prevents silent financial errors; high-frequency scenario. |
| TC-03 | Tranche unavailable | **Automate** | Ensures no charge when product is unavailable. |
| TC-04 | User cancels schedule | **Automate** | Validates scheduler respects user intent. |
| TC-05 | User modifies schedule | **Automate** | Prevents stale config from triggering wrong transactions. |
| TC-06 | API contract validation | **Automate** | Fast, stable, catches breaking API changes early in CI. |
| TC-07 | Unauthorized access | **Automate** | Security regressions must never reach production. |
| TC-08 | Double-debit prevention | **Automate** | Financial integrity; concurrency bugs are hard to catch manually. |
| TC-09 | Boundary date handling | **Manual** | Requires business rule clarification first; automate once rules are locked. |
| TC-10 | Audit trail completeness | **Monitor in Prod** | Audit log volume and completeness are most meaningful against real traffic patterns. |
