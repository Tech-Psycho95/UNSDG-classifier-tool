from flask import Flask, jsonify, request
from flask_cors import CORS
from classify import main as classify_text
from pull_request import main as perform_pull_request_creation
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello, World!'})



@app.route('/api/classify', methods=['POST'])
def classify():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    result = classify_text(url)
    return jsonify(result)

@app.route('/api/create-pr', methods=['POST'])
def create_pull_request():
    try:
        # Get the JSON data from the request
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        # Call the pull request creation function with the data
        result = perform_pull_request_creation(data)
        
        # Check if the result contains an error
        if 'error' in result:
            return jsonify(result), 400
            
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)