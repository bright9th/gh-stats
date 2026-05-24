import { GitHubStatsCardData } from "../../types/card-data";
import { escapeXml, compactNumber } from "../../utils/format";

export function renderCardSvg(data: GitHubStatsCardData): string {
  const width = 495;
  const height = 220;

  const rows = [
    [data.stats[0], data.stats[1]],
    [data.stats[2], data.stats[3]],
    [data.stats[4], data.stats[5]],
  ];

  const rowHeight = 48;

  return `
<svg
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <style>
    .title {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #c9d1d9;
    }

    .label {
      font: 500 13px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #8b949e;
    }

    .value {
      font: 700 20px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #58a6ff;
    }
  </style>

  <rect
    x="0.5"
    y="0.5"
    rx="12"
    width="${width - 1}"
    height="${height - 1}"
    fill="#0d1117"
    stroke="#30363d"
  />

  <text
    x="24"
    y="36"
    class="title"
  >
    ${escapeXml(data.displayName)}'s GitHub Statistics
  </text>

  ${rows
    .map((row, rowIndex) => {
      const y = 76 + rowIndex * rowHeight;

      return row
        .map((item, colIndex) => {
          const x = colIndex === 0 ? 24 : 260;

          return `
            <text x="${x}" y="${y}" class="label">
              ${escapeXml(item.label)}
            </text>

            <text x="${x}" y="${y + 24}" class="value">
              ${compactNumber(Number(item.value))}
            </text>
          `;
        })
        .join("");
    })
    .join("")}
</svg>
`.trim();
}
