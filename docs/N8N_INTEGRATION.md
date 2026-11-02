# n8n Edge Integration Guide: Verifin

This guide documents how **n8n** connects at the periphery of Verifin to automate intake file triggers, officer notifications, and approval wait steps without violating core system invariants.

---

## Strict Architectural Boundary

> **Non-Negotiable Constraint**: n8n operates strictly at the edges (file drop triggers, notifications, external webhooks). **n8n must never own or execute Trust Gate grading, loan sizing, policy limits, circular flow detection, or re-planning.** All credit intelligence is executed by deterministic Python and Verifin's dynamic orchestrator.

```
[Borrower File Drop / Email]
           |
           v
      [n8n Workflow]
           |  (HTTP POST /api/cases/{id}/evidence)
           v
  [Verifin FastAPI Gateway] <---> [NetworkX Orchestrator & Deterministic Core]
           |
           |  (SSE Stream / Webhook Event: CASE_DONE)
           v
      [n8n Wait Step]
           |  (Slack / Teams Alert: "Case Ready for Credit Officer Review")
           v
[Human Credit Officer Signs Off in Verifin Cockpit]
           |  (HTTP POST /api/cases/{id}/decision)
           v
[Ledger Updated: SANCTIONED (Zero Disbursal Route)]
```

---

## 1. Edge Workflow Triggers

### 1.1 Document Upload Trigger
- **Node**: `Webhook` or `Email Read / S3 Watcher`
- **Action**: Receives borrower bank statement, GST filing, or utility bill PDF.
- **Payload**:
  ```json
  {
    "case_id": "case_sharma_traders",
    "doc_id": "ev_bses_electricity_bills",
    "doc_type": "utility_bill",
    "raw_text": "Extracted text content..."
  }
  ```
- **Forwarding**: Calls Verifin endpoint:
  ```http
  POST http://localhost:8000/api/cases/{case_id}/evidence
  Content-Type: application/json
  ```

---

## 2. Real-Time Telemetry & SSE Streaming
- **Node**: `EventSource / SSE Trigger`
- **URL**: `http://localhost:8000/api/cases/{case_id}/events`
- **Handling**:
  - Listens for `stage_finished` and `replan` events.
  - When `replan` fires, logs the graph-derived redo count and compute saved percentage.

---

## 3. Human Approval Wait Step
- **Node**: `Wait Node (Webhook)` or `Slack Interactive Button`
- **Notification**:
  - Sends a direct alert to the credit officer with the one-page Proof Pack link:
    ```
    🚨 Loan Assessment Ready for Sign-off: Sharma Traders
    • Proposed Sizing: ₹66.5 Lakh (Adjusted after Utility Bills)
    • Trust Gate Grade: Grade C (70% GST Turnover Gap)
    • DSCR: 1.25x
    • Non-Negotiable Guarantee: Zero money will be disbursed.
    👉 Review & Sign: http://localhost:5173
    ```
- **Execution**: The credit officer reviews citations and submits sign-off through `POST /api/cases/{case_id}/decision`.
- **Ledger Security**: Entry moves to `SANCTIONED` in the audit ledger. Automated tests guarantee no funds disbursal route exists.
