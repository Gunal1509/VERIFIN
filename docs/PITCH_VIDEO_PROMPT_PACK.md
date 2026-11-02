# Pitch Video Prompt Pack: Verifin

**Target Format:** 16:9, 1080p Full HD (1920×1080), 30 fps  
**Target Duration:** 3 minutes 15 seconds to 3 minutes 30 seconds  
**Target Audience:** Bank credit heads, risk officers, and hackathon judges  
**System Name:** **Verifin** (An Adaptive Multi-Agent Financial Intelligence System)  
**Tone:** Calm, precise, authoritative, evidence-backed. No hype, no buzzwords, zero accusations.

---

## 1. Read This First: Production Pipeline

AI video generation tools often distort typography, misplace flowchart arrows, and hallucinate digits. Because credit committees and judges inspect exact numbers, this video uses a **hybrid production pipeline**:

| Layer | Production Tool | Purpose |
| :--- | :--- | :--- |
| **Ambient Visuals & Transitions** | AI Video Generator (Google Veo, Runway Gen-3, Kling, or Sora) | Cinematic opening/closing shots, desk atmosphere, abstract particle data-streams |
| **Text, Numbers, Diagrams & Workflow** | Motion Graphics Tool (Figma / After Effects / Keynote / Remotion) | Crisp vector text, UML use-case diagram, DAG waves, counters, callouts |
| **Product Footage** | 1080p Prototype Screen Recording | Live demonstration of the Verifin dashboard, Agent Theatre, and Evidence Ladder |
| **Voiceover** | Studio Recording or High-Fidelity Neural TTS (ElevenLabs / Gemini Speech) | Calm, measured narration at ~145–150 words per minute |
| **Assembly & Mastering** | Video Editor (DaVinci Resolve, Premiere Pro, or CapCut) | Final track sync, 20% background audio ducking, burned-in captions |

> **Rule of Thumb:** *AI creates the atmosphere; deterministic motion graphics deliver the facts.*

---

## 2. Master Prompt

*(Copy and paste the block below into an AI motion design assistant or video planning workflow)*

```text
You are an executive creative director and senior motion designer producing a 3:15 animated pitch video for "Verifin", an AI underwriting assistant for MSME loans. 

Audience: Bank credit heads, risk committees, and enterprise hackathon judges.
Tone: Calm, precise, confident, institutional. Avoid generic AI tropes (no glowing robot eyes, floating coins, or cartoonish graphics). 
Visual Identity: Deep institutional blue (#2F5597 and #0B1120), soft slate greys (#F8FAFC, #334155), warm amber (#F59E0B) for attention/re-plan, emerald green (#10B981) for confirmed records.
Core Rules: 
- Never use the word "Copilot" (Microsoft trademark).
- Every number must match the verified prototype runs: Sharma Traders GST ₹4.0 Cr vs Bank ₹1.2 Cr (70% gap, Grade C), DSCR 1.40 down to 0.91, loan sizing ₹45 Lakh expanding to ₹66 Lakh after utility bills.
- The incremental re-plan strictly re-runs 7 of 11 stages and reuses 4 from cache.
- The system never disburses money and never issues automated rejections; an authenticated human officer always decides.
- Output each scene with (a) AI video generation prompt, (b) motion graphics specification, (c) voiceover script with timestamp, and (d) sound design cues.
```

---

## 3. Global Style Guide

- **Color Palette:**
  - Institutional Navy: `#0B1120` (Dark backgrounds) & `#2F5597` (Primary brand blue)
  - Surface Slates: `#F8FAFC` (Canvas light) & `#E2E8F0` (Borders)
  - Grade A (Confirmed): `#10B981` (Emerald)
  - Grade B (Unconfirmed Honest Cash): `#F59E0B` (Warm Amber)
  - Grade C (Contradicted): `#EF4444` (Rose / Red-Orange)
- **Typography:**
  - Headers: Classic serif or bold grotesk (`Cabinet Grotesk` or `Segoe UI Semibold`), large and legible at 1080p.
  - Body & Data: Crisp sans-serif (`Inter`, `JetBrains Mono` for hashes and currency amounts).
  - Minimum text height: $\ge 5\%$ of frame height (~54px at 1080p) for primary numbers.
- **Motion Principles:**
  - Smooth ease-in-out (`cubic-bezier(0.16, 1, 0.3, 1)`), 0.4s to 0.8s duration.
  - Parallel agent stages animate in synchronized waves to visually reinforce concurrency.
- **Character Design:**
  - Credit Officer: Clean 2D flat illustration (professional, neutral).
  - Borrower: Minimalist silhouette.
- **Audio & Music:**
  - Minimalist ambient tech soundtrack (warm piano + sub-bass pulse) at ~18–20% background volume.
  - Discreet UI chimes: soft high chime on stage completion; gentle warm tone when loan expands; crisp mechanical latch sound on officer approval.
- **Corner Badges:**
  - Permanent small tag in bottom-left corner of product scenes: `Synthetic Data • Prototype Simulation`.

---

## 4. Scene-by-Scene Production Script

```
Total Duration: 03:20 (200 seconds)
Narration Pace: 145 words per minute
```

### Scene 1: Introduction (0:00 – 0:25) • Duration: 25s

- **Voiceover (0:00 – 0:25):**  
  *"Every day, small businesses ask banks for a loan. Before saying yes, an officer must decide one thing: will they repay, and are the numbers honest? That means reading bank statements, GST returns, tax returns, and bureau reports—by hand. Meet Verifin: an AI underwriting assistant that reads, checks, and explains, while a human always decides."*
- **(a) AI Visual Prompt:**  
  `"Cinematic wide angle of a quiet, modern bank credit underwriting desk at early dawn. Soft morning sunlight through sheer blinds, stacks of structured paper documents on a dark oak desk, a stylized flat-illustration credit officer carefully reviewing files. Shallow depth of field, soft 35mm lens blur, institutional blue tones (#2F5597). Slow, gentle forward dolly push-in. The paper stacks gently shimmer into glowing blue geometric data lines. No readable text, no logos, photorealistic lighting."`
- **(b) Motion Graphics Overlay:**  
  - Centered hero title resolves from data vectors: **Verifin** (Large serif, pure white).
  - Tagline fades in underneath: *"Underwriting, with proof."*
  - Bottom subtitle: `Forward-Deployed MSME Underwriting Assistant`.
  - Subtle corner badge: `Virtusa Jatayu Season 6 | Team Code & Cosmos`.
- **(c) Music & Sound Design:**  
  - Ambient synthesizer pad starts softly at 0:01.
  - Gentle harmonic rise at 0:18 as the word "Verifin" forms.

---

### Scene 2: Use Case Architecture Diagram (0:25 – 0:55) • Duration: 30s

- **Voiceover (0:25 – 0:55):**  
  *"Here is who uses it. The borrower submits documents. The credit officer reviews a plain-language summary and adds evidence. A separate approver makes the final decision. Risk teams tune each bank's policy pack, and auditors replay any case. Bank systems like GST, bureau, and core banking connect through secure connectors."*
- **(a) AI Visual Prompt:**  
  *None. Pure vector motion graphics on a light background to guarantee 100% sharp readability.*
- **(b) Motion Graphics Specification:**  
  - Clean light-slate canvas (`#F8FAFC`) with subtle hairline grid.
  - System boundary box draws smoothly: rounded rectangle titled **`Verifin System Boundary`**.
  - **Left Actors:** `Borrower`, `Credit Officer`, `Approver`.
  - **Right Actors:** `Risk Reviewer`, `Auditor`, `Bank Systems (GST, Bureau, CBS)`.
  - **Internal Use Cases (Pills):**
    1. *Submit Documents*
    2. *Review Case Summary*
    3. *Add Evidence*
    4. *Approve, Send Back, or Escalate* (Highlighted with warm gold pulse and human icon)
    5. *Review Audit Trail & Replay Case*
    6. *Tune Policy Pack*
    7. *Connect Bank Systems via MCP*
  - Connector lines draw smoothly from actors to use cases with animated arrow heads.
  - Permanent bold safety callout at bottom of boundary: **`Safety Invariant: No use case disburses money.`**
- **(c) Music & Sound Design:**  
  - Soft haptic tick as each actor and use-case card snaps into position.

---

### Scene 3: Adaptive Workflow & Incremental Re-Planning (0:55 – 1:45) • Duration: 50s

- **Voiceover (0:55 – 1:20):**  
  *"Instead of a fixed sequence, the system plans each case. Document intake and the bureau check start together. A Trust Gate grades every number A, B, or C. Then cash-flow and fraud checks run side by side. Risk, policy, and loan structuring follow in order, and every step is plain code, with models used only to read and explain. A memo is drafted with proof, and a mock ledger entry waits for a human."*
- **Voiceover (1:20 – 1:45):**  
  *"Now new evidence arrives: electricity bills. The system does not start over. It marks only the steps that depend on the new information, redoes those, and reuses the rest."*
- **(a) AI Visual Prompt (Background Only):**  
  `"Abstract dark-navy background with subtle streams of glowing particle trails flowing from left to right along branching parallel lines. Minimal, slow motion, out-of-focus background bokeh, dark blue and cyan hues (#0B1120). No text, no numbers."`
- **(b) Motion Graphics Specification:**  
  - **Part 1 (0:55 – 1:20):** 8-wave horizontal Directed Acyclic Graph (DAG) animates left-to-right:
    - *Wave 0:* `Intake Agent` + `Bureau & KYC Agent` (Run in parallel $\rightarrow$ Blue pulse $\rightarrow$ Turn green).
    - *Wave 1:* `Deterministic Trust Gate` (Grade A/B/C triangulation).
    - *Wave 2:* `Cashflow (DSCR)` + `Fraud Loops (NetworkX)` (Run in parallel).
    - *Waves 3–8:* `Risk Score` $\rightarrow$ `Policy Engine` $\rightarrow$ `Structuring` $\rightarrow$ `CAM Memo` $\rightarrow$ `Mock Ledger (PENDING_APPROVAL)` $\rightarrow$ `Human Gate`.
    - Every node features a tag: `[Deterministic Code]` or `[Model Reads/Explains]`.
    - Bottom telemetry bar: *"Evidence ledger and token budget run under every step"*.
  - **Part 2 (1:20 – 1:45):**
    - A document card titled *"BSES Commercial Electricity Bills"* slides in from top.
    - An amber ripple washes across the graph:
      - **4 Cached Stages** (`Intake`, `Bureau`, `Trust Gate`, `Fraud`) stay solid green with dashed outline and tag: `REUSED (0ms Cache Hit)`.
      - **7 Stale Stages** (`Cashflow`, `Risk`, `Policy`, `Structuring`, `CAM`, `Ledger`, `Human`) illuminate in amber and re-run.
    - Large digital counter displays real backend numbers:  
      **`Redone: 7 of 11 stages | Reused: 4 stages (36.4% pipeline preserved)`**
- **(c) Music & Sound Design:**  
  - Dual chime when Wave 0 and Wave 2 finish concurrently.
  - Low resonant hum when the electricity bill slides in, followed by rapid success clicks as the 7 stale stages resolve.

---

### Scene 4: Live Case Result — Sharma Traders (1:45 – 2:15) • Duration: 30s

- **Voiceover (1:45 – 2:15):**  
  *"Here is a synthetic case: Sharma Traders. GST says four crore rupees in sales, but the bank shows one point two crore. The Trust Gate grades the sales claim C. Repayment cover looks like one point four on the claimed figures, but is only zero point nine one on confirmed cash. The safe loan on confirmed cash is about forty-five lakh. After proof is added, about sixty-six lakh. Every flag links to transaction IDs, and the final call stays with a person."*
- **(a) Visuals:**  
  *Screen recording of the Verifin Officer Cockpit + animated motion-graphics callouts.*
- **(b) Motion Graphics Callouts:**  
  - Split-screen comparison card:  
    - Left: Declared GSTR-3B Sales: **₹4,00,00,000** (`Grade C • Uncorroborated`).
    - Right: Verified Bank Credits: **₹1,20,00,000** (`Grade A • Verified SBI Inflow`).
    - Center Callout: **`70.0% Turnover Gap`**.
  - Repayment Cover (DSCR) Meter:  
    - Number dials down from claimed `1.40x` to actual `0.91x` on verified operating cash (`₹1.5L/mo`).
    - Tooltip: *"Repayment cover: how comfortably monthly cash covers the instalments"*.
  - Loan Sizing Bar:  
    - Initial bar: **₹45.0 Lakh** (at 12% over 60 months).
    - As electricity bills corroborate +₹70k/mo cash, bar dynamically expands to **₹66.5 Lakh** (+₹21.5L capital unlocked).
  - NetworkX Circular Flow Drawer:  
    - Directed triangle loop illuminates: `Sharma -> Verma -> Gupta -> Sharma` (6-day cycle, slippage < 1.5%).
    - Clickable transaction tags: `TXN-90214 (Outward ₹18.5L)` and `TXN-90412 (Inward ₹18.2L)`.
  - Ending on Officer Decision Cockpit:  
    - Action buttons: `Approve (Sanction)`, `Send Back`, `Escalate`.
    - Stamp: **`Status: PENDING_APPROVAL • Zero Disbursal Route in Codebase`**.
- **(c) Music & Sound Design:**  
  - Attention chime on the 70% gap detection. Warm rising chord as the loan bar grows from ₹45L to ₹66.5L.

---

### Scene 5: Six Core Differentiators (2:15 – 2:45) • Duration: 30s

- **Voiceover (2:15 – 2:45):**  
  *"What makes it different? One: a Trust Gate that grades every number, so honest cash-heavy shops are never called fraud. Two: an adaptive workflow that runs independent steps together and redoes only what changed. Three: gaps become a ranked evidence ladder, not a rejection. Four: code does every calculation and enforces every limit, and models only explain. Five: each bank loads its own policy pack with no code change. Six: every claim has proof, and a human always decides."*
- **(a) AI Visual Prompt:**  
  *None. Crisp vector motion graphics.*
- **(b) Motion Graphics Specification:**  
  A 3×2 grid of six minimalist institutional cards animates sequentially with 0.3s stagger:
  1. **Trust Gate:** Icon of verified shield $\rightarrow$ *"Every number graded A, B, or C."*
  2. **Adaptive DAG:** Icon of branching parallel lines $\rightarrow$ *"Parallel steps, minimal rework."*
  3. **Evidence Ladder:** Icon of climbing stair bar $\rightarrow$ *"Gaps become next steps."*
  4. **Code Computes:** Icon of Python terminal & chip $\rightarrow$ *"Models explain, code calculates."*
  5. **Policy Packs:** Icon of swappable config sliders $\rightarrow$ *"Each bank's rules, no code change."*
  6. **Proof & Control:** Icon of citation lock $\rightarrow$ *"Every claim cited. A human decides."*
  - At 2:42, the cards smoothly converge into an orbiting hexagon encircling the glowing **Verifin** emblem.
- **(c) Music & Sound Design:**  
  - Rhythmic percussive clicks as each card lands, resolving into a unified harmonic chord.

---

### Scene 6: Business Growth & Market Opportunity (2:45 – 3:05) • Duration: 20s

- **Voiceover (2:45 – 3:05):**  
  *"The need is large. India's MSME credit gap is estimated in the tens of lakh crores, and lenders are under pressure to decide quickly without taking on fraud. We start with one lender in shadow mode, prove the numbers, then scale across banks and NBFCs, and extend the same engine to invoice finance, vendor onboarding, claims fraud, and subsidy checks."*
- **(a) Motion Graphics Specification:**  
  - **Left Column (Verified Industry Metrics):**
    - Metric 1: **₹35.2 Lakh Crore** — *Total MSME Commercial Credit Exposure*  
      *(Source: TransUnion CIBIL MSME Pulse Report FY24)*
    - Metric 2: **13% YoY Growth** — *Commercial Credit Expansion*  
      *(Source: Reserve Bank of India Commercial Credit Bulletin)*
    - Metric 3: **~₹28 Lakh Crore** — *Addressable MSME Credit Gap*  
      *(Source: UK Sinha RBI Expert Committee on MSMEs)*
  - **Right Column (Phased Rollout Staircase):**  
    - Step 1: *Pilot at One Lender* (Shadow mode parallel run)
    - Step 2: *Integrate* (Consented data feeds & live MCP adapters)
    - Step 3: *Scale* (NBFCs & commercial banks, SaaS fee per file)
    - Step 4: *Expand* (Invoice discounting, vendor onboarding, subsidy validation)
  - **Bottom Formula Strip:**  
    `Revenue Model: Lenders × Files/Year × Fee/File`  
    `Illustrative: 1 Bank × 20,000 files × ₹400 = ₹80 Lakh/year (Replaced by pilot baseline)`
  - Footer tag: *Targets established against shadow-mode historical baseline.*
- **(c) Music & Sound Design:**  
  - Confident bass progression under voiceover.

---

### Scene 7: Forward-Deployed Roadmap (3:05 – 3:20) • Duration: 15s

- **Voiceover (3:05 – 3:20):**  
  *"Next: consented data feeds through the Account Aggregator framework, real bank connectors, a self-hosted model for strict banks, a governed learning loop that proposes threshold changes for humans to approve, and cross-lender ring detection with privacy-safe data sharing."*
- **(a) Motion Graphics Specification:**  
  - Horizontal timeline with 5 sliding milestone cards:
    1. *Account Aggregator Consent Gateway*
    2. *Enterprise Core Banking MCP Adapters*
    3. *Air-Gapped On-Premises Model Runner*
    4. *Governed Learning Loop (Change proposals with audit gates)*
    5. *Federated Cross-Lender Ring Detection*
  - Bottom compliance note: *Production deployment subject to enterprise security and regulatory review.*
- **(c) Music & Sound Design:**  
  - High-frequency technological whooshes as cards slide into the roadmap.

---

### Scene 8: Outro & Sign-Off (3:20 – 3:30) • Duration: 10s

- **Voiceover (3:20 – 3:30):**  
  *"Verifin. Faster decisions, with proof, and a human in charge. Thank you."*
- **(a) AI Visual Prompt:**  
  `"Cinematic camera pull-back from glowing blue geometric data lines into a calm, elegant dark navy gradient background (#0B1120). Gentle dust particles catching soft studio lighting, clean institutional finish, no text."`
- **(b) Motion Graphics Overlay:**  
  - Centered: **Verifin** (Large, white with subtle blue glow).
  - Tagline: *"An Adaptive Multi-Agent Financial Intelligence System"*.
  - Credits:  
    `Virtusa Jatayu Season 6 • Team Code and Cosmos`  
    `Synthetic Data Prototype • Zero Disbursal Invariant Verified`
- **(c) Music & Sound Design:**  
  - Musical track resolves to a clean, resonant major chord and fades over 3.0 seconds to silence.

---

## 5. Negative Prompts (For All AI Video Generations)

Include this exact negative prompt string in your generation settings (Veo, Runway, Kling, Sora):

```text
no readable text, no letters, no words, no numbers, no currency symbols, no charts with labels, no logos, no bank trademarks, no human faces in close-up, no robotic hands, no glowing cyborg eyes, no green terminal hacker text, no hoodie imagery, no floating gold coins, no distorted anatomy, no cartoon graphics, no watermark, no blur, no low resolution artifacts.
```

---

## 6. Assembly & Editing Checklist

1. **Ambient Footage Generation:**  
   - Generate 3 ambient video clips (5–8s each): Scene 1 (Desk atmosphere), Scene 3 (Flowing particle streams background), and Scene 8 (Camera pull-back to navy gradient).
2. **Motion Graphics Export:**  
   - Build Scene 2 (UML diagram), Scene 3 (DAG animation), Scene 5 (6 differentiators), Scene 6 (Staircase & stats), and Scene 7 (Roadmap) in After Effects, Figma, or Remotion.
   - Export as ProRes 4444 with alpha or high-bitrate MP4 with solid background (`#0B1120` or `#F8FAFC`).
3. **Screen Recordings:**  
   - Capture Scene 4 directly from the working prototype (`http://localhost:5173`):
     - Agent Theatre replay of Sharma Traders.
     - Toggle *"Add Electricity Bills"* to record the live resizing to ₹66.5 Lakh.
     - NetworkX circular flow drawer showing `TXN-90214` and `TXN-90412`.
4. **Voiceover Mastering:**  
   - Normalize audio to $-14$ LUFS (standard broadcast loudness).
   - Ensure clear, natural pacing at ~145 WPM.
5. **Timeline Assembly:**  
   - Place voiceover track on Track A1.
   - Add background music on Track A2, ducked to $-22$ dB under voice, rising to $-16$ dB during transitions.
   - Sync motion graphics animations to voiceover cues.
   - Burn in bottom-centered closed captions (Helvetica/Inter bold, 1080p legible).
6. **Final Export Specifications:**  
   - Container: MP4 (H.264 / AAC)
   - Resolution: $1920 \times 1080$ (1080p, 16:9)
   - Frame Rate: 30 fps
   - Bitrate: 12–16 Mbps (target file size $\approx 75$–$95$ MB for hackathon submission upload).

---

## 7. Honesty & Compliance Checklist

- [x] **No "Copilot" Brand Name:** Verified "Verifin" is used exclusively; Microsoft trademark avoided.
- [x] **Redo & Reuse Counts Exact:** Re-plan figures match the real backend NetworkX graph (**7 redone, 4 reused from cache**).
- [x] **Verified Context Statistics:** CIBIL MSME Pulse (₹35.2L Cr), RBI growth (13%), and UK Sinha report (~₹28L Cr) verified against published reports.
- [x] **Synthetic Data Disclaimer:** Every screen and demo scene contains the visible `Synthetic Data` notice.
- [x] **Zero Disbursal Guarantee:** Clearly highlighted in Scene 2, Scene 3, and Scene 4 that no fund disbursal route exists.
- [x] **Mandatory Human Approval:** Explicitly shown in Scene 2 and Scene 4 that an authorized credit officer always retains final decision authority.
