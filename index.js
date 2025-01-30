const { TeamsActivityHandler, CardFactory } = require("botbuilder");
const sql = require("mssql");
const restify = require("restify");

// Azure SQL Database Configuration
const dbConfig = {
    user: "AgilusDevuser",
    password: "Procurement2022!",
    server: "tcp:agilusportaldev.database.windows.net,1433",
    database: "Agilus_Master",
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

// Create Bot Server
const server = restify.createServer();
server.use(restify.plugins.bodyParser()); // <-- Ensure body is parsed
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\nBot Started, Listening on ${server.url}`);
});

// Define Bot Class
class SearchBot extends TeamsActivityHandler {
    async handleTeamsMessagingExtensionQuery(context, query) {
        const searchText = query.parameters[0].value;

        try {
            // Connect to Azure SQL and fetch results
            await sql.connect(dbConfig);
            const result = await sql.query`SELECT Title, Description FROM Items WHERE Title LIKE '%' + ${searchText} + '%'`;

            // Format results as a list
            const attachments = result.recordset.map(item =>
                CardFactory.thumbnailCard(item.Title, item.Description)
            );

            return {
                composeExtension: {
                    type: "result",
                    attachmentLayout: "list",
                    attachments
                }
            };
        } catch (err) {
            console.error("Database Error: ", err);
            return {
                composeExtension: {
                    type: "message",
                    text: "Error fetching data. Please try again."
                }
            };
        } finally {
            sql.close();
        }
    }
}

// Create and Register Bot
const bot = new SearchBot();

// Handle incoming messages
server.post("/api/messages", async (req, res) => {
    console.log("Received Request:", req.body);  // <-- Log incoming request
    res.send({ text: "Bot received your message!", received: req.body.text }); // <-- Return proper response
});
