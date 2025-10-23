# Database Schema

## Jobs Table
Stores all pre-doctoral positions scraped from predoc.org

```sql
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    institution TEXT,
    location TEXT,
    deadline TEXT,
    url TEXT UNIQUE,
    description TEXT,
    field TEXT,
    scraped_date TEXT,
    is_active INTEGER DEFAULT 1
);
```

## Applications Table
Tracks user's application status for each job

```sql
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    status TEXT DEFAULT 'saved',  -- saved, applied, interviewing, accepted, rejected
    applied_date TEXT,
    notes TEXT,
    documents TEXT,  -- JSON array of document filenames
    reminder_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);
```

## Documents Table
Stores user's application documents (CVs, cover letters, etc.)

```sql
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    document_type TEXT,  -- cv, cover_letter, research_statement, etc.
    version TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
```

## Status Values
- `saved` - Job saved but not applied
- `applied` - Application submitted
- `interviewing` - In interview process
- `accepted` - Offer received
- `rejected` - Application rejected
- `withdrawn` - User withdrew application

## Indexes
For better query performance:

```sql
CREATE INDEX idx_deadline ON jobs(deadline);
CREATE INDEX idx_status ON applications(status);
CREATE INDEX idx_job_id ON applications(job_id);
```
