# DELTA EBooks - The Universal Wisdom Library

A premium digital e-book platform featuring philosophical books on relationships, resilience, stoicism, and mindful living. Built with React 19, Express.js, and SQLite.

![DELTA EBooks](https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200)

## Features

- **4 Premium E-Books** with 80+ chapters of philosophical wisdom
- **AI Companion** - Powered by Google Gemini for personalized insights
- **Multi-theme Reader** - Light, Dark, and Sepia modes
- **Reading Progress Tracking** - Track your journey through each book
- **Gamification** - Reading streaks, badges, and achievements
- **PDF Downloads** - Watermarked PDFs for offline reading
- **Payment Integration** - PayPal and Stripe support
- **Expression Space** - Personal journal for philosophical reflections
- **Journey Calendar** - Track daily emotions, milestones, and growth
- **Multi-language** - English and French support
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Google Gemini AI integration

### Backend
- Node.js with Express.js
- SQLite with better-sqlite3
- JWT authentication
- bcrypt password hashing
- PDFKit for PDF generation

### Payments
- PayPal REST API
- Stripe Payment Intents

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PayPal Business Account (for payments)
- Stripe Account (for payments)
- Google AI API Key (for Gemini)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/delta-ebooks.git
cd delta-ebooks
```

### 2. Install dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
npm run server:install
```

### 3. Configure environment variables

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Google Gemini API (for AI companion)
GEMINI_API_KEY=your_gemini_api_key_here

# PayPal Business (REST API)
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox
PAYPAL_WEBHOOK_ID=your_webhook_id_here

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# JWT Secret (use a long random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Application URLs
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 4. Seed the database (optional)

```bash
npm run seed
```

### 5. Start development servers

```bash
# Terminal 1: Start the backend server
npm run dev:server

# Terminal 2: Start the frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001

## Project Structure

```
delta-ebooks/
├── components/           # React components
│   ├── AuthView.tsx     # Login/Register
│   ├── ChatView.tsx     # AI Companion chat
│   ├── Dashboard.tsx    # User dashboard
│   ├── ExpressionSpaceView.tsx  # Journal feature
│   ├── JourneyCalendarView.tsx  # Daily tracking
│   ├── LandingView.tsx  # Landing page
│   ├── LibraryView.tsx  # Book chapters list
│   ├── PricingModal.tsx # Payment modal
│   ├── ProfileView.tsx  # User profile
│   ├── ReaderView.tsx   # Book reader
│   ├── ShelfView.tsx    # Book shelf/home
│   └── StripeCheckout.tsx
├── server/              # Backend
│   ├── db.js           # Database setup
│   ├── index.js        # Express server
│   ├── seed.js         # Database seeder
│   ├── middleware/
│   │   └── auth.js     # JWT middleware
│   ├── routes/
│   │   ├── auth.js     # Auth endpoints
│   │   ├── books.js    # Books endpoints
│   │   ├── downloads.js # PDF downloads
│   │   ├── expression.js # Expression Space
│   │   ├── journey.js  # Journey Calendar
│   │   ├── payments.js # Payment processing
│   │   └── webhooks.js # Payment webhooks
│   └── services/
│       ├── paypal.js   # PayPal integration
│       ├── pdf.js      # PDF generation
│       └── stripe.js   # Stripe integration
├── services/            # Frontend services
│   ├── api.ts          # API client
│   └── geminiService.ts # AI service
├── App.tsx             # Main React component
├── constants.tsx       # Book content
├── i18n.ts            # Translations
├── types.ts           # TypeScript types
└── vite.config.ts     # Vite configuration
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/me` | Update user profile |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get book by ID |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create PayPal order |
| POST | `/api/payments/capture-order` | Capture PayPal payment |
| POST | `/api/payments/create-stripe-payment-intent` | Create Stripe intent |
| GET | `/api/payments/history` | Get payment history |

### Downloads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/downloads/generate-token` | Generate download token |
| GET | `/api/downloads/:token` | Download PDF |
| GET | `/api/downloads/user/history` | Get download history |

### Expression Space
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expression` | Get all entries |
| POST | `/api/expression` | Create entry |
| DELETE | `/api/expression/:id` | Delete entry |

### Journey Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journey` | Get all entries |
| POST | `/api/journey` | Create/update entry |
| DELETE | `/api/journey/:date` | Delete entry |

## Database Schema

The app uses SQLite with the following main tables:

- `users` - User accounts
- `books` - Book metadata
- `chapters` - Chapter content
- `purchases` - Purchase records
- `payment_logs` - Payment audit trail
- `download_tokens` - PDF download tokens
- `download_history` - Download audit trail
- `user_progress` - Reading progress
- `expression_entries` - Journal entries
- `journey_entries` - Daily journey entries
- `email_subscribers` - Newsletter subscribers

## Production Deployment

### Build for production

```bash
# Build frontend
npm run build

# The built files will be in /dist
```

### Environment Variables for Production

Ensure these are set in production:

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret-min-32-chars>
PAYPAL_MODE=live
# ... other production credentials
```

### Running in Production

```bash
cd server
NODE_ENV=production node index.js
```

The server will serve both the API and the static frontend files from `/dist`.

## Security Considerations

1. **JWT Secret** - Use a strong, random secret (32+ characters)
2. **HTTPS** - Always use HTTPS in production
3. **Rate Limiting** - Implemented on API endpoints
4. **Input Validation** - All inputs are validated with Zod
5. **Password Hashing** - bcrypt with 12 rounds
6. **SQL Injection** - Using parameterized queries
7. **XSS Protection** - React's built-in escaping + CSP headers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@delta-ebooks.com

---

Made with love by Mohamed Oublal
