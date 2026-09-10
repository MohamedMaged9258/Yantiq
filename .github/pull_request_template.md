## What this changes

<!-- One or two sentences. Link the work package (e.g. P02-04) or the issue. -->

## Progress tracking

- [ ] Implementation dashboard (`docs/implementation/README.md`) updated — current phase, active tasks, blockers, completion evidence
- [ ] Work-package status updated in the relevant `docs/implementation/phases/phase-NN-*.md`
- [ ] Any phase marked `Completed` has **every** exit-acceptance box in its own file ticked

Statuses are `Not started` → `In progress` → `Blocked` / `In review` → `Completed`. Nothing else.

## Definition of Done (baseline §20)

Tick what applies; strike out what does not.

- [ ] Acceptance behaviour is documented and the change is reviewed
- [ ] Types and API schemas updated; the generated OpenAPI still matches the approved contract
- [ ] Relevant unit / integration / end-to-end tests pass
- [ ] Arabic and English states verified, RTL and LTR
- [ ] Phone and tablet layouts checked
- [ ] Security, ownership and privacy effects tested — no cross-guardian access
- [ ] Database changes include a reversible migration
- [ ] Logs exclude child data and audio; no personal data crosses into `services/ai`
- [ ] Documentation and `.env.example` updated

## Checks that block merge

- [ ] No secrets, model weights, checkpoints, datasets, `node_modules` or build output staged
- [ ] `python contracts/tools/validate-contracts.py` passes, if contracts or fixtures changed
