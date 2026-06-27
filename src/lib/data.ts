import fs from "fs";
import path from "path";

export type SocialLink = {
  platform: string;
  url: string;
  icon: string;
};

export type Section = {
  id: string;
  title: string;
  content: string;
  images?: string[];
};

export type Card = {
  id: string;
  title: string;
  type: "like" | "dislike";
  category: string;
  images: string[];
  reason: string;
};

export type SiteContent = {
  profile: {
    name: string;
    avatar: string;
    bio: string;
    email: string;
    phone: string;
    location: string;
  };
  site: {
    title: string;
    description: string;
    footer: string;
  };
  theme: {
    background: string;
    foreground: string;
    accent: string;
    accentLight: string;
  };
  social: SocialLink[];
  sections: Section[];
  cards: Card[];
};

const isDev = process.env.NODE_ENV === "development";
const dataDir = isDev
  ? path.join(process.cwd(), "data")
  : "/tmp/data";

const dataFile = path.join(dataDir, "content.json");

function getDefaultContent(): SiteContent {
  return {
    profile: {
      name: "Феникс",
      avatar: "",
      bio: "Добро пожаловать на мой сайт",
      email: "",
      phone: "",
      location: "",
    },
    site: {
      title: "Феникс",
      description: "Мой личный сайт",
      footer: "© 2026 Феникс",
    },
    theme: {
      background: "#0a0a0a",
      foreground: "#f5f5f5",
      accent: "#d4a574",
      accentLight: "#e8c4a0",
    },
    social: [
      { platform: "Telegram", url: "", icon: "telegram" },
      { platform: "GitHub", url: "", icon: "github" },
    ],
    sections: [
      { id: "hero", title: "Феникс", content: "Добро пожаловать на мой сайт" },
      { id: "about", title: "Обо мне", content: "Напишите здесь о себе..." },
    ],
    cards: [],
  };
}

export function getContent(): SiteContent {
  try {
    if (!fs.existsSync(dataFile)) {
      return getDefaultContent();
    }
    const raw = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(raw);
  } catch {
    return getDefaultContent();
  }
}

export function saveContent(content: SiteContent): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataFile, JSON.stringify(content, null, 2), "utf-8");
}
