(function () {
    map = L.map('map', {
        scrollWheelZoom: false
    }).setView([48.1534215, 11.5505308], 13);
    map.on('focus', function () {
        map.scrollWheelZoom.enable();
    });
    map.on('blur', function () {
        map.scrollWheelZoom.disable();
    });
    L.tileLayer.provider('Stadia.OSMBright').addTo(map);
    var geojson = new L.geoJSON(campusJSON, {style: campusStyle})
    geojson.addTo(map);

    checkZoomControls();
    document.getElementById("zoomCheck").onclick = checkZoomControls;
    var lothstrM = L.marker([48.15500, 11.55581]).addTo(map);
    var karlstrM = L.marker([48.14284, 11.56842]).addTo(map);
    var pasingM = L.marker([48.14163, 11.45095]).addTo(map);
    
    lothstrM.bindPopup("<h5>Campus Lothstr.</h5><p>Hauptcampus der Hochschule München</p>");
    karlstrM.bindPopup("<h5>Campus Karlstr.</h5><p>Campus für Bauwesen und Geoinformation</p>");
    pasingM.bindPopup("<h5>Campus Pasing</h5><p>Campus für Geisteswissenschaften</p>");

    document.getElementById("cardLoth").onclick = zoomToLocation;
    document.getElementById("cardKarl").onclick = zoomToLocation;
    document.getElementById("cardPasing").onclick = zoomToLocation;

    
})();

function checkZoomControls() {
    if (document.getElementById("zoomCheck").checked) {
        document.getElementsByClassName('leaflet-control-zoom')[0].style.display = 'block';
    } else {
        document.getElementsByClassName('leaflet-control-zoom')[0].style.display = 'none';
    }
}

function zoomToLocation(e) {
    var target = e.target
    console.log("zoomTo Click:" + target.id)
    switch (target.id) {
        case "cardLoth":
            map.flyTo([48.15500, 11.55581], 17);
            break;
        case "cardKarl":
            map.flyTo([48.14284, 11.56842], 17);
            break;
        case "cardPasing":
            map.flyTo([48.14163, 11.45095], 17);
            break;
    }
}