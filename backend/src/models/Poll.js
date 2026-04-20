const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    options: [
      {
        text: {
          type: String,
          required: true,
        },
        voteCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetLocation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);