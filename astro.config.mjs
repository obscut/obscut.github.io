// Astro 配置
// 仓库名为 <用户名>.github.io 时，站点在根路径，不需要配置 base。
// 若将来改成项目仓库（如 /blog/），把下面 base 的注释打开并填写仓库名。
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://obscut.github.io',
  // base: '/仓库名',
  // 输出纯静态站点，GitHub Pages 可直接托管
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
