#!/bin/bash

# Create shapefiles directory if it doesn't exist
mkdir -p public/shapefiles

# Download state boundaries
curl -o public/shapefiles/states.zip https://www2.census.gov/geo/tiger/TIGER2022/STATE/tl_2022_us_state.zip
unzip -o public/shapefiles/states.zip -d public/shapefiles/states
mv public/shapefiles/states/tl_2022_us_state.* public/shapefiles/
rm -r public/shapefiles/states
rm public/shapefiles/states.zip

# Download urban areas
curl -o public/shapefiles/urban_areas.zip https://www2.census.gov/geo/tiger/TIGER2022/UAC/tl_2022_us_uac10.zip
unzip -o public/shapefiles/urban_areas.zip -d public/shapefiles/urban_areas
mv public/shapefiles/urban_areas/tl_2022_us_uac10.* public/shapefiles/
rm -r public/shapefiles/urban_areas
rm public/shapefiles/urban_areas.zip

# Download counties
curl -o public/shapefiles/counties.zip https://www2.census.gov/geo/tiger/TIGER2022/COUNTY/tl_2022_us_county.zip
unzip -o public/shapefiles/counties.zip -d public/shapefiles/counties
mv public/shapefiles/counties/tl_2022_us_county.* public/shapefiles/
rm -r public/shapefiles/counties
rm public/shapefiles/counties.zip

# Download ZCTAs
echo "Downloading ZCTAs..."
curl -L -o public/shapefiles/zctas.zip https://www2.census.gov/geo/tiger/TIGER2022/ZCTA520/tl_2022_us_zcta520.zip
unzip -o public/shapefiles/zctas.zip -d public/shapefiles/zctas
mv public/shapefiles/zctas/tl_2022_us_zcta520.* public/shapefiles/
rm -r public/shapefiles/zctas
rm public/shapefiles/zctas.zip

echo "Shapefiles downloaded and extracted successfully!" 