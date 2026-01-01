---
title: "My Journey Learning Next.js"
date: "2024-01-20"
excerpt: "Exploring the powerful features of Next.js and why it's become my go-to framework for building React applications."
coverImage: "/images/dev.png"
tags: ["nextjs", "react", "webdev"]
---

# My Journey Learning Next.js

Next.js has transformed the way I build web applications. In this post, I'll share my experience learning this powerful framework.

## What is Next.js?

Next.js is a React framework that provides:

1. **Server-Side Rendering (SSR)** - Better SEO and faster initial load
2. **Static Site Generation (SSG)** - Pre-rendered pages at build time
3. **API Routes** - Build your backend in the same project
4. **File-based Routing** - Intuitive page structure

## Key Features I Love

### App Router

The new App Router in Next.js 13+ is amazing:

```typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }) {
  return <article>{params.slug}</article>;
}
```

### Server Components

React Server Components reduce client-side JavaScript:

```tsx
// This runs on the server!
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <main>{data.title}</main>;
}
```

## Challenges I Faced

- Understanding the difference between client and server components
- Learning when to use `'use client'` directive
- Grasping the new data fetching patterns

## Resources That Helped

- [Next.js Documentation](https://nextjs.org/docs)
- [Lee Robinson's YouTube Channel](https://www.youtube.com/@leerob)
- [Vercel's Templates](https://vercel.com/templates)

## Conclusion

Next.js has a learning curve, but the benefits are worth it. The developer experience is excellent, and the performance optimizations are built-in.

Happy coding!
