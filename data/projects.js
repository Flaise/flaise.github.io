const buildOrchestratorExample = `
[project]
schema            = 1
project_name      = Infantry & Arrows
in_dir            = ./src/assets
src_dir           = ./src
out_dir           = ./build/\${mode}
assets_out        = \${out_dir}/assets
tools_dir         = ./tools
color_cold        = #a0e0cc
color_warm        = #f8a677
color_wall        = #e2decd
color_floor_light = #605953
color_floor_dark  = #333a32

[mode:clean]
[mode:default]
[mode:release]
[mode:web]
implies_mode = release
[mode:itchio]
implies_mode = web
[mode:serve]
implies_mode = default

[stage:clean]
[stage:install]
after = stage:clean
[stage:preprocess]
after = stage:install
when_exclude = mode:clean
[stage:compile]
after = stage:preprocess
[stage:bundle]
after = stage:compile
[stage:serve]
after = stage:bundle

# --- LOCAL WEB SERVER
[job:local_server]
:when       = stage:serve,mode:serve
:parameters = arg_list
:command    = python -m http.server
directory   = \${out_dir}
bind        = 127.0.0.1
:positional = 8000
:stream=

# --- CLEAN
[job:clean_all]
:when = stage:clean,mode:clean
:parameters = arg_list
:command    = \${tools_dir}/clean_dir.py
path        = ./build

[job:delete_temporaries]
:when         = stage:clean
:when_exclude = mode:clean
:parameters   = arg_list
:command      = \${tools_dir}/clean_dir.py
path          = \${out_dir}

# --- INSTALL
[job:pip_install]
:when       = stage:install
:parameters = arg_list
:command    = pip install -r ./requirements.txt

[job:npm_install]
:when       = stage:install,mode:release
:parameters = arg_list
:command    = npm install

## example of how to make sure a directory exists if no other tools touch it
#[job:ensure_dist_dir]
#:when         = stage:install
#:parameters   = arg_list
#:command      = mkdir
#:positional   = -p \${dist_dir}

# --- PREPROCESS
[job:infantry_warm]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_colorize.py
input       = \${in_dir}/infantry3.png
output      = \${assets_out}/infantry_warm.webp
color       = \${color_warm}

[job:infantry_cold]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_colorize.py
input       = \${in_dir}/infantry3.png
output      = \${assets_out}/infantry_cold.webp
color       = \${color_cold}
# optional tweaks:
# gamma      = 0.9
# sat        = 0.8
# min_v      = 0.1

[job:archer_warm]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_colorize.py
input       = \${in_dir}/archer1.png
output      = \${assets_out}/archer_warm.webp
color       = \${color_warm}

[job:archer_cold]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_colorize.py
input       = \${in_dir}/archer1.png
output      = \${assets_out}/archer_cold.webp
color       = \${color_cold}

[job:background]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_convert.py
input       = \${in_dir}/background2.png
output      = \${assets_out}/background.webp

[job:favicon]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_convert.py
input       = \${in_dir}/favicon1.png
output      = \${out_dir}/favicon.ico

[job:frame]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_convert.py
input       = \${in_dir}/frame1.png
output      = \${assets_out}/frame.webp

[job:wall]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_colorize.py
input       = \${in_dir}/wall2.png
output      = \${assets_out}/wall.webp
color       = \${color_wall}

[job:floor_light]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_colorize.py
input       = \${in_dir}/floor3.png
output      = \${assets_out}/floor_light.webp
color       = \${color_floor_light}

[job:floor_dark]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/image_colorize.py
input       = \${in_dir}/floor4.png
output      = \${assets_out}/floor_dark.webp
color       = \${color_floor_dark}

[job:copy_js]
:when       = stage:preprocess,mode:default
:parameters = arg_list
:command    = \${tools_dir}/copy_files.py
sources     = \${src_dir}/index.html
target      = \${out_dir}

[job:minify_html]
:when         = stage:preprocess,mode:release
:parameters   = arg_list
:command      = npx html-minifier-terser \${src_dir}/index.html -o \${out_dir}/index.html
collapse-whitespace=
remove-comments=
remove-optional-tags=
minify-css=
minify-js=

[job:copy_music]
:when       = stage:preprocess
:parameters = arg_list
:command    = \${tools_dir}/copy_files.py
sources     = \${in_dir}/music.ogg
target      = \${assets_out}

# --- BUNDLE (web/itchio)
[job:pack_zip]
:when       = stage:bundle,mode:web
:parameters = arg_list
:command    = \${tools_dir}/zip_dir.py
source      = \${out_dir}
target      = ./releases/\${project_name}_\${gitdescribe}.zip
`;

const infiltrateScriptExcerpt = `
/ Intro bit where she talks to the door
TRIGGER
ONCE
DELAY .1
FADEIN .2
AUDIOLOOP ambience_shower
AUDIOFADE ambience_shower .5
AUDIOFADE ambience_shower .5 5
DELAY 3
AUDIOSTART door_locked_chapel
AUDIOFADE door_locked_chapel .9
ANIMATE door_chapel2 last
DELAY 3
AUDIOSTART door_jiggle_chapel
AUDIOFADE door_jiggle_chapel .9
ANIMATE door_chapel2 first
ANIMATE door_chapel2 last
ANIMATE door_chapel2 first
ANIMATE door_chapel2 last
ANIMATE door_chapel2 first
ANIMATE door_chapel2 last
DELAY 1.6
LEFT 1:(Huh. I guess it actually makes sense that they'd start locking the chapel door at night, after I... yeah.)
LEFT 2:(But that doesn't throw the plan off TOO much! I just need to find another way into the chapel.)
LEFT 3:(Time to be a clever thief.)
DELAY .1
CONTROLS

TRIGGER
ONCE begin_weregilding
POSITION 928 1252 60 20
AUDIOLOOP weregilded1
AUDIOFADE weregilded1 .7

TRIGGER
ONCE begin_weregilding
POSITION 925 1278 65 19
AUDIOLOOP weregilded1
AUDIOFADE weregilded1 .7

TRIGGER
ONCE begin_weregilding
POSITION 911 1259 40 33
AUDIOLOOP weregilded1
AUDIOFADE weregilded1 .7

TRIGGER
ONCE begin_weregilding
POSITION 960 1258 46 38
AUDIOLOOP weregilded1
AUDIOFADE weregilded1 .7


/ Trying to open the chapel door
TRIGGER
DESTINATION 942 1229 33 40
POSITION 930 1257 54 17
ONCE pick_chapel
LEFT 85:(Stephane gave me the key to the chapel undercroft, not the front door. He must not have known it'd be locked.)
LEFT 4:(Alright, lockpick. It's time to shine.)
CANTUNLOCK door_background_2 door_foreground_2 hand_lockpick
LEFT 5:(...I'm not sure why I expected a lockpick to be as simple as a regular key.)
SET mention_stephane
`;

window.projects = [
  {
    order: 1,
    visibility: "featured",
    slug: "skid-html5-engine",
    title: "Skid: HTML5 Game Engine",
    role: "Programmer",
    year: "2014-2025",
    type: "Tool",
    blurb: "Lightweight HTML5/Node 2D engine built around event-driven data flow. Integrates rendering, tweening, and asset loading in a single clear architecture.",
    stack: ["JavaScript", "HTML5 Canvas", "Howler.js"],
    tags: ["Web", "Engine", "API design"],
    thumb: "./images/skid_hero.png",
    links: { repo: "https://github.com/Flaise/skid", npm: "https://www.npmjs.com/package/skid" },
    highlights: [
      "Goal: Deliver small 2D games efficiently without the overhead of large frameworks.",
      "Approach: Event-driven, single-state architecture with integrated scene graph, tweening, and preloading. Layered nodes represent transforms, sprites, and vector shapes rendered over HTML5 Canvas.",
      "Outcome: A refined framework used across multiple releases. Provides clear modular boundaries, deterministic timing, and a dependable base for compact 2D titles."
    ],
    description: [
      "Skid is a lightweight 2D framework that models an entire game as one evolving data structure. Each module registers event handlers instead of inheriting from shared classes, keeping behavior explicit and decoupled.",
      "The engine’s scene graph supports layered composition—sprites, vector primitives, and transform nodes for scale, rotation, and transparency. Animation is handled by a built-in tween system that updates just before each render pass. Assets and audio share the same event pipeline, emitting standardized 'load' and 'load_done' signals to synchronize startup.",
      "The result is an engine that emphasizes clarity and composability: modules can be added or removed without side effects, and systems remain easy to reason about even as complexity grows. Developed and maintained over many years of active use, Skid remains a compact, expressive, and reliable foundation for 2D games."
    ],
    related: ["spacelaser"],
    gallery: [
      { type: "image", src: "./images/spacelaser_screenshot01.png", alt: "Project" },
      { type: "image", src: "./images/skid_screenshot01.png", alt: "Project" },
      { type: "image", src: "./images/skid_screenshot02.png", alt: "Project" },
      { type: "image", src: "./images/skid_screenshot03.png", alt: "Project" },
    ]
  },
  {
    order: 2,
    visibility: "featured",
    slug: "panda-push",
    title: "Panda Push on Steam",
    role: "Programmer • 2D artist",
    year: "2008?-2021",
    type: "Game",
    blurb: "Custom Rust-built multiplayer game on Steam: grid-based team combat with building, pushing, and emergent strategy uniting action and territory control.",
    stack: ["Rust", "SDL2", "NanoVG", "Steamworks", "TCP", "Piston Texture Packer"],
    tags: ["Multiplayer", "Engine", "2D Art"],
    thumb: "./images/pandapush_hero.png",
    links: { steam: "https://store.steampowered.com/app/1630820/Panda_Push/", trailer: "", site: "" },
    highlights: [
      "Goal: Create a deterministic, team-based action-strategy game where individual duels and large-scale territory play coexist within one continuous system.",
      "Approach: Rust gameplay layer atop SDL2, NanoVG, and Steamworks. Custom tools extend the Piston ecosystem to extract layered vector art from SVGs and pack it into metadata-rich texture atlases.",
      "Outcome: Commercial Steam release demonstrating a stable multiplayer architecture, integrated art pipeline, and an original design unifying action and emergent strategy."
    ],
    description: [
      "Panda Push fuses the intensity of a fighting game with the structure of territorial control. Players spend energy to move, push, and build on a shared grid—simple mechanics that combine into deep positional play. Each interaction shapes the environment, turning small tactical choices into large-scale strategy that can scale from duels to team matches.",
      "The result is a continuous spectrum of play where individual reflexes, teamwork, and map control interlock, producing tactical behaviors that resemble Go or Chess more than traditional arena games.",
      "The engine uses SDL2 and NanoVG for rendering and input, with gameplay and networking layers written in Rust for determinism and low latency. Vector assets are sourced from multi-layer SVGs, parsed into a unified texture atlas with automatic registration data for precise alignment.",
      "After earlier prototypes in Python, Java, and JavaScript, this version achieved commercial reliability and released on Steam as a complete, self-built multiplayer title."
    ],
    related: [],
    gallery: [
      { type: "image", src: "./images/pandapush_screenshot01.jpg", alt: "Gameplay" },
      { type: "image", src: "./images/pandapush_screenshot02.jpg", alt: "Gameplay" },
      { type: "image", src: "./images/pandapush_screenshot03.jpg", alt: "Gameplay" },
      { type: "video", src: "https://youtu.be/Eg0QULYLM28?si=fITLVi0T2lMmSlq2", title: "Team Gameplay Highlights" },
    ]
  },
  {
    order: 3,
    visibility: "featured",
    slug: "infiltrate",
    title: "Infiltrate: Interactive sequence from Prequel Adventure",
    role: "Programmer",
    year: "2017",
    type: "Game",
    blurb: "Nonlinear interactive scene powered by a refactored Flash engine and a declarative DSL for authoring complex triggers and animations.",
    stack: ["Flash"],
    tags: ["Web", "Domain Specific Language"],
    thumb: "./images/infiltrate_hero2.png",
    links: { play: "https://www.prequeladventure.com/2017/09/katia-infiltrate/" },
    highlights: [
      "Goal: Deliver a stable, readable, and extensible version of Prequel’s interactive Flash engine for a major nonlinear sequence.",
      "Approach: Untangled the inherited Excelsior engine, rebuilt most systems except movement/UI, and introduced a compact DSL for scene logic, triggers, audio, and animation.",
      "Outcome: Shipped a long interactive chapter with zero post-launch bug reports; the DSL enabled extensive content authoring without engineering bottlenecks."
    ],
    description: [
      "Infiltrate is the largest interactive sequence from Prequel Adventure, built on a legacy Flash engine that had grown through many feature additions. When I took over engineering, much of the behavior was inconsistent and difficult to extend. Movement and dialogue worked reliably, but most other systems needed restructuring before the next project could be completed.",
      "I focused on stabilizing the engine and making it author-friendly. I rebuilt most subsystems, removed interdependencies, and replaced the original data-loading approach with a small DSL designed around the actual semantics of scene scripting. The writer-artist could define positional triggers, delays, animations, audio loops and fades, AND/OR conditions, and gated interactions in a format that matched narrative logic rather than engine internals. This supported a much larger script than expected and allowed content to be produced quickly without engineering involvement.",
      "The sequence shipped cleanly and ran for years without bug reports until Flash support ended. Engineering never became the bottleneck; once the tools were in place, the pacing was governed by asset production. The chapter was widely played by the comic’s audience and now remains as a recorded playthrough with tens of thousands of views."
    ],
    related: [],
    gallery: [
      { type: "video", src: "https://www.youtube.com/watch?v=3ye5nHDe9qI", title: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot01.png", alt: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot02.png", alt: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot03.png", alt: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot04.png", alt: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot05.png", alt: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot06.png", alt: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot07.png", alt: "Gameplay" },
      { type: "image", src: "./images/infiltrate_screenshot08.png", alt: "Gameplay" }
    ],
    "examples": [
      {
        "title": "Excerpt from one of the scripts used in Infiltrate. Notice how it's accessible to non-technical users:",
        "language": "DSL",
        "code": infiltrateScriptExcerpt,
      }
    ]
  },
  {
    order: 4,
    visibility: "featured",
    slug: "spacelaser",
    title: "Spacelaser: multiplayer web game",
    role: "Full-stack (Rust/JS)",
    year: "2025",
    type: "Game",
    blurb: "Ships link up to form lasers; players and simple AI duel in realtime. Rust server simulation + JS client stay responsive even on a small VPS.",
    stack: ["Rust", "JavaScript", "VPS", "Skid", "Websocket", "Debian"],
    tags: ["Web", "Realtime", "Networking", "AI"],
    thumb: "./images/spacelaser_hero.png",
    links: { play: "https://spacelaser.online" },
    highlights: [
      "Goal: Ship a complete, low-friction browser arena game that’s instantly playable.",
      "Approach: Geometry-driven beam linking between allies, server-authoritative Rust sim, JS client (based on Skid), and a short in-game tutorial.",
      "Outcome: Deployed an .io title that stays responsive on a small VPS; solo lobbies are filled by a lightweight bot."
    ],
    description: [
      "Spacelaser is a realtime .io arena where allied ships link to form laser beams and try to tag opponents without getting tagged back. Positioning and timing matter: who you link with and the angle you hold changes your reach and risk.",
      "The onboarding is quick—players can learn the controls and objective in seconds and jump straight into a full loop (spawn, skirmish, score, repeat). Visuals are prototype art; most effort went into clean mechanics and round-to-round flow. It looks cooler in motion.",
      "A small geometry-aware bot keeps matches alive when only one player is present. It picks link partners, maintains useful angles, and pursues tags using simple, efficient heuristics driven by fast geometry and state checks—simple, reliable heuristics over complexity.",
      "Under the hood, a server-authoritative Rust simulation runs with compact state updates; the JS client focuses on responsiveness and clear feedback. The whole thing runs comfortably on a small VPS with modest CPU and bandwidth."
    ],
    related: ["skid-html5-engine"],
    gallery: [
      { type: "image", src: "./images/spacelaser_screenshot01.png", alt: "Gameplay" },
      { type: "image", src: "./images/spacelaser_screenshot02.png", alt: "Gameplay" },
      { type: "video", src: "https://www.youtube.com/embed/8YapNebECAc?si=M7iTgMXY5HCI60t7", title: "Prototype Gameplay" }
    ]
  },
  {
    order: 5,
    visibility: "featured",
    slug: "infantry-and-arrows",
    title: "Infantry & Arrows",
    role: "Designer • Programmer",
    year: "2025",
    type: "Game",
    blurb: "Compact turn-based tactics prototype exploring clarity and constraint. Built in pure HTML5 Canvas with reproducible builds and unified touch-desktop input.",
    stack: ["JavaScript", "HTML5 Canvas"],
    tags: ["Web"],
    thumb: "./images/infantryandarrows_cover1.png",
    links: { play: "https://axiswolf.itch.io/infantry-and-arrows" },
    highlights: [
      "Goal: Build a compact turn-based tactics prototype that demonstrates clear interaction, reproducible content, and polished presentation in a minimal codebase.",
      "Approach: Pure HTML5 Canvas with deterministic grid logic, unified touch and mouse input, and a small local build pipeline for asset colorization and packaging.",
      "Outcome: A self-contained, one-map tactics game that plays smoothly on desktop and mobile, proving a clean foundation for future expansion."
    ],
    description: [
      "Infantry & Arrows began as an experiment to find the smallest possible tactics design that still feels deliberate and satisfying. Two unit types create tactical tension through tradeoffs of range, movement, and positioning. Each side moves all units in turn, creating short matches where spatial judgment matters more than randomness or stats.",
      "The project’s emphasis is on readability and flow: simple geometry, subtle hover and touch feedback, and a warm-versus-cool color palette that keeps teams distinct without relying on harsh contrast. The interface works identically across input types, with minimal UI chrome and menus to break the board’s focus.",
      "Technically, the project is structured around a lightweight INI-driven build pipeline that preprocesses and colorizes assets to keep releases consistent. The result is a small, reproducible HTML5 tactics engine that loads quickly, feels responsive, and shows how clear constraints and disciplined design can produce a polished, complete prototype."
    ],
    related: ["python-build-orchestrator"],
    gallery: []
  },
  {
    order: 6,
    visibility: "featured",
    slug: "python-build-orchestrator",
    title: "Build Orchestrator (Python)",
    role: "Programmer",
    year: "2025",
    type: "Tool",
    blurb: "INI-based build runner that automates staged asset and packaging steps; designed for projects needing reproducible builds.",
    stack: ["Python", "INI", "Pillow", "html-minifier-terser"],
    tags: ["Build system", "Pipeline"],
    thumb: "./images/buildtool_hero.png",
    links: { repo: "", docs: "" },
    highlights: [
      "Goal: Ship reproducible build steps and packaging for small projects without relying on heavyweight CI systems.",
      "Approach: Define every job declaratively in INI: explicit inputs, outputs, and arguments with stages for parallel runs and modes for different workflows.",
      "Outcome: The orchestrator builds Infantry & Arrows end-to-end—colorization, preprocessing, packaging—consistently across environments, proving a small binary can replace sprawling script chains."
    ],
    description: [
      "The orchestrator fills the gap between ad-hoc Bash scripts and industrial CI. Each project file expands into a dependency graph inferred from declared inputs and outputs. Jobs within the same stage run concurrently, while stages synchronize sequentially for predictable order.",
      "By separating configuration from execution, it’s easy to inspect or edit without tracing logic across files. Argument order and variable interpolation stay literal, avoiding shell quoting pitfalls. Modes such as debug, release, or web toggle build variants without duplicating work.",
      "For Infantry & Arrows, the tool reduced dozens of manual steps to one repeatable command—colorizing sprites, converting assets, and packaging final releases. The runner and helper scripts together total roughly 40 KB yet deliver the determinism and transparency of a structured build system with almost no ceremony."
    ],
    "examples": [
      {
        "title": "This is the build script used to build Infantry & Arrows:",
        "language": "ini",
        "code": buildOrchestratorExample,
      }
    ],
    related: ["infantry-and-arrows"],
    gallery: []
  },

  /*{
    order: 7,
    visibility: "secondary",
    slug: "vrchat-philosophy-hangout",
    title: "VRChat Philosophy Hangout (published)",
    role: "World builder • Programmer",
    year: "2024-2025",
    type: "vr",
    blurb: "Quest-friendly world with baked interior lighting, exterior walls, conversation prompt cards, and a few easter eggs.",
    stack: ["Unity", "VRChat", "Quest"],
    tags: ["Lighting", "UX", "Optimization"],
    thumb: "https://picsum.photos/seed/philosophy/800/450",
    links: { world: "", video: "" },
    highlights: [
      "Goal: Create an inviting space that looks good on Quest without heavy runtime cost.",
      "Approach: Carefully tuned baked lighting, light exterior, and conversation prompts.",
      "Outcome: Visitors tend to linger; positive informal feedback on look/feel."
    ],
    description: [
      "Published VRChat world focused on feel and legibility on mobile VR. Most work went into baking strategy and tone so it looks good on Quest hardware.",
      "Light exterior, tuned interior, and small prompts encourage conversation. Anecdotally, visitors stay longer than average once invited."
    ],
    related: [],
    gallery: []
  },*/
  {
    order: 8,
    visibility: "secondary",
    slug: "sclan",
    title: "SCLAN: Simple Communication over LAN",
    role: "Programmer",
    year: "2021-2022",
    type: "Tool",
    blurb: "Minimal LAN messenger with automatic peer discovery and a clean TUI. Built in Rust with QUIC; start chatting instantly with no setup or accounts.",
    stack: ["Rust", "qp2p", "tokio", "crossterm", "Terminal", "QUIC"],
    tags: ["Networking", "Terminal"],
    thumb: "./images/sclan_01.png",
    links: { crates: "https://crates.io/crates/sclan", repo: "https://github.com/Flaise/sclan" },
    highlights: [
      "Goal: Instant, private text exchange between machines on the same LAN—no accounts, servers, or setup.",
      "Approach: Pure-Rust terminal chat built on QUIC and UDP broadcast discovery. Peers find each other automatically and connect through a minimal async stack for reliable messaging.",
      "Outcome: A zero-configuration LAN messenger that still sees steady organic downloads years after release, valued for being small, transparent, and immediately usable."
    ],
    description: [
      "SCLAN began as a way to pass notes and small snippets between computers on a home network without routing anything through external services. Once launched, it announces itself via IPv4 broadcast packets on a fixed port; peers appear automatically and can chat right away.",
      "Under the hood, it uses tokio for async networking, qp2p for QUIC-based reliability, and crossterm for a clean TUI. There’s no configuration file or command-line parsing—just run `sclan`, pick a peer with Tab, and start typing. The display shows hostnames, timestamps, and color-coded messages in a layout that stays readable even on small terminals.",
      "The project has been live on crates.io since March 2022 with thousands of organic downloads. At almost 1.4K SLOC, it demonstrates how a self-discovering, zero-config network tool can remain lean and maintainable while still feeling polished and friendly to use."
    ],
    related: [],
    gallery: []
  },
  {
    order: 9,
    visibility: "secondary",
    slug: "semicoroutine-js",
    title: "semicoroutine.js",
    role: "Library author",
    year: "2015-2016",
    type: "Tool",
    blurb: "Generator-based async control flow from the pre-async/await era — readable yield syntax for serial/parallel steps, used in production and still installed in legacy stacks.",
    stack: ["JavaScript", "Generator functions", "babel"],
    tags: ["Library", "Async"],
    thumb: "./images/semicoroutine_hero.png",
    links: { repo: "https://github.com/Flaise/semicoroutine.js", npm: "https://www.npmjs.com/package/semicoroutine" },
    highlights: [
      "Goal: Make asynchronous JS readable before async/await was widely available.",
      "Approach: Treat generator functions as async flows, using yield for serial and parallel steps with automatic error propagation.",
      "Outcome: Adopted in production at a former employer; continues to see light npm usage in legacy and constrained environments."
    ],
    description: [
      "semicoroutine.js lets engineers write asynchronous code as linear generator flows. A yield fn() step runs serial work; yield [fnA(), fnB()] or yield {a: fnA(), b: fnB()} kicks off parallel work and collects results. Errors thrown within yielded operations bubble naturally through the generator and can be handled with ordinary try/catch, so code uses one familiar syntax for both results and failures. For Node callbacks, an adapt(fn) helper wraps CPS functions so they drop into the same pattern.",
      "This shipped before async/await was broadly available and flattened callback pyramids in a production codebase. Today, native async/await is the right choice for new projects, but the package remains a practical bridge in legacy stacks pinned to generator-only ES6 tooling."
    ],
    related: ["mytacism"],
    gallery: []
  },
  {
    order: 10,
    visibility: "secondary",
    slug: "desert-digger",
    title: "Desert Digger (Palette Jam 2)",
    role: "Designer • Programmer",
    year: "2022",
    type: "Game",
    blurb: "Isometric Unity jam game about gathering, crafting, and dodging dragons—built in days with a small team and shipped as a WebGL release.",
    stack: ["Unity"],
    tags: ["Game jam", "Isometric", "Team"],
    thumb: "./images/desertdigger_hero.png",
    links: { play: "https://flaise.itch.io/desert-digger", video: "" },
    highlights: [
      "Goal: Ship a complete, playable jam game with clear mechanics and a finished presentation.",
      "Approach: Focus on one self-contained loop—gather, craft, survive, return—built in Unity for both desktop and browser.",
      "Outcome: Delivered a stable WebGL release within the jam deadline, showcasing coordinated teamwork and strong art–code integration."
    ],
    description: [
      "Built for Palette Jam 2, Desert Digger is a slow-paced isometric game about collecting materials, crafting tools, and avoiding dragon bites while navigating a desert maze. Each level ends with the player returning to the sofa—a light narrative loop that ties the game’s objectives together.",
      "I led the project as designer, programmer, and team coordinator, defining scope and pacing while collaborating with one additional programmer, a 2D artist/animator, and a composer. The result is a visually cohesive, mechanically complete jam entry that demonstrates focus, iteration, and delivery under tight time limits."
    ],
    related: [],
    gallery: [
      { type: "image", src: "./images/desertdigger_screenshot01.png", alt: "Gameplay" },
      { type: "image", src: "./images/desertdigger_screenshot02.png", alt: "Gameplay" },
    ]
  },
  {
    order: 11,
    visibility: "secondary",
    slug: "mytacism",
    title: "mytacism.js: AST constant folding",
    role: "Library author",
    year: "2015-2016",
    type: "Tool",
    blurb: "Early experiment in JavaScript AST analysis—folds constants and inlines pure functions at build time, anticipating modern bundler optimizations.",
    stack: ["JavaScript", "recast", "babel"],
    tags: ["Optimizer", "Build system"],
    thumb: "./images/mytacism_hero.png",
    links: { repo: "https://github.com/Flaise/mytacism", npm: "https://www.npmjs.com/package/mytacism" },
    highlights: [
      "Goal: Explore compile-time optimization in JavaScript by evaluating constants and inlining pure expressions at build time.",
      "Approach: Parse source code to an AST using recast and babel, fold constant expressions, and selectively execute whitelisted functions for static replacement.",
      "Outcome: A focused experiment in language tooling that predated modern bundlers—demonstrating an early interest in compiler-style analysis later applied in Rust-based tools."
    ],
    description: [
      "Mytacism was built to see how far JavaScript could be pushed toward ahead-of-time computation. It analyzes expression trees, computes deterministic results, and rewrites the source with resolved constants. Safe evaluation was limited to explicitly provided values and pure functions, giving developers controlled constant folding before Rollup or Vite offered similar optimizations.",
      "Although quickly surpassed by modern bundlers, the project served as a hands-on introduction to AST transforms and static evaluation—techniques that later informed more robust build and packaging work."
    ],
    related: ["semicoroutine-js"],
    gallery: []
  }
];
