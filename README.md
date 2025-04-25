# Supabase Proxy (api.therama.dev)

A proxy server deployed on Cloudflare Workers to handle `api.therama.dev` calls. This project forwards API requests to Supabase, managing authentication and CORS for secure and seamless integration with frontend applications.

## Features
- **API Proxy**: Forwards requests to Supabase, handling authentication tokens.
- **CORS Support**: Automatically manages CORS headers for cross-origin requests.
- **Cloudflare Worker**: Deployed on Cloudflare's edge network for low-latency and high-availability.

## Technologies Used
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Supabase](https://supabase.com/)
- TypeScript

## How It Works
- Incoming requests are received by the Worker.
- If the request contains a user JWT (Bearer token), it is forwarded to Supabase.
- If not, the Worker falls back to using the Supabase service role key for authorization.
- CORS headers are automatically added to all responses.

## Project Structure
```
/ ├── src/           # Worker source code
│   └── index.ts     # Main entry point
├── test/            # Tests
├── package.json     # Project metadata and dependencies
├── wrangler.jsonc   # Cloudflare Worker config
└── ...
```

## Setup & Development
1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Configure Environment**
   - Set your `SUPABASE_URL` and `SUPABASE_API_KEY` in your Wrangler or environment config.
3. **Run locally**
   ```sh
   npx wrangler dev
   ```
4. **Deploy**
   ```sh
   npx wrangler publish
   ```

## API
All requests to this proxy are forwarded to your Supabase backend. Pass user JWTs as Bearer tokens in the `Authorization` header for authenticated requests.

## License
MIT

## Author
[Ramaeon](https://github.com/ramaeondev)
