const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const Parser = require('rss-parser');
const crypto = require('crypto');

const app = express();
app.use(express.json());

console.log('Environment check:');
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***SET***' : 'NOT SET');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'feeds',
  port: 5432,
});

const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  lazyConnect: true,
};
if (process.env.REDIS_PASSWORD) {
  console.log('Redis password configured from environment');
  redisConfig.password = process.env.REDIS_PASSWORD;
}
const redis = new Redis(redisConfig);

const parser = new Parser();

const HARVEST_INTERVAL = parseInt(process.env.HARVEST_INTERVAL || '60') * 1000;
const ALLOWED_STATUSES = (process.env.ALLOWED_STATUSES || 'green,yellow').split(',');

async function harvestFeeds() {
  console.log('Starting feed harvest cycle...');
  
  try {
    const statusList = ALLOWED_STATUSES.map(s => `'${s}'`).join(',');
    const query = `SELECT url, status FROM feeds WHERE status IN (${statusList})`;
    const result = await pool.query(query);
    
    console.log(`Found ${result.rows.length} feeds to harvest`);
    
    for (const feed of result.rows) {
      await harvestFeed(feed.url);
    }
  } catch (err) {
    console.error('Error in harvest cycle:', err);
  }
}

async function harvestFeed(url) {
  try {
    console.log(`Harvesting feed: ${url}`);
    const feed = await parser.parseURL(url);
    
    for (const item of feed.items) {
      const hash = crypto.createHash('md5')
        .update(item.link || item.guid || item.title)
        .digest('hex');
      
      const exists = await redis.exists(`article:${hash}`);
      if (exists) {
        continue;
      }
      
      await redis.setex(`article:${hash}`, 86400 * 7, '1');
      
      const article = {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content || '',
        source: url,
        hash: hash,
      };
      
      await redis.lpush('articles:queue', JSON.stringify(article));
      console.log(`Queued article: ${item.title}`);
    }
  } catch (err) {
    console.error(`Error harvesting feed ${url}:`, err.message);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'smart-harvester', health: "good" });
});

app.get('/stats', async (req, res) => {
  try {
    const queueLength = await redis.llen('articles:queue');
    const cacheKeys = await redis.keys('article:*');
    
    res.json({
      queue_length: queueLength,
      cached_articles: cacheKeys.length,
      harvest_interval: HARVEST_INTERVAL / 1000,
      allowed_statuses: ALLOWED_STATUSES,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/harvest', async (req, res) => {
  harvestFeeds().catch(console.error);
  res.json({ status: 'harvest started' });
});

async function init() {
  console.log('Smart Harvester initializing...');
  
  await pool.connect();
  console.log('Connected to PostgreSQL');
  
  await redis.connect();
  console.log('Connected to Redis');
  
  await redis.ping();
  console.log('Redis ping successful');
  
  setInterval(harvestFeeds, HARVEST_INTERVAL);
  harvestFeeds();
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Smart Harvester listening on port ${port}`);
  });
}

init().catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});
