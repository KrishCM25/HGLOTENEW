import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    dni: {
      type: String,
      required: true,
    },
    mail: {
      type: String,
    },
    lote : {
      type: String,
    },
    nombre : {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export default model("Note", schema);
