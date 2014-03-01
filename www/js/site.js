
// RENDER MAP BY DEFAULT DIMENSIONS
$(function () {
    var width = 800,
        height = 600,
        svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);
    
    d3.json("data/canada.json", function(error, can) {
        var subunits = topojson.feature(can, can.objects.subunits),
            projection = d3.geo.azimuthalEqualArea()
                            .rotate([100, -45])
                            .center([5, 20])
                            .scale(800)
                            .translate([w/2, h/2]),
            path = d3.geo.path().projection(projection);

        svg.append("path")
            .datum(subunits)
            .attr("d", path);
    });
});

// CLICK ABOUT BUTTON EVENT

// CLICK COMPARE BUTTON EVENT

// CLICK ADD-TO-COMPARE BUTTON EVENT

// SET OR UNSET FILTERING EVENT

// LEGEND APPEAR/DISAPPEAR

// JUMBOTRON APPEAR/DISAPPEAR

// RETRIEVE DATASET FROM JSON
$.getJSON( "data/dataset.json", function(data) {
  var items = [];
  $.each( data, function( key, val ) {
    items.push(val);
  });
});
