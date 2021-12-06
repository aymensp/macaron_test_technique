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
} from "react-map-gl";
import { useEffect, useState } from "react";
import "./Map.css";
import axios from "axios";
import { dataLayer } from "./map-style.js";

function Map() {
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
  const [points, setPoints] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
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
  }, []);

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
        arrondissement: 1,
        params: {
          annee_tournage: 2016,
          date_debut: "2016-12-07",
        },
      })
      .then((data) => {
        setPoints(data.data);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div>
      <div className="top_bar ">
        <p className="button">Arrondissement</p>
        <p className="button">Annee De Tournage</p>
        <p className="button">Date Debut De tournage</p>
        <p className="button">Date Fin De tournage</p>
      </div>
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/aymannn/cktn2lof5anwb17p59etlltoi"
        mapboxApiAccessToken="pk.eyJ1IjoiYXltYW5ubiIsImEiOiJja3BuZHVrZ2QybzM2MndyaXEwamxuZDVqIn0.6GM7CF90UWngIGU66viGDw"
        onViewportChange={(viewport) => setViewport(viewport)}
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
