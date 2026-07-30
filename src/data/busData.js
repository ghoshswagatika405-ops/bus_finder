// Complete Dataset - 22 Location Stops (Forward & Reverse Return Route Support)

export const BUS_STOPS = [
  { id: 'stop_1', name: 'Baramunda BSABT', subtitle: 'Central Bus Terminal', lat: 20.2785, lng: 85.7892, walkTime: '2 min', seq: 1 },
  { id: 'stop_2', name: 'Khandagiri Bypass', subtitle: 'NH-16 Flyover Ramp', lat: 20.2680, lng: 85.7820, walkTime: '3 min', seq: 2 },
  { id: 'stop_3', name: 'Khandagiri Square', subtitle: 'Cave Circle Junction', lat: 20.2600, lng: 85.7780, walkTime: '4 min', seq: 3 },
  { id: 'stop_4', name: 'Kolathia', subtitle: 'Kolathia Main Road', lat: 20.2540, lng: 85.7730, walkTime: '3 min', seq: 4 },
  { id: 'stop_5', name: 'Aiginia 1', subtitle: 'Fruit Market Complex', lat: 20.2480, lng: 85.7680, walkTime: '4 min', seq: 5 },
  { id: 'stop_6', name: 'Tamando', subtitle: 'Tamando Overbridge', lat: 20.2410, lng: 85.7610, walkTime: '3 min', seq: 6 },
  { id: 'stop_7', name: 'Kalinga Vihar Square', subtitle: 'Kalinga Vihar Entrance', lat: 20.2370, lng: 85.7560, walkTime: '5 min', seq: 7 },
  { id: 'stop_8', name: 'K9', subtitle: 'K9 Sector Ring Road', lat: 20.2320, lng: 85.7510, walkTime: '4 min', seq: 8 },
  { id: 'stop_9', name: 'Patrapada 1', subtitle: 'Patrapada High School', lat: 20.2280, lng: 85.7460, walkTime: '3 min', seq: 9 },
  { id: 'stop_10', name: 'Alu Godam 1', subtitle: 'Commercial Warehouse Hub', lat: 20.2240, lng: 85.7420, walkTime: '4 min', seq: 10 },
  { id: 'stop_11', name: 'Janla Medical', subtitle: 'Janla Health Center', lat: 20.2200, lng: 85.7380, walkTime: '3 min', seq: 11 },
  { id: 'stop_12', name: 'Janla Post Office', subtitle: 'Janla Main Market', lat: 20.2160, lng: 85.7340, walkTime: '2 min', seq: 12 },
  { id: 'stop_13', name: 'Retang Road Square', subtitle: 'Retang Station Road', lat: 20.2120, lng: 85.7300, walkTime: '5 min', seq: 13 },
  { id: 'stop_14', name: 'Gohiria Square', subtitle: 'Infovalley Bypass Line', lat: 20.2080, lng: 85.7260, walkTime: '4 min', seq: 14 },
  { id: 'stop_15', name: 'Bijipur', subtitle: 'Bijipur Village Gate', lat: 20.2040, lng: 85.7220, walkTime: '6 min', seq: 15 },
  { id: 'stop_16', name: 'Gangapada Village', subtitle: 'Gangapada Rural Road', lat: 20.2000, lng: 85.7180, walkTime: '5 min', seq: 16 },
  { id: 'stop_17', name: 'Gangapada', subtitle: 'NH-16 Gangapada Toll Plaza', lat: 20.1960, lng: 85.7140, walkTime: '3 min', seq: 17 },
  { id: 'stop_18', name: 'Jatani Gate', subtitle: 'Jatani Link Road Crossing', lat: 20.1920, lng: 85.7100, walkTime: '4 min', seq: 18 },
  { id: 'stop_19', name: 'Bhuasuni Temple', subtitle: 'Bhuasuni Shrine Stop', lat: 20.1880, lng: 85.7060, walkTime: '5 min', seq: 19 },
  { id: 'stop_20', name: 'Ogalapada', subtitle: 'Ogalapada Industrial Area', lat: 20.1840, lng: 85.7020, walkTime: '4 min', seq: 20 },
  { id: 'stop_21', name: 'Pitapalli Square', subtitle: 'Puri-Khordha Bypass', lat: 20.1800, lng: 85.6980, walkTime: '3 min', seq: 21 },
  { id: 'stop_22', name: 'BEC (Bhubaneswar Engineering College)', subtitle: 'BEC Campus Terminal', lat: 20.1750, lng: 85.6920, walkTime: '2 min', seq: 22 }
];

export const REVERSE_BUS_STOPS = [...BUS_STOPS].reverse();

export const BUS_ROUTES = [
  {
    id: 'route_forward',
    number: '108',
    name: 'Baramunda ➔ BEC Campus (Forward Journey)',
    direction: 'FORWARD',
    roadName: 'NH-16 Forward (Baramunda ➔ Janla ➔ Gangapada ➔ BEC)',
    color: '#1A5CE5',
    distance: '26.8 km',
    duration: '50 mins',
    stops: BUS_STOPS.map((s) => s.name),
    pathCoordinates: BUS_STOPS.map((s) => [s.lat, s.lng])
  },
  {
    id: 'route_reverse',
    number: '108R',
    name: 'BEC Campus ➔ Baramunda (Reverse Return Journey)',
    direction: 'REVERSE',
    roadName: 'NH-16 Reverse Return (BEC ➔ Gangapada ➔ Janla ➔ Baramunda)',
    color: '#7C3AED',
    distance: '26.8 km',
    duration: '50 mins',
    stops: REVERSE_BUS_STOPS.map((s) => s.name),
    pathCoordinates: REVERSE_BUS_STOPS.map((s) => [s.lat, s.lng])
  }
];

export const BUSES_LIST = [
  {
    id: 'bus_bec_rider',
    number: '108',
    name: 'BEC Rider',
    direction: 'FORWARD',
    destination: 'To BEC Campus (Bhubaneswar Engineering College)',
    origin: 'Baramunda BSABT',
    time: '02:45 PM',
    isAC: false,
    routeId: 'route_forward',
    status: 'Driver Location OFF',
    speed: '0 km/h',
    driver: 'Manoj Das',
    vehicleNo: 'OD-02-BEC-1080',
    capacity: '58% Full',
    lat: 20.2785,
    lng: 85.7892,
    isLocationActive: false
  },
  {
    id: 'bus_koustuv_rider',
    number: '207',
    name: 'Koustuv Rider',
    direction: 'FORWARD',
    destination: 'To BEC Campus / Pitapalli Sq.',
    origin: 'Patia Square (KIIT)',
    time: '02:20 PM',
    isAC: false,
    routeId: 'route_forward',
    status: 'Driver Location OFF',
    speed: '0 km/h',
    driver: 'Rajesh Kumar',
    vehicleNo: 'OD-02-KST-2070',
    capacity: '42% Full',
    lat: 20.2480,
    lng: 85.7680,
    isLocationActive: false
  },
  {
    id: 'bus_aiims_rider',
    number: '305',
    name: 'AIIMS Rider',
    direction: 'REVERSE',
    destination: 'To Baramunda BSABT (Return Journey)',
    origin: 'BEC Campus (Pitapalli)',
    time: '03:15 PM',
    isAC: false,
    routeId: 'route_reverse',
    status: 'Driver Location OFF',
    speed: '0 km/h',
    driver: 'Ramesh Swain',
    vehicleNo: 'OD-02-AMS-3050',
    capacity: '75% Full',
    lat: 20.1750,
    lng: 85.6920,
    isLocationActive: false
  }
];

export const BUS_SCHEDULES = [
  {
    routeNumber: '108',
    name: 'BEC Rider (Forward: Baramunda ➔ BEC)',
    frequency: 'Every 15 mins',
    firstBus: '06:00 AM',
    lastBus: '10:00 PM',
    timings: ['06:00 AM', '07:15 AM', '08:45 AM', '11:00 AM', '01:15 PM', '02:45 PM', '05:00 PM', '07:15 PM', '09:30 PM']
  },
  {
    routeNumber: '108R',
    name: 'BEC Return (Reverse: BEC ➔ Baramunda)',
    frequency: 'Every 15 mins',
    firstBus: '06:30 AM',
    lastBus: '10:30 PM',
    timings: ['06:30 AM', '07:45 AM', '09:15 AM', '11:30 AM', '01:45 PM', '03:15 PM', '05:30 PM', '07:45 PM', '10:00 PM']
  }
];
