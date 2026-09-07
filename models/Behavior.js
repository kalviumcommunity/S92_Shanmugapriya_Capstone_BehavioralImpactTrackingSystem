const mongoose = require("mongoose");

const behaviorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    behaviorType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    impactScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    attachment: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Behavior", behaviorSchema);