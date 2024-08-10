# Grand Central Parkway Discord Bot

This is a custom Discord bot built for the World of Warcraft guild **Grand Central Parkway**. The bot is designed to assist in guild management and enhance the functionality of the guild's Discord server by providing advanced features tailored to the needs of the guild. Additionally, the bot allows members to create custom slash commands dynamically, enabling quick access to frequently used resources.

## Features

- **Guild Management**: Automates various tasks such as raid reminders, daylight savings checks, and other administrative functions.
- **Custom Slash Commands**: Allows members to save key-value pairs to dynamically create slash commands for quick access to resources.
- **World of Warcraft Integration**: Fetches and displays real-time information such as Mythic+ affixes, character details, and guild rankings.
- **WarcraftLogs Reminders**: Sends scheduled reminders for setting up WarcraftLogs before raids.
- **Daylight Savings Auto-Adjustment**: Automatically adjusts reminder schedules based on daylight savings status.
- **Server Status Monitoring**: Checks and reports the status of World of Warcraft servers.
- **Custom Reminders**: Set custom reminders for specific dates and times directly within Discord. (Work in Progress)

## Commands Overview

### Guild Management
- `/suggest`: Send a suggestion to the guild's suggestion channel.
- `/enablelogreminder`: Enable the automatic WarcraftLogs reminder.
- `/disablelogreminder`: Disable the automatic WarcraftLogs reminder.
- `/nextlogreminder`: Get the time of the next scheduled WarcraftLogs reminder.
- `/nextraid`: Get the time remaining until the next raid.
- `/dst`, `/dston`, `/dstoff`: Manage daylight savings settings.
- `/checkdst`: Check if the current daylight savings status matches the bot's setting.
- `/time`, `/date`: Get the current time or date.

### Custom Commands
- `/newkeyword`: Add a new custom keyword to the database.
- `/editkeyword`: Edit an existing custom keyword.
- `/deletekeyword`: Delete a custom keyword.
- **Dynamic Commands**: Once a keyword is added, it can be accessed as a command (e.g., `/myresource`).

### World of Warcraft Integration
- `/affixes`: Get the current Mythic+ affixes.
- `/affixdetails`: Get detailed descriptions of the current Mythic+ affixes.
- `/char`: Retrieve character information from Raider.io.
- `/guildrank`: Get the current rank of the guild on WoWProgress.

### Server Monitoring
- `/serverstatus`: Monitor the status of World of Warcraft servers.
- `/pinglist`: View the list of users to be notified when the server status changes.
- `/clearpinglist`: Clear the ping list.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License

This project is licensed under the MIT License.
