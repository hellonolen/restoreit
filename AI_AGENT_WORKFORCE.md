# Autonomous Workforce Strategy (RestoreIt)

**Date initialized:** March 5, 2026
**Vision:** Transition restoreit from a SaaS platform into a 100% autonomous business operated by a specialized team of 7 AI Agents.
**Core Objective:** 7 distinct agents, each managing 300 active, recurring clients/partners (Target: 2,100 total subscriptions).

---

## 1. The Strategy: Empathy-Driven Crisis Response & B2B Partner Outreach

When data is lost, users are in an acute state of panic. Traditional marketing feels transactional. A human-like agent reaching out with genuine empathy and a step-by-step resolution changes the paradigm from "software vendor" to "data rescue concierge."

**Agent Responsibilities:**
- **The Global Web Listener (B2C):** Scan the *entire internet* (forums, blogs, niche photography boards, Q&A sites, global search engine results) for real-time distress signals about lost data. We do not restrict this to specific platforms like Reddit or X. The agent must catch intent anywhere it happens.
- **Outbound Partner Sales (B2B):** Prospect local computer repair shops, IT MSPs, and photo studios on Google Maps/LinkedIn to pitch the Restore-as-a-Service (RaaS) partner program.
- **Onboarding & Handholding:** Guide users through the emotional stress of data loss, instruct them how to run the relay command, and walk them through the "Proof of Life" checkout gate.
- **Customer Success:** Follow up after recovery to upsell the $29/mo "RestoreIt Protection" monitoring subscription and $79 Cloud Storage.

---

## 2. The 7-Agent Architecture

To create true autonomy and scale, we need a "Sales Pod" structure:

| Agent Name | Persona / Role | Target Channel | Goal |
|------------|----------------|----------------|------|
| **Agent 1: The Global First Responder** | Highly empathetic, fast resp. | Global Open Web | B2C Crisis Acquisition |
| **Agent 2: The Photographer's Friend** | Professional, creative. | Instagram, FB Groups, Wedding forums | B2C Creative Acquisition |
| **Agent 3: The Biz Dev Rep (East)** | Direct, professional, ROI-focused. | LinkedIn / Email | B2B Partner Recruitment (East Coast) |
| **Agent 4: The Biz Dev Rep (West)** | Direct, professional, ROI-focused. | LinkedIn / Email | B2B Partner Recruitment (West Coast) |
| **Agent 5: The Concierge (Onboarding)** | Calm, instructional, patient. | Email / SMS / Discord | Active Client Handholding & Recovery Guide |
| **Agent 6: The Success Manager** | Proactive, helpful. | Email / In-app | Upselling Protection Plans, Cloud Storage, & Retention |
| **Agent 7: The Support Engineer** | Technical, precise, fast. | In-app / Email | Tier 1/2 Tech Support, Troubleshooting commands |

---

## 3. Platform Integration (Tying the Brain to the Core)

The agents are useless if they are disconnected from the actual application. The agentic workforce must be granted deep, programmatic connections to the RestoreIt Cloudflare infrastructure.

*   **Database Access (The `Customers` Table):** The agents will have read/write access to the core D1 database. When Agent 5 (Concierge) talks to a client, it checks the `Customers` and `Scans` tables to see real-time progress of their data recovery.
*   **Support Actions:** Agent 7 (Support) can securely issue commands to reset passwords, restart stalled VPS carve jobs, or extend trial lengths by interacting directly with the backend API.
*   **State Awareness:** The agents maintain conversation state in a centralized Vector DB, ensuring that when a B2B partner moves from Agent 3 (Sales) to Agent 6 (Success), the entire history of the relationship and their platform usage metrics are known.

---

## 3. The Tech Stack Execution (n8n & External APIs)

To execute this, we need a robust, low-maintenance tech stack combining **n8n** (for visual workflow orchestration) with powerful foundational models.

**The Setup Phase:**
1. **Identities:** We need 7 distinct Google Workspace/Microsoft 365 accounts (e.g., `emma@restoreit.app`, `david@restoreit.app`) to warm up their email sender reputation.
2. **Socials:** Auto-create and manage LinkedIn, X, and Reddit profiles using tools like Multi-login or GoLogin to prevent platform bans.
3. **The "Brain" (Refined Agentic Framework):**
   Instead of static prompts, the Node.js engine uses an advanced Agentic Loop (via Vercel AI SDK or LangGraph.js) to achieve true autonomy:
   - **Research & Briefing Docs:** Before any outbound action happens, an agent is dispatched to scrape the target company. It reads their 'About Us', 'Services', and recent news, then compiles a formal **Briefing Document** summarizing who they are and what their biggest pain points likely are. This doc is stored permanently in the database (`partner_briefings` table) so the system learns the landscape over time.
   - **Agent-Driven Tool Selection:** The agent is not hardcoded to scrape one site. It is given a goal ("Write a pitch") and a toolkit (`search_google`, `scrape_url`, `query_internal_db`). It autonomously *chooses* which tools to use in real-time until it has enough context.
   - **Semantic Memory (Self-Optimizing):** The SQLite database stores a `brand_memory` JSON. Whenever you correct the agent's tone, or whenever an email gets a positive reply, it updates its memory file. It retrieves past successful interactions as few-shot examples before drafting new outreach, constantly self-optimizing its success rate.
   - **Dynamic Routing:** Before taking action, a lightweight LLM router categorizes the intent (e.g., `is_new_lead`, `is_existing_partner`, `is_competitor`) and branches the logic down completely different code paths.
   - **Interactive Chat (Human-in-the-Loop):** If the agent encounters ambiguity (confidence < 80%), it pauses execution, updates the database status to `pending_human_review`, and sends you a Slack/Discord message asking for clarification. You reply in chat, and the agent resumes its workflow using your instructions.

**Example n8n Workflow (The First Responder):**
1. **Apify Actor** runs every 15 mins searching X and Reddit for keywords: "lost my files", "corrupt SD card", "accidentally formatted".
2. **n8n** ingests the posts.
3. **Gemini classification step:** Determines if the post is a genuine crisis or tech support joke. (Filter = Real crisis).
4. **Gemini content generation:** Writes a highly customized, non-salesy reply ("Oh man, formatting an SD card is a nightmare. Don't write anything else to it! We built a tool that streams the raw bytes off the card safely to reconstruct the files in the cloud without installing software on your drive. Here is a guide...")
5. **Node.js engine executes** the post via X/Reddit API.

---

## 4. The Path to Autonomy

We do not launch 7 agents at once. We build the machine iteratively.

**Phase 1: Prove the First Responder (B2C)**
- Set up Node.js daemon and connect it to one dedicated email/social account.
- Focus entirely on Reddit and X.
- Monitor metrics: Replies sent vs. Users signed up.
- *Goal: Automate the acquisition of 10 customers/week.*

**Phase 2: Prove the Biz Dev Rep (B2B)**
- Connect Apollo.io/Google Maps scraper to find IT repair shops.
- Agent drafts and sends highly personalized cold emails pitching the Partner App.
- Agent handles the back-and-forth negotiation and appointment setting.
- *Goal: Recruit 5 high-volume partners/week.*

**Phase 3: The Full Fleet**
- Replicate the proven workflows across the remaining 5 personas.
- Implement an "Orchestrator Agent" (or just you as the CEO) reviewing the daily performance dashboard generated by the agents.

---
## Discussion Log
*(Append new thoughts below based on ongoing conversation)*

**March 5, 2026**
- User proposed the vision: 7 fully autonomous agents doing sales, onboarding, and support. Goal of 300 recurring clients *per agent* (2,100 total). 
- Recommended stack: Google Workspace for identities, Custom Node.js Engine for orchestration, Apify for data sourcing, and Gemini for the cognitive engine. The business model transitions perfectly from "passive SaaS" to "hyper-active outbound machine."
- **Update (13:20 EST):** Adjusted Agent 7 to be a dedicated Support Engineer. Added the "Platform Integration" architectural requirement to ensure agents interact directly with the RestoreIt D1 `Customers` and `Scans` tables for real-time state awareness.
- **Update (13:30 EST):** Explicitly separated the B2B and B2C agent architectures. The B2C First Responder is now a completely independent **Global Web Listener**. It ignores platform-specific biases (like Reddit) and uses global SERP/keyword scraping APIs (e.g., Google or Bing search scraping via Apify) to catch users in crisis anywhere on the open internet.
- **Update (13:35 EST):** Upgraded the architecture to a true Agentic Framework (Vercel AI SDK). Added support for autonomous **Research Briefing Docs**, Real-Time Tool Selection, Semantic Memory (Self-Optimization over time), and Interactive Pausing (Human-in-the-Loop). Added `brand_memory` and `partner_briefings` tables to the SQLite schema.
