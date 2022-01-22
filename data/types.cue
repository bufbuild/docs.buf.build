package data

import "encoding/yaml"

import "strings"

// Root type declarations
urls:    #StringMap
files:   #ConfigFiles
buf_cli: #CLI

// A non-empty string (because the standard string type allows for empty)
#String: !=""
#StringMap: [#String]: #String

// Helper values
#V1Beta1: "v1beta1"
#V1:      "v1"
#Version: #V1Beta1 | #V1

#ConfigFile: {
	name:        #String
	description: #String
	version:     #Version | *#V1
	docs_path:   "/configuration/\(version)/\(_url_encoded_name)"
	fields:      #Fields
	_default?:   _

	if _default != _|_ {
		default: yaml.Marshal(_default)
	}

	_url_encoded_name: strings.Replace(name, ".", "-", -1)
}

#ConfigFiles: [Name=#String]: #ConfigFile & {name: Name}

#Field: {
	#Type: {
		#TypeBool: {}

		#TypeString: {
			default?: #String
			allowed?: [#String, ...#String]
		}

		#TypeStringArray: {
			default?: [...#String]
			example?: [#String, ...#String]
		}

		{"bool": #TypeBool} |
		{"string": #TypeString} |
		{"string_array": #TypeStringArray}
	}

	name:        #String
	description: #String
	required:    bool | *false
	type:        #Type
}

#Fields: [Name=#String]: #Field & {name: Name}

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
		default?:    #String | int

		if enum != _|_ {
			type:    "enum"
			default: #String
		}

		_short?: #String
		if _short != _|_ {
			short: "-\(_short)"
		}
	}

	#Command: {
		name:         #String
		description:  #String
		flags?:       #Flags
		options?:     #Options
		subcommands?: #Commands
	}

	#Commands: [Command=string]: #Command & {name: Command}

	name:     #String
	flags:    #Flags
	options:  #Options
	commands: #Commands
}
