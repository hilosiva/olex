import { themes } from "../theme";

const designWidths = themes instanceof Map && themes.has("design-width") ? themes.get("design-width") : null;
const designWidthSmall = designWidths instanceof Map ? designWidths.get("sm") : null;
const designWidthLarge = designWidths instanceof Map ? designWidths.get("lg") : null;

export const getRem = (px: number) => {
  return `${px / 16}rem`;
};

export const getEm = (px: number, base: number = 16) => {
  return `${px / base}em`;
};

// Clampを計算する関数
export const getFluid2 = (minSize: number, maxSize: number, minViewPort = Number(designWidthSmall) ?? 375, maxViewPort = Number(designWidthLarge) ?? 1920) => {
  const valiablePart = (maxSize - minSize) / (maxViewPort - minViewPort);
  const constant = maxSize - maxViewPort * valiablePart;

  return `clamp(${getRem(minSize)}, ${getRem(constant)} + ${100 * valiablePart}vw, ${getRem(maxSize)})`;
};

// Clampを計算する関数
export const getFluid = (minSize: number, maxSize: number, minViewPort: number | string = `var(--default-fluid-viewport-min)`, maxViewPort: number | string = `var(--default-fluid-viewport-max)`) => {
  const min = `(${minSize} * var(--to-rem))`;
  const max = `(${maxSize} * var(--to-rem))`;
  const valiablePart = `((${maxSize} - ${minSize}) / (${maxViewPort} - ${minViewPort}))`;
  // const constant = `(${maxSize} - ${minViewPort} * ${valiablePart})`;
  const constant = `(${minSize} - ${valiablePart} * ${minViewPort} )`;
  // const valiable = `((${constant} * var(--to-rem)) + ( ${valiablePart} * 100vi))`;
  // const valiable = `((${minSize} * var(--to-rem)) + ( ${valiablePart} * 100vi))`;
  const valiable = `((${constant} * var(--to-rem)) + ( ${valiablePart} * 100vi))`;

  return `clamp(${min}, ${valiable}, ${max})`;
};
