import fs from "node:fs";
import path from "node:path";
import sanitizeHtml from "sanitize-html";
import { PrismaClient } from "../lib/generated/prisma";

function loadLocalDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) return;
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) throw new Error("DATABASE_URL is not configured and .env was not found.");
  const line = fs.readFileSync(envPath, "utf8").split(/\r?\n/).find((row) => /^DATABASE_URL\s*=/.test(row));
  const raw = line?.replace(/^DATABASE_URL\s*=\s*/, "").trim();
  if (!raw) throw new Error("DATABASE_URL is missing from .env.");
  process.env.DATABASE_URL = raw.replace(/^(['"])(.*)\1$/, "$2");
}

loadLocalDatabaseUrl();
const prisma = new PrismaClient();

const articleFiles = [
  "docs/seo/article-01-choose-custom-packaging-manufacturer.md",
  "docs/seo/article-02-rigid-box-vs-folding-carton.md",
  "docs/seo/article-03-custom-packaging-moq-cost-lead-time.md",
];

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inlineMarkdown(value: string) {
  let output = escapeHtml(value.trim());
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\[([^\]]+)\]\((\/[^)]+|https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>');
  return output;
}

function tableCells(line: string) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

function markdownToCmsHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (/^# /.test(line)) { index += 1; continue; }
    if (/^## /.test(line)) { output.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`); index += 1; continue; }
    if (/^### /.test(line)) { output.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`); index += 1; continue; }

    if (/^\|/.test(line) && index + 1 < lines.length && /^\|?[\s:|-]+\|/.test(lines[index + 1])) {
      const headers = tableCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && /^\|/.test(lines[index])) rows.push(tableCells(lines[index++]));
      output.push("<ul>");
      for (const row of rows) {
        const fields = row.map((cell, cellIndex) => `<strong>${inlineMarkdown(headers[cellIndex] || `Field ${cellIndex + 1}`)}:</strong> ${inlineMarkdown(cell)}`);
        output.push(`<li>${fields.join("; ")}</li>`);
      }
      output.push("</ul>");
      continue;
    }

    if (/^- /.test(line)) {
      output.push("<ul>");
      while (index < lines.length && /^- /.test(lines[index])) output.push(`<li>${inlineMarkdown(lines[index++].slice(2))}</li>`);
      output.push("</ul>");
      continue;
    }

    if (/^\d+\. /.test(line)) {
      output.push("<ol>");
      while (index < lines.length && /^\d+\. /.test(lines[index])) output.push(`<li>${inlineMarkdown(lines[index++].replace(/^\d+\. /, ""))}</li>`);
      output.push("</ol>");
      continue;
    }

    if (/^>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>/.test(lines[index])) quote.push(lines[index++].replace(/^>\s?/, "").replace(/\s{2}$/, ""));
      output.push(`<blockquote>${quote.map(inlineMarkdown).join("<br>")}</blockquote>`);
      continue;
    }

    if (/^---$/.test(line.trim())) { output.push("<hr>"); index += 1; continue; }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (
      index < lines.length && lines[index].trim() &&
      !/^(#{1,3} |\||- |\d+\. |> |---$)/.test(lines[index])
    ) paragraph.push(lines[index++].trim());
    output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return sanitizeHtml(output.join("\n"), {
    allowedTags: ["p", "br", "strong", "em", "s", "blockquote", "h2", "h3", "ul", "ol", "li", "a", "img", "hr", "code", "pre"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "title"], code: ["class"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: (_tag, attributes) => ({ tagName: "a", attribs: { ...attributes, rel: "noopener noreferrer" } }) },
  });
}

function parseSource(file: string) {
  const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
  const sections = raw.split(/^---\s*$/m);
  if (sections.length < 3) throw new Error(`Invalid article source: ${file}`);
  const frontmatter = Object.fromEntries(
    sections[1].split(/\r?\n/).filter(Boolean).map((line) => {
      const separator = line.indexOf(":");
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }),
  );
  const body = sections[2].trim();
  const title = body.match(/^# (.+)$/m)?.[1]?.trim();
  if (!title) throw new Error(`H1 title missing: ${file}`);
  const primary = String(frontmatter["Primary Keyword"] || "").trim();
  const secondary = String(frontmatter["Secondary Keywords"] || "").split(/[,;]/).map((keyword) => keyword.trim()).filter(Boolean);
  return {
    title,
    slug: String(frontmatter["URL Slug"] || "").trim(),
    seoTitle: String(frontmatter["SEO Title"] || "").trim(),
    description: String(frontmatter["Meta Description"] || "").trim(),
    keywords: [...new Set([primary, ...secondary].filter(Boolean))],
    content: markdownToCmsHtml(body),
  };
}

async function main() {
  const category = await prisma.category.upsert({
    where: { slug_type: { slug: "packaging-guide", type: "ARTICLE" } },
    update: {},
    create: { name: "Packaging Guide", slug: "packaging-guide", type: "ARTICLE", description: "Practical custom packaging guidance for global B2B buyers." },
    select: { id: true, name: true },
  });

  const results = [];
  for (const file of articleFiles) {
    const article = parseSource(file);
    if (!article.slug) throw new Error(`URL Slug missing: ${file}`);
    const existing = await prisma.article.findUnique({ where: { slug: article.slug }, select: { id: true, status: true, publishedAt: true } });
    const saved = existing
      ? await prisma.article.update({
          where: { slug: article.slug },
          data: { ...article, seoDescription: article.description, categoryId: category.id },
          select: { id: true, title: true, slug: true, status: true, updatedAt: true },
        })
      : await prisma.article.create({
          data: { ...article, seoDescription: article.description, status: "DRAFT", categoryId: category.id },
          select: { id: true, title: true, slug: true, status: true, updatedAt: true },
        });
    results.push({ action: existing ? "updated" : "created", ...saved, contentCharacters: article.content.length });
  }

  console.log(JSON.stringify({ category: category.name, articles: results }, null, 2));
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
