/**
 * Centralized humanized copy for MSME Underwriting Copilot.
 * Strictly adheres to AGENTS.md rule:
 * "All copy lives in frontend/src/copy/microcopy.ts, not scattered in components."
 */

export const microcopy = {
  app: {
    title: "MSME Underwriting Copilot",
    tagline: "Forward-Deployed Credit Copilot",
    officerRoleBadge: "Credit Officer Copilot",
    humanInChargeBanner: "You make the final call. The system analyzes, computes, and proposes — an authorized credit officer always decides.",
    noDisbursalNotice: "Safety Guarantee: System generates recommendations only. Automated fund disbursal is strictly impossible.",
  },

  navigation: {
    queue: "Case Queue",
    workflow: "Adaptive Workflow",
    trustGate: "Trust Gate Numbers",
    fraudGraph: "Entity & Fraud Graph",
    evidenceLadder: "Evidence Ladder",
    camProofPack: "Credit Memo & Proof Pack",
    decision: "Officer Decision",
    operations: "Operations & Policies",
    demoVideo: "Pitch & Demo Video",
    animatedFraudFlow: "Animated Fraud Flow",
    architecture: "Backend Architecture",
  },

  tooltips: {
    dscr: "Debt Service Coverage Ratio: how comfortably monthly cash covers the instalments. Minimum safety floor is 1.25x.",
    turnoverGap: "Difference between reported tax sales and confirmed bank inflows. Above 20% requires corroboration.",
    circularFlow: "A directed loop where money flows from one firm and returns back within days, artificially inflating volume.",
    gradeA: "Confirmed by a second, independent record (e.g., GST sales match bank credits).",
    gradeB: "Plausible but not confirmable from bank statements alone. Common for cash businesses; never labelled fraud.",
    gradeC: "Contradicted by another verifiable record (e.g., sales claim with no bank trace and circular loops).",
    evidenceLadder: "Ranked next steps the borrower can supply to verify unbanked sales and raise their loan amount.",
  },

  caseMoments: {
    opened: "Here is what I found. I have not made any decision, that is yours.",
    sharmaMismatch: "GST shows ₹4.0 Cr but the bank confirms ₹1.2 Cr. Let's see what explains the gap.",
    honestCashNotice: "We could not confirm all sales from the bank, but that is common for cash retail businesses. Here is how they can show the rest.",
    evidenceAdded: "Thanks. I only need to redo 3 of 9 steps. The rest stay as they were.",
    lowConfidence: "I am not sure about this page. Please take a quick look.",
    injectionDetected: "One document contained an instruction aimed at me. I ignored it and noted it for your records.",
    sharmaLoanResult: "Based on confirmed cash, a safe loan is about ₹45 lakh. With the electricity bills it could be ₹66 lakh.",
    cleanCaseResult: "All documents reconcile cleanly. The financials comfortably support standard sanction terms.",
  },

  screens: {
    queue: {
      title: "Active MSME Applications",
      subtitle: "Prioritized cases awaiting credit officer assessment.",
      searchPlaceholder: "Search by business name, ID, or proprietor...",
      statusChips: {
        ready: "Ready for you",
        needsEvidence: "Needs evidence",
        waitingApprover: "Waiting on approver",
        sanctioned: "Sanctioned",
      },
      timeSavedLabel: "Turnaround Saved",
      openAction: "Open Case",
      emptyState: "No cases match your filter criteria.",
    },

    workflow: {
      title: "Adaptive Parallel Agent Workflow",
      subtitle: "Dynamic dependency graph with input-hash caching and incremental re-planning.",
      legendParallel: "Parallel wave execution",
      legendReused: "Reused (Cached)",
      legendStale: "Stale (Rerunning)",
      timelineHeading: "Workflow Narration",
      replanButton: "Simulate New Evidence (Electricity Bills)",
      replanNotice: "Incremental re-plan active: 3 stages rerunning, 6 stages reused.",
    },

    trustGate: {
      title: "Numbers You Can Trust",
      subtitle: "Every extracted and calculated figure is evaluated through the Trust Gate before credit analysis.",
      tableHeaders: {
        metric: "Key Financial Metric",
        value: "Value",
        grade: "Trust Gate Grade",
        source: "Document Source & Traceability",
        reason: "Why this Grade was Assigned",
      },
      legendTitle: "Grading Criteria",
    },

    fraudGraph: {
      title: "Entity Relationships & Circular Flow Detection",
      subtitle: "Visual inspection of counterparty networks, shared identifiers, and circular trading cycles.",
      flagCount: (count: number) => `${count} anomaly patterns isolated with transaction-level proof`,
      cycleWarning: "Circular cycle detected: Sharma -> Verma -> Gupta -> Sharma",
      linkedEntityNotice: "Common physical premise and contact detected across counterparties.",
      outsideWorldWarning: "Failed Outside-World Test: 87.4% of turnover circulates strictly within this triangle.",
      clickPrompt: "Click any flagged node or transaction to inspect its underlying invoice and bank trace.",
    },

    evidenceLadder: {
      title: "What Would Raise This Loan?",
      subtitle: "Gaps become actionable next steps. Here is the ranked evidence the borrower can provide to unlock additional capital.",
      currentLoanLabel: "Current Safe Loan",
      potentialLoanLabel: "Potential Loan with Full Corroboration",
      rupeeUnlocked: (amountLakh: number) => `Unlocks +₹${amountLakh} Lakh`,
      costLabels: {
        CHEAP: "Low Cost / Quick",
        MEDIUM: "Moderate Effort",
        EXPENSIVE: "Audited / Third-Party",
        SITE_VISIT: "Field Site Verification",
      },
      statusLabels: {
        PENDING: "Requested from Borrower",
        PROVIDED: "Submitted, In Review",
        VERIFIED: "Corroborated & Approved",
      },
      uploadAction: "Submit Corroborating Document",
    },

    camProofPack: {
      title: "Credit Assessment Memo (CAM) & Proof Pack",
      subtitle: "One-page synthesized summary with strict citation validation back to transaction IDs.",
      proposalHeading: "Proposed Recommendation for Approver",
      threeNumbersHeading: "The 3 Numbers That Matter",
      camBodyHeading: "Credit Assessment Narrative",
      citationHelp: "Every sentence is backed by an evidence ID. Click any highlighted reference [E-...] to inspect proof.",
      citationValidatorBadge: "Citation Validator Passed: 100% of claims linked to source records",
      printAction: "Print / Export Proof Pack",
    },

    decision: {
      title: "Officer Final Decision",
      subtitle: "Credit officer final sign-off. The copilot provides structured findings; you hold final accountability.",
      humanInChargeTitle: "Credit Officer in Charge",
      humanInChargeText: "The system never issues automated rejections or automated fund disbursal. Please select the appropriate credit action below.",
      actions: {
        approve: "Approve Loan (Move to SANCTIONED)",
        sendBack: "Send Back for Evidence",
        escalate: "Escalate to Senior Committee",
      },
      notesLabel: "Officer Rationalization & Next Step Notes",
      notesPlaceholder: "Document the underwriting rationale, conditions precedent, or specific evidence requested from borrower...",
      confirmModalTitle: "Confirm Underwriting Action",
      authBadge: "Authenticated Officer: Priya Sharma (Employee ID #CR-88412)",
    },

    operations: {
      title: "System Operations & Policy Engine",
      subtitle: "Live system telemetry, token usage, re-plan performance, and one-click policy pack switcher.",
      activePolicyLabel: "Active Policy Pack",
      policyDescriptionA: "Bank A Policy: Moderate risk appetite. Minimum DSCR 1.25, max turnover gap 20%, maximum exposure ₹1.0 Cr.",
      policyDescriptionB: "Bank B Policy: Conservative risk appetite. Minimum DSCR 1.40, max turnover gap 10%, maximum exposure ₹50 Lakh.",
      switchAction: "Switch to Bank B Policy",
      switchActionBack: "Switch to Bank A Policy",
      switchSuccess: (pack: string) => `Switched to ${pack} policy pack without changing code. Sizing recomputed live.`,
      metrics: {
        avgLatency: "Workflow Run Time",
        tokenCost: "Total Token Consumption",
        replanRate: "Incremental Re-plan Efficiency",
        safeDisbursalCheck: "Zero Disbursal Route Check",
      },
    },
  },
} as const;
