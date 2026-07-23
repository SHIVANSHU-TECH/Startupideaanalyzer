import mongoose, { Document, Schema } from 'mongoose';

export interface IResource extends Document {
    title: string;
    description: string;
    type: 'Guide' | 'Template' | 'Checklist' | 'Web Tool' | 'Calculator' | 'Spreadsheet' | 'Other';
    category: 'guides' | 'templates' | 'tools' | 'funding' | 'legal' | 'planning' | 'research' | 'finance' | 'other';
    fileUrl?: string; // For downloadable files
    linkUrl?: string; // For web tools
    fileType?: string; // PDF, PPTX, etc.
    size?: string;
    downloadCount: number;
    rating: number;
    author: string;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const resourceSchema = new Schema<IResource>({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    type: {
        type: String,
        required: true,
        enum: ['Guide', 'Template', 'Checklist', 'Web Tool', 'Calculator', 'Spreadsheet', 'Other']
    },
    category: {
        type: String,
        required: true,
        enum: ['guides', 'templates', 'tools', 'funding', 'legal', 'planning', 'research', 'finance', 'other']
    },
    fileUrl: {
        type: String,
        trim: true
    },
    linkUrl: {
        type: String,
        trim: true
    },
    fileType: String,
    size: String,
    downloadCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    author: {
        type: String,
        required: true
    },
    isPremium: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
resourceSchema.index({ category: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ isPremium: 1 });

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', resourceSchema);
