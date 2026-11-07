# Stillroom

A cozy, browser-based personal PDF library built with React, React Three Fiber, Three.js and PDF.js.

## Develop

Requires Node.js 22.12+ (tested with Node 24).

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

`npm run build` creates the production app in `dist`; `npm run preview` serves that build.

## First version

- Original interactive 3D room with an orbit overview and an enterable first-person interior.
- First-person WASD movement, mouse look, wall/furniture collision, visible stylized hands, and shelf pickup.
- Imported PDFs become held 3D books with two-page spreads, curved page-turn animation and saved progress. Only six nearby PDF pages are rendered to textures, rather than loading the whole book into GPU memory.
- Day/night lighting, fullscreen room and optional synthesized rain ambience.
- Import PDFs (up to 100 MB each), stored locally in IndexedDB.
- PDF reader with selectable text, pagination and zoom.
- Selected passages can be saved as highlights, revisited by page or removed. Highlights appear in the reader sidebar; persistent in-page colored overlays are not yet implemented.
- Reading position and highlights persist on this browser/device. Scanned PDFs need OCR before text can be selected; OCR is not included.
- Starter covers are illustrative import prompts, not included books.

No account, backend, cloud synchronization or PDF upload service is used. Browser storage can be cleared or evicted; retain your original PDFs. Typography uses local serif/sans-serif fallbacks without external font requests. WebGL is required for the room. First-person walking currently requires a keyboard and mouse; the overview and focused reader also work with touch.

## Scope

This is an initial prototype, not a production backup service. Encryption/password-protected PDF prompts, annotation export, accessible alternative room navigation and library deletion are future work. PDF.js rejects unsupported/encrypted files with a visible import error.

## First-person controls

1. Click **Enter the room**, then click inside the scene to capture the mouse. Browsers may ask permission.
2. **W/A/S/D** move; mouse looks around; **Shift** walks faster; **Esc** releases the mouse.
3. Walk near the shelf and press **E** to choose an imported book. **Browse your books** provides a direct alternative while paused.
4. **Left/right arrows** turn a spread while walking. With the mouse released, use the Previous/Next spread buttons or click a page.
5. **F** opens the focused reader for selectable text and saved highlights. **E** puts the held book away.
6. **Exit room** returns to the orbit overview. The cursor is released on exit, on opening the bookshelf, or on opening the focused reader.

This is a stylized first-person prototype. Hands are procedural geometry, not motion-captured or rigged human assets; the page turn is an original segmented-mesh deformation, not a copied model. PDF highlighting remains in the focused reader, not on the 3D paper. The reference [Wawa Sensei book slider](https://github.com/wass08/r3f-animated-book-slider-final) was inspected for its deforming-page approach; its source, textures and models were not copied. No Sketchfab models are bundled.

## Validate

```sh
node --test tests/roomPhysics.test.js
npm run build
```

The physics tests exercise walls, furniture sliding, long-frame movement and shelf proximity. Browser smoke validation additionally exercises mouse capture, shelf pickup, PDF page textures, forward/backward turns, page boundaries, focused reading and storage persistence.

The checked-in browser smoke test can be run with:

```sh
npx playwright install chromium
npm run test:browser
```

On a cloud machine with system Chromium already installed, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:browser`. The runner starts its own development server on port 4173.

## Reading comfort and room detail

Books now open in an enlarged, stationary **Read in room** position. Use **Hold & walk** to return to carrying the book, then click the scene to capture your mouse. Press **R** while carrying to enlarge it again. The book and hands render in a separate first-person foreground pass so tables and shelves cannot cut through the paper. Furniture still blocks the player's movement.

The room includes locally generated wood/plaster/linen textures, folded curtains and a day/night forest-and-mountain window illustration. These are original procedural assets, not photorealistic Sketchfab models. The Sketchfab search link was blocked by the environment's outbound network policy; no third-party room model was downloaded or licensed.

In the enlarged room view, **+ / −** zoom the physical book up to 250%. When zoomed, drag over the paper to pan. Zooming out resets the pan. PDF page textures render at 1600 × 2200 for clearer text.
