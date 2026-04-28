import { Feature, Map as OLMap } from "ol";
import { showToast } from "./index";
import { LineString, SimpleGeometry } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { openskyApi } from "src/api/opensky.api";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { LAYER_NAMES } from "./constants";

let isTrackLoading = false;
let trackDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastClickedFeatureRef: Feature | null = null;

export const invalidateClickedFeature = (feature: Feature) => {
  if (lastClickedFeatureRef === feature) {
    lastClickedFeatureRef.set("isSelected", 0);
    lastClickedFeatureRef = null;
  }
};

const attachMoveEvents = (map: OLMap) => {
  let lastHoveredFeature: Feature | null = null;
  const container = map.getTargetElement();
  (map as any).on("pointermove", (e: any) => {
    if (e.dragging) {
      return;
    }
    if (lastHoveredFeature) {
      lastHoveredFeature.set("isHovered", 0);
      lastHoveredFeature = null;
    }
    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (layer: BaseLayer) => layer.get("name") === "planes",
      hitTolerance: 3,
    });
    const hoveredFeature = features[0] as Feature | undefined;
    if (hoveredFeature) {
      lastHoveredFeature = hoveredFeature;
      lastHoveredFeature.set("isHovered", 1);
      container.style.cursor = "pointer";
    } else {
      container.style.cursor = "default";
    }
  });
};

const attachClickEvents = (map: OLMap) => {
  const pathLayer = map
    .getLayers()
    .getArray()
    .find((layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PATHS) as VectorLayer<VectorSource> | undefined;
  (map as any).on("click", (e: any) => {
    if (lastClickedFeatureRef) {
      lastClickedFeatureRef.set("isSelected", 0);
      lastClickedFeatureRef = null;
      removePath();
    }
    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PLANES,
      hitTolerance: 3,
    });
    const clickedFeature = features[0] as Feature | undefined;
    if (clickedFeature) {
      addPath(clickedFeature);
      lastClickedFeatureRef = clickedFeature;
      lastClickedFeatureRef.set("isSelected", 1);
      const geometry = clickedFeature.getGeometry() as SimpleGeometry | undefined;
      const center = geometry?.getCoordinates() as number[] | undefined;
      if (center) {
        map.getView().setCenter(center);
        map
          .getView()
          .animate({ center, duration: 500 }, { zoom: 12, duration: 500 });
      }
    }
  });
  const addPath = (planeFeature: Feature) => {
    if (isTrackLoading) return;
    if (trackDebounceTimer) {
      clearTimeout(trackDebounceTimer);
      trackDebounceTimer = null;
    }
    trackDebounceTimer = setTimeout(async () => {
      const icao24 = planeFeature.get("icao24") as string;
      isTrackLoading = true;
      try {
        const { path } = await openskyApi.getTracks(icao24);
        if (!path || path.length === 0) {
          showToast('该飞机暂无轨迹数据（可能为地面停机、数据不足或超出覆盖范围）');
          return;
        }
        const geometry = planeFeature.getGeometry() as SimpleGeometry | undefined;
        if (!geometry) return;
        const curPoint = geometry.getCoordinates() as number[];
        const featurePath = path.map(({ lon, lat }: { lon: number; lat: number }) => fromLonLat([lon, lat]));
        if (pathLayer) {
          pathLayer
            .getSource()
            ?.addFeature(
              new Feature({
                geometry: new LineString([...featurePath, curPoint]),
                icao24,
              }),
            );
        }
      } catch (error) {
        console.error('Failed to fetch track:', error);
        showToast('获取轨迹数据失败，请稍后重试');
      } finally {
        isTrackLoading = false;
      }
    }, 300);
  };
  const removePath = () => {
    if (pathLayer) {
      pathLayer.getSource()?.clear();
    }
  };
};

export const clearSelection = (map: OLMap) => {
  const layers = map.getLayers().getArray();
  const planeLayer = layers.find(
    (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PLANES,
  ) as VectorLayer<VectorSource> | undefined;
  const pathLayer = layers.find(
    (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PATHS,
  ) as VectorLayer<VectorSource> | undefined;
  
  // Clear all selected states
  if (planeLayer) {
    const source = planeLayer.getSource();
    if (source) {
      source.getFeatures().forEach((feature) => {
        feature.set("isSelected", 0);
      });
    }
  }
  
  // Clear path layer
  if (pathLayer) {
    pathLayer.getSource()?.clear();
  }
};

const attachMoveEndEvent = (map: OLMap) => {
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

export const attachEvents = (map: OLMap) => {
  attachMoveEvents(map);
  attachClickEvents(map);
  attachMoveEndEvent(map);
};
