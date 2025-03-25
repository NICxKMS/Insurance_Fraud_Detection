# FraudShield Frontend

This is the frontend component of the FraudShield insurance fraud detection system. It's designed to be deployed as a static site on GitHub Pages, separate from the backend API.

## Quick Start for Development

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/fraudshield-frontend.git
   cd fraudshield-frontend
   ```

2. Start a local development server:
   ```bash
   npm run dev
   # Or directly with Python
   python -m http.server 8000
   ```

3. Open http://localhost:8000 in your browser

## Deployment to GitHub Pages

### Automatic Deployment

This repository is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

1. Update the API URL in `js/app.js`:
   ```javascript
   const API_BASE_URL = "https://your-api-domain.com/api";
   ```

2. Build the project:
   ```bash
   npm run build:prod
   ```

3. Move the built files to the repository root:
   ```bash
   mv dist/* .
   rmdir dist
   ```

4. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update for deployment"
   git push origin main
   ```

5. Enable GitHub Pages in the repository settings.

## API Connection

This frontend expects the API to be running at the URL specified in `js/app.js`. The API should provide the following endpoints:

- `/api/predict` - Submit claim data for fraud analysis
- `/api/health` - Check API health status
- `/api/field-info` - Get information about form fields

## Development

- `npm run dev` - Start a development server
- `npm run build` - Build for deployment
- `npm run build:prod` - Build for production with a specific API URL

## License

MIT © Nikhil Kumar 