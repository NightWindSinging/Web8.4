import Link from "next/link";
import { Footer, Header } from "@/components/SiteUI";
import { articleExcerpt, cmsDate, estimateReadingTime, getPublishedArticles } from "@/lib/cms/public-articles";
import { absoluteUrl } from "@/lib/site-url";

export const revalidate = 300;

export const metadata = {
  title: "Packaging Insights & Buyer Guides | DATANGXING",
  description: "Practical custom packaging guides covering structures, materials, finishes, sampling, MOQ, cost and supplier evaluation.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const articles = await getPublishedArticles();
  const posts = articles.map((article) => ({
    slug: article.slug,
    category: article.category?.name || "Packaging Insights",
    categorySlug: article.category?.slug,
    title: article.title,
    excerpt: articleExcerpt(article.description, article.content),
    image: article.cover || "/assets/heart-gift-boxes-square.jpg",
    date: new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(cmsDate(article.publishedAt || article.createdAt)),
    readTime: `${estimateReadingTime(article.content)} min read`,
    href: `/blog/${article.slug}`,
  }));
  const [featured, ...latest] = posts;
  const categories = [...new Map(posts.filter((post) => post.categorySlug).map((post) => [post.categorySlug, post.category])).entries()];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "DATANGXING Packaging Insights",
    url: absoluteUrl("/blog"),
    blogPost: posts.map((post) => ({ "@type": "BlogPosting", headline: post.title, url: absoluteUrl(post.href) })),
  };

  return (
    <main className="site blog-index-page">
      <Header standalone />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="blog-index-hero">
        <div><span>INSIGHTS · GUIDES · SOURCING ADVICE</span><h1>Practical packaging knowledge for better buying decisions.</h1></div>
        <p>Clear guidance for brand owners, importers and distributors planning custom paper packaging.</p>
      </section>

      <nav className="blog-topic-nav" aria-label="Blog topics">
        <a href="#latest">Latest</a>
        {categories.map(([slug, name]) => <Link key={slug} href={`/category/articles/${slug}`}>{name}</Link>)}
        <Link href="/category">All categories</Link>
      </nav>

      {featured ? <>
        <section className="blog-featured">
          <Link className="blog-featured-image" href={featured.href}><img src={featured.image} alt={featured.title} fetchPriority="high" /></Link>
          <div><span>{featured.category} · FEATURED</span><h2><Link href={featured.href}>{featured.title}</Link></h2><p>{featured.excerpt}</p><div><small>{featured.date}</small><small>{featured.readTime}</small></div><Link className="read-article" href={featured.href}>Read the Guide <b>→</b></Link></div>
        </section>
        <section className="blog-index-grid-section" id="latest">
          <div className="blog-index-head"><div><span>LATEST ARTICLES</span><h2>Explore packaging topics.</h2></div><p>Built around the questions buyers ask before sampling and production.</p></div>
          <div className="blog-card-grid">{latest.map((post) => <article key={post.slug}>
            <Link className="blog-card-image" href={post.href}><img src={post.image} alt={post.title} loading="lazy" /></Link>
            <div><span>{post.category}</span><h3><Link href={post.href}>{post.title}</Link></h3><p>{post.excerpt}</p><footer><small>{post.readTime}</small><Link href={post.href}>Read ↗</Link></footer></div>
          </article>)}</div>
        </section>
      </> : <section className="cms-empty-state" id="latest"><span>INSIGHTS</span><h2>New packaging guides are being prepared.</h2><p>Published CMS articles will appear here automatically.</p></section>}

      <section className="blog-newsletter"><div><span>NEED PROJECT-SPECIFIC ADVICE?</span><h2>Turn your packaging questions into a clear brief.</h2><p>Share your product, quantity and target market. We’ll help identify the next practical step.</p></div><Link href="/inquiry">Ask a Packaging Specialist <b>→</b></Link></section>
      <Footer />
    </main>
  );
}
