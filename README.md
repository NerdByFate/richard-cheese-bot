# Function

Meet Richard Cheese, a Discord bot built on Node.js. Mr. Cheese will lock on to the member you indicate in environment variable TARGET_USER_ID. When that member has been sitting in a voice channel alone for the defined amount of time, Mr. Cheese will then greet them with one of his cover tracks. Don't ask why -- he just does it.

# Build

Environment variables:
| Name           | Description                                                                                                                                                                                                                                                |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| APP_ID         | The application ID of the Discord application                                                                                                                                                                                                              |
| DISCORD_TOKEN  | The bot token from the Discord application                                                                                                                                                                                                                 |
| TARGET_USER_ID | The user ID of the player that Richard should follow (in Discord, right click -> Copy ID)                                                                                                                                                                  |
| WAIT_TIME      | The amount of time that Richard should wait before attempting to join the voice channel                                                                                                                                                                    |
| QUERY_TYPE     | Specifies which service should be used to find tracks (see [discord-player's type.ts enum](https://github.com/Androz2091/discord-player/blob/b677fbf659a2f30535ed57bf0abc9adccc6339ad/packages/discord-player/src/types/types.ts#L207) for valid values)   |

You can specify queries for tracks to play in the "queries" array of queries.json. Queries will be ran using the service you specified in QUERY_TYPE. YouTube is explicitly banned, so if you use a YouTube query type, you will experience errors. Use 'file' as QUERY_TYPE and replace the queries in queries.json with paths to load from files.
