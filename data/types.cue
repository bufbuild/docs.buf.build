package data

import "encoding/yaml"
import "strings"

// Root type declarations
urls:  #StringMap
files: #ConfigFileMap

// A non-empty string (because the standard string type allows for empty)
#Str: !=""
#StringMap: [#Str]: #Str

// Helper values
#V1Beta1: "v1beta1"
#V1:      "v1"
#Version: #V1Beta1 | #V1

#ConfigFile: {
	name:        #Str
	description: #Str
	version:     #Version | *#V1
	docs_path:   "/configuration/\(version)/\(_url_encoded_name)"
	fields:      #Fields
	_default?:   _

	if _default != _|_ {
		default: yaml.Marshal(_default)
	}

	_url_encoded_name: strings.Replace(name, ".", "-", -1)
}

#ConfigFileMap: [Name=#Str]: #ConfigFile & {name: Name}

#Field: {
	#Type: {
		#TypeBool: {}

		#TypeString: {
			default?: #Str
			allowed?: [#Str, ...#Str]
		}

		#TypeStringArray: {
			default?: [...#Str]
			example?: [#Str, ...#Str]
		}

		{"bool": #TypeBool} |
		{"string": #TypeString} |
		{"string_array": #TypeStringArray}
	}

	name:        #Str
	description: #Str
	required:    bool | *false
	type:        #Type
}

#Fields: [Name=#Str]: #Field & {name: Name}
