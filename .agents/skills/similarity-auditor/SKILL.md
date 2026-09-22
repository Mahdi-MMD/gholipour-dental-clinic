---
name: similarity-auditor
description: Audits both (1) fidelity against a reference website/example across structure, UI, styling, and functionality (using the reference provided in the prompt/task, or defaulting to https://qafdentalclinic.com/ if none is specified), AND (2) prompt compliance and accuracy, checking that all user instructions and constraints are completely fulfilled. Injects targeted correction prompts to align output with requirements.
---

# Similarity & Prompt Accuracy Auditor

This skill governs the systematic dual audit of:
1. **Reference / Example Similarity**: Comparing the development output against a target reference website.
   - **Dynamic Reference Detection**: If a specific reference website, link, or example is specified in the user's prompt or task instructions, compare against that exact reference.
   - **Default Reference**: If no reference is provided or mentioned, default to `https://qafdentalclinic.com/`.
2. **Prompt Accuracy & Instruction Compliance**: Verifying that every user prompt instruction, requirement, constraint, and design specification has been precisely fulfilled.

## 1. Prompt Compliance & Instruction Accuracy Dimensions

- **Item-by-Item Verification**: Cross-reference all user instructions, numbered items, and specific directives from the prompt.
- **Scope Containment**: Confirm only requested modifications are applied without unexpected changes or broken features.
- **Copy & Branding Compliance**: Validate clinic name (e.g. `کلینیک دندانپزشکی قلی پور` or specified clinic name), color palette codes, and brand tone.
- **Component & Asset Accuracy**: Ensure requested elements (e.g. Before/After slider, enlarged icons, doctor team portraits) match the exact prompt specifications.

## 2. Example / Reference Similarity Dimensions

1. **Target Identification:**
   - Detect reference URL/example from the task prompt.
   - Use specified URL or fallback to `https://qafdentalclinic.com/`.

2. **Information Architecture & Structure:**
   - Hierarchy of navigation (Header, Dropdown/Mega menus, CTAs, Floating Actions, Footer).
   - Core page sections: Hero, Services interactive tabs, Portfolio/Before-After gallery, Testimonials slider, Doctors team center-carousel, Location & Contact.
   - Quick-booking drawer (Off-canvas) with low-friction inputs.

3. **Component & UI Fidelity:**
   - Visual balance, spacing, border radiuses (rounded cards, badges).
   - RTL Persian layout and typography (e.g. PeydaWeb / Shabnam / Vazirmatn).
   - Active tab states, hover effects, and slide transition behaviors.

4. **Functional Mechanics:**
   - Booking drawer open/close behavior.
   - Services tab switching.
   - Doctors center-mode carousel highlighting.
   - Responsive breakpoints (Mobile 375px, Tablet 768px, Desktop 1280px+).

## Output Format: Dual Audit & Correction Injection

When an audit is conducted, the auditor outputs:

```markdown
### 🔍 Audit Report (Prompt Compliance & Reference Similarity)
- **Active Reference Used**: [Provided reference URL or https://qafdentalclinic.com/ (Default)]
- **Prompt Instruction Compliance**: XX%
- **Reference Example Similarity**: XX%
  - Layout & Structure Match: XX%
  - Component & Visual Match: XX%
  - Functional Mechanics Match: XX%

### 📋 1. Prompt Compliance Checklist
| # | Prompt Requirement | Status | Verification Notes |
|---|---|---|---|

### ⚠️ 2. Reference Discrepancy Breakdown
| Component | Reference Behavior | Local Output | Required Correction |
|---|---|---|---|

### 🛠️ Correction Injection Instructions
[Detailed instructions, Tailwind classes, or React/HTML code modifications needed for the builder agent to apply]
```
