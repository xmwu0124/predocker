"""
PreDocker Scraper
Scrapes pre-doctoral positions from predoc.org
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta
from typing import List, Dict
import os
import re
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class PreDocScraper:
    def __init__(self, output_dir='../database'):
        self.base_url = 'https://predoc.org/opportunities'
        self.output_dir = output_dir
        self.jobs_file = os.path.join(output_dir, 'jobs.json')
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        self.ensure_output_dir()
    
    def ensure_output_dir(self):
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        if not os.path.exists(self.jobs_file):
            with open(self.jobs_file, 'w') as f:
                json.dump([], f)
        print("Output directory ready")
    
    def extract_field_value(self, text: str, field_name: str) -> str:
        pattern = f"{field_name}:?\\s*([^\n]+)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return 'N/A'
    
    def is_deadline_valid(self, deadline: str) -> bool:
        """Check if deadline is within 2 months from now"""
        if deadline == 'N/A' or deadline.lower() == 'rolling':
            return True
        
        try:
            for fmt in ['%B %d, %Y', '%b %d, %Y', '%m/%d/%Y', '%Y-%m-%d', '%B %d,%Y']:
                try:
                    deadline_date = datetime.strptime(deadline.strip(), fmt)
                    two_months_ago = datetime.now() - timedelta(days=60)
                    return deadline_date >= two_months_ago
                except ValueError:
                    continue
            
            if any(month in deadline.lower() for month in ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']):
                return True
            
            return True
        except Exception:
            return True
    
    def scrape_jobs(self) -> List[Dict]:
        print(f"Starting to scrape {self.base_url}...")
        
        try:
            response = requests.get(self.base_url, headers=self.headers, timeout=10, verify=False)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            jobs = []
            skipped = 0
            
            all_articles = soup.find_all('article')
            print(f"Found {len(all_articles)} total articles")
            
            job_articles = [a for a in all_articles if 'Sponsoring' in a.get_text()]
            print(f"Found {len(job_articles)} job postings\n")
            
            for article in job_articles:
                try:
                    title_tag = article.find('h2')
                    title = title_tag.get_text(strip=True) if title_tag else 'N/A'
                    
                    url = 'N/A'
                    if title_tag:
                        link = title_tag.find('a')
                        if link and link.get('href'):
                            url = link['href']
                    
                    full_text = article.get_text('\n', strip=True)
                    
                    institution = self.extract_field_value(full_text, 'Sponsoring Institution')
                    field = self.extract_field_value(full_text, 'Fields? of Research')
                    deadline = self.extract_field_value(full_text, 'Deadline')
                    
                    if not self.is_deadline_valid(deadline):
                        skipped += 1
                        if skipped <= 3:
                            print(f"Skipped (expired): {title[:40]}... - Deadline: {deadline}")
                        continue
                    
                    location = institution if institution != 'N/A' else 'N/A'
                    
                    job_data = {
                        'title': title,
                        'institution': institution,
                        'location': location,
                        'deadline': deadline,
                        'url': url,
                        'description': field,
                        'field': field,
                        'scraped_date': datetime.now().isoformat(),
                        'is_active': 1
                    }
                    
                    jobs.append(job_data)
                    
                    if len(jobs) <= 3:
                        print(f"Job {len(jobs)}:")
                        print(f"   Title: {title[:50]}")
                        print(f"   Institution: {institution[:50]}")
                        print(f"   Deadline: {deadline}")
                        print()
                        
                except Exception as e:
                    print(f"Error parsing article: {e}")
                    continue
            
            print(f"Successfully scraped {len(jobs)} valid jobs")
            if skipped > 0:
                print(f"Skipped {skipped} expired postings")
            return jobs
            
        except requests.RequestException as e:
            print(f"Error fetching data: {e}")
            return []
    
    def save_to_json(self, jobs: List[Dict]):
        try:
            with open(self.jobs_file, 'w') as f:
                for i, job in enumerate(jobs, 1):
                    job['id'] = i
                json.dump(jobs, f, indent=2, ensure_ascii=False)
            
            print(f"Saved {len(jobs)} jobs to {self.jobs_file}")
            
        except Exception as e:
            print(f"Error saving jobs: {e}")
    
    def run(self):
        print("PreDocker Scraper Starting...\n")
        jobs = self.scrape_jobs()
        
        if jobs:
            self.save_to_json(jobs)
            print(f"\nSummary: {len(jobs)} active jobs saved")
        else:
            print("No jobs found")

def main():
    scraper = PreDocScraper()
    scraper.run()

if __name__ == '__main__':
    main()