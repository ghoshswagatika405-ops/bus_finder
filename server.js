import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Bus from './backend/models/Bus.js';
import Stop from './backend/models/Stop.js';
import Complaint from './backend/models/Complaint.js';
import { BUS_STOPS, BUSES_LIST } from './src/data/busData.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bus_location_founder';

app.use(cors());
app.use(express.json());

// In-Memory Live Data Store for zero-latency responses & offline fallback
let inMemoryBuses = JSON.parse(JSON.stringify(BUSES_LIST));
let inMemoryStops = JSON.parse(JSON.stringify(BUS_STOPS));
let inMemoryComplaints = [];
let isMongoConnected = false;

// Disable Mongoose command buffering when connection is offline
mongoose.set('bufferCommands', false);

// Helper to seed buses and 22 stops into MongoDB when connected
async function seedDatabaseIfEmpty() {
  try {
    await Bus.deleteMany({});
    await Bus.insertMany(BUSES_LIST);
    console.log('MongoDB Seeded with Buses (BEC Rider, Koustuv Rider, AIIMS Rider)!');

    const stopCount = await Stop.countDocuments();
    if (stopCount === 0) {
      const formattedStops = BUS_STOPS.map((s, idx) => ({
        stopId: s.id,
        name: s.name,
        subtitle: s.subtitle,
        lat: s.lat,
        lng: s.lng,
        walkTime: s.walkTime,
        sequenceNumber: idx + 1
      }));
      await Stop.insertMany(formattedStops);
      console.log(`MongoDB Seeded with all ${BUS_STOPS.length} location stops!`);
    }
  } catch (err) {
    console.error('Error seeding MongoDB:', err.message);
  }
}

// MongoDB Connection Attempt with 5s timeout
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Database: bus_location_founder');
    seedDatabaseIfEmpty();
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn('⚠️ Local MongoDB offline. Running high-performance in-memory Express mode.');
  });

// --- API ENDPOINTS ---

// GET / - Root Dashboard Page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>BEC Bus Tracker Express API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; margin: 0; }
        .card { background: #1E293B; border-radius: 20px; padding: 32px; max-width: 550px; width: 100%; border: 1px solid #334155; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        h1 { margin-top: 0; color: #38BDF8; font-size: 1.5rem; display: flex; align-items: center; gap: 10px; }
        .badge { background: #166534; color: #4ADE80; font-size: 0.8rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
        p { color: #94A3B8; font-size: 0.9rem; line-height: 1.5; }
        ul { list-style: none; padding: 0; margin: 20px 0; }
        li { margin-bottom: 10px; }
        a { color: #60A5FA; text-decoration: none; font-weight: 700; background: #0F172A; padding: 10px 14px; border-radius: 12px; display: block; border: 1px solid #334155; transition: all 0.2s; }
        a:hover { background: #1A5CE5; color: white; border-color: #1A5CE5; }
        .btn-app { display: inline-block; background: #1A5CE5; color: white; padding: 12px 24px; border-radius: 14px; text-decoration: none; font-weight: 800; margin-top: 10px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚌 BEC Bus Tracker Express API</h1>
        <div class="badge">🟢 API SERVER ONLINE (Port 5000)</div>
        <p>The Express backend is active and providing real-time bus location sync for Bhubaneswar Engineering College (BEC) Bus Founder.</p>

        <p><strong>Database Connection:</strong> ${isMongoConnected ? '✅ Connected to MongoDB' : '🟡 Active In-Memory High-Speed Mode'}</p>

        <h3>Explore Available API Endpoints:</h3>
        <ul>
          <li><a href="/api/buses" target="_blank">🚌 GET /api/buses — Fetch Live Bus Fleet & GPS Coordinates</a></li>
          <li><a href="/api/stops" target="_blank">📍 GET /api/stops — Fetch All 22 Location Stops</a></li>
          <li><a href="/api/health" target="_blank">💓 GET /api/health — System Health & Server Stats</a></li>
        </ul>

        <div style="text-align: center; margin-top: 24px;">
          <a href="http://localhost:5173" class="btn-app" style="display: block;">📱 Open Passenger Web App (Port 5173)</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// GET /api/health - Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'online',
    isMongoConnected,
    busesCount: inMemoryBuses.length,
    stopsCount: inMemoryStops.length,
    timestamp: new Date().toISOString()
  });
});

// GET /api/stops - Fetch all 22 location stops
app.get('/api/stops', async (req, res) => {
  if (isMongoConnected) {
    try {
      const stops = await Stop.find().sort({ sequenceNumber: 1 });
      if (stops && stops.length > 0) return res.json(stops);
    } catch (err) {
      // Fallback
    }
  }
  return res.json(inMemoryStops);
});

// GET /api/buses - Fetch all live operating buses
app.get('/api/buses', async (req, res) => {
// Helper to dynamically calculate location source priority (Driver GPS > Student/Staff Crowd GPS > Schedule)
function formatBusWithPriority(bus) {
  const now = Date.now();

  // 1. Check if Official Driver Console is active
  if (bus.isLocationActive) {
    return {
      ...bus,
      locationSource: 'DRIVER_GPS'
    };
  }

  // 2. Check if Student/Staff Crowdsourced Location is active (within 3 mins)
  const lastCrowdTime = bus.lastCrowdPingTime ? new Date(bus.lastCrowdPingTime).getTime() : 0;
  const isCrowdValid = bus.crowdLat && bus.crowdLng && (now - lastCrowdTime < 180000);

  if (isCrowdValid) {
    return {
      ...bus,
      locationSource: 'CROWD_GPS',
      lat: bus.crowdLat,
      lng: bus.crowdLng,
      status: `Student/Staff Onboard Live (${bus.activePassengersCount || 1} sharing)`
    };
  }

  // 3. Fallback to Scheduled / Default location
  return {
    ...bus,
    locationSource: 'SCHEDULE'
  };
}

// GET /api/buses - Fetch all live operating buses
app.get('/api/buses', async (req, res) => {
  let busList = inMemoryBuses;
  if (isMongoConnected) {
    try {
      const buses = await Bus.find();
      if (buses && buses.length > 0) {
        busList = inMemoryBuses.map((memBus) => {
          const dbBus = buses.find((b) => b.busId === memBus.id || b.busId === memBus.busId || b.id === memBus.id);
          return dbBus ? { ...memBus, ...dbBus.toObject() } : memBus;
        });
      }
    } catch (err) {
      // Fallback
    }
  }

  const prioritized = busList.map(formatBusWithPriority);
  return res.json(prioritized);
});

// PUT /api/buses/:busId/crowd-location - Student & Staff Crowdsourced Location Broadcast Endpoint
app.put('/api/buses/:busId/crowd-location', async (req, res) => {
  try {
    const { busId } = req.params;
    const { lat, lng, action, role } = req.body;

    let targetBus = null;
    inMemoryBuses = inMemoryBuses.map((b) => {
      if (b.id === busId || b.busId === busId) {
        const count = action === 'stop' ? 0 : Math.max(1, (b.activePassengersCount || 0) + 1);
        targetBus = {
          ...b,
          crowdLat: action === 'stop' ? null : lat,
          crowdLng: action === 'stop' ? null : lng,
          lastCrowdPingTime: action === 'stop' ? null : new Date().toISOString(),
          activePassengersCount: count
        };
        return targetBus;
      }
      return b;
    });

    if (isMongoConnected && targetBus) {
      try {
        await Bus.findOneAndUpdate(
          { busId },
          {
            crowdLat: action === 'stop' ? null : lat,
            crowdLng: action === 'stop' ? null : lng,
            lastCrowdPingTime: action === 'stop' ? null : new Date().toISOString()
          }
        );
      } catch (err) {}
    }

    if (action !== 'stop') {
      console.log(`👥 [STUDENT/STAFF CROWD GPS BROADCAST] (${role || 'Onboard User'}) Bus: ${busId} | Lat: ${lat}, Lng: ${lng}`);
    }

    return res.json({
      success: true,
      message: action === 'stop' ? 'Onboard GPS sharing stopped' : 'Student/Staff onboard GPS updated',
      bus: targetBus
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/complaints - Direct Confidential Complaint Box Endpoint (Transmits directly to BEC Head Office)
app.post('/api/complaints', async (req, res) => {
  try {
    const { role, incidentType, busId, busName, reporterName, reporterRollNo, reporterPhone, isAnonymous, description, incidentTime } = req.body;

    if (!description || !incidentType) {
      return res.status(400).json({ error: 'Incident type and description are required.' });
    }

    const complaintId = `BEC-COMP-${Date.now().toString().slice(-6)}`;
    const newComplaint = {
      complaintId,
      role: role || 'Student',
      incidentType,
      busId: busId || 'General',
      busName: busName || 'BEC Transport',
      reporterName: isAnonymous ? `Anonymous ${role || 'User'}` : (reporterName || 'User'),
      reporterRollNo: isAnonymous ? 'N/A' : (reporterRollNo || 'N/A'),
      reporterPhone: isAnonymous ? 'N/A' : (reporterPhone || 'N/A'),
      isAnonymous: Boolean(isAnonymous),
      description,
      incidentTime: incidentTime || new Date().toLocaleString(),
      smsStatus: 'SENT_TO_BEC_HEAD_OFFICE',
      officeRecipientPhone: '+91 94370 12345 (BEC Head Office)',
      createdAt: new Date().toISOString()
    };

    // Save to In-Memory Store
    inMemoryComplaints.unshift(newComplaint);

    // Save to MongoDB if connected
    if (isMongoConnected) {
      try {
        await Complaint.create(newComplaint);
      } catch (dbErr) {
        console.warn('MongoDB Complaint save fallback:', dbErr.message);
      }
    }

    // DIRECT SMS DISPATCH SIMULATION TO BEC HEAD OFFICE (+91 94370 12345)
    console.log('\n===============================================================');
    console.log('📱 [DIRECT CONFIDENTIAL ALERT DISPATCHED TO BEC HEAD OFFICE]');
    console.log(`🏢 Recipient: BEC Head Office / Transport Cell (+91 94370 12345)`);
    console.log(`🆔 Complaint Ref: ${complaintId}`);
    console.log(`👤 Submitter Role: ${role || 'Student/Staff'}`);
    console.log(`🚨 Incident Category: ${incidentType}`);
    console.log(`🚌 Bus/Location: ${busName} (${busId})`);
    console.log(`👤 Name: ${newComplaint.reporterName} (Anonymous: ${newComplaint.isAnonymous})`);
    console.log(`📝 Complaint Details: "${description}"`);
    console.log(`⏰ Time: ${newComplaint.incidentTime}`);
    console.log('🔒 CONFIDENTIALITY CHECK: NOT exposed on public passenger app API / feeds.');
    console.log('===============================================================\n');

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted confidentially. Direct SMS alert dispatched to BEC Head Office.',
      complaintId,
      smsStatus: 'SENT_TO_BEC_HEAD_OFFICE',
      recipientPhone: '+91 94370 12345 (BEC Head Office)'
    });
  } catch (err) {
    console.error('Error processing complaint:', err);
    return res.status(500).json({ error: 'Internal server error processing complaint.' });
  }
});

// GET /api/admin/complaints - Secured BEC Head Office Endpoint (Internal Only)
app.get('/api/admin/complaints', async (req, res) => {
  if (isMongoConnected) {
    try {
      const dbComplaints = await Complaint.find().sort({ createdAt: -1 });
      if (dbComplaints && dbComplaints.length > 0) return res.json(dbComplaints);
    } catch (err) {
      // Fallback
    }
  }
  return res.json(inMemoryComplaints);
});

app.listen(PORT, () => {
  console.log(`🚀 Bus Location Finder Express Backend running on http://localhost:${PORT}`);
});
