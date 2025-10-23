from flask import Flask, request, jsonify
from flask_cors import CORS
import cv_parser
import os
import json

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({'status': 'PreDocker API Running', 'version': '1.0'})

@app.route('/api/analyze', methods=['POST'])
def analyze_cv():
    try:
        if 'cv' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['cv']
        temp_path = f'/tmp/{file.filename}'
        file.save(temp_path)
        
        text = cv_parser.parse_pdf(temp_path)
        keywords = cv_parser.extract_keywords(text)
        
        jobs_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'jobs.json')
        with open(jobs_file, 'r') as f:
            jobs = json.load(f)
        
        matched = cv_parser.match_jobs(keywords, jobs)
        os.remove(temp_path)
        
        return jsonify({
            'keywords': keywords,
            'matched_jobs': matched[:20],
            'total_matches': len(matched)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'jobs.json')
        with open(jobs_file, 'r') as f:
            jobs = json.load(f)
        return jsonify(jobs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)