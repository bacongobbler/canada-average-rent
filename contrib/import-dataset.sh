#!/usr/bin/env bash

DATA_SOURCE="http://www20.statcan.gc.ca/tables-tableaux/cansim/csv/00270040-eng.zip"

isnumber() {
    printf '%f' "$1" &>/dev/null && echo "this is a number" || echo "not a number";
}

wget $DATA_SOURCE -O dataset.zip
unzip dataset.zip
rm dataset.zip

mv 00270040-eng.csv dataset.csv

#begin writing out the json file
echo "[" > dataset.json

while IFS=, read year city province geo_class structure unit vector coordinates price
do
    # check if the price is a positive integer/floating point number
    re='^[0-9]*\.?[0-9]+'
    if [[ $price =~ $re ]] ; then
        # scrub unclean data
        city=${city/\"/} 
        province=${province/\"/}
        price=${price/.*/}
        printf '    {"year": %d, "city": "%s", "province": "%s", "geographical_classification": "%s", "structure": "%s", "unit":"%s", "vector": "%s", "coordinates": "%s", "price": %s },\n' "$year" "$city" "$province" "$geo_class" "$structure" "$unit" "$vector" "$coordinates" "$price" >> dataset.json
    fi
done < dataset.csv

echo "]" >> dataset.json

rm dataset.csv
