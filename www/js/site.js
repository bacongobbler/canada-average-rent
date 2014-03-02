
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
$('#filter-year').on('change', on_change);
$('#filter-unit').on('change', on_change);
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

function on_change() {
    update_dataset()
    update_colors()
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

// update the colour for each circle
function update_colors() {
    var circles = $('circle');
    var high_value = get_high_value(filtered_dataset);
    var low_value = get_low_value(filtered_dataset);
    var hax_value = "#0F0";
    $.each(circles, function(k, v) {
        var dataset = dataset_for_city(v.attributes.name.value);
        var scale = get_scale(parseInt(dataset.average_price), high_value, low_value);
        hex_value = get_between_colour_by_percent(
            scale,
            0x0F0,
            0xF00)
            .toString(16)
            .toUpperCase();
        hex_value = sprintf("%03s", hex_value);
        v.setAttribute('style', 'fill: ' + hex_value);
        v.setAttribute('r', 10 * scale + 3);
    });
}

function get_high_value(dataset) {
    var value = 0;
    $.each(dataset, function(k, v) {
        if(parseInt(v.price) > value) {
            value = parseInt(v.price);
        }
    });
    return value;
}

function get_low_value(dataset) {
    var value = 10000000000;
    $.each(dataset, function(k, v) {
        if(parseInt(v.price) < value) {
            value = parseInt(v.price);
        }
    });
    return value;
}

// gets back a value based on the scale
function get_scale(value, high_value, low_value) {
    return ((value - low_value) / (high_value - low_value));
}

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
        average_price = 0;
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

// finds a colour value between two hex values based on a range of 0-1
function get_between_colour_by_percent(value, high_color, low_color) {
    if(typeof(high_color)==='undefined') high_color = 0xFFF;
    if(typeof(low_color)==='undefined') low_color = 0x000;
    var r = high_color >> 16;
    var g = high_color >> 8 & 0xFF;
    var b = high_color & 0xFF;

    r += ((low_color >> 16) - r) * value;
    g += ((low_color >> 8 & 0xFF) - g) * value;
    b += ((low_color & 0xFF) - b) * value;

    return (r << 16 | g << 8 | b);
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

    if (currentData !== '' && currentData.length !== 0) {
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

function sprintf() {
  //  discuss at: http://phpjs.org/functions/sprintf/
  // original by: Ash Searle (http://hexmen.com/blog/)
  // improved by: Michael White (http://getsprink.com)
  // improved by: Jack
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Dj
  // improved by: Allidylls
  //    input by: Paulo Freitas
  //    input by: Brett Zamir (http://brett-zamir.me)
  //   example 1: sprintf("%01.2f", 123.1);
  //   returns 1: 123.10
  //   example 2: sprintf("[%10s]", 'monkey');
  //   returns 2: '[    monkey]'
  //   example 3: sprintf("[%'#10s]", 'monkey');
  //   returns 3: '[####monkey]'
  //   example 4: sprintf("%d", 123456789012345);
  //   returns 4: '123456789012345'

  var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
  var a = arguments;
  var i = 0;
  var format = a[i++];

  // pad()
  var pad = function(str, len, chr, leftJustify) {
    if (!chr) {
      chr = ' ';
    }
    var padding = (str.length >= len) ? '' : new Array(1 + len - str.length >>> 0)
      .join(chr);
    return leftJustify ? str + padding : padding + str;
  };

  // justify()
  var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
    var diff = minWidth - value.length;
    if (diff > 0) {
      if (leftJustify || !zeroPad) {
        value = pad(value, minWidth, customPadChar, leftJustify);
      } else {
        value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
      }
    }
    return value;
  };

  // formatBaseX()
  var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
    // Note: casts negative numbers to positive ones
    var number = value >>> 0;
    prefix = prefix && number && {
      '2': '0b',
      '8': '0',
      '16': '0x'
    }[base] || '';
    value = prefix + pad(number.toString(base), precision || 0, '0', false);
    return justify(value, prefix, leftJustify, minWidth, zeroPad);
  };

  // formatString()
  var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
    if (precision != null) {
      value = value.slice(0, precision);
    }
    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
  };

  // doFormat()
  var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
    var number, prefix, method, textTransform, value;

    if (substring === '%%') {
      return '%';
    }

    // parse flags
    var leftJustify = false;
    var positivePrefix = '';
    var zeroPad = false;
    var prefixBaseX = false;
    var customPadChar = ' ';
    var flagsl = flags.length;
    for (var j = 0; flags && j < flagsl; j++) {
      switch (flags.charAt(j)) {
        case ' ':
          positivePrefix = ' ';
          break;
        case '+':
          positivePrefix = '+';
          break;
        case '-':
          leftJustify = true;
          break;
        case "'":
          customPadChar = flags.charAt(j + 1);
          break;
        case '0':
          zeroPad = true;
          break;
        case '#':
          prefixBaseX = true;
          break;
      }
    }

    // parameters may be null, undefined, empty-string or real valued
    // we want to ignore null, undefined and empty-string values
    if (!minWidth) {
      minWidth = 0;
    } else if (minWidth === '*') {
      minWidth = +a[i++];
    } else if (minWidth.charAt(0) == '*') {
      minWidth = +a[minWidth.slice(1, -1)];
    } else {
      minWidth = +minWidth;
    }

    // Note: undocumented perl feature:
    if (minWidth < 0) {
      minWidth = -minWidth;
      leftJustify = true;
    }

    if (!isFinite(minWidth)) {
      throw new Error('sprintf: (minimum-)width must be finite');
    }

    if (!precision) {
      precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
    } else if (precision === '*') {
      precision = +a[i++];
    } else if (precision.charAt(0) == '*') {
      precision = +a[precision.slice(1, -1)];
    } else {
      precision = +precision;
    }

    // grab value using valueIndex if required?
    value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

    switch (type) {
      case 's':
        return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
      case 'c':
        return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
      case 'b':
        return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'o':
        return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'x':
        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'X':
        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad)
          .toUpperCase();
      case 'u':
        return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
      case 'i':
      case 'd':
        number = +value || 0;
        number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
        prefix = number < 0 ? '-' : positivePrefix;
        value = prefix + pad(String(Math.abs(number)), precision, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
      case 'e':
      case 'E':
      case 'f': // Should handle locales (as per setlocale)
      case 'F':
      case 'g':
      case 'G':
        number = +value;
        prefix = number < 0 ? '-' : positivePrefix;
        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
        value = prefix + Math.abs(number)[method](precision);
        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
      default:
        return substring;
    }
  };

  return format.replace(regex, doFormat);
}
