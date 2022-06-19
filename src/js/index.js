
    map = L.map('map', {
        scrollWheelZoom: false
    }).setView([48.1534215, 11.5505308], 1);
    map.on('focus', function () {
        map.scrollWheelZoom.enable();
    });
    map.on('blur', function () {
        map.scrollWheelZoom.disable();
    });
    L.tileLayer.provider('Stadia.OSMBright').addTo(map);
    var geojson = L.geoJSON(countriesJSON, {style: style, onEachFeature: onEachFeature});
    geojson.addTo(map);

    checkZoomControls();
    document.getElementById("zoomCheck").onclick = checkZoomControls;

function checkZoomControls() {
    if (document.getElementById("zoomCheck").checked) {
        document.getElementsByClassName('leaflet-control-zoom')[0].style.display = 'block';
    } else {
        document.getElementsByClassName('leaflet-control-zoom')[0].style.display = 'none';
    }
}

function onEachFeature(feature,layer){
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: 'white',
        dashArray: '',
        fillOpacity: .7
    });

    if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge){
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function getColor(i){
    return i >= 90 ? '#7f0000':
           i >= 80 ? '#b30000':
           i >= 70 ? '#d7301f':
           i >= 60 ? '#ef6548':
           i >= 50 ? '#fc8d59':
           i >= 40 ? '#fdbb84':
           i >= 30 ? '#fdd49e':
           i >= 20 ? '#fee8c8':
           i >= 10 ? '#fff7ec':
           '#fffefc';
}

function style(feature){
    return {
        fillColor: getColor(20),
        weight: 2,
        opacity: 1,
        color : 'white',
        dashArray: '5',
        fillOpacity: .7
    }
}

