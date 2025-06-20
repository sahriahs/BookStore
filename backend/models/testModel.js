import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    testSting: {
      type: String,
      requared: true,
    },
    testNum: {
      type: Number,
      required: true,
    }

  },
  {
    timestamps: true, // ini biar otomatis ada craeteAt dan UpdateAt
  }
);


export const Test = mongoose.model('test', testSchema);