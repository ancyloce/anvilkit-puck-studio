# anvilkit-studio Adoption Readiness Review

## 1. Executive Summary

- **Overall judgment: _Promising but risky_.**
- The repository shows clear productization intent (exports map, semantic-release, typed API tests, virtualization in side panels).
- The largest blocker is **API/runtime coherence drift** around i18n defaults: `locale` defaults to `zh` while `defaultMessages` resolves to English in runtime wiring.
- Public API contains declared-but-unused props (`headerSlot`, `drawerHeaderSlot`), creating semver and trust risk.
- Architecture direction is solid (Studio shell + overrides + stores + feature hooks), but root exports currently overexpose internals.
- Testing is too narrow for an integration-heavy editor library: utility and type tests exist, but most runtime behavior is untested.

## 2. What the Project Is

`@anvilkit/puck-studio` is a publishable React library that packages:
- a high-level `Studio` shell wrapping Puck,
- a lower-level `puckOverrides` pack,
- editor UI/i18n stores,
- image/copy libraries with virtualized rendering and drag-to-canvas insertion.

The target user is a team already on Puck that wants an opinionated editor chrome without building everything from scratch.

## 3. Strengths (ranked)

1. **Packaging and release discipline**: clean exports, dual module formats, release automation, export validation.
2. **Clear adoption path split**: `Studio` for fast integration, `puckOverrides` for custom shells.
3. **Performance intent**: virtualized side libraries and paged loading contracts.
4. **Useful product-level callbacks**: publish/save/share/collaborator actions mapped into host hooks.
5. **Type-level API guardrails**: `tsd` tests lock public type contracts.

## 4. Key Weaknesses and Risks

### High — i18n defaults are inconsistent across docs and runtime
- `Studio` defaults locale to `zh`, but runtime default messages come from English catalog.
- README states defaults are Chinese.
- **Fix**: unify locale+messages default source and add regression tests.

### High — API has declared-but-unused extension props
- `headerSlot` and `drawerHeaderSlot` appear in `StudioProps` but are not wired.
- **Fix**: implement now or remove before broader adoption.

### High — Insufficient runtime integration testing
- Current tests focus on replacement utilities + type contracts.
- Missing tests for Studio action flow, iframe drag/drop bridge, persistence isolation.
- **Fix**: add integration tests around core editor behaviors.

### Medium — Internal API overexposure through root exports
- Many store hooks and deprecated singleton leak into root API surface.
- **Fix**: define stable vs advanced/internal API tiers and move internals to subpaths.

### Medium — `onAction` typing uses `unknown`
- Weakens TypeScript ergonomics for consumers.
- **Fix**: use concrete Puck action/app state types.

### Medium — i18n persistence key is global
- UI store is `storeId`-scoped, i18n store is not.
- **Fix**: namespace i18n persistence similarly to UI store.

### Medium — Accessibility gaps in drag interactions
- Drag initiation is pointer-centric, with no clear keyboard alternative for insertion.
- **Fix**: add keyboard insertion action and focusable controls.

### Low — Mobile behavior is hard-hidden
- Studio layout is hidden on small screens without fallback UI.
- **Fix**: provide configurable unsupported-viewport placeholder.

### Low — Output obfuscation hurts debugging
- Build obfuscates ESM output.
- **Fix**: remove obfuscation for OSS distribution.

## 5. Architecture Review

The architecture is largely coherent:
- `Studio` composes providers + Puck + layout,
- overrides are isolated in a dedicated module,
- theme sync and drop bridge are encapsulated hooks.

Brittle points:
- event-heavy iframe bridge has complex listener lifecycle,
- typed contract includes `as unknown as` cast for field types,
- API surface and implementation are not fully aligned.

## 6. API Review

API ergonomics are decent at entry level (`Studio`, `puckOverrides`), but long-term stability risk remains due to:
- overexposed internals,
- deprecated singleton exports still present,
- weakly typed pass-through (`onAction`),
- dead props in public interface.

## 7. Build and Package Review

Strong overall:
- exports map correctness,
- build artifact validation,
- CI gates + semantic release.

Risks:
- CSS auto-linking via post-build mutation script is fragile to output naming changes.
- `test:types` requires build artifacts first; this behavior should be explicit in contributor docs.

## 8. DX and Documentation Review

README quality is above average and includes practical examples.
Main gap is contradiction on localization defaults, plus missing troubleshooting docs for iframe and drag bridge edge cases.

## 9. Testing and Reliability Review

Confidence is currently:
- **Moderate** for utility logic,
- **Low** for runtime integration behavior.

Priority missing tests:
- action callback payloads,
- drag/drop replacement in iframe,
- store persistence namespacing,
- keyboard/focus interactions.

## 10. Prioritized Action Plan

### Before next release
1. Fix i18n default mismatch.
2. Resolve dead props (`headerSlot`, `drawerHeaderSlot`).
3. Strengthen `onAction` typing.
4. Add integration tests for core Studio interactions.

### Before calling v1 stable
1. Reduce root API overexposure and define API stability tiers.
2. Add i18n store namespacing strategy.
3. Complete accessibility pass for drag-and-drop alternatives.

### Nice-to-have
1. Remove obfuscation from OSS build outputs.
2. Add mobile fallback UI for hidden layout.
3. Add architecture/troubleshooting docs for iframe bridge.

## 11. Final Verdict

I would not broadly recommend production adoption today without conditions.

I would recommend **pilot adoption** for teams already comfortable with Puck and willing to pin versions, provided they add integration tests around localization, action wiring, and drag/drop behavior.

---

## Release Readiness Snapshot

| Area | Score (1-10) | Confidence | Main concern |
|---|---:|---|---|
| Product clarity | 7 | Medium | Package description and README positioning drift |
| Architecture | 7 | Medium-High | Event-heavy bridge complexity |
| Public API design | 5 | High | Unused props and overexposed internals |
| TypeScript quality | 6 | Medium | Unknown pass-through types and cast-based escape hatches |
| React/frontend quality | 6 | Medium | Accessibility + mobile fallback gaps |
| Puck integration | 6 | Medium | Tight coupling with limited integration tests |
| State/persistence | 6 | Medium | i18n key not instance-scoped |
| Docs/DX | 7 | High | Localization defaults contradiction |
| Build/release engineering | 8 | High | Obfuscation tradeoff for consumers |
| Performance/scalability | 7 | Medium | Good virtualization, limited stress validation |
| Reliability/testing | 4 | High | Core runtime flows under-tested |
| OSS/commercial readiness | 5 | Medium-High | Hardening needed before “stable” claim |
