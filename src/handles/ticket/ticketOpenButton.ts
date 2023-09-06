import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, TextChannel } from 'discord.js';
import ticketOpen from '../../ticket/open.js';
import { execute, formatUser } from '../../utils.js';

export async function handleTicketOpenButton(interaction: ButtonInteraction) {
	const embed = interaction.message.embeds.at(0)!;

	const userId = embed.description!.split('<@')[1].split('>')[0]!;
	const user = await interaction.client.users.fetch(userId);
	if (!user) {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});
	}

	const ticketId = await ticketOpen(interaction, user);
	const updateEmbed = new EmbedBuilder()
		.setColor('#00e3ff')
		.setTitle(`:blue_circle: Richiesta presa in carico da ${interaction.user.tag}`)
		.setDescription(
			embed.description + `\n**Staff:** ${formatUser(interaction.user.id)}\n**Channel:** <#${ticketId}>`
		)
		.setFields(embed.fields);
	await interaction.update({
		embeds: [updateEmbed],
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setLabel('Chiudi Ticket').setStyle(ButtonStyle.Danger).setCustomId('ticket-close')
			),
		],
	});
}
