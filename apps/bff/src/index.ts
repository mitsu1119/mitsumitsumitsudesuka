import { articleIndex } from "./generated/articles";

export default {
	async fetch(_req: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(_req.url);

		// GET /api/articles -> articlesIndex
		if(url.pathname === "/api/articles" && _req.method === "GET") {
			return new Response(JSON.stringify(articleIndex, null, 2), {
				headers: { "content-type": "application/json; charset=utf-8" }
			});
		}

	    return new Response("Not Found", { status: 404 });
	}
};
