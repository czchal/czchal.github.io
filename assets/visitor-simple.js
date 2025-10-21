/**
 * Simple Visitor Display - No external dependencies
 * Shows sample visitor data immediately
 */

console.log('Simple visitor tracker loaded');

// Sample visitor data
const sampleVisitors = [
    { country: 'United States', count: 42, code: 'US' },
    { country: 'Germany', count: 28, code: 'DE' },
    { country: 'United Kingdom', count: 19, code: 'GB' },
    { country: 'Canada', count: 15, code: 'CA' },
    { country: 'France', count: 12, code: 'FR' },
    { country: 'Japan', count: 9, code: 'JP' },
    { country: 'Australia', count: 7, code: 'AU' },
    { country: 'Netherlands', count: 5, code: 'NL' }
];

// Convert country code to flag emoji
function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode === 'XX') return '🏳️';
    
    try {
        return countryCode
            .toUpperCase()
            .replace(/./g, char => 
                String.fromCodePoint(char.charCodeAt(0) + 127397)
            );
    } catch (error) {
        return '🏳️';
    }
}

// Display visitor stats
function displayVisitors() {
    console.log('Attempting to display visitors...');
    
    const countriesElement = document.getElementById('visitor-countries');
    
    if (!countriesElement) {
        console.error('visitor-countries element not found!');
        return;
    }
    
    console.log('Found visitor-countries element, displaying data...');
    
    // Clear existing content
    countriesElement.innerHTML = '';
    
    // Add each country
    sampleVisitors.forEach(({ country, count, code }) => {
        const flag = countryCodeToFlag(code);
        
        const countryElement = document.createElement('span');
        countryElement.className = 'visitor-country-subtle';
        countryElement.innerHTML = `${flag}&nbsp;${count}`;
        countryElement.title = `${country}: ${count} visitor${count !== 1 ? 's' : ''}`;
        
        countriesElement.appendChild(countryElement);
    });
    
    console.log('Visitor data displayed successfully');
}

// Try to display immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayVisitors);
} else {
    displayVisitors();
}

// Also try after a short delay
setTimeout(displayVisitors, 1000);

console.log('Simple visitor tracker setup complete');