import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticle, type ArticleContent } from "../lib/api";

export default function ArticlePage() {
    const { slug } = useParams<{ slug: string }>();
    const [content, setContent] = useState<ArticleContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        getArticle(slug)
            .then(setContent)
            .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    }, [slug]);

    if (error) return <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>;
    if (!content) return <p style={{ padding: 24 }}>Loading…</p>;

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
            <Link to="/">← Back</Link>
            <h1 style={{ marginBottom: 6 }}>{content.meta.title}</h1>
            <div style={{ opacity: 0.8, marginBottom: 12 }}>
				{content.meta.date}
				{" / "}
				{content.meta.tags.length ? content.meta.tags.join(", ") : "(no tags)"}
            </div>

			<article className="md">
				<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					a({ href, children, ...props }) {
						const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
						return (
							<a
							href={href}
							target={isExternal ? "_blank" : undefined}
							rel={isExternal ? "noopener noreferrer" : undefined}
							{...props}
						>
							{children}
						</a>
						);
					},
					img({ ...props }) {
						return <img {...props} style={{ maxWidth: "100%" }} />;
					},
					}
				}>
					{content.body}
				</ReactMarkdown>
			</article>
        </div>
    );
}