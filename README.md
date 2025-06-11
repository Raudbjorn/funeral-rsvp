# Memorial Service RSVP & Carpool App

A simple, secure web application for organizing RSVPs, carpool coordination, and photo sharing for a memorial service.

## Features

- **RSVP System**: Guest count tracking with optional messages
- **Carpool Coordination**: Driver registration and passenger matching
- **Photo Album**: Share memories with upload functionality
- **Security**: Rate limiting, spam detection, and geographic restrictions
- **Google Maps Integration**: Route visualization for carpools

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Google Maps API** (optional):
   - Copy `.env.example` to `.env.local`
   - Get an API key from [Google Maps Platform](https://developers.google.com/maps/documentation/javascript/get-api-key)
   - Add your API key to `.env.local`

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## Deployment

### 🐳 Production Deployment (Recommended)

For a secure, production-ready deployment with SSL, security, and monitoring:

```bash
# Quick setup with Docker Compose
./scripts/setup.sh
```

This includes:
- **Nginx** reverse proxy with SSL termination
- **CrowdSec** intrusion detection and prevention  
- **Certbot** automatic SSL certificates (Porkbun DNS-01)
- **Redis** for distributed rate limiting
- **Automated backups** and monitoring

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### ☁️ Simple Deployment

For development or simple hosting:

- **Vercel** (recommended): `npx vercel`
- **Netlify**: Build command: `npm run build`, Publish directory: `out`
- **Other hosts**: Run `npm run build` and serve the `.next` folder

## Security Features

- Rate limiting (3 RSVPs, 5 carpool entries, 10 photos per time period)
- Spam detection for text content
- File type and size validation for photos
- Geographic rate limiting for non-Iceland IPs
- Input validation and sanitization

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `rsvps.json` - RSVP responses
- `drivers.json` - Driver registrations
- `passengers.json` - Passenger requests
- `photos.json` - Photo metadata

Photos are stored in `public/uploads/`

## API Endpoints

- `GET/POST /api/rsvp` - RSVP management
- `GET /api/carpool` - Get carpool data
- `POST /api/carpool/driver` - Register as driver
- `POST /api/carpool/passenger` - Request ride
- `GET/POST /api/photos` - Photo management
- `GET /api/photos/[filename]` - Serve photos

## License

This project is intended for temporary use for memorial services. Feel free to modify as needed.