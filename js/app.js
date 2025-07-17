/**
 * Insurance Fraud Detection Web App
 * Frontend JavaScript for interacting with the API
 */

// App configuration
const config = {
    apiBaseUrl: "https://your-api-domain.com/api",
    selectors: {
        claimForm: '#claim-form',
        resultsSection: '#results',
        formSection: '#form',
        analyzeNewBtn: '#analyze-new',
        exportResultBtn: '#export-result',
        predictionBadge: '#prediction-badge',
        probabilityBar: '#probability-bar',
        probabilityValue: '#probability-value',
        riskFactorsList: '#risk-factors',
        totalClaimValue: '#total-claim',
        severityValue: '#severity',
        witnessCountValue: '#witness-count',
        preloader: '#preloader',
        navbarToggle: '.navbar-toggle',
        navbarMenu: '.navbar-menu',
        backToTopButton: '#back-to-top',
        statNumbers: '.stat-number',
        submitBtn: '#submit-btn',
        loadingElement: '#loading',
        errorElement: '#error',
        errorTextElement: '#error-text',
        tabBtns: '.tab-btn',
        nextBtns: '.next-tab',
        prevBtns: '.prev-tab',
        tabContents: '.tab-content',
    },
    numericFields: [
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
    ],
};

// Global state
const state = {
    lastPredictionResult: null,
};

// --- UTILITY FUNCTIONS ---
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// --- UI FUNCTIONS ---
const UI = {
    showLoading: () => {
        const submitBtn = $(config.selectors.submitBtn);
        if (submitBtn) {
            submitBtn.disabled = true;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Analyzing...';
        }
        const loadingElement = $(config.selectors.loadingElement);
        if (loadingElement) loadingElement.style.display = 'flex';
    },

    hideLoading: () => {
        const submitBtn = $(config.selectors.submitBtn);
        if (submitBtn) {
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Analyze Claim';
        }
        const loadingElement = $(config.selectors.loadingElement);
        if (loadingElement) loadingElement.style.display = 'none';
    },

    showError: (message) => {
        const errorElement = $(config.selectors.errorElement);
        const errorTextElement = $(config.selectors.errorTextElement);
        if (errorElement) errorElement.style.display = 'block';
        if (errorTextElement) errorTextElement.textContent = message;
    },

    hideError: () => {
        const errorElement = $(config.selectors.errorElement);
        if (errorElement) errorElement.style.display = 'none';
    },

    hideResults: () => {
        const resultsElement = $(config.selectors.resultsSection);
        if (resultsElement) resultsElement.style.display = 'none';
    },

    displayResults: (result) => {
        const resultsElement = $(config.selectors.resultsSection);
        if (!resultsElement) return;

        resultsElement.style.display = 'block';
        console.log("Processing result:", result);

        const formData = result.formData || window.lastFormData || {};
        const apiData = result.summary ? {
            ...result,
            incident_type: result.summary?.incident_type || result.incident_type,
            incident_severity: result.summary?.severity || result.incident_severity,
            vehicles_involved: result.summary?.vehicles_involved || result.vehicles_involved,
            witnesses: result.summary?.witnesses || result.witnesses
        } : result.prediction ? {
            ...result,
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
        } : result;

        let fraudProbability = 0;
        if (typeof result.probability === 'number') {
            fraudProbability = result.probability / 100;
        } else if (typeof result.fraud_probability === 'number') {
            fraudProbability = result.fraud_probability;
        } else if (typeof result.probability === 'string') {
            fraudProbability = parseFloat(result.probability) / 100;
        } else if (result.prediction === 'Fraudulent') {
            fraudProbability = 0.85;
        } else if (result.prediction === 'Not Fraudulent') {
            fraudProbability = 0.15;
        }

        if (isNaN(fraudProbability) || fraudProbability < 0) {
            fraudProbability = 0;
        } else if (fraudProbability > 1) {
            fraudProbability = fraudProbability > 100 ? fraudProbability / 100 : fraudProbability;
        }

        const data = {
            ...formData,
            ...apiData,
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
        const riskFactors = generateRiskFactors(data, isFraudulent);
        const totalClaim = (Number(data.injury_claim) || 0) +
            (Number(data.property_claim) || 0) +
            (Number(data.vehicle_claim) || 0);

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
                            ${riskFactors.map(factor => `<li><i class="fas fa-angle-right"></i><span>${factor}</span></li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="result-card">
                    <div class="card-header">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <h4>Claim Summary</h4>
                    </div>
                    <div class="card-body">
                        <div class="summary-item"><span>Incident Type:</span><strong>${data.incident_type}</strong></div>
                        <div class="summary-item"><span>Incident Severity:</span><strong>${data.incident_severity}</strong></div>
                        <div class="summary-item"><span>Total Claim Amount:</span><strong>$${totalClaim.toLocaleString()}</strong></div>
                        <div class="summary-item"><span>Vehicles Involved:</span><strong>${data.vehicles_involved}</strong></div>
                        <div class="summary-item"><span>Witnesses:</span><strong>${data.witnesses || 'None'}</strong></div>
                        <div class="summary-item"><span>Police Report:</span><strong>${data.police_report === 'YES' ? 'Filed' : 'Not Filed'}</strong></div>
                    </div>
                </div>
            </div>
            <div class="results-actions">
                <button id="reset-btn" class="btn btn-outline"><i class="fas fa-redo"></i> Reset Form</button>
            </div>
        `;

        resultsElement.innerHTML = resultsHTML;

        const resetBtn = $('#reset-btn');
        const form = $(config.selectors.claimForm);
        if (resetBtn && form) {
            resetBtn.addEventListener('click', () => {
                form.reset();
                UI.hideResults();
                const analyzeSection = $('#analyze');
                if (analyzeSection) {
                    analyzeSection.scrollIntoView({ behavior: 'smooth' });
                }
                switchTab('claim-details');
            });
        }
    },
};

// --- API FUNCTIONS ---
const API = {
    predict: async (data) => {
        const response = await fetch(`${config.apiBaseUrl}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
    },
    getFieldInfo: async () => {
        const response = await fetch(`${config.apiBaseUrl}/field-info`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    },
    getHealth: async () => {
        const response = await fetch(`${config.apiBaseUrl}/health`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }
};

// --- EVENT HANDLERS ---
const Handlers = {
    handleFormSubmit: async (e) => {
        e.preventDefault();
        const form = $(config.selectors.claimForm);
        const inputs = $$('input, select');
        let isValid = true;
        let firstInvalidField = null;

        inputs.forEach(input => {
            const parentGroup = input.closest('.form-group');
            const errorMessage = parentGroup.querySelector('.error-message');
            if (errorMessage) errorMessage.remove();
            input.classList.remove('invalid');

            if (!input.value) {
                isValid = false;
                input.classList.add('invalid');
                const message = 'This field is required.';
                const errorSpan = document.createElement('span');
                errorSpan.className = 'error-message';
                errorSpan.textContent = message;
                parentGroup.appendChild(errorSpan);
                if (!firstInvalidField) firstInvalidField = input;
            }
        });

        if (!isValid) {
            UI.showError('Please fill out all required fields.');
            if (firstInvalidField) firstInvalidField.focus();
            return;
        }

        UI.showLoading();
        UI.hideError();
        UI.hideResults();

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = config.numericFields.includes(key) ? Number(value) : value;
        });
        window.lastFormData = data;

        try {
            console.log("Submitting data:", data);
            let result = await API.predict(data);
            console.log("API Response:", result);
            if (result.data) result = result.data;
            if (result.status === 'failure') throw new Error(result.message || 'API returned failure status');
            result.formData = data;
            UI.displayResults(result);
            const resultsSection = $(config.selectors.resultsSection);
            if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Prediction error:', error);
            UI.showError(`Failed to get prediction: ${error.message}`);
        } finally {
            UI.hideLoading();
        }
    },

    handleTabClick: (e) => {
        const tabId = e.target.closest('.tab-btn').getAttribute('data-tab');
        switchTab(tabId);
    },

    handleNextTabClick: (e) => {
        const nextTabId = e.target.closest('.next-tab').getAttribute('data-next');
        switchTab(nextTabId);
    },

    handlePrevTabClick: (e) => {
        const prevTabId = e.target.closest('.prev-tab').getAttribute('data-prev');
        switchTab(prevTabId);
    },
};

// --- INITIALIZATION ---
const init = () => {
    // Preloader
    const preloader = $(config.selectors.preloader);
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        });
    }

    // AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out',
            once: true,
            mirror: false
        });
    }

    // Image fallback
    $$('img').forEach(img => {
        img.onerror = function () {
            console.warn(`Failed to load image: ${this.src}`);
            if (this.src.includes('machine-learning-4102851_1280.png')) {
                this.src = 'https://via.placeholder.com/800x600/4361ee/ffffff?text=AI+Powered+Analysis';
                console.log("Applied fallback for hero image");
            }
        };
    });

    // Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(link);
        console.log("Font Awesome was not loaded, adding it dynamically");
    }

    // Navbar
    const navbarToggle = $(config.selectors.navbarToggle);
    const navbarMenu = $(config.selectors.navbarMenu);
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
            navbarToggle.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!navbarToggle.contains(e.target) && !navbarMenu.contains(e.target) && navbarMenu.classList.contains('active')) {
                navbarMenu.classList.remove('active');
                navbarToggle.classList.remove('active');
            }
        });
        $$('.navbar-menu a').forEach(item => {
            item.addEventListener('click', () => {
                if (navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    navbarToggle.classList.remove('active');
                }
            });
        });
    }

    // Smooth scroll
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = $(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                if (navbarMenu && navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    navbarToggle.classList.remove('active');
                }
            }
        });
    });

    // Form
    const form = $(config.selectors.claimForm);
    if (form) form.addEventListener('submit', Handlers.handleFormSubmit);

    // Tabs
    $$(config.selectors.tabBtns).forEach(btn => btn.addEventListener('click', Handlers.handleTabClick));
    $$(config.selectors.nextBtns).forEach(btn => btn.addEventListener('click', Handlers.handleNextTabClick));
    $$(config.selectors.prevBtns).forEach(btn => btn.addEventListener('click', Handlers.handlePrevTabClick));

    // Back to top
    const backToTopButton = $(config.selectors.backToTopButton);
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.style.display = window.scrollY > 300 ? 'flex' : 'none';
        });
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Stats animation
    const stats = $$(config.selectors.statNumbers);
    const animateStats = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = +stat.getAttribute('data-target');
                const duration = 2000;
                const stepTime = 20;
                const steps = duration / stepTime;
                const increment = target / steps;
                let current = 0;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        clearInterval(timer);
                        current = target;
                    }
                    stat.innerText = stat.getAttribute('data-target').includes('.') ? current.toFixed(1) : Math.floor(current);
                }, stepTime);

                observer.unobserve(stat);
            }
        });
    };
    const statObserver = new IntersectionObserver(animateStats, { threshold: 0.5 });
    stats.forEach(stat => statObserver.observe(stat));

    // Navbar scroll
    window.addEventListener('scroll', () => {
        const navbar = $('.navbar');
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Hero wave
    const adjustHeroWave = () => {
        const heroWave = $('.hero-wave');
        if (heroWave) {
            heroWave.style.height = window.innerWidth < 768 ? '60px' : 'auto';
            heroWave.style.opacity = window.innerWidth < 768 ? '0.6' : '0.8';
        }
    };
    window.addEventListener('load', adjustHeroWave);
    window.addEventListener('resize', adjustHeroWave);

    // API checks
    API.getFieldInfo().then(data => {
        if (data.success) console.log('Field info loaded successfully');
    }).catch(error => {
        console.error('Error loading field info:', error);
        showAPIError('Failed to load field information. Please refresh the page.');
    });
    API.getHealth().then(data => {
        console.log(`API Status: ${data.status}`);
        if (data.status !== 'healthy') showAPIError(data.message);
    }).catch(() => {
        showAPIError('Cannot connect to the API. Please try again later.');
    });
};

document.addEventListener('DOMContentLoaded', init);

function switchTab(tabId) {
    const tabContents = $$(config.selectors.tabContents);
    const tabButtons = $$(config.selectors.tabBtns);
    if (!tabContents.length || !tabButtons.length) return;
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));
    const targetContent = $(`#${tabId}-content`);
    const targetButton = $(`[data-tab="${tabId}"]`);
    if (targetContent) targetContent.classList.add('active');
    if (targetButton) targetButton.classList.add('active');
}

function getRiskLevel(probability) {
    if (isNaN(probability) || probability < 0.3) return 'Low';
    if (probability < 0.7) return 'Medium';
    return 'High';
}

function generateRiskFactors(data, isFraudulent) {
    const factors = [];
    if (!data) return ['No risk factors available'];
    try {
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
        if (data.risk_factors && typeof data.risk_factors === 'object') {
            for (const [factor, value] of Object.entries(data.risk_factors)) {
                if (value === true) {
                    const readableFactor = factor.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    factors.push(readableFactor);
                }
            }
            if (factors.length > 0) return factors;
        }
        if (isFraudulent) {
            if (data.police_report === 'NO') factors.push('No police report filed for a major incident');
            if (numericData.witnesses === 0) factors.push('No witnesses present during the incident');
            const totalClaim = numericData.injury_claim + numericData.property_claim + numericData.vehicle_claim;
            if (totalClaim > 30000) factors.push(`Unusually high total claim amount ($${totalClaim.toLocaleString()})`);
            if (numericData.incident_hour >= 22 || numericData.incident_hour <= 4) factors.push('Incident occurred during late night hours');
            if (numericData.bodily_injuries >= 2) factors.push('Multiple bodily injuries reported');
            if (data.incident_severity === 'Minor Damage' && numericData.vehicle_claim > 10000) factors.push('Vehicle claim amount unusually high for minor damage');
        } else {
            if (data.police_report === 'YES') factors.push('Police report properly filed');
            if (numericData.witnesses >= 2) factors.push('Multiple witnesses present');
            if (data.incident_type && numericData.vehicles_involved > 1 && data.incident_type.includes && data.incident_type.includes('Collision')) factors.push('Consistent vehicle involvement with reported incident type');
            if (numericData.months_as_customer > 60) factors.push('Long-term customer with good history');
            if (data.incident_severity === 'Major Damage' && numericData.vehicle_claim > 15000) factors.push('Vehicle claim amount consistent with major damage');
        }
        if (data.property_damage === 'YES' && numericData.property_claim <= 1000) factors.push('Property damage claim amount is reasonable');
        if (numericData.injury_claim > 15000) factors.push('Injury claim amount is above average');
        if (data.incident_severity === 'Major Damage' && numericData.vehicle_claim < 10000) factors.push('Vehicle claim amount lower than expected for reported damage');
        if (data.incident_severity === 'Minor Damage' && numericData.vehicle_claim > 10000) factors.push('Vehicle claim amount higher than expected for reported damage');
    } catch (error) {
        console.error('Error generating risk factors:', error);
        return ['Error analyzing risk factors'];
    }
    return factors.length > 0 ? factors : ['No specific risk factors identified'];
}

function showAPIError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error';
    errorDiv.innerHTML = `<div class="error-container"><i class="fas fa-exclamation-circle"></i><p>${message}</p></div>`;
    const header = $('header');
    if (header) header.parentNode.insertBefore(errorDiv, header.nextSibling);
}