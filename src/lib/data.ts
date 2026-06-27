import { getData, setData } from "./db";

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

function getDefaultContent(): SiteContent {
  return {
    profile: {
      name: "Феникс",
      avatar: "",
      bio: "Будь как Феникс",
      email: "",
      phone: "",
      location: "",
    },
    site: {
      title: "Феникс",
      description: "Будь как Феникс",
      footer: "© 2026 Феникс",
    },
    theme: {
      background: "#2a2522",
      foreground: "#e8dfd4",
      accent: "#e899a0",
      accentLight: "#f4c8d6",
    },
    social: [
      { platform: "Telegram", url: "https://t.me/ushd5", icon: "telegram" },
    ],
    sections: [
      {
        id: "hero",
        title: "Феникс",
        content:
          '"Когда весь твой мир превращается в прах, просто начни строить его заново"',
        images: [],
      },
    ],
    cards: [
      {
        id: "like1",
        title: "Шашлык, Жаренная рыба, Олот самса, Самса томчи (тандыр), Ташкентский плов, Куриный суп, Манты, Машаба, Тефтель, Голубцы, Чечевичный суп, Паста",
        type: "like",
        category: "Еда",
        images: [
          "/uploads/1782498141731.jpg",
          "/uploads/1782498145791.jpg",
          "/uploads/1782498153464.jpg",
          "/uploads/1782498175134.jpg",
          "/uploads/1782498212847.jpg",
          "/uploads/1782498219885.jpg",
          "/uploads/1782498224140.jpg",
          "/uploads/1782498229787.jpg",
          "/uploads/1782498246399.jpg",
          "/uploads/1782498256530.jpg",
          "/uploads/1782498267437.jpg",
          "/uploads/1782498272454.jpg",
        ],
        reason: "Я предпочитаю жидкие блюда, они для меня более легкие и комфортные.",
      },
      {
        id: "like2",
        title: "Сакура",
        type: "like",
        category: "Цветы",
        images: [],
        reason: "Нежность и быстротечность — напоминание ценить каждый момент",
      },
      {
        id: "like3",
        title: "Багровый",
        type: "like",
        category: "Цвета",
        images: [],
        reason: "Цвет огня и возрождения, сила и страсть",
      },
      {
        id: "dislike1",
        title: "Жуери Гуртик, Гречка, Горох, Макароны, Лапша быстрого приготовления",
        type: "dislike",
        category: "Еда",
        images: [
          "/uploads/1782502611363.jpg",
          "/uploads/1782502617959.jpg",
          "/uploads/1782502622075.jpg",
          "/uploads/1782502627358.jpg",
          "/uploads/1782502630555.jpg",
        ],
        reason: "Блюди которые мне совсем не нравятся.",
      },
      {
        id: "dislike2",
        title: "Серый",
        type: "dislike",
        category: "Цвета",
        images: [],
        reason: "Цвет безэмоциональности и увядания",
      },
      {
        id: "dislike3",
        title: "Искусственные цветы",
        type: "dislike",
        category: "Цветы",
        images: [],
        reason: "Красота без жизни и аромата",
      },
    ],
  };
}

export async function getContent(): Promise<SiteContent> {
  try {
    const raw = await getData("content");
    if (!raw) {
      const defaults = getDefaultContent();
      await setData("content", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultContent();
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  await setData("content", JSON.stringify(content));
}
