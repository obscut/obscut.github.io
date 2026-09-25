/**
 * 全站唯一的内容配置文件。
 * 改这里就够了 —— 页面、导航、页脚、SEO 全部自动生效。
 */

export const site = {
  /** 浏览器标签页标题 */
  title: 'Ting',
  /** 显示名 */
  name: 'Ting',
  /** 一句话身份 */
  role: '软件工程 · 25 级本科',
  affiliation: '大连理工大学',
  location: '辽宁 · 大连',
  /** 首屏状态小标，留空则不显示 */
  status: '本科在读 · 关注 LLM Agent',
  /** SEO 描述 */
  description:
    '大连理工大学软件工程专业本科生，关注 LLM Agent 与大模型应用。记录学习、研究与实践。',
  /** 语言 */
  lang: 'zh-CN',
  /** 邮箱，留空则不显示 */
  email: '',
  /** 头像：放到 public/ 下，比如 public/avatar.jpg，然后填 '/avatar.jpg'；留空用文字 logo */
  avatar: '',
};

/** 首页首屏下方的一句话自我介绍（支持多段） */
export const intro: string[] = [
  '大连理工大学软件工程专业 25 级本科生。',
  '目前主要在做 LLM Agent 相关的学习和实践，也会刷点题、写点东西。',
  '这个站点用来放我的博客、研究笔记、项目和简历。',
];

/** 外链 */
export const links: { label: string; href: string }[] = [
  { label: 'GitHub', href: 'https://github.com/obscut' },
  { label: '力扣', href: 'https://leetcode.cn/u/nora_xu/' },
  // { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=xxxx' },
  // { label: '知乎', href: 'https://www.zhihu.com/people/xxxx' },
  // { label: 'Twitter / X', href: 'https://x.com/xxxx' },
];

/** 导航（顺序即显示顺序） */
export const nav: { label: string; href: string }[] = [
  { label: '首页', href: '/' },
  { label: '研究', href: '/research/' },
  { label: '论文', href: '/publications/' },
  { label: '项目', href: '/projects/' },
  { label: '博客', href: '/blog/' },
  { label: '刷题', href: '/leetcode/' },
  { label: '简历', href: '/cv/' },
];

/** 研究方向 */
export const research: {
  title: string;
  summary: string;
  tags: string[];
}[] = [
  {
    title: 'LLM Agent',
    summary:
      '关注大模型智能体的任务规划、工具调用与长程记忆，以及在真实场景下的可靠性与可观测性。',
    tags: ['Agent', 'Tool Use', 'Planning'],
  },
  {
    title: '大模型推理与对齐',
    summary:
      '关注推理效率、指令跟随与对齐方法，以及如何在有限算力下把模型能力用满。',
    tags: ['LLM', 'Alignment'],
  },
  {
    title: '代码智能',
    summary: '关注代码生成、仓库级理解与自动修复，让模型真正参与到工程流程里。',
    tags: ['Code', 'Software Engineering'],
  },
];

/** 论文列表（没有就删掉数组里的条目，页面会自动显示空状态） */
export const publications: {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  /** 'preprint' | 'conference' | 'journal' | 'workshop' */
  type: string;
  links?: { label: string; href: string }[];
  note?: string;
}[] = [
  // ⬇️ 下面这条是示例，换成你自己的，或者直接删掉
  // {
  //   title: '论文标题',
  //   authors: ['Ting', 'Co-author'],
  //   venue: 'arXiv preprint',
  //   year: 2026,
  //   type: 'preprint',
  //   links: [
  //     { label: 'PDF', href: '#' },
  //     { label: 'Code', href: '#' },
  //   ],
  //   note: '（示例条目，请替换）',
  // },
];

/** 项目列表 */
export const projects: {
  name: string;
  description: string;
  stack: string[];
  href?: string;
  year: string;
  highlight?: boolean;
}[] = [
  {
    name: '示例项目 A',
    description: '一句话说明这个项目解决了什么问题、你做了什么、结果如何。',
    stack: ['Python', 'LLM'],
    href: 'https://github.com/obscut',
    year: '2026',
    highlight: true,
  },
  {
    name: '示例项目 B',
    description: '一句话说明这个项目解决了什么问题、你做了什么、结果如何。',
    stack: ['TypeScript', 'Web'],
    href: 'https://github.com/obscut',
    year: '2025',
  },
  {
    name: '示例项目 C',
    description: '一句话说明这个项目解决了什么问题、你做了什么、结果如何。',
    stack: ['C++', 'Algorithm'],
    year: '2025',
  },
];

/** 时间线（教育 / 实习 / 获奖），按时间倒序 */
export const timeline: {
  period: string;
  title: string;
  org: string;
  description?: string;
}[] = [
  {
    period: '2025.09 — 至今',
    title: '软件工程 · 本科',
    org: '大连理工大学',
    description: '本科在读。',
  },
  // {
  //   period: '2026.07 — 2026.09',
  //   title: '实习岗位',
  //   org: '某公司',
  //   description: '做了什么。',
  // },
];

/** 简历页用的技能清单 */
export const skills: { group: string; items: string[] }[] = [
  { group: '语言', items: ['Python', 'C++', 'TypeScript / JavaScript', 'SQL'] },
  { group: '框架 / 工具', items: ['PyTorch', 'Git', 'Docker', 'Linux'] },
  { group: '方向', items: ['LLM Agent', '大模型应用', '算法与数据结构'] },
];

/** LeetCode 配置 */
export const leetcode = {
  /**
   * 站点：'cn' = 力扣中国站 leetcode.cn；'com' = LeetCode 国际站 leetcode.com。
   * 两站账号不互通，填错了会抓不到数据。
   */
  site: 'cn' as 'cn' | 'com',
  /**
   * 用户名，不是主页上显示的昵称。
   * 力扣中国站：个人主页地址 leetcode.cn/u/xxx/ 里的 xxx。
   * 程序会自动试几种常见变体，抓不到就用下面的兜底数据。
   */
  username: 'nora_xu',
  /** 联网失败时的兜底数据，避免构建挂掉；也可以手动填真实数字 */
  fallback: {
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  },
  /** 首页/刷题页展示的最近提交条数 */
  recentLimit: 8,
};
