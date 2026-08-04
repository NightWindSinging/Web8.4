import Image from "next/image";
import Link from "next/link";
import { Footer, Header } from "../../components/SiteUI";
import { blogPosts } from "../../data/siteContent";

export const metadata = {
  title: "Packaging Insights & Buyer Guides | DATANGXING",
  description: "Practical custom packaging guides covering structures, materials, finishes, sampling, MOQ, cost and supplier evaluation.",
};

export default function BlogPage() {
  const [featured, ...posts] = blogPosts;
  const schema = { "@context": "https://schema.org", "@type": "Blog", name: "DATANGXING Packaging Insights", blogPost: blogPosts.map((post) => ({ "@type": "BlogPosting", headline: post.title, url: post.href })) };
  return (
    <main className="site blog-index-page">
      <Header standalone />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="blog-index-hero"><div><span>INSIGHTS · GUIDES · SOURCING ADVICE</span><h1>Practical packaging knowledge for better buying decisions.</h1></div><p>Clear guidance for brand owners, importers and distributors planning custom paper packaging.</p></section>
      <nav className="blog-topic-nav" aria-label="Blog topics"><a href="#latest">Latest</a><a href="#structure">Structure</a><a href="#materials">Materials</a><a href="#production">Production</a><a href="#sourcing">Sourcing</a></nav>
      <section className="blog-featured"><Link className="blog-featured-image" href={featured.href}><Image src={featured.image} alt={featured.alt} fill priority sizes="700px" /></Link><div><span>{featured.category} · FEATURED</span><h2><Link href={featured.href}>{featured.title}</Link></h2><p>{featured.excerpt}</p><div><small>{featured.date}</small><small>{featured.readTime}</small></div><Link className="read-article" href={featured.href}>Read the Guide <b>→</b></Link></div></section>
      <section className="blog-index-grid-section" id="latest"><div className="blog-index-head"><div><span>LATEST ARTICLES</span><h2>Explore packaging topics.</h2></div><p>Built around the questions buyers ask before sampling and production.</p></div><div className="blog-card-grid">{posts.map((post) => <article key={post.slug} id={post.category.toLowerCase().split(" ")[0]}><Link className="blog-card-image" href={post.href}><Image src={post.image} alt={post.alt} fill sizes="380px" /></Link><div><span>{post.category}</span><h3><Link href={post.href}>{post.title}</Link></h3><p>{post.excerpt}</p><footer><small>{post.readTime}</small><Link href={post.href}>Read ↗</Link></footer></div></article>)}</div></section>
      <section className="blog-newsletter"><div><span>NEED PROJECT-SPECIFIC ADVICE?</span><h2>Turn your packaging questions into a clear brief.</h2><p>Share your product, quantity and target market. We’ll help identify the next practical step.</p></div><Link href="/inquiry">Ask a Packaging Specialist <b>→</b></Link></section>
      <Footer />
    </main>
  );
}
