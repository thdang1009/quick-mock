// In-memory storage for temporary endpoints
const mockEndpoints = new Map();

// TTL for temporary endpoints (15 minutes by default)
const DEFAULT_TTL = 15 * 60 * 1000;

// Mock server base URL
const MOCK_SERVER_BASE = "https://dangtrinh.site/mock";

// Generate unique ID for endpoints
const generateEndpointId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

// Handle API requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "createMockEndpoint") {
    const { jsonResponse, method, statusCode, delay, headers, expiresIn } = request;
    
    try {
      // Validate JSON
      JSON.parse(jsonResponse);
      
      // Create endpoint
      const endpointId = generateEndpointId();
      const endpoint = {
        id: endpointId,
        jsonResponse,
        method: method || "GET",
        statusCode: statusCode || 200,
        delay: delay || 0,
        headers: headers || { "Content-Type": "application/json" },
        createdAt: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : Date.now() + DEFAULT_TTL,
      };
      
      // Store in memory
      mockEndpoints.set(endpointId, endpoint);
      
      // Schedule cleanup
      setTimeout(() => {
        mockEndpoints.delete(endpointId);
      }, endpoint.expiresAt - endpoint.createdAt);
      
      // Generate URL
      const mockUrl = `${MOCK_SERVER_BASE}/mock/${endpointId}`;
      
      sendResponse({
        success: true,
        endpoint: mockUrl,
        details: endpoint
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: "Invalid JSON provided"
      });
    }
    
    return true; // Required for async response
  }
  
  if (request.action === "saveMockProject") {
    const { project } = request;
    
    chrome.storage.sync.get(["mockProjects"], (result) => {
      const mockProjects = result.mockProjects || [];
      const existingIndex = mockProjects.findIndex(p => p.id === project.id);
      
      if (existingIndex >= 0) {
        mockProjects[existingIndex] = project;
      } else {
        mockProjects.push({
          ...project,
          id: project.id || generateEndpointId(),
          createdAt: Date.now()
        });
      }
      
      chrome.storage.sync.set({ mockProjects }, () => {
        sendResponse({ success: true, projects: mockProjects });
      });
    });
    
    return true; // Required for async response
  }
  
  if (request.action === "getMockProjects") {
    chrome.storage.sync.get(["mockProjects"], (result) => {
      sendResponse({ projects: result.mockProjects || [] });
    });
    
    return true; // Required for async response
  }
  
  if (request.action === "deleteMockProject") {
    const { projectId } = request;
    
    chrome.storage.sync.get(["mockProjects"], (result) => {
      const mockProjects = result.mockProjects || [];
      const updatedProjects = mockProjects.filter(p => p.id !== projectId);
      
      chrome.storage.sync.set({ mockProjects: updatedProjects }, () => {
        sendResponse({ success: true, projects: updatedProjects });
      });
    });
    
    return true; // Required for async response
  }
});

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("QuickMock extension installed");
}); 