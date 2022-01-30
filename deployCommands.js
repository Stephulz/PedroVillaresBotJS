const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const {
  PING,
  SERVER,
  USER,
  DC,
  PLAY,
  LIST,
  SKIP,
  PAUSE,
  RESUME,
} = require("./commands");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder().setName(PING).setDescription("Replies with pong!"),
  new SlashCommandBuilder()
    .setName(SERVER)
    .setDescription("Replies with server info!"),
  new SlashCommandBuilder()
    .setName(USER)
    .setDescription("Replies with user info!"),
  new SlashCommandBuilder()
    .setName(PLAY)
    .setDescription("Play youtube video")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Video url or title to be played")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName(LIST)
    .setDescription("Shows current youtube queue"),
  new SlashCommandBuilder()
    .setName(DC)
    .setDescription("Disconnects from channel"),
  new SlashCommandBuilder().setName(SKIP).setDescription("Skip current music"),
  new SlashCommandBuilder()
    .setName(PAUSE)
    .setDescription("Pause current music"),
  new SlashCommandBuilder()
    .setName(RESUME)
    .setDescription("Resume currently paused music"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

rest
  .put(
    Routes.applicationGuildCommands(
      process.env.APPLICATION_ID,
      process.env.BDMM_GUILD_ID
    ),
    {
      body: commands,
    }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);

/*  rest
  .put(Routes.applicationCommands(process.env.APPLICATION_ID), {
    body: commands,
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);*/
