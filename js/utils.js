/**
 * Utility functions
 */
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export function showAPIError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error';
    errorDiv.innerHTML = `<div class="error-container"><i class="fas fa-exclamation-circle"></i><p>${message}</p></div>`;
    const header = $('header');
    if (header) header.parentNode.insertBefore(errorDiv, header.nextSibling);
}
