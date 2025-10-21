import requests
import json


def main(text: str):
    try:
        url = "https://aurora-sdg.labs.vu.nl/classifier/classify/aurora-sdg-multi"
        payload = json.dumps({"text": text})
        headers = {'Content-Type': 'application/json' }
        response = requests.request("POST", url, headers=headers, data=payload)
        return response.json()
    except Exception as e:
        return str(e)
