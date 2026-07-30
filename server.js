import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Bus from './backend/models/Bus.js';
import Stop from './backend/models/Stop.js';
import { BUS_STOPS, BUSES_LIST } from './src/data/busData.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bus_location_founder';

app.use(cors());
app.use(express.json());

// Helper to seed buses and 22 stops into MongoDB
async function seedDatabaseIfEmpty() {
  try {
    await Bus.deleteMany({});
    await Bus.insertMany(BUSES_LIST);
    console.log('MongoDB Seeded with Non-AC Buses (Koustuv Rider, BEC Rider, AIIMS Rider)!');

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

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Database: bus_location_founder');
    seedDatabaseIfEmpty();
  })
  .catch((err) => {
    console.warn('Local MongoDB offline. Running in-memory Express mode.');
  });

// --- API ENDPOINTS ---

// GET /api/stops - Fetch all 22 location stops from MongoDB
app.get('/api/stops', async (req, res) => {
  try {
    const stops = await Stop.find().sort({ sequenceNumber: 1 });
    if (!stops || stops.length === 0) {
      return res.json(BUS_STOPS);
    }
    return res.json(stops);
  } catch (err) {
    return res.json(BUS_STOPS);
  }
});

// GET /api/buses - Fetch all buses from MongoDB
app.get('/api/buses', async (req, res) => {
  try {
    const buses = await Bus.find();
    if (!buses || buses.length === 0) {
      return res.json(BUSES_LIST);
    }
    return res.json(buses);
  } catch (err) {
    return res.json(BUSES_LIST);
  }
});

// POST /api/buses/seed - Reset & Seed MongoDB with Non-AC Buses and 22 Location Stops
app.post('/api/buses/seed', async (req, res) => {
  try {
    await Bus.deleteMany({});
    await Stop.deleteMany({});

    const insertedBuses = await Bus.insertMany(BUSES_LIST);
    const formattedStops = BUS_STOPS.map((s, idx) => ({
      stopId: s.id,
      name: s.name,
      subtitle: s.subtitle,
      lat: s.lat,
      lng: s.lng,
      walkTime: s.walkTime,
      sequenceNumber: idx + 1
    }));
    const insertedStops = await Stop.insertMany(formattedStops);

    return res.json({
      message: `Database Reset & Seeded Successfully with ${insertedStops.length} stops and ${insertedBuses.length} Non-AC buses!`,
      buses: insertedBuses,
      stops: insertedStops
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/buses/:busId/location - Update live GPS location & address in MongoDB
app.put('/api/buses/:busId/location', async (req, res) => {
  try {
    const { busId } = req.params;
    const { lat, lng, speed, capacity, status, currentStopName } = req.body;

    const updated = await Bus.findOneAndUpdate(
      { busId },
      { lat, lng, speed, capacity, status, isAC: false, realAddress: currentStopName },
      { returnDocument: 'after', upsert: true }
    );
    return res.json({ message: 'Location saved to MongoDB', bus: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Bus Location Founder Express MongoDB Backend running on http://localhost:${PORT}`);
});
