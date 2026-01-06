import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles, type ArticleIndexItem } from "../lib/api";

export default function ArticlesIndex() {
    const [items, setItems] = useState<ArticleIndexItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getArticles()
            .then(setItems)
            .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    }, []);

    const sorted = useMemo(
        () => [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
        [items]
    );

    if (error) return <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>;
    if (!items.length) return <p>Loading…</p>;

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
            <h1>みつみつみつですか？</h1>
			<h2>はい</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {sorted.map((a) => (
                    <li key={a.slug}>
                        <Link
                            to={`/articles/${a.slug}`}
                            style={{
                                display: "block",
                                padding: 12,
                                borderRadius: 8,
                                border: "1px solid #ddd",
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                                <strong style={{ fontSize: 18 }}>{a.title}</strong>
                                <span style={{ opacity: 0.7 }}>{a.date}</span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                                {a.tags.length ? a.tags.join(", ") : "(no tags)"}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}