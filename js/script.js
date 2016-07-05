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

var StopSchedule = Backbone.Model.extend({
	urlRoot: 'stopschedule', 
	idAttribute: 'StopID'
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
		
		this.bindEvents();
		
		var routes = new Routes();
		
		this.collection = routes;
		var that = this;

		routes.fetch({
			success: function(collection, response){

				that.routeArr = [];

				// document.body.removeChild(document.getElementById('load-screen'));
				$('#load-screen').remove();
				
				for (model in response){
					$('#route-id').append('<option value="' + response[model].RouteID + '">' + response[model].RouteID + '</option>');
					that.routeArr.push(response[model].RouteID);
				}
			}, 
			error: onErrorHandler
		});

	},
	bindEvents: function(){
		$('#route-select').on('click', function(){
			$(this).addClass('bg-warning');
			$('#route-search').removeClass('bg-warning');
			$('#message-display').text('');
		});	
		$('#route-search').on('click', function(){
			$(this).addClass('bg-warning');
			$('#route-select').removeClass('bg-warning');
		});	
		$('#scroll-top-arrow').on('click', function(){
			window.scrollTo(0,0);	
		});
	},
	events : {
		"click #route-id-button" : "getBusPosition",
		"keyup #route-search-input" : "routeSearch",
	},
	getBusPosition : function(){
		if ($('#route-select').hasClass('bg-warning')) {
			var route_id = document.getElementById('route-id').value;
			if(route_id != "select") {
				var position = new BusPosition({id: route_id});
			} else {
				displayMessage('Select or search a valid bus route.');
			}
		} else {
			if (this.route === true) {
				var searched_route = document.getElementById('route-search-input').value;
				searched_route = searched_route.toUpperCase();
				var position = new BusPosition({id: searched_route});
			} else {
				displayMessage('Select or search a valid bus route.');
			}
		}

		if(position) {
			position.fetch({
				success: function(model, response) {
					var googleMapView = new GoogleMapView({model : model});
					showMap();
					this.$('#map-title').empty().append(googleMapView.render().el);	
					
					// var infoView = new InfoView({model : model});
					var busIncidentView = new BusIncidentView({model : model});
					
					clearInfoContainer();
				}, 
				error: onErrorHandler
			});
		}
	},
	routeSearch : function(){
		var route = document.getElementById('route-search-input').value;
		route = route.toUpperCase();
		var route_display = document.getElementById('message-display');
		route_display.style.visibility = 'visible';

		var index = this.routeArr.indexOf(route);
		
		if(this.routeArr.indexOf(route) > -1) {
			displayMessage('Route found');
			this.route = true;
		} else {
			displayMessage('No route found');
			this.route = false;
		}
	}
});

// var InfoView = Backbone.View.extend({
// 	initialize: function(){
// 		this.busIncidentView = new BusIncidentView({model : this.model});
// 	}
// });

var BusIncidentView = Backbone.View.extend({
	tagName: 'div',
	el: '#alert-incident',
	// template: _.template($('#incident-template').html()),
	initialize: function(){
		var that = this;
		// model
		var busincident = new BusIncident({id:this.model.get('id')});
		busincident.fetch({
			success: function(model, response){
				var incidents = model.get('BusIncidents');
					// console.log(incidents);
				if(incidents.length > 0) {
					showAlertFlag();
					var incidentsObj = {};
					incidentsObj.incidents = [];
					
					_.each(incidents, function(i){
						incidentsObj.incidents.push(i);
					});
					
					that.busIncidents = incidentsObj;
					that.render();
				}
			},
			error: onErrorHandler
		});
	},
	//binded to collection
	onModelAdded: function(){
		console.log('hi');
		this.$el.append('oh hi');
	}, 
	render: function(){
		console.log(this.busIncidents);
		// this.$el.html(this.template(this.busIncidents));
		this.$el.html(render('incident-template', this.busIncidents));
	}
});

var StopScheduleView = Backbone.View.extend({
	tagName: 'div',
	el: '#info-stop-schedule',
	// template: _.template($('#stop-schedule-template').html()),
	initialize: function(options){
		this.options = options;
		var that = this;
		
		this.model.fetch({
			success: function(model, response){
				that.stopScheduleObj = {};
				that.stopScheduleObj.StopName = response.Stop.Name;	
				// console.log(response);
				_.each(response.ScheduleArrivals, function(i){
					if(i.RouteID == that.options.busID) {
						
						if(!that.stopScheduleObj.TripDirection) {
							that.stopScheduleObj.ScheduleTime = [];
							that.stopScheduleObj.TripDirection = i.TripDirectionText;
							that.stopScheduleObj.TripHeadsign = i.TripHeadsign;
						}
						var parsedScheduleTime = that.parseTime(i.ScheduleTime)
						that.stopScheduleObj.ScheduleTime.push(parsedScheduleTime); 
				
					}
				});
		
				that.render();
			}			
		});
	}, 
	render: function(){
		// this.$el.html(this.template(this.stopScheduleObj));
		$('#stop-schedule-container').css('display', 'block');
		this.$el.html(render('stop-schedule-template', this.stopScheduleObj));
		jumpToYCoordinate(document.getElementById('stop-schedule-container'));
	},
	parseTime: function(time){
		var index = time.indexOf('T');
		var croppedTime = time.substr(index+1, 5);
		
		var standardTime = this.militaryToStandard(croppedTime);
		
		return standardTime;
	},
	militaryToStandard: function (fourDigitTime) {
	    var hours24 = parseInt(fourDigitTime.substring(0, 2),10);
	    var hours = ((hours24 + 11) % 12) + 1;
	    var amPm = hours24 > 11 ? 'pm' : 'am';
	    var minutes = fourDigitTime.substring(2);
	
	    return hours + '' + minutes + amPm;
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

		this.$el.html(render('map-title-template', this.model.toJSON()));
		// var template = _.template('<h3>Current location(s) of WMATA Route <%= id %><br/>There are <%= BusPositions.length %> bus(es) on this route currently operating.</h3>', this.model.toJSON());
		// this.$el.html(template);
		return this;
	}, 
	addBusRoute : function(googlemap){
		var that = this;
		
		var busroute = new BusRoute({id: this.model.get('id'), map: googlemap});
		busroute.fetch({
			success : function(model, response){
				var stops = response.Direction0.Stops;
				
				//reference the BusPosition model for route #
				var busPosition = that.model;
				
				//if response has an array for both route directions then concat 
				if(response.Direction1){
					var stops = stops.concat(response.Direction1.Stops);
				}
				var map = model.get('map');

				for (prop in stops){
					var marker = googleMaps.addMarker(stops[prop].Lat, stops[prop].Lon, map, stops[prop].Name + '\n' + 'Click for stop schedule.', 'img/dot.png');
					
					//use closure for event bind since returned marker above is async
					(function(stop){
						
						var stopSchedule = new StopSchedule(stop);
						
						google.maps.event.addListener(marker, 'click', function() {
						    map.setZoom(15);
						    map.setCenter(this.getPosition());
						    var stopscheduleview = new StopScheduleView({model:stopSchedule, busID:busPosition.get('id')});
						});
					})(stops[prop]);
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

//uses synchronous $ajax to include and cache templates from templates folder
//alternative to keeping templates in script tags in index.html
function render(tmpl_name, tmpl_data) {
    if ( !render.tmpl_cache ) { 
        render.tmpl_cache = {};
    }

    if ( ! render.tmpl_cache[tmpl_name] ) {
        var tmpl_dir = '/templates';
        var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

        var tmpl_string;
        $.ajax({
            url: tmpl_url,
            method: 'GET',
            async: false,
            success: function(data) {
                tmpl_string = data;
            }
        });

        render.tmpl_cache[tmpl_name] = _.template(tmpl_string);
    }

    return render.tmpl_cache[tmpl_name](tmpl_data);
}

function jumpToYCoordinate(elem) {
	var rect = elem.getBoundingClientRect();
	var top = rect.top;
	window.scrollTo(0, top);
}

function showMap() {
	$('#map-title, #map-container').css('display', 'block');
}

function showAlertFlag() {
	$('#alert-flag').css('display', 'block');
}

function clearInfoContainer() {
	$('#alert-incident, #info-stop-schedule').html("");
	$('#stop-schedule-container').css('display', 'none');
}

function displayMessage(msg) {
	var message_display = document.getElementById('message-display');
	message_display.style.visibility = 'visible';
	message_display.innerHTML = msg;
}

var appView = new AppView();

})();
