import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/SiteUI";
import { articleExcerpt, estimateReadingTime } from "@/lib/cms/public-articles";
import { getPublicArticleCategory, getPublicCategories } from "@/lib/cms/public-categories";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 300;
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getPublicCategories();
  return categories.filter((category) => category.type === "ARTICLE").map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicArticleCategory(slug);
  if (!category) return { title: "Category not found | DATANGXING", robots: { index: false } };
  const description = category.description || `Read DATANGXING packaging articles and buyer guides about ${category.name}.`;
  return { title: `${category.name} Packaging Articles | DATANGXING`, description, alternates: { canonical: `/category/articles/${category.slug}` } };
}

export default async function ArticleCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getPublicArticleCategory(slug);
  if (!category) notFound();
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: category.name, description: category.description, url: absoluteUrl(`/category/articles/${category.slug}`), mainEntity: { "@type": "ItemList", itemListElement: category.articles.map((article, index) => ({ "@type": "ListItem", position: index + 1, name: article.title, url: absoluteUrl(`/blog/${article.slug}`) })) } };

  return <main className="site blog-index-page category-archive-page">
    <Header standalone />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <section className="category-hero"><div className="archive-breadcrumb"><Link href="/category">Categories</Link><span>/</span><Link href="/blog">Articles</Link></div><span>ARTICLE CATEGORY</span><h1>{category.name}</h1><p>{category.description || "Practical packaging guidance for global buyers and brand teams."}</p></section>
    <section className="blog-index-grid-section"><div className="blog-index-head"><div><span>PUBLISHED ARTICLES</span><h2>{category.articles.length} {category.articles.length === 1 ? "guide" : "guides"} in this topic.</h2></div></div>{category.articles.length ? <div className="blog-card-grid">{category.articles.map((article) => <article key={article.id}><Link className="blog-card-image" href={`/blog/${article.slug}`}><img src={article.cover || "/assets/heart-gift-boxes-square.jpg"} alt={article.title} loading="lazy" /></Link><div><span>{category.name}</span><h3><Link href={`/blog/${article.slug}`}>{article.title}</Link></h3><p>{articleExcerpt(article.description, article.content)}</p><footer><small>{estimateReadingTime(article.content)} min read</small><Link href={`/blog/${article.slug}`}>Read ↗</Link></footer></div></article>)}</div> : <div className="cms-empty-state"><h2>No published articles yet.</h2><p>New CMS articles in this category will appear automatically.</p></div>}</section>
    <Footer />
  </main>;
}
