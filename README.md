# Function

Meet Richard Cheese, a Discord bot built on Node.js. Mr. Cheese will lock on to the player you indicate in environment variable TARGET_USER_ID. When that player has been sitting in a voice channel alone for the defined amount of time, Mr. Cheese will then greet them with one of his cover tracks. Don't ask why -- he just does it.

# Build

Environment variables:
| Name           | Description                                                                               |
|----------------|-------------------------------------------------------------------------------------------|
| APP_ID         | The application ID of the Discord application                                             |
| DISCORD_TOKEN  | The bot token from the Discord application                                                |
| TARGET_USER_ID | The user ID of the player that Richard should follow (in Discord, right click -> Copy ID) |
| WAIT_TIME      | The amount of time that Richard should wait before attempting to join the voice channel   |

You can specify YouTube queries for tracks to play in the "queries" array of queries.json
