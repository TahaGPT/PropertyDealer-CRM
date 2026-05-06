import mongoose, { Schema } from 'mongoose';

const LeadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  propertyInterest: { type: String, required: true },
  budget: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED', 'LOST'], 
    default: 'NEW' 
  },
  notes: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  score: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
  followUpDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

LeadSchema.pre('save', function () {
  this.updatedAt = new Date();
  
  // Rule-based scoring
  if (this.budget > 20000000) {
    this.score = 'HIGH';
  } else if (this.budget >= 10000000) {
    this.score = 'MEDIUM';
  } else {
    this.score = 'LOW';
  }
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
