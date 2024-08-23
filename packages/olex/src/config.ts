import * as fs from "fs";
import * as path from "path";
import deepMerge from "./utils/deep-marge";


interface Config {
  content: string[] | string;
  prefix: string;
  theme: {
    [key: string]: any;
  }
  [key: string]: any;
}

function fileExists(filePath: string) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

const defaultConfig : Config = {
  content: ["./**/*.html"],
  prefix: "hl",
  theme: {
    screens: {
      xxs: "375px",
      xs: "414px",
      sm: "576px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      xxl: "1480px",
    },
    layout: {
      "offset-sm": "2.5vi",
      "offset-md": "5vi",
      "offset-lg": "10vi",
      "offset-xl": "15vi",
      // "sm-offset": "2.5vw",
      // "md-offset": "5vw",
      // "lg-offset": "10vw",
      // "xl-offset": "15vw",
      "sm-content-width": 640,
      "md-content-width": 768,
      "lg-content-width": 1024,
      "xl-content-width": 1280,
      "xxl-content-width": 1440,
      "sm-design-width": 375,
      "md-design-width": 768,
      "lg-design-width": 1440,
      space: 8,
    },
    colors: {
      "base-color": "#fff",
      "main-color": "#116ec5",
      "accent-color": "#e4d558",
      "light-color": "#efefef",
      "dark-color": "#1c1c1c",
      "border-color-1": "#dedede",
      "border-color-2": "#303030",
      "border-color-3": "#fafafa",
      "text-color-1": "#101010",
      "text-color-2": "#606060",
      "text-color-3": "#f0f0f0",
    },
    fonts: {
      "font-set-1": '-apple-system, BlinkMacSystemFont, "Yu Gothic", sans-serif',
      "font-set-2": '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      "font-set-3": '"Times New Roman", "YuMincho", "Yu Mincho", serif',
      "base-line-height": 1.5,
      "base-feature-settings": '"pkna"',
      "base-letter-spacing": "0.05em",
    },
    effects: {
      "shadow-1": "0 0 8px rgba(0, 0, 0, 0.16)",
      "shadow-2": "2px 4px 24px -1px rgba(0, 0, 0, 0.1)",
      "shadow-3": "8px 16px 32px -4px rgba(0, 0, 0, 0.05)",
    },
    animations: {
      "scroll-behavior": "smooth",
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      duration: "0.6s",
    },
  },
};

const configPath = path.resolve(process.cwd(), "olex.config.cjs");
const configFile = fileExists(configPath) ? require(configPath) : {};
const config = deepMerge(defaultConfig, configFile);

export default config;
