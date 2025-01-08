// Import the Express library
const express = require('express');
const app = express();

// Set the port
const PORT = process.env.PORT || 3000;

// Serve the welcome page
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Welcome Page</title>
      </head>
      <body>
        <h1>Welcome to Invesment App!</h1>
        <p>This is a test app for deployment.</p>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
