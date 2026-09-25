import { leetcode as cfg } from '../../site.config';

export interface RecentSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay?: string;
  lang?: string;
}

export interface LeetCodeData {
  /** 是否成功从官方接口取到数据 */
  ok: boolean;
  username: string;
  realName?: string;
  ranking?: number | null;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  recent: RecentSubmission[];
  /** 数据抓取时间，ISO 字符串；兜底时为 null */
  fetchedAt: string | null;
}

const QUERY = `query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { realName ranking userAvatar }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  recentSubmissionList(username: $username, limit: 20) {
    title
    titleSlug
    timestamp
    statusDisplay
    lang
  }
}`;

/**
 * 用户名变体。LeetCode 主页上显示的是「昵称」（可能带空格），
 * 而接口需要的是用户名 slug，两者经常不一致，这里挨个试。
 */
function variants(raw: string): string[] {
  const t = raw.trim();
  const list = [
    t,
    t.replace(/\s+/g, '-'),
    t.replace(/\s+/g, ''),
    t.replace(/\s+/g, '_'),
    t.toLowerCase().replace(/\s+/g, '-'),
    t.toLowerCase().replace(/\s+/g, ''),
    t.replace(/[^a-zA-Z0-9_-]/g, ''),
  ];
  return [...new Set(list.filter(Boolean))];
}

function pickCount(list: { difficulty: string; count: number }[] | undefined, d: string) {
  return list?.find((x) => x.difficulty === d)?.count ?? 0;
}

async function fetchOne(username: string): Promise<LeetCodeData | null> {
  try {
    const res = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `https://leetcode.com/${username}/`,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
      body: JSON.stringify({ query: QUERY, variables: { username } }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: {
        matchedUser?: {
          username: string;
          profile?: { realName?: string; ranking?: number };
          submitStatsGlobal?: {
            acSubmissionNum?: { difficulty: string; count: number }[];
          };
        };
        recentSubmissionList?: RecentSubmission[] | null;
      };
    };

    const mu = json?.data?.matchedUser;
    if (!mu) return null;

    const nums = mu.submitStatsGlobal?.acSubmissionNum;
    return {
      ok: true,
      username: mu.username,
      realName: mu.profile?.realName || undefined,
      ranking: mu.profile?.ranking ?? null,
      total: pickCount(nums, 'All'),
      easy: pickCount(nums, 'Easy'),
      medium: pickCount(nums, 'Medium'),
      hard: pickCount(nums, 'Hard'),
      recent: (json.data?.recentSubmissionList ?? []).slice(0, cfg.recentLimit),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function fallback(): LeetCodeData {
  const f = cfg.fallback;
  return {
    ok: false,
    username: cfg.username,
    total: f.total,
    easy: f.easy,
    medium: f.medium,
    hard: f.hard,
    recent: [],
    fetchedAt: null,
  };
}

/**
 * 取 LeetCode 数据。构建时调用一次，结果在页面间复用。
 * 任何网络问题都不会让构建失败 —— 降级到兜底数据。
 */
export async function getLeetCodeData(): Promise<LeetCodeData> {
  const cacheKey = '__leetcodeData__';
  const g = globalThis as unknown as Record<string, Promise<LeetCodeData> | undefined>;
  if (g[cacheKey]) return g[cacheKey];

  const task = (async () => {
    for (const v of variants(cfg.username)) {
      const data = await fetchOne(v);
      if (data) return data;
    }
    return fallback();
  })();

  g[cacheKey] = task;
  return task;
}

/** 把秒级时间戳格式化成 YYYY-MM-DD */
export function formatDate(ts: string | number): string {
  const n = typeof ts === 'string' ? Number(ts) : ts;
  if (!n || Number.isNaN(n)) return '—';
  const d = new Date(n * 1000);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 语言代号美化 */
export function prettyLang(lang?: string): string {
  if (!lang) return '';
  const map: Record<string, string> = {
    cpp: 'C++',
    java: 'Java',
    python: 'Python',
    python3: 'Python3',
    c: 'C',
    csharp: 'C#',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    golang: 'Go',
    rust: 'Rust',
    kotlin: 'Kotlin',
    swift: 'Swift',
    ruby: 'Ruby',
    scala: 'Scala',
    mysql: 'MySQL',
    mssql: 'MSSQL',
    oraclesql: 'Oracle',
    pythondata: 'Python',
  };
  return map[lang] ?? lang;
}
