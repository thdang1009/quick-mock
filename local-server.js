/**
 * QuickMock Local Server
 * 
 * This is a simple local server implementation of the QuickMock API
 * Run with: node local-server.js
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3030; // Fixed local port

// In-memory storage for endpoints
const mockEndpoints = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Create a mock endpoint
app.post('/', (req, res) => {
    try {
        const endpoint = req.body;

        // Validate required fields
        if (!endpoint.id || !endpoint.jsonResponse) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Store endpoint
        mockEndpoints.set(endpoint.id, endpoint);

        // Set expiration cleanup
        if (endpoint.expiresAt) {
            const timeToExpire = endpoint.expiresAt - Date.now();
            if (timeToExpire > 0) {
                setTimeout(() => {
                    mockEndpoints.delete(endpoint.id);
                    console.log(`Endpoint ${endpoint.id} expired and removed`);
                }, timeToExpire);
            }
        }

        // Return success
        return res.status(201).json({
            success: true,
            id: endpoint.id,
            url: `http://localhost:3030/${endpoint.id}`
        });
    } catch (error) {
        console.error('Error creating endpoint:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error creating endpoint'
        });
    }
});

// Serve a mock endpoint
app.all('/mock/:endpointId', (req, res, next) => {
    console.log('req.params.endpointId', req.params.endpointId);
    // Skip for the list endpoint
    if (req.params.endpointId === 'list') {
        return next();
    }

    const endpointId = req.params.endpointId;
    const endpoint = mockEndpoints.get(endpointId);

    // Check if endpoint exists
    if (!endpoint) {
        return res.status(404).json({
            success: false,
            error: 'Endpoint not found or expired'
        });
    }

    // Check if method matches
    if (endpoint.method && req.method !== endpoint.method) {
        return res.status(405).json({
            success: false,
            error: `Method not allowed. Expected ${endpoint.method}`
        });
    }

    // Set response headers
    if (endpoint.headers) {
        Object.entries(endpoint.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
    }

    // Simulate delay if specified
    if (endpoint.delay && endpoint.delay > 0) {
        setTimeout(() => {
            return res.status(endpoint.statusCode || 200).send(JSON.parse(endpoint.jsonResponse));
        }, endpoint.delay);
    } else {
        return res.status(endpoint.statusCode || 200).send(JSON.parse(endpoint.jsonResponse));
    }
});

// List all endpoints (for debugging purposes)
app.get('/list', (req, res) => {
    const endpoints = Array.from(mockEndpoints.entries()).map(([id, endpoint]) => ({
        id,
        method: endpoint.method,
        statusCode: endpoint.statusCode,
        createdAt: endpoint.createdAt,
        expiresAt: endpoint.expiresAt
    }));

    return res.json({ endpoints });
});

// Delete an endpoint
app.delete('/:endpointId', (req, res) => {
    const endpointId = req.params.endpointId;

    if (mockEndpoints.has(endpointId)) {
        mockEndpoints.delete(endpointId);
        return res.json({
            success: true,
            message: 'Endpoint deleted successfully'
        });
    } else {
        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`QuickMock server running on http://localhost:${PORT}`);
    console.log(`Create endpoints by POSTing to http://localhost:${PORT}/`);
    console.log(`Access endpoints at http://localhost:${PORT}/:endpointId`);
    console.log(`View all endpoints at http://localhost:${PORT}/list`);
}); 