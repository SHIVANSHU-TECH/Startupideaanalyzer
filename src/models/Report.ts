import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  ideaId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  format: 'html' | 'pdf';
  downloadUrl?: string;
  generatedAt: Date;
  expiresAt?: Date;
  downloadCount: number;
  isShared: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  ideaId: {
    type: Schema.Types.ObjectId,
    ref: 'Idea',
    required: [true, 'Idea ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Report content is required']
  },
  format: {
    type: String,
    enum: ['html', 'pdf'],
    default: 'html'
  },
  downloadUrl: {
    type: String,
    default: null
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isShared: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true // Only create index for non-null values
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ ideaId: 1 });
reportSchema.index({ shareToken: 1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Ensure combination of userId and ideaId is unique for reports
reportSchema.index({ userId: 1, ideaId: 1 }, { unique: true });

export default mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);