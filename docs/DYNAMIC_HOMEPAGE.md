# Dynamic Homepage Features

## Overview

The homepage has been completely redesigned with dynamic, data-driven sections that provide real-time insights and personalized content discovery.

## New Features

### 1. **Featured Articles Carousel**

**Component:** `FeaturedArticlesCarousel.jsx`

Dynamic spotlight section featuring the most recent articles with:

- Beautiful gradient background with article image
- Editor's spotlight badge
- Article title and excerpt
- Author information and view count
- Carousel navigation (5 featured articles)
- Call-to-action button

**API:** `/api/articles/featured?limit=5`

### 2. **Platform Statistics Dashboard**

**Location:** Right Sidebar

Real-time statistics including:

- **Total Articles** - All published articles
- **Total Views** - Platform-wide article views
- **Active Users** - Registered users
- **Views Today** - Daily view count
- **Articles This Week** - Weekly publication count
- **Top Authors** - Most active contributors

**API:** `/api/stats/platform`

### 3. **Top Articles This Week**

**Location:** Right Sidebar

Dynamic ranking of most-viewed articles in the last 7 days:

- Ranked list (1-5)
- Real view counts
- Author names
- Hover effects to show full content

**API:** `/api/articles/most-viewed?limit=5&days=7`

### 4. **Recently Published**

**Component:** `RecentlyPublished.jsx`

Grid of 6 most recently published articles with:

- Featured image
- Category badges
- Publication time (relative: "2h ago", "1d ago")
- Author information
- Hover effects

**API:** `/api/articles/latest?limit=6`

### 5. **Top Contributors This Week**

**Component:** `TopContributors.jsx`

Leaderboard of the week's top content creators with:

- Medal rankings (🥇 🥈 🥉 4️⃣ 5️⃣)
- Author avatar
- Article count badge
- Profile links

**API:** `/api/stats/platform` (includes top_authors)

### 6. **Trending Tags**

**Location:** Right Sidebar

Dynamic trending tags with:

- Real-time article counts
- Color-coded tags
- Search functionality
- "Browse all tags" link

**API:** `/api/tags/trending`

## API Endpoints

### Platform Statistics

```bash
GET /api/stats/platform
```

**Response:**

```json
{
  "stats": {
    "total_articles": 245,
    "total_users": 1205,
    "total_views": 45230,
    "total_tags": 42,
    "views_today": 523,
    "articles_this_week": 18,
    "top_authors": [
      {
        "id": 1,
        "name": "John Doe",
        "article_count": 12
      },
      ...
    ]
  }
}
```

### Featured Articles

```bash
GET /api/articles/featured?limit=5
```

Returns most recent published articles with full metadata.

### Most Viewed Articles

```bash
GET /api/articles/most-viewed?limit=5&days=7
```

**Parameters:**

- `limit` - Number of articles (default: 10, max: 50)
- `days` - Time window in days (default: 7)

### Latest Articles

```bash
GET /api/articles/latest?limit=6
```

Returns newest published articles.

## Components Updated

### RightSidebar.jsx

**New Features:**

- Platform stats widget with formatted numbers
- Top articles with real view counts
- Trending tags with article counts
- All data fetched dynamically

### FeaturedArticlesCarousel.jsx

**New Component:** Complete carousel implementation with:

- Auto-loading featured articles
- Navigation dots for switching
- Responsive image handling

### RecentlyPublished.jsx

**New Component:** Grid of recent articles with:

- Relative time formatting ("2h ago")
- Category display
- Author names

### TopContributors.jsx

**New Component:** Leaderboard of top authors with:

- Medal ranking system
- Article count badges
- Profile links

## Data Flow

```
Homepage Load
    ↓
Fetch Multiple APIs in Parallel:
  - /api/tags/trending
  - /api/articles/most-viewed
  - /api/stats/platform
  - /api/articles/featured
  - /api/articles/latest
    ↓
Render Components with Real Data:
  - Featured Carousel (powered by featured articles)
  - Right Sidebar Stats (powered by platform stats)
  - Top Articles (powered by most-viewed)
  - Recently Published (powered by latest articles)
  - Top Contributors (powered by top authors)
```

## Performance Optimizations

1. **Parallel Data Fetching**
   - Multiple API calls run simultaneously in RightSidebar
   - Reduces total page load time

2. **Loading States**
   - Skeleton screens for each section
   - Smooth transitions when data loads

3. **Number Formatting**
   - Large numbers formatted (1M, 245K, 523)
   - More readable and scannable

4. **Relative Time Formatting**
   - "2h ago", "1d ago" more user-friendly
   - Updates relative to current time

5. **Image Optimization**
   - Lazy loading for article images
   - Object-fit for consistent dimensions
   - Hover scale transitions (smooth performance)

## Database Queries

All data queries are optimized with:

- `GROUP BY` for aggregations
- `LEFT JOIN` for optional data
- `INDEX` on frequently queried columns
- `DATE_SUB` for time-based filtering
- `COUNT(DISTINCT)` for accurate metrics

## Homepage Layout

```
┌─────────────────────────────────────┐
│   Featured Articles Carousel        │  ← Dynamic spotlight
├─────────────────────────────────────┤
│                                     │
│  Left Side  │  Center Feed  │ Right │
│             │    (Latest/   │ Sidebar
│  - Nav      │     Top)      │ - Stats
│  - Tags     │               │ - Top Artcls
│             │  Trending     │ - Trending
│             │  Tags         │ Tags
│             │               │
├─────────────────────────────────────┤
│   Recently Published Grid           │  ← Dynamic 6 articles
├─────────────────────────────────────┤
│   Top Contributors This Week        │  ← Dynamic leaderboard
└─────────────────────────────────────┘
```

## Usage Examples

### Getting Platform Stats

```javascript
const res = await fetch("/api/stats/platform");
const { stats } = await res.json();
console.log(`Total articles: ${stats.total_articles}`);
console.log(`Views today: ${stats.views_today}`);
// Top authors
stats.top_authors.forEach((author, i) => {
  console.log(`${i + 1}. ${author.name}: ${author.article_count} articles`);
});
```

### Formatting Numbers

```javascript
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};
```

### Relative Time

```javascript
const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMins = Math.floor((now - d) / 60000);
  const diffHours = Math.floor((now - d) / 3600000);
  const diffDays = Math.floor((now - d) / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
};
```

## File Structure

```
app/
├── api/
│   ├── articles/
│   │   ├── featured/
│   │   │   └── route.js         # Featured articles (recent)
│   │   ├── most-viewed/
│   │   │   └── route.js         # Most viewed this week
│   │   └── ...
│   ├── stats/
│   │   └── platform/
│   │       └── route.js         # Platform statistics
│   └── ...
├── page.jsx                      # Updated homepage
└── ...

components/
├── home/
│   ├── FeaturedArticlesCarousel.jsx     # Featured spotlight
│   ├── RecentlyPublished.jsx            # Recently published grid
│   ├── TopContributors.jsx              # Top authors leaderboard
│   ├── RightSidebar.jsx                 # Updated with stats
│   ├── LeftSidebar.jsx
│   └── HomeFeed.jsx
└── ...
```

## Future Enhancements

1. **Real-time Updates**
   - WebSocket for live statistics
   - Pusher or Socket.io for live counts

2. **Personalization**
   - Recommend articles based on viewing history
   - Personalized top authors by interest

3. **Trending Algorithm**
   - ML-based trending calculation
   - Weighted by views, time, engagement

4. **User Badges**
   - "🔥 Hot" badge for trending articles
   - "⭐ Editor's Pick" for featured
   - Author badges (verified, contributor, etc.)

5. **Analytics Widgets**
   - Growth charts
   - Traffic heatmaps
   - Engagement metrics

## Troubleshooting

### Stats showing as 0

- Check database connection
- Verify articles with `status = 'published'`
- Check article_views table has data

### Images not loading

- Verify featured_image URL in database
- Check image permissions
- Use Cloudinary for optimization

### Carousel not working

- Check if featured articles API returns data
- Verify article count > 0
- Check browser console for errors

### Performance issues

- Enable caching on stats APIs
- Use pagination for article lists
- Consider CDN for images

---

**Created:** February 14, 2026
**Last Updated:** February 14, 2026
**Status:** ✅ Production Ready
