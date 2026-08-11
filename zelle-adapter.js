/*
  Zelle Specialist Adapter
  Version: 0.1.0
  Architecture: Noema -> NAIB -> Zelle

  Zelle is a guest-facing creative guide.
  This adapter is intentionally handoff-only.
  It does not grant permissions, perform remote execution,
  persist conversation history, or claim ownership of ecosystem resources.
*/

const MODES = Object.freeze([
  "explore",
  "visual",
  "story",
  "writing",
  "music",
  "photography",
  "mixed-media",
  "creative-block"
]);

const RESOURCE_HINTS = Object.freeze([
  {
    id: "bazaar-art",
    label: "Bazaar Art",
    purposes: [
      "art", "visual", "paint", "painting", "drawing", "canvas",
      "color", "composition", "mixed-media", "gallery", "photography"
    ]
  },
  {
    id: "the-refrain",
    label: "The Refrain",
    purposes: [
      "music", "song", "songwriting", "lyrics", "melody",
      "rhythm", "composition", "listening"
    ]
  },
  {
    id: "arshif",
    label: "ARSHIF",
    purposes: [
      "archive", "history", "culture", "reference", "symbol",
      "symbolism", "literature", "inspiration", "context"
    ]
  },
  {
    id: "aurora",
    label: "Aurora",
    purposes: [
      "reflection", "mood", "emotion", "journal", "imagery",
      "symbolism", "inspiration", "creative-reflection"
    ]
  },
  {
    id: "prose",
    label: "PROSE / ProReSources",
    purposes: [
      "write", "writing", "edit", "editing", "draft", "story",
      "script", "poem", "prose", "language"
    ]
  },
  {
    id: "creative-spark",
    label: "Creative Spark",
    purposes: [
      "idea", "prompt", "stuck", "block", "spark", "theme",
      "symbol", "style", "experiment", "begin"
    ]
  },
  {
    id: "arcade",
    label: "Arcade",
    purposes: [
      "game", "play", "interactive", "creative-game",
      "experiment", "challenge", "playful"
    ]
  },
  {
    id: "khaemenes",
    label: "Khaemenes Academy",
    purposes: [
      "learn", "learning", "student", "class", "lesson",
      "art-lesson", "creative-study", "education"
    ]
  }
]);

const BOUNDARIES = Object.freeze([
  "no-administrative-authority",
  "no-permission-elevation",
  "no-system-wide-creative-director-authority",
  "no-resource-ownership-claims",
  "no-impersonation",
  "no-silent-long-term-memory",
  "preserve-user-authorship",
  "no-remote-execution-claims"
]);

function normalize(value = "") {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeMode(value = "explore") {
  const mode = normalize(value);
  return MODES.includes(mode) ? mode : "explore";
}

function scoreResource(resource, text) {
  return resource.purposes.reduce(
    (score, term) => score + (text.includes(term) ? 1 : 0),
    0
  );
}

function rankResourceHints(message = "") {
  const text = normalize(message);

  return RESOURCE_HINTS
    .map(resource => ({
      id: resource.id,
      label: resource.label,
      score: scoreResource(resource, text)
    }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
}

function chooseResourceHints(message = "", limit = 3) {
  const ranked = rankResourceHints(message);
  const positive = ranked.filter(item => item.score > 0);
  return (positive.length ? positive : ranked).slice(0, limit);
}

function buildCreativeFrame(message, mode) {
  const frames = {
    explore:
      "Offer a few inviting possibilities and let the creator choose what feels alive.",
    visual:
      "Look for image, color, composition, material, contrast, and visual rhythm without prescribing a finished result.",
    story:
      "Find the character, image, tension, or question that can become an approachable doorway into the story.",
    writing:
      "Support the creator's own language, voice, structure, and intent rather than rewriting the work into Zelle's voice.",
    music:
      "Explore mood, rhythm, imagery, lyric direction, and sonic possibility without claiming authorship.",
    photography:
      "Explore light, framing, subject, perspective, atmosphere, and sequence as possibilities rather than rules.",
    "mixed-media":
      "Look for useful collisions between materials, media, texture, image, sound, text, and found objects.",
    "creative-block":
      "Reduce the next step until beginning feels possible; uncertainty is part of making."
  };

  return {
    mode,
    principle: frames[mode],
    sourceText: message
  };
}

export const ZelleAdapter = Object.freeze({
  id: "zelle",
  name: "Zelle",
  version: "0.1.0",

  capabilities: Object.freeze([
    "creative-intake",
    "idea-exploration",
    "visual-art-guidance",
    "color-and-composition-guidance",
    "photography-guidance",
    "storytelling-support",
    "creative-writing-support",
    "music-and-song-ideation",
    "mixed-media-exploration",
    "symbolism-and-theme-exploration",
    "creative-block-support",
    "prompt-development",
    "structured-resource-handoff"
  ]),

  availability: "handoff-ready",
  authority: "creative-guidance-and-resource-handoff",
  boundaries: BOUNDARIES,

  canExecute() {
    return {
      allowed: false,
      reason: "handoff-ready-specialist",
      note:
        "Zelle can prepare creative guidance and resource handoffs, but does not execute remote resources or control ecosystem repositories."
    };
  },

  prepare(context = {}) {
    const message = String(context.message ?? context.query ?? "");
    const mode = normalizeMode(context.mode);
    const resourceHints = chooseResourceHints(message);

    return {
      specialist: "zelle",
      version: "0.1.0",
      status: "prepared",
      mode,
      creativeFrame: buildCreativeFrame(message, mode),
      resourceHints,
      requiresUserAction: true,
      requiresFederationResolution: true,
      authority: this.authority,
      boundaries: [...BOUNDARIES],
      memory: {
        persistent: false,
        note:
          "The adapter does not silently store conversation history or long-term personal memory."
      },
      authorship: {
        owner: "user",
        principle:
          "Offer possibilities without taking the work, decision, or creative identity away from the creator."
      },
      resourceRelationship: {
        role: "navigator",
        ownsResources: false,
        controlsResources: false,
        note:
          "Zelle may understand and suggest creative ecosystem resources, but Noema's approved federation resolves authoritative destinations."
      },
      note:
        "Resource hints are identifiers only. Noema's approved resource federation should resolve authoritative destinations."
    };
  },

  async execute(context = {}) {
    return {
      specialist: "zelle",
      version: "0.1.0",
      status: "handoff-required",
      executed: false,
      prepared: this.prepare(context),
      note:
        "No external action was executed. User action and/or an approved Noema resource handoff is required."
    };
  }
});

export function getZelleResourceHints(message = "", limit = 3) {
  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || 3, RESOURCE_HINTS.length)
  );
  return chooseResourceHints(message, safeLimit);
}

export function getZelleModes() {
  return [...MODES];
}

export default ZelleAdapter;
