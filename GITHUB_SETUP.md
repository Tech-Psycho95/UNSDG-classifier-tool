# GitHub Integration Setup

To enable the pull request functionality, you need to set up a GitHub Personal Access Token.

## Steps to create a GitHub token:

1. Go to GitHub.com and sign in to your account
2. Click on your profile picture in the top right corner
3. Select "Settings" from the dropdown menu
4. In the left sidebar, click on "Developer settings"
5. Click on "Personal access tokens" → "Tokens (classic)"
6. Click "Generate new token" → "Generate new token (classic)"
7. Give your token a descriptive name (e.g., "UNSDG Advocate App")
8. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
9. Click "Generate token"
10. **Important**: Copy the token immediately as you won't be able to see it again

## Setting up the environment variable:

### For macOS/Linux:

```bash
export GITHUB_TOKEN=your_token_here
```

### For Windows:

```cmd
set GITHUB_TOKEN=your_token_here
```

### For permanent setup, add to your shell profile:

```bash
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.zshrc
source ~/.zshrc
```

## Running the application:

1. Make sure your GitHub token is set as an environment variable
2. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```
3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## How it works:

When you click "Yes, that's our goal" in the results page:

1. The app extracts the repository owner and name from the GitHub URL
2. Creates a new branch with a timestamp
3. Adds/updates the `unsdg.json` file with the SDG analysis results
4. Creates a pull request with the changes
5. Shows you the PR number and link

## Security Note:

- Never commit your GitHub token to version control
- Use environment variables or secure secret management
- The token gives access to your repositories, so keep it secure
