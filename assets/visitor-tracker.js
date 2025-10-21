/**
 * Visitor Tracking System
 * Tracks website visitors by country using Firebase Firestore
 */

class VisitorTracker {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // Firebase configuration
    getFirebaseConfig() {
        return {
            apiKey: "AIzaSyC8AXZMQoGk56hIo_HyTk8977C_x7ppk4k",
            authDomain: "visitor-counter-3a3b5.firebaseapp.com",
            projectId: "visitor-counter-3a3b5",
            storageBucket: "visitor-counter-3a3b5.firebasestorage.app",
            messagingSenderId: "317453956789",
            appId: "1:317453956789:web:46f99cbae9d70083d770fc",
            measurementId: "G-9M30F3Y5R3"
        };
    }

    // Initialize Firebase
    async initializeFirebase() {
        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
            const { getFirestore, doc, getDoc, setDoc, updateDoc, collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
            
            const app = initializeApp(this.getFirebaseConfig());
            this.db = getFirestore(app);
            
            // Store Firebase functions for later use
            this.doc = doc;
            this.getDoc = getDoc;
            this.setDoc = setDoc;
            this.updateDoc = updateDoc;
            this.collection = collection;
            this.onSnapshot = onSnapshot;
            
            this.initialized = true;
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            return false;
        }
    }

    // Get visitor's country information
    async getVisitorCountry() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            return {
                country: data.country_name || 'Unknown',
                code: data.country_code || 'XX',
                city: data.city || 'Unknown',
                region: data.region || 'Unknown'
            };
        } catch (error) {
            console.error('Failed to get visitor location:', error);
            // Fallback location
            return {
                country: 'Unknown',
                code: 'XX',
                city: 'Unknown',
                region: 'Unknown'
            };
        }
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

    // Record visitor
    async recordVisitor(countryInfo) {
        if (!this.initialized || !this.db) {
            console.error('Firebase not initialized');
            return false;
        }

        try {
            const { country, code } = countryInfo;
            const docRef = this.doc(this.db, 'visitors', country);
            
            const docSnap = await this.getDoc(docRef);
            
            if (docSnap.exists()) {
                const currentData = docSnap.data();
                await this.updateDoc(docRef, {
                    count: currentData.count + 1,
                    code: code,
                    lastVisit: new Date().toISOString()
                });
            } else {
                await this.setDoc(docRef, {
                    count: 1,
                    code: code,
                    firstVisit: new Date().toISOString(),
                    lastVisit: new Date().toISOString()
                });
            }
            
            console.log(`Visitor recorded from ${country}`);
            return true;
        } catch (error) {
            console.error('Failed to record visitor:', error);
            return false;
        }
    }

    // Set up real-time listener for visitor stats
    setupStatsListener() {
        if (!this.initialized || !this.db) {
            console.error('Firebase not initialized');
            return;
        }

        try {
            const visitorsRef = this.collection(this.db, 'visitors');
            
            this.onSnapshot(visitorsRef, (snapshot) => {
                const visitorsData = {};
                let totalVisitors = 0;
                
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    visitorsData[doc.id] = data;
                    totalVisitors += data.count || 0;
                });
                
                this.renderVisitorStats(visitorsData, totalVisitors);
            }, (error) => {
                console.error('Error listening to visitor stats:', error);
                this.renderErrorState();
            });
        } catch (error) {
            console.error('Failed to setup stats listener:', error);
            this.renderErrorState();
        }
    }

    // Render visitor statistics
    renderVisitorStats(visitorsData, totalVisitors) {
        const countriesElement = document.getElementById('visitor-countries');
        
        if (!countriesElement) {
            console.error('Visitor stats elements not found');
            return;
        }

        // Sort countries by visitor count
        const sortedCountries = Object.entries(visitorsData)
            .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0));

        // Render countries
        countriesElement.innerHTML = '';
        
        if (sortedCountries.length === 0) {
            return; // Just show nothing if no data
        }

        sortedCountries.forEach(([country, data]) => {
            const flag = this.countryCodeToFlag(data.code);
            const count = data.count || 0;
            
            const countryElement = document.createElement('span');
            countryElement.className = 'visitor-country-subtle';
            countryElement.innerHTML = `${flag}&nbsp;${count}`;
            countryElement.title = `${country}: ${count} visitor${count !== 1 ? 's' : ''}`;
            
            countriesElement.appendChild(countryElement);
        });
    }

    // Render error state
    renderErrorState() {
        const countriesElement = document.getElementById('visitor-countries');
        
        if (countriesElement) {
            countriesElement.innerHTML = ''; // Just show nothing on error
        }
    }

    // Initialize the visitor tracking system
    async initialize() {
        console.log('Initializing visitor tracker...');
        
        // Initialize Firebase
        const firebaseReady = await this.initializeFirebase();
        if (!firebaseReady) {
            this.renderErrorState();
            return;
        }

        // Get visitor's country and record visit
        const countryInfo = await this.getVisitorCountry();
        await this.recordVisitor(countryInfo);

        // Set up real-time stats listener
        this.setupStatsListener();
        
        console.log('Visitor tracker initialized successfully');
    }

    // Retry initialization if it fails
    async initializeWithRetry() {
        while (this.retryCount < this.maxRetries) {
            try {
                await this.initialize();
                return;
            } catch (error) {
                this.retryCount++;
                console.error(`Initialization attempt ${this.retryCount} failed:`, error);
                
                if (this.retryCount < this.maxRetries) {
                    console.log(`Retrying in ${this.retryCount * 2} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryCount * 2000));
                } else {
                    console.error('All initialization attempts failed');
                    this.renderErrorState();
                }
            }
        }
    }
}

// Initialize visitor tracking when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with visitor stats elements
    if (document.getElementById('visitor-stats')) {
        const tracker = new VisitorTracker();
        tracker.initializeWithRetry();
    }
});

// Export for manual initialization if needed
window.VisitorTracker = VisitorTracker;