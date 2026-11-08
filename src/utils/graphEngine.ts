import { Case, GraphNode, GraphEdge, GraphCluster } from '../types';

export interface GraphBuildOptions {
  activeOnly?: boolean;
  residentOnly?: boolean;
}

/**
 * Checks if a case was reported by a resident of that barangay
 */
export function isResidentReportedCase(c: Case): boolean {
  if (!c || !c.id) return false;
  if (c.isCitizenReport === true) return true;
  if (Boolean(c.residentReporterId)) return true;
  if (Boolean(c.reporterName && c.reporterName.trim() !== '')) return true;
  if (c.originatingAgency && /resident|citizen|civilian|public/i.test(c.originatingAgency)) return true;
  if (Array.isArray(c.complainants) && c.complainants.length > 0) {
    const hasCivilian = c.complainants.some(p => !p.isOfficial);
    if (hasCivilian) return true;
  }
  if (Array.isArray(c.personsInvolved) && c.personsInvolved.length > 0) {
    const hasCivilian = c.personsInvolved.some(p => p.role === 'Complainant' || p.role === 'Victim');
    if (hasCivilian) return true;
  }
  if (c.createdBy && /resident/i.test(c.createdBy)) return true;
  return false;
}

export function buildGraphFromCases(
  cases: Case[],
  options: GraphBuildOptions = {}
): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
} {
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // Filter cases: Only include cases from each barangay reported by a resident
  let targetCases = (cases || []).filter((c) => {
    if (!c || !c.id) return false;
    if (options.activeOnly && c.status === 'Resolved') return false;
    return true;
  });

  // Prioritize specifically cases reported by residents
  const residentOnlyCases = targetCases.filter(c => isResidentReportedCase(c));
  if (residentOnlyCases.length > 0) {
    targetCases = residentOnlyCases;
  } else {
    // If cases don't yet have the explicit citizen flag, include cases having a reporter or complainants
    targetCases = targetCases.filter(c => 
      Boolean(c.reporterName) || 
      (Array.isArray(c.complainants) && c.complainants.length > 0) || 
      c.isCitizenReport
    );
  }

  function addNode(node: GraphNode) {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
    } else {
      const existing = nodeMap.get(node.id)!;
      existing.metadata = { ...existing.metadata, ...node.metadata };
    }
  }

  function addEdge(source: string, target: string, label: string, type: GraphEdge['type']) {
    const edgeKey = `${source}->${target}:${type}`;
    if (!edgeSet.has(edgeKey) && source !== target) {
      edgeSet.add(edgeKey);
      edges.push({
        id: `E-${edges.length + 1}`,
        source,
        target,
        label,
        type,
        weight: 1
      });
    }
  }

  // Primary Destination: MDRRMO
  addNode({
    id: 'AGENCY-MDRRMO',
    label: 'MDRRMO',
    subLabel: 'Municipal Disaster Risk Reduction & Management Office • Operations Hub',
    type: 'agency',
    group: 'Agency',
    color: '#ea580c', // Emergency Orange
    radius: 30,
    metadata: {
      agency: 'MDRRMO',
      fullAddress: 'Morente Avenue, Camp Gozar Compound, Brgy. Bagumbayan, Roxas',
      hotline: '911 / (043) 289-2000 / 0917-888-MDRRMO',
      lat: 12.59152,
      lng: 121.51738
    }
  });

  // Process each resident-reported case
  targetCases.forEach((c) => {
    if (!c || !c.id) return;
    const caseNodeId = `CASE-${c.id}`;
    const caseTitle = c.title || 'Untitled Incident';
    const bgyName = c.barangay || 'Roxas';

    // Case Node
    const caseColor =
      c.status === 'Resolved' ? '#10b981' :
        c.priority === 'Urgent' || c.priority === 'High' ? '#ef4444' : '#3b82f6';

    addNode({
      id: caseNodeId,
      label: `${c.id}: ${caseTitle.length > 28 ? caseTitle.slice(0, 26) + '...' : caseTitle}`,
      subLabel: `Resident Report • Brgy. ${c.barangay || 'General'} (${c.category || 'General'})`,
      type: 'case',
      group: 'Case',
      color: caseColor,
      radius: 20,
      rawCase: c,
      metadata: {
        caseId: c.id,
        category: c.category,
        status: c.status,
        barangay: c.barangay,
        date: c.dateReported,
        priority: c.priority,
        isCitizenReport: true
      }
    });

    // Resident Case reported flows directly into MDRRMO
    addEdge(caseNodeId, 'AGENCY-MDRRMO', 'DISPATCHED_TO_MDRRMO', 'REPORTED_IN');

    // Resident Citizen Reporter Node (Ang resident lamang na nag-report ng incident)
    const reporterName = c.reporterName || c.complainants?.[0]?.name || `Resident Reporter (${bgyName})`;
    const reporterId = `PERSON-${reporterName.replace(/\s+/g, '')}`;
    addNode({
      id: reporterId,
      label: reporterName,
      subLabel: `Resident Reporter • Brgy. ${bgyName}`,
      type: 'person',
      subType: 'Resident Reporter',
      group: 'Person',
      color: '#2563eb', // Royal Blue
      radius: 15,
      metadata: {
        role: 'Resident Reporter',
        barangay: bgyName,
        contact: c.complainants?.[0]?.contact
      }
    });
    addEdge(reporterId, caseNodeId, 'FILED_INCIDENT_REPORT', 'INVOLVED_IN');
  });

  // If in activeOnly mode, prune any agency anchors that have 0 edges
  if (options.activeOnly) {
    const connectedNodeIds = new Set<string>();
    edges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });
    // Keep nodes that have at least 1 edge or are part of targetCases
    for (const [id] of nodeMap) {
      if (!connectedNodeIds.has(id)) {
        nodeMap.delete(id);
      }
    }
  }

  // Graph Traversal: Cross-Case Linkages & Cluster Detection
  const personToCases = new Map<string, string[]>();
  const nodes = Array.from(nodeMap.values());

  edges.forEach((e) => {
    if (e.source.startsWith('PERSON-') && e.target.startsWith('CASE-')) {
      const p = e.source;
      const c = e.target;
      if (!personToCases.has(p)) personToCases.set(p, []);
      personToCases.get(p)!.push(c);
    }
  });

  // If a person appears in >= 2 cases, link the cases directly
  const clusters: GraphCluster[] = [];

  personToCases.forEach((caseIds, personNodeId) => {
    if (caseIds.length > 1) {
      const personNode = nodeMap.get(personNodeId);
      const personName = personNode?.label || 'Individual';

      for (let i = 0; i < caseIds.length; i++) {
        for (let j = i + 1; j < caseIds.length; j++) {
          addEdge(caseIds[i], caseIds[j], `COMMON_PERSON: ${personName}`, 'RELATED_CASE');
        }
      }

      const cleanCaseIds = caseIds.map(c => c.replace('CASE-', ''));
      clusters.push({
        id: `CLUST-${clusters.length + 1}`,
        title: `Repeated Involvement: ${personName}`,
        label: `Repeated Involvement: ${personName}`,
        description: `${personName} is linked to ${caseIds.length} separate cases (${cleanCaseIds.join(', ')}).`,
        nodeIds: [personNodeId, ...caseIds],
        caseIds: cleanCaseIds,
        riskLevel: 'Moderate',
        commonFactor: `Common Individual: ${personName}`
      });
    }
  });

  // Hotspot / Category Cluster Detection
  const categoryToCases = new Map<string, string[]>();
  targetCases.forEach((c) => {
    if (!c || !c.category) return;
    if (!categoryToCases.has(c.category)) categoryToCases.set(c.category, []);
    categoryToCases.get(c.category)!.push(`CASE-${c.id}`);
  });

  categoryToCases.forEach((caseNodeIds, category) => {
    if (caseNodeIds.length >= 2) {
      const cleanCaseIds = caseNodeIds.map(c => c.replace('CASE-', ''));
      clusters.push({
        id: `CLUST-CAT-${category.replace(/\s+/g, '')}`,
        title: `Pattern Category: ${category}`,
        label: `Pattern Category: ${category}`,
        description: `${caseNodeIds.length} incidents logged under ${category} classification.`,
        nodeIds: caseNodeIds,
        caseIds: cleanCaseIds,
        riskLevel: 'Moderate',
        commonFactor: `Incident Category: ${category}`
      });
    }
  });

  // Single active case cluster (for focused inspection)
  if (targetCases.length === 1 && targetCases[0]) {
    const singleCase = targetCases[0];
    const caseNodeId = `CASE-${singleCase.id}`;
    const connectedEntityIds = edges
      .filter(e => e.source === caseNodeId || e.target === caseNodeId)
      .map(e => (e.source === caseNodeId ? e.target : e.source));

    clusters.push({
      id: `CLUST-ACTIVE-${singleCase.id}`,
      title: `Active Incident Cluster: ${singleCase.id}`,
      label: `Active Incident: ${singleCase.id}`,
      description: `Active ongoing case in Brgy. ${singleCase.barangay} (${singleCase.status}) involving ${singleCase.complainants?.length || 0} complainant(s) and ${singleCase.respondents?.length || 0} respondent(s).`,
      nodeIds: [caseNodeId, ...connectedEntityIds],
      caseIds: [singleCase.id],
      riskLevel: singleCase.priority === 'Urgent' || singleCase.priority === 'High' ? 'High' : 'Moderate',
      commonFactor: `Active Case: ${singleCase.title}`
    });
  }

  // Calculate degrees for node importance
  nodes.forEach((n) => {
    const degree = edges.filter((e) => e.source === n.id || e.target === n.id).length;
    n.metadata.degree = degree;
    n.degree = degree;
    if (degree > 2 && n.type !== 'agency') {
      n.radius = Math.min((n.radius || 12) + degree * 1.5, 26);
    }
  });

  return { nodes, edges, clusters };
}

// Alias for convenience
export const generateGraphData = buildGraphFromCases;

export interface PathHop {
  fromNodeId: string;
  toNodeId: string;
  edgeLabel: string;
  edgeType: string;
}

export interface DetailedPath {
  nodeIds: string[];
  hops: PathHop[];
  totalDistance: number;
}

export function findDetailedPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  endNodeId: string
): DetailedPath | null {
  if (!startNodeId || !endNodeId) return null;
  if (startNodeId === endNodeId) {
    return { nodeIds: [startNodeId], hops: [], totalDistance: 0 };
  }

  const adj = new Map<string, { target: string; label: string; type: string }[]>();
  edges.forEach((e) => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push({ target: e.target, label: e.label, type: e.type });
    adj.get(e.target)!.push({ target: e.source, label: e.label, type: e.type });
  });

  interface QueueItem {
    nodeId: string;
    path: string[];
    hops: PathHop[];
  }

  const queue: QueueItem[] = [{ nodeId: startNodeId, path: [startNodeId], hops: [] }];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.nodeId === endNodeId) {
      return {
        nodeIds: current.path,
        hops: current.hops,
        totalDistance: current.hops.length
      };
    }

    const neighbors = adj.get(current.nodeId) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push({
          nodeId: edge.target,
          path: [...current.path, edge.target],
          hops: [
            ...current.hops,
            {
              fromNodeId: current.nodeId,
              toNodeId: edge.target,
              edgeLabel: edge.label,
              edgeType: edge.type
            }
          ]
        });
      }
    }
  }

  return null;
}

export function findShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  endNodeId: string
): string[] {
  if (startNodeId === endNodeId) return [startNodeId];

  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  });

  const queue: string[][] = [[startNodeId]];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === endNodeId) {
      return path;
    }

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}
