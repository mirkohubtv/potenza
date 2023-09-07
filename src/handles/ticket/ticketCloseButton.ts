import {
	ActionRowBuilder,
	ButtonInteraction,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import ticketClose from '../../ticket/close.js';
import { formatCode, formatUser } from '../../utils.js';

export async function handleTicketCloseButton(interaction: ButtonInteraction) {
	const embed = interaction.message.embeds.at(0)!;

	const userId = embed.description!.split('<@')[1].split('>')[0]!;
	const user = await interaction.client.users.fetch(userId);
	if (!user) {
		return await interaction.reply({
			content: '<:FNIT_Stop:857617083185758208> **User not found**',
			ephemeral: true,
		});
	}

	const modal = new ModalBuilder().setCustomId(`close-${userId}`).setTitle('Chiusura ticket');

	// Create the text input components
	const descriptionInput = new TextInputBuilder()
		.setCustomId('reason')
		.setLabel('Motivazione')
		.setStyle(TextInputStyle.Paragraph);

	// Add inputs to the modal
	modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput));

	// Show the modal to the user
	await interaction.showModal(modal);

	const submitted = await interaction.awaitModalSubmit({
		time: 5 * 60 * 1000,
		filter: ({ user }) => user.id === interaction.user.id,
	});

	if (submitted) {
		const reason = submitted.fields.getTextInputValue('reason');

		const attachment_url = await ticketClose(interaction, user!, reason);

		console.log(attachment_url);

		const description = embed.description?.split('**Channel:**')[0];

		const updateEmbed = new EmbedBuilder()
			.setColor('#00e3ff')
			.setTitle(`:green_circle: Richiesta chiusa`)
			.setDescription(
				description +
					`**Close Reason:** ${formatCode(reason)}\n**Log:** [${formatCode(
						'Log URL'
					)}](https://vindertech.itzmirko.it/file/?url=${attachment_url})`
			)
			.setFields(embed.fields);

		await interaction.message.edit({
			embeds: [updateEmbed],
			components: [],
		});

		await submitted.reply({
			content: `**Ticket chiuso per ${formatUser(user!.id)} con motivazione: ${formatCode(reason)}**`,
			ephemeral: true,
		});
	}
}