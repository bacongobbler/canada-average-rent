
var unfiltered_dataset = [],
    filtered_dataset = [],
    compare_data_key = 'CODE_compare-data',
    delimiter = '||',
    width = $(window).width(),
    height = $(window).height(),
    buttonRadius = 3.5,
    svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

// RENDER MAP BY DEFAULT DIMENSIONS
$(function () {
    // retrieve dataset from json object
    $.getJSON( "data/dataset.json", function(data) {
        $.each( data, function( key, value ) {
            unfiltered_dataset.push(value);
            // use 2013 by default
            if(value.year === '2013') {
                filtered_dataset.push(value);
            };
        });
        
        draw_map();

        // create a dropdown list from the unfiltered dataset
        for(var i = 0; i < unfiltered_dataset.length; i++) {
            if( ! value_exists('#filter-year option', unfiltered_dataset[i].year)) {
                $('#filter-year').append($('<option></option>').val(unfiltered_dataset[i].year).html(unfiltered_dataset[i].year));
            }
            // sort numerically by year
            sort_dropdown_by_value('#filter-year');
            if( ! value_exists('#filter-unit option', unfiltered_dataset[i].unit)) {
                $('#filter-unit').append($('<option></option>').val(unfiltered_dataset[i].unit).html(unfiltered_dataset[i].unit));
            }
        }
    });
});

// set events on 
$('#filter-year').on('change', update_dataset);
$('#filter-unit').on('change', update_dataset);
$('.compare-data-list').on('click', list_comparison_data);
$('.compare-data-delete').on('click', delete_localstorage);

// sort a dropdown list by its value
function sort_dropdown_by_value(id) {
    // Loop for each select element on the page.
    $(id).each(function() {

        // Keep track of the selected option.
        var selectedValue = $(this).val();

        // Sort all the options by value
        $(this).html($("option", $(this)).sort(function(a, b) {
            return a.value == b.value ? 0 : a.value < b.value ? -1 : 1
        }));

        // Select one option.
        $(this).val(selectedValue);
    });
}

// update the filtered dataset based on certain actions
function update_dataset(){
    // set reference to select elements
    var year = $('#filter-year'),
        unit = $('#filter-unit');

    // check if user has made a selection on both dropdowns
    if ( year.prop('selectedIndex') > 0 && unit.prop('selectedIndex') > 0 ) {
        // clear filtered dataset
        filtered_dataset = [];
        $.each(unfiltered_dataset, function(key, value) {
            if(value.year === year.val() && value.unit == unit.val()) {
                filtered_dataset.push(value);
            }
        });
    }
};

function dataset_for_city(city_name){
    var city_dataset = {},
        unmerged_dataset = [],
        average_price = 0,
        coords = "",
        classification = "",
        year = "",
        unit = "";

    // retrieve all datasets that are from this city
    $.each(filtered_dataset, function(key, value) {
        if(value.city === city_name) {
            // scrub json to display only the important stuff
            var tmp = { "coordinates": value.coordinates, 
                        "geographical_classification": value.geographical_classification, 
                        "price": value.price,
                        "year": value.year,
                        "unit": value.unit };
            unmerged_dataset.push(tmp);
        }
    });

    // average out the price of all datasets for this city and return
    $.each(unmerged_dataset, function(key, value) {
        average_price += parseInt(value.price, 10);
        coords = value.coordinates;
        classification = value.geographical_classification;
        year = value.year;
        unit = value.unit;
    });
    average_price /= unmerged_dataset.length;
    average_price = average_price.toFixed(2);

    if(isNaN(average_price)) {
        average_price = "no data";
    }
    if(coords === "") {
        coords = "no data";
    }
    if(classification === "") {
        classification = "no data";
    }
    if(year === "") {
        year = "no data";
    }
    if(unit === "") {
        unit = "no data";
    }

    return { "city": city_name, 
             "coordinates": coords, 
             "geographical_classification": classification, 
             "average_price": "$" + average_price,
             "year": year,
             "unit": unit };
}

function city_exists_in_dataset(city_name) {
    var exists = false;

    $.each(unfiltered_dataset, function(k, v) {
        if(city_name === v.city) {
            exists = true;
            return false;
        }
    });
    return exists;
}

// check if a certain value exists in an element
function value_exists(element_id, value) {
    var exists = false;
    
    $(element_id).each(function(){
        if (this.value == value) {
            exists = true;
            return false;
        }
    });
    return exists;
}

function draw_map() {
    d3.json("data/canadamapprovinces.json", function(error, can) {

        // only load the cities that exist in the dataset
        var new_geometries = [];
        $.each(can.objects.places.geometries, function(k, v) {
            if(city_exists_in_dataset(v.properties.name)) {
                new_geometries.push(v);
            }
        });

        can.objects.places.geometries = new_geometries;

        var provinces = topojson.feature(can, can.objects.statelines),
            places = topojson.feature(can, can.objects.places),
            projection = d3.geo.albers()
                            .center([0, 58])
                            .parallels([50, 60])
                            .scale(2300)
                            .translate([width / 1.1, height / 2]),
            path = d3.geo.path().projection(projection);

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

        // ADD CLICKABLE CITIES
        svg.selectAll(".place-label")
            .data(places.features)
            .enter().append("circle")
            .attr("class", "place-button")
            .attr("r", buttonRadius)
            .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
            .attr("name", function(d) { return d.properties.name; });

        $('.place-button').on('click', function (e) {
            var city = e.toElement.attributes["name"].value,
                data = dataset_for_city(city);

            $('.city-info-title').html(city);
            $('.city-info-body').html('<ul>' +
                '<li><strong>Canada Geographical Classification: </strong>' + data.geographical_classification + '</li>' +
                '<li><strong>Coordinates: </strong>' + data.coordinates + '</li>' + 
                '<li><strong>Average Price: </strong>' + data.average_price + '</li>' +
            '</ul>');
            $('#city-info-modal').modal('show');

            $('.compare-data').one('click', function (e) {
                add_to_localstorage(data);
                $('#city-info-modal').modal('hide');
            });
        });
    });
}

function add_to_localstorage (data) {
    var currentData = load_localstorage();

    if (check_unique(data, currentData)) {
        debugger;
        currentData.push(JSON.stringify(data));
        currentData = currentData.join(delimiter);
        localStorage[compare_data_key] = currentData;
    }
}

function list_comparison_data () {
    var div_template = '<div class="panel panel-default"><div class="panel-body">' +
        '<h2>{city}</h2>' +
        '<ul>' +
            '<li><strong>Year: </strong>{year}</li>' +
            '<li><strong>Canada Geographical Classification: </strong>{geo}</li>' +
            '<li><strong>Coordinates: </strong>{coord}</li>' + 
            '<li><strong>Average Price: </strong>{avgprice}</li>' +
            '<li><strong>Room Type: </strong>{unit}</li>' +
        '</ul>' +
        '</div></div>',
        currentData = load_localstorage(),
        formattedHtml = '';

    if (currentData !== '') {
        for (var i in currentData) {
            var formattedJson = JSON.parse(currentData[i]);

            formattedHtml += div_template.replace('{city}', formattedJson.city)
                                         .replace('{year}', formattedJson.year)
                                         .replace('{geo}', formattedJson.geographical_classification)
                                         .replace('{coord}', formattedJson.coordinates)
                                         .replace('{avgprice}', formattedJson.average_price)
                                         .replace('{unit}', formattedJson.unit);
        }
    }
    else {
        formattedHtml = '<h2>There is no data to compare at the moment. Try adding some!</h2>';
    }

    $('.compare-data-body').html(formattedHtml);
    $('#compare-data-modal').modal('show');
}

function load_localstorage() {
    try {
        var currentData = localStorage[compare_data_key];

        if (currentData !== '') {
            currentData = currentData.split(delimiter);
        }
        else{
            currentData = [];
        }

        return currentData;
    }
    catch (e) {
        alert("It doesn't look like this browser supports local storage. This application requires local storage to store compare data.");
    }
}

function delete_localstorage() {
    localStorage[compare_data_key] = [];
    $('#compare-data-modal').modal('hide');
}

function check_unique (data, currentData) {
    var isUnique = true;

    for (var i in currentData) {
        var currentDataItem = JSON.parse(currentData[i]);
        if (data.city === currentDataItem.city &&
            data.year === currentDataItem.year &&
            data.geographical_classification === currentDataItem.geographical_classification &&
            data.coordinates === currentDataItem.coordinates &&
            data.average_price === currentDataItem.average_price &&
            data.unit == currentDataItem.unit) {
            isUnique = false;
        }
    }

    return isUnique;
}