const { REST, Routes } = require('discord.js');
const { clientId, guildId, apiKey } = require('./config.json');
const helper = require('./helper.js');

let dictionary = helper.readJson()

const permissionSettings = {
        default_member_permissions: false, // This sets the command to be disabled by default
        permissions: [
            {
                id: '453698550174318623', // Replace with your admin role ID
                type: 1, // Role type
                permission: true,
            },
        ],
}

const commands = [
    {
        name: 'suggest',
        description: 'Sends an anonymous suggestion',
        options: [
            {
                name: 'message',
                type: 3, // STRING
                description: 'The suggestion message',
                required: true
            }
        ]
    },
    {
        name: 'newkeyword',
        description: 'Creates a new keyword',
        options: [
            {
                name: 'keyword',
                type: 3, // STRING
                description: 'The new keyword',
                required: true
            },
            {
                name: 'value',
                type: 3, // STRING
                description: 'The value for the keyword',
                required: true
            },
            {
                name:'description',
                type: 3, // STRING
                description: 'Description for the keyword',
                required: true
            }
        ]
    },
    {
        name: 'editkeyword',
        description: 'Edits an existing keyword',
        options: [
            {
                name: 'keyword',
                type: 3, // STRING
                description: 'The keyword to edit',
                required: true
            },
            {
                name: 'value',
                type: 3, // STRING
                description: 'The new value for the keyword',
                required: true
            },
            {
                name:'description',
                type: 3, // STRING
                description: 'Description for the keyword',
                required: true
            }
        ]
    },
    {
        name: 'deletekeyword',
        description: 'Deletes a keyword',
        options: [
            {
                name: 'keyword',
                type: 3, // STRING
                description: 'The keyword to delete',
                required: true
            }
        ]
    },
    {
        name: 'affixes',
        description: 'Displays the current Mythic+ Affixes'
    },
    {
        name: 'affixdetails',
        description: 'Displays detailed information about the current Mythic+ Affixes'
    },
    {
        name: 'char',
        description: 'Displays character information',
        options: [
            {
                name: 'name',
                type: 3, // STRING
                description: 'The character name',
                required: true
            },
            {
                name: 'realm',
                type: 3, // STRING
                description: 'The realm of the character',
                required: false
            }
        ]
    },
    {
        name: 'guildrank',
        description: 'Displays the guild rank'
    },
    {
        name: 'nextlogreminder',
        description: 'Displays the next log reminder time'
    },
    {
        name: 'enablelogreminder',
        description: 'Enables the WarcraftLogs reminder',
        ...permissionSettings
    },
    {
        name: 'disablelogreminder',
        description: 'Disables the WarcraftLogs reminder',
        ...permissionSettings
        
    },
    {
        name: 'dst',
        description: 'Displays the current daylight savings time status',
        ...permissionSettings
    },
    {
        name: 'checkdst',
        description: 'Checks and updates the daylight savings time status',
        ...permissionSettings
    },
    {
        name: 'dston',
        description: 'Manually sets daylight savings time to on',
        ...permissionSettings
    },
    {
        name: 'dstoff',
        description: 'Manually sets daylight savings time to off',
        ...permissionSettings
    },
    {
        name: 'time',
        description: 'Displays the current time in EST'
    },
    {
        name: 'date',
        description: 'Displays the current date in EST'
    },
    {
        name: 'nextraid',
        description: 'Displays the time until the next raid'
    },
    {
        name: 'serverstatus',
        description: 'Checks the server status'
    },
    {
        name: 'pinglist',
        description: 'Displays the current ping list'
    },
    {
        name: 'clearpinglist',
        description: 'Clears the ping list'
    }
];

let currentCommands = []


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(apiKey);

// and deploy your commands!
const deployCommands = (async () => {
    try {
        console.log(`Started refreshing ${currentCommands.length} application (/) commands.`);
		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
			{ body: currentCommands },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
        // And of course, make sure you catch and log any errors!
		console.error(error);
	}
});

const pushCustomCommands = (newDictionary = false) => {
    currentCommands = [...commands]
    const currentDictionary = newDictionary ? newDictionary['453697747930054656'] : dictionary['453697747930054656']
    const customKeys = Object.keys(currentDictionary)
    if(customKeys.length){
        customKeys.forEach(key => currentCommands.push({name: key, description: currentDictionary[key].description}))
    }
    deployCommands()
}

pushCustomCommands()

exports.pushCustomCommands = pushCustomCommands