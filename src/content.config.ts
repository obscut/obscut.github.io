import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 博客文章：把 .md 文件丢进 src/content/blog/ 即可自动收录。
 * 文件名建议 YYYY-MM-DD-title.md。
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** 草稿：生产构建时会自动隐藏 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
