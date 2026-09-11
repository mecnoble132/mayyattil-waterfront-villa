# Mayyattil Waterfront Villa — Agent Guidelines (`AGENTS.md`)

This document serves as the project rulebook and architectural reference for AI agents working in this repository.

---

## 1. Project Overview
- **Brand Name**: Mayyattil Waterfront Villa
- **Property Concept**: Exclusive Single Private Riverfront Villa (Whole-Estate Buyout Only — 1 Private Group/Family per stay, No separate rooms/resort accommodations)
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
- **Hero Section Height**: Must maintain full height (`min-height: 88vh`) on desktop. On mobile screens (`≤640px`), height is kept compact (`min-height: 52vh`) with balanced padding (`38px 20px 42px`).
- **Hero Background Video Support**: The hero section is prepared with `.hero-video` (`object-fit: cover; inset: 0; z-index: 0;`) and `.hero-overlay` (`z-index: 1;`) to support seamless swapping of background images with an HTML5 `<video>` tag.
- **Mobile Text Width Bounds**: In the hero section on mobile, text must never span edge-to-edge; keep paragraphs capped (`max-width: 340px`) and headings balanced.

---

## 4. Critical Agent Constraints

1. **No Redundant Browser Testing — Tell User What to Look For**:
   - **DO NOT** spin up browser subagents, headless browser tests, or run repetitive verification loops for every styling or UI edit.
   - Make the code changes cleanly and directly.
   - In your response, clearly state **what changed** and tell the user **specifically what to look for** when they preview the site.

2. **Preserve Existing Images**:
   - **DO NOT** replace or randomize image URLs during updates unless explicitly requested by the user.

3. **No HoneyStone / Honeycomb References**:
   - The brand is strictly **Mayyattil Waterfront Villa**.
   - No decorative honeycomb SVGs or legacy HoneyStone references should ever be reintroduced.

4. **Smooth Inertia Scrolling**:
   - Lenis smooth scroll is integrated in `index.html` and `script.js`. Ensure anchor links (`href="#id"`) use `lenis.scrollTo()` for fluid navigation.

5. **Icon Standard (Lucide Icons)**:
   - Use Lucide Icons for UI elements, cards, and metadata. Add `<i data-lucide="icon-name"></i>` and ensure `lucide.createIcons()` is called when adding dynamic elements.

6. **Clean File Separation**:
   - Keep styles inside `styles.css` and logic inside `script.js`. Avoid writing inline style attributes or script tags inside `index.html`.

7. **Strictly Single Private Villa (No Multi-Room Resort Concepts)**:
   - The property is strictly a single, private riverfront villa offered exclusively to one guest party at a time.
   - Never reintroduce separate rentable rooms, multiple villa categories, or hotel-style accommodations.
   - The primary showcase section represents "The Villa Spaces" (the interconnected living areas of the single villa: Master Suite, Living & Dining Pavilion, Private Pool & Sun Deck, Tropical Ensuite Bath, Riverside Lawn & Sunset Bank).
   - Navigation and buttons must use "The Villa" and "Reserve Villa" instead of "Rooms" or "Book Now".
