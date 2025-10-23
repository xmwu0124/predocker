# PreDocker 

A web application for tracking pre-doctoral research positions and managing my academic job applications.

## Features

- 📋 **Job Listings** - Aggregated pre-doc positions from predoc.org
- ✅ **Application Tracker** - Keep track of your application status
- ⏰ **Deadline Reminders** - Never miss an application deadline
- 📄 **Document Management** - Organize your CVs and cover letters
- 📊 **Analytics** - Visualize your application progress

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (can upgrade to PostgreSQL)
- **Scraper**: Python with BeautifulSoup
- **Deployment**: Vercel (free tier)

## Project Structure

```
predocker/
├── frontend/          # Next.js application
│   ├── app/          # App router (Next.js 14)
│   ├── components/   # React components
│   ├── lib/          # Utilities and helpers
│   └── public/       # Static assets
├── scraper/          # Python scraper
│   ├── scraper.py    # Main scraper script
│   └── requirements.txt
├── database/         # Database schemas and migrations
└── docs/            # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/predocker.git
cd predocker
```

2. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

3. Set up the scraper:
```bash
cd scraper
pip install -r requirements.txt
python scraper.py
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Roadmap

### Phase 1 (Week 1) - MVP
- [x] Project setup
- [ ] Basic job listings display
- [ ] Simple scraper for predoc.org
- [ ] SQLite database setup

### Phase 2 (Week 2) - Core Features
- [ ] Application status tracker
- [ ] Deadline reminder system
- [ ] Search and filter functionality
- [ ] User authentication

### Phase 3 (Week 3) - Enhancement
- [ ] Document upload and management
- [ ] Statistics dashboard
- [ ] Email notifications
- [ ] Mobile responsive design

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - feel free to use this project for your own applications!

## Acknowledgments

- Data sourced from [predoc.org](https://predoc.org)
- Built for the pre-doctoral research community

---

**Note**: This tool is for personal use. Please respect predoc.org's terms of service when scraping data.
