// Default settings
const DEFAULT_SETTINGS = {
  mockServerUrl: 'https://dangtrinh.site/mock',
  defaultTtl: '900000', // 15 minutes
  defaultStatusCode: '200',
  defaultDelay: '0',
  defaultContentType: 'application/json'
};

// DOM Elements
const optionsForm = document.getElementById('options-form');
const mockServerUrlInput = document.getElementById('mock-server-url');
const defaultTtlSelect = document.getElementById('default-ttl');
const defaultStatusCodeSelect = document.getElementById('default-status-code');
const defaultDelayInput = document.getElementById('default-delay');
const defaultContentTypeSelect = document.getElementById('default-content-type');
const resetBtn = document.getElementById('reset-btn');
const successMessage = document.getElementById('success-message');

// Load saved settings
const loadSettings = () => {
  chrome.storage.sync.get('options', (result) => {
    const options = result.options || DEFAULT_SETTINGS;
    
    mockServerUrlInput.value = options.mockServerUrl || DEFAULT_SETTINGS.mockServerUrl;
    defaultTtlSelect.value = options.defaultTtl || DEFAULT_SETTINGS.defaultTtl;
    defaultStatusCodeSelect.value = options.defaultStatusCode || DEFAULT_SETTINGS.defaultStatusCode;
    defaultDelayInput.value = options.defaultDelay || DEFAULT_SETTINGS.defaultDelay;
    defaultContentTypeSelect.value = options.defaultContentType || DEFAULT_SETTINGS.defaultContentType;
  });
};

// Save settings
const saveSettings = () => {
  const options = {
    mockServerUrl: mockServerUrlInput.value,
    defaultTtl: defaultTtlSelect.value,
    defaultStatusCode: defaultStatusCodeSelect.value,
    defaultDelay: defaultDelayInput.value,
    defaultContentType: defaultContentTypeSelect.value
  };
  
  chrome.storage.sync.set({ options }, () => {
    showSuccessMessage();
  });
};

// Reset to defaults
const resetToDefaults = () => {
  mockServerUrlInput.value = DEFAULT_SETTINGS.mockServerUrl;
  defaultTtlSelect.value = DEFAULT_SETTINGS.defaultTtl;
  defaultStatusCodeSelect.value = DEFAULT_SETTINGS.defaultStatusCode;
  defaultDelayInput.value = DEFAULT_SETTINGS.defaultDelay;
  defaultContentTypeSelect.value = DEFAULT_SETTINGS.defaultContentType;
  
  saveSettings();
};

// Show success message
const showSuccessMessage = () => {
  successMessage.style.display = 'block';
  
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
};

// Event listeners
optionsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  saveSettings();
});

resetBtn.addEventListener('click', resetToDefaults);

// Load settings when options page is opened
document.addEventListener('DOMContentLoaded', loadSettings); 