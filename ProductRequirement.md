# YusTech Managed Services — Client Portal
## Product Requirements Document — MVP
**Version 1.0 · March 2026 · Confidential**

| | |
|---|---|
| **Document Type** | Product Requirements Document — MVP |
| **Product Name** | YusTech Client Portal |
| **Version** | 1.0 |
| **Author** | Yusuf (YusTech) |
| **Status** | Draft — For Review |
| **Target Launch** | Phase 1 — 4 to 6 weeks |

---

## 1. Problem Statement

Right now, managing client subscriptions is entirely manual. Every renewal, every plan explanation, every upgrade conversation happens over WhatsApp or direct message — with Yusuf as the only communication channel.

This creates three specific failure points:

- Clients do not clearly understand what their current plan includes, leading to repeated explanations.
- Subscription renewals require manual follow-up and payment chasing, which consumes time that should go to actual service delivery.
- When clients outgrow their plan, Yusuf has to manually identify the situation, initiate the conversation, and explain the next tier — often multiple times.

The portal exists to remove Yusuf from these three conversations permanently.

---

## 2. Primary Goal

> **Stop the manual back-and-forth. Let the product do the explaining and the collecting.**

The MVP succeeds when:

- A client can view their plan and understand exactly what it includes — without asking.
- Subscription reminders and payment collection happen automatically — without chasing.
- When a client has outgrown their plan, the portal surfaces this and enables them to upgrade — without Yusuf initiating the conversation.

---

## 3. Users

### 3.1 Primary User — The Client

| | |
|---|---|
| **Who they are** | Small to medium Nigerian business owners with a managed website, web app, or mobile app |
| **Technical level** | Low to moderate. Comfortable with basic web apps but not technical about hosting |
| **Primary need** | Confidence that their service is running and that they know what they are paying for |
| **Secondary need** | An easy way to ask for help or report an issue without WhatsApp |
| **Key anxiety** | "Is my site still okay?" and "When does my subscription expire?" |

### 3.2 Secondary User — Yusuf (Admin)

| | |
|---|---|
| **Who they are** | Yusuf — service provider and sole operator of YusTech |
| **Primary need** | A single view of all clients, their plans, and their open requests |
| **Secondary need** | The ability to flag a client as outgrown and trigger the upgrade prompt automatically |
| **Key frustration** | Losing context across WhatsApp threads and missing renewals |

---

## 4. MVP Scope

### 4.1 In Scope

- Client account creation and authentication
- Plan selection during onboarding (WordPress track only for MVP)
- Subscription payment via Paystack with auto-renewal
- Client dashboard: active plan details, renewal date, site status
- Plan comparison — what the next tier offers
- Outgrown flag — admin triggers, client sees upgrade prompt
- Support ticket submission and status tracking
- Admin panel — client list, plan status, request management, outgrown flag
- Email notifications — renewal reminders, payment confirmation, request updates

### 4.2 Out of Scope (Phase 2)

- Web App and Mobile App plan tracks
- Real-time uptime monitoring integration (UptimeRobot, BetterUptime)
- In-portal direct messaging by tier
- Automated outgrown detection (requires analytics layer)
- Dev hours tracking and logging
- Client-facing performance reports

---

## 5. Plan Structure — WordPress Managed (MVP Track)

The four tiers below form the entire plan set for MVP. Pricing is to be confirmed by Yusuf before launch.

| Feature | Basic | Standard | Business | Business Pro |
|---|---|---|---|---|
| **Who it's for** | Testing the waters | Growing store | Serious operation | High-revenue, zero downtime |
| **Backups** | Weekly | Daily | Daily | Real-time |
| **Plugin updates** | Monthly | Bi-weekly | Weekly | Continuous |
| **Support response** | 72 hrs | 48 hrs | 24 hrs | Same day |
| **Change requests/mo** | 1 | 2 | 5 | Unlimited |
| **Monthly report** | ✓ | ✓ | ✓ | ✓ + recommendations |
| **Direct messaging** | — | — | ✓ | ✓ |
| **Dev hours included** | 0 | 0 | 1 hr | 3 hrs |

> **Note:** The key differentiator between tiers is not just features — it is response time and proactivity. Basic is reactive. Business Pro means Yusuf watches their store before they notice a problem.

---

## 6. Core Screens & User Flows

### 6.1 Screen Map

| Screen | What the client sees | What it solves |
|---|---|---|
| `/onboarding` | Pick plan, see what it includes, create account, pay | Removes the need to explain plans over WhatsApp |
| `/dashboard` | Site status, active plan, renewal date, open requests, outgrown banner if flagged | Answers the 3 questions every client has when they log in |
| `/plan` | Full plan details, feature list, comparison to next tier | Eliminates repeated plan explanations |
| `/billing` | Current subscription, next renewal, invoice history, upgrade button | Removes payment chasing |
| `/support` | Submit request, view open and closed tickets, status per ticket | Replaces WhatsApp support threads |
| `/admin` | Client list, plan status, flag as outgrown, view requests, MRR summary | Gives Yusuf a single control panel |

### 6.2 Dashboard — Most Important Screen

The dashboard must answer three questions the moment the client logs in:

1. Is my site alive right now?
2. Do I have any open requests?
3. When does my subscription renew?

If the admin has flagged the client as outgrown, the dashboard shows a persistent banner:

> *"Your site has grown. You're hitting the limits of your current plan — here's what's waiting for you on the next tier."* **[Upgrade Now]**

### 6.3 Onboarding Flow

1. **Select plan** — client sees all four tiers side by side with features clearly listed
2. **Account creation** — email, password, business name, website URL
3. **Review** — plan summary, what is included, monthly cost
4. **Payment** — Paystack checkout, card or bank transfer
5. **Confirmation** — welcome screen, dashboard redirect, confirmation email sent

### 6.4 Support Request Flow

- Client fills request form: title, description, category (bug, content update, new feature, emergency)
- Form shows remaining requests for the month before submission
- If request is outside plan scope, form flags it: *"This may require a quote — Yusuf will review and respond"*
- Request appears in client portal with status: Open, In Progress, Resolved
- Admin receives email notification and updates status from admin panel

---

## 7. Data Model

### 7.1 Users Table

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | String | Login and notification address |
| `name` | String | Client full name or business name |
| `role` | Enum: `client` / `admin` | Determines portal view and permissions |
| `created_at` | Timestamp | Account creation date |

### 7.2 Subscriptions Table

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | FK → Users | Client this subscription belongs to |
| `plan` | Enum: `basic` / `standard` / `business` / `business_pro` | Current active plan |
| `track` | Enum: `wordpress` / `webapp` / `mobile` | Service type (wordpress only for MVP) |
| `status` | Enum: `active` / `overdue` / `cancelled` | Billing state |
| `billing_cycle` | Enum: `monthly` / `annual` | Renewal frequency |
| `next_renewal_date` | Date | Used for renewal reminders |
| `paystack_subscription_id` | String | Paystack reference for recurring billing |
| `outgrown` | Boolean | Admin toggle — triggers upgrade banner on dashboard |
| `site_url` | String | Client website URL for status monitoring (Phase 2) |
| `created_at` | Timestamp | Subscription start date |

### 7.3 Support Requests Table

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | FK → Users | Client who submitted the request |
| `title` | String | Short description of the request |
| `body` | Text | Full request details |
| `category` | Enum: `bug` / `content` / `feature` / `emergency` | Type of request |
| `status` | Enum: `open` / `in_progress` / `resolved` | Updated by admin |
| `out_of_scope` | Boolean | Flagged by system if request exceeds plan allowance |
| `created_at` | Timestamp | Submission date |
| `resolved_at` | Timestamp | Resolution date |

---

## 8. Recommended Tech Stack

| Layer | Tool | Why |
|---|---|---|
| **Frontend** | Next.js (App Router) | React with SSR, fast dashboards |
| **Auth** | Clerk | Handles sessions, social login, and role-based access cleanly |
| **Database** | Supabase (PostgreSQL) | Real-time, row-level security for multi-tenant |
| **Payments** | Paystack | Nigeria-first, subscription billing built in, webhook support |
| **Email** | Resend + React Email | Transactional emails with clean templates |
| **Deployment** | Vercel | Zero config for Next.js, free tier sufficient for MVP |
| **Uptime (Phase 2)** | UptimeRobot API | Embed status data per client into the dashboard |

---

## 9. Build Phases

### Phase 1 — Core Loop (Weeks 1–2)
**Goal:** A client can sign up, pick a plan, pay, and see their dashboard.

- Auth: Clerk setup, role-based access (client vs admin)
- Onboarding: plan selection UI, account creation, Paystack checkout
- Dashboard: active plan display, renewal date, placeholder site status
- Admin panel: client list with plan and renewal status

### Phase 2 — Communication Loop (Weeks 3–4)
**Goal:** Clients can submit requests; admin can manage them and flag outgrown clients.

- Support request form with category, scope check, and monthly limit counter
- Request status tracking for client; request management view for admin
- Outgrown toggle in admin panel with automatic dashboard banner trigger
- Email notifications: renewal reminders (7 days, 1 day before), request updates

### Phase 3 — Polish & Launch (Weeks 5–6)
**Goal:** Stable, tested, and ready for real clients.

- Billing page: invoice history, upgrade/downgrade flow
- Plan comparison page with clear feature diff per tier
- Paystack webhook handling for payment confirmation and renewal events
- Mobile responsiveness audit — clients will check this on their phones
- Onboarding emails and welcome sequence

---

## 10. MVP Success Metrics

The MVP is successful when these outcomes are observable within 60 days of launch:

| Metric | Target |
|---|---|
| **Unprompted renewals** | At least 70% of renewals complete without Yusuf sending a manual reminder |
| **Plan clarity** | Zero WhatsApp messages asking "what does my plan include?" |
| **Upgrade conversion** | At least 1 client upgrades via the portal after outgrown flag is set |
| **Support shift** | At least 50% of support requests come through the portal instead of WhatsApp |
| **Admin time saved** | Yusuf spends less than 30 minutes per week on subscription admin |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Clients resist adopting the portal** | Migrate 2–3 existing clients manually as a test. Show them the portal on a call first. Ease of use must be zero-friction. |
| **Paystack recurring billing complexity** | Test full subscription lifecycle (create, renew, fail, retry) before launch. Have a manual payment fallback. |
| **Outgrown flag misused or ignored** | Keep it simple: one toggle, one banner, one CTA. Don't overcomplicate the logic for MVP. |
| **Scope creep during build** | This PRD defines the boundary. Every feature request goes into a Phase 2 backlog, not into the MVP. |
| **Admin panel neglected** | Build admin panel in Phase 1, not Phase 3. Without it, operations break before launch. |

---

## 12. Open Questions Before Build Starts

1. What is the pricing per plan? (monthly and annual rates for WordPress tiers)
2. What is the product name and domain for the portal?
3. Will clients onboard themselves or will Yusuf migrate existing clients manually first?
4. What email address will notifications be sent from?
5. Is there a logo/brand for the portal or will it use YusTech branding?

---

> *The portal's only job is to make Yusuf unnecessary for the routine stuff, so he can focus on the work that actually requires him.*