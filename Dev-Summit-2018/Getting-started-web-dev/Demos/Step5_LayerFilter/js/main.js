var view;
require([
    "esri/Map",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/PopupTemplate",
    "esri/core/watchUtils",
  "esri/tasks/support/Query",
  "dojo/dom-construct",
  "dojo/on",
  "dojo/dom",
  "dojo/domReady!"
], function (Map, FeatureLayer, MapView, PopupTemplate,
  watchUtils, Query, domConstruct, on, dom) {

  var defaultSym = {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    outline: { // autocasts as new SimpleLineSymbol()
      color: "#a3acd1",
      width: 0.5
    }
  };

  /******************************************************************
   *
   * LayerRenderer example
   *
   ******************************************************************/


  var renderer = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: defaultSym,
    label: "Private school enrollment ratio",
    visualVariables: [{
      type: "color",
      field: "PrivateEnr",
      stops: [
        {
          value: 0.044,
          color: "#edf8fb",
          label: "< 0.044"
          },
        {
          value: 0.059,
          color: "#b3cde3"
          },
        {
          value: 0.0748,
          color: "#8c96c6",
          label: "0.0748"
          },
        {
          value: 0.0899,
          color: "#8856a7"
          },
        {
          value: 0.105,
          color: "#994c99",
          label: "> 0.105"
          }]
        }]
  };

  /***********************************
   *  Create renderer for centroids
   ************************************/

  var centroidRenderer = {
    type: "simple", // autocasts as new SimpleRenderer()
    symbol: {
      type: "picture-marker", // autocasts as new SimpleMarkerSymbol()
      url: "http://static.arcgis.com/images/Symbols/Basic/BlueSphere.png",
      width: "26",
      height: "26"
    }
  };

  /******************************************************************
   *
   * Create feature layers
   *
   ******************************************************************/

  var privateSchoolsPoint = new FeatureLayer({
    // Private Schools centroids
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Centroids/FeatureServer/0",
    renderer: centroidRenderer
  });

  /******************************************************************
   *
   * Popup example
   *
   ******************************************************************/

  // Step 1: Create the template
  var popupTemplate = new PopupTemplate({
    title: "Private School enrollment",
    content: [{
        // Specify the type of popup element - fields
        type: "fields",
        fieldInfos: [{
            fieldName: "state_name",
            visible: true,
            label: "State name: "
      },
          {
            fieldName: "PrivateMaj",
            visible: true,
            label: "Majority grade level for private schools: "
      },
          {
            fieldName: "PrivateSch",
            visible: true,
            label: "Private school ration to total number of schools: ",
            format: {
              places: 2,
              digitSeparator: true
            }
        },
          {
            fieldName: "TotalPriva",
            visible: true,
            label: "Total number of private schools: "
        },
          {
            fieldName: "Enrollment",
            visible: true,
            label: "Total number students enrolled in private schools: "
        },
          {
            fieldName: "PrivateEnr",
            visible: true,
            label: "Total number of private school students enrolled in ratio to total student school enrollment: ",
            format: {
              places: 2,
              digitSeparator: true
            }
        }]
    },
      {
        type: "media",
        mediaInfos: [{
            title: "Ratio private and public school enrollment",
            type: "pie-chart",
            caption: "Private school enrollment in comparison to public school",
            value: {
              theme: "Julie",
              fields: ["PrivateEnr", "PublicEnro"],
              tooltipField: "PrivateEnr"
            }
      },
          {
            title: "Total number of private schools",
            type: "bar-chart",
            caption: "Total number of Private Schools in comparison to public. (Does not pertain to student enrollment.)",
            value: {
              theme: "Julie",
              fields: ["PrivateEnr", "PublicEnro"],
              tooltipField: "PrivateEnr"
            }
      }]
      }
    ]
  });

  var privateSchoolsPoly = new FeatureLayer({
    // Private schools per state
    // layer with rendering
    // url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/OverlaySchools/FeatureServer/0"
    // layer without rendering
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/PrivateSchoolEnrollmentNoRendering/FeatureServer/0",
    outFields: ["*"],
    opacity: 0.8,
    renderer: renderer,
    popupTemplate: popupTemplate
  });

  // Set map's basemap
  var map = new Map({
    basemap: "gray-vector"
  });


  view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 3,
    center: [-99.14725260912257, 36.48617178360141],
    popup: {
      dockEnabled: true,
      dockOptions: {
        buttonEnabled: true,
        position: "upper-right"
      }
    }
  });

   view.when(function () {
     map.addMany([privateSchoolsPoly, privateSchoolsPoint]);
     // map.add(privateSchoolsPoly);
   });


  view.ui.add("container", "top-right");


  var privateSchoolsPolyView;
  var featuresMap = {};

view.when(function() {
  map.add(privateSchoolsPoly);
  return privateSchoolsPoly.when(function() {
    var query = privateSchoolsPoly.createQuery();
    return privateSchoolsPoly.queryFeatures(query);
  });
  })
    .then(getValues)
    .then(addToSelect)



function getValues(response) {
          var features = response.features;
          var values = features.map(function(feature) {
            return feature.attributes.state_name;
          });
          return values;
        }


             function addToSelect(values) {
          values.sort();
          values.forEach(function(value) {
            var option = domConstruct.create("option");
            option.text = value;
            privateSchoolsPoly.add(option);
          });

        }
});
