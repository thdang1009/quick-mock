// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const mockForm = document.getElementById('mock-form');
const jsonInput = document.getElementById('json-input');
const methodSelect = document.getElementById('method-select');
const statusCodeInput = document.getElementById('status-code');
const delayInput = document.getElementById('delay');
const expirationSelect = document.getElementById('expiration');
const formatJsonBtn = document.getElementById('format-json-btn');
const resultContainer = document.getElementById('result-container');
const endpointUrlInput = document.getElementById('endpoint-url');
const copyUrlBtn = document.getElementById('copy-url-btn');
const saveToProjectBtn = document.getElementById('save-to-project-btn');
const codeExample = document.getElementById('code-example');
const copyCodeBtn = document.getElementById('copy-code-btn');
const exampleTabs = document.querySelectorAll('.example-tab');
const saveProjectModal = document.getElementById('save-project-modal');
const saveProjectForm = document.getElementById('save-project-form');
const projectSelect = document.getElementById('project-select');
const newProjectFields = document.getElementById('new-project-fields');
const newProjectName = document.getElementById('new-project-name');
const endpointPathInput = document.getElementById('endpoint-path');
const cancelSaveBtn = document.getElementById('cancel-save-btn');
const projectsContainer = document.getElementById('projects-container');
const createProjectBtn = document.getElementById('create-project-btn');
const createFirstProjectBtn = document.getElementById('create-first-project-btn');
const projectDetailView = document.getElementById('project-detail-view');
const backToProjectsBtn = document.getElementById('back-to-projects-btn');
const projectNameElement = document.getElementById('project-name');
const editProjectBtn = document.getElementById('edit-project-btn');
const endpointsList = document.getElementById('endpoints-list');

// Current state
let currentEndpoint = null;
let currentProject = null;
let projects = [];

// Tab switching
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.dataset.tab;
    
    // Update active tab button
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Show selected tab content
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });
    
    // If switching to projects tab, load projects
    if (tabId === 'projects-tab') {
      loadProjects();
    }
  });
});

// Load saved projects
const loadProjects = () => {
  chrome.runtime.sendMessage({ action: 'getMockProjects' }, (response) => {
    projects = response.projects || [];
    renderProjects();
  });
};

// Render projects list
const renderProjects = () => {
  if (projects.length === 0) {
    projectsContainer.innerHTML = `
      <div class="empty-state">
        <p>No saved projects yet</p>
        <button id="create-first-project-btn" class="primary-btn">Create Your First Project</button>
      </div>
    `;
    document.getElementById('create-first-project-btn').addEventListener('click', showNewProjectForm);
  } else {
    projectsContainer.innerHTML = '';
    projects.forEach(project => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.innerHTML = `
        <h3>${project.name}</h3>
        <div class="project-meta">
          <span>${project.endpoints ? project.endpoints.length : 0} endpoints</span>
          <span>Created ${new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      `;
      projectCard.addEventListener('click', () => showProjectDetails(project));
      projectsContainer.appendChild(projectCard);
    });
  }
};

// Show project details
const showProjectDetails = (project) => {
  currentProject = project;
  projectNameElement.textContent = project.name;
  projectsContainer.classList.add('hidden');
  projectDetailView.classList.remove('hidden');
  
  // Render endpoints
  endpointsList.innerHTML = '';
  if (project.endpoints && project.endpoints.length > 0) {
    project.endpoints.forEach(endpoint => {
      const endpointItem = document.createElement('div');
      endpointItem.className = 'endpoint-item';
      endpointItem.innerHTML = `
        <div>
          <span class="endpoint-method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
          <span class="endpoint-path">${endpoint.path || '/'}</span>
        </div>
        <div class="endpoint-actions">
          <button class="icon-btn copy-endpoint-btn" data-url="${endpoint.url}">📋</button>
          <button class="icon-btn view-endpoint-btn">👁️</button>
          <button class="icon-btn delete-endpoint-btn">🗑️</button>
        </div>
      `;
      endpointsList.appendChild(endpointItem);
      
      // Add event listeners to buttons
      endpointItem.querySelector('.copy-endpoint-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(endpoint.url);
      });
      
      endpointItem.querySelector('.view-endpoint-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        viewEndpointDetails(endpoint);
      });
      
      endpointItem.querySelector('.delete-endpoint-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteEndpoint(endpoint);
      });
    });
  } else {
    endpointsList.innerHTML = `
      <div class="empty-state">
        <p>No endpoints in this project</p>
      </div>
    `;
  }
};

// Back to projects list
backToProjectsBtn.addEventListener('click', () => {
  projectDetailView.classList.add('hidden');
  projectsContainer.classList.remove('hidden');
  currentProject = null;
});

// Format JSON button
formatJsonBtn.addEventListener('click', () => {
  try {
    const json = JSON.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(json, null, 2);
  } catch (error) {
    showError('Invalid JSON: ' + error.message);
  }
});

// Generate mock endpoint
mockForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  try {
    // Validate JSON
    JSON.parse(jsonInput.value);
    
    // Show loading state
    const generateBtn = document.getElementById('generate-btn');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = 'Creating...';
    generateBtn.disabled = true;
    
    // Create endpoint
    chrome.runtime.sendMessage({
      action: 'createMockEndpoint',
      jsonResponse: jsonInput.value,
      method: methodSelect.value,
      statusCode: parseInt(statusCodeInput.value),
      delay: parseInt(delayInput.value),
      expiresIn: parseInt(expirationSelect.value)
    }, (response) => {
      // Reset button
      generateBtn.textContent = originalText;
      generateBtn.disabled = false;
      
      if (response.success) {
        currentEndpoint = response.details;
        currentEndpoint.url = response.endpoint;
        
        // Store API response data if available
        if (response.apiResponse) {
          currentEndpoint.apiResponse = response.apiResponse;
          console.log('Backend API response:', response.apiResponse);
        }
        
        // Show result
        endpointUrlInput.value = response.endpoint;
        resultContainer.classList.remove('hidden');
        
        // Show code examples
        updateCodeExample('curl');
        
        // Show success notification
        showNotification('Endpoint created successfully on the server!');
      } else {
        showError(response.error);
      }
    });
  } catch (error) {
    showError('Invalid JSON: ' + error.message);
  }
});

// Update code examples based on selected tab
const updateCodeExample = (type) => {
  if (!currentEndpoint) return;
  
  const url = currentEndpoint.url;
  const method = currentEndpoint.method;
  
  switch (type) {
    case 'curl':
      codeExample.textContent = `curl -X ${method} "${url}"`;
      break;
    case 'fetch':
      codeExample.textContent = `fetch("${url}", {
  method: "${method}"
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));`;
      break;
    case 'axios':
      codeExample.textContent = `axios.${method.toLowerCase()}("${url}")
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`;
      break;
  }
};

// Switch between code example tabs
exampleTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    exampleTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updateCodeExample(tab.dataset.example);
  });
});

// Copy URL to clipboard
copyUrlBtn.addEventListener('click', () => {
  copyToClipboard(endpointUrlInput.value);
});

// Copy code example to clipboard
copyCodeBtn.addEventListener('click', () => {
  copyToClipboard(codeExample.textContent);
});

// Copy to clipboard helper function
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!');
  });
};

// Show notification
const showNotification = (message) => {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  // Create new notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove notification after animation completes (2 seconds)
  setTimeout(() => {
    notification.remove();
  }, 2000);
};

// Show error
const showError = (message) => {
  console.error(message);
  
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification, .error-notification');
  existingNotifications.forEach(notification => notification.remove());
  
  // Create error notification
  const notification = document.createElement('div');
  notification.className = 'notification error-notification';
  notification.textContent = message;
  notification.style.backgroundColor = 'var(--error-color)';
  document.body.appendChild(notification);
  
  // Remove notification after animation completes
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Save to project button
saveToProjectBtn.addEventListener('click', () => {
  if (!currentEndpoint) return;
  
  // Clear form
  saveProjectForm.reset();
  newProjectFields.style.display = 'block';
  
  // Load projects into select
  projectSelect.innerHTML = '<option value="new">Create New Project</option>';
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    projectSelect.appendChild(option);
  });
  
  // Show modal
  saveProjectModal.classList.remove('hidden');
});

// Project select change
projectSelect.addEventListener('change', () => {
  const isNewProject = projectSelect.value === 'new';
  newProjectFields.style.display = isNewProject ? 'block' : 'none';
});

// Cancel save button
cancelSaveBtn.addEventListener('click', () => {
  saveProjectModal.classList.add('hidden');
});

// Save project form
saveProjectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const isNewProject = projectSelect.value === 'new';
  const projectId = isNewProject ? null : projectSelect.value;
  const projectName = isNewProject ? newProjectName.value : projects.find(p => p.id === projectId)?.name;
  const endpointPath = endpointPathInput.value || '/';
  
  // Validate
  if (isNewProject && !projectName) {
    showError('Please enter a project name');
    return;
  }
  
  // Find existing project or create new one
  let project = projects.find(p => p.id === projectId);
  
  if (!project) {
    project = {
      id: null, // Will be generated by background script
      name: projectName,
      endpoints: []
    };
  }
  
  // Add endpoint to project
  project.endpoints = project.endpoints || [];
  project.endpoints.push({
    id: currentEndpoint.id,
    url: currentEndpoint.url,
    method: currentEndpoint.method,
    path: endpointPath,
    statusCode: currentEndpoint.statusCode,
    jsonResponse: currentEndpoint.jsonResponse,
  });
  
  // Save project
  chrome.runtime.sendMessage({
    action: 'saveMockProject',
    project
  }, (response) => {
    if (response.success) {
      projects = response.projects;
      saveProjectModal.classList.add('hidden');
      showNotification('Endpoint saved to project!');
      
      // Switch to projects tab
      tabButtons.forEach(btn => {
        if (btn.dataset.tab === 'projects-tab') {
          btn.click();
        }
      });
    } else {
      showError('Failed to save project');
    }
  });
});

// Create new project button
createProjectBtn.addEventListener('click', showNewProjectForm);
createFirstProjectBtn?.addEventListener('click', showNewProjectForm);

// Show new project form
function showNewProjectForm() {
  // Create a mock endpoint if we don't have one
  if (!currentEndpoint) {
    const id = 'temp-' + Math.random().toString(36).substring(2, 15) + Date.now();
    currentEndpoint = {
      id: id,
      url: 'https://dangtrinh.site/mock/' + id,
      method: 'GET',
      statusCode: 200,
      jsonResponse: '{"message": "Example endpoint"}',
    };
  }
  
  // Set "new" option in select
  projectSelect.value = 'new';
  newProjectFields.style.display = 'block';
  
  // Show modal
  saveProjectModal.classList.remove('hidden');
}

// View endpoint details
function viewEndpointDetails(endpoint) {
  // Set as current endpoint
  currentEndpoint = endpoint;
  
  // Fill form with endpoint details
  jsonInput.value = endpoint.jsonResponse;
  methodSelect.value = endpoint.method;
  statusCodeInput.value = endpoint.statusCode || 200;
  
  // Show in result
  endpointUrlInput.value = endpoint.url;
  resultContainer.classList.remove('hidden');
  
  // Show code examples
  updateCodeExample('curl');
  
  // Switch to Create tab
  tabButtons.forEach(btn => {
    if (btn.dataset.tab === 'create-tab') {
      btn.click();
    }
  });
}

// Delete endpoint
function deleteEndpoint(endpoint) {
  if (!confirm('Are you sure you want to delete this endpoint?')) return;
  
  const project = currentProject;
  project.endpoints = project.endpoints.filter(e => e.id !== endpoint.id);
  
  chrome.runtime.sendMessage({
    action: 'saveMockProject',
    project
  }, (response) => {
    if (response.success) {
      projects = response.projects;
      showProjectDetails(projects.find(p => p.id === project.id));
      showNotification('Endpoint deleted!');
    } else {
      showError('Failed to delete endpoint');
    }
  });
}

// Add some example JSON to the textarea
jsonInput.value = JSON.stringify({
  data: {
    id: 1,
    name: "Example Product",
    price: 19.99,
    inStock: true,
    tags: ["electronics", "gadgets"]
  },
  success: true,
  message: "Product retrieved successfully"
}, null, 2);