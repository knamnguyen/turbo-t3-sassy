# Repository Synchronization: Pull-Only Approach

## Quick Start: Using the Automated Tool

After setting up bidirectional GitHub remote links (as described below), you can use the built-in sync tool for faster repository synchronization:

```bash
# Run the sync tool from the root directory
pnpm sync-repos
```

This tool will prompt you for:

- Which repository you are on (template or project)
- The name of your remote repo - default template if you are on project, name of project if you're on template
- The commit message

**Important reminders:**

- Always review changes before committing
- Delete temporary branches after merging
- Be careful when syncing config files that might contain environment-specific settings

## Repository Terminology

For clarity, let's define the repositories:

- **Template repository**: The base repository (e.g., `sassy`) that contains the common structure and code
- **Project repository**: Your specific application (e.g., `founderlog`) derived from the template

## Initial Repository Setup

Before you can sync between repositories, you need to set up the appropriate git remotes in both repositories:

### 1. Setting Up a New Project from Template

```bash
# Clone the template for a new project
git clone https://github.com/knamnguyen/sassy.git founderlog

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
git remote add template https://github.com/knamnguyen/sassy.git

# Check your remotes
git remote -v
# Should show:
# origin    https://github.com/knamnguyen/founderlog.git (fetch)
# origin    https://github.com/knamnguyen/founderlog.git (push)
# template  https://github.com/knamnguyen/sassy.git (fetch)
# template  https://github.com/knamnguyen/sassy.git (push)
```

### 2. Setting Up the Template Repository for Syncing

```bash
# Navigate to your template repository directory
cd /path/to/sassy

# Add the project repository as a remote named after your project
git remote add founderlog https://github.com/knamnguyen/founderlog.git

# Check your remotes
git remote -v
# Should show:
# origin     https://github.com/knamnguyen/sassy.git (fetch)
# origin     https://github.com/knamnguyen/sassy.git (push)
# founderlog https://github.com/knamnguyen/founderlog.git (fetch)
# founderlog https://github.com/knamnguyen/founderlog.git (push)
```

Now you have bidirectional remotes set up:

- In your project repo: `template` points to your template repository
- In your template repo: `founderlog` (or your project name) points to your project repository

## The Pull-Only Approach

The pull-only approach is **strongly recommended** for solo developers and small teams because it:

- **Reduces complexity**: You only need to understand one workflow
- **Minimizes errors**: Avoids merge conflicts caused by direct pushes
- **Provides selectivity**: You can choose exactly which files to sync
- **Makes changes explicit**: You always know what's being updated
- **Enhances safety**: Minimizes risk of accidentally overwriting important changes

The core principle is simple:

1. Set up remotes in both repositories (as shown above)
2. Never push directly between repositories
3. Always pull specific files/folders you want to sync from the source repository

## Branch Naming Convention

To make the data flow clear, use these branch naming conventions:

- `update-from-project`: When pulling changes FROM your project TO the template
- `update-from-template`: When pulling changes FROM the template TO your project

## Pull Workflow: Template ← Project

To update the template with improvements made in your project:

```bash
# In your TEMPLATE repository
git checkout main
git checkout -b update-from-project

# IMPORTANT: Fetch latest changes from the project repo
git fetch founderlog

# Pull SPECIFIC files/folders from project
# NOTE: This COMPLETELY REPLACES your local files with versions from the remote!
git checkout founderlog/main -- packages/stripe/
git checkout founderlog/main -- packages/api/src/router/custom/

# Review changes (important!)
git diff --staged  # Shows differences between staged changes and HEAD

# Commit the changes
git add .
git commit -m "Sync stripe package and custom routers from project"

# Merge (extra comment test) to main
git checkout main
# Conflict resolution happens here if needed in the visual ide editor
git merge update-from-project

# Clean up the temporary branch
git branch -d update-from-project
```

## Pull Workflow: Project ← Template

To update your project with improvements made in the template:

```bash
# In your PROJECT repository
git checkout main
git checkout -b update-from-template

# IMPORTANT: Fetch latest changes from the template repo
git fetch template

# Pull SPECIFIC files/folders from template
# NOTE: This COMPLETELY REPLACES your local files with versions from the remote!
git checkout template/main -- packages/ui/
git checkout template/main -- packages/validators/

# Review changes (important!)
git diff --staged  # Shows differences between staged changes and HEAD

# Commit the changes
git add .
git commit -m "Sync UI and validators from template"

# Merge to main
git checkout main
# Conflict resolution happens here if needed in the visual ide editor
git merge update-from-template

# Clean up the temporary branch
git branch -d update-from-template
```

## Understanding How Conflicts Are Handled

When using `git checkout remote/branch -- path`:

1. **File replacement, not merging**: This command **completely replaces** your local files with the version from the remote. It doesn't attempt to merge changes.

2. **No conflict resolution during checkout**: Unlike `git merge` or `git pull`, the checkout command will simply overwrite your local files without showing merge conflicts.

3. **Conflicts appear during branch merge**: Conflicts will only appear later when you run `git merge update-from-template` to merge your branch into main. At this point, you'll see the typical merge conflict resolution UI in your IDE.

## Visual Explanation of the Pull Process

```
Starting state:            Remote state:
┌─────────────────┐       ┌─────────────────┐
│ File A (v1)     │       │ File A (v2)     │
│ File B (v1)     │       │ File B (v2)     │
└─────────────────┘       └─────────────────┘
        │                         │
        │                         │
        ▼                         │
┌───────────────────────────────────────────┐
│ STEP 1: git checkout remote/branch -- File A
│                                           │
│ File A (v1) is REPLACED with File A (v2)  │
│ No merge happens during this step!        │
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
│ STEP 2: git merge update-from-xxx branch  │
│                                           │
│ THIS is when conflicts might appear       │
│ Your IDE's merge resolution tool opens    │
│ if main branch has conflicting changes    │
└───────────────────────────────────────────┘
```

## Alternative: Selective File Merging

If you want more control over how changes are merged:

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

## Advanced: Selective File Inspection and Merging

When repositories diverge significantly or you need precise control over what changes to apply, the selective inspection approach offers the most granular control. This approach is particularly useful when:

- You want to only adopt specific features or fixes from the source repository
- The files have diverged significantly with customizations you want to preserve
- You need to review changes file-by-file or even line-by-line

### Visual Branch Structure

```
main branch           template/main branch
     |                        |
     |                        |
     ▼                        ▼
update-from-template    temp-remote branch
branch (your changes)   (remote changes)
     |                        |
     |                        |
     ▼                        ▼
       Merge and resolve
      conflicts selectively
             |
             ▼
      Commit and merge
     back to main branch
```

### Detailed Workflow

1. **Prepare your environment**:

```bash
# Start from main branch
git checkout main

# Create a branch for your sync work
# This branch will be a copy of the main branch
git checkout -b update-from-template

# Make note of your current state (optional but helpful)
git status
```

2. **Fetch and create inspection branch**:

```bash
# Fetch latest changes from template repository
git fetch template

# Create a separate branch from the remote for inspection
# This gives you a complete copy of the remote state
git checkout -b temp-remote template/main
# Or use your IDE's comparison tools for visual diff (recommended)
# Most IDEs allow you to right-click and compare the two branches/files
```

3. **Merge and select changes using your IDE's tools**:

```bash
# Switch back to your sync branch
git checkout update-from-template

# Merge the template changes - this will trigger the conflict resolution
# process for any files that have diverged
git merge temp-remote

# If there are conflicts, your IDE will detect them and offer to open
# its merge resolution tools. This is where you get to decide what to keep.
```

4. **Using your IDE's merge tools**:

Most modern IDEs provide excellent visual merge tools that allow you to:

- See your version side by side with the incoming template version
- Choose which specific changes to keep from each side
- Manually edit the final result to combine features
- Resolve conflicts file by file

The typical IDE merge view has:

- Your current version (usually on the left)
- The incoming template changes (usually on the right)
- The result you're creating (center/bottom)
- Buttons to accept current, incoming, or both changes

Take your time here to go through each conflict and choose exactly which changes you want to incorporate. This is the key advantage of this approach - you get line-by-line control over what gets synchronized.

5. **Complete the merge**:

```bash
# After resolving all conflicts using your IDE's tools,
# mark the files as resolved
git add .

# Complete the merge
git commit

# Git will provide a default merge commit message
# Edit it to describe which parts you chose to sync
```

6. **Merge to main and clean up**:

```bash
# Switch back to main
git checkout main

# Merge your sync branch
git merge update-from-template

# Clean up the temporary branches
git branch -d update-from-template
git branch -d temp-remote
```
