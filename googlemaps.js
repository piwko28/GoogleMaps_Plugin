/**
 * See (http://jquery.com/).
 * @name $
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See (http://jquery.com/)
 * @name fn
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf $
 */

/**
 * jQuery GoogleMaps Plugin
 *
 * @class googlemaps
 * @memberOf $.fn
 * @version		1.7.8
 * @author		Szymon Piwowarczyk (certico.pl, piwowarczyk.net)
 * @requires jQuery 1.4+
 * @param {Object} options Additional map options. See: google.maps.Map at Google Maps API Documentation
 *
 * @description
 * Date: March 21, 2013
 * License: MIT + Beerware
 * Put in head:
 *  <script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>
 *  and this file.
 *
 * @example
 * Use:
 *   var map = $("#mapcontainer")
 *    .css({ width : '300px', height : '300px' })
 *    .googlemaps();
 *   var marker = map.setMarkerAtAddress('Wroclaw');
 *   map.setCenterAtMarker(marker, 5);
 * It means:
 *   Center and put a marker on Wrocław and zoom it to 5.
 */

(function($) {
	$.fn.googlemaps = function(options) {

		options = $.extend({
			zoom : 10,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			center : new google.maps.LatLng(0, 0)
		}, options);
		var map = new google.maps.Map(this[0], options);
		var geocoder = new google.maps.Geocoder();
		var directionsService = new google.maps.DirectionsService();
		var directions = new Object();
		var directionsNo = 0;
		var streetviewservice = new google.maps.StreetViewService();
		var distanceservice = new google.maps.DistanceMatrixService();
		var streetview = map.getStreetView();
		var rooms = new Array();
		var markers = new Array();
		var infowindows = new Array();
		var googlemaps = this;
		/**
		 * Array of all placed markers
		 * @property {Array<Marker>}
		 */
		this.markers = markers;
		/**
		 * Array of all infowindows
		 * @property {Array<InfoWindow>}
		 */
		this.infowindows = infowindows;
    /**
		 * Map object (see more at Google Maps API v3)
		 * @property {google.maps.Map}
		 */
		this.map = map;

		/**
		 * Place marker at real address on the map
		 * @param {String} address			Real address or geographic position "lat, lng" to place marker on it
		 * @param {function(Marker)} successCallback	Function, which is called after geocoding address and put the marker
		 * @param {function(string, string)} errorCallback	Function, which is called after error (ex. unknown address); params: status, address
		 * @param {Object} options			Marker additional options (see google.maps.Marker at Google Maps API Documentation)
		 * @param {String} image				Url to image of marker's icon
		 * @return {Object}					Map plugin itself
		 * @example
		 * var map = $("#map").googlemaps();
		 * map.setMarker("Wroclaw, Poland", undefined, function() { alert('Can't find!'); }, { visible : false });
		 * map.setMarker("52, 20");
		 */
		this.setMarker = function(address, successCallback, errorCallback, options, image) {
			var markericon = {};
			if (image) {
				markericon.icon = new google.maps.MarkerImage(image);
			}
      var defaults = {};
      if(!options || (options && !options.hasOwnProperty('map'))) {
        defaults.map = map;
      }
			options = $.extend(defaults, options, markericon);
			var latlngpattern = new RegExp("^[ ]*[-]?[0-9]+[.]?[0-9]*[ ]*,[ ]*[-]?[0-9]+[.]?[0-9]*[ ]*$");
			if (latlngpattern.test(address)) {
				var arr = address.split(",", 2);
				options.position = new google.maps.LatLng(parseFloat(arr[0]), parseFloat(arr[1]));
				var marker = new google.maps.Marker(options);
				marker.options = options;
				markers.push(marker);
        if (successCallback && typeof (successCallback) == 'function') {
          successCallback(marker);
        }
			} else {
				geocoder.geocode({
					'address' : address
				}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						options.position = results[0].geometry.location;
						var marker = new google.maps.Marker(options);
						marker.options = options;
						markers.push(marker);
						if (successCallback && typeof (successCallback) == 'function') {
							successCallback(marker);
						}
					} else {
						if (errorCallback && typeof (errorCallback) == 'function') {
							errorCallback(status, address);
						}
					}
				});
			}
			return this;
		};
		
		/**
		 * @deprecated
		 * @see setMarker
		 * @ignore 
		 */
		this.setMarkerAtAddress = function(address, successCallback, errorCallback, options, image) {
			return this.setMarker(address, successCallback, errorCallback, options, image);
		};

		/** @ignore */
		var setMarkersAtAddressesPrivate = function(addresses, results, successCallback, errorCallback, options, images, putMarkerCallback) {
			var address = addresses.shift();
			var image;
			if (images) {
				if ( typeof (images) === 'string') {
					image = images;
				} else {
					image = images.shift();
				}
			}
			googlemaps.setMarker(address, function(marker) {
				results.push(marker);
				if (addresses.length > 0) {
          if(putMarkerCallback && typeof (putMarkerCallback) == 'function') {
            putMarkerCallback(marker);
          }
					setMarkersAtAddressesPrivate(addresses, results, successCallback, errorCallback, options, images, putMarkerCallback);
				} else {
          if(successCallback && typeof (successCallback) == 'function') {
            successCallback(results);
          }
				}
			}, errorCallback, options, image);
		};

		/**
		 * Place many markers at real addresses
		 * @param {Array<String>} addresses		Array of real addresses or geographic positions "lat, lng" to place marker on it
		 * @param {function(Array<Marker>)} successCallback	Function, which is called after put all markers on the map
		 * @param {function(string, string)} errorCallback	Function, which is called after error (ex. unknown address); params: status, address
		 * @param {Object} options			Marker additional options (see google.maps.Marker at Google Maps API Documentation)
		 * @param {String} image				Url to image of marker's icon
     * @param {function(Marker, string)} putMarkerCallback	Function, which is called after geocoding address and put the marker; params: marker, address
		 * @return {Object}					Map plugin itself
		 * @example
		 * $("#map").googlemaps().setMarkersAtAddresses([
     *   "Polska",
     *   "Niemcy",
     *   "Holandia",
     *   "Ukraina",
     *   "Rosja"
     * ]);
		 */
		this.setMarkersAtAddresses = function(addresses, successCallback, errorCallback, options, images, putMarkerCallback) {
			setMarkersAtAddressesPrivate(addresses, new Array(), successCallback, errorCallback, options, images, putMarkerCallback);
			return this;
		};

		/**
		 * @see setMarker
		 * @ignore
		 * @deprecated
		 * @example
		 * $("#map").googlemaps().setMarkerAtLocation(52, 20);
		 */
		this.setMarkerAtLocation = function(lat, lng, options, image) {
			var markericon = {};
			if (image) {
				markericon.icon = new google.maps.MarkerImage(image);
			}
			options = $.extend(options, {
				map : map,
				position : new google.maps.LatLng(lat, lng)
			}, markericon);
			var marker = new google.maps.Marker(options);
			markers.push(marker);
			return marker;
		};
		
		/**
		 * Center map at real address, geographical coordinates or marker
		 * @param {String, Marker, Array<Marker>} address  Real address, geographical coordinates (string: "lat, lng"), marker or array of markers to center the map on it
		 * @param {Integer} zoom		Zoom multiplier
		 * @param {function(position:LatLng)} successCallback Function, which is called after find address, center and zoom
		 * @param {function(status:String, address:String)} errorCallback Function, which is called after error with finding address
     * @param {Object} Object with additional options of geocoder
		 * @return {Object} Map plugin itself
		 * @example
		 * var map = $("#map").googlemaps();
     * map.setMarkerAtAddress("Grabiszyńska 241, Wrocław, Polska", function(marker) {
     *   map.setCenter(marker, 16);
     * });
		 */
		this.setCenter = function(address, zoom, successCallback, errorCallback, geocoderoptions) {
			zoom = Math.max(1, parseInt(zoom || options.zoom));
			var latlngpattern = new RegExp("^\s*-?[0-9]+[.]?[0-9]*\s*,\s*-?[0-9]+[.]?[0-9]*\s*$");
      if(typeof (address) === 'object' && Array.isArray(address)) {
        var bounds = new google.maps.LatLngBounds();
        for(var i in address) {
          var m = address[i];
          if(typeof (m) === 'object' && typeof (m.getPosition) === 'function') {
            bounds.extend(m.getPosition());
          }
        }
        if(!bounds.isEmpty()) {
          map.fitBounds(bounds);
        }
      } else if(typeof (address) === 'object' && typeof (address.getPosition) === 'function') {
				var latlng = address.getPosition();
				map.setCenter(latlng);
				map.setZoom(zoom);
        if (successCallback && typeof (successCallback) == 'function') {
          successCallback(latlng);
        }
			} else if (latlngpattern.test(address)) {
				var arr = address.split(",", 2);
				var latlng = new google.maps.LatLng(parseFloat(arr[0]), parseFloat(arr[1]));
				map.setCenter(latlng);
				map.setZoom(zoom);
        if (successCallback && typeof (successCallback) == 'function') {
          successCallback(latlng);
        }
			} else {
        geocoderoptions = $.extend(geocoderoptions, {
          'address' : address
        })
				geocoder.geocode(geocoderoptions, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						map.setZoom(zoom);
						map.setCenter(results[0].geometry.location);
						if (successCallback && typeof (successCallback) == 'function') {
							successCallback(results[0].geometry.location, results);
						}
					} else {
						if (errorCallback && typeof (errorCallback) == 'function') {
							errorCallback(status, address);
						}
					}
				});
			}
			return this;
		}

		/**
		 * @see setCenter
		 * @ignore
		 * @deprecated 
		 */
		this.setCenterAtAddress = function(address, zoom, successCallback, errorCallback) {
			return this.setCenter(address, zoom, successCallback, errorCallback);
		};

		/**
		 * @see setCenter
		 * @ignore
		 * @deprecated 
		 */
		this.setCenterAtLocation = function(lat, lng, zoom) {
			zoom = Math.max(1, parseInt(zoom || options.zoom));
			map.setZoom(zoom);
			map.setCenter(new google.maps.LatLng(lat, lng));
			return this;
		};

		/**
		 * @see setCenter
		 * @ignore
		 * @deprecated 
		 */
		this.setCenterAtMarker = function(marker, zoom) {
			zoom = Math.max(1, parseInt(zoom || options.zoom));
			map.setZoom(zoom);
			map.setCenter(marker.getPosition());
			return this;
		};

		/**
		 * Draw polygon on the maps. Default is red stroke and red fill
		 * @param {Array<Marker,String>} points Array of markers or/and geographical positions "lat, lng" or verticles of polygon
		 * @param {Object} options Polygon options (see google.maps.PolygonOptions at Google Maps API Documentation)
		 * @return {Polygon} google.maps.Polygon
		 * @example
		 * var map = $("#map").googlemaps();
     * map.setCenter("Polska", 6, function() {
     *   map.setMarkersAtAddresses([
     *     "Warszawa",
     *     "Kraków",
     *     "Wrocław"
     *   ], function(markers) {
     *     map.setPolygon([
     *       markers[0],
     *       markers[1],
     *       markers[2],
     *       "51, 19",
     *       markers[0]
     *     ]);
     *   });
     * });
		 */
		this.setPolygon = function(points, options) {
			for (i in points) {
				if ( typeof (points[i]) === 'object' && typeof (points[i].getPosition) === 'function') {
					points[i] = points[i].getPosition();
				}
				if ( typeof (points[i]) === 'string') {
					var arr = points[i].split(",", 2);
					points[i] = new google.maps.LatLng(parseFloat(arr[0]), parseFloat(arr[1]));
				}
			}
			options = $.extend({
				strokeColor : 'red',
				strokeWeight : 2,
				strokeOpacity : 0.5,
				fillColor : 'red',
				fillOpacity : 0.1
			}, options, {
				map : map,
				paths : [points]
			});
			var polygon = new google.maps.Polygon(options);
			return polygon;
		};

		this.setRoute = function(from, to, name, successCallback, errorCallback, options, rendererOptions) {
			if ( typeof (from) === 'object' && typeof (from.getPosition) === 'function') {
				from = from.getPosition();
			}
			if ( typeof (to) === 'object' && typeof (to.getPosition) === 'function') {
				to = to.getPosition();
			}
			var directionsDisplay;
			rendererOptions = $.extend({
				markerOptions : {
					visible : false
				},
				preserveViewport : true
			}, rendererOptions);
			if (name && directions[name]) {
				directionsDisplay = directions[name];
			} else {
				directionsNo++;
				if (name == undefined) {
					name = 'uniqueIdentifier' + directionsNo;
				}
				directions[name] = directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
			}
			options = $.extend({
				origin : from,
				destination : to,
				travelMode : google.maps.DirectionsTravelMode.DRIVING
			}, options);
			directionsService.route(options, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
					directionsDisplay.setMap(map);
					if (successCallback && typeof (successCallback) == 'function') {
						successCallback(response);
					}
				} else {
					if (errorCallback && typeof (errorCallback) == 'function') {
						errorCallback(status, response);
					}
				}
			});
			return this;
		};

		/**
		 * @ignore 
		 */
		var setStreetView = function(point, successCallback, errorCallback) {
			streetviewservice.getPanoramaByLocation(point, 50, function(data, status) {
				if (status == google.maps.StreetViewStatus.OK) {
					google.maps.event.addListener(streetview, 'links_changed', function() {
						createCustomLinks(data.location.pano);
					});
					streetview.setOptions({
						position : data.location.latLng,
						visible : true,
						panoProvider : getCustomPanorama
					});
					if (successCallback && typeof (successCallback) == 'function') {
						var panorama = new Object();
						panorama.pano = data.location.pano;
						panorama.addBuilding = function(id, name, url, angle, backangle) {
							rooms.push({
								id : id,
								name : name,
								url : url,
								building : true,
								pano : this.pano,
								angle : angle,
								backangle : backangle,
								passes : []
							});
							return this;
						};
						successCallback(panorama);
					}
				} else {
					if (errorCallback && typeof (errorCallback) == 'function') {
						errorCallback();
					}
				}
			});
		};

		/**
		 * @ignore 
		 */
		var getCustomPanorama = function(pano) {
			for (var i in rooms) {
				var room = rooms[i];
				if (room.id == pano) {
					return {
						location : {
							pano : room.id,
							description : room.name
						},
						links : [],
						tiles : {
							tileSize : new google.maps.Size(6096, 800),
							worldSize : new google.maps.Size(6096, 800),
							centerHeading : 0,
							getTileUrl : getCustomPanoramaTileUrl
						}
					};
				}
			}
			return null;
		};

		/**
		 * @ignore 
		 */
		var createCustomLinks = function(pano) {
			var links = streetview.getLinks();
			var current = streetview.getPano();
			if (pano == current) {
				for (var i in rooms) {
					var room = rooms[i];
					if (room.building && (!room.pano || room.pano == current)) {
						links.push({
							heading : room.angle,
							description : room.name,
							pano : room.id
						});
					}
				}
			} else {
				for (var i in rooms) {
					var room = rooms[i];
					if (room.id == current) {
						if (room.building) {
							links.push({
								heading : room.backangle,
								description : 'Exit',
								pano : pano
							});
						}
						for (var j in room.passes) {
							var pass = room.passes[j];
							for (var k in rooms) {
								var r = rooms[k];
								if (r.id == pass) {
									links.push({
										heading : r.angle,
										description : r.name,
										pano : r.id
									});
								}
							}
						}
					}
				}
			}
		};

		/**
		 * @ignore 
		 */
		var getCustomPanoramaTileUrl = function(pano, zoom, tilex, tiley) {
			var url;
			for (var i in rooms) {
				if (rooms[i].id == pano) {
					url = rooms[i].url;
				}
			}
			return url;
		}

		this.setStreetView = function(successCallback, errorCallback) {
			setStreetView(map.getCenter(), successCallback, errorCallback);
			return this;
		};

		this.setStreetViewAtAddress = function(address, successCallback, errorCallback) {
			geocoder.geocode({
				'address' : address
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					setStreetView(results[0].geometry.location, successCallback, errorCallback);
				} else {
					if (errorCallback && typeof (errorCallback) == 'function') {
						errorCallback();
					}
				}
			});
			return this;
		};

		this.setStreetViewAtLocation = function(lat, lng, successCallback, errorCallback) {
			var point = new google.maps.LatLng(lat, lng);
			setStreetView(point, successCallback, errorCallback);
			return this;
		};

		this.setStreetViewAtMarker = function(marker, successCallback, errorCallback) {
			var point = marker.getPosition();
			setStreetView(point, successCallback, errorCallback);
			return this;
		};

		this.setStreetViewDirection = function(angle, verticalangle, zoom) {
			angle = angle ? angle : 0;
			verticalangle = verticalangle ? verticalangle : 0;
			zoom = zoom ? zoom : 1;
			streetview.setPov({// point of view
				heading : angle, // rotation angle clockwise from north
				zoom : zoom, // from 0 to 3
				pitch : verticalangle // vertical angle from -90 to 90
			});
			return this;
		};

		this.getStreetViewData = function() {
			var pov = streetview.getPov();
			var position = streetview.getPosition();
			pov.lat = position.lat();
			pov.lng = position.lng();
			return pov;
		};

		/**
		 * @ignore 
		 */
		var distance = function(marker1, marker2) {
			var latlng1 = marker1.getPosition();
			var latlng2 = marker2.getPosition();
			var radlat1 = Math.PI * latlng1.lat() / 180;
			var radlat2 = Math.PI * latlng2.lat() / 180;
			return Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(Math.PI * (latlng1.lng() - latlng2.lng()) / 180)) * 20014.1238528 / Math.PI;
		};

		/**
		 * @ignore 
		 */
		var distances = function(from, markers) {
			var distances = new Array();
			for (var i in markers) {
				var marker = markers[i];
        if(typeof(marker) == 'object') {
          distances.push({
            marker : marker,
            distance : distance(from, marker)
          });
        }
			}
			distances.sort(function(a, b) {
				return a.distance - b.distance;
			});
			return distances;
		};

		/**
		 * Sort markers from closest to farest from destination marker
		 * @param {Marker} fromMarker Destination marker
		 * @param {Array<Marker>} markers Array of markers to sort
		 * @param {function(markers:Array<Object>,status:String)} callback Returns sorted objects (by distance in kilometers) with fields: marker:Marker, distance:Float, airDistance:Float (by plane, optional), routeDistance:Float (by car, optional), duration:Float (by car in minutes, optional), precisly:Boolean (if checked by google maps)
		 * @param {Integer} precisly If is positive, it's number of nearest points (by air), which will be checked by google maps service; workaround for google maps limitations
		 * @param {Object} options Distance Matrix options, see google.maps.DistanceMatrixOptions at Google Maps API Documentation
		 */
		this.getDistances = function(fromMarker, markers, callback, precisly, options) {
			var d = distances(fromMarker, markers);
			if (!precisly) {
				callback(d);
			} else {
				var destinationsMarkers = d.slice(0, precisly);
				var destinations = new Array();
				for (var i in destinationsMarkers) {
					destinations.push(destinationsMarkers[i].marker.getPosition());
				}
				options = $.extend({
					travelMode : google.maps.TravelMode.DRIVING,
					avoidHighways : false,
					avoidTolls : false
				}, options, {
					origins : [fromMarker.getPosition()],
					destinations : destinations
				});
				distanceservice.getDistanceMatrix(options, function(response, status) {
					if (status == google.maps.DistanceMatrixStatus.OK) {
						var results = new Array();
						var origins = response.originAddresses;
						var destinations = response.destinationAddresses;
						for (var i = 0; i < origins.length; i++) {
							var r = response.rows[i].elements;
							for (var j = 0; j < r.length; j++) {
								var element = r[j];
                if(element.status === "ZERO_RESULTS") {
                  results.push(d[j]);
                } else {
                  results.push({
                    marker : d[j].marker,
                    distance : element.distance.value / 1000,
                    airDistance : d[j].distance,
                    routeDistance : element.distance.value / 1000,
                    duration : element.duration.value / 60,
                    precisly : true
                  });
                }
							}
						}
						d.splice(0, precisly);
						results = results.concat(d);
						results.sort(function(a, b) {
							return a.distance - b.distance;
						});
						callback(results, status);
					} else {
						callback(d, status);
					}
				});
			}
		};

		/**
		 * Set info window at marker
		 * @param {Marker} marker Marker for info window
		 * @param {String} info HTML content to show in info window
		 * @param {Object} options Info window options (see google.maps.InfoWindowOptions at Google Maps API Documentation)
		 * @param {String} name Unused at this moment; it should pick right info window from array, when it exists
		 * @return {InfoWindow} google.maps.InfoWindow (see Google Maps API Documentation)
		 */
		this.setInfoWindowAtMarker = function(marker, info, options, name) {
			options = $.extend(options, {
				content : info
			});
			var infowindow = new google.maps.InfoWindow(options);
			infowindows.push(infowindow);
			infowindow.open(map, marker);
			return infowindow;
		}

		/**
		 * Set info window at marker on click event at the marker
		 * @param {Marker} marker Marker for info window
		 * @param {String} info HTML content to show in info window
		 * @param {Object} options Info window options (see google.maps.InfoWindowOptions at Google Maps API Documentation)
		 * @param {Boolean} closeOthers Close all opened info windows before show this one
		 * @return {InfoWindow} google.maps.InfoWindow (see Google Maps API Documentation)
		 */
		this.setInfoWindowAtMarkerOnClick = function(marker, info, options, closeOthers) {
			if (closeOthers) {
				google.maps.event.addListener(marker, 'click', function() {
					googlemaps.closeAllInfoWindows();
				});
			}
			options = $.extend(options, {
				content : info
			});
			var infowindow = new google.maps.InfoWindow(options);
			infowindows.push(infowindow);
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map, marker);
			});
			return infowindow;
		}

		/**
		 * Close all opened info windows 
		 */
		this.closeAllInfoWindows = function() {
			for (var i in infowindows) {
				infowindows[i].close();
			}
		};

		/**
		 * Bind click event to marker
		 * @param {Marker} marker Marker object (get from addMarker)
		 * @param {function(this:Marker)} click Function, which is called on click at marker
		 * @example
		 * var map = $("#map").googlemaps();
		 * map.setMarker("Wroclaw, Polska", function(marker) {
		 * 	map.setMarkerClick(marker, function() {
		 * 	 alert('Marker clicked!');
		 * 	});
		 * }); 
		 */
		this.setMarkerClick = function(marker, click) {
			google.maps.event.addListener(marker, 'click', click);
		};

		/**
		 * Change styles of map (ex. colors)
		 * @param {Array<Object>} styles Array of objects with Google Maps styles notation
		 * @description
		 * Use wizard: http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
		 * @example
		 * map.setStyle([
     *   {
     *     "stylers": [
     *       { "gamma": 0.38 }
     *     ]
     *   }
     * ]);
		 */
		this.setStyles = function(styles) {
			map.setOptions({
				styles : styles
			});
			return this;
		};

		return this;

	};
})(jQuery); 