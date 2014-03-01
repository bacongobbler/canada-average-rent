
var unfiltered_dataset = [];
var filtered_dataset = [];

// debugging function for dumping a dataset to the logger
function dump_dataset(dataset) {
    $.each(dataset, function(k, v) {
        console.log(v);
    });
}

// retrieve dataset from json object
$.getJSON( "data/dataset.json", function(data) {
    $.each( data, function( key, value ) {
        unfiltered_dataset.push(value);
        // use 2013 by default
        if(value.year === '2013') {
            filtered_dataset.push(value);
        };
    });
});

// update the filtered dataset based on certain actions
function update_dataset(){
    // set reference to select elements
    var year = $('#filter-year');
    var unit = $('#filter-unit');
    // check if user has made a selection on both dropdowns
    if ( year.prop('selectedIndex') > 0 && unit.prop('selectedIndex') > 0 ) {
        // clear filtered dataset
        filtered_dataset = [];
        $.each(unfiltered_dataset, function(key, value) {
            if(value.year === year.val() && value.unit == unit.val()) {
                filtered_dataset.push(value);
            }
        });
        dump_dataset(filtered_dataset);
    }
};

// set events on 
$('#filter-year').on('change', update_dataset);
$('#filter-unit').on('change', update_dataset);

// RENDER MAP BY DEFAULT DIMENSIONS
$(function () {
    var width = $(window).width(),
        height = $(window).height(),
        svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);
    
    d3.json("data/canadamapprovinces.json", function(error, can) {
        var provinces = topojson.feature(can, can.objects.statelines),
            places = topojson.feature(can, can.objects.places),
            projection = d3.geo.albers()
                            .center([0, 58])
                            .parallels([50, 60])
                            .scale(2300)
                            .translate([width / 1.1, height / 2]),
            path = d3.geo.path().projection(projection);

        path.pointRadius(2);

        // DRAW MAP
        svg.append("path")
            .datum(provinces)
            .attr("d", path);

        // COLOUR-CODE MAP
        svg.selectAll(".subunit")
            .data(provinces.features)
            .enter().append("path")
            .attr("class", function(d) { return "province " + d.properties.name.split(' ').join(''); })
            .attr("d", path);

        // ADD PLACES ON MAP
        svg.append("path")
            .datum(places)
            .attr("d", path)
            .attr("class", "place");

        // LABEL PLACES
        svg.selectAll(".place-label")
            .data(places.features)
            .enter().append("input")
            .attr("class", "place-button")
            .attr("type", "button")
            .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
            .attr("name", function(d) { return d.properties.name; });

        $('.place').on('click', function (e) {
            alert("You clicked a province.");
        });
    });
});



// CLICK ABOUT BUTTON EVENT

// CLICK COMPARE BUTTON EVENT

// CLICK ADD-TO-COMPARE BUTTON EVENT

// SET OR UNSET FILTERING EVENT

// LEGEND APPEAR/DISAPPEAR

// JUMBOTRON APPEAR/DISAPPEAR
