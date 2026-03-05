# restoreit — Master PRD (Revenue-Optimized)

Status: V3 — Cloud Forensics Platform  
Target: $50,000+ Monthly Revenue

------------------------------------------------------------

## 1. Product Vision

restoreit (restoreit.app) is an ultra-premium cloud recovery platform designed to rescue permanently deleted files for non-technical users experiencing data loss emergencies.

When people lose files they are in panic mode. Existing recovery tools are complicated, slow, and destructive because they require installation onto the same disk that lost the data.

restoreit solves this by:
• Preventing destructive installs  
• Streaming raw disk data safely to the cloud via a memory-only relay  
• Reconstructing files autonomously using restoreit Agent pattern recognition  
• Providing a calm, guided recovery experience

restoreit functions as a Diagnostic Concierge that guides the user step-by-step through recovery while the heavy restoreit computation occurs securely in the cloud.

The platform is optimized for:
• Simplicity  
• Speed  
• High emotional value recovery moments  
• Premium pricing

The goal is maximum trust during a crisis.

------------------------------------------------------------

## 2. Revenue Objective

restoreit is designed to produce $50,000+ monthly recurring revenue with low operational overhead.

**Core revenue model:**
• Standard Tier — $89  
• Pro Tier — $249

**Expected conversion mix:**
• Standard: 70%  
• Pro: 30%

**Estimated blended revenue per user ≈ $137**

**Revenue model:**
350 Standard users × $89 = $31,150  
150 Pro users × $249 = $37,350  
Estimated monthly revenue: $68,500

Target monthly users: ~500 recoveries.

------------------------------------------------------------

## 3. Target User

restoreit is designed for non-technical users experiencing sudden data loss.

**Common scenarios:**
• Deleted family photos  
• Lost business documents  
• Corrupted SD cards / Formatted external drives  
• Accidentally deleted folders  
• Camera storage failures / Laptop drive corruption

**These users value:**
• Speed  
• Clear guidance  
• Low complexity  
• Emotional reassurance

------------------------------------------------------------

## 4. Core Architectural Principles

restoreit is built around three architectural principles:
1. **Zero-install disk safety:** Never write to the corrupted drive.
2. **Cloud-based reconstruction:** Offload heavy processing to Cloudflare & restoreit Agents.
3. **Simple crisis-oriented user experience:** Hide the tech stack entirely from the front-end. No mention of AI, Cloudflare, or Agents on the UI.

------------------------------------------------------------

## 5. Zero-Install Recovery (Relay Pipe)

**Problem:** Traditional recovery software requires installing a program onto the affected disk, which overwrites the very files being recovered.

**Solution:** restoreit separates computation from disk access. A tiny, memory-only relay streams disk sectors directly to the restoreit cloud. The relay performs no analysis and writes nothing to the disk.

**Relay characteristics:**
• Execution: Terminal command or bootable USB  
• Disk Writes: None  
• Runtime: Memory only  
• Transport: Encrypted HTTPS streaming

------------------------------------------------------------

## 6. Cloud Reconstruction Engine & restoreit Agents

restoreit Cloud receives the raw byte stream and reconstructs recoverable files using an internal restoreit workflow. 

**Cloud responsibilities:**
• File signature detection (Magic number detection)
• Fragment identification and stitching
• Structural reconstruction (Entropy scanning)

**Agentic Intelligence (Internal Core):**
Proprietary LLMs and Sovereign Agents act as the autonomous forensic scientists, looking at raw hexadecimal data and correctly assembling fragmented JPEGs, PDFs, and MP4s without human intervention.

------------------------------------------------------------

## 7. The "Proof of Life" Conversion Mechanic (Added Value)

To maximize the 15% conversion rate, we employ a **"Proof of Life" paywall strategy**. 
Users must physically *see* that their files exist before paying. The Cloud Engine extracts a small percentage of recovered files (e.g., 3 photos, or a watermarked document excerpt) and displays them as thumbnails in the dashboard to prove the recovery was successful. 

*Rule: We charge only when recovery is detected and proven.*

------------------------------------------------------------

## 8. Recovery Flow

**Step 1 — Entry:** User arrives at restoreit.app. Landing page explains zero-install recovery.
**Step 2 — Diagnostic:** restoreit gathers minimal context (OS, disk type, data loss scenario).
**Step 3 — Relay Launch:** User launches the restoreit relay (e.g., `curl restoreit.app/relay | bash`). The relay begins streaming raw disk sectors.
**Step 4 — Cloud Forensics:** restoreit Agents analyze incoming sectors. Dashboard displays detected file fragments and thumbnail previews ("Proof of Life").
**Step 5 — Recovery Gate:** Once recoverable files are detected, the user selects a recovery tier to extract the data.

------------------------------------------------------------

## 9. Pricing Model

restoreit uses value-based crisis pricing. Users pay only after files are detected.

**Standard Tier — $89**
• Full cloud reconstruction  
• Recovered file bundle  
• Requires user to provide their own clean external storage

**Pro Tier — $249**
• Full cloud reconstruction  
• Private Cloud Vault (Cloudflare R2)
• Direct secure downloads (No external hardware required)  

------------------------------------------------------------

## 10. System Architecture (Internal)

**Frontend**
• Framework: Next.js 15 (React, Tailwind CSS)
• UI Rule: No mention of AI, Cloudflare, Agents, or Infrastructure. 

**Backend**
• Recovery Engine: restoreit Sovereign Agent Engine
• Processing Runtime: Node / Cloudflare Edge Workers  
• Storage: Cloudflare R2 (7-day retention for Pro Tier Vaults)

**Relay Layer**
• Implementation: Rust or Go CLI (Memory-only streaming)

**Payments**
• Provider: **Whop Checkout** (Seamlessly integrated, replacing Stripe)
• Trigger: After file detection ("Proof of Life" gate)

------------------------------------------------------------

## 11. Security, Support, and Scalability

• **Security:** Encrypted data streaming, isolated container processing, automatic 7-day purge of temporary vault data.
• **Support:** Automated diagnostics and guided UI instructions to eliminate traditional ticketing.
• **Scalability:** Horizontal scaling via Cloudflare Edge nodes for ingestion and distributed worker pools for Agentic reconstruction.

------------------------------------------------------------

## 12. Marketing Positioning

**Primary message:** Recover deleted files without installing recovery software.
**Core themes:** See more. Recover faster. Restore smarter.

------------------------------------------------------------
*Status: V3 — Revenue-Optimized Platform*

------------------------------------------------------------

## 13. restoreit Pro (Post-Recovery Protection)

restoreit Pro is a subscription designed exclusively for users who have already completed a successful recovery using restoreit.

The subscription is **not offered before recovery**. It is only presented after the user has successfully retrieved their files.

This ensures:
• crisis recovery pricing remains premium  
• subscription positioning remains preventative  
• pricing confusion is eliminated  

restoreit resolves the immediate crisis.  
restoreit Pro protects the user from future crises.

**Pricing**
• restoreit Pro — $12 per month (Single tier, no yearly option).

**Eligibility & Conversion Moment**
restoreit Pro is only offered to users who have completed a successful recovery session. The offer appears immediately after recovery completion inside the restoreit dashboard (panice → relief → recovery).

*Example moment:*
"Your files have been restored successfully. Protect your devices so this never happens again."

**Subscriber Benefits & Protection Dashboard**
Subscribers gain access to the restoreit Protection Dashboard, providing ongoing protection and recovery readiness:
• disk health monitoring  
• corruption detection alerts  
• file system integrity scanning  
• storage failure early warnings  
• recovery readiness diagnostics (score)
• monitoring history & device protection status  

*Subscriber Recovery Benefits:* If a future recovery event occurs, subscribers receive priority processing (faster queue placement) and extended recovery vault retention.

**Revenue Impact**
The subscription layer compounds on top of recovery revenue.
Example model: 500 recoveries per month @ 20% conversion = 100 subscribers ($1,200 MRR building monthly).

**Strategic Outcome**
restoreit becomes both a crisis recovery platform (immediate revenue) and a proactive data protection platform (recurring revenue).

------------------------------------------------------------

## 14. Product Expansion & Feature Backlog

The following considerations have been identified for future development, organized by category. These are not all required for V1 launch but should inform architecture decisions to avoid blocking future work.

------------------------------------------------------------

### User Experience & Flow

• Pre-scan volume information — Show estimated scan time based on drive size  
• Pause/resume functionality — Allow users to pause deep scans and resume later  
• Background scanning — Let users minimize and continue working while scanning  
• Scan history — Keep a log of previous scans and their results  
• Quick scan vs. deep scan options — Give users choice between speed and thoroughness  
• File preview before recovery — Let users preview recoverable files (especially images, documents)  
• Selective recovery — Allow users to select specific files/folders rather than bulk recovery  
• Search and filter — Search recovered files by name, type, date, size  
• Recovery destination selection — Let users choose where to save recovered files  
• Duplicate detection — Identify and flag duplicate files found during scan  

------------------------------------------------------------

### Progress & Feedback

• Real-time progress indicators — Show percentage, files found, time elapsed/remaining  
• Scan statistics — Display sectors scanned, files detected, data size recoverable  
• Network status indicator — Show connection status to Cloud Vault during relay  
• Bandwidth usage display — Show upload speed and data transferred  
• Cancellation confirmation — Warn users about consequences of stopping mid-scan  
• Success/failure notifications — Clear messaging when operations complete  
• Recovery success rate — Show what percentage of files were successfully recovered  

------------------------------------------------------------

### Error Handling & Edge Cases

• Disconnection recovery — Handle network interruptions gracefully during relay  
• Insufficient storage warnings — Alert if Cloud Vault or local storage is full  
• Corrupted file handling — Identify and flag files that are partially recoverable  
• Permission errors — Clear guidance when system permissions are needed  
• Unmounted drive handling — Prompt to mount drives or explain why unmounted drives appear  
• Drive disconnection during scan — Handle physical drive removal gracefully  
• Concurrent scan limitations — Clarify if multiple drives can be scanned simultaneously  
• Timeout handling — Define what happens if relay command times out  

------------------------------------------------------------

### Security & Privacy

• Encryption in transit — Clarify that relay uses TLS/SSL (already using HTTPS, make it explicit)  
• Encryption at rest — Define how data is encrypted inside the Cloud Vault  
• Data retention policy — How long is data kept in Cloud Vault (currently 7 days for Pro Tier)  
• Automatic deletion options — Let users set auto-delete after X days  
• Two-factor authentication — For accessing Cloud Vault  
• Audit logs — Track who accessed what data and when  
• Compliance certifications — GDPR, HIPAA, SOC 2 considerations  
• Zero-knowledge architecture — Define whether restoreit can access user data; make this clear  
• Local-only mode — Option to recover without cloud relay for sensitive data  
• Secure deletion verification — Prove that deleted files are actually gone from cloud  

------------------------------------------------------------

### File Type & Recovery Specifics

• File type filtering — Show only photos, documents, videos, etc.  
• File integrity checking — Verify recovered files are not corrupted  
• Metadata preservation — Keep original timestamps, permissions, attributes  
• Partition table recovery — Recover from formatted or damaged partitions  
• RAID support — Handle RAID configurations  
• Encrypted volume support — Define whether FileVault, BitLocker volumes can be scanned  
• File system support — APFS, HFS+, NTFS, exFAT, ext4, etc.  
• Damaged file repair — Attempt to repair corrupted files during recovery  
• Version recovery — If multiple versions exist, show all  

------------------------------------------------------------

### Technical Architecture

• Offline mode — Define behavior without internet connection  
• Bandwidth throttling — Let users limit upload speed  
• Resume interrupted uploads — Do not restart from scratch if connection drops  
• Chunked uploads — Break large scans into manageable pieces  
• Client-side deduplication — Do not upload duplicate sectors  
• Compression — Compress data before uploading to save bandwidth  
• Multi-threaded scanning — Faster scans using parallel processing  
• Memory usage optimization — Handle large drives without consuming all RAM  
• Cross-platform compatibility — Mac, Windows, Linux support levels  
• ARM vs Intel optimization — Native Apple Silicon support  

------------------------------------------------------------

### Business & Pricing

• Storage limits per tier — How much Cloud Vault space per tier  
• Scan limits — Number of scans per month/year  
• Drive size limitations — Any restrictions on drive sizes that can be scanned  
• Recovery limits — Define whether free users can only recover X GB  
• Subscription vs one-time purchase — Pricing model clarity  
• Family/team plans — Multiple user support  
• Educational/nonprofit discounts  
• Refund policy — If recovery fails  
• Free trial limitations — Define what users can do before paying  

------------------------------------------------------------

### Support & Documentation

• In-app help/tooltips — Explain what "Secure Relay" means in plain language  
• Terminal command explanation — Explain why curl is used and what it does  
• Troubleshooting guide — Common issues and solutions  
• Video tutorials — Walkthrough for first-time users  
• Live chat support — For Pro users  
• Recovery guarantee — Define what happens if files are not found  
• System requirements — Minimum OS version, RAM, etc.  

------------------------------------------------------------

### Advanced Features

• Scheduled scans — Automatic periodic scanning  
• Email notifications — Alert when scan completes  
• API access — For enterprise automation  
• Batch processing — Scan multiple drives in sequence  
• Export scan reports — PDF/CSV of what was found  
• Comparison mode — Compare current vs previous scans  
• Forensic mode — Detailed sector-level analysis  
• Bootable recovery media — USB stick for unbootable systems  
• Remote scanning — Scan drives on other machines  
• Integration with backup tools — Time Machine, Backblaze, etc.  

------------------------------------------------------------

### UI/UX Improvements

• Dark/light mode toggle — User preference  
• Accessibility features — Screen reader support, keyboard navigation  
• Localization — Multi-language support  
• Drive health indicators — Show SMART status warnings  
• Visual drive map — Show which sectors have recoverable data  
• Drag-and-drop recovery — Drag files directly from results to Finder  
• Keyboard shortcuts — Power user efficiency  
• Customizable views — List, grid, timeline views for recovered files  
• Color coding — Visual indicators for file recoverability confidence  
• Onboarding flow — First-time user tutorial  

------------------------------------------------------------

### Legal & Compliance

• Terms of service — Clear usage terms  
• Privacy policy — Define what data is collected  
• Data processing agreement — For enterprise customers  
• Right to be forgotten — GDPR compliance for data deletion  
• Warranty disclaimers — Legal protection for failed recoveries  
• Export restrictions — Encryption export compliance  
• Age restrictions — COPPA compliance if under 13  

------------------------------------------------------------

### Performance & Monitoring

• Crash reporting — Anonymous error reporting to improve stability  
• Performance metrics — Track scan speeds, success rates  
• A/B testing framework — Test UI/UX improvements  
• Usage analytics — Understand how users interact with the app (with consent)  

------------------------------------------------------------

### Competitive & Growth Considerations

• Competitor differentiation — Define what makes restoreit better than Disk Drill, EaseUS, Recuva  
• Marketing claims verification — Ensure all recovery rate claims are verifiable  
• Beta testing program — Early access for feedback  
• Competitor differentiation — Define what makes restoreit better than Disk Drill, EaseUS, Recuva  
• Marketing claims verification — Ensure all recovery rate claims are verifiable  
• Beta testing program — Early access for feedback  
• Referral program — Incentivize word-of-mouth growth  

------------------------------------------------------------

## 15. Agentic Intelligence Architecture (Internal — Production)

restoreit is powered by an internal agentic middleware layer. This is never surfaced to users but drives all intelligent behavior in the platform.

------------------------------------------------------------

### 15.1 Agent Roles

**RecoveryAgent — Intelligent Recovery Assistant**

Interprets natural language user queries and translates them into targeted scan operations.

Example user query: "Recover my wedding photos from last June"
The agent:
- Parses intent using LLM (file types: JPEG/RAW, date range: June 2025)
- Filters EXIF metadata for camera model and resolution
- Prioritizes high-resolution images
- Suggests optimal recovery destination
- Explains what it found in plain English

```python
class RecoveryAgent:
    def smart_recovery(self, user_query):
        intent = self.llm.parse_intent(user_query)
        files = self.scan_drive(
            file_types=intent['file_types'],
            date_range=intent['date_range'],
            keywords=intent['keywords']
        )
        explanation = self.llm.explain_results(files)
        return files, explanation
```

**TroubleshootingAgent — Automated Relay Diagnostics**

When relay connection fails, this agent automatically diagnoses and optionally auto-fixes the issue.

Steps executed:
- Check network connectivity
- Verify SSL certificates
- Test firewall rules
- Check disk permissions
- Suggest human-readable fix, or auto-apply if safe

```python
class TroubleshootingAgent:
    def diagnose_relay_failure(self, error):
        steps = [
            self.check_network(),
            self.verify_ssl(),
            self.test_firewall(),
            self.check_disk_permissions()
        ]
        diagnosis = self.llm.analyze_results(steps)
        fix = self.llm.suggest_fix(diagnosis)
        if fix['can_auto_fix']:
            self.execute_fix(fix['commands'])
```

**SupportAgent — Conversational In-App Support**

Powers the in-app chat. Context-aware of the user's current screen, scan progress, and active errors. Can answer questions, explain technical terms, and trigger app actions.

```python
class SupportAgent:
    def chat(self, user_message, context):
        response = self.llm.generate_response(
            message=user_message,
            app_context=context,
            knowledge_base=self.docs
        )
        if response['action']:
            self.execute_app_action(response['action'])
        return response['message']
```

------------------------------------------------------------

### 15.2 Production Architecture (Hybrid Approach)

```
┌──────────────────────────────────────┐
│     restoreit App (Frontend)         │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│      Agent Middleware Layer          │
│  - Intent classification             │
│  - Context management                │
│  - Tool orchestration                │
└────────────┬─────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────┐  ┌──────────────┐
│   LLM    │  │  restoreit   │
│ (Claude/ │  │    Tools     │
│  GPT-4)  │  │  - Scan API  │
└──────────┘  │  - Recovery  │
              │  - Analytics │
              └──────────────┘
```

------------------------------------------------------------

### 15.3 Key Design Patterns

**Tool Abstraction**

All restoreit core functions are wrapped as agent-callable tools with structured parameters and descriptions.

```python
class ScanDriveTool(Tool):
    name = "scan_drive"
    description = "Scan a drive for recoverable files"

    def execute(self, drive_path, file_types=None):
        return self.core_scanner.scan(drive_path, file_types)
```

**Streaming Responses**

Agent responses stream to the UI in real-time, showing thinking steps, tool actions, and results as they occur.

```python
async def agent_stream(user_query):
    async for chunk in agent.run_stream(user_query):
        if chunk.type == "thinking":
            ui.show_thinking(chunk.content)
        elif chunk.type == "tool_use":
            ui.show_action(chunk.tool, chunk.input)
        elif chunk.type == "result":
            ui.show_result(chunk.content)
```

**Safety Guardrails**

All agent actions pass through a validation layer before execution. Destructive actions require explicit user confirmation. Rate limiting is enforced per session.

```python
class SafetyLayer:
    def validate_action(self, tool_name, params):
        if tool_name == "delete_files":
            if not self.user_confirmed:
                raise PermissionError("User confirmation required")
        if self.action_count > self.rate_limit:
            raise RateLimitError("Too many actions")
        return True
```

------------------------------------------------------------

### 15.4 Implementation Timeline

**Week 1 — Planning**
• Identify all agent use cases: support, troubleshooting, smart recovery, natural language query
• Design tool interfaces
• Choose LLM provider (Claude preferred, GPT-4 fallback, local Llama for cost-sensitive queries)

**Week 2 — Integration**
• Build agent middleware layer on Cloudflare Workers
• Wrap existing scan/recovery functions as agent tools
• Implement safety guardrails

**Week 3 — UI/UX**
• Add in-app chat interface to dashboard
• Implement streaming responses with progress indicators
• Connect agent actions to existing UI state machine

**Week 4 — Testing & Refinement**
• Test edge cases (disconnection, empty results, multi-drive)
• Optimize prompts for accuracy and cost
• Add telemetry (anonymous, consented)

------------------------------------------------------------

### 15.5 Cost Model (Internal)

| Component | Cost Estimate |
|-----------|--------------|
| LLM (Claude / GPT-4) | ~$0.05–$0.20 per user interaction |
| Web Search (Tavily) | ~$0.001 per search |
| Local Llama (simple queries) | Free — runs on Cloudflare Workers Infrastructure |
| **Total per active user** | **~$0.05–$0.20 per session** |

**Optimization strategy:**
• Hybrid model — use local Llama 3.1 for simple classification tasks, proprietary LLMs only for complex reasoning
• Cache common responses
• Rate-limit agent interactions per session to control costs

------------------------------------------------------------

## 16. User Accounts, Profiles & Subscription Management

restoreit requires a persistent user account to support:
• Recovery session history
• Cloud Vault access
• Credit card management
• restoreit Pro subscription ($12/month)

------------------------------------------------------------

### 16.1 Account Features

**Profile**
• Email address (primary identifier)
• Display name
• Account creation date
• Recovery session count

**Payment Method**
• Stored payment method for Pro subscription billing
• Ability to update card at any time from account dashboard
• Last 4 digits and expiry displayed
• One-click card update without re-entering checkout

**Subscription Status**
• Recovery history log (all past sessions)
• restoreit Pro subscription ($12/month): active, inactive, or trialing
• Pro subscription is offered only after a successful paid recovery event
• One-click cancel or resume from account dashboard

------------------------------------------------------------

### 16.2 Post-Recovery Subscription Conversion Flow

1. User completes a recovery and pays (Standard $89 or Pro $249)
2. Recovery completes → Cloud Vault extraction confirmed
3. System presents restoreit Pro protection upsell ($12/mo)
4. If accepted, subscription begins immediately — stored card is charged monthly
5. User dashboard reflects active Pro status and all associated benefits
6. If declined, the upsell is shown again on next login, once, for 30 days

------------------------------------------------------------

### 16.3 Account Dashboard Pages (Frontend)

• `/login` — Email + password login. Passkey support planned.
• `/account` — Profile overview: name, email, plan status, session count
• `/account/billing` — Payment method management, subscription toggle, invoice history
• `/account/history` — Full recovery session log with re-download links
• `/account/vault` — Cloud Vault file browser (Pro only)
• `/account/protection` — Disk health monitoring dashboard (Pro only)
