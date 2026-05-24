import { GitHubLanguageCardData } from "../../types/card-data";
import { escapeXml } from "../../utils/format";

export function renderCardSvg(data: GitHubLanguageCardData): string {
  const width = 495;
  const height = 220;

  const total = data.languages.reduce((a, b) => a + b.bytes, 0);

  let offset = 0;

  const bar = data.languages
    .map((lang) => {
      const percent = lang.bytes / total;
      const segmentWidth = percent * 447;

      const rect = `
        <rect
          x="${24 + offset}"
          y="62"
          width="${segmentWidth}"
          height="10"
          fill="${lang.color}"
        />
      `;

      offset += segmentWidth;

      return rect;
    })
    .join("");

  return `
<svg
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  xmlns="http://www.w3.org/2000/svg"
>
  <style>
    .title {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #c9d1d9;
    }

    .lang {
      font: 500 13px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #8b949e;
    }

    .percent {
      fill: #c9d1d9;
      font-weight: 600;
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

  <text x="24" y="36" class="title">
    Languages Used (By File Size)
  </text>

  <g>
    ${bar}
  </g>

  ${data.languages
    .map((lang, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;

      const x = 24 + col * 145;
      const y = 105 + row * 28;

      return `
        <circle
          cx="${x}"
          cy="${y - 4}"
          r="5"
          fill="${lang.color}"
        />

        <text
          x="${x + 12}"
          y="${y}"
          class="lang"
        >
          ${escapeXml(lang.name)}
          <tspan class="percent">
            ${(lang.share * 100).toFixed(1)}%
          </tspan>
        </text>
      `;
    })
    .join("")}
</svg>
`.trim();
}
