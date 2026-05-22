const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");

module.exports = [
	{
		ignores: ["dist/**", "node_modules/**"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: "script",
			},
		},
		plugins: {
			"@typescript-eslint": typescriptEslintPlugin,
		},
		rules: {
			"no-var": "error",
			"prefer-const": "error",
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "error",
		},
	},
];
