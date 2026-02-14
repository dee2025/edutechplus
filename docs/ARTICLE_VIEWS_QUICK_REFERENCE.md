# Article Views Tracking - Quick Reference Card

## 🚀 Quick Start (5 mins)

```bash
# 1. Apply migrations
mysql -u user -p database < db/migrations/2026-01-31-add-article-views.sql
mysql -u user -p database < db/migrations/2026-02-14-improve-article-views.sql

# 2. Verify setup
node scripts/verify-article-views.js

# 3. Test it
Visit: http://localhost:3000/your-article-slug
Monitor: /admin/metrics
```

## 📊 How It Works

| Step | Component       | Action                        |
| ---- | --------------- | ----------------------------- |
| 1    | User            | Visits article                |
| 2    | TrackViewClient | Checks localStorage TTL       |
| 3    | API             | `POST /view` with dedup check |
| 4    | Database        | Inserts if not duplicate      |
| 5    | ViewsBadge      | Displays updated count        |

## 🎯 Deduplication Priority

```
Tier 1: Authenticated User ID (24h TTL)      ⭐⭐⭐⭐⭐
Tier 2: IP Address (24h TTL)                 ⭐⭐⭐⭐
Tier 3: User-Agent (1h TTL)                  ⭐⭐⭐
Tier 4: Anonymous (no TTL)                   ⭐
```

## 🔌 API Endpoints

### Record View

```
POST /api/public/articles/[slug]/view

Response:
{
  "views": 1234,
  "views_today": 45
}

Debug:
GET /api/public/articles/[slug]/view?debug=1
```

### Get Article

```
GET /api/public/articles/[slug]

Response includes:
- article.views
- trending[].views
```

### Admin Metrics

```
GET /api/admin/metrics

Response:
{
  "views_today": 150,
  "views_7d": 1200,
  "views_total": 15000,
  "top_articles": [...]
}
```

## 📁 Key Files

| File                                           | Purpose                        |
| ---------------------------------------------- | ------------------------------ |
| `lib/db.js`                                    | Database connection + recovery |
| `app/api/public/articles/[slug]/view/route.js` | View recording API             |
| `app/api/public/articles/[slug]/route.js`      | Article + views data           |
| `components/article/TrackViewClient.jsx`       | Client-side tracking           |
| `components/article/ViewsBadge.jsx`            | View count display             |
| `db/migrations/...`                            | Database setup                 |

## ✅ Verification Checklist

```sql
-- Check table exists
SELECT COUNT(*) FROM article_views;

-- Check latest views
SELECT * FROM article_views ORDER BY created_at DESC LIMIT 5;

-- Check today's count
SELECT COUNT(*) as today_views FROM article_views
WHERE created_at >= CURDATE();

-- Check article views
SELECT a.title, COUNT(*) as views
FROM article_views av
JOIN articles a ON a.id = av.article_id
GROUP BY a.id
ORDER BY views DESC;
```

## 🐛 Troubleshooting

| Issue             | Check             | Fix                     |
| ----------------- | ----------------- | ----------------------- |
| No views recorded | DB connected?     | Check docker logs       |
| Views stuck       | Client-side error | Open DevTools → Console |
| Inflated counts   | Dedup working?    | Check IP/UA diversity   |
| Performance slow  | Indexes?          | Run migration 2         |
| Queries failing   | Connection pool?  | Check `lib/db.js`       |

## 📈 Common Queries

```sql
-- Today's views
SELECT COUNT(*) FROM article_views WHERE created_at >= CURDATE();

-- Per article
SELECT a.title, COUNT(*) FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE av.created_at >= CURDATE()
GROUP BY a.id ORDER BY COUNT(*) DESC;

-- Auth vs anon
SELECT is_authenticated, COUNT(*) FROM article_views
WHERE created_at >= CURDATE() GROUP BY is_authenticated;

-- Trending (7 days)
SELECT a.title, COUNT(*) FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE av.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY a.id ORDER BY COUNT(*) DESC LIMIT 10;
```

## 🛠️ Configuration

### Authentication

- Views tracked for logged-in users via `auth_token` cookie
- Set in `TrackViewClient.jsx`

### Deduplication TTL

- Authenticated: 24 hours (`CURDATE()` check)
- IP-based: 24 hours (`DATE_SUB(NOW(), INTERVAL 24 HOUR)`)
- UA-based: 1 hour (`DATE_SUB(NOW(), INTERVAL 1 HOUR)`)
- Client-side: 24 hours (localStorage)

### Caching

- Article page: 1-hour cache, 1-day stale
- Set in `app/api/public/articles/[slug]/route.js`

## 📊 Database Schema

```
article_views {
  id (PK)
  article_id (FK) → articles.id
  user_id (nullable) → users
  ip (nullable)
  user_agent (nullable)
  is_authenticated (boolean)
  created_at (timestamp)

  Indexes:
  - article_id
  - (article_id, created_at)
  - (article_id, user_id, created_at)
  - (article_id, ip, created_at)
  - (article_id, user_agent, created_at)
}
```

## 🔒 Security

- ✅ Foreign key prevents orphaned records
- ✅ Cascading delete cleans up on article delete
- ✅ Atomic INSERT prevents race conditions
- ✅ Input validation on article slug
- ✅ Auth token verified server-side
- ✅ No personal data stored

## 📚 Documentation Files

1. **ARTICLE_VIEWS_DOCUMENTATION.md** - Full technical guide
2. **ARTICLE_VIEWS_SETUP.md** - Quick start & troubleshooting
3. **ARTICLE_VIEWS_ANALYTICS_QUERIES.sql** - 26 pre-built queries
4. **ARTICLE_VIEWS_AUDIT_SUMMARY.md** - Complete audit report

## 🚨 Common Errors

### "Can't add new command when connection is in closed state"

- Fix: Connection recovery in `lib/db.js` ✅ Applied
- Test: Node restart, clear pool

### "Article not found"

- Check: Article slug exists and is published
- Query: `SELECT id FROM articles WHERE slug = ? AND status = 'published'`

### "View endpoint timeout"

- Check: Database query performance
- Fix: Verify indexes exist

### "Views not incrementing"

- Check: Browser console for fetch errors
- Fix: Ensure POST endpoint is responding

## 💡 Pro Tips

1. **Use debug mode**: `?debug=1` shows dedup info
2. **Clear TTL**: `localStorage.removeItem('viewed_article_[slug]')` to retest
3. **Monitor logs**: Check console for "⚠️ Database connection lost"
4. **Archive old**: Consider archiving views >90 days old
5. **Cache headers**: Article page has HTTP cache enabled

## 🎓 Learning Resources

- **Schema**: See `db/migrations/2026-01-31-add-article-views.sql`
- **API**: See `app/api/public/articles/[slug]/view/route.js`
- **Client**: See `components/article/TrackViewClient.jsx`
- **Display**: See `components/article/ViewsBadge.jsx`
- **Analytics**: See `docs/ARTICLE_VIEWS_ANALYTICS_QUERIES.sql`

## 📞 Support

1. Run verification script
2. Check browser console
3. Check database queries
4. Review error logs
5. Read ARTICLE_VIEWS_DOCUMENTATION.md

---

**Version**: 1.0 | **Status**: ✅ Complete | **Last Updated**: Feb 14, 2026
