# Mayyattil Waterfront Villa — Agent Guidelines (`AGENTS.md`)

This document serves as the project rulebook and architectural reference for AI agents working in this repository.

---

## 1. Project Overview
- **Brand Name**: Mayyattil Waterfront Villa
- **Location**: Kerala, India
- **Contact**: `+91 98765 43210` | `mayyattil@gmail.com`
- **Tech Stack**: Vanilla HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+), Lenis Smooth Scroll, Lucide Icons

---

## 2. File Architecture & Responsibilities

Keep files strictly separated into their dedicated concerns:

| File | Purpose |
| :--- | :--- |
| **`index.html`** | Semantic HTML structure, meta tags, and component layouts. No inline CSS or embedded `<script>` blocks. |
| **`styles.css`** | CSS variables, typography, animations, responsive breakpoints, and component styling. |
| **`script.js`** | Interactive behaviors (Lenis scroll engine, mobile navigation menu toggle, testimonial carousel slider, Lucide icon initialization). |
| **`logo.jpg`** | Official circular brand logo mark. |
| **`ref.PNG`** | Design reference mockup for layout aesthetics. |

---

## 3. Brand & Design System

### Color Palette (Extracted from Logo)
- **Primary Green**: `#2c4035` (`--green`)
- **Dark Forest Green**: `#1b2a22` (`--green-dark`)
- **Light Sage Green**: `#466152` (`--green-light`)
- **Warm Ivory / Sand**: `#f4edd9` (`--ivory`)
- **Warm Cream Background**: `#fbf9f4` (`--cream`)
- **Panel / Card Background**: `#f3ede2` (`--panel`)
- **Text Ink**: `#18251f` (`--ink`), `#33453b` (`--ink-soft`), `#607368` (`--muted`)
- **Borders & Dividers**: `#dfd8c8` (`--line`)

### Typography
- **Headings**: `'Playfair Display', serif`
- **Body & UI**: `'Jost', sans-serif`

### Icon System
- **Library**: **Lucide Icons** via `https://unpkg.com/lucide@latest` CDN script.
- **Usage**: Declare icons using `<i data-lucide="icon-name"></i>` elements in `index.html`.
- **Initialization**: Automatically rendered via `lucide.createIcons()` in `script.js`.

### Component Rules
- **Buttons (`.btn`)**: Must maintain uniform `height: 48px`, `border-radius: 24px` (pill shape), flex centering, and smooth hover elevation (`translateY(-2px)` with soft shadow).
- **Navbar Links**: Must feature the animated left-to-right underline on hover (`::after` width transition).
- **Footer Links**: Must have the smooth slide transition (`transform: translateX(5px)`) and color shift on hover without breaking SVG icon alignments (`flex-shrink: 0`).
- **Welcome Overlapping Images**: Top image (`.img-front`) has `border-left` and `border-bottom` only where it overlaps the bottom image, with `box-shadow: none`.

---

## 4. Critical Agent Constraints

1. **Preserve Existing Images**:
   - **DO NOT** replace or randomize image URLs during updates unless explicitly requested by the user.

2. **No HoneyStone / Honeycomb References**:
   - The brand is strictly **Mayyattil Waterfront Villa**.
   - No decorative honeycomb SVGs or legacy HoneyStone references should ever be reintroduced.

3. **Smooth Inertia Scrolling**:
   - Lenis smooth scroll is integrated in `index.html` and `script.js`. Ensure anchor links (`href="#id"`) use `lenis.scrollTo()` for fluid navigation.

4. **Icon Standard (Lucide Icons)**:
   - Use Lucide Icons for UI elements, cards, and metadata. Add `<i data-lucide="icon-name"></i>` and ensure `lucide.createIcons()` is called when adding dynamic elements.

5. **Clean File Separation**:
   - Keep styles inside `styles.css` and logic inside `script.js`. Avoid writing inline style attributes or script tags inside `index.html`.
