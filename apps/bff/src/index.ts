export default {
	async fetch(_req: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(_req.url);

		// GET /api/articles -> hello
		if(url.pathname === "/api/articles" && _req.method === "GET") {
			return new Response(JSON.stringify({ hello: "hello" }), {
				status: 200,
				headers: {
					"content-type": "application/JSON; charset=utf-8",
					"access-control-allow-origin": "*"
				}
			});
		}

		// OPTIONS (CORS preflight) も一応返す
   		 if (url.pathname.startsWith("/api/") && _req.method === "OPTIONS") {
     		return new Response(null, {
        		status: 204,
        		headers: {
          			"access-control-allow-origin": "*",
          			"access-control-allow-methods": "GET,OPTIONS",
         			"access-control-allow-headers": "content-type",
          			"access-control-max-age": "86400"
        		}
      		});
    	}
		
	    return new Response("Not Found", { status: 404 });
	}
}
