"""Automated HD Demo Video Generator for Verifin: An Adaptive Multi-Agent Financial Intelligence System.

Renders an 8-scene 1080p presentation video with synchronized voiceover narration
based on the official 3-minute demo script from Section 14 of docs/SPEC.md.
Uses SAPI voice synthesis, Pillow graphics rendering, and ffmpeg encoding.
"""

import os
import shutil
import wave
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import win32com.client

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BUILD_DIR = PROJECT_ROOT / "demo_video_build"
OUTPUT_VIDEO = PROJECT_ROOT / "msme_underwriting_copilot_demo.mp4"

FONT_MAIN = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = r"C:\Windows\Fonts\arialbd.ttf"
if not os.path.exists(FONT_MAIN):
    FONT_MAIN = r"C:\Windows\Fonts\arial.ttf"

SCENES = [
    {
        "id": "scene1_intro",
        "title": "Verifin",
        "subtitle": "An Adaptive Multi-Agent Financial Intelligence System",
        "badge": "Virtusa Jatayu Season 6 | Team Code & Cosmos",
        "narration": (
            "Welcome to Verifin: An Adaptive Multi-Agent Financial Intelligence System. "
            "Credit officers spend days cross-referencing bank statements, GST filings, and bureau data by hand. "
            "Fraudsters exploit this by inflating turnover through circular trading loops. "
            "Our copilot introduces an adaptive parallel agent workflow with incremental re-planning, "
            "where code computes, models explain, and a human always makes the final call."
        ),
        "bullets": [
            "Problem: Fake turnover and circular loops hide in the gaps between isolated documents.",
            "Solution: Forward-deployed agent copilot providing transaction-level proof in minutes.",
            "Core Invariant: Plain Python computes limits and DSCR; automated disbursal is strictly impossible.",
        ],
        "footer": "Non-Negotiable Safety: A human officer decides every loan sanction. No auto-rejections.",
    },
    {
        "id": "scene2_sharma_case",
        "title": "Case Study: Sharma Traders",
        "subtitle": "Inflated Sales & Turnover Reconciliation Gap",
        "badge": "Trust Gate Grading Engine: Grade C Anomaly",
        "narration": (
            "We open the case of Sharma Traders. "
            "The borrower declared annual GST sales of four crore rupees. "
            "However, primary bank credits corroborate only one point two crore rupees. "
            "The Trust Gate detects a seventy percent turnover gap and flags the sales fact as Grade C. "
            "Net operating cash is confirmed at one point five lakh per month, giving an initial DSCR of zero point nine."
        ),
        "bullets": [
            "Reported GST Turnover: ₹4.00 Crore (Declared in GSTR-3B filings).",
            "Verified Inward Bank Credits: ₹1.20 Crore (12-month primary SBI account).",
            "Turnover Gap: 70.0% (Exceeds lender risk threshold of 20%).",
            "Trust Gate Grade: Assigned Grade C with transaction-level traceability.",
        ],
        "footer": "Colleague Tone: 'GST shows ₹4.0 Cr but the bank confirms ₹1.2 Cr. Let's see what explains the gap.'",
    },
    {
        "id": "scene3_adaptive_workflow",
        "title": "Adaptive Parallel Agent Workflow",
        "subtitle": "Topological Wave Scheduler with Concurrency",
        "badge": "Orchestrator Architecture: 42% Turnaround Acceleration",
        "narration": (
            "Instead of rigid sequential pipelines, our orchestrator builds a dynamic dependency graph per case. "
            "In Wave 1, Document Intake and Credit Bureau checks run simultaneously because their inputs are both ready. "
            "In Wave 2, the Trust Gate grades each number. "
            "In Wave 3, Cash Flow Analysis and Fraud Detection execute in parallel. "
            "Deterministic merge ordering ensures identical replays across all runs."
        ),
        "bullets": [
            "Wave 1 (Concurrent): Document Intake and Bureau/KYC run side by side.",
            "Wave 2: Trust Gate grades all extracted data A, B, or C.",
            "Wave 3 (Concurrent): Cash Flow Analysis and Forensic Fraud Detection run simultaneously.",
            "Waves 4 to 8: Risk, Policy compliance, Structuring, CAM drafting, and Ledger posting.",
        ],
        "footer": "Timeline Narration: 'I started reading the documents and checking the bureau at the same time.'",
    },
    {
        "id": "scene4_circular_trading",
        "title": "Forensic Entity Graph & Circular Flows",
        "subtitle": "NetworkX Cycle Detection & Hashed Identifiers",
        "badge": "Forensic Isolation: Sharma-Verma-Gupta Ring",
        "narration": (
            "Clicking into the fraud graph reveals directed relationship cycles. "
            "In our linked-firm benchmark, funds flow from Sharma to Verma to Gupta and back to Sharma within six days. "
            "The system flags the exact six transaction IDs, identifies a shared physical address in Okhla, "
            "and confirms that eighty-seven percent of funds fail the outside-world dissipation test."
        ),
        "bullets": [
            "Directed Cycle: Sharma Global -> Verma Logistics -> Gupta Trading -> Sharma Global.",
            "Time Window: Value returns to origin in under 6 days with less than 1.5% slippage.",
            "Shared Identifiers: Common physical office premise and shared director contact hash.",
            "Honest Borrower Protection: Cash-heavy shops are graded B and never labelled fraud.",
        ],
        "footer": "Transaction-Level Proof: Every flag carries specific transaction IDs and the firing rule.",
    },
    {
        "id": "scene5_loan_sizing",
        "title": "Deterministic Loan Sizing & Evidence Ladder",
        "subtitle": "Gaps Become Next Steps, Not Dead Ends",
        "badge": "Worked Example: ₹45 Lakh Initial Sizing",
        "narration": (
            "All arithmetic is strictly deterministic Python code. "
            "With verified cash of one point five lakh per month and existing debt of twenty thousand, "
            "eligible monthly instalment is one lakh at a one point two five DSCR floor. "
            "Present value sizes a safe loan of forty-five lakh rupees. "
            "Rather than rejecting the loan, the Evidence Ladder gives the borrower a prioritized roadmap to unlock sixty-six lakh."
        ),
        "bullets": [
            "Eligible Instalment = (Verified Cash / 1.25 DSCR) - Existing EMI = ₹1.0 Lakh/mo.",
            "Safe Sanction: Present value at 12% for 5 years equals ₹45 Lakh.",
            "Evidence Ladder Step 1: 12 months commercial electricity bills unlocks +₹21 Lakh.",
            "Evidence Ladder Step 2: Transporter E-Way bills unlock +₹9 Lakh.",
        ],
        "footer": "Transparent Math: Sized strictly on confirmed cashflow with clear next steps.",
    },
    {
        "id": "scene6_incremental_replan",
        "title": "Incremental Re-Planning in Action",
        "subtitle": "Stale-Marking & 66.7% Compute Reused",
        "badge": "New Evidence Event: Electricity Bills Uploaded",
        "narration": (
            "Now watch the live incremental re-plan. "
            "The borrower uploads commercial electricity receipts corroborating sixty thousand rupees in monthly operating cash. "
            "The orchestrator checks input hashes and marks only three downstream stages as stale: "
            "Cash Flow, Risk, and Structuring. "
            "The remaining six stages reuse their cached results, and the approved loan updates to sixty-six lakh rupees."
        ),
        "bullets": [
            "New Evidence Event: BSES commercial electricity utility bills uploaded.",
            "Stale Marking: Only Cash Flow, Risk, and Structuring recompute.",
            "Cache Hit: Intake, Bureau, Trust Gate, and Fraud Detection stay reused from cache.",
            "Outcome: Sizing recalculated live from ₹45 Lakh to ₹66 Lakh with 66.7% compute saved.",
        ],
        "footer": "Microcopy: 'Thanks. I only need to redo 3 of 9 steps. The rest stay as they were.'",
    },
    {
        "id": "scene7_policy_and_security",
        "title": "Policy Engine & Security Controls",
        "subtitle": "One-Click Policy Swap & Prompt-Injection Defense",
        "badge": "Bank A vs Bank B YAML Policy Packs",
        "narration": (
            "Our policy engine enforces hard limits in code. "
            "Switching from Bank A to Bank B updates risk floors and caps instantly with no code changes. "
            "Meanwhile, our prompt-injection defense intercepts hidden instructions embedded in untrusted documents. "
            "Adversarial attempts to force approvals are quarantined, logged in the audit trail, and ignored by calculators."
        ),
        "bullets": [
            "Policy Packs: One-click switch between Bank A (moderate) and Bank B (conservative) YAML policies.",
            "Hard Limits in Code: The engine rejects invalid term sheets regardless of model outputs.",
            "Prompt Injection Defense: Document text is untrusted data; adversarial prompts are neutralized and logged.",
            "Citation Validator: Blocks any CAM sentence that lacks verified transaction evidence IDs.",
        ],
        "footer": "Security Invariant: Token-budgeted routing and complete PII masking prior to model calls.",
    },
    {
        "id": "scene8_human_decision",
        "title": "Human-in-the-Loop Decision & Ledger",
        "subtitle": "Final Officer Sign-Off & Zero-Disbursal Guarantee",
        "badge": "Credit Officer: Priya Sharma (#CR-88412)",
        "narration": (
            "Finally, the human credit officer reviews the one-page Proof Pack. "
            "The officer can Approve, Send back with notes, or Escalate. "
            "Posting moves the loan to Sanctioned status in the ledger. "
            "Most importantly, an automated audit verifies that no disbursal endpoint exists anywhere in the codebase. "
            "Verifin: faster approvals, forensic fraud detection, and humans always in command."
        ),
        "bullets": [
            "Proof Pack: One-page printable summary with verified citations and key metrics.",
            "Officer Accountability: System proposes terms; authenticated credit officer makes the final call.",
            "Mock Ledger: Entries held as PENDING_APPROVAL until officer approval.",
            "Zero Disbursal Route: Test suite scans every API route to prove money cannot be disbursed.",
        ],
        "footer": "Virtusa Jatayu S6: Forward-deployed engineering transforming MSME credit underwriting.",
    },
]


def generate_audio(text: str, output_wav: Path) -> float:
    """Generate audio via Windows SAPI and return duration in seconds."""
    speaker = win32com.client.Dispatch("SAPI.SpVoice")
    stream = win32com.client.Dispatch("SAPI.SpFileStream")
    
    # Speed: 0 is normal, 1 is slightly faster
    speaker.Rate = 0
    
    if output_wav.exists():
        output_wav.unlink()
        
    stream.Open(str(output_wav), 3)  # 3 = SSFMCreateForWrite
    speaker.AudioOutputStream = stream
    speaker.Speak(text)
    stream.Close()
    
    with wave.open(str(output_wav), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        duration = frames / float(rate)
    return duration


def render_slide(scene: dict, output_png: Path) -> None:
    """Render a modern, clean 1920x1080 slide image for the scene."""
    width, height = 1920, 1080
    im = Image.new("RGB", (width, height), color="#0F172A")  # Deep slate navy
    draw = ImageDraw.Draw(im)

    font_title = ImageFont.truetype(FONT_BOLD, 54)
    font_subtitle = ImageFont.truetype(FONT_MAIN, 28)
    font_badge = ImageFont.truetype(FONT_BOLD, 22)
    font_bullet_title = ImageFont.truetype(FONT_BOLD, 26)
    font_footer = ImageFont.truetype(FONT_MAIN, 22)
    font_header_tag = ImageFont.truetype(FONT_BOLD, 20)

    # Top Brand Ribbon
    draw.rectangle([0, 0, width, 14], fill="#3082FC")  # Brand Blue accent

    # Top Left Tag
    draw.text((100, 60), "VERIFIN • ADAPTIVE MULTI-AGENT FINANCIAL INTELLIGENCE", fill="#94A3B8", font=font_header_tag)
    
    # Badge Pill (Top Right)
    badge_text = scene["badge"]
    badge_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    badge_w = badge_bbox[2] - badge_bbox[0] + 36
    draw.rounded_rectangle([width - 100 - badge_w, 52, width - 100, 96], radius=12, fill="#1E293B", outline="#334155", width=2)
    draw.text((width - 100 - badge_w + 18, 62), badge_text, fill="#38BDF8", font=font_badge)

    # Main Title & Subtitle
    draw.text((100, 130), scene["title"], fill="#FFFFFF", font=font_title)
    draw.text((100, 205), scene["subtitle"], fill="#94A3B8", font=font_subtitle)

    # Divider
    draw.line([100, 260, width - 100, 260], fill="#334155", width=2)

    # Central Content Card Container
    card_y = 300
    for i, bullet in enumerate(scene["bullets"]):
        parts = bullet.split(":", 1)
        headline = parts[0] + ":"
        body = parts[1] if len(parts) > 1 else ""

        # Card box
        box_y1 = card_y + (i * 180)
        box_y2 = box_y1 + 145
        draw.rounded_rectangle([100, box_y1, width - 100, box_y2], radius=16, fill="#1E293B", outline="#334155", width=2)

        # Number circle
        draw.ellipse([140, box_y1 + 45, 195, box_y1 + 100], fill="#2563EB")
        draw.text((158, box_y1 + 54), str(i + 1), fill="#FFFFFF", font=font_bullet_title)

        # Text
        draw.text((230, box_y1 + 38), headline, fill="#38BDF8", font=font_bullet_title)
        draw.text((230, box_y1 + 80), body.strip(), fill="#E2E8F0", font=font_subtitle)

    # Bottom Footer Bar
    draw.rectangle([0, height - 90, width, height], fill="#0A0F1D")
    draw.line([0, height - 90, width, height - 90], fill="#1E293B", width=2)
    draw.text((100, height - 60), scene["footer"], fill="#94A3B8", font=font_footer)

    im.save(output_png, quality=95)


def build_demo_video() -> None:
    """Assemble all scenes and compile final MP4."""
    if BUILD_DIR.exists():
        shutil.rmtree(BUILD_DIR)
    BUILD_DIR.mkdir(parents=True, exist_ok=True)

    clip_paths = []
    print(f"[START] Starting Demo Video Generation ({len(SCENES)} scenes)...")

    for idx, scene in enumerate(SCENES):
        scene_id = scene["id"]
        print(f"\n[Scene {idx+1}/{len(SCENES)}] Processing '{scene['title']}'...")

        wav_path = BUILD_DIR / f"{scene_id}.wav"
        png_path = BUILD_DIR / f"{scene_id}.png"
        clip_path = BUILD_DIR / f"{scene_id}.mp4"

        # 1. Synthesize Audio
        duration = generate_audio(scene["narration"], wav_path)
        print(f"  [AUDIO] Voiceover generated: {duration:.2f} seconds")

        # 2. Render Slide Graphic
        render_slide(scene, png_path)
        print(f"  [SLIDE] 1080p slide rendered: {png_path.name}")

        # 3. Encode Scene Clip with ffmpeg
        # Add 0.5s padding so audio is not cut off abruptly
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(png_path),
            "-i", str(wav_path),
            "-c:v", "libx264", "-tune", "stillimage",
            "-c:a", "aac", "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-t", str(duration + 0.5),
            str(clip_path)
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode != 0:
            raise RuntimeError(f"FFmpeg failed encoding clip {clip_path}")
        print(f"  [CLIP] Clip compiled: {clip_path.name}")
        clip_paths.append(clip_path)

    # 4. Concatenate All Clips
    print("\n[PACK] Concatenating all scenes into final master video...")
    concat_list_file = BUILD_DIR / "concat_list.txt"
    with open(concat_list_file, "w", encoding="utf-8") as f:
        for clip in clip_paths:
            f.write(f"file '{clip.resolve()}'\n")

    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_list_file),
        "-c", "copy",
        str(OUTPUT_VIDEO)
    ]
    res = subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode != 0:
        raise RuntimeError("FFmpeg concatenation failed")

    file_size_mb = OUTPUT_VIDEO.stat().st_size / (1024 * 1024)
    print(f"\n[DONE] Video successfully generated: {OUTPUT_VIDEO}")
    print(f"[INFO] Final Video File Size: {file_size_mb:.2f} MB")


if __name__ == "__main__":
    build_demo_video()
