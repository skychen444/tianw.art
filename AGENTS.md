# Tian W — Website Development Guidelines

## Purpose
This repository is the official artist portfolio of Tian W. Treat it as an authored artwork and portfolio, not a generic website template. Preserve intentional visual decisions and interaction pacing.

## Current stack and deployment
- Static HTML, CSS, and JavaScript.
- GitHub Pages serves the public website at tianw.art.
- Do not migrate to a framework, replace the hosting platform, or add dependencies without explicit approval.
- Confirm actual repository structure before editing; do not assume a page, asset, or build command exists.

## Visual direction
- Keep the site-wide navigation and editorial layout restrained and coherent, but do not mandate a black-and-white palette. Color, backgrounds, media, and visual treatments may vary by artwork and should follow each work's artistic concept. Preserve intentional negative space where appropriate; do not recolor or desaturate artwork assets without explicit approval.
- Preserve the established typography, hierarchy, margins, alignment, and page-specific composition. The artist's desired font is Neue Haas Grotesk Display Pro; do not silently substitute fonts or change licensing/hosting arrangements. Check what the current code actually loads before making typography claims.
- Desktop and mobile layouts are both intentional; do not treat mobile as a scaled-down desktop.
- Preserve the homepage's two-scene progression, “What for?” and “Just to make things worse.” composition, rewriting marks, and Works/About navigation behavior.
- Do not redesign, reword artwork statements, change artwork order, or remove media without explicit approval.

## Artwork pages and content
- Maintain consistent outer boundaries, metadata sizes, headings, and section hierarchy across works unless an artwork intentionally differs.
- Works desktop composition: laptop is the master layout. From 761px upward, preserve the same composition on laptop and large displays such as the ProArt monitor; do not introduce a separate large-desktop width or spacing override that changes alignment. Use a capped centered content width rather than viewport-dependent expansion. Mobile remains a separate layout.
- Current Works desktop layout rule: use a centered main content width of `min(88%, 1680px)`; do not restore a separate ProArt-only `92%` width rule.
- Current Works title placement: the large “Works” heading should sit in the negative-space zone between the fixed top-left “Tian W.” site name and the first large artwork image. It should not share the same left visual column as “Tian W.” and should not be pushed so far right that it aligns with or crowds the artwork image. Preserve the current desktop title inset behavior unless the artist explicitly requests a new composition.
- Current Works mobile rule: keep the separate mobile layout at 760px and below, including its existing 20px side padding; do not inherit the desktop percentage-width or title-inset rules.
- Preserve artwork-specific concepts, captions, images, video, and interactions.
- For a new work, inspect an existing work page and its asset conventions first. Use appropriately sized web media and meaningful alt text; do not overwrite source assets.
- The bilingual English/Traditional Chinese interface is a planned direction. Do not introduce partial translation or change the current language experience without a scoped plan and approval.

## Homepage interactions
- home.js contains stateful scroll, animation, drawing, reset, and mobile-layout logic.
- Avoid changing timing, scroll locking, SVG drawing, or state transitions as a side effect of unrelated edits.
- Test forward/backward scrolling, repeated activation, rapid scroll reversal, resize, touch interaction, and navigation availability whenever homepage behavior changes.
- Respect reduced-motion preferences when introducing new motion; discuss changes to existing authored motion before implementing.

## CSS and code changes
- Read relevant HTML, CSS, and JS together before modifying any shared element.
- Check CSS specificity, cascade order, media queries, and JavaScript inline styles. A later rule may intentionally override an earlier rule.
- Prefer minimal, localized changes. Do not perform broad cleanup or refactoring during a content update.
- Preserve rendered appearance when doing maintenance-only work. If visual parity cannot be verified, say so explicitly.
- Use semantic valid HTML; avoid nested anchors, broken links, and duplicate IDs.

## Git and review workflow
1. Read the current default branch and define the exact scope.
2. Create a dedicated branch; do not directly edit main for routine changes.
3. Make the smallest justified change and inspect the diff.
4. Verify syntax/structure and check for unintended changes to other pages.
5. Open a pull request summarizing changed files, reason, checks performed, and checks not performed.
6. Do not merge to main without the artist's approval.
7. After merge, verify GitHub Pages deployment and the relevant public pages. Distinguish code verification from actual browser/device testing.
8. If a regression occurs, identify the responsible commit/PR before attempting a rollback.

## Acceptance checklist
- Desktop and mobile layouts remain aligned with the approved design.
- Navigation, work links, images, and video work where affected.
- Homepage animations and state resets work where affected.
- No unrelated content, typography, spacing, or behavior changes.
- Deployment status and browser cache are considered when a live change is not visible.
- Report precisely what was changed, what was tested, and what still needs the artist to check.

## Collaboration principles
- Discuss artistic decisions with the artist rather than letting the coding agent decide them.
- Separate confirmed bugs from possible risks and optional cleanup.
- Never claim a visual/device test was performed if only source code was inspected.
- If uncertain, ask before making a potentially visible change.
