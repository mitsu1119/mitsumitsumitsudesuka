import { useEffect, useMemo, useState } from "react";

type ArticleIndexItem = {
    slug: string;
    filename: string;
    title: string;
    date: string;
    tags: string[];
};

export default function App() {
    const [items, setItems] = useState<ArticleIndexItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
        const url = `${API_BASE}/api/articles`;

        console.log("VITE_API_BASE_URL =", API_BASE);
        console.log("fetch url =", url);

        fetch(url)
            .then((r) => {
            console.log("status =", r.status);
            return r.json();
            })
            .then((j) => console.log("json =", j))
            .catch((e) => console.error(e));
    }, []);

    useEffect(() => {
        const ac = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch("/api/articles", { signal: ac.signal });
                if(!res.ok) {
                    throw new Error(`HTTP ${res.status} ${res.statusText}`);
                }

                const data = (await res.json()) as ArticleIndexItem[];
                setItems(data);
            } catch (e) {
                if((e as any)?.name === "AbortError") return;
                setError(e instanceof Error ? e.message : String(e));
            } finally {
                setLoading(false);
            }
        })();

        return () => ac.abort();
    }, []);

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    }, [items]);

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto"}}>
            <h1>Articles</h1>

            {loading && <p>Loading...</p>}
            {error && (
                <div style={{ whiteSpace: "pre-wrap" }}>
                    <p style={{ fontWeight: 700 }}>Error</p>
                    <code>{error}</code>
                </div>
            )}

            {!loading && !error && (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                {sorted.map((a) => (
                    <li key={a.slug} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                        <strong style={{ fontSize: 18 }}>{a.title}</strong>
                        <span style={{ opacity: 0.7 }}>{a.date}</span>
                    </div>

                    <div style={{ marginTop: 8, opacity: 0.8 }}>
                        <div>slug: <code>{a.slug}</code></div>
                        <div>file: <code>{a.filename}</code></div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        {a.tags.length === 0 ? (
                        <span style={{ opacity: 0.6 }}>(no tags)</span>
                        ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {a.tags.map((t) => (
                            <span
                                key={t}
                                style={{
                                border: "1px solid #ccc",
                                borderRadius: 999,
                                padding: "2px 10px",
                                fontSize: 12
                                }}
                            >
                                {t}
                            </span>
                            ))}
                        </div>
                        )}
                    </div>
                    </li>
                ))}
                </ul>
            )}
        </div>
    );
}
