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

- Original interactive 3D room: drag to orbit, scroll to zoom, click the shelf to browse books.
- Day/night lighting, fullscreen room and optional synthesized rain ambience.
- Import PDFs (up to 100 MB each), stored locally in IndexedDB.
- PDF reader with selectable text, pagination and zoom.
- Selected passages can be saved as highlights, revisited by page or removed. Highlights appear in the reader sidebar; persistent in-page colored overlays are not yet implemented.
- Reading position and highlights persist on this browser/device. Scanned PDFs need OCR before text can be selected; OCR is not included.
- Starter covers are illustrative import prompts, not included books.

No account, backend, cloud synchronization or PDF upload service is used. Browser storage can be cleared or evicted; retain your original PDFs. Google Fonts are requested for typography; local serif/sans-serif fonts are fallbacks. The 3D view currently uses orbit navigation, not first-person walking. WebGL is required for the room.

## Scope

This is an initial prototype, not a production backup service. Encryption/password-protected PDF prompts, annotation export, accessible alternative room navigation and library deletion are future work. PDF.js rejects unsupported/encrypted files with a visible import error.
