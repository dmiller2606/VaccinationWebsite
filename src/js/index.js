
map = L.map('map', {
    scrollWheelZoom: false,
    worldCopyJump: true
}).setView([0, 0], 1)

map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

map.on('focus', function () {
    map.scrollWheelZoom.enable();
});
map.on('blur', function () {
    map.scrollWheelZoom.disable();
});
L.tileLayer.provider('CartoDB.VoyagerNoLabels').addTo(map);
L.tileLayer.provider('CartoDB.VoyagerOnlyLabels', { pane: 'labels' }).addTo(map);
var countriesVaccinated = L.geoJSON(countriesJSON, { style: style, onEachFeature: onEachFeature });
countriesVaccinated.addTo(map);
var vaccinatedBundeslaender
var layerControl = L.control.layers(null,{"Vaccinations": countriesVaccinated},{position: 'topleft'}).addTo(map);
getHospitalsGer().then(json => {
    var hospitals = L.geoJSON(json,{style:style,onEachFeature:onEachFeature, pointToLayer: function(feature,latlng){
        var smallIcon = new L.Icon({
            iconSize: [10,10],
            iconAnchor: [5,5],
            popupAnchor: [1, -24],
            iconUrl: 'img/hospital.png'
        });
        return L.marker(latlng,{icon: smallIcon});
    }})
    layerControl.addOverlay(hospitals,"Hospitals Germany")
})

checkZoomControls();
document.getElementById("zoomCheck").onclick = checkZoomControls;

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i>' +
            grades[i] + (grades[i + 1] ? ' &ndash;&#160;' + grades[i + 1] + '%' : '+%') + '<br>';
    }

    return div;
};

legend.addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Population Vaccinated</h4>' + (props ?
        '<b>' + props.NAME_EN + '</b><br />' + lookupRecentIndex(props.WB_A3) + ' people / 100 people'
        : 'Hover over a Country');
};

info.addTo(map);

var chart = L.control({ position: 'bottomleft' });

chart.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
chart.update = function (props) {
    if (props) {
        Chart.overrides.line.spanGaps = true;
        this._div.innerHTML = '<canvas id="vaccinationHistory" width="500" height="200"></canvas>';
        const ctx = document.getElementById('vaccinationHistory').getContext('2d');
        data = lookupData(props.WB_A3)
        console.log(data);
        const vaccinationHistory = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'People Vaccinated / 100 People',
                    data: data,
                    parsing: {
                        yAxisKey: 'people_vaccinated_per_hundred',
                        xAxisKey: 'date'
                    },
                    backgroundColor: getColor(50),
                    tension: .2,
                },{
                    label: 'People fully Vaccinated / 100 People',
                    data: data,
                    parsing: {
                        yAxisKey: 'people_fully_vaccinated_per_hundred',
                        xAxisKey: 'date'
                    },
                    backgroundColor: getColor(80),
                    tension: .2,
                }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Population Vaccinated in ' + props.NAME_EN
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'in %'
                        }
                    }
                }
            }
        })
    } else { 
        this._div.innerHTML = 'Click on a Country for more Information';
    }
};

chart.addTo(map);





async function getHospitalsGer() {
    let url = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Krankenhaus_hospital/FeatureServer/0/query?where=1%3D1&outFields=name&outSR=4326&f=geojson'
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error)
    }
}

function lookupData(countryCode) {
    if (coviddata.find(country => country.iso_code === countryCode) !== undefined) {
        return coviddata.find(dataCountry => dataCountry.iso_code === countryCode).data;
    }
    return undefined;
}

function lookupRecentIndex(countryCode) {
    index = 0
    if (lookupData(countryCode) !== undefined) {
        dataCountry = lookupData(countryCode)
        for (let i = dataCountry.length - 1; i >= 0; i--) {
            entry = dataCountry[i];
            if (entry['people_vaccinated_per_hundred'] !== undefined) {
                index = entry['people_vaccinated_per_hundred'];
                break;
            }
        }
        if (index === undefined) {
            index = 0
        }
    }

    return index
}


function checkZoomControls() {
    if (document.getElementById("zoomCheck").checked) {
        document.getElementsByClassName('leaflet-control-zoom')[0].style.display = 'block';
    } else {
        document.getElementsByClassName('leaflet-control-zoom')[0].style.display = 'none';
    }
}

function onEachFeature(feature, layer) {
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

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    countriesVaccinated.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    chart.update(e.target.feature.properties);
}

function getColor(i) {
    return chroma.scale('Greens').colors(10)[Math.floor(i / 10)]
}

function style(feature) {
    index = 0
    if (feature.properties['WB_A3'] !== undefined) {
        index = lookupRecentIndex(feature.properties['WB_A3'])
    }
    return {
        fillColor: getColor(index),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '5',
        fillOpacity: .7
    }
}

