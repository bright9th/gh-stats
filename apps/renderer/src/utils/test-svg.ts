export function testSvg(): string {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100">`,
    `<rect width="300" height="100" fill="#0d1117"/>`,
    `<text x="20" y="50" fill="white">Hello World!</text>`,
    `</svg>`,
  ].join("");
}
