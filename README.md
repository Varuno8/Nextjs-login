
# VitalCarePlatform Healthcare Platform

A comprehensive healthcare AI service marketplace where users can discover, subscribe to, and access specialized healthcare AI models. Built with React.js frontend and Django REST framework backend.

## Project Structure

This project consists of two main parts:
1. Django Backend (REST API)
2. React Frontend

## Setup Django Backend

### Prerequisites
- Python 3.9+
- pip (Python package manager)
- Django 4.2+

### Installation

1. Create and activate a virtual environment:
```bash
python -m venv env
# On Windows
env\Scripts\activate
# On macOS/Linux
source env/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

4. Create a superuser:
```bash
python manage.py createsuperuser
```

5. Start the development server:
```bash
python manage.py runserver
```

The Django API will be available at http://localhost:8000/api/

### API Endpoints

- Authentication: 
  - `/api/auth/token/` (POST) - Get JWT tokens
  - `/api/auth/token/refresh/` (POST) - Refresh JWT token
  - `/api/auth/google/` (POST) - Google OAuth login

- User Management:
  - `/api/users/` - User CRUD operations
  - `/api/users/me/` - Current user details

- Services:
  - `/api/services/` - Service listing and details

- Subscriptions:
  - `/api/subscriptions/` - User subscriptions management
  - `/api/subscriptions/:id/cancel/` - Cancel subscription

- Feature Requests:
  - `/api/feature-requests/` - Manage feature requests

- Admin Endpoints:
  - `/api/admin/users/` - Admin user management
  - `/api/admin/services/` - Admin service management
  - `/api/admin/subscriptions/` - Admin subscription management
  - `/api/admin/feature-requests/` - Admin feature request management

## Setup React Frontend

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The React app will be available at http://localhost:5173/

### Key Features

- User Authentication (Email/Password and Google OAuth)
- Service Discovery and Management
- Subscription Management
- Admin Dashboard with Analytics
- Feature Request System
- User Profile Management

## Environment Setup

Create a `.env` file in the root directory of the Django project with the following variables:

```
DEBUG=True
SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
```

For the React frontend, you may need to create a `.env` file with:

```
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Deployment

For production deployment:

1. Set `DEBUG=False` in Django settings
2. Configure proper database settings for production
3. Set up proper CORS settings
4. Use a production-ready server (e.g., Gunicorn)
5. Configure a web server (Nginx, Apache) to serve static files

## License

[MIT License](LICENSE)
