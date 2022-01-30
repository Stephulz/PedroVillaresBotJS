// Require the necessary discord.js classes
const { Client, Intents } = require("discord.js");
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

// Yt and voice
const DiscordVoice = require("@discordjs/voice");
const { stream } = require("play-dl");
const yt = require("youtube-search-without-api-key");
const player = DiscordVoice.createAudioPlayer();

// Create a new client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready! " + new Date().toISOString());
});

// Yt vars
const ytUrlQueue = [];
let playing = false;

// Reply to command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  switch (commandName) {
    case PING:
      await interaction.reply("Pong!");
      break;

    case SERVER:
      await interaction.reply(
        `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
      );
      break;

    case USER:
      await interaction.reply("TBA User info.");
      break;

    case DC:
      const dcChannel = interaction.member.voice.channel;
      DiscordVoice.getVoiceConnection(dcChannel.guildId).disconnect();
      await interaction.reply("Disconnected from channel " + dcChannel.name);
      break;

    case LIST:
      await interaction.reply(
        "Current youtube queue " +
          (ytUrlQueue.length > 0 ? ytUrlQueue : "**is empty**")
      );
      break;

    case PLAY:
      try {
        const url = options.data[0].value;
        checkUrl = new URL(url);

        if (playing) {
          ytUrlQueue.push(url);
        } else {
          playFromYt(url, interaction);
        }
        await interaction.reply("Added to queue: " + url);
      } catch (_) {
        const searchValue = options.data[0].value;

        yt.search(searchValue).then(async (res) => {
          const finalUrl = res[0].url;

          if (playing) {
            ytUrlQueue.push(finalUrl);
          } else {
            playFromYt(finalUrl, interaction);
          }
          await interaction.reply(
            "Added to queue: " +
              finalUrl +
              " \nFrom search: **" +
              searchValue +
              "**"
          );
        });
      }
      break;

    case SKIP:
      player.stop();
      if (ytUrlQueue.length > 0) {
        playFromYt(ytUrlQueue.at(-1), interaction);
        await interaction.reply("Resume queue");
      } else {
        await interaction.reply("Empty queue");
      }
      break;

    case PAUSE:
      player.pause();
      await interaction.reply("Paused");
      break;

    case RESUME:
      player.unpause();
      await interaction.reply("Unpaused");
      break;

    default:
      break;
  }
});

// Fetch from yt, play and handle queue
const playFromYt = async (url, interac) => {
  playing = true;
  const playStream = await stream(url);

  const channel = interac.member.voice.channel;

  const resource = DiscordVoice.createAudioResource(playStream.stream, {
    inputType: playStream.type,
  });

  const connection = DiscordVoice.joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guildId,
    adapterCreator: interac.guild.voiceAdapterCreator,
  });

  ytUrlQueue.pop();
  player.play(resource);
  connection.subscribe(player);

  // Handle queue or dc
  player.on(DiscordVoice.AudioPlayerStatus.Idle, () => {
    if (ytUrlQueue.length > 0) {
      console.log(
        "Queue advances: " + ytUrlQueue + " playing: " + ytUrlQueue.at(-1)
      );
      playFromYt(ytUrlQueue.at(-1), interac);
    } else {
      console.log("Queue has ended, dc from channel");
      playing = false;
      //connection.destroy();
    }
  });
};

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
