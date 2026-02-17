# Professional Follow System Rules & Implementation

## System Overview

The ArticleGrip Follow System is a professional implementation of user-to-user following relationships with comprehensive business rules and UI logic.

## Core Rules

### 1. **No Self-Following**

- Users cannot follow themselves
- The follow button is hidden when viewing your own profile
- The follow button is hidden in your followers/following lists when your name appears

### 2. **Authentication Requirement**

- Only authenticated users can follow/unfollow other users
- Unauthenticated users won't see follow buttons
- Follow action requires active session

### 3. **Profile Page Behavior**

- **Own Profile**: Follow button is completely hidden
- **Other's Profile**: Shows appropriate follow/unfollow button based on status

### 4. **Followers/Following List Behavior**

- **When Viewing Your Own Followers**: Your entry (if followed by someone else who follows you back) shows NO button
- **When Viewing Your Own Following**: Your entry (if in your own following list in reciprocal cases) shows NO button
- **Other Users**: Show correct follow state with interactive button

### 5. **Follow State Display**

- **Not Following**: "Follow" button (cyan color)
- **Already Following**: "Unfollow" button (gray color)
- **Self**: Hidden/No button

## Database Schema

```sql
-- User Following Relationships
user_follows
├── follower_id (INT) - The user who is following
├── following_id (INT) - The user being followed
├── created_at (TIMESTAMP)
└── PRIMARY KEY (follower_id, following_id)
```

## API Endpoints

### 1. Check Follow Status

**GET** `/api/users/{userId}/is-following?follower_id={currentUserId}`

Response:

```json
{
  "isFollowing": true/false
}
```

### 2. Follow User

**POST** `/api/users/{userId}/follow`

- Requires: Authentication
- Returns: Success message

### 3. Unfollow User

**DELETE** `/api/users/{userId}/follow`

- Requires: Authentication
- Returns: Success message

### 4. Get Followers List

**GET** `/api/users/{userId}/followers?offset=0&limit=20`

Response:

```json
{
  "followers": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "avatar_url": "...",
      "bio": "...",
      "followers_count": 100,
      "following_count": 50
    }
  ],
  "pagination": {
    "total": 200,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### 5. Get Following List

**GET** `/api/users/{userId}/following?offset=0&limit=20`

Same response structure as followers endpoint.

## Component Implementation

### FollowButton Component

Located: `components/profile/FollowButton.jsx`

**Props:**

- `userId` (required): The ID of the user to follow
- `isFollowing` (optional): Initial follow state
- `isCurrentUser` (optional): Whether this is the current user's own profile

**Features:**

- Automatically hides for authenticated users viewing own profile
- Shows correct follow/unfollow state
- Handles follow/unfollow actions with loading state
- Shows interactive feedback with icons

**Rules Implemented:**

```jsx
// Hide if:
// 1. User is not authenticated
// 2. Viewing own profile
if (!session || isCurrentUser) {
  return null;
}
```

## Page-Level Implementation

### Profile Page (`app/(website)/profile/[slug]/page.jsx`)

1. Fetches current user from `/api/auth/me`
2. Fetches profile user data
3. Checks follow status via `/api/users/{userId}/is-following`
4. Only renders FollowButton if `currentUser.id !== profileUser.id`

### Followers Page (`app/(website)/profile/[slug]/followers/page.jsx`)

1. Fetches followers list
2. For each follower who is NOT the current user:
   - Checks follow status
   - Passes `isFollowing` state to FollowButton
3. Passes `isCurrentUser={currentUser?.id === follower.id}` to hide own entry

### Following Page (`app/(website)/profile/[slug]/following/page.jsx`)

Same logic as Followers Page

## Validation Rules

### Server-Side (API Layer)

1. **Authentication Check**: All follow/unfollow requests require valid session
2. **Self-Following Prevention**:
   ```javascript
   if (followerId === followingId) {
     return error("Cannot follow yourself");
   }
   ```
3. **User Existence**: Validate both users exist before creating relationship
4. **Duplicate Prevention**: Use `ON DUPLICATE KEY UPDATE` to prevent errors on re-following

### Client-Side (UI Layer)

1. **Session Check**: Only show button if `useSession()` returns valid user
2. **Self-Check**: Compare `session.user.id` with displayed user ID
3. **Follow State Verification**: Request follow status before rendering button
4. **Current User Check**: Never show follow button with `isCurrentUser={true}`

## User Experience Flow

### Scenario 1: Viewing Your Own Profile

```
1. User visits /profile/yourusername
2. currentUser.id === profileUser.id
3. FollowButton receives isCurrentUser=true
4. Button is not rendered (returns null)
5. User sees profile without follow button
```

### Scenario 2: Viewing Another User's Profile (Not Following)

```
1. User visits /profile/otherusername
2. Check: currentUser.id !== profileUser.id
3. Query follow status: isFollowing = false
4. FollowButton shows "Follow" button (cyan)
5. User can click to follow
```

### Scenario 3: Viewing Another User's Profile (Already Following)

```
1. User visits /profile/otherusername
2. Check: currentUser.id !== profileUser.id
3. Query follow status: isFollowing = true
4. FollowButton shows "Unfollow" button (gray)
5. User can click to unfollow
```

### Scenario 4: In Followers List (Viewing Your Own Followers)

```
1. User visits /profile/yourusername/followers
2. Follower A (not your name): Shows Follow/Unfollow button
3. Your entry appears: FollowButton marked as isCurrentUser=true
4. Your button is hidden
```

## Error Handling

### Follow/Unfollow Errors

- Network failures: Gracefully handled with console logging
- Authorization failures: Return 401 Unauthorized
- User not found: Return 404 Not Found
- Duplicate follow: Handled with MySQL `ON DUPLICATE KEY UPDATE`

## Performance Optimization

1. **Batch Follow Status Checks**: In list pages, check all follows in parallel
2. **Caching Strategy**: Follow status checked on page load, cached until action
3. **Database Indexes**: Ensure indexes on `follower_id` and `following_id`
4. **Pagination**: Lists use offset/limit for scalability

## Testing Checklist

- [ ] Can follow another user from their profile
- [ ] Can unfollow after following
- [ ] Follow button hidden on own profile
- [ ] Follow button hidden for own name in follower/following lists
- [ ] Follow status updates immediately after action
- [ ] Followers/following counts update accurately
- [ ] Pagination works in follower/following lists
- [ ] Dark mode styling applies correctly
- [ ] Mobile responsive design works
- [ ] Unauthenticated users don't see follow buttons

## Future Enhancements

1. **Notifications**: Notify users when they're followed
2. **Follow Requests**: Add approval system for follows
3. **Blocking**: Add ability to block users
4. **Mutual Follows**: Track and display mutual relationships
5. **Activity Feed**: Show follow activity to users
6. **Batch Operations**: Allow bulk follow/unfollow from admin
