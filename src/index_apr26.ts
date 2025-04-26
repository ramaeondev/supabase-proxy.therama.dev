interface Env {
  SUPABASE_URL: string;
  SUPABASE_API_KEY: string;
}

function getCorsHeaders() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey");
  headers.set("Access-Control-Allow-Credentials", "true");
  return headers;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { SUPABASE_URL, SUPABASE_API_KEY } = env;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    const url = new URL(request.url);
    const proxyUrl = `${SUPABASE_URL}${url.pathname}${url.search}`;

    const incomingHeaders = new Headers(request.headers);
    const authHeader = incomingHeaders.get("Authorization");

    const headers = new Headers(request.headers);

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // User is logged in, forward the JWT
      headers.set("Authorization", authHeader);
    } else {
      // No user token, fallback to service role
      headers.set("Authorization", `Bearer ${SUPABASE_API_KEY}`);
    }

    headers.set("apikey", SUPABASE_API_KEY);

    const response = await fetch(proxyUrl, {
      method: request.method,
      headers,
      body: request.body,
    });

    const newHeaders = new Headers(response.headers);
    getCorsHeaders().forEach((value, key) => newHeaders.set(key, value));

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};
