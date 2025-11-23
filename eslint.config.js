import next from "eslint-config-next"

export default [
  ...next,
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "drizzle/mysql/meta",
    ],
    rules: {
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
]
