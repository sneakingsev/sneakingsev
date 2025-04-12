// Sneaking Assistant - Clean Geolocation Implementation
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const homeInput = document.getElementById('home-input');
    const mapBtn = document.getElementById('map-btn');
    const notepadBtn = document.getElementById('notepad-btn');
    const mapContainer = document.getElementById('map-container');
    const notepadContainer = document.getElementById('notepad-container');
    const spinner = document.getElementById('spinner');
    const errorElement = document.getElementById('error');
    const noteContent = document.getElementById('note-content');
    const noteStatus = document.getElementById('note-status');

    // App State
    let map = null;
    let notes = localStorage.getItem('sneakingNotes') || '';
    const defaultCoords = [38.8950368, -77.0365427]; // Fairfax Station, VA

    // Initialize Map
    function initMap(lat, lng) {
        if (map) map.remove();
        
        mapContainer.classList.remove('hidden');
        notepadContainer.classList.add('hidden');
        
        map = L.map('map').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        
        L.marker([lat, lng]).addTo(map)
            .bindPopup("<b>Current Location</b>")
            .openPopup();
    }

    // Handle Map View
    async function handleMapView() {
        const address = homeInput.value.trim();
        if (!address) {
            initMap(...defaultCoords);
            return;
        }

        showLoading();
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            
            if (data?.length > 0) {
                initMap(parseFloat(data[0].lat), parseFloat(data[0].lon));
            } else {
                showError("Address not found. Showing default location.");
                initMap(...defaultCoords);
            }
        } catch (error) {
            showError("Geocoding service unavailable");
            initMap(...defaultCoords);
        } finally {
            hideLoading();
        }
    }

    // Notepad Functions
    function showNotepad() {
        mapContainer.classList.add('hidden');
        notepadContainer.classList.remove('hidden');
    }

    function loadSavedNotes() {
        noteContent.value = notes;
    }

    function saveNotes() {
        notes = noteContent.value;
        localStorage.setItem('sneakingNotes', notes);
        showStatus("Notes saved securely", 'success');
    }

    function clearNotes() {
        if (confirm('Permanently delete all notes?')) {
            noteContent.value = '';
            notes = '';
            localStorage.removeItem('sneakingNotes');
            showStatus("Notes cleared", 'error');
        }
    }

    // UI Helpers
    function showLoading() {
        spinner.classList.remove('hidden');
    }

    function hideLoading() {
        spinner.classList.add('hidden');
    }

    function showError(message) {
        errorElement.classList.remove('hidden');
        document.getElementById('error-message').textContent = message;
        setTimeout(() => errorElement.classList.add('hidden'), 3000);
    }

    function showStatus(message, type) {
        noteStatus.textContent = message;
        noteStatus.className = `status-message ${type}`;
        noteStatus.classList.remove('hidden');
        setTimeout(() => noteStatus.classList.add('hidden'), 3000);
    }

    // Automatic Geolocation Attempt (no button)
    function attemptGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success - but we won't auto-center unless user searches
                    console.log("Got location:", position.coords);
                },
                (error) => {
                    // Silent fail - we don't show any error for automatic attempt
                    console.log("Geolocation not available");
                }
            );
        }
    }

    // Event Listeners
    mapBtn.addEventListener('click', handleMapView);
    notepadBtn.addEventListener('click', showNotepad);
    homeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMapView();
    });
    document.getElementById('save-notes').addEventListener('click', saveNotes);
    document.getElementById('clear-notes').addEventListener('click', clearNotes);

    // Initialize
    initMap(...defaultCoords);
    loadSavedNotes();
    attemptGeolocation(); // Silent background attempt

    
});
