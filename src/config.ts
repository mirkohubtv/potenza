import { readdirSync } from 'fs';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { MongoClient } from 'mongodb';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
	],
});

const mongo = new MongoClient(process.env.MONGO as string);
client.mongo = {
	block: mongo.db(process.env.MONGO_DB).collection('ticket-block'),
	descriptions: mongo.db(process.env.MONGO_DB).collection('ticket-descriptions'),
	logs: mongo.db(process.env.MONGO_DB).collection('logs'),
};

client.commands = new Collection();
const commandFiles = readdirSync('./dist/commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	import(`../dist/commands/${file}`).then((command) => client.commands.set(command.data.name, command));
}

const eventFiles = readdirSync('./dist/events').filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	import(`../dist/events/${file}`).then((event) => {
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	});
}

export default client;
