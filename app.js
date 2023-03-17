// Imports
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const Data = require('./queries.json');

// Constants
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });
const player = new Player(client);

// Variables
var errors = 0;

// Functions
async function play(state, guildID) {
  let rand = Math.floor(Math.random() * Data.queries.length);
  
  try {
    let dataOut = await player.play(state.channel, Data.queries[rand], { searchEngine: 'youtube', nodeOptions: { leaveOnEmpty: true, metadata: state }, connectionOptions: { deaf: false } });
    errors = 0;
    return dataOut.queue;
  }
  catch (error) {
    console.error(error);
    errors++;
    if (errors <= 10) {
      play(state);
    }
    else {
      console.log('Maximum failed searches exceeded.');
      errors = 0;
    }
  }
}

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

function voiceStateUpdateCallback(oldState, newState) {
  console.log(`${newState.channelId}: User ${newState.member.user.username} joined the channel.`);
  if (newState.channelId !== null && rightMembersArePresent(newState.channel.members)) {
    if (newState.member.id === process.env.TARGET_USER_ID) {
      console.log(`${newState.member.user.username} is in position, executing protocol D.CH3353.`);
      
      playAfterWaitTime(newState, client.channels.cache.get(newState.channelId))
    }
    else {
      console.log('Protocol D.CH3353 is now in action.')
    }
  }
  else {
    stopPlayback(newState);
  }
}

function stopPlayback(state) {
  const queue = player.nodes.get(state.guild.id);
  if (queue && !queue.deleted) queue.delete();
}

function rightMembersArePresent(members) {
  let targetPresent = 0;
  let richardPresent = 0;
  
  members.forEach(member => {
    targetPresent = (member.id === process.env.TARGET_USER_ID) ? (1) : (targetPresent);
    richardPresent = (member.id === process.env.APP_ID) ? (1) : (richardPresent);
  });
  
  return (targetPresent === 1 && targetPresent + richardPresent === members.size) ? (true) : (false);
}

// Events
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("voiceStateUpdate", voiceStateUpdateCallback);

player.events.on('emptyQueue', (queue) => {
  playAfterWaitTime(queue.metadata, client.channels.cache.get(queue.metadata.channelId));
});

client.login(process.env.DISCORD_TOKEN);
