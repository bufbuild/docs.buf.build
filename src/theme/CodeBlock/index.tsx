/**
 * This file is a swizzled and wrapped component, generated and adapted from the
 * docusaurus source code, copyright of Facebook, Inc.
 *
 * The adapted content is licensed under the MIT licence; and the licence can be
 * found at https://github.com/facebook/docusaurus/blob/master/LICENSE
 *
 * To learn more about component swizzling, see:
 * https://docusaurus.io/docs/using-themes#wrapping-theme-components
 *
 * For original sources see:
 * https://github.com/facebook/docusaurus/tree/v2.0.0-beta.3/packages/docusaurus-theme-classic/src/theme
 */
import { parseCodeBlockTitle, useThemeConfig } from "@docusaurus/theme-common";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "@site/node_modules/@docusaurus/theme-classic/src/theme/CodeBlock/styles.module.css";
import usePrismTheme from "@theme/hooks/usePrismTheme";
import clsx from "clsx";
import copy from "copy-text-to-clipboard";
import rangeParser from "parse-numeric-range";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import React, { useEffect, useRef, useState } from "react";

import bufStyles from "./styles.module.css";

import type { Props } from "@theme/CodeBlock";
// Parses the language identifier, resolves aliases, the "-nocopy" suffix
// and the special case "terminal"
function parseLanguage(inputLanguage: string | undefined): ParsedLanguage {
  if (inputLanguage === undefined) {
    return {
      prismLanguage: inputLanguage,
      language: inputLanguage,
      hideCopyButton: false,
      stripShellPrompt: false
    };
  }

  // First, determine if we have a "-nocopy" suffix
  // If we do, we will hide the Copy button
  let prismLanguage = inputLanguage;
  let language = inputLanguage;
  let hideCopyButton = false;
  if (inputLanguage.endsWith("-nocopy")) {
    language = prismLanguage = inputLanguage.substring(0, inputLanguage.length - "-nocopy".length);
    hideCopyButton = true;
  }

  // Second, resolve language identifier aliases
  // Special case "terminal" - we are going to strip the shell prompt for the Copy button
  let stripShellPrompt = false;
  switch (prismLanguage) {
    case "proto":
      // Allow "proto", like github-flavored markdown does
      prismLanguage = "protobuf";
      break;
    case "terminal":
      // "terminal" is a shell session, with a prompt $
      prismLanguage = "bash";
      stripShellPrompt = true;
      break;
    case "sh":
      // Allow "sh", like github-flavored markdown does
      prismLanguage = "bash";
      break;
  }

  return { language, prismLanguage, hideCopyButton, stripShellPrompt };
}
interface ParsedLanguage {
  language: string | undefined;
  prismLanguage: string | undefined;
  hideCopyButton: boolean;
  stripShellPrompt: boolean;
}

// Strips the prefix "$ " from every line of code.
const stripShellPromptForClipboard = (code: string): string => {
  const prefix = "$ ";
  return code
    .split("\n")
    .map((line) => {
      if (line.startsWith(prefix)) {
        return line.substring(prefix.length);
      }
      return line;
    })
    .join("\n");
};

// For the language identifier "terminal", we allow console output following a
// command to be separated by a line with three dashes "---".
const terminalOutputSeparator = "---";

const stripSeparatedTerminalOutput = (code: string): string => {
  const lines = code.split("\n");
  const index = lines.findIndex((l) => l.trim() === terminalOutputSeparator);
  return lines.slice(0, index).join("\n");
};

const highlightLinesRangeRegex = /{([\d,-]+)}/;
const getHighlightDirectiveRegex = (languages = ["js", "jsBlock", "jsx", "python", "html"]) => {
  // supported types of comments
  const comments = {
    js: {
      start: "\\/\\/",
      end: ""
    },
    jsBlock: {
      start: "\\/\\*",
      end: "\\*\\/"
    },
    jsx: {
      start: "\\{\\s*\\/\\*",
      end: "\\*\\/\\s*\\}"
    },
    python: {
      start: "#",
      end: ""
    },
    html: {
      start: "<!--",
      end: "-->"
    }
  };
  // supported directives
  const directives = ["highlight-next-line", "highlight-start", "highlight-end"].join("|");
  // to be more reliable, the opening and closing comment must match
  const commentPattern = languages
    .map((lang) => `(?:${comments[lang].start}\\s*(${directives})\\s*${comments[lang].end})`)
    .join("|");
  // white space is allowed, but otherwise it should be on it's own line
  return new RegExp(`^\\s*(?:${commentPattern})\\s*$`);
};
// select comment styles based on language
const highlightDirectiveRegex = (lang) => {
  switch (lang) {
    case "js":
    case "javascript":
    case "ts":
    case "typescript":
      return getHighlightDirectiveRegex(["js", "jsBlock"]);

    case "jsx":
    case "tsx":
      return getHighlightDirectiveRegex(["js", "jsBlock", "jsx"]);

    case "html":
      return getHighlightDirectiveRegex(["js", "jsBlock", "html"]);

    case "python":
    case "py":
      return getHighlightDirectiveRegex(["python"]);

    default:
      // all comment types
      return getHighlightDirectiveRegex();
  }
};

export default function CodeBlock({
  children,
  className: languageClassName,
  metastring,
  title
}: Props): JSX.Element {
  const { prism } = useThemeConfig();

  const [showCopied, setShowCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  // The Prism theme on SSR is always the default theme but the site theme
  // can be in a different mode. React hydration doesn't update DOM styles
  // that come from SSR. Hence force a re-render after mounting to apply the
  // current relevant styles. There will be a flash seen of the original
  // styles seen using this current approach but that's probably ok. Fixing
  // the flash will require changing the theming approach and is not worth it
  // at this point.
  useEffect(() => {
    setMounted(true);
  }, []);

  // TODO: the title is provided by MDX as props automatically
  // so we probably don't need to parse the metastring
  // (note: title="xyz" => title prop still has the quotes)
  const codeBlockTitle = parseCodeBlockTitle(metastring) || title;

  const button = useRef(null);
  let highlightLines: number[] = [];

  const prismTheme = usePrismTheme();

  // In case interleaved Markdown (e.g. when using CodeBlock as standalone component).
  const content = Array.isArray(children) ? children.join("") : children;

  if (metastring && highlightLinesRangeRegex.test(metastring)) {
    // Tested above
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const highlightLinesRange = metastring.match(highlightLinesRangeRegex)![1];
    highlightLines = rangeParser(highlightLinesRange).filter((n) => n > 0);
  }

  let language =
    languageClassName &&
    // Force Prism's language union type to `any` because it does not contain all available languages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (languageClassName.replace(/language-/, "") as Language as any);

  if (!language && prism.defaultLanguage) {
    language = prism.defaultLanguage;
  }

  const parsedLanguage = parseLanguage(language);

  // only declaration OR directive highlight can be used for a block
  let code = content.replace(/\n$/, "");
  if (highlightLines.length === 0 && parsedLanguage.prismLanguage !== undefined) {
    let range = "";
    const directiveRegex = highlightDirectiveRegex(parsedLanguage.prismLanguage);
    // go through line by line
    const lines = content.replace(/\n$/, "").split("\n");
    let blockStart;
    // loop through lines
    for (let index = 0; index < lines.length; ) {
      const line = lines[index];
      // adjust for 0-index
      const lineNumber = index + 1;
      const match = line.match(directiveRegex);
      if (match !== null) {
        const directive = match
          .slice(1)
          .reduce((final: string | undefined, item) => final || item, undefined);
        switch (directive) {
          case "highlight-next-line":
            range += `${lineNumber},`;
            break;

          case "highlight-start":
            blockStart = lineNumber;
            break;

          case "highlight-end":
            range += `${blockStart}-${lineNumber - 1},`;
            break;

          default:
            break;
        }
        lines.splice(index, 1);
      } else {
        // lines without directives are unchanged
        index += 1;
      }
    }
    highlightLines = rangeParser(range);
    code = lines.join("\n");
  }

  // Find the line index of the terminal output separator
  let terminalSeparatorIndex = -1;
  if (parsedLanguage.language === "terminal") {
    const lines = code.split("\n");
    terminalSeparatorIndex = lines.findIndex((l) => l.trim() === terminalOutputSeparator);
  }

  const handleCopyCode = () => {
    let textToCopy = code;
    if (parsedLanguage.stripShellPrompt) {
      textToCopy = stripShellPromptForClipboard(textToCopy);
    }
    if (terminalSeparatorIndex !== -1) {
      textToCopy = stripSeparatedTerminalOutput(textToCopy);
    }
    copy(textToCopy);
    setShowCopied(true);

    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <Highlight
      {...defaultProps}
      key={String(mounted)}
      theme={prismTheme}
      code={code}
      language={parsedLanguage.prismLanguage as Language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        // If the terminal output separator is used, we render two blocks - we split them here
        const mainTokens =
          terminalSeparatorIndex === -1 ? tokens : tokens.slice(0, terminalSeparatorIndex + 1);
        const terminalOutputTokens =
          terminalSeparatorIndex === -1 ? [] : tokens.slice(terminalSeparatorIndex + 1);

        return (
          <div className={styles.codeBlockContainer}>
            {codeBlockTitle && (
              <div style={style} className={styles.codeBlockTitle}>
                {codeBlockTitle}
              </div>
            )}
            <div className={clsx(styles.codeBlockContent, parsedLanguage.prismLanguage)}>
              <pre
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                tabIndex={0}
                className={clsx(className, styles.codeBlock, "thin-scrollbar", {
                  [styles.codeBlockWithTitle]: codeBlockTitle
                })}
                style={style}
              >
                <code className={styles.codeBlockLines}>
                  {mainTokens.map((line, i) => {
                    // If the terminal separator is used, we only render the lines up to the separator here
                    if (terminalSeparatorIndex > 0 && i >= terminalSeparatorIndex) {
                      return null;
                    }

                    if (line.length === 1 && line[0].content === "") {
                      line[0].content = "\n"; // eslint-disable-line no-param-reassign
                    }

                    const lineProps = getLineProps({ line, key: i });

                    if (highlightLines.includes(i + 1)) {
                      lineProps.className += " docusaurus-highlight-code-line";
                    }

                    return (
                      <span key={i} {...lineProps}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </span>
                    );
                  })}
                </code>

                {/* If the terminal separator is used, we render the content following the separator separately,
                  allowing us to style it differently */}
                {terminalSeparatorIndex === -1 ? null : (
                  <>
                    <div className={bufStyles.bufTerminalOutputSeparator}>
                      <span>Output</span>
                    </div>
                    <code className={clsx(styles.codeBlockLines, bufStyles.bufTerminalOutput)}>
                      {terminalOutputTokens.map((line, i) => {
                        // adjust line index with offset of separator, plus 1 for the separator line which we don't render
                        i += terminalSeparatorIndex + 1;

                        if (line.length === 1 && line[0].content === "") {
                          line[0].content = "\n"; // eslint-disable-line no-param-reassign
                        }

                        const lineProps = getLineProps({ line, key: i });
                        // Do not apply syntax highlighting to console output
                        delete lineProps.style;

                        if (highlightLines.includes(i + 1)) {
                          lineProps.className += " docusaurus-highlight-code-line";
                        }

                        return (
                          <span key={i} {...lineProps}>
                            {line.map((token, key) => {
                              const tokenProps = getTokenProps({ token, key });
                              // Do not apply syntax highlighting to console output
                              delete tokenProps.style;
                              return <span key={key} {...tokenProps} />;
                            })}
                          </span>
                        );
                      })}
                    </code>
                  </>
                )}
              </pre>

              {parsedLanguage.hideCopyButton ? null : (
                <button
                  ref={button}
                  type="button"
                  aria-label={translate({
                    id: "theme.CodeBlock.copyButtonAriaLabel",
                    message: "Copy code to clipboard",
                    description: "The ARIA label for copy code blocks button"
                  })}
                  className={clsx(styles.copyButton, "clean-btn")}
                  onClick={handleCopyCode}
                >
                  {showCopied ? (
                    <Translate
                      id="theme.CodeBlock.copied"
                      description="The copied button label on code blocks"
                    >
                      Copied
                    </Translate>
                  ) : (
                    <Translate
                      id="theme.CodeBlock.copy"
                      description="The copy button label on code blocks"
                    >
                      Copy
                    </Translate>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      }}
    </Highlight>
  );
}
