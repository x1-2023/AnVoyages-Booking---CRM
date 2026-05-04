# Globe Wanderer Backend

Travel Booking Management System Backend API built with NestJS, Prisma, and SQLite.

## Features

- **Authentication**: JWT-based admin authentication
- **Location Management**: CRUD operations for travel locations
- **Property Management**: Manage hotels, homestays, tours, and cruises
- **Booking System**: Complete booking flow with status management
- **Dashboard Analytics**: Revenue tracking and business insights
- **Notifications**: Telegram and Email notifications for bookings

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with Passport
- **Notifications**: Telegram Bot API, Nodemailer
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
- Database URL
- JWT secret
- SMTP settings (for email)
- Telegram bot credentials

4. Initialize the database
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

5. Start the development server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

API Documentation (Swagger) will be available at `http://localhost:3000/api/docs`

## Default Admin Credentials

- **Email**: admin@globewanderer.com
- **Password**: Admin@123456

⚠️ **IMPORTANT**: Change the default password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### Locations
- `GET /api/locations` - List all locations
- `GET /api/locations/:id` - Get location by ID
- `GET /api/locations/slug/:slug` - Get location by slug
- `POST /api/locations` - Create location (auth required)
- `PATCH /api/locations/:id` - Update location (auth required)
- `DELETE /api/locations/:id` - Delete location (auth required)

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (auth required)
- `PATCH /api/properties/:id` - Update property (auth required)
- `DELETE /api/properties/:id` - Delete property (auth required)

### Bookings
- `POST /api/bookings` - Create booking (public endpoint)
- `GET /api/bookings` - List all bookings (auth required)
- `GET /api/bookings/stats` - Get booking statistics (auth required)
- `GET /api/bookings/:id` - Get booking by ID (auth required)
- `PATCH /api/bookings/:id` - Update booking (auth required)
- `PATCH /api/bookings/:id/status` - Update booking status (auth required)
- `PATCH /api/bookings/:id/payment` - Update payment (auth required)
- `DELETE /api/bookings/:id` - Delete booking (auth required)

### Dashboard
- `GET /api/dashboard/overview` - Get overview statistics
- `GET /api/dashboard/revenue/by-location` - Revenue by location
- `GET /api/dashboard/revenue/by-property` - Revenue by property
- `GET /api/dashboard/revenue/by-month` - Monthly revenue
- `GET /api/dashboard/top-properties` - Top performing properties
- `GET /api/dashboard/recent-bookings` - Recent bookings

## Booking Status Flow

The booking system follows this status flow:

1. **pending** → User submits booking
2. **contacted** → Admin contacts customer
3. **confirmed** → Booking confirmed
4. **paid** → Payment received
5. **completed** → Service completed (counted in revenue)
6. **cancelled** → Booking cancelled (can happen at any stage)

## Revenue Calculation

- Revenue is only counted when booking status is **completed**
- Pending and cancelled bookings are excluded from revenue calculations
- Dashboard provides detailed revenue breakdowns by location, property, and time period

## Database Schema

### AdminUser
- Authentication and authorization for admin users

### Location
- Travel destinations with SEO metadata

### Property
- Hotels, homestays, tours, and cruises
- Linked to locations
- Supports images and amenities as JSON arrays

### Booking
- Customer bookings with complete journey tracking
- Status management
- Payment tracking

### SystemSetting
- Application-wide configuration

## Notifications

### Telegram Notifications
Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` in `.env` to receive:
- New booking alerts
- Status update notifications

### Email Notifications
Configure SMTP settings in `.env` to send:
- Booking confirmation emails to customers
- Status update emails

## Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema changes to database
- `npm run prisma:seed` - Seed database with sample data

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeder
├── src/
│   ├── auth/               # Authentication module
│   ├── booking/            # Booking management
│   ├── dashboard/          # Analytics and reporting
│   ├── location/           # Location management
│   ├── notification/       # Email & Telegram notifications
│   ├── prisma/             # Database service
│   ├── property/           # Property management
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── .env.example            # Environment variables template
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## Future Extensions

The system is designed to support:
- Online payment integration (Stripe, PayPal, VNPay)
- Affiliate tracking system
- Multi-language support
- Advanced analytics
- Customer portal
- Mobile app integration

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation with class-validator
- CORS configuration
- Environment-based configuration

## License

MIT License

## Support

For issues and questions, please open an issue in the repository.
