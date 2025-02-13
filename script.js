function initMap() {
    // Default location: Dwarka, Gujarat (fallback)
    let defaultLocation = { lat: 22.2383, lng: 68.9607 };

    // Create the map and center it on the default location
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: defaultLocation,
    });

    // Add a marker to the default location
    let marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: "Dwarka, Gujarat",
    });

    // Add user location
    const userLocationIcon = {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue dot icon
        scaledSize: new google.maps.Size(40, 40), // Resize the icon
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            // Update defaultLocation to the user's location
            defaultLocation = pos;
            map.setCenter(pos);
            map.setZoom(15);

            new google.maps.Marker({
                position: pos,
                map: map,
                title: 'Your Location',
                icon: userLocationIcon,
            });
        });
    }

    // Function to search for places by category
    function searchPlaces(category) {
        const request = {
            location: defaultLocation,
            radius: 1000, // Search within a 3km radius
            type: [category], // Category to search for
        };

        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Clear existing markers
                marker.setMap(null);

                // Add markers for each place found
                results.forEach((place) => {
                    const marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        title: place.name,
                    });

                    // Create an Info Window for the marker
                    const infowindow = new google.maps.InfoWindow({
                        content: `<div>
                                    <strong>${place.name}</strong><br>
                                    ${place.vicinity || 'Address not available'}<br>
                                    Rating: ${place.rating || 'No rating'}
                                  </div>`,
                    });

                    // Add a click event listener to the marker
                    marker.addListener('click', () => {
                        // Close any previously opened Info Window
                        if (currentInfoWindow) {
                            currentInfoWindow.close();
                        }
                        // Open the Info Window for the clicked marker
                        infowindow.open(map, marker);
                        currentInfoWindow = infowindow;
                    });
                });
            }
        });
    }

    // Add buttons for categories
    const categories = ["restaurant", "Petrol", "Hotels", "Hospitals", "Cafes", "Pharmacies", "ATMs", "Shopping Malls", "Parks", "Gyms"];
    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "10px";
    document.body.insertBefore(buttonContainer, document.getElementById("map"));

    categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.replace("_", " ").toUpperCase(); // Format button text
        button.style.margin = "5px";
        button.addEventListener("click", () => searchPlaces(category));
        buttonContainer.appendChild(button);
    });

    // Search box functionality
    const searchBox = new google.maps.places.SearchBox(document.getElementById("search-box"));

    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }
        defaultLocation = places[0].geometry.location; // Update defaultLocation
        map.setCenter(defaultLocation);

        // Clear existing markers
        marker.setMap(null);

        // Update defaultLocation to the searched location
        defaultLocation = places[0].geometry.location;

        // Center the map on the new location
        map.setCenter(defaultLocation);

        // Add a marker for the searched location
        marker = new google.maps.Marker({
            map: map,
            position: defaultLocation,
            title: places[0].name,
        });
        

        // Fit the map to the bounds of the searched location
        const bounds = new google.maps.LatLngBounds();
        if (places[0].geometry.viewport) {
            bounds.union(places[0].geometry.viewport);
        } else {
            bounds.extend(defaultLocation);
        }
        map.fitBounds(bounds);
    });
}