import { FollowingRecord } from "../../types/record.js";
import { loadJson } from "../../io/load-json.js";
import { writeProcessedSISO } from "../../io/write-processed.js";

const processName = "following";

export async function process(): Promise<void> {
  const raw = await loadJson<FollowingRecord[]>(`data/raw/${processName}.json`);

  const loginLengths: number[] = [];

  const startingCharacterMap = new Map<string, number>();

  const stats = raw.map((following) => {
    const loginLength = following.login.length;

    loginLengths.push(loginLength);

    const startingCharacter = following.login.charAt(0).toLowerCase();

    startingCharacterMap.set(
      startingCharacter,
      (startingCharacterMap.get(startingCharacter) ?? 0) + 1,
    );

    return {
      id: following.id,

      login: following.login,

      profileUrl: following.html_url,

      avatarUrl: following.avatar_url,

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
    .map((following) => ({
      login: following.login,
      loginLength: following.loginLength,
    }));

  await writeProcessedSISO(processName, {
    stats,

    overview: {
      totalFollowing: raw.length,

      averageLoginLength,
    },

    loginLengthDistribution,

    startingCharacterDistribution,

    topLongestLogins,
  });
}
