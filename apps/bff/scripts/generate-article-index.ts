/// <reference types="node" />

import fs from "node:fs/promises";
import path from "node:path";

type ArticleIndexItem = {
    slug: string;
    filename: string;
};

const BFF_ROOT = process.cwd();
const REPO_ROOT = path.resolve(BFF_ROOT, "..", "..");
const ARTICLES_DIR = path.join(REPO_ROOT, "content", "articles");
const OUT_FILE = path.join(BFF_ROOT, "src", "generated", "articles.ts");

// hoge.md -> hoge
function slugFromFilename(filename: string) {
    return filename.replace(/\.md$/i, "");
}

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

    const items: ArticleIndexItem[] = mdFiles.map((filename) => ({
        slug: slugFromFilename(filename),
        filename,
    }));

    await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });

    const content = `
    export type ArticleIndexItem = {
        slug: string;
        filename: string;
    };

    export const articleIndex: ArticleIndexItem[] = ${JSON.stringify(items, null, 2)};
    `;

    await fs.writeFile(OUT_FILE, content, "utf-8");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
