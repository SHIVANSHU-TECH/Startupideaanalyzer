# Firestore Indexes Required

This document lists the Firestore indexes required for optimal query performance in the Startup Idea Analyzer application.

## Required Composite Indexes

### 1. Ideas Collection - User Ideas Query
**Collection:** `ideas`
**Fields:**
- `userId` (Ascending)
- `createdAt` (Descending)

**Purpose:** Enables efficient querying of user's ideas sorted by creation date

**Query:** 
```typescript
query(
  collection(db, 'ideas'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
)
```

**Create Index:**
- Automatically: Use the link provided in the error message
- Manually: Firebase Console → Firestore Database → Indexes → Create Index

### 2. Ideas Collection - Public Ideas (if needed)
**Collection:** `ideas`
**Fields:**
- `isPublic` (Ascending)
- `likes` (Descending)

**Purpose:** For community features showing popular public ideas

### 3. Reports Collection - User Reports
**Collection:** `reports`
**Fields:**
- `userId` (Ascending)
- `createdAt` (Descending)

**Purpose:** Enables efficient querying of user's reports

## Single Field Indexes (Auto-created)

Firestore automatically creates single-field indexes for:
- `userId`
- `createdAt`
- `status`
- `category`
- `isPublic`

## Index Management Commands

### Create Index via Firebase CLI:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Create firestore.indexes.json:
```json
{
  "indexes": [
    {
      "collectionGroup": "ideas",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Performance Notes

- **Composite indexes** are required for queries combining `where` and `orderBy` on different fields
- **Single field indexes** are sufficient for simple queries
- **Array contains queries** require array-contains indexes
- **Missing indexes** will cause query failures in production mode

## Monitoring

Check index usage in Firebase Console:
1. Go to Firestore Database
2. Click on "Usage" tab
3. Monitor index performance and recommendations

## Troubleshooting

If you encounter index errors:
1. Check the error message for the auto-generated index creation link
2. Create the index manually in Firebase Console
3. Wait 1-2 minutes for index creation to complete
4. Retry the operation

For development, the fallback query in `getUserIdeas()` will work without indexes by sorting in memory, but this is less efficient and not recommended for production.