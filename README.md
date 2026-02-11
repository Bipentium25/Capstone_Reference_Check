# Reference Check

A web application for academic paper reference validation and management. Reference Check helps ensure that citations in research papers are accurate and appropriate through AI analysis, author feedback, and citation network visualization.

## 📋 Overview

Reference Check provides a comprehensive platform for academic reference verification with three key user roles:

### User Roles

1. **Readers**
   - Search articles by title, subject, keywords, or article ID
   - Discover random articles from daily featured subjects
   - View detailed article information and reference lists
   - See AI-generated reference quality scores
   - Read feedback from cited authors
   - View author comments defending or explaining their citations
   - Explore citation networks through interactive graph visualizations

2. **Article Authors**
   - Submit new articles with complete metadata
   - Add references to cited works
   - Provide comments explaining citation context
   - Defend or clarify citation choices

3. **Cited Authors**
   - Receive email notifications when their work is cited
   - Leave feedback on how their work is being referenced
   - Validate appropriate use of their research

## 🚀 Key Features

- **Intelligent Reference Validation**: AI-powered scoring system evaluates reference quality and appropriateness when new article get submited 
- **Author Feedback System**: Email notifications and feedback mechanism for cited authors
- **Citation Graph Visualization**: Interactive Cytoscape graphs showing citation lineage and networks
- **User Authentication**: Secure login system with persistent sessions
- **Profile Management**: User profiles with institutional affiliations and publication lists
- **Advanced Search**: Multi-parameter search including title, subject, keywords, and ID
- **Daily Featured Articles**: Random article discovery by subject

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **State Management**: Zustand (with persistence middleware)
- **Routing**: Next.js App Router
- **Visualization**: Cytoscape.js (citation graphs)
- **Styling**: CSS Modules + Tailwind Modules
- **HTTP Client**: Fetch API (native)
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python)
- **CORS**: FastAPI CORS Middleware
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Data Validation**: Pydantic (included with FastAPI)
- **Password Validation **: Passlib (bcrypt password hashing)
- **AI Integration**: Google Gemini API (reference quality scoring)
- **Email Service**: Resend API (citation notifications)
- **Deployment**: Render.com

## 📦 Installation

### Prerequisites
- Node.js (version specified in `package.json`)
- Python 3.8+ (version specified in `requirements.txt`)
- PostgreSQL database

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
# - DATABASE_URL
# - GEMINI_API_KEY
# - RESEND_API_KEY

# Run FastAPI server
uvicorn main:app --reload
```
### Frontend and Backend Deployment 

The Frontend Webpage  will be available at `https://capstone-reference-check-67ra.vercel.app/`

The backend API will be available at `https://capstone-reference-check.onrender.com/`

### Backend Documents and 🌐 API Endpoints
https://capstone-reference-check.onrender.com/docs

## 📁 Project Structure

```
CAPSTONE_REFERENCE_CHECK/
│
├── front_end/my-app/
│   ├── .next/                        # Next.js build output
│   ├── app/
│   │   ├── articles/
│   │   │   ├── [id]/                 # Article view page
│   │   │   ├── new/                  # Article submission form
│   │   │   └── search_result/        # Search results page
│   │   ├── store/
│   │   │   └── userStore.ts          # User auth & global state
│   │   ├── user/
│   │   │   ├── [id]/                 # User profile pages (any user)
│   │   │   ├── myprofile/            # Edit own profile
│   │   │   ├── new/                  # User registration
│   │   │   ├── page.tsx              # User section root page
│   │   │   ├── frontpage.css         # Styling
│   │   │   └── globals.css           # Global styles
│   │   ├── layout.css                # App layout styles
│   │   ├── layout.tsx                # Root layout component
│   │   └── page.tsx                  # Homepage
│   ├── components/
│   │   ├── sidebar/                  # Sidebar components
│   │   ├── Header.module.css         # Header styles
│   │   ├── header.tsx                # Header component
│   │   ├── Reference_list.tsx        # Reference display with AI scores
│   │   └── ReferenceList.module.css  # Reference list styles
│   ├── node_modules/                 # NPM dependencies (not tracked)
│   ├── public/                       # Static assets
│   ├── .gitignore                    # Git ignore rules
│   ├── eslint.config.mjs             # ESLint configuration
│   ├── next-env.d.ts                 # Next.js TypeScript declarations
│   ├── next.config.ts                # Next.js configuration
│   └── package-lock.json             # NPM dependency lock file
│
└── back_end/
    ├── alembic/                      # Database migrations
    ├── app/
    │   ├── __pycache__/              # Python cache (ignored)
    │   ├── migrations/               # Database migration scripts
    │   ├── models/
    │   │   ├── __pycache__/          # Python cache (ignored)
    │   │   ├── __init__.py
    │   │   ├── article.py            # Article database model
    │   │   ├── author_article.py     # Author-Article relationship model
    │   │   ├── author.py             # Author database model
    │   │   └── reference.py          # Reference database model
    │   ├── routes/
    │   │   ├── __pycache__/          # Python cache (ignored)
    │   │   ├── __init__.py
    │   │   ├── article_routes.py     # Article API endpoints
    │   │   ├── author_routes.py      # Author API endpoints
    │   │   ├── client_routes.py      # Client/auth API endpoints
    │   │   └── reference_routes.py   # Reference API endpoints
    │   ├── seeds/
    │   │   ├── __pycache__/          # Python cache (ignored)
    │   │   ├── __init__.py
    │   │   ├── clear.py              # Database clearing script
    │   │   ├── larger_seed_data.py   # Large dataset seeding
    │   │   └── seed_data.py          # Basic seed data
    │   └── __init__.py
    ├── .env                          # Environment variables (not tracked)
    ├── ai_score.py                   # Gemini AI scoring logic
    ├── alembic.ini                   # Alembic configuration
    ├── database.py                   # Database connection setup
    ├── main.py                       # FastAPI application entry point
    ├── schema.py                     # Pydantic schemas/validation
    └── security.py                   # Authentication & security
```

## 🔐 Authentication

The application uses a session-based authentication system:
- User credentials are validated against the PostgreSQL database
- Successful login returns complete user profile
- User data is stored in Zustand and persisted to localStorage
- Sessions persist across page refreshes
- Logout clears both Zustand store and localStorage

## 🤖 AI Integration

Reference quality is evaluated using the Google Gemini API:
- Analyzes citation context and appropriateness
- Generates quality scores for each reference
- Provides insights on citation usage
- Helps readers assess reference reliability

## 📧 Email Notifications

Using the Resend API, the system automatically:
- Notifies authors when their work is cited
- Includes direct links to view citation context
- Facilitates timely feedback on reference usage

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Clear feedback during data fetching
- **Error Handling**: User-friendly error messages with recovery options
- **Conditional Rendering**: UI adapts based on user role and authentication state
- **Smart Caching**: Optimized data fetching (e.g., using cached data for own profile)

## 🔄 State Management

### Global State (Zustand)
- User authentication state
- User profile data (including articles list)
- Persisted to localStorage for session continuity

### Local State (React useState)
- Form inputs (login, article submission)
- Loading and error states
- Component-specific UI state



## 🚧 Future Enhancements

- Real-time notifications for citation alerts
- Advanced analytics on citation patterns
- Collaborative peer review features
- Export functionality for references (BibTeX, RIS)
- Integration with academic databases (PubMed, arXiv)

## 📄 License

Toy project, personal project 

## 👥 Contributors

None



---

**Note**: This project was developed as a capstone project to demonstrate full-stack web development skills including React, TypeScript, Next.js, FastAPI, PostgreSQL, and third-party API integration.
