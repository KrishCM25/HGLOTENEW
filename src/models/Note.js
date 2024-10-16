import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    dni: {
      type: Number,
      required: true,
    },
    mail: {
      type: String,
    },
    lote : {
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);

export default model("Note", schema);
