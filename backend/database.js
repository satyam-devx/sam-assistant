const fs = require('fs');
const initSqlJs = require('sql.js');

async function setupDB() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();

    console.log("🛠️ Creating SAM Database (Pure JS mode)...");

    const schema = `
        CREATE TABLE User (
            id TEXT PRIMARY KEY,
            name TEXT DEFAULT 'Student',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE Task (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            completed INTEGER DEFAULT 0,
            priority TEXT DEFAULT 'medium'
        );
    `;

    db.run(schema);

    // Save database to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync('./prisma/sam.db', buffer);

    console.log("✅ SAM Database created successfully at ./prisma/sam.db");
}

setupDB().catch(console.error);
