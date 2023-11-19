# Building a 3D Climate Change Visualization with Three.js

## [[Link]](https://felri.github.io/planet-heat-map-timelapse/)

![Screenshot-globe](https://github.com/felri/planet-heat-map-timelapse/assets/56592364/21689ae1-93d9-4086-877b-2cac550346f0)

I aimed to present climate change data in a 3D environment, making complex information more digestible and engaging. This technical walkthrough details the creation of an interactive globe that displays temperature changes by country over time.

### Starting Point
The data for this visualization comes from the [IMF's Climate Change Indicators database](https://climatedata.imf.org/pages/climatechange-data ), which offers yearly average temperature anomalies by country from 1960 to 2022. While informative, this dataset lacked geographic coordinates.

### Merging Data
To plot the data on a 3D globe, I needed latitude and longitude for each country. A [Google dataset](https://developers.google.com/public-data/docs/canonical/countries_csv) provided these coordinates, but matching it with the IMF data was not straightforward due to naming inconsistencies. I resolved this by implementing a fuzzy search algorithm to accurately combine the two datasets.

### Preparing the Data for the Frontend
Here's the Python code I wrote to merge the datasets and prepare them for use in the web application:

```python
import pandas as pd
from io import StringIO
from fuzzywuzzy import process

# Function to find the best match for a given name
def get_closest_match(x, list_names):
    best_match = process.extractOne(x, list_names, score_cutoff=80)
    return best_match[0] if best_match else None

# Reading the CSV file
climate_data = pd.read_csv('data.csv')

# Reading the country data from a text file
country_data = pd.read_csv('lat-long-position.txt', sep="\t")

# Getting a list of names from the string data
list_names = country_data['name'].tolist()

# Adding a new column to the climate data for the closest name match
climate_data['closest_name'] = climate_data['Country'].apply(lambda x: get_closest_match(x, list_names))

# Merging the datasets using the closest name match
merged_data = pd.merge(climate_data, country_data, left_on='closest_name', right_on='name')

# Save the merged data
merged_data.to_csv('merged_country_data.csv', index=False)
```

[full code here](https://github.com/felri/climate-globe-dataset-python-notebook)

### Setting Up the Frontend
For the web development part, I started with the r3f-vite-starter kit. It helped me set up the project quickly. Then, I added the merged CSV data to the project directory to be used in rendering the 3D visualization.

### The Visualization
Using Three.js, I developed a 3D model of Earth. I then represented each country's data as spheres on the globe, with their size and color reflecting the temperature change. This model allows users to interact with the data, turning abstract numbers into a visual story of climate change over the decades.


