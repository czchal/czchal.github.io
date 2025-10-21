/**
 * DEPRECATED - This file has been replaced by visitor-simple.js
 * 
 * All pages now use the clean visitor-simple.js implementation
 * for accurate and reliable visitor tracking.
 * 
 * This file is kept for backup purposes only.
 */

console.log('WARNING: visitor-tracker.js is deprecated. All pages should use visitor-simple.js instead.');

// Fallback - redirect to visitor-simple.js if this file is accidentally loaded
if (typeof window !== 'undefined' && window.location) {
    console.log('Loading visitor-simple.js as replacement...');
    const script = document.createElement('script');
    script.src = 'assets/visitor-simple.js';
    document.head.appendChild(script);
}