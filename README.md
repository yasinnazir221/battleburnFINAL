# Battle Burn FF - Tournament Platform

A modern Free Fire tournament platform built with React, TypeScript, and Supabase.

## 🚀 Features

- **User Authentication** - Secure signup/login with email and password
- **Tournament Management** - Create and manage Free Fire tournaments
- **Token System** - In-app currency for tournament entries
- **Payment Integration** - JazzCash payment verification system
- **Real-time Updates** - Live tournament and player data
- **Admin Panel** - Complete tournament and player management
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account
- JazzCash account for payments

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd battleburn-ff-tournament
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`

This will create:
- Users table with player profiles
- Tournaments table
- Payment requests table  
- Token transactions table
- Row Level Security policies
- Storage bucket for payment screenshots

### 4. Create Admin User

1. Sign up through the app with your admin email
2. Go to Supabase dashboard > Table Editor > users
3. Find your user record and change `role` from `'player'` to `'admin'`

### 5. Storage Setup

1. Go to Supabase dashboard > Storage
2. The `payment-screenshots` bucket should be created automatically
3. Verify the bucket is public and policies are set correctly

## 🚀 Running the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How It Works

### For Players:
1. **Sign Up** - Create account with username, Player ID, and Free Fire UID
2. **Buy Tokens** - Send money via JazzCash and upload payment screenshot
3. **Join Tournaments** - Use tokens to enter tournaments
4. **Get Room Details** - Receive room ID and password after joining
5. **Play & Win** - Earn tokens based on kills and placement

### For Admins:
1. **Manage Tournaments** - Create, edit, and monitor tournaments
2. **Verify Payments** - Review and approve payment screenshots
3. **Manage Players** - Add/remove tokens, view player stats
4. **Set Room Details** - Add room ID and password for tournaments
5. **Track Analytics** - Monitor platform performance

## 💰 Payment System

- **Method**: JazzCash mobile wallet
- **Process**: Manual verification by admin
- **Rate**: 1 PKR = 1 Token
- **Security**: Screenshot verification + admin approval

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- Authenticated file uploads only
- Admin-only access to sensitive operations
- Secure token transactions with audit trail

## 📱 Mobile Responsive

The platform is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 Tournament Features

- **Multiple Modes**: 1v1 and Squad tournaments
- **Flexible Rewards**: Customizable kill rewards and Booyah prizes
- **Real-time Updates**: Live participant counts and status
- **Room Management**: Automatic room detail distribution
- **Player Limits**: Configurable maximum players per tournament

## 🔧 Admin Features

- **Dashboard Overview**: Key metrics and statistics
- **Tournament Management**: Full CRUD operations
- **Player Management**: Token adjustments and player stats
- **Payment Verification**: Screenshot review and approval
- **Real-time Monitoring**: Live updates across all features

## 📊 Database Schema

### Users Table
- User authentication and profile data
- Token balance and game information
- Tournament history and statistics

### Tournaments Table  
- Tournament configuration and settings
- Participant tracking and room details
- Results and winner information

### Payment Requests Table
- Payment verification workflow
- Screenshot storage and admin review
- Transaction history and status

### Token Transactions Table
- Complete audit trail of all token movements
- Admin actions and automated transactions
- Detailed reasoning for each transaction

## 🚀 Deployment

The app can be deployed to any static hosting service:

1. **Build the project**: `npm run build`
2. **Deploy the `dist` folder** to your hosting service
3. **Set environment variables** on your hosting platform
4. **Configure Supabase** for your production domain

Popular hosting options:
- Vercel
- Netlify  
- Firebase Hosting
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ for the Free Fire gaming community**