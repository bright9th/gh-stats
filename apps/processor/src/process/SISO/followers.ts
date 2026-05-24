import { FollowerRecord } from "../../types/record.js";
import { loadJson } from "@gh-stats/io";
import { writeProcessedSISO } from "../../io/write-processed.js";

const processName = "followers";

export async function process(): Promise<void> {
  const raw = await loadJson<FollowerRecord[]>(
    `../../data/raw/${processName}.json`,
  );

  const loginLengths: number[] = [];

  const startingCharacterMap = new Map<string, number>();

  const stats = raw.map((follower) => {
    const loginLength = follower.login.length;

    loginLengths.push(loginLength);

    const startingCharacter = follower.login.charAt(0).toLowerCase();

    startingCharacterMap.set(
      startingCharacter,
      (startingCharacterMap.get(startingCharacter) ?? 0) + 1,
    );

    return {
      id: follower.id,

      login: follower.login,

      profileUrl: follower.html_url,

      avatarUrl: follower.avatar_url,

      loginLength,

      startingCharacter,
    };
  });

  const averageLoginLength =
    loginLengths.length > 0
      ? loginLengths.reduce((a, b) => a + b, 0) / loginLengths.length
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
    .map((follower) => ({
      login: follower.login,
      loginLength: follower.loginLength,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalFollowers: raw.length,

      averageLoginLength,
    },

    loginLengthDistribution,

    startingCharacterDistribution,

    topLongestLogins,
  });
}
