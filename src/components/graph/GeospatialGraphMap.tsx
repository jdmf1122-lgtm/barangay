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
  AlertTriangle, 
  Shield, 
  Building2, 
  Landmark, 
  User, 
  Search, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Sparkles, 
  X, 
  ExternalLink, 
  Filter, 
  Eye, 
  MapPin, 
  Radio, 
  Flame, 
  Network
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { Case, GraphNode, GraphEdge, GraphCluster, ROXAS_BARANGAYS } from '../../types';
import { SYSTEM_BARANGAYS_GEO, MUNICIPAL_AGENCY_HUBS } from '../../data/barangayGeoData';
import { findDetailedPath, DetailedPath } from '../../utils/graphEngine';

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
    name: 'OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  {
    id: 'google_street',
    name: 'Carto / Clean Streets',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  {
    id: 'esri_satellite',
    name: 'Esri Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar Geographics',
    maxZoom: 18
  },
  {
    id: 'opentopo',
    name: 'OpenTopoMap Terrain',
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
  setComputedPath,
  scopeFilter,
  setScopeFilter,
  activeCasesCount
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
  const [showCentralityPulse, setShowCentralityPulse] = useState<boolean>(true);
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

    // 3. Place Case Incidents in their respective barangays with structured radial offsets
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
          color: isSelected ? '#059669' : '#0d9488',
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? undefined : '4, 4',
          fillColor: '#10b981',
          fillOpacity: isSelected ? 0.25 : 0.1
        });

        poly.bindTooltip(`<strong>Brgy. ${b.name}</strong><br/><span style="font-size:11px;color:#64748b;">${b.zoneType}</span>`, {
          sticky: true,
          className: 'leaflet-custom-tooltip'
        });

        poly.on('click', () => {
          setFilterBarangay(b.name);
          map.flyTo([b.lat, b.lng], 15, { duration: 0.8 });
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
          color = '#2563eb'; // Blue
          weight = 2.2;
          dashArray = '5, 4';
          opacity = 0.8;
        } else if (edge.type === 'MONITORED_BY') {
          color = '#9333ea'; // Purple
          weight = 2.2;
          dashArray = '5, 4';
          opacity = 0.85;
        } else if (edge.type === 'RELATED_CASE') {
          color = '#ea580c'; // Orange
          weight = 2.5;
          opacity = 0.9;
        } else if (edge.type === 'INVOLVES_OFFICIAL') {
          color = '#dc2626'; // Red
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

    // 3. Render Computed BFS Shortest Path Route (Glowing Golden Arcs & Hop Markers)
    if (computedPath && computedPath.hops.length > 0 && pathHighlightLayerGroupRef.current) {
      computedPath.hops.forEach((hop, hopIdx) => {
        const fromPos = nodeGeoPositions.get(hop.fromNodeId);
        const toPos = nodeGeoPositions.get(hop.toNodeId);
        if (!fromPos || !toPos) return;

        // Golden animated path polyline
        const pathLine = L.polyline([[fromPos.lat, fromPos.lng], [toPos.lat, toPos.lng]], {
          color: '#f59e0b',
          weight: 5,
          opacity: 0.95
        });

        pathLine.bindTooltip(`
          <div style="padding: 4px;">
            <strong style="color: #b45309;">Hop #${hopIdx + 1}: ${hop.edgeLabel}</strong><br/>
            <span style="font-size: 10px; color: #475569;">${hop.edgeType}</span>
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
        map.flyToBounds(bounds.pad(0.25), { duration: 1 });
      }
    }

    // 4. Render Graph Nodes as Custom Interactive Leaflet HTML Markers
    if (nodesMarkerGroupRef.current) {
      filteredNodes.forEach((node) => {
        const pos = nodeGeoPositions.get(node.id);
        if (!pos) return;

        const isSelected = selectedNode?.id === node.id;
        const isInPath = computedPath?.nodeIds.includes(node.id);
        const isInCluster = selectedCluster?.nodeIds.includes(node.id);
        const isStart = startNodeId === node.id;
        const isEnd = endNodeId === node.id;

        // Custom HTML for Node Icon
        let iconHtml = '';
        let markerSize = 28;

        if (node.type === 'agency') {
          markerSize = 38;
          iconHtml = `
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background: linear-gradient(135deg, #ea580c, #c2410c);
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 17px;
              font-weight: bold;
              ${isSelected || isInPath ? 'transform: scale(1.25); box-shadow: 0 0 0 5px #fbbf24, 0 8px 20px rgba(0,0,0,0.5);' : ''}
            ">
              🚨
            </div>
          `;
        } else if (node.type === 'case') {
          markerSize = 24;
          const caseStatus = node.rawCase?.status;
          const isPending = node.rawCase?.isPending;
          const isHighPriority = node.rawCase?.priority === 'Urgent' || node.rawCase?.priority === 'High';

          let color = '#3b82f6';
          if (isHighPriority) color = '#ef4444';
          else if (isPending) color = '#f59e0b';
          else if (caseStatus === 'Resolved' || caseStatus === 'Closed') color = '#10b981';

          iconHtml = `
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background: ${color};
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
              ${isSelected || isInPath ? 'transform: scale(1.3); box-shadow: 0 0 0 4px #f59e0b;' : ''}
            ">
              📄
            </div>
          `;
        } else {
          // Person / Citizen
          markerSize = 18;
          iconHtml = `
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background: #ea580c;
              border: 1.5px solid #ffffff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ${isSelected || isInPath ? 'transform: scale(1.3); box-shadow: 0 0 0 3px #f59e0b;' : ''}
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
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${node.label}</div>
            <div style="font-size: 10px; color: #64748b;">${node.subLabel || node.type}</div>
            <div style="font-size: 10px; color: #059669; font-weight: bold; margin-top: 2px;">
              ${node.degree || 0} Connected Relationships
            </div>
            ${isStart ? '<div style="color: #b45309; font-weight: bold; font-size: 10px;">★ ORIGIN NODE</div>' : ''}
            ${isEnd ? '<div style="color: #047857; font-weight: bold; font-size: 10px;">★ TARGET NODE</div>' : ''}
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
      mapInstanceRef.current.flyTo([12.6020, 121.4950], 13, { duration: 1 });
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
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : ''}`}>
      {/* Top Header & Metrics Bar */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            Geospatial Graph Algorithm & OpenStreetMap Radar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-world geographic graph topology of Roxas, Oriental Mindoro with interactive shortest path BFS, cross-barangay dispute links, and multi-agency referral flows.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-600 font-medium">Cases ({graphData.nodes.filter((n) => n.type === 'case').length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" />
            <span className="text-slate-600 font-medium">Persons ({graphData.nodes.filter((n) => n.type === 'person').length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span className="text-slate-600 font-medium">Officials ({graphData.nodes.filter((n) => n.type === 'official').length})</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" />
            <span className="text-slate-600 font-medium">5 Barangays</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 inline-block" />
            <span className="text-slate-600 font-medium">3 Agency Hubs</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Basemap Switcher & Pathfinding Toggle */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search node, person, case..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-300 focus:bg-white text-xs w-44"
            />
          </div>

          {/* Barangay Filter */}
          <select
            value={filterBarangay}
            onChange={(e) => setFilterBarangay(e.target.value)}
            className="p-1.5 bg-slate-50 rounded-lg border border-slate-300 font-medium text-xs text-slate-800"
          >
            <option value="ALL">All 20 Roxas Barangays</option>
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
            className="p-1.5 bg-slate-50 rounded-lg border border-slate-300 font-medium text-xs text-slate-800"
          >
            <option value="ALL">All Entity Types</option>
            <option value="agency">MDRRMO</option>
            <option value="case">Resident Cases</option>
            <option value="person">Resident Reporters</option>
          </select>


          {/* Toggle Relational Edges */}
          <button
            onClick={() => setShowEdges(!showEdges)}
            className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition ${
              showEdges ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{showEdges ? 'Hide Edges' : 'Show Edges'}</span>
          </button>

          {/* Pathfinding Toggle */}
          <button
            onClick={() => {
              setPathfindingMode(!pathfindingMode);
              if (pathfindingMode) {
                setComputedPath(null);
                setStartNodeId('');
                setEndNodeId('');
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              pathfindingMode
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>{pathfindingMode ? 'BFS Path Active' : 'Trace BFS Shortest Path'}</span>
          </button>
        </div>

        {/* Map View & Layer Options */}
        <div className="flex items-center gap-2">
          {/* Basemap Tile Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {TILE_OPTIONS.map((tile) => (
              <button
                key={tile.id}
                onClick={() => setActiveTile(tile.id)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  activeTile === tile.id
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tile.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetMapCenter}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Pathfinding Selection Bar (when active) */}
      {pathfindingMode && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <Route className="w-4 h-4 text-amber-600" />
              BFS Shortest Path Algorithm:
            </span>

            <div className="flex items-center gap-2">
              <select
                value={startNodeId}
                onChange={(e) => setStartNodeId(e.target.value)}
                className="p-1.5 bg-white rounded-lg border border-amber-300 font-medium text-xs max-w-[200px]"
              >
                <option value="">-- Origin Node (Point A) --</option>
                {graphData.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.type})
                  </option>
                ))}
              </select>

              <ArrowRight className="w-4 h-4 text-amber-600" />

              <select
                value={endNodeId}
                onChange={(e) => setEndNodeId(e.target.value)}
                className="p-1.5 bg-white rounded-lg border border-amber-300 font-medium text-xs max-w-[200px]"
              >
                <option value="">-- Target Node (Point B) --</option>
                {graphData.nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label} ({n.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {computedPath ? (
            <div className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Shortest Path Connected: {computedPath.totalDistance} degrees of separation ({computedPath.nodeIds.length} hops)
            </div>
          ) : startNodeId && endNodeId ? (
            <div className="text-xs text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
              No relational path found between selected entities
            </div>
          ) : (
            <span className="text-[11px] text-amber-700">Click any 2 node markers on the OpenStreetMap or select from dropdowns</span>
          )}
        </div>
      )}

      {/* Main Grid: Leaflet OpenStreetMap Container + Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 bg-slate-100 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative min-h-[600px]">
          {/* Top Leaflet Status Badge */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">
              {TILE_OPTIONS.find((t) => t.id === activeTile)?.name}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-mono text-[11px]">
              {filteredNodes.length} Nodes • {filteredEdges.length} Edges
            </span>
          </div>

          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[580px] z-10" />

          {/* Floating Map Legend at Bottom Left */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-200 p-2.5 rounded-lg text-[11px] space-y-1.5 shadow-md text-slate-700">
            <div className="font-bold text-[10px] uppercase text-slate-400 pb-0.5 tracking-wider">GRAPH ENTITY OVERLAY</div>
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600" /> MDRRMO
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Case Incident Node
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Resident Reporter
            </div>
          </div>
        </div>

        {/* Right Column: Path Tracer & Inspector & Multi-Case Clusters */}
        <div className="space-y-4">
          {/* Path Trace Explanation */}
          {computedPath && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-amber-950 uppercase flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-amber-600" />
                  BFS Shortest Relationship Route
                </h4>
                <button onClick={() => setComputedPath(null)} className="text-amber-700 hover:text-amber-900 text-xs">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {computedPath.hops.map((hop, idx) => {
                  const fromNode = graphData.nodes.find((n) => n.id === hop.fromNodeId);
                  const toNode = graphData.nodes.find((n) => n.id === hop.toNodeId);
                  return (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Hop {idx + 1}: {fromNode?.label || hop.fromNodeId}</span>
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                        <span>{toNode?.label || hop.toNodeId}</span>
                      </div>
                      <div className="text-[10px] text-amber-800 font-mono bg-amber-100/60 px-1.5 py-0.5 rounded inline-block">
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="font-bold text-xs uppercase text-slate-500">
                    {selectedNode.type} Entity
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Clear Selection
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{selectedNode.label}</h3>
                {selectedNode.subLabel && (
                  <p className="text-xs text-slate-500 mt-0.5">{selectedNode.subLabel}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Graph Degree</span>
                  <span className="font-mono font-bold text-slate-800">{selectedNode.degree || 0} links</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Classification</span>
                  <span className="font-medium text-slate-700 capitalize">{selectedNode.type}</span>
                </div>
              </div>

              {selectedNode.rawCase && (
                <div className="pt-1 space-y-2">
                  <button
                    onClick={() => setSelectedCaseId(selectedNode.rawCase!.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Incident Dossier ({selectedNode.rawCase.id})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center text-xs text-slate-500">
              Click any node marker on the OpenStreetMap to inspect connections, incident classifications, and case files.
            </div>
          )}

          {/* Multi-Case Clusters & Linked Parties */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Multi-Case Clusters ({graphData.clusters.length})
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                AI Detected
              </span>
            </div>

            <p className="text-xs text-slate-500">
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
                    className={`p-3 rounded-lg border transition cursor-pointer space-y-1.5 ${
                      isSelectedCluster
                        ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-slate-50 hover:bg-indigo-50/40 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-950">{cluster.title || cluster.label}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">
                        {cluster.caseIds?.length || cluster.nodeIds.length} Linked
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {cluster.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {(cluster.caseIds || []).map((caseId) => (
                        <button
                          key={caseId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCaseId(caseId);
                          }}
                          className="text-[10px] font-mono font-bold bg-white text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-50 cursor-pointer shadow-2xs"
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
