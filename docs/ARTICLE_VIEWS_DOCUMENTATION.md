# Article Views Tracking System - Complete Documentation

## Overview

The article views tracking system counts unique views for each published article with intelligent deduplication. It works seamlessly for both authenticated and anonymous users.

## How It Works

### 1. **View Recording Flow**

```
User visits article page
  ↓
TrackViewClient component mounts (client-side)
  ↓
Client-side deduplication check (localStorage TTL)
  ↓
POST /api/public/articles/[slug]/view
  ↓
Server-side deduplication check
  ↓
Record view in article_views table
  ↓
Return view counts (total + today)
  ↓
ViewsBadge component displays count
```

### 2. **Deduplication Strategy**

The system uses a **multi-tier deduplication approach**:

#### Priority 1: **Authenticated Users** (Most Reliable)

- Check: One view per **article per authenticated user per day**
- Verification: User ID + article ID + timestamp >= CURDATE()
- Stored as: `is_authenticated = TRUE`

#### Priority 2: **IP-Based** (Medium Reliability)

- Check: One view per **article per IP per 24 hours**
- Verification: IP address + article ID + timestamp > NOW() - 24 HOURS
- Note: Works for users on same network; filtered by `is_authenticated = FALSE`

#### Priority 3: **User-Agent Based** (Low Reliability)

- Check: One view per **article per User-Agent per hour**
- Verification: User-Agent + article ID + timestamp > NOW() - 1 HOUR
- Use case: Fallback for users without IP (rare)

#### Priority 4: **Anonymous** (Least Reliable)

- No checking; every request records a view
- Use case: When no identifying information available (very rare)

### 3. **Client-Side Optimization**

`TrackViewClient.jsx` implements localStorage-based deduplication:

1. **Daily TTL (24 hours)**: Records view once per article per day
   - Key: `viewed_article_${slug}` stores timestamp
   - Prevents duplicate API calls within 24 hours

2. **Pending Flag**: Prevents race conditions between tabs
   - Key: `viewed_article_${slug}_pending` prevents concurrent requests
   - TTL: 60 seconds

3. **Recent Articles Tracking**: Stores last 25 read articles
   - Key: `recent_articles`
   - Used for user reading history

### 4. **View Counting Process**

When a view is recorded, it triggers:

```javascript
// 1. Find article (must exist and be published)
SELECT id FROM articles WHERE slug = ? AND status = 'published'

// 2a. If authenticated user: daily deduplication
INSERT ... WHERE NOT EXISTS (per-user-per-day view)

// 2b. If IP known: 24-hour deduplication
INSERT ... WHERE NOT EXISTS (per-ip per-24h view)

// 2c. If only UA: hourly deduplication
INSERT ... WHERE NOT EXISTS (per-ua per-hour view)

// 2d. If none: anonymous view
INSERT ... VALUES(...)

// 3. Get updated counts
SELECT COUNT(*) AS views_total FROM article_views WHERE article_id = ?
SELECT COUNT(*) AS views_today FROM article_views WHERE article_id = ? AND created_at >= CURDATE()
```

## Database Schema

### article_views Table

```sql
CREATE TABLE article_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT DEFAULT NULL,              -- Authenticated user ID
  ip VARCHAR(45) DEFAULT NULL,           -- IPv4 or IPv6 address
  user_agent VARCHAR(512) DEFAULT NULL,  -- Browser/device identifier
  is_authenticated BOOLEAN DEFAULT FALSE,-- True if user_id is set
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for common queries
  INDEX idx_article_id (article_id),
  INDEX idx_article_created (article_id, created_at),
  INDEX idx_article_user_created (article_id, user_id, created_at),
  INDEX idx_article_ip_created (article_id, ip, created_at),
  INDEX idx_article_ua_created (article_id, user_agent, created_at),

  -- Foreign key (optional but recommended)
  CONSTRAINT fk_article_views_article
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
```

## API Endpoints

### POST /api/public/articles/[slug]/view

**Purpose**: Record a new view and return updated counts

**Request**:

- Method: POST
- Body: Empty
- Cookies: Optional `auth_token` for authenticated users

**Response**:

```json
{
  "views": 1234,
  "views_today": 45
}
```

**Debug Mode** (`?debug=1`):

```json
{
  "views_total": 1234,
  "views_today": 45,
  "inserted": true,
  "info": {
    "userId": true,
    "ip": "yes",
    "ua": "yes"
  }
}
```

### GET /api/public/articles/[slug]

**Purpose**: Get article data including view count

**Response**:

```json
{
  "article": {
    "id": 1,
    "slug": "article-title",
    "title": "Article Title",
    "views": 1234,
    "author_name": "John Doe",
    ...
  },
  "trending": [
    { "id": 2, "title": "Trending Article", "views": 500, ... }
  ]
}
```

### GET /api/admin/metrics

**Purpose**: Admin dashboard metrics

**Response**:

```json
{
  "total_articles": 42,
  "published": 38,
  "views_today": 150,
  "views_7d": 1200,
  "views_total": 15000,
  "unique_user_views_7d": 300,
  "top_articles": [{ "id": 1, "title": "Top Article", "views": 500 }]
}
```

## Components

### TrackViewClient.jsx

- **Purpose**: Records article views when article page loads
- **Props**: `article` object with slug and title
- **Operation**:
  1. Check localStorage TTL
  2. If expired or missing, POST to view endpoint
  3. Also POSTs to `/api/auth/reads` if user is authenticated
  4. Updates TTL in localStorage
  5. Includes retry logic (up to 2 attempts)

### ViewsBadge.jsx

- **Purpose**: Displays current view count with eye icon
- **Props**: `slug`, `initial` (server-side initial count)
- **Operation**:
  1. Receives initial view count from server
  2. On mount, fetches latest count from GET endpoint
  3. Updates display with formatted number (e.g., "1.2K")

### ArticleHeader.jsx

- **Purpose**: Renders article metadata including views
- **Uses**: ViewsBadge component

## Performance Optimizations

### 1. **HTTP Caching**

The article GET endpoint returns:

```
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

- Cache for 1 hour (3600s)
- Serve stale version for up to 1 day while revalidating

### 2. **Database Indexes**

Multiple indexes on article_views for fast queries:

- `idx_article_id`: Basic article lookups
- `idx_article_created`: Time-range queries
- `idx_article_user_created`: User deduplication
- `idx_article_ip_created`: IP-based deduplication
- `idx_article_ua_created`: User-agent deduplication

### 3. **Query Optimization**

- Uses subqueries instead of joins for view counts
- Atomic INSERT...SELECT to prevent race conditions
- LIMIT clauses to prevent returning unnecessary data

### 4. **Client-Side Deduplication**

- localStorage prevents redundant API calls
- 24-hour TTL balances accuracy with performance
- Pending flag prevents concurrent requests

## Deployment & Setup

### 1. **Run Migrations**

```bash
# Create article_views table
mysql -u username -p database < db/migrations/2026-01-31-add-article-views.sql

# Improve indexes and add is_authenticated column
mysql -u username -p database < db/migrations/2026-02-14-improve-article-views.sql
```

### 2. **Verify Installation**

```bash
node scripts/verify-article-views.js
```

### 3. **Monitor Views**

Check admin dashboard: `/admin/dashboard` displays metrics

## Troubleshooting

### Views Not Being Recorded

1. **Check database connection**: Ensure `lib/db.js` pool is connected
2. **Check article status**: Article must be `published`
3. **Check browser console**: Look for errors in TrackViewClient
4. **Use debug mode**: Visit `/api/public/articles/[slug]/view?debug=1`

### Inaccurate View Counts

1. **IP spoofing**: Users behind same proxy appear as same IP
2. **Mobile networks**: Users switching networks appear as different IPs
3. **UA changes**: Browser updates change user-agent string
4. **Clock skew**: Server time differences affect deduplication

### Performance Issues

1. **Too many views**: Consider archiving old views to separate table
2. **Query timeouts**: Verify indexes are created (especially `idx_article_id`)
3. **Database connections**: Check `keepAliveInitialDelay` in `lib/db.js`

## Analytics Queries

### Most Viewed Articles (All Time)

```sql
SELECT a.title, COUNT(*) as views
FROM article_views av
JOIN articles a ON a.id = av.article_id
GROUP BY a.id
ORDER BY views DESC
LIMIT 10;
```

### Views by Hour

```sql
SELECT DATE(created_at) as date, HOUR(created_at) as hour, COUNT(*) as views
FROM article_views
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at), HOUR(created_at)
ORDER BY date DESC, hour DESC;
```

### Authenticated vs Anonymous Views

```sql
SELECT
  is_authenticated,
  COUNT(*) as views,
  COUNT(DISTINCT article_id) as articles
FROM article_views
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY is_authenticated;
```

### Trending Articles (Last 7 Days)

```sql
SELECT a.title, COUNT(*) as views_7d
FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE av.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY a.id
ORDER BY views_7d DESC
LIMIT 10;
```

## Future Enhancements

1. **Redis Caching**: Cache hot article view counts in Redis
2. **Analytics Dashboard**: Detailed view analytics by time, source, device
3. **Rate Limiting**: Prevent view spam on individual articles
4. **Geographic Data**: Store user location with view
5. **Referrer Tracking**: Track where users come from
6. **Read Time Analytics**: Combine with scroll tracking
7. **A/B Testing**: Track views for headline variants

## Files Modified

- `db/migrations/2026-01-31-add-article-views.sql` - Initial table creation
- `db/migrations/2026-02-14-improve-article-views.sql` - Indexes and constraints
- `lib/db.js` - Database connection with recovery
- `app/api/public/articles/[slug]/view/route.js` - View recording endpoint
- `app/api/public/articles/[slug]/route.js` - Article data with view counts
- `app/api/admin/metrics/route.js` - Analytics endpoint
- `components/article/TrackViewClient.jsx` - Client-side tracking
- `components/article/ViewsBadge.jsx` - View count display
- `components/article/ArticleHeader.jsx` - Uses ViewsBadge

## Support

For issues or questions, check:

1. Browser console for client-side errors
2. Server logs for API errors
3. Database for views table structure
4. Verify migrations were applied
