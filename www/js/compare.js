
var compare_data_key = 'CODE_compare-data',
    div_template = '<div class="panel">' +
    '<h2>{city}</h2>' +
    '<ul>' +
        '<li><strong>Canada Geographical Classification: </strong>{geo}</li>' +
        '<li><strong>Coordinates: </strong>{coord}</li>' + 
        '<li><strong>Average Price: </strong>{avgprice}</li>' +
    '</ul>' +
    '</div>';

$(function () {
    try {
        var currentData = localStorage[compare_data_key];
            formattedHtml = '';

        if (currentData !== '') {
            currentData = currentData.split('||');

            for (var i in currentData) {
                var formattedJson = JSON.parse(currentData[i]);

                formattedHtml += div_template.replace('{city}', formattedJson.city)
                                             .replace('{geo}', formattedJson.geographical_classification)
                                             .replace('{coord}', formattedJson.coordinates)
                                             .replace('{avgprice}', formattedJson.average_price);
            }
        }
        else{
            formattedHtml = '<h2>There is no data to compare at the moment. Try adding some!</h2>';
        }

        $('#content').html(formattedHtml);
    }
    catch (e) {
        alert("It doesn't look like this browser supports local storage. This application requires local storage to store compare data.");
    }
});