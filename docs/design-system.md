# Hubicx design system

Current as of 2026-07-03. The interface should make AI generation feel like a familiar consumer tool rather than a provider console.

## Product principles

- One obvious next action per screen.
- Hide provider terminology and parameters that are not necessary for the selected scenario.
- Templates expose only controls that materially affect the result. Video templates currently expose quality and aspect ratio while prompt/model/duration can remain scenario-owned.
- Always show price before generation and open top-up when balance is insufficient.
- Keep background work non-blocking: users may leave generation screens and retrieve results from history or Telegram.
- Prefer visual selection: media cards, aspect previews, segmented controls, sliders and clear state icons.

## Visual language

The base palette is neutral, with several functional accents rather than one dominant hue:

- Light background `#f3f2ee`, secondary background `#ecebe5`, white cards.
- Primary ink `#1c1c1a`, muted text `#8d8d87`, dividers `#e9e8e3`.
- Action accent `#fcfd76` with dark text.
- Sage `#7faa9d` for supportive/navigation states.
- Lilac `#b6b5e6` for AI/token visual cues.
- Dark theme uses `#111318` background, `#191c23` surfaces and `#f2f4f8` text.

The canonical tokens live in `webapp/public/app/ma.css` and landing equivalents in `ma-landing.css`. Desktop-specific layout lives in `ma-desktop.css` but should reuse the same semantic colors.

## Shape and elevation

- Standard cards: 16-18 px radius.
- Large sheets/modals: up to 24 px radius.
- Compact controls and icon containers: 8-13 px radius.
- Shadows are soft and low-contrast; borders separate operational surfaces.
- Avoid nesting decorative cards. Cards represent an item, modal or real tool boundary.

## Typography

- Use compact, readable hierarchy rather than oversized marketing typography inside tools.
- Primary labels are bold; secondary copy is muted and short.
- Generation parameters use label/value pairs with the value visually dominant.
- Do not scale font size directly with viewport width.

## Components

- Top navigation: three primary mobile destinations; desktop sidebar for repeated workflows.
- Segmented controls: mode/filter choices such as Photo, Video and All.
- Template cards: stable aspect ratio, real media, title at bottom, favorite action above media.
- Loading media: neutral gray surface plus shimmer; never display browser broken-image indicators.
- Bottom sheets on mobile and centered modals on desktop.
- Generation CTA: includes trusted preview price and maintains stable dimensions while price changes.
- Balance top-up: explains current balance, required amount when opened by insufficient funds, packages and approximate photo capacity.
- Aspect picker: numeric ratio plus a visual rectangle preview.
- Duration: discrete model-supported values rendered through a stable slider/chip control.

## Motion and loading

- Use short opacity/translate transitions around 180-250 ms.
- Shimmer is allowed only as loading feedback and respects `prefers-reduced-motion`.
- Template videos load only near the viewport; WebP posters provide immediate visual feedback.
- Avoid animation that delays the primary action.

## Responsive behavior

- Telegram Mini App is mobile-first and respects Telegram safe areas.
- Desktop favors a quiet workspace with sidebar, dense controls and persistent result area.
- Labels must wrap instead of overflowing; fixed-format controls use stable dimensions and aspect ratios.
- Z-index layers must keep navigation and sheets above template favorite icons and media.

## Accessibility and UX safeguards

- Icon-only controls require accessible labels or tooltips.
- Click targets should remain comfortable on touch screens.
- Modal overlays close by explicit close control and supported outside click/back action.
- Error copy is actionable and non-technical. Safety rejection asks the user to replace the image without exposing raw provider details.
- Price and balance are never conveyed by color alone.
