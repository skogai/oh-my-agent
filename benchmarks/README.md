# AI Coding Harness Benchmark

Compares 5 Claude Code harnesses on the same prompt — building a children's
3D creative learning platform MVP (`benchmarks/prompt.md`).

| Harness | Mechanism | Activation evidence |
|---|---|---|
| `vanilla` | bare Claude Code, no plugin/skill | baseline |
| `oma` | `oh-my-agent` source-seeded into project (`.agents/` + `.claude/`) | design-rule-driven anti-pattern avoidance, deferred-stub markers |
| `omc` | `oh-my-claudecode` via `--plugin-dir` | self-reported "OMC loaded, 40+ skills" |
| `ecc` | `everything-claude-code` installed to user `~/.claude/` | session skill list expanded with ecc skills |
| `superpowers` | `superpowers` via `--plugin-dir` | first run hit `<HARD-GATE>` brainstorming skill (forced override prompt to proceed) |

Run conditions: `claude-opus-4-6`, effort `max`, `--max-budget-usd 20`,
`--no-session-persistence`, `--setting-sources project,local`, identical raw prompt.
ANTHROPIC_API_KEY not set — OAuth via the user's logged-in `claude` CLI.

---

## Final scoreboard (5-axis, 100pt total)

| Rank | Harness | **Total** | Func/35 | Spec/15 | Visual/20 | Eng/20 | Eff/10 |
|---|---|---|---|---|---|---|---|
| 🥇 1 | **oma** | **75.5** | 28.5 | 13 | 14 | 18 | 2 |
| 🥈 2 | superpowers | 74.0 | 30 | 8 | 14 | 14 | 8 |
| 🥉 3 | omc | 73.0 | 33.5 | 7 | 13 | 14.5 | 5 |
| 4 | vanilla | 69.0 | 28.5 | 12 | 10 | 12.5 | 6 |
| 5 | ecc | 68.5 | 28.5 | 8 | 13 | 15 | 4 |

### Run economics

| Harness | Turns | Duration | Cost | Files (src) | Cost / file |
|---|---|---|---|---|---|
| vanilla | 42 | 8m 56s | $2.37 | 16 | $0.15 |
| oma | 91 | 29m 21s | $8.19 | 25 | $0.33 |
| omc | 61 | 9m 02s | $1.92 | 14 | $0.14 |
| ecc | 79 | 10m 20s | $3.84 | 22 | $0.17 |
| superpowers | 39 | 8m 13s | $1.28 | 18 | $0.07 |

---

## Screenshot comparison

### Landing page

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla landing](screenshots/vanilla/01-landing.png) | ![oma landing](screenshots/oma/01-landing.png) | ![omc landing](screenshots/omc/01-landing.png) | ![ecc landing](screenshots/ecc/01-landing.png) | ![superpowers landing](screenshots/superpowers/01-landing.png) |

### World builder

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla builder](screenshots/vanilla/02-world-builder.png) | ![oma builder](screenshots/oma/02-builder.png) | ![omc builder](screenshots/omc/02-world-builder.png) | ![ecc builder](screenshots/ecc/02-world-builder.png) | ![superpowers builder](screenshots/superpowers/02-world-builder.png) |

### AI panel

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla ai](screenshots/vanilla/03-ai-panel.png) | ![oma ai](screenshots/oma/03-ai-panel.png) | ![omc ai](screenshots/omc/03-ai-panel.png) | ![ecc ai](screenshots/ecc/03-ai-panel.png) | ![superpowers ai](screenshots/superpowers/03-ai-panel.png) |

### Gallery

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla gallery](screenshots/vanilla/04-gallery.png) | _(missing)_ | ![omc gallery](screenshots/omc/04-gallery.png) | ![ecc gallery](screenshots/ecc/04-gallery.png) | ![superpowers gallery](screenshots/superpowers/04-gallery.png) |

### Object placed in scene

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla object](screenshots/vanilla/02-world-builder-with-object.png) | _(missing)_ | ![omc object](screenshots/omc/02b-object-placed.png) | ![ecc object](screenshots/ecc/02b-box-placed.png) | ![superpowers object](screenshots/superpowers/02-world-builder-with-object.png) |

### Environment / theme change

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla env](screenshots/vanilla/05-env-theme.png) | _(missing)_ | ![omc env](screenshots/omc/06-theme-change.png) | ![ecc env](screenshots/ecc/02c-env-theme.png) | ![superpowers env](screenshots/superpowers/02b-env-theme.png) |

### Save → reload (state persistence)

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla save](screenshots/vanilla/04-save-after-reload.png) | ![oma save](screenshots/oma/04-save-after-reload.png) | ![omc save](screenshots/omc/04-save-after-reload.png) | ![ecc save](screenshots/ecc/04-save-after-reload.png) | ![superpowers save](screenshots/superpowers/04-save-after-reload.png) |

> `journey-save` axis evidence: harnesses scoring 3/3 fully restore the saved
> world; harnesses scoring 1.5/3 persist the gallery card but the canvas
> doesn't rehydrate after reload.

---

## Per-harness narrative


### 🥇 oma (75.5)

- **Functional 28.5/35** — lint failed; save-reload only 1.5/3.
- **Spec 13/15** — passed: `product-concept,personas,journeys,feature-list,ia,ui-direction,tech-arch,db-schema,ai-prompts,safety,starter-code`. failed: `impl-plan,priority-screens`. real-api bonus 2/2.
- **Visual 14/20** — anti-patterns 4/5 (Floating gradient orbs/blobs on landing page (pink circle, blue circle, yellow and purple shapes); n…); accessibility 2/5.
- **Engineering 18/20** — breadth: routes=7 components=13. type: strict=true any_count=0. modularity: max_depth=9 max_file_lines=316. transparency markers: 3.0/4. env: env config present, no hardcoded keys.
- **Efficiency 2/10** — 91 turns / 29m 21s / $8.19 total ($0.63/file estimated).

### 🥈 superpowers (74.0)

- **Functional 30/35** — lint failed.
- **Spec 8/15** — passed: `feature-list,ia,db-schema,ai-prompts,safety,starter-code`. failed: `product-concept,personas,journeys,ui-direction,tech-arch,impl-plan,priority-screens`. real-api bonus 2/2.
- **Visual 14/20** — anti-patterns 4/5 (Soft pink-to-blue gradient background visible on landing and gallery pages counts as one anti-patter…); accessibility 3/5.
- **Engineering 14/20** — breadth: routes=4 components=9. type: strict=true any_count=0. modularity: max_depth=8 max_file_lines=258. transparency markers: 0.0/4. env: env config present, no hardcoded keys.
- **Efficiency 8/10** — 39 turns / 8m 13s / $1.28 total ($0.14/file estimated).

### 🥉 omc (73.0)

- **Functional 33.5/35** — save-reload only 1.5/3.
- **Spec 7/15** — passed: `product-concept,feature-list,ai-prompts,starter-code,priority-screens`. failed: `personas,journeys,ia,ui-direction,tech-arch,db-schema,safety,impl-plan`. real-api bonus 2/2.
- **Visual 13/20** — anti-patterns 3/5 (Two anti-patterns: some AI suggestion-chip and metadata text appears below 16px equivalent; builder …); accessibility 2/5.
- **Engineering 14.5/20** — breadth: routes=4 components=5. type: strict=true any_count=0. modularity: max_depth=8 max_file_lines=172. transparency markers: 0.0/4. env: env config present, no hardcoded keys.
- **Efficiency 5/10** — 61 turns / 9m 02s / $1.92 total ($0.38/file estimated).

### 4. vanilla (69.0)

- **Functional 28.5/35** — lint failed; save-reload only 1.5/3.
- **Spec 12/15** — passed: `product-concept,personas,journeys,feature-list,ia,ui-direction,tech-arch,db-schema,ai-prompts,safety,impl-plan,starter-code`. failed: `priority-screens`. real-api bonus 0/2.
- **Visual 10/20** — anti-patterns 1/5 (Purple-to-blue gradient hero on landing page; body/metadata text appears sub-16px in several places …); accessibility 2/5.
- **Engineering 12.5/20** — breadth: routes=5 components=6. type: strict=true any_count=0. modularity: max_depth=7 max_file_lines=473. transparency markers: 0.0/4. env: no hardcoded keys, no env refs either.
- **Efficiency 6/10** — 42 turns / 8m 56s / $2.37 total ($0.40/file estimated).

### 5. ecc (68.5)

- **Functional 28.5/35** — lint failed; save-reload only 1.5/3.
- **Spec 8/15** — passed: `feature-list,tech-arch,db-schema,ai-prompts,starter-code,priority-screens`. failed: `product-concept,personas,journeys,ia,ui-direction,safety,impl-plan`. real-api bonus 2/2.
- **Visual 13/20** — anti-patterns 3/5 (Gradient orbs/blobs floating on the landing page (yellow circle, pink square, purple circle, green s…); accessibility 2/5.
- **Engineering 15/20** — breadth: routes=4 components=13. type: strict=true any_count=0. modularity: max_depth=8 max_file_lines=167. transparency markers: 0.0/4. env: env config present, no hardcoded keys.
- **Efficiency 4/10** — 79 turns / 10m 20s / $3.84 total ($0.30/file estimated).

---

## How the score axes are computed

| Axis | Weight | Key signals | Tooling |
|---|---|---|---|
| **Functional** | 35 | build exit, dev-server boots (HTTP 200 ≤45s), 5 user-journey checks, lint, ts-clean | `pm install/build/lint`, curl, chrome-devtools MCP, `tsc --noEmit` |
| **Spec** | 15 | 13 explicit prompt deliverables (docs or final reply), real-API bonus | LLM judge with brace-balanced JSON extractor |
| **Visual** | 20 | anti-patterns (gradient bgs, sub-16px text, nesting), child-friendly UX, design-system consistency, accessibility | LLM judge over screenshots |
| **Engineering** | 20 | code breadth, TS strict, max file size + folder depth, deferred-stub markers, no hardcoded keys | static analysis (jq + grep + find) |
| **Efficiency** | 10 | turns to complete, wall-clock duration, cost-per-file | `claude -p` result JSON |

Implementation: `benchmarks/scoring/multiaxis/score.sh` → emits per-harness
`multiaxis-score.json` and `multiaxis-summary.json`. This README itself is
generated by `benchmarks/scoring/multiaxis/build-report.sh`.

---

## Honest caveats

1. **superpowers prompt override** — necessary for the harness to function in non-interactive mode. Result is "what superpowers can do once the brainstorming gate is bypassed", not pure apples-to-apples.
2. **oma scored after a keyword + skill fix** — initial run scored 88 because oma-frontend's keyword trigger ("react component", "next.js page") didn't match the prompt's "Frontend: Next.js + TypeScript" header phrasing, so the skill wasn't loaded and `lint-clean: 5/5` was given as an infrastructure exemption. The 75.5 reported here is the rerun where keyword routing was fixed and the skill correctly enforced Next 16+ — surfacing 2 real eslint errors (`@next/next/no-html-link-for-pages`, custom-font misuse) and a save-reload regression. omc is the only harness whose code passes real eslint without exemptions.
3. **Single LLM judge run** — spec/visual/journey judges ran once. Re-runs would shift scores by ±2-3 points per axis. The 1.5-point gap between oma (75.5) and superpowers (74) is within that noise band, so the top three (oma/sp/omc within 2.5 pts) should be read as a tie.
4. **Engineering transparency item** — only oma scored ≥1 (because its rules encourage deferred-stub markers). The metric measures a real signal but oma is structurally over-represented.
5. **Cost normalization** — efficiency uses cost-per-file. Absolute cost ($1.28–$8.19 across the 5) is not reflected in the axis score.
6. **Lint enforcement belongs in pre-commit / pre-push, not in the agent skill** — measuring "did the agent's code pass eslint" is a proxy for "is this push-ready". A more reliable architecture is husky + lint-staged (pre-commit) + lint/typecheck (pre-push) so the linter (eslint, Biome, oxlint, etc.) is the source of truth and the agent isn't memorising linter-specific rules.

---

## Reproduce

```bash
# 1. Run all 5 harnesses (sequential, ~45 min, ~$15-20 in API spend)
./benchmarks/run.sh

# 2. Multiaxis scoring per harness (5-axis, 100pt) — current canonical system
for h in vanilla oma omc ecc superpowers; do
  ./benchmarks/scoring/multiaxis/score.sh \
    /tmp/oma-benchmark-<timestamp>/projects/$h \
    $h \
    /tmp/oma-benchmark-<timestamp>/results/$h.json \
    /tmp/oma-benchmark-<timestamp>/multiaxis/$h
done

# 3. Generate this README from the multiaxis outputs
./benchmarks/scoring/multiaxis/build-report.sh \
  /tmp/oma-benchmark-<timestamp> \
  $(pwd)
```
