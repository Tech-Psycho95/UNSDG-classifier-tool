import requests
import base64
import os
from datetime import datetime


def validate_github_token():
    """Validate that GitHub token is available in environment variables."""
    github_token = os.getenv('GITHUB_TOKEN')
    if not github_token:
        return None, {'error': 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.'}
    return github_token, None


def validate_request_data(data):
    """Validate required fields in the request data."""
    if not data:
        return {'error': 'No data provided'}
    
    owner = data.get('owner')
    repo = data.get('repo')
    content = data.get('content')
    
    if not all([owner, repo, content]):
        return {'error': 'Missing required fields: owner, repo, content'}
    
    return None


def create_github_headers(token):
    """Create GitHub API headers with authentication."""
    return {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }


def get_repository_info(owner, repo, headers):
    """Get repository information including default branch."""
    repo_url = f'https://api.github.com/repos/{owner}/{repo}'
    repo_response = requests.get(repo_url, headers=headers)
    
    if repo_response.status_code != 200:
        error_msg = repo_response.json().get('message', 'Unknown error') if repo_response.content else 'Repository not accessible'
        return None, {'error': f'Repository not found or not accessible: {error_msg}'}
    
    repo_info = repo_response.json()
    default_branch = repo_info.get('default_branch', 'main')
    print(f"Default branch: {default_branch}")
    
    return default_branch, None


def get_latest_commit_sha(owner, repo, branch, headers):
    """Get the latest commit SHA for the specified branch."""
    ref_url = f'https://api.github.com/repos/{owner}/{repo}/git/refs/heads/{branch}'
    ref_response = requests.get(ref_url, headers=headers)
    
    if ref_response.status_code != 200:
        error_msg = ref_response.json().get('message', 'Unknown error') if ref_response.content else 'Branch reference not accessible'
        return None, {'error': f'Could not get branch reference: {error_msg}'}
    
    base_sha = ref_response.json()['object']['sha']
    print(f"Base SHA: {base_sha}")
    
    return base_sha, None


def create_new_branch(owner, repo, base_sha, headers):
    """Create a new branch for the pull request."""
    branch_name = f'unsdg-analysis-{datetime.now().strftime("%Y%m%d-%H%M%S")}'
    create_branch_url = f'https://api.github.com/repos/{owner}/{repo}/git/refs'
    branch_data = {
        'ref': f'refs/heads/{branch_name}',
        'sha': base_sha
    }
    
    branch_response = requests.post(create_branch_url, json=branch_data, headers=headers)
    
    if branch_response.status_code != 201:
        error_msg = branch_response.json().get('message', 'Unknown error') if branch_response.content else 'Branch creation failed'
        return None, {'error': f'Could not create branch: {error_msg}'}
    
    print(f"Created branch: {branch_name}")
    return branch_name, None


def create_or_update_file(owner, repo, branch_name, content, message, headers):
    """Create or update the unsdg.json file in the repository."""
    file_url = f'https://api.github.com/repos/{owner}/{repo}/contents/unsdg.json'
    
    # Check if file already exists in the branch
    existing_file_response = requests.get(file_url, headers=headers, params={'ref': branch_name})
    
    file_data = {
        'message': message,
        'content': base64.b64encode(content.encode()).decode(),
        'branch': branch_name
    }
    
    # If file exists, we need the SHA for updating
    if existing_file_response.status_code == 200:
        file_data['sha'] = existing_file_response.json()['sha']
        print(f"File exists, updating with SHA: {file_data['sha']}")
    else:
        print("File doesn't exist, creating new file")
    
    file_response = requests.put(file_url, json=file_data, headers=headers)
    
    if file_response.status_code not in [200, 201]:
        error_msg = file_response.json().get('message', 'Unknown error') if file_response.content else 'File operation failed'
        return {'error': f'Could not create/update file: {error_msg}'}
    
    print(f"Created/Updated file unsdg.json in branch {branch_name}")
    return None


def create_pull_request(owner, repo, branch_name, default_branch, title, description, headers):
    """Create a pull request with the changes."""
    pr_url = f'https://api.github.com/repos/{owner}/{repo}/pulls'
    pr_data = {
        'title': title,
        'head': branch_name,
        'base': default_branch,
        'body': description
    }
    
    pr_response = requests.post(pr_url, json=pr_data, headers=headers)
    print(f"Pull request response status: {pr_response.status_code}")
    
    if pr_response.status_code != 201:
        error_msg = pr_response.json().get('message', 'Unknown error') if pr_response.content else 'Pull request creation failed'
        return None, {'error': f'Could not create pull request: {error_msg}'}
    
    pr_info = pr_response.json()
    print(f"Created pull request #{pr_info['number']}: {pr_info['html_url']}")
    
    return {
        'success': True,
        'pr_number': pr_info['number'],
        'pr_url': pr_info['html_url'],
        'branch_name': branch_name
    }, None


def main(data):
    """
    Main function to create a GitHub pull request with SDG analysis results.
    
    Args:
        data (dict): Request data containing owner, repo, content, message, and description
        
    Returns:
        dict: Success response with PR details or error response
    """
    try:
        # Step 1: Validate request data
        validation_error = validate_request_data(data)
        if validation_error:
            return validation_error
        
        # Step 2: Validate GitHub token
        github_token, token_error = validate_github_token()
        if token_error:
            return token_error
        
        # Extract data
        owner = data.get('owner')
        repo = data.get('repo')
        content = data.get('content')
        message = data.get('message', 'Add UN SDG analysis results')
        description = data.get('description', 'This pull request adds UN SDG analysis results.')
        
        # Step 3: Create GitHub API headers
        headers = create_github_headers(github_token)
        
        # Step 4: Get repository information
        default_branch, repo_error = get_repository_info(owner, repo, headers)
        if repo_error:
            return repo_error
        
        # Step 5: Get latest commit SHA
        base_sha, sha_error = get_latest_commit_sha(owner, repo, default_branch, headers)
        if sha_error:
            return sha_error
        
        # Step 6: Create new branch
        branch_name, branch_error = create_new_branch(owner, repo, base_sha, headers)
        if branch_error:
            return branch_error
        
        # Step 7: Create or update file
        file_error = create_or_update_file(owner, repo, branch_name, content, message, headers)
        if file_error:
            return file_error
        
        # Step 8: Create pull request
        pr_result, pr_error = create_pull_request(owner, repo, branch_name, default_branch, message, description, headers)
        if pr_error:
            return pr_error
        
        return pr_result
        
    except requests.exceptions.RequestException as e:
        print(f"Network error: {str(e)}")
        return {'error': f'Network error occurred: {str(e)}'}
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {'error': f'An unexpected error occurred: {str(e)}'}