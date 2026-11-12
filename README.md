# Ardenne Assurance — EV cover enrollment

## Run

From a clean checkout:

```bash
npm start
```

Then open the printed local URL.

## Implemented flow

The flow implements all six steps of the brief with plain HTML, CSS, and JavaScript:

1. Landing
2. Vehicle confirmation
3. Driver details
4. Cover selection with annual/monthly pricing and add-ons
5. Review with contact details, consents, and document links
6. Payment reference with policy number, entity, reference, amount due, and next steps

The browser calls a local HTTP mock through `POST /v1/quotes` and `POST /v1/contracts`. The server is dependency-free and returns the documented JSON shapes and error statuses. The current step, theme, language, quote, selection, contact details, consents, and issued contract persist in `localStorage`, so a refresh does not reset the journey.

## Brand note

The visual language was extracted from the public BMW France homepage: configuration-first navigation, electric range language, restrained monochrome surfaces, and blue accents. BMW's licensed typeface and roundel were not copied. Manrope is used as a free substitute and the header uses a geometric `B` stand-in.

## AI note

AI was used to accelerate the first-pass structure and copy translation. The important manual checks are API minor-unit handling, eligibility/error wording, keyboard states, mobile layout, and keeping all colors/strings in one place.

## Submission checklist

- Run locally with `npm start` from a clean checkout.
- The separate two-page project write-up is generated outside the repository and should be sent with the repository link.
- No API keys, payment credentials, or insurer credentials are required.
- The local server exposes `POST /v1/quotes` and `POST /v1/contracts` for the documented exercise contract.
