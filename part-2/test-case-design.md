# Part 2 — Test Case Design: New Feature
## 1. Scope & Risk Assessment
- **Wallet (Balance, Top-up, Withdrawal)** — Auto-invest takes money from the same wallet used for manual transactions, which could cause balance conflicts.
- **Manual Investment Flow** — Both manual and auto-invest compete for the same tranche slots, so manual investors might see "fully subscribed" unexpectedly.
- **Tranche Listing & Availability** — Auto-invest checks many tranches at once, which could slow down or break the existing tranche listing pages.
- **Onboarding / KYC Workflow** — Auto-invest must block unverified users; if not, people who haven't finished KYC could make investments.
- **Portfolio & Dashboard** — The dashboard must show auto-invested amounts correctly without counting them twice or missing them.
- **Statement / Transaction History** — Adding a new transaction type could break existing statement pages or exports if they don't expect it.
- **Notification Service** — Too many auto-invest notifications could delay important ones like OTP codes and KYC updates.
- **User Authentication & Session Management** — Auto-invest runs in the background without a user session, so the new auth method must not weaken existing login security.

---

## 2. Test Cases

### TC-01: Happy Path — Scheduled Investment Executes Successfully

| Field | Detail |
|-------|--------|
| **Preconditions** | User has a verified account, enough wallet balance (e.g., $10,000), an active monthly schedule set to run today, and a target tranche that is open with space left. |
| **Steps** | 1. System runs the scheduled job at the set date/time. 2. System checks wallet balance is enough. 3. System checks the tranche is open and has space. 4. System takes money from the wallet and creates the investment. 5. System sends a success notification. |
| **Expected Result** | Wallet balance goes down by the exact investment amount. Investment shows up in the portfolio. Transaction is recorded in the statement. User gets a confirmation notification. |
| **Automation** | **Automate** — This is the main money-making flow; it must work on every build. |

---

### TC-02: Insufficient Wallet Balance at Execution Time

| Field | Detail |
|-------|--------|
| **Preconditions** | User has an active schedule; wallet balance is less than the investment amount. |
| **Steps** | 1. Scheduled job runs. 2. System checks wallet — not enough money. |
| **Expected Result** | No investment is made. No money is taken. User gets a "not enough balance" notification. The schedule stays active for next month (not cancelled). |
| **Automation** | **Automate** — Most common failure case; must confirm no money is taken. |

---

### TC-03: Tranche No Longer Available at Execution Time

| Field | Detail |
|-------|--------|
| **Preconditions** | User has an active schedule and enough balance, but the target tranche is now full or closed. |
| **Steps** | 1. Scheduled job runs. 2. Balance check passes. 3. Tranche check fails — full or closed. |
| **Expected Result** | No investment is made. No money is taken from the wallet. User gets a "tranche not available" notification telling them to pick a new one. Schedule is paused until the user takes action. |
| **Automation** | **Automate** — Must confirm no money is taken when there's nowhere to invest. |

---

### TC-04: User Cancels Schedule Before Execution

| Field | Detail |
|-------|--------|
| **Preconditions** | User has an active auto-invest schedule set to run in the future. |
| **Steps** | 1. User goes to the Auto-investments page. 2. User cancels the schedule. 3. The original run date arrives. |
| **Expected Result** | No investment happens. No money is taken. Schedule shows as "Cancelled." No more notifications are sent for this schedule. |
| **Automation** | **Automate** — Must confirm cancellation actually stops the scheduled job. |

---

### TC-05: User Modifies Schedule Before Execution

| Field | Detail |
|-------|--------|
| **Preconditions** | User has an active schedule ($5,000/month into Tranche A). |
| **Steps** | 1. User changes the amount to $8,000 and switches to Tranche B. 2. The scheduled run date arrives. |
| **Expected Result** | System invests $8,000 into Tranche B — not the old values. Wallet is charged $8,000. The change is recorded in the audit log. |
| **Automation** | **Automate** — Must confirm the system uses the updated settings, not the old ones. |

---

### TC-06: API Contract Validation — Create Schedule Endpoint

| Field | Detail |
|-------|--------|
| **Type** | API-level test |
| **Validations** | 1. **Missing fields:** Sending a request without required fields returns `400 Bad Request` with a clear error message. 2. **Valid request:** A correct request returns `201 Created` with the right fields (schedule ID, status, next run date). 3. **Duplicate prevention:** Sending the same request twice does not create two schedules. |
| **Expected Result** | API responses match the expected format. No duplicate schedules are created. Error messages are clear and useful. |
| **Automation** | **Automate** — API tests are fast and catch breaking changes early. |

---

### TC-07: Security — Unauthorized Access to Another User's Schedule

| Field | Detail |
|-------|--------|
| **Type** | Security / Access control |
| **Preconditions** | User A has an active schedule. User B is logged in as a different account. |
| **Steps** | 1. User B tries to view User A's schedule via the API. 2. User B tries to delete User A's schedule via the API. |
| **Expected Result** | Both requests are blocked — returns `403 Forbidden` or `404 Not Found`. User A's schedule is not changed. |
| **Automation** | **Automate** — Security bugs must never reach production. |

---

### TC-08: Concurrent Execution and Double-Debit Prevention

| Field | Detail |
|-------|--------|
| **Preconditions** | User has one active schedule; system triggers execution. |
| **Steps** | 1. Simulate the system accidentally running the same schedule twice at the same time (e.g., due to a retry or server restart). |
| **Expected Result** | Only one investment is created. Only one debit happens. The second attempt is blocked. Audit log records the duplicate attempt. |
| **Automation** | **Automate** — Double-charging is a serious financial bug that manual testing can't reliably catch. |

---

### TC-09: Schedule Execution on Month-End Boundary

| Field | Detail |
|-------|--------|
| **Preconditions** | User has a monthly schedule set to run on the 31st. |
| **Steps** | 1. Current month is February (only 28 or 29 days). 2. System tries to find the 31st. |
| **Expected Result** | System handles the missing date properly (e.g., runs on the last day of the month instead). No error is thrown. User is told if the date was adjusted. |
| **Automation** | **Manual** — Needs business team to confirm the rules first; automate after that. |

---

### TC-10: Audit Trail and Compliance Logging

| Field | Detail |
|-------|--------|
| **Preconditions** | A schedule has gone through its full lifecycle: created, changed, run, and cancelled. |
| **Steps** | 1. Check the audit log for all events tied to this schedule. |
| **Expected Result** | Every action is logged: who did it (user or system), when, what changed, and the IP address. Logs cannot be edited or deleted after the fact. |
| **Automation** | **Monitor in Prod** — Best checked against real traffic; add basic checks in staging too. |

---

## 3. Test Data Strategy

| Concern | Approach |
|---------|----------|
| **Data Generation** | Use a script that creates fake users, wallets, and tranches with fixed IDs (e.g., `test-user-001`). Cover edge cases: zero balance, exact-match balance, large investments, and month-end dates. |
| **Data Masking / PII** | Never use real customer data outside production. Generate fake names, emails, and IDs using tools like Faker with a fixed seed so results are repeatable. |
| **Environment Isolation** | Each test environment (QA, staging, UAT) gets its own separate database. Use a fake clock that can be moved forward instead of waiting for real time. |
| **Data Cleanup** | Reset data after each test run using rollback or cleanup scripts. Each test should start fresh and not depend on data from other tests. |
| **Regulatory Compliance** | Follow data privacy laws (e.g., Data Privacy Act). Keep test data inside the test environment. Label test audit logs as "non-production" so they don't get mixed up with real records during audits. |
| **Tranche Simulation** | Set up test tranches in different states: open with space, almost full, fully subscribed, and closed. This avoids needing real market data for testing. |

---

## 4. Automation Decision Summary

| TC# | Test Case | Decision | Rationale |
|-----|-----------|----------|-----------|
| TC-01 | Happy path execution | **Automate** | Main money flow; must work on every build. |
| TC-02 | Insufficient balance | **Automate** | Most common failure; must confirm no money is taken. |
| TC-03 | Tranche unavailable | **Automate** | Must confirm no charge when there's nothing to invest in. |
| TC-04 | User cancels schedule | **Automate** | Must confirm cancellation actually stops the job. |
| TC-05 | User modifies schedule | **Automate** | Must confirm updated settings are used, not old ones. |
| TC-06 | API contract validation | **Automate** | Fast tests that catch API changes early. |
| TC-07 | Unauthorized access | **Automate** | Security bugs must never reach production. |
| TC-08 | Double-debit prevention | **Automate** | Double-charging can't be caught reliably by hand. |
| TC-09 | Boundary date handling | **Manual** | Needs business rules confirmed first; automate after. |
| TC-10 | Audit trail completeness | **Monitor in Prod** | Best verified against real traffic in production. |
