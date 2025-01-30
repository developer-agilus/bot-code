const { TeamsActivityHandler, CardFactory, MessageFactory } = require("botbuilder");
const restify = require("restify");

// Create bot server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.PORT || 3978, () => {
    console.log(`\nBot is running on port ${process.env.PORT || 3978}`);
});

// Define Bot Class
class TeamsBot extends TeamsActivityHandler {
    constructor() {
        super();
        
        // Handle incoming messages from Teams
        this.onMessage(async (context, next) => {
            console.log("Received Message from Teams: ", context.activity.text);
            await context.sendActivity(MessageFactory.text(`You said: ${context.activity.text}`));
            await next();
        });

        // Handle Teams conversation update (e.g., when bot is added)
        this.onConversationUpdate(async (context, next) => {
            console.log("Bot added to Teams chat.");
            await next();
        });
    }
}

// Create bot instance
const bot = new TeamsBot();
server.post("/api/messages", async (req, res) => {
    await bot.run(req, res);
});
