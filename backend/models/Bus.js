import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busId: { type: String, required: true, unique: true },
    number: { type: String, required: true },
    name: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    time: { type: String, default: '02:30 PM' },
    isAC: { type: Boolean, default: true },
    routeId: { type: String, default: 'route_patia_pitapalli' },
    status: { type: String, default: 'On Time' },
    speed: { type: String, default: '40 km/h' },
    driver: { type: String, required: true },
    vehicleNo: { type: String, required: true },
    capacity: { type: String, default: '45% Full' },
    crowdLevel: { type: String, default: 'Medium' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    realAddress: { type: String, default: 'Patia to Pitapalli Highway, Bhubaneswar' },

    // Student & Staff Crowdsourced GPS Fields
    crowdLat: { type: Number, default: null },
    crowdLng: { type: Number, default: null },
    lastCrowdPingTime: { type: String, default: null },
    activePassengersCount: { type: Number, default: 0 },
    locationSource: { type: String, default: 'SCHEDULE' } // 'DRIVER_GPS', 'CROWD_GPS', 'SCHEDULE'
  },
  { timestamps: true }
);

export default mongoose.model('Bus', busSchema);
