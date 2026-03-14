# Part 3 — Defect Governance & QA Maturity

## Q1 — Severity vs. Priority

**I would not ignore it. "Flaky environment" is a guess, not a fact.**

**1. Log it properly.**
The test shows `Test Case 3 [undefined]: Empty Email Field – FAILED` on the Register page. The `[undefined]` tag means the test setup itself has a problem — we don't even know which device failed. That's already worth fixing.

**2. Classify it:**
- **Severity: High** — Registration is how every investor joins. If empty email validation is broken, users could sign up with bad data, which breaks identity verification, notifications, and compliance.
- **Priority: High** — This is the first thing users see. A bug here means fewer investors can sign up. Fix it this sprint.

**3. What I do:**
- **Try to reproduce it.** Run the test again on the device where it failed. If it fails again, it's a real bug — file it with screenshots, device info, and logs. Tag it P1. We don't release until it's fixed.
- **If it passes on retry,** I still file it — but as a test setup issue. The `[undefined]` label needs fixing so we know which device is being tested.
- **Talk to the developer.** I'd say: "Flaky tests fail randomly across all devices. This one failed on one specific device — that's a pattern, not noise. Let's spend 15 minutes checking it together before we skip it."

**Bottom line:** In fintech, we can't afford to guess. Investigating takes 30 minutes. A registration bug in production costs us users and trust.

---

## Q2 — Solo QA in a Fast-Moving Team

**I can't test 12 tickets alone, so I focus on what matters most and get the team to help.**

**1. Sort tickets by risk:**
- **High risk (3 tickets):** Onboarding and wallet — these handle money and compliance. I test these myself.
- **Medium risk:** Anything that changes user data or existing behavior. I review and spot-check.
- **Low risk:** Copy changes, styling, internal tools. Developers can test these with a checklist I give them.

**2. What I automate first:**
The 2 high-risk tickets that have no automation — especially wallet. Why wallet first:
- Wallet bugs are money bugs. They're the most expensive to fix later.
- I write API tests, not UI tests. API tests are faster to build and more stable. I can get useful wallet coverage in 1-2 days.

**3. What I test by hand:**
The 3 critical tickets get my full attention — I explore edge cases like wrong amounts, empty fields, and error messages. For the other 9, developers self-test using my checklist.

**4. How I get developers to help with testing:**

I don't tell them "do QA work." I make it about the team shipping faster:

- **Give them a simple checklist.** For each ticket, I write 5-6 things to verify. Takes 10 minutes. No setup needed.
- **Pair with them on hard tickets.** I sit with the developer and walk through test cases together. They learn what to look for.
- **Show the numbers.** "12 tickets, 1 QA, 5 days. If I test everything alone, we're late. If 3 devs verify their own low-risk tickets, we ship on time."
- **Say thank you publicly.** When a developer catches a bug on their own, I mention it in standup. People repeat what gets recognized.
- **Update the Definition of Done.** Add "developer ran the test checklist" as a step. This makes quality everyone's job, not just mine.

**The goal: I don't do less testing — I make the whole team better at catching bugs.**

---

## Q3 — Production Quality Monitoring

**How to monitor app.kilde.sg in production without affecting real investors:**

### 1. Uptime Monitoring
- Ping key pages (homepage, login, wallet, API health) every 1-3 minutes from different regions.
- **Tool:** Datadog Synthetics, Checkly, or UptimeRobot.
- **Alert** the team on Slack/PagerDuty if any page is down or takes more than 3 seconds to load.
- **Impact on users:** None — it's just loading a page like any normal visitor.

### 2. Functional Smoke Tests
- Create a **test account** (e.g., `qa-smoke@kilde.sg`) flagged as non-real in the system, excluded from reports and analytics.
- Run a simple test every 30-60 minutes:
  - Log in
  - Check that the dashboard loads
  - Check that wallet balance returns a response
  - Check that tranche listing shows data
  - Check that auto-investments page loads
  - Log out
- **Read-only only** — no investing, no wallet changes, no financial actions.
- **Safety net:** Test account has $0 balance and no payment method. Even if something goes wrong, no money moves.
- **Tool:** Playwright or Cypress running on a scheduled cloud job.

### 3. Visual Regression
- Take **screenshots** of key pages (Dashboard, Investments, Auto-investments, Wallet, Statement) after every deployment or once daily.
- Compare each screenshot to a saved baseline. If the page looks different beyond a small threshold, send an alert for review.
- **Tool:** Percy, Chromatic, or Playwright's built-in screenshot comparison.
- **Impact on users:** None — screenshots use the test account in a headless browser.

### 4. Passive Monitoring (No Test Traffic Needed)
- **Error tracking:** Watch for spikes in 500 errors on production APIs. Alert if error rate goes above 1%.
- **Page speed:** Track how fast pages load for real users using Real User Monitoring. Alert if pages get slower.
- **Log monitoring:** Watch application logs for new errors, especially in wallet and investment flows.
- **Business metrics:** If daily investments suddenly drop by 20%+ with no known reason, that could mean something is broken. Set up an alert for this.

### Key Point
Production monitoring doesn't replace testing before release — it catches what testing missed. The goal is to find problems in minutes, not wait for investors to report them.
