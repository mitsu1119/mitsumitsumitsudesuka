export type ArticleIndexItem = {
	slug: string;
	filename: string;
	title: string;
	date: string;
	tags: string[];
};

export type ArticleContent = {
	meta: ArticleIndexItem;
	body: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export function getArticles() {
  return fetchJson<ArticleIndexItem[]>("/api/articles");
}

export function getArticle(slug: string) {
  return fetchJson<ArticleContent>(`/api/articles/${encodeURIComponent(slug)}`);
}