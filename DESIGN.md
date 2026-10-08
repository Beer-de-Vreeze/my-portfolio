---
name: Beer de Vreeze
description: AI engineer portfolio drawn as a live glyph-density render in one amber phosphor monospace grid.
colors:
  ground: "#0d0f0b"
  ground-raised: "#15170f"
  ink: "#e8b04a"
  text: "#f2ead6"
  muted: "#b8a37a"
  line: "#4a3d22"
  focus: "#ffd27a"
  paper-ground: "#efe7d2"
  paper-ground-raised: "#e6dcc2"
  paper-ink: "#8a4b00"
  paper-text: "#1d160a"
  paper-muted: "#5e4a28"
  paper-line: "#c4b089"
  paper-focus: "#8a4b00"
typography:
  display:
    fontFamily: "\"Martian Mono Variable\", ui-monospace, \"Cascadia Mono\", Menlo, monospace"
    fontSize: "clamp(2rem, 1.3rem + 3vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "\"wdth\" 87.5"
  headline:
    fontFamily: "\"Martian Mono Variable\", ui-monospace, \"Cascadia Mono\", Menlo, monospace"
    fontSize: "clamp(1.375rem, 1.1rem + 1.2vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "\"Martian Mono Variable\", ui-monospace, \"Cascadia Mono\", Menlo, monospace"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.6
  body:
    fontFamily: "\"Martian Mono Variable\", ui-monospace, \"Cascadia Mono\", Menlo, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.75
    fontFeature: "\"tnum\""
  label:
    fontFamily: "\"Martian Mono Variable\", ui-monospace, \"Cascadia Mono\", Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.6
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  max: "82rem"
  section: "clamp(5rem, 12vw, 9rem)"
  project: "clamp(4rem, 9vw, 7rem)"
  column: "clamp(2rem, 5vw, 5rem)"
  panel: "1.25rem 1.5rem"
components:
  control:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.25em 0"
  control-hover:
    textColor: "{colors.text}"
  control-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  play-overlay:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    padding: "0.4em 1ch"
  hero-panel:
    backgroundColor: "{colors.ground}"
    padding: "{spacing.panel}"
  glyph-frame:
    backgroundColor: "{colors.ground-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    padding: "0.5rem 0.75rem"
---

# Design System: Beer de Vreeze

## Overview

**Creative North Star: "The Phosphor Terminal"**

Everything on the page is drawn on one monospace character grid in a single amber phosphor ink on near-black.
Tone comes from glyph density, not from color, gradients or imagery: the ramp ` .:-=+*#%@` turns luminance into characters.
At a distance the hero reads as sculpture; up close it is readable trace.

The page is sparse and long-form.
Each case study pairs a column of copy with a side column of proof: a glyph video, a tool manifest and glyph figures.
Photos and video frames are shown as glyphs first and reveal the real picture on hover or tap.

Motion has mass.
The hero light follows a damped spring, tool calls send pulse rings through the name, and every reveal is a 320ms expo-out fade.
Reduced motion freezes all of it to a single static frame.

**Key Characteristics:**
- One face, Martian Mono Variable, at every size.
- One accent, the ink, which also carries links, controls and section titles.
- Square corners everywhere; no shadows, no borders, no radius.
- Rules drawn as runs of `-` characters in the line color.
- Buttons are bracketed text: `[ Label ]`.
- Glyph rendering on canvas for the hero, every figure and the video poster.

## Colors

A single warm amber ink on a green-black ground, inverted to brown ink on paper in light mode.
The theme follows `prefers-color-scheme` only; there is no manual toggle.

### Primary
- **Phosphor Amber** (ink): links' underline color, bracket controls, section titles, fact labels, glyph renders, the seek fill and thumb, and text selection.
- **Burnt Umber** (paper-ink): the same role on the light theme, dark enough to carry body-size control text on paper.

### Neutral
- **Green-Black Ground** (ground): page background, hero panels behind the intro and demo run, the play overlay chip.
- **Raised Ground** (ground-raised): the backing of every glyph frame and video screen while media loads.
- **Phosphor Cream** (text): headings, summaries, manifest tool names, the demo log.
- **Dim Brass** (muted): body paragraphs inside case studies, captions, nav links, the video clock.
- **Burnt Line** (line): character rules and the unplayed part of the seek track; also the scrollbar thumb.
- **Hot Amber** (focus): the 2px focus outline, offset 3px.
- **Paper** (paper-ground), **Paper Raised** (paper-ground-raised), **Ink Black** (paper-text), **Sepia** (paper-muted), **Tan Line** (paper-line), **Umber Focus** (paper-focus): the light-theme counterparts, same roles.

### Named Rules
**The One Ink Rule.** There is exactly one chromatic color per theme; every emphasis is ink, weight or density, never a second hue.
**The Invert On Paper Rule.** Glyph photos invert their luminance on the light theme so dark pixels carry the ink; the video keeps its tones so its dark background stays empty.

## Typography

**Display Font:** Martian Mono Variable (with ui-monospace, Cascadia Mono, Menlo, monospace)
**Body Font:** Martian Mono Variable
**Label/Mono Font:** Martian Mono Variable

**Character:** One self-hosted variable monospace face does everything; hierarchy comes from weight (400 to 800), width (87.5% for display) and size.
Numbers are tabular site-wide.

### Hierarchy
- **Display** (800, step-3, line-height 1, width 87.5%, -0.03em): project titles and the contact email.
- **Headline** (700, step-2, 1.25, -0.02em, balanced wrap): the hero role line, the page's h1.
- **Title** (700, step-1): section titles in ink, drawn as rules; case-study summaries use the same size at 600 in text color.
- **Body** (400, step-0, 1.75): paragraphs, capped at 62ch in copy columns and 44ch in the hero intro.
- **Label** (600, step--1): demo run title, manifest headings, video controls, facts, captions (400 there).

The full scale is step--1 0.8125rem, step-0 0.9375rem, step-1 1.125rem, step-2 clamp(1.375rem, 1.1rem + 1.2vw, 1.875rem), step-3 clamp(2rem, 1.3rem + 3vw, 3.75rem).
The demo log drops to 0.6875rem below 36rem.

### Named Rules
**The One Face Rule.** Never introduce a second family; a new role is a new weight, width or step of Martian Mono.
**The Character Grid Rule.** Measure horizontal rhythm in `ch` where it touches text: label columns are 12ch or 22ch, nav gaps 2.5ch, link gaps 2.5ch.

## Layout

The hero is a full-viewport (100svh) grid of top bar, glyph field and base, with the canvas field absolutely filling it behind.
The base splits 1fr / 1.1fr: intro and email action bottom-left, the demo run bottom-right, each on a ground-colored panel so text never sits on glyphs.
Below the hero, content is centered in an 82rem column with the gutter on both sides.

Case studies are two equal columns (copy, proof) with a column gap; earlier work is an auto-fill grid of 14rem-minimum cells; About is a 22rem portrait beside the copy.
Sections open with a large top margin (section spacing); consecutive case studies are separated by project spacing.

At 60rem and below every two-column grid collapses to one column.
At 36rem and below the hero drops its full-height minimum, the field keeps at least 34svh, panels tighten to 1rem padding, and definition lists stack label over value.
On narrow hero widths (under 600px) the name breaks into three lines: BEER / DE / VREEZE.

## Elevation & Depth

The system is flat.
There are no shadows and no z-axis layering beyond the hero panels sitting on the canvas field.
Depth is conveyed by glyph density: denser characters read as nearer and brighter.

### Named Rules
**The Density Not Shadow Rule.** Separation comes from ground versus raised ground and from glyph density, never from box-shadow.

## Shapes

Every corner is square, including the seek thumb (0.6rem by 1rem block) and the pressed control fill.
There are no borders: rules are character runs and controls are framed by literal `[` and `]` characters.
Media frames are clipped rectangles at fixed ratios: 16 / 9 for video, 4 / 3 for case-study and earlier-work figures, 3 / 4 for the portrait.

### Named Rules
**The Drawn Rule Rule.** A divider is a run of `-` characters in the line color that fills the remaining width after its label; never a CSS border or hr.

## Components

### Buttons (bracket controls)
Text that looks like a terminal option.
- **Shape:** no box; `[` and `]` generated around the label with a half-ch gap, square fill when pressed.
- **Default:** ink text on transparent, inherits font size, nowrap.
- **Hover / Focus:** text shifts to the text color; focus is the global 2px focus outline offset 3px.
- **Pressed (`aria-pressed="true"`):** inverts to ground text on an ink fill; used for demo-run tabs, Mute, CC and Fullscreen.
- **Action variant:** the hero email action is the same control at weight 600.
- **Play overlay:** centered on the video screen, ground background, 0.4em 1ch padding, weight 600, label "Play demo" or "Resume".

### Navigation
- Muted text links without underline, 2.5ch apart, ink on hover; 1.5ch apart at step--1 below 36rem.
- Plain links elsewhere inherit text color with a 1px ink underline offset 0.3em and turn ink on hover.
- A skip link sits off-screen and drops in as an ink chip on focus.

### Glyph Figure (signature)
An image rendered as glyphs in ink on the raised ground, with the real photo one hover or tap away.
- Glyphs use weight 500 at the figure's glyph size (7px default, 6px for earlier-work cells, the portrait and video), contrast-stretched to use the whole ramp.
- **Hover hint:** viewfinder corners (`+--` and `--+`) are stamped into the glyph grid itself, with the word `hover` (pointer devices) or `tap` (touch) in the bottom-right corner.
- On hover the canvas fades out and the photo fades in from a 6px blur; on touch a tap toggles between them.
- The cursor is a crosshair; captions are muted step--1 below the frame.

### Glyph Video (signature)
A video that shows as glyphs while stopped or paused and as real video while playing.
- Paused frames and the poster are re-rendered as glyphs (tones not inverted); hovering a paused screen reveals the real frame.
- Custom control bar in the page's grammar: a full-width seek line (2px track, ink fill to the playhead over line color, square ink thumb), then bracket controls for Play/Pause, a muted `m:ss / m:ss` clock, Mute, CC and Fullscreen.
- Captions are burned into the video; the text track exists for screen readers and as an opt-in.

### Hero Glyph Field (signature)
The name drawn as density across the hero, lit by a moving light.
- The name is rasterised at weight 800, semi-expanded, aligned to the gutter, into the band between the top bar and the base panels.
- Cell font size is width / 105, clamped 8 to 14px, row height 1.32em; it redraws at 30fps.
- Light only deepens the name: cell value is mask times (0.5 + 0.5 light); empty cells stay empty.
- The canvas is `aria-hidden`; the name is also in the h1 as screen-reader text.

### Demo Run
A typed agent trace labelled "Demo run" with bracket tabs per project.
- The prompt types one character every 34ms, tool lines three characters every 14ms, with 500ms after the prompt and 380ms between lines.
- Each completed tool line dispatches a pulse to the hero field; runs auto-advance after 4200ms until a tab is clicked.
- The log holds a minimum of eight lines so the panel never jumps.

### Motion
- **Spring light:** the hero light follows a damped spring (stiffness 18, damping 7) toward the pointer, or an idle Lissajous drift when no pointer is present.
- **Pulse rings:** each pulse expands from the light's position at 0.55 field-widths per second and fades over 2.2s, adding up to 0.7 density inside the name.
- **Reveals:** glyph-to-photo and glyph-to-frame swaps are 320ms `cubic-bezier(0.16, 1, 0.3, 1)` opacity (and blur for photos).
- **Reduced motion:** the hero draws one static frame and never animates or pulses, the demo log shows the whole run at once, figure transitions are removed, and smooth scrolling is turned off.
- The field also pauses when the hero is offscreen or the tab is hidden.

## Do's and Don'ts

### Do:
- **Do** use the ink for every interactive and emphasized element and nothing else chromatic.
- **Do** frame every button as a bracket control and show pressed state as an ink fill.
- **Do** draw dividers as character runs in the line color.
- **Do** render new imagery as a glyph figure with the stamped `hover`/`tap` hint and a 320ms expo-out reveal.
- **Do** put text that overlays the glyph field on a ground panel.
- **Do** honour `prefers-reduced-motion` with a static frame, not a slower animation.

### Don't:
- **Don't** add a second font family, a second accent hue, gradients or shadows.
- **Don't** round corners or draw CSS borders around content.
- **Don't** let light or pulses add glyphs outside the name's mask.
- **Don't** split a repeated unit (a log row, an earlier-work cell, a manifest entry) across columns.
