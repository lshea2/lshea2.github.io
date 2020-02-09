//Create main map object
ALKMaps.APIKey = "910771335EB6744C9F9449F304EC3FF5";
var map;
var lon = -96,
  lat = 35,
  zoom = 3;

//ALKMaps.APIKey = "YOUR_KEY_HERE";

map = new ALKMaps.Map("map");

var lonLat = new ALKMaps.LonLat(lon, lat).transform(
  new ALKMaps.Projection("EPSG:4326"),
  map.getProjectionObject()
);
map.setCenter(lonLat, zoom);
var routingLayer = new ALKMaps.Layer.Routing("Route Layer");
map.addLayer(routingLayer);


var stops = [];

async function FindAddresses(){
    stops = [];
    var addresses = [];
    var names = [];
    var locations;
    var search;

    var ideas = document.getElementsByClassName("choice");
    var choiceIDs = [];
    for (const choice of ideas) {
        choiceIDs.push(choice.id);
    }
    for(const choice of choiceIDs){
        if(document.getElementById(choice).checked){
            search = choice;
            locations = await fetch(`https://singlesearch.alk.com/na/api/search?authToken=910771335EB6744C9F9449F304EC3FF5&maxResults=50&states=NY&query=${search}`)
                .catch(function(){console.log("Error")})
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    return data.Locations;
                });
            var index = Math.floor(Math.random() * locations.length)
            stops.push(locations[index].Coords);
            names.push(locations[index].ShortString);
        }
    }
    
    //Adds Default stops of Binghamton University and Chuck E. Cheese
    var randIndex = Math.floor(Math.random() * (stops.length+1));
    stops.splice(randIndex, 0, {
        Lat: 42.09648,
        Lon: -75.9789763
    });
    names.splice(randIndex, 0, "Chuck E. Cheese");
    stops.unshift({
        Lat: 42.0935219,
        Lon: -75.9688774
    })
    names.unshift("Binghamton University");
    

    routingLayer.removeRoute("Date");
    const myNode = document.getElementById("StopList");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    for(var i = 0; i < names.length; i++){
        var li=document.createElement('li');
        li.textContent = names[i];
        document.getElementById("StopList").appendChild(li);
    }
    
    
}
function generateCoordString(){
    var coordString = "";
    for(const stop of stops){
        coordString = coordString.concat(stop.lon + "%2C" + stop.lat + "%3B");
    }
    console.log(coordString);
    coordString = coordString.slice(0, -3);
    console.log(coordString);
    return coordString;
}

async function CreateRoute(){
    await FindAddresses()
        .catch(function(){
            console.log("Unable to Find All Addresses");
        })
        .then(async function(){
            for(var i = 0; i < stops.length; i++){
                stops[i] = new ALKMaps.LonLat(stops[i].Lon, stops[i].Lat);
            }
            var coordList = generateCoordString();
            console.log(coordList);
            /*
            await fetch("https://pcmiler.alk.com/apis/rest/v1.0/Service.svc/route/routeReports?authToken=910771335EB6744C9F9449F304EC3FF5&stops=-75.173297%2C39.942892%3B-74.83153%2C39.61703%3B-74.438942%2C39.362469&reports=Mileage")
                .then(response => {
                    console.log(response);
                    return response.json()
                })
                .then(data => {
                    console.log(data);
                });
            */
            var totalMiles = await fetch(`https://pcmiler.alk.com/apis/rest/v1.0/Service.svc/route/routeReports?authToken=910771335EB6744C9F9449F304EC3FF5&stops=${coordList}&reports=Mileage`)
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    console.log(data[0].ReportLines);

                    return data[0].ReportLines[data[0].ReportLines.length - 1].TMiles;
                });
            if(document.getElementById("MilesCount").firstChild){
                document.getElementById("MilesCount").removeChild(document.getElementById("MilesCount").firstChild);
            }
            document.getElementById("MilesCount").appendChild(document.createTextNode("Total Miles: " + totalMiles));
            stops = ALKMaps.LonLat.transformArray(stops, new ALKMaps.Projection("EPSG:4326"), map.getProjectionObject());
            routingLayer.addRoute({
              stops: stops,
              functionOptions:{
                routeId: "Date"
              },
              routeOptions: {
                highwayOnly: false,
                tollDiscourage: true
              },
              reportOptions: {}
            });
        });  
}
function chuck(){
    if(!document.getElementById("Chuck").checked){
        document.getElementById("Chuck").checked = true;
    }
}