# TripCraft travel illustration collection

Generated with the built-in imagegen tool. Twelve destinations each have a coordinated light and dark illustration (24 final assets). Every dark image was generated from its corresponding light image to retain the same framing and landmarks.

Light art uses parchment, warm limestone, restrained terracotta and muted olive/slate. Dark art uses ink charcoal, moonlit stone, shadowed olive and small antique-gold highlights. Fine engraving and matte paper texture connect the collection with the existing hero artwork. These are editorial illustrations, not documentary location photographs.

Final assets are in `public/illustrations/light/` and `public/illustrations/dark/`, with descriptive lowercase filenames. `lib/travel-artwork.json` is the single source of filenames and descriptive alt text; `lib/travel-artwork.ts` resolves them for consumers. CSS-only dashboard background artwork is decorative; paired content images expose one accessible description, rather than duplicate announcements. Prints use the light version.

The new collection is used by Home destination/template/sample-itinerary cards, the Dashboard banner and destination cards, authentication artwork and printable itinerary covers. Existing user/provider hotel and activity photos remain real data. The logo and animated hero scene have not been replaced. Original static photographs in `public/light/` and `public/dark/` remain untouched.

| Filename stem | Light | Dark | Alt description |
| --- | --- | --- | --- |
| amalfi-coast-positano | [Light](../public/illustrations/light/amalfi-coast-positano-light.webp) | [Dark](../public/illustrations/dark/amalfi-coast-positano-dark.webp) | Vintage illustration of Positano's hillside houses, tiled church dome and boats on the Amalfi Coast. |
| goa-palm-beach | [Light](../public/illustrations/light/goa-palm-beach-light.webp) | [Dark](../public/illustrations/dark/goa-palm-beach-dark.webp) | Vintage illustration of a palm-lined Goa beach with gentle waves, coastal rocks and a distant headland. |
| italian-pasta-food-tour | [Light](../public/illustrations/light/italian-pasta-food-tour-light.webp) | [Dark](../public/illustrations/dark/italian-pasta-food-tour-dark.webp) | Vintage illustration of tomato and basil tagliatelle on a ceramic plate overlooking an Italian coastal village. |
| alpine-mountain-lake | [Light](../public/illustrations/light/alpine-mountain-lake-light.webp) | [Dark](../public/illustrations/dark/alpine-mountain-lake-dark.webp) | Vintage illustration of jagged alpine peaks, a mountain lake and a winding trail through pine-covered hills. |
| paris-eiffel-tower-seine | [Light](../public/illustrations/light/paris-eiffel-tower-seine-light.webp) | [Dark](../public/illustrations/dark/paris-eiffel-tower-seine-dark.webp) | Vintage illustration of the Eiffel Tower, a stone bridge and boats on the River Seine in Paris. |
| new-york-brooklyn-bridge | [Light](../public/illustrations/light/new-york-brooklyn-bridge-light.webp) | [Dark](../public/illustrations/dark/new-york-brooklyn-bridge-dark.webp) | Vintage illustration of Brooklyn Bridge and the Manhattan skyline across New York's East River. |
| tokyo-pagoda-cherry-blossoms | [Light](../public/illustrations/light/tokyo-pagoda-cherry-blossoms-light.webp) | [Dark](../public/illustrations/dark/tokyo-pagoda-cherry-blossoms-dark.webp) | Vintage illustration of a five-tier Japanese pagoda and temple roofs framed by cherry blossoms in Tokyo. |
| rome-saint-peters-tiber | [Light](../public/illustrations/light/rome-saint-peters-tiber-light.webp) | [Dark](../public/illustrations/dark/rome-saint-peters-tiber-dark.webp) | Vintage illustration of St Peter's Basilica, a stone bridge and umbrella pines along Rome's River Tiber. |
| dubai-burj-khalifa | [Light](../public/illustrations/light/dubai-burj-khalifa-light.webp) | [Dark](../public/illustrations/dark/dubai-burj-khalifa-dark.webp) | Vintage illustration of the Burj Khalifa and Dubai's skyline reflected in a calm waterfront pool. |
| agra-taj-mahal | [Light](../public/illustrations/light/agra-taj-mahal-light.webp) | [Dark](../public/illustrations/dark/agra-taj-mahal-dark.webp) | Vintage illustration of the Taj Mahal in Agra with its minarets, cypress gardens and reflecting pool. |
| naples-waterfront-vesuvius | [Light](../public/illustrations/light/naples-waterfront-vesuvius-light.webp) | [Dark](../public/illustrations/dark/naples-waterfront-vesuvius-dark.webp) | Vintage illustration of Naples' waterfront promenade, Castel dell'Ovo and Mount Vesuvius across the bay. |
| capri-faraglioni-sea-stacks | [Light](../public/illustrations/light/capri-faraglioni-sea-stacks-light.webp) | [Dark](../public/illustrations/dark/capri-faraglioni-sea-stacks-dark.webp) | Vintage illustration of Capri's Faraglioni sea stacks, a small boat and a cliffside garden. |

Full production prompts and palette notes are in [travel-illustration-prompts.json](travel-illustration-prompts.json). No CLI/API fallback was used.

## Asset preparation

Original generated PNGs are archived locally under ignored `artifacts/illustration-generation/masters/`. Final WebP files preserve the generated dimensions and use quality 90; this is format preparation, with no code-based recoloring or creative modification. The collection totals 14,196,968 bytes versus 85,239,725 bytes for the PNG masters. Next Image supplies responsive sizes for content imagery.

Re-encode from a local source manifest with `node scripts/prepare-illustrations.mjs <manifest.json>`. Entries require `asset`, `theme`, and the local generated PNG `path`. Do not commit machine-specific source paths; only the public filename/alt catalog and prompt history are versioned. Check equal light/dark dimensions, browser image loading, crop behavior and contrast before replacing a pair.

