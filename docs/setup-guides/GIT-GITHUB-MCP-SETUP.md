# Git/GitHub MCP Server Configuration

This project is configured with Git and GitHub MCP (Model Context Protocol) Servers for version control and GitHub operations through AI assistants.

## What is Git/GitHub MCP Server?

The Git/GitHub MCP Servers provide AI assistants with access to Git operations and GitHub features through the Model Context Protocol. This enables:
- Git version control operations
- GitHub repository management
- Pull request creation and management
- Issue tracking and management
- Code review automation
- Commit history analysis

## Architecture

### Git MCP Server (Local)
Custom implementation for local Git operations:
- Status, log, diff
- Branch management
- Staging and committing
- Push/pull operations
- Stash management

### GitHub MCP Server (Remote)
Official GitHub MCP Server for GitHub API:
- Repository management
- Pull requests
- Issues and projects
- GitHub Actions
- Code search

## Configuration

### Repository Setup
```bash
# Initialize Git repository
git init

# Add remote repository
git remote add origin https://github.com/rohitjain-pio/Converted-HRMS.git

# Set default branch
git branch -M main
```

### MCP Settings
Located in `.vscode/mcp-settings.json`:

```json
{
  "mcpServers": {
    "git": {
      "command": "node",
      "args": [".vscode/git-mcp-server.js"],
      "env": {
        "GIT_REPO_PATH": "C:\\wamp64\\www\\Converted-HRMS"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": ""
      }
    }
  }
}
```

## GitHub Personal Access Token

To use the GitHub MCP Server, you need a Personal Access Token (PAT).

### Creating a Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "HRMS MCP Server"
4. Scopes required:
   - ✅ `repo` - Full repository access
   - ✅ `workflow` - GitHub Actions
   - ✅ `read:org` - Organization access
   - ✅ `read:user` - User profile
   - ✅ `user:email` - Email access

5. Generate and copy token (starts with `ghp_`)

### Configuring the Token

**Option 1: Environment Variable (Recommended)**
```powershell
# Set for current session
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_your_token_here"

# Add to PowerShell profile permanently
notepad $PROFILE
# Add: $env:GITHUB_PERSONAL_ACCESS_TOKEN = "ghp_your_token_here"
```

**Option 2: MCP Settings**
Edit `.vscode/mcp-settings.json` and add token to `GITHUB_PERSONAL_ACCESS_TOKEN`

⚠️ **Never commit tokens to Git!**

See `.vscode/GITHUB-TOKEN-SETUP.md` for detailed instructions.

## Git Operations

### Using Git MCP Server Tools

The Git MCP Server provides the following tools:

#### 1. git-status
Get current repository status
```json
{}
```

#### 2. git-log
View commit history
```json
{
  "limit": 10,
  "branch": "main"
}
```

#### 3. git-diff
View changes
```json
{
  "staged": false,
  "file": "path/to/file"
}
```

#### 4. git-branch-list
List branches
```json
{
  "remote": false
}
```

#### 5. git-branch-create
Create new branch
```json
{
  "name": "feature/new-feature",
  "checkout": true
}
```

#### 6. git-branch-switch
Switch branches
```json
{
  "name": "develop"
}
```

#### 7. git-add
Stage files
```json
{
  "files": ["file1.ts", "file2.ts"],
  "all": false
}
```

#### 8. git-commit
Commit changes
```json
{
  "message": "feat: add new feature",
  "amend": false
}
```

#### 9. git-push
Push to remote
```json
{
  "remote": "origin",
  "branch": "main",
  "force": false
}
```

#### 10. git-pull
Pull from remote
```json
{
  "remote": "origin",
  "branch": "main"
}
```

#### 11. git-stash
Manage stashes
```json
{
  "action": "push",
  "message": "WIP: feature"
}
```

#### 12. git-show
Show commit details
```json
{
  "commit": "abc123"
}
```

## Common Workflows

### Feature Development Workflow

1. **Create feature branch**
```bash
git checkout -b feature/employee-export
```

2. **Make changes and commit**
```bash
git add .
git commit -m "feat: add employee export functionality"
```

3. **Push to remote**
```bash
git push origin feature/employee-export
```

4. **Create Pull Request** (via GitHub MCP Server)

### Bug Fix Workflow

1. **Create bugfix branch**
```bash
git checkout -b bugfix/login-error
```

2. **Fix and commit**
```bash
git add affected-files.ts
git commit -m "fix: resolve login authentication error"
```

3. **Push and create PR**
```bash
git push origin bugfix/login-error
```

### Code Review Workflow

1. **View changes**
```bash
git diff origin/main
```

2. **Check commit history**
```bash
git log --oneline -10
```

3. **Review specific commit**
```bash
git show abc123
```

## Commit Message Convention

Using Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvement
- **test**: Adding tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples:
```bash
feat(auth): add Azure AD SSO integration
fix(attendance): correct time calculation logic
docs(readme): update installation instructions
refactor(api): improve error handling
test(employee): add unit tests for CRUD operations
```

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Development integration branch

### Supporting Branches
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency production fixes
- `release/*` - Release preparation

### Example:
```bash
# Feature
git checkout -b feature/asset-management

# Bug fix
git checkout -b bugfix/attendance-calculation

# Hotfix
git checkout -b hotfix/critical-security-fix

# Release
git checkout -b release/v1.0.0
```

## .gitignore Configuration

The repository includes comprehensive `.gitignore`:

```
# Dependencies
node_modules/
vendor/

# Environment files
.env
.env.local

# Build outputs
dist/
build/

# Test results
playwright-report/
test-results/

# Logs
*.log

# IDE
.vscode/
.idea/
```

## GitHub Features

### Issues
- Track bugs and feature requests
- Use labels: `bug`, `enhancement`, `documentation`
- Assign to team members
- Link to pull requests

### Pull Requests
- Create from feature branches
- Request reviews from team
- Link related issues
- Use PR templates

### Projects
- Kanban boards for task tracking
- Milestones for releases
- Roadmap planning

### Actions
- CI/CD automation
- Test runners
- Deployment workflows
- Code quality checks

## File Structure

```
.git/                           # Git repository data
.gitignore                      # Git ignore rules
.vscode/
├── mcp-settings.json          # MCP server configuration
├── git-mcp-server.js          # Custom Git MCP server
└── GITHUB-TOKEN-SETUP.md      # Token setup guide

docs/                          # Documentation
hrms-backend/                  # Laravel backend
hrms-frontend/                 # Vue frontend
```

## Security Best Practices

### Credentials
- ❌ Never commit `.env` files
- ❌ Never commit tokens or secrets
- ✅ Use environment variables
- ✅ Use `.gitignore` properly
- ✅ Review commits before pushing

### Access Control
- Use branch protection rules
- Require pull request reviews
- Enable status checks
- Restrict force pushes
- Enable 2FA on GitHub

### Code Review
- Review all code changes
- Check for security vulnerabilities
- Verify test coverage
- Ensure documentation is updated

## Troubleshooting

### Issue: "fatal: not a git repository"
**Solution**: Initialize Git with `git init`

### Issue: "remote: Permission denied"
**Solution**: Check SSH keys or use HTTPS with PAT

### Issue: "Your branch is behind"
**Solution**: Pull latest changes: `git pull origin main`

### Issue: "Merge conflict"
**Solution**: 
```bash
git status                    # See conflicted files
# Edit files to resolve conflicts
git add resolved-files
git commit -m "fix: resolve merge conflicts"
```

### Issue: GitHub PAT expired
**Solution**: Generate new token and update configuration

## Testing Git MCP Server

```bash
# Test local Git server
echo '{"method":"tools/list","params":{}}' | node .vscode/git-mcp-server.js

# Test status
echo '{"method":"tools/call","params":{"name":"git-status","arguments":{}}}' | node .vscode/git-mcp-server.js
```

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [GitHub API](https://docs.github.com/en/rest)

## Integration with Other MCP Servers

The Git/GitHub MCP Servers work alongside:
- **Playwright MCP** - Test automation
- **Azure MCP** - Cloud services
- Together they enable comprehensive development workflows

## Monitoring and Analytics

### Git Statistics
```bash
# Commit count by author
git shortlog -sn

# Recent activity
git log --oneline --graph --all -10

# File change statistics
git diff --stat
```

### GitHub Insights
- Code frequency graphs
- Contributor statistics
- Pulse (activity overview)
- Network graph

## Next Steps

1. ✅ Initialize Git repository
2. ✅ Configure remote repository
3. ⏳ Generate GitHub PAT
4. ⏳ Make initial commit
5. ⏳ Push to GitHub
6. ⏳ Set up branch protection
7. ⏳ Configure GitHub Actions
8. ⏳ Create PR templates
9. ⏳ Set up issue templates
10. ⏳ Configure code owners

## Quick Commands Reference

```bash
# Status and info
git status
git log --oneline -10
git branch

# Staging and committing
git add .
git commit -m "message"
git push

# Branching
git checkout -b feature/name
git merge feature/name
git branch -d feature/name

# Syncing
git pull origin main
git push origin main
git fetch --all

# Undoing changes
git reset --hard HEAD
git revert abc123
git stash
git stash pop
```

## Collaboration Guidelines

1. **Always pull before starting work**
2. **Create feature branches** for all changes
3. **Write clear commit messages**
4. **Keep PRs focused and small**
5. **Request reviews** from team members
6. **Update documentation** with code changes
7. **Run tests** before committing
8. **Resolve conflicts** promptly
