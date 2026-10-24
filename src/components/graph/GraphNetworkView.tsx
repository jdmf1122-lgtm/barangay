import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Share2,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Route,
  ArrowRight,
  Shield,
  Building2,
  User,
  AlertTriangle,
  Move,
  Info,
  CheckCircle2,
  X,
  MapPin,
  Compass,
  Network,
  Globe
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { generateGraphData, findDetailedPath, DetailedPath } from '../../utils/graphEngine';
import { GraphNode, GraphEdge, GraphCluster } from '../../types';
import { GeospatialGraphMap } from './GeospatialGraphMap';

export const GraphNetworkView: React.FC = () => {
  const { cases, setSelectedCaseId } = useCases();

  // Scope Filter: 'ACTIVE_ONLY' (Active cases/incidents only) vs 'ALL' (Include all historical cases)
  const [scopeFilter, setScopeFilter] = useState<'ACTIVE_ONLY' | 'ALL'>('ACTIVE_ONLY');

  // Primary Engine Mode Switcher: 'osm_graph' (Leaflet OpenStreetMap Geospatial Graph) vs 'network_graph' (Topological Orbit Graph)
  const [engineTab, setEngineTab] = useState<'osm_graph' | 'network_graph'>('osm_graph');

  const [selectedNodeType, setSelectedNodeType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<GraphCluster | null>(null);

  // Interactive Pathfinding state
  const [pathfindingMode, setPathfindingMode] = useState<boolean>(false);
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [endNodeId, setEndNodeId] = useState<string>('');
  const [computedPath, setComputedPath] = useState<DetailedPath | null>(null);

  // Pan and Zoom
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging individual nodes
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [customPositions, setCustomPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Count active cases
  const activeCasesList = useMemo(() => {
    return (cases || []).filter(c => c.isPending || (c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Archived'));
  }, [cases]);

  // Generate Graph Network based on Scope
  const graphData = useMemo(() => {
    return generateGraphData(cases, { activeOnly: scopeFilter === 'ACTIVE_ONLY' });
  }, [cases, scopeFilter]);

  // Filter nodes & edges
  const filteredNodes = useMemo(() => {
    let nodes = graphData.nodes;
    if (selectedNodeType !== 'ALL') {
      nodes = nodes.filter((n) => n.type === selectedNodeType);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      nodes = nodes.filter(
        (n) => n.label.toLowerCase().includes(q) || (n.subLabel && n.subLabel.toLowerCase().includes(q))
      );
    }
    return nodes;
  }, [graphData, selectedNodeType, searchTerm]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return graphData.edges.filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target));
  }, [graphData.edges, activeNodeIds]);

  // Automatic topological layout positions
  const basePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    const total = graphData.nodes.length;
    const centerX = 400;
    const centerY = 300;

    // Single active case specialized layout
    const caseNodes = graphData.nodes.filter(n => n.type === 'case');
    if (caseNodes.length === 1) {
      const singleCaseNode = caseNodes[0];
      map.set(singleCaseNode.id, { x: centerX, y: centerY });

      // Layout surrounding nodes: Resident Reporter on left, MDRRMO on right
      const residentReporters = graphData.nodes.filter(n => n.type === 'person');
      residentReporters.forEach((p, idx) => {
        map.set(p.id, { x: centerX - 200, y: centerY + (idx - (residentReporters.length - 1) / 2) * 80 });
      });

      const agencyNodes = graphData.nodes.filter(n => n.type === 'agency');
      agencyNodes.forEach((a) => {
        map.set(a.id, { x: centerX + 200, y: centerY });
      });



      // Fallback for remaining unmapped nodes
      graphData.nodes.forEach((n, idx) => {
        if (!map.has(n.id)) {
          const angle = (idx * 2 * Math.PI) / Math.max(1, total);
          map.set(n.id, {
            x: centerX + Math.cos(angle) * 220,
            y: centerY + Math.sin(angle) * 220
          });
        }
      });

      return map;
    }

    // Structural coordinates for multi-case or all-cases view
    // Structural coordinates: Central MDRRMO Command Hub
    const agencyCoords: Record<string, { x: number; y: number }> = {
      'AGENCY-MDRRMO': { x: centerX, y: centerY } // Central Destination Hub
    };

    // Place case nodes in inner-middle perimeter around MDRRMO central hub
    caseNodes.forEach((cNode, cIdx) => {
      const angle = (cIdx * 2 * Math.PI) / Math.max(1, caseNodes.length);
      const dist = 180 + (cIdx % 2 === 0 ? 25 : -25);
      map.set(cNode.id, {
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist
      });
    });

    // Place person nodes outer ring (resident citizens who filed reports)
    const personNodes = graphData.nodes.filter(n => n.type === 'person');
    personNodes.forEach((pNode, pIdx) => {
      const angle = (pIdx * 2 * Math.PI) / Math.max(1, personNodes.length);
      const dist = 330 + (pIdx % 3 === 0 ? 25 : -15);
      map.set(pNode.id, {
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist
      });
    });

    // Place agency anchors
    Object.entries(agencyCoords).forEach(([id, coord]) => {
      map.set(id, coord);
    });

    // Fallback for any other nodes
    graphData.nodes.forEach((n, idx) => {
      if (!map.has(n.id)) {
        const angle = (idx * 2 * Math.PI) / Math.max(1, total);
        map.set(n.id, {
          x: centerX + Math.cos(angle) * 200,
          y: centerY + Math.sin(angle) * 200
        });
      }
    });

    return map;
  }, [graphData.nodes]);

  // Merge custom dragged positions with base positions
  const nodePositions = useMemo(() => {
    const merged = new Map<string, { x: number; y: number }>();
    basePositions.forEach((pos, id) => {
      if (customPositions.has(id)) {
        merged.set(id, customPositions.get(id)!);
      } else {
        merged.set(id, pos);
      }
    });
    return merged;
  }, [basePositions, customPositions]);

  // Highlighted path node IDs & Edge Keys
  const pathNodeSet = useMemo(() => {
    return new Set(computedPath ? computedPath.nodeIds : []);
  }, [computedPath]);

  // Highlighted cluster node IDs
  const clusterNodeSet = useMemo(() => {
    return new Set(selectedCluster ? selectedCluster.nodeIds : []);
  }, [selectedCluster]);

  // Neighbors of selected node for spotlighting
  const neighborNodeSet = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>([selectedNode.id]);
    graphData.edges.forEach((e) => {
      if (e.source === selectedNode.id) set.add(e.target);
      if (e.target === selectedNode.id) set.add(e.source);
    });
    return set;
  }, [selectedNode, graphData.edges]);

  // Path calculation trigger
  useEffect(() => {
    if (pathfindingMode && startNodeId && endNodeId) {
      const res = findDetailedPath(graphData.nodes, graphData.edges, startNodeId, endNodeId);
      setComputedPath(res);
    } else {
      setComputedPath(null);
    }
  }, [pathfindingMode, startNodeId, endNodeId, graphData]);

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'case') {
      if (node.rawCase?.priority === 'Urgent' || node.rawCase?.priority === 'High') return '#ef4444'; // Red
      if (node.rawCase?.status === 'Resolved') return '#10b981'; // Green
      return '#3b82f6'; // Blue
    }
    if (node.type === 'person') return node.color || '#ea580c'; // Orange
    if (node.type === 'agency') return '#ea580c'; // MDRRMO Orange
    return '#64748b'; // Slate
  };

  // Node selection handler
  const handleNodeClick = (node: GraphNode) => {
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
  };

  // Dragging logic
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const rawY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      setCustomPositions((prev) => {
        const next = new Map(prev);
        next.set(draggedNodeId, { x: rawX, y: rawY });
        return next;
      });
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleStartPan = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-canvas-bg') {
      setIsPanning(true);
      setStartPan({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      });
    }
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setCustomPositions(new Map());
    setSelectedNode(null);
    setSelectedCluster(null);
    setComputedPath(null);
    setStartNodeId('');
    setEndNodeId('');
    setSearchTerm('');
    setSelectedNodeType('ALL');
  };

  return (
    <div id="graph-network-view" className="space-y-4">
      {/* Primary Engine View Switcher & Scope Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200/80 shadow-xs gap-3">
        {/* Graph Engine Tabs */}
        <div className="flex items-center gap-1.5 bg-emerald-50/70 p-1 rounded-lg border border-emerald-200/60 overflow-x-auto">
          <button
            onClick={() => setEngineTab('osm_graph')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${engineTab === 'osm_graph'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-emerald-100/50'
              }`}
          >
            <Compass className="w-4 h-4" />
            <span>Geospatial Radar (OpenStreetMap)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${engineTab === 'osm_graph' ? 'bg-white/20' : 'bg-emerald-200/60 text-emerald-900'}`}>
              GIS Map
            </span>
          </button>

          <button
            onClick={() => setEngineTab('network_graph')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${engineTab === 'network_graph'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-950 hover:bg-emerald-100/50'
              }`}
          >
            <Network className="w-4 h-4" />
            <span>Topological Entity Orbit Graph</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${engineTab === 'network_graph' ? 'bg-white/20' : 'bg-emerald-200/60 text-emerald-900'}`}>
              Orbit View
            </span>
          </button>
        </div>

        {/* Scope Selector: Active Cases Only vs All Incidents */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setScopeFilter('ACTIVE_ONLY')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${scopeFilter === 'ACTIVE_ONLY'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Active Cases Only</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${scopeFilter === 'ACTIVE_ONLY' ? 'bg-black/20' : 'bg-slate-200 text-slate-700'}`}>
              {activeCasesList.length} Active
            </span>
          </button>

          <button
            onClick={() => setScopeFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${scopeFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <span>All Incidents</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${scopeFilter === 'ALL' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
              {cases.length} Total
            </span>
          </button>
        </div>
      </div>

      {/* Active Scope Summary Banner */}
      {scopeFilter === 'ACTIVE_ONLY' && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>MDRRMO Resident Incident Reports Graph Network</span>
                <span className="bg-orange-200 text-orange-950 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {graphData.nodes.filter(n => n.type === 'case').length} Resident Cases
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                Visualizing cases reported by residents from each barangay flowing directly into the MDRRMO Operations & Command Center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {activeCasesList[0] && (
              <button
                onClick={() => setSelectedCaseId(activeCasesList[0].id)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>Case {activeCasesList[0].id}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* RENDER GEOSPATIAL GRAPH RADAR ON LEAFLET OPENSTREETMAP */}
      {engineTab === 'osm_graph' ? (
        <GeospatialGraphMap
          graphData={graphData}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          selectedCluster={selectedCluster}
          setSelectedCluster={setSelectedCluster}
          pathfindingMode={pathfindingMode}
          setPathfindingMode={setPathfindingMode}
          startNodeId={startNodeId}
          setStartNodeId={setStartNodeId}
          endNodeId={endNodeId}
          setEndNodeId={setEndNodeId}
          computedPath={computedPath}
          setComputedPath={setComputedPath}
          scopeFilter={scopeFilter}
          setScopeFilter={setScopeFilter}
          activeCasesCount={activeCasesList.length}
        />
      ) : (
        /* RENDER TOPOLOGICAL ORBIT NODE-LINK GRAPH */
        <>
          {/* Header & Metrics */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                B-CONNECT Graph Algorithm & Incident Relationship Engine
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Topological relationship mapping, shortest path BFS tracing, multi-case party clustering, and inter-agency bridge detection.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span className="text-slate-600 font-medium">Resident Cases ({graphData.nodes.filter(n => n.type === 'case').length})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                <span className="text-slate-600 font-medium">Resident Reporters ({graphData.nodes.filter(n => n.type === 'person').length})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
                <span className="text-slate-700 font-bold">MDRRMO (1)</span>
              </div>
            </div>
          </div>

          {/* Mode Bar & Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search case or person..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-300 focus:bg-white text-xs w-48"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedNodeType}
                onChange={(e) => setSelectedNodeType(e.target.value)}
                className="p-1.5 bg-slate-50 rounded-lg border border-slate-300 font-medium text-xs"
              >
                <option value="ALL">All Entity Types</option>
                <option value="agency">MDRRMO</option>
                <option value="case">Resident Cases</option>
                <option value="person">Resident Reporters</option>
              </select>

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
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${pathfindingMode
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
              >
                <Route className="w-3.5 h-3.5" />
                {pathfindingMode ? 'Trace Path Active' : 'Trace Relationship Path'}
              </button>
            </div>

            {/* Canvas Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2, z + 0.15))}
                  className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.15))}
                  className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={resetView}
                  className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium pl-2 border-l border-slate-200">
                <strong>{filteredNodes.length}</strong> Nodes • <strong>{filteredEdges.length}</strong> Edges • <strong>{graphData.clusters.length}</strong> Clusters
              </div>
            </div>
          </div>

          {/* Pathfinding Selection Bar */}
          {pathfindingMode && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-amber-600" />
                  BFS Shortest Path Algorithm:
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={startNodeId}
                    onChange={(e) => setStartNodeId(e.target.value)}
                    className="p-1.5 bg-white rounded border border-amber-300 font-medium text-xs max-w-[200px]"
                  >
                    <option value="">-- Select Origin Node --</option>
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
                    className="p-1.5 bg-white rounded border border-amber-300 font-medium text-xs max-w-[200px]"
                  >
                    <option value="">-- Select Target Node --</option>
                    {graphData.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {computedPath ? (
                <div className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Path Discovered: {computedPath.totalDistance} degrees of separation ({computedPath.nodeIds.length} hops)
                </div>
              ) : (startNodeId && endNodeId) ? (
                <div className="text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  No connected path found between selected entities
                </div>
              ) : (
                <span className="text-[11px] text-amber-700">Click any 2 nodes or choose from dropdowns</span>
              )}
            </div>
          )}

          {/* Main Grid: SVG Canvas + Inspector Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG Graph Canvas */}
            <div
              className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex flex-col overflow-hidden relative min-h-[580px]"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Top Canvas Bar */}
              <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 backdrop-blur-xs z-10">
                <h4 className="font-bold text-xs text-slate-200 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Interactive Entity Relationship Network
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-blue-950 text-blue-300 font-semibold rounded border border-blue-800 flex items-center gap-1">
                    <Move className="w-3 h-3" /> Drag Nodes to Reposition
                  </span>
                </div>
              </div>

              {/* SVG Canvas Area */}
              <div className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing" onMouseDown={handleStartPan}>
                {/* Dark Grid Background */}
                <div
                  id="graph-canvas-bg"
                  className="absolute inset-0 opacity-20 pointer-events-auto"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                <svg
                  ref={svgRef}
                  id="bconnect-graph-svg"
                  viewBox="0 0 800 600"
                  className="w-full h-full min-h-[520px] select-none relative z-10"
                >
                  <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                    {/* Edges Layer */}
                    <g className="edges">
                      {filteredEdges.map((edge) => {
                        const pos1 = nodePositions.get(edge.source);
                        const pos2 = nodePositions.get(edge.target);
                        if (!pos1 || !pos2) return null;

                        const isPathEdge = computedPath?.hops.some(
                          (h) => (h.fromNodeId === edge.source && h.toNodeId === edge.target) ||
                            (h.fromNodeId === edge.target && h.toNodeId === edge.source)
                        );

                        const isClusterEdge = selectedCluster &&
                          clusterNodeSet.has(edge.source) &&
                          clusterNodeSet.has(edge.target);

                        const isConnectedToSelected = selectedNode &&
                          (selectedNode.id === edge.source || selectedNode.id === edge.target);

                        let strokeColor = '#334155'; // Default dark slate
                        let strokeWidth = 1.2;
                        let strokeOpacity = 0.45;

                        if (isPathEdge) {
                          strokeColor = '#fbbf24'; // Amber Gold
                          strokeWidth = 3.5;
                          strokeOpacity = 1;
                        } else if (isClusterEdge) {
                          strokeColor = '#818cf8'; // Indigo
                          strokeWidth = 2.5;
                          strokeOpacity = 0.95;
                        } else if (isConnectedToSelected) {
                          strokeColor = '#60a5fa'; // Blue
                          strokeWidth = 2.5;
                          strokeOpacity = 0.9;
                        }

                        return (
                          <g key={edge.id}>
                            <line
                              x1={pos1.x}
                              y1={pos1.y}
                              x2={pos2.x}
                              y2={pos2.y}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              strokeDasharray={edge.type === 'REFERRED_TO' || edge.type === 'MONITORED_BY' ? '4 3' : undefined}
                              opacity={strokeOpacity}
                            />
                            {(isPathEdge || isConnectedToSelected) && (
                              <text
                                x={(pos1.x + pos2.x) / 2}
                                y={(pos1.y + pos2.y) / 2 - 4}
                                textAnchor="middle"
                                className="text-[8px] fill-amber-300 font-bold bg-slate-900 select-none"
                              >
                                {edge.label}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>

                    {/* Nodes Layer */}
                    <g className="nodes">
                      {filteredNodes.map((node) => {
                        const pos = nodePositions.get(node.id);
                        if (!pos) return null;

                        const isSelected = selectedNode?.id === node.id;
                        const isInPath = pathNodeSet.has(node.id);
                        const isInCluster = clusterNodeSet.has(node.id);
                        const isNeighbor = neighborNodeSet.has(node.id);

                        const isDimmed = (selectedNode && !isNeighbor && !isSelected) ||
                          (selectedCluster && !isInCluster) ||
                          (computedPath && !isInPath);

                        const nodeSize = node.type === 'agency' ? 22 : node.type === 'case' ? 16 : node.type === 'barangay' ? 14 : 12;
                        const fill = getNodeColor(node);

                        return (
                          <g
                            key={node.id}
                            transform={`translate(${pos.x}, ${pos.y})`}
                            onClick={() => handleNodeClick(node)}
                            onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                            className="cursor-pointer group"
                            opacity={isDimmed ? 0.25 : 1}
                          >
                            {/* Glowing Ring for Selected or Path Node */}
                            {(isSelected || isInPath) && (
                              <circle
                                r={nodeSize + 7}
                                fill="none"
                                stroke={isInPath ? '#fbbf24' : '#3b82f6'}
                                strokeWidth="2"
                                className="animate-pulse"
                              />
                            )}

                            {/* Node Body */}
                            <circle
                              r={nodeSize}
                              fill={fill}
                              stroke={isSelected ? '#ffffff' : '#1e293b'}
                              strokeWidth={isSelected ? 2.5 : 1.5}
                              className="transition-transform group-hover:scale-125 shadow-lg"
                            />

                            {/* Node Center Icon / Mark */}
                            {node.type === 'agency' && (
                              <text y={4} textAnchor="middle" className="text-[9px] fill-white font-bold pointer-events-none select-none">
                                ★
                              </text>
                            )}

                            {/* Node Text Label */}
                            <text
                              y={nodeSize + 13}
                              textAnchor="middle"
                              className={`text-[10px] select-none font-bold ${isSelected || isInPath
                                  ? 'fill-amber-300 font-extrabold drop-shadow-md'
                                  : 'fill-slate-200'
                                }`}
                            >
                              {node.label.length > 22 ? node.label.substring(0, 20) + '...' : node.label}
                            </text>

                            {node.subLabel && (
                              <text
                                y={nodeSize + 23}
                                textAnchor="middle"
                                className="text-[8px] fill-slate-400 select-none font-medium"
                              >
                                {node.subLabel}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  </g>
                </svg>

                {/* Floating Guide at Bottom Left */}
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs border border-slate-800 p-2.5 rounded-lg text-[10px] space-y-1 shadow-lg z-20 text-slate-300">
                  <div className="flex items-center gap-2 font-medium"><span className="w-2 h-2 rounded-full bg-orange-600"></span> MDRRMO</div>
                  <div className="flex items-center gap-2 font-medium"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Case Incident</div>
                  <div className="flex items-center gap-2 font-medium"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Resident Reporter</div>
                </div>
              </div>
            </div>

            {/* Right Column: Path Tracer & Inspector & Clusters */}
            <div className="space-y-4">
              {/* Path Trace Explanation Card */}
              {computedPath && (
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-amber-900 uppercase flex items-center gap-1.5">
                      <Route className="w-4 h-4 text-amber-600" />
                      Relationship Path Trace Result
                    </h4>
                    <button
                      onClick={() => setComputedPath(null)}
                      className="text-amber-700 hover:text-amber-900 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {computedPath.hops.map((hop, idx) => {
                      const fromNode = graphData.nodes.find(n => n.id === hop.fromNodeId);
                      const toNode = graphData.nodes.find(n => n.id === hop.toNodeId);
                      return (
                        <div key={idx} className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>Hop {idx + 1}: {fromNode?.label || hop.fromNodeId}</span>
                            <ArrowRight className="w-3 h-3 text-amber-600" />
                            <span>{toNode?.label || hop.toNodeId}</span>
                          </div>
                          <div className="text-[10px] text-amber-800 font-mono bg-amber-100/50 px-1.5 py-0.5 rounded inline-block">
                            Relationship: {hop.edgeLabel} ({hop.edgeType})
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
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getNodeColor(selectedNode) }}
                      />
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
                      <span className="text-[10px] text-slate-400 block font-semibold">Connections</span>
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
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Full Incident Dossier ({selectedNode.rawCase.id})
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center text-xs text-slate-500">
                  Select any node in the graph to inspect connections, degrees, and linked case dossiers.
                </div>
              )}

              {/* Identified Multi-Case Clusters */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Multi-Case Clusters & Linked Parties
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                    {graphData.clusters.length} Found
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Graph algorithm identified repeat individuals, shared incidents, and correlated dispute patterns across Roxas.
                </p>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {graphData.clusters.map((cluster) => {
                    const isSelectedCluster = selectedCluster?.id === cluster.id;
                    return (
                      <div
                        key={cluster.id}
                        onClick={() => {
                          setSelectedCluster(isSelectedCluster ? null : cluster);
                          setSelectedNode(null);
                        }}
                        className={`p-3 rounded-lg border transition cursor-pointer space-y-1.5 ${isSelectedCluster
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
        </>
      )}
    </div>
  );
};

