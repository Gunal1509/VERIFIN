export type FactGrade = 'A' | 'B' | 'C';
export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
export type EvidenceCostLevel = 'CHEAP' | 'MEDIUM' | 'EXPENSIVE' | 'SITE_VISIT';
export type EvidenceStatus = 'PENDING' | 'PROVIDED' | 'VERIFIED';
export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'STALE' | 'SKIPPED' | 'REUSED';
export type CaseStatus = 'ready' | 'needsEvidence' | 'waitingApprover' | 'sanctioned';

export interface Fact {
  id: string;
  name: string;
  value: string | number;
  sourceDoc: string;
  page: number;
  grade: FactGrade;
  gradeReason: string;
  txnId?: string;
}

export interface Finding {
  id: string;
  stage: string;
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  evidenceRefs: string[];
  ruleFired?: string;
  transactionIds?: string[];
}

export interface EvidenceLadderItem {
  id: string;
  rank: number;
  costLevel: EvidenceCostLevel;
  description: string;
  requiredDoc: string;
  potentialUnlockedLoanInr: number;
  status: EvidenceStatus;
}

export interface DecisionProposal {
  status: 'RECOMMEND_APPROVE' | 'RECOMMEND_FURTHER_REVIEW' | 'RECOMMEND_CONDITIONAL';
  loanAmountInr: number;
  interestRatePct: number;
  tenorMonths: number;
  dscr: number;
  hardLimitsPassed: boolean;
  policyViolations: string[];
  threeNumbers: {
    verifiedMonthlyCashInr: number;
    turnoverGapPct: number;
    dscr: number;
  };
}

export interface WorkflowStageNode {
  id: string;
  name: string;
  wave: number;
  status: StageStatus;
  executionTimeMs: number;
  inputs: string[];
  summary: string;
  parallelWith?: string[];
}

export interface EntityGraphNode {
  id: string;
  label: string;
  type: 'borrower' | 'counterparty' | 'director' | 'address';
  isFlagged?: boolean;
}

export interface EntityGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  amountInr?: number;
  isCycle?: boolean;
  txnId?: string;
}

export interface CaseData {
  id: string;
  name: string;
  entityType: string;
  sector: string;
  requestedAmountInr: number;
  status: CaseStatus;
  timeSavedMinutes: number;
  summaryMessage: string;
  hasAdversarialInjection?: boolean;
  injectionDetails?: string;
  facts: Fact[];
  findings: Finding[];
  evidenceLadder: EvidenceLadderItem[];
  decision: DecisionProposal;
  workflowStages: WorkflowStageNode[];
  entityGraph: {
    nodes: EntityGraphNode[];
    edges: EntityGraphEdge[];
  };
  camSentences: Array<{
    id: string;
    text: string;
    citations: string[];
  }>;
}

export interface ConnectorRegistryItem {
  name: string;
  endpoint: string;
  transport: string;
  status: 'live' | 'mock';
  tools: string[];
  resources: string[];
  securityScope: string;
  description: string;
}

export interface AgentTheatreStage {
  id: string;
  name: string;
  wave: number;
  oneSentenceJob: string;
  inputsRead: string[];
  inputHash: string;
  toolsCalled: Array<{
    name: string;
    type: 'code' | 'model';
    description: string;
  }>;
  outputSummary: string;
  evidenceCitations: Array<{
    doc: string;
    page?: number;
    txnId?: string;
    label: string;
  }>;
  executionTimeMs: number;
  tokensUsed: number;
  isReused: boolean;
  isStale: boolean;
  a2aDialogue?: {
    from: string;
    to: string;
    message: string;
    type: 'handoff' | 'objection' | 'resolution';
  };
}
