# TallyLogger
Logging switcher via TallyArbiter - export to AAF AVB OTIO and XML for PP

Dev - working within a Venv within TallyLogger folder (`source .venv/bin/activate`). 

The Venv requires imports of modules - `aaf` `opentimelineio` and `avb`.

Entry point is terminal command `node server.js` - node.js application which runs an http server and populates a web page with buttons to turn on TCP or UDF (run tally arbiter to generate Tally signals to test).
 
NB aaf and avb and otio exports have destination hard coded in `helpers/python-scripts.js`

Tally events are logged


## ChatGPT short description:

In the TSL tally logging system, an HTML table on the front end allows the user to input or modify tally-related data, such as sources and their associated colors. This table is linked to a Prisma-managed SQLite database on the backend. When data is submitted via the HTML form, it is processed and mapped to the corresponding Prisma SQL table. This table stores tally events, including source names and colors, which are logged in real-time. The tally data is also retrieved from the database and presented back to the user in an HTML table for monitoring and verification. This bidirectional flow keeps the tally system synchronized between the front-end display and the back-end logging system.

## ChatGPT tech description:

To achieve this bidirectional flow between an HTML table on the front end and a Prisma-backed SQLite database on the back end in a TSL tally logging system, several key technologies are used: Node.js for the server, Prisma ORM for database management, AJAX for asynchronous communication, and Promises for handling async operations.

### 1. **Node.js Backend with Express**
   - The backend is built using Node.js and Express. This provides RESTful API endpoints that handle incoming HTTP requests. These endpoints allow the front end to send or retrieve data from the Prisma-managed SQLite database. 
   
   - Example routes:
     - **GET** request to fetch the current tally data (e.g., `GET /api/tallies`).
     - **POST** or **PUT** request to update tally events and source data (e.g., `POST /api/source`).

### 2. **Prisma ORM**
   - Prisma is used to interact with the SQLite database. The Prisma schema defines models like `TSLMessage`, `Source`, and `Color` to map the tally-related data.
   - When the front end sends an update (via AJAX), Prisma executes CRUD operations on the database (e.g., `prisma.source.create()` for inserting new sources or `prisma.tslMessage.update()` for logging tally events).
   - Prisma returns Promises for all database operations, so the API routes use `async/await` to handle them.

### 3. **AJAX for Asynchronous Communication**
   - The front end uses AJAX (typically via `fetch` API or `XMLHttpRequest`) to send asynchronous requests to the Node.js server. This allows the HTML table to send updates (e.g., new tally source data) without reloading the page.
   - Example: When the user updates a row in the HTML table, an AJAX request is triggered to send the updated data to the server. 

   ```javascript
   fetch('/api/source', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ name: 'Source 1', color: '#FF0000' })
   }).then(response => response.json())
     .then(data => console.log(data))
     .catch(err => console.error(err));
   ```

### 4. **Promises & Async/Await**
   - The Node.js server relies on promises to handle asynchronous tasks such as database queries and HTTP responses.
   - For example, in a POST route to update a source:

   ```javascript
   app.post('/api/source', async (req, res) => {
     try {
       const newSource = await prisma.source.create({
         data: req.body
       });
       res.json(newSource);
     } catch (error) {
       res.status(500).send(error);
     }
   });
   ```

   - Using `async/await` simplifies managing asynchronous code and ensures proper error handling.

### 5. **Displaying Data in HTML Table**
   - Once data is inserted or updated in the SQLite database, it can be retrieved and presented in an HTML table. For example, a `GET /api/tallies` request fetches all tally events, and the server responds with JSON data that is rendered in the HTML table using JavaScript.

   ```javascript
   fetch('/api/tallies')
     .then(response => response.json())
     .then(data => {
       // Loop through data to dynamically populate the table
       data.forEach(tally => {
         // Code to append tally rows to the HTML table
       });
     });
   ```

### 6. **Real-time Updates (Optional)**
   - If real-time updates are required, WebSockets or a polling mechanism can be used to refresh the HTML table as new tally events are logged. In this case, the front end would listen for WebSocket messages from the server and update the DOM accordingly.

This structure ensures a fluid connection between the HTML front end, where users interact with tally data, and the Node.js backend, which stores and manages this data via Prisma and SQLite.