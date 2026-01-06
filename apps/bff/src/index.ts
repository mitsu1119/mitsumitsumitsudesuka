import { articleIndex, articleBodies } from "./generated/articles";

export interface Env {
	ALLOWED_ORIGINS: string;
}

function parseAllowedOrigins(value: string | undefined): string[] | "*" {
	const v = (value ?? "*").trim();
	if(v === "*") return "*";
	return v.split(",")
	.map((s) => s.trim())
	.filter(Boolean);
}

function corsHeaders(origin: string | null, allowed: string[] | "*"): Record<string, string> {
	if(!origin) return {};

	if(allowed === "*") {
		return { "access-control-allow-origin": "*" };
	}

	if(allowed.includes(origin)) {
		return {
			"access-control-allow-origin": origin,
			"vary": "Origin",
		};
	}

	return {};
}

function json(data: unknown, headers: Record<string, string> = {}, status = 200) {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			...headers,
		},
	});
}

export default {
	async fetch(_req: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(_req.url);

		const origin = _req.headers.get("origin");
		const allowed = parseAllowedOrigins(_env.ALLOWED_ORIGINS);
		const cors = corsHeaders(origin, allowed);

		if(url.pathname.startsWith("/api/") && _req.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					...cors,
					"access-control-allow-methods": "GET, OPTIONS",
					"access-control-allow-headers": "content-type",
					"access-control-max-age": "86400",
				},
			});
		}

		// GET /api/articles -> articlesIndex
		if(url.pathname === "/api/articles" && _req.method === "GET") {
			return json(articleIndex, cors);
		}

		// GET /api/articles/:slug -> body
		const m = url.pathname.match(/^\/api\/articles\/([^/]+)$/);
		if(m && _req.method === "GET") {
			const slug = decodeURIComponent(m[1]);
			const body = articleBodies[slug];
			if(body === undefined) return new Response("Not Found", { status: 404 });

			return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
		}

	    return new Response("Not Found", { status: 404 });
	}
};
