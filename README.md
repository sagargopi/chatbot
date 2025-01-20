# Intelligent Chatbot Application

A full-stack chatbot application built with React, Node.js, Express, and MySQL. The chatbot uses a rule-based system to provide intelligent responses about programming, databases, web development, and AI.

## Features

- Multiple chat sessions support
- Real-time message handling
- Context-aware responses
- Topic-based conversations
- Clean and modern UI
- MySQL database integration

## Tech Stack

### Frontend
- React
- CSS for styling
- Fetch API for communication

### Backend
- Node.js
- Express.js
- MySQL
- CORS for cross-origin requests

## Setup Instructions

1. Clone the repository
```bash
git clone [your-repo-url]
cd chatbot-app
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up MySQL database
```sql
# Run the schema.sql file in your MySQL server
source schema.sql
```

4. Start the application
```bash
# Start backend server (from backend directory)
npm start

# Start frontend development server (from frontend directory)
npm start
```

## Database Schema

The application uses two main tables:
- `chats`: Stores chat sessions
- `messages`: Stores all messages with their chat associations

## Features

- Create new chat sessions
- Switch between different chats
- Intelligent responses based on context
- Support for various topics including:
  - Programming
  - Databases
  - Web Development
  - Artificial Intelligence

## Contributing

Feel free to fork the repository and submit pull requests for any improvements.
