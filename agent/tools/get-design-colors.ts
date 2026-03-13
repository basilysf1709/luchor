import { z } from "zod";
import { defineTool } from "../define-tool.ts";

type PaletteScale = Record<string, string>;

type DesignPalette = {
  foundation: "white-100" | "white-99" | "white-98";
  neutrals: {
    background: string;
    frame: string;
    panel: string;
    elevated: string;
    overlay: string;
  };
  stroke: {
    subtle: string;
    strong: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  button: {
    ghost: string;
    secondary: string;
    primary: string;
    primaryText: string;
  };
  accent: PaletteScale;
  semantic: {
    success: PaletteScale;
    warning: PaletteScale;
    error: PaletteScale;
    info: PaletteScale;
  };
  chart: string[];
  darkMode: {
    neutrals: {
      background: string;
      frame: string;
      panel: string;
      elevated: string;
      overlay: string;
    };
    stroke: {
      subtle: string;
      strong: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    button: {
      ghost: string;
      secondary: string;
      primary: string;
      primaryText: string;
    };
    accent: PaletteScale;
  };
};

const semanticScales = {
  success: {
    "100": "#ebfff3",
    "300": "#8be0ae",
    "500": "#28b463",
    "600": "#1f9952",
    "700": "#197742",
  },
  warning: {
    "100": "#fff7e8",
    "300": "#ffd08a",
    "500": "#f59e0b",
    "600": "#d97706",
    "700": "#b45309",
  },
  error: {
    "100": "#fff0f0",
    "300": "#f5a2a7",
    "500": "#e5484d",
    "600": "#c4383f",
    "700": "#9f2d32",
  },
  info: {
    "100": "#edf6ff",
    "300": "#90c2ff",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
  },
} as const;

const chartPalette = [
  "#4f7cff",
  "#00a7a0",
  "#39b86f",
  "#b3a100",
  "#f08a24",
  "#e05a7a",
  "#7a89ff",
  "#6e8b3d",
];

const paletteDictionary: Record<
  string,
  {
    foundation: DesignPalette["foundation"];
    rationale: string;
    neutrals: DesignPalette["neutrals"];
    stroke: DesignPalette["stroke"];
    text: DesignPalette["text"];
    button: DesignPalette["button"];
    accent: PaletteScale;
    darkMode: DesignPalette["darkMode"];
  }
> = {
  neutral: {
    foundation: "white-99",
    rationale:
      "A balanced neutral system for product UI with a 99% white background and slightly darker supporting layers.",
    neutrals: {
      background: "#fcfcfd",
      frame: "#f7f7f8",
      panel: "#f2f2f3",
      elevated: "#ffffff",
      overlay: "#ededee",
    },
    stroke: {
      subtle: "#d9d9dd",
      strong: "#c7c8ce",
    },
    text: {
      primary: "#1f2328",
      secondary: "#3d4652",
      tertiary: "#687180",
    },
    button: {
      ghost: "#f2f2f3",
      secondary: "#ebebed",
      primary: "#111318",
      primaryText: "#ffffff",
    },
    accent: {
      "100": "#eef4ff",
      "300": "#a8c3ff",
      "400": "#7da6ff",
      "500": "#4f7cff",
      "600": "#325ee8",
      "700": "#294cc0",
    },
    darkMode: {
      neutrals: {
        background: "#0c0d10",
        frame: "#121419",
        panel: "#181b21",
        elevated: "#20242b",
        overlay: "#272c35",
      },
      stroke: {
        subtle: "#313742",
        strong: "#444c59",
      },
      text: {
        primary: "#f5f7fa",
        secondary: "#d5dbe3",
        tertiary: "#9ca6b5",
      },
      button: {
        ghost: "#181b21",
        secondary: "#20242b",
        primary: "#f5f7fa",
        primaryText: "#111318",
      },
      accent: {
        "100": "#15213b",
        "300": "#5377ca",
        "400": "#7294f2",
        "500": "#90afff",
        "600": "#a7c0ff",
        "700": "#bed0ff",
      },
    },
  },
  notion: {
    foundation: "white-100",
    rationale:
      "A warm, paper-like neutral system with pure white content surfaces and soft supporting layers.",
    neutrals: {
      background: "#ffffff",
      frame: "#f7f6f3",
      panel: "#f1efeb",
      elevated: "#ffffff",
      overlay: "#ebe7df",
    },
    stroke: {
      subtle: "#ddd8ce",
      strong: "#cfc8bc",
    },
    text: {
      primary: "#22201c",
      secondary: "#4a453d",
      tertiary: "#746d62",
    },
    button: {
      ghost: "#f1efeb",
      secondary: "#ebe7df",
      primary: "#22201c",
      primaryText: "#ffffff",
    },
    accent: {
      "100": "#eef5ff",
      "300": "#adc9ff",
      "400": "#7faaf8",
      "500": "#5b8def",
      "600": "#4572d5",
      "700": "#3559ae",
    },
    darkMode: {
      neutrals: {
        background: "#10100f",
        frame: "#171614",
        panel: "#201e1b",
        elevated: "#292622",
        overlay: "#322f2a",
      },
      stroke: {
        subtle: "#3d3933",
        strong: "#575146",
      },
      text: {
        primary: "#f4efe7",
        secondary: "#d6cfc4",
        tertiary: "#a69d90",
      },
      button: {
        ghost: "#201e1b",
        secondary: "#292622",
        primary: "#f4efe7",
        primaryText: "#22201c",
      },
      accent: {
        "100": "#152033",
        "300": "#567bc9",
        "400": "#7095eb",
        "500": "#89adff",
        "600": "#9dc0ff",
        "700": "#bad3ff",
      },
    },
  },
  vercel: {
    foundation: "white-98",
    rationale:
      "A sharper, higher-contrast foundation inspired by Vercel's restrained neutral system.",
    neutrals: {
      background: "#fafafa",
      frame: "#f3f3f3",
      panel: "#ededed",
      elevated: "#ffffff",
      overlay: "#e4e4e7",
    },
    stroke: {
      subtle: "#d4d4d8",
      strong: "#bdbdc2",
    },
    text: {
      primary: "#18181b",
      secondary: "#3f3f46",
      tertiary: "#71717a",
    },
    button: {
      ghost: "#ededed",
      secondary: "#e4e4e7",
      primary: "#111111",
      primaryText: "#ffffff",
    },
    accent: {
      "100": "#fff1f1",
      "300": "#ffb0b0",
      "400": "#ff8b8b",
      "500": "#ff5c5c",
      "600": "#eb3d3d",
      "700": "#c42e2e",
    },
    darkMode: {
      neutrals: {
        background: "#09090b",
        frame: "#111113",
        panel: "#18181b",
        elevated: "#202024",
        overlay: "#27272d",
      },
      stroke: {
        subtle: "#323238",
        strong: "#45454f",
      },
      text: {
        primary: "#fafafa",
        secondary: "#e4e4e7",
        tertiary: "#a1a1aa",
      },
      button: {
        ghost: "#18181b",
        secondary: "#202024",
        primary: "#fafafa",
        primaryText: "#111111",
      },
      accent: {
        "100": "#351818",
        "300": "#b15050",
        "400": "#df7272",
        "500": "#ff8e8e",
        "600": "#ffaaaa",
        "700": "#ffc3c3",
      },
    },
  },
  linear: {
    foundation: "white-99",
    rationale:
      "A cool neutral foundation with a clear blue accent ramp suited for polished software interfaces.",
    neutrals: {
      background: "#fcfcfe",
      frame: "#f6f7fb",
      panel: "#eff1f7",
      elevated: "#ffffff",
      overlay: "#e7eaf3",
    },
    stroke: {
      subtle: "#d7dcea",
      strong: "#c3cae0",
    },
    text: {
      primary: "#171b2a",
      secondary: "#364056",
      tertiary: "#66718a",
    },
    button: {
      ghost: "#eff1f7",
      secondary: "#e7eaf3",
      primary: "#4258ff",
      primaryText: "#ffffff",
    },
    accent: {
      "100": "#eef4ff",
      "300": "#a8c3ff",
      "400": "#7da6ff",
      "500": "#4f7cff",
      "600": "#325ee8",
      "700": "#294cc0",
    },
    darkMode: {
      neutrals: {
        background: "#0b0e17",
        frame: "#101523",
        panel: "#171d2d",
        elevated: "#20283c",
        overlay: "#283149",
      },
      stroke: {
        subtle: "#313c55",
        strong: "#44516d",
      },
      text: {
        primary: "#f5f7ff",
        secondary: "#d5dcf3",
        tertiary: "#99a6ca",
      },
      button: {
        ghost: "#171d2d",
        secondary: "#20283c",
        primary: "#8e9cff",
        primaryText: "#0b0e17",
      },
      accent: {
        "100": "#15213b",
        "300": "#5377ca",
        "400": "#7294f2",
        "500": "#90afff",
        "600": "#a7c0ff",
        "700": "#bed0ff",
      },
    },
  },
  supabase: {
    foundation: "white-99",
    rationale:
      "A slightly cool product palette paired with a vivid green accent for data and developer tooling.",
    neutrals: {
      background: "#fcfdfc",
      frame: "#f5f7f5",
      panel: "#eef2ee",
      elevated: "#ffffff",
      overlay: "#e5ebe5",
    },
    stroke: {
      subtle: "#d2dcd2",
      strong: "#becbbb",
    },
    text: {
      primary: "#18221b",
      secondary: "#334238",
      tertiary: "#637268",
    },
    button: {
      ghost: "#eef2ee",
      secondary: "#e5ebe5",
      primary: "#22c55e",
      primaryText: "#08110b",
    },
    accent: {
      "100": "#ecfff4",
      "300": "#8fe0ae",
      "400": "#5dd88b",
      "500": "#22c55e",
      "600": "#16a34a",
      "700": "#15803d",
    },
    darkMode: {
      neutrals: {
        background: "#0a0f0b",
        frame: "#101712",
        panel: "#162019",
        elevated: "#1d2a22",
        overlay: "#243429",
      },
      stroke: {
        subtle: "#2f4234",
        strong: "#44604a",
      },
      text: {
        primary: "#effbf2",
        secondary: "#d0e6d5",
        tertiary: "#95b09d",
      },
      button: {
        ghost: "#162019",
        secondary: "#1d2a22",
        primary: "#53dd88",
        primaryText: "#08110b",
      },
      accent: {
        "100": "#163323",
        "300": "#3fa867",
        "400": "#54c779",
        "500": "#71e08f",
        "600": "#96ecaa",
        "700": "#b9f5c7",
      },
    },
  },
  mercury: {
    foundation: "white-99",
    rationale:
      "A slightly blue-biased neutral system for interfaces that use a softly tinted frame or sidebar.",
    neutrals: {
      background: "#fbfcfe",
      frame: "#f3f6fb",
      panel: "#ecf0f8",
      elevated: "#ffffff",
      overlay: "#e3e9f4",
    },
    stroke: {
      subtle: "#d3dceb",
      strong: "#c0cbe0",
    },
    text: {
      primary: "#182132",
      secondary: "#34425b",
      tertiary: "#627189",
    },
    button: {
      ghost: "#ecf0f8",
      secondary: "#e3e9f4",
      primary: "#1f4fff",
      primaryText: "#ffffff",
    },
    accent: {
      "100": "#eef3ff",
      "300": "#a8bfff",
      "400": "#7b9fff",
      "500": "#4f7cff",
      "600": "#315de9",
      "700": "#284abf",
    },
    darkMode: {
      neutrals: {
        background: "#0b0f16",
        frame: "#101723",
        panel: "#17202f",
        elevated: "#1f2b3e",
        overlay: "#26344a",
      },
      stroke: {
        subtle: "#314057",
        strong: "#475976",
      },
      text: {
        primary: "#f2f6ff",
        secondary: "#d3ddf2",
        tertiary: "#98a8c5",
      },
      button: {
        ghost: "#17202f",
        secondary: "#1f2b3e",
        primary: "#88a5ff",
        primaryText: "#0b0f16",
      },
      accent: {
        "100": "#162441",
        "300": "#5578d0",
        "400": "#7195f2",
        "500": "#8eaefc",
        "600": "#a8c1ff",
        "700": "#c4d4ff",
      },
    },
  },
};

const toolInput = z.object({
  visualStyle: z
    .enum(["neutral", "notion", "vercel", "linear", "supabase", "mercury"])
    .default("neutral")
    .describe("Choose the closest design reference or visual style."),
  interfaceType: z
    .enum(["landing-page", "dashboard", "web-app", "marketing-site"])
    .default("web-app")
    .describe("The kind of interface being designed."),
  brandTone: z
    .enum(["neutral", "blue", "green", "red"])
    .optional()
    .describe("Optional accent preference used to swap the accent ramp."),
  includeDarkMode: z
    .boolean()
    .default(true)
    .describe("Whether to return a dark mode palette as well."),
});

function getToneAccent(tone: z.infer<typeof toolInput>["brandTone"]): PaletteScale | null {
  switch (tone) {
    case "blue":
      return {
        "100": "#eef4ff",
        "300": "#a8c3ff",
        "400": "#7da6ff",
        "500": "#4f7cff",
        "600": "#325ee8",
        "700": "#294cc0",
      };
    case "green":
      return {
        "100": "#ecfff4",
        "300": "#8fe0ae",
        "400": "#5dd88b",
        "500": "#22c55e",
        "600": "#16a34a",
        "700": "#15803d",
      };
    case "red":
      return {
        "100": "#fff1f1",
        "300": "#ffb0b0",
        "400": "#ff8b8b",
        "500": "#ff5c5c",
        "600": "#eb3d3d",
        "700": "#c42e2e",
      };
    default:
      return null;
  }
}

function getToneAccentDark(
  tone: z.infer<typeof toolInput>["brandTone"],
): PaletteScale | null {
  switch (tone) {
    case "blue":
      return {
        "100": "#15213b",
        "300": "#5377ca",
        "400": "#7294f2",
        "500": "#90afff",
        "600": "#a7c0ff",
        "700": "#bed0ff",
      };
    case "green":
      return {
        "100": "#163323",
        "300": "#3fa867",
        "400": "#54c779",
        "500": "#71e08f",
        "600": "#96ecaa",
        "700": "#b9f5c7",
      };
    case "red":
      return {
        "100": "#351818",
        "300": "#b15050",
        "400": "#df7272",
        "500": "#ff8e8e",
        "600": "#ffaaaa",
        "700": "#ffc3c3",
      };
    default:
      return null;
  }
}

export const getDesignColors = defineTool({
  name: "get_design_colors",
  description:
    "Return a deterministic product-design color system with layered neutrals, text, strokes, accent scales, semantic colors, charts, and dark mode.",
  parameters: toolInput,
  execute: async ({ visualStyle, interfaceType, brandTone, includeDarkMode }) => {
    const basePalette = paletteDictionary[visualStyle];
    const accent = getToneAccent(brandTone) ?? basePalette.accent;
    const darkAccent = getToneAccentDark(brandTone) ?? basePalette.darkMode.accent;

    const result: {
      visualStyle: string;
      interfaceType: string;
      rationale: string;
      rules: string[];
      palette: Omit<DesignPalette, "semantic" | "chart"> & {
        semantic: DesignPalette["semantic"];
        chart: string[];
      };
      usage: string[];
    } = {
      visualStyle,
      interfaceType,
      rationale: basePalette.rationale,
      rules: [
        "The neutral foundation is the main background and stays near white: 98%, 99%, or 100% white.",
        "Return at least four background layers from the same neutral family for frame, panel, elevated surface, and overlay states.",
        "Use off-white strokes instead of thin black borders in light mode.",
        "Keep primary text darkest, body text slightly softer, and tertiary text lighter for hierarchy.",
        "Use an accent scale rather than a single accent color so buttons, links, hover states, and badges can step across the ramp.",
        "In dark mode, increase the distance between surface layers so elevation still reads clearly.",
        "Semantic colors stay independent from the brand accent and should drive success, warning, error, and info states.",
      ],
      palette: {
        foundation: basePalette.foundation,
        neutrals: basePalette.neutrals,
        stroke: basePalette.stroke,
        text: basePalette.text,
        button: basePalette.button,
        accent,
        semantic: semanticScales,
        chart: chartPalette,
        darkMode: {
          ...basePalette.darkMode,
          accent: darkAccent,
        },
      },
      usage: [
        `${basePalette.neutrals.background} should be the page background or canvas.`,
        `${basePalette.neutrals.frame} works for app frames, sidebars, or section bands.`,
        `${basePalette.neutrals.panel} works for cards, form containers, and secondary surfaces.`,
        `${basePalette.neutrals.elevated} is the highest light-mode surface and can stay pure white.`,
        `${basePalette.stroke.subtle} is the default border color; reserve ${basePalette.stroke.strong} for focus, selected, or denser UI edges.`,
        `${accent["500"]} is the main accent, ${accent["600"]} or ${accent["700"]} is the hover/pressed state, and ${accent["400"]} works for links or secondary emphasis.`,
      ],
    };

    if (!includeDarkMode) {
      delete result.palette.darkMode;
    }

    return result;
  },
});
