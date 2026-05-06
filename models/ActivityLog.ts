import mongoose, { Schema } from 'mongoose';

const ActivityLogSchema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'CREATED', 'STATUS_UPDATED', 'ASSIGNED', 'NOTE_ADDED'
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
