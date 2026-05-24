import { DeploymentRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";
import { daysBetween } from "../utils/date.js";

const processName = "deployments";

export async function process(): Promise<void> {
  const raw = await loadJson<DeploymentRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const now = new Date();

  const repoMap = new Map<
    string,
    {
      deployments: number;
    }
  >();

  const environmentMap = new Map<string, number>();

  const creatorMap = new Map<string, number>();

  const taskMap = new Map<string, number>();

  const refMap = new Map<string, number>();

  const shaMap = new Map<string, number>();

  const creationYears = new Map<number, number>();

  let deploymentsWithEnvironment = 0;

  let deploymentsWithDescription = 0;

  const deploymentAges: number[] = [];

  const updateDurations: number[] = [];

  const stats = raw.map((deployment) => {
    const createdAt = new Date(deployment.created_at);

    const updatedAt = new Date(deployment.updated_at);

    const createdYear = createdAt.getUTCFullYear();

    const ageDays = daysBetween(createdAt, now);

    const updateDurationMinutes = Math.max(
      0,
      Math.floor((updatedAt.getTime() - createdAt.getTime()) / 60000),
    );

    deploymentAges.push(ageDays);

    updateDurations.push(updateDurationMinutes);

    creationYears.set(createdYear, (creationYears.get(createdYear) ?? 0) + 1);

    const repoStats = repoMap.get(deployment.repo);

    if (repoStats) {
      repoStats.deployments += 1;
    } else {
      repoMap.set(deployment.repo, {
        deployments: 1,
      });
    }

    const environment = deployment.environment ?? "unknown";

    environmentMap.set(environment, (environmentMap.get(environment) ?? 0) + 1);

    if (deployment.environment !== null) {
      deploymentsWithEnvironment++;
    }

    if (deployment.creator !== null) {
      creatorMap.set(
        deployment.creator,
        (creatorMap.get(deployment.creator) ?? 0) + 1,
      );
    }

    taskMap.set(deployment.task, (taskMap.get(deployment.task) ?? 0) + 1);

    refMap.set(deployment.ref, (refMap.get(deployment.ref) ?? 0) + 1);

    shaMap.set(deployment.sha, (shaMap.get(deployment.sha) ?? 0) + 1);

    if (deployment.description !== null) {
      deploymentsWithDescription++;
    }

    return {
      id: deployment.id,

      repo: deployment.repo,

      sha: deployment.sha,

      ref: deployment.ref,

      task: deployment.task,

      environment: deployment.environment,

      creator: deployment.creator,

      createdYear,

      ageDays,

      updateDurationMinutes,

      descriptionLength: deployment.description?.length ?? 0,

      hasEnvironment: deployment.environment !== null,

      hasDescription: deployment.description !== null,
    };
  });

  const repoStats = [...repoMap.entries()]
    .map(([repo, stats]) => ({
      repo,
      deployments: stats.deployments,
    }))
    .sort((a, b) => b.deployments - a.deployments);

  const environmentStats = [...environmentMap.entries()]
    .map(([environment, deployments]) => ({
      environment,
      deployments,
    }))
    .sort((a, b) => b.deployments - a.deployments);

  const creatorStats = [...creatorMap.entries()]
    .map(([creator, deployments]) => ({
      creator,
      deployments,
    }))
    .sort((a, b) => b.deployments - a.deployments);

  const taskStats = [...taskMap.entries()]
    .map(([task, deployments]) => ({
      task,
      deployments,
    }))
    .sort((a, b) => b.deployments - a.deployments);

  const refStats = [...refMap.entries()]
    .map(([ref, deployments]) => ({
      ref,
      deployments,
    }))
    .sort((a, b) => b.deployments - a.deployments);

  const shaStats = [...shaMap.entries()]
    .map(([sha, deployments]) => ({
      sha,
      deployments,
    }))
    .sort((a, b) => b.deployments - a.deployments);

  const creationTimeline = [...creationYears.entries()]
    .map(([year, deployments]) => ({
      year,
      deployments,
    }))
    .sort((a, b) => a.year - b.year);

  const averageDeploymentAgeDays =
    deploymentAges.length > 0
      ? deploymentAges.reduce((a, b) => a + b, 0) / deploymentAges.length
      : 0;

  const averageUpdateDurationMinutes =
    updateDurations.length > 0
      ? updateDurations.reduce((a, b) => a + b, 0) / updateDurations.length
      : 0;

  const longestDeployments = [...stats]
    .sort((a, b) => b.updateDurationMinutes - a.updateDurationMinutes)
    .slice(0, 25)
    .map((deployment) => ({
      id: deployment.id,
      repo: deployment.repo,
      durationMinutes: deployment.updateDurationMinutes,
    }));

  const longestDescriptions = [...stats]
    .sort((a, b) => b.descriptionLength - a.descriptionLength)
    .slice(0, 25)
    .map((deployment) => ({
      id: deployment.id,
      repo: deployment.repo,
      descriptionLength: deployment.descriptionLength,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalDeployments: raw.length,

      deploymentsWithEnvironment,

      deploymentsWithDescription,

      averageDeploymentAgeDays,

      averageUpdateDurationMinutes,

      uniqueRepositories: repoStats.length,

      uniqueEnvironments: environmentStats.length,

      uniqueCreators: creatorStats.length,
    },

    repos: repoStats,

    environments: environmentStats,

    creators: creatorStats,

    tasks: taskStats,

    refs: refStats,

    shas: shaStats,

    creationTimeline,

    longestDeployments,

    longestDescriptions,
  });
}
