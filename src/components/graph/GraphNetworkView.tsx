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
  Move,
  CheckCircle2,
  X,
  Compass,
  Network
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { generateGraphData, findDetailedPath, DetailedPath, prefersReducedMotion } from '../../utils/graphEngine';
import { GraphNode, GraphCluster } from '../../types';
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
      if (node.rawCase?.priority === 'Urgent' || node.rawCase?.priority === 'High') return 'var(--color-error)';
      if (node.rawCase?.status === 'Resolved') return 'var(--color-accent)';
      return 'var(--color-accent)';
    }
    if (node.type === 'person') return 'var(--color-warning)';
    if (node.type === 'agency') return 'var(--color-warning)';
    return 'var(--color-muted)';
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
      <section
        aria-label="Graph engine controls and scope filter"
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-paper p-3 rounded-xl border border-rule shadow-xs gap-3"
      >
        {/* Graph Engine Tabs */}
        <div className="flex items-center gap-1.5 bg-paper-2 p-1 rounded-lg border border-rule overflow-x-auto">
          <button
            type="button"
            onClick={() => setEngineTab('osm_graph')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              engineTab === 'osm_graph'
                ? 'bg-accent text-accent-ink shadow-xs'
                : 'text-muted hover:text-ink hover:bg-paper-3'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Geospatial radar</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap ${
              engineTab === 'osm_graph' ? 'bg-paper/20 text-accent-ink' : 'bg-paper-3 text-muted'
            }`}>
              GIS map
            </span>
          </button>

          <button
            type="button"
            onClick={() => setEngineTab('network_graph')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              engineTab === 'network_graph'
                ? 'bg-accent text-accent-ink shadow-xs'
                : 'text-muted hover:text-ink hover:bg-paper-3'
            }`}
          >
            <Network className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Orbit network</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap ${
              engineTab === 'network_graph' ? 'bg-paper/20 text-accent-ink' : 'bg-paper-3 text-muted'
            }`}>
              Orbit view
            </span>
          </button>
        </div>

        {/* Scope Selector: Active Cases Only vs All Incidents */}
        <div className="flex items-center gap-1 bg-paper-2 p-1 rounded-lg border border-rule self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setScopeFilter('ACTIVE_ONLY')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              scopeFilter === 'ACTIVE_ONLY'
                ? 'bg-warning text-ink shadow-xs'
                : 'text-muted hover:text-ink hover:bg-paper-3'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-ink motion-safe:animate-pulse" />
            <span>Active cases only</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${
              scopeFilter === 'ACTIVE_ONLY' ? 'bg-ink/15 text-ink' : 'bg-paper-3 text-muted'
            }`}>
              <span className="font-mono tabular-nums">{activeCasesList.length}</span> active
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScopeFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              scopeFilter === 'ALL'
                ? 'bg-ink text-paper shadow-xs'
                : 'text-muted hover:text-ink hover:bg-paper-3'
            }`}
          >
            <span>All incidents</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${
              scopeFilter === 'ALL' ? 'bg-paper/20 text-paper' : 'bg-paper-3 text-muted'
            }`}>
              <span className="font-mono tabular-nums">{cases.length}</span> total
            </span>
          </button>
        </div>
      </section>

      {/* Active Scope Summary Banner */}
      {scopeFilter === 'ACTIVE_ONLY' && (
        <section
          aria-label="Active resident cases summary"
          className="bg-paper-2 border border-rule rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-ink"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-paper-3 text-ink rounded-lg border border-rule shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2">
                <span>MDRRMO resident incident reports graph network</span>
                <span className="bg-paper-3 text-ink text-[11px] px-2 py-0.5 rounded-full border border-rule font-medium">
                  <span className="font-mono tabular-nums">{graphData.nodes.filter(n => n.type === 'case').length}</span> resident cases
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Visualizing cases reported by residents from each barangay flowing directly into the MDRRMO operations and command center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {activeCasesList[0] && (
              <button
                type="button"
                onClick={() => setSelectedCaseId(activeCasesList[0].id)}
                className="px-3 py-1.5 bg-accent hover:bg-accent/90 active:bg-accent text-accent-ink rounded-lg font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Case {activeCasesList[0].id}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>
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
        <div className="space-y-4">
          {/* Header & Metrics */}
          <section
            aria-label="Graph algorithm overview"
            className="bg-paper p-4 rounded-xl border border-rule shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                <Share2 className="w-5 h-5 text-accent" />
                <span>Incident relationship network and entity graph</span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Topological relationship mapping, shortest path BFS tracing, multi-case party clustering, and agency referral flows.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs bg-paper-2 px-3 py-2 rounded-lg border border-rule">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
                <span className="text-muted font-medium">Resident cases (<span className="font-mono tabular-nums">{graphData.nodes.filter(n => n.type === 'case').length}</span>)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
                <span className="text-muted font-medium">Resident reporters (<span className="font-mono tabular-nums">{graphData.nodes.filter(n => n.type === 'person').length}</span>)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" />
                <span className="text-ink font-semibold">MDRRMO (<span className="font-mono tabular-nums">1</span>)</span>
              </div>
            </div>
          </section>

          {/* Mode Bar & Controls */}
          <section
            aria-label="Graph search and viewport controls"
            className="bg-paper p-3 rounded-xl border border-rule shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs"
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search case or person…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 bg-paper-2 rounded-lg border border-rule text-ink placeholder:text-muted focus:bg-paper focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden text-xs w-48"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedNodeType}
                onChange={(e) => setSelectedNodeType(e.target.value)}
                className="p-1.5 bg-paper-2 rounded-lg border border-rule font-medium text-xs text-ink focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
              >
                <option value="ALL">All entity types</option>
                <option value="agency">MDRRMO hub</option>
                <option value="case">Resident cases</option>
                <option value="person">Resident reporters</option>
              </select>

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
                <span>{pathfindingMode ? 'Trace path active' : 'Trace relationship path'}</span>
              </button>
            </div>

            {/* Canvas Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-paper-2 rounded-lg p-0.5 border border-rule">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2, z + 0.15))}
                  className="p-1.5 text-muted hover:text-ink hover:bg-paper-3 rounded transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.15))}
                  className="p-1.5 text-muted hover:text-ink hover:bg-paper-3 rounded transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="p-1.5 text-muted hover:text-ink hover:bg-paper-3 rounded transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden cursor-pointer"
                  title="Reset view"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-muted font-medium pl-2 border-l border-rule flex items-center gap-2">
                <span><strong className="font-mono tabular-nums text-ink">{filteredNodes.length}</strong> nodes</span>
                <span className="text-muted/40">/</span>
                <span><strong className="font-mono tabular-nums text-ink">{filteredEdges.length}</strong> edges</span>
                <span className="text-muted/40">/</span>
                <span><strong className="font-mono tabular-nums text-ink">{graphData.clusters.length}</strong> clusters</span>
              </div>
            </div>
          </section>

          {/* Pathfinding Selection Bar */}
          {pathfindingMode && (
            <div className="bg-paper-2 border border-rule p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
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

                  <ArrowRight className="w-3.5 h-3.5 text-muted" />

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
                <div className="text-xs font-semibold text-accent bg-paper px-2.5 py-1 rounded-lg border border-rule flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  <span>Path discovered: <span className="font-mono tabular-nums">{computedPath.totalDistance}</span> degrees of separation (<span className="font-mono tabular-nums">{computedPath.nodeIds.length}</span> hops)</span>
                </div>
              ) : (startNodeId && endNodeId) ? (
                <div className="text-xs text-error bg-paper px-2.5 py-1 rounded-lg border border-rule">
                  No connected path found between selected entities
                </div>
              ) : (
                <span className="text-xs text-muted">Click any 2 nodes or choose from dropdowns</span>
              )}
            </div>
          )}

          {/* Main Grid: SVG Canvas + Inspector Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG Graph Canvas */}
            <div
              className="lg:col-span-2 bg-paper-2 rounded-xl border border-rule shadow-inner flex flex-col overflow-hidden relative min-h-[580px]"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Top Canvas Bar */}
              <div className="p-3 border-b border-rule flex justify-between items-center bg-paper z-10">
                <h3 className="font-semibold text-xs text-ink flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Interactive entity relationship network</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 bg-paper-2 text-muted font-medium rounded border border-rule flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    <span>Drag nodes to reposition</span>
                  </span>
                </div>
              </div>

              {/* SVG Canvas Area */}
              <div
                className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleStartPan}
              >
                <svg
                  ref={svgRef}
                  id="bconnect-graph-svg"
                  aria-label="Interactive entity relationship network diagram"
                  role="img"
                  viewBox="0 0 800 600"
                  className="w-full h-full min-h-[520px] select-none relative z-10"
                >
                  <defs>
                    <pattern id="graph-grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                      <circle cx="12" cy="12" r="1" fill="var(--color-rule)" />
                    </pattern>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#graph-grid-dots)" />

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

                        let strokeColor = 'var(--color-rule)';
                        let strokeWidth = 1.2;
                        let strokeOpacity = 0.6;

                        if (isPathEdge) {
                          strokeColor = 'var(--color-warning)';
                          strokeWidth = 3.5;
                          strokeOpacity = 1;
                        } else if (isClusterEdge) {
                          strokeColor = 'var(--color-accent)';
                          strokeWidth = 2.5;
                          strokeOpacity = 0.95;
                        } else if (isConnectedToSelected) {
                          strokeColor = 'var(--color-focus)';
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
                                className="text-[9px] fill-ink font-semibold select-none"
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
                            {/* Ring for Selected or Path Node */}
                            {(isSelected || isInPath) && (
                              <circle
                                r={nodeSize + 6}
                                fill="none"
                                stroke={isInPath ? 'var(--color-warning)' : 'var(--color-focus)'}
                                strokeWidth="2"
                                className="motion-safe:animate-pulse"
                              />
                            )}

                            {/* Node Body */}
                            <circle
                              r={nodeSize}
                              fill={fill}
                              stroke={isSelected ? 'var(--color-paper)' : 'var(--color-paper-3)'}
                              strokeWidth={isSelected ? 2.5 : 1.5}
                              className="transition-transform group-hover:scale-115 shadow-xs"
                            />

                            {/* Node Center Icon / Mark */}
                            {node.type === 'agency' && (
                              <text y={4} textAnchor="middle" className="text-[10px] fill-paper font-bold pointer-events-none select-none">
                                H
                              </text>
                            )}

                            {/* Node Text Label */}
                            <text
                              y={nodeSize + 13}
                              textAnchor="middle"
                              className={`text-[10px] select-none font-semibold ${
                                isSelected || isInPath ? 'fill-ink font-bold' : 'fill-ink-2'
                              }`}
                            >
                              {node.label.length > 22 ? node.label.substring(0, 20) + '…' : node.label}
                            </text>

                            {node.subLabel && (
                              <text
                                y={nodeSize + 23}
                                textAnchor="middle"
                                className="text-[9px] fill-muted select-none font-medium"
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

                {/* Guide at Bottom Left */}
                <div className="absolute bottom-3 left-3 bg-paper border border-rule p-2.5 rounded-lg text-xs space-y-1 shadow-xs z-20 text-ink">
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
            </div>

            {/* Right Column: Path Tracer & Inspector & Clusters */}
            <div className="space-y-4">
              {/* Path Trace Explanation Card */}
              {computedPath && (
                <div className="bg-paper rounded-xl border border-rule p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5">
                      <Route className="w-4 h-4 text-warning" />
                      <span>Relationship path trace result</span>
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
                      const fromNode = graphData.nodes.find(n => n.id === hop.fromNodeId);
                      const toNode = graphData.nodes.find(n => n.id === hop.toNodeId);
                      return (
                        <div key={idx} className="p-2.5 bg-paper-2 rounded-lg border border-rule text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold text-ink">
                            <span>Hop <span className="font-mono tabular-nums">{idx + 1}</span>: {fromNode?.label || hop.fromNodeId}</span>
                            <ArrowRight className="w-3 h-3 text-muted" />
                            <span>{toNode?.label || hop.toNodeId}</span>
                          </div>
                          <div className="text-[11px] text-muted font-medium bg-paper px-2 py-0.5 rounded border border-rule inline-block">
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
                <div className="bg-paper rounded-xl border border-rule shadow-xs p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rule">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getNodeColor(selectedNode) }}
                      />
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
                      <span className="text-[11px] text-muted block font-medium">Connections</span>
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
                  Select any node in the graph to inspect connections, degrees, and linked case dossiers.
                </div>
              )}

              {/* Identified Multi-Case Clusters */}
              <div className="bg-paper rounded-xl border border-rule shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-ink flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-accent" />
                    <span>Multi-case clusters and linked parties</span>
                  </h3>
                  <span className="text-[11px] bg-paper-2 text-muted font-medium px-2 py-0.5 rounded-full border border-rule">
                    <span className="font-mono tabular-nums">{graphData.clusters.length}</span> found
                  </span>
                </div>

                <p className="text-xs text-muted">
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
      )}
    </div>
  );
};
