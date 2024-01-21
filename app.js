// Imports
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const Data = require('./queries.json');
require('dotenv').config({ path: './.env' });

// Constants
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
const player = new Player(client);
initializeExtractors();

// Functions

/**
 * @summary Loads the default extractors (except for YouTube).
 * @async
 * @remarks Discord bots are not allowed to stream from YouTube, so we must manually exclude it here.
 */
async function initializeExtractors() {
   await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');
}

/**
 * @summary Plays a random song from the queries specified in queries.json.
 * This function will attempt to play again if it is unable to play due to an exception (e.g. the song cannot be found on YouTube).
 * This will increment errors until errors is greater than 10, after which it will stop attempting to play.
 * @async
 * @param {VoiceState} state - A VoiceState object representing the voice state of a Guild Member
 * @param {number} errors - The number of errors that have been encountered while attempting to play (optional)
 * @returns {GuildQueue} A queue containing the track and state metadata associated with the song chosen from queries.json
 */
async function play(state, errors) {
  let rand = Math.floor(Math.random() * Data.queries.length);
  
  try {
    let dataOut = await player.play(state.channel, Data.queries[rand], { searchEngine: process.env.QUERY_TYPE, nodeOptions: { leaveOnEmpty: true, metadata: state }, connectionOptions: { deaf: false } });
    return dataOut.queue;
  }
  catch (error) {
    console.error(error);
    errors = (errors === undefined) ? (1) : (errors + 1);
    if (errors <= 10) {
      play(state, errors);
    }
    else {
      console.log('Maximum failed play attempts exceeded.');
    }
  }
}

/**
 * @summary Plays a random song after a period of time.
 * The amount of time that elapses before playback begins is equal to the amount of time specified in
 * environment variable WAIT_TIME. Playback does not begin if the right GuildMembers are not present in
 * the channel after the wait time has elapsed.
 * @async
 * @param {VoiceState} state - A VoiceState object representing the voice state of a Guild Member
 * @param {VoiceChannel} channel - The VoiceChannel of the channel to play the song in
 */
async function playAfterWaitTime(state, channel) {
  await setTimeout(() => {
  if (channel && rightMembersArePresent(channel.members)) {
        play(state);
      }
      else {
        console.log('Mission failed. We\'ll get \'em next time.');
      }
    }, process.env.WAIT_TIME);
}

/**
 * @summary Plays a random song if the target member is in position.
 * The function first decides whether that member is the target member and is alone in a voice channel.
 * If so, plays a random song from queries.json in that voice channel.
 * @param {VoiceState} state - A VoiceState object representing the voice state of a Guild Member
 */
function playIfVoiceStateValid(state) {
  if (state.channelId !== null && rightMembersArePresent(state.channel.members)) {
    if (state.channel.members.size < 2) {
      console.log(`${state.channel.members.get(process.env.TARGET_USER_ID).user.username} is in position, executing protocol D.CH3353.`);
      
      playAfterWaitTime(state, client.channels.cache.get(state.channelId));
    }
    else {
      console.log('Protocol D.CH3353 is now in action.');
    }
  }
  else {
    stopPlayback(state);
  }
}

/**
 * @summary Stops all playback from this bot in a particular channel.
 * The function does this by first finding the queue associated with the Guild of the VoiceState.
 * Then, it deletes it if the channel matches the VoiceState and it has not already been deleted.
 * @param {VoiceState} state - A VoiceState object representing the voice state of a Guild Member
 */
function stopPlayback(state) {
  const queue = player.nodes.get(state.guild.id);
  if (queue && !queue.deleted && queue.channel && queue.channel.id === state.channelId) {
    queue.delete();
  }
}

/**
 * @summary Determines if the target member is in position.
 * This is true if the target member is either the only GuildMember in members,
 * or if they are only accompanied by the bot.
 * @param {Collection<Snowflake, GuildMember>} members - A Collection of GuildMember objects to search over
 * @returns {boolean} true if the target player is present and is either alone or only accompanied by the bot, false otherwise
 */
function rightMembersArePresent(members) {
  let targetPresent = 0;
  let botPresent = 0;
  
  members.forEach(member => {
    targetPresent = (member.id === process.env.TARGET_USER_ID) ? (1) : (targetPresent);
    botPresent = (member.id === process.env.APP_ID) ? (1) : (botPresent);
  });
  
  return (targetPresent === 1 && targetPresent + botPresent === members.size) ? (true) : (false);
}

// Events
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  console.log(`${newState.channelId}: User ${newState.member.user.username} joined the channel.`);
  playIfVoiceStateValid(newState);
  
  if (oldState.channelId !== newState.channelId) {
    playIfVoiceStateValid(oldState);
  }
});

player.events.on('emptyQueue', (queue) => {
  playAfterWaitTime(queue.metadata, client.channels.cache.get(queue.metadata.channelId));
});

client.login(process.env.DISCORD_TOKEN);
