const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

// ESM-only packages that must be transformed by SWC instead of being left as-is.
// Includes unscoped react-aria/react-stately because @heroui/react nests them in its
// own node_modules/ with those names (without the @).
const ESM_PACKAGES = [
  "@heroui",
  "@react-aria",
  "@react-stately",
  "@internationalized",
  "react-icons",
  "react-aria", // unscoped meta-package, nested in @heroui/react/node_modules/
  "react-stately", // same
  "react-aria-components",
  "clsx", // ESM in @heroui/react's nested pnpm store
  "\\.pnpm", // pnpm virtual-store sub-dir — let inner packages be checked
];

module.exports = async () => {
  const config = await createJestConfig({
    testEnvironment: "jsdom",
    // Pin all worker processes to UTC via globalSetup so that Date.getHours()
    // matches UTC timestamps in test fixtures across all environments.
    globalSetup: "<rootDir>/jest.globalSetup.ts",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
      // @heroui/react exports map has only "import" condition; bypass resolver entirely
      "^@heroui/react$": "<rootDir>/node_modules/@heroui/react/dist/index.js",
      // HeroUI sub-path exports (e.g. @heroui/react/form) — same reason
      "^@heroui/react/(.+)$":
        "<rootDir>/node_modules/@heroui/react/dist/components/$1/index.js",
      // tsconfig @/* alias
      "^@/(.*)$": "<rootDir>/$1",
    },
  })();

  // next/jest prepends its own transformIgnorePatterns which only allowlists geist + next/*
  // and catches all other node_modules — overwrite entirely so ESM_PACKAGES are transformed.
  config.transformIgnorePatterns = [
    `/node_modules/(?!(${ESM_PACKAGES.join("|")}))`,
    "^.+\\.module\\.(css|sass|scss)$",
  ];

  // Prevent Jest from picking up Playwright E2E specs — those run in their own job.
  config.testPathIgnorePatterns = [
    ...(Array.isArray(config.testPathIgnorePatterns) ? config.testPathIgnorePatterns : []),
    "<rootDir>/e2e/",
  ];

  return config;
};
