const pgp = require("pg-promise")();
const db = pgp(process.env.POSTGRESQL_URI);
const deleteTable = async () => {
  try {
    await db.none("DROP TABLE IF EXISTS posts");
    console.log("deleted");
    return true;
  } catch (error) {
    console.error("Error deleting table", error);
    return false;
  }
};
// Function to create the database table
const createTable = async () => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        caption TEXT,
        created_at TIMESTAMP NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        image_url TEXT NOT NULL,
        image_alt TEXT
      );
    `);
    console.log("Table created successfully");
    return true;
  } catch (error) {
    console.error("Error creating table", error);
    return false;
  }
};

// Function to append a new record to the table
// Function to append a new record to the table
const appendRecord = async (post) => {
  try {
    await db.none(
      `
        INSERT INTO posts (id, caption, created_at, uploaded_at, image_url, image_alt) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        post.id,
        post.caption,
        post.createdAt,
        post.uploadedAt,
        post.imageUrl,
        post.imageAlt,
      ]
    );
    console.log("Record appended successfully");
    return true;
  } catch (error) {
    console.error("Error appending record", error);
    return false;
  }
};

// Function to get a record by its ID
const getRecordById = async (id) => {
  try {
    const record = await db.one(
      `
      SELECT * FROM posts WHERE id = $1
    `,
      [id]
    );
    console.log("Record retrieved successfully");
    return record;
  } catch (error) {
    console.error("Error retrieving record", error);
  }
};

// Function to get all records from the table
const getAllRecords = async () => {
  try {
    const records = await db.any(`
      SELECT * FROM posts
    `);
    console.log("Records retrieved successfully");
    return records;
  } catch (error) {
    console.error("Error retrieving records", error);
  }
};

// Usage examples:
// Create table
// createTable();

// Append record
// appendRecord(data);

// Get record by ID
// getRecordById(1).then(record => console.log(record));

// Get all records
// getAllRecords().then(records => console.log(records));

module.exports = {
  deleteTable,
  createTable,
  appendRecord,
  getRecordById,
  getAllRecords,
};
