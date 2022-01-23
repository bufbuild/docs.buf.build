package data

// Helper types
#Duration: "^([0-9]+(ms|ns|d|h|m|s))+$"
#String:   !=""

#CLI: {
	#Enum: [Name=_]: #String

	#Flags: [Flag=string]: {
		name:        Flag
		flag:        "--\(Flag)"
		description: #String

		_short?: #String
		if _short != _|_ {
			short: "-\(_short)"
		}
	}

	#Options: [Option=string]: {
		#OptionType: "duration" | "enum" | "integer" | "string"

		option:      "--\(Option)"
		description: #String
		enum?:       #Enum
		type:        #OptionType
		default?:    #String | #Duration | int

		if enum != _|_ {
			type: "enum"
		}

		_short?: #String
		if _short != _|_ {
			short: "-\(_short)"
		}
	}

	#Command: {
		name:        #String
		description: #String
		flags:       #Flags
		options?:    #Options
		commands?:   #Commands
	}

	#Commands: [Command=string]: #Command & {name: Command}

	name:     #String
	flags:    #Flags
	options:  #Options
	commands: #Commands
}
