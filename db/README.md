# Database Import Script

This directory contains JSON files with dummy data and a script to import them into MongoDB.

## Files

- `members.json` - 10 dummy member/user accounts
- `admins.json` - 2 dummy admin accounts
- `videos.json` - 10 dummy video entries
- `comments.json` - 15 dummy comments
- `comment-replies.json` - 12 dummy comment replies
- `reviews.json` - 15 dummy reviews
- `video-metrics.json` - 10 video metrics entries
- `likes-dislikes.json` - 23 likes/dislikes entries

## Usage

### Prerequisites

1. Make sure your MongoDB connection string is set in your `.env` file:

   ```
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   ```

2. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

### Import Data

Run the import script:

```bash
node backend/db/import.data.js
```

Or if you're using npm scripts, you can add this to your `package.json`:

```json
{
  "scripts": {
    "import-data": "node backend/db/import.data.js"
  }
}
```

Then run:

```bash
npm run import-data
```

### What the Script Does

1. **Connects to MongoDB** using the connection string from your `.env` file
2. **Clears existing collections** (Members, Admins, Videos, Comments, Reviews, CommentReplies, VideoMetrics, LikesDislikes)
3. **Imports data in the correct order**:
   - Members and Admins (no dependencies)
   - Videos (references Members)
   - Comments and Reviews (reference Videos and Members)
   - Comment Replies (reference Comments and Members)
   - Video Metrics (reference Videos)
   - Likes/Dislikes (reference Members and various targets)

### Data Structure

The JSON files use index-based references that are automatically converted to MongoDB ObjectIds during import:

- `member_index` → References index in members array
- `video_index` → References index in videos array
- `comment_index` → References index in comments array
- `user_index` → References index in members array

### Notes

- **Passwords**: All dummy users have placeholder hashed passwords. In production, you should use proper password hashing.
- **ObjectIds**: The script automatically generates and maps ObjectIds for all references.
- **Duplicates**: The script handles duplicate likes/dislikes gracefully (skips them if they violate unique constraints).
- **Environment**: The script uses the `NODE_ENV` environment variable to load the appropriate `.env` file.

### Troubleshooting

1. **Connection Error**: Make sure MongoDB is running and the connection string is correct.
2. **Import Errors**: Check that all JSON files are valid and in the correct format.
3. **Duplicate Key Errors**: The script handles these automatically for likes/dislikes, but if you see errors for other collections, the data might already exist.

### Customization

To add more dummy data:

1. Edit the respective JSON file
2. Follow the same structure as existing entries
3. Use index-based references for relationships
4. Run the import script again

**Note**: Running the script will **clear all existing data** in the collections before importing. Comment out the `deleteMany` calls if you want to keep existing data.
