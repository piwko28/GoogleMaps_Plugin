# jQuery GoogleMaps Plugin

Easier way to quickly create google map with jQuery


Put in head:
```html
<script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>
```
and this file.


Use:
```js
  var map = $("#mapcontainer")
   .css({ width : '300px', height : '300px' })
   .googlemaps();
  var marker = map.setMarkerAtAddress('Wroclaw');
  map.setCenterAtMarker(marker, 5);
```

It means:
  Center and put a marker on Wrocław and zoom it to 5.
  

See example directory for more.


## Documentation


### Properties

#### markers

Array of all placed markers


#### infowindows

Array of all infowindows


#### map

Map object (see more at Google Maps API v3)


### Methods

#### setMarker(address, successCallback, errorCallback, options, image)

Place marker at real address on the map

 * **Parameters:**
   * `address` — `String` — Real address or geographic position "lat, lng" to place marker on it
   * `successCallback` — `function(Marker)` — Function, which is called after geocoding address and put the marker
   * `{function(string,` — errorCallback Function, which is called after error (ex. unknown address); params: status, address
   * `options` — `Object` — Marker additional options (see google.maps.Marker at Google Maps API Documentation)
   * `image` — `String` — Url to image of marker's icon
 * **Returns:** `Object` — Map plugin itself
 * **Example:** 

```js
var map = $("#map").googlemaps();
map.setMarker(
	"Wroclaw, Poland",
	undefined,
	function() {
		alert('Can't find!');
	},
	{
		visible : false
	}
);
map.setMarker("52, 20");
```


#### setMarkersAtAddresses(addresses, successCallback, errorCallback, options, images, putMarkerCallback)

Place many markers at real addresses

 * **Parameters:**
   * `addresses` — `Array<String>` — Array of real addresses or geographic positions "lat, lng" to place marker on it
   * `successCallback` — `function(Array<Marker>)` — Function, which is called after put all markers on the map
   * `{function(string,` — errorCallback Function, which is called after error (ex. unknown address); params: status, address
   * `options` — `Object` — Marker additional options (see google.maps.Marker at Google Maps API Documentation)
   * `image` — `String` — Url to image of marker's icon
   * `{function(Marker,` — putMarkerCallback Function, which is called after geocoding address and put the marker; params: marker, address
 * **Returns:** `Object` — Map plugin itself
 * **Example:** 

```js
$("#map").googlemaps().setMarkersAtAddresses([
  "Polska",
  "Niemcy",
  "Holandia",
  "Ukraina",
  "Rosja"
]);
```


#### setCenter(address, zoom, successCallback, errorCallback, geocoderoptions)

Center map at real address, geographical coordinates or marker

 * **Parameters:**
   * `{String,` — Array<Marker>} address Real address, geographical coordinates (string: "lat, lng"), marker or array of markers to center the map on it
   * `zoom` — `Integer` — Zoom multiplier
   * `successCallback` — `function(position:LatLng)` — Function, which is called after find address, center and zoom
   * `{function(status:String,` — errorCallback Function, which is called after error with finding address
   * `Object` — `Object` — with additional options of geocoder
 * **Returns:** `Object` — Map plugin itself
 * **Example:** 

```js
var map = $("#map").googlemaps();
map.setMarkerAtAddress(
	"Grabiszyńska 241, Wrocław, Polska",
	function(marker) {
		map.setCenter(marker, 16);
	}
);
```


#### setRoute(from, to, name, successCallback, errorCallback, options, rendererOptions)

Draw route between two markers on the map.

 * **Parameters:**
   * `from` — `Marker` — From marker
   * `to` — `Marker` — Destination marker
   * `successCallback` — `Function` — callback on success
   * `errorCallback` — `Function` — Callback on error
   * `options` — `Object` — request options (see: maps api)
   * `rendererOptions` — `Object` — Renderer optins (see: maps api)
 * **Example:** 

```js
var map = $("#map").googlemaps();
map.setMarker(
	"Wroclaw, Poland",
	function(from) {
		map.setMarker(
			"Warszawa, Poland",
			function(to) {
				map.setRoute(from, to, "route1");
			}
		);
	}
);
```


#### setPolygon(points, options)

Draw polygon on the maps. Default is red stroke and red fill

 * **Parameters:**
   * `points` — `Array<Marker,String>` — Array of markers or/and geographical positions "lat, lng" or verticles of polygon
   * `options` — `Object` — Polygon options (see google.maps.PolygonOptions at Google Maps API Documentation)
 * **Returns:** `Polygon` — google.maps.Polygon
 * **Example:** 

```js
var map = $("#map").googlemaps();
map.setCenter("Polska", 6, function() {
	map.setMarkersAtAddresses(
		[
			"Warszawa",
			"Kraków",
			"Wrocław"
		],
		function(markers) {
			map.setPolygon([
				markers[0],
				markers[1],
				markers[2],
				"51, 19",
				markers[0]
			]);
		}
	);
});
```


#### getDistances(fromMarker, markers, callback, precisly, options)

Sort markers from closest to farest from destination marker

 * **Parameters:**
   * `fromMarker` — `Marker` — Destination marker
   * `markers` — `Array<Marker>` — Array of markers to sort
   * `callback` — `function(markers:Array<Object>,status:String)` — Returns sorted objects (by distance in kilometers) with fields: marker:Marker, distance:Float, airDistance:Float (by plane, optional), routeDistance:Float (by car, optional), duration:Float (by car in minutes, optional), precisly:Boolean (if checked by google maps)
   * `precisly` — `Integer` — If is positive, it's number of nearest points (by air), which will be checked by google maps service; workaround for google maps limitations
   * `options` — `Object` — Distance Matrix options, see google.maps.DistanceMatrixOptions at Google Maps API Documentation


#### setInfoWindowAtMarker(marker, info, options, name)

Set info window at marker

 * **Parameters:**
   * `marker` — `Marker` — Marker for info window
   * `info` — `String` — HTML content to show in info window
   * `options` — `Object` — Info window options (see google.maps.InfoWindowOptions at Google Maps API Documentation)
   * `name` — `String` — Unused at this moment; it should pick right info window from array, when it exists
 * **Returns:** `InfoWindow` — google.maps.InfoWindow (see Google Maps API Documentation)


#### setInfoWindowAtMarkerOnClick(marker, info, options, closeOthers)

Set info window at marker on click event at the marker

 * **Parameters:**
   * `marker` — `Marker` — Marker for info window
   * `info` — `String` — HTML content to show in info window
   * `options` — `Object` — Info window options (see google.maps.InfoWindowOptions at Google Maps API Documentation)
   * `closeOthers` — `Boolean` — Close all opened info windows before show this one
 * **Returns:** `InfoWindow` — google.maps.InfoWindow (see Google Maps API Documentation)


#### closeAllInfoWindows()

Close all opened info windows

#### setMarkerClick(marker, click)

Bind click event to marker

 * **Parameters:**
   * `marker` — `Marker` — Marker object (get from addMarker)
   * `click` — `function(this:Marker)` — Function, which is called on click at marker
 * **Example:** 

```js
var map = $("#map").googlemaps();
map.setMarker(
	"Wroclaw, Polska",
	function(marker) {
		map.setMarkerClick(marker, function() {
			alert('Marker clicked!');
		});
	}
);
```


#### setStyles(styles)

Change styles of map (ex. colors) Use wizard: http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html

 * **Parameters:** `styles` — `Array<Object>` — Array of objects with Google Maps styles notation
 * **Example:** 

 ```js
 map.setStyle([ { "stylers": [ { "gamma": 0.38 } ] } ]);
 ```
