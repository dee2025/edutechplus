# Article Routing & URL System Documentation

## ✅ URL Routing Architecture

### Current Setup

Your site has **two-level article routing**:

```
Old URL (redirect):  /articles/{slug}
    ↓ (permanentRedirect)
New URL (canonical): /{categorySlug}/{articleSlug}
```

### Example

```
Old: http://localhost:3000/articles/what-is-generative-ai-genai
     ↓ Redirects (301)
New: http://localhost:3000/technology/what-is-generative-ai-genai
```

---

## 🔄 How the Redirect Works

### Step 1: Old URL Route `/articles/[slug]`

**File:** `app/articles/[slug]/page.jsx` (9 lines)

```jsx
1. User visits /articles/what-is-generative-ai-genai
2. Route catches [slug] = "what-is-generative-ai-genai"
3. Calls API: /api/public/articles/what-is-generative-ai-genai
4. Gets article data with category_slug = "technology"
5. Performs permanentRedirect("/technology/what-is-generative-ai-genai")
```

### Step 2: Category Article Route `/[categoryslug]/[articleslug]`

**File:** `app/(website)/[categoryslug]/[articleslug]/page.jsx` (200+ lines)

```jsx
1. Browser follows redirect to /technology/what-is-generative-ai-genai
2. Route receives categoryslug & articleslug parameters
3. Fetches article via /api/public/articles/what-is-generative-ai-genai
4. Renders full article page with comments, sidebar, etc.
```

---

## 🔍 Article Data APIs (Updated with author_username)

All these endpoints now include `author_username` for profile links:

### Public APIs

- ✅ `/api/public/articles/[slug]` - Single article
- ✅ `/api/public/home/trending` - Trending articles
- ✅ `/api/public/home/hero` - Hero featured articles
- ✅ `/api/public/home/featured` - Featured articles

### Private/Auth APIs

- ✅ `/api/articles/latest` - Latest articles (personalized)
- ✅ `/api/articles/featured` - Featured collection
- ✅ `/api/articles/most-viewed` - Most viewed in last 7 days
- ✅ `/api/articles/trending` - Trending articles
- ✅ `/api/articles/by-category` - Articles by category
- ✅ `/api/articles/by-tag` - Articles by tag
- ✅ `/api/articles/recommendations` - Personalized recommendations

---

## 📋 Data Structure for Articles

Every article endpoint returns:

```json
{
  "article": {
    "id": 1,
    "title": "What is Generative AI?",
    "slug": "what-is-generative-ai-genai",
    "author_id": 5,
    "author_name": "John Doe",
    "author_username": "john-doe", // NEW - for profile links
    "author_slug": "john-doe-5", // Legacy fallback
    "category_slug": "technology", // Used for URL routing
    "featured_image": "...",
    "excerpt": "...",
    "content": "...",
    "views": 1240,
    "published_at": "2026-02-16T10:00:00Z"
  }
}
```

---

## 🎯 Profile Link Generation (Component Level)

### AuthorLink Component

**File:** `components/common/AuthorLink.jsx`

Uses fallback chain for robust linking:

```javascript
const profileUrl = `/profile/${username || authSlug || userId}`;

// Priority:
1. username (NEW - preferred)
2. authSlug (legacy user_slug)
3. userId (fallback)
```

### Usage in Components

```jsx
<AuthorLink
  user={{
    name: article.author_name,
    username: article.author_username, // NEW
    slug: article.author_slug,
    id: article.author_id,
  }}
/>
```

---

## 📂 Files Updated for author_username

### API Endpoints (11 files)

- ✅ app/api/articles/latest/route.js
- ✅ app/api/articles/featured/route.js
- ✅ app/api/articles/most-viewed/route.js
- ✅ app/api/articles/trending/route.js
- ✅ app/api/articles/by-category/route.js
- ✅ app/api/articles/by-tag/route.js
- ✅ app/api/articles/recommendations/route.js
- ✅ app/api/public/articles/[slug]/route.js
- ✅ app/api/public/home/trending/route.js
- ✅ app/api/public/home/hero/route.js
- ✅ app/api/public/home/featured/route.js

### Components Already Updated (Confirmed)

- ✅ components/home/HomeFeed.jsx
- ✅ components/home/TopContributors.jsx
- ✅ components/article/ArticleHeader.jsx
- ✅ components/common/AuthorLink.jsx

---

## ✅ Testing Checklist

To verify everything works:

```
□ Visit http://localhost:3000/articles/what-is-generative-ai-genai
  → Should redirect to http://localhost:3000/[category]/what-is-generative-ai-genai
  → Article should load with all content

□ Click on author name/avatar
  → Should navigate to http://localhost:3000/profile/[username]
  → Profile page should load

□ Check browser console
  → No 404 errors for API calls
  → author_username should be in API responses

□ Test in Chrome DevTools
  → Network tab: All API calls return 200
  → Redirect should be 301 (permanentRedirect)
```

---

## 🚀 Key Features

### ✅ What Works Now

- SEO-friendly URLs with category slug
- 301 permanent redirect for old URLs
- Author profile links using username system
- Fallback to user_slug if username missing
- Fallback to user ID if both missing
- Consistent data across all article APIs

### ⚠️ Important Notes

- **Old URLs still work** via redirect
- **Search engines will update** to new URLs (301 redirect)
- **No data loss** - redirect maintains links
- **Profile URLs** now use username as primary

---

## 🔧 Troubleshooting

### "User not found" on article page

**Cause:** Article has no category assigned
**Fix:** Add category_id to article in database

```sql
UPDATE articles SET category_id = 1 WHERE id = {article_id};
```

### Redirect not working

**Possible causes:**

1. Article doesn't exist
2. Article has no category
3. Cache issue - clear browser cache
4. Check database: `SELECT id, slug, category_id FROM articles WHERE slug = 'your-slug';`

### Profile links showing user ID instead of username

**Cause:** username column empty for that user
**Fix:** Run migration or manually set username

```sql
UPDATE users SET username = LOWER(REPLACE(name, ' ', '-')) WHERE username IS NULL;
```

---

## 📊 URL Performance

- **Old/Simple URL:** `/articles/slug` (1 extra redirect)
- **New/SEO URL:** `/category/slug` (faster, better for SEO)
- **Profile URL:** `/profile/username` (clean, remember-able)

All use HTTP 301 permanent redirects where applicable.
