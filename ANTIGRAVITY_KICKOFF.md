# Antigravity Kickoff: MSME Underwriting Copilot

How to build the prototype in Google Antigravity using the files I gave you.

## 1. One-time setup (5 minutes)

1. Create an empty folder, for example `msme-copilot`, and open it in Antigravity.
2. Copy these into the project:
   - `AGENTS.md` into the **project root**. Antigravity agents read it before every task. It is also read by Cursor, Claude Code and Codex, so it is portable.
   - `MSME_Underwriting_Copilot_Prototype_Prompt.md` into `docs/SPEC.md`.
3. When Antigravity asks about agent autonomy, choose **Request Review** for terminal commands and **Agent Decides** for review policy while you learn how it plans. You can loosen it later.
4. Use **Planning mode** (not Fast) for every phase below. It shows an implementation plan you can approve first.
5. Make sure `git` is initialised so you can undo any phase.

Settings names and menus change between Antigravity versions. If something differs on your screen, check the in-app settings and tell the agent what you see.

## 2. Phase prompts (paste one at a time)

Stop after each phase, review the plan and the result, then paste the next one.

### Phase 0: Scaffold

```
Read AGENTS.md and docs/SPEC.md fully. Do not write code yet.
Produce an implementation plan for Phase 1 (Foundation) and a repo
structure matching section 10 of the spec. List assumptions and any
questions you have. Wait for my approval.
```

### Phase 1: Foundation

```
Implement Phase 1 from docs/SPEC.md: Pydantic schemas, the versioned
case file, the append-only audit log, and the seeded synthetic data
generator with all five scenarios (clean, Sharma inflated sales,
linked-firm ring, honest cash-heavy shop, hidden-prompt PDF text).
Include pytest tests. Run the tests and show me the results.
```

### Phase 2: Calculators and policy engine

```
Implement Phase 2: Trust Gate grading (A/B/C), loan sizing, and the
policy engine loading YAML policy packs (bank_a.yaml and bank_b.yaml).
The Sharma case must give DSCR about 0.9 and a loan of about 45 lakh,
and about 66 lakh with extra verified cash. Hard limits must be
enforced in code. Add tests, including one where a term sheet that
breaks a limit is rejected.
```

### Phase 3: Fraud detection

```
Implement Phase 3: turnover-gap rule, circular-flow detection with
NetworkX, linked-firm detection using hashed identifiers, and the
outside-world test. Every flag must store transaction IDs and the rule
that fired. Add tests proving the honest cash-heavy case is never
labelled fraud and the Sharma-Verma-Gupta loop is found.
```

### Phase 4: Adaptive orchestrator (most important, review carefully)

```
Implement Phase 4, the adaptive parallel workflow with incremental
re-planning, per section 2 of docs/SPEC.md. Build the stage interface,
dependency graph planner, parallel waves with asyncio, input-hash
caching, STALE marking of downstream stages, deterministic merge order,
budgets, and early exit. Add tests proving: (1) parallel waves finish
faster than sequential, (2) new evidence reruns only stale stages,
(3) unchanged stages keep identical output hashes, (4) replay matches.
Give me a plan artifact first and wait for approval.
```

### Phase 5: Agents and LLM layer

```
Implement Phase 5: provider-agnostic LLM interface with an offline mock
provider, structured document extraction, CAM drafting from structured
findings only, the citation validator, prompt-injection defence with
logging, PII masking, and token budgets with model routing. The whole
demo must run with the mock provider and no API key.
```

### Phase 6: Ledger and API

```
Implement Phase 6: the mock ledger with PENDING_APPROVAL, SANCTIONED,
SENT_BACK and ESCALATED states, approver authentication, and all API
routes in section 7. Add a test that scans every route and fails if any
route could disburse funds.
```

### Phase 7: Dashboard

```
Implement Phase 7: the eight screens in section 8 of docs/SPEC.md,
using the humanized copy rules in AGENTS.md. Put all text in
frontend/src/copy/microcopy.ts. Show the live workflow graph with
parallel stages side by side and the re-plan pulse. Then open the app in
the browser, walk through the Sharma case, and give me screenshots.
```

### Phase 8: Demo polish

```
Implement Phase 8: policy pack switch demo, replay check, operations
page, README with setup in under 3 minutes, .env.example, and the
3-minute demo script from section 14. Run the full acceptance test list
from section 12 and report each item as pass or fail.
```

## 3. Using the Manager view for parallel work (optional, after Phase 2)

Antigravity's Manager view can run several agents at once. Only parallelise work that does not touch the same files. A safe split after Phase 2:

| Agent | Task | Folder it owns |
|---|---|---|
| Agent A | Phase 3: fraud detection | `backend/app/stages/fraud.py`, `tests/fraud/` |
| Agent B | Phase 5: LLM layer and injection defence | `backend/app/core/llm/` |
| Agent C | Phase 7: static dashboard screens using mock data | `frontend/` |

Do **not** parallelise Phase 4 (orchestrator) or Phase 6 (ledger). They are the safety-critical core, so one agent should do them with you reviewing the plan.

Tell each parallel agent: "Only edit files in your folder. If you need a change elsewhere, stop and tell me."

## 4. Review checklist after every phase

- Did the agent stay inside the spec? (ask it to list any deviations)
- Do tests pass? Run `pytest` yourself.
- Any new dependency or any hard-coded key?
- Any route, function or text that could disburse money or auto-reject?
- Did it invent any numbers? Results must come from tests and runs.

## 5. If the agent drifts

Paste this:

```
Stop. Re-read AGENTS.md and docs/SPEC.md. List what you did that
differs from them, then fix only those differences.
```

## 6. Using Gemini inside the product

Antigravity builds the project with its own models. Your product's own LLM layer is separate. Keep it behind the provider interface, default to the offline mock provider, and add a Gemini provider (API key in an environment variable) later if you want live model calls in the demo. Never commit the key.
