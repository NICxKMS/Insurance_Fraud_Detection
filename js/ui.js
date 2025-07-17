/**
 * UI module for DOM manipulation
 */
const UI = {
    showLoading: () => {
        const submitBtn = document.querySelector('#submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Analyzing...';
        }
        const loadingElement = document.querySelector('#loading');
        if (loadingElement) loadingElement.style.display = 'flex';
    },

    hideLoading: () => {
        const submitBtn = document.querySelector('#submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Analyze Claim';
        }
        const loadingElement = document.querySelector('#loading');
        if (loadingElement) loadingElement.style.display = 'none';
    },

    showError: (message) => {
        const errorElement = document.querySelector('#error');
        const errorTextElement = document.querySelector('#error-text');
        if (errorElement) errorElement.style.display = 'block';
        if (errorTextElement) errorTextElement.textContent = message;
    },

    hideError: () => {
        const errorElement = document.querySelector('#error');
        if (errorElement) errorElement.style.display = 'none';
    },

    hideResults: () => {
        const resultsElement = document.querySelector('#results');
        if (resultsElement) resultsElement.style.display = 'none';
    },

    displayResults: (result) => {
        const resultsElement = document.querySelector('#results');
        if (!resultsElement) return;

        resultsElement.style.display = 'block';

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

        const resetBtn = document.querySelector('#reset-btn');
        const form = document.querySelector('#claim-form');
        if (resetBtn && form) {
            resetBtn.addEventListener('click', () => {
                form.reset();
                UI.hideResults();
                const analyzeSection = document.querySelector('#analyze');
                if (analyzeSection) {
                    analyzeSection.scrollIntoView({ behavior: 'smooth' });
                }
                switchTab('claim-details');
            });
        }
    },
};

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

function switchTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (!tabContents.length || !tabButtons.length) return;
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));
    const targetContent = document.querySelector(`#${tabId}-content`);
    const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (targetContent) targetContent.classList.add('active');
    if (targetButton) targetButton.classList.add('active');
}

export default UI;
