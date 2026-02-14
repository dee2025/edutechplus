# Newsletter Subscription System

Complete newsletter subscription functionality for ArticleGrip Next.

## Features

✅ **User Subscription**

- Email validation and normalization
- Duplicate prevention
- Reactivation of previously unsubscribed users
- Real-time feedback (success/error messages)

✅ **User Unsubscription**

- Dedicated unsubscribe page
- Email verification
- Status tracking (active/unsubscribed)

✅ **Admin Dashboard**

- View all subscribers
- Filter by status (all/active/unsubscribed)
- Export to CSV
- Delete subscribers
- Pagination support

## Database Schema

```sql
CREATE TABLE subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('active', 'unsubscribed') DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_status (status)
);
```

## API Endpoints

### Subscribe

**POST** `/api/subscribe`

Request:

```json
{
  "email": "user@example.com"
}
```

Responses:

- `201` - Successfully subscribed
- `400` - Invalid email
- `409` - Email already subscribed
- `500` - Server error

### Unsubscribe

**POST** `/api/unsubscribe`

Request:

```json
{
  "email": "user@example.com"
}
```

Responses:

- `200` - Successfully unsubscribed
- `400` - Invalid email or already unsubscribed
- `404` - Email not found
- `500` - Server error

### Admin - Get Subscribers

**GET** `/api/admin/subscribers?status={all|active|unsubscribed}&page=1&limit=50`

Response:

```json
{
  "subscribers": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Admin - Delete Subscriber

**DELETE** `/api/admin/subscribers?id={subscriberId}`

## Frontend Components

### Newsletter Section (`components/Home/Newsletter.jsx`)

- Client-side form with state management
- Email input with validation
- Loading states
- Success/error messages
- Link to unsubscribe page

### Unsubscribe Page (`app/(website)/unsubscribe/page.jsx`)

- Standalone page for unsubscriptions
- Email verification
- Confirmation messages

### Admin Subscribers Page (`app/admin/subscribers/page.jsx`)

- Full subscriber management interface
- Filter tabs (All/Active/Unsubscribed)
- Data table with status badges
- Export to CSV functionality
- Delete individual subscribers

## Setup Instructions

### 1. Run Database Migration

```bash
node scripts/run-subscriber-migration.js
```

### 2. Verify Table Creation

Check that the `subscribers` table exists in your MySQL database.

### 3. Access Points

**For Users:**

- Subscribe: Newsletter section on homepage
- Unsubscribe: `/unsubscribe`

**For Admins:**

- Dashboard: `/admin/subscribers`
- Access via Admin Sidebar → Subscribers

## Usage Examples

### Subscribe a User

1. Navigate to homepage
2. Scroll to Newsletter section
3. Enter email address
4. Click "Subscribe"
5. See confirmation message

### Unsubscribe a User

1. Navigate to `/unsubscribe`
2. Enter subscribed email
3. Click "Unsubscribe"
4. See confirmation message

### View Subscribers (Admin)

1. Login to admin panel
2. Click "Subscribers" in sidebar
3. View list with filters
4. Export to CSV if needed

## Features in Detail

### Email Normalization

All emails are:

- Trimmed of whitespace
- Converted to lowercase
- Validated against regex pattern

### Reactivation

If a user previously unsubscribed:

- They can re-subscribe with same email
- Status changes from `unsubscribed` to `active`
- `subscribed_at` updates to current timestamp
- `unsubscribed_at` is cleared

### CSV Export

Export includes:

- Email address
- Status
- Subscribed date
- Unsubscribed date (if applicable)
- Filename: `subscribers-YYYY-MM-DD.csv`

## Security Considerations

✅ Email validation on both client and server
✅ SQL injection prevention via parameterized queries
✅ Rate limiting recommended for production
✅ Admin routes should be protected with authentication

## Future Enhancements

🔜 Email confirmation (double opt-in)
🔜 Automated welcome emails
🔜 Newsletter template management
🔜 Send newsletters from admin panel
🔜 Subscriber analytics and metrics
🔜 Segmentation by interests
🔜 Scheduled email campaigns

## Maintenance

### Clear Test Subscribers

```sql
DELETE FROM subscribers WHERE email LIKE '%@test.com';
```

### Get Subscriber Count

```sql
SELECT status, COUNT(*) as count
FROM subscribers
GROUP BY status;
```

### Recent Subscriptions

```sql
SELECT * FROM subscribers
ORDER BY subscribed_at DESC
LIMIT 10;
```

## Troubleshooting

**Issue:** Migration fails

- Check database credentials in `.env.local`
- Ensure MySQL server is running
- Verify database exists

**Issue:** API returns 500 error

- Check server logs for SQL errors
- Verify database connection
- Ensure table exists

**Issue:** No emails appearing in admin

- Check if subscription API is being called
- Verify database has records
- Check status filter in admin panel

## Files Created/Modified

**New Files:**

- `db/migrations/2026-02-14-create-subscribers.sql`
- `app/api/subscribe/route.js`
- `app/api/unsubscribe/route.js`
- `app/api/admin/subscribers/route.js`
- `app/admin/subscribers/page.jsx`
- `app/(website)/unsubscribe/page.jsx`
- `scripts/run-subscriber-migration.js`

**Modified Files:**

- `components/Home/Newsletter.jsx` - Added functionality
- `components/admin/Sidebar.jsx` - Added Subscribers link
- `components/Common/Footer.jsx` - Added Unsubscribe link

## Support

For issues or questions, refer to the project documentation or contact the development team.
