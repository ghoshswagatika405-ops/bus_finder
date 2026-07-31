import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    role: { type: String, default: 'Student' }, // 'Student', 'Faculty/Staff', 'Passenger'
    incidentType: { type: String, required: true },
    busId: { type: String, default: 'General' },
    busName: { type: String, default: 'BEC Transport' },
    reporterName: { type: String, default: 'Anonymous Student/Staff' },
    reporterRollNo: { type: String, default: 'N/A' },
    reporterPhone: { type: String, default: 'N/A' },
    isAnonymous: { type: Boolean, default: true },
    description: { type: String, required: true },
    smsStatus: { type: String, default: 'SENT_TO_BEC_HEAD_OFFICE' },
    officeRecipientPhone: { type: String, default: '+91 94370 12345' },
    incidentTime: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Complaint', complaintSchema);
