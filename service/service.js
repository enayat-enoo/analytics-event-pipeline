const redis = require("../config/redis");
const eventModel = require("../models/eventModel");

async function saveEvent() {
  console.log("Processing event data by worker thread");

  while (true) {
    try {
      const data = await redis.blpop("event_logs", 0);

      if (!data || !data[1]) {
        console.error("Received empty data from queue");
        continue;
      }

      let eventData;
      try {
        eventData = JSON.parse(data[1]);
      } catch (jsonErr) {
        console.error("Invalid JSON event data:", data[1]);
        continue; // Skip invalid event, continue loop
      }

      try {
        await eventModel.create(eventData);
        console.log("Event saved:", eventData);
      } catch (error) {
        console.error("Error saving event:", error);
      }
    } catch (redisError) {
      console.error("Redis BLPOP error:", redisError);
      console.log("Retrying in 3 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

saveEvent();

process.on("SIGINT", async () => {
  console.log("Shutting down worker thread...");
  try {
    await redis.quit();
  } catch (e) {}
  process.exit(0);
});
