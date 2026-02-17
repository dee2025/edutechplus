# User Follow System - Complete Implementation

## Overview

This document outlines the upgraded user follow system that allows users to follow each other and displays correct followers/following counts with a list of users.

## Database Tables

- **user_follows**: Tracks follower relationships
  - follower_id (user who is following)
  - following_id (user being followed)
  - Unique constraint on (follower_id, following_id)

- **user_stats**: Caches follower counts (optional, for performance)
  - followers_count
  - following_count

## API Endpoints

### 1. Get User Profile

**Endpoint**: `GET /api/users/{username|slug|id}/profile`
**Returns**: Complete user profile with followers/following counts

### 2. Get Followers List

**Endpoint**: `GET /api/users/{username|slug|id}/followers?limit=20&offset=0`
**Returns**: List of users following the specified user with:

- followers_count
- following_count
- User basic info (name, bio, avatar_url, etc.)

### 3. Get Following List

**Endpoint**: `GET /api/users/{username|slug|id}/following?limit=20&offset=0`
**Returns**: List of users that the specified user is following with:

- followers_count
- following_count
- User basic info

### 4. Follow User

**Endpoint**: `POST /api/users/{userId}/follow`
**Auth**: Required (JWT Bearer token)
**Body**: None
**Returns**: Success message
**Error Cases**:

- Cannot follow yourself
- User not found
- Unauthorized (no token)

### 5. Unfollow User

**Endpoint**: `DELETE /api/users/{userId}/follow`
**Auth**: Required (JWT Bearer token)
**Returns**: Success message
**Error Cases**:

- User not found
- Unauthorized (no token)

## Frontend Components

### FollowButton Component

**Location**: `components/profile/FollowButton.jsx`
**Props**:

- userId: Number - ID of user to follow/unfollow
- isFollowing: Boolean - Current follow state

**Features**:

- Shows "Follow" / "Unfollow" buttons with icons
- Requires authentication
- Redirects to login if not authenticated
- Passes JWT token in Authorization header

### Profile Pages

1. **Profile Page** (`app/(website)/profile/[slug]/page.jsx`)
   - Displays followers/following counts
   - Shows FollowButton to follow other users
   - Shows user stats grid

2. **Followers Page** (`app/(website)/profile/[slug]/followers/page.jsx`)
   - Lists all followers with their stats
   - Show Follow button for each follower
   - Supports pagination (Load More)

3. **Following Page** (`app/(website)/profile/[slug]/following/page.jsx`)
   - Lists all users being followed with their stats
   - Shows Follow button for each user
   - Supports pagination (Load More)

## Features Implemented

### ✅ Complete

1. **Followers/Following Counts**: Accurate count displayed on profile
2. **User Lists**: View all followers and following with pagination
3. **User Stats**: Each user shows their followers/following counts
4. **Follow/Unfollow**: Interactive buttons to manage relationships
5. **Flexible User Resolution**: APIs accept username, user_slug, or numeric ID
6. **Authentication**: JWT-based authentication for follow actions
7. **Pagination**: Load more functionality for large lists

## Technical Improvements

### Database Queries

- Uses LEFT JOINs to count followers/following
- Efficient GROUP BY queries
- Proper indexes on follower_id and following_id

### Error Handling

- Validates user exists before follow/unfollow
- Prevents self-following
- Returns proper HTTP status codes
- Clear error messages

### Performance

- Pagination prevents loading massive lists
- User stats table can cache counts (optional)
- Efficient DB queries with proper indexing

## Testing Checklist

- [ ] Profile page shows correct follower/following counts
- [ ] Click on counts to go to followers/following lists
- [ ] Followers list displays all followers with stats
- [ ] Following list displays all following with stats
- [ ] Follow button works on followers/following pages
- [ ] Pagination (Load More) works correctly
- [ ] Cannot follow yourself
- [ ] Unfollow button changes to Follow after unfollowing
- [ ] Requires login to follow/unfollow
- [ ] Works with both username and numeric user IDs

## Files Modified/Created

### Created:

- `app/api/users/[slug]/followers/route.js` - Followers API endpoint
- `app/api/users/[userId]/follow/route.js` - Follow/Unfollow action API

### Modified:

- `app/api/users/[slug]/following/route.js` - Accept username/slug in addition to numeric ID
- `components/profile/FollowButton.jsx` - Add JWT token in Authorization header
- `app/(website)/profile/[slug]/followers/page.jsx` - Add FollowButton and better stats display
- `app/(website)/profile/[slug]/following/page.jsx` - Add FollowButton and better stats display

## Notes

1. **Authentication**: The follow API expects a JWT Bearer token in the Authorization header
2. **Session Token**: The FollowButton component tries to get the token from NextAuth session (access_token or token field)
3. **User ID Resolution**: All user endpoints first try to match by username, then user_slug, then numeric ID
4. **Follower Stats**: Each user in followers/following lists shows both their follower count and following count
