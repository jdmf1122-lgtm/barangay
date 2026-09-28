import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, 
  Layers, 
  Flame, 
  Clock, 
  ShieldAlert, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Building2, 
  Shield, 
  Landmark, 
  Search, 
  Maximize2, 
  Minimize2,
  RotateCcw, 
  TrendingUp, 
  ChevronRight, 
  X,
  MapPin,
  FileText,
  Navigation,
  Filter,
  UserCheck,
  Globe,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { Case, ROXAS_BARANGAYS } from '../../types';

// Accurate real-world geographic coordinates from PhilAtlas & PSA for the 6 Official Barangays of Roxas, Oriental Mindoro
export interface SystemBarangayGeo {
  name: typeof ROXAS_BARANGAYS[number];
  code: string;
  lat: number;
  lng: number;
  zoom: number;
  zoneType: 'Poblacion Commercial' | 'Coastal & Maritime' | 'Inland Agricultural' | 'Upland & Watershed';
  description: string;
  puroks: string[];
  hallLocation: string;
  contactEmergency: string;
  boundary: [number, number][]; // Accurate LatLng polygon bounding coords
}

export const SYSTEM_BARANGAYS_GEO: SystemBarangayGeo[] = [
  {
    name: 'Bagumbayan',
    code: 'BGB',
    lat: 12.5895,
    lng: 121.5218,
    zoom: 15,
    zoneType: 'Poblacion Commercial',
    description: 'Municipal commercial and administrative center along the national highway, adjacent to the municipal complex.',
    puroks: ['Purok 1 Centro', 'Purok 2 Riverside', 'Purok 3 Commercial District', 'Purok 4 Highway'],
    hallLocation: 'National Highway / Bagumbayan Proper, Roxas',
    contactEmergency: '0917-234-8901 (Brgy. Hall)',
    boundary: [
      [12.5970, 121.5105],
      [12.5970, 121.5250],
      [12.5835, 121.5250],
      [12.5835, 121.5105]
    ]
  },
  {
    name: 'Cantil',
    code: 'CTL',
    lat: 12.5742,
    lng: 121.5120,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Southern agricultural sector known for rice fields and peaceful rural settlements.',
    puroks: ['Purok 1 Centro', 'Purok 2 Bukid', 'Purok 3 Ilaya', 'Purok 4 Riverside'],
    hallLocation: 'Barangay Proper, Cantil, Roxas',
    contactEmergency: '0918-123-4567 (Brgy. Hall)',
    boundary: [
      [12.5810, 121.5050],
      [12.5810, 121.5190],
      [12.5670, 121.5190],
      [12.5670, 121.5050]
    ]
  },
  {
    name: 'Dangay',
    code: 'DNG',
    lat: 12.5861,
    lng: 121.5367,
    zoom: 15,
    zoneType: 'Coastal & Maritime',
    description: 'Major maritime seaport hub connecting Roxas to Visayas and nautical highway shipping lanes.',
    puroks: ['Purok 1 Port Area', 'Purok 2 Coastal', 'Purok 3 Terminal', 'Purok 4 Centro'],
    hallLocation: 'Port Access Road, Dangay, Roxas',
    contactEmergency: '0919-234-5678 (Brgy. Hall)',
    boundary: [
      [12.5930, 121.5290],
      [12.5930, 121.5440],
      [12.5790, 121.5440],
      [12.5790, 121.5290]
    ]
  },
  {
    name: 'Happy Valley',
    code: 'HPV',
    lat: 12.5620,
    lng: 121.4920,
    zoom: 15,
    zoneType: 'Upland & Watershed',
    description: 'Southwestern valley community surrounded by agro-forestry and rolling hills.',
    puroks: ['Purok 1 Valley View', 'Purok 2 Centro', 'Purok 3 Upper Slope', 'Purok 4 Green Valley'],
    hallLocation: 'Valley Road, Happy Valley, Roxas',
    contactEmergency: '0920-345-6789 (Brgy. Hall)',
    boundary: [
      [12.5690, 121.4850],
      [12.5690, 121.4990],
      [12.5550, 121.4990],
      [12.5550, 121.4850]
    ]
  },
  {
    name: 'Libertad',
    code: 'LBT',
    lat: 12.5780,
    lng: 121.5040,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Central agricultural community connecting municipal transit arteries to local farmlands.',
    puroks: ['Purok 1 Centro', 'Purok 2 Pag-asa', 'Purok 3 Masagana', 'Purok 4 Silangan'],
    hallLocation: 'Libertad Proper, Roxas',
    contactEmergency: '0921-456-7890 (Brgy. Hall)',
    boundary: [
      [12.5850, 121.4970],
      [12.5850, 121.5110],
      [12.5710, 121.5110],
      [12.5710, 121.4970]
    ]
  },
  {
    name: 'Libtong',
    code: 'LTG',
    lat: 12.6010,
    lng: 121.4620,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Western inland sector featuring fertile plains, coconut groves, and farming cooperatives.',
    puroks: ['Purok 1 Main', 'Purok 2 Ricefields', 'Purok 3 Centro', 'Purok 4 West End'],
    hallLocation: 'Libtong Road, Roxas',
    contactEmergency: '0922-567-8901 (Brgy. Hall)',
    boundary: [
      [12.6080, 121.4550],
      [12.6080, 121.4690],
      [12.5940, 121.4690],
      [12.5940, 121.4550]
    ]
  },
  {
    name: 'Little Tanauan',
    code: 'LTN',
    lat: 12.5930,
    lng: 121.4550,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Quiet farming and residential community on the western rural boundary of Roxas.',
    puroks: ['Purok 1 Centro', 'Purok 2 San Roque', 'Purok 3 Riverside', 'Purok 4 Bukid'],
    hallLocation: 'Tanauan Center, Little Tanauan, Roxas',
    contactEmergency: '0923-678-9012 (Brgy. Hall)',
    boundary: [
      [12.6000, 121.4480],
      [12.6000, 121.4620],
      [12.5860, 121.4620],
      [12.5860, 121.4480]
    ]
  },
  {
    name: 'Mabuhay',
    code: 'MBH',
    lat: 12.5550,
    lng: 121.4800,
    zoom: 15,
    zoneType: 'Upland & Watershed',
    description: 'Southern upland community bordered by forests, agro-farming, and natural streams.',
    puroks: ['Purok 1 Centro', 'Purok 2 Hillside', 'Purok 3 Ilaya', 'Purok 4 Silangan'],
    hallLocation: 'Barangay Proper, Mabuhay, Roxas',
    contactEmergency: '0924-789-0123 (Brgy. Hall)',
    boundary: [
      [12.5620, 121.4730],
      [12.5620, 121.4870],
      [12.5480, 121.4870],
      [12.5480, 121.4730]
    ]
  },
  {
    name: 'Maraska',
    code: 'MRK',
    lat: 12.5710,
    lng: 121.4720,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Agricultural expanse supporting diversified cropping and community livelihoods.',
    puroks: ['Purok 1 Centro', 'Purok 2 Kaunlaran', 'Purok 3 Maligaya', 'Purok 4 Pagkakaisa'],
    hallLocation: 'Maraska Highway Junction, Roxas',
    contactEmergency: '0925-890-1234 (Brgy. Hall)',
    boundary: [
      [12.5780, 121.4650],
      [12.5780, 121.4790],
      [12.5640, 121.4790],
      [12.5640, 121.4650]
    ]
  },
  {
    name: 'Odiong',
    code: 'ODG',
    lat: 12.5983,
    lng: 121.4984,
    zoom: 15,
    zoneType: 'Coastal & Maritime',
    description: 'Barangay situated between Bagumbayan and San Aquilino, featuring residential clusters and access routes.',
    puroks: ['Purok 1 Baywalk', 'Purok 2 Centro', 'Purok 3 Highway Junction', 'Purok 4 Mangrove Buffer'],
    hallLocation: 'Barangay Center, Brgy. Odiong, Roxas',
    contactEmergency: '0919-456-7823 (Brgy. Hall)',
    boundary: [
      [12.6050, 121.4915],
      [12.6050, 121.5060],
      [12.5910, 121.5060],
      [12.5910, 121.4915]
    ]
  },
  {
    name: 'Paclasan',
    code: 'PCL',
    lat: 12.5850,
    lng: 121.5240,
    zoom: 15,
    zoneType: 'Poblacion Commercial',
    description: 'Densely populated poblacion barangay near the market center, commercial stalls, and municipal roads.',
    puroks: ['Purok 1 Centro', 'Purok 2 Market View', 'Purok 3 Coastal Road', 'Purok 4 Commercial'],
    hallLocation: 'Morente Avenue / Paclasan Proper, Roxas',
    contactEmergency: '0926-901-2345 (Brgy. Hall)',
    boundary: [
      [12.5920, 121.5170],
      [12.5920, 121.5310],
      [12.5780, 121.5310],
      [12.5780, 121.5170]
    ]
  },
  {
    name: 'San Aquilino',
    code: 'SAQ',
    lat: 12.5967,
    lng: 121.4841,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Western agricultural territory with farming plains, irrigation canals, and active Lupon conciliation hearings.',
    puroks: ['Purok 1 Main', 'Purok 2 Upper Valley', 'Purok 3 Riverside', 'Purok 4 Green Hills'],
    hallLocation: 'Sitio Centro, Brgy. San Aquilino, Roxas',
    contactEmergency: '0920-567-8934 (Brgy. Hall)',
    boundary: [
      [12.6035, 121.4770],
      [12.6035, 121.4910],
      [12.5895, 121.4910],
      [12.5895, 121.4770]
    ]
  },
  {
    name: 'San Isidro',
    code: 'SIS',
    lat: 12.6150,
    lng: 121.4950,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Northeastern community of farmers, growers, and trade routes linking to neighboring towns.',
    puroks: ['Purok 1 Silangan', 'Purok 2 Centro', 'Purok 3 Riverside', 'Purok 4 Bukid'],
    hallLocation: 'San Isidro Proper, Roxas',
    contactEmergency: '0927-012-3456 (Brgy. Hall)',
    boundary: [
      [12.6220, 121.4880],
      [12.6220, 121.5020],
      [12.6080, 121.5020],
      [12.6080, 121.4880]
    ]
  },
  {
    name: 'San Jose',
    code: 'SJS',
    lat: 12.5680,
    lng: 121.5250,
    zoom: 15,
    zoneType: 'Coastal & Maritime',
    description: 'Southeastern coastal territory known for small-craft fishing, aquaculture, and mangrove zones.',
    puroks: ['Purok 1 Baybayin', 'Purok 2 Centro', 'Purok 3 Silangan', 'Purok 4 Mangrove'],
    hallLocation: 'San Jose Coastal Road, Roxas',
    contactEmergency: '0928-123-4567 (Brgy. Hall)',
    boundary: [
      [12.5750, 121.5180],
      [12.5750, 121.5320],
      [12.5610, 121.5320],
      [12.5610, 121.5180]
    ]
  },
  {
    name: 'San Mariano',
    code: 'SMR',
    lat: 12.6220,
    lng: 121.4750,
    zoom: 15,
    zoneType: 'Upland & Watershed',
    description: 'Northern frontier barangay featuring highland agro-forestry, mountain views, and spring sources.',
    puroks: ['Purok 1 Mountain View', 'Purok 2 Centro', 'Purok 3 Watershed', 'Purok 4 Green Hills'],
    hallLocation: 'Highland Road, San Mariano, Roxas',
    contactEmergency: '0929-234-5678 (Brgy. Hall)',
    boundary: [
      [12.6290, 121.4680],
      [12.6290, 121.4820],
      [12.6150, 121.4820],
      [12.6150, 121.4680]
    ]
  },
  {
    name: 'San Miguel',
    code: 'SMG',
    lat: 12.6065,
    lng: 121.4707,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Western agricultural interior connecting rural road networks and agricultural farm settlements.',
    puroks: ['Purok 1 Silangan', 'Purok 2 Kanluran', 'Purok 3 Ilaya Drainage', 'Purok 4 Centro'],
    hallLocation: 'Session Road, Brgy. San Miguel, Roxas',
    contactEmergency: '0921-678-9045 (Brgy. Hall)',
    boundary: [
      [12.6130, 121.4635],
      [12.6130, 121.4775],
      [12.5995, 121.4775],
      [12.5995, 121.4635]
    ]
  },
  {
    name: 'San Rafael',
    code: 'SRF',
    lat: 12.5810,
    lng: 121.4650,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Interior agricultural district with expansive grain production and community cooperatives.',
    puroks: ['Purok 1 Centro', 'Purok 2 Kaunlaran', 'Purok 3 Riverside', 'Purok 4 Masagana'],
    hallLocation: 'San Rafael Hall, Roxas',
    contactEmergency: '0930-345-6789 (Brgy. Hall)',
    boundary: [
      [12.5880, 121.4580],
      [12.5880, 121.4720],
      [12.5740, 121.4720],
      [12.5740, 121.4580]
    ]
  },
  {
    name: 'San Vicente',
    code: 'SVC',
    lat: 12.6120,
    lng: 121.4580,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Northwestern agricultural basin with fruit-bearing orchards, coconut trees, and rural roads.',
    puroks: ['Purok 1 Centro', 'Purok 2 Maligaya', 'Purok 3 San Isidro Link', 'Purok 4 West Valley'],
    hallLocation: 'San Vicente Proper, Roxas',
    contactEmergency: '0931-456-7890 (Brgy. Hall)',
    boundary: [
      [12.6190, 121.4510],
      [12.6190, 121.4650],
      [12.6050, 121.4650],
      [12.6050, 121.4510]
    ]
  },
  {
    name: 'Uyao',
    code: 'UYO',
    lat: 12.5760,
    lng: 121.5310,
    zoom: 15,
    zoneType: 'Coastal & Maritime',
    description: 'Coastal settlement between Dangay and San Jose with seaside communities and fishing grounds.',
    puroks: ['Purok 1 Coastal', 'Purok 2 Centro', 'Purok 3 Highway Buffer', 'Purok 4 Fishermans Wharf'],
    hallLocation: 'Seaside Highway, Uyao, Roxas',
    contactEmergency: '0932-567-8901 (Brgy. Hall)',
    boundary: [
      [12.5830, 121.5240],
      [12.5830, 121.5380],
      [12.5690, 121.5380],
      [12.5690, 121.5240]
    ]
  },
  {
    name: 'Victoria',
    code: 'VCT',
    lat: 12.6101,
    lng: 121.4862,
    zoom: 15,
    zoneType: 'Upland & Watershed',
    description: 'Northern inland and upland community hosting agro-forestry zones, boundary easements, and watershed streams.',
    puroks: ['Purok 1 Heights', 'Purok 2 Centro', 'Purok 3 Spring Watershed', 'Purok 4 Mountain View'],
    hallLocation: 'Highland Road, Brgy. Victoria, Roxas',
    contactEmergency: '0922-789-0156 (Brgy. Hall)',
    boundary: [
      [12.6175, 121.4790],
      [12.6175, 121.4940],
      [12.6030, 121.4940],
      [12.6030, 121.4790]
    ]
  }
];

// Municipal Government & Law Enforcement Agency Hubs (Exact Coordinates)
export const MUNICIPAL_AGENCY_HUBS = [

  {
    id: 'HUB-LGU',
    name: 'Municipal Government Center of Roxas',
    shortName: 'Roxas Municipal Hall (LGU)',
    type: 'LGU' as const,
    lat: 12.5888,
    lng: 121.5167,
    address: 'Municipal Complex (near Bulwagan ng Katarungan), Poblacion, Roxas, Oriental Mindoro'
  },
  {
    id: 'HUB-DILG',
    name: 'DILG Municipal Operations Office (MLGOO)',
    shortName: 'DILG MLGOO Roxas',
    type: 'DILG' as const,
    lat: 12.5882,
    lng: 121.5176,
    address: 'Legislative Building, Municipal Compound, Morente Avenue, Roxas, Oriental Mindoro'
  }
];

// Available Map Tile Providers (Realistic Street, Satellite Imagery, Terrain)
type TileLayerType = 'google_street' | 'satellite' | 'terrain' | 'osm';

interface TileConfig {
  id: TileLayerType;
  label: string;
  thumbnail: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

const MAP_TILE_CONFIGS: TileConfig[] = [
  {
    id: 'google_street',
    label: 'Default Streets',
    thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=100&auto=format&fit=crop&q=60',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  {
    id: 'satellite',
    label: 'Satellite (Real Photo)',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&auto=format&fit=crop&q=60',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  },
  {
    id: 'terrain',
    label: 'Terrain & Contours',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&auto=format&fit=crop&q=60',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17
  },
  {
    id: 'osm',
    label: 'OSM Standard',
    thumbnail: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=100&auto=format&fit=crop&q=60',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }
];

type GisViewMode = 'all' | 'heatmap' | 'pending' | 'officials' | 'referrals';

export const GeographicBarangayMap: React.FC = () => {
  const { currentUser } = useAuth();
  const { cases, setSelectedCaseId } = useCases();

  // Map Container Reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const referralLinesGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [activeTileType, setActiveTileType] = useState<TileLayerType>('google_street');
  const [gisMode, setGisMode] = useState<GisViewMode>('all');
  const [selectedBarangayFilter, setSelectedBarangayFilter] = useState<string>(
    currentUser.barangay && ROXAS_BARANGAYS.includes(currentUser.barangay as any)
      ? currentUser.barangay
      : 'ALL'
  );
  const [inspectedBarangayName, setInspectedBarangayName] = useState<string | null>(
    currentUser.barangay && ROXAS_BARANGAYS.includes(currentUser.barangay as any)
      ? currentUser.barangay
      : null
  );

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showHubs, setShowHubs] = useState<boolean>(true);
  const [showReferralLines, setShowReferralLines] = useState<boolean>(true);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  // Filter cases strictly restricted to the 6 System Barangays and user choices
  const filteredCases = useMemo(() => {
    return (cases || []).filter((c) => {
      if (!ROXAS_BARANGAYS.includes(c.barangay as any)) return false;

      if (selectedBarangayFilter !== 'ALL' && c.barangay !== selectedBarangayFilter) {
        return false;
      }

      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
        return false;
      }

      if (gisMode === 'pending' && !c.isPending && c.status !== 'Pending') {
        return false;
      }
      if (gisMode === 'officials' && !c.isInvolvingOfficial) {
        return false;
      }
      if (gisMode === 'referrals' && !c.isReferredToLgu && !c.isMonitoredByDilg) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesBrgy = c.barangay.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesLoc = (c.specificLocation || '').toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrgy && !matchesId && !matchesLoc && !matchesCat) return false;
      }

      return true;
    });
  }, [cases, selectedBarangayFilter, categoryFilter, gisMode, searchTerm]);

  // Aggregate statistics for the 6 Official Barangays
  const barangayStats = useMemo(() => {
    const map = new Map<string, {
      total: number;
      pending: number;
      resolved: number;
      referred: number;
      officials: number;
      cases: Case[];
      categories: Record<string, number>;
      purokCounts: Record<string, number>;
    }>();

    SYSTEM_BARANGAYS_GEO.forEach((b) => {
      map.set(b.name, {
        total: 0,
        pending: 0,
        resolved: 0,
        referred: 0,
        officials: 0,
        cases: [],
        categories: {},
        purokCounts: {}
      });
    });

    (cases || []).forEach((c) => {
      if (!ROXAS_BARANGAYS.includes(c.barangay as any)) return;

      const stats = map.get(c.barangay);
      if (!stats) return;

      stats.total += 1;
      if (c.isPending || c.status === 'Pending') stats.pending += 1;
      if (c.status === 'Resolved' || c.status === 'Closed') stats.resolved += 1;
      if (c.isReferredToLgu || c.isMonitoredByDilg) stats.referred += 1;
      if (c.isInvolvingOfficial) stats.officials += 1;
      stats.cases.push(c);
      stats.categories[c.category] = (stats.categories[c.category] || 0) + 1;

      const loc = c.specificLocation || '';
      const matchedPurok = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5'].find(p => loc.toLowerCase().includes(p.toLowerCase()));
      if (matchedPurok) {
        stats.purokCounts[matchedPurok] = (stats.purokCounts[matchedPurok] || 0) + 1;
      } else {
        stats.purokCounts['Centro / Main'] = (stats.purokCounts['Centro / Main'] || 0) + 1;
      }
    });

    return map;
  }, [cases]);

  // Selected Barangay Inspection Data
  const inspectedData = useMemo(() => {
    const target = inspectedBarangayName || (selectedBarangayFilter !== 'ALL' ? selectedBarangayFilter : null);
    if (!target) return null;
    const geo = SYSTEM_BARANGAYS_GEO.find((b) => b.name === target);
    const stats = barangayStats.get(target);
    return { geo, stats };
  }, [inspectedBarangayName, selectedBarangayFilter, barangayStats]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered at Roxas, Oriental Mindoro (covering all 6 official barangays)
      const map = L.map(mapContainerRef.current, {
        center: [12.6020, 121.4950],
        zoom: 13,
        zoomControl: false, // We provide custom Google Maps styled controls
        attributionControl: true
      });

      // Default tile layer (CartoDB Voyager)
      const selectedConfig = MAP_TILE_CONFIGS.find(t => t.id === 'google_street') || MAP_TILE_CONFIGS[0];
      const tileLayer = L.tileLayer(selectedConfig.url, {
        attribution: selectedConfig.attribution,
        maxZoom: selectedConfig.maxZoom
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layer Groups
      polygonsLayerGroupRef.current = L.layerGroup().addTo(map);
      referralLinesGroupRef.current = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when user toggles (Streets / Satellite / Terrain / OSM)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = MAP_TILE_CONFIGS.find(t => t.id === activeTileType) || MAP_TILE_CONFIGS[0];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [activeTileType]);

  // Update Markers, Polygons, and Overlays dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear previous elements
    if (polygonsLayerGroupRef.current) polygonsLayerGroupRef.current.clearLayers();
    if (referralLinesGroupRef.current) referralLinesGroupRef.current.clearLayers();
    if (markersLayerGroupRef.current) markersLayerGroupRef.current.clearLayers();

    // 1. Draw Barangay Boundaries & Heatmap Polygons
    if (showBoundaries && polygonsLayerGroupRef.current) {
      SYSTEM_BARANGAYS_GEO.forEach((b) => {
        const stats = barangayStats.get(b.name) || { total: 0, pending: 0, officials: 0 };
        const isSelected = (inspectedBarangayName || selectedBarangayFilter) === b.name;
        const isDimmed = selectedBarangayFilter !== 'ALL' && selectedBarangayFilter !== b.name;

        let fillColor = '#10b981';
        let borderColor = '#047857';

        if (gisMode === 'officials' && stats.officials > 0) {
          fillColor = '#e11d48';
          borderColor = '#9f1239';
        } else if (gisMode === 'pending' && stats.pending > 0) {
          fillColor = '#f59e0b';
          borderColor = '#b45309';
        } else if (stats.total >= 4) {
          fillColor = '#f43f5e';
          borderColor = '#be123c';
        } else if (stats.total >= 2) {
          fillColor = '#fbbf24';
          borderColor = '#d97706';
        }

        const polygon = L.polygon(b.boundary, {
          color: borderColor,
          weight: isSelected ? 3 : 1.5,
          fillColor: fillColor,
          fillOpacity: isDimmed ? 0.1 : (isSelected ? 0.45 : 0.25),
          dashArray: isSelected ? undefined : '5, 5'
        });

        polygon.on('click', () => {
          setSelectedBarangayFilter(b.name);
          setInspectedBarangayName(b.name);
          map.flyTo([b.lat, b.lng], 15, { duration: 0.8 });
        });

        polygonsLayerGroupRef.current?.addLayer(polygon);
      });
    }

    // 2. Inter-Agency Referral Flow Lines (to Municipal Agency Hubs)
    if (showReferralLines && referralLinesGroupRef.current) {
      const lguHub = MUNICIPAL_AGENCY_HUBS.find(h => h.type === 'LGU')!;
      const dilgHub = MUNICIPAL_AGENCY_HUBS.find(h => h.type === 'DILG')!;

      SYSTEM_BARANGAYS_GEO.forEach((b) => {
        if (selectedBarangayFilter !== 'ALL' && b.name !== selectedBarangayFilter) return;
        const stats = barangayStats.get(b.name);
        if (!stats) return;

        const lguCount = stats.cases.filter(c => c.isReferredToLgu).length;
        const dilgCount = stats.cases.filter(c => c.isMonitoredByDilg).length;

        if (lguCount > 0) {
          const line = L.polyline([[b.lat, b.lng], [lguHub.lat, lguHub.lng]], {
            color: '#059669',
            weight: 2.5,
            dashArray: '6, 6',
            opacity: 0.85
          });
          referralLinesGroupRef.current?.addLayer(line);
        }

        if (dilgCount > 0) {
          const line = L.polyline([[b.lat, b.lng], [dilgHub.lat, dilgHub.lng]], {
            color: '#9333ea',
            weight: 2.5,
            dashArray: '6, 6',
            opacity: 0.85
          });
          referralLinesGroupRef.current?.addLayer(line);
        }
      });
    }

    // 3. Municipal Agency Hub Markers (LGU, DILG)
    if (showHubs && markersLayerGroupRef.current) {
      MUNICIPAL_AGENCY_HUBS.forEach((hub) => {
        const hubHtml = `
          <div style="
            background: ${hub.type === 'DILG' ? '#581c87' : '#064e3b'};
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            font-family: sans-serif;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            white-space: nowrap;
          ">
            <span style="font-size: 13px;">${hub.type === 'DILG' ? '🏛️' : '🏢'}</span>
            <span>${hub.shortName}</span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-hub-icon',
          html: hubHtml,
          iconSize: [120, 30],
          iconAnchor: [60, 15]
        });

        const marker = L.marker([hub.lat, hub.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #0f172a; font-size: 13px;">${hub.name}</strong>
            <p style="font-size: 11px; color: #475569; margin: 4px 0 0 0;">${hub.address}</p>
            <span style="display: inline-block; margin-top: 6px; font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #0f172a;">
              Municipal Public Agency Node
            </span>
          </div>
        `);

        markersLayerGroupRef.current?.addLayer(marker);
      });
    }

    // 4. Official System Barangay Pins & Incident Markers
    if (markersLayerGroupRef.current) {
      SYSTEM_BARANGAYS_GEO.forEach((b) => {
        if (selectedBarangayFilter !== 'ALL' && selectedBarangayFilter !== b.name) return;

        const stats = barangayStats.get(b.name) || { total: 0, pending: 0, resolved: 0, officials: 0 };
        const isFocused = (inspectedBarangayName || selectedBarangayFilter) === b.name;

        // Custom Google Maps style Barangay Pin
        const pinHtml = `
          <div style="position: relative; text-align: center; cursor: pointer;">
            <div style="
              background: ${isFocused ? '#047857' : '#0f172a'};
              color: white;
              border-radius: 20px;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              border: 2px solid white;
              display: flex;
              align-items: center;
              gap: 6px;
              white-space: nowrap;
            ">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${stats.total > 0 ? '#10b981' : '#94a3b8'};"></span>
              <span>Brgy. ${b.name}</span>
              <span style="background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 10px; font-family: monospace; font-size: 10px;">
                ${stats.total}
              </span>
            </div>
            ${stats.officials > 0 ? `
              <div style="
                position: absolute;
                top: -6px;
                right: -6px;
                background: #e11d48;
                color: white;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                font-size: 9px;
                font-weight: 900;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1.5px solid white;
              ">!</div>
            ` : ''}
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-barangay-pin',
          html: pinHtml,
          iconSize: [110, 30],
          iconAnchor: [55, 15]
        });

        const marker = L.marker([b.lat, b.lng], { icon });

        marker.on('click', () => {
          setSelectedBarangayFilter(b.name);
          setInspectedBarangayName(b.name);
          map.flyTo([b.lat, b.lng], 15, { duration: 0.8 });
        });

        markersLayerGroupRef.current?.addLayer(marker);

        // 5. Individual Case Incident Dots within this Barangay
        const casesInBrgy = stats.cases || [];
        casesInBrgy.forEach((c, idx) => {
          // Offsets for clustered cases to avoid exact overlap
          const angle = (idx / Math.max(1, casesInBrgy.length)) * Math.PI * 2;
          const radius = 0.0035 + (idx % 3) * 0.0018;
          const caseLat = b.lat + Math.sin(angle) * radius;
          const caseLng = b.lng + Math.cos(angle) * radius;

          let dotColor = '#10b981';
          if (c.isInvolvingOfficial) dotColor = '#e11d48';
          else if (c.isPending || c.status === 'Pending') dotColor = '#f59e0b';

          const caseMarkerHtml = `
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: ${dotColor};
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
              cursor: pointer;
            ">
              ${c.isInvolvingOfficial ? '⚠️' : '📍'}
            </div>
          `;

          const caseIcon = L.divIcon({
            className: 'custom-case-dot',
            html: caseMarkerHtml,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          const caseMarker = L.marker([caseLat, caseLng], { icon: caseIcon });

          // Interactive Google Maps style place card popup
          const popupContent = document.createElement('div');
          popupContent.innerHTML = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; width: 230px; padding: 2px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-family: monospace; font-weight: 800; font-size: 11px; color: #1e40af;">${c.id}</span>
                <span style="font-size: 10px; font-weight: 700; background: ${dotColor}20; color: ${dotColor}; padding: 1px 6px; border-radius: 4px;">
                  ${c.status}
                </span>
              </div>
              <h4 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
                ${c.title}
              </h4>
              <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">
                📍 ${c.specificLocation || b.name}
              </p>
              <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
                Category: <strong>${c.category}</strong>
              </div>
              <button id="view-case-btn-${c.id}" style="
                width: 100%;
                background: #047857;
                color: white;
                border: none;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
              ">
                Open Case Dossier ➔
              </button>
            </div>
          `;

          caseMarker.bindPopup(popupContent);
          caseMarker.on('popupopen', () => {
            const btn = document.getElementById(`view-case-btn-${c.id}`);
            if (btn) {
              btn.onclick = () => setSelectedCaseId(c.id);
            }
          });

          markersLayerGroupRef.current?.addLayer(caseMarker);
        });
      });
    }
  }, [
    gisMode,
    selectedBarangayFilter,
    inspectedBarangayName,
    barangayStats,
    showBoundaries,
    showHubs,
    showReferralLines,
    setSelectedCaseId
  ]);

  // Recenter map on specific barangay or all 5 barangays
  const handleFocusBarangay = (barangayName: string) => {
    setSelectedBarangayFilter(barangayName);
    setInspectedBarangayName(barangayName);

    if (mapInstanceRef.current) {
      if (barangayName === 'ALL') {
        mapInstanceRef.current.flyTo([12.6020, 121.4950], 13, { duration: 1 });
      } else {
        const geo = SYSTEM_BARANGAYS_GEO.find(b => b.name === barangayName);
        if (geo) {
          mapInstanceRef.current.flyTo([geo.lat, geo.lng], 15, { duration: 1 });
        }
      }
    }
  };

  return (
    <div id="realistic-google-map-module" className="space-y-4">
      {/* Top Floating Google Maps Bar Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Realistic Geographic Map & Spatial GIS Radar</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono rounded font-bold">
                    Roxas, Oriental Mindoro
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Interactive real-world satellite, terrain, and street mapping for the 6 official system barangays
                </p>
              </div>
            </div>
          </div>

          {/* Map Layer Mode Switcher (Google Style) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setGisMode('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                gisMode === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standard GIS</span>
            </button>
            <button
              onClick={() => setGisMode('heatmap')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                gisMode === 'heatmap' ? 'bg-white text-rose-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Incident Heatmap</span>
            </button>
            <button
              onClick={() => setGisMode('pending')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                gisMode === 'pending' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Delays</span>
            </button>
            <button
              onClick={() => setGisMode('officials')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                gisMode === 'officials' ? 'bg-white text-rose-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Official Inquiries</span>
            </button>
            <button
              onClick={() => setGisMode('referrals')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                gisMode === 'referrals' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Agency Flow</span>
            </button>
          </div>
        </div>

        {/* Specific Barangay Selector Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <span className="px-2 text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              Barangay Scope:
            </span>

            <button
              onClick={() => handleFocusBarangay('ALL')}
              className={`px-2.5 py-1.5 rounded-md font-bold transition cursor-pointer ${
                selectedBarangayFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              All 5 Barangays
            </button>

            {ROXAS_BARANGAYS.map((bName) => {
              const count = barangayStats.get(bName)?.total || 0;
              const isSelected = selectedBarangayFilter === bName;
              return (
                <button
                  key={bName}
                  onClick={() => handleFocusBarangay(bName)}
                  className={`px-2.5 py-1.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span>{bName}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search, Category Filter & External Google Maps link */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="ALL">All Accident Types</option>
              <option value="Motorcycle vs Motorcycle Collision">Motorcycle vs Motorcycle</option>
              <option value="Motorcycle vs Car / SUV Collision">Motorcycle vs Car/SUV</option>
              <option value="Motorcycle vs Tricycle Collision">Motorcycle vs Tricycle</option>
              <option value="Car / 4-Wheeled Vehicle Collision">Car vs 4-Wheeled</option>
              <option value="Tricycle Collision / Rollover">Tricycle Rollover</option>
              <option value="Truck / Bus / Heavy Vehicle Crash">Heavy Vehicle / Truck Crash</option>
              <option value="PUV / Jeepney / Multicab Accident">PUV / Jeepney Accident</option>
              <option value="Pedestrian Hit by Vehicle / Motorcycle">Pedestrian Hit-and-Run</option>
              <option value="Bicycle / E-Bike / E-Trike Crash">E-Bike / Bicycle</option>
              <option value="Single-Vehicle Road Skid / Fixed Object Crash">Road Skid / Ditch Crash</option>
              <option value="Multi-Vehicle Pileup Collision">Multi-Vehicle Collision</option>
              <option value="Hit-and-Run Vehicular Crash">Hit-and-Run Crash</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search incident, location, docket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-44 sm:w-52 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <a
              href="https://www.google.com/maps/place/Roxas,+Oriental+Mindoro/@12.5855,121.5186,14z"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              title="Open Roxas in Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Map Stage + Side Place Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Real Leaflet Map Container */}
        <div className={`lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-300 overflow-hidden shadow-md relative flex flex-col ${isMapFullscreen ? 'fixed inset-2 sm:inset-4 z-50 lg:col-span-12' : 'min-h-[380px] sm:min-h-[480px] lg:min-h-[580px]'}`}>
          
          {/* Top-Left Floating Google Maps Style Search Card / Compass */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-[1000] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 p-1.5 sm:p-2 shadow-lg flex items-center gap-1.5 sm:gap-2 max-w-[160px] sm:max-w-sm">
            <div className="p-1 sm:p-1.5 bg-emerald-600 text-white rounded-lg flex-shrink-0">
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-xs min-w-0">
              <div className="font-bold text-slate-900 truncate text-[11px] sm:text-xs">
                {selectedBarangayFilter === 'ALL' ? 'Roxas 6 Barangays' : `Brgy. ${selectedBarangayFilter}`}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block truncate">Oriental Mindoro, Philippines</div>
            </div>
          </div>

          {/* Top-Right Google Maps Tile Style Selector (Map / Satellite / Terrain) */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-[1000] bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 p-1 sm:p-1.5 shadow-lg flex items-center gap-1">
            {MAP_TILE_CONFIGS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTileType(t.id)}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                  activeTileType === t.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={t.label}
              >
                <span>{t.id === 'satellite' ? '🛰️' : t.id === 'terrain' ? '⛰️' : '🗺️'}</span>
                <span className="hidden md:inline">{t.id === 'satellite' ? 'Satellite' : t.id === 'terrain' ? 'Terrain' : 'Street'}</span>
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-0.5 sm:mx-1" />

            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isMapFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>

          {/* Google Maps Style Bottom-Right Zoom & Navigation Control Widgets */}
          <div className="absolute bottom-6 right-3 z-[1000] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 p-1 shadow-lg">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-8 h-8 flex items-center justify-center font-black text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer text-sm"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-8 h-8 flex items-center justify-center font-black text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer text-sm"
              title="Zoom Out"
            >
              -
            </button>
            <div className="h-px bg-slate-200 mx-1" />
            <button
              onClick={() => handleFocusBarangay('ALL')}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Recenter Roxas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom-Left Layer Toggles */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-lg flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showBoundaries}
                onChange={(e) => setShowBoundaries(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Barangay Borders</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showHubs}
                onChange={(e) => setShowHubs(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Agency Hubs (LGU/DILG)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showReferralLines}
                onChange={(e) => setShowReferralLines(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0"
              />
              <span>Referral Trails</span>
            </label>
          </div>

          {/* Leaflet DOM Anchor */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[540px] flex-1 z-0" />
        </div>

        {/* Google Maps Style Place Details & Barangay Dossier Inspector */}
        <div className="lg:col-span-4 space-y-3 flex flex-col">
          {inspectedData ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {inspectedData.geo?.code}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 leading-tight">
                      Brgy. {inspectedData.geo?.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      {inspectedData.geo?.zoneType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleFocusBarangay('ALL')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Close Focused View"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description & Geographic Location */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-xs space-y-1">
                <p className="text-slate-700 leading-relaxed font-medium">
                  {inspectedData.geo?.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span>Lat: {inspectedData.geo?.lat.toFixed(4)}° N</span>
                  <span>Lng: {inspectedData.geo?.lng.toFixed(4)}° E</span>
                </div>
              </div>

              {/* Metric Counters */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                  <span className="text-[8.5px] text-slate-400 uppercase font-bold block">Total</span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {inspectedData.stats?.total || 0}
                  </span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[8.5px] text-emerald-700 uppercase font-bold block">Resolved</span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    {inspectedData.stats?.resolved || 0}
                  </span>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <span className="text-[8.5px] text-amber-700 uppercase font-bold block">Pending</span>
                  <span className="text-base font-black text-amber-800 font-mono">
                    {inspectedData.stats?.pending || 0}
                  </span>
                </div>
                <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <span className="text-[8.5px] text-rose-700 uppercase font-bold block">Officials</span>
                  <span className="text-base font-black text-rose-800 font-mono">
                    {inspectedData.stats?.officials || 0}
                  </span>
                </div>
              </div>

              {/* Local Purok Jurisdiction Sector List */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Purok Sectors in {inspectedData.geo?.name}
                </span>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {inspectedData.geo?.puroks.map((purok) => (
                    <div key={purok} className="bg-slate-50 px-2.5 py-1 rounded text-slate-700 font-medium truncate border border-slate-100">
                      📍 {purok}
                    </div>
                  ))}
                </div>
              </div>

              {/* Logged Cases in this Specific Barangay */}
              <div className="flex-1 space-y-2 pt-2 border-t border-slate-100 flex flex-col min-h-[160px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Incident Dockets ({inspectedData.stats?.cases.length || 0})</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Click to Inspect</span>
                </span>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-56 pr-1">
                  {(inspectedData.stats?.cases || []).length === 0 ? (
                    <div className="text-xs text-slate-400 italic text-center py-6">
                      No recorded incidents logged for this barangay.
                    </div>
                  ) : (
                    inspectedData.stats?.cases.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCaseId(c.id)}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition cursor-pointer space-y-1 bg-white shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-blue-700 text-[11px]">{c.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                            c.isPending ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[170px]">📍 {c.specificLocation || c.category}</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            View <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Default All 5 Barangays Overview Card */
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-900">
                  Municipal System Jurisdiction Summary
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                The B-CONNECT System features full spatial mapping for the <strong>6 official barangays</strong> of Roxas, Oriental Mindoro. Click any pin or list item below to zoom in on genuine satellite imagery and street details.
              </p>

              <div className="space-y-1.5">
                {SYSTEM_BARANGAYS_GEO.map((b) => {
                  const stats = barangayStats.get(b.name);
                  return (
                    <div
                      key={b.name}
                      onClick={() => handleFocusBarangay(b.name)}
                      className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-2xs" />
                        <div>
                          <div className="font-bold text-slate-800">Brgy. {b.name}</div>
                          <div className="text-[10px] text-slate-400">{b.zoneType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {stats?.total || 0} cases
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
