import mongoose, { Schema, Document } from "mongoose";

export interface IXScore extends Document {
  mint: string;
  xScore: number;
  timestamp: Date;
}

const XScoreSchema: Schema = new Schema({
  mint: { type: String, required: true, unique: true },
  xScore: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IXScore>("XScore", XScoreSchema);
