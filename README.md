# EventMe Backend

This is the backend for **EventMe**, a web app that helps users discover, join, and manage events.

## Features

- **Authentication**
  - Uses Firebase to verify users
  - Every protected route requires a valid ID token
  - After token verification, the server retrieves the user’s ID and role from the database

- **Events**
  - Users can browse all events or get details of a specific one
  - Staff and admin users can create and delete events
  - Users can join and leave events
  - Member lists are tracked for each event

- **User Roles**
  - Each user has a status: `active`, `staff`, or `admin`
  - Staff/admin users can remove others from events
  - Only admins can remove another admin

- **Membership Handling**
  - Stores which users are attending which events
  - Prevents duplicate signups
  - Users can leave events, or be removed by staff/admins

## API Endpoints

All endpoints are prefixed with `/api` and require a `Bearer` token in the `Authorization` header.

| Method | Endpoint                              | Description                                 |
|--------|----------------------------------------|---------------------------------------------|
| GET    | `/events`                              | Get all events                               |
| GET    | `/events/:event_id`                    | Get details for a specific event             |
| POST   | `/events`                              | Create a new event (staff/admin only)        |
| DELETE | `/events/:event_id`                    | Delete an event (staff/admin only)           |
| GET    | `/events/:event_id/members`            | Get attendees of an event                    |
| POST   | `/events/:event_id/members`            | Join an event                                |
| DELETE | `/events/:event_id/members/:user_id`   | Leave or remove a user from an event         |
| GET    | `/events/user/:user_id`                | Get all events a user is signed up for       |

## Tech Stack

- **Node.js** with **Express**
- **PostgreSQL** for data storage
- **Firebase** for authentication
- Hosted on **Render**

**https://eventme-backend.onrender.com/api**
