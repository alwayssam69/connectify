# Networker - Professional Networking Platform

A full-stack web application that functions like Tinder but for professional networking. Connect with professionals based on industry, skills, experience, and location.

## Features

- Secure authentication with email/password and OAuth
- Detailed user profiles with professional information
- Swipe-based matching system
- Real-time chat and messaging
- Video calls
- Advanced search and filtering
- User dashboard and profile management
- Admin panel for moderation

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Styling: Tailwind CSS
- Backend: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Real-time: Socket.IO
- State Management: Zustand
- Data Fetching: React Query

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/networker.git
cd networker
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project and get your project URL and anon key.

4. Create a `.env.local` file in the root directory and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles with professional information
- `matches`: Connections between users
- `messages`: Chat messages between matched users

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 