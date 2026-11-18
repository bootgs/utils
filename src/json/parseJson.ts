// SPDX-License-Identifier: Apache-2.0
import { requireNonEmptyString } from "../lang";

/**
 * Parses a JSON string, including handling and attempting to fix common formatting errors
 * that might cause standard JSON.parse to fail (e.g., unquoted keys, single quotes).
 *
 * This function first attempts standard JSON.parse. If that fails, it applies common
 * "corrections" like converting single quotes to double quotes and quoting unquoted keys,
 * then tries parsing again.
 *
 * @example
 * ```javascript
 * const jsonString1 = `{key: 'value', "list": [1, 2, 3]}`;
 * const result1 = parseJson(jsonString1);
 * console.log(result1); // { key: 'value', list: [ 1, 2, 3 ] }
 *
 * const jsonString2 = `{ "foo": "bar", baz: true, 'qux': null }`;
 * const result2 = parseJson(jsonString2);
 * console.log(result2); // { foo: 'bar', baz: true, qux: null }
 *
 * const jsonString3 = `not valid json`;
 * const result3 = parseJson(jsonString3);
 * console.log(result3); // null
 * ```
 *
 * @param   {string} value - The string containing the JSON to parse.
 * @returns {object} The parsed object if successful, or `null` if the JSON could not be parsed even after attempted corrections.
 * @throws  {@link EmptyStringException}
 * @see     {@link stringifyJson}
 * @see     [parseJson on the documentation site](https://bootgs.github.io/utils/parsejson.html)
 * @since   1.0.0
 * @version 1.0.0
 * @deprecated This function is deprecated and will be removed in future versions.
 */
export function parseJson(value: string): object {
  const result = requireNonEmptyString(value);

  try {
    return JSON.parse(result);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err: unknown) {
    /**
     * Matches a complete double-quoted JSON string literal, escapes included.
     * The tokenizer below turns every quoted string, single-quoted ones too,
     * into this form.
     */
    const quotedString = /^"(?:[^"\\]|\\.)*"$/;

    /**
     * Checks if a token is a valid key format (either quoted or unquoted alphanumeric).
     *
     * @param   {string} token The token string to check.
     * @returns {boolean} `true` if the token is a valid key format; otherwise, `false`.
     */
    const isValidKey = (token: string): boolean =>
      quotedString.test(token) || /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token);

    /**
     * Returns a key token as a JSON string literal.
     *
     * @param   {string} token A token accepted by `isValidKey`.
     * @returns {string} The token itself when it is already quoted; otherwise the token in double quotes.
     */
    const toKey = (token: string): string => (quotedString.test(token) ? token : `"${token}"`);

    /**
     * Checks if a token is a valid value format (boolean, null, number, or quoted string).
     *
     * @param   {string} token The token string to check.
     * @returns {boolean} `true` if the token is a valid value format; otherwise, `false`.
     */
    const isValidValue = (token: string): boolean =>
      token === "true" ||
      token === "false" ||
      token === "null" ||
      /^-?\d+(?:\.\d+|)(?:[eE][+-]?\d+|)$/.test(token) ||
      quotedString.test(token);

    const tokens = [];

    let currentToken = "";

    let isString = false;

    let isEscaped = false;

    let quoteType = null;

    for (let i = 0; i < result.length; i++) {
      const char = result[i];

      if (isEscaped) {
        // `\'` is how a single-quoted string carries a quote; JSON has no such
        // escape, and inside double quotes the quote needs none.
        if (char === "'" && isString) {
          currentToken = currentToken.slice(0, -1);
        }

        currentToken += char;
        isEscaped = false;

        continue;
      }

      if (char === "\\") {
        currentToken += char;
        isEscaped = true;

        continue;
      }

      if (char === '"' || char === "'") {
        if (!isString) {
          isString = true;
          quoteType = char;
          currentToken += '"';
        } else if (char === quoteType) {
          isString = false;
          currentToken += '"';
          tokens.push(currentToken);
          currentToken = "";
        } else {
          // A double quote inside a single-quoted string has to be escaped
          // once the string is re-quoted with double quotes.
          currentToken += char === '"' ? '\\"' : char;
        }
      } else if (isString) {
        currentToken += char;
      } else if (char.match(/\s/)) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = "";
        }
      } else if ([":", ",", "{", "}", "[", "]"].includes(char)) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = "";
        }

        tokens.push(char);
      } else {
        currentToken += char;
      }
    }

    if (currentToken) {
      tokens.push(currentToken);
    }

    const correctedTokens = [];

    let expectingValue = false;

    let expectingKey = false;

    for (let i = 0; i < tokens.length; i++) {
      const lexeme = tokens[i];

      if (lexeme === "{" || lexeme === "[") {
        correctedTokens.push(lexeme);
        expectingKey = lexeme === "{";
        expectingValue = lexeme === "[";
      } else if (lexeme === "}" || lexeme === "]") {
        correctedTokens.push(lexeme);
        expectingValue = false;
        expectingKey = false;
      } else if (lexeme === ":") {
        correctedTokens.push(lexeme);
        expectingValue = true;
        expectingKey = false;
      } else if (lexeme === ",") {
        correctedTokens.push(lexeme);
        expectingKey = correctedTokens[correctedTokens.length - 2] === "}";
        expectingValue = !expectingKey;
      } else if (expectingKey && isValidKey(lexeme)) {
        correctedTokens.push(toKey(lexeme));
        expectingKey = false;
      } else if (expectingValue && isValidValue(lexeme)) {
        correctedTokens.push(lexeme);
        expectingValue = false;
      } else if (isValidKey(lexeme)) {
        correctedTokens.push(toKey(lexeme));
      } else if (isValidValue(lexeme)) {
        correctedTokens.push(lexeme);
      } else {
        throw new Error(`Invalid token: ${lexeme}`);
      }
    }

    const correctedJson = correctedTokens.join("");

    return JSON.parse(correctedJson);
  }
}
