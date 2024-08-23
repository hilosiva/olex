import config from "./config";
import { prefix, themes } from "./theme";
import postcss, { Root } from "postcss";
import { Style } from "./create-style";

const columns = 12;
const rows = 6;

const replaceMap: Record<string, string> = {
  "4xs": "4xsmall",
  "3xs": "3xsmall",
  "2xs": "2xsmall",
  xs: "xsmall",
  sm: "small",
  md: "medium",
  lg: "large",
  xl: "xlarge",
  "2xl": "2xlarge",
  "3xl": "3xlarge",
  "4xl": "4xlarge",
};

export const initUtilities = async (root: Root) => {
  const utilitiesRoot = postcss.root();

  const colorValues = new Map([
    ["inherit", "inherit"],
    ["current", "currentColor"],
    ["transparent", "transparent"],
  ]);
  const colors = themes.get("color") ?? null;

  if (colors instanceof Map) {
    for (const [key] of colors) {
      colorValues.set(key, `var(--color-${key})`);
    }
  }

  const leadingValues = new Map([["line-normal", "normal"]]);

  const leadings = themes.get("leading") ?? null;
  if (leadings instanceof Map) {
    leadings.delete("base");

    for (const [key] of leadings) {
      leadingValues.set(key, `var(--leading-${key})`);
    }
  }

  const trackingValues = new Map([]);

  const trackings = themes.get("tracking") ?? null;
  if (trackings instanceof Map) {
    for (const [key] of trackings) {
      trackingValues.set(key, `var(--tracking-${key})`);
    }
  }

  const fontSizeValues = new Map([]);
  const fontFamilyValues = new Map([]);

  const fonts = themes.get("font") ?? null;
  if (fonts instanceof Map) {
    for (const [key] of fonts) {
      if (replaceMap[key]) {
        fontSizeValues.set(replaceMap[key], `var(--font-${key})`);
      } else {
        fontFamilyValues.set(key, `var(--font-${key})`);
      }
    }
  }

  const fontFluids = themes.get("font-fluid") ?? null;
  if (fontFluids instanceof Map) {
    for (const [key] of fontFluids) {
      if (replaceMap[key]) {
        fontSizeValues.set(`fluid-${replaceMap[key]}`, `var(--font-fluid-${key})`);
      }
    }
  }

  const radiusValues = new Map([]);
  const radius = themes.get("radius") ?? null;
  if (radius instanceof Map) {
    for (const [key] of radius) {
      if (replaceMap[key]) {
        radiusValues.set(`${replaceMap[key]}`, `var(--radius-${key})`);
      } else {
        radiusValues.set(`${key}`, `var(--radius-${key})`);
      }
    }
  }

  // ====================================
  //  color
  // ====================================
  const color = new Style(`[data-${prefix}color]`, []);

  // Color
  for (const [key, value] of colorValues) {
    await color.setModifier(new Style(`[data-${prefix}color~="${key}"]`, [[`color`, value]], { isMediaQuery: true }));
  }

  await color.setModifier(new Style(`[data-${prefix}color~="[]"]`, [[`color`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Background
  // ====================================
  const background = new Style(`[data-${prefix}bg]`, []);

  // Color
  for (const [key, value] of colorValues) {
    await background.setModifier(new Style(`[data-${prefix}bg~="${key}"]`, [[`background-color`, value]], { isMediaQuery: true }));
  }

  await background.setModifier(new Style(`[data-${prefix}bg~="[]"]`, [[`background-color`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Mix Blend Mode
  // ====================================
  const blendmode = new Style(`[data-${prefix}blend-mode]`, []);

  // Size
  const blendmodeValues = new Map([
    ["normal", "normal"],
    ["multiply", "multiply"],
    ["screen", "screen"],
    ["overlay", "overlay"],
    ["darken", "darken"],
    ["lighten", "lighten"],
    ["hard-light", "hard-light"],
    ["soft-light", "soft-light"],
    ["difference", "difference"],
    ["exclusion", "exclusion"],
    ["saturation", "saturation"],
  ]);

  for (const [key, value] of blendmodeValues) {
    await blendmode.setModifier(new Style(`[data-${prefix}blend-mode~="${key}"]`, [[`mix-blend-mode`, value]], { isMediaQuery: true }));
  }

  // ====================================
  //  Border
  // ====================================
  const border = new Style(`[data-${prefix}border]`, []);

  // width
  for (let index = 0; index <= 8; index++) {
    await border.setModifier(new Style(`[data-${prefix}border~="${index}"]`, [[`border-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="top-${index}"]`, [[`border-top-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="right-${index}"]`, [[`border-right-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="bottom-${index}"]`, [[`border-bottom-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="left-${index}"]`, [[`border-left-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-${index}"]`, [[`border-block-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-${index}"]`, [[`border-inline-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-start-${index}"]`, [[`border-block-start-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-end-${index}"]`, [[`border-block-end-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-start-${index}"]`, [[`border-inline-start-width`, `${index}px`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-end-${index}"]`, [[`border-inline-end-width`, `${index}px`]], { isMediaQuery: true }));
  }

  const borderWidthValues = new Map([
    ["thin", "thin"],
    ["medium", "medium"],
    ["thick", "thick"],
  ]);

  for (const [key, value] of borderWidthValues) {
    await border.setModifier(new Style(`[data-${prefix}border~="${key}"]`, [[`border-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="top-${key}"]`, [[`border-top-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="right-${key}"]`, [[`border-right-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="bottom-${key}"]`, [[`border-bottom-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="left-${key}"]`, [[`border-left-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-${key}"]`, [[`border-block-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-${key}"]`, [[`border-inline-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-start-${key}"]`, [[`border-block-start-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-end-${key}"]`, [[`border-block-end-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-start-${key}"]`, [[`border-inline-start-width`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-end-${key}"]`, [[`border-inline-end-width`, `${value}`]], { isMediaQuery: true }));
  }

  // Style
  const borderStyleValues = new Map([
    ["none", "none"],
    ["solid", "solid"],
    ["dotted", "dotted"],
    ["dashed", "dashed"],
  ]);

  for (const [key, value] of borderStyleValues) {
    await border.setModifier(new Style(`[data-${prefix}border~="${key}"]`, [[`border-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="top-${key}"]`, [[`border-top-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="right-${key}"]`, [[`border-right-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="bottom-${key}"]`, [[`border-bottom-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="left-${key}"]`, [[`border-left-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-${key}"]`, [[`border-block-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-${key}"]`, [[`border-inline-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-start-${key}"]`, [[`border-block-start-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-end-${key}"]`, [[`border-block-end-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-start-${key}"]`, [[`border-inline-start-style`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-end-${key}"]`, [[`border-inline-end-style`, `${value}`]], { isMediaQuery: true }));
  }

  // Color
  for (const [key, value] of colorValues) {
    await border.setModifier(new Style(`[data-${prefix}border~="${key}"]`, [[`border-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="top-${key}"]`, [[`border-top-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="right-${key}"]`, [[`border-right-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="bottom-${key}"]`, [[`border-bottom-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="left-${key}"]`, [[`border-left-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-${key}"]`, [[`border-block-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-${key}"]`, [[`border-inline-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-start-${key}"]`, [[`border-block-start-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="block-end-${key}"]`, [[`border-block-end-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-start-${key}"]`, [[`border-inline-start-color`, `${value}`]], { isMediaQuery: true }));
    await border.setModifier(new Style(`[data-${prefix}border~="inline-end-${key}"]`, [[`border-inline-end-color`, `${value}`]], { isMediaQuery: true }));
  }

  await border.setModifier(new Style(`[data-${prefix}border~="[]"]`, [[`border`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="top-[]"]`, [[`border-top`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="right-[]"]`, [[`border-right`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="bottom-[]"]`, [[`border-bottom`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="left-[]"]`, [[`border-left`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="block-[]"]`, [[`border-block`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="inline-[]"]`, [[`border-inline`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="block-start-[]"]`, [[`border-block-start`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="block-end-[]"]`, [[`border-block-end`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="inline-start-[]"]`, [[`border-inline-start`, `true`]], { isMediaQuery: true }));
  await border.setModifier(new Style(`[data-${prefix}border~="inline-end-[]"]`, [[`border-inline-end`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  radius
  // ====================================
  const borderRadius = new Style(`[data-${prefix}radius]`, []);
  for (const [key, value] of colorValues) {
    await borderRadius.setModifier(new Style(`[data-${prefix}radius~="${key}"]`, [[`border-radius`, `${value}`]], { isMediaQuery: true }));
    await borderRadius.setModifier(new Style(`[data-${prefix}radius~="top-left-${key}"]`, [[`border-top-left-radius`, `${value}`]], { isMediaQuery: true }));
    await borderRadius.setModifier(new Style(`[data-${prefix}radius~="top-right-${key}"]`, [[`border-top-right-radius`, `${value}`]], { isMediaQuery: true }));
    await borderRadius.setModifier(new Style(`[data-${prefix}radius~="bottom-left-${key}"]`, [[`border-bottom-left-radius`, `${value}`]], { isMediaQuery: true }));
    await borderRadius.setModifier(new Style(`[data-${prefix}radius~="bottom-right-${key}"]`, [[`border-bottom-right-radius`, `${value}`]], { isMediaQuery: true }));
    await borderRadius.setModifier(new Style(`[data-${prefix}radius~="start-end-${key}"]`, [[`border-start-end-radius`, `${value}`]], { isMediaQuery: true }));
    await borderRadius.setModifier(new Style(`[data-${prefix}radius~="start-start-${key}"]`, [[`border-start-start-radius`, `${value}`]], { isMediaQuery: true }));
  }

  // ====================================
  //  Text
  // ====================================
  const text = new Style(`[data-${prefix}text]`, []);

  // align
  const alignValues = new Map([
    ["start", "start"],
    ["end", "end"],
    ["center", "center"],
    ["left", "left"],
    ["right", "right"],
    ["justify", "justify"],
    ["align-[]", "true"],
  ]);

  for (const [key, value] of alignValues) {
    await text.setModifier(new Style(`[data-${prefix}text~="${key}"]`, [[`text-align`, `${value}`]], { isMediaQuery: true }));
  }

  // Wrap
  const wrapValues = new Map([
    ["wrap", "wrap"],
    ["nowrap", "nowrap"],
    ["balance", "balance"],
    ["pretty", "pretty"],
    ["stable", "stable"],
  ]);

  for (const [key, value] of wrapValues) {
    await text.setModifier(new Style(`[data-${prefix}text~="${key}"]`, [[`text-wrap`, `${value}`]], { isMediaQuery: true }));
  }

  // Transform
  const transformValues = new Map([
    ["capitalize", "capitalize"],
    ["uppercase", "uppercase"],
    ["lowercase", "lowercase"],
    ["normalcase", "none"],
    ["transform-[]", "true"],
  ]);

  for (const [key, value] of transformValues) {
    await text.setModifier(new Style(`[data-${prefix}text~="${key}"]`, [[`text-transform`, `${value}`]], { isMediaQuery: true }));
  }

  // WordBreak
  const wordBreakValues = new Map([
    ["keep", ["keep-all", "anywhere"]],
    ["phrase", ["auto-phrase", "anywhere"]],
    ["normalbreak", ["normal", "normal"]],
  ]);

  for (const [key, [word, wrap]] of wordBreakValues) {
    await text.setModifier(
      new Style(
        `[data-${prefix}text~="${key}"]`,
        [
          [`word-break`, `${word}`],
          [`overflow-wrap`, `${wrap}`],
        ],
        { isMediaQuery: true }
      )
    );
  }

  // writing mode
  const writingModeValue = new Map([
    ["tb", "horizontal-tb"],
    ["rl", "vertical-rl"],
    ["lr", "balavertical-lr"],
  ]);

  for (const [key, value] of writingModeValue) {
    await text.setModifier(new Style(`[data-${prefix}text~="${key}"]`, [[`writing-mode`, `${value}`]], { isMediaQuery: true }));
  }

  // Line Height
  for (const [key, value] of leadingValues) {
    if (replaceMap[key]) {
      await text.setModifier(new Style(`[data-${prefix}text~="line-${replaceMap[key]}"]`, [[`line-height`, `${value}`]], { isMediaQuery: true }));
    } else {
      await text.setModifier(new Style(`[data-${prefix}text~="line-${key}"]`, [[`line-height`, `${value}`]], { isMediaQuery: true }));
    }
  }
  await text.setModifier(new Style(`[data-${prefix}text~="line-[]"]`, [[`line-height`, `true`]], { isMediaQuery: true }));

  // letter spacinv
  for (const [key, value] of trackingValues) {
    await text.setModifier(new Style(`[data-${prefix}text~="letter-${key}"]`, [[`letter-spacing`, `${value}`]], { isMediaQuery: true }));
  }
  await text.setModifier(new Style(`[data-${prefix}text~="letter-[]"]`, [[`letter-spacing`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Font
  // ====================================
  const font = new Style(`[data-${prefix}font]`, []);

  // font-settings
  const fontSettingValues = new Map([
    ["palt", '"palt"'],
    ["pkna", '"pkna"'],
    ["setting-normal", "normal"],
    ["setting-[]", "true"],
  ]);

  for (const [key, value] of fontSettingValues) {
    await font.setModifier(new Style(`[data-${prefix}font~="${key}"]`, [[`font-feature-settings`, `${value}`]], { isMediaQuery: true }));
  }

  // Size
  for (const [key, value] of fontSizeValues) {
    await font.setModifier(new Style(`[data-${prefix}font~="${key}"]`, [[`font-size`, `${value}`]], { isMediaQuery: true }));
  }
  await font.setModifier(new Style(`[data-${prefix}font~="[]"]`, [[`font-size`, `true`]], { isMediaQuery: true }));

  // Family
  for (const [key, value] of fontFamilyValues) {
    await font.setModifier(new Style(`[data-${prefix}font~="${key}"]`, [[`font-family`, `${value}`]], { isMediaQuery: true }));
  }
  await font.setModifier(new Style(`[data-${prefix}font~="family-[]"]`, [[`font-family`, `true`]], { isMediaQuery: true }));

  // Weight
  const weightValues = new Map([
    ["weight-nomal", "nomal"],
    ["bold", "bold"],
    ["lighter", "lighter"],
    ["weight-[]", "true"],
  ]);

  for (const [key, value] of weightValues) {
    await font.setModifier(new Style(`[data-${prefix}font~="${key}"]`, [[`font-weight`, `${value}`]], { isMediaQuery: true }));
  }

  for (let index = 1; index <= 9; index++) {
    await font.setModifier(new Style(`[data-${prefix}font~="${index * 100}"]`, [[`font-weight`, `${index * 100}`]], { isMediaQuery: true }));
  }

  // Style
  const styleValues = new Map([
    ["style-nomal", "nomal"],
    ["italic", "italic"],
    ["oblique", "oblique"],
    ["style-[]", "true"],
  ]);

  for (const [key, value] of styleValues) {
    await font.setModifier(new Style(`[data-${prefix}font~="${key}"]`, [[`font-style`, `${value}`]], { isMediaQuery: true }));
  }

  // ====================================
  //  object
  // ====================================
  const object = new Style(`[data-${prefix}object]`, []);

  const objectValues = new Map([
    ["cover", "cover"],
    ["contain", "contain"],
    ["fill", "fill"],
    ["scale-down", "scale-down"],
    ["none", "none"],
    ["[]", "true"],
  ]);

  for (const [key, value] of objectValues) {
    await object.setModifier(
      new Style(
        `[data-${prefix}object~="${key}"]`,
        [
          [`object-fit`, `${value}`],
          [`width`, `100%`],
          [`height`, `100%`],
        ],
        { isMediaQuery: true }
      )
    );
  }

  // ====================================
  //  Visually Hidden
  // ====================================
  const visuallyHidden = new Style(`[data-${prefix}visually-hidden]:not(:focus)`, [
    ["position", "absolute"],
    ["width", "1px"],
    ["height", "1px"],
    ["margin", "-1px"],
    ["padding", "0"],
    ["overflow", "hidden"],
    ["clip", "rect(0 0 0 0)"],
    ["border", "0"],
    ["white-space", "nowrap"],
    ["clip-path", "inset(50%)"],
  ]);

  // ルールをセット
  const rules = new Set([color, background, blendmode, border, borderRadius, text, font, object, visuallyHidden]);

  for (const rule of rules) {
    const ruleResult = await rule.output();

    if (ruleResult) utilitiesRoot.append(ruleResult);
  }

  root.walkAtRules("olex", (atRule) => {
    if (atRule.params === "utilities") {
      atRule.parent?.prepend(utilitiesRoot); // 😍
      atRule.remove();
      return;
    }
  });
};
