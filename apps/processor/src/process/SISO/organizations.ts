import { OrganizationRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";

const processName = "organizations";

export async function process(): Promise<void> {
  const raw = await loadJson<OrganizationRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const loginLengths: number[] = [];

  const descriptionLengths: number[] = [];

  const startingCharacterMap = new Map<string, number>();

  const stats = raw.map((organization) => {
    const loginLength = organization.login.length;

    const descriptionLength = organization.description?.length ?? 0;

    loginLengths.push(loginLength);

    if (organization.description !== null) {
      descriptionLengths.push(descriptionLength);
    }

    const startingCharacter = organization.login.charAt(0).toLowerCase();

    startingCharacterMap.set(
      startingCharacter,
      (startingCharacterMap.get(startingCharacter) ?? 0) + 1,
    );

    return {
      id: organization.id,

      login: organization.login,

      avatarUrl: organization.avatar_url,

      description: organization.description,

      url: organization.url,

      reposUrl: organization.repos_url,

      eventsUrl: organization.events_url,

      hooksUrl: organization.hooks_url,

      loginLength,

      descriptionLength,

      hasDescription: organization.description !== null,

      startingCharacter,
    };
  });

  const averageLoginLength =
    loginLengths.length > 0
      ? loginLengths.reduce((a, b) => a + b, 0) / loginLengths.length
      : 0;

  const averageDescriptionLength =
    descriptionLengths.length > 0
      ? descriptionLengths.reduce((a, b) => a + b, 0) /
        descriptionLengths.length
      : 0;

  const loginLengthDistribution = loginLengths.reduce<Record<number, number>>(
    (accumulator, length) => {
      accumulator[length] = (accumulator[length] ?? 0) + 1;

      return accumulator;
    },
    {},
  );

  const startingCharacterDistribution = [...startingCharacterMap.entries()]
    .map(([character, count]) => ({
      character,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const topLongestLogins = [...stats]
    .sort((a, b) => b.loginLength - a.loginLength)
    .slice(0, 25)
    .map((organization) => ({
      login: organization.login,
      loginLength: organization.loginLength,
    }));

  const topLongestDescriptions = [...stats]
    .sort((a, b) => b.descriptionLength - a.descriptionLength)
    .slice(0, 25)
    .map((organization) => ({
      login: organization.login,
      descriptionLength: organization.descriptionLength,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalOrganizations: raw.length,

      organizationsWithDescription: stats.filter(
        (organization) => organization.hasDescription,
      ).length,

      averageLoginLength,

      averageDescriptionLength,
    },

    loginLengthDistribution,

    startingCharacterDistribution,

    topLongestLogins,

    topLongestDescriptions,
  });
}
