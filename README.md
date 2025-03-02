## Setup Instructions

Follow these steps to set up and run the project locally:

### Prerequisites

- Node.js (recommended version: 18 or newer)
- npm or another package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/kevalshah14/Dash2025.git
   cd Dash2025
   ```

2. Install dependencies
   ```bash
   npm i
   ```

3. Create a .env file in the root directory
   Copy the contents from `.env.example` into a new .env file and add your own values:
   ```bash
   cp .env.example .env
   ```

4. Update the .env file with your credentials:
   ```
   # Authentication
   AUTH_SECRET=your-secret-here

   # OpenAI
   OPENAI_API_KEY=your-openai-api-key

   # PostgreSQL Database (used for storing chat history)
   POSTGRES_URL=postgres://user:password@host:port/database
   POSTGRES_PRISMA_URL=postgres://user:password@host:port/database?pgbouncer=true
   POSTGRES_URL_NON_POOLING=postgres://user:password@host:port/database
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

