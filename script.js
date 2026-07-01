
        // === DONNÉES ET MAP DE BASE ===
        const stations = [
            { id: 1, name: "Engen Boulevard", lat: -4.3075, lng: 15.2950, price: "2 990 FC", stock: 85, affluence: "faible", hours: "24/7", address: "Boulevard du 30 Juin, Gombe", hasEssence: true, hasGazoil: true, is247: true },
            { id: 2, name: "Cobil Kintambo", lat: -4.3210, lng: 15.2650, price: "2 995 FC", stock: 15, affluence: "forte", hours: "06h - 23h", address: "Magasin Kintambo", hasEssence: true, hasGazoil: false, is247: false },
            { id: 3, name: "TotalEnergies Limete", lat: -4.3350, lng: 15.3280, price: "2 995 FC", stock: 50, affluence: "moderee", hours: "24/7", address: "1ère Rue Limete", hasEssence: true, hasGazoil: true, is247: true },
            { id: 4, name: "Sonahydroc Socimat", lat: -4.3120, lng: 15.2810, price: "2 990 FC", stock: 95, affluence: "faible", hours: "24/7", address: "Rond-point Socimat", hasEssence: true, hasGazoil: true, is247: true },
            { id: 5, name: "Engen Bandal", lat: -4.3400, lng: 15.2850, price: "2 995 FC", stock: 0, affluence: "indisponible", hours: "Fermé", address: "Bandalungwa Tshibangu", hasEssence: false, hasGazoil: true, is247: false }
        ];

        let map, userMarker, routingLine, markersLayer;
        let userLocation = [-4.3150, 15.2900];
        let currentDestination = null; // Nouvelle variable pour mémoriser la cible
        let currentSearch = "";
        let activeFilters = { essence: false, gazoil: false, open247: false };

        function initMap() {
            map = L.map('map', { zoomControl: false, attributionControl: false }).setView(userLocation, 14);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
            markersLayer = L.layerGroup().addTo(map);
            renderMarkers();
            updateUserMarker(userLocation);
        }

        function renderMarkers() {
            markersLayer.clearLayers();
            const filteredStations = stations.filter(s => {
                const matchSearch = s.name.toLowerCase().includes(currentSearch.toLowerCase()) || s.address.toLowerCase().includes(currentSearch.toLowerCase());
                const matchEssence = !activeFilters.essence || s.hasEssence;
                const matchGazoil = !activeFilters.gazoil || s.hasGazoil;
                const match247 = !activeFilters.open247 || s.is247;
                return matchSearch && matchEssence && matchGazoil && match247;
            });
            filteredStations.forEach(s => {
                let color1 = s.stock > 20 ? '#0071E3' : '#FF3B30', color2 = s.stock > 20 ? '#004494' : '#990000';
                let opacity = s.stock === 0 ? 'opacity: 0.5; filter: grayscale(1);' : '';
                const customIcon = L.divIcon({
                    className: 'custom-station-icon',
                    html: `<div class="station-marker" style="${opacity}" onclick="showStationDetails(${s.id})"><div class="marker-pin" style="background: linear-gradient(135deg, ${color1}, ${color2});"><i class="ph-fill ph-gas-pump marker-icon"></i></div><div class="marker-shadow"></div></div>`,
                    iconSize: [40, 40], iconAnchor: [20, 40]
                });
                L.marker([s.lat, s.lng], { icon: customIcon }).addTo(markersLayer);
            });
        }

        function handleSearch(val) { currentSearch = val; renderMarkers(); }
        function toggleFilter(type) {
            activeFilters[type] = !activeFilters[type];
            const btn = document.getElementById('btn-filter-' + type);
            if (activeFilters[type]) { btn.classList.replace('glass', 'dark-glass'); btn.classList.replace('text-apple-dark', 'text-white'); } 
            else { btn.classList.replace('dark-glass', 'glass'); btn.classList.replace('text-white', 'text-apple-dark'); }
            renderMarkers();
        }

        function updateUserMarker(latlng) {
            if (userMarker) map.removeLayer(userMarker);
            const userIcon = L.divIcon({ className: 'user-location', html: `<div class="user-loc-marker"><div class="pulse-ring"></div><div class="pulse-core"></div></div>`, iconSize: [40, 40], iconAnchor: [20, 20] });
            userMarker = L.marker(latlng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        }

        function findNearestStation() {
            const btn = document.getElementById('btn-nearest');
            btn.innerHTML = '<i class="ph ph-spinner animate-spin text-xl"></i> Localisation...';
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLocation = [position.coords.latitude, position.coords.longitude];
                        updateUserMarker(userLocation); map.setView(userLocation, 14); calculateAndDrawNearest();
                    },
                    (error) => { alert("Utilisation de la position de simulation en attendant."); calculateAndDrawNearest(); },
                    { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
                );
            } else { calculateAndDrawNearest(); }
            
            function calculateAndDrawNearest() {
                let nearest = null, minDistance = Infinity;
                stations.forEach(s => {
                    if(s.stock > 0) {
                        const dist = Math.sqrt(Math.pow(s.lat - userLocation[0], 2) + Math.pow(s.lng - userLocation[1], 2));
                        if (dist < minDistance) { minDistance = dist; nearest = s; }
                    }
                });
                if (nearest) {
                    drawRoute(userLocation, [nearest.lat, nearest.lng]);
                    showStationDetails(nearest.id);
                    map.fitBounds(L.latLngBounds([userLocation, [nearest.lat, nearest.lng]]), { padding: [50, 50], animate: true, duration: 1 });
                }
                btn.innerHTML = '<i class="ph-fill ph-navigation-arrow text-xl"></i> Station la plus proche';
                btn.classList.add('hidden');
            }
        }

        function drawRoute(start, end) {
            if (routingLine) map.removeLayer(routingLine);
            L.polyline([start, end], { color: '#004494', weight: 6, opacity: 0.2 }).addTo(map);
            routingLine = L.polyline([start, end], { color: '#0071E3', weight: 4, className: 'route-line' }).addTo(map);
        }

        function showStationDetails(id) {
            const s = stations.find(s => s.id === id); if(!s) return;
            
            currentDestination = [s.lat, s.lng]; // Mémorisation de la destination pour la navigation

            document.getElementById('panel-name').innerText = s.name;
            document.getElementById('panel-distance').innerHTML = `<i class="ph ph-map-pin shrink-0"></i> <span class="truncate">Simulation trajet • ${s.address}</span>`;
            document.getElementById('panel-price').innerText = s.price;
            document.getElementById('panel-hours').innerText = s.hours;
            const bar = document.getElementById('panel-stock-bar'), text = document.getElementById('panel-stock-text');
            bar.style.width = s.stock + '%';
            if(s.stock > 50) { bar.className = 'h-full bg-apple-green rounded-full'; text.innerText = 'Élevée'; text.className = 'font-bold text-apple-green'; }
            else if (s.stock > 20) { bar.className = 'h-full bg-apple-orange rounded-full'; text.innerText = 'Moyenne'; text.className = 'font-bold text-apple-orange'; }
            else { bar.className = 'h-full bg-apple-red rounded-full'; text.innerText = s.stock===0?'En Rupture':'Critique'; text.className = 'font-bold text-apple-red'; }
            
            const aIcon = document.getElementById('panel-affluence-icon'), aText = document.getElementById('panel-affluence-text');
            if(s.affluence === 'faible') { aIcon.className = 'w-8 h-8 shrink-0 bg-green-100 text-apple-green rounded-full flex items-center justify-center'; aText.innerText = "Fluide"; document.getElementById('panel-time').innerText="4 min"; }
            else if(s.affluence === 'moderee') { aIcon.className = 'w-8 h-8 shrink-0 bg-orange-100 text-apple-orange rounded-full flex items-center justify-center'; aText.innerText = "Modérée"; document.getElementById('panel-time').innerText="8 min"; }
            else { aIcon.className = 'w-8 h-8 shrink-0 bg-red-100 text-apple-red rounded-full flex items-center justify-center'; aText.innerText = "Forte"; document.getElementById('panel-time').innerText="15 min"; }
            
            document.getElementById('station-panel').classList.remove('slide-up-hidden');
            document.getElementById('btn-nearest').classList.add('hidden');
        }

        function closePanel() { 
            document.getElementById('station-panel').classList.add('slide-up-hidden'); 
            setTimeout(() => { document.getElementById('btn-nearest').classList.remove('hidden'); }, 300); 
        }

        function login() {
            const scr = document.getElementById('login-screen'); scr.style.transition = 'opacity 0.6s'; scr.style.opacity = '0';
            setTimeout(() => { scr.classList.add('hidden'); document.getElementById('app-screen').classList.remove('hidden'); initMap(); }, 600);
        }

        // ==============================================================
        // ANIMATION EN TEMPS RÉEL DU VÉHICULE (Style Uber/Yango)
        // ==============================================================
        function startNavigationSimulation() {
            if (!currentDestination) return;

            // Masquer manuellement le panneau sans interférer avec le timeout standard
            document.getElementById('station-panel').classList.add('slide-up-hidden');

            const btnNearest = document.getElementById('btn-nearest');
            btnNearest.classList.remove('hidden');
            btnNearest.innerHTML = '<i class="ph-fill ph-car-profile text-xl"></i> Navigation en cours...';
            btnNearest.classList.remove('bg-apple-dark');
            btnNearest.classList.add('bg-apple-blue', 'animate-pulse');
            btnNearest.onclick = null; // Désactiver les clics pendant la route

            const startLatLng = [...userLocation];
            const endLatLng = [...currentDestination];

            // Calcul de l'angle pour orienter la voiture vers la station
            const dx = endLatLng[1] - startLatLng[1];
            const dy = endLatLng[0] - startLatLng[0];
            const angle = 90 - (Math.atan2(dy, dx) * 180 / Math.PI); 

            // Remplacement de l'icône utilisateur par une icône de navigation Premium
            const carIcon = L.divIcon({
                className: 'moving-car-icon',
                html: `<div class="w-10 h-10 bg-white rounded-full shadow-[0_10px_20px_rgba(0,113,227,0.4)] flex items-center justify-center border-[3px] border-apple-blue transition-transform" style="transform: rotate(${angle}deg);">
                          <i class="ph-fill ph-navigation-arrow text-xl text-apple-blue"></i>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            userMarker.setIcon(carIcon);
            userMarker.setZIndexOffset(2000);

            // Zoom focus sur la voiture avant le démarrage
            map.flyTo(startLatLng, 16, { animate: true, duration: 1.5 });

            // Lancement de la course
            setTimeout(() => {
                const duration = 6000; // La simulation dure 6 secondes
                const frames = 180;    // 30 images par seconde
                let currentFrame = 0;

                const animation = setInterval(() => {
                    currentFrame++;
                    const progress = currentFrame / frames;
                    
                    // Adoucir le démarrage et l'arrivée (Ease In-Out)
                    const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

                    // Calcul position intermédiaire
                    const currentLat = startLatLng[0] + (endLatLng[0] - startLatLng[0]) * easeProgress;
                    const currentLng = startLatLng[1] + (endLatLng[1] - startLatLng[1]) * easeProgress;
                    const newPos = [currentLat, currentLng];

                    userMarker.setLatLng(newPos);
                    userLocation = newPos; 
                    
                    // Caméra suit le véhicule (comme Yango)
                    map.panTo(newPos, { animate: false }); 

                    // Réduire la ligne du trajet parcouru dynamiquement
                    if (routingLine) {
                        routingLine.setLatLngs([newPos, endLatLng]); 
                    }

                    if (currentFrame >= frames) {
                        clearInterval(animation);
                        
                        // Interface d'arrivée
                        btnNearest.innerHTML = '<i class="ph-fill ph-check-circle text-xl"></i> Arrivé à destination !';
                        btnNearest.classList.remove('animate-pulse', 'bg-apple-blue');
                        btnNearest.classList.add('bg-apple-green');
                        
                        // Réinitialisation après le trajet
                        setTimeout(() => {
                            updateUserMarker(userLocation); // Retour à l'icône de base (Pulse)
                            btnNearest.classList.remove('bg-apple-green');
                            btnNearest.classList.add('bg-apple-dark');
                            btnNearest.innerHTML = '<i class="ph-fill ph-navigation-arrow text-lg sm:text-xl"></i> Station la plus proche';
                            btnNearest.onclick = findNearestStation;
                            if (routingLine) map.removeLayer(routingLine);
                            map.setZoom(14); 
                            currentDestination = null;
                        }, 4000);
                    }
                }, duration / frames);
            }, 1600); // Début après la fin de l'animation de FlyTo
        }

        // ==============================================================
        // LOGIQUE DES NOUVEAUX MODULES (MENU, COMPARAISON, COMMANDE, SOS)
        // ==============================================================

        let isMenuOpen = false;
        function toggleMenu() {
            const overlay = document.getElementById('user-menu-overlay');
            const panel = document.getElementById('user-menu-panel');
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                panel.classList.remove('menu-hidden');
            } else {
                overlay.classList.add('opacity-0', 'pointer-events-none');
                panel.classList.add('menu-hidden');
            }
        }

        function menuToNearestStation() {
            toggleMenu();
            setTimeout(() => { findNearestStation(); }, 300);
        }

        function startFlow(flowId) {
            toggleMenu();
            setTimeout(() => {
                document.getElementById('flow-' + flowId).classList.remove('hidden');
                document.getElementById('flow-' + flowId).classList.add('flex');
                
                // Réinitialisation visuelle par sécurité
                if(flowId === 'comparaison') {
                    document.getElementById('comp-step-1').classList.remove('hidden');
                    document.getElementById('comp-step-2').classList.add('hidden');
                    document.getElementById('comp-step-3').classList.add('hidden');
                    document.getElementById('comp-step-4').classList.add('hidden');
                } else if(flowId === 'commande') {
                    for(let i=1; i<=6; i++) {
                        document.getElementById('cmd-step-'+i).classList.add('hidden');
                        document.getElementById('cmd-prog-'+i).className = "w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white transition-colors";
                    }
                    document.getElementById('cmd-step-1').classList.remove('hidden');
                    document.getElementById('cmd-prog-1').className = "w-6 h-6 rounded-full bg-apple-blue text-white flex items-center justify-center text-xs font-bold ring-4 ring-white";
                    document.getElementById('cmd-tracking').classList.add('hidden');
                } else if(flowId === 'sos') {
                    for(let i=1; i<=4; i++) document.getElementById('sos-step-'+i).classList.add('hidden');
                    document.getElementById('sos-step-1').classList.remove('hidden');
                    document.getElementById('sos-tracking').classList.add('hidden');
                }
            }, 300);
        }

        function closeFlow(flowId) {
            document.getElementById('flow-' + flowId).classList.add('hidden');
            document.getElementById('flow-' + flowId).classList.remove('flex');
        }

        // --- Logique: Comparaison ---
        let compSelections = { commune: '', carburant: '' };
        function compSelect(type, element, value) {
            const parent = element.parentElement;
            Array.from(parent.children).forEach(child => child.classList.remove('active'));
            element.classList.add('active');
            compSelections[type] = value;
            if(type === 'commune') { document.getElementById('comp-btn-1').classList.remove('opacity-50', 'pointer-events-none'); }
            if(type === 'carburant') { document.getElementById('comp-btn-2').classList.remove('opacity-50', 'pointer-events-none'); }
        }
        function nextCompStep(step) {
            document.getElementById('comp-content').scrollTop = 0;
            if(step === 2) {
                document.getElementById('comp-step-1').classList.add('hidden');
                document.getElementById('comp-step-2').classList.remove('hidden');
            } else if(step === 3) {
                document.getElementById('comp-step-2').classList.add('hidden');
                document.getElementById('comp-step-3').classList.remove('hidden');
                document.getElementById('comp-step-3').classList.add('flex');
                
                // Simulation du chargement et affichage résultats
                setTimeout(() => {
                    document.getElementById('comp-step-3').classList.remove('flex');
                    document.getElementById('comp-step-3').classList.add('hidden');
                    document.getElementById('comp-step-4').classList.remove('hidden');
                    document.getElementById('comp-res-title').innerText = `${compSelections.carburant} à ${compSelections.commune}`;
                }, 1500);
            }
        }

        // --- Logique: Commande ---
        function cmdSelect(type, element) {
            const parent = element.parentElement;
            Array.from(parent.children).forEach(child => {
                child.classList.remove('active', 'border-apple-blue', 'bg-blue-50');
                if(child.querySelector('.icon-container')) { child.querySelector('.icon-container').classList.replace('text-apple-blue', 'text-gray-400'); }
            });
            element.classList.add('active', 'border-apple-blue', 'bg-blue-50');
            if(element.querySelector('.icon-container')) { element.querySelector('.icon-container').classList.replace('text-gray-400', 'text-apple-blue'); }
            
            // Deblocage des boutons "Suivant"
            if(type === 'carb') document.getElementById('cmd-btn-1').classList.remove('opacity-50', 'pointer-events-none');
            if(type === 'qte') document.getElementById('cmd-btn-2').classList.remove('opacity-50', 'pointer-events-none');
            if(type === 'loc') document.getElementById('cmd-btn-3').classList.remove('opacity-50', 'pointer-events-none');
            if(type === 'veh') document.getElementById('cmd-btn-4').classList.remove('opacity-50', 'pointer-events-none');
            if(type === 'liv') document.getElementById('cmd-btn-5').classList.remove('opacity-50', 'pointer-events-none');
        }
        function nextCmdStep(step) {
            for(let i=1; i<=6; i++) document.getElementById('cmd-step-'+i).classList.add('hidden');
            document.getElementById('cmd-step-'+step).classList.remove('hidden');
            
            // Mise à jour de la barre de progression
            for(let i=1; i<=6; i++) {
                const p = document.getElementById('cmd-prog-'+i);
                if(i < step) p.className = "w-6 h-6 rounded-full bg-apple-blue text-white flex items-center justify-center text-xs font-bold ring-4 ring-white";
                else if(i === step) p.className = "w-6 h-6 rounded-full bg-apple-blue text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-lg";
                else p.className = "w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold ring-4 ring-white";
            }
        }
        function cmdFinish() {
            document.getElementById('cmd-step-6').classList.add('hidden');
            document.getElementById('cmd-progress').classList.add('hidden');
            document.getElementById('cmd-tracking').classList.remove('hidden');
        }

        // --- Logique: SOS Dépannage ---
        function sosSelect(type, element) {
            const parent = element.parentElement;
            Array.from(parent.children).forEach(child => {
                child.classList.remove('active', 'border-apple-red', 'bg-red-50');
                if(child.querySelector('.icon-container')) { child.querySelector('.icon-container').classList.remove('text-apple-red'); child.querySelector('.icon-container').classList.add('text-gray-700', 'text-gray-400'); }
            });
            element.classList.add('active', 'border-apple-red', 'bg-red-50');
            if(element.querySelector('.icon-container')) { element.querySelector('.icon-container').classList.remove('text-gray-700', 'text-gray-400'); element.querySelector('.icon-container').classList.add('text-apple-red'); }
            
            if(type === 'prob') document.getElementById('sos-btn-1').classList.remove('opacity-50', 'pointer-events-none');
        }
        function nextSosStep(step) {
            for(let i=1; i<=4; i++) document.getElementById('sos-step-'+i).classList.add('hidden');
            document.getElementById('sos-step-'+step).classList.remove('hidden');
        }
        function sosFinish() {
            document.getElementById('sos-step-4').classList.add('hidden');
            document.getElementById('sos-tracking').classList.remove('hidden');
        }
