/**
 * API module for interacting with the backend
 */
const API = {
    predict: async (data) => {
        const response = await fetch(`https://your-api-domain.com/api/predict`, {
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
        const response = await fetch(`https://your-api-domain.com/api/field-info`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    },
    getHealth: async () => {
        const response = await fetch(`https://your-api-domain.com/api/health`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }
};

export default API;
