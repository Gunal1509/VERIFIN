import type { AgentTheatreStage } from '../types';

export const SHARMA_INITIAL_STAGES: AgentTheatreStage[] = [
  {
    id: 'intake',
    name: '1. Multi-Format Intake Agent',
    wave: 0,
    oneSentenceJob: 'Extracts structured tables from tax filings, bank e-statements, and loan applications with prompt injection filtering.',
    inputsRead: ['Sharma_GSTR3B_FY24.pdf', 'Sharma_SBI_Current_FY24.pdf', 'Loan_Application.json'],
    inputHash: 'e4a1..90b2',
    toolsCalled: [
      { name: 'scan_and_sanitize_document_text', type: 'code', description: 'Quarantines hidden prompts and prompt-injections' },
      { name: 'extract_financial_tables', type: 'code', description: 'Deterministic tabular extractor for GSTR-3B & Current Account' },
    ],
    outputSummary: 'Extracted ₹4.0 Cr declared GST turnover and ₹1.2 Cr bank inward credits. Personal data masked.',
    evidenceCitations: [
      { doc: 'Sharma_GSTR3B_FY24.pdf', page: 1, label: 'GSTR-3B Table 3.1' },
      { doc: 'Sharma_SBI_Current_FY24.pdf', page: 24, label: '12-Month Inward Statement' },
    ],
    executionTimeMs: 42,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
    a2aDialogue: {
      from: 'Intake Agent',
      to: 'Trust Gate Agent',
      message: 'Extracted GST turnover ₹4.0 Cr conflicts with bank credits ₹1.2 Cr. Handing off for triangulation.',
      type: 'handoff',
    },
  },
  {
    id: 'bureau_kyc',
    name: '2. Bureau & Identity Agent',
    wave: 0,
    oneSentenceJob: 'Verifies CIBIL commercial records, Udyam MSME certificate, and MCA director registries.',
    inputsRead: ['PAN: AAAPS1234K', 'CIBIL_Report_Ramesh_Sharma.pdf', 'Udyam_Registration.pdf'],
    inputHash: '7b3c..11f8',
    toolsCalled: [
      { name: 'mcp://connectors.verifin.local/bureau/get_cibil_commercial_score', type: 'code', description: 'Pulls commercial CIBIL score & 0 DPD history' },
      { name: 'mcp://connectors.verifin.local/kyc/lookup_mca_directors', type: 'code', description: 'Identifies common premise with Verma Enterprises' },
    ],
    outputSummary: 'Commercial bureau score is 710 with active ₹20,000/mo vehicle machinery EMI. Common address detected in Okhla.',
    evidenceCitations: [
      { doc: 'CIBIL_Report_Ramesh_Sharma.pdf', page: 1, label: 'CIBIL Commercial Tradeline' },
      { doc: 'MCA_Filing_SharmaTraders.pdf', page: 3, label: 'Registered Office Address' },
    ],
    executionTimeMs: 38,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
    a2aDialogue: {
      from: 'Bureau Agent',
      to: 'Fraud Detection Agent',
      message: 'Detected shared physical warehouse premise between Sharma Traders and Verma Enterprises.',
      type: 'handoff',
    },
  },
  {
    id: 'trust_gate',
    name: '3. Deterministic Trust Gate',
    wave: 1,
    oneSentenceJob: 'Triangulates claims across independent documents to assign Grade A, B, or C.',
    inputsRead: ['Reported Turnover: ₹4.0 Cr', 'Bank Inward Credits: ₹1.2 Cr'],
    inputHash: 'd2e9..44aa',
    toolsCalled: [
      { name: 'compute_turnover_gap', type: 'code', description: 'Deterministic turnover gap calculator (70.0% mismatch)' },
      { name: 'grade_numbers', type: 'code', description: 'Cross-document triangulation rule (Bank Credits: A, GST: C)' },
    ],
    outputSummary: 'Turnover gap is 70.0% (>20% threshold). GST turnover assigned Grade C; bank credits assigned Grade A.',
    evidenceCitations: [
      { doc: 'Sharma_GSTR3B_FY24.pdf', page: 1, label: 'Grade C: Declared Sales' },
      { doc: 'Sharma_SBI_Current_FY24.pdf', page: 24, label: 'Grade A: Verified Bank Credits' },
    ],
    executionTimeMs: 12,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
    a2aDialogue: {
      from: 'Trust Gate Agent',
      to: 'Cashflow Agent',
      message: 'Uncorroborated GST turnover downgraded to Grade C. Credit analysis must anchor on Grade A bank operating cash (₹1.5L/mo).',
      type: 'handoff',
    },
  },
  {
    id: 'cashflow',
    name: '4. Cashflow & Debt Capacity Agent',
    wave: 2,
    oneSentenceJob: 'Calculates verified net monthly operating cashflow and DSCR debt service coverage floor.',
    inputsRead: ['Bank operating inflows: ₹1,50,000/mo', 'Active EMI: ₹20,000/mo'],
    inputHash: '19fa..88dd',
    toolsCalled: [
      { name: 'compute_dscr', type: 'code', description: 'Deterministic DSCR arithmetic: 150,000 / (100,000 + 20,000) = 1.25x' },
    ],
    outputSummary: 'Verified operating cash is ₹1,50,000/mo. Available monthly debt servicing capacity is ₹1,00,000/mo at 1.25x DSCR.',
    evidenceCitations: [
      { doc: 'Sharma_SBI_Current_FY24.pdf', page: 24, label: 'Net Monthly Operating Inflow' },
      { doc: 'CIBIL_Report_Ramesh_Sharma.pdf', page: 2, label: 'Machinery Loan EMI' },
    ],
    executionTimeMs: 14,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
    a2aDialogue: {
      from: 'Cashflow Agent',
      to: 'Structuring Agent',
      message: 'Max supportable monthly EMI is ₹1,00,000/mo. Proposed ₹75L loan would breach DSCR capacity.',
      type: 'objection',
    },
  },
  {
    id: 'fraud',
    name: '5. Forensic Fraud Detection Agent',
    wave: 2,
    oneSentenceJob: 'Executes NetworkX directed cycle analysis and outside-world cash dissipation tests.',
    inputsRead: ['Bank Inward/Outward Ledger: 1,420 transactions'],
    inputHash: '6c11..55eb',
    toolsCalled: [
      { name: 'detect_circular_flows', type: 'code', description: 'NetworkX simple_cycles algorithm isolating closed directed loop' },
      { name: 'outside_world_test', type: 'code', description: 'Computes external party revenue dissipation ratio (87.4% circular)' },
    ],
    outputSummary: 'Circular trading loop isolated: Sharma → Verma → Gupta → Sharma within 6 days. 87.4% circular rotation.',
    evidenceCitations: [
      { doc: 'Sharma_SBI_Current_FY24.pdf', txnId: 'TXN-90214', label: 'Outward RTGS to Verma ₹18.5L' },
      { doc: 'Sharma_SBI_Current_FY24.pdf', txnId: 'TXN-90412', label: 'Inward RTGS from Gupta ₹18.2L' },
    ],
    executionTimeMs: 46,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
    a2aDialogue: {
      from: 'Fraud Agent',
      to: 'Policy Engine Agent',
      message: 'FLAGGED: Closed circular flow with Verma and Gupta. Turnover claims inflated via circular RTGS.',
      type: 'objection',
    },
  },
  {
    id: 'risk',
    name: '6. Risk Scoring Agent',
    wave: 3,
    oneSentenceJob: 'Synthesizes bureau, cashflow, and fraud findings into risk tier and behavioral profile.',
    inputsRead: ['Bureau: 710', 'Turnover Gap: 70%', 'Fraud Flags: Circular Loop'],
    inputHash: '34aa..99bc',
    toolsCalled: [
      { name: 'generate_risk_narrative', type: 'model', description: 'Model synthesizes risk narrative without doing arithmetic' },
    ],
    outputSummary: 'Assigned Risk Tier: HIGH_ATTENTION. Borrower business exists but revenue is artificially inflated.',
    evidenceCitations: [
      { doc: 'Sharma_GSTR3B_FY24.pdf', page: 1, label: 'Unverified Revenue Gap' },
      { doc: 'Sharma_SBI_Current_FY24.pdf', txnId: 'TXN-90214', label: 'Circular Counterparty Evidence' },
    ],
    executionTimeMs: 55,
    tokensUsed: 210,
    isReused: false,
    isStale: false,
  },
  {
    id: 'policy',
    name: '7. Policy Engine Agent',
    wave: 4,
    oneSentenceJob: 'Enforces bank credit policy YAML rules in deterministic code.',
    inputsRead: ['Active Policy: Bank A', 'DSCR: 1.25', 'Max Exposure: ₹1.0 Cr'],
    inputHash: 'aa77..32cc',
    toolsCalled: [
      { name: 'check_policy_limits', type: 'code', description: 'Evaluates DSCR >= 1.25 (Pass) and rejects uncorroborated loan limits' },
    ],
    outputSummary: 'Policy checks completed. Rejects requested ₹75L loan; caps maximum eligibility to ₹45L under DSCR limit.',
    evidenceCitations: [
      { doc: 'bank_a_policy.yaml', label: 'Section 4.2: Maximum Debt Capacity & Minimum 1.25x DSCR' },
    ],
    executionTimeMs: 16,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
    a2aDialogue: {
      from: 'Policy Engine',
      to: 'Structuring Agent',
      message: 'Requested ₹75L rejected. Term sheet must be sized down to ₹45L at 12.0% for 60 months.',
      type: 'resolution',
    },
  },
  {
    id: 'structuring',
    name: '8. Structuring & Sizing Agent',
    wave: 5,
    oneSentenceJob: 'Calculates maximum supportable loan amount via Present Value annuity formula.',
    inputsRead: ['Available Monthly EMI: ₹1,00,000', 'Interest Rate: 12.0%', 'Tenor: 60 Months'],
    inputHash: '88de..4411',
    toolsCalled: [
      { name: 'size_loan_from_cashflow', type: 'code', description: 'Pure PV annuity math: PV(12%/12, 60, -100,000) = ₹45,00,000' },
    ],
    outputSummary: 'Sized safe loan at ₹45,00,000 at 12.0% for 60 months. DSCR 1.25x maintained.',
    evidenceCitations: [
      { doc: 'Sharma_SBI_Current_FY24.pdf', page: 24, label: '₹1.50L Verified Operating Cash' },
    ],
    executionTimeMs: 18,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
  },
  {
    id: 'cam',
    name: '9. CAM & Citation Validator Agent',
    wave: 6,
    oneSentenceJob: 'Compiles synthesized Credit Assessment Memo with sentence-level evidence validation.',
    inputsRead: ['Loan Proposal: ₹45L', 'Findings: Circular Flow Flag', 'Facts: Grade A/C'],
    inputHash: '55fe..90aa',
    toolsCalled: [
      { name: 'draft_cam_memo', type: 'model', description: 'Synthesizes CAM sections with delimited structured references' },
      { name: 'validate_memo_citations', type: 'code', description: 'Deterministic citation validator: 100% claims linked to evidence IDs' },
    ],
    outputSummary: 'Generated CAM Memo. Citation validator PASSED: 12 of 12 claims backed by valid source document citations.',
    evidenceCitations: [
      { doc: 'CAM_Memo_SharmaTraders.pdf', label: 'Sentence Citation Table' },
    ],
    executionTimeMs: 64,
    tokensUsed: 380,
    isReused: false,
    isStale: false,
  },
  {
    id: 'ledger',
    name: '10. Ledger Gatekeeper Agent',
    wave: 7,
    oneSentenceJob: 'Records proposed term sheet into double-entry ledger strictly as PENDING_APPROVAL.',
    inputsRead: ['Approved Loan Amount: ₹45,00,000', 'State: Initial Assessment'],
    inputHash: '22ee..7701',
    toolsCalled: [
      { name: 'post_pending_ledger_entry', type: 'code', description: 'Writes immutable state PENDING_APPROVAL. Disbursal locked.' },
    ],
    outputSummary: 'Ledger entry posted: PENDING_APPROVAL. Zero money movement. Awaiting credit officer authenticated sign-off.',
    evidenceCitations: [
      { doc: 'Ledger_Journal_FY24.json', label: 'Entry #TXN-LGD-88412' },
    ],
    executionTimeMs: 22,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
    a2aDialogue: {
      from: 'Ledger Agent',
      to: 'Credit Officer Gate',
      message: 'Term sheet posted to ledger as PENDING_APPROVAL. Escalating to Credit Officer for final decision.',
      type: 'handoff',
    },
  },
  {
    id: 'human',
    name: '11. Credit Officer Decision Gate',
    wave: 8,
    oneSentenceJob: 'Provides interactive decision cockpit for credit officer sign-off.',
    inputsRead: ['CAM Memo', 'Proof Pack', 'Evidence Ladder'],
    inputHash: '00ff..1234',
    toolsCalled: [
      { name: 'render_officer_cockpit', type: 'code', description: 'Prepares sign-off interface with full evidence drawer' },
    ],
    outputSummary: 'Awaiting human sign-off: Approve (Sanction ₹45L), Send Back (Request Utility Bills), or Escalate.',
    evidenceCitations: [
      { doc: 'CAM_ProofPack_Full.pdf', label: 'Executive Memo & Proof Pack' },
    ],
    executionTimeMs: 8,
    tokensUsed: 0,
    isReused: false,
    isStale: false,
  },
];

export const SHARMA_REPLAN_STAGES: AgentTheatreStage[] = SHARMA_INITIAL_STAGES.map((stage) => {
  if (['intake', 'bureau_kyc', 'trust_gate', 'fraud'].includes(stage.id)) {
    return {
      ...stage,
      isReused: true,
      isStale: false,
      executionTimeMs: 0,
      tokensUsed: 0,
      outputSummary: `[REUSED FROM CACHE (0ms)] Input hash ${stage.inputHash} identical. Results preserved.`,
    };
  }

  if (stage.id === 'cashflow') {
    return {
      ...stage,
      isReused: false,
      isStale: true,
      inputHash: '99ca..01fa (MODIFIED)',
      inputsRead: ['Bank Inflows: ₹1,50,000/mo', 'Corroborating Electricity Bills: ₹72,000/mo (Unlocks +₹70,000 cash)'],
      outputSummary: 'Verified operating cashflow raised to ₹2,20,000/mo after corroborating commercial power usage.',
      executionTimeMs: 16,
      tokensUsed: 0,
    };
  }

  if (stage.id === 'structuring') {
    return {
      ...stage,
      isReused: false,
      isStale: true,
      inputHash: '44dd..88aa (MODIFIED)',
      outputSummary: 'Loan sizing recomputed: ₹66,50,000 at 12.0% for 60 months. Sizing expanded by +₹21.5 Lakh!',
      executionTimeMs: 19,
      tokensUsed: 0,
    };
  }

  return {
    ...stage,
    isReused: false,
    isStale: true,
    inputHash: `${stage.inputHash.slice(0, 4)}..replan`,
    executionTimeMs: Math.max(10, Math.floor(stage.executionTimeMs * 0.9)),
  };
});
