# AGENTS.md — TimeStamp Web App

## 1. Project Overview

Build a **client-side-only** React web application called **TimeStamp** that lets a user take a photo (via webcam/device camera) or upload an existing photo, and automatically stamps it with:

- **Date** — format `DD MMM YYYY` (e.g. `06 Sep 2026`)
- **Time** — format `HH:MM:SS` (24-hour, e.g. `14:32:07`)
- **Location** — auto-filled from the browser Geolocation API, but manually editable/overridable by the user

The stamp is burned into the bottom-right corner of the image before the user downloads/saves it.

**No backend, no external servers, no third-party APIs requiring keys.** Everything (camera access, geolocation, image compositing, download) happens in the browser using native Web APIs.

---

## 2. Tech Stack

- **React** (Vite recommended over CRA for speed/simplicity — no external CDN dependency needed at runtime)
- Plain CSS or CSS Modules / Tailwind (either is fine) for a responsive, mobile-first UI
- No state management library needed — React hooks (`useState`, `useRef`, `useEffect`) are sufficient
- No image-processing library needed — use the native `<canvas>` API to draw the video frame/uploaded image + text overlay, then export via `canvas.toBlob()` / `toDataURL()`
- No routing library needed (single page/view app)

**Do not** introduce a backend, database, cloud storage, or any API that requires a key or network call. Location is handled entirely through a manual, optional text field (see 3.2) — no geolocation API and no reverse-geocoding service are used anywhere in this app.

---

## 3. Core Features & Requirements

### 3.1 Camera Access
- On load (or on user action — see UX notes), request camera permission via `navigator.mediaDevices.getUserMedia({ video: {...} })`.
- Handle permission **denied** gracefully: show a clear message and fall back to the "Upload a photo" flow.
- **Enumerate available cameras** using `navigator.mediaDevices.enumerateDevices()` and filter for `kind === 'videoinput'`.
  - If more than one camera is available (common on mobile: front/back; sometimes desktop has multiple webcams), show a **camera selector** (dropdown or toggle button, e.g. a "flip camera" icon on mobile) allowing the user to switch.
  - Re-invoke `getUserMedia` with the chosen `deviceId` when the user switches cameras, and properly stop the previous stream's tracks (`track.stop()`) to release the camera.
- Display a **live video preview** (`<video>` element, `autoplay`, `muted`, `playsInline` — `playsInline` is essential for iOS Safari so it doesn't force fullscreen).
- Provide a clearly visible **"Capture" / shutter button**.

### 3.2 Location Input (Manual & Optional)
- **Do not use the browser Geolocation API at all** — no `navigator.geolocation` call, no location permission prompt of any kind.
- Provide a plain **text input field** labeled something like "Location (optional)" where the user can type whatever they want — a place name, an address, coordinates, or nothing.
- The field starts **empty** by default.
- Location is **entirely optional**:
  - If the user leaves it blank, the final stamp should contain **only Date and Time** (no empty third line, no placeholder text like "Location: —").
  - If the user types something, it appears as the third stamp line exactly as entered.
- The user can edit this field at any point before finalizing the image (see 3.5), including changing their mind and clearing it back out.

### 3.3 Capturing a Photo
- On "Capture", draw the current `<video>` frame onto an offscreen `<canvas>` at the video's native resolution (avoid downscaling to a low-res preview size).
- Then draw the stamp text (date, time, and location if provided) onto the same canvas, bottom-right aligned (see Section 4 for stamp styling rules).
- Show the resulting stamped image as a **preview/result screen** with options to:
  - Retake (go back to live camera)
  - Download / Save the stamped image (`canvas.toBlob()` → object URL → `<a download>` trigger, or the Web Share API on mobile as a nice-to-have)
  - Edit the location text and re-render the stamp before finalizing (see 3.5)

### 3.4 Upload Existing Photo
- Provide an "Upload" button/tab as an alternative entry point to using the camera.
- Accept image files via `<input type="file" accept="image/*">`.
- Load the uploaded image into an `<img>`/`Image()` object, draw it onto the canvas at full resolution, then apply the same date/time/location stamping logic as the camera flow.
- **Date/time for uploads**: default to the *current* date/time (when the stamp is applied), not any EXIF metadata from the original photo, unless the user explicitly wants to preserve/edit the original photo's timestamp — clarify this decision with the user before treating it as a requirement, and if EXIF timestamp extraction is wanted, note it requires a small EXIF-parsing utility (e.g. a lightweight local library, not a network call).
- Location for uploads: same manual, optional text-field flow as camera capture (see 3.2).

### 3.5 Editable Stamp Before Finalizing
- After capture or upload, before the final download, let the user edit the **location field** (and optionally reopen date/time if they want manual override) and have the canvas re-render live so they can see the updated stamp before saving.

---

## 4. Stamp Styling Rules

- Position: **bottom-right corner** of the image, with reasonable padding from the edges (e.g. ~2–3% of image width/height, scaled to image size — not a fixed pixel count, so it looks correct on both a 640px webcam frame and a 4000px phone photo).
- Layout: right-aligned, one line per field:
  ```
  06 Sep 2026
  14:32:07
  Central Park, NYC   (only shown if the user typed a location)
  ```
  If the location field is empty, the stamp is just two lines (date + time) — don't leave a blank gap or placeholder line where the location would have been.
- Legibility: add a semi-transparent dark background box or a text shadow/stroke behind the white (or light) text so it stays readable over any photo background.
- Font size should scale relative to image dimensions (e.g. `imageWidth * 0.025`) so it doesn't look tiny on high-res photos or oversized on small ones.

---

## 5. UI/UX Requirements

- **Fully responsive**: works well on both small mobile viewports and wide desktop screens.
  - Mobile: camera preview takes most of the screen, big touch-friendly shutter button, camera-flip icon.
  - Desktop: centered, reasonably sized preview (don't stretch full-bleed on a wide monitor), clear buttons with hover states.
- **Simple, linear flow**, roughly:
  1. Landing / mode choice: "Take Photo" or "Upload Photo"
  2. Camera permission prompt (camera mode only) with friendly explanatory text on why it's needed, shown before or alongside the browser's native prompt
  3. Live preview (camera mode) with camera-switcher + shutter, or file picker (upload mode)
  4. Result screen: stamped image preview, an optional editable "Location" text field, Retake/Re-upload, Download/Share
- Design should be minimal — no dashboards, no unnecessary steps. Prioritize large tap targets, high contrast, and clear iconography (camera icon, location pin icon, download icon).
- Provide visible, non-technical error states (e.g. "We couldn't access your camera. You can still upload a photo instead." rather than a raw JS error).

---

## 6. Permissions & Privacy Notes (for the agent to keep in mind while building)

- The camera API **only works over HTTPS or `localhost`** — note this to the user if deploying anywhere.
- The app requests **only one browser permission: camera** (and only in "Take Photo" mode — the "Upload Photo" flow needs no permissions at all). There is no geolocation permission prompt anywhere in the app.
- Never persist or transmit the photo, location text, or any personal data anywhere — everything stays in-memory / in the browser tab. Make this explicit in the UI copy (e.g. a small "Your photos never leave your device" note) since it's a stated goal of the project.
- Request the camera permission with context: show a short explanatory UI state ("We need your camera to take a photo") immediately before triggering the native browser permission dialog, rather than requesting it silently on page load.

---

## 7. Nice-to-Haves (only if time/scope allows — not required for MVP)

- Web Share API integration on mobile for direct sharing after capture.
- Light/dark theme toggle.
- Choice of stamp corner (not just bottom-right) or a custom text color/format.
- PWA support (installable, offline-capable) — still zero backend, fits the "no external services" goal well.

---

## 8. Explicit Non-Goals

- No user accounts, login, or sessions.
- No server-side storage, database, or analytics.
- No paid or key-gated third-party APIs.
- No EXIF-based GPS extraction requirement unless separately confirmed with the user.

---

## 9. Suggested File/Component Structure

```
src/
  App.jsx
  components/
    ModeSelect.jsx        // "Take Photo" vs "Upload Photo"
    CameraView.jsx         // live video preview + camera selector + shutter
    UploadView.jsx          // file input + preview
    LocationInput.jsx      // optional, freeform, manually-typed location field
    StampCanvas.jsx         // canvas logic: draw image + draw stamp text
    ResultView.jsx           // final stamped image + retake/download/share
  hooks/
    useCamera.js            // getUserMedia, device enumeration, switching
  utils/
    formatDate.js            // DD MMM YYYY formatter
    formatTime.js             // HH:MM:SS formatter
    drawStamp.js                // canvas text-stamping logic
  App.css
```

This structure keeps camera logic, geolocation logic, and canvas/stamp logic each testable and swappable independently.