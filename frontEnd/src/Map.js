import React from "react";
import MapGL, {
  Marker,
  Source,
  Layer,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  LinearInterpolator,
  WebMercatorViewport,
} from "react-map-gl";
import bbox from "@turf/bbox";
import Select from "react-select";
import { useEffect, useState } from "react";
import "./Map.css";
import axios from "axios";
import { dataLayer } from "./map-style.js";

function Map() {
  const [points, setPoints] = useState([]);
  const [arrOptions, setarrOptions] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedYear, setSelectedYear] = useState({
    value: undefined,
    label: undefined,
  });
  const [arrondissement, setArrondissement] = useState({
    value: 1,
    label: "arrondissement n° : 1",
  });
  const onClick = (numero) => {
    console.log(numero)
    const feature = polygons.features
      .filter((place) => place.properties.c_ar === numero)
      .shift();
    console.log(feature);
    if (feature) {
      // calculate the bounding box of the feature
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      // construct a viewport instance from the current state
      const vp = new WebMercatorViewport(viewport);
      const { longitude, latitude, zoom } = vp.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: 20,
        }
      );

      setViewport({
        ...viewport,
        longitude,
        latitude,
        zoom,
        // transitionInterpolator: new LinearInterpolator({
        //   around: [event.offsetCenter.x, event.offsetCenter.y],
        // }),
        transitionDuration: 1000,
      });
    }
  };

  const [params, setParams] = useState({
    annee_tournage: undefined,
  });
  const geolocateStyle = {
    top: 0,
    left: 0,
    padding: "10px",
  };

  const fullscreenControlStyle = {
    top: 36,
    left: 0,
    padding: "10px",
  };

  const navStyle = {
    top: 72,
    left: 0,
    padding: "10px",
  };

  const scaleControlStyle = {
    bottom: 36,
    left: 0,
    padding: "10px",
  };

  const [viewport, setViewport] = useState({
    latitude: 48.8625627018,
    longitude: 2.33644336205,
    width: "100%",
    height: "95vh",
    zoom: 12,
  });
  useEffect(() => {
    getPolygons();
    getPointsByPolygon();
  }, [arrondissement, params]);
  useEffect(() => {
    if (polygons.features)
      setarrOptions(
        polygons.features
          .map((place) => {
            return {
              value: place.properties.c_ar,
              label: "arrondissemet n° :" + place.properties.c_ar,
            };
          })
          .sort((a, b) => {
            return a.value - b.value;
          })
      );
  }, [polygons]);

  const getPolygons = () => {
    axios
      .get("http://localhost:9000/get/polygons")
      .then((data) => {
        setPolygons(data.data);
      })
      .catch((error) => console.log(error));
  };

  const getPointsByPolygon = () => {
    axios
      .post(`http://localhost:9000/get/filteredPoints`, {
        arrondissement: arrondissement.value,
        params,
      })
      .then((data) => {
        setPoints(data.data);
      })
      .catch((error) => console.log(error));
  };
  // const handleFilterChange = (type, value) => {
  //   if (type === "annee") {
  //     setAnne;
  //   }
  // };

  const AnneOptions = [
    { value: 2016, label: "2016" },
    { value: 2017, label: "2017" },
    { value: 2018, label: "2018 " },
    { value: 2019, label: "2019 " },
    { value: 2020, label: "2020 " },
  ];

  return (
    <div>
      <div className="top_bar ">
        <Select
          className="button"
          name="annee"
          isSearchable={false}
          options={AnneOptions}
          onChange={(value) => {
            setParams({ annee_tournage: value.value });
            setSelectedYear(value);
          }}
        />

        <Select
          className="button"
          name="arrondissement"
          defaultValue={arrondissement}
          options={arrOptions}
          value={arrondissement}
          onChange={(arrondissement) => {
            setArrondissement(arrondissement);
            onClick(arrondissement.value);
          }}
        />
      </div>
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/aymannn/cktn2lof5anwb17p59etlltoi"
        mapboxApiAccessToken="pk.eyJ1IjoiYXltYW5ubiIsImEiOiJja3BuZHVrZ2QybzM2MndyaXEwamxuZDVqIn0.6GM7CF90UWngIGU66viGDw"
        onViewportChange={(viewport) => setViewport(viewport)}
        onClick={onClick}
      >
        {points.map((point, i) => (
          <div key={i}>
            <Marker
              longitude={point.geometry.coordinates[0]}
              latitude={point.geometry.coordinates[1]}
              offsetTop={-15}
              offsetLeft={-10}
            >
              <p
                role="img"
                className="pin__selected"
                onClick={() => setSelectedPlace(point)}
              ></p>
            </Marker>
            {selectedPlace && (
              <Popup
                className="popup"
                closeOnClick={true}
                onClose={() => setSelectedPlace(null)}
                longitude={selectedPlace.geometry.coordinates[0]}
                latitude={selectedPlace.geometry.coordinates[1]}
              >
                <div>
                  <p>
                    Nom Tournage :{" "}
                    <span>{selectedPlace.properties.nom_tournage}</span>{" "}
                  </p>
                  <p>
                    Type Tournage :{" "}
                    <span>{selectedPlace.properties.type_tournage}</span>{" "}
                  </p>
                  <p>
                    Addresse Tournage :{" "}
                    <span>{selectedPlace.properties.adresse_lieu}</span>{" "}
                  </p>
                  <p>
                    Anneé du Tournage :{" "}
                    <span>{selectedPlace.properties.annee_tournage}</span>{" "}
                  </p>
                  <p>
                    Nom Producteur :{" "}
                    <span>{selectedPlace.properties.nom_producteur}</span>{" "}
                  </p>
                  <p>
                    Nom Realisateur :{" "}
                    <span>{selectedPlace.properties.nom_realisateur}</span>{" "}
                  </p>
                </div>
              </Popup>
            )}
          </div>
        ))}

        <Source type="geojson" data={polygons}>
          <Layer {...dataLayer} />
        </Source>
        <GeolocateControl style={geolocateStyle} />
        <FullscreenControl style={fullscreenControlStyle} />
        <NavigationControl style={navStyle} />
        <ScaleControl style={scaleControlStyle} />
      </MapGL>
    </div>
  );
}

export default Map;
