// MongoDB initialization script
// This script runs when MongoDB container starts for the first time

db = db.getSiblingDB('startup-idea-analyzer');

// Create collections with indexes for better performance
db.createCollection('users');
db.createCollection('ideas');
db.createCollection('reports');

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

// Create indexes for ideas collection
db.ideas.createIndex({ userId: 1 });
db.ideas.createIndex({ createdAt: -1 });
db.ideas.createIndex({ status: 1 });
db.ideas.createIndex({ category: 1 });
db.ideas.createIndex({ title: 'text', description: 'text' }); // Text search

// Create indexes for reports collection
db.reports.createIndex({ userId: 1 });
db.reports.createIndex({ ideaId: 1 });
db.reports.createIndex({ shareToken: 1 }, { unique: true });
db.reports.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// Create a sample admin user (remove in production)
if (db.users.countDocuments() === 0) {
    db.users.insertOne({
        name: "Admin User",
        email: "admin@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj.Sx.9Wza.K", // password: admin123
        subscription: {
            plan: "enterprise",
            status: "active"
        },
        preferences: {
            emailNotifications: true,
            analysisReminders: true,
            newsletterSubscription: true
        },
        stats: {
            totalIdeas: 0,
            analyzedIdeas: 0,
            totalReports: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
    });
    
    print("Sample admin user created: admin@example.com / admin123");
}

print("Database initialization completed successfully!");