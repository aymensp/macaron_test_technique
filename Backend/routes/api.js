var express = require("express");
var router = express.Router();
var fs = require("fs");
var pointInPolygon = require("@turf/boolean-point-in-polygon").default;
var Polygon;
var Points;

router.post("/filteredPoints", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const filters = req.body.params;
  const { arrondissement } = req.body;

  reader = fs.readFile(
    __dirname + "/arrondissements.geojson",
    {
      encoding: "utf-8",
    },
    function (err, data) {
      Polygon = JSON.parse(data)
        .features.filter((place) => place.properties.c_ar === arrondissement)
        .shift();
      reader = fs.readFile(
        __dirname + "/lieux-de-tournage-a-paris.geojson",
        {
          encoding: "utf-8",
        },
        function (err, data) {
          const resultPoints = JSON.parse(data);
          Points = resultPoints.features.map((place) => {
            return place;
          });
          // function removeDuplicates(data) {
          //   return [...new Set(data)];
          // }
          const finaleResponse = Points.filter(
            (point) => pointInPolygon(point.geometry, Polygon) === true
          );
          const filteredPoints = finaleResponse.filter((user) => {
            let isValid = true;
            for (key in filters) {
              isValid = isValid && user.properties[key] == filters[key];
            }
            return isValid;
          });
          res.status(201).send(filteredPoints);
        }
      );
    }
  );
});

router.get("/polygons", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  reader = fs.readFile(
    __dirname + "/arrondissements.geojson",
    {
      encoding: "utf-8",
    },
    function (err, data) {
      const resultArrondissement = JSON.parse(data);
      res.status(201).send(resultArrondissement);
    }
  );
});

module.exports = router;
