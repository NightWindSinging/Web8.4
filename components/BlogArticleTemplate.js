import Image from "next/image";
import Link from "next/link";
import BlogSidebarForm from "./BlogSidebarForm";
import { Footer, Header } from "./SiteUI";

export default function BlogArticleTemplate({ article, children }) {
  return (
    <main className="site blog-page">
      <Header standalone />

      <header className="blog-masthead">
        <div className="blog-breadcrumb"><Link href="/concept-b">Home</Link><span>/</span><Link href="/blog/custom-packaging-guide">Insights</Link><span>/</span><b>{article.category}</b></div>
        <div className="blog-title-grid">
          <div><span>{article.category}</span><h1>{article.title}</h1></div>
          <p>{article.description}</p>
        </div>
        <div className="blog-meta"><span>By {article.author.name}</span><span>{article.published}</span><span>{article.readingTime}</span></div>
        <div className="blog-hero-image"><Image src={article.heroImage} alt={article.heroAlt} fill priority sizes="(max-width: 900px) 100vw, 1296px" /></div>
      </header>

      <div className="blog-content-layout">
        <article className="blog-article">
          <nav className="blog-toc" aria-label="Article table of contents">
            <div><span>QUICK CONTENTS</span><strong>In this article</strong></div>
            <ol>{article.toc.map((item, index) => <li key={item.id}><a href={`#${item.id}`}><b>{String(index + 1).padStart(2, "0")}</b>{item.label}</a></li>)}</ol>
          </nav>
          <p className="blog-lead">{article.lead}</p>
          {children}
        </article>

        <aside className="blog-sidebar">
          <section className="author-card">
            <div className="author-image"><Image src={article.author.image} alt={article.author.imageAlt} fill sizes="340px" /></div>
            <span>FOUNDER’S PERSPECTIVE</span>
            <h2>{article.author.name}</h2>
            <strong>{article.author.role}</strong>
            <p>{article.author.bio}</p>
            <blockquote>“{article.author.quote}”</blockquote>
            <Link href="/contact">Meet the team <b>↗</b></Link>
          </section>
          <BlogSidebarForm />
        </aside>
      </div>

      <section className="blog-end-cta">
        <div><span>FROM ARTICLE TO ACTION</span><h2>Planning a custom packaging project?</h2><p>Send your requirements and receive practical guidance on structure, material, sampling and production.</p></div>
        <Link href="/inquiry">Start Your Inquiry <b>→</b></Link>
      </section>

      <Footer />
    </main>
  );
}
