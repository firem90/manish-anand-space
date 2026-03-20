# Manish Anandaeswaran — Portfolio

Fast, minimal, text-forward portfolio website built with Next.js 14 App Router, Tailwind CSS, TypeScript, and MDX.

## Overview

The site is designed to feel like an engineer's public notebook. It uses a strict design system (monochrome plus an amber accent) and zero non-essential animations. 

- **Stack**: Next.js 14, Tailwind v4, MDX (@next/mdx)
- **Features**: 
  - Dynamic Markdown rendering for blog posts
  - Excalidraw integration for architecture diagrams (`<Diagram />` MDX component)
  - Upstash Redis per-post view counter
  - Resend contact form integration
  - CSS-only mobile navigation (no JS required for the hamburger menu)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Upstash Redis (for blog view counts)
# Get this from https://upstash.com/
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend (for the contact form)
# Get this from https://resend.com/
RESEND_API_KEY=
```

*Note: The app will run without these variables. The view counter will fall back to a mock random number, and the contact form will simulate a 1-second network success.*

## Managing Content

All content is driven locally by files in the `src/content/` directory.

### Adding a Blog Post

Create an `.mdx` file in `src/content/blog/`. Ensure you include the frontmatter block at the very top:

```markdown
---
title: "Your Post Title"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
summary: "A short one or two sentence description."
---

Your markdown content goes here.
```

### Adding a TIL Entry

Append to the array in `src/content/til/til.json`. Keep the `content` field to 1-3 sentences.

### Adding a Book

Append to the array in `src/content/books/books.json`. The application automatically pulls the cover image using the OpenLibrary Covers API via the provided `isbn`.

### Embedding an Excalidraw Diagram

1. Create your diagram at [excalidraw.com](https://excalidraw.com).
2. Export as `.excalidraw` (JSON format).
3. Place the file in `public/content/diagrams/` or serve it via a custom Next.js API route if you want to keep them in `src`. *(Currently assuming you expose the JSON via `/api/diagrams/[file]` endpoint or similar)*.
4. Render it in MDX with: `<Diagram file="my-file-name" caption="My caption" />`

## Deployment

This application is ready to be deployed on Vercel. 
Simply push to GitHub, connect the repository to a new Vercel project, and provide the environment variables.

## Testing Checklist

Before deploying, verify:
- [x] Nav works at 375px without horizontal scroll
- [x] Blog post code blocks scroll horizontally on mobile
- [x] Excalidraw diagram contained and pannable on mobile
- [x] Bookshelf grid is 2 columns at 375px
- [x] All tap targets are at least 44px
- [x] Contact form submits correctly on mobile keyboard (no layout jump)
- [x] Reading progress bar visible on mobile
- [x] TIL search bar is full width on mobile
- [x] No text is smaller than 13px anywhere
