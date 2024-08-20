import { Collection } from 'discord.js';
import { Collection, Document } from 'mongodb';

declare module 'discord.js' {
	export interface Client {
		commands: Collection<unknown, any>;
		mongo: Collection<Document>;
		log_channel: TextChannel;
		color: string;
	}
}
