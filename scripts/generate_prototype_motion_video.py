"""Real-Time Animated Prototype Motion Video Generator for Verifin: An Adaptive Multi-Agent Financial Intelligence System.

Renders 30 FPS high-frame-rate animated scenes showing:
1. Physical document files streaming across the screen into the Intake Agent with laser scanlines.
2. Trust Gate comparator balancing GST sales vs bank deposits and stamping Grade C on 70% gap.
3. Concurrent parallel waves with data packets branching simultaneously to Cashflow and Fraud.
4. Forensic NetworkX circular flow loop with animated money packets traveling between Sharma, Verma, and Gupta.
5. Live incremental re-planning ripple: utility bills uploaded, upstream cached, and loan sizing counting up live from ₹45L to ₹66L.
6. Credit Officer sign-off and zero-disbursal lock.
"""

import os
import math
import shutil
import wave
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import win32com.client

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BUILD_DIR = PROJECT_ROOT / "motion_video_build"
OUTPUT_VIDEO = PROJECT_ROOT / "msme_copilot_prototype_walkthrough.mp4"

FONT_MAIN = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = r"C:\Windows\Fonts\arialbd.ttf"
if not os.path.exists(FONT_MAIN):
    FONT_MAIN = r"C:\Windows\Fonts\arial.ttf"

FPS = 30
WIDTH, HEIGHT = 1920, 1080

SCENE_DEFS = [
    {
        "id": "scene1_ingestion",
        "title": "STAGE 1: DOCUMENT STREAMING & SECURE INGESTION",
        "subtitle": "Physical Document Intake & Untrusted Text Boundary",
        "narration": (
            "We begin with real-time document ingestion. "
            "The borrower's GST returns, 12 months of bank statements, and corporate KYC files stream directly into our intake sandbox. "
            "A laser scanline extracts structured facts while treating all text as untrusted data, "
            "safely quarantining hidden prompt injections before any calculations begin."
        ),
    },
    {
        "id": "scene2_trustgate",
        "title": "STAGE 2: TRUST GATE RECONCILIATION & TURNOVER GAP",
        "subtitle": "Deterministic Cross-Triangulation & Grade C Stamping",
        "narration": (
            "The Trust Gate agent instantly cross-reconciles declared turnover against inward bank deposits. "
            "While GST filings claim four crore rupees in sales, bank records corroborate only one point two crore rupees. "
            "The system flags the seventy percent turnover gap, stamps the sales claim as Grade C contradicted, "
            "and confirms genuine bank deposits under Grade A."
        ),
    },
    {
        "id": "scene3_parallel",
        "title": "STAGE 3: TOPOLOGICAL CONCURRENT AGENT EXECUTION",
        "subtitle": "Wave Concurrency with asyncio.gather",
        "narration": (
            "Our orchestrator branches execution into parallel waves. "
            "The Trust Gate emits concurrent data streams to both the Cash Flow Analysis agent and the Forensic Fraud agent. "
            "Both agents execute side by side, cutting total case processing time by forty-two percent, "
            "with deterministic merge ordering guaranteeing exact replays."
        ),
    },
    {
        "id": "scene4_circular_flow",
        "title": "STAGE 4: FORENSIC NETWORK-X CIRCULAR FLOW ISOLATION",
        "subtitle": "Real-Time Money Movement Animation & Shared Identifiers",
        "narration": (
            "Zooming into the fraud detection agent reveals a directed cycle in the payer-to-payee graph. "
            "Money moves from Sharma to Verma, Verma to Gupta, and returns to Sharma within six days. "
            "The system isolates all six circular transaction IDs, detects a shared registered office in Okhla, "
            "and flags that eighty-seven percent of funds fail the outside-world dissipation test."
        ),
    },
    {
        "id": "scene5_replan",
        "title": "STAGE 5: SIZING & LIVE INCREMENTAL RE-PLANNING",
        "subtitle": "Electricity Bills Corroboration & Dynamic Recalculation",
        "narration": (
            "Loan sizing calculates an initial safe sanction of forty-five lakh rupees. "
            "Now watch live incremental re-planning: the borrower uploads commercial electricity receipts. "
            "Upstream stages remain cached and reused at zero cost, "
            "while downstream stages recompute and increase the approved loan live to sixty-six lakh rupees, "
            "saving sixty-six percent of compute."
        ),
    },
    {
        "id": "scene6_governance",
        "title": "STAGE 6: OFFICER SIGN-OFF & ZERO-DISBURSAL GUARANTEE",
        "subtitle": "Mandatory Human Gate & Codebase Safety Verification",
        "narration": (
            "The finalized Proof Pack is presented to Credit Officer Priya Sharma. "
            "Every claim is backed by transaction citations. "
            "The officer approves the loan into sanctioned status in the ledger. "
            "A continuous code-level invariant guarantees that zero fund disbursal route exists in the software. "
            "A human always holds final authority."
        ),
    },
]


def generate_audio(text: str, output_wav: Path) -> float:
    """Generate audio via Windows SAPI and return duration in seconds."""
    speaker = win32com.client.Dispatch("SAPI.SpVoice")
    stream = win32com.client.Dispatch("SAPI.SpFileStream")
    speaker.Rate = 0
    if output_wav.exists():
        output_wav.unlink()
    stream.Open(str(output_wav), 3)
    speaker.AudioOutputStream = stream
    speaker.Speak(text)
    stream.Close()
    with wave.open(str(output_wav), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        duration = frames / float(rate)
    return duration


def ease_in_out(t: float) -> float:
    """Standard smooth ease-in-out curve for t in [0, 1]."""
    return t * t * (3 - 2 * t)


def render_scene1_frame(t_progress: float, draw: ImageDraw.ImageDraw, f_bold, f_main, f_small, f_tag):
    """Scene 1: Animated document streaming into ingestion sandbox with laser scanlines."""
    # Top Tag & Header
    draw.text((100, 60), "STAGE 1 &bull; REAL-TIME DOCUMENT INGESTION &amp; STREAMING", fill="#38BDF8", font=f_tag)
    draw.text((100, 100), "Ingesting Multi-Source MSME Documentation", fill="#FFFFFF", font=f_bold)
    draw.text((100, 155), "Untrusted boundary sandbox &bull; Intercepts prompt injections before agent processing", fill="#94A3B8", font=f_main)

    # Ingestion Target Gateway (Center Right)
    gate_x1, gate_y1, gate_x2, gate_y2 = 1250, 240, 1780, 880
    pulse = math.sin(t_progress * math.pi * 6) * 4
    draw.rounded_rectangle([gate_x1 - pulse, gate_y1 - pulse, gate_x2 + pulse, gate_y2 + pulse], radius=24, fill="#1E293B", outline="#38BDF8", width=3)
    draw.text((gate_x1 + 60, gate_y1 + 40), "DOCUMENT INTAKE AGENT", fill="#38BDF8", font=f_bold)
    draw.text((gate_x1 + 60, gate_y1 + 85), "Status: ACTIVE PARSING &bull; SHA-256 Validated", fill="#10B981", font=f_small)

    # Moving Laser Scanline over Gateway
    scan_y = gate_y1 + 130 + int(((t_progress * 8) % 1.0) * (gate_y2 - gate_y1 - 200))
    draw.line([gate_x1 + 20, scan_y, gate_x2 - 20, scan_y], fill="#38BDF8", width=4)

    # 3 Flying Document Cards
    docs = [
        {"name": "GSTR-3B_FY2023-24.pdf", "type": "GST Tax Filing", "val": "Sales Claim: ₹4.0 Cr", "delay": 0.0},
        {"name": "SBI_Current_Account_FY24.pdf", "type": "Bank E-Statement", "val": "340 Txns &bull; ₹1.2 Cr", "delay": 0.25},
        {"name": "MCA_Company_Master.pdf", "type": "Corporate KYC", "val": "Plot 42 Okhla Premise", "delay": 0.50},
    ]

    for idx, doc in enumerate(docs):
        # Progress for this specific document
        d_prog = max(0.0, min(1.0, (t_progress - doc["delay"]) / 0.45))
        eased = ease_in_out(d_prog)

        # Coordinate interpolation from left to gateway
        start_x, start_y = 120, 280 + (idx * 210)
        target_x, target_y = gate_x1 + 40, gate_y1 + 150 + (idx * 150)

        curr_x = start_x + (target_x - start_x) * eased
        curr_y = start_y + (target_y - start_y) * eased

        w, h = 420, 135
        draw.rounded_rectangle([curr_x, curr_y, curr_x + w, curr_y + h], radius=16, fill="#0F172A", outline="#60A5FA" if d_prog > 0 else "#334155", width=2)
        draw.text((curr_x + 25, curr_y + 20), doc["name"], fill="#FFFFFF", font=f_main)
        draw.text((curr_x + 25, curr_y + 55), doc["type"], fill="#94A3B8", font=f_small)
        draw.text((curr_x + 25, curr_y + 85), doc["val"], fill="#38BDF8", font=f_small)

        # Draw animated particle trail
        if 0.0 < d_prog < 1.0:
            for p in range(5):
                pt_x = curr_x - (p * 15)
                pt_y = curr_y + 60 + math.sin(t_progress * 15 + p) * 8
                draw.ellipse([pt_x - 3, pt_y - 3, pt_x + 3, pt_y + 3], fill="#38BDF8")

    # Bottom Invariant Shield
    draw.rounded_rectangle([100, 930, 1820, 1010], radius=14, fill="#052E16", outline="#10B981", width=2)
    draw.text((140, 955), "SECURITY INVARIANT ACTIVE: Document text is untrusted data. Imperative prompts quarantined & logged.", fill="#A7F3D0", font=f_main)


def render_scene2_frame(t_progress: float, draw: ImageDraw.ImageDraw, f_bold, f_main, f_small, f_tag):
    """Scene 2: Trust Gate Comparator balancing GST sales vs Bank Credits, stamping Grade C."""
    draw.text((100, 60), "STAGE 2 &bull; TRUST GATE CROSS-TRIANGULATION", fill="#F59E0B", font=f_tag)
    draw.text((100, 100), "Reconciling Claimed Sales Against Bank Deposits", fill="#FFFFFF", font=f_bold)
    draw.text((100, 155), "Evaluating turnover gap and stamping deterministic trust grades", fill="#94A3B8", font=f_main)

    # Dynamic Comparison Box
    box_x1, box_y1, box_x2, box_y2 = 150, 240, 1770, 860
    draw.rounded_rectangle([box_x1, box_y1, box_x2, box_y2], radius=24, fill="#1E293B", outline="#334155", width=2)

    # Bar 1: Declared GST
    draw.text((220, 290), "Reported GST Supply (GSTR-3B Tax Filing)", fill="#E2E8F0", font=f_main)
    bar1_w = int(min(1.0, t_progress * 2.2) * 1100)
    draw.rounded_rectangle([220, 340, 220 + bar1_w, 420], radius=14, fill="#D97706")
    draw.text((240, 365), "INR 4,00,00,000  (₹4.00 Crore Declared)", fill="#FFFFFF", font=f_bold)

    # Bar 2: Verified Bank Deposits
    draw.text((220, 480), "Verified Inward Bank Credits (Primary SBI Account)", fill="#E2E8F0", font=f_main)
    bar2_w = int(min(1.0, t_progress * 2.2) * 330)  # exactly 30% of bar 1
    draw.rounded_rectangle([220, 530, 220 + bar2_w, 610], radius=14, fill="#059669")
    draw.text((240, 555), "INR 1,20,00,000 (₹1.20 Cr Banked)", fill="#FFFFFF", font=f_bold)

    # Turnover Gap Animated Meter
    if t_progress > 0.4:
        gap_progress = min(1.0, (t_progress - 0.4) / 0.3)
        gap_val = gap_progress * 70.0
        draw.rounded_rectangle([220, 670, 1700, 780], radius=16, fill="#450A0A", outline="#DC2626", width=2)
        draw.text((260, 700), f"TURNOVER GAP DETECTED: {gap_val:.1f}%  (Exceeds 20% Policy Limit)", fill="#FCA5A5", font=f_bold)
        draw.text((260, 740), "Unconfirmed Volume: ₹2.80 Crore unbacked by banking channels.", fill="#FECACA", font=f_main)

    # Stamping Grade C (animates slam)
    if t_progress > 0.7:
        stamp_scale = max(1.0, 1.8 - (t_progress - 0.7) * 4)
        stamp_x, stamp_y = 1450, 330
        draw.rounded_rectangle([stamp_x, stamp_y, stamp_x + 240, stamp_y + 110], radius=16, fill="#991B1B", outline="#EF4444", width=3)
        draw.text((stamp_x + 25, stamp_y + 20), "GRADE C", fill="#FFFFFF", font=f_bold)
        draw.text((stamp_x + 25, stamp_y + 65), "CONTRADICTED", fill="#FCA5A5", font=f_small)

    # Bottom Invariant
    draw.rounded_rectangle([100, 930, 1820, 1010], radius=14, fill="#172554", outline="#3B82F6", width=2)
    draw.text((140, 955), "RULE 1: Code computes, models explain. Turnover gap calculated purely in deterministic Python.", fill="#BFDBFE", font=f_main)


def render_scene3_frame(t_progress: float, draw: ImageDraw.ImageDraw, f_bold, f_main, f_small, f_tag):
    """Scene 3: Parallel concurrent execution: packets branching to Cashflow and Fraud simultaneously."""
    draw.text((100, 60), "STAGE 3 &bull; PARALLEL AGENT EXECUTION (CONCURRENT WAVE 3)", fill="#38BDF8", font=f_tag)
    draw.text((100, 100), "Topological Wave Scheduler (asyncio.gather)", fill="#FFFFFF", font=f_bold)
    draw.text((100, 155), "Independent stages execute concurrently without rigid sequential delays", fill="#94A3B8", font=f_main)

    # Trust Gate Origin (Left)
    origin_x, origin_y = 150, 480
    draw.rounded_rectangle([origin_x, origin_y, origin_x + 360, origin_y + 160], radius=18, fill="#1E293B", outline="#F59E0B", width=2)
    draw.text((origin_x + 30, origin_y + 35), "TRUST GATE AGENT", fill="#F59E0B", font=f_bold)
    draw.text((origin_x + 30, origin_y + 80), "Output Facts Emitted:", fill="#94A3B8", font=f_small)
    draw.text((origin_x + 30, origin_y + 105), "Grade A &bull; Grade C tagged", fill="#E2E8F0", font=f_small)

    # Two Target Parallel Agents (Right)
    target1_x, target1_y = 1180, 260
    target2_x, target2_y = 1180, 640

    # Agent 1: Cash Flow
    draw.rounded_rectangle([target1_x, target1_y, target1_x + 580, target1_y + 200], radius=20, fill="#1E293B", outline="#10B981", width=3)
    draw.text((target1_x + 40, target1_y + 35), "CASH FLOW ANALYSIS AGENT", fill="#10B981", font=f_bold)
    draw.text((target1_x + 40, target1_y + 85), "Status: CONCURRENT EXECUTION (Wave 3)", fill="#E2E8F0", font=f_small)
    draw.text((target1_x + 40, target1_y + 120), "Computing: Net monthly cash = ₹1.50 Lakh/mo", fill="#A7F3D0", font=f_main)

    # Agent 2: Forensic Fraud
    draw.rounded_rectangle([target2_x, target2_y, target2_x + 580, target2_y + 200], radius=20, fill="#1E293B", outline="#F43F5E", width=3)
    draw.text((target2_x + 40, target2_y + 35), "FORENSIC FRAUD DETECTOR", fill="#F43F5E", font=f_bold)
    draw.text((target2_x + 40, target2_y + 85), "Status: CONCURRENT EXECUTION (Wave 3)", fill="#E2E8F0", font=f_small)
    draw.text((target2_x + 40, target2_y + 120), "Scanning: NetworkX payer-to-payee cycle graph", fill="#FECDD3", font=f_main)

    # Moving Data Packets along connecting paths
    p_x1 = origin_x + 360
    p_y1 = origin_y + 80
    packet_prog = (t_progress * 4) % 1.0

    # Branch 1 packet
    cur1_x = p_x1 + (target1_x - p_x1) * packet_prog
    cur1_y = p_y1 + (target1_y + 100 - p_y1) * packet_prog
    draw.ellipse([cur1_x - 14, cur1_y - 14, cur1_x + 14, cur1_y + 14], fill="#10B981")
    draw.line([p_x1, p_y1, target1_x, target1_y + 100], fill="#059669", width=3)

    # Branch 2 packet
    cur2_x = p_x1 + (target2_x - p_x1) * packet_prog
    cur2_y = p_y1 + (target2_y + 100 - p_y1) * packet_prog
    draw.ellipse([cur2_x - 14, cur2_y - 14, cur2_x + 14, cur2_y + 14], fill="#F43F5E")
    draw.line([p_x1, p_y1, target2_x, target2_y + 100], fill="#E11D48", width=3)

    # Turnaround Metric Callout
    draw.rounded_rectangle([100, 930, 1820, 1010], radius=14, fill="#0F172A", outline="#38BDF8", width=2)
    draw.text((140, 955), "PERFORMANCE GAIN: Parallel wave scheduling completes in 1.84s (42% turnaround acceleration).", fill="#38BDF8", font=f_main)


def render_scene4_frame(t_progress: float, draw: ImageDraw.ImageDraw, f_bold, f_main, f_small, f_tag):
    """Scene 4: Forensic NetworkX circular flow loop with moving money packets."""
    draw.text((100, 60), "STAGE 4 &bull; FORENSIC NETWORK-X CIRCULAR FLOW ISOLATION", fill="#F43F5E", font=f_tag)
    draw.text((100, 100), "Closed Directed Cycle: Sharma -> Verma -> Gupta -> Sharma", fill="#FFFFFF", font=f_bold)
    draw.text((100, 155), "Money cycles back to source within 6 days &bull; Shared physical address identified", fill="#94A3B8", font=f_main)

    # 3 Triangle Nodes
    n1_x, n1_y = 350, 360   # Sharma Global
    n2_x, n2_y = 1200, 360  # Verma Logistics
    n3_x, n3_y = 775, 760   # Gupta Trading

    # Draw Nodes
    for x, y, name, role in [
        (n1_x, n1_y, "Sharma Global Exports", "Borrower Entity"),
        (n2_x, n2_y, "Verma Logistics", "Primary Buyer"),
        (n3_x, n3_y, "Gupta Trading Corp", "Intermediary Trader"),
    ]:
        draw.rounded_rectangle([x - 180, y - 55, x + 180, y + 55], radius=20, fill="#1E293B", outline="#F43F5E", width=3)
        draw.text((x - 150, y - 35), name, fill="#FFFFFF", font=f_bold)
        draw.text((x - 150, y + 10), role, fill="#FDA4AF", font=f_small)

    # Directed Edges (Red)
    draw.line([n1_x + 180, n1_y, n2_x - 180, n2_y], fill="#E11D48", width=4)
    draw.line([n2_x - 90, n2_y + 55, n3_x + 90, n3_y - 55], fill="#E11D48", width=4)
    draw.line([n3_x - 90, n3_y - 55, n1_x + 90, n1_y + 55], fill="#E11D48", width=4)

    # Animated Money Packets cycling continuously around the triangle
    cycle_time = (t_progress * 3) % 1.0
    if cycle_time < 0.333:
        sub_t = cycle_time / 0.333
        px = (n1_x + 180) + ((n2_x - 180) - (n1_x + 180)) * sub_t
        py = n1_y
        label = "Txn #001: ₹25.0 Lakh (Day 1)"
    elif cycle_time < 0.666:
        sub_t = (cycle_time - 0.333) / 0.333
        px = (n2_x - 90) + ((n3_x + 90) - (n2_x - 90)) * sub_t
        py = (n2_y + 55) + ((n3_y - 55) - (n2_y + 55)) * sub_t
        label = "Txn #002: ₹24.8 Lakh (Day 4)"
    else:
        sub_t = (cycle_time - 0.666) / 0.334
        px = (n3_x - 90) + ((n1_x + 90) - (n3_x - 90)) * sub_t
        py = (n3_y - 55) + ((n1_y + 55) - (n3_y - 55)) * sub_t
        label = "Txn #003: ₹24.7 Lakh (Day 6)"

    draw.ellipse([px - 18, py - 18, px + 18, py + 18], fill="#FACC15", outline="#FFFFFF", width=3)
    draw.text((700, 480), label, fill="#FACC15", font=f_bold)

    # Forensic Evidence Callouts
    draw.rounded_rectangle([1450, 480, 1820, 840], radius=18, fill="#4C0519", outline="#F43F5E", width=2)
    draw.text((1480, 510), "ISOLATED FORENSIC PROOF", fill="#FECDD3", font=f_bold)
    draw.text((1480, 560), "&bull; Cycle Return: 6 Days", fill="#FFFFFF", font=f_main)
    draw.text((1480, 600), "&bull; Slippage: &lt;1.5% Loss", fill="#FFFFFF", font=f_main)
    draw.text((1480, 640), "&bull; Address: Plot 42, Okhla", fill="#FACC15", font=f_main)
    draw.text((1480, 680), "&bull; Outside World: 87% Loop", fill="#FDA4AF", font=f_main)
    draw.text((1480, 740), "Rule: CIRCULAR_FLOW_CYCLE", fill="#A7F3D0", font=f_small)

    # Bottom Invariant
    draw.rounded_rectangle([100, 930, 1820, 1010], radius=14, fill="#0F172A", outline="#E11D48", width=2)
    draw.text((140, 955), "NON-NEGOTIABLE RULE 4: Every fraud flag carries exact transaction IDs and the firing rule.", fill="#FDA4AF", font=f_main)


def render_scene5_frame(t_progress: float, draw: ImageDraw.ImageDraw, f_bold, f_main, f_small, f_tag):
    """Scene 5: Incremental Re-planning ripple: utility bills uploaded, loan sizing counts up live."""
    draw.text((100, 60), "STAGE 5 &bull; INCREMENTAL RE-PLANNING &amp; LIVE RESIZING", fill="#10B981", font=f_tag)
    draw.text((100, 100), "Input-Hash Caching: New Evidence Upgrades Loan Sizing", fill="#FFFFFF", font=f_bold)
    draw.text((100, 155), "Only stale downstream stages recompute &bull; 6 of 9 upstream stages stay cached", fill="#94A3B8", font=f_main)

    # Left: Uploaded Evidence File Card
    draw.rounded_rectangle([150, 240, 620, 480], radius=20, fill="#1E293B", outline="#10B981", width=3)
    draw.text((190, 280), "NEW EVIDENCE EVENT", fill="#34D399", font=f_bold)
    draw.text((190, 330), "Doc: BSES_Electricity_FY24.pdf", fill="#FFFFFF", font=f_main)
    draw.text((190, 370), "Commercial Power Consumption Proof", fill="#94A3B8", font=f_small)
    draw.text((190, 410), "Corroborates: +₹0.60 Lakh/mo Cash", fill="#FBBF24", font=f_bold)

    # Center Right: Loan Sizing Counter
    draw.rounded_rectangle([700, 240, 1770, 600], radius=24, fill="#0F172A", outline="#38BDF8", width=3)
    draw.text((760, 290), "DETERMINISTIC PRESENT VALUE LOAN SIZING", fill="#94A3B8", font=f_main)

    # Live Counting up from 45.0 to 66.0 Lakh
    val = 45.0 + min(1.0, t_progress * 1.5) * 21.0
    cash_val = 1.5 + min(1.0, t_progress * 1.5) * 0.6
    draw.text((760, 350), f"APPROVED SANCTION:  ₹{val:.1f} LAKH", fill="#10B981" if val > 46 else "#38BDF8", font=f_bold)
    draw.text((760, 440), f"Verified Monthly Cash: ₹{cash_val:.2f} Lakh/mo  (Min DSCR: 1.25x)", fill="#F1F5F9", font=f_main)
    draw.text((760, 490), "Tenor: 60 Months &bull; Rate: 12.0% p.a. &bull; Formula: PV(PMT, r, n)", fill="#94A3B8", font=f_small)

    # Re-plan Stages State Bar
    draw.rounded_rectangle([150, 650, 1770, 860], radius=20, fill="#1E293B", outline="#334155", width=2)
    draw.text((190, 680), "ORCHESTRATOR INCREMENTAL CACHE STATUS", fill="#FBBF24", font=f_bold)

    stages = [
        ("intake", "CACHED", "#10B981"),
        ("bureau", "CACHED", "#10B981"),
        ("trust_gate", "CACHED", "#10B981"),
        ("cashflow", "STALE RERUN", "#F59E0B"),
        ("fraud", "CACHED", "#10B981"),
        ("risk", "STALE RERUN", "#F59E0B"),
        ("structuring", "STALE RERUN", "#F59E0B"),
        ("ledger", "CACHED", "#10B981"),
    ]

    for idx, (s_name, s_state, s_color) in enumerate(stages):
        sx = 190 + idx * 195
        draw.rounded_rectangle([sx, 730, sx + 175, 820], radius=12, fill="#0F172A", outline=s_color, width=2)
        draw.text((sx + 15, 745), s_name, fill="#FFFFFF", font=f_small)
        draw.text((sx + 15, 780), s_state, fill=s_color, font=f_small)

    # Bottom Invariant
    draw.rounded_rectangle([100, 930, 1820, 1010], radius=14, fill="#042F2E", outline="#14B8A6", width=2)
    draw.text((140, 955), "INCREMENTAL RE-PLAN INVARIANT: Unchanged stages maintain identical output hashes. 66.7% compute saved.", fill="#99F6E4", font=f_main)


def render_scene6_frame(t_progress: float, draw: ImageDraw.ImageDraw, f_bold, f_main, f_small, f_tag):
    """Scene 6: Credit officer human review & zero-disbursal guarantee."""
    draw.text((100, 60), "STAGE 6 &bull; HUMAN OFFICER APPROVAL &amp; ZERO-DISBURSAL GUARANTEE", fill="#A855F7", font=f_tag)
    draw.text((100, 100), "Credit Officer Final Decision &amp; Non-Negotiable Safety", fill="#FFFFFF", font=f_bold)
    draw.text((100, 155), "The system proposes, a human decides &bull; Physically impossible to release money automatically", fill="#94A3B8", font=f_main)

    # Decision Card
    draw.rounded_rectangle([150, 240, 1100, 860], radius=24, fill="#1E293B", outline="#A855F7", width=2)
    draw.text((200, 290), "AUTHORIZED OFFICER DECISION GATE", fill="#D8B4FE", font=f_bold)
    draw.text((200, 340), "Officer: Priya Sharma &bull; Employee ID #CR-88412", fill="#FFFFFF", font=f_main)

    # Action Status
    if t_progress > 0.4:
        draw.rounded_rectangle([200, 410, 1050, 520], radius=18, fill="#065F46", outline="#34D399", width=2)
        draw.text((240, 440), "ACTION RECORDED: LOAN SANCTIONED", fill="#FFFFFF", font=f_bold)
        draw.text((240, 480), "Terms: ₹66.0 Lakh @ 12.0% for 60 Months &bull; Ledger Status: SANCTIONED", fill="#A7F3D0", font=f_main)

    draw.text((200, 560), "Auditable Proof Pack Findings:", fill="#94A3B8", font=f_main)
    draw.text((200, 600), "&bull; 100% of CAM sentences backed by fact &amp; transaction IDs", fill="#E2E8F0", font=f_main)
    draw.text((200, 640), "&bull; Sizing grounded strictly on confirmed cashflow (₹2.1L/mo)", fill="#E2E8F0", font=f_main)
    draw.text((200, 680), "&bull; Circular loop logged with isolated transaction records", fill="#E2E8F0", font=f_main)
    draw.text((200, 720), "&bull; Audit log entry appended with cryptographic officer signature", fill="#E2E8F0", font=f_main)

    # Right: Huge Safety Padlock Badge
    draw.rounded_rectangle([1180, 240, 1770, 860], radius=24, fill="#0F172A", outline="#10B981", width=4)
    draw.text((1250, 320), "ZERO DISBURSAL", fill="#10B981", font=f_bold)
    draw.text((1250, 380), "GUARANTEE", fill="#10B981", font=f_bold)
    draw.text((1250, 460), "No route, function or ledger", fill="#E2E8F0", font=f_main)
    draw.text((1250, 500), "state can release funds.", fill="#E2E8F0", font=f_main)
    draw.text((1250, 560), "Automated test scans 100% of", fill="#94A3B8", font=f_small)
    draw.text((1250, 595), "API routes to prove money", fill="#94A3B8", font=f_small)
    draw.text((1250, 630), "cannot be disbursed automatically.", fill="#94A3B8", font=f_small)
    draw.rounded_rectangle([1250, 710, 1700, 790], radius=14, fill="#064E3B")
    draw.text((1280, 735), "AUTOMATED AUDIT: PASSED", fill="#34D399", font=f_bold)

    # Bottom Invariant
    draw.rounded_rectangle([100, 930, 1820, 1010], radius=14, fill="#2E1065", outline="#A855F7", width=2)
    draw.text((140, 955), "RULE 2: A human always decides. System proposes, human signs off. No automatic rejections.", fill="#E9D5FF", font=f_main)


RENDERERS = [
    render_scene1_frame,
    render_scene2_frame,
    render_scene3_frame,
    render_scene4_frame,
    render_scene5_frame,
    render_scene6_frame,
]


def build_motion_video():
    """Render 30 FPS animated frames and pipe into ffmpeg."""
    if BUILD_DIR.exists():
        shutil.rmtree(BUILD_DIR)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)

    f_bold = ImageFont.truetype(FONT_BOLD, 36)
    f_main = ImageFont.truetype(FONT_MAIN, 26)
    f_small = ImageFont.truetype(FONT_MAIN, 20)
    f_tag = ImageFont.truetype(FONT_BOLD, 22)

    clip_paths = []
    print(f"[START] Starting 30 FPS Prototype Motion Video Generation ({len(SCENE_DEFS)} scenes)...")

    for idx, sc in enumerate(SCENE_DEFS):
        sc_id = sc["id"]
        print(f"\n[Scene {idx+1}/{len(SCENE_DEFS)}] Rendering '{sc['title']}'...")

        wav_path = BUILD_DIR / f"{sc_id}.wav"
        clip_path = BUILD_DIR / f"{sc_id}.mp4"

        # 1. Synthesize Audio
        duration = generate_audio(sc["narration"], wav_path)
        total_frames = int((duration + 0.5) * FPS)
        print(f"  [AUDIO] Duration: {duration:.2f}s -> Generating {total_frames} animated frames @ 30 FPS...")

        # 2. Start FFmpeg process reading raw RGB24 frames from stdin
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-f", "rawvideo",
            "-vcodec", "rawvideo",
            "-s", f"{WIDTH}x{HEIGHT}",
            "-pix_fmt", "rgb24",
            "-r", str(FPS),
            "-i", "-",  # Stdin
            "-i", str(wav_path),
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "22",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            "-t", str(duration + 0.5),
            str(clip_path)
        ]

        proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        render_fn = RENDERERS[idx]

        # 3. Render and pipe each animated frame
        base_im = Image.new("RGB", (WIDTH, HEIGHT), color="#0B132B")
        for f in range(total_frames):
            t_progress = f / float(total_frames)
            im = base_im.copy()
            draw = ImageDraw.Draw(im)

            # Top Blue accent strip
            draw.rectangle([0, 0, WIDTH, 10], fill="#38BDF8")

            # Call scene-specific animated renderer
            render_fn(t_progress, draw, f_bold, f_main, f_small, f_tag)

            proc.stdin.write(im.tobytes())

        proc.stdin.close()
        proc.wait()
        if proc.returncode != 0:
            raise RuntimeError(f"FFmpeg failed encoding {clip_path}")
        print(f"  [DONE] Scene clip encoded: {clip_path.name}")
        clip_paths.append(clip_path)

    # Concatenate all scene clips
    print("\n[PACK] Concatenating scene clips into master walkthrough video...")
    concat_txt = BUILD_DIR / "concat.txt"
    with open(concat_txt, "w", encoding="utf-8") as f:
        for c in clip_paths:
            f.write(f"file '{c.resolve()}'\n")

    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_txt),
        "-c", "copy",
        str(OUTPUT_VIDEO)
    ]
    res = subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode != 0:
        raise RuntimeError("Concatenation failed")

    size_mb = OUTPUT_VIDEO.stat().st_size / (1024 * 1024)
    print(f"\n[COMPLETE] Master Prototype Motion Video generated successfully: {OUTPUT_VIDEO}")
    print(f"[INFO] Size: {size_mb:.2f} MB")


if __name__ == "__main__":
    build_motion_video()
