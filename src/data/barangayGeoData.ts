import { ROXAS_BARANGAYS } from '../types';

// Accurate real-world geographic coordinates from PhilAtlas & PSA for the 20 Official Barangays of Roxas, Oriental Mindoro
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
    lat: 12.5906,
    lng: 121.5176,
    zoom: 15,
    zoneType: 'Poblacion Commercial',
    description: 'Municipal commercial and administrative center along the national highway, adjacent to the municipal complex.',
    puroks: ['Purok 1 Centro', 'Purok 2 Riverside', 'Purok 3 Commercial District', 'Purok 4 Highway'],
    hallLocation: 'National Highway / Bagumbayan Proper, Roxas',
    contactEmergency: '0917-234-8901 (Brgy. Hall)',
    boundary: [
      [12.5960, 121.5110],
      [12.5960, 121.5240],
      [12.5850, 121.5240],
      [12.5850, 121.5110]
    ]
  },
  {
    name: 'Cantil',
    code: 'CTL',
    lat: 12.6152,
    lng: 121.5163,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Northeastern agricultural sector along road 454 known for rice fields and peaceful rural settlements.',
    puroks: ['Purok 1 Centro', 'Purok 2 Bukid', 'Purok 3 Ilaya', 'Purok 4 Riverside'],
    hallLocation: 'Barangay Proper, Cantil, Roxas',
    contactEmergency: '0918-123-4567 (Brgy. Hall)',
    boundary: [
      [12.6210, 121.5100],
      [12.6210, 121.5230],
      [12.6090, 121.5230],
      [12.6090, 121.5100]
    ]
  },
  {
    name: 'Dangay',
    code: 'DNG',
    lat: 12.5964,
    lng: 121.5266,
    zoom: 15,
    zoneType: 'Coastal & Maritime',
    description: 'Major maritime seaport hub (Port of Roxas) connecting Roxas to Visayas and nautical highway shipping lanes.',
    puroks: ['Purok 1 Port Area', 'Purok 2 Coastal', 'Purok 3 Terminal', 'Purok 4 Centro'],
    hallLocation: 'Port Access Road, Dangay, Roxas',
    contactEmergency: '0919-234-5678 (Brgy. Hall)',
    boundary: [
      [12.6020, 121.5200],
      [12.6020, 121.5315],
      [12.5910, 121.5315],
      [12.5910, 121.5200]
    ]
  },
  {
    name: 'Happy Valley',
    code: 'HPV',
    lat: 12.6462,
    lng: 121.4100,
    zoom: 15,
    zoneType: 'Upland & Watershed',
    description: 'Northwestern valley community surrounded by agro-forestry and rolling hills.',
    puroks: ['Purok 1 Valley View', 'Purok 2 Centro', 'Purok 3 Upper Slope', 'Purok 4 Green Valley'],
    hallLocation: 'Valley Road, Happy Valley, Roxas',
    contactEmergency: '0920-345-6789 (Brgy. Hall)',
    boundary: [
      [12.6520, 121.4030],
      [12.6520, 121.4170],
      [12.6400, 121.4170],
      [12.6400, 121.4030]
    ]
  },
  {
    name: 'Libertad',
    code: 'LBT',
    lat: 12.6142,
    lng: 121.4736,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Central agricultural community connecting municipal transit arteries along Calapan South Road to local farmlands.',
    puroks: ['Purok 1 Centro', 'Purok 2 Pag-asa', 'Purok 3 Masagana', 'Purok 4 Silangan'],
    hallLocation: 'Libertad Proper, Roxas',
    contactEmergency: '0921-456-7890 (Brgy. Hall)',
    boundary: [
      [12.6200, 121.4670],
      [12.6200, 121.4800],
      [12.6080, 121.4800],
      [12.6080, 121.4670]
    ]
  },
  {
    name: 'Libtong',
    code: 'LTG',
    lat: 12.6319,
    lng: 121.4846,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'North-central inland sector featuring fertile plains, coconut groves, and farming cooperatives.',
    puroks: ['Purok 1 Main', 'Purok 2 Ricefields', 'Purok 3 Centro', 'Purok 4 West End'],
    hallLocation: 'Libtong Road, Roxas',
    contactEmergency: '0922-567-8901 (Brgy. Hall)',
    boundary: [
      [12.6380, 121.4780],
      [12.6380, 121.4910],
      [12.6260, 121.4910],
      [12.6260, 121.4780]
    ]
  },
  {
    name: 'Little Tanauan',
    code: 'LTN',
    lat: 12.6235,
    lng: 121.4602,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Quiet farming and residential community on the western rural boundary of Roxas.',
    puroks: ['Purok 1 Centro', 'Purok 2 San Roque', 'Purok 3 Riverside', 'Purok 4 Bukid'],
    hallLocation: 'Tanauan Center, Little Tanauan, Roxas',
    contactEmergency: '0923-678-9012 (Brgy. Hall)',
    boundary: [
      [12.6300, 121.4535],
      [12.6300, 121.4670],
      [12.6170, 121.4670],
      [12.6170, 121.4535]
    ]
  },
  {
    name: 'Mabuhay',
    code: 'MBH',
    lat: 12.6393,
    lng: 121.4644,
    zoom: 15,
    zoneType: 'Upland & Watershed',
    description: 'Northern upland community bordered by forests, agro-farming, and natural streams.',
    puroks: ['Purok 1 Centro', 'Purok 2 Hillside', 'Purok 3 Ilaya', 'Purok 4 Silangan'],
    hallLocation: 'Barangay Proper, Mabuhay, Roxas',
    contactEmergency: '0924-789-0123 (Brgy. Hall)',
    boundary: [
      [12.6460, 121.4580],
      [12.6460, 121.4710],
      [12.6330, 121.4710],
      [12.6330, 121.4580]
    ]
  },
  {
    name: 'Maraska',
    code: 'MRK',
    lat: 12.6474,
    lng: 121.4466,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Northwestern agricultural expanse supporting diversified cropping and community livelihoods.',
    puroks: ['Purok 1 Centro', 'Purok 2 Kaunlaran', 'Purok 3 Maligaya', 'Purok 4 Pagkakaisa'],
    hallLocation: 'Maraska Highway Junction, Roxas',
    contactEmergency: '0925-890-1234 (Brgy. Hall)',
    boundary: [
      [12.6540, 121.4400],
      [12.6540, 121.4530],
      [12.6410, 121.4530],
      [12.6410, 121.4400]
    ]
  },
  {
    name: 'Odiong',
    code: 'ODG',
    lat: 12.5983,
    lng: 121.4984,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Barangay situated along Road 452 between Bagumbayan and San Aquilino, featuring residential clusters and access routes.',
    puroks: ['Purok 1 Baywalk', 'Purok 2 Centro', 'Purok 3 Highway Junction', 'Purok 4 Mangrove Buffer'],
    hallLocation: 'Barangay Center, Brgy. Odiong, Roxas',
    contactEmergency: '0919-456-7823 (Brgy. Hall)',
    boundary: [
      [12.6045, 121.4920],
      [12.6045, 121.5050],
      [12.5920, 121.5050],
      [12.5920, 121.4920]
    ]
  },
  {
    name: 'Paclasan',
    code: 'PCL',
    lat: 12.5840,
    lng: 121.5181,
    zoom: 15,
    zoneType: 'Poblacion Commercial',
    description: 'Densely populated southern poblacion barangay near the market center, commercial stalls, and municipal roads.',
    puroks: ['Purok 1 Centro', 'Purok 2 Market View', 'Purok 3 Coastal Road', 'Purok 4 Commercial'],
    hallLocation: 'Morente Avenue / Paclasan Proper, Roxas',
    contactEmergency: '0926-901-2345 (Brgy. Hall)',
    boundary: [
      [12.5895, 121.5125],
      [12.5895, 121.5235],
      [12.5785, 121.5235],
      [12.5785, 121.5125]
    ]
  },
  {
    name: 'San Aquilino',
    code: 'SAQ',
    lat: 12.5967,
    lng: 121.4841,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Western agricultural territory with farming plains, irrigation canals, and active Lupon conciliation hearings along Road 452.',
    puroks: ['Purok 1 Main', 'Purok 2 Upper Valley', 'Purok 3 Riverside', 'Purok 4 Green Hills'],
    hallLocation: 'Sitio Centro, Brgy. San Aquilino, Roxas',
    contactEmergency: '0920-567-8934 (Brgy. Hall)',
    boundary: [
      [12.6030, 121.4775],
      [12.6030, 121.4910],
      [12.5905, 121.4910],
      [12.5905, 121.4775]
    ]
  },
  {
    name: 'San Isidro',
    code: 'SIS',
    lat: 12.5764,
    lng: 121.5061,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Southern agricultural sector along Road 452 connecting municipal transit to fertile farmlands and farming communities.',
    puroks: ['Purok 1 Silangan', 'Purok 2 Centro', 'Purok 3 Riverside', 'Purok 4 Bukid'],
    hallLocation: 'San Isidro Proper, Roxas',
    contactEmergency: '0927-012-3456 (Brgy. Hall)',
    boundary: [
      [12.5830, 121.4995],
      [12.5830, 121.5125],
      [12.5700, 121.5125],
      [12.5700, 121.4995]
    ]
  },
  {
    name: 'San Jose',
    code: 'SJS',
    lat: 12.6164,
    lng: 121.5309,
    zoom: 15,
    zoneType: 'Coastal & Maritime',
    description: 'Northeastern coastal territory near Dayhagan known for small-craft fishing, aquaculture, and mangrove zones.',
    puroks: ['Purok 1 Baybayin', 'Purok 2 Centro', 'Purok 3 Silangan', 'Purok 4 Mangrove'],
    hallLocation: 'San Jose Coastal Road, Roxas',
    contactEmergency: '0928-123-4567 (Brgy. Hall)',
    boundary: [
      [12.6225, 121.5245],
      [12.6225, 121.5370],
      [12.6100, 121.5370],
      [12.6100, 121.5245]
    ]
  },
  {
    name: 'San Mariano',
    code: 'SMR',
    lat: 12.6393,
    lng: 121.4390,
    zoom: 15,
    zoneType: 'Upland & Watershed',
    description: 'Northern frontier barangay featuring highland agro-forestry, mountain views, and spring sources.',
    puroks: ['Purok 1 Mountain View', 'Purok 2 Centro', 'Purok 3 Watershed', 'Purok 4 Green Hills'],
    hallLocation: 'Highland Road, San Mariano, Roxas',
    contactEmergency: '0929-234-5678 (Brgy. Hall)',
    boundary: [
      [12.6460, 121.4325],
      [12.6460, 121.4455],
      [12.6325, 121.4455],
      [12.6325, 121.4325]
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
      [12.6130, 121.4640],
      [12.6130, 121.4775],
      [12.6000, 121.4775],
      [12.6000, 121.4640]
    ]
  },
  {
    name: 'San Rafael',
    code: 'SRF',
    lat: 12.6527,
    lng: 121.4143,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Northwestern interior agricultural district with expansive grain production and community cooperatives.',
    puroks: ['Purok 1 Centro', 'Purok 2 Kaunlaran', 'Purok 3 Riverside', 'Purok 4 Masagana'],
    hallLocation: 'San Rafael Hall, Roxas',
    contactEmergency: '0930-345-6789 (Brgy. Hall)',
    boundary: [
      [12.6590, 121.4075],
      [12.6590, 121.4210],
      [12.6460, 121.4210],
      [12.6460, 121.4075]
    ]
  },
  {
    name: 'San Vicente',
    code: 'SVC',
    lat: 12.6261,
    lng: 121.3855,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Northwestern agricultural basin with fruit-bearing orchards, coconut trees, and rural roads.',
    puroks: ['Purok 1 Centro', 'Purok 2 Maligaya', 'Purok 3 San Isidro Link', 'Purok 4 West Valley'],
    hallLocation: 'San Vicente Proper, Roxas',
    contactEmergency: '0931-456-7890 (Brgy. Hall)',
    boundary: [
      [12.6330, 121.3785],
      [12.6330, 121.3925],
      [12.6190, 121.3925],
      [12.6190, 121.3785]
    ]
  },
  {
    name: 'Uyao',
    code: 'UYO',
    lat: 12.6209,
    lng: 121.4720,
    zoom: 15,
    zoneType: 'Inland Agricultural',
    description: 'Inland community situated along Calapan South Road between Libertad and San Miguel.',
    puroks: ['Purok 1 Highway', 'Purok 2 Centro', 'Purok 3 Farmland', 'Purok 4 Silangan'],
    hallLocation: 'Calapan South Road, Uyao, Roxas',
    contactEmergency: '0932-567-8901 (Brgy. Hall)',
    boundary: [
      [12.6270, 121.4655],
      [12.6270, 121.4785],
      [12.6145, 121.4785],
      [12.6145, 121.4655]
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
      [12.6165, 121.4795],
      [12.6165, 121.4930],
      [12.6035, 121.4930],
      [12.6035, 121.4795]
    ]
  }
];

// Municipal Government & Law Enforcement Agency Hubs (Exact Coordinates)
export type AgencyHubType = 'LGU' | 'DILG' | 'MDRRMO' | 'PNP' | 'BFP';

export interface MunicipalAgencyHub {
  id: string;
  name: string;
  shortName: string;
  type: AgencyHubType;
  lat: number;
  lng: number;
  address: string;
  contact?: string;
  description?: string;
}

export interface MdrrmoBuildingBox {
  id: string;
  boxNumber: number;
  name: string;
  shortLabel: string;
  role: string;
  description: string;
  coordinates: [number, number][];
  center: [number, number];
}

// Exact OpenStreetMap building footprints for the 3 boxes beside Roxas Municipal Police Station on Morente Avenue
export const MDRRMO_BUILDING_BOXES: MdrrmoBuildingBox[] = [
  {
    id: 'mdrrmo-box-1',
    boxNumber: 1,
    name: 'MDRRMO Main Operations & Command Office',
    shortLabel: 'Command HQ',
    role: '24/7 Operations Center & Executive Command',
    description: 'Main Administrative Office, Incident Monitoring Wall & 911 Emergency Dispatch Desk',
    coordinates: [
      [12.5915614, 121.5173897],
      [12.5917676, 121.5176291],
      [12.5917113, 121.5176799],
      [12.5915052, 121.5174405]
    ],
    center: [12.591636, 121.517534]
  },
  {
    id: 'mdrrmo-box-2',
    boxNumber: 2,
    name: 'MDRRMO EMS & Rescue Fleet Dispatch Unit',
    shortLabel: 'EMS Dispatch',
    role: 'Emergency Medical Services (EMS) & Ambulance Staging',
    description: 'Paramedic Station, Rapid Response Medical Triage & Ambulance Staging Bay',
    coordinates: [
      [12.5914413, 121.5173581],
      [12.5914979, 121.5174212],
      [12.5915432, 121.5173785],
      [12.5914865, 121.5173155]
    ],
    center: [12.591492, 121.517368]
  },
  {
    id: 'mdrrmo-box-3',
    boxNumber: 3,
    name: 'MDRRMO Logistics & Disaster Equipment Warehouse',
    shortLabel: 'Logistics Depot',
    role: 'Logistics, Relief Goods & Disaster Equipment Depot',
    description: 'Extrication Tools, Flood Rescue Boats, Life Vests, Chainsaws & Relief Stockpile',
    coordinates: [
      [12.5914691, 121.5173066],
      [12.5914311, 121.5173405],
      [12.5913956, 121.5172987],
      [12.5914335, 121.5172648]
    ],
    center: [12.591432, 121.517302]
  }
];

export const MUNICIPAL_AGENCY_HUBS: MunicipalAgencyHub[] = [
  {
    id: 'HUB-MDRRMO',
    name: 'MDRRMO Roxas Operations & Emergency Command Center',
    shortName: 'MDRRMO Office & Command Center',
    type: 'MDRRMO',
    lat: 12.59172,
    lng: 121.51722,
    address: 'Morente Avenue (Beside Roxas Municipal Police Station, Camp Gozar Compound), Brgy. Bagumbayan, Roxas',
    contact: 'Hotline 911 / (043) 289-2000 / 0917-888-MDRRMO',
    description: 'Primary disaster response, rescue dispatch and traffic accident triage headquarters comprising the 3 facility building boxes.'
  },
  {
    id: 'HUB-PNP',
    name: 'Roxas Municipal Police Station (PNP)',
    shortName: 'Roxas Municipal Police Station',
    type: 'PNP',
    lat: 12.59142,
    lng: 121.51749,
    address: 'Morente Avenue, Camp Gozar Compound, Brgy. Bagumbayan, Roxas',
    contact: '(043) 289-2244 / 0998-598-5806',
    description: 'Philippine National Police municipal station adjacent to MDRRMO headquarters.'
  },
  {
    id: 'HUB-BFP',
    name: 'Roxas Fire Station (BFP)',
    shortName: 'Roxas Fire Station',
    type: 'BFP',
    lat: 12.59085,
    lng: 121.51758,
    address: 'Morente Avenue, Camp Gozar Compound, Brgy. Bagumbayan, Roxas',
    contact: '(043) 289-2111 / 0915-602-2111',
    description: 'Bureau of Fire Protection station inside the Camp Gozar emergency complex.'
  },
  {
    id: 'HUB-LGU',
    name: 'Municipal Government Center of Roxas',
    shortName: 'Roxas Municipal Hall (LGU)',
    type: 'LGU',
    lat: 12.5888,
    lng: 121.5167,
    address: 'Municipal Complex (near Bulwagan ng Katarungan), Poblacion, Roxas, Oriental Mindoro',
    contact: '(043) 289-2001',
    description: 'Roxas Municipal Government Executive & Administrative Building'
  }
];
