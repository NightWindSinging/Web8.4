export type PublishStatus = "draft" | "published";

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  status: PublishStatus;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  image: string;
  status: PublishStatus;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: "article" | "product";
  createdAt: string;
};

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
};

export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
};

export type CmsDatabase = {
  articles: Article[];
  products: Product[];
  categories: Category[];
  media: MediaItem[];
  settings: SiteSettings;
};
