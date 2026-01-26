// cSpell:disable

/**
 * Mapping of space notation to SVG decoration file paths.
 */
export const spaceTextureMap: Record<string, string> = {
  // eyes0.svg: A4, A2, M7
  "A4": "assets/board-decor/eyes0.svg",
  "A2": "assets/board-decor/eyes0.svg",
  "M7": "assets/board-decor/eyes0.svg",

  // eyes1.svg: B4, B2
  "B4": "assets/board-decor/eyes1.svg",
  "B2": "assets/board-decor/eyes1.svg",
  // bigfivedots.svg: A3, B3, M2, M5, M8
  "A3": "assets/board-decor/bigfivedots.svg",
  "B3": "assets/board-decor/bigfivedots.svg",
  "M2": "assets/board-decor/bigfivedots.svg",
  "M5": "assets/board-decor/bigfivedots.svg",
  "M8": "assets/board-decor/bigfivedots.svg",

  // twelvedots.svg: M1
  "M1": "assets/board-decor/twelvedots.svg",

  // fourfivedots.svg: M3, M6
  "M3": "assets/board-decor/fourfivedots.svg",
  "M6": "assets/board-decor/fourfivedots.svg",

  // smallfivedots.svg: A8, B8
  "A8": "assets/board-decor/smallfivedots.svg",
  "B8": "assets/board-decor/smallfivedots.svg",

  // rosette.svg: A1, B1, M4, A7, B7
  "A1": "assets/board-decor/rosette.svg",
  "B1": "assets/board-decor/rosette.svg",
  "M4": "assets/board-decor/rosette.svg",
  "A7": "assets/board-decor/rosette.svg",
  "B7": "assets/board-decor/rosette.svg",
};

/**
 * Get the SVG texture path for a given space notation.
 * Returns undefined if no texture is defined for the space.
 */
export function getSpaceTexture(notation: string): string {
  return spaceTextureMap[notation];
}
