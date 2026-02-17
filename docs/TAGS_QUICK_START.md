# Tags Feature Quick Start Guide

## Setup Instructions

### Step 1: Run Database Migration

Before using the tags feature, you need to create the necessary tables and insert default tags.

```bash
# From project root
node scripts/run-tags-migration.js
```

### Step 2: Verify Installation

Check that the migration was successful:

```bash
# Connect to your database and run:
SHOW TABLES LIKE 'tag%';
SELECT * FROM tags LIMIT 5;
```

You should see:

- `tags` table with 10 default tags
- `article_tags` junction table (empty initially)

### Step 3: Access Tag Features

#### Browse All Tags

```
Navigate to: http://localhost:3000/tags
```

Features:

- View all available tags
- Search tags by name
- See article count for each tag
- Top 10 tags sidebar

#### View Articles by Tag

```
Navigate to: http://localhost:3000/tags/javascript
```

Replace `javascript` with any tag slug.

Features:

- All articles tagged with "JavaScript"
- Filter by tag
- Author and view count information

#### Trending Tags (Homepage)

```
Navigate to: http://localhost:3000
```

In the right sidebar:

- Top 10 trending tags
- "Browse all" link to full tags page

## API Reference

### Get All Tags

```bash
curl http://localhost:3000/api/tags/all
```

### Get Trending Tags

```bash
curl http://localhost:3000/api/tags/trending
```

### Get Articles by Tag

```bash
# Get JavaScript articles (first 20)
curl "http://localhost:3000/api/articles/by-tag?slug=javascript&limit=20&offset=0"

# Get React articles (second page)
curl "http://localhost:3000/api/articles/by-tag?slug=react&limit=20&offset=20"
```

## Adding Tags to Articles

### Via Database (Direct)

```sql
-- Get tag ID
SELECT id FROM tags WHERE slug = 'javascript';  -- Returns: 1

-- Get article ID
SELECT id FROM articles WHERE slug = 'my-article';  -- Returns: 123

-- Add tag to article
INSERT INTO article_tags (article_id, tag_id) VALUES (123, 1);
```

### Via API (Future Implementation)

API endpoint to add/remove tags from articles (to be implemented)

## File Structure

```
app/
├── api/
│   ├── articles/
│   │   ├── by-tag/
│   │   │   └── route.js          # Get articles filtered by tag
│   │   └── ...
│   └── tags/
│       ├── all/
│       │   └── route.js          # Get all tags
│       ├── trending/
│       │   └── route.js          # Get trending tags
│       └── routes...
├── (website)/
│   └── tags/
│       ├── page.jsx              # Browse all tags
│       └── [slug]/
│           └── page.jsx          # Individual tag page
└── ...

components/
├── home/
│   ├── LeftSidebar.jsx          # Links to tags
│   ├── RightSidebar.jsx         # Trending tags widget
│   └── ...
└── ...

db/
└── migrations/
    └── 2026-02-14-add-tags-feature.sql

scripts/
└── run-tags-migration.js        # Migration runner

docs/
└── TAGS_FEATURE.md              # Full documentation
```

## Default Tags

The migration includes these 10 default tags:

1. **JavaScript** - JavaScript language and related technologies
2. **React** - React library and related frameworks
3. **Web Development** - General web development topics
4. **Tutorial** - Educational and tutorial content
5. **Career** - Career advice and professional development
6. **CSS** - CSS styling and design
7. **TypeScript** - TypeScript and type safety
8. **Node.js** - Node.js backend development
9. **Database** - Database design and management
10. **DevOps** - DevOps and deployment practices

## Troubleshooting

### Migration fails with "No such file"

Ensure you're running from the project root directory:

```bash
cd /path/to/articlegrip-next
node scripts/run-tags-migration.js
```

### Tags table not found

The migration may have failed. Check:

1. Database connection in `.env.local`
2. User permissions to create tables
3. Run migration with errors logged

### No articles showing under tag

Make sure articles are:

1. Tagged in `article_tags` table
2. Have `status = 'published'` in articles table
3. Verify tag slug matches exactly

### Search not working

The search is client-side filtering, ensure:

1. Tag names load from API
2. No JavaScript console errors
3. Browser has JavaScript enabled

## Performance Tips

1. **Cache Trending Tags**: Call `/api/tags/trending` once and cache for 5-10 minutes
2. **Lazy Load Articles**: Use pagination with limit=20 by default
3. **Index Optimization**: Ensure indexes exist on `tags.slug` and `articles.status`
4. **Search Optimization**: For large tag lists, consider server-side search

## Next Steps

1. ✅ Run migration: `node scripts/run-tags-migration.js`
2. ✅ Navigate to `/tags` to verify
3. ✅ Add sample tags to articles (database)
4. 📝 (Future) Implement tag management UI for admins
5. 📝 (Future) Implement user tag following

## Support

For issues or questions:

1. Check `docs/TAGS_FEATURE.md` for detailed documentation
2. Review API endpoint implementations in `app/api/tags/` and `app/api/articles/by-tag/`
3. Check database schema in migration file

---

**Quick Commands:**

```bash
# Run migration
node scripts/run-tags-migration.js

# Test API endpoints
curl http://localhost:3000/api/tags/all
curl http://localhost:3000/api/tags/trending
curl "http://localhost:3000/api/articles/by-tag?slug=javascript"

# Database check
# mysql -u root -p articlegrip -e "SELECT COUNT(*) FROM tags; SELECT COUNT(*) FROM article_tags;"
```
