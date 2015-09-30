
//set up global variables to be used later
var map, markersLayer


//jquery function that calls the tinyscrollbar for the sidebar content. DO NOT CHANGE
$(document).ready(function(){
	$('#scrollbar1').tinyscrollbar();
	
});
var oScrollbar5 = $('#scrollbar1');
oScrollbar5.tinyscrollbar();

//initializes the page and calls the map to load on the page. DO NOT CHANGE
function initialize(){
	setMap();  
};


//a function that sets the map (called in the initialize function above)
//YOU WILL NEED TO CHANGE THIS FUNCTION...see comments below.
function setMap() {


	//CHANGE the lat and long for the overall view at the load. 
	//Zoom should be the same, but you can change if needed. If you do need to change the zoom, also change
	//the minZoom to the same value. This setting will make sure the user cannot zoom out farther than the
	//overall zoom!
	var latlng = new L.LatLng(43.0880,-89.4047);
	var mapOptions = { center: latlng, zoom: 12, minZoom: 12 };
	map = new L.map('map', mapOptions);
	
	//CHANGE the bounds to restrict the user from panning around the map infinitely
	//This will take some trial and error, but see spec sheet for tips on how to do this.
	
	var southWest = new L.LatLng(43.0051, -89.546);
	var northEast = new L.LatLng(43.162, -89.254);
	var bounds = new L.LatLngBounds(southWest, northEast);
	
	map.setMaxBounds(bounds);	//method to set the bounds. DO NOT CHANGE


	//defines map tiles. Don't change unless you decide to change all of the tiles for the web maps!
	var mapBoxURL = "http://{s}.tiles.mapbox.com/v3/margorai.map-txa5epxu/{z}/{x}/{y}.png";
	var layer = L.tileLayer(
	
	mapBoxURL,
	{	
	attribution: 'Map Box Tileset'	//ALWAYS give attribution to the tileset server you use!
	}).addTo(map);
	
	processCSV(); //calls the process CSV function

};



//function that loads data from a CSV. 
//ONLY EDIT SPECIFIED 'EDIT' SECTIONS.
function processCSV() {

	var processData = new ProcessCSV();
	
	var csv = 'data/madison.csv'; //EDIT path to your area's csv
	
	processData.addListener("complete", function(){ 
		var inData = processData.getCSV();  
										
		createMarkers(inData); 
	});
	
	processData.process(csv);  

};


//function that creates the map markers based on data from the csv
//ONLY EDIT SPECIFIED 'EDIT' SECTIONS.
function createMarkers(csvData) {

	markers = new L.MarkerClusterGroup({
		maxClusterRadius: 32, //EDIT this number via trial and error, so that each neighborhood is grouped at the overall zoom
		spiderfyOnMaxZoom: false, showCoverageonHover: false, zoomToBoundsOnClick: false, disableClusteringAtZoom: 15
		});
	var markersArray = [];
		
	for (var i=0; i<csvData.length; i++) {
		var feature = {};
		feature.properties = csvData[i];
	//NOTE: make sure that the latitude and longitude names at the end of 'feature.properties. ' match the csv!!
		var lat = Number(feature.properties.latitude); //assigns latitude
		var lng = Number(feature.properties.longitude); //assigns longitude
		var markerLocation = new L.LatLng(lat, lng); //creates marker location based on lat/lng variables
		var marker = new L.Marker(markerLocation); //creates marker based on location
		
		marker.feature = feature;
		markersArray.push(marker);
		markers.addLayer(marker);
		
		};
		markers.eachLayer(function(layer){
			var r = onEachFeature(layer);
			markersArray.push(r);
		});
	
	map.addLayer(markers);

//function that loops through the layer to assign popups associated with the marker
//also defines the events that occur when a marker is clicked (i.e. popup shows, sidebar content changes dynamically)
	function onEachFeature(layer) {
		//NOTE: Similar to the latitue and longitude varaible assignment, the "layer.feature.properties. ..." attribute takes
		//from CSV fields. "name" and "address" are fields in the csv--if they don't match, then no data will show!
		//see the tutorial for tips on how to add data to the csv so that minimal changes are made to the JS
		var popupHTML = "<b>" + layer.feature.properties.name+
						"</b><br><i>" + layer.feature.properties.address +
						"</i>";
		layer.bindPopup(popupHTML);
		layer.on('click', function() {
			document.getElementById('sidebarHeader').innerHTML = layer.feature.properties.name;
			document.getElementById('sidebarHeader2').innerHTML = layer.feature.properties.address;

			document.getElementById('sidebarImg').innerHTML = "<img src='"+layer.feature.properties.imagepath+"' width='360px' height='210px'/>";
			document.getElementById('sidebarContentAuthor').innerHTML = "<p>by: <em>"+layer.feature.properties.author+"</p></em>";

			document.getElementById('sidebarContent').innerHTML = layer.feature.properties.description;
			oScrollbar5.tinyscrollbar_update();
			
		});
		return false;
	}		
}
	

//function that updates the sidebar when a neighborhood name is clicked in the sub-navigation bar 
//You will need to edit this function!
function updateMap(){

	//EDIT the name in " " to match the ids in the HTML DOCUMENT in the "location-nav" list. 
	document.getElementById("westmorland").onclick = function(){
		map.panTo(new L.LatLng(43.05735, -89.4430));
		map.setZoom(16);
		
	//EDIT the header, subheader, image path, and content. Here, you are writing HTML.
	//PLEASE SEE TUTORIAL for how to load this information. 
		document.getElementById('sidebarHeader').innerHTML = "Westmorland";		
		document.getElementById('sidebarHeader2').innerHTML = "Madison - West ";
		document.getElementById('sidebarImg').innerHTML = "<img src='img/westmorland1.png' width='360px' height='210px'/>";
		document.getElementById('sidebarContent').innerHTML = "<p>The diversity of housing in the Westmorland neighborhood typifies twentieth-century suburban development in Wisconsin's capital city. Land in Westmorland was first subdivided for residential lots in 1916. Since then the 295-acre area has seen 887 lots developed from a total of twenty-three subdivision plats, which, while mainly residential, also contain some commercial and institutional properties.</p><p>The majority of the subdividing occurred prior to 1960 with only one subdivision plat map being filed since then. Development of the neighborhood occurred slowly from 1916 through 1929, and the Great Depression hampered activities even more so. After World War II and through 1957, the speed of development increased dramatically. The housing stock varies widely, with Cape Cod, Colonial Revival, Tudor Revival, Bungalow, English Cottage, International, Prairie, and Ranch styles all represented in the neighborhood; the different types often exist alongside one another.</p><p>Although some of this diversity may be accounted for by the piecemeal nature of the subdivision activities that occurred over time, it is also typical of twentieth-century Madison neighborhoods, which were usually developed by multiple builders working in a range of styles and house types.</p><p>This first Westmorland subdivision plat included ninety-five lots bordered by Glenway Street, Fern Court, Toepfer Avenue, and Birch Avenue. In 1926, Toepfer filed a second plat map that subdivided another six acres into twenty-three more residential lots along Glenway Street and parts of Birch and Euclid Avenues. Also in 1926, Toepfer sold a large part of his remaining farm to a local banker, A. O. Paunack, who formed the Westmorland Company to develop and sell 138 lots along Toepfer Avenue and the 4000 block of the streets between Mineral Point Road and Fern Court.</p><p>Lots were being sold for $750 to $1,250. Advertisements placed in the local newspapers that attempted to attract homebuilders to the area described it as, 'A beautiful location with city improvements in the path of Madison's westward growth.' In June of 1928, Toepfer and Paunack joined forces to plat a small area of twenty lots on Paunack, Euclid, and Birch Avenues.</p><p>Westmorland remains a vibrant, popular neighborhood; approximately thirty to thirty-five homes are sold every year most within a month of being listed. The neighborhood provides a combination of an internationally renowned landmark, the Frank Lloyd Wright-designed Usonian house, unique architecturally designed homes, and vernacular architectural styles.</p><p>The Westmorland Neighborhood Association continues as a very active organization in supporting residents, and schedules many social events. Members of an active neighborhood history committee, organized in 2002, prepare articles for the six annual issues of the newsletter, The Westmorland Courier; the group also published a complete history of the neighborhood in 2011.</p><p>In June of 2011, the history committee co-sponsored a walking tour of the neighborhood with Historic Madison, Inc., and a walking tour booklet has just been produced with the aid of a grant from the Dane County Cultural Affairs Commission.</p>";
		document.getElementById('sidebarContentAuthor').innerHTML = "<p>by: <em>Tom Martinelli</p>";

		oScrollbar5.tinyscrollbar_update();
	};
	
	//Another neighborhood, edit as you did above.
	document.getElementById("hill-farms").onclick = function(){
		map.panTo(new L.LatLng(43.06522, -89.4669));
		map.setZoom(16);
		document.getElementById('sidebarImg').innerHTML = "<img src='img/hillfarms1.png' width='360px' height='210px'/>"		;
		document.getElementById('sidebarHeader').innerHTML = "Hill Farms"		;
		document.getElementById('sidebarHeader2').innerHTML = "Madison - West "		;

		document.getElementById('sidebarContent').innerHTML = "<p>In 1955 the University of Wisconsin began the process of converting part of the College of Agriculture's farmland into a new residential subdivision. Located on Madison's west side, University Hill Farms was envisioned as a new kind of community that incorporated both the national post-war demand for housing, especially single-family homes, and also much-desired community resources, such as parks, a school, office and professional buildings, and a shopping center.</p><p>To the Board of Regents and others involved in the development of the neighborhood, building a self-sufficient community was central to the planning, advertising, and public image of University Hill Farms. </p><p>Madison's population grew thirty percent during the 1940s, creating a huge demand for housing. University Hill Farms was part of an effort to provide single-family homes for the professional and middle-class population of Madison, although garden apartments partially geared towards young families were included, as were apartments intended for the public employees who would work at the new state office complex located in the community.</p><p>In early 1953 the Wisconsin State Legislature authorized the Board of Regents to sell the 606-acre site and use the proceeds for the purchase of new land to expand its agricultural research operations. In order to sell the land, the Board created a special Committee on Agricultural Lands and appointed former Wisconsin Governor Oscar C. Rennebohm as chair. The Board initially instructed the committee to sell the land at market value.</p><p>The Committee, however, considered how it could maximize its financial return and decided to develop the land itself rather than sell the entire acreage to a developer. Considerable public concern was initially voiced over the university's involvement in development, particularly the proposed shopping center; nevertheless, the university forged ahead with its project.</p><p>University Hill Farms was planned and advertised as a complete community that both integrated and challenged national models.</p><p>The inclusion of a shopping center, recreation, and other conveniences close by was meant to remedy some of the problems of large post-war suburban developments as well as provide the university with an interesting venue for research. The involvement of the university is one of the key differences between Hill Farms and other developments. In addition to functioning as an educational laboratory, the policies pursued by the special committee allowed the university to exercise control over the development and to guarantee that the master plan would be carried out.</p><p> This 'city within a city' challenges the idea that all post-war suburban developments are the same and were built primarily to provide housing without considering other aspects of daily life.</p>"
		;
		document.getElementById('sidebarContentAuthor').innerHTML = "<p>by: <em>Brendon George and Alexandra Schulz</p>"		;
		oScrollbar5.tinyscrollbar_update();
	};
	
	//Another neighborhood, edit as you did above.
	document.getElementById("eken-park").onclick = function(){
		map.panTo(new L.LatLng(43.10797, -89.3518));
		map.setZoom(16);
		document.getElementById('sidebarImg').innerHTML = "<img src='img/ekenpark1.png' width='360px' height='210px'/>"		;
		document.getElementById('sidebarHeader').innerHTML = "Eken Park"		;
		document.getElementById('sidebarHeader2').innerHTML = "Madison - Near East"		;

		document.getElementById('sidebarContent').innerHTML = "<p>The Eken Park neighborhood is located on Madison's near east side; it is bounded by East Washington Avenue, Packers Avenue, North Street and Aberg Avenue. Although the neighborhood developed in multiple stages beginning in the early twentieth century, the tour focuses on the north side of Coolidge Street that abuts the two-acre Eken Park.</p><p> This part of the neighborhood was developed during the 1940s, and today represents a remarkably preserved example of a World War II-era mass-produced housing development (a very early example of a type of development that would proliferate in the post-World War years). </p><p>This sort of development pattern is rare in Madison, but the presence of such a neighborhood shows that it existed here as elsewhere in the country during World War II and its immediate aftermath. The Coolidge Street section also shows the close proximity of home and work during the mid-twentieth century, as it was developed to support industries on Madison's east side, including Oscar Mayer.</p><p>The neighborhood is named for one of the first landholders/farmers in this part of Madison, Iver Eken, who purchased the land that would become Eken Park in 1888. The Eken farm was passed down through several generations of the Eken family until Iver's descendants began subdividing parcels for development during the 1920s. </p><p>The Eken family continued to reside in the farmhouse--a heavily remodeled structure located at the southwestern corner of Eken Park near the intersection of Mayer Avenue and Dexter--until 1947 when Olena Eken (Iver's daughter) passed away. The land that would become the neighborhood greenspace, Eken Park, was donated to the City of Madison by Selma Eken before her death in 1940.</p>"
		;

		document.getElementById('sidebarContentAuthor').innerHTML = "<p>by: <em>Anna Andrzejewski</p>"		;
		oScrollbar5.tinyscrollbar_update();
	};
	
	//Another neighborhood, edit as you did above.
	document.getElementById("uHeights").onclick = function(){
		map.panTo(new L.LatLng(43.07077, -89.4188));
		map.setZoom(16);
		document.getElementById('sidebarImg').innerHTML = "<img src='img/uheights1.png' width='360px' height='210px'/>"		;
		document.getElementById('sidebarHeader').innerHTML = "University Heights"		;
		document.getElementById('sidebarHeader2').innerHTML = "Madison - Near West"		;

		document.getElementById('sidebarContent').innerHTML = "<p><p>The University Heights neighborhood, one of Madison's earliest planned suburbs, is located on the near west side of Madison. It is bounded by University Avenue on the north, by Regent Street on the south, by Allen Street on the west, and by Breese Terrace and Camp Randall on the east.</p><p>Its development during the late nineteenth century by the Madison elite, particularly faculty from the University of Wisconsin, combines with the 'progressive' residential architecture styles of the time to give the neighborhood a specific look and feel. The notable positions of many of the residents, especially the initial ones, make information about their lives and careers in relation to their homes and community easy to elucidate.</p><p>The peak building phases in the neighborhood occurred just as a number of popular and influential American architectural styles were ascendant; the Prairie school, Arts and Crafts influenced late-Victorian Queen Anne styles, and the self-described 'progressive' architecture of the Craftsman and Bungalow homes are prevalent. These domestic styles suited the occupants who embraced the forward-looking political and social associations of the designs. However, the economic positions that the residents held quickly made University Heights an exclusive enclave largely for professors, powerful businessmen, and professionals. The bulk of the neighborhood consists of large single-family homes, with the exception of a few multi-family housing units on the edges and a few community buildings.</p><p>The city of Madison experienced many of the common urban social ills during the late nineteenth century. By the 1880s and 1890s the city was overcrowded with declining quality of living conditions. Filth, disease, and crime had become common and some Madisonians resented the new influx of immigrants into the city; as in other locations across the country, one answer was to move to the suburbs.</p><p> A growing demand for suburban housing, especially for middle- and upper-class families, took hold as high property prices near the central capital district allowed for only modest homes and apartments while open spaces to the west and east were easily accessible through a growing streetcar system.  The University Heights Company was formed in 1892 by a collection of wealthy and influential Madison residents to develop the land on the hills immediately west of Camp Randall that had served as the fairgrounds.</p><p>William Fish, who had developed the nearby Wingra Park in 1889 with little success due to the onset of economic recession in the following years and a lack of streetcar access, is generally recognized as leader of the Company. The land was purchased from Breese Stevens, who was coincidently one of the members of the University Heights Company board, for the princely sum of $160,000 in March of 1893.</p><p> The development was intended from the start to serve the growing University of Wisconsin campus, as a streetcar line had recently been extended past Camp Randall to within a block of the new development.  The plat plan for University Heights by McClellan Dodge followed a curvilinear street pattern closely following the topography of the hilly site, echoing contemporary ideas on planning and landscape design found in Frederick Law Olmstead's 1869 plan of Riverside, a Chicago suburb. It was the first street plan of its kind in the Madison area.</p><p> The streets were named after former University presidents and chancellors, which shows the close relationship the suburb had to the University. </p>"		
		;

		document.getElementById('sidebarContentAuthor').innerHTML = "<p>by: <em>Rowan Davidson</p>"		;
		oScrollbar5.tinyscrollbar_update();
	};
	
	
	//Another neighborhood, edit as you did above.
	document.getElementById("thirdLake").onclick = function(){
		map.panTo(new L.LatLng(43.07948, -89.3681));
		map.setZoom(15);
		document.getElementById('sidebarImg').innerHTML = "<img src='img/thirdlake1.png' width='360px' height='210px'/>"		;
		document.getElementById('sidebarHeader').innerHTML = "Third Lake Ridge"		;
		document.getElementById('sidebarHeader2').innerHTML = "Madison - Near East"		;

		document.getElementById('sidebarContent').innerHTML = "<p>The Third Lake Ridge neighborhood is located along the northwestern shore of Lake Monona on Madison’s industrially oriented east side. Originally settled during the 1840s, the neighborhood today consists of a mix of industrial, commercial, and residential buildings, most of which date to the period between 1850 and 1950.</p><p>The neighborhood borders Madison’s industrial corridor-located between East Washington and Williamson Streets-and the businesses and houses in Third Lake Ridge are closely tied to various industries that flourished in Madison during the 1850s with the coming of the railroad.  These businesses included gricultural implement manufacturers and suppliers, tobacco processing companies, breweries, and machine shops.</p><p>The extant buildings and landscape features reflect the long history of the neighborhood, particularly as a center for Madison’s working class residents. Domestic buildings along the 700-1000 blocks of Jenifer and Spaight Streets show the popular forms found throughout Madison between 1850 and 1920. These structures housed a wide range of Madison’s population during this period. Entrepreneurs such as the owners and managers of the Fauerbach Brewery, Madison Candy Company, and various machine shops lived alongside tailors, masons, and railroad workers with varying ethnic backgrounds.</p><p>Commercial businesses that lined Williamson Street, particularly between the 800 and 1200 blocks, catered to the needs of these varied residents, and included grocery stores, blacksmith shops, inns, and taverns. Industrial workplaces were also nearby.</p><p>Members of the Fauerbach family walked to their brewery at 651-53 Williamson Street, while other neighborhood residents worked at the Madison Candy Company, the Olds Seed Company, or the railyards.</p><p>Although much has changed as the neighborhood rebranded itself during recent decades, preservation efforts have led to the adaptive reuse of these former utilitarian buildings, allowing the close relationships between home, work, and community to remain.</p>"
		;
		document.getElementById('sidebarContentAuthor').innerHTML = "<p>by: <em>Jared Lowery</p>"		;
		
		oScrollbar5.tinyscrollbar_update();
	};
};

//Calls the update map function
updateMap();


//Loads window
window.onload = initialize(); 
