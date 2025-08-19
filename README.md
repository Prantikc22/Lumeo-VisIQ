# VisitorIQ Monorepo

## Structure

- `apps/web`: Next.js 14 (TypeScript, App Router, Tailwind) — Dashboard & API
- `packages/sdk`: VisitorIQ JS SDK (TypeScript, UMD bundle via tsup)
- `supabase/migrations`: Database schema and migrations

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies
```sh
npm install
```

### Local development
#### Web dashboard/API
```sh
cd apps/web
npm run dev
```

#### SDK development
```sh
cd packages/sdk
npm run dev
```

#### Build SDK (UMD)
```sh
cd packages/sdk
npm run build
# Output: dist/visitoriq.min.js
```

### Environment Variables
Copy `.env.example` to `.env` at the root and fill in values:
```sh
cp .env.example .env
```

### Database (Supabase)
- Use the SQL in `supabase/migrations/001_init.sql` to initialize your database.

### ThumbmarkJS OSS
- ThumbmarkJS is not available on npm. Download or build it from the [ThumbmarkJS OSS repo](https://github.com/Thumbmark/ThumbmarkJS) and include it as a local file or via CDN in your SDK build if needed.

### Linting & Formatting
```sh
cd apps/web
npm run lint
```

### Deployment
- Deploy `apps/web` as a Next.js app to Vercel, Netlify, or your preferred platform.
- Serve the SDK (`dist/visitoriq.min.js`) via CDN or static hosting.

---

## Contact
For issues or questions, contact the maintainer.
