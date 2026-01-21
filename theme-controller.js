/* ============================================================
   THEME CONTROLLER - Manual Light/Dark Mode System
   - No automatic OS detection
   - LocalStorage persistence
   - Instant loading (no flash)
============================================================ */

(function() {
    'use strict';

    const THEME_KEY = 'fpt-theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';

    console.log('Theme Controller Loaded'); // Debug log

    // Initialize theme immediately (before page renders)
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const theme = savedTheme || THEME_LIGHT; // Default to light
        console.log('Init theme:', theme); // Debug log
        applyTheme(theme, false);
    }

    // Apply theme to document
    function applyTheme(theme, animate = true) {
        const root = document.documentElement;
        
        console.log('Applying theme:', theme); // Debug log
        
        if (theme === THEME_DARK) {
            root.classList.add('dark-mode');
            document.body.classList.add('dark-mode'); // Also add to body for compatibility
        } else {
            root.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode'); // Also remove from body
        }
        
        localStorage.setItem(THEME_KEY, theme);
        console.log('Theme saved to localStorage:', theme); // Debug log
        
        // Update icon after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => updateToggleIcon(theme));
        } else {
            updateToggleIcon(theme);
        }
    }

    // Update toggle button icon
    function updateToggleIcon(theme) {
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.textContent = theme === THEME_DARK ? '☀️' : '🌙';
            console.log('Icon updated to:', icon.textContent); // Debug log
        } else {
            console.log('Icon element not found'); // Debug log
        }
    }

    // Toggle between themes
    function toggleTheme() {
        console.log('Toggle theme clicked!'); // Debug log
        
        const root = document.documentElement;
        const currentTheme = root.classList.contains('dark-mode') 
            ? THEME_DARK 
            : THEME_LIGHT;
        
        const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
        
        console.log('Current theme:', currentTheme, '→ New theme:', newTheme); // Debug log
        
        applyTheme(newTheme, true);
    }

    // Initialize on script load (blocking)
    initTheme();

    // Expose toggle function globally
    window.toggleTheme = toggleTheme;
    console.log('toggleTheme function exposed globally'); // Debug log

    // Re-initialize after DOM loads (to update icon)
    document.addEventListener('DOMContentLoaded', function() {
        const savedTheme = localStorage.getItem(THEME_KEY) || THEME_LIGHT;
        console.log('DOM loaded, saved theme:', savedTheme); // Debug log
        updateToggleIcon(savedTheme);
    });
})();