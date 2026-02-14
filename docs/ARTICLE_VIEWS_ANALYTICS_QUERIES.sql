-- Article Views Analytics Queries
-- Use these queries to analyze and understand your article view data

-- ============================================================================
-- BASIC ANALYTICS
-- ============================================================================

-- 1. Total views across all articles
SELECT COUNT(*) as total_views FROM article_views;

-- 2. Total views today
SELECT COUNT(*) as views_today FROM article_views 
WHERE created_at >= CURDATE();

-- 3. Total views this week
SELECT COUNT(*) as views_this_week FROM article_views 
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);

-- 4. Total views this month
SELECT COUNT(*) as views_this_month FROM article_views 
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- ============================================================================
-- ARTICLE RANKINGS
-- ============================================================================

-- 5. Most viewed articles (all time)
SELECT 
  a.id,
  a.title,
  a.slug,
  c.name as category,
  COUNT(*) as total_views,
  MAX(av.created_at) as last_view
FROM article_views av
JOIN articles a ON a.id = av.article_id
LEFT JOIN categories c ON c.id = a.category_id
GROUP BY a.id
ORDER BY total_views DESC
LIMIT 20;

-- 6. Most viewed articles (last 7 days)
SELECT 
  a.id,
  a.title,
  a.slug,
  c.name as category,
  COUNT(*) as views_7d,
  COUNT(DISTINCT DATE(av.created_at)) as days_active
FROM article_views av
JOIN articles a ON a.id = av.article_id
LEFT JOIN categories c ON c.id = a.category_id
WHERE av.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY a.id
ORDER BY views_7d DESC
LIMIT 20;

-- 7. Most viewed articles (today)
SELECT 
  a.id,
  a.title,
  a.slug,
  COUNT(*) as views_today
FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE av.created_at >= CURDATE()
GROUP BY a.id
ORDER BY views_today DESC
LIMIT 10;

-- ============================================================================
-- CATEGORY ANALYTICS
-- ============================================================================

-- 8. Views by category (all time)
SELECT 
  c.name as category,
  COUNT(*) as total_views,
  COUNT(DISTINCT av.article_id) as articles,
  ROUND(COUNT(*) / COUNT(DISTINCT av.article_id), 1) as avg_views_per_article
FROM article_views av
JOIN articles a ON a.id = av.article_id
JOIN categories c ON c.id = a.category_id
GROUP BY c.id
ORDER BY total_views DESC;

-- 9. Top category today
SELECT 
  c.name as category,
  COUNT(*) as views_today
FROM article_views av
JOIN articles a ON a.id = av.article_id
JOIN categories c ON c.id = a.category_id
WHERE av.created_at >= CURDATE()
GROUP BY c.id
ORDER BY views_today DESC
LIMIT 10;

-- ============================================================================
-- TEMPORAL ANALYTICS
-- ============================================================================

-- 10. Views by date
SELECT 
  DATE(created_at) as date,
  COUNT(*) as views,
  COUNT(DISTINCT article_id) as articles_viewed,
  COUNT(DISTINCT user_id) as authenticated_users,
  COUNT(DISTINCT ip) as unique_ips
FROM article_views
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 11. Views by hour (today)
SELECT 
  HOUR(created_at) as hour,
  COUNT(*) as views,
  COUNT(DISTINCT article_id) as articles_viewed
FROM article_views
WHERE created_at >= CURDATE()
GROUP BY HOUR(created_at)
ORDER BY hour DESC;

-- 12. Views by day of week (last 4 weeks)
SELECT 
  DAYNAME(created_at) as day_of_week,
  COUNT(*) as total_views,
  ROUND(COUNT(*) / 4, 0) as avg_views_per_week
FROM article_views
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
GROUP BY DAYOFWEEK(created_at)
ORDER BY DAYOFWEEK(created_at);

-- ============================================================================
-- USER ANALYTICS
-- ============================================================================

-- 13. Authenticated vs Anonymous views
SELECT 
  CASE 
    WHEN is_authenticated = TRUE THEN 'Authenticated'
    ELSE 'Anonymous'
  END as user_type,
  COUNT(*) as views,
  COUNT(DISTINCT article_id) as articles_viewed,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM article_views), 1) as percentage
FROM article_views
GROUP BY is_authenticated;

-- 14. Authenticated vs Anonymous (daily breakdown)
SELECT 
  DATE(created_at) as date,
  SUM(CASE WHEN is_authenticated = TRUE THEN 1 ELSE 0 END) as authenticated_views,
  SUM(CASE WHEN is_authenticated = FALSE THEN 1 ELSE 0 END) as anonymous_views
FROM article_views
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 15. Most active authenticated users
SELECT 
  user_id,
  COUNT(*) as views,
  COUNT(DISTINCT article_id) as unique_articles,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view
FROM article_views
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY views DESC
LIMIT 20;

-- 16. Unique viewers per article (authenticated)
SELECT 
  a.id,
  a.title,
  a.slug,
  COUNT(DISTINCT av.user_id) as unique_authenticated_viewers,
  COUNT(DISTINCT av.ip) as unique_ip_addresses,
  COUNT(*) as total_views
FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE av.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY a.id
ORDER BY unique_authenticated_viewers DESC
LIMIT 20;

-- ============================================================================
-- ENGAGEMENT ANALYTICS
-- ============================================================================

-- 17. Articles with repeated views (same user)
SELECT 
  a.id,
  a.title,
  a.slug,
  COUNT(DISTINCT av.user_id) as unique_users,
  COUNT(*) as total_views,
  ROUND(COUNT(*) / COUNT(DISTINCT av.user_id), 1) as repeats_per_user
FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE av.user_id IS NOT NULL
GROUP BY a.id
HAVING COUNT(DISTINCT av.user_id) > 1
ORDER BY repeats_per_user DESC
LIMIT 20;

-- 18. Popular articles (by unique viewers)
SELECT 
  a.id,
  a.title,
  a.slug,
  COUNT(DISTINCT av.user_id) as unique_authenticated_viewers,
  COUNT(*) as total_views,
  a.published_at
FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE av.user_id IS NOT NULL
GROUP BY a.id
ORDER BY unique_authenticated_viewers DESC
LIMIT 20;

-- ============================================================================
-- TRENDING ANALYSIS
-- ============================================================================

-- 19. Emerging articles (posted recently, gaining views)
SELECT 
  a.id,
  a.title,
  a.slug,
  DATEDIFF(CURDATE(), DATE(a.published_at)) as days_since_publish,
  COUNT(*) as views,
  ROUND(COUNT(*) / DATEDIFF(CURDATE(), DATE(a.published_at)), 1) as views_per_day
FROM article_views av
JOIN articles a ON a.id = av.article_id
WHERE a.published_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY a.id
ORDER BY views_per_day DESC
LIMIT 20;

-- 20. Articles losing momentum (view decline)
SELECT 
  prev.article_id,
  a.title,
  a.slug,
  (prev.views - curr.views) as decline,
  ROUND(((prev.views - curr.views) / prev.views * 100), 1) as decline_percent
FROM (
  SELECT article_id, COUNT(*) as views
  FROM article_views
  WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 8 DAY)
    AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 DAY)
  GROUP BY article_id
) prev
JOIN (
  SELECT article_id, COUNT(*) as views
  FROM article_views
  WHERE created_at >= CURDATE()
  GROUP BY article_id
) curr ON prev.article_id = curr.article_id
JOIN articles a ON a.id = prev.article_id
WHERE (prev.views - curr.views) > 0
ORDER BY decline DESC
LIMIT 20;

-- ============================================================================
-- HEALTH & DIAGNOSTICS
-- ============================================================================

-- 21. Articles with no views (published but not viewed)
SELECT 
  a.id,
  a.title,
  a.slug,
  a.published_at,
  DATEDIFF(CURDATE(), DATE(a.published_at)) as days_since_publish
FROM articles a
LEFT JOIN article_views av ON av.article_id = a.id
WHERE a.status = 'published'
  AND av.article_id IS NULL
ORDER BY a.published_at DESC
LIMIT 20;

-- 22. View distribution (statistical)
SELECT 
  COUNT(*) as total_articles,
  MIN(view_count) as min_views,
  MAX(view_count) as max_views,
  ROUND(AVG(view_count), 1) as avg_views,
  ROUND(STDDEV(view_count), 1) as std_dev_views
FROM (
  SELECT article_id, COUNT(*) as view_count
  FROM article_views
  GROUP BY article_id
) stats;

-- 23. Articles with anomalous view counts
SELECT 
  a.id,
  a.title,
  a.slug,
  COUNT(*) as total_views,
  ROUND((COUNT(*) - (SELECT AVG(cnt) FROM (
    SELECT COUNT(*) as cnt FROM article_views GROUP BY article_id
  ) t)) / (
    SELECT STDDEV(cnt) FROM (
      SELECT COUNT(*) as cnt FROM article_views GROUP BY article_id
    ) t
  ), 1) as z_score
FROM article_views av
JOIN articles a ON a.id = av.article_id
GROUP BY a.id
HAVING z_score > 2 OR z_score < -2
ORDER BY z_score DESC;

-- 24. Data quality check
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT article_id) as unique_articles,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip) as unique_ips,
  COUNT(DISTINCT user_agent) as unique_agents,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view,
  ROUND(COUNT(*) / DATEDIFF(MAX(created_at), MIN(created_at)), 1) as avg_views_per_day
FROM article_views;

-- ============================================================================
-- EXPORT & REPORTING
-- ============================================================================

-- 25. Monthly summary report
SELECT 
  YEAR(created_at) as year,
  MONTH(created_at) as month,
  DATE_TRUNC(created_at, MONTH) as month_start,
  COUNT(*) as total_views,
  COUNT(DISTINCT article_id) as articles_viewed,
  COUNT(DISTINCT user_id) as authenticated_users,
  COUNT(DISTINCT ip) as unique_ips,
  ROUND(AVG(CASE WHEN is_authenticated = TRUE THEN 1 ELSE 0 END) * 100, 1) as auth_percentage
FROM article_views
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year DESC, month DESC;

-- 26. Full article performance report
SELECT 
  a.id,
  a.title,
  a.slug,
  c.name as category,
  a.author_id,
  a.published_at,
  COUNT(*) as total_views,
  COUNT(DISTINCT av.user_id) as unique_authenticated_viewers,
  COUNT(DISTINCT av.ip) as unique_ip_addresses,
  SUM(CASE WHEN av.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as views_7d,
  SUM(CASE WHEN av.created_at >= CURDATE() THEN 1 ELSE 0 END) as views_today,
  ROUND(AVG(CASE WHEN av.is_authenticated = TRUE THEN 1 ELSE 0 END) * 100, 1) as authenticated_percentage,
  MAX(av.created_at) as last_view
FROM articles a
LEFT JOIN article_views av ON av.article_id = a.id
LEFT JOIN categories c ON c.id = a.category_id
WHERE a.status = 'published'
GROUP BY a.id
ORDER BY total_views DESC;
