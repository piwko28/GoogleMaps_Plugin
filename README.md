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
