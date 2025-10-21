/**
 * Debug Version of Visitor Tracker
 * Simpler implementation for troubleshooting
 */

class SimpleVisitorTracker {
    constructor() {
        this.isDebugMode = true;
    }

    // Fallback visitor data for testing
    getFallbackData() {
        return {
            'United States': { count: 45, code: 'US' },
            'Germany': { count: 23, code: 'DE' },
            'United Kingdom': { count: 18, code: 'GB' },
            'Canada': { count: 12, code: 'CA' },
            'France': { count: 9, code: 'FR' },
            'Japan': { count: 7, code: 'JP' },
            'Australia': { count: 5, code: 'AU' }
        };
    }

    // Convert country code to flag emoji
    countryCodeToFlag(countryCode) {
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

    // Test geolocation API
    async testGeolocation() {
        try {
            console.log('Testing geolocation API...');
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            console.log('Geolocation response:', data);
            return data;
        } catch (error) {
            console.error('Geolocation test failed:', error);
            return null;
        }
    }

    // Test Firebase connection
    async testFirebase() {
        try {
            console.log('Testing Firebase connection...');
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
            
            const config = {
                apiKey: "AIzaSyC8AXZMQoGk56hIo_HyTk8977C_x7ppk4k",
                authDomain: "visitor-counter-3a3b5.firebaseapp.com",
                projectId: "visitor-counter-3a3b5",
                storageBucket: "visitor-counter-3a3b5.firebasestorage.app",
                messagingSenderId: "317453956789",
                appId: "1:317453956789:web:46f99cbae9d70083d770fc",
                measurementId: "G-9M30F3Y5R3"
            };
            
            const app = initializeApp(config);
            const db = getFirestore(app);
            console.log('Firebase connection successful');
            return { app, db };
        } catch (error) {
            console.error('Firebase test failed:', error);
            return null;
        }
    }

    // Render visitor stats with fallback data
    renderFallbackStats() {
        const countriesElement = document.getElementById('visitor-countries');
        
        if (!countriesElement) {
            console.error('visitor-countries element not found');
            return;
        }

        console.log('Rendering fallback visitor stats...');
        
        const visitorsData = this.getFallbackData();
        
        // Sort countries by visitor count
        const sortedCountries = Object.entries(visitorsData)
            .sort(([,a], [,b]) => b.count - a.count);

        // Clear existing content
        countriesElement.innerHTML = '';
        
        // Add each country
        sortedCountries.forEach(([country, data]) => {
            const flag = this.countryCodeToFlag(data.code);
            const count = data.count;
            
            const countryElement = document.createElement('span');
            countryElement.className = 'visitor-country-subtle';
            countryElement.innerHTML = `${flag}&nbsp;${count}`;
            countryElement.title = `${country}: ${count} visitor${count !== 1 ? 's' : ''}`;
            
            countriesElement.appendChild(countryElement);
        });
        
        console.log('Fallback stats rendered successfully');
    }

    // Run comprehensive test
    async runDiagnostics() {
        console.log('=== Visitor Tracker Diagnostics ===');
        
        // Test 1: Check if elements exist
        const statsElement = document.getElementById('visitor-stats');
        const countriesElement = document.getElementById('visitor-countries');
        
        console.log('Stats element found:', !!statsElement);
        console.log('Countries element found:', !!countriesElement);
        
        if (!statsElement || !countriesElement) {
            console.error('Required DOM elements not found!');
            return;
        }

        // Test 2: Test geolocation
        const geoData = await this.testGeolocation();
        
        // Test 3: Test Firebase
        const firebaseData = await this.testFirebase();
        
        // Test 4: Render fallback data regardless
        console.log('Rendering fallback data for testing...');
        this.renderFallbackStats();
        
        console.log('=== Diagnostics Complete ===');
    }

    // Initialize with debugging
    async initialize() {
        console.log('Initializing Simple Visitor Tracker...');
        
        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Run diagnostics
        await this.runDiagnostics();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for visitor stats...');
    
    if (document.getElementById('visitor-stats')) {
        console.log('Visitor stats element found, initializing debug tracker...');
        const debugTracker = new SimpleVisitorTracker();
        debugTracker.initialize();
    } else {
        console.log('No visitor stats element found on this page');
    }
});

// Export for manual testing
window.SimpleVisitorTracker = SimpleVisitorTracker;