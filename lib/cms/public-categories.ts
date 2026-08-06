import "server-only";

import { unstable_cache } from "next/cache";
import { CMS_CACHE_TAGS, CMS_REVALIDATE_SECONDS } from "@/lib/cms/cache";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const getPublicCategoriesCached = unstable_cache(async () => {
  try {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: {
            articles: { where: { status: "PUBLISHED" } },
            products: { where: { status: "PUBLISHED" } },
          },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Unable to load public categories", error);
    return [];
  }
}, ["cms-public-categories-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.categories, CMS_CACHE_TAGS.articles, CMS_CACHE_TAGS.products],
});

export async function getPublicCategories() {
  if (!isDatabaseConfigured()) return [];
  return getPublicCategoriesCached();
}

const getNavigationCategoriesCached = unstable_cache(async () => {
  try {
    return await prisma.category.findMany({
      where: { type: "PRODUCT", navigationGroup: { not: null } },
      select: {
        name: true,
        slug: true,
        description: true,
        navigationGroup: true,
        navigationOrder: true,
        navigationImage: true,
      },
      orderBy: [{ navigationGroup: "asc" }, { navigationOrder: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Unable to load navigation categories", error);
    return [];
  }
}, ["cms-navigation-categories-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.categories],
});

export async function getNavigationCategories() {
  if (!isDatabaseConfigured()) return [];
  return getNavigationCategoriesCached();
}

const getPublicArticleCategoryCached = unstable_cache(async (slug: string) => {
  try {
    return await prisma.category.findFirst({
      where: { type: "ARTICLE", slug },
      include: {
        articles: {
          where: { status: "PUBLISHED" },
          include: { category: { select: { name: true, slug: true } } },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        },
      },
    });
  } catch (error) {
    console.error(`Unable to load article category '${slug}'`, error);
    return null;
  }
}, ["cms-public-article-category-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.categories, CMS_CACHE_TAGS.articles],
});

const getPublicProductCategoryCached = unstable_cache(async (slug: string) => {
  try {
    return await prisma.category.findFirst({
      where: { type: "PRODUCT", slug },
      include: {
        products: {
          where: { status: "PUBLISHED" },
          include: {
            category: { select: { name: true, slug: true } },
            mainImageMedia: { select: { url: true, alt: true } },
            galleryMedia: { select: { url: true, alt: true }, orderBy: { createdAt: "asc" } },
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        },
      },
    });
  } catch (error) {
    console.error(`Unable to load product category '${slug}'`, error);
    return null;
  }
}, ["cms-public-product-category-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.categories, CMS_CACHE_TAGS.products],
});

export async function getPublicArticleCategory(slug: string) {
  if (!isDatabaseConfigured()) return null;
  return getPublicArticleCategoryCached(slug);
}

export async function getPublicProductCategory(slug: string) {
  if (!isDatabaseConfigured()) return null;
  return getPublicProductCategoryCached(slug);
}
