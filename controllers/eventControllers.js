const redis = require("../config/redis");
const eventModel = require("../models/eventModel");

async function postEvents(req, res) {
  //Implementation for posting events
  const eventObject = req.body;
  const { site_id, event_type, timestamp } = eventObject;

  if (!site_id || !event_type || !timestamp) {
    return res
      .status(400)
      .json({ error: "site_id, event_type, and timestamp are required" });
  }
  try {
    await redis.rpush("event_logs", JSON.stringify(eventObject));
    return res.status(202).json({ message: "Event recorded successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getStats(req, res) {
  // Implementation for getting stats
  const { site_id, date } = req.query;
  if (!site_id) {
    return res.status(400).json({ error: "site_id is required" });
  }
  const filter = { site_id };

  if (date) {
    const start = new Date(`${date}T00:00:00Z`);
    const end = new Date(`${date}T23:59:59Z`);
    filter.timestamp = { $gte: start, $lte: end };
  }

  try {
    const totalViewsResult = await eventModel.aggregate([
      { $match: filter },
      { $count: "totalViews" },
    ]);

    const total_views =
      totalViewsResult.length > 0 ? totalViewsResult[0].totalViews : 0;

    const uniqueVisitorsResult = await eventModel.aggregate([
      { $match: filter },
      {
        $group: { _id: null, uniqueUserList: { $addToSet: "$user_id" } },
      },
      { $project: { unique_users: { $size: "$uniqueUserList" } } },
    ]);

    const unique_users =
      uniqueVisitorsResult.length > 0
        ? uniqueVisitorsResult[0].unique_users
        : 0;

    const topPagesResult = await eventModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$path",
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          path: "$_id",
          views: 1,
        },
      },
    ]);

    return res.status(200).json({
      site_id,
      date: date || "all_time",
      total_views,
      unique_users,
      top_paths: topPagesResult,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  postEvents,
  getStats,
};
