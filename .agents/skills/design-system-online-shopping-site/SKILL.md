---
name: design-system-online-shopping-site-in-india-shop-online-for-mo
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Online Shopping site in India: Shop Online for Mobiles, Books, Watches, Shoes and More

## Mission
Deliver implementation-ready design-system guidance for Online Shopping site in India: Shop Online for Mobiles, Books, Watches, Shoes and More that can be applied consistently across e-commerce storefront interfaces.

## Brand
- Product/brand: Online Shopping site in India: Shop Online for Mobiles, Books, Watches, Shoes and More
- URL: https://www.amazon.in/?&tag=googhydrabk1-21&ref=pd_sl_7hz2t19t5c_e&adgrpid=155259815513&hvpone=&hvptwo=&hvadid=815461303151&hvpos=&hvnetw=g&hvrand=2232131027037439029&hvqmt=e&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9300903&hvtargid=kwd-10573980&hydadcr=14453_2462831&mcid=4c22dcdee2bf3a71b0b832c5c4ba9c17&hvocijid=2232131027037439029--&hvexpln=nav&gad_source=1
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Amazon Ember`, `font.family.stack=Amazon Ember, Arial, sans-serif`, `font.size.base=13px`, `font.weight.base=400`, `font.lineHeight.base=19px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=11px`, `font.size.md=12px`, `font.size.lg=13px`, `font.size.xl=14px`, `font.size.2xl=21px`, `font.size.3xl=25px`
- Color palette: `color.text.primary=#2162a1`, `color.text.secondary=#0f1111`, `color.text.tertiary=#dddddd`, `color.text.inverse=#d6d6d6`, `color.surface.base=#000000`, `color.surface.muted=#ffffff`
- Spacing scale: `space.1=1px`, `space.2=2px`, `space.3=4px`, `space.4=5px`, `space.5=6px`, `space.6=7px`, `space.7=8px`, `space.8=9px`
- Radius/shadow/motion tokens: `radius.xs=3px`, `radius.sm=4px`, `radius.md=5px` | `shadow.1=rgb(136, 136, 136) 0px 1px 3px 0px`, `shadow.2=rgba(0, 0, 0, 0.18) 1px 0px 2px 0px`, `shadow.3=rgba(0, 0, 0, 0.18) -1px 0px 2px 0px` | `motion.duration.instant=200ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
