/** @type {import("prettier").Config} */
const config = {
  // Format options
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',
  proseWrap: 'always',
  quoteProps: 'as-needed',
  embeddedLanguageFormatting: 'auto',

  // Overrides for specific file types
  overrides: [
    {
      files: ['*.json', '*.json5', '*.yaml', '*.yml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
        trailingComma: 'none',
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 150,
        proseWrap: 'preserve',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {},
    },
  ],
};

export default config;
