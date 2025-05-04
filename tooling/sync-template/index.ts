#!/usr/bin/env bun
/**
 * Repository Synchronization Tool
 *
 * This tool automates the process of syncing files between template and project repositories
 * as described in the README-sassy-template.md.
 *
 * Usage:
 *   pnpm --filter @sassy/repo-sync start
 *   # or if added to root package.json scripts
 *   pnpm sync-repos
 */
import { exec, execSync } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";

// Get the script directory and find the repository root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = path.join(__dirname, "../..");

const program = new Command();

program
  .name("repo-sync")
  .description("Synchronize files between template and project repositories")
  .version("0.1.0");

program.parse();

// Main function
async function main() {
  // Store original directory to return to it later
  const originalDir = process.cwd();

  try {
    console.log(chalk.blue.bold("Repository Synchronization Tool"));
    console.log(
      chalk.dim(
        "Automates syncing between template and project repositories\n",
      ),
    );

    // Ensure we're running from the repository root
    process.chdir(repoRoot);
    console.log(chalk.dim(`Working directory: ${process.cwd()}`));

    // Step 1: Determine if we're in a template or project repository
    const { repoType } = await inquirer.prompt<{
      repoType: "template" | "project";
    }>([
      {
        type: "list",
        name: "repoType",
        message: "What type of repository are you currently in?",
        choices: [
          {
            name: "Template repository (syncing FROM project TO template)",
            value: "template",
          },
          {
            name: "Project repository (syncing FROM template TO project)",
            value: "project",
          },
        ],
      },
    ]);

    // Step 2: Get remote name based on repo type
    let remoteNamePrompt;
    if (repoType === "template") {
      remoteNamePrompt = {
        type: "input",
        name: "remoteName",
        message: 'Enter the name of the project remote (e.g., "founderlog"):',
        validate: (input: string) =>
          input.trim() !== "" || "Remote name cannot be empty",
      };
    } else {
      remoteNamePrompt = {
        type: "input",
        name: "remoteName",
        message:
          'Enter the name of the template remote (typically "template"):',
        default: "template",
        validate: (input: string) =>
          input.trim() !== "" || "Remote name cannot be empty",
      };
    }

    const { remoteName } = await inquirer.prompt<{ remoteName: string }>([
      remoteNamePrompt,
    ]);

    // Step 3: Get paths to sync
    const { pathsToSync } = await inquirer.prompt<{ pathsToSync: string }>([
      {
        type: "input",
        name: "pathsToSync",
        message:
          "Enter the paths to sync (space-separated, use quotes for paths with spaces):",
        validate: (input: string) =>
          input.trim() !== "" || "At least one path is required",
      },
    ]);

    // Parse the paths (handling quoted paths)
    const paths = parsePaths(pathsToSync);

    if (paths.length === 0) {
      throw new Error("No valid paths provided");
    }

    console.log(chalk.green(`\nSyncing ${paths.length} paths:`));
    paths.forEach((path) => console.log(chalk.dim(`- ${path}`)));

    // Step 4: Get commit message
    const { commitMessage } = await inquirer.prompt<{ commitMessage: string }>([
      {
        type: "input",
        name: "commitMessage",
        message: "Enter a commit message:",
        default: `Sync ${paths.length} paths from ${repoType === "template" ? "project" : "template"}`,
        validate: (input: string) =>
          input.trim() !== "" || "Commit message cannot be empty",
      },
    ]);

    // Step 5: Confirm before proceeding
    const { confirmSync } = await inquirer.prompt<{ confirmSync: boolean }>([
      {
        type: "confirm",
        name: "confirmSync",
        message: "Ready to proceed with the sync?",
        default: true,
      },
    ]);

    if (!confirmSync) {
      console.log(chalk.yellow("Sync operation canceled."));
      // Return to the original directory before exiting
      process.chdir(originalDir);
      process.exit(0);
    }

    // Step 6: Create branch and fetch remote
    const branchName =
      repoType === "template" ? "update-from-project" : "update-from-template";

    console.log(chalk.blue(`\nStep 1: Checking out main branch...`));
    execSync("git checkout main", { stdio: "inherit" });

    console.log(chalk.blue(`\nStep 2: Creating branch ${branchName}...`));
    execSync(`git checkout -b ${branchName}`, { stdio: "inherit" });

    console.log(chalk.blue(`\nStep 3: Fetching from ${remoteName}...`));
    execSync(`git fetch ${remoteName}`, { stdio: "inherit" });

    console.log("fetching completed");

    // Step 7: Checkout files from remote
    console.log(
      chalk.blue(`\nStep 4: Checking out specified files from remote...`),
    );

    const remoteRef = `${remoteName}/main`;

    for (const path of paths) {
      try {
        console.log(chalk.dim(`Checking out: ${path}`));

        // Quote the path to handle spaces properly in git commands
        // This ensures paths like "z - notes.md" are handled as a single argument
        const quotedPath = `"${path}"`;

        console.log(
          chalk.dim(`Command: git checkout ${remoteRef} -- ${quotedPath}`),
        );
        execSync(`git checkout ${remoteRef} -- ${quotedPath}`, {
          stdio: "inherit",
        });
      } catch (error) {
        const checkoutError = error as Error;
        console.error(
          chalk.red(`Error checking out ${path}: ${checkoutError.message}`),
        );

        throw new Error(`Sync aborted by user after error on ${path}`);
      }
    }

    // Step 8: Show diff and confirm
    console.log(chalk.blue(`\nStep 5: Showing changes (git diff --staged)...`));
    execSync("git diff --staged", { stdio: "inherit" });

    const { confirmChanges } = await inquirer.prompt<{
      confirmChanges: boolean;
    }>([
      {
        type: "confirm",
        name: "confirmChanges",
        message: "Proceed with these changes?",
        default: true,
      },
    ]);

    if (!confirmChanges) {
      console.log(chalk.yellow("Changes rejected. Aborting sync."));
      console.log(
        chalk.dim(
          "To clean up, you can run: git checkout main && git branch -D " +
            branchName,
        ),
      );
      // Return to the original directory before exiting
      process.chdir(originalDir);
      process.exit(0);
    }

    // Step 9: Commit changes
    console.log(chalk.blue(`\nStep 6: Committing changes...`));
    execSync("git add .", { stdio: "inherit" });
    execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });

    // Step 10: Merge to main branch (with warning)
    console.log(chalk.yellow.bold(`\n⚠️  MANUAL STEP REQUIRED ⚠️`));
    console.log(
      chalk.yellow(
        `The changes have been committed to the "${branchName}" branch.`,
      ),
    );
    console.log(
      chalk.yellow(
        `To complete the sync, you need to manually merge this branch to main:`,
      ),
    );
    console.log(chalk.dim(`\ngit checkout main`));
    console.log(chalk.dim(`git merge ${branchName}`));
    console.log(chalk.dim(`# Resolve any conflicts if needed`));
    console.log(
      chalk.dim(
        `git branch -d ${branchName} # Optional: delete the branch after merging`,
      ),
    );

    console.log(
      chalk.green.bold("\n✅ Sync preparation completed successfully!"),
    );

    // Return to the original directory at the end of the script
    process.chdir(originalDir);
  } catch (error) {
    // Make sure we return to the original directory even if there's an error
    try {
      process.chdir(originalDir);
    } catch (cdError) {
      // Ignore errors from changing directory back
    }

    console.error(
      chalk.red(
        `\n❌ Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
    process.exit(1);
  }
}

/**
 * Parse space-separated paths, respecting quoted strings
 */
function parsePaths(input: string): string[] {
  const paths: string[] = [];
  let currentPath = "";
  let inQuotes = false;

  // Simple parsing for space-separated values with quote support
  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === " " && !inQuotes) {
      if (currentPath) {
        paths.push(currentPath);
        currentPath = "";
      }
      continue;
    }

    currentPath += char;
  }

  if (currentPath) {
    paths.push(currentPath);
  }

  // Process paths: trim and handle special cases
  return paths
    .map((p) => {
      p = p.trim();
      // Replace './' with '.' to handle current directory properly
      if (p === "./") return ".";
      // Remove leading './' prefix from paths for git checkout compatibility
      if (p.startsWith("./")) return p.substring(2);
      // Remove trailing slash from directory paths to avoid git checkout issues
      return p.endsWith("/") ? p.slice(0, -1) : p;
    })
    .filter((p) => p);
}

main().catch((err) => {
  console.error(chalk.red(`Unhandled error: ${err.message}`));
  process.exit(1);
});
