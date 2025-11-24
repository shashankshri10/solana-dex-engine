// drizzle.config.docker.js
// This file is used specifically for the Docker container environment

module.exports = {
    // In Docker, we point to the compiled JS file in 'dist'
    schema: "./dist/models/schema.js",
    out: "./src/migrations",
    dialect: "postgresql",
    dbCredentials: {
      url: process.env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
  };