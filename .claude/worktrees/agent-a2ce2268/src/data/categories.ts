import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "fresh-meat-poultry",
    nameEn: "Fresh Meat & Poultry",
    nameZh: "新鲜肉类禽类",
    iconName: "Drumstick",
    blurbEn: "Free-range chicken, pork belly, beef cuts.",
    blurbZh: "走地鸡、五花肉、新鲜牛肉。",
  },
  {
    slug: "eggs-dairy",
    nameEn: "Eggs & Dairy",
    nameZh: "蛋类乳品",
    iconName: "Egg",
    blurbEn: "Farm eggs, fresh milk, yogurt.",
    blurbZh: "农家鸡蛋、鲜奶、酸奶。",
  },
  {
    slug: "snacks-crackers",
    nameEn: "Snacks & Crackers",
    nameZh: "零食饼干",
    iconName: "Cookie",
    blurbEn: "Asian classics, sweet & savory bites.",
    blurbZh: "亚洲经典零食，咸甜小食。",
  },
  {
    slug: "noodles-wrappers",
    nameEn: "Noodles & Wrappers",
    nameZh: "面条面皮",
    iconName: "Wheat",
    blurbEn: "Hand-pulled noodles, dumpling skins.",
    blurbZh: "手擀面、饺子皮、馄饨皮。",
  },
  {
    slug: "pantry-sauces",
    nameEn: "Pantry & Sauces",
    nameZh: "调料厨房",
    iconName: "ChefHat",
    blurbEn: "Soy sauce, vinegar, sesame oil & more.",
    blurbZh: "酱油、香醋、麻油等百搭调料。",
  },
  {
    slug: "frozen-foods",
    nameEn: "Frozen Foods",
    nameZh: "冷冻食品",
    iconName: "Snowflake",
    blurbEn: "Dumplings, baozi, wontons — ready to cook.",
    blurbZh: "饺子、包子、馄饨，即取即煮。",
  },
  {
    slug: "tofu-soy",
    nameEn: "Tofu & Soy Products",
    nameZh: "豆腐豆制品",
    iconName: "Sprout",
    blurbEn: "Silken tofu, dried bean curd, soy milk.",
    blurbZh: "嫩豆腐、豆腐干、新鲜豆浆。",
  },
  {
    slug: "beverages",
    nameEn: "Beverages",
    nameZh: "饮品",
    iconName: "CupSoda",
    blurbEn: "Tea, herbal drinks, juices.",
    blurbZh: "茶饮、凉茶、果汁。",
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
