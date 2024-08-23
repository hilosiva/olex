import { prefix, breakpoints } from "./theme";
import { getFluid } from "./utils/transform";
import { getCacheAttributes } from "./parser";
import postcss, { AtRule, Rule, type ChildNode, type RuleProps } from "postcss";
import type { ValueOptions } from "postcss/lib/container";
import type Declaration from "postcss/lib/declaration";

// 型定義
type CacheAttributes = Map<string, string[]>;
type ModifierRule = [Rule, boolean, boolean];

interface Options {
  isMediaQuery?: boolean;
  isWhere?: boolean;
  isRootNesting?: boolean;
  isUseOnly?: boolean;
}

interface StyleOptions {
  isMediaQuery: boolean;
  isWhere: boolean;
  isRootNesting: boolean;
  isUseOnly: boolean;
}

interface ModifireRuleResult {
  isEnabled: boolean;
  rules: [Rule, boolean, boolean];
  directRules: Rule[] | null;
}

export class Style {
  private selector: string;
  private properties: Map<string, string>;
  private options: StyleOptions;
  private rule: Rule | null;
  private attrName: string | null;
  private attrValue: string | null;
  private modifier: ModifierRule[];
  private mediaRules: AtRule[];
  private useAttributes: CacheAttributes | null;
  private isDirectRule: boolean;
  private directValues: Set<string>;
  private directRules: Rule[];
  private initPromise: Promise<boolean> | null;
  private patterns: {
    attr: RegExp;
    attrNameValue: RegExp;
    classOrId: RegExp;
    customProperty: RegExp;
    bracketValue: RegExp;
    bracketBlank: RegExp;
    fluid: RegExp;
  };
  private isEnabled: boolean;

  constructor(selector: string, properties: [string, string][], options: Options = {}) {
    // デフォルトオプション
    const defaultOptions: StyleOptions = {
      isMediaQuery: false,
      isWhere: true,
      isRootNesting: true,
      isUseOnly: true,
    };

    // コンストラクタの初期化
    this.selector = selector;
    this.properties = new Map(properties);
    this.options = { ...defaultOptions, ...options };
    this.rule = null;
    this.attrName = null;
    this.attrValue = null;
    this.modifier = [];
    this.mediaRules = [];
    this.useAttributes = null;

    this.isDirectRule = false;
    this.directValues = new Set();
    this.directRules = [];
    this.initPromise = this._init();

    this.patterns = {
      attr: /([a-zA-Z-~*^|$]*)\s*=\s*"([^"]+)"/g,
      attrNameValue: /\[\s*([^\s\[\]=~\*\|\^\$]+)(?:[~\*\|\^\$\-:]*\s*=\s*["']([^"']*)["'])?\s*\]/,
      classOrId: /([.#])([^.#]+)/g,
      customProperty: /(--)([^:;]*)/g,
      bracketValue: /\[(.*?)\]/,
      bracketBlank: /\[\]/,
      fluid: /fluid-\[(\d+),(\d+)\]/g,
    };

    this.isEnabled = false;
  }

  // 初期化処理
  private async _init(): Promise<boolean> {
    this.useAttributes = await getCacheAttributes();

    // HTMLで使われているかチェック
    this.isEnabled = this._checkEnabled(this.selector);

    this.rule = postcss.rule({ selector: this.selector });
    this._setProperties(this.rule);

    if (this.directValues.size) {
      this._setDirectStyle(this.selector, this.properties, this.directRules);
    }

    return true;
  }

  // セレクタが有効かどうかをチェック
  private _checkEnabled(selector: string): boolean {
    if (!this.options.isUseOnly) return true;

    const match = this.patterns.attrNameValue.exec(selector);
    const attrName = match?.[1] || null;
    const attrValue = match?.[2] || null;

    // 属性が使われているか
    const isAttrNameEnabled = this.useAttributes?.has(attrName || "");

    if (!isAttrNameEnabled || !attrValue) {
      // 属性名がHTMLで使われていない、または、属性名のみのセレクター
      return isAttrNameEnabled || false;
    }

    const useValues = this.useAttributes?.get(attrName || "");

    if (useValues) {
      // 値の一覧をSetで管理
      const htmlValueSet = attrName === "style" ? new Set(useValues) : new Set(useValues.flatMap((val) => val.split(" ")));

      // ダイレクトバリュー
      if (attrValue.match(this.patterns.bracketValue)) {
        this.isDirectRule = true;
        this.directValues.clear();

        htmlValueSet.forEach((value) => {
          const match = value.match(this.patterns.bracketValue);
          if (match) {
            const directKey = attrValue.replace("[]", `[${match[1]}]`);
            const fluidKey = attrValue.replace("[]", `fluid-[${match[1]}]`);
            if (htmlValueSet.has(directKey) || htmlValueSet.has(fluidKey)) {
              this.directValues.add(value);
            }
          }
        });

        if (this.directValues.size > 0) {
          return true;
        }
      }

      // 属性値が使われているか
      return htmlValueSet.has(attrValue);
    }

    return false;
  }

  // プロパティをルールに設定
  private _setProperties(rule: Rule): void {
    this.properties.forEach((value, prop) => {
      rule.append({ prop, value });
    });
  }

  // 直接スタイルを設定
  private _setDirectStyle(selector: string, properties: Style["properties"] | ChildNode[], arr: Rule[]): void {
    this.directValues.forEach((directValue) => {
      // [ ]の中身を取得
      let inputValue = this._getBracketValue(directValue);

      if (!inputValue) return;

      // セレクター名を置き換え
      const directSelector = this._transformDirectValue(selector, directValue);

      if (!directSelector) return;

      if (directValue.includes("fluid-[") && directValue.includes("]")) {
        const [min, max, minViewPort, maxViewPort] = inputValue.split(",");
        if (min && max) {
          inputValue = getFluid(Number(min), Number(max), Number(minViewPort) || undefined, Number(maxViewPort) || undefined);
        }
      }

      // ルール作成
      const directRule = postcss.rule({ selector: directSelector });

      properties.forEach((value: string | ChildNode | Declaration, prop: string | number | undefined) => {
        // postcssの形式だったら
        if (typeof value === "object" && "type" in value && value.type === "decl") {
          prop = String(value.prop);
          value = String(value.value);
        }

        directRule.append({ prop: String(prop), value: String(value).includes("true") ? String(inputValue) : String(value) });
      });

      arr.push(directRule);
    });
  }

  // メディアクエリルールを設定
  private _setMedias(): void {
    for (const [key] of breakpoints) {
      // メディアクエリの作成
      const mediaAtRule = postcss.atRule({ name: "media", params: `(--${prefix}${key})` });

      // ベースルールの作成
      const mediaBaseRule: Rule | false = this.options.isRootNesting ? postcss.rule({ selector: this.selector }) : false;

      // modifierルールのカウント用
      const modifierRules = new Set<string>();

      this.modifier.forEach(([rule, isMediaQuery, isDirectRule]) => {
        if (!isMediaQuery) return;

        const clone = rule.clone();

        // セレクタにメディアクエリの接頭辞を追加
        clone.selector = this._transformMediaSelector(clone.selector, key);

        // HTMLに使われているかをチェック
        const isEnabled = this._checkEnabled(clone.selector);

        // ダイレクトバリューのチェック
        const directRules: Rule[] = [];
        if (isDirectRule) {
          clone.selector = this._transformModifierSelector(clone.selector);

          this._setDirectStyle(clone.selector, clone.nodes, directRules);
        }

        // 使われている場合
        if (isEnabled) {
          // モディファイアがあるかをカウントする用
          if (!isDirectRule) modifierRules.add(clone.selector);

          if (directRules.length) {
            directRules.forEach((rule) => {
              modifierRules.add(rule.selector);
            });
          }

          // ベースルールまたはメディアクエリにセット
          mediaBaseRule ? mediaBaseRule.append(!isDirectRule ? clone : [...directRules]) : mediaAtRule.append(!isDirectRule ? clone : [...directRules]);
        }
      });

      if (modifierRules.size > 0 && mediaAtRule) {
        if (mediaBaseRule) mediaAtRule.append(mediaBaseRule);
        this.mediaRules.push(mediaAtRule);
      }
    }
  }

  // 括弧内の値を取得
  private _getBracketValue(directValue: string): string | false {
    const match = directValue.match(this.patterns.bracketValue);
    return match ? match[1] : false;
  }

  // 直接スタイルのセレクタを変換
  private _transformDirectValue(str: string, directValue: string): string | null {
    const value = this._getBracketValue(directValue);
    return value ? str.replace("[]", directValue.includes("fluid-[") ? `fluid-[${value}]` : `[${value}]`) : null;
  }

  // メディアクエリのセレクタを変換
  private _transformMediaSelector(str: string, prefix: string): string {
    str = str.replace(this.patterns.attr, (_, attrName, attrValue) => {
      if (attrName.includes("style")) {
        return `${attrName}="${attrValue.replace(this.patterns.customProperty, (_: string, prop: string, value: string) => `${prop}${prefix}-${value}`)}"`;
      }
      return `${attrName}="${prefix}:${attrValue}"`;
    });

    // クラス名やIDに対してプレフィックスを追加
    str = str.replace(this.patterns.classOrId, (_, symbol, name) => `${symbol}${prefix}:${name}`);

    return str;
  }

  // モディファイアのセレクタを変換
  private _transformModifierSelector(str: string): string {
    return this.options.isWhere ? str.replace(str, `&:where(${str})`) : str.replace(str, `&${str}`);
  }

  // モディファイアを設定
  public async setModifier(modifier: Style) {
    await this.initPromise;

    const modifierRules = await modifier.getModifierRule();

    if (!modifierRules) return false;

    const { isEnabled, rules, directRules } = modifierRules;
    if (rules?.length > 0) {
      const [rule, isMediaQuery, isDirectRule] = rules;

      if (!isDirectRule) {
        // 通常のルールの場合
        rule.selector = this._transformModifierSelector(rule.selector);
        if (isEnabled) this.append(rule);
      } else {
        // ダイレクトルールの場合
        directRules?.forEach((directRule) => {
          directRule.selector = this._transformModifierSelector(directRule.selector);

          this.append(directRule);
        });
      }

      this.modifier.push(rules);
    }
  }

  // 出力
  async getModifierRule(): Promise<false | ModifireRuleResult> {
    await this.initPromise;

    if (!this.rule) return false;

    return {
      isEnabled: this.isEnabled,
      rules: [this.rule, this.options.isMediaQuery, this.isDirectRule],
      directRules: this.directRules || null,
    };
  }

  async output(): Promise<[Rule, ...AtRule[]] | false | Rule | undefined> {
    await this.initPromise;

    if (!this.isEnabled || !this.rule) return false;
    this._setMedias();

    return this.options.isRootNesting ? [this.rule, ...this.mediaRules] : this.rule.append(...this.mediaRules);
  }

  // ルールを追加
  public append(rule: Rule): void {
    this.rule?.append(rule);
  }
}
