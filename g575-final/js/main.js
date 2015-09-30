//global variables
var map; //map object
var csvData; //array of data
var targetPop = 'Kills';


//begin script when window loads
window.onload = initialize();

//the first function called once the html is loaded
function initialize(){
	setMap();
	setUI();
	processCSV();
};

function processCSV() {
	//<-setMap()

	//process the citiesData csv file
	var processCSV = new ProcessCSV(); //-> to ProcessCSV.js
	var csv = 'data/csvData.csv'; // set location of csv file
	
	processCSV.addListener("complete", function(){
		csvData = processCSV.getCSV(); //-> to ProcessCSV.js; returns array object
		dateSlider(csvData);
		//console.log(csvData)
		
	});
	
	processCSV.process(csv); //-> to ProcessCSV.js
	
};//end of ProcessCSV  



var geoJson = L.geoJson(wisconsin, {
		style: style,
		onEachFeature: onEachFeature
	}).addTo(map);



function restyleMap(){
		geoJson.eachLayer(function(layer){
		//console.log(layer);
			//console.log(layer);
			layer.setStyle( { fillColor: getColor(layer.feature.properties[targetPop]) })
		
	});
}


//set basemap parameters
function setMap() {

	//create the map and set its initial view
	map = L.map('map',{minZoom: 7, maxZoom:10}).setView([45, -90], 7);
	
	var southWest = new L.LatLng(41.24, -95.21);
	var northEast = new L.LatLng(47.81, -83.76);
	var bounds = new L.LatLngBounds(southWest, northEast);
	 
	map.setMaxBounds(bounds);
	
	var osm = new L.TileLayer('http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png', { attribution: 'Acetate tileset from GeoIQ' }).addTo(map);
	var ggl = new L.Google();
	map.addLayer(ggl);
	map.addControl(new L.Control.Layers( {'Default':osm, 'Satellite':ggl}, {}));
	// control that shows state info on hover

	
	};// end setMap
	
var info = L.control();

	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	info.update = function (props) {
		this._div.innerHTML = '<p id="hover-text">hover over a county <br>to retrieve data:</p>' +  (props ?
		'<h4 id="hover-county">' + props.NAME + '</h4><br> <b>Total Kills: &nbsp ' + props.Kills + '</b><br><b>Gun Kills: &nbsp ' + props.Gun + '</b><br><b>Trap Kills: &nbsp ' + props.Trap + '</b>'
			: '');

	};

info.addTo(map);
	
	
	
function highlightFeature(e) {
			var layer = e.target;

			layer.setStyle({
				weight: 5,
				color: '#666',
				dashArray: '',
				fillOpacity: 0.5
			});

			if (!L.Browser.ie && !L.Browser.opera) {
				layer.bringToFront();
			}

			info.update(layer.feature.properties);
			

}//end of highlightFeature(e)


function getColor(d) {
		return d > 7   ? '#000000' :
           d > 5   ? '#4c4c4c' :
           d > 3   ? '#7f7f7f' :
           d > 1   ? '#c3c3c3' :
                      '#FFFFFF';
}
	
function style(feature) {
			
			return {
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.5,
				fillColor: getColor(feature.properties[targetPop])
			};
	
}



function dateSlider(csvData) {
		//console.log(csvData);
		$( "#slider" ).slider({
			range: true,
			min:1,
			max:69,
			values: [ 1, 69 ],
			slide: function(event, ui) {
				filterMap(ui.values, csvData);
				$("#minRange").html(convertDate(ui.values[0]));
				$("#maxRange").html(convertDate(ui.values[1]));
			}
			
		});
		
}
function convertDate(codeValue) {
	for(var i=0;i< csvData.length;i++) {
		if(codeValue == Number(csvData[i].Value)) {
			return csvData[i].Date;
		}
	}
	
}
function filterMap(rangeValues, csvData) {
		var currentCountyArray = [];

		for(var i=0;i< csvData.length;i++) {
			if(Number(csvData[i].Value) >= rangeValues[0] && Number(csvData[i].Value) <= rangeValues[1]) {
				currentCountyArray.push(csvData[i].County);
			}
		}

		geoJson.eachLayer(function(layer){
			killCounter = 0;
			for(var j=0;j<=currentCountyArray.length;j++) {
				if(layer.feature.properties.NAME == currentCountyArray[j]) {
				    killCounter++;
				}
			}
			
				//console.log(getColor(layer.feature.properties[killCounter]));
			layer.setStyle( { fillColor: getColor(killCounter) });

			 
			//
		
	});
}


function resetHighlight(e) {
	geoJson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}






var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
		grades = [1, 3, 5, 7],
		labels = [],
		from, to;

		for (var i = 0; i < grades.length; i++) {
		from = grades[i];
		to = grades[i + 1];

		labels.push(
			'<i style="background:' + getColor(from + 1) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
			return div;
		};

		legend.addTo(map);


function setUI(){
	$('#allKills').on('change', function(){
		targetPop = 'Kills';
		restyleMap();
			
	});
	$('#maleKills').on('change', function(){
		targetPop = 'Male';
		restyleMap();
			
	});
	$('#femaleKills').on('change', function(){
		targetPop = 'Female';
		restyleMap();
			
	});
}

