import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema(
  {
    stopId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subtitle: { type: String, default: 'NH-16 Highway Station' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    walkTime: { type: String, default: '3 min' },
    sequenceNumber: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Stop', stopSchema);
