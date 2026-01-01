# Blog Project - TODO & Implementation Guide

## Completed Tasks

- [x] Install markdown dependencies (gray-matter, react-markdown, remark-gfm, date-fns)
- [x] Create `/posts` folder with sample markdown files
- [x] Create markdown utility functions (`lib/posts.ts`)
- [x] Set up dynamic routing (`/blog/[slug]`)
- [x] Redesign Article card component with images, tags, dates
- [x] Improve HomePage layout with gradient title and grid
- [x] Create blog detail page with markdown rendering
- [x] Update Header component with proper navigation
- [x] Enhance theme and global styles
- [x] Update metadata and layout
- [x] Create About page
- [x] Update Footer component

---

## Future Improvements

### High Priority

#### 1. Add Search Functionality
**File to create:** `app/components/SearchBar.tsx`
```tsx
// Use useState to filter posts by title/content
// Add to HomePage Body.tsx
```

#### 2. Add Tag Filtering
**Files to modify:** `app/pages/HomePage/Body.tsx`
```tsx
// Add clickable tags that filter posts
// Create /app/tags/[tag]/page.tsx for tag pages
```

#### 3. Add Pagination
**File to modify:** `lib/posts.ts`
```typescript
export function getPaginatedPosts(page: number, limit: number = 6) {
  const posts = getAllPosts();
  const start = (page - 1) * limit;
  return {
    posts: posts.slice(start, start + limit),
    totalPages: Math.ceil(posts.length / limit),
    currentPage: page,
  };
}
```

#### 4. Add RSS Feed
**File to create:** `app/feed.xml/route.ts`
```typescript
import { getAllPosts } from "@/lib/posts";

export async function GET() {
  const posts = getAllPosts();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>My Blog</title>
        <link>https://yourdomain.com</link>
        <description>My daily blog</description>
        ${posts.map(post => `
          <item>
            <title>${post.title}</title>
            <link>https://yourdomain.com/blog/${post.slug}</link>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            <description>${post.excerpt}</description>
          </item>
        `).join('')}
      </channel>
    </rss>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

### Medium Priority

#### 5. Add Dark Mode
**Files to modify:**
- `app/theme.ts` - Add dark theme palette
- `app/components/Header.tsx` - Add toggle button
- `app/layout.tsx` - Wrap with context provider

```tsx
// In theme.ts, create both themes:
export const lightTheme = createTheme({ palette: { mode: 'light', ... } });
export const darkTheme = createTheme({ palette: { mode: 'dark', ... } });

// Create ThemeContext for toggling
```

#### 6. Add Reading Time Estimate
**File to modify:** `lib/posts.ts`
```typescript
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
```

#### 7. Add Related Posts
**File to modify:** `lib/posts.ts`
```typescript
export function getRelatedPosts(currentSlug: string, limit: number = 3) {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllPosts().filter(p => p.slug !== currentSlug);
  // Score by matching tags
  return allPosts
    .map(post => ({
      ...post,
      score: post.tags.filter(t => currentPost.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

#### 8. Add Table of Contents
**File to create:** `app/components/TableOfContents.tsx`
```tsx
// Parse headings from markdown content
// Display as sticky sidebar on blog post pages
```

#### 9. Add Syntax Highlighting for Code Blocks
**Install:** `npm install rehype-highlight`
**File to modify:** `app/blog/[slug]/BlogPost.tsx`
```tsx
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
>
```

### Low Priority

#### 10. Add Comments (using Giscus)
**File to create:** `app/components/Comments.tsx`
```tsx
// Use Giscus (GitHub Discussions based comments)
// Add to blog post pages
```

#### 11. Add Newsletter Subscription
**File to create:** `app/components/Newsletter.tsx`
```tsx
// Simple email input form
// Integrate with Mailchimp, ConvertKit, or Buttondown
```

#### 12. Add SEO Improvements
**File to modify:** `app/blog/[slug]/page.tsx`
```tsx
export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

#### 13. Add Sitemap
**File to create:** `app/sitemap.ts`
```typescript
import { getAllPosts } from "@/lib/posts";

export default function sitemap() {
  const posts = getAllPosts();
  const postUrls = posts.map(post => ({
    url: `https://yourdomain.com/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [
    { url: 'https://yourdomain.com', lastModified: new Date() },
    { url: 'https://yourdomain.com/about', lastModified: new Date() },
    ...postUrls,
  ];
}
```

#### 14. Add Image Optimization
- Use Next.js `<Image>` component instead of `<img>`
- Store images in `/public/images/posts/[slug]/`
- Update coverImage paths in markdown frontmatter

#### 15. Add Analytics
- Integrate Vercel Analytics or Google Analytics
- Add to `app/layout.tsx`

---

## Project Structure

```
blog/
├── app/
│   ├── about/
│   │   └── page.tsx
│   ├── blog/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── BlogPost.tsx
│   ├── components/
│   │   ├── Article.tsx
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── pages/
│   │   └── HomePage/
│   │       ├── index.tsx
│   │       └── Body.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── theme.ts
├── lib/
│   └── posts.ts
├── posts/
│   ├── hello-world.md
│   ├── learning-nextjs.md
│   └── productivity-tips.md
├── public/
│   └── images/
└── docs/
    └── TODO.md
```

---

## How to Add a New Blog Post

1. Create a new `.md` file in `/posts/` folder
2. Add frontmatter at the top:

```markdown
---
title: "Your Post Title"
date: "2024-01-30"
excerpt: "A brief description of your post"
coverImage: "/images/dev.png"
tags: ["tag1", "tag2"]
---

# Your content here

Write your blog post using markdown...
```

3. Run `npm run dev` - the post will automatically appear!

---

## Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Dependencies Added

```json
{
  "gray-matter": "^4.x",      // Parse markdown frontmatter
  "react-markdown": "^9.x",   // Render markdown as React
  "remark-gfm": "^4.x",       // GitHub Flavored Markdown
  "date-fns": "^3.x"          // Date formatting
}
```
