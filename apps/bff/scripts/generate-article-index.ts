/// <reference types="node" />

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { z } from "zod";

type ArticleIndexItem = {
    slug: string;
    filename: string;
    title: string;
    date: string;
    tags: string[];
};

const BFF_ROOT = process.cwd();
const REPO_ROOT = path.resolve(BFF_ROOT, "..", "..");
const ARTICLES_DIR = path.join(REPO_ROOT, "content", "articles");
const OUT_FILE = path.join(BFF_ROOT, "src", "generated", "articles.ts");

// hoge.md -> hoge
function slugFromFilename(filename: string) {
    return filename.replace(/\.md$/i, "");
}

const YMD = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);

    // 月日範囲
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;

    // 月日の存在確認
    const dt = new Date(Date.UTC(y, m - 1, d));
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}` === s;
  }, "date must be a real calendar date (YYYY-MM-DD)");

const FrontmatterSchema = z.object({
    title: z.string().trim().min(1, "title must be non-empty string"),
    date: YMD,
    tags: z.array(z.string().trim().min(1, "tags must not contain empty string"))
}).strict();

async function main() {
    let files: string[] = [];
    try {
        files = await fs.readdir(ARTICLES_DIR);
    } catch {
        files = [];
    }

    const mdFiles = files.
    filter((f) => f.toLowerCase().endsWith(".md")).
    sort((a,b) => a.localeCompare(b));

    const items: ArticleIndexItem[] = [];
    for(const filename of mdFiles) {
        const full_path = path.join(ARTICLES_DIR, filename);
        const raw = await fs.readFile(full_path, "utf8");
        const parsed = matter(raw);

        const result = FrontmatterSchema.safeParse(parsed.data ?? {});
        if(!result.success) {
            throw new Error("zod format error");
        }

        const slug = slugFromFilename(filename);
        const fm = result.data;
        items.push({
            slug,
            filename,
            title: fm.title,
            date: fm.date,
            tags: fm.tags,
        });
    }

    items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

    await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });

    const content = `
    export type ArticleIndexItem = {
        slug: string;
        filename: string;
        title: string;
        date: string;
        tags: string[];
    };

    export const articleIndex: ArticleIndexItem[] = ${JSON.stringify(items, null, 2)};
    `;

    await fs.writeFile(OUT_FILE, content, "utf-8");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
