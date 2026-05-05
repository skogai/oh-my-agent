# AI 코딩 하네스 벤치마크

같은 prompt로 5개 Claude Code 하네스를 비교한 결과입니다. 과제는 어린이용
3D 창의 학습 플랫폼 MVP 만들기이며, 전체 prompt는 `benchmarks/prompt.md`에
있습니다.

| 하네스 | 동작 방식 | 활성화 증거 |
|---|---|---|
| `vanilla` | plugin·skill 없이 순정 Claude Code | 기준선 |
| `oma` | `oh-my-agent` 소스를 프로젝트에 심어둠 (`.agents/` + `.claude/`) | 디자인 룰 기반 anti-pattern 회피, deferred-stub 마커 사용 |
| `omc` | `--plugin-dir`로 `oh-my-claudecode`를 불러옴 | 세션 초기에 "OMC loaded, 40+ skills" 자체 출력 |
| `ecc` | `everything-claude-code`를 사용자 `~/.claude/`에 설치 | 세션 skill 목록에 ecc skill이 추가됨 |
| `superpowers` | `--plugin-dir`로 `superpowers`를 불러옴 | 첫 실행에서 brainstorming skill의 `<HARD-GATE>`가 걸려, 강제 우회 prompt를 끼워 실행 |

실행 조건은 `claude-opus-4-6` 모델, effort `max`, `--max-budget-usd 20`,
`--no-session-persistence`, `--setting-sources project,local`까지 모두
동일하게 통일했고, raw prompt도 같은 것을 줬습니다. `ANTHROPIC_API_KEY`는
설정하지 않았으며, 사용자가 로그인한 `claude` CLI의 OAuth로 인증했습니다.

---

## 최종 점수표 (5축 합산, 100점 만점)

| 순위 | 하네스 | **총점** | Func/35 | Spec/15 | Visual/20 | Eng/20 | Eff/10 |
|---|---|---|---|---|---|---|---|
| 🥇 1 | **oma** | **75.5** | 28.5 | 13 | 14 | 18 | 2 |
| 🥈 2 | superpowers | 74.0 | 30 | 8 | 14 | 14 | 8 |
| 🥉 3 | omc | 73.0 | 33.5 | 7 | 13 | 14.5 | 5 |
| 4 | vanilla | 69.0 | 28.5 | 12 | 10 | 12.5 | 6 |
| 5 | ecc | 68.5 | 28.5 | 8 | 13 | 15 | 4 |

### 실행 비용

| 하네스 | 턴 수 | 소요 시간 | 비용 | src 파일 수 | 파일당 비용 |
|---|---|---|---|---|---|
| vanilla | 42 | 8m 56s | $2.37 | 16 | $0.15 |
| oma | 91 | 29m 21s | $8.19 | 25 | $0.33 |
| omc | 61 | 9m 02s | $1.92 | 14 | $0.14 |
| ecc | 79 | 10m 20s | $3.84 | 22 | $0.17 |
| superpowers | 39 | 8m 13s | $1.28 | 18 | $0.07 |

---

## 스크린샷 비교

### 랜딩 페이지

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla landing](screenshots/vanilla/01-landing.png) | ![oma landing](screenshots/oma/01-landing.png) | ![omc landing](screenshots/omc/01-landing.png) | ![ecc landing](screenshots/ecc/01-landing.png) | ![superpowers landing](screenshots/superpowers/01-landing.png) |

### 월드 빌더

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla builder](screenshots/vanilla/02-world-builder.png) | ![oma builder](screenshots/oma/02-world-builder.png) | ![omc builder](screenshots/omc/02-world-builder.png) | ![ecc builder](screenshots/ecc/02-world-builder.png) | ![superpowers builder](screenshots/superpowers/02-world-builder.png) |

### AI 패널

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla ai](screenshots/vanilla/03-ai-panel.png) | ![oma ai](screenshots/oma/03-ai-panel.png) | ![omc ai](screenshots/omc/03-ai-panel.png) | ![ecc ai](screenshots/ecc/03-ai-panel.png) | ![superpowers ai](screenshots/superpowers/03-ai-panel.png) |

### 갤러리

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla gallery](screenshots/vanilla/04-gallery.png) | ![oma gallery](screenshots/oma/04-gallery.png) | ![omc gallery](screenshots/omc/04-gallery.png) | ![ecc gallery](screenshots/ecc/04-gallery.png) | ![superpowers gallery](screenshots/superpowers/04-gallery.png) |

### 객체 배치

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla object](screenshots/vanilla/02-world-builder-with-object.png) | ![oma object](screenshots/oma/05-objects-added.png) | ![omc object](screenshots/omc/02b-object-placed.png) | ![ecc object](screenshots/ecc/02b-box-placed.png) | ![superpowers object](screenshots/superpowers/02-world-builder-with-object.png) |

### 환경·테마 변경

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla env](screenshots/vanilla/05-env-theme.png) | ![oma env](screenshots/oma/06-theme-change.png) | ![omc env](screenshots/omc/06-theme-change.png) | ![ecc env](screenshots/ecc/02c-env-theme.png) | ![superpowers env](screenshots/superpowers/02b-env-theme.png) |

### 저장 후 새로고침 (상태 유지)

| vanilla | oma | omc | ecc | superpowers |
|---|---|---|---|---|
| ![vanilla save](screenshots/vanilla/04-save-after-reload.png) | ![oma save](screenshots/oma/04-save-after-reload.png) | ![omc save](screenshots/omc/04-save-after-reload.png) | ![ecc save](screenshots/ecc/04-save-after-reload.png) | ![superpowers save](screenshots/superpowers/04-save-after-reload.png) |

> `journey-save` 축의 근거입니다. 3/3을 받은 하네스는 저장한 월드를 새로고침
> 이후에도 완전히 복원합니다. 1.5/3을 받은 하네스는 갤러리 카드까지만 살아남고,
> 캔버스는 새로고침 이후 다시 그려지지 않습니다.

---

## 하네스별 분석


### 🥇 oma (75.5)

- **Functional 28.5/35**: 5개 user journey 통과 + build/boot/ts 통과. lint 0/5 은 의도된 trade-off (oma 는 lint 강제를 agent skill 이 아닌 pre-commit/pre-push 단에 두는 설계, caveat #6 참고). save-reload 1.5/3: 저장 버튼은 있지만 localStorage 코드 미작성으로 reload 후 상태 복원 안 됨.
- **Spec 13/15**: 13개 prompt 산출물 모두 PRODUCT.md 에 존재. real-api 보너스 0/2 (deferred stub 으로 처리).
- **Visual 14/20**: anti-pattern 4/5, child-friendly 4/5, consistency 3/5, accessibility 3/5.
- **Engineering 18/20** (전 harness 중 최고): routes=7, components=13, strict TS + any 0개, modularity max 316 lines, transparency 마커 2개, env 안전.
- **Efficiency 2/10**: 91턴, 29m 21s, 총 $8.19. skill 컨텍스트가 깊은 작업을 유도해서 가장 비싸고 가장 길었음.

### 🥈 superpowers (74.0)

- **Functional 30/35**: lint가 실패했습니다.
- **Spec 8/15**: 통과한 항목은 `feature-list,ia,db-schema,ai-prompts,safety,starter-code`이고, 실패한 항목은 `product-concept,personas,journeys,ui-direction,tech-arch,impl-plan,priority-screens`입니다. real-api 보너스는 2/2를 모두 받았습니다.
- **Visual 14/20**: anti-pattern 4/5으로, 랜딩과 갤러리에 핑크에서 블루로 가는 부드러운 그라디언트 배경이 보이는 점이 anti-pattern 한 건으로 잡혔습니다... 접근성은 3/5입니다.
- **Engineering 14/20**: routes=4, components=9이고, strict=true에 any_count=0입니다. max_depth=8, max_file_lines=258이며 transparency 마커 점수는 0.0/4입니다. env 설정은 있고 하드코딩된 키는 없습니다.
- **Efficiency 8/10**: 39턴, 8m 13s, 총 $1.28을 썼습니다(파일당 약 $0.14).

### 🥉 omc (73.0)

- **Functional 33.5/35**: save-reload 항목만 1.5/3을 받았습니다.
- **Spec 7/15**: 통과한 항목은 `product-concept,feature-list,ai-prompts,starter-code,priority-screens`이고, 실패한 항목은 `personas,journeys,ia,ui-direction,tech-arch,db-schema,safety,impl-plan`입니다. real-api 보너스는 2/2를 모두 받았습니다.
- **Visual 13/20**: anti-pattern 3/5으로, 일부 AI suggestion-chip과 metadata 텍스트가 16px 환산 미만으로 표시되고 builder에도 추가 이슈가 있어 총 두 건이 잡혔습니다... 접근성은 2/5입니다.
- **Engineering 14.5/20**: routes=4, components=5이고 strict=true에 any_count=0입니다. max_depth=8, max_file_lines=172이며 transparency 마커 점수는 0.0/4입니다. env 설정은 있고 하드코딩된 키는 없습니다.
- **Efficiency 5/10**: 61턴, 9m 02s, 총 $1.92를 썼습니다(파일당 약 $0.38).

### 4. vanilla (69.0)

- **Functional 28.5/35**: lint가 실패했고, save-reload는 1.5/3에 그쳤습니다.
- **Spec 12/15**: 통과한 항목은 `product-concept,personas,journeys,feature-list,ia,ui-direction,tech-arch,db-schema,ai-prompts,safety,impl-plan,starter-code`이고, 실패한 항목은 `priority-screens`입니다. real-api 보너스는 0/2를 받았습니다.
- **Visual 10/20**: anti-pattern 1/5으로, 랜딩 페이지 hero에 보라에서 블루로 가는 그라디언트가 깔리고 본문·메타데이터 텍스트도 여러 곳에서 16px 환산 미만으로 보입니다... 접근성은 2/5입니다.
- **Engineering 12.5/20**: routes=5, components=6이고 strict=true에 any_count=0입니다. max_depth=7, max_file_lines=473이며 transparency 마커 점수는 0.0/4입니다. 하드코딩된 키도, env 참조도 없습니다.
- **Efficiency 6/10**: 42턴, 8m 56s, 총 $2.37을 썼습니다(파일당 약 $0.40).

### 5. ecc (68.5)

- **Functional 28.5/35**: lint가 실패했고, save-reload는 1.5/3에 그쳤습니다.
- **Spec 8/15**: 통과한 항목은 `feature-list,tech-arch,db-schema,ai-prompts,starter-code,priority-screens`이고, 실패한 항목은 `product-concept,personas,journeys,ia,ui-direction,safety,impl-plan`입니다. real-api 보너스는 2/2를 모두 받았습니다.
- **Visual 13/20**: anti-pattern 3/5으로, 랜딩 페이지에 그라디언트 orb·blob가 떠다닙니다(노란 원, 핑크 사각형, 보라 원, 초록...). 접근성은 2/5입니다.
- **Engineering 15/20**: routes=4, components=13이고 strict=true에 any_count=0입니다. max_depth=8, max_file_lines=167이며 transparency 마커 점수는 0.0/4입니다. env 설정은 있고 하드코딩된 키는 없습니다.
- **Efficiency 4/10**: 79턴, 10m 20s, 총 $3.84를 썼습니다(파일당 약 $0.30).

---

## 점수 산출 방식

| 축 | 가중치 | 핵심 신호 | 도구 |
|---|---|---|---|
| **Functional** | 35 | build exit 코드, dev-server 부팅(45초 안에 HTTP 200), user-journey 5종 점검, lint, ts-clean | `pm install/build/lint`, curl, chrome-devtools MCP, `tsc --noEmit` |
| **Spec** | 15 | prompt가 명시한 13개 산출물(문서 또는 최종 답변), real-API 보너스 | brace-balanced JSON 추출기를 갖춘 LLM judge |
| **Visual** | 20 | anti-pattern(그라디언트 배경, 16px 미만 텍스트, 카드 중첩 등), 아동 친화 UX, 디자인 시스템 일관성, 접근성 | 스크린샷 기반 LLM judge |
| **Engineering** | 20 | 코드 폭, TS strict 여부, 최대 파일 크기와 폴더 깊이, deferred-stub 마커, 하드코딩 키 부재 | 정적 분석 (jq + grep + find) |
| **Efficiency** | 10 | 완료까지의 턴 수, wall-clock 시간, 파일당 비용 | `claude -p` 결과 JSON |

구현은 `benchmarks/scoring/multiaxis/score.sh`가 담당하며, 하네스별로
`multiaxis-score.json`과 `multiaxis-summary.json`을 출력합니다. 이 README
자체도 `benchmarks/scoring/multiaxis/build-report.sh`가 자동으로 생성합니다.

---

## 솔직한 한계

1. **superpowers에 prompt 우회를 끼워 넣었습니다.** superpowers는 비대화형 모드에서 시작 자체가 막혀, 강제 우회 prompt 없이는 실행할 수 없었습니다. 이 점수는 "brainstorming gate를 풀고 난 superpowers가 어디까지 가는가"를 보여주는 수치이며, 동일 조건의 일대일 비교라고 보기는 어렵습니다.
2. **oma는 keyword + skill 수정 후 측정한 점수입니다.** 첫 실행에서는 88점이 나왔는데, oma-frontend의 keyword trigger ("react component", "next.js page") 가 prompt 의 "Frontend: Next.js + TypeScript" 같은 헤더 표기와 매칭되지 않아 skill 자체가 로드되지 않았기 때문입니다. 그 결과 `next lint` 가 막혀 `lint-clean: 5/5` 인프라 면제를 받았습니다. 여기 적은 75.5는 keyword 라우팅을 고치고 skill 이 실제로 Next 16+ 룰을 적용한 재실행 점수이며, 진짜 eslint 에러 2건 (`@next/next/no-html-link-for-pages`, custom font 위반) 과 save-reload 회귀가 그대로 점수에 반영됐습니다. 5개 중 코드 자체로 eslint 통과한 하네스는 omc 하나뿐입니다.
3. **LLM judge는 한 번씩만 돌렸습니다.** spec, visual, journey 판정이 모두 1회 측정이므로, 다시 돌리면 축당 ±2~3점 정도는 흔들립니다. oma (75.5) 와 superpowers (74) 의 1.5점 차이는 이 노이즈 안이라, 상위 3개 (oma/sp/omc 2.5점 이내) 는 사실상 동률로 읽어야 합니다.
4. **Engineering의 transparency 항목은 oma에게 구조적으로 유리합니다.** deferred-stub 마커 사용을 권장하는 oma 룰 덕분에 이 항목에서 1점 이상을 받은 하네스는 oma뿐입니다. 측정 자체는 의미 있는 신호지만, 항목 구성상 oma 쪽으로 점수가 몰립니다.
5. **비용은 파일당 비용만 봤습니다.** efficiency 축은 파일당 비용을 기준으로 계산합니다. 하네스 사이의 절대 비용 차이 ($1.28 ~ $8.19) 는 축 점수에 반영되지 않습니다.
6. **oma 설계 원칙: lint 와 typecheck 는 agent skill 이 아니라 pre-commit / pre-push 단에서 잡습니다.** oma 는 의도적으로 agent 가 생성 도중 linter 룰을 self-police 하지 않게 두었습니다. 이유는 (a) ESLint 특정 룰을 skill 에 박아넣으면 brittle (Biome, oxlint, 향후 linter 등 룰이 다름), (b) "push 가능한 상태인가" 의 canonical layer 는 git hook (pre-commit 의 husky + lint-staged, pre-push 의 lint/typecheck/build) 과 CI 입니다. 실제 워크플로우에서는 이번 run 이 만든 잘못된 `<a href>` 와 미사용 import 도 pre-push hook 에서 막혀 remote 까지 못 갑니다. 개발자 (또는 retry 하는 agent) 가 고쳐서 다시 push 하게 됩니다. 단일 측정에서는 이게 `lint-clean` 5점 손실로 잡히지만, 아키텍처 선택은 의도적입니다. agent skill 은 framework canonical 패턴에 집중하게 두고, mechanical 강제는 hook/CI layer 에 위임하는 게 oma 의 입장입니다.

---

## 재현 방법

```bash
# 1. 5개 하네스를 순차 실행합니다 (~45분, API 비용 약 $15-20)
./benchmarks/run.sh

# 2. 하네스별 multiaxis 채점을 돌립니다 (5축, 100점 만점, 현재 표준 채점 시스템)
for h in vanilla oma omc ecc superpowers; do
  ./benchmarks/scoring/multiaxis/score.sh \
    /tmp/oma-benchmark-<timestamp>/projects/$h \
    $h \
    /tmp/oma-benchmark-<timestamp>/results/$h.json \
    /tmp/oma-benchmark-<timestamp>/multiaxis/$h
done

# 3. multiaxis 결과로부터 이 README를 생성합니다
./benchmarks/scoring/multiaxis/build-report.sh \
  /tmp/oma-benchmark-<timestamp> \
  $(pwd)
```
