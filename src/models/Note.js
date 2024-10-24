import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    dni: {
      type: String,
      required: true,
    },
    celular: {
      type: String,
    },
    lote : {
      type: String,
    },
    nombre : {
      type: String,
    },
    regalo : {
      type: String,
    },
    pago : {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export default model("Note", schema);
