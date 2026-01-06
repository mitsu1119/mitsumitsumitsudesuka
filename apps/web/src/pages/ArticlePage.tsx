import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticle, type ArticleContent } from "../lib/api";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage("python", python);

// KaTeXが生成するHTML/MathMLを sanitize で落とさないための許可拡張
const katexSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...((defaultSchema.attributes as any)?.span ?? []),
      "className",
      "style",
      "aria-hidden",
    ],
    div: [
      ...((defaultSchema.attributes as any)?.div ?? []),
      "className",
      "style",
      "aria-hidden",
    ],
    math: [...((defaultSchema.attributes as any)?.math ?? []), "xmlns"],
    annotation: [
      ...((defaultSchema.attributes as any)?.annotation ?? []),
      "encoding",
    ],
  },
  tagNames: Array.from(
    new Set([
      ...((defaultSchema as any).tagNames ?? []),
      "span",
      "div",
      "math",
      "semantics",
      "annotation",
      "mrow",
      "mi",
      "mn",
      "mo",
      "msup",
      "msub",
      "msubsup",
      "mfrac",
      "msqrt",
      "mroot",
      "mtable",
      "mtr",
      "mtd",
      "mtext",
    ])
  ),
};

export default function ArticlePage() {
    const { slug } = useParams<{ slug: string }>();
    const [content, setContent] = useState<ArticleContent | null>(null);
    const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if(!slug) return;

		const ac = new AbortController();

		getArticle(slug)
			.then(setContent)
			.catch((e) => setError(e instanceof Error ? e.message : String(e)))
			.finally(() => setLoading(false));
		return () => ac.abort();
	}, [slug])
    useEffect(() => {
        if (!slug) return;
        getArticle(slug)
            .then(setContent)
            .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    }, [slug]);

	const remarkPlugins = useMemo(() => {
		return content?.meta.math ? [remarkGfm, remarkMath] : [remarkGfm];
	}, [content?.meta.math]);
	const rehypePlugins = useMemo(() => {
    	if (!content?.meta.math) return [[rehypeSanitize, defaultSchema]] as any;
    	// katex 後に sanitize（katex出力を許可設定付きでsanitize）
    	return [rehypeKatex, [rehypeSanitize, katexSanitizeSchema]] as any;
  	}, [content?.meta.math]);

    return (
			<div>
				<div style={{ marginBottom: 12 }}>
					<Link to="/">← Back</Link>
				</div>
				
				{loading ? <div>Loading...</div> : null}
				{error ? <pre>{error}</pre> : null}
				
				{content ? (
				<article className="md">
					<ReactMarkdown
					remarkPlugins={remarkPlugins}
					rehypePlugins={rehypePlugins}
					components={{
						code({ className, children, ...props }) {
							const match = /language-([a-zA-Z0-9_-]+)/.exec(className || "");
							const lang = match?.[1];

							// ```python 等の言語指定 -> コードブロック
							if(lang) {
								return (
									<SyntaxHighlighter
									language={lang}
									style={oneDark}
									PreTag="div"
									>
										{String(children).replace(/\n$/, "")}
									</SyntaxHighlighter>
								);
							}
							// 言語指定なし -> そのまま
							return (
								<code className={className} {...props}>{children}</code>
							);
						}
					}}>
						{content.body}
					</ReactMarkdown>
				</article>
		) : null}
		</div>
	);
}