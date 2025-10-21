from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from classify import main as classify_text
from datetime import datetime
from aurora_api import main as aurora_main
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # 2 MB upload limit
ALLOWED_EXTS = {".md"}

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


def allowed_ext(filename: str) -> bool:
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTS)

@app.post("/api/upload-md")
def aurora_api():
    if "file" not in request.files:
        return jsonify({"error":"No file part named 'file' in form-data."}), 400
    f = request.files["file"]

    if f.filename == "":
        return jsonify({ "error": "Empty filename."}), 400
    if not allowed_ext(f.filename):
        return jsonify({"error" : "Only .md files are allowed."}), 400

   
    filename = secure_filename(f.filename)

    text = f.read().decode("utf-8", errors="replace")

    result = aurora_main(text)
    
    return jsonify({
        "filename": filename,
        "size_bytes": len(text.encode("utf-8")),
        "content_preview": text[:2000],  
        "predictions": result.get("predictions", "") 
    }), 200

if __name__ == '__main__':
    app.run(debug=True)