# Adoption Readiness Remediation Plan for `@anvilkit/puck-studio`

This plan translates the review into an execution-ready sequence for pilot hardening and eventual stable production positioning.

---

## Phase 1: Before Next Release

> Goal: remove immediate trust and integration blockers so pilot adopters can safely evaluate without patching core behavior.

### 1) Align i18n Defaults Across API, Store, and Runtime
- **Priority:** High
- **Problem summary:** Localization defaults are inconsistent: locale defaults to `zh` while runtime `defaultMessages` resolve to English.
- **Why it matters:** Default behavior must be deterministic for semver trust; mismatch causes silent language drift, confusing host teams and producing test instability.
- **Specific repair goal:** Ensure a single source of truth for default locale + message resolution used by Studio props, i18n store initialization, runtime wiring, and documentation.
- **Concrete implementation steps:**
  1. Inventory all default-locale/message code paths (relevant Studio entry point, i18n defaults module, i18n store, runtime wiring layer, README/examples).
  2. Pick canonical default policy (either `zh` or `en`) and encode it in one exported constant consumed by all layers.
  3. Refactor store initialization and provider fallback logic to read only that canonical source.
  4. Update prop docs/examples so startup behavior matches runtime.
  5. Add explicit migration note in changelog if user-visible default changes.
- **Likely code areas/modules affected:** relevant Studio entry point; i18n defaults module; i18n store; runtime wiring layer; README/examples; changelog.
- **Required tests:**
  - Integration test: Studio boots with no locale props and resolves canonical locale + messages.
  - Integration test: explicit locale prop overrides defaults deterministically.
  - Regression test: fallback message lookup for missing keys remains stable.
- **Acceptance criteria:**
  - A single constant/config determines default locale + messages.
  - Tests prove default and override behavior.
  - Docs no longer contradict runtime behavior.
- **Risks / tradeoffs:** Changing canonical default may be a behavior change for current users; requires release note clarity.
- **Estimated complexity:** M

---

### 2) Resolve Dead Public Props (`headerSlot`, `drawerHeaderSlot`)
- **Priority:** High
- **Problem summary:** Props appear in `StudioProps` but are not wired into render paths.
- **Why it matters:** Declared-but-ignored props are a semver contract breach and create immediate integrator distrust.
- **Specific repair goal:** Either fully implement these props end-to-end or remove/deprecate them with explicit migration guidance.
- **Concrete implementation steps:**
  1. Decide product intent: retain slot customization or remove it from public API.
  2. If retaining: thread props through Studio shell layout to header and drawer header render points, including override interactions.
  3. If removing: delete from public types, docs, and examples; add deprecation notes if previously announced.
  4. Add API surface test coverage (type-level and runtime behavior test).
- **Likely code areas/modules affected:** public types module; Studio shell layout components; override composition layer; README/examples; typed API tests.
- **Required tests:**
  - Runtime test: supplied slot renders in the expected visual region.
  - Runtime test: absence of slot falls back to existing default UI.
  - Type test: `StudioProps` reflects final supported contract only.
- **Acceptance criteria:**
  - No public prop exists without runtime behavior.
  - API docs and type tests reflect implemented reality.
- **Risks / tradeoffs:** Removing props is breaking; implementing may increase layout complexity.
- **Estimated complexity:** M

---

### 3) Strengthen `onAction` Public Typing (Replace `unknown`)
- **Priority:** High
- **Problem summary:** `onAction` pass-through uses `unknown`, weakening host integration safety.
- **Why it matters:** Action callbacks are a core host integration boundary; weak typing increases runtime break risk and undermines TS contract value.
- **Specific repair goal:** Replace `unknown` payload typing with a discriminated action union (or equivalent concrete generic constrained type) aligned to actual emitted events.
- **Concrete implementation steps:**
  1. Enumerate all action/event types currently emitted by Studio and related hooks.
  2. Define canonical `StudioAction` payload map in public types module.
  3. Refactor callback signatures to use typed action object or keyed payload map.
  4. Propagate type changes through action creators and emitters.
  5. Update examples to show typed narrowing patterns for host applications.
- **Likely code areas/modules affected:** public types module; studio actions store/context; action emitters in editor integration hooks; README/examples; tsd tests.
- **Required tests:**
  - Type tests: invalid payload shapes fail compilation.
  - Runtime integration tests: emitted callback payload matches documented shape for publish/save/share/collaborator actions.
- **Acceptance criteria:**
  - No `unknown` in public action callback signature.
  - Types and runtime payloads are congruent and test-verified.
- **Risks / tradeoffs:** Tightening types can break loosely-typed downstream consumers; may require minor migration examples.
- **Estimated complexity:** M

---

### 4) Add Core Runtime Integration Test Suite (Critical Paths)
- **Priority:** High
- **Problem summary:** Current tests are utility/type-heavy with limited runtime integration coverage.
- **Why it matters:** This library is integration-heavy (iframe, drag bridge, stores, callbacks); without runtime tests regressions are likely between releases.
- **Specific repair goal:** Introduce integration tests for the highest-risk flows identified in review.
- **Concrete implementation steps:**
  1. Stand up/expand integration harness (React testing setup used by Studio composition tests).
  2. Implement test cases for:
     - action callback payload integrity,
     - iframe drag/drop replacement bridge behavior,
     - scoped persistence behavior for i18n keys (pre-work for Phase 2 namespacing),
     - keyboard insertion/focus flow for accessible editing.
  3. Add deterministic mocks for iframe messaging and drag events.
  4. Wire tests into CI required checks.
- **Likely code areas/modules affected:** test harness modules; Studio runtime wiring layer; drag bridge hooks; store persistence layer; CI configuration.
- **Required tests:**
  - End-to-end-like integration tests listed above.
  - CI smoke job to ensure tests run in clean environment.
- **Acceptance criteria:**
  - New integration suite runs in CI and fails on known regression seeds.
  - Coverage includes at least the four explicitly identified risk categories.
- **Risks / tradeoffs:** Test harness complexity and potential flakiness with iframe simulation; requires stable mocking strategy.
- **Estimated complexity:** L

---

## Phase 2: Before v1 Stable

> Goal: lock API boundaries and platform behavior so stability claims are credible.

### 5) Narrow Root Exports and Define API Stability Tiers
- **Priority:** Medium (v1-critical)
- **Problem summary:** Root exports overexpose internals and include deprecated singleton exports.
- **Why it matters:** Overexposure increases accidental coupling and makes breaking changes likely.
- **Specific repair goal:** Publish a clear stable API surface and relocate advanced/internal APIs to explicit secondary entry points.
- **Concrete implementation steps:**
  1. Audit all root exports and classify each as `stable`, `advanced`, or `internal`.
  2. Remove/internalize accidental exports from root entry; keep compatibility shims only if required.
  3. Introduce documented subpath exports for advanced use cases.
  4. Add API surface tests/validation to fail if internals leak through root exports.
  5. Document stability tiers and deprecation policy.
- **Likely code areas/modules affected:** root index exports; package exports map; deprecated legacy entry points; API docs.
- **Required tests:**
  - Export contract tests validating root vs subpath surfaces.
  - Type tests ensuring removed internals are not importable from root.
- **Acceptance criteria:**
  - Root export list aligns to explicitly documented stable API.
  - Stability tiers appear in docs and are enforced by tests.
- **Risks / tradeoffs:** Potential migration burden for users importing internals.
- **Estimated complexity:** M

---

### 6) Namespace i18n Persistence by `storeId` (or Equivalent Scope)
- **Priority:** Medium (v1-critical)
- **Problem summary:** i18n persistence key is global, causing cross-instance collisions.
- **Why it matters:** Multi-instance/multi-tenant editors can leak preferences across contexts.
- **Specific repair goal:** Scope persisted locale/messages preferences to `storeId` (or equivalent unique instance key) with safe migration behavior.
- **Concrete implementation steps:**
  1. Define key scheme: e.g., `puck-studio:i18n:<storeId>`.
  2. Implement read path supporting legacy global key fallback during migration window.
  3. Write scoped key on update; optionally clean up legacy key once migrated.
  4. Add configuration escape hatch only if needed (documented).
  5. Document behavior for host apps using multiple Studio instances.
- **Likely code areas/modules affected:** i18n store; persistence utilities; Studio init wiring; documentation/migration guide.
- **Required tests:**
  - Integration test: two distinct `storeId` instances do not share locale state.
  - Migration test: legacy key is read once and migrated to scoped key.
- **Acceptance criteria:**
  - No cross-instance locale bleed in tests.
  - Backward compatibility path is documented and covered.
- **Risks / tradeoffs:** Added migration logic complexity; slight storage key churn.
- **Estimated complexity:** M

---

### 7) Accessibility Pass for Drag/Drop Alternatives and Focus Management
- **Priority:** Medium (v1-critical)
- **Problem summary:** Accessibility gaps remain in drag interactions and keyboard/focus flows.
- **Why it matters:** Accessibility is required for broad enterprise adoption and stable product claims.
- **Specific repair goal:** Provide keyboard-accessible insertion and robust focus management equivalent to drag-first interactions.
- **Concrete implementation steps:**
  1. Map current interaction model and identify non-pointer gaps.
  2. Add keyboard insertion controls (library item focus, enter/space activation, destination targeting).
  3. Implement focus return/focus trap behavior in drawers/modals and post-insert transitions.
  4. Add visible focus indicators for insertion controls.
  5. Document keyboard interaction model in README/troubleshooting.
- **Likely code areas/modules affected:** side library UI components; drag/insert controllers; editor shell focus hooks; styling tokens; docs.
- **Required tests:**
  - Integration tests covering keyboard-only insertion flow.
  - Focus order/return tests for drawers and inserted blocks.
  - A11y lint/audit checks in CI (where available).
- **Acceptance criteria:**
  - Core editing tasks can be completed without pointer input.
  - Focus behavior is deterministic and test-covered.
- **Risks / tradeoffs:** Additional UI complexity; potential divergence between drag and keyboard code paths.
- **Estimated complexity:** L

---

## Phase 3: Nice-to-Have Hardening

> Goal: improve operability, debuggability, and edge-case UX after core risks are resolved.

### 8) Revisit OSS Build Output Obfuscation
- **Priority:** Low
- **Problem summary:** Obfuscation in distributed output reduces debugging clarity.
- **Why it matters:** OSS adopters need meaningful stack traces and inspectable bundles during integration.
- **Specific repair goal:** Remove obfuscation for OSS build, or document clear justification and opt-in strategy.
- **Concrete implementation steps:**
  1. Identify where obfuscation/minification settings are introduced.
  2. Compare DX impact with/without obfuscation in local debugging.
  3. Default to non-obfuscated production artifacts for OSS package unless policy requires otherwise.
  4. If retaining obfuscation, document rationale and provide debug artifact pathway.
- **Likely code areas/modules affected:** build configuration; package scripts; contributor docs.
- **Required tests:**
  - Build verification tests ensuring artifacts remain valid and sourcemaps usable.
- **Acceptance criteria:**
  - Stack traces and symbols are actionable in supported debug workflow.
- **Risks / tradeoffs:** Slightly larger artifacts if obfuscation removed.
- **Estimated complexity:** S

---

### 9) Add Unsupported-Viewport Fallback UI (Instead of Silent Hide)
- **Priority:** Low
- **Problem summary:** Mobile behavior is currently hard-hidden without explanatory fallback.
- **Why it matters:** Silent failure harms user trust and increases support burden.
- **Specific repair goal:** Render explicit unsupported-viewport message with actionable next steps.
- **Concrete implementation steps:**
  1. Add viewport detection boundary around hidden Studio layout.
  2. Render fallback panel with message, minimum supported viewport guidance, and optional host override slot.
  3. Ensure fallback is localizable through i18n pathway.
  4. Add docs note describing supported form factors.
- **Likely code areas/modules affected:** Studio layout boundary; responsive hooks; i18n messages; README.
- **Required tests:**
  - Runtime test: narrow viewport shows fallback UI.
  - Runtime test: supported viewport restores full Studio.
- **Acceptance criteria:**
  - No silent hide; unsupported state is explicit and localizable.
- **Risks / tradeoffs:** Additional UI path to maintain.
- **Estimated complexity:** S

---

### 10) Document Packaging and Runtime Troubleshooting Assumptions
- **Priority:** Low
- **Problem summary:** Fragile assumptions are under-documented (CSS auto-linking mutation, `test:types` build dependency, iframe/drag bridge edge cases).
- **Why it matters:** Hidden build/runtime coupling increases onboarding cost and CI confusion.
- **Specific repair goal:** Publish maintainers’ troubleshooting and build dependency guidance in docs.
- **Concrete implementation steps:**
  1. Add “Packaging Assumptions” section covering CSS auto-linking script fragility and expected output naming constraints.
  2. Document contributor workflow order: build artifacts required before `test:types`.
  3. Add iframe/drag bridge troubleshooting with known failure signatures and mitigation checks.
  4. Link these docs from README and contributor docs.
- **Likely code areas/modules affected:** README; contributor docs; architecture/troubleshooting docs.
- **Required tests:**
  - Documentation sanity check in CI (links/checker if available).
- **Acceptance criteria:**
  - Contributors can run build + type tests without hidden ordering failures.
  - Common iframe/drag issues have documented diagnosis steps.
- **Risks / tradeoffs:** Documentation maintenance overhead.
- **Estimated complexity:** S

---

## Sequencing and Dependencies

1. **Fix contract mismatches before broad test expansion.**
   - Complete Phase 1 items 1–3 first so tests encode the intended API/runtime behavior.
2. **Use integration tests as the release safety net.**
   - Phase 1 item 4 should land before release branch cut.
3. **Finalize API boundaries before any “stable” claim.**
   - Phase 2 item 5 is a prerequisite for v1 positioning.
4. **Scope persistence after i18n defaults are canonicalized.**
   - Phase 2 item 6 depends on Phase 1 item 1 decisions.
5. **Accessibility completion should validate against the new integration harness.**
   - Phase 2 item 7 depends on Phase 1 item 4 test infrastructure.

---

## Recommended Release Gate

### Minimum gate for **next release**
- i18n default mismatch fixed and documented.
- `headerSlot` / `drawerHeaderSlot` either implemented or removed.
- `onAction` typing no longer relies on `unknown` in public contract.
- Integration tests exist and pass for:
  - action payload wiring,
  - iframe drag/drop bridge,
  - scoped/isolated persistence behavior checks,
  - keyboard insertion/focus smoke path.
- CI includes these integration checks as required status.

### Minimum gate for **stable / v1 claim**
- Root export surface narrowed and stability tiers documented/enforced.
- i18n persistence keys namespaced by `storeId` (with migration path).
- Accessibility pass complete for keyboard alternatives and focus management.
- Deprecated/singleton export strategy finalized (removed or clearly sunset).
- Versioning and deprecation policy published in docs.

### Minimum gate for **broad production adoption recommendation**
- All next-release and v1 gates satisfied for at least one release cycle.
- No open high-severity integration regressions in callback/i18n/drag paths.
- Troubleshooting and packaging assumptions documentation published and validated by external adopter feedback.
- Pilot users can upgrade without patching library internals.

---

## Suggested Issue Breakdown

1. **Ticket:** Canonicalize i18n default resolution
   - **Objective:** Remove locale/message default drift.
   - **Deliverable:** Unified default constant + aligned runtime wiring + updated docs/tests.
   - **Dependency:** None.

2. **Ticket:** Implement or remove `headerSlot` and `drawerHeaderSlot`
   - **Objective:** Eliminate dead props from public API.
   - **Deliverable:** Finalized prop contract in types + render path + docs + tests.
   - **Dependency:** None.

3. **Ticket:** Type-safe `onAction` contract
   - **Objective:** Replace `unknown` with concrete action payload typing.
   - **Deliverable:** `StudioAction` public types + migrated emitters + tsd/runtime tests.
   - **Dependency:** None.

4. **Ticket:** Core Studio integration harness and regression suite
   - **Objective:** Add runtime confidence for critical interaction paths.
   - **Deliverable:** Integration tests for callbacks, iframe drag bridge, persistence scope behavior, keyboard/focus flow in CI.
   - **Dependency:** Prefer after tickets 1–3.

5. **Ticket:** Root export surface audit and stability tiers
   - **Objective:** Prevent accidental internal API coupling.
   - **Deliverable:** Reduced root exports + subpath strategy + contract tests + docs.
   - **Dependency:** Can begin in parallel; finalize before v1 tag.

6. **Ticket:** `storeId`-scoped i18n persistence migration
   - **Objective:** Prevent cross-instance state collisions.
   - **Deliverable:** Namespaced key strategy + backward migration logic + tests/docs.
   - **Dependency:** Ticket 1.

7. **Ticket:** Keyboard-accessible insertion and focus hardening
   - **Objective:** Close drag/drop accessibility gaps.
   - **Deliverable:** Keyboard insertion controls + deterministic focus behavior + a11y tests/docs.
   - **Dependency:** Ticket 4 test harness.

8. **Ticket:** OSS build debuggability policy (obfuscation)
   - **Objective:** Improve diagnosability of distributed artifacts.
   - **Deliverable:** Updated build config or documented rationale + debug workflow notes.
   - **Dependency:** None.

9. **Ticket:** Unsupported viewport fallback UI
   - **Objective:** Replace silent mobile hide behavior.
   - **Deliverable:** Localizable fallback component + responsive tests + docs.
   - **Dependency:** Optional dependency on ticket 1 for localization consistency.

10. **Ticket:** Packaging/troubleshooting documentation uplift
    - **Objective:** Make build/runtime assumptions explicit for contributors and adopters.
    - **Deliverable:** Docs for CSS auto-linking assumptions, `test:types` order, iframe/drag diagnostics.
    - **Dependency:** Best after tickets 4–6 to capture final behavior.
