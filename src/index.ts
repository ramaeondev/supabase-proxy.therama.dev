// Environment variables expected by the worker
// SUPABASE_URL: URL of the Supabase instance
// SUPABASE_API_KEY: API key for Supabase

function getCorsHeaders() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version, x-client-version");
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Max-Age", "86400"); // 24 hours
  return headers;
}

export default {
  async fetch(request, env) {
    const { SUPABASE_URL, SUPABASE_API_KEY } = env;

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    const url = new URL(request.url);
    const targetUrl = `${SUPABASE_URL}${url.pathname}${url.search}`;

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

    // Always include the API key
    headers.set("apikey", SUPABASE_API_KEY);

    // Forward Supabase-specific headers
    const clientInfo = incomingHeaders.get("x-client-info");
    if (clientInfo) {
      headers.set("x-client-info", clientInfo);
    }

    const apiVersion = incomingHeaders.get("x-supabase-api-version");
    if (apiVersion) {
      headers.set("x-supabase-api-version", apiVersion);
    }

    const clientVersion = incomingHeaders.get("x-client-version");
    if (clientVersion) {
      headers.set("x-client-version", clientVersion);
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      });

      const newHeaders = new Headers(response.headers);
      getCorsHeaders().forEach((value, key) => newHeaders.set(key, value));

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...getCorsHeaders(),
          "Content-Type": "application/json",
        },
      });
    }
  },
};
