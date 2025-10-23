import PyPDF2
import json
import sys

def parse_pdf(file_path):
    text = ''
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
    return text

def extract_keywords(text):
    text_lower = text.lower()
    
    fields = ['economics', 'econometrics', 'microeconomics', 'macroeconomics',
              'development', 'labor', 'health', 'education', 'finance',
              'behavioral', 'public', 'industrial', 'trade', 'environmental']
    
    skills = ['stata', 'r', 'python', 'matlab', 'sas', 'sql',
              'regression', 'causal inference', 'machine learning',
              'statistics', 'econometrics', 'gis', 'latex']
    
    found_fields = [f for f in fields if f in text_lower]
    found_skills = [s for s in skills if s in text_lower]
    
    return {
        'fields': found_fields,
        'skills': found_skills
    }

def match_jobs(keywords, jobs_file):
    try:
        with open(jobs_file, 'r') as f:
            jobs = json.load(f)
    except:
        return []
    
    matched = []
    for job in jobs:
        score = 0
        job_text = (job.get('field', '') + ' ' + job.get('description', '')).lower()
        
        for field in keywords.get('fields', []):
            if field in job_text:
                score += 3
        
        for skill in keywords.get('skills', []):
            if skill in job_text:
                score += 2
        
        if score > 0:
            job['match_score'] = score
            matched.append(job)
    
    matched.sort(key=lambda x: x.get('match_score', 0), reverse=True)
    return matched[:20]

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python cv_parser.py <cv_file>")
        sys.exit(1)
    
    cv_file = sys.argv[1]
    text = parse_pdf(cv_file)
    keywords = extract_keywords(text)
    
    jobs_file = '../database/jobs.json'
    matched = match_jobs(keywords, jobs_file)
    
    result = {
        'keywords': keywords,
        'matched_jobs': matched,
        'total_matches': len(matched)
    }
    
    print(json.dumps(result))