EventMe Backend
This is the backend for EventMe, a full-stack app that helps people find and join events.

What it does
Authentication

Uses Firebase for verifying users

Each request must include a valid ID token to access protected routes

After verifying a Firebase token, the server fetches the user’s ID and role from the database

Events

Users can get a list of all events

Users can view individual event details

Staff and admin users can create and delete events

Users can join or leave events

The backend tracks who is attending which event

User Roles

Users can have a status of "banned", “active”, “staff”, or “admin”

Staff and admins can remove users from events

Only admins can remove other admins

Membership Management

Keeps a record of which users are part of which events

Prevents users from joining the same event twice

Allows users to leave events, or be removed if needed

Endpoints
All endpoints are under /api and require an Authorization token in the headers.

GET /events: get all events

POST /events: create a new event (staff/admin only)

GET /events/:event_id: get details for a specific event

DELETE /events/:event_id: delete an event (staff/admin only)

GET /events/:event_id/members: get attendees of an event

POST /events/:event_id/members: join an event

DELETE /events/:event_id/members/:user_id: leave or remove someone from an event

GET /events/user/:user_id: get all events a user is signed up for

Tech stack
Node.js with Express

PostgreSQL for the database

Firebase for authentication

Hosted on Render