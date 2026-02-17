# ArticleGrip Database Schema

## Current Database Structure

### Users Table

```sql
id (INT PRIMARY KEY)
name (VARCHAR 255)
email (VARCHAR 255 UNIQUE)
password (VARCHAR 255) - nullable for OAuth
username (VARCHAR 255 UNIQUE) - for profile URLs
user_slug (VARCHAR 255) - legacy identifier
avatar_url (VARCHAR 512)
bio (TEXT)
website (VARCHAR 255)
location (VARCHAR 100)
twitter (VARCHAR 100)
github (VARCHAR 100)
linkedin (VARCHAR 100)
google_id (VARCHAR 255) - OAuth
google_email (VARCHAR 255)
is_active (TINYINT)
created_at (TIMESTAMP)
```

### Articles Table

```sql
id (INT PRIMARY KEY)
author_id (INT FOREIGN KEY -> users.id)
parent_id (INT) - for article series
title (VARCHAR 255)
slug (VARCHAR 255 UNIQUE)
excerpt (TEXT)
content (LONGTEXT) - TipTap JSON format
featured_image (VARCHAR 512)
category_id (INT FOREIGN KEY -> categories.id)
status (ENUM: draft, published, archived)
is_featured (TINYINT)
subtitle (VARCHAR 255)
canonical_url (VARCHAR 512)
tags (TEXT or JSON)
content_format (VARCHAR 32)
reading_time (INT) - minutes
seo_title (VARCHAR 255)
seo_description (TEXT)
created_by_role (ENUM: user, admin) - indicates article source
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Categories Table

```sql
id (INT PRIMARY KEY)
name (VARCHAR 255)
slug (VARCHAR 255)
description (TEXT)
color (VARCHAR 7) - hex color
icon (VARCHAR 50)
parent_id (INT) - for subcategories
created_at (TIMESTAMP)
```

### Comments Table

```sql
id (INT PRIMARY KEY)
article_id (INT FOREIGN KEY -> articles.id)
user_id (INT FOREIGN KEY -> users.id)
parent_id (INT) - for nested replies
content (TEXT)
is_approved (TINYINT)
is_deleted (TINYINT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### User Follows Table

```sql
id (INT PRIMARY KEY)
follower_id (INT FOREIGN KEY -> users.id)
following_id (INT FOREIGN KEY -> users.id)
created_at (TIMESTAMP)
UNIQUE(follower_id, following_id)
```

### Article Views Table

```sql
id (INT PRIMARY KEY)
article_id (INT FOREIGN KEY -> articles.id)
user_id (INT nullable)
ip_address (VARCHAR 45)
user_agent (TEXT)
view_count (INT)
last_viewed_at (TIMESTAMP)
created_at (TIMESTAMP)
```

### User Stats Table

```sql
user_id (INT PRIMARY KEY FOREIGN KEY -> users.id)
followers_count (INT)
following_count (INT)
articles_count (INT)
total_views (INT)
updated_at (TIMESTAMP)
```

### Subscribers Table

```sql
id (INT PRIMARY KEY)
email (VARCHAR 255 UNIQUE)
name (VARCHAR 255)
subscribed_at (TIMESTAMP)
unsubscribed_at (TIMESTAMP nullable)
```

### Test Results Table

```sql
id (INT PRIMARY KEY)
user_id (INT FOREIGN KEY -> users.id)
test_series_id (VARCHAR 255)
score (INT)
total_questions (INT)
correct_answers (INT)
created_at (TIMESTAMP)
```

## Dev.to-Like Improvements Needed

### 1. **User Profile Enhancement**

- [ ] Add `headline` (one-liner bio)
- [ ] Add `featured_image` (profile banner)
- [ ] Add `reputation_score` (points system)
- [ ] Add `verified_badge` (for verified creators)
- [ ] Add `years_of_experience` (for expertise)

### 2. **Article Engagement Features**

- [ ] Add `likes` table for article reactions
- [ ] Add `bookmarks` table for saved articles
- [ ] Add `reading_list` table for user collections
- [ ] Add `share_count` on articles table
- [ ] Add engagement scoring

### 3. **Content Recommendations**

- [ ] Add `article_reads` to track user reading history
- [ ] Enhanced tagging system (many-to-many)
- [ ] Content similarity scoring
- [ ] Personalization engine

### 4. **Social Features**

- [ ] Add `mentions` in comments
- [ ] Add `notifications` table
- [ ] Add `user_preferences` table
- [ ] Add `badges` system for achievements

### 5. **Analytics & Performance**

- [ ] Add `read_time_actual` vs `read_time_estimated`
- [ ] Add `bounce_rate` tracking
- [ ] Add `scroll_depth` analytics
- [ ] Add `trending_articles` cache

### 6. **Moderation**

- [ ] Add `moderation_reports` table
- [ ] Add `bans` table
- [ ] Add `content_warnings` table
- [ ] Add `spam_score` on comments

## Recommended Migration Plan

1. **Phase 1** (Immediate):
   - Add `headline`, `reputation_score`, `verified_badge` to users
   - Create `article_likes_or_reactions` table
   - Create `bookmarks` table
   - Add `share_count` to articles

2. **Phase 2** (Next Sprint):
   - Create `notifications` table
   - Create `user_reading_history` table
   - Add engagement metrics

3. **Phase 3** (Future):
   - Premium/Pro features
   - Advanced analytics
   - AI recommendations
   - Badge system

## Current Table Count: 11

- users
- articles
- categories
- comments
- user_follows
- article_views
- user_stats
- subscribers
- test_results
- tags
- user_reads (implied)

## Indexes for Performance

Key indexes already in place:

- users(email), users(username), users(user_slug)
- articles(author_id), articles(slug), articles(category_id)
- article_views(article_id), article_views(user_id)
- user_follows(follower_id), user_follows(following_id)

## Dev.to Feature Comparison

| Feature         | ArticleGrip | Dev.to |
| --------------- | ----------- | ------ |
| User Profiles   | ✅          | ✅     |
| Follow System   | ✅          | ✅     |
| Comments        | ✅          | ✅     |
| Tags            | ✅          | ✅     |
| Reading Time    | ✅          | ✅     |
| Article Series  | ⚠️ Partial  | ✅     |
| Likes/Reactions | ❌          | ✅     |
| Bookmarks       | ❌          | ✅     |
| Notifications   | ❌          | ✅     |
| User Badges     | ❌          | ✅     |
| RSS Feed        | ✅          | ✅     |
| OAuth Login     | ✅          | ✅     |
| Dark Mode       | ✅          | ✅     |
