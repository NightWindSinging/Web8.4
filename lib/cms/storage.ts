import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CmsDatabase } from "./types";

const cmsDirectory = path.join(process.cwd(), "data", "cms");
const databasePath = path.join(cmsDirectory, "database.json");
let mutationQueue: Promise<unknown> = Promise.resolve();

const now = new Date().toISOString();
const initialDatabase: CmsDatabase = {
  articles: [{
    id: "article-packaging-guide",
    title: "How to Choose Custom Paper Packaging for Your Product",
    slug: "custom-packaging-guide",
    excerpt: "A practical buyer's guide to structures, materials, finishing and supplier selection.",
    content: "Use this CMS editor to prepare the next version of the packaging guide. The current public article remains unchanged until frontend integration is enabled.",
    categoryId: "category-packaging-guide",
    status: "published",
    seoTitle: "How to Choose Custom Paper Packaging | DATANGXING",
    seoDescription: "Learn how to choose custom paper packaging structures, materials, finishes and suppliers.",
    createdAt: now,
    updatedAt: now,
  }],
  products: [{
    id: "product-rigid-gift-boxes",
    name: "Rigid Gift Boxes",
    slug: "rigid-gift-boxes",
    summary: "Magnetic, drawer and shoulder-neck structures for premium presentation.",
    description: "Premium rigid packaging engineered around the product, opening experience and production quantity.",
    categoryId: "category-premium-packaging",
    image: "/assets/luxury-gift-box-square.jpg",
    status: "published",
    seoTitle: "Custom Rigid Gift Boxes Manufacturer | DATANGXING",
    seoDescription: "Custom magnetic, drawer and shoulder-neck rigid gift boxes for global B2B buyers.",
    createdAt: now,
    updatedAt: now,
  }],
  categories: [
    { id: "category-packaging-guide", name: "Packaging Guide", slug: "packaging-guide", type: "article", createdAt: now },
    { id: "category-premium-packaging", name: "Premium Packaging", slug: "premium-packaging", type: "product", createdAt: now },
  ],
  media: [],
  settings: {
    siteTitle: "DATANGXING Packaging",
    siteDescription: "Custom paper packaging solutions for global B2B buyers.",
    companyName: "Shenzhen Datangxing Printing & Packaging Co., Ltd.",
    contactEmail: "lynn05052002@gmail.com",
    contactPhone: "",
    address: "No. 50, Langbei Village, Tongde Community, Baolong Subdistrict, Longgang District, Shenzhen, Guangdong, China",
  },
};

async function ensureDatabase() {
  await mkdir(cmsDirectory, { recursive: true });
  try {
    await readFile(databasePath, "utf8");
  } catch {
    await writeFile(databasePath, `${JSON.stringify(initialDatabase, null, 2)}\n`, { encoding: "utf8", flag: "wx" }).catch(() => undefined);
  }
}

export async function readDatabase(): Promise<CmsDatabase> {
  await ensureDatabase();
  return JSON.parse(await readFile(databasePath, "utf8")) as CmsDatabase;
}

export async function updateDatabase<T>(mutator: (database: CmsDatabase) => T | Promise<T>): Promise<T> {
  const task = mutationQueue.then(async () => {
    const database = await readDatabase();
    const result = await mutator(database);
    const temporaryPath = `${databasePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
    await rename(temporaryPath, databasePath);
    return result;
  });
  mutationQueue = task.catch(() => undefined);
  return task;
}
