export interface LanguageConfig {
  sourceFile: string;
  compileCmd?: { command: string; args: string[] };
  runCmd: { command: string; args: string[] };
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  CPP: {
    sourceFile: "solution.cpp",
    compileCmd: {
      command: "/usr/bin/g++",
      args: ["-O2", "-std=c++17", "-o", "solution", "solution.cpp"],
    },
    runCmd: {
      command: "./solution",
      args: [],
    },
  },

  PYTHON: {
    sourceFile: "solution.py",
    runCmd: {
      command: "/usr/bin/python3",
      args: ["solution.py"],
    },
  },

  JAVA: {
    sourceFile: "Main.java",
    compileCmd: {
      command: "/usr/bin/javac",
      args: ["Main.java"],
    },
    runCmd: {
      command: "/usr/bin/java",
      args: ["Main"],
    },
  },

  RUST: {
    sourceFile: "solution.rs",
    compileCmd: {
      command: "/usr/bin/rustc",
      args: ["-O", "-o", "solution", "solution.rs"],
    },
    runCmd: {
      command: "./solution",
      args: [],
    },
  },

  GO: {
    sourceFile: "solution.go",
    compileCmd: {
      command: "/usr/bin/go",
      args: ["build", "-o", "solution", "solution.go"],
    },
    runCmd: {
      command: "./solution",
      args: [],
    },
  },

  JAVASCRIPT: {
    sourceFile: "solution.js",
    runCmd: {
      command: "/usr/bin/node",
      args: ["solution.js"],
    },
  },

  TYPESCRIPT: {
    sourceFile: "solution.ts",
    compileCmd: {
      command: "/usr/bin/npx",
      args: ["tsc", "--outDir", ".", "--esModuleInterop", "solution.ts"],
    },
    runCmd: {
      command: "/usr/bin/node",
      args: ["solution.js"],
    },
  },
};
