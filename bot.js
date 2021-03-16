require("dotenv").config();

const { Client } = require("discord.js");
const ytdl = require("ytdl-core");
const PREFIX = "-";
const Discord = require("discord.js");

const client = new Client();
const bot = client;

const queue = new Map();

client.on("ready", async () => {
  console.log("Bot has started!");

  client.user.setPresence({
    activity: { name: "Nothing is playing!" },
    status: "online",
  });
});

client.on("message", async (message) => {
  if (message.author.bot) return null;

  if (!message.content.startsWith(PREFIX.toLowerCase())) return;

  let args = message.content.slice(PREFIX.length).trim().split(" ");

  if (!args[0]) return;
  const serverQueue = queue.get("605900262581993472");

  switch (args[0]) {
    case "play":
      const voiceChannel = message.member.voice.channel;

      if (!voiceChannel)
        return message.channel.send(`You must be in the voice channel!`);

      const songInfo1 = await ytdl.getInfo(args[1]);
      const song = {
        id: songInfo1.videoDetails.videoId,
      };

      if (!serverQueue) {
        const queueCon = {
          textChannel: message.channel,
          voiceChannel: voiceChannel,
          songs: [],
          connection: null,
          volume: 5,
          m_author: message.author,
          message: message,
          playing: true,
        };
        queue.set(message.guild.id, queueCon);

        queueCon.songs.push(song);

        try {
          play(message.guild, queueCon.songs[0], message, voiceChannel);
        } catch (err) {
          return;
        }
      } else {
        serverQueue.songs.push(song);
        return message.channel.send(`Added To Queue!`);
      }

      break;
    case "stop":
      const vc1 = message.guild.channels.cache.get("814008578436366357");
      const voiceChannel1 = message.member.voice.channel;

      if (!voiceChannel1)
        return message.channel.send(
          `You must be in the voice channel **${vc1.name}**`
        );

      if (voiceChannel1.id !== vc1.id)
        return message.channel.send(
          `You must be in the voice channel **${vc1.name}**`
        );
      voiceChannel1.leave();
      break;
  }
});
client.login(process.env.token);

async function play(guild, song, message, voiceChannel) {
  const serverQueue = queue.get(guild.id);
  if (serverQueue.time) while (serverQueue.time == false) {}

  const server = serverQueue.message.guild.id;

  if (!song) {
    serverQueue.voiceChannel.leave();
    client.user.setPresence({
      activity: { name: "Nothing is playing!", type: "PLAYING" },
      status: "online",
    });

    queue.delete(guild.id);
    serverQueue.textChannel.send(`No more songs in queue!`);
    return;
  }

  const songInfo = await ytdl.getInfo(`https://youtube.com/watch?v=${song.id}`);
  client.user.setPresence({
    activity: { name: songInfo.videoDetails.title, type: "LISTENING" },
    status: "dnd",
  });

  let a = songInfo.videoDetails.lengthSeconds * 1000;
  const sec = Math.floor((a / 1000) % 60).toString();
  const min = Math.floor((a / (1000 * 60)) % 60).toString();
  const hrs = Math.floor((a / (1000 * 60 * 60)) % 24).toString();

  let b = hrs.padStart(1, "0");

  let c = min.padStart(1, "0");

  let e = sec.padStart(1, "0");

  const embed = new Discord.MessageEmbed()
    .setFooter("Loged By: " + client.user.tag, client.user.avatarURL())
    .setTitle("Now Playing:")
    .setDescription(
      `Song: **${songInfo.videoDetails.title}**\n Duration: **${b} Hours**, **${c} Minutes**, **${e} Seconds** \n Views: **${songInfo.videoDetails.viewCount}** \n Published: **${songInfo.videoDetails.publishDate}** \n Likes: **${songInfo.videoDetails.likes}** \n Dislikes: **${songInfo.videoDetails.dislikes}** \n URL: **https://youtube.com/watch?v=${song.id}**`
    )
    .setURL(`https://youtube.com/watch?v=${song.id}`)
    .setImage(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)

    .setAuthor(
      songInfo.videoDetails.author.name,
      songInfo.videoDetails.author.thumbnails[0].url,
      `https://www.youtube.com/channel/${songInfo.videoDetails.channelId}`
    )

    .setColor("RANDOM")
    .setThumbnail(bot.user.avatarURL())

    .setTimestamp()

    .setFooter(
      `Requested By: ${message.author.tag}`,
      message.author.avatarURL({ dynamic: true })
    );
  // await message.channel.send("", { files: [res] });

  var playmsg = await serverQueue.textChannel
    .send(embed)
    .catch((err) => console.log("Error"));

  const PRUNING = false;
  const filter = (reaction, user) => user.id !== message.client.user.id;

  var connection = await serverQueue.voiceChannel.join();
  serverQueue.connection = await voiceChannel.join();
  let video = "hi";

  const dispatcher = await serverQueue.connection
    .play(ytdl(`https://youtube.com/watch?v=${song.id}`), {
      quality: "highestaudio",
      highWaterMark: 1 << 25,
      filter: "audioonly",
    })

    .on("finish", () => {
      serverQueue.voiceChannel.leave();
      // if (!serverQueue.loop && !serverQueue.repeat) {
      serverQueue.songs.shift();

      play(guild, serverQueue.songs[0], message, serverQueue.voiceChannel);
      // } else {
      //   if (!serverQueue.repeat) {
      //     handleVideoloop(
      //       serverQueue.songs[0],
      //       serverQueue.message,
      //       serverQueue.voiceChannel,
      //       lang,
      //       lang2
      //     );
      //     serverQueue.songs.shift();
      //     play(
      //       guild,
      //       serverQueue.songs[0],
      //       message,
      //       serverQueue.voiceChannel,
      //       lang,
      //       lang2
      //     );
      //   } else {
      //     play(
      //       guild,
      //       serverQueue.songs[0],
      //       message,
      //       serverQueue.voiceChannel,
      //       lang,
      //       lang
      //     );
      //   }
      // }
    })

    .on("error", (error) => {
      console.log(error);
      // handleVideoErr(
      //   serverQueue.songs[0],
      //   serverQueue.message,
      //   serverQueue.voiceChannel,
      //   lang,
      //   lang2
      // );
      // serverQueue.songs.shift();
      // play(
      //   guild,
      //   serverQueue.songs[0],
      //   message,
      //   serverQueue.voiceChannel,
      //   lang,
      //   lang2,
      //   bot
      // );
    });

  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}
