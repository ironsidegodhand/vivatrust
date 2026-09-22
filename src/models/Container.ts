import mongoose, { Document, Schema } from 'mongoose';

export interface IContainer extends Document {
  name: string;
  price: number;
  type: string;
  capacity: string;
  image: string;
  transitTime: string;
  includes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContainerSchema = new Schema<IContainer>({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  type: { type: String, required: true, trim: true },
  capacity: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  transitTime: { type: String, required: true, trim: true },
  includes: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.models.Container || mongoose.model<IContainer>('Container', ContainerSchema);
