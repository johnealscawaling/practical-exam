# Part 1 — Test Strategy & Migration Architecture

## 1. Framework Recommendation

### Why Playwright over Selenium

| Concern | Selenium (Current) | Playwright (Proposed) |
|---------|--------------------|-----------------------|
| **Speed** | Slower — goes through an extra layer (WebDriver) to talk to the browser | Faster — connects to the browser directly |
| **Waiting** | You have to add manual waits; main cause of flaky tests | Waits for elements automatically — fewer random failures |
| **Browsers** | Needs separate drivers installed for each browser | Comes with Chrome, Firefox, and Safari engines built in |
| **Debugging** | Limited to screenshots and logs | Has a trace viewer, video recording, and step-by-step inspector |
| **TypeScript** | Works but not built for it | Built for TypeScript with full auto-complete |

### Proposed Stack

| Component | Choice | Why |
|-----------|--------|-----|
| **Language** | TypeScript | Catches typos and errors while you write; better editor support |
| **Test Runner** | Playwright Test (`@playwright/test`) | Has everything built in — parallel runs, retries, reports. No need to add Jest or Mocha |
| **Structure** | Page Object Model (POM) | Each page (Login, Wallet, Dashboard, etc.) gets its own file. If a button name changes, you update one file, not every test |
| **Fixtures** | Playwright's built-in fixtures | Reusable setups like "already logged in" or "on the wallet page" so you don't repeat login steps in every test |
| **Reports** | HTML report + JUnit XML | HTML report lets you see screenshots and traces. JUnit XML works with CI tools like GitHub Actions |
| **Config** | `playwright.config.ts` | One config file sets up all browsers and devices. Run different browsers from the same place |

### Folder Structure

```
tests/
├── fixtures/           # Reusable setups (logged-in state, test data)
├── pages/              # Page Object files
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── dashboard.page.ts
│   ├── tranche.page.ts
│   ├── investment.page.ts
│   ├── profile.page.ts
│   └── wallet.page.ts
├── specs/              # Test files grouped by feature
│   ├── login.spec.ts
│   ├── registration.spec.ts
│   ├── tranche-listing.spec.ts
│   ├── investment-detail.spec.ts
│   ├── profile-settings.spec.ts
│   └── wallet.spec.ts
├── utils/              # Helpers (API calls, test data generators)
└── playwright.config.ts
```

### Cross-Browser / Cross-Device: Keep or Replace BrowserStack?

**Replace BrowserStack for daily use. Keep it only for real-device testing.**

- **Daily CI runs:** Use Playwright's built-in browsers (Chrome, Firefox, Safari engine). Covers 95% of needs, runs faster, and costs nothing.
- **Keep BrowserStack for:** Weekly or pre-release checks on real iPhones and Android phones, where only a real device can catch hardware-specific bugs (touch gestures, camera for identity verification, native scrolling).

This saves money on BrowserStack while making daily tests faster.

---

## 2. AI-Assisted Test Generation

### How I Would Use Claude Code

| Task | Use AI? | Details |
|------|---------|---------|
| **Writing test code** | Yes | Give Claude Code the page, the user flow, and the page object — it writes the full test file. Saves 60-70% of writing time. |
| **Picking selectors** | Yes, but check them | Claude Code can suggest how to find elements on the page. I always check against the real page — AI can pick the wrong element. |
| **Creating page objects** | Yes | Describe what's on the page, Claude Code writes the class with all the elements and actions. |
| **Writing failure cases** | Yes | Give it the happy path and ask "what could go wrong?" — it writes tests for empty fields, wrong formats, edge cases. |
| **Deciding what to test** | No | Choosing what matters most needs human judgment. AI doesn't know our business or our users. |
| **Checking business rules** | No | Only someone who knows the product can say if the expected result is actually correct. AI writes the check, but I decide what to check for. |
| **Fixing flaky tests** | Sometimes | Claude Code can help read error logs, but flaky tests usually need real investigation — timing issues, data problems, environment setup. |

### What I Check Before Merging AI-Generated Tests

1. **Selectors** — Are they stable? Using test IDs or button names, not fragile CSS paths that break easily?
2. **Checks** — Is it testing the right thing? Not just "page loaded" but the actual result the user should see?
3. **Independence** — Can this test run on its own, in any order, without leftover data from other tests?
4. **Readability** — Would another person on the team understand what this test does?

### Real Example: Wallet "Add Bank Details" Flow

**Prompt I would give Claude Code:**

```
Write a Playwright test in TypeScript for the Kilde wallet "Add Bank Details" flow.

Page: app.kilde.sg → Wallet tab → Add Bank Details button
Flow:
1. User clicks "Add Bank Details" button
2. A modal opens with fields: Bank Name, Account Number, Account Holder Name, SWIFT Code, Currency
3. SWIFT code field has autofill — when user types a valid SWIFT code, Bank Name fills in automatically
4. User fills all fields and clicks Submit
5. Bank details show up on the wallet page

Write tests for:
- Happy path: fill all fields, submit, check bank details are saved
- Validation: submit with empty fields, check error messages appear
- SWIFT autofill: type a valid SWIFT code, check Bank Name fills in

Use Page Object Model. The page class is WalletPage.
Use Playwright's built-in checks and auto-wait.
Use data-testid selectors where possible.
```

## 3. CI/CD Quality Gates

### Pipeline Structure

```
┌─────────────────────────────────────────────────────────┐
│                    PR (Pull Request)                     │
│                                                         │
│  When: Every PR to main                                 │
│  Tests: Quick smoke tests only (~2-3 min)               │
│         - Login flow                                    │
│         - Registration happy path                       │
│         - Wallet page loads                             │
│         - Tranche listing loads                         │
│  Browser: Chrome only (for fast feedback)               │
│  Rule:   PR cannot merge if smoke tests fail            │
├─────────────────────────────────────────────────────────┤
│                  Merge to Main                          │
│                                                         │
│  When: After PR is merged                               │
│  Tests: Full test suite (~15-20 min)                    │
│         - All flows: login, registration, tranche,      │
│           investment detail, profile, wallet             │
│         - Happy paths + error cases                     │
│         - Mobile screen checks                          │
│  Browser: Chrome + Firefox + Safari                     │
│  Rule:   Blocks deployment if any test fails            │
├─────────────────────────────────────────────────────────┤
│               Scheduled (Production Check)              │
│                                                         │
│  When: Every 30-60 minutes on app.kilde.sg              │
│  Tests: Read-only checks (~1-2 min)                     │
│         - Login with test account                       │
│         - Dashboard loads                               │
│         - Wallet balance responds                       │
│         - Tranche listing shows data                    │
│         - Logout                                        │
│  Browser: Chrome (headless)                             │
│  Alert:  Slack/PagerDuty if anything fails              │
└─────────────────────────────────────────────────────────┘
```

### Shadow Testing for Login → identity verification → Wallet

The **login → identity verification → wallet** flow touches real user data and outside services, so we can't run normal tests on production. Instead, we use a safe "shadow" approach:

**How it works:**
1. **Test account** — A real account (`qa-shadow@kilde.sg`) marked as a test user. It's hidden from analytics, reports, and compliance dashboards.
2. **Only look, don't touch** — The test logs in, checks that the identity verification page loads (doesn't submit anything), checks that the wallet page shows a balance (doesn't move money).
3. **No money at risk** — The test account has $0 and no payment method. Even if something goes wrong, nothing happens.
4. **No outside calls** — The test does not trigger real identity verification checks (no ID upload, no selfie). It just checks that the pages load and show the right things.
5. **Runs every 30-60 minutes** — If this path breaks in production, we know within an hour.

**What this catches without touching real data:**
- Pages failing to load (server errors, bad deployments)
- Login not working
- Missing or broken page elements
- APIs not responding (wallet down, identity verification service down)

---

## 4. Regression Risk & Coverage Gaps

Based on the test log showing `Test Case 3 [undefined]: Empty Email Field – FAILED` and the current Selenium + BrowserStack setup, here are 3 gaps:

### Gap 1: We Don't Know Which Device Failed — `[undefined]` Tags

The test log shows `[undefined]` where the device or browser name should be. This means:
- We can't tell **which device** had the problem. Was it just one phone? All browsers? We don't know.
- We can't spot **patterns over time**. The same device might fail every week and we'd never notice because there's no label.
- **Fix:** In Playwright, every test run is automatically tagged with the browser and device name from the config. No extra work needed — it just shows up in the report.

### Gap 2: Not Enough Failure Cases Being Tested

The test log only shows one validation test for Registration (Empty Email). But there are many more ways a user can enter bad data:
- **Bad email formats** — `user@`, `user@.com`, `@kilde.sg`, email with spaces
- **Weak passwords** — too short, missing special characters, missing uppercase
- **Duplicate sign-up** — trying to register with an email that's already taken
- **Very long input** — pasting 500 characters into a name field
- **Mismatched passwords** — password and confirm password don't match

If we only test "empty email," a bug in any other validation rule goes to production without being caught.

### Gap 3: No Way to Handle Flaky Tests

The developer said "it's flaky, ignore it." This tells me there's no process for dealing with tests that fail randomly:
- **No history** — We don't know if this test has failed before or how often. Without tracking, we can't tell a real bug from a random glitch.
- **No middle ground** — Right now, a flaky test either blocks the whole team (frustrating) or gets ignored (hides real bugs). Neither is good.
- **Fix:** Playwright can retry failed tests automatically (`retries: 2` in config). If a test passes on retry, it's marked as "flaky" in the report. Track these. If a test is flaky more than 3 times in a week, create a ticket to fix it — don't just ignore it.
