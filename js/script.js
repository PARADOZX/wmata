
//  $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
//       options.url = 'http://api.wmata.com/Bus.svc/json' + options.url + '?api_key=' + 'kfgpmgvfgacx98de9q3xazww';  
//     });

(function(){

$.ajaxSetup({ cache: false });	//prevents caching.  especially for IE.

var onErrorHandler = function(coll, response, options){
	console.log('fetch error');
	alert('Error occurred.  Please try again later.');
};

var BusPosition = Backbone.Model.extend({
	urlRoot: 'position',
});

var BusRoute = Backbone.Model.extend({
	urlRoot: 'busroute',
});

var BusIncidents = Backbone.Collection.extend({
	url: 'busincidents',
	// model: 'BusIncident',
	parse : function(response){	
        return response['BusIncidents'];
    }, 
});

var BusIncident = Backbone.Model.extend({
	urlRoot: 'busincident'	
});

var Routes = Backbone.Collection.extend({
	url: 'routes',
	// model: Route,
	parse : function(response){		//this works on the 'coll' response, not the 'response' response
        return response['Routes'];
    }, 
});

var RouteView = Backbone.View.extend({
	tagName : "div",
	initialize: function(){

	},
	render: function(){
		this.$el.html(this.model.get('firstName'));
		return this;
	}
});

var AppView = Backbone.View.extend({
	el: '#route-container',
	initialize : function(){
		var routes = new Routes();
		
		this.collection = routes;
		var that = this;

		routes.fetch({
			success: function(collection, response){

				that.routeArr = [];

				document.body.removeChild(document.getElementById('load-screen'));
				
				for (model in response){
					$('#route-id').append('<option value="' + response[model].RouteID + '">' + response[model].RouteID + '</option>');
					that.routeArr.push(response[model].RouteID);
				}
			}, 
			error: onErrorHandler
		});

	},
	events : {
		"click #route-id-button" : "getBusPosition",
		"keyup #route-finder" : "routeFind",
		"click #route-block" : "showSelect"
	},
	getBusPosition : function(){
		if (document.getElementById('route-id').style.display != "none") {
			var position = new BusPosition({id: document.getElementById('route-id').value});
		} else {
			if (this.route === true) {
				var position = new BusPosition({id: document.getElementById('route-finder').value});
			} else {
				alert('Route not found.  Please enter a valid bus route.');
			}
		}

		position.fetch({
			success: function(model, response) {
				var googleMapView = new GoogleMapView({model : model});
				this.$('#map-title').empty().append(googleMapView.render().el);	
				
				var infoView = new InfoView({model : model});
				infoView.render();
			}, 
			error: onErrorHandler
		});
	},
	routeFind : function(){
		var route = document.getElementById('route-finder').value;
		var route_display = document.getElementById('route-search-display');
		route_display.style.visibility = 'visible';

		var display_block = document.getElementById('route-block');
		display_block.style.display = "inline-block";
		display_block.style.color = "#aaa";

		document.getElementById('route-id').style.display = "none";
		
		var index = this.routeArr.indexOf(route);
		
		if(this.routeArr.indexOf(route) > -1) {
			route_display.innerHTML = 'Route found.';
			this.route = true;
		} else {
			route_display.innerHTML = 'No route found.';	
			this.route = false;
		}
	},
	showSelect : function(){
		document.getElementById('route-finder').value = '';
		document.getElementById('route-search-display').style.visibility = 'hidden';
		document.getElementById('route-block').style.display = "none";	
		document.getElementById('route-id').style.display = "inline-block";
	}
});

var InfoView = Backbone.View.extend({
	initialize: function(){
		this.busIncidentView = new BusIncidentView({model : this.model});
	},
	render: function(){
		this.busIncidentView.render();
	}
});

var BusIncidentView = Backbone.View.extend({
	tagName: 'div',
	el: '#info-incident',
	initialize: function(){
	
		// model
		var busincident = new BusIncident({id:this.model.get('id')});
		busincident.fetch({
			success: function(model, response){
				var incidents_array = model.get('BusIncidents');
				if(incidents_array.length > 0) {
					// console.log(incidents_array);
				}
			},
			error: onErrorHandler
		});
		
		//collection
		// this.collection = new BusIncidents();
	
  		//this.collection.bind('add', this.onModelAdded, this);
        
		// this.collection.fetch({
		// 	error: onErrorHandler
		// });
	},
	onModelAdded: function(){
		console.log('hi');
		this.$el.append('oh hi');
	}, 
	render: function(){
		// this.$el.html('wtf man?!');
		// return this;
	}
});

var GoogleMapView = Backbone.View.extend({
	tagName: "div",
	initialize: function(){
	},
	render : function(){
		var model = this.model.toJSON();
		
		model = model['BusPositions'];

		if (model.length > 0){

			var options = googleMaps.mapOptions(12, model[0].Lat, model[0].Lon);
			var map = googleMaps.initialize('map-canvas', options);
			
			//zoom and centers the map so all bus positions are displayed initially.
			if (model.length > 1){
				var southwest = {}, 
					northeast = {}, 
				    latArray = [], 
				    lonArray = [];

				for (i=0; i<model.length; i++){
					latArray.push(model[i].Lat);
					lonArray.push(model[i].Lon);
				}

				northeast.Lat = Math.max.apply(Math, latArray);
				northeast.Lon = Math.max.apply(Math, lonArray);
				southwest.Lat = Math.min.apply(Math, latArray);
				southwest.Lon = Math.min.apply(Math, lonArray);

				northeast = new google.maps.LatLng(northeast.Lat, northeast.Lon);
				southwest = new google.maps.LatLng(southwest.Lat, southwest.Lon);

				var bounds = new google.maps.LatLngBounds(southwest, northeast);

				map.fitBounds(bounds);
			}
		} else {
			//if no bus positions center map on user location
			if (navigator.geolocation){
				navigator.geolocation.getCurrentPosition(function(position){
					options = googleMaps.mapOptions(12, position.coords.latitude, position.coords.longitude);
					var map = googleMaps.initialize('map-canvas', options);
				});
			} else {
				//if geolocation not available center map on White House
				var options = googleMaps.mapOptions(12, 38.8976763, -77.0365297);
				var map = googleMaps.initialize('map-canvas', options);
			}
		}

		var marker = [];

		for(i=0; i<model.length; i++) {
			marker[i] = googleMaps.addMarker(model[i].Lat, model[i].Lon, map, "Bus ID: " + model[i].RouteID + "\n" + "Direction: " + model[i].TripHeadsign + " (" + model[i].DirectionText + "BOUND)");

			google.maps.event.addListener(marker[i], 'click', function() {
			    map.setZoom(15);
			    map.setCenter(this.getPosition());
			});
		}

		this.addBusRoute(map);		

		var template = _.template('<h3>Current location(s) of WMATA Route <%= id %><br/>There are <%= BusPositions.length %> bus(es) on this route currently operating.</h3>', this.model.toJSON());
		this.$el.html(template);
		return this;
	}, 
	addBusRoute : function(googlemap){
		var busroute = new BusRoute({id: this.model.get('id'), map: googlemap});
		busroute.fetch({
			success : function(model, response){
				var stops = response.Direction0.Stops;
				//if response has an array for both route directions then concat 
				if(response.Direction1){
					var stops = stops.concat(response.Direction1.Stops);
				}
				var map = model.get('map');

				for (prop in stops){
					var marker = googleMaps.addMarker(stops[prop].Lat, stops[prop].Lon, map, stops[prop].Name, 'img/dot.png');
					
					google.maps.event.addListener(marker, 'click', function() {
					    map.setZoom(15);
					    map.setCenter(this.getPosition());
					});
				}
			},
			error: onErrorHandler
		});
	}
});

var googleMaps = {
	initialize : function(ele, options){
		map = new google.maps.Map(document.getElementById(ele), options);
		return map;
	},
	mapOptions : function(zoom, lat, lon){
		var Obj = {
			zoom : zoom,
			center : new google.maps.LatLng(lat, lon)
		};
		return Obj;
	}, 
	addMarker : function(lat, lon, map, title, icon){
		var marker = new google.maps.Marker({
			position : new google.maps.LatLng(lat, lon),
			map : map,
			animation: google.maps.Animation.DROP,
			title: title,
			icon: (function(){
				if (!icon) {
					return 'img/metro_logo.png'
				} else return icon;
			})()
		});
		return marker;
	}
};

var appView = new AppView();

})();
