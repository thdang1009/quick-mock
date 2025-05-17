/**
 * QuickMock Test Script
 * 
 * This script demonstrates how to interact with the local QuickMock server.
 * Run it after starting the local server with: node local-server.js
 */

const fetch = require('node-fetch');
const SERVER_URL = 'http://localhost:3030';

async function testServer() {
  console.log('Testing QuickMock local server...');
  
  // Create a mock endpoint
  console.log('\n1. Creating a mock endpoint...');
  const endpointId = 'test-' + Date.now();
  
  try {
    const createResponse = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: endpointId,
        jsonResponse: JSON.stringify({ message: 'Hello from QuickMock!' }),
        method: 'GET',
        statusCode: 200,
        delay: 0,
        headers: { 'Content-Type': 'application/json' },
        createdAt: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      })
    });
    
    const createResult = await createResponse.json();
    console.log('Endpoint created:', createResult);
    console.log(`Endpoint URL: ${createResult.url}`);
    
    // Get the list of endpoints
    console.log('\n2. Getting the list of endpoints...');
    const listResponse = await fetch(`${SERVER_URL}/list`);
    const listResult = await listResponse.json();
    console.log('Endpoints list:', listResult);
    
    // Call the mock endpoint
    console.log('\n3. Calling the mock endpoint...');
    const mockResponse = await fetch(`${SERVER_URL}/${endpointId}`);
    const mockResult = await mockResponse.json();
    console.log('Mock response:', mockResult);
    
    // Delete the endpoint
    console.log('\n4. Deleting the endpoint...');
    const deleteResponse = await fetch(`${SERVER_URL}/${endpointId}`, {
      method: 'DELETE'
    });
    const deleteResult = await deleteResponse.json();
    console.log('Delete result:', deleteResult);
    
    // Verify the endpoint was deleted
    console.log('\n5. Verifying the endpoint was deleted...');
    const verifyResponse = await fetch(`${SERVER_URL}/list`);
    const verifyResult = await verifyResponse.json();
    console.log('Updated endpoints list:', verifyResult);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the tests
testServer(); 