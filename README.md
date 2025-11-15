# Web Analytics Event Pipeline
This project is a simple (but still practical) backend setup that collects web analytics events and then processes them in background using **Redis** and **MongoDB**.

The main idea was to keep the ingestion fast, and then let another worker handle the heavy saving and stats part.

## Architecture Decision (Why I used Async Queue)
As a first step I decided to implement the system in asynchronous way.
The basic flow looks like:
```
 Client → POST /event → Redis Queue → Worker → MongoDB → GET /stats
```
### Why asynchronous?
 - If I save events directly into MongoDB, the API becomes slow whenever traffic increases.
 - Redis list is very fast, so API returns quickly without waiting for database.
 - Processor worker can run seperately and read events using BLPOP one-by-one and store into DB.
 - This also means systems are separated:
ingestion part, processing part, and reporting part dont affect each other.

I found this architecture is commonly used in real analytics platforms too.

---
## Database Schema
I used one MongoDB collection called events.
Each event stored has these fields:
```
events
 ├── site_id: string
 ├── event_type: string
 ├── path: string
 ├── user_id: string
 └── timestamp: ISODate
```
There are also createdAt and updatedAt fields which Mongoose adds automatically.

Indexes can be added later on site_id, timestamp, etc, to make stats faster.

---

## Setup  Instructions
Below are the steps that should be follow to run the system completely.
**step 1**: Start Redis Server
if using docker:
```
docker run -d --name redis -p 6379:6379 redis
```
Or if installed locally, just run:
```
redis-server
```
**step 2**: Start MongoDB Server
if using docker:
```
docker run -d --name mongo -p 27017:27017 mongo
```
Or if installed locally, just run:
```
mongod
```
**step 3**: Install Dependencies
```
npm install
```
**step 4**: Start Server
```
npm start
```
**step 5**: Start the Worker thread
```
cd /service/
node service.js
```

## API Usage (curl commands to test)
```
curl -X POST http://localhost:3000/api/event \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "my-site",
    "event_type": "page_view",
    "path": "/home",
    "user_id": "user123",
    "timestamp": "2025-11-12T10:00:00Z"
  }'
```

### GET /stats — fetch analytics
All time:
```
curl "http://localhost:3000/api/stats?site_id=my-site"
```
With date : 
```
curl "http://localhost:3000/api/stats?site_id=my-site&date=2025-11-12"
```
### Example Output
```
{
  "site_id": "my-site",
  "date": "all_time",
  "total_views": 3,
  "unique_users": 2,
  "top_paths": [
    { "path": "/pricing", "views": 2 },
    { "path": "/home", "views": 1 }
  ]
}
```