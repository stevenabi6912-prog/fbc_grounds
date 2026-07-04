# Grounds Map — Fourth of July Celebration

An interactive, phone-friendly map of the event grounds. Guests scan a QR code,
the map opens, and they tap any icon to see what it is (and, for the tournaments,
when it starts). No app, no login, no server — it's a plain static website.

- **Tap** an icon → info card slides up.
- **Pinch / drag / double-tap** → zoom and pan the map.
- **Zoom buttons** (＋ － ⟳) bottom-right.
- **Hidden Edit Mode** lets *you* place and label every pin visually.

---

## Files

| File | What it's for |
|------|----------------|
| `index.html` | The page. You won't usually touch this. |
| `styles.css` | Colors and layout (1920s Americana theme). |
| `locations.js` | **All the markers** — this is the file you edit. |
| `app.js` | The map behavior. You won't usually touch this. |
| `public/grounds-map.png` | **Your map image.** |

---

## 1. Replace the map image

Put your image at **`public/grounds-map.png`** (overwrite the existing one).

- PNG or JPG both work — if you use a JPG, either rename it to `grounds-map.png`
  or change the filename in `index.html` (the `<img id="map" src="...">` line).
- Any size/orientation is fine; the map scales to fit the phone screen.
- Marker positions are stored as **percentages**, so swapping in a new image of
  the same layout keeps every pin roughly in place.

---

## 2. Add or edit markers — the easy way (Edit Mode)

Edit Mode is hidden from guests. To open it, add **`?edit=1`** to the web address:

```
http://localhost:5173/?edit=1          (local)
https://YOURNAME.github.io/REPO/?edit=1  (live)
```

In Edit Mode you can:

- **Move** a pin — just drag it.
- **Open** a pin — tap it to change its **Type/icon, Name, Time, and Description**.
- **Add** a pin — tap **＋ Add marker**, then tap the map where it goes.
- **Duplicate** a pin — open it and tap **Duplicate** (handy for several
  restrooms or trash spots). Keyboard: **Ctrl/⌘ + C** then **Ctrl/⌘ + V**.
- **Delete** a pin — open it and tap **Delete**.

### Saving your changes (important)

Because this is a static site with no database, Edit Mode **can't auto-save**.
When you're happy with the layout:

1. Tap **⬇ Export**.
2. Tap **📋 Copy to clipboard**.
3. Open `locations.js`, select everything, and **paste over the whole file**.
4. Commit and push to GitHub (see below). Guests now see your layout.

Do all your placing in one sitting, export once, paste, push. Done.

---

## 3. Add or edit markers — by hand

Open `locations.js` and copy one of the blocks in the `MARKERS` list:

```js
{ id: "restrooms-2", type: "restrooms", x: 30, y: 55,
  name: "Restrooms — Fellowship Hall", description: "By the side entrance." },
```

- `x` / `y` are percentages: `x:0` = far left, `x:100` = far right, `y:0` = top,
  `y:100` = bottom.
- `id` must be **unique**.
- `type` must match a key in `MARKER_TYPES` (top of the same file) — that's what
  sets the icon.
- Add a `time: "1:30 PM"` line to show a start time in the card.

### Changing an icon

Icons are set once per type in `MARKER_TYPES` at the top of `locations.js`.
Change the emoji there and every marker of that type updates. To give a single
marker its own icon, add `icon: "🎪"` to that one marker.

---

## 4. Run it locally

You just need any static file server. With Node installed:

```bash
node .claude/serve.js
# then open http://localhost:5173
```

(Or use the VS Code "Live Server" extension, or `npx serve`.) There's no build
step — the files you see are the files that ship.

---

## 5. Deploy to GitHub Pages

1. Create a repo on GitHub and push these files to it:

   ```bash
   git init
   git add .
   git commit -m "Grounds map"
   git branch -M main
   git remote add origin https://github.com/YOURNAME/REPO.git
   git push -u origin main
   ```

2. On GitHub: **Settings → Pages → Build and deployment**.
   Set **Source: Deploy from a branch**, **Branch: `main`**, **Folder: `/ (root)`**.
   Save.

3. Wait ~1 minute. Your map is live at:

   ```
   https://YOURNAME.github.io/REPO/
   ```

That's it — all paths in this project are **relative**, so it works from a
project sub-path with no extra configuration.

> Tip: the `.claude/` folder (local preview server) is harmless if pushed, but you
> can add it to a `.gitignore` if you'd rather not include it.

---

## 6. Make the QR code

Point the QR code at your **live** URL (the `github.io` one above).

- Any free generator works (e.g. search "QR code generator"), or
- Run: `npx qrcode "https://YOURNAME.github.io/REPO/" -o grounds-qr.png`

Print it, post it around the grounds, and guests are one scan from the map.

---

## Marker list included

Restrooms · Food & Drinks · Cornhole *(1:30 PM)* · Horseshoes *(2:15 PM)* ·
Volleyball *(3:00 PM)* · Bounce House · Bucket Golf · Chess · Checkers ·
Giant Bubbles · Small Kids Area · Photo Booth · First Aid · Ladder Ball ·
Washer Toss · Spike Ball.

Add anything else in seconds with Edit Mode or one line in `locations.js`.
