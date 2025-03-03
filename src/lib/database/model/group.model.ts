import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGroup {
  _id: string;
  group_id: number; // Use snake_case here
  name: string;
  currency_code: string;
  price_id: string;
  revenue: number;
  price: number;
  owner: string | mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Mongoose's Document and override _id type
interface GroupModel extends Omit<IGroup, "_id">, Document {
  _id: string;
}

const groupSchema: Schema<GroupModel> = new Schema(
  {
    group_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price_id: { type: String },
    revenue: { type: Number, required: true, default: 0 },
    currency_code: { type: String, default: "USD", required: true },
    price: { type: Number, required: true, default: 0 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Group: Model<GroupModel> =
  mongoose.models.Group || mongoose.model<GroupModel>("Group", groupSchema);
