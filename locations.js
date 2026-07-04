/* ============================================================================
   locations.js  —  ALL your map data lives here.
   This is the ONE file you edit to change what's on the map.

   ── HOW TO ADD A MARKER (by hand) ──────────────────────────────────────────
   Copy one of the { ... } blocks in MARKERS below, paste it, and change the
   values. `x` and `y` are percentages (0–100) across the map image:
       x: 0  = far left      x: 100 = far right
       y: 0  = very top       y: 100 = very bottom
   Easier: use EDIT MODE (add ?edit=1 to the web address) to drag pins around
   visually, then click "Export" and paste the result back over this file.

   ── HOW TO CHANGE AN ICON ───────────────────────────────────────────────────
   Every marker has a `type`. The icon for each type is set once in
   MARKER_TYPES below — change the emoji there and every marker of that type
   updates. To give a single marker its own icon, add an `icon:` line to it.
   ========================================================================== */

/* The icon + default label for each kind of marker.
   Swap any emoji for one you like better. */
window.MARKER_TYPES = {
  restrooms:    { icon: "🚻", label: "Restrooms" },
  food:         { icon: "🍔", label: "Food & Drinks" },
  cornhole:     { icon: "🌽", label: "Cornhole" },
  horseshoes:   { icon: "🧲", label: "Horseshoes" },
  volleyball:   { icon: "🏐", label: "Volleyball" },
  bounce_house: { icon: "🏰", label: "Bounce House" },
  bucket_golf:  { icon: "⛳", label: "Bucket Golf" },
  chess:        { icon: "♟️", label: "Chess" },
  checkers:     { icon: "⚫", label: "Checkers" },
  giant_bubbles:{ icon: "🫧", label: "Giant Bubbles" },
  small_kids:   { icon: "🧸", label: "Small Kids Area" },
  photo_booth:  { icon: "📸", label: "Photo Booth" },
  first_aid:    { icon: "⛑️", label: "First Aid" },
  ladder_ball:  { icon: "🪜", label: "Ladder Ball" },
  washer_toss:  { icon: "🥏", label: "Washer Toss" },
  spike_ball:   { icon: "🔵", label: "Spike Ball" },
  pickleball:   { icon: "🥒", label: "Pickleball" },
  football:     { icon: "🏈", label: "Football" },
  croquet:      { icon: "🏑", label: "Croquet" },
  bocce_ball:   { icon: "🟤", label: "Bocce Ball" },
  giant_jenga:  { icon: "🧱", label: "Giant Jenga" },
  can_jam:      { icon: "🥫", label: "Can Jam" },
  slip_slide:   { icon: "🛝", label: "Slip and Slide" },
  the_island:   { icon: "🏝️", label: "The Island" }
};

/* The actual pins on the map.
   name + description show in the info card. `time` is optional and only
   used by the tournament markers. Each marker is fully independent — even
   duplicates — so you can give three restroom pins three different notes. */
window.MARKERS = [
  { id: "restrooms-1",    type: "restrooms",     x: 20, y: 20, name: "Restrooms",       description: "Edit me: where the restrooms are." },
  { id: "food-1",         type: "food",          x: 40, y: 20, name: "Food & Drinks",   description: "Edit me: what's being served." },
  { id: "cornhole-1",     type: "cornhole",      x: 60, y: 20, name: "Cornhole",        description: "Edit me: cornhole tournament.", time: "1:30 PM" },
  { id: "horseshoes-1",   type: "horseshoes",    x: 80, y: 20, name: "Horseshoes",      description: "Edit me: horseshoes tournament.", time: "2:15 PM" },

  { id: "volleyball-1",   type: "volleyball",    x: 20, y: 40, name: "Volleyball",      description: "Edit me: volleyball tournament.", time: "3:00 PM" },
  { id: "bounce_house-1", type: "bounce_house",  x: 40, y: 40, name: "Bounce House",    description: "Edit me: bounce house info." },
  { id: "bucket_golf-1",  type: "bucket_golf",   x: 60, y: 40, name: "Bucket Golf",     description: "Edit me: bucket golf info." },
  { id: "chess-1",        type: "chess",         x: 80, y: 40, name: "Chess",           description: "Edit me: chess info." },

  { id: "checkers-1",     type: "checkers",      x: 20, y: 60, name: "Checkers",        description: "Edit me: checkers info." },
  { id: "giant_bubbles-1",type: "giant_bubbles", x: 40, y: 60, name: "Giant Bubbles",   description: "Edit me: giant bubbles info." },
  { id: "small_kids-1",   type: "small_kids",    x: 60, y: 60, name: "Small Kids Area", description: "Edit me: little ones' area." },
  { id: "photo_booth-1",  type: "photo_booth",   x: 80, y: 60, name: "Photo Booth",     description: "Edit me: photo booth info." },

  { id: "first_aid-1",    type: "first_aid",     x: 20, y: 80, name: "First Aid",       description: "Edit me: first aid station." },
  { id: "ladder_ball-1",  type: "ladder_ball",   x: 40, y: 80, name: "Ladder Ball",     description: "Edit me: ladder ball info." },
  { id: "washer_toss-1",  type: "washer_toss",   x: 60, y: 80, name: "Washer Toss",     description: "Edit me: washer toss info." },
  { id: "spike_ball-1",   type: "spike_ball",    x: 80, y: 80, name: "Spike Ball",      description: "Edit me: spike ball info." },

  { id: "pickleball-1",   type: "pickleball",    x: 30, y: 30, name: "Pickleball",      description: "Edit me: pickleball info." },
  { id: "football-1",     type: "football",      x: 50, y: 30, name: "Football",        description: "Edit me: football info." },
  { id: "croquet-1",      type: "croquet",       x: 70, y: 30, name: "Croquet",         description: "Edit me: croquet info." },
  { id: "bocce_ball-1",   type: "bocce_ball",    x: 30, y: 50, name: "Bocce Ball",      description: "Edit me: bocce ball info." },
  { id: "giant_jenga-1",  type: "giant_jenga",   x: 50, y: 50, name: "Giant Jenga",     description: "Edit me: giant Jenga info." },
  { id: "can_jam-1",      type: "can_jam",       x: 70, y: 50, name: "Can Jam",         description: "Edit me: can jam info." },
  { id: "slip_slide-1",   type: "slip_slide",    x: 30, y: 70, name: "Slip and Slide",  description: "Edit me: slip and slide info." },
  { id: "the_island-1",   type: "the_island",    x: 50, y: 70, name: "The Island",      description: "Edit me: placeholder description." }
];
