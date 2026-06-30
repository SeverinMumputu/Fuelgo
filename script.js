        // === DONNÉES SIMULÉES (Kinshasa) ===
        // Ces données remplacent l'API pour le prototype
        const stations = [
    {
        id: 1,
        name: "Engen Boulevard",
        lat: -4.3075,
        lng: 15.2950,
        price: "2 990 FC",
        stock: 85,
        affluence: "faible",
        hours: "24/7",
        address: "Boulevard du 30 Juin, Gombe",

        hasEssence: true,
        hasGazoil: true,
        is247: true
    },

    {
        id: 2,
        name: "Cobil Kintambo",
        lat: -4.3210,
        lng: 15.2650,
        price: "2 995 FC",
        stock: 15,
        affluence: "forte",
        hours: "06h - 23h",
        address: "Magasin Kintambo",

        hasEssence: true,
        hasGazoil: false,
        is247: false
    },

    {
        id: 3,
        name: "TotalEnergies Limete",
        lat: -4.3350,
        lng: 15.3280,
        price: "2 995 FC",
        stock: 50,
        affluence: "moderee",
        hours: "24/7",
        address: "1ère Rue Limete",

        hasEssence: true,
        hasGazoil: true,
        is247: true
    },

    {
        id: 4,
        name: "Sonahydroc Socimat",
        lat: -4.3120,
        lng: 15.2810,
        price: "2 990 FC",
        stock: 95,
        affluence: "faible",
        hours: "24/7",
        address: "Rond-point Socimat",

        hasEssence: true,
        hasGazoil: true,
        is247: true
    },

    {
        id: 5,
        name: "Engen Bandal",
        lat: -4.3400,
        lng: 15.2850,
        price: "2 995 FC",
        stock: 80,
        affluence: "indisponible",
        hours: "Fermé",
        address: "Bandalungwa Tshibangu",

        hasEssence: false,
        hasGazoil: true,
        is247: false
    },

    {
        id: 6,
        name: "TotalEnergies Gombe",
        lat: -4.3165,
        lng: 15.3045,
        price: "2 990 FC",
        stock: 70,
        affluence: "moderee",
        hours: "24/7",
        address: "Avenue des Aviateurs",

        hasEssence: false,
        hasGazoil: true,
        is247: true
    },

    {
        id: 7,
        name: "Cobil Ngaliema",
        lat: -4.3275,
        lng: 15.2460,
        price: "2 995 FC",
        stock: 60,
        affluence: "faible",
        hours: "05h - 22h",
        address: "Route Matadi",

        hasEssence: true,
        hasGazoil: false,
        is247: false
    },

    {
        id: 8,
        name: "Engen Masina",
        lat: -4.3855,
        lng: 15.4120,
        price: "2 995 FC",
        stock: 45,
        affluence: "moderee",
        hours: "24/7",
        address: "Boulevard Lumumba",

        hasEssence: true,
        hasGazoil: true,
        is247: true
    }
];

        let map, userMarker, routingLine;
        let markersLayer; // Calque pour gérer dynamiquement l'affichage des marqueurs
        let userLocation = [-4.3150, 15.2900]; // Coordonnées simulées par défaut (Gombe)
        
        // États globaux pour la recherche et les filtres
        let currentSearch = "";
        let activeFilters = { essence: false, gazoil: false, open247: false };

        // === INITIALISATION DE LA CARTE ===
        function initMap() {
            // Création de la carte avec style Premium
            map = L.map('map', {
                zoomControl: false, // On cache le zoom par défaut pour le recréer
                attributionControl: false
            }).setView(userLocation, 14);

            // Ajout du contrôle de zoom en bas à droite (Style Apple)
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Utilisation d'un fond de carte épuré et premium (CartoDB Positron/Voyager)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);

            // Initialisation du LayerGroup Leaflet pour manipuler les marqueurs
            markersLayer = L.layerGroup().addTo(map);

            // Placement initial dynamique des stations
            renderMarkers();

            // Ajout de la position de l'utilisateur (Simulée au départ)
            updateUserMarker(userLocation);
        }

        // === GESTION DYNAMIQUE DES MARQUEURS (RECHERCHE & FILTRES) ===
        function renderMarkers() {
            markersLayer.clearLayers(); // Nettoyage de la carte

            // Filtrage des stations selon les critères actifs
            const filteredStations = getFilteredStations();

            /*
            const filteredStations = stations.filter(station => {

                const matchSearch =
                    station.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
                    station.address.toLowerCase().includes(currentSearch.toLowerCase());

                if (activeFilters.essence && !station.hasEssence) return false;

                if (activeFilters.gazoil && !station.hasGazoil) return false;

                if (activeFilters.open247 && !station.is247) return false;

                return matchSearch;

                });*/

            // Affichage du résultat filtré
            filteredStations.forEach(station => {
                let color1 = station.stock > 20 ? '#0071E3' : '#FF3B30';
                let color2 = station.stock > 20 ? '#004494' : '#990000';
                let opacity = station.stock === 0 ? 'opacity: 0.5; filter: grayscale(1);' : '';

                let markerIcon = "ph-gas-pump";

                if (station.hasGazoil && !station.hasEssence) {
                    markerIcon = "ph-drop";
                }

                if (station.is247) {
                    markerIcon = "ph-clock-clockwise";
                }
                const customIcon = L.divIcon({
                    className: 'custom-station-icon',
                    html: `
                        <div class="station-marker" style="${opacity}" onclick="showStationDetails(${station.id})">
                            <div class="marker-pin" style="background: linear-gradient(135deg, ${color1}, ${color2});">
                                <i class="ph-fill ${markerIcon} marker-icon"></i>
                            </div>
                            <div class="marker-shadow"></div>
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                });

                L.marker([station.lat, station.lng], { icon: customIcon }).addTo(markersLayer);
            });
            //Vérification station
            console.log(filteredStations);
        }

        function getFilteredStations(){

    return stations.filter(station=>{

        const matchSearch =
            station.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
            station.address.toLowerCase().includes(currentSearch.toLowerCase());

        if(activeFilters.essence && !station.hasEssence) return false;

        if(activeFilters.gazoil && !station.hasGazoil) return false;

        if(activeFilters.open247 && !station.is247) return false;

        return matchSearch;

    });

    }

        // Actions de la barre de recherche
        function handleSearch(value) {
            currentSearch = value;
            renderMarkers();
        }

        // Actions des filtres avec style Premium dynamique
        function toggleFilter(filterType) {

    // Les filtres Essence et Gazoil sont exclusifs
    if (filterType === "essence" || filterType === "gazoil") {

        // Si on reclique sur le filtre actif → désactivation
        if (activeFilters[filterType]) {
            activeFilters[filterType] = false;
        } else {

            // Désactiver les deux filtres carburant
            activeFilters.essence = false;
            activeFilters.gazoil = false;

            // Activer uniquement celui sélectionné
            activeFilters[filterType] = true;
        }

    } else {
        // Open247 reste indépendant
        activeFilters.open247 = !activeFilters.open247;
    }
    console.log(activeFilters);
    updateFilterButtons();
    renderMarkers();
}

function updateFilterButtons() {

    // Réinitialisation complète
    document.querySelectorAll('[id^="btn-filter-"]').forEach(btn => {
        btn.classList.remove("dark-glass", "text-white");
        btn.classList.add("glass", "text-apple-dark");
    });

    // Activation des filtres réellement actifs
    Object.keys(activeFilters).forEach(filter => {

        if (activeFilters[filter]) {

            const btn = document.getElementById("btn-filter-" + filter);

            btn.classList.remove("glass", "text-apple-dark");
            btn.classList.add("dark-glass", "text-white");

        }

    });

}

        // === MARQUEUR UTILISATEUR ===
        function updateUserMarker(latlng) {
            if (userMarker) map.removeLayer(userMarker);
            
            const userIcon = L.divIcon({
                className: 'user-location',
                html: `
                    <div class="user-loc-marker">
                        <div class="pulse-ring"></div>
                        <div class="pulse-core"></div>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            userMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        }

        // === LOGIQUE DE GÉOLOCALISATION & STATION LA PLUS PROCHE ===
        function findNearestStation() {
            const btn = document.getElementById('btn-nearest');
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Localisation...';
            
            // Inviter le client à partager sa position physique (API HTML5 Geolocation)
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Position accordée : mise à jour physique
                        userLocation = [position.coords.latitude, position.coords.longitude];
                        updateUserMarker(userLocation);
                        map.setView(userLocation, 14); // Recadrage sur la personne
                        calculateAndDrawNearest();
                    },
                    (error) => {
                        // Position refusée ou introuvable : Alerte respectueuse et fallback
                        showPopup(
"Pour une précision optimale du trajet, veuillez autoriser l'accès à votre position géographique.<br><br>Utilisation de la position de simulation en attendant.");
                        calculateAndDrawNearest();
                    },
                    { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
                );
            } else {
                showPopup(
"La géolocalisation n'est pas supportée par votre navigateur."
);
                calculateAndDrawNearest();
            }
            
            function calculateAndDrawNearest() {
                // Algorithme basique pour trouver la station la plus proche (Distance Euclidienne simulée)
                let nearest = null;
                let minDistance = Infinity;

                const availableStations = getFilteredStations();

                    availableStations.forEach(station=>{
                    if(station.stock > 0) { // On ignore les stations en rupture
                        const dx = station.lat - userLocation[0];
                        const dy = station.lng - userLocation[1];
                        const distance = Math.sqrt(dx*dx + dy*dy);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearest = station;
                        }
                    }
                });

                if (nearest) {
                    drawRoute(userLocation, [nearest.lat, nearest.lng]);
                    showStationDetails(nearest.id);
                    
                    // Centrer la carte pour voir l'itinéraire
                    const bounds = L.latLngBounds([userLocation, [nearest.lat, nearest.lng]]);
                    map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
                }

                btn.innerHTML = '<i class="ph-fill ph-navigation-arrow text-xl"></i> Station la plus proche';
                btn.classList.add('hidden'); // On cache le bouton une fois trouvé
            }
        }

        // === DESSINER L'ITINÉRAIRE ===
        function drawRoute(start, end) {
            if (routingLine) map.removeLayer(routingLine);
            
            // Ligne de fond (ombre)
            L.polyline([start, end], { color: '#004494', weight: 6, opacity: 0.2 }).addTo(map);
            
            // Ligne animée principale (Style Yango/Premium)
            routingLine = L.polyline([start, end], { 
                color: '#0071E3', 
                weight: 4,
                className: 'route-line'
            }).addTo(map);
        }

        // === INTERFACE UTILISATEUR ===
        function showStationDetails(id) {
            const station = stations.find(s => s.id === id);
            if(!station) return;

            // Remplissage des données
            document.getElementById('panel-name').innerText = station.name;
            document.getElementById('panel-distance').innerHTML = `<i class="ph ph-map-pin"></i> Simulation trajet • ${station.address}`;
            document.getElementById('panel-price').innerText = station.price;
            document.getElementById('panel-hours').innerText = station.hours;
            
            // Logique de stock
            const stockBar = document.getElementById('panel-stock-bar');
            const stockText = document.getElementById('panel-stock-text');
            stockBar.style.width = station.stock + '%';
            
            if(station.stock > 50) {
                stockBar.className = 'h-full rounded-full transition-all duration-1000 bg-apple-green';
                stockText.innerText = 'Élevée';
                stockText.className = 'font-bold text-apple-green';
            } else if (station.stock > 20) {
                stockBar.className = 'h-full rounded-full transition-all duration-1000 bg-apple-orange';
                stockText.innerText = 'Moyenne';
                stockText.className = 'font-bold text-apple-orange';
            } else {
                stockBar.className = 'h-full rounded-full transition-all duration-1000 bg-apple-red';
                stockText.innerText = station.stock === 0 ? 'En Rupture' : 'Critique';
                stockText.className = 'font-bold text-apple-red';
            }

            // Logique d'affluence
            const affIcon = document.getElementById('panel-affluence-icon');
            const affText = document.getElementById('panel-affluence-text');
            if(station.affluence === 'faible') {
                affIcon.className = 'w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-apple-green';
                affText.innerText = "Fluide (Pas d'attente)";
                document.getElementById('panel-time').innerText = "4 min";
            } else if(station.affluence === 'moderee') {
                affIcon.className = 'w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-apple-orange';
                affText.innerText = "Modérée (Quelques véhicules)";
                document.getElementById('panel-time').innerText = "8 min";
            } else {
                affIcon.className = 'w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-apple-red';
                affText.innerText = "Forte (Embouteillage probable)";
                document.getElementById('panel-time').innerText = "15 min";
            }

            //autres services
            const services = [];

            if(station.hasEssence){
                services.push("⛽ Essence");
            }

            if(station.hasGazoil){
                services.push("🛢 Gazoil");
            }

            if(station.is247){
                services.push("🕒 24/7");
            }

            document.getElementById("panel-services").innerHTML =
            services.join(" • ");

            // Afficher le panneau
            const panel = document.getElementById('station-panel');
            panel.classList.remove('slide-up-hidden');
            document.getElementById('btn-nearest').classList.add('hidden');
        }

        function closePanel() {
            document.getElementById('station-panel').classList.add('slide-up-hidden');
            setTimeout(() => {
                document.getElementById('btn-nearest').classList.remove('hidden');
            }, 300); // Réafficher le bouton après l'animation
        }

        function showPopup(message){

    document.getElementById("popup-message").innerHTML = message;

    const popup = document.getElementById("premium-popup");

    popup.classList.remove("hidden");

    popup.classList.add("flex");

}

function closePopup(){

    const popup = document.getElementById("premium-popup");

    popup.classList.remove("flex");

    popup.classList.add("hidden");

}

        // === SIMULATION GOOGLE LOGIN ===
        function login() {
            // Effet visuel
            const loginScreen = document.getElementById('login-screen');
            loginScreen.style.transition = 'opacity 0.6s ease';
            loginScreen.style.opacity = '0';
            
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                document.getElementById('app-screen').classList.remove('hidden');
                initMap(); // On initialise la carte uniquement une fois connecté
            }, 600);
        }