import { Feature } from "ol";
import { LineString } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { openskyApi } from "src/api/opensky.api";

const attachMoveEvents = (map) => {
  let lastHoveredFeature = null;
  const container = map.getTargetElement();
  map.on("pointermove", (e) => {
    if (e.dragging) {
      return;
    }
    if (lastHoveredFeature) {
      lastHoveredFeature.set("isHovered", 0);
      lastHoveredFeature = null;
    }
    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (layer) => layer.get("name") === "planes",
      hitTolerance: 3, //容错范围
    });
    const hoveredFeature = features[0];
    if (hoveredFeature) {
      lastHoveredFeature = hoveredFeature;
      lastHoveredFeature.set("isHovered", 1);
      container.style.cursor = "pointer";
    } else {
      container.style.cursor = "default";
    }
  });
};
const attachClickEvents = (map) => {
  let lastClickedFeature = null;
  const pathLayer = map
    .getLayers()
    .getArray()
    .find((layer) => layer.get("name") === "paths");
  map.on("click", (e) => {
    if (e.dragging) {
      return;
    }
    if (lastClickedFeature) {
      lastClickedFeature.set("isSelected", 0);
      lastClickedFeature = null;
      removePath();
    }
    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (layer) => layer.get("name") === "planes",
      hitTolerance: 3, //容错范围
    });
    const clickedFeature = features[0];
    if (clickedFeature) {
      addPath(clickedFeature);
      lastClickedFeature = clickedFeature;
      lastClickedFeature.set("isSelected", 1);
      const center = clickedFeature.getGeometry().getCoordinates();
      map.getView().setCenter(center);
      map
        .getView()
        .animate({ center, duration: 500 }, { zoom: 12, duration: 500 });
    }
  });
  const addPath = async (planeFeature: any) => {
    const icao24 = planeFeature.get("icao24");
    const { path } = await openskyApi.getTracks(icao24);
    const curPoint = planeFeature.getGeometry().getCoordinates();
    const featurePath = path.map(({ lon, lat }) => fromLonLat([lon, lat]));
    pathLayer
      .getSource()
      .addFeature(
        new Feature({
          geometry: new LineString([...featurePath, curPoint]),
          icao24,
        }),
      );
    console.log("res", featurePath);
  };
  const removePath = () => {
    pathLayer.getSource().clear();
  };
};
const attachMoveEndEvent = (map) => {
  map.on("moveend", () => {
    const view = map.getView();
    const center = view.getCenter();
    const projection = view.getProjection();
    const extent = projection.getExtent();

    if (center && extent) {
      const worldWidth = extent[2] - extent[0];
      const normalizedX =
        ((((center[0] - extent[0]) % worldWidth) + worldWidth) % worldWidth) +
        extent[0];

      if (Math.abs(center[0] - normalizedX) > worldWidth / 2) {
        view.setCenter([normalizedX, center[1]]);
      }
    }
  });
};
export const attachEvents = (map) => {
  attachMoveEvents(map);
  attachClickEvents(map);
  attachMoveEndEvent(map);
};
