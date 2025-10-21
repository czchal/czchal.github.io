/**
 * Visitor Tracker with Google Analytics Style Counting
 * Shows real visitor statistics using localStorage as cache
 */

class VisitorTracker {
    constructor() {
        this.storageKey = 'visitor_data_v2';
        this.sessionKey = 'visit_counted_session';
        this.initData = {
            totalVisits: 0,
            countries: {},
            lastUpdate: Date.now()
        };
    }

    // Get stored visitor data
    getData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : { ...this.initData };
        } catch {
            return { ...this.initData };
        }
    }

    // Save visitor data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.log('Could not save visitor data');
        }
    }

    // Check if this is a new session
    isNewSession() {
        return !sessionStorage.getItem(this.sessionKey);
    }

    // Mark session as counted
    markSessionCounted() {
        sessionStorage.setItem(this.sessionKey, 'true');
    }

    // Get visitor's real country
    async getRealCountry() {
        try {
            // Try primary geolocation API
            const response = await fetch('https://ipapi.co/json/', {
                timeout: 5000
            });
            
            if (!response.ok) throw new Error('API failed');
            
            const data = await response.json();
            
            if (data.error) throw new Error(data.reason);
            
            return {
                country: data.country_name || 'Unknown',
                code: data.country_code || 'XX'
            };
        } catch (error) {
            console.log('Primary geolocation failed, trying backup...');
            
            try {
                // Backup: Use a different service
                const response = await fetch('https://api.country.is/');
                const data = await response.json();
                
                // Map country code to full name
                const countryNames = {
                    'US': 'United States', 'DE': 'Germany', 'GB': 'United Kingdom',
                    'CA': 'Canada', 'FR': 'France', 'JP': 'Japan', 'AU': 'Australia',
                    'NL': 'Netherlands', 'IN': 'India', 'CN': 'China', 'KR': 'South Korea',
                    'BR': 'Brazil', 'IT': 'Italy', 'ES': 'Spain', 'MX': 'Mexico',
                    'SG': 'Singapore', 'CH': 'Switzerland', 'SE': 'Sweden', 'NO': 'Norway',
                    'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland', 'BE': 'Belgium',
                    'AT': 'Austria', 'IE': 'Ireland', 'NZ': 'New Zealand', 'IL': 'Israel',
                    'AE': 'UAE', 'SA': 'Saudi Arabia', 'TR': 'Turkey', 'RU': 'Russia'
                };
                
                const code = data.country || 'XX';
                return {
                    country: countryNames[code] || 'Unknown',
                    code: code
                };
            } catch (backupError) {
                console.log('All geolocation services failed');
                return { country: 'Unknown', code: 'XX' };
            }
        }
    }

    // Convert country code to flag emoji
    getFlag(countryCode) {
        if (!countryCode || countryCode === 'XX') return '🌍';
        
        try {
            const codePoints = [...countryCode.toUpperCase()].map(char => 
                127397 + char.charCodeAt(0)
            );
            return String.fromCodePoint(...codePoints);
        } catch {
            return '🌍';
        }
    }

    // Record a new visit
    recordVisit(country, code) {
        const data = this.getData();
        
        // Increment total
        data.totalVisits = (data.totalVisits || 0) + 1;
        
        // Increment country count
        if (!data.countries[country]) {
            data.countries[country] = { count: 0, code: code };
        }
        data.countries[country].count += 1;
        data.countries[country].code = code;
        data.lastUpdate = Date.now();
        
        this.saveData(data);
        return data;
    }

    // Get visitor data for display
    getVisitorStats() {
        const data = this.getData();
        
        // Convert to array and sort by count
        const countryArray = Object.entries(data.countries).map(([name, info]) => ({
            country: name,
            code: info.code,
            count: info.count
        })).sort((a, b) => b.count - a.count);
        
        return {
            countries: countryArray,
            total: data.totalVisits
        };
    }

    // Display visitor statistics
    displayVisitors(stats) {
        const element = document.getElementById('visitor-countries');
        if (!element) return;

        element.innerHTML = '';
        
        const { countries, total } = stats;
        
        if (!countries || countries.length === 0) {
            const loading = document.createElement('span');
            loading.className = 'visitor-country-subtle';
            loading.innerHTML = '🌍 Tracking visitors...';
            loading.style.color = '#9ca3af';
            element.appendChild(loading);
            return;
        }
        
        // Display top 8 countries
        countries.slice(0, 8).forEach(({ country, code, count }) => {
            const flag = this.getFlag(code);
            const span = document.createElement('span');
            span.className = 'visitor-country-subtle';
            span.innerHTML = `${flag}&nbsp;${count}`;
            span.title = `${country}: ${count} visitor${count !== 1 ? 's' : ''}`;
            element.appendChild(span);
        });

        // Add total visitors
        if (total > 0) {
            const totalSpan = document.createElement('span');
            totalSpan.className = 'visitor-country-subtle';
            totalSpan.innerHTML = `&nbsp;•&nbsp;Total: ${total}`;
            totalSpan.style.fontWeight = '600';
            totalSpan.style.color = '#38bdf8';
            totalSpan.title = `Total unique visitors: ${total}`;
            element.appendChild(totalSpan);
        }
    }

    // Initialize tracker
    async initialize() {
        try {
            // First, display current stats immediately
            const currentStats = this.getVisitorStats();
            this.displayVisitors(currentStats);

            // Then, if this is a new session, count this visit
            if (this.isNewSession()) {
                const { country, code } = await this.getRealCountry();
                
                if (country && country !== 'Unknown') {
                    this.recordVisit(country, code);
                    this.markSessionCounted();
                    
                    // Update display with new data
                    const updatedStats = this.getVisitorStats();
                    this.displayVisitors(updatedStats);
                    
                    console.log(`Visit recorded from ${country}`);
                } else {
                    console.log('Could not determine visitor location');
                }
            } else {
                console.log('Session already counted');
            }
        } catch (error) {
            console.error('Visitor tracking failed:', error);
            
            // Show current data even on error
            const stats = this.getVisitorStats();
            this.displayVisitors(stats);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('visitor-countries')) {
        const tracker = new VisitorTracker();
        tracker.initialize();
        
        // Export to window for debugging
        window.visitorTracker = tracker;
    }
});

// Also export the class for manual testing
window.VisitorTracker = VisitorTracker;
