// cSpell:disable

/**
 * Mapping of space notation to SVG decoration file paths.
 */
export const spaceTextureMap: Record<string, string> = {
  // eyes0.svg: a4, a2, m7
  "a4": "assets/board-decor/eyes0.svg",
  "a2": "assets/board-decor/eyes0.svg",
  "m7": "assets/board-decor/eyes0.svg",

  // eyes1.svg: b4, b2
  "b4": "assets/board-decor/eyes1.svg",
  "b2": "assets/board-decor/eyes1.svg",
  // bigfivedots.svg: a3, b3, m2, m5, m8
  "a3": "assets/board-decor/bigfivedots.svg",
  "b3": "assets/board-decor/bigfivedots.svg",
  "m2": "assets/board-decor/bigfivedots.svg",
  "m5": "assets/board-decor/bigfivedots.svg",
  "m8": "assets/board-decor/bigfivedots.svg",

  // twelvedots.svg: m1
  "m1": "assets/board-decor/twelvedots.svg",

  // fourfivedots.svg: m3, m6
  "m3": "assets/board-decor/fourfivedots.svg",
  "m6": "assets/board-decor/fourfivedots.svg",

  // smallfivedots.svg: a8, b8
  "a8": "assets/board-decor/smallfivedots.svg",
  "b8": "assets/board-decor/smallfivedots.svg",

  // rosette.svg: a1, b1, m4, a7, b7
  "a1": "assets/board-decor/rosette.svg",
  "b1": "assets/board-decor/rosette.svg",
  "m4": "assets/board-decor/rosette.svg",
  "a7": "assets/board-decor/rosette.svg",
  "b7": "assets/board-decor/rosette.svg",
};

/**
 * Get the SVG texture path for a given space notation.
 * Returns undefined if no texture is defined for the space.
 */
export function getSpaceTexture(notation: string): string {
  return spaceTextureMap[notation];
}
