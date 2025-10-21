import json

with open("data/repo_text.json", "r") as f:
    repo_text = json.load(f)
    print(repo_text["text"])