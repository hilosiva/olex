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
    [`margin-inline`, `var(--${prefix}over-margin-start, var(--${prefix}over-start)) var(--${prefix}over-margin-end, var(--${prefix}over-end))`],
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
          [`--${prefix}over-margin-start`, start === "0" ? "0" : `var(--${prefix}over-${start})`],
          [`--${prefix}over-margin-end`, end === "0" ? "0" : `var(--${prefix}over-${end})`],
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
    [`--${prefix}grid-cols`, `initial`],
    [`--${prefix}grid-rows`, `initial`],
    [`--${prefix}grid-layout`, `minmax(0, 1fr)`],
    [`--${prefix}grid-auto-fit`, `minmax(min(var(--${prefix}grid-min-size, 300px), 100%), 1fr)`],

    // ["container", "grid / inline-size"],
    [`display`, `var(--${prefix}grid-display) grid`],
    [`grid-template-columns`, `var(--${prefix}grid-cols)`],
    [`grid-template-rows`, `var(--${prefix}grid-rows)`],
  ]);

  // Display
  const gridDisplay = new Map([
    ["block", "block"],
    ["inline", "inline"],
  ]);

  for (const [key, value] of gridDisplay) {
    await grid.setModifier(new Style(`[data-${prefix}grid~="${key}"]`, [[`--${prefix}grid-display`, value]], { isMediaQuery: true }));
  }

  await grid.setModifier(new Style(`[data-${prefix}grid~="cols-0"]`, [[`--${prefix}grid-cols`, `none`]], { isMediaQuery: true }));

  for (let i = 1; i <= columns; i++) {
    await grid.setModifier(new Style(`[data-${prefix}grid~="cols-${i}"]`, [[`--${prefix}grid-cols`, `repeat(${i}, var(--${prefix}grid-layout))`]], { isMediaQuery: true }));
  }

  //  auto-fit
  await grid.setModifier(
    new Style(`[data-${prefix}grid~="cols-auto-fit"]`, [[`--${prefix}grid-cols`, `repeat(auto-fit, var(--${prefix}grid-auto-fit))`]], {
      isMediaQuery: true,
    })
  );

  // subgrid
  await grid.setModifier(new Style(`[data-grid~="cols-subgrid"]`, [[`--${prefix}grid-cols`, `subgrid`]], { isMediaQuery: true }));

  await grid.setModifier(
    new Style(`[style~="--${prefix}cols:"]`, [[`--${prefix}grid-cols`, `repeat(var(--${prefix}cols), var(--${prefix}grid-layout))`]], {
      isMediaQuery: false,
    })
  );

  await grid.setModifier(
    new Style(`[style*="--${prefix}cols: auto-fit"]`, [[`--${prefix}grid-cols`, `repeat(var(--${prefix}cols), var(--${prefix}grid-auto-fit))`]], {
      isMediaQuery: false,
    })
  );

  await grid.setModifier(new Style(`[data-${prefix}grid~="cols-[]"]`, [[`--${prefix}grid-cols`, `true`]], { isMediaQuery: true }));

  // Rows

  await grid.setModifier(new Style(`[data-${prefix}grid~="rows-0"]`, [[`--${prefix}grid-rows`, `none`]], { isMediaQuery: true }));

  for (let i = 1; i <= rows; i++) {
    await grid.setModifier(new Style(`[data-${prefix}grid~="rows-${i}"]`, [[`--${prefix}grid-rows`, `repeat(${i}, var(--${prefix}grid-layout))`]], { isMediaQuery: true }));
  }

  // subgrid
  await grid.setModifier(new Style(`[data-${prefix}grid~="rows-subgrid"]`, [[`--${prefix}grid-rows`, `subgrid`]], { isMediaQuery: true }));

  await grid.setModifier(new Style(`[data-${prefix}grid~="rows-[]"]`, [[`--${prefix}grid-rows`, `true`]], { isMediaQuery: true }));

  // ==========================
  // Grid Item
  // ==========================

  const gridItem = new Style(`[data-${prefix}grid-item]`, [
    [`--${prefix}grid-col-start`, `initial`],
    [`--${prefix}grid-col-end`, `initial`],
    [`--${prefix}grid-row-start`, `initial`],
    [`--${prefix}grid-row-end`, `initial`],
    ["grid-column", `var(--${prefix}grid-col-start) / var(--${prefix}grid-col-end)`],
    [`grid-row`, `var(--${prefix}grid-row-start) / var(--${prefix}grid-row-end)`],
    // ["container", "grid-item / inline-size"],
  ]);

  // Col
  // ----------------------------
  await gridItem.setModifier(
    new Style(
      `[data-${prefix}grid-item*="col-"]`,
      [
        [`--${prefix}grid-col-start`, `initial`],
        [`--${prefix}grid-col-end`, `initial`],
        ["grid-column", `var(--${prefix}grid-col-start) / var(--${prefix}grid-col-end)`],
      ],
      { isMediaQuery: false }
    )
  );

  for (let i = 1; i <= columns; i++) {
    await gridItem.setModifier(
      new Style(
        `[data-${prefix}grid-item~="col-${i}"]`,
        [
          [`--${prefix}grid-col-start`, `span ${i}`],
          [`--${prefix}grid-col-end`, `span ${i}`],
        ],
        { isMediaQuery: true }
      )
    );

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-start-${i}"]`, [[`--${prefix}grid-col-start`, `${i}`]], { isMediaQuery: true }));

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-end-${i}"]`, [[`--${prefix}grid-col-end`, `${i}`]], { isMediaQuery: true }));
  }

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-start-[]"]`, [[`--${prefix}grid-col-start`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-end-[]"]`, [[`--${prefix}grid-col-end`, `true`]], { isMediaQuery: true }));

  await gridItem.setModifier(
    new Style(
      `[data-${prefix}grid-item~="col-full"]`,
      [
        [`--${prefix}grid-col-start`, `1`],
        [`--${prefix}grid-col-end`, `-1`],
      ],
      { isMediaQuery: true }
    )
  );

  await gridItem.setModifier(
    new Style(
      `[data-${prefix}grid-item~="col-auto"]`,
      [
        [`--${prefix}grid-col-start`, `auto`],
        [`--${prefix}grid-col-end`, `auto`],
      ],
      { isMediaQuery: true }
    )
  );

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-start-auto"]`, [[`--${prefix}grid-col-start`, `auto`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="col-end-auto"]`, [[`--${prefix}grid-col-end`, `auto`]], { isMediaQuery: true }));

  // Row
  // ----------------------------

  for (let i = 1; i <= rows; i++) {
    await gridItem.setModifier(
      new Style(
        `[data-${prefix}grid-item~="row-${i}"]`,
        [
          [`--${prefix}grid-row-start`, `span ${i}`],
          [`--${prefix}grid-row-end`, `span ${i}`],
        ],
        { isMediaQuery: true }
      )
    );

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-start-${i}"]`, [[`--${prefix}grid-row-start`, `${i}`]], { isMediaQuery: true }));

    await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-end-${i}"]`, [[`--${prefix}grid-row-end`, `${i}`]], { isMediaQuery: true }));
  }

  await gridItem.setModifier(
    new Style(
      `[data-${prefix}grid-item~="row-full"]`,
      [
        [`--${prefix}grid-row-start`, `1`],
        [`--${prefix}grid-row-end`, `-1`],
      ],
      { isMediaQuery: true }
    )
  );

  await gridItem.setModifier(
    new Style(
      `[data-${prefix}grid-item~="row-auto"]`,
      [
        [`--${prefix}grid-row-start`, `auto`],
        [`--${prefix}grid-row-end`, `auto`],
      ],
      { isMediaQuery: true }
    )
  );

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-start-auto"]`, [[`--${prefix}grid-row-start`, `auto`]], { isMediaQuery: true }));

  await gridItem.setModifier(new Style(`[data-${prefix}grid-item~="row-end-auto"]`, [[`--${prefix}grid-row-end`, `auto`]], { isMediaQuery: true }));

  // ====================================
  //  Flex
  // ====================================
  const flex = new Style(`[data-${prefix}flex]`, [
    [`--${prefix}flex-display`, "block"],
    [`--${prefix}flex-wrap`, `var(--${prefix}default-flex-wrap, wrap)`],
    // ["container", "flex / inline-size"],
    ["display", `var(--${prefix}flex-display) flex`],
    ["flex-wrap", `var(--${prefix}flex-wrap)`],
    ["flex-direction", `var(--${prefix}flex-direction)`],
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
    await flex.setModifier(new Style(`[data-${prefix}flex~="${key}"]`, [[`--${prefix}flex-wrap`, value]], { isMediaQuery: true }));
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
    await over.setModifier(new Style(`[data-${prefix}flex~="${key}"]`, [[`--${prefix}flex-direction`, value]], { isMediaQuery: true }));
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
    await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="g-${i}"]`, [[`--${prefix}grow`, `${i}`]], { isMediaQuery: true }));
    await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="s-${i}"]`, [[`--${prefix}shrink`, `${i}`]], { isMediaQuery: true }));
  }

  await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="g-[]"]`, [[`--${prefix}grow`, `true`]], { isMediaQuery: true }));
  await flexItem.setModifier(new Style(`[data-${prefix}flex-item~="s-[]"]`, [[`--${prefix}shrink`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Gap
  // ====================================
  const gap = new Style(`[data-${prefix}gap]`, [
    [`--${prefix}gap-row`, `initial`],
    [`--${prefix}gap-col`, `initial`],
    ["gap", `var(--${prefix}gap-row) var(--${prefix}gap-col)`],
  ]);

  // // サイズ
  const spaces = themes.get("space") ?? null;

  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await gap.setModifier(
          new Style(
            `[data-${prefix}gap~="${replaceMap[key]}"]`,
            [
              [`--${prefix}gap-row`, `var(--space-${key})`],
              [`--${prefix}gap-col`, `var(--space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await gap.setModifier(new Style(`[data-${prefix}gap~="col-${replaceMap[key]}"]`, [[`--${prefix}gap-col`, `var(--space-${key})`]], { isMediaQuery: true }));
        await gap.setModifier(new Style(`[data-${prefix}gap~="row-${replaceMap[key]}"]`, [[`--${prefix}gap-row`, `var(--space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await gap.setModifier(
      new Style(
        `[data-${prefix}gap~="${i}"]`,
        [
          [`--${prefix}gap-row`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}gap-col`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await gap.setModifier(new Style(`[data-${prefix}gap~="col-${i}"]`, [[`--${prefix}gap-col`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await gap.setModifier(new Style(`[data-${prefix}gap~="row-${i}"]`, [[`--${prefix}gap-row`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
  }

  await gap.setModifier(
    new Style(
      `[data-${prefix}gap~="[]"]`,
      [
        [`--${prefix}gap-row`, `true`],
        [`--${prefix}gap-col`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await gap.setModifier(new Style(`[data-${prefix}gap~="col-[]"]`, [[`--${prefix}gap-col`, `true`]], { isMediaQuery: true }));
  await gap.setModifier(new Style(`[data-${prefix}gap~="row-[]"]`, [[`--${prefix}gap-row`, `true`]], { isMediaQuery: true }));

  // ====================================
  //  Margin
  // ====================================
  const margin = new Style(`[data-${prefix}m]`, [
    [`--${prefix}margin-inline-start`, `initial`],
    [`--${prefix}margin-inline-end`, `initial`],
    [`--${prefix}margin-block-start`, `initial`],
    [`--${prefix}margin-block-end`, `initial`],
    [`--${prefix}margin-top`, `initial`],
    [`--${prefix}margin-right`, `initial`],
    [`--${prefix}margin-bottom`, `initial`],
    [`--${prefix}margin-left`, `initial`],
    ["margin", `var(--${prefix}margin-top) var(--${prefix}margin-right) var(--${prefix}margin-bottom) var(--${prefix}margin-left)`],
  ]);

  if (spaces instanceof Map) {
    for (const [key] of spaces) {
      if (replaceMap[key]) {
        await margin.setModifier(
          new Style(
            `[data-${prefix}m~="${replaceMap[key]}"]`,
            [
              [`--${prefix}margin-top`, `var(--space-${key})`],
              [`--${prefix}margin-right`, `var(--space-${key})`],
              [`--${prefix}margin-bottom`, `var(--space-${key})`],
              [`--${prefix}margin-left`, `var(--space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await margin.setModifier(
          new Style(
            `[data-${prefix}m~="y-${replaceMap[key]}"]`,
            [
              [`--${prefix}margin-top`, `var(--space-${key})`],
              [`--${prefix}margin-bottom`, `var(--space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await margin.setModifier(
          new Style(
            `[data-${prefix}m~="x-${replaceMap[key]}"]`,
            [
              [`--${prefix}margin-left`, `var(--space-${key})`],
              [`--${prefix}margin-right`, `var(--space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await margin.setModifier(new Style(`[data-${prefix}m~="top-${replaceMap[key]}"]`, [[`--${prefix}margin-top`, `var(--space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="right-${replaceMap[key]}"]`, [[`--${prefix}margin-right`, `var(--space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="bottom-${replaceMap[key]}"]`, [[`--${prefix}margin-bottom`, `var(--space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="left-${replaceMap[key]}"]`, [[`--${prefix}margin-left`, `var(--space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(
          new Style(
            `[data-${prefix}m~="block-${replaceMap[key]}"]`,
            [
              [`--${prefix}margin-block-start`, `var(--space-${key})`],
              [`--${prefix}margin-block-end`, `var(--space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await margin.setModifier(
          new Style(
            `[data-${prefix}m~="inline-${replaceMap[key]}"]`,
            [
              [`--${prefix}margin-inline-start`, `var(--space-${key})`],
              [`--${prefix}margin-inline-end`, `var(--space-${key})`],
            ],
            { isMediaQuery: true }
          )
        );
        await margin.setModifier(new Style(`[data-${prefix}m~="block-start-${replaceMap[key]}"]`, [[`--${prefix}margin-block-start`, `var(--space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="block-end-${replaceMap[key]}"]`, [[`--${prefix}margin-block-end`, `var(--space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="inline-start-${replaceMap[key]}"]`, [[`--${prefix}margin-inline-start`, `var(--space-${key})`]], { isMediaQuery: true }));
        await margin.setModifier(new Style(`[data-${prefix}m~="inline-end-${replaceMap[key]}"]`, [[`--${prefix}margin-inline-end`, `var(--space-${key})`]], { isMediaQuery: true }));
      }
    }
  }

  for (let i = 0; i <= 20; i++) {
    await margin.setModifier(
      new Style(
        `[data-${prefix}m~="${i}"]`,
        [
          [`--${prefix}margin-top`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}margin-right`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}margin-bottom`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}margin-left`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await margin.setModifier(
      new Style(
        `[data-${prefix}m~="y-${i}"]`,
        [
          [`--${prefix}margin-top`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}margin-bottom`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await margin.setModifier(
      new Style(
        `[data-${prefix}m~="x-${i}"]`,
        [
          [`--${prefix}margin-left`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}margin-right`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await margin.setModifier(new Style(`[data-${prefix}m~="top-${i}"]`, [[`--${prefix}margin-top`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="right-${i}"]`, [[`--${prefix}margin-right`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="bottom-${i}"]`, [[`--${prefix}margin-bottom`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="left-${i}"]`, [[`--${prefix}margin-left`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(
      new Style(
        `[data-${prefix}m~="block-${i}"]`,
        [
          [`--${prefix}margin-block-start`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}margin-block-end`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await margin.setModifier(
      new Style(
        `[data-${prefix}m~="inline-${i}"]`,
        [
          [`--${prefix}margin-inline-start`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
          [`--${prefix}margin-inline-end`, `calc(var(--space-base) * ${i} * var(--to-rem))`],
        ],
        { isMediaQuery: true }
      )
    );
    await margin.setModifier(new Style(`[data-${prefix}m~="block-start-${i}"]`, [[`--${prefix}margin-block-start`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="block-end-${i}"]`, [[`--${prefix}margin-block-end`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="inline-start-${i}"]`, [[`--${prefix}margin-inline-start`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
    await margin.setModifier(new Style(`[data-${prefix}m~="inline-end-${i}"]`, [[`--${prefix}margin-inline-end`, `calc(var(--space-base) * ${i} * var(--to-rem))`]], { isMediaQuery: true }));
  }

  await margin.setModifier(
    new Style(
      `[data-${prefix}m~="[]"]`,
      [
        [`--${prefix}margin-top`, `true`],
        [`--${prefix}margin-right`, `true`],
        [`--${prefix}margin-bottom`, `true`],
        [`--${prefix}margin-left`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await margin.setModifier(
    new Style(
      `[data-${prefix}m~="y-[]"]`,
      [
        [`--${prefix}margin-top`, `true`],
        [`--${prefix}margin-bottom`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await margin.setModifier(
    new Style(
      `[data-${prefix}m~="x-[]"]`,
      [
        [`--${prefix}margin-left`, `true`],
        [`--${prefix}margin-right`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await margin.setModifier(new Style(`[data-${prefix}m~="top-[]"]`, [[`--${prefix}margin-top`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="right-[]"]`, [[`--${prefix}margin-right`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="bottom-[]"]`, [[`--${prefix}margin-bottom`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="left-[]"]`, [[`--${prefix}margin-left`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(
    new Style(
      `[data-${prefix}m~="block-[]"]`,
      [
        [`--${prefix}margin-block-start`, `true`],
        [`--${prefix}margin-block-end`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await margin.setModifier(
    new Style(
      `[data-${prefix}m~="inline-[]"]`,
      [
        [`--${prefix}margin-inline-start`, `true`],
        [`--${prefix}margin-inline-end`, `true`],
      ],
      { isMediaQuery: true }
    )
  );
  await margin.setModifier(new Style(`[data-${prefix}m~="block-start-[]"]`, [[`--${prefix}margin-block-start`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="block-end-[]"]`, [[`--${prefix}margin-block-end`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="inline-start-[]"]`, [[`--${prefix}margin-inline-start`, `true`]], { isMediaQuery: true }));
  await margin.setModifier(new Style(`[data-${prefix}m~="inline-end-[]"]`, [[`--${prefix}margin-inline-end`, `true`]], { isMediaQuery: true }));

  // ルールをセット
  const rules = new Set([container, over, grid, gridItem, flex, flexItem, gap, margin]);

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
