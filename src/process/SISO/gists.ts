import { GistFileRecord, GistRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "gists";

export async function process(): Promise<void> {
  const raw = await loadJson<GistRecord[]>(`data/raw/${processName}.json`);

  const now = new Date();

  const languageMap = new Map<
    string,
    {
      gists: number;
      files: number;
      size: number;
    }
  >();

  const typeMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let publicCount = 0;

  let totalComments = 0;

  let totalFiles = 0;

  let totalFileSize = 0;

  const gistAges: number[] = [];

  const updateAges: number[] = [];

  const fileCounts: number[] = [];

  const stats = raw.map((gist) => {
    const createdAt = new Date(gist.created_at);

    const updatedAt = new Date(gist.updated_at);

    const ageDays = daysBetween(createdAt, now);

    const updatedDaysAgo = daysBetween(updatedAt, now);

    gistAges.push(ageDays);

    updateAges.push(updatedDaysAgo);

    if (gist.public) {
      publicCount++;
    }

    totalComments += gist.comments;

    const fileStats = gist.files.map((file: GistFileRecord) => {
      const language = file.language ?? "Unknown";

      const type = file.type ?? "Unknown";

      const size = file.size ?? 0;

      totalFileSize += size;

      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);

      const existingLanguage = languageMap.get(language);

      if (existingLanguage) {
        existingLanguage.files += 1;
        existingLanguage.size += size;
      } else {
        languageMap.set(language, {
          gists: 0,
          files: 1,
          size,
        });
      }

      return {
        filename: file.filename,

        language: file.language,

        type: file.type,

        size: file.size,

        rawUrl: file.raw_url,
      };
    });

    const uniqueLanguages = new Set(
      fileStats.map((file) => file.language ?? "Unknown"),
    );

    for (const language of uniqueLanguages) {
      const existingLanguage = languageMap.get(language);

      if (existingLanguage) {
        existingLanguage.gists += 1;
      }
    }

    const fileCount = fileStats.length;

    totalFiles += fileCount;

    fileCounts.push(fileCount);

    const year = createdAt.getUTCFullYear();

    creationYears.set(year, (creationYears.get(year) ?? 0) + 1);

    return {
      id: gist.id,

      description: gist.description,

      public: gist.public,

      comments: gist.comments,

      createdYear: year,

      ageDays,

      updatedDaysAgo,

      fileCount,

      totalSize: fileStats.reduce((total, file) => total + (file.size ?? 0), 0),

      hasDescription: gist.description !== null,

      languages: [...uniqueLanguages],

      files: fileStats,
    };
  });

  const languageStats = [...languageMap.entries()]
    .map(([language, stats]) => ({
      language,

      gists: stats.gists,

      files: stats.files,

      totalSize: stats.size,

      averageFileSize: stats.files > 0 ? stats.size / stats.files : 0,
    }))
    .sort((a, b) => b.files - a.files);

  const typeStats = [...typeMap.entries()]
    .map(([type, count]) => ({
      type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, count]) => ({
      year,
      gists: count,
    }))
    .sort((a, b) => a.year - b.year);

  const averageGistAgeDays =
    gistAges.length > 0
      ? gistAges.reduce((a, b) => a + b, 0) / gistAges.length
      : 0;

  const averageUpdatedDays =
    updateAges.length > 0
      ? updateAges.reduce((a, b) => a + b, 0) / updateAges.length
      : 0;

  const averageFilesPerGist =
    fileCounts.length > 0
      ? fileCounts.reduce((a, b) => a + b, 0) / fileCounts.length
      : 0;

  const topCommentedGists = [...stats]
    .sort((a, b) => b.comments - a.comments)
    .slice(0, 25)
    .map((gist) => ({
      id: gist.id,
      comments: gist.comments,
      fileCount: gist.fileCount,
    }));

  const largestGists = [...stats]
    .sort((a, b) => b.totalSize - a.totalSize)
    .slice(0, 25)
    .map((gist) => ({
      id: gist.id,
      totalSize: gist.totalSize,
      fileCount: gist.fileCount,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalGists: raw.length,

      publicGists: publicCount,
      privateGists: raw.length - publicCount,

      totalComments,

      totalFiles,

      totalFileSize,

      averageComments: raw.length > 0 ? totalComments / raw.length : 0,

      averageFilesPerGist,

      averageFileSize: totalFiles > 0 ? totalFileSize / totalFiles : 0,

      averageGistAgeDays,

      averageUpdatedDays,
    },

    languages: languageStats,

    fileTypes: typeStats,

    creationTimeline,

    topCommentedGists,

    largestGists,
  });
}
