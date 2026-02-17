# Tags Feature Documentation

## Overview

The tags feature enables content categorization and discovery through a flexible tagging system. Users can browse articles by tags, see trending tags, and discover related content easily.

## Features

### 1. **Tag Discovery Pages**

- **`/tags`** - Browse all available tags with search functionality
  - Top tags sidebar showing most popular tags
  - Global tag search
  - Tag article count display
- **`/tags/{slug}`** - Individual tag page showing all articles with that tag
  - Articles filtered by tag
  - Related article count
  - Tag description display

### 2. **Trending Tags**

- Right sidebar on homepage shows trending tags based on article count
- "Browse all" link to `/tags` page
- Tags ordered by article count

### 3. **Tag Management**

- **Database**: `tags` and `article_tags` tables
- Default tags included: JavaScript, React, Web Development, Tutorial, Career, CSS, TypeScript, Node.js, Database, DevOps
- Support for tag colors and descriptions
- Searchable tag system

## Database Schema

### `tags` Table

```sql
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,          -- "JavaScript"
  slug VARCHAR(100) NOT NULL UNIQUE,          -- "javascript"
  description TEXT NULL,                      -- Tag description
  color VARCHAR(7) DEFAULT '#06B6D4',         -- Hex color for display
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `article_tags` Table

```sql
CREATE TABLE article_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_article_tag (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

## API Endpoints

### 1. **Get All Tags**

```
GET /api/tags/all
```

Returns all tags with article counts, ordered by popularity.

**Response:**

```json
{
  "tags": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "description": "JavaScript language and related technologies",
      "article_count": 145
    },
    ...
  ]
}
```

### 2. **Get Trending Tags**

```
GET /api/tags/trending
```

Returns top 20 tags by article count.

**Response:**

```json
{
  "tags": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "article_count": 145
    },
    ...
  ]
}
```

### 3. **Get Articles by Tag**

```
GET /api/articles/by-tag?slug={slug}&limit={limit}&offset={offset}
```

Returns articles filtered by specific tag.

**Parameters:**

- `slug` (required) - Tag slug
- `limit` (optional, default: 20, max: 100) - Number of articles
- `offset` (optional, default: 0) - Pagination offset

**Response:**

```json
{
  "tag": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "description": "JavaScript language..."
  },
  "articles": [
    {
      "id": 123,
      "title": "JavaScript Tips",
      "slug": "javascript-tips",
      "excerpt": "...",
      "author_name": "John Doe",
      "views": 542,
      "categories": [
        {
          "id": 1,
          "name": "Web Development",
          "slug": "web-development"
        }
      ],
      "published_at": "2026-02-14T10:00:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 145,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Components

### 1. **TagsPage** (`app/(website)/tags/page.jsx`)

Main tags browse page with:

- Top 10 tags sidebar
- Global tag search
- Grid of all tags with article counts
- Results counter

### 2. **TagDetailPage** (`app/(website)/tags/[slug]/page.jsx`)

Individual tag page showing:

- Tag name and description
- All articles with that tag
- Author information and read time
- Like/comment/share buttons
- Related categories

### 3. **TrendingTags** (in RightSidebar)

- Shows top trending tags
- Links to individual tag pages
- "Browse all" link to `/tags`

## Migration Setup

Run the tags migration to create tables and insert default tags:

```bash
node scripts/run-tags-migration.js
```

This will:

- Create `tags` table
- Create `article_tags` junction table
- Insert 10 default popular tags
- Set up necessary indexes

## Usage Examples

### Browse Tags

```
User navigates to /tags → sees all available tags → clicks tag → views filtered articles
```

### Explore by Interest

```
User sees trending tags in right sidebar → clicks tag → reads related articles → follows more tags
```

### Search Tags

```
User types "react" in tags search → sees all React-related tags → clicks to explore
```

## Frontend Integration

### Link to Tag Page

```jsx
<Link href={`/tags/${tag.slug}`}>#{tag.name}</Link>
```

### Display Tag Badges

```jsx
<div className="flex gap-2">
  {article.tags?.map((tag) => (
    <Link key={tag.id} href={`/tags/${tag.slug}`}>
      <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs">
        #{tag.name}
      </span>
    </Link>
  ))}
</div>
```

## Best Practices

1. **Tag Naming**
   - Use lowercase, hyphen-separated slugs
   - Same name = same tag (enforce uniqueness)

2. **Article Tagging**
   - Limit to 3-5 tags per article
   - Use tags from existing system (avoid creating duplicates)
   - Tag during publication

3. **Performance**
   - Indexes on `slug` and `article_count`
   - Cache trending tags (short TTL)
   - Pagination for large result sets

## Future Enhancements

1. **User Follows**
   - Users can follow tags
   - Personalized feed based on followed tags

2. **Tag Suggestions**
   - AI-powered tag suggestions during publishing
   - Content-based tag recommendations

3. **Tag Analytics**
   - Popular tags over time
   - Tag growth tracking
   - User tag preferences

4. **Tag Collections**
   - curated tag bundles (e.g., "Frontend Developer", "Backend DevOps")
   - Learning paths using tags

## Troubleshooting

### Tags not appearing

1. Check if migration was run successfully
2. Verify `tags` table exists: `SHOW TABLES LIKE 'tags';`
3. Check database connection

### Articles not showing under tag

1. Verify articles are tagged in `article_tags` table
2. Ensure articles have `status = 'published'`
3. Check SQL query in API endpoint

### Performance issues

1. Check for missing indexes
2. Analyze slow queries with `EXPLAIN`
3. Consider caching trending tags

---

**Created:** February 14, 2026
**Last Updated:** February 14, 2026
