import type { GithubContext } from "@/lib/product-context";

const REPO_RE =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?(?:[?#].*)?$/i;

export function parseGithubRepoUrl(
  input: string
): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(REPO_RE);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/i, "") };
}

/**
 * Fetches public repo metadata + README excerpt (no OAuth).
 * Uses unauthenticated GitHub API (60 req/hr/IP) — fine for product briefs.
 */
export async function fetchPublicGithubContext(
  repoUrl: string
): Promise<GithubContext> {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) {
    throw new Error(
      "Enter a public GitHub URL like https://github.com/owner/repo"
    );
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "makeitrain-monetize",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const repoRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    { headers, next: { revalidate: 0 } }
  );
  if (repoRes.status === 404) {
    throw new Error("Repo not found. It must be public, or add a GITHUB_TOKEN.");
  }
  if (!repoRes.ok) {
    throw new Error(`GitHub returned ${repoRes.status}. Try again shortly.`);
  }
  const repo = (await repoRes.json()) as {
    full_name: string;
    description: string | null;
    default_branch: string | null;
    stargazers_count: number;
    language: string | null;
    topics?: string[];
    homepage: string | null;
    private?: boolean;
  };
  if (repo.private) {
    throw new Error("Private repos need a GitHub token with access. Use a public repo for now.");
  }

  let readme_excerpt = "";
  const readmeRes = await fetch(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`,
    { headers, next: { revalidate: 0 } }
  );
  if (readmeRes.ok) {
    const readme = (await readmeRes.json()) as {
      content?: string;
      encoding?: string;
    };
    if (readme.content && readme.encoding === "base64") {
      try {
        readme_excerpt = Buffer.from(readme.content, "base64")
          .toString("utf8")
          .slice(0, 4000);
      } catch {
        readme_excerpt = "";
      }
    }
  }

  return {
    fetched_at: new Date().toISOString(),
    full_name: repo.full_name,
    description: repo.description,
    default_branch: repo.default_branch,
    stars: repo.stargazers_count ?? 0,
    language: repo.language,
    topics: repo.topics ?? [],
    readme_excerpt,
    homepage: repo.homepage,
  };
}
