
import re
from typing import Dict, Optional

class LevelsFyiScraper:
    def _match_company(self, company: str) -> bool:
        return 'pinterest' in company.lower()
    
    def _match_location(self, location: str) -> bool:
        return 'toronto' in location.lower()
    
    def _match_title(self, title: str) -> bool:
        target_titles = ["Senior Software Engineer", "Senior Engineer", "Software Engineer", "SWE"]
        title_lower = title.lower()
        return any(target.lower() in title_lower for target in target_titles)
    
    def _parse_compensation(self, value) -> int:
        if isinstance(value, (int, float)):
            return int(value)
        if isinstance(value, str):
            value = re.sub(r'[^\d.]', '', value)
            if value:
                try:
                    return int(float(value))
                except ValueError:
                    return 0
        return 0
    
    def _normalize_record(self, record: Dict) -> Dict:
        return {
            'job_title': record.get('title', 'Software Engineer'),
            'company': 'Pinterest',
            'location': record.get('location', 'Toronto'),
            'total_compensation': self._parse_compensation(record.get('totalyearlycompensation', 0)),
            'base_salary': self._parse_compensation(record.get('basesalary', 0)),
            'stock_equity': self._parse_compensation(record.get('stockgrantvalue', 0)),
            'bonus': self._parse_compensation(record.get('bonus', 0)),
            'years_of_experience': record.get('yearsofexperience'),
            'data_source': 'levels.fyi',
            'submitted_date': record.get('timestamp', '2024-01-01')
        }
