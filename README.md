# QuickMock - Instant API Response Generator

A Chrome Extension for generating mock REST API endpoints instantly. Perfect for frontend development, testing, and prototyping when backend APIs are not ready.

## Features

- **Create Mock Endpoints Instantly**: Paste any JSON, select a method (GET, POST, PUT, DELETE), and get a unique URL that returns that response. The endpoint is created via API call to our backend service.
- **Custom Response Options**: Set status codes, response delays, headers, and simulate network errors.
- **Grouped Endpoints & Projects**: Create collections of mock endpoints for different projects.
- **Shareable & Testable URLs**: Each mock API has a public URL with code examples.
- **Save and Reuse**: Sign in to save endpoints long-term and easily duplicate/edit old mocks.
- **Server-Side Storage**: All endpoints are stored on our server for reliability and accessibility from any device.

## Installation

### Chrome Extension Setup
1. Download this repository as a ZIP file and extract it
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" at the top right
4. Click "Load unpacked" and select the extracted folder

### Local Server Setup
1. Make sure you have Node.js installed (version 12 or higher)
2. Navigate to the `quick-mock` directory in your terminal
3. Install dependencies:
   ```
   npm install
   ```
4. Start the local server:
   ```
   npm start
   ```
5. The server will be running at `http://localhost:3030`

## Usage

1. Click on the QuickMock extension icon in your browser
2. Enter your JSON response in the text area
3. Configure response options (method, status code, delay)
4. Click "Generate Endpoint" to create a mock endpoint
5. Use the generated URL in your application or share it with teammates

## Saving to Projects

1. Generate a mock endpoint
2. Click "Save to Project"
3. Create a new project or add to an existing one
4. Access your saved projects from the "Projects" tab

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Local Server Setup

QuickMock uses a local Node.js server that runs on port 3030. To set up and run the server:

1. Navigate to the `quick-mock` directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the local server:
   ```
   npm start
   ```

The server will be available at `http://localhost:3030` and will:
- Create endpoints via POST requests to `/`
- Serve mock responses at `mock/:endpointId`
- List all endpoints at `/list`
- Delete endpoints via DELETE requests to `/:endpointId`

### API Details

The local server provides:
- Endpoint creation via POST requests
- In-memory storage of endpoint configurations
- Serving of mock responses according to defined configurations
- Automatic expiration of temporary endpoints

The API expects a JSON payload with:
- `id`: Unique identifier for the endpoint
- `jsonResponse`: The JSON response to return
- `method`: HTTP method (GET, POST, PUT, DELETE, etc.)
- `statusCode`: HTTP status code to return
- `delay`: Simulated network delay in milliseconds
- `headers`: HTTP headers to include in the response
- `expiresAt`: Timestamp when the endpoint should expire

## Acknowledgments

- Thanks to all the open-source projects that made QuickMock possible
- Inspired by the need for quick, reliable mock APIs during frontend development
