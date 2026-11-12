# Ardenne / BMW EV cover — design context

## Product intent

An insurance enrollment flow embedded in a BMW France order journey. The customer should feel they are finishing the configuration of an electric BMW, not filling out an insurer form.

## Visual direction

- **Signature:** a thin electric-blue route line that moves through the six-step journey and doubles as the progress indicator.
- **Palette:** ink `#0B0D10`, graphite `#171A1F`, snow `#F7F8FA`, cobalt `#0066B1`, electric `#42A5F5`, signal `#C9F000`.
- **Typography:** Manrope for body and UI (free, geometric, readable); a heavier Manrope weight for display rather than redistributing BMW's licensed typeface.
- **Surfaces:** dark shell with bright content cards; 16px radius, thin cool-gray borders, quiet shadows.
- **Themes:** light keeps ink text on snow surfaces; dark uses graphite surfaces and snow text. Cobalt is reserved for action and selected state.

## Product rules

- Six screens: landing, vehicle, driver, cover, review, payment reference.
- French is the default locale; English copy has the same keys in `src/data/copy.js`.
- Every amount is held as integer minor units and formatted only by `formatMoney`.
- API identifiers stay in application state; customer-facing errors use plain language.
- No payment gateway or card entry. The flow ends at the payment reference.

## Responsive behavior

- Mobile-first single column.
- Cover cards become a horizontal scroll region on narrow screens, with the selected card remaining visible.
- The bottom action bar becomes sticky on mobile, but reserves space so it never covers focused content.
