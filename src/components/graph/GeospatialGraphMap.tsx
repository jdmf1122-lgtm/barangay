import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, 
  Layers, 
  Share2, 
  Route, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  X, 
  ExternalLink
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { GraphNode, GraphEdge, GraphCluster } from '../../types';
import { SYSTEM_BARANGAYS_GEO, MUNICIPAL_AGENCY_HUBS } from '../../data/barangayGeoData';
import { findDetailedPath, DetailedPath, getGraphAnimationConfig } from '../../utils/graphEngine';

// Tile provider options
type TileProvider = 'osm_standard' | 'google_street' | 'esri_satellite' | 'opentopo';

interface TileOption {
  id: TileProvider;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const TILE_OPTIONS: TileOption[] = [
  {
    id: 'osm_standard',
    name: 'OpenStreetMap standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  {
    id: 'google_street',
    name: 'Carto clean streets',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  {
    id: 'esri_satellite',
    name: 'Esri satellite imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
    maxZoom: 18
  },
  {
    id: 'opentopo',
    name: 'OpenTopo terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Map style: &copy; OpenTopoMap',
    maxZoom: 17
  }
];

interface GeospatialGraphMapProps {
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    clusters: GraphCluster[];
  };
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  selectedCluster: GraphCluster | null;
  setSelectedCluster: (cluster: GraphCluster | null) => void;
  pathfindingMode: boolean;
  setPathfindingMode: (active: boolean) => void;
  startNodeId: string;
  setStartNodeId: (id: string) => void;
  endNodeId: string;
  setEndNodeId: (id: string) => void;
  computedPath: DetailedPath | null;
  setComputedPath: (path: DetailedPath | null) => void;
  scopeFilter?: 'ACTIVE_ONLY' | 'ALL';
  setScopeFilter?: (scope: 'ACTIVE_ONLY' | 'ALL') => void;
  activeCasesCount?: number;
}

export const GeospatialGraphMap: React.FC<GeospatialGraphMapProps> = ({
  graphData,
  selectedNode,
  setSelectedNode,
  selectedCluster,
  setSelectedCluster,
  pathfindingMode,
  setPathfindingMode,
  startNodeId,
  setStartNodeId,
  endNodeId,
  setEndNodeId,
  computedPath,
  setComputedPath
}) => {
  const { cases, setSelectedCaseId } = useCases();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer groups
  const barangayPolygonsGroupRef = useRef<L.LayerGroup | null>(null);
  const graphEdgesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const pathHighlightLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const clusterPolygonGroupRef = useRef<L.LayerGroup | null>(null);
  const nodesMarkerGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [activeTile, setActiveTile] = useState<TileProvider>('osm_standard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterBarangay, setFilterBarangay] = useState<string>('ALL');
  const [showEdges, setShowEdges] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Calculate coordinates for all graph nodes
  const nodeGeoPositions = useMemo(() => {
    const geoMap = new Map<string, { lat: number; lng: number }>();

    // 1. Place Agency Destination Hub: MDRRMO Operations & Command Center
    const mdrrmoHub = MUNICIPAL_AGENCY_HUBS.find((h) => h.type === 'MDRRMO');
    geoMap.set('AGENCY-MDRRMO', {
      lat: mdrrmoHub?.lat || 12.59152,
      lng: mdrrmoHub?.lng || 121.51738
    });

    // 2. Place Case Incidents in their respective barangays with structured radial offsets
    const barangayCaseCounters: Record<string, number> = {};
    (cases || []).forEach((c) => {
      const bName = c.barangay;
      const bGeo = SYSTEM_BARANGAYS_GEO.find((b) => b.name === bName) || SYSTEM_BARANGAYS_GEO[0];
      const count = barangayCaseCounters[bName] || 0;
      barangayCaseCounters[bName] = count + 1;

      // Realistic pseudo-random offset within 350-700m around barangay center
      const angle = (count * 137.5 * Math.PI) / 180; // Golden angle spiral
      const radiusLat = 0.0022 + ((count % 3) * 0.0018);
      const radiusLng = 0.0028 + ((count % 3) * 0.0022);

      const caseLat = bGeo.lat + Math.sin(angle) * radiusLat;
      const caseLng = bGeo.lng + Math.cos(angle) * radiusLng;

      const caseNodeId = `CASE-${c.id}`;
      geoMap.set(caseNodeId, { lat: caseLat, lng: caseLng });

      // Place Resident Reporter slightly adjacent to the case
      const reporterName = c.reporterName || c.complainants?.[0]?.name || `Resident Reporter (${bName})`;
      const reporterId = `PERSON-${reporterName.replace(/\s+/g, '')}`;
      if (!geoMap.has(reporterId)) {
        geoMap.set(reporterId, {
          lat: caseLat + 0.0012,
          lng: caseLng + 0.0014
        });
      }
    });

    return geoMap;
  }, [cases]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    let nodes = graphData.nodes;
    if (filterType !== 'ALL') {
      nodes = nodes.filter((n) => n.type === filterType);
    }
    if (filterBarangay !== 'ALL') {
      nodes = nodes.filter((n) => {
        if (n.id === 'AGENCY-MDRRMO') return true;
        if (n.rawCase) return n.rawCase.barangay === filterBarangay;
        if (n.metadata?.barangay) return n.metadata.barangay === filterBarangay;
        return true;
      });
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      nodes = nodes.filter((n) => n.label.toLowerCase().includes(q) || (n.subLabel && n.subLabel.toLowerCase().includes(q)));
    }
    return nodes;
  }, [graphData.nodes, filterType, filterBarangay, searchTerm]);

  const activeNodeIdSet = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  // Filtered edges
  const filteredEdges = useMemo(() => {
    return graphData.edges.filter((e) => activeNodeIdSet.has(e.source) && activeNodeIdSet.has(e.target));
  }, [graphData.edges, activeNodeIdSet]);

  // Initialize Leaflet OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map instance centered over Roxas, Oriental Mindoro
      const map = L.map(mapContainerRef.current, {
        center: [12.6020, 121.4950],
        zoom: 13,
        zoomControl: false,
        attributionControl: true
      });

      // Default to OpenStreetMap Standard tile layer
      const selectedTile = TILE_OPTIONS.find((t) => t.id === activeTile) || TILE_OPTIONS[0];
      const tileLayer = L.tileLayer(selectedTile.url, {
        attribution: selectedTile.attribution,
        maxZoom: selectedTile.maxZoom
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      // Layer groups for clean layered rendering
      barangayPolygonsGroupRef.current = L.layerGroup().addTo(map);
      clusterPolygonGroupRef.current = L.layerGroup().addTo(map);
      graphEdgesLayerGroupRef.current = L.layerGroup().addTo(map);
      pathHighlightLayerGroupRef.current = L.layerGroup().addTo(map);
      nodesMarkerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const tileConfig = TILE_OPTIONS.find((t) => t.id === activeTile) || TILE_OPTIONS[0];

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const newLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
    newLayer.bringToBack();
  }, [activeTile]);

  // Trigger BFS Path Calculation
  useEffect(() => {
    if (pathfindingMode && startNodeId && endNodeId) {
      const res = findDetailedPath(graphData.nodes, graphData.edges, startNodeId, endNodeId);
      setComputedPath(res);
    } else {
      setComputedPath(null);
    }
  }, [pathfindingMode, startNodeId, endNodeId, graphData, setComputedPath]);

  // Render Polygons, Edges, Paths & Graph Markers on Leaflet
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const animConfig = getGraphAnimationConfig();

    // Clear old layers
    barangayPolygonsGroupRef.current?.clearLayers();
    clusterPolygonGroupRef.current?.clearLayers();
    graphEdgesLayerGroupRef.current?.clearLayers();
    pathHighlightLayerGroupRef.current?.clearLayers();
    nodesMarkerGroupRef.current?.clearLayers();

    // 1. Render Official Barangay Boundaries
    if (showBoundaries && barangayPolygonsGroupRef.current) {
      SYSTEM_BARANGAYS_GEO.forEach((b) => {
        const isSelected = filterBarangay === b.name || selectedNode?.label?.includes(b.name);
        const poly = L.polygon(b.boundary, {
          color: isSelected ? 'var(--color-accent, #0b6638)' : 'var(--color-muted, #5c7768)',
          weight: isSelected ? 2.5 : 1.2,
          dashArray: isSelected ? undefined : '4, 4',
          fillColor: 'var(--color-accent, #0b6638)',
          fillOpacity: isSelected ? 0.2 : 0.06
        });

        poly.bindTooltip(`<strong>Brgy. ${b.name}</strong><br/><span style="font-size:11px;color:#5c7768;">${b.zoneType}</span>`, {
          sticky: true,
          className: 'leaflet-custom-tooltip'
        });

        poly.on('click', () => {
          setFilterBarangay(b.name);
          map.flyTo([b.lat, b.lng], 15, { duration: animConfig.flyDuration });
        });

        barangayPolygonsGroupRef.current?.addLayer(poly);
      });
    }

    // 2. Render Graph Edges / Relational Connections
    if (showEdges && graphEdgesLayerGroupRef.current) {
      filteredEdges.forEach((edge) => {
        const pos1 = nodeGeoPositions.get(edge.source);
        const pos2 = nodeGeoPositions.get(edge.target);
        if (!pos1 || !pos2) return;

        const isConnectedToSelected = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);
        const isClusterEdge = selectedCluster && selectedCluster.nodeIds.includes(edge.source) && selectedCluster.nodeIds.includes(edge.target);

        let color = '#94a3b8';
        let weight = 1.5;
        let opacity = 0.55;
        let dashArray: string | undefined = undefined;

        if (edge.type === 'REFERRED_TO') {
          color = '#2563eb';
          weight = 2.2;
          dashArray = '5, 4';
          opacity = 0.8;
        } else if (edge.type === 'MONITORED_BY') {
          color = '#7c3aed';
          weight = 2.2;
          dashArray = '5, 4';
          opacity = 0.85;
        } else if (edge.type === 'RELATED_CASE') {
          color = '#ea580c';
          weight = 2.5;
          opacity = 0.9;
        } else if (edge.type === 'INVOLVES_OFFICIAL') {
          color = '#dc2626';
          weight = 2.8;
          opacity = 0.9;
        }

        if (isConnectedToSelected) {
          color = '#0284c7';
          weight = 3.5;
          opacity = 1;
        } else if (isClusterEdge) {
          color = '#7c3aed';
          weight = 3.5;
          opacity = 1;
        }

        const line = L.polyline([[pos1.lat, pos1.lng], [pos2.lat, pos2.lng]], {
          color,
          weight,
          opacity,
          dashArray
        });

        line.bindTooltip(`<strong>${edge.label}</strong><br/><span style="font-size:10px;">Type: ${edge.type}</span>`, {
          sticky: true
        });

        graphEdgesLayerGroupRef.current?.addLayer(line);
      });
    }

    // 3. Render Computed BFS Shortest Path Route
    if (computedPath && computedPath.hops.length > 0 && pathHighlightLayerGroupRef.current) {
      computedPath.hops.forEach((hop, hopIdx) => {
        const fromPos = nodeGeoPositions.get(hop.fromNodeId);
        const toPos = nodeGeoPositions.get(hop.toNodeId);
        if (!fromPos || !toPos) return;

        const pathLine = L.polyline([[fromPos.lat, fromPos.lng], [toPos.lat, toPos.lng]], {
          color: '#d97706',
          weight: 4.5,
          opacity: 0.95
        });

        pathLine.bindTooltip(`
          <div style="padding: 4px;">
            <strong style="color: #b45309;">Hop #${hopIdx + 1}: ${hop.edgeLabel}</strong><br/>
            <span style="font-size: 10px; color: #5c7768;">${hop.edgeType}</span>
          </div>
        `, { sticky: true });

        pathHighlightLayerGroupRef.current?.addLayer(pathLine);
      });

      // Zoom map to fit the path
      const pathPoints = computedPath.nodeIds
        .map((id) => nodeGeoPositions.get(id))
        .filter((pos): pos is { lat: number; lng: number } => !!pos)
        .map((pos) => [pos.lat, pos.lng] as [number, number]);

      if (pathPoints.length >= 2) {
        const bounds = L.latLngBounds(pathPoints);
        map.flyToBounds(bounds.pad(0.25), { duration: animConfig.flyDuration });
      }
    }

    // 4. Render Graph Nodes as Custom Interactive Leaflet HTML Markers
    if (nodesMarkerGroupRef.current) {
      filteredNodes.forEach((node) => {
        const pos = nodeGeoPositions.get(node.id);
        if (!pos) return;

        const isSelected = selectedNode?.id === node.id;
        const isInPath = computedPath?.nodeIds.includes(node.id);
        const isStart = startNodeId === node.id;
        const isEnd = endNodeId === node.id;

        // Custom HTML for Node Icon (Zero Emojis - Gate 30a)
        let iconHtml = '';
        let markerSize = 28;

        if (node.type === 'agency') {
          markerSize = 36;
          const sirenSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 5 13v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a1 1 0 0 0-.293-.707L18 11.586V8a6 6 0 0 0-6-6z"/><path d="M9 18a3 3 0 0 0 6 0"/></svg>`;
          iconHtml = `
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background: var(--color-error, #dc2626);
              border: 2px solid var(--color-paper, #fafbf9);
              box-shadow: 0 2px 8px rgba(15, 29, 22, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              ${isSelected || isInPath ? 'transform: scale(1.2); box-shadow: 0 0 0 3px var(--color-warning, #d97706);' : ''}
            ">
              ${sirenSvg}
            </div>
          `;
        } else if (node.type === 'case') {
          markerSize = 26;
          const caseStatus = node.rawCase?.status;
          const isPending = node.rawCase?.isPending;
          const isHighPriority = node.rawCase?.priority === 'Urgent' || node.rawCase?.priority === 'High';

          let color = 'var(--color-accent, #0b6638)';
          if (isHighPriority) color = 'var(--color-error, #dc2626)';
          else if (isPending) color = 'var(--color-warning, #d97706)';
          else if (caseStatus === 'Resolved' || caseStatus === 'Closed') color = 'var(--color-success, #0b6638)';

          const docSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

          iconHtml = `
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background: ${color};
              border: 2px solid var(--color-paper, #fafbf9);
              box-shadow: 0 2px 6px rgba(15, 29, 22, 0.18);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              ${isSelected || isInPath ? 'transform: scale(1.25); box-shadow: 0 0 0 3px var(--color-warning, #d97706);' : ''}
            ">
              ${docSvg}
            </div>
          `;
        } else {
          // Person / Resident Citizen Reporter
          markerSize = 18;
          iconHtml = `
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background: var(--color-warning, #d97706);
              border: 2px solid var(--color-paper, #fafbf9);
              box-shadow: 0 1px 4px rgba(15, 29, 22, 0.16);
              ${isSelected || isInPath ? 'transform: scale(1.3); box-shadow: 0 0 0 3px var(--color-warning, #d97706);' : ''}
            "></div>
          `;
        }

        const customDivIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-graph-marker-icon',
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2]
        });

        const marker = L.marker([pos.lat, pos.lng], { icon: customDivIcon });

        // Tooltip with Node details
        marker.bindTooltip(`
          <div style="padding: 2px 4px;">
            <div style="font-weight: 700; font-size: 12px; color: #0f1d16;">${node.label}</div>
            <div style="font-size: 10px; color: #5c7768;">${node.subLabel || node.type}</div>
            <div style="font-size: 10px; color: #0b6638; font-weight: 600; margin-top: 2px;">
              ${node.degree || 0} connected relationships
            </div>
            ${isStart ? '<div style="color: #b45309; font-weight: 600; font-size: 10px;">Origin node</div>' : ''}
            ${isEnd ? '<div style="color: #0b6638; font-weight: 600; font-size: 10px;">Target node</div>' : ''}
          </div>
        `, { sticky: true });

        // Click Handler
        marker.on('click', () => {
          if (pathfindingMode) {
            if (!startNodeId) {
              setStartNodeId(node.id);
            } else if (!endNodeId && node.id !== startNodeId) {
              setEndNodeId(node.id);
            } else {
              setStartNodeId(node.id);
              setEndNodeId('');
            }
          }
          setSelectedNode(node);
          setSelectedCluster(null);
        });

        nodesMarkerGroupRef.current?.addLayer(marker);
      });
    }
  }, [
    filteredNodes,
    filteredEdges,
    nodeGeoPositions,
    showBoundaries,
    showEdges,
    selectedNode,
    selectedCluster,
    computedPath,
    pathfindingMode,
    startNodeId,
    endNodeId,
    filterBarangay,
    setStartNodeId,
    setEndNodeId,
    setSelectedNode,
    setSelectedCluster
  ]);

  const handleResetMapCenter = () => {
    if (mapInstanceRef.current) {
      const animConfig = getGraphAnimationConfig();
      mapInstanceRef.current.flyTo([12.6020, 121.4950], 13, { duration: animConfig.flyDuration });
      setFilterBarangay('ALL');
      setFilterType('ALL');
      setSearchTerm('');
      setSelectedNode(null);
      setSelectedCluster(null);
      setComputedPath(null);
      setStartNodeId('');
      setEndNodeId('');
    }
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-paper p-4 overflow-y-auto' : ''}`}>
      {/* Top Header & Metrics Bar */}
      <section
        aria-label="Geospatial radar overview"
        className="bg-paper p-4 rounded-xl border border-rule shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent" />
            <span>Geospatial radar and municipal map overview</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Geographic graph topology of Roxas, Oriental Mindoro with shortest path BFS routing, cross-barangay incident linkages, and dispatch flows.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs bg-paper-2 px-3 py-1.5 rounded-lg border border-rule">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
            <span className="text-muted font-medium">Cases (<span className="font-mono tabular-nums">{graphData.nodes.filter((n) => n.type === 'case').length}</span>)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
            <span className="text-muted font-medium">Resident reporters (<span className="font-mono tabular-nums">{graphData.nodes.filter((n) => n.type === 'person').length}</span>)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
            <span className="text-ink font-semibold">MDRRMO (<span className="font-mono tabular-nums">{graphData.nodes.filter((n) => n.type === 'agency').length || 1}</span>)</span>
          </div>
        </div>
      </section>

      {/* Control Bar: Filters, Basemap Switcher & Pathfinding Toggle */}
      <section
        aria-label="Map filters and layer options"
        className="bg-paper p-3 rounded-xl border border-rule shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search node, person, case…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-paper-2 rounded-lg border border-rule text-ink placeholder:text-muted focus:bg-paper focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden text-xs w-44"
            />
          </div>

          {/* Barangay Filter */}
          <select
            value={filterBarangay}
            onChange={(e) => setFilterBarangay(e.target.value)}
            className="p-1.5 bg-paper-2 rounded-lg border border-rule font-medium text-xs text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
          >
            <option value="ALL">All 20 Roxas barangays</option>
            {SYSTEM_BARANGAYS_GEO.map((b) => (
              <option key={b.name} value={b.name}>
                Brgy. {b.name} ({b.zoneType})
              </option>
            ))}
          </select>

          {/* Entity Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1.5 bg-paper-2 rounded-lg border border-rule font-medium text-xs text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
          >
            <option value="ALL">All entity types</option>
            <option value="agency">MDRRMO hub</option>
            <option value="case">Resident cases</option>
            <option value="person">Resident reporters</option>
          </select>

          {/* Toggle Relational Edges */}
          <button
            type="button"
            onClick={() => setShowEdges(!showEdges)}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              showEdges
                ? 'bg-accent text-accent-ink shadow-xs'
                : 'bg-paper-2 hover:bg-paper-3 text-ink border border-rule'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{showEdges ? 'Hide edges' : 'Show edges'}</span>
          </button>

          {/* Pathfinding Toggle */}
          <button
            type="button"
            onClick={() => {
              setPathfindingMode(!pathfindingMode);
              if (pathfindingMode) {
                setComputedPath(null);
                setStartNodeId('');
                setEndNodeId('');
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              pathfindingMode
                ? 'bg-warning text-ink shadow-xs'
                : 'bg-paper-2 hover:bg-paper-3 text-ink border border-rule'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{pathfindingMode ? 'BFS path active' : 'Trace shortest path'}</span>
          </button>
        </div>

        {/* Map View & Layer Options */}
        <div className="flex items-center gap-2">
          {/* Basemap Tile Switcher */}
          <div className="flex items-center bg-paper-2 p-0.5 rounded-lg border border-rule">
            {TILE_OPTIONS.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => setActiveTile(tile.id)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer whitespace-nowrap ${
                  activeTile === tile.id
                    ? 'bg-accent text-accent-ink shadow-2xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tile.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetMapCenter}
            className="p-1.5 text-muted hover:text-ink bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
            title="Reset map view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-muted hover:text-ink bg-paper-2 hover:bg-paper-3 rounded-lg border border-rule transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </section>

      {/* Pathfinding Selection Bar (when active) */}
      {pathfindingMode && (
        <div className="bg-paper-2 border border-rule p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-ink flex items-center gap-1.5">
              <Route className="w-4 h-4 text-warning" />
              <span>BFS shortest path algorithm:</span>
            </span>

            <div className="flex items-center gap-2">
              <select
                value={startNodeId}
                onChange={(e) => setStartNodeId(e.target.value)}
                className="p-1.5 bg-paper rounded-lg border border-rule font-medium text-xs text-ink max-w-[200px] focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
              >
                <option value="">Origin node</option>
                {graphData.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.type})
                  </option>
                ))}
              </select>

              <ArrowRight className="w-4 h-4 text-muted" />

              <select
                value={endNodeId}
                onChange={(e) => setEndNodeId(e.target.value)}
                className="p-1.5 bg-paper rounded-lg border border-rule font-medium text-xs text-ink max-w-[200px] focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
              >
                <option value="">Target node</option>
                {graphData.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {computedPath ? (
            <div className="text-xs font-semibold text-accent bg-paper px-3 py-1 rounded-lg border border-rule flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Shortest path connected: <span className="font-mono tabular-nums">{computedPath.totalDistance}</span> degrees of separation (<span className="font-mono tabular-nums">{computedPath.nodeIds.length}</span> hops)</span>
            </div>
          ) : startNodeId && endNodeId ? (
            <div className="text-xs text-error bg-paper px-3 py-1 rounded-lg border border-rule">
              No relational path found between selected entities
            </div>
          ) : (
            <span className="text-xs text-muted">Click any 2 node markers on the map or select from dropdowns</span>
          )}
        </div>
      )}

      {/* Main Grid: Leaflet OpenStreetMap Container + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 bg-paper-2 rounded-xl border border-rule shadow-sm flex flex-col overflow-hidden relative min-h-[600px]">
          {/* Top Leaflet Status Badge */}
          <div className="absolute top-3 left-3 z-[1000] bg-paper/95 p-2 rounded-lg border border-rule shadow-xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-accent motion-safe:animate-pulse" />
            <span className="font-semibold text-ink">
              {TILE_OPTIONS.find((t) => t.id === activeTile)?.name}
            </span>
            <span className="text-muted/40">/</span>
            <span className="text-muted text-xs">
              <span><strong className="font-mono tabular-nums text-ink">{filteredNodes.length}</strong> nodes</span>
              <span className="text-muted/40 mx-1.5">/</span>
              <span><strong className="font-mono tabular-nums text-ink">{filteredEdges.length}</strong> edges</span>
            </span>
          </div>

          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[580px] z-10" />

          {/* Map Legend at Bottom Left */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-paper/95 border border-rule p-2.5 rounded-lg text-xs space-y-1.5 shadow-xs text-ink">
            <div className="font-semibold text-xs text-muted pb-0.5">Graph entity overlay</div>
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
              <span>MDRRMO hub</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
              <span>Case incident</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
              <span>Resident reporter</span>
            </div>
          </div>
        </div>

        {/* Right Column: Path Tracer & Inspector & Multi-Case Clusters */}
        <div className="space-y-4">
          {/* Path Trace Explanation */}
          {computedPath && (
            <div className="bg-paper rounded-xl border border-rule p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-warning" />
                  <span>BFS shortest relationship route</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setComputedPath(null)}
                  className="text-muted hover:text-ink text-xs p-1 rounded focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
                  title="Clear path"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {computedPath.hops.map((hop, idx) => {
                  const fromNode = graphData.nodes.find((n) => n.id === hop.fromNodeId);
                  const toNode = graphData.nodes.find((n) => n.id === hop.toNodeId);
                  return (
                    <div key={idx} className="p-2.5 bg-paper-2 rounded-lg border border-rule text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-ink">
                        <span>Hop <span className="font-mono tabular-nums">{idx + 1}</span>: {fromNode?.label || hop.fromNodeId}</span>
                        <ArrowRight className="w-3 h-3 text-muted" />
                        <span>{toNode?.label || hop.toNodeId}</span>
                      </div>
                      <div className="text-[11px] text-muted font-medium bg-paper px-2 py-0.5 rounded border border-rule inline-block">
                        Linkage: {hop.edgeLabel} ({hop.edgeType})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Node Inspector */}
          {selectedNode ? (
            <div className="bg-paper rounded-xl border border-rule shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rule">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <span className="font-semibold text-xs text-muted capitalize">
                    {selectedNode.type} entity
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-muted hover:text-ink text-xs font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden"
                >
                  Clear selection
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm text-ink">{selectedNode.label}</h3>
                {selectedNode.subLabel && (
                  <p className="text-xs text-muted mt-0.5">{selectedNode.subLabel}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-paper-2 p-2.5 rounded-lg border border-rule">
                <div>
                  <span className="text-[11px] text-muted block font-medium">Graph degree</span>
                  <span className="font-semibold text-ink"><span className="font-mono tabular-nums">{selectedNode.degree || 0}</span> links</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted block font-medium">Classification</span>
                  <span className="font-semibold text-ink capitalize">{selectedNode.type}</span>
                </div>
              </div>

              {selectedNode.rawCase && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCaseId(selectedNode.rawCase!.id)}
                    className="w-full py-2 bg-accent hover:bg-accent/90 active:bg-accent text-accent-ink rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">View case dossier</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-paper-2 rounded-xl border border-rule p-4 text-center text-xs text-muted">
              Click any node marker on the OpenStreetMap to inspect connections, incident classifications, and case files.
            </div>
          )}

          {/* Multi-Case Clusters & Linked Parties */}
          <div className="bg-paper rounded-xl border border-rule shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-accent" />
                <span>Multi-case clusters (<span className="font-mono tabular-nums">{graphData.clusters.length}</span>)</span>
              </h3>
              <span className="text-[11px] bg-paper-2 text-muted font-medium px-2 py-0.5 rounded-full border border-rule">
                Algorithmic detection
              </span>
            </div>

            <p className="text-xs text-muted">
              Graph algorithm identified correlated dispute patterns and multi-case participants across Roxas.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {graphData.clusters.map((cluster) => {
                const isSelectedCluster = selectedCluster?.id === cluster.id;
                return (
                  <div
                    key={cluster.id}
                    onClick={() => {
                      setSelectedCluster(isSelectedCluster ? null : cluster);
                      setSelectedNode(null);
                    }}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer space-y-1.5 ${
                      isSelectedCluster
                        ? 'bg-paper-3 border-accent ring-1 ring-accent'
                        : 'bg-paper-2 hover:bg-paper-3 border-rule'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-ink">{cluster.title || cluster.label}</span>
                      <span className="text-[11px] bg-paper text-muted px-2 py-0.5 rounded font-medium border border-rule">
                        <span className="font-mono tabular-nums">{cluster.caseIds?.length || cluster.nodeIds.length}</span> linked
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {cluster.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(cluster.caseIds || []).map((caseId) => (
                        <button
                          key={caseId}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCaseId(caseId);
                          }}
                          className="text-xs font-mono tabular-nums font-semibold bg-paper text-accent px-2 py-0.5 rounded border border-rule hover:bg-paper-3 cursor-pointer shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {caseId}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
