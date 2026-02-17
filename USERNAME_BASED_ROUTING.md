# Username-Based Article Routing Guide

## 🎯 New Routing Architecture (Medium/Dev.to Style)

Your ArticleGrip now uses **author-first URLs** similar to Medium and Dev.to:

```
http://localhost:3000/{username}/{article-slug}

Examples:
- http://localhost:3000/john-doe/what-is-generative-ai
- http://localhost:3000/jane-smith/10-javascript-tips
- http://localhost:3000/tech-writer/react-hooks-explained
```

---

## 🔄 URL Routing Flow

### Step 1: Old URL (Any of these)

```
/articles/{slug}
```

### Step 2: Automatic Redirect (301)

- Fetches article by slug
- Extracts author's username
- Redirects to: `/{author_username}/{article_slug}`

### Step 3: New Primary URL

```
/{username}/{articleslug}
  ↓
  Renders full article page with comments, sidebar, related articles
```

---

## 📁 Folder Structure

```
app/
├── articles/
│   └── [slug]/
│       └── page.jsx          ← Redirect route (old URLs)
│
└── (website)/
    ├── [categoryslug]/
    │   └── page.jsx           ← Category listing page (still works)
    │
    ├── [username]/
    │   └── [articleslug]/
    │       └── page.jsx       ← PRIMARY article route (NEW)
    │
    └── profile/
        └── [slug]/
            └── page.jsx       ← User profile page
```

---

## 🔌 API Endpoints

### Primary API for Username-Based Articles

```
GET /api/articles/by-author/{username}/{slug}
```

**Response:**

```json
{
  "article": {
    "id": 1,
    "title": "What is Generative AI?",
    "slug": "what-is-generative-ai-genai",
    "author_id": 5,
    "author_name": "John Doe",
    "author_username": "john-doe",
    "author_avatar": "...",
    "bio": "...",
    "website": "...",
    "twitter": "...",
    "category_name": "Technology",
    "featured_image": "...",
    "content": "...",
    "views": 1240,
    "published_at": "2026-02-16T10:00:00Z"
  },
  "trending": [
    { "id": 2, "title": "...", "slug": "...", "username": "...", "views": 890 },
    ...
  ]
}
```

---

## 🎯 Component Updates

### Article Links Throughout Site

All components now generate username-based URLs:

```javascript
// Before
href={`/${category_slug}/${article.slug}`}

// After (with fallback)
href={`/${article.author_username || article.category_slug}/${article.slug}`}
```

### Updated Components

- ✅ TrendingByViews.jsx
- ✅ FeaturedStory.jsx
- ✅ DashboardLive.jsx
- ✅ ArticleHeader.jsx
- ✅ ArticleSidebar.jsx
- ✅ HomeFeed.jsx
- ✅ All home page sections

### Author Profile Links

Still use username-based profile URLs:

```javascript
// Navigate to user profile
href={`/profile/${article.author_username || article.author_slug || article.author_id}`}
```

---

## 📊 URL Examples

### Redirect Chain

```
User visits:    http://localhost:3000/articles/generative-ai-guide
                ↓ (301 permanent redirect)

Redirects to:   http://localhost:3000/john-doe/generative-ai-guide
                ↓ (Route match)

Renders:        Article page with full content
                Author: John Doe (clickable link to /profile/john-doe)
                Trending articles use same format
```

### All URL Formats

```
Old Format:             /articles/{article-slug}
New Primary Format:     /{author-username}/{article-slug}
Category Page:          /{category-slug}
User Profile:           /profile/{username}
Follow User:            /profile/{username}/followers
User Following:         /profile/{username}/following
```

---

## 🔧 Implementation Details

### Files Created/Modified

**New Files:**

- ✅ `app/(website)/[username]/[articleslug]/page.jsx` - Article page route
- ✅ `app/api/articles/by-author/[username]/[slug]/route.js` - API endpoint
- ✅ `USERNAME_BASED_ROUTING.md` - This documentation

**Modified Files:**

- ✅ `app/articles/[slug]/page.jsx` - Updated redirect logic
- ✅ `components/article/ArticleSidebar.jsx` - Use username URLs for trending
- ✅ `components/home/TrendingByViews.jsx` - Use username in links
- ✅ `components/Home/FeaturedStory.jsx` - Use username in links
- ✅ `components/admin/DashboardLive.jsx` - Use username in admin links

**Deleted/Removed:**

- ❌ `app/(website)/[categoryslug]/[articleslug]/` - Removed (route conflict)

---

## ✅ Features & Benefits

### ✅ What Works Now

1. **Primary Route**: `/username/article-slug` loads articles directly
2. **Backward Compatible**: `/articles/slug` redirects seamlessly
3. **Author Discovery**: URLs showcase author, encourage profile visits
4. **SEO Friendly**: Descriptive URLs with author and article names
5. **Mobile Friendly**: Shorter URLs vs category-based
6. **Social Sharing**: URLs are human-readable and memorable
7. **Analytics**: Easy to track articles by author

### ✨ Benefits Over Category-Based URLs

- **Better UX**: Direct author attribution
- **Social**: Users remember authors, not categories
- **Follower Growth**: Profile URLs prominent in article URLs
- **Flexibility**: Same article can be in multiple categories
- **Modern**: Matches Medium/Dev.to/Substack patterns

---

## 🧪 Testing Checklist

To verify the new routing works:

```bash
# Test 1: Old URL redirect
curl -L http://localhost:3000/articles/generative-ai-guide
# Should redirect to: /john-doe/generative-ai-guide

# Test 2: New primary URL
visit: http://localhost:3000/john-doe/generative-ai-guide
# Should load full article page

# Test 3: Author profile link
Click on author name → http://localhost:3000/profile/john-doe
# Should load author profile

# Test 4: Trending articles
Scroll to sidebar → Click trending articles
# Should use username format: http://localhost:3000/{username}/{article-slug}

# Test 5: Category page still works
visit: http://localhost:3000/technology
# Should show all articles in that category
```

---

## 🚀 Usage Examples

### Linking to Articles in Code

```jsx
// React Component Example
import Link from "next/link";

function ArticleCard({ article }) {
  return (
    <Link href={`/${article.author_username}/${article.slug}`}>
      <h3>{article.title}</h3>
    </Link>
  );
}
```

### API Usage

```javascript
// Fetch article by author and slug
const response = await fetch(
  `/api/articles/by-author/${username}/${articleSlug}`,
);
const data = await response.json();
const article = data.article;
```

### Redirect from Article Detail

```javascript
// Old article pages redirect to new format
const target = `/${article.author_username}/${article.slug}`;
permanentRedirect(target);
```

---

## 📈 Migration Notes

### For Existing Links

- ✅ Old `/articles/[slug]` links still work (301 redirect)
- ✅ Updated components automatically use new format
- ✅ Search engines will update within days (301 redirect)
- ✅ No manual link updates needed

### For SEO

- ✅ 301 permanent redirect preserves link equity
- ✅ New URLs are more keyword-rich
- ✅ Author prominence improves relevance signals
- ✅ Site structure matches user intent

### For Authors

- ✅ Articles now display author username prominently
- ✅ URLs encourage profile visits
- ✅ Trending section shows author attribution
- ✅ Possible gamification: "top articles by username"

---

## 🎓 Best Practices

### URL Conventions

- Use lowercase: `john-doe` not `JohnDoe`
- Use hyphens: `react-hooks` not `react_hooks`
- Keep slugs short: `react-tips` not `10-best-react-tips-you-must-know`
- Use descriptive words: `javascript-async` not `something-cool`

### Recommended Pattern

```
/{author_username}/{article_slug}
/{2-3 character author}/{2-5 word article-title}

Examples:
/alice/machine-learning-guide
/bob/web-performance-tips
/charlie/docker-kubernetes
```

---

## 🔍 Troubleshooting

### Article Not Found (404)

**Cause:** Author doesn't have username or username is wrong
**Fix:** Check database:

```sql
SELECT id, name, username FROM users WHERE id = {author_id};

-- If no username, generate one:
UPDATE users SET username = LOWER(REPLACE(name, ' ', '-'))
WHERE id = {author_id} AND username IS NULL;
```

### Redirect Not Working

**Cause:** Article has no associated author with username
**Fix:** Assign author and ensure username exists

### URL Shows Category Instead

**Cause:** Article API returned author_username as NULL
**Fix:** Check article API response includes `author_username`

---

## 📚 Related Routes

| Route                           | Purpose          | Format                        |
| ------------------------------- | ---------------- | ----------------------------- |
| `/articles/[slug]`              | Article redirect | `/articles/article-title`     |
| `/{username}/[articleslug]`     | Article primary  | `/{username}/{article-title}` |
| `/{categoryslug}`               | Category listing | `/technology`                 |
| `/profile/{username}`           | Author profile   | `/profile/john-doe`           |
| `/profile/{username}/followers` | Author followers | `/profile/john-doe/followers` |
| `/profile/{username}/following` | User following   | `/profile/john-doe/following` |

---

## 🎉 Summary

ArticleGrip now features **modern, author-first URLs** that:

- Display author names prominently
- Match industry standards (Medium, Dev.to, Substack)
- Improve user discovery and social sharing
- Maintain SEO value through 301 redirects
- Support all existing functionality

All old URLs continue to work via automatic redirects. No user-facing changes needed—the new routing just works!
