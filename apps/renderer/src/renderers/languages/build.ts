import { DISPLAYNAME } from "../../constants";
import { loadDataSISO } from "../../utils/load-data";
import { LanguagesProcessed } from "@gh-stats/types";
import { GitHubLanguageCardData } from "../../types/card-data";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  Go: "#00ADD8",
  CSharp: "#178600",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

export async function buildCardData(): Promise<GitHubLanguageCardData> {
  const languages = await loadDataSISO<LanguagesProcessed>("languages");

  return {
    displayName: DISPLAYNAME,

    languages: languages.topLanguages.slice(0, 12).map((lang) => ({
      name: lang.language,
      bytes: lang.bytes,
      share: lang.byteShare,
      color: LANGUAGE_COLORS[lang.language] ?? "#888888",
    })),
  };
}
