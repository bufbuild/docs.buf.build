package data

// Helper types
#Duration: "^([0-9]+(ms|ns|d|h|m|s))+$"
#String:   !=""

// Arg formats
#Commit:       "buf.build/{owner}/{repository}:{commit}"
#Directory:    "directory"
#Input:        "input"
#Organization: "buf.build/{organization}"
#Plugin:       "buf.build/{owner}/plugins/{plugin}"
#Repository:   "buf.build/{owner}/{repository}"
#Source:       "source"
#Tag:          "tag"
#Target:       "buf.build/{owner}/{repo}[:{ref}]"
#Template:     "buf.build/{owner}/templates/{template}"

#CLI: {
	#Enum: [Name=_]: #String

	#Args: [...{
		#Format: #Commit | #Directory | #Input | #Organization | #Plugin |
			#Repository | #Source| #Target | #Tag | #Template

		description: #String
		required:    bool | *false
		format:      #Format
	}]

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
		#Type: "duration" | "enum" | "uint32" | "string" | "strings"

		option:      "--\(Option)"
		description: #String
		enum?:       #Enum
		type:        #Type
		default?:    #String | #Duration | uint32
		required:    bool | *false

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
		alias?:      #String
		args?:       #Args
		flags?:      #Flags
		options?:    #Options
		commands?:   #Commands
	}

	#Commands: [Command=string]: #Command & {name: Command}

	name:          #String
	args?:         #Args
	global_flags?: #Flags
	options?:      #Options
	commands?:     #Commands
}

buf_cli: #CLI
