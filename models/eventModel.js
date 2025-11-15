const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema( {
    site_id: {
      type: String,
      required: true,
      index: true,       
    },
    event_type: {
      type: String,
      required: true,
      enum: ["page_view", "click", "custom"],
    },
    path: {
      type: String,
      default: null,
      index: true,       
    },
    user_id: {
      type: String,
      default: null,
      index: true,       
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,       
    },
  },
  {
    timestamps: true,
  });

const eventModel = mongoose.model('Event', eventSchema);

module.exports = eventModel;