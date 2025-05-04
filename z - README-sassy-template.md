# Template Synchronization

This section provides instructions for maintaining synchronization between this template repository and projects derived from it.

## Simplified Pull-Only Approach (Recommended)

After experimenting with bidirectional push/pull approaches, a simpler "pull-only" approach is **strongly recommended** for solo developers:

1. Set up remotes in both repositories (as described in setup section below)
2. Never push directly between repositories
3. Always pull specific files/folders you want to sync from the source repository

This approach is:
- **Less error-prone**: Avoids merge conflicts caused by direct pushes
- **More selective**: You can choose exactly which files to sync
- **More explicit**: You always know what's being updated
- **Safer**: Minimizes risk of accidentally overwriting important changes

### Simplified Workflow for Syncing

#### To update the template with changes from your project:

```bash
# In your TEMPLATE repository
git checkout main
git checkout -b update-from-project

# IMPORTANT: Fetch latest changes from the project repo
git fetch founderlog

# Pull SPECIFIC files/folders from project
# NOTE: This COMPLETELY REPLACES your local files with versions from the remote!
# It does NOT merge changes or show conflict resolution UI at this point
git checkout founderlog/main -- packages/stripe/
git checkout founderlog/main -- packages/api/src/router/custom/

# Review changes (important!)
git diff --staged  # Shows differences between staged changes and HEAD

# Commit the changes
git add .
git commit -m "Sync stripe package and custom routers from project"

# Merge to main
git checkout main
# HERE is where merge conflicts may appear in your IDE if any
# This is when your IDE's merge tool would open if conflicts exist
git merge update-from-project  

#deleting the temp branch for udpates                               
git branch -d update-from-project
```

#### To update your project with changes from the template:

```bash
# In your PROJECT repository
git checkout main
git checkout -b update-from-template

# IMPORTANT: Fetch latest changes from the template repo
git fetch template

# Pull SPECIFIC files/folders from template
# NOTE: This COMPLETELY REPLACES your local files with versions from the remote!
# It does NOT merge changes or show conflict resolution UI at this point
git checkout template/main -- packages/ui/
git checkout template/main -- packages/validators/

# Review changes (important!)
git diff --staged  # Shows differences between staged changes and HEAD

# Commit the changes
git add .
git commit -m "Sync UI and validators from template"

# Merge to main
git checkout main
git merge update-from-template  # HERE is where merge conflicts may appear in your IDE if any
                                # This is when your IDE's merge tool would open if conflicts exist
git branch -d update-from-template
```

### How Conflicts Are Handled

When using `git checkout remote/branch -- path`:

1. **File replacement, not merging**: This command **completely replaces** your local files with the version from the remote. It doesn't attempt to merge changes.

2. **No conflict resolution during checkout**: Unlike `git merge` or `git pull`, the checkout command will simply overwrite your local files without showing merge conflicts.

3. **Conflicts appear during branch merge**: Conflicts will only appear later when you run `git merge update-from-template` to merge your branch into main. At this point, you'll see the typical merge conflict resolution UI in your IDE.

4. **Selective resolution approach**: If you want to be more careful about merging specific files, consider this alternative:

```bash
# Instead of direct checkout that overwrites files:
# 1. Create a temporary branch from the remote
git fetch template
git checkout -b temp-remote template/main

# 2. Copy specific files to your working branch
git checkout update-from-template
# Now use your IDE to copy/merge specific parts from temp-remote
# This gives you full control over the merge

# 3. Continue with commit and merge as normal
git add .
git commit -m "Carefully merged UI components from template"
```

## Visual Example of the Process

```
Your working branch:       Remote branch:
┌─────────────────┐       ┌─────────────────┐
│ File A (v1)     │       │ File A (v2)     │
│ File B (v1)     │       │ File B (v2)     │
└─────────────────┘       └─────────────────┘
        │                         │
        │                         │
        ▼                         │
┌───────────────────────────────────────────┐
│ git checkout remote/branch -- File A      │
│                                           │
│ 1. File A (v1) is REPLACED with File A (v2)│
│ 2. No merge happens here                  │
│ 3. No conflict resolution UI appears      │
└───────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│ File A (v2)     │ ← Changed!
│ File B (v1)     │ ← Unchanged
└─────────────────┘
        │
        ▼
┌───────────────────────────────────────────┐
│ git merge update-from-template            │
│                                           │
│ 1. If main branch has its own changes     │
│    to File A, conflicts will appear HERE  │
│ 2. Your IDE's merge tool will open        │
│ 3. You must resolve conflicts manually    │
└───────────────────────────────────────────┘
```

## Repository Terminology

For clarity, let's define the repositories:

- **Template repository**: The base repository (e.g., `turbo-t3-sassy`) that contains the common structure and code
- **Project repository**: Your specific application (e.g., `founderlog`) derived from the template

## Branch Naming Convention

To make the data flow clear, use these branch naming conventions:

- `update-from-project`: When pulling changes FROM your project TO the template
- `update-from-template`: When pulling changes FROM the template TO your project

## Initial Repository Setup for Bidirectional Sync

For two-way sync to work properly, you need to set up remotes in **both** repositories pointing to each other:

### 1. Setup in Project Repository

```bash
# Clone the template for a new project
git clone https://github.com/knamnguyen/turbo-t3-sassy.git founderlog

# Change directory to the project
cd founderlog

# Install GitHub CLI if not already installed
brew install gh

# Authenticate with GitHub CLI
gh auth login

# Create a new private repository on GitHub
gh repo create founderlog --private --confirm

# Remove the template origin and set your new repository as origin
git remote remove origin
git remote add origin https://github.com/knamnguyen/founderlog.git
git push -u origin main

# Add the template as another remote for future synchronization
git remote add template https://github.com/knamnguyen/turbo-t3-sassy.git

# Check your remotes
git remote -v
# Should show:
# origin    https://github.com/knamnguyen/founderlog.git (fetch)
# origin    https://github.com/knamnguyen/founderlog.git (push)
# template  https://github.com/knamnguyen/turbo-t3-sassy.git (fetch)
# template  https://github.com/knamnguyen/turbo-t3-sassy.git (push)
```

### 2. Setup in Template Repository

```bash
# Navigate to your template repository directory
cd /path/to/turbo-t3-sassy

# Add the project repository as a remote named after your project
git remote add founderlog https://github.com/knamnguyen/founderlog.git

# Check your remotes
git remote -v
# Should show:
# origin     https://github.com/knamnguyen/turbo-t3-sassy.git (fetch)
# origin     https://github.com/knamnguyen/turbo-t3-sassy.git (push)
# founderlog https://github.com/knamnguyen/founderlog.git (fetch)
# founderlog https://github.com/knamnguyen/founderlog.git (push)
```

Now you have bidirectional remotes set up:
- In your project repo: `template` points to your template repository
- In your template repo: `founderlog` (or your project name) points to your project repository

## Comparing Sync Approaches

| Aspect | Push/Pull Approach | Pull-Only Approach |
|--------|-------------------|-------------------|
| **Complexity** | High - Multiple steps | Low - Single workflow |
| **Error Prone** | Yes - Merge conflicts common | Low - You control what's updated |
| **Control** | Less selective | Very selective |
| **Workflow** | Push from source → Pull in target | Pull directly in target |
| **GitHub PRs** | Required for complex changes | Not needed |
| **Merge Conflicts** | Common on direct pushes | Handled during the pull |
| **Debugging** | Complex - Two repos involved | Simple - One repo at a time |

## Best Practices for Pull-Only Approach

1. **Always work in branches**: Never pull directly into main
2. **Be selective**: Only pull the specific files or folders you need
3. **Always review changes**: Use `git diff --staged` to verify what's changing
4. **Commit semantically**: Use clear commit messages about what was synced
5. **Regular updates**: Sync regularly to minimize divergence
6. **Fetch before pull**: Run `git fetch <remote>` to update remote refs before selecting files
7. **Document divergence**: Keep a record of intentional differences between repositories

## Alternative: Complex Push/Pull Approach

The rest of this document describes the more complex push/pull approach, which is not recommended for most solo developers. This approach is preserved for reference or for teams that need a more structured workflow with PRs.

## Complete Sync Workflow (Push & Pull)

### Step 1: Push changes from source to target

First, push your changes to the target repository.

### Step 2: Pull updates in the target repository

After pushing, you need to pull the changes in the target repository to make them active.

Example full workflow:

```bash
# STEP 1: In source repo (e.g., PROJECT repo), push changes
git checkout main
git checkout -b project-to-template
git add packages/stripe/
git commit -m "Update stripe package"
git push template project-to-template:main

# STEP 2: In target repo (e.g., TEMPLATE repo), pull changes
cd /path/to/template-repo
git checkout main
git pull origin main
```

## Syncing from Project to Template

When you've made improvements in your project that should be backported to the template:

### Package-Level Sync

```bash
# In your PROJECT repository (e.g., founderlog)
# Start on your main branch
git checkout main

# 1. Create a sync branch with clear direction naming
git checkout -b project-to-template

# 2. Stage only the specific package you want to push back
git add packages/stripe/

# 3. Commit those changes
git commit -m "Update stripe package with new payment flow"

# 4. Push directly to the template's main branch
git push template project-to-template:main

# 5. Return to your main branch
git checkout main
```

### After Pushing: Update the Template Repository

```bash
# Go to your template repository
cd /path/to/turbo-t3-sassy

# Pull the changes you just pushed
git checkout main
git pull origin main

# Verify the changes look correct
git log -p -1  # Review the most recent commit
```

### File-Level Sync

```bash
# In your PROJECT repository (e.g., founderlog)
git checkout main
git checkout -b project-to-template

# Add specific files only
git add packages/api/src/router/user.ts packages/api/src/router/subscription.ts

# Commit and push as above
git commit -m "Improve user and subscription routers"
git push template project-to-template:main

# Return to your main branch
git checkout main
```

### Code Snippet Sync

```bash
# In your PROJECT repository (e.g., founderlog)
git checkout main
git checkout -b project-to-template

# Create a patch of specific changes
git diff HEAD~ -- packages/ui/src/components/Button.tsx > button-improvements.patch

# Apply this patch selectively in the template repo
cd /path/to/turbo-t3-sassy
git checkout -b project-to-template
git apply --3way /path/to/founderlog/button-improvements.patch

# Review changes, commit and push
git add packages/ui/src/components/Button.tsx
git commit -m "Apply button improvements from project"
git push origin main

# Return to your original repo
cd /path/to/founderlog
```

## Syncing from Template to Project

When the template has been improved and you want to apply those changes to an existing project:

### Package-Level Sync

```bash
# In your TEMPLATE repository (e.g., turbo-t3-sassy)
# Start on your main branch
git checkout main

# 1. Create a sync branch with clear direction naming
git checkout -b template-to-project

# 2. Stage the package you want to push to the project
git add packages/ui/

# 3. Commit those changes
git commit -m "Update UI components for projects"

# 4. Push directly to the project's main branch
git push founderlog template-to-project:main

# 5. Return to your main branch
git checkout main
```

### After Pushing: Update the Project Repository

```bash
# Go to your project repository
cd /path/to/founderlog

# Pull the changes you just pushed
git checkout main
git pull origin main

# Verify the changes and ensure everything works
pnpm install  # If dependencies changed
pnpm build    # Make sure it builds correctly
```

### File-Level Sync

```bash
# In your TEMPLATE repository (e.g., turbo-t3-sassy)
git checkout main
git checkout -b template-to-project

# Add specific files only
git add packages/validators/src/auth.ts packages/validators/src/user.ts

# Commit and push as above
git commit -m "Improve validator schemas"
git push founderlog template-to-project:main

# Return to your main branch
git checkout main
```

### Code Snippet Sync

```bash
# In your TEMPLATE repository (e.g., turbo-t3-sassy)
git checkout main
git checkout -b template-to-project

# Create a patch of specific changes
git diff HEAD~ -- packages/api/src/router/index.ts > router-improvements.patch

# Apply this patch selectively in the project repo
cd /path/to/founderlog
git checkout -b template-to-project
git apply --3way /path/to/turbo-t3-sassy/router-improvements.patch

# Review changes, commit and push
git add packages/api/src/router/index.ts
git commit -m "Apply router improvements from template"
git push origin main

# Return to your original repo
cd /path/to/turbo-t3-sassy
```

## Alternative: Fetching Changes Instead of Pushing

If you prefer to work from one repository and pull changes rather than push them:

### Fetching Template Changes Into Project

```bash
# In your PROJECT repository (e.g., founderlog)
git checkout main
git checkout -b template-to-project

# Pull specific files/folders from template
git checkout template/main -- packages/ui/ packages/validators/

# Review changes, then commit
git add .
git commit -m "Sync UI and validators from template"

# Merge to your main branch
git checkout main
git merge template-to-project
git branch -d template-to-project
```

### Fetching Project Changes Into Template

```bash
# In your TEMPLATE repository (e.g., turbo-t3-sassy)
git checkout main
git checkout -b project-to-template

# Pull specific files/folders from project
git checkout founderlog/main -- packages/stripe/ packages/api/src/router/custom/

# Review changes, then commit
git add .
git commit -m "Sync stripe and custom routers from project"

# Merge to your main branch
git checkout main
git merge project-to-template
git branch -d project-to-template
```

## Handling Conflicts

Conflicts are likely when syncing between repositories:

```bash
# When conflicts occur during cherry-pick or merge:
git status

# Resolve conflicts in your editor, then:
git add <resolved-files>
git merge --continue

# If you need to abort:
git merge --abort
```

## Handling Conflicts as Repositories Diverge

As your project and template repositories evolve separately, direct pushes will increasingly encounter merge conflicts. Here are strategies to handle this:

### 1. Use Feature Branches and PRs for Complex Changes

For significant changes that might conflict:

```bash
# Push to a feature branch instead of directly to main
git push template project-to-template:feature/new-stripe-integration

# Then in the template repo, create a PR and resolve conflicts in the GitHub interface
```

### 2. Selective Syncing

Sync smaller, focused changes rather than large chunks:

```bash
# Sync just one component or module at a time
git add packages/ui/src/components/Button/
git commit -m "Sync just the Button component"
```

### 3. Three-Way Merge Strategy

For complex merges, use a three-way merge approach:

```bash
# In target repo
git checkout -b temp-integration
git pull source-remote feature-branch --allow-unrelated-histories
# Resolve conflicts
git checkout main
git merge temp-integration
```

### 4. Create Patch Files for Targeted Changes

For targeted changes that might conflict:

```bash
# Create a patch with just your changes
git diff main...your-branch -- specific/path > changes.patch

# Apply selectively in target repo
git apply --3way changes.patch
```

### 5. Reset and Re-sync When Necessary

If sync gets too complex, consider a reset approach for non-customized packages:

```bash
# In project repo, completely replace a package with template version
rm -rf packages/ui/
git checkout template/main -- packages/ui/
git add packages/ui/
git commit -m "Reset UI package to template version"
```

## Best Practices

1. **Set up bidirectional remotes**: Always configure remotes in both repositories pointing to each other
2. **Use directional branch names**: Always use `project-to-template` or `template-to-project` to make the data flow clear
3. **Work from main branch**: Start sync operations from the main branch of the source repository
4. **Communicate changes**: Document which components you've synced in commit messages
5. **Test thoroughly**: After syncing, ensure all tests pass in both repositories
6. **Small, focused syncs**: Prefer smaller, focused syncs over large bulk syncs
7. **Version tracking**: Maintain a record of which template version each project is based on
8. **Sync regularly**: More frequent, smaller syncs are easier than infrequent, large syncs
9. **Document divergence**: Keep track of intentional differences between project and template

## Troubleshooting

- **Unrelated histories error**: Use `git merge --allow-unrelated-histories` when necessary
- **Cannot apply patch**: Try `git apply --reject` to apply clean parts and manually fix rejects
- **Losing project customizations**: Use `git merge -X ours` to keep your local changes in conflict cases
- **Remote branch confusion**: Use `git remote prune <remote-name>` to clean up deleted remote branches
- **Stuck in bad state**: It's always safe to abort with `git merge --abort` or `git cherry-pick --abort` and try again