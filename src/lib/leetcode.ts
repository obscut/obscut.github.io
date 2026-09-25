import { leetcode as cfg } from '../../site.config';

/**
 * 支持两个站点：
 *  - cn  力扣中国站 leetcode.cn（默认，你的账号在这里）
 *  - com LeetCode 国际站 leetcode.com
 * 两站账号体系独立，接口也不同，不能混用。
 */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export interface RecentSubmission {
  title: string;
  slug: string;
  ts: number;
  lang?: string;
}

export interface LangCount {
  name: string;
  count: number;
}

export interface LeetCodeData {
  ok: boolean;
  site: 'cn' | 'com';
  username: string;
  realName?: string;
  /** 已解决题目数 */
  total: number;
  /** 难度分布；力扣中国站公开接口不提供，此时 hasDifficulty = false */
  easy: number;
  medium: number;
  hard: number;
  hasDifficulty: boolean;
  /** 总提交次数 */
  submissions?: number;
  /** 通过率（百分比，保留一位小数） */
  acceptance?: number;
  /** 按语言统计的解题数 */
  languages: LangCount[];
  /** 连续打卡天数 / 今年累计活跃天数 */
  streak?: number;
  activeDays?: number;
  recent: RecentSubmission[];
  fetchedAt: string | null;
}

function empty(): LeetCodeData {
  const f = cfg.fallback;
  return {
    ok: false,
    site: cfg.site,
    username: cfg.username,
    total: f.total,
    easy: f.easy,
    medium: f.medium,
    hard: f.hard,
    hasDifficulty: false,
    languages: [],
    recent: [],
    fetchedAt: null,
  };
}

async function gql(
  url: string,
  query: string,
  variables: Record<string, unknown>,
  referer: string
): Promise<any | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: referer,
        Origin: url.startsWith('https://leetcode.cn')
          ? 'https://leetcode.cn'
          : 'https://leetcode.com',
        'User-Agent': UA,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12000),
    });
    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/** 力扣中国站 */
async function fetchCN(username: string): Promise<LeetCodeData | null> {
  const home = `https://leetcode.cn/u/${username}/`;
  const OLD = 'https://leetcode.cn/graphql/';
  const NOJ = 'https://leetcode.cn/graphql/noj-go/';

  // 1) 通过数 / 提交数 / 昵称
  const q1 = `query($s: String!) {
    userProfilePublicProfile(userSlug: $s) {
      profile { realName userSlug }
      submissionProgress { acTotal totalSubmissions }
    }
  }`;
  const j1 = await gql(OLD, q1, { s: username }, home);
  const pp = j1?.data?.userProfilePublicProfile;
  if (!pp) return null;

  const acTotal: number = pp?.submissionProgress?.acTotal ?? 0;
  const totalSub: number = pp?.submissionProgress?.totalSubmissions ?? 0;

  // 2) 语言分布 + 最近通过
  const q2 = `query($s: String!) {
    userLanguageProblemCount(userSlug: $s) { languageName problemsSolved }
    recentACSubmissions(userSlug: $s) { submitTime lang question { title titleSlug } }
  }`;
  const j2 = await gql(NOJ, q2, { s: username }, home);

  const languages: LangCount[] = (j2?.data?.userLanguageProblemCount ?? [])
    .filter((x: any) => x && x.problemsSolved > 0)
    .sort((a: any, b: any) => b.problemsSolved - a.problemsSolved)
    .map((x: any) => ({ name: x.languageName, count: x.problemsSolved }));

  const recent: RecentSubmission[] = (j2?.data?.recentACSubmissions ?? [])
    .slice(0, cfg.recentLimit)
    .map((x: any) => ({
      title: x?.question?.title ?? '',
      slug: x?.question?.titleSlug ?? '',
      ts: Number(x?.submitTime ?? 0),
      lang: x?.lang ?? undefined,
    }))
    .filter((x) => x.title);

  // 3) 打卡日历（失败也不影响）
  const j3 = await gql(
    NOJ,
    `query($s: String!, $y: Int!) { userCalendar(userSlug: $s, year: $y) { streak totalActiveDays } }`,
    { s: username, y: new Date().getFullYear() },
    home
  );
  const cal = j3?.data?.userCalendar;

  return {
    ok: true,
    site: 'cn',
    username: pp?.profile?.userSlug || username,
    realName: pp?.profile?.realName || undefined,
    total: acTotal,
    easy: 0,
    medium: 0,
    hard: 0,
    hasDifficulty: false,
    submissions: totalSub,
    acceptance: totalSub > 0 ? Math.round((acTotal / totalSub) * 1000) / 10 : undefined,
    languages,
    streak: cal?.streak ?? undefined,
    activeDays: cal?.totalActiveDays ?? undefined,
    recent,
    fetchedAt: new Date().toISOString(),
  };
}

/** LeetCode 国际站 */
async function fetchCOM(username: string): Promise<LeetCodeData | null> {
  const url = 'https://leetcode.com/graphql/';
  const q = `query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { realName ranking }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
    }
    recentSubmissionList(username: $username, limit: 20) { title titleSlug timestamp lang }
  }`;
  const j = await gql(url, q, { username }, `https://leetcode.com/${username}/`);
  const mu = j?.data?.matchedUser;
  if (!mu) return null;

  const nums: { difficulty: string; count: number }[] =
    mu?.submitStatsGlobal?.acSubmissionNum ?? [];
  const pick = (d: string) => nums.find((x) => x.difficulty === d)?.count ?? 0;

  return {
    ok: true,
    site: 'com',
    username: mu.username,
    realName: mu?.profile?.realName || undefined,
    total: pick('All'),
    easy: pick('Easy'),
    medium: pick('Medium'),
    hard: pick('Hard'),
    hasDifficulty: true,
    languages: [],
    recent: (j?.data?.recentSubmissionList ?? [])
      .slice(0, cfg.recentLimit)
      .map((x: any) => ({
        title: x?.title ?? '',
        slug: x?.titleSlug ?? '',
        ts: Number(x?.timestamp ?? 0),
        lang: x?.lang ?? undefined,
      }))
      .filter((x) => x.title),
    fetchedAt: new Date().toISOString(),
  };
}

/** 用户名变体：主页显示的是昵称，接口要的是用户名 */
function variants(raw: string): string[] {
  const t = raw.trim();
  const list = [
    t,
    t.replace(/\s+/g, '-'),
    t.replace(/\s+/g, ''),
    t.replace(/\s+/g, '_'),
    t.toLowerCase().replace(/\s+/g, '-'),
    t.toLowerCase().replace(/\s+/g, ''),
  ];
  return [...new Set(list.filter(Boolean))];
}

export async function getLeetCodeData(): Promise<LeetCodeData> {
  const key = '__leetcodeData__';
  const g = globalThis as unknown as Record<string, Promise<LeetCodeData> | undefined>;
  if (g[key]) return g[key];

  const task = (async () => {
    const fetcher = cfg.site === 'cn' ? fetchCN : fetchCOM;
    for (const v of variants(cfg.username)) {
      const data = await fetcher(v);
      if (data) return data;
    }
    return empty();
  })();

  g[key] = task;
  return task;
}

export function profileUrl(username: string): string {
  return cfg.site === 'cn'
    ? `https://leetcode.cn/u/${username}/`
    : `https://leetcode.com/u/${username}/`;
}

export function problemUrl(slug: string): string {
  return cfg.site === 'cn'
    ? `https://leetcode.cn/problems/${slug}/`
    : `https://leetcode.com/problems/${slug}/`;
}

/** 秒级时间戳 → YYYY-MM-DD */
export function formatDate(ts: number): string {
  if (!ts || Number.isNaN(ts)) return '—';
  const d = new Date(ts * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

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
  };
  return map[lang] ?? lang;
}
