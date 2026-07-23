import mongoose, { Document, Schema } from 'mongoose';

export interface IIdea extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed';
  analysis?: {
    successScore: number;
    marketAnalysis: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    recommendations: string[];
    financialProjections?: {
      breakEvenAnalysis: any;
      revenueProjection: string;
      costEstimate: string;
      breakEvenTime: string;
      fundingRequirement: string;
    };
    competitorAnalysis?: {
      mainCompetitors: string[];
      competitiveAdvantage: string;
      marketPosition: string;
    };
    targetAudience?: {
      primaryAudience: string;
      secondaryAudience: string;
      marketSize: string;
    };
    generatedAt: Date;
  };
  tags?: string[];
  isPublic: boolean;
  likes?: number;
  views?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ideaSchema = new Schema<IIdea>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Idea title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Idea description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce',
      'Entertainment', 'Food & Beverage', 'Travel', 'Real Estate', 'Sports',
      'Fashion', 'Environment', 'Social Impact', 'B2B Services', 'Other'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'analyzed', 'failed'],
    default: 'pending'
  },
  analysis: {
    successScore: {
      type: Number,
      min: 0,
      max: 100
    },
    marketAnalysis: {
      type: String,
      maxlength: 3000
    },
    swot: {
      strengths: [{
        type: String,
        maxlength: 500
      }],
      weaknesses: [{
        type: String,
        maxlength: 500
      }],
      opportunities: [{
        type: String,
        maxlength: 500
      }],
      threats: [{
        type: String,
        maxlength: 500
      }]
    },
    recommendations: [{
      type: String,
      maxlength: 1000
    }],
    financialProjections: {
      revenueProjection: {
        type: String,
        maxlength: 1000
      },
      costEstimate: {
        type: String,
        maxlength: 1000
      },
      breakEvenTime: {
        type: String,
        maxlength: 500
      },
      fundingRequirement: {
        type: String,
        maxlength: 1000
      }
    },
    competitorAnalysis: {
      mainCompetitors: [{
        type: String,
        maxlength: 200
      }],
      competitiveAdvantage: {
        type: String,
        maxlength: 1000
      },
      marketPosition: {
        type: String,
        maxlength: 1000
      }
    },
    targetAudience: {
      primaryAudience: {
        type: String,
        maxlength: 500
      },
      secondaryAudience: {
        type: String,
        maxlength: 500
      },
      marketSize: {
        type: String,
        maxlength: 500
      }
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ideaSchema.index({ userId: 1, createdAt: -1 });
ideaSchema.index({ category: 1 });
ideaSchema.index({ status: 1 });
ideaSchema.index({ isPublic: 1, likes: -1 });
ideaSchema.index({ tags: 1 });
ideaSchema.index({ 'analysis.successScore': -1 });

// Text search index
ideaSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

export default mongoose.models.Idea || mongoose.model<IIdea>('Idea', ideaSchema);