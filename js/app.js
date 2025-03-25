/**
 * Insurance Fraud Detection Web App
 * Frontend JavaScript for interacting with the API
 */

// Global constants
const API_BASE_URL = "https://your-api-domain.com/api"; 
/* 
 * DEPLOYMENT NOTE: Update this URL before deploying to GitHub Pages
 * For local development: "http://localhost:5000/api"
 * For production with your API: replace with your actual API URL 
 */

// DOM Elements
const claimForm = document.getElementById('claim-form');
const resultsSection = document.getElementById('results');
const formSection = document.getElementById('form');
const analyzeNewBtn = document.getElementById('analyze-new');
const exportResultBtn = document.getElementById('export-result');
const predictionBadge = document.getElementById('prediction-badge');
const probabilityBar = document.getElementById('probability-bar');
const probabilityValue = document.getElementById('probability-value');
const riskFactorsList = document.getElementById('risk-factors');
const totalClaimValue = document.getElementById('total-claim');
const severityValue = document.getElementById('severity');
const witnessCountValue = document.getElementById('witness-count');

// Global variables for storing last prediction
let lastPredictionResult = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initApp();
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            mirror: false
        });
    }

    // Check if images are loaded properly and provide fallbacks
    document.querySelectorAll('img').forEach(img => {
        img.onerror = function() {
            console.warn(`Failed to load image: ${this.src}`);
            // Fallback for the hero image
            if (this.src.includes('machine-learning-4102851_1280.png')) {
                this.src = 'https://via.placeholder.com/800x600/4361ee/ffffff?text=AI+Powered+Analysis';
                console.log("Applied fallback for hero image");
            }
        };
    });

    // Load Font Awesome stylesheet if not loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
        console.log("Font Awesome was not loaded, adding it dynamically");
    }

    // Mobile navigation toggle
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
            navbarToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!navbarToggle.contains(e.target) && !navbarMenu.contains(e.target) && navbarMenu.classList.contains('active')) {
                navbarMenu.classList.remove('active');
                navbarToggle.classList.remove('active');
            }
        });
        
        // Close mobile menu when clicking on a menu item
        document.querySelectorAll('.navbar-menu a').forEach(item => {
            item.addEventListener('click', () => {
                if (navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    navbarToggle.classList.remove('active');
                }
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navbarMenu && navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    navbarToggle.classList.remove('active');
                }
            }
        });
    });

    // Form submission
    const form = document.getElementById('claim-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const resultsElement = document.getElementById('results');
    const errorTextElement = document.getElementById('error-text');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Form validation
            const inputs = form.querySelectorAll('input, select');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value) {
                    isValid = false;
                    input.classList.add('invalid');
                } else {
                    input.classList.remove('invalid');
                }
            });
            
            if (!isValid) {
                showError('Please fill out all required fields.');
                return;
            }
            
            showLoading('Analyzing claim data...');
            hideError();
            
            // Clear previous results
            hideResults();
            
            // Get all form data
            const formData = new FormData(form);
            let data = {};
            
            // Convert form data to object, handling numeric fields
            formData.forEach((value, key) => {
                data[key] = numericFields.includes(key) ? Number(value) : value;
            });
            
            // Store form data for use if API response is incomplete
            window.lastFormData = data;
            
            try {
                console.log("Submitting data:", data);
                
                // Make API request
                const response = await fetch(`${API_BASE_URL}/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }
                
                let result = await response.json();
                console.log("API Response:", result);
                
                // Check if the result is wrapped in a 'data' field (common in some API responses)
                if (result.data) {
                    result = result.data;
                }
                
                // If result indicates failure, throw error
                if (result.status === 'failure') {
                    throw new Error(result.message || 'API returned failure status');
                }
                
                // Add the form data to the result for complete information
                result.formData = data;
                
                // Display the prediction results
                displayResults(result);
                
                // Scroll to results
                const resultsSection = document.getElementById('results');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth' });
                }
                
            } catch (error) {
                console.error('Prediction error:', error);
                showError(`Failed to get prediction: ${error.message}`);
            } finally {
                hideLoading();
            }
        });
    }
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const nextBtns = document.querySelectorAll('.next-tab');
    const prevBtns = document.querySelectorAll('.prev-tab');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextTabId = btn.getAttribute('data-next');
            switchTab(nextTabId);
        });
    });
    
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prevTabId = btn.getAttribute('data-prev');
            switchTab(prevTabId);
        });
    });

    // Helper functions
    function switchTab(tabId) {
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        if (!tabContents.length || !tabButtons.length) return;
        
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabId}-content`);
        const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
        
        if (targetContent) targetContent.classList.add('active');
        if (targetButton) targetButton.classList.add('active');
    }
    
    function showLoading() {
        const submitBtn = document.getElementById('submit-btn');
        const loadingElement = document.getElementById('loading');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Analyzing...';
        }
        
        if (loadingElement) loadingElement.style.display = 'flex';
    }
    
    function hideLoading() {
        const submitBtn = document.getElementById('submit-btn');
        const loadingElement = document.getElementById('loading');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Analyze Claim';
        }
        
        if (loadingElement) loadingElement.style.display = 'none';
    }
    
    function showError(message) {
        const errorElement = document.getElementById('error');
        const errorTextElement = document.getElementById('error-text');
        
        if (errorElement) errorElement.style.display = 'block';
        if (errorTextElement) errorTextElement.textContent = message;
    }
    
    function hideError() {
        const errorElement = document.getElementById('error');
        if (errorElement) errorElement.style.display = 'none';
    }
    
    function hideResults() {
        const resultsElement = document.getElementById('results');
        if (resultsElement) resultsElement.style.display = 'none';
    }
    
    function displayResults(result) {
        const resultsElement = document.getElementById('results');
        if (!resultsElement) return;
        
        resultsElement.style.display = 'block';
        
        console.log("Processing result:", result);
        
        // Get the form data from the stored data or empty object if not available
        const formData = result.formData || window.lastFormData || {};
        
        // Extract data from the API response - handle different API response formats
        let apiData = {};
        
        // If the API returns data in result.summary format (FastAPI structure)
        if (result.summary) {
            apiData = {
                ...result,
                incident_type: result.summary?.incident_type || result.incident_type,
                incident_severity: result.summary?.severity || result.incident_severity,
                vehicles_involved: result.summary?.vehicles_involved || result.vehicles_involved,
                witnesses: result.summary?.witnesses || result.witnesses
            };
        // If the API returns data with prediction field (simple model structure)
        } else if (result.prediction) {
            apiData = {
                ...result,
                // If specific fields are missing in API response, use the form data
                fraud_probability: result.probability || result.fraud_probability,
                incident_type: result.incident_type || formData.incident_type,
                incident_severity: result.incident_severity || formData.incident_severity,
                witnesses: result.witnesses || formData.witnesses,
                vehicles_involved: result.vehicles_involved || formData.vehicles_involved,
                police_report: result.police_report || formData.police_report,
                property_damage: result.property_damage || formData.property_damage,
                bodily_injuries: result.bodily_injuries || formData.bodily_injuries,
                injury_claim: result.injury_claim || formData.injury_claim,
                property_claim: result.property_claim || formData.property_claim,
                vehicle_claim: result.vehicle_claim || formData.vehicle_claim
            };
        // As a fallback, just use the raw data
        } else {
            apiData = result;
        }
        
        // Handle different probability fields
        let fraudProbability = 0;
        if (typeof result.probability === 'number') {
            // Handle probability as 0-100 value
            fraudProbability = result.probability / 100;
        } else if (typeof result.fraud_probability === 'number') {
            // Handle probability as 0-1 value
            fraudProbability = result.fraud_probability;
        } else if (typeof result.probability === 'string') {
            // Handle probability as string that needs conversion
            fraudProbability = parseFloat(result.probability) / 100;
        } else if (result.prediction === 'Fraudulent') {
            // If only prediction is available, set a default high/low value
            fraudProbability = 0.85;
        } else if (result.prediction === 'Not Fraudulent') {
            fraudProbability = 0.15;
        }
        
        // Validate probability and ensure it's in the 0-1 range
        if (isNaN(fraudProbability) || fraudProbability < 0) {
            fraudProbability = 0;
        } else if (fraudProbability > 1) {
            fraudProbability = fraudProbability > 100 ? fraudProbability / 100 : fraudProbability;
        }
        
        // Merge API response with form data, prioritizing API data
        const data = {
            ...formData,
            ...apiData,
            // Ensure essential fields have values from form data if API didn't provide them
            incident_type: apiData.incident_type || formData.incident_type || 'Not Specified',
            incident_severity: apiData.incident_severity || formData.incident_severity || 'Not Specified',
            injury_claim: apiData.injury_claim !== undefined ? apiData.injury_claim : formData.injury_claim || 0,
            property_claim: apiData.property_claim !== undefined ? apiData.property_claim : formData.property_claim || 0,
            vehicle_claim: apiData.vehicle_claim !== undefined ? apiData.vehicle_claim : formData.vehicle_claim || 0,
            witnesses: apiData.witnesses !== undefined ? apiData.witnesses : formData.witnesses || 0,
            vehicles_involved: apiData.vehicles_involved !== undefined ? apiData.vehicles_involved : formData.vehicles_involved || 1,
            police_report: apiData.police_report || formData.police_report || 'NO',
            property_damage: apiData.property_damage || formData.property_damage || 'NO',
            bodily_injuries: apiData.bodily_injuries !== undefined ? apiData.bodily_injuries : formData.bodily_injuries || 0
        };
        
        const isFraudulent = fraudProbability > 0.5;
        const riskLevel = getRiskLevel(fraudProbability);
        
        // Generate risk factors based on prediction
        const riskFactors = generateRiskFactors(data, isFraudulent);
        
        // Total claim amount - make sure we have numbers
        const totalClaim = (Number(data.injury_claim) || 0) + 
                          (Number(data.property_claim) || 0) + 
                          (Number(data.vehicle_claim) || 0);
        
        // Create results HTML
        const resultsHTML = `
            <div class="results-header ${isFraudulent ? 'fraudulent' : 'legitimate'}">
                <div class="result-icon">
                    <i class="fas ${isFraudulent ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                </div>
                <div class="result-summary">
                    <h3>Prediction: ${isFraudulent ? 'Potentially Fraudulent' : 'Likely Legitimate'}</h3>
                    <div class="result-details">
                        <div class="probability-meter">
                            <div class="probability-fill" style="width: ${fraudProbability * 100}%"></div>
                        </div>
                        <p>Fraud Probability: <strong>${(fraudProbability * 100).toFixed(1)}%</strong></p>
                        <span class="risk-badge ${riskLevel.toLowerCase()}">${riskLevel} Risk</span>
                    </div>
                </div>
            </div>
            
            <div class="results-grid">
                <div class="result-card">
                    <div class="card-header">
                        <i class="fas fa-exclamation-circle"></i>
                        <h4>Risk Factors</h4>
                    </div>
                    <div class="card-body">
                        <ul class="risk-factors-list">
                            ${riskFactors.map(factor => `
                                <li>
                                    <i class="fas fa-angle-right"></i>
                                    <span>${factor}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="result-card">
                    <div class="card-header">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <h4>Claim Summary</h4>
                    </div>
                    <div class="card-body">
                        <div class="summary-item">
                            <span>Incident Type:</span>
                            <strong>${data.incident_type}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Incident Severity:</span>
                            <strong>${data.incident_severity}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Total Claim Amount:</span>
                            <strong>$${totalClaim.toLocaleString()}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Vehicles Involved:</span>
                            <strong>${data.vehicles_involved}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Witnesses:</span>
                            <strong>${data.witnesses || 'None'}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Police Report:</span>
                            <strong>${data.police_report === 'YES' ? 'Filed' : 'Not Filed'}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="results-actions">
                <button id="reset-btn" class="btn btn-outline">
                    <i class="fas fa-redo"></i> Reset Form
                </button>
            </div>
        `;
        
        resultsElement.innerHTML = resultsHTML;
        
        // Add reset event listener
        const resetBtn = document.getElementById('reset-btn');
        const form = document.getElementById('claim-form');
        
        if (resetBtn && form) {
            resetBtn.addEventListener('click', () => {
                form.reset();
                hideResults();
                const analyzeSection = document.getElementById('analyze');
                if (analyzeSection) {
                    analyzeSection.scrollIntoView({ behavior: 'smooth' });
                }
                switchTab('claim-details');
            });
        }
    }
    
    function getRiskLevel(probability) {
        if (isNaN(probability) || probability < 0.3) return 'Low';
        if (probability < 0.7) return 'Medium';
        return 'High';
    }
    
    function generateRiskFactors(data, isFraudulent) {
        const factors = [];
        
        // Safety check
        if (!data) return ['No risk factors available'];
        
        try {
            // Convert potentially string numeric values to numbers for comparison
            const numericData = {
                ...data,
                injury_claim: Number(data.injury_claim) || 0,
                property_claim: Number(data.property_claim) || 0,
                vehicle_claim: Number(data.vehicle_claim) || 0,
                witnesses: Number(data.witnesses) || 0,
                incident_hour: Number(data.incident_hour) || 0,
                vehicles_involved: Number(data.vehicles_involved) || 1,
                bodily_injuries: Number(data.bodily_injuries) || 0,
                months_as_customer: Number(data.months_as_customer) || 0
            };
            
            // If our API has provided predefined risk factors, use those
            if (data.risk_factors && typeof data.risk_factors === 'object') {
                for (const [factor, value] of Object.entries(data.risk_factors)) {
                    if (value === true) {
                        // Convert snake_case to readable text
                        const readableFactor = factor
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, c => c.toUpperCase());
                        factors.push(readableFactor);
                    }
                }
                
                // If we found predefined factors, return them
                if (factors.length > 0) {
                    return factors;
                }
            }
            
            if (isFraudulent) {
                // High risk factors for fraudulent claims
                if (data.police_report === 'NO') {
                    factors.push('No police report filed for a major incident');
                }
                
                if (numericData.witnesses === 0) {
                    factors.push('No witnesses present during the incident');
                }
                
                const totalClaim = numericData.injury_claim + numericData.property_claim + numericData.vehicle_claim;
                if (totalClaim > 30000) {
                    factors.push('Unusually high total claim amount ($' + totalClaim.toLocaleString() + ')');
                }
                
                if (numericData.incident_hour >= 22 || numericData.incident_hour <= 4) {
                    factors.push('Incident occurred during late night hours');
                }
                
                if (numericData.bodily_injuries >= 2) {
                    factors.push('Multiple bodily injuries reported');
                }
                
                if (data.incident_severity === 'Minor Damage' && numericData.vehicle_claim > 10000) {
                    factors.push('Vehicle claim amount unusually high for minor damage');
                }
            } else {
                // Low risk positive factors
                if (data.police_report === 'YES') {
                    factors.push('Police report properly filed');
                }
                
                if (numericData.witnesses >= 2) {
                    factors.push('Multiple witnesses present');
                }
                
                if (data.incident_type && numericData.vehicles_involved > 1 && 
                    data.incident_type.includes && data.incident_type.includes('Collision')) {
                    factors.push('Consistent vehicle involvement with reported incident type');
                }
                
                if (numericData.months_as_customer > 60) {
                    factors.push('Long-term customer with good history');
                }
                
                if (data.incident_severity === 'Major Damage' && numericData.vehicle_claim > 15000) {
                    factors.push('Vehicle claim amount consistent with major damage');
                }
            }
            
            // Add general observations regardless of fraud prediction
            if (data.property_damage === 'YES' && numericData.property_claim <= 1000) {
                factors.push('Property damage claim amount is reasonable');
            }
            
            if (numericData.injury_claim > 15000) {
                factors.push('Injury claim amount is above average');
            }
            
            if (data.incident_severity === 'Major Damage' && numericData.vehicle_claim < 10000) {
                factors.push('Vehicle claim amount lower than expected for reported damage');
            }
            
            if (data.incident_severity === 'Minor Damage' && numericData.vehicle_claim > 10000) {
                factors.push('Vehicle claim amount higher than expected for reported damage');
            }
        } catch (error) {
            console.error('Error generating risk factors:', error);
            return ['Error analyzing risk factors'];
        }
        
        return factors.length > 0 ? factors : ['No specific risk factors identified'];
    }
    
    // List of fields that need to be converted from string to number
    const numericFields = [
        'months_as_customer', 
        'policy_deductable', 
        'umbrella_limit', 
        'capital-gains', 
        'capital-loss',
        'incident_hour',
        'vehicles_involved',
        'bodily_injuries',
        'witnesses',
        'injury_claim',
        'property_claim',
        'vehicle_claim'
    ];

    // Add window scroll event for navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Ensure the hero wave doesn't obstruct content
    function adjustHeroWave() {
        const heroWave = document.querySelector('.hero-wave');
        const heroSection = document.querySelector('.hero');
        
        if (heroWave && heroSection) {
            // Make sure the wave sits at the bottom of the hero section
            const heroHeight = heroSection.offsetHeight;
            
            // On smaller screens, reduce the height of the wave
            if (window.innerWidth < 768) {
                heroWave.style.height = '60px';
                heroWave.style.opacity = '0.6';
            } else {
                heroWave.style.height = 'auto';
                heroWave.style.opacity = '0.8';
            }
        }
    }
    
    // Run on page load and window resize
    window.addEventListener('load', adjustHeroWave);
    window.addEventListener('resize', adjustHeroWave);
});

/**
 * Initialize the application
 */
function initApp() {
    // Load field options and info from API
    fetch(`${API_BASE_URL}/field-info`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Could use this to dynamically populate form fields if needed
                console.log('Field info loaded successfully');
            }
        })
        .catch(error => {
            console.error('Error loading field info:', error);
            showAPIError('Failed to load field information. Please refresh the page.');
        });
        
    // Check API health
    fetch(`${API_BASE_URL}/health`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`API Status: ${data.status}`);
            if (data.status !== 'healthy') {
                showAPIError(data.message);
            }
        })
        .catch(() => {
            showAPIError('Cannot connect to the API. Please try again later.');
        });
}

/**
 * Show API connection error
 * @param {String} message - The error message to display
 */
function showAPIError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error';
    errorDiv.innerHTML = `
        <div class="error-container">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    // Insert after header
    const header = document.querySelector('header');
    header.parentNode.insertBefore(errorDiv, header.nextSibling);
}