import { LabelRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { isDarkColor } from "../utils/color.js";

const processName = "labels";

export async function process(): Promise<void> {
  const raw = await loadJson<LabelRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const repoMap = new Map<
    string,
    {
      labels: number;
      defaultLabels: number;
    }
  >();

  const nameMap = new Map<string, number>();

  const colorMap = new Map<string, number>();

  let defaultLabels = 0;

  let customLabels = 0;

  let labelsWithDescription = 0;

  const descriptionLengths: number[] = [];

  const stats = raw.map((label) => {
    const descriptionLength = label.description?.length ?? 0;

    descriptionLengths.push(descriptionLength);

    if (label.is_default) {
      defaultLabels++;
    } else {
      customLabels++;
    }

    if (label.description !== null) {
      labelsWithDescription++;
    }

    const repoStats = repoMap.get(label.repo);

    if (repoStats) {
      repoStats.labels += 1;

      if (label.is_default) {
        repoStats.defaultLabels += 1;
      }
    } else {
      repoMap.set(label.repo, {
        labels: 1,
        defaultLabels: label.is_default ? 1 : 0,
      });
    }

    nameMap.set(label.name, (nameMap.get(label.name) ?? 0) + 1);

    colorMap.set(label.color, (colorMap.get(label.color) ?? 0) + 1);

    return {
      id: label.id,

      repo: label.repo,

      name: label.name,

      color: label.color,

      descriptionLength,

      hasDescription: label.description !== null,

      isDefault: label.is_default,

      isDarkColor: isDarkColor(label.color),

      nameLength: label.name.length,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,

      labels: stats.labels,

      defaultLabels: stats.defaultLabels,

      customLabels: stats.labels - stats.defaultLabels,

      defaultRate: stats.labels > 0 ? stats.defaultLabels / stats.labels : 0,
    }))
    .sort((a, b) => b.labels - a.labels);

  const nameStats = [...nameMap.entries()]
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const colorStats = [...colorMap.entries()]
    .map(([color, count]) => ({
      color,
      count,
      isDarkColor: isDarkColor(color),
    }))
    .sort((a, b) => b.count - a.count);

  const averageDescriptionLength =
    descriptionLengths.length > 0
      ? descriptionLengths.reduce((a, b) => a + b, 0) /
        descriptionLengths.length
      : 0;

  const topRepositories = [...repoStats].slice(0, 25).map((repo) => ({
    repo: repo.repo,
    labels: repo.labels,
    customLabels: repo.customLabels,
  }));

  const topLabelNames = [...nameStats].slice(0, 25).map((label) => ({
    name: label.name,
    count: label.count,
  }));

  const longestDescriptions = [...stats]
    .sort((a, b) => b.descriptionLength - a.descriptionLength)
    .slice(0, 25)
    .map((label) => ({
      repo: label.repo,
      name: label.name,
      descriptionLength: label.descriptionLength,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalLabels: raw.length,

      defaultLabels,

      customLabels,

      labelsWithDescription,

      averageDescriptionLength,

      uniqueRepositories: repoStats.length,

      uniqueNames: nameStats.length,

      uniqueColors: colorStats.length,
    },

    repos: repoStats,

    names: nameStats,

    colors: colorStats,

    topRepositories,

    topLabelNames,

    longestDescriptions,
  });
}
