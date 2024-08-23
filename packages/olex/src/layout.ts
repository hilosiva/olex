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

export const initLayout = async (root: Root) => {
  const layoutsRoot = postcss.root();

  // ==========================
  // Container
  // ==========================

  const container = new Style(`[data-${prefix}container]`, [
    [`--${prefix}container-offset-start`, `var(--${prefix}default-container-offset)`],
    [`--${prefix}container-offset-end`, `var(--${prefix}default-container-offset)`],
    [`--${prefix}container-margin-start`, `auto`],
    [`--${prefix}container-margin-end`, `auto`],
    ["container", "container / inline-size"],
    ["box-sizing", ` content-box`],
    ["margin-inline", `var(--${prefix}container-margin-start) var(--${prefix}container-margin-end)`],
    ["padding-inline", `var(--${prefix}container-offset-start) var(--${prefix}container-offset-end)`],
  ]);

  // Size
  const containerSizes = new Map([["none", "0"]]);

  const offsets = themes.get("offset") ?? null;
  if (offsets instanceof Map) {
    for (const [key] of offsets) {
      if (replaceMap[key]) {
        containerSizes.set(replaceMap[key], key);
      }
    }
  }
  containerSizes.set("[]", "true");

  for (const [key, value] of containerSizes) {
    await container.setModifier(
      new Style(
        `[data-${prefix}container~="${key}"]`,
        [
          [`--${prefix}container-offset-start`, value === "0" ? "0" : `var(--${prefix}offset-${value})`],
          [`--${prefix}container-offset-end`, value === "0" ? "0" : `var(--${prefix}offset-${value})`],
        ],
        { isMediaQuery: true }
      )
    );
  }

  for (const [key, value] of containerSizes) {
    await container.setModifier(
      new Style(`[data-${prefix}container~="s-${key}"]`, [[`--${prefix}container-offset-start`, value === "0" ? "0" : `var(--${prefix}offset-${value})`]], { isMediaQuery: true })
    );
  }

  for (const [key, value] of containerSizes) {
    await container.setModifier(
      new Style(`[data-${prefix}container~="e-${key}"]`, [[`--${prefix}container-offset-end`, value === "0" ? "0" : `var(--${prefix}offset-${value})`]], { isMediaQuery: true })
    );
  }

  // Align
  const containerAlign = new Map([
    ["start", ["0", "auto"]],
    ["center", ["auto", "auto"]],
    ["end", ["auto", "0"]],
  ]);

  for (const [key, [start, end]] of containerAlign) {
    await container.setModifier(
      new Style(
        `[data-${prefix}container~="${key}"]`,
        [
          [`--${prefix}container-margin-start`, start],
          [`--${prefix}container-margin-end`, end],
        ],
        { isMediaQuery: true }
      )
    );
  }

  // ==========================
  // Over
  // ==========================
  const over = new Style(`[data-${prefix}over]`, [
    [`--${prefix}over-start`, `calc(-1 * var(--${prefix}container-offset-start, initial))`],
    [`--${prefix}over-end`, `calc(-1 * var(--${prefix}container-offset-end, initial))`],
    ["container", "over / inline-size"],
    [`margin-inline`, `var(--${prefix}over-start)) var(--${prefix}over-end))`],
  ]);

  // Align
  const overAlign = new Map([
    ["start", ["start", "0"]],
    ["end", ["0", "end"]],
    ["both", ["start", "end"]],
    ["clear", ["0", "0"]],
  ]);

  for (const [key, [start, end]] of overAlign) {
    await over.setModifier(
      new Style(
        `[data-${prefix}over~="${key}"]`,
        [
          [`margin-inline-start`, start === "0" ? "0" : `var(--${prefix}over-${start})`],
          [`margin-inline-end`, end === "0" ? "0" : `var(--${prefix}over-${end})`],
        ],
        { isMediaQuery: true }
      )
    );
  }

  // ==========================
  // Grid
  // ==========================
  const grid = new Style(`[data-${prefix}grid]`, [
    [`--${prefix}grid-display`, "block"],
    [`--${prefix}grid-layout`, `minmax(0, 1fr)`],
    [`--${prefix}grid-auto-fit`, `minmax(min(var(--${prefix}grid-min-size, 300px), 100%), 1fr)`],

    // ["container", "grid / inline-size"],
    [`display`, `var(--${prefix}grid-display) grid`],
  ]);

  // Display
  const gridDisplay = new Map([
    ["block", "block"],
    ["inline", "inline"],
  ]);

  for (const [key, value] of gridDisplay) {
    await grid.setModifier(new Style(`[data-${prefix}grid~="${key}"]`, [[`--${prefix}grid-display`, value]], { isMediaQuery: true }));
  }

  await grid.setModifier(new Style(`[data-${prefix}grid~="cols-0"]`, [[`grid-template-columns`, `none`]], { isMediaQuery: true }));

  for (let i = 1; i <= columns; i++) {
    await grid.setModifier(new Style(`[data-${prefix}grid~="cols-${i}"]`, [[`grid-template-columns`, `repeat(${i}, var(--${prefix}grid-layout))`]], { isMediaQuery: true }));
  }

  //  auto-fit
  await grid.setModifier(
    new Style(`[data-${prefix}grid~="cols-auto-fit"]`, [[`grid-template-columns`, `repeat(auto-fit, var(--${prefix}grid-auto-fit))`]], {
      isMediaQuery: true,
    })
  );

  // subgrid
  await grid.setModifier(new Style(`[data-grid~="cols-subgrid"]`, [[`grid-template-columns`, `subgrid`]], { isMediaQuery: true }));

  await grid.setModifier(
    new Style(`[style~="--${prefix}cols:"]`, [[`grid-template-columns`, `repeat(var(--${prefix}cols), var(--${prefix}grid-layout))`]], {
      isMediaQuery: false,
    })
  );

  await grid.setModifier(
    new Style(`[style*="--${prefix}cols: auto-fit"]`, [[`grid-template-columns`, `repeat(var(--${prefix}cols), var(--${prefix}grid-auto-fit))`]], {
      isMediaQuery: false,
    })
  );

  await grid.setModifier(new Style(`[data-${prefix}grid~="cols-[]"]`, [[`grid-template-columns`, `true`]], { isMediaQuery: true }));

  // Rows

  await grid.setModifier(new Style(`[data-${prefix}grid~="rows-0"]`, [[`grid-template-rows`, `none`]], { isMediaQuery: true }));

  for (let i = 1; i <= rows; i++) {
    await grid.setModifier(new Style(`[data-${prefix}grid~="rows-${i}"]`, [[`grid-template-rows`, `repeat(${i}, var(--${prefix}grid-layout))`]], { isMediaQuery: true }));
  }

  // subgrid
  await grid.setModifier(new Style(`[data-${prefix}grid~="rows-subgrid"]`, [[`grid-template-rows`, `subgrid`]], { isMediaQuery: true }));

  await grid.setModifier(new Style(`[data-${prefix}grid~="rows-[]"]`, [[`grid-template-rows`, `true`]], { isMediaQuery: true }));

  // ==========================
  // Grid Item
  // ==========================

  const gridItem = new Style(`[data-${prefix}grid-item]`, []);

  // Col
  // ----------------------------

  await gridItem.setModifier(
    new Style(
      `[data-${prefix}grid-item~="cols-subgrid"]`,
      [
        [`display`, `var(--${prefix}grid-display, block) grid`],
        [`grid-template-columns`, `subgrid`],
      ],
      { isMediaQuery: true }
    )
  );

  for (let i = 1; i <= columns; i++) {
    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-${i}"]`, [[`grid-column`, `span ${i} / span ${i}`]], { isMediaQuery: true }));

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-start-${i}"]`, [[`grid-column-start`, `${i}`]], { isMediaQuery: true }));

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-end-${i}"]`, [[`grid-column-end`, `${i}`]], { isMediaQuery: true }));
  }

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-[]"]`, [[`grid-column`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-start-[]"]`, [[`grid-column-start`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-end-[]"]`, [[`grid-column-end`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-full"]`, [[`grid-column`, `1 / -1`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-auto"]`, [[`grid-column`, `auto / auto`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-start-auto"]`, [[`grid-column-start`, `auto`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-end-auto"]`, [[`grid-column-end`, `auto`]], { isMediaQuery: true }));

  // Row
  // ----------------------------

  await gridItem.setModifier(
    new Style(
      `[data-${prefix}grid-item~="rows-subgrid"]`,
      [
        [`display`, `var(--${prefix}grid-display, block) grid`],
        [`grid-template-rows`, `subgrid`],
      ],
      { isMediaQuery: true }
    )
  );

  for (let i = 1; i <= rows; i++) {
    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-${i}"]`, [[`grid-row`, `span ${i} / span ${i}`]], { isMediaQuery: true }));

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-start-${i}"]`, [[`grid-row-start`, `${i}`]], { isMediaQuery: true }));

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-end-${i}"]`, [[`grid-row-end`, `${i}`]], { isMediaQuery: true }));
  }

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-[]"]`, [[`grid-row`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-start-[]"]`, [[`grid-row-start`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-end-[]"]`, [[`grid-row-end`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-full"]`, [[`grid-row`, `1 / -1`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-auto"]`, [[`grid-row`, `auto / auto`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-start-auto"]`, [[`grid-row-start`, `auto`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-end-auto"]`, [[`grid-row-end`, `auto`]], { isMediaQuery: true }));

  // ====================================
  //  Flex
  // ====================================
  const flex = new Style(`[data-${prefix}flex]`, [
    [`--${prefix}flex-display`, "block"],
    // ["container", "flex / inline-size"],
    ["display", `var(--${prefix}flex-display) flex`],
  ]);

  // Display
  const flexDisplay = new Map([
    ["block", "block"],
    ["inline", "inline"],
  ]);

  for (const [key, value] of flexDisplay) {
    await flex.setModifier(new Style(`[data-${prefix}flex~="${key}"]`, [[`--${prefix}flex-display`, value]], { isMediaQuery: true }));
  }

  // Wrap
  // ----------------------------
  const flexWrap = new Map([
    ["nowrap", "nowrap"],
    ["wrap", "wrap"],
  ]);

  for (const [key, value] of flexWrap) {
    await flex.setModifier(new Style(`[data-${prefix}flex~="${key}"]`, [[`flex-wrap`, value]], { isMediaQuery: true }));
  }

  // Direction
  // ----------------------------
  const flexDirection = new Map([
    ["row", "row"],
    ["row-reverse", "row-reverse"],
    ["col", "column"],
    ["col-reverse", "column-reverse"],
  ]);

  for (const [key, value] of flexDirection) {
    await over.setModifier(new Style(`[data-${prefix}flex~="${key}"]`, [[`flex-direction`, value]], { isMediaQuery: true }));
  }

  // ====================================
  //  Flex Item
  // ====================================
  const flexItem = new Style(`[data-${prefix}flex-item]`, [
    ["container", "flex-item / inline-size"],
    ["flex", `var(--${prefix}grow) var(--${prefix}shrink) var(--${prefix}basis)`],
  ]);

  // Grow & Shrink
  // ----------------------------
  for (let i = 0; i <= 3; i++) {
    await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="g-${i}"]`, [[`flex-grow`, `${i}`]], { isMediaQuery: true }));
    await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="s-${i}"]`, [[`flex-shrink`, `${i}`]], { isMediaQuery: true }));
  }

  await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="g-[]"]`, [[`flex-grow`, `true`]], { isMediaQuery: true }));
  await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="s-[]"]`, [[`flex-shrink`, `true`]], { isMediaQuery: true }));

  await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="b-[]"]`, [[`flex-basis`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Gap
  // ====================================
  const gap = new Style(`[data-${prefix}gap]`, []);

  // // サイズ
  const spaces = themes.get("space") ?? null;

  // 一括
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await gap.setModifier(new Style(`[data-${prefix}gap~="${replaceMap[key]}"]`, [[`gap`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await gap.setModifier(new Style(`[data-${prefix}gap~="${i}"]`, [[`gap`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  // column rows
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await gap.setModifier(new Style(`[data-${prefix}gap~="col-${replaceMap[key]}"]`, [[`column-gap`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await gap.setModifier(new Style(`[data-${prefix}gap~="row-${replaceMap[key]}"]`, [[`row-gap`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await gap.setModifier(new Style(`[data-${prefix}gap~="col-${i}"]`, [[`column-gap`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await gap.setModifier(new Style(`[data-${prefix}gap~="row-${i}"]`, [[`row-gap`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await gap.setModifier(new Style(`[data-${prefix}gap~="[]"]`, [[`gap`, `true`]], { isMediaQuery: true }));
  await gap.setModifier(new Style(`[data-${prefix}gap~="col-[]"]`, [[`column-gap`, `true`]], { isMediaQuery: true }));
  await gap.setModifier(new Style(`[data-${prefix}gap~="row-[]"]`, [[`row-gap`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  order
  // ====================================

  const order = new Style(`[data-${prefix}order]`, []);

  await order.setModifier(new Style(`[data-${prefix}order~="0"]`, [[`order`, `0`]], { isMediaQuery: true }));

  for (let i = 1; i <= 12; i++) {
    await order.setModifier(new Style(`[data-${prefix}order~="${i}"]`, [[`order`, `${i}`]], { isMediaQuery: true }));
    await order.setModifier(new Style(`[data-${prefix}order~="-${i}"]`, [[`order`, `${i * -1}`]], { isMediaQuery: true }));
  }

  await order.setModifier(new Style(`[data-${prefix}order~="first"]`, [[`order`, `-9999`]], { isMediaQuery: true }));

  await order.setModifier(new Style(`[data-${prefix}order~="last"]`, [[`order`, `9999`]], { isMediaQuery: true }));

  await order.setModifier(new Style(`[data-${prefix}order~="[]"]`, [[`order`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Place
  // ====================================
  const place = new Style(`[data-${prefix}place]`, []);

  // place content
  await place.setModifier(new Style(`[data-${prefix}place~="start"]`, [[`place-content`, `start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="center"]`, [[`place-content`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="end"]`, [[`place-content`, `end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="between"]`, [[`place-content`, `space-between`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="around"]`, [[`place-content`, `space-around`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="evenly"]`, [[`place-content`, `space-evenly`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="baseline"]`, [[`place-content`, `baseline`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="stretch"]`, [[`place-content`, `stretch`]], { isMediaQuery: true }));

  // place items
  await place.setModifier(new Style(`[data-${prefix}place~="items-start"]`, [[`place-items`, `start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="items-center"]`, [[`place-items`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="items-end"]`, [[`place-items`, `end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="items-baseline"]`, [[`place-items`, `baseline`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="items-stretch"]`, [[`place-items`, `stretch`]], { isMediaQuery: true }));

  // place self
  await place.setModifier(new Style(`[data-${prefix}place~="self-start"]`, [[`place-self`, `start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="self-center"]`, [[`place-self`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="self-end"]`, [[`place-self`, `end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="self-auto"]`, [[`place-self`, `auto`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="self-stretch"]`, [[`place-self`, `stretch`]], { isMediaQuery: true }));

  // justify-content
  await place.setModifier(new Style(`[data-${prefix}place~="inline-normal"]`, [[`justify-content`, `normal`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-start"]`, [[`justify-content`, `flex-start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-center"]`, [[`justify-content`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-end"]`, [[`justify-content`, `flex-end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-between"]`, [[`justify-content`, `space-between`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-around"]`, [[`justify-content`, `space-around`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-evenly"]`, [[`justify-content`, `space-evenly`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-stretch"]`, [[`justify-content`, `stretch`]], { isMediaQuery: true }));

  // justiry-items
  await place.setModifier(new Style(`[data-${prefix}place~="inline-items-start"]`, [[`justify-items`, `start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-items-center"]`, [[`justify-items`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-items-end"]`, [[`justify-items`, `end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-items-stretch"]`, [[`justify-items`, `stretch`]], { isMediaQuery: true }));

  // justiry-self
  await place.setModifier(new Style(`[data-${prefix}place~="inline-self-start"]`, [[`justify-self`, `start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-self-center"]`, [[`justify-self`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-self-end"]`, [[`justify-self`, `end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-self-stretch"]`, [[`justify-self`, `stretch`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="inline-self-auto"]`, [[`justify-self`, `auto`]], { isMediaQuery: true }));

  // align-content
  await place.setModifier(new Style(`[data-${prefix}place~="block-normal"]`, [[`align-content`, `normal`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-start"]`, [[`align-content`, `flex-start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-center"]`, [[`align-content`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-end"]`, [[`align-content`, `flex-end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-between"]`, [[`align-content`, `space-between`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-around"]`, [[`align-content`, `space-around`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-evenly"]`, [[`align-content`, `space-evenly`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-baseline"]`, [[`align-content`, `baseline`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-stretch"]`, [[`align-content`, `stretch`]], { isMediaQuery: true }));

  // align-items
  await place.setModifier(new Style(`[data-${prefix}place~="block-items-start"]`, [[`align-items`, `flex-start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-items-center"]`, [[`align-items`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-items-end"]`, [[`align-items`, `flex-end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-items-baseline"]`, [[`align-items`, `baseline`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-items-stretch"]`, [[`align-items`, `stretch`]], { isMediaQuery: true }));

  // align-self
  await place.setModifier(new Style(`[data-${prefix}place~="block-self-auto"]`, [[`align-self`, `flex-auto`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-self-start"]`, [[`align-self`, `flex-start`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-self-center"]`, [[`align-self`, `center`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-self-end"]`, [[`align-self`, `flex-end`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-self-baseline"]`, [[`align-self`, `baseline`]], { isMediaQuery: true }));
  await place.setModifier(new Style(`[data-${prefix}place~="block-self-stretch"]`, [[`align-self`, `stretch`]], { isMediaQuery: true }));

  // ====================================
  //  Margin
  // ====================================
  const margin = new Style(`[data-${prefix}m]`, []);

  // 一括
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await margin.setModifier(new Style(`[data-${prefix}m~="${replaceMap[key]}"]`, [[`margin`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await margin.setModifier(new Style(`[data-${prefix}m~="${i}"]`, [[`margin`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  //  Y X
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await margin.setModifier(
          new Style(
            `[data-${prefix}m~="y-${replaceMap[key]}"]`,
            [
              [`margin-top`, `var(--${prefix}space-${key})`],
              [`margin-bottom`, `var(--${prefix}space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await margin.setModifier(
          new Style(
            `[data-${prefix}m~="x-${replaceMap[key]}"]`,
            [
              [`margin-left`, `var(--${prefix}space-${key})`],
              [`margin-right`, `var(--${prefix}space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await margin.setModifier(
      new Style(
        `[data-${prefix}m~="y-${i}"]`,
        [
          [`margin-top`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
          [`margin-bottom`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await margin.setModifier(
      new Style(
        `[data-${prefix}m~="x-${i}"]`,
        [
          [`margin-left`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
          [`margin-right`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
  }

  // top、right、bottom、left、
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await margin.setModifier(new Style(`[data-${prefix}m~="top-${replaceMap[key]}"]`, [[`margin-top`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));

        await margin.setModifier(new Style(`[data-${prefix}m~="right-${replaceMap[key]}"]`, [[`margin-right`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));

        await margin.setModifier(new Style(`[data-${prefix}m~="bottom-${replaceMap[key]}"]`, [[`margin-bottom`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));

        await margin.setModifier(new Style(`[data-${prefix}m~="left-${replaceMap[key]}"]`, [[`margin-left`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await margin.setModifier(new Style(`[data-${prefix}m~="top-${i}"]`, [[`margin-top`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="right-${i}"]`, [[`margin-right`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="bottom-${i}"]`, [[`margin-bottom`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="left-${i}"]`, [[`margin-left`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  // Block Inline
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await margin.setModifier(new Style(`[data-${prefix}m~="block-${replaceMap[key]}"]`, [[`margin-block`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));

        await margin.setModifier(new Style(`[data-${prefix}m~="inline-${replaceMap[key]}"]`, [[`--${prefix}margin-inline`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await margin.setModifier(new Style(`[data-${prefix}m~="block-${i}"]`, [[`margin-block`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="inline-${i}"]`, [[`margin-inline`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  // block-start・end Inline start・end
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        // block
        await margin.setModifier(new Style(`[data-${prefix}m~="block-start-${replaceMap[key]}"]`, [[`margin-block-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="block-end-${replaceMap[key]}"]`, [[`margin-block-end`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));

        // inline
        await margin.setModifier(new Style(`[data-${prefix}m~="inline-start-${replaceMap[key]}"]`, [[`margin-inline-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="inline-end-${replaceMap[key]}"]`, [[`margin-inline-end`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    // block
    await margin.setModifier(new Style(`[data-${prefix}m~="block-start-${i}"]`, [[`margin-block-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="block-end-${i}"]`, [[`margin-block-end`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));

    // inline
    await margin.setModifier(
      new Style(`[data-${prefix}m~="inline-start-${i}"]`, [[`margin-inline-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true })
    );
    await margin.setModifier(new Style(`[data-${prefix}m~="inline-end-${i}"]`, [[`margin-inline-end`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await margin.setModifier(new Style(`[data-${prefix}m~="[]"]`, [[`margin`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(
    new Style(
      `[data-${prefix}m~="y-[]"]`,
      [
        [`margin-top`, `true`],
        [`margin-bottom`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await margin.setModifier(
    new Style(
      `[data-${prefix}m~="x-[]"]`,
      [
        [`margin-left`, `true`],
        [`margin-right`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await margin.setModifier(new Style(`[data-${prefix}m~="top-[]"]`, [[`margin-top`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="right-[]"]`, [[`margin-right`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="bottom-[]"]`, [[`margin-bottom`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="left-[]"]`, [[`margin-left`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="block-[]"]`, [[`margin-block`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="inline-[]"]`, [[`margin-inline`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="block-start-[]"]`, [[`margin-block-start`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="block-end-[]"]`, [[`margin-block-end`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="inline-start-[]"]`, [[`margin-inline-start`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="inline-end-[]"]`, [[`margin-inline-end`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Padding
  // ====================================
  const padding = new Style(`[data-${prefix}p]`, []);

  // 一括
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await padding.setModifier(new Style(`[data-${prefix}p~="${replaceMap[key]}"]`, [[`padding`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await padding.setModifier(new Style(`[data-${prefix}p~="${i}"]`, [[`padding`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  // Y X
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await padding.setModifier(
          new Style(
            `[data-${prefix}p~="y-${replaceMap[key]}"]`,
            [
              [`padding-top`, `var(--${prefix}space-${key})`],
              [`padding-bottom`, `var(--${prefix}space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await padding.setModifier(
          new Style(
            `[data-${prefix}p~="x-${replaceMap[key]}"]`,
            [
              [`padding-left`, `var(--${prefix}space-${key})`],
              [`padding-right`, `var(--${prefix}space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await padding.setModifier(
      new Style(
        `[data-${prefix}p~="y-${i}"]`,
        [
          [`padding-top`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
          [`padding-bottom`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await padding.setModifier(
      new Style(
        `[data-${prefix}p~="x-${i}"]`,
        [
          [`padding-left`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
          [`padding-right`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
  }

  // top, right, bottom, left
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await padding.setModifier(new Style(`[data-${prefix}p~="top-${replaceMap[key]}"]`, [[`padding-top`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await padding.setModifier(new Style(`[data-${prefix}p~="right-${replaceMap[key]}"]`, [[`padding-right`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await padding.setModifier(new Style(`[data-${prefix}p~="bottom-${replaceMap[key]}"]`, [[`padding-bottom`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await padding.setModifier(new Style(`[data-${prefix}p~="left-${replaceMap[key]}"]`, [[`padding-left`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await padding.setModifier(new Style(`[data-${prefix}p~="top-${i}"]`, [[`padding-top`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await padding.setModifier(new Style(`[data-${prefix}p~="right-${i}"]`, [[`padding-right`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await padding.setModifier(new Style(`[data-${prefix}p~="bottom-${i}"]`, [[`padding-bottom`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await padding.setModifier(new Style(`[data-${prefix}p~="left-${i}"]`, [[`padding-left`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  // Block Inline
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await padding.setModifier(new Style(`[data-${prefix}p~="block-${replaceMap[key]}"]`, [[`padding-block`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await padding.setModifier(new Style(`[data-${prefix}p~="inline-${replaceMap[key]}"]`, [[`padding-inline`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await padding.setModifier(new Style(`[data-${prefix}p~="block-${i}"]`, [[`padding-block`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await padding.setModifier(new Style(`[data-${prefix}p~="inline-${i}"]`, [[`padding-inline`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  // block-start/end, inline-start/end
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await padding.setModifier(new Style(`[data-${prefix}p~="block-start-${replaceMap[key]}"]`, [[`padding-block-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await padding.setModifier(new Style(`[data-${prefix}p~="block-end-${replaceMap[key]}"]`, [[`padding-block-end`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await padding.setModifier(new Style(`[data-${prefix}p~="inline-start-${replaceMap[key]}"]`, [[`padding-inline-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await padding.setModifier(new Style(`[data-${prefix}p~="inline-end-${replaceMap[key]}"]`, [[`padding-inline-end`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await padding.setModifier(
      new Style(`[data-${prefix}p~="block-start-${i}"]`, [[`padding-block-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true })
    );
    await padding.setModifier(new Style(`[data-${prefix}p~="block-end-${i}"]`, [[`padding-block-end`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await padding.setModifier(
      new Style(`[data-${prefix}p~="inline-start-${i}"]`, [[`padding-inline-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true })
    );
    await padding.setModifier(new Style(`[data-${prefix}p~="inline-end-${i}"]`, [[`padding-inline-end`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await padding.setModifier(new Style(`[data-${prefix}p~="[]"]`, [[`padding`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(
    new Style(
      `[data-${prefix}p~="y-[]"]`,
      [
        [`padding-top`, `true`],
        [`padding-bottom`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await padding.setModifier(
    new Style(
      `[data-${prefix}p~="x-[]"]`,
      [
        [`padding-left`, `true`],
        [`padding-right`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await padding.setModifier(new Style(`[data-${prefix}p~="top-[]"]`, [[`padding-top`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="right-[]"]`, [[`padding-right`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="bottom-[]"]`, [[`padding-bottom`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="left-[]"]`, [[`padding-left`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="block-[]"]`, [[`padding-block`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="inline-[]"]`, [[`padding-inline`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="block-start-[]"]`, [[`padding-block-start`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="block-end-[]"]`, [[`padding-block-end`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="inline-start-[]"]`, [[`padding-inline-start`, `true`]], { isMediaQuery: true }));
  await padding.setModifier(new Style(`[data-${prefix}p~="inline-end-[]"]`, [[`padding-inline-end`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  space
  // ====================================
  const space = new Style(`[data-${prefix}space] > * + * `, []);

  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await space.setModifier(new Style(`[data-${prefix}space~="x-${replaceMap[key]}"] > * + * `, [[`margin-left`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await space.setModifier(new Style(`[data-${prefix}space~="y-${replaceMap[key]}"] > * + * `, [[`margin-top`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await space.setModifier(new Style(`[data-${prefix}space~="x-${i}"] > * + * `, [[`margin-left`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await space.setModifier(new Style(`[data-${prefix}space~="y-${i}"] > * + * `, [[`margin-top`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await space.setModifier(new Style(`[data-${prefix}space~="x-[]}"] > * + * `, [[`margin-left`, `true`]], { isMediaQuery: true }));
  await space.setModifier(new Style(`[data-${prefix}space~="y-[]"] > * + * `, [[`margin-top`, `true`]], { isMediaQuery: true }));

  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await space.setModifier(new Style(`[data-${prefix}space~="inline-${replaceMap[key]}"] > * + * `, [[`margin-inline-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await space.setModifier(new Style(`[data-${prefix}space~="block-${replaceMap[key]}"] > * + * `, [[`margin-block-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await space.setModifier(
      new Style(`[data-${prefix}space~="inline-${i}"] > * + * `, [[`margin-inline-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true })
    );
    await space.setModifier(
      new Style(`[data-${prefix}space~="block-${i}"] > * + * `, [[`margin-block-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true })
    );
  }

  await space.setModifier(new Style(`[data-${prefix}space~="inline-[]}"] > * + * `, [[`margin-inline-start`, `true`]], { isMediaQuery: true }));
  await space.setModifier(new Style(`[data-${prefix}space~="block-[]"] > * + * `, [[`margin-block-start`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Width
  // ====================================
  const width = new Style(`[data-${prefix}width]`, []);

  await width.setModifier(new Style(`[data-${prefix}width~="auto"] `, [[`width`, `auto`]], { isMediaQuery: true }));

  const widthSizes = new Map([
    ["0", "0"],
    ["full", "100%"],
    ["screen", "100vw"],
    ["svw", "100svw"],
    ["lvw", "100lvw"],
    ["dvw", "100dvw"],
    ["min", "min-conten"],
    ["max", "max-conten"],
    ["fit", "fit-conten"],
    ["[]", "true"],
  ]);

  for (const [key, value] of widthSizes) {
    await width.setModifier(new Style(`[data-${prefix}width~="${key}"]`, [[`width`, value]], { isMediaQuery: true }));
  }

  //  Min Width

  for (const [key, value] of widthSizes) {
    await width.setModifier(new Style(`[data-${prefix}width~="min-${key}"]`, [[`min-width`, value]], { isMediaQuery: true }));
  }

  //  Max Width
  widthSizes.delete("0");
  widthSizes.set("none", "none");

  for (const [key, value] of widthSizes) {
    await width.setModifier(new Style(`[data-${prefix}width~="max-${key}"]`, [[`max-width`, value]], { isMediaQuery: true }));
  }

  const contentsSize = themes.get("contents") ?? null;

  if (contentsSize instanceof Map) {
    for (const [key] of contentsSize) {
      if (replaceMap[key]) {
        await width.setModifier(new Style(`[data-${prefix}width~="max-${replaceMap[key]}"] `, [[`max-width`, `var(--${prefix}contents-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  // ====================================
  //  Height
  // ====================================
  const height = new Style(`[data-${prefix}height]`, []);

  await height.setModifier(new Style(`[data-${prefix}height~="auto"] `, [[`height`, `auto`]], { isMediaQuery: true }));

  const heightSizes = new Map([
    ["0", "0"],
    ["full", "100%"],
    ["screen", "100vh"],
    ["svw", "100svh"],
    ["lvw", "100lvh"],
    ["dvw", "100dvh"],
    ["min", "min-conten"],
    ["max", "max-conten"],
    ["fit", "fit-conten"],
    ["[]", "true"],
  ]);

  for (const [key, value] of heightSizes) {
    await height.setModifier(new Style(`[data-${prefix}height~="${key}"] `, [[`height`, value]], { isMediaQuery: true }));
  }

  //  Min Height

  for (const [key, value] of heightSizes) {
    await height.setModifier(new Style(`[data-${prefix}height~="min-${key}"] `, [[`min-height`, value]], { isMediaQuery: true }));
  }

  //  Max Height
  heightSizes.delete("0");
  heightSizes.set("none", "none");

  for (const [key, value] of heightSizes) {
    await height.setModifier(new Style(`[data-${prefix}height~="max-${key}"] `, [[`max-height`, value]], { isMediaQuery: true }));
  }

  // ====================================
  //  size
  // ====================================
  const size = new Style(`[data-${prefix}size]`, []);

  await size.setModifier(new Style(`[data-${prefix}size~="inline-auto"] `, [[`inline-size`, `auto`]], { isMediaQuery: true }));
  await size.setModifier(new Style(`[data-${prefix}size~="block-auto"] `, [[`block-size`, `auto`]], { isMediaQuery: true }));

  const inlineSizes = new Map([
    ["0", "0"],
    ["full", "100%"],
    ["screen", "100vi"],
    ["svw", "100svi"],
    ["lvw", "100lvi"],
    ["dvw", "100dvi"],
    ["min", "min-conten"],
    ["max", "max-conten"],
    ["fit", "fit-conten"],
    ["[]", "true"],
  ]);
  const blockSizes = new Map([
    ["0", "0"],
    ["full", "100%"],
    ["screen", "100vb"],
    ["svw", "100svb"],
    ["lvw", "100lvb"],
    ["dvw", "100dvb"],
    ["min", "min-conten"],
    ["max", "max-conten"],
    ["fit", "fit-conten"],
    ["[]", "true"],
  ]);

  for (const [key, value] of inlineSizes) {
    await size.setModifier(new Style(`[data-${prefix}size~="inline-${key}"] `, [[`inline-size`, value]], { isMediaQuery: true }));
  }
  for (const [key, value] of blockSizes) {
    await size.setModifier(new Style(`[data-${prefix}size~="block-${key}"] `, [[`block-size`, value]], { isMediaQuery: true }));
  }

  //  Min size

  for (const [key, value] of inlineSizes) {
    await size.setModifier(new Style(`[data-${prefix}size~="min-inline-${key}"] `, [[`min-inline-size`, value]], { isMediaQuery: true }));
  }
  for (const [key, value] of blockSizes) {
    await size.setModifier(new Style(`[data-${prefix}size~="min-block-${key}"] `, [[`min-block-size`, value]], { isMediaQuery: true }));
  }

  //  Max size
  inlineSizes.delete("0");
  inlineSizes.set("none", "none");
  blockSizes.delete("0");
  blockSizes.set("none", "none");

  for (const [key, value] of inlineSizes) {
    await size.setModifier(new Style(`[data-${prefix}size~="max-inline-${key}"] `, [[`max-inline-size`, value]], { isMediaQuery: true }));
  }
  for (const [key, value] of blockSizes) {
    await size.setModifier(new Style(`[data-${prefix}size~="max-block-${key}"] `, [[`max-block-size`, value]], { isMediaQuery: true }));
  }

  if (contentsSize instanceof Map) {
    for (const [key] of contentsSize) {
      if (replaceMap[key]) {
        await size.setModifier(new Style(`[data-${prefix}size~="max-inline-${replaceMap[key]}"] `, [[`max-inline-size`, `var(--${prefix}contents-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  // ====================================
  //  aspect
  // ====================================
  const aspect = new Style(`[data-${prefix}aspect]`, []);

  const aspectValues = new Map([
    ["video", "16 / 9"],
    ["square", "1 / 1"],
    ["v-golden", "1.618 / 1"],
    ["h-golden", "1 / 1.618"],
    ["v-silver", "1.414 / 1"],
    ["h-silver", "1 / 1.414"],
    ["v-platinum", "1.732 / 1"],
    ["h-platinum", "1 / 1.732"],
    ["[]", "true"],
  ]);

  for (const [key, value] of aspectValues) {
    await aspect.setModifier(new Style(`[data-${prefix}aspect~="${key}"] `, [[`aspect-ratio`, value]], { isMediaQuery: true }));
  }

  // ====================================
  //  display
  // ====================================

  const display = new Style(`[data-${prefix}display]`, []);

  const displayValues = new Map([
    ["block", "block flow"],
    ["flow-root", "block flow-root"],
    ["inline", "inline flow"],
    ["inline-block", "inline flow-root"],
    ["flex", "block flex"],
    ["inline-flex", "inline flex"],
    ["grid", "block grid"],
    ["inline-grid", "inline grid"],
    ["contents", "contents"],
    ["none", "none"],
    ["[]", "true"],
  ]);

  for (const [key, value] of displayValues) {
    await display.setModifier(new Style(`[data-${prefix}display~="${key}"] `, [[`display`, value]], { isMediaQuery: true }));
  }

  // ====================================
  //  Position
  // ====================================
  const position = new Style(`[data-${prefix}position]`, []);

  const positionValues = new Map([
    ["static", "static"],
    ["relative", "relative"],
    ["absolute", "absolute"],
    ["fixed", "fixed"],
    ["sticky", "sticky"],
  ]);

  for (const [key, value] of positionValues) {
    await position.setModifier(new Style(`[data-${prefix}position~="${key}"] `, [[`position`, value]], { isMediaQuery: true }));
  }

  // ====================================
  //  Inset
  // ====================================
  const inset = new Style(`[data-${prefix}inset]`, []);

  // 一括
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await inset.setModifier(new Style(`[data-${prefix}inset~="${replaceMap[key]}"]`, [[`inset`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await inset.setModifier(new Style(`[data-${prefix}inset~="${i}"]`, [[`inset`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await inset.setModifier(new Style(`[data-${prefix}inset~="[]"]`, [[`inset`, `true`]], { isMediaQuery: true }));

  // X Y
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await inset.setModifier(
          new Style(
            `[data-${prefix}inset~="x-${replaceMap[key]}"]`,
            [
              [`left`, `var(--${prefix}space-${key})`],
              [`right`, `var(--${prefix}space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await inset.setModifier(
          new Style(
            `[data-${prefix}inset~="y-${replaceMap[key]}"]`,
            [
              [`top`, `var(--${prefix}space-${key})`],
              [`bottom`, `var(--${prefix}space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await inset.setModifier(
      new Style(
        `[data-${prefix}inset~="x-${i}"]`,
        [
          [`left`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
          [`right`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await inset.setModifier(
      new Style(
        `[data-${prefix}inset~="y-${i}"]`,
        [
          [`top`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
          [`bottom`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
  }

  await inset.setModifier(
    new Style(
      `[data-${prefix}inset~="x-[]"]`,
      [
        [`left`, `true`],
        [`right`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await inset.setModifier(
    new Style(
      `[data-${prefix}inset~="y-[]"]`,
      [
        [`top`, `true`],
        [`bottom`, `true`],
      ],
      { isMediaQuery: true }
    )
  );

  // top,right,bottom,left
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await inset.setModifier(new Style(`[data-${prefix}inset~="top-${replaceMap[key]}"]`, [[`top`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await inset.setModifier(new Style(`[data-${prefix}inset~="right-${replaceMap[key]}"]`, [[`right`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await inset.setModifier(new Style(`[data-${prefix}inset~="bottom-${replaceMap[key]}"]`, [[`bottom`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await inset.setModifier(new Style(`[data-${prefix}inset~="left-${replaceMap[key]}"]`, [[`left`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await inset.setModifier(new Style(`[data-${prefix}inset~="top-${i}"]`, [[`top`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await inset.setModifier(new Style(`[data-${prefix}inset~="right-${i}"]`, [[`right`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await inset.setModifier(new Style(`[data-${prefix}inset~="bottom-${i}"]`, [[`bottom`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await inset.setModifier(new Style(`[data-${prefix}inset~="left-${i}"]`, [[`left`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await inset.setModifier(new Style(`[data-${prefix}inset~="top-[]"]`, [[`top`, `true`]], { isMediaQuery: true }));
  await inset.setModifier(new Style(`[data-${prefix}inset~="right-[]"]`, [[`right`, `true`]], { isMediaQuery: true }));
  await inset.setModifier(new Style(`[data-${prefix}inset~="bottom-[]"]`, [[`bottom`, `true`]], { isMediaQuery: true }));
  await inset.setModifier(new Style(`[data-${prefix}inset~="left-[]"]`, [[`left`, `true`]], { isMediaQuery: true }));

  // inline block
  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await inset.setModifier(new Style(`[data-${prefix}inset~="inline-${replaceMap[key]}"]`, [[`inset-inline`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await inset.setModifier(new Style(`[data-${prefix}inset~="block-${replaceMap[key]}"]`, [[`inset-block`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await inset.setModifier(new Style(`[data-${prefix}inset~="inline-${i}"]`, [[`inset-inline`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await inset.setModifier(new Style(`[data-${prefix}inset~="block-${i}"]`, [[`inset-block`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await inset.setModifier(new Style(`[data-${prefix}inset~="inline-[]"]`, [[`inset-inline`, `true`]], { isMediaQuery: true }));
  await inset.setModifier(new Style(`[data-${prefix}inset~="block-[]"]`, [[`inset-block`, `true`]], { isMediaQuery: true }));

  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await inset.setModifier(new Style(`[data-${prefix}inset~="inline-start-${replaceMap[key]}"]`, [[`inset-inline-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await inset.setModifier(new Style(`[data-${prefix}inset~="inline-end-${replaceMap[key]}"]`, [[`inset-inline-end`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await inset.setModifier(new Style(`[data-${prefix}inset~="block-start-${replaceMap[key]}"]`, [[`inset-block-start`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
        await inset.setModifier(new Style(`[data-${prefix}inset~="block-end-${replaceMap[key]}"]`, [[`inset-block-end`, `var(--${prefix}space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await inset.setModifier(
      new Style(`[data-${prefix}inset~="inline-start-${i}"]`, [[`inset-inline-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true })
    );
    await inset.setModifier(new Style(`[data-${prefix}inset~="inline-end-${i}"]`, [[`inset-inline-end`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
    await inset.setModifier(
      new Style(`[data-${prefix}inset~="block-start-${i}"]`, [[`inset-block-start`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true })
    );
    await inset.setModifier(new Style(`[data-${prefix}inset~="block-end-${i}"]`, [[`inset-block-end`, `calc(var(--${prefix}space-base) * ${i} * var(--${prefix}to-rem))`]], { isMediaQuery: true }));
  }

  await inset.setModifier(new Style(`[data-${prefix}inset~="inline-start-[]"]`, [[`inset-inline-start`, `true`]], { isMediaQuery: true }));
  await inset.setModifier(new Style(`[data-${prefix}inset~="inline-end-[]"]`, [[`inset-inline-end`, `true`]], { isMediaQuery: true }));
  await inset.setModifier(new Style(`[data-${prefix}inset~="block-start-[]"]`, [[`inset-block-start`, `true`]], { isMediaQuery: true }));
  await inset.setModifier(new Style(`[data-${prefix}inset~="block-end-[]"]`, [[`inset-block-end`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  z-index
  // ====================================

  const zIndex = new Style(`[data-${prefix}z-index]`, []);

  await zIndex.setModifier(new Style(`[data-${prefix}z-index~="0"]`, [[`z-index`, `0`]], { isMediaQuery: true }));
  await zIndex.setModifier(new Style(`[data-${prefix}z-index~="1"]`, [[`z-index`, `1`]], { isMediaQuery: true }));
  await zIndex.setModifier(new Style(`[data-${prefix}z-index~="-1"]`, [[`z-index`, `-1`]], { isMediaQuery: true }));

  for (let i = 1; i <= 5; i++) {
    await zIndex.setModifier(new Style(`[data-${prefix}z-index~="${i * 10}"]`, [[`z-index`, `${i * 10}`]], { isMediaQuery: true }));
    await zIndex.setModifier(new Style(`[data-${prefix}z-index~="-${i * 10}"]`, [[`z-index`, `${i * 10 * -1}`]], { isMediaQuery: true }));
  }

  await zIndex.setModifier(new Style(`[data-${prefix}z-index~="auto"]`, [[`z-index`, `auto`]], { isMediaQuery: true }));

  await zIndex.setModifier(new Style(`[data-${prefix}z-index~="[]"]`, [[`z-index`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Overflow
  // ====================================
  const overflow = new Style(`[data-${prefix}overflow]`, []);

  const overflowValues = new Map([
    ["auto", "auto"],
    ["visible", "visible"],
    ["hidden", "hidden"],
    ["clip", "clip"],
    ["scroll", "scroll"],
  ]);

  for (const [key, value] of overflowValues) {
    await overflow.setModifier(new Style(`[data-${prefix}overflow~="${key}"] `, [[`overflow`, value]], { isMediaQuery: true }));
  }
  for (const [key, value] of overflowValues) {
    await overflow.setModifier(new Style(`[data-${prefix}overflow~="x-${key}"] `, [[`overflow-x`, value]], { isMediaQuery: true }));
    await overflow.setModifier(new Style(`[data-${prefix}overflow~="y-${key}"] `, [[`overflow-y`, value]], { isMediaQuery: true }));
  }

  // ルールをセット
  const rules = new Set([container, over, grid, gridItem, flex, flexItem, gap, order, place, margin, padding, space, width, height, size, aspect, display, position, inset, zIndex, overflow]);

  for (const rule of rules) {
    const ruleResult = await rule.output();

    if (ruleResult) layoutsRoot.append(ruleResult);
  }

  root.walkAtRules("olex", (atRule) => {
    if (atRule.params === "layouts") {
      atRule.parent?.prepend(layoutsRoot); // 😍
      atRule.remove();
      return;
    }
  });
};
