var map, timestamp = Infinity, scaleFactor = 3, timer, timerInterval = 500, markersLayer, markerStyle

function initialize(){
	setMap();  
	setIU(); 
	
};

function setMap() {
	
	map = L.map('map').setView([-15,-72], 3);
	
	var layer = L.tileLayer(
		'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
		{
			maxZoom: 5,
			minZoom: 2,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		}).addTo(map);

	processCSV();
	sequenceInteractions();

};

function setIU(){

	var uiControl = L.Control.extend({
		initialize: function (foo, options) {
			L.Util.setOptions(this, options);
		element = foo.replace('#','');
		},
		onAdd: function (map) {
			return L.DomUtil.get(element);
		}
	});

	map.addControl(new uiControl('#legend', { position: 'bottomleft' }));
	map.addControl(new uiControl('#vcr-controls', { position: 'topright' }));
}



function processCSV() {

	var processData = new ProcessCSV();
	var csv = 'data/landCov.csv';
	processData.addListener("complete", function(){ 
		var inData = processData.getCSV();  
										
		createMarkers(inData); 
	});
	
	processData.process(csv);  

};

function createMarkers(csvData) {

	
	markerStyle = {
		fillColor: "#9CD2DE",
		color: "#ffffff",
		fillOpacity: 0.8
	};

	var markersArray = [];
		
	for (var i=0; i<csvData.length; i++) {
		var feature = {};
		feature.properties = csvData[i];
		var lat = Number(feature.properties.latitude);
		var lng = Number(feature.properties.longitude);
		var marker = L.circleMarker([lat,lng], markerStyle);
		marker.feature = feature;
		markersArray.push(marker);
	};
	
	markersLayer = L.featureGroup(markersArray);
	
	markersLayer.addTo(map);

	markersLayer.eachLayer(function(layer){
		//information popup on hover and affordance
		layer.on({
			mouseover: function(){
				layer.openPopup();
				this.setStyle({fillColor: 'gray', fillOpacity: .3, color: 'gray'});
			},
			mouseout: function(){
				layer.closePopup();
				this.setStyle(markerStyle);
			}
		});			
	});	

	
	step();
	createMaxMarker();
}

function onEachFeature(layer) {
	
	var area = layer.feature.properties[timestamp] * scaleFactor;
	
	var radius = Math.sqrt(area/Math.PI);
	
	layer.setRadius(radius);
	
	var popupHTML = "<b>" + layer.feature.properties[timestamp] +
					" <em>thousands of hectares <em></b><br>" +
					"<i>" + layer.feature.properties.Country +
					"</i> in <i>" + timestamp + "</i>";
	layer.bindPopup(popupHTML, {
		offset: new L.Point(0,-radius)		
	});
				

	return radius
}

function updateLayers(){

	var radiusArray = [];

	markersLayer.eachLayer(function(layer) {
		var r = onEachFeature(layer);
		radiusArray.push(r);
	});

	updateLegend(radiusArray);

}
function updateLegend(rArray){

	
	document.getElementById("legendTitle").innerHTML = "<h5>Urban Land Cover (thousands of hectacres)</h5>";
	document.getElementById("legendYear").innerHTML = "<h6>"+timestamp+"</h6>";
	
	var legendSymbols = document.getElementById('legendSymbols');
	
	var maxrad = Math.max.apply(null, rArray); 
	var minrad = Math.min.apply(null, rArray);
	var midrad = (maxrad + minrad)/2;
	var legendArray = [maxrad, midrad, minrad];

	legendSymbols.innerHTML = '';  
	
	var legendSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	legendSvg.setAttribute("version", "1.2");
	legendSvg.setAttribute("baseProfile", "tiny");
	legendSymbols.appendChild(legendSvg);
	
	for (var i=0; i < legendArray.length; i++) {		
		var c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); // create element
		c.setAttribute("cx", 90);  // set horizonatal position
		c.setAttribute("cy", legendArray[i] - 151);  // set vertical position
		c.setAttribute("r", legendArray[i]);
		c.setAttribute("fill", "rgba(156, 210, 222, .7)");
		c.setAttribute("stroke", "rgba(255, 255, 255, .7)");
		c.setAttribute("stroke-width", 2);
		c.setAttribute("transform","scale(1,-1)");
		legendSvg.appendChild(c);
	}
	
	var maximum = Math.round((Math.pow(maxrad,2)*Math.PI)/scaleFactor);
	var median = Math.round((Math.pow(midrad,2)*Math.PI)/scaleFactor);
	var minimum = Math.round((Math.pow(minrad,2)*Math.PI)/scaleFactor);
	var legendValues = [maximum, median, minimum];
	
	var legendData = document.getElementById("legendData");
	legendData.innerHTML = '';
	for (var j=0;j < legendValues.length; j++){
		legendData.innerHTML += "<div>"+legendValues[j]+"</div>"
	}
}



function sequenceInteractions(){
		
	$(".pause").hide();
	
	$(".play").click(function(){
		$(".pause").show();
		$(".play").hide();
		animateMap();
	});
	
	$(".pause").click(function(){
		$(".pause").hide();
		$(".play").show();
		stopMap();
	});
	
	$(".step").click(function(){
		step();
	});
	
	$(".step-full").click(function(){
		jump(2050); 
	});
	
	$(".back").click(function(){
		back();
	});
	
	$(".back-full").click(function(){
		jump(2000); 
	});
		
	$("#temporalSlider").slider({
		min: 2000,
		max: 2050,
		step: 10,
		animate: "fast",
		slide: function(e, ui){
			stopMap();
			timestamp = ui.value;
			updateLayers();
		}
	});	
}
function animateMap() {
	
	timer = setInterval(function(){
		step();
	},timerInterval);
}

function stopMap() {
	clearInterval(timer);
}

function step(){
	

	if (timestamp < 2050){ 
		timestamp+=10;
	} else {
		timestamp = 2000; 
	};
	
	updateLayers();
	updateSlider();
}
function back(){
	
	if (timestamp > 2000){ 
		timestamp-=10;
	} else {
		timestamp = 2050; 
	};
	
	updateLayers();
	updateSlider();
}

function jump(t){
	
	
	timestamp = t;
	
	updateLayers();
	updateSlider();
}

function updateSlider(){
	
	
	$("#temporalSlider").slider("value",timestamp);
}

function createMaxMarker(){
	var yearsArray = ['2000', '2010', '2020', '2030', '2040', '2050'];
	var maxMarkersArray = [], maxMarker;
	markersLayer.eachLayer(function(layer){
		var maxV = -Infinity;
		for(var i=0; i<yearsArray.length;i++){
			if(Number(layer.feature.properties[yearsArray[i]]) > maxV){
				maxV = layer.feature.properties[yearsArray[i]];
			}
		}
		maxMarker = L.circleMarker([layer._latlng.lat, layer._latlng.lng]);
		maxMarker.setRadius(Math.sqrt((maxV * scaleFactor)/Math.PI));
		maxMarker.setStyle({fillOpacity: 0, color: 'black' });
		maxMarkersArray.push(maxMarker);
	});
	var maxMarkersLayer = L.featureGroup(maxMarkersArray);
	
	maxControls(maxMarkersLayer);
	
}

function maxControls(maxLayer){
	$('#max').click(function(){
		if (map.hasLayer(maxLayer)){
			map.removeLayer(maxLayer);
			$('#max').css('color','black');
		} else {
			map.addLayer(maxLayer);
			$('#max').css('color','#9CD2DE');
		}
	});

}

function hover(){

	$(".hovArge").hide();
	$("#arge").hover(function () {
		$(".titleArge").hide();
		$(".hovArge").show();
	},function(){
		$(".hovArge").hide();
		$(".titleArge").show();
	});


	$(".hovBoli").hide();
	$("#boli").hover(function(){
  	  $(".titleBoli").hide();
  	  $(".hovBoli").show();
	},function(){
	$(".hovBoli").hide();
	$(".titleBoli").show();
	});
	
	
	$(".hovBraz").hide();
	$("#braz").hover(function(){
  	  $(".titleBraz").hide();
  	  $(".hovBraz").show();
	},function(){
	$(".hovBraz").hide();
	$(".titleBraz").show();
	});
	
	$(".hovChil").hide();
	$("#chil").hover(function(){
  	  $(".titleChil").hide();
  	  $(".hovChil").show();
	},function(){
	$(".hovChil").hide();
	$(".titleChil").show();
	});

	$(".hovColo").hide();
	$("#colo").hover(function(){
  	  $(".titleColo").hide();
  	  $(".hovColo").show();
	},function(){
	$(".hovColo").hide();
	$(".titleColo").show();
	});


	$(".hovCrica").hide();
	$("#crica").hover(function(){
  	  $(".titleCrica").hide();
  	  $(".hovCrica").show();
	},function(){
	$(".hovCrica").hide();
	$(".titleCrica").show();
	});

	$(".hovElsa").hide();
	$("#elsa").hover(function(){
  	  $(".titleElsa").hide();
  	  $(".hovElsa").show();
	},function(){
	$(".hovElsa").hide();
	$(".titleElsa").show();
	});


	$(".hovGuat").hide();
	$("#guat").hover(function(){
  	  $(".titleGuat").hide();
  	  $(".hovGuat").show();
	},function(){
	$(".hovGuat").hide();
	$(".titleGuat").show();
	});
	
	
	$(".hovPana").hide();
	$("#pana").hover(function(){
  	  $(".titlePana").hide();
  	  $(".hovPana").show();
	},function(){
	$(".hovPana").hide();
	$(".titlePana").show();
	});

	$(".hovPara").hide();
	$("#para").hover(function(){
  	  $(".titlePara").hide();
  	  $(".hovPara").show();
	},function(){
	$(".hovPara").hide();
	$(".titlePara").show();
	});
	
	$(".hovUrug").hide();
	$("#urug").hover(function(){
  	  $(".titleUrug").hide();
  	  $(".hovUrug").show();
	},function(){
	$(".hovUrug").hide();
	$(".titleUrug").show();
	});	

	$(".hovVenez").hide();
	$("#venez").hover(function(){
  	  $(".titleVenez").hide();
  	  $(".hovVenez").show();
	},function(){
	$(".hovVenez").hide();
	$(".titleVenez").show();
	});


	$(".hovNicar").hide();
	$("#nicar").hover(function(){
  	  $(".titleNicar").hide();
  	  $(".hovNicar").show();
	},function(){
	$(".hovNicar").hide();
	$(".titleNicar").show();
	});

	$(".hovMex").hide();
	$("#mex").hover(function(){
  	  $(".titleMex").hide();
  	  $(".hovMex").show();
	},function(){
	$(".hovMex").hide();
	$(".titleMex").show();
	});
	
	$(".hovEcua").hide();
	$("#ecua").hover(function(){
  	  $(".titleEcua").hide();
  	  $(".hovEcua").show();
	},function(){
	$(".hovEcua").hide();
	$(".titleEcua").show();
	});

}


hover();

window.onload = initialize(); 
