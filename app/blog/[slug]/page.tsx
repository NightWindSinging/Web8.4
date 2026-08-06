import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticleTemplate from "@/components/BlogArticleTemplate";
import { articleExcerpt, cmsDate, estimateReadingTime, getPublishedArticle, getPublishedArticles, prepareArticleContent } from "@/lib/cms/public-articles";
import { resolveCanonicalUrl } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 300;
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

const author = {
  name: "Zhizhou Li",
  role: "Founder · Packaging Advisor",
  image: "/assets/founder.jpg",
  imageAlt: "Zhizhou Li, founder of DATANGXING Packaging",
  bio: "Zhizhou works with brand owners, importers and distributors to turn packaging ideas into repeatable production solutions.",
  quote: "Good packaging should express the brand and remain realistic to manufacture.",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "Article not found | DATANGXING Packaging", robots: { index: false } };
  const description = article.seoDescription || articleExcerpt(article.description, article.content);
  const canonical = resolveCanonicalUrl(article.canonicalUrl, `/blog/${article.slug}`);
  return {
    title: article.seoTitle || `${article.title} | DATANGXING Packaging`,
    description,
    keywords: article.keywords,
    alternates: { canonical },
    openGraph: { type: "article", url: canonical, title: article.seoTitle || article.title, description, images: article.cover ? [article.cover] : [] },
  };
}

export default async function DatabaseArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articleRecord = await getPublishedArticle(slug);
  if (!articleRecord) notFound();
  const prepared = prepareArticleContent(articleRecord.content);
  const description = articleExcerpt(articleRecord.description, articleRecord.content);
  const published = cmsDate(articleRecord.publishedAt || articleRecord.createdAt);
  const updated = cmsDate(articleRecord.updatedAt);
  const canonical = resolveCanonicalUrl(articleRecord.canonicalUrl, `/blog/${articleRecord.slug}`);
  const article = {
    category: articleRecord.category?.name || "Packaging Insights",
    title: articleRecord.title,
    description,
    published: new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(published),
    readingTime: `${estimateReadingTime(articleRecord.content)} min read`,
    heroImage: articleRecord.cover || "/assets/heart-gift-boxes-square.jpg",
    heroAlt: articleRecord.title,
    lead: description,
    toc: prepared.toc,
    author,
  };
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: canonical,
    headline: articleRecord.title,
    description,
    image: articleRecord.cover ? absoluteUrl(articleRecord.cover) : undefined,
    datePublished: published.toISOString(),
    dateModified: updated.toISOString(),
    keywords: articleRecord.keywords.join(", "),
    author: { "@type": "Person", name: author.name },
    publisher: { "@type": "Organization", name: "DATANGXING Packaging", url: absoluteUrl("/") },
  };

  return <BlogArticleTemplate article={article}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="cms-rich-content" dangerouslySetInnerHTML={{ __html: prepared.content }} />
  </BlogArticleTemplate>;
}
