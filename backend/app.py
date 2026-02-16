import uuid
import json
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from datetime import datetime, UTC
from embedding_description import main as classify_description
from embedding_url import main as classify_url
from aurora_api import main as aurora_classify


app = Flask(__name__)
CORS(app)



@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello, World!'})



@app.route('/api/classify', methods=['POST'])
def classify():
    data = request.json
    projectName = data.get('projectName')
    projectUrl  = data.get('projectUrl')
    projectDescription = data.get('projectDescription')

    if not projectDescription:
        return jsonify({'error': 'Project description is required'}), 400
    
    # Initialize results dictionary
    results = {}
    
    # 1. Aurora API Model (text-based)
    print("\n===== RUNNING AURORA API MODEL =====")
    try:
        aurora_result = aurora_classify(
            text=projectDescription,
            project_name=projectName,
            project_url=projectUrl
        )
        results["aurora-model"] = aurora_result
        print("Aurora API model completed successfully")
    except Exception as e:
        print(f"Aurora API model failed: {str(e)}")
        results["aurora-model"] = {
            "error": str(e),
            "message": "Aurora API classification failed"
        }
    
    # 2. Sentence Transformer URL Model (GitHub URL-based)
    print("\n===== RUNNING SENTENCE TRANSFORMER URL MODEL =====")
    if projectUrl:
        try:
            st_url_result = classify_url(projectUrl)
            results["st-url-model"] = st_url_result
            print("ST URL model completed successfully")
        except Exception as e:
            print(f"ST URL model failed: {str(e)}")
            results["st-url-model"] = {
                "error": str(e),
                "message": "Sentence Transformer URL model classification failed"
            }
    else:
        results["st-url-model"] = {
            "message": "No project URL provided, skipping URL-based classification"
        }
    
    # 3. Sentence Transformer Description Model (text-based)
    print("\n===== RUNNING SENTENCE TRANSFORMER DESCRIPTION MODEL =====")
    try:
        st_desc_result = classify_description(
            project_description=projectDescription,
            project_name=projectName,
            project_url=projectUrl
        )
        results["st-description-model"] = st_desc_result
        print("ST Description model completed successfully")
    except Exception as e:
        print(f"ST Description model failed: {str(e)}")
        results["st-description-model"] = {
            "error": str(e),
            "message": "Sentence Transformer Description model classification failed"
        }
    
    # Convert st-description-model predictions to the expected format for logging
    # (keeping backward compatibility with existing data/predictions.json structure)
    preds = []
    if "st-description-model" in results and "sdg_predictions" in results["st-description-model"]:
        preds = [
            {"sdg": name, "prediction": score}
            for name, score in results["st-description-model"]["sdg_predictions"].items()
        ]
    
    # Filter predictions with score > 0.1 for logging
    filtered_predictions = [p for p in preds if p.get("prediction", 0) > 0.1]

    # Read existing data or create new array
    # try:
    #     with open("data/predictions.json", "r") as f:
    #         all_predictions = json.load(f)
    # except (FileNotFoundError, json.JSONDecodeError):
    #     all_predictions = []
    
    # Create new entry with all model results
    random_uuid = uuid.uuid4()
    log_entry = {
        "id": str(random_uuid),
        "timestamp": datetime.now(UTC).isoformat(),
        "projectName": projectName,
        "projectUrl": projectUrl,
        "projectDescription": projectDescription,
        "predictions": filtered_predictions,  # Legacy format for backward compatibility
        "all_model_results": results  # New field with all model outputs
    }
    
    # Append and write back
    # all_predictions.append(log_entry)
    # with open("data/predictions.json", "w") as f:
    #     json.dump(all_predictions, f, indent=2)

    # Return all model results
    return jsonify({
        "projectName": projectName,
        "projectUrl": projectUrl,
        "projectDescription": projectDescription[:200] + "..." if len(projectDescription) > 200 else projectDescription,
        "results": results
    }), 200


# def allowed_ext(filename: str) -> bool:
#     return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTS)




# @app.post("/api/upload-md")
# def aurora_api():

#     project_name = request.form.get("project_name", "").strip()
#     project_url = request.form.get("project_url", "").strip()

#     if not project_name:
#         return jsonify({"error": "Project name is required"}), 400
#     if not project_url:
#         return jsonify({"error": "Project URL is required"}), 400
    

#     if "file" not in request.files:
#         return jsonify({"error":"No file part named 'file' in form-data."}), 400
#     f = request.files["file"]

#     if f.filename == "":
#         return jsonify({ "error": "Empty filename."}), 400
#     if not allowed_ext(f.filename):
#         return jsonify({"error" : "Only .md files are allowed."}), 400

   
#     filename = secure_filename(f.filename)

#     text = f.read().decode("utf-8", errors="replace")

#     result = aurora_main(text)
    
#     return jsonify({
#         "project_name": project_name,
#         "project_url": project_url,
#         "filename": filename,
#         "size_bytes": len(text.encode("utf-8")),
#         "content_preview": text[:2000],  
#         "predictions": result.get("predictions", "") 
#     }), 200

if __name__ == '__main__':
    app.run(debug=True)