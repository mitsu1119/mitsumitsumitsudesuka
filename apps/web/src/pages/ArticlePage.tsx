import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticle, type ArticleContent } from "../lib/api";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage("python", python);

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
					pre({ children }) {
						return <>{children}</>;
					},
					code({ className, children, ...props }) {
						const m = /language-([a-z0-9_-]+)/i.exec(className ?? "");
						const lang = m?.[1]?.toLowerCase();

						const codeString = String(children).replace(/\n$/, "");

						if (!lang) {
                			return (
								<code
								{...props}
								style={{
								padding: "0.15em 0.35em",
								border: "1px solid #d0d7de",
								borderRadius: 6,
								background: "#f6f8fa",
								fontFamily:
									'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
								fontSize: "0.95em",
								}}
								>
 				                   {codeString}
                			</code>
			                );
            		    }

						return (
							<SyntaxHighlighter
								language={lang}
								style={oneDark}
								PreTag="div"
								customStyle={{
									margin: "0.8em 0",
									borderRadius: 10,
									border: "1px solid #d0d7de",
									padding: 12,
									overflowX: "auto",
								}}
								codeTagProps={{
									style: {
									fontFamily:
										'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
									fontSize: "0.95em",
									},
								}}
								>
								{codeString}
								</SyntaxHighlighter>
							);
					}
				}}>
					{content.body}
				</ReactMarkdown>
			</article>
        </div>
    );
}