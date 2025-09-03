# Events Temporal Features CRUD Service

A RESTful API service for managing events with temporal features using Node.js, Express, and Firebase Firestore.

## Features

- Create, read, update, and delete events
- Search events by text content
- Filter events by type and date range
- UUID-based event identification
- Firebase Firestore integration
- Input validation with Joi
- Error handling and logging
- CORS support
- Rate limiting
- Security headers with Helmet

## API Endpoints

### Base URL: `/api/events`

- `GET /` - API information and endpoints
- `POST /` - Create a new event
- `GET /:id` - Get event by ID
- `GET /user/:userId` - Get events by user ID (with pagination)
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event
- `GET /user/:userId/search?q=query` - Search events
- `GET /user/:userId/type/:eventType` - Get events by type
- `GET /user/:userId/date-range?start=date&end=date` - Get events by date range

## Schema

Events follow the `events_temporal_features` schema:

```javascript
{
  event_id: "uuid",
  user_id: "string",
  event_text: "string",
  event_type: "string",
  event_subtype: "string?",
  parsed_date: "timestamp?",
  original_date_text: "string?",
  participants: ["string"]?,
  location: "string?",
  importance_score: "number (0-1)?",
  confidence: "number (0-1)?",
  emotional_context: "string (JSON)?",
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see .env file)

3. Run the service:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Docker

Build and run with Docker:
```bash
npm run docker:build
npm run docker:run
```

## Environment Variables

- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (default: 3000)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase service account key
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
