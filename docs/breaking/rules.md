---
id: rules
title: Rules and Categories
---

As discussed in the overview, `buf` categorizes breaking rules into four main categories:

  - `FILE`: Generated source code breaking changes on a per-file basis, that is changes that
    would break the generated stubs where definitions cannot be moved across files. This makes
    sure that for languages such as C++ and Python where header files are included, your source
    code nevers break for a given Protobuf change. This category also verifies wire and JSON
    compatibility.
  - `PACKAGE`: Generated source code breaking changes on a per-package basis, that is changes that
    would break the generated stubs, but only accounting for package-level changes. This is useful
    for languages such as Java (with `option java_multiple_files = true;` set) or Golang where it
    is fine to move Protobuf types across files, as long as they stay within the same Protobuf package.
    This category also verifies wire and JSON compatibility.
  - `WIRE`: Wire breaking changes, that is changes that would break wire compatibility, including
    checks to make sure you reserve deleted types of which re-use in the future could cause
    wire incompatibilities.
  - `WIRE_JSON`: Wire breaking changes and JSON breaking changes, that is changes that would break
    either wire compatibility or JSON compatibility. This mostly extends `WIRE` to include field and
    enum value names.

## Categories

As opposed to lint rules, you generally shouldn't mix and exclude specific breaking change
rules. Instead, it's best to choose one of the categories:

- `FILE`
- `PACKAGE`
- `WIRE`
- `WIRE_JSON`

Choose a category based on the following:

  - If you distribute your generated source code outside of a monorepo in any capacity, or want
    to make sure that consumers of the generated source code don't experience broken builds, use
    `FILE` or `PACKAGE`. Choose `FILE` if you use (or might use) any languages that generate
    header files (such as C++ or Python), or `PACKAGE` if you only use languages that generate
    code on a per-package basis (such as Golang). **If in doubt, choose `FILE`.**
  - If you only use Protobuf within a monorepo and always re-generate, and are OK with refactoring
    code that consumes the generated source code, use `WIRE` or `WIRE_JSON`. Use `WIRE`
    if you are sure that you will never use the JSON representation of your Protobuf messages.
    Use `WIRE_JSON` if there is any JSON usage. Generally, we'd recommend using `WIRE_JSON` if you
    go this route (this basically just has the effect of not allowing re-use of field and enum
    value names).

We recommend using `FILE` or `PACKAGE` (**`FILE` is the default**). Generally, the case where you
*really* never use a given Protobuf schema anywhere but a single monorepo for an entire organization
(and all the organization's external customers) is rarer than many think.

Also as opposed to lint rules, there is not a strict subset relationship between the
main categories in terms of what rules belong to what categories. However, in terms
of strictness, the order is:

`FILE` > `PACKAGE` > `WIRE_JSON` > `WIRE`

That is, `FILE` is the strictest, and `WIRE` is the most permissive. Even though there is no strict
subset relationship, you can safely assume that passing the `FILE` rules implies you would pass the
`PACKAGE` rules, and that passing the `PACKAGE` rules implies you would pass the `WIRE_JSON` rules,
and using the `WIRE_JSON` rules implies you would pass the `WIRE` rules. There is no need to specify
all of them.

As an example of how this works, consider the rules `ENUM_NO_DELETE` and `PACKAGE_ENUM_NO_DELETE`.
`ENUM_NO_DELETE` is in the `FILE` category, and checks that for each file, no enum is deleted.
`PACKAGE_NO_DELETE` is in the `PACKAGE` category, and checks that for a given package, no enum is
deleted, however enums are allowed to move between files within a package. Given these definitions,
and given that a file does not change its package (which is checked by `FILE_SAME_PACKAGE`, also
included in every category), it is obvious that passing `ENUM_NO_DELETE` implies passing `PACKAGE_ENUM_NO_DELETE`.

As another example, consider `FIELD_NO_DELETE`, a rule in the `FILE` and `PACKAGE` categories that checks that
no field is deleted from a given message. Consider this as opposed to `FIELD_NO_DELETE_UNLESS_NUMBER_RESERVED`
(part of the `WIRE` and `WIRE_JSON` categories) and `FIELD_NO_DELETE_UNLESS_NAME_RESERVED` (part of the `WIRE_JSON`
category), rules that do not allow field deletion unless the number or name is reserved. Clearly, if `FIELD_NO_DELETE`
passes (that is, no field is deleted), both `FIELD_NO_DELETE_UNLESS_NUMBER_RESERVED` and `FIELD_NO_DELETE_UNLESS_NAME_RESERVED`
would pass as well.

## Rules

### `ENUM_NO_DELETE`
### `MESSAGE_NO_DELETE`
### `SERVICE_NO_DELETE`

**Category: `FILE`**

These check that no enums, messages, or services are deleted from a given file. Deleting
an enum, message or service deletes the corresponding generated type, which could be
referenced in source code. Instead of deleting these types, deprecate them:

```protobuf
enum Foo {
  option deprecated = true;
  FOO_UNSPECIFIED = 0;
  ...
}

message Bar {
  option deprecated = true;
}

service BazService {
  option deprecated = true;
}
```

### `PACKAGE_ENUM_NO_DELETE`
### `PACKAGE_MESSAGE_NO_DELETE`
### `PACKAGE_SERVICE_NO_DELETE`

**Category: `PACKAGE`**

These have the same effect as their non-prefixed counterparts above, except that this
verifies that these types are not deleted from a given package, while letting types
move between files. For example, if `foo1.proto` and `foo2.proto` both have `package foo`,
then an `enum Bar` could move from `foo1.proto` to `foo2.proto` without representing
a breaking change.

### `FILE_NO_DELETE`

**Category: `FILE`**

This checks that no file is deleted. Deleting a file results in its generated
header file being deleted as well, which could break source code.

### `FILE_SAME_PACKAGE`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`, `WIRE`**

This checks that a given file has the same `package` value. Changing the package
value results in a ton of issues downstream in various languages, and for
the `FILE` category, this effectively results in any types declared within
that file being considered deleted.

### `PACKAGE_NO_DELETE`

**Category: `PACKAGE`**

This checks that no packages are deleted. This basically checks that at least
one file in your previous schema has a package declared for every package declared
in your current schema. Deleting packages means that all types within those packages
are deleted, and even though each of these types are checked, this is more of a sanity check.

### `ENUM_VALUE_NO_DELETE`
### `FIELD_NO_DELETE`

**Categories: `FILE`, `PACKAGE`**

These check that no enum value or message field is deleted. Deleting an enum value or
message field results in the corresponding value or field being deleted from
the generated source code, which could be referenced. Instead of deleting these,
deprecate them:

```protobuf
enum Foo {
  FOO_UNSPECIFIED = 0;
  FOO_ONE = 1 [deprecated = true];
}

message Bar {
  string one = 1 [deprecated = true];
}
```

### `ENUM_VALUE_NO_DELETE_UNLESS_NUMBER_RESERVED`
### `FIELD_NO_DELETE_UNLESS_NUMBER_RESERVED`

**Categories: `WIRE, WIRE_JSON`**

These check that no enum value or message field is deleted without reserving the
number. While deleting an enum value or message field is not directly a wire-breaking
change, re-using these numbers in the future is likely to result in either bugs (in the
case of enums) or actual wire incompatibilities (in the case of messages, if the type
differs). This is a JSON breaking change for enum values if enum values are serialized
as integers (which is an option). Protobuf provides the ability to [reserve](https://developers.google.com/protocol-buffers/docs/proto3#reserved)
numbers to prevent them being re-used in the future. For example:

```protobuf
enum Foo {
  // We have deleted FOO_ONE = 1
  reserved 1;

  FOO_UNSPECIFIED = 0;
}

message Bar {
  // We have deleted string one = 1
  reserved 1;
}
```

Note that deprecating a field instead of deleting it has the same effect as reserving
the field (as well as reserving the name for JSON), so this is what we recommend.

### `ENUM_VALUE_NO_DELETE_UNLESS_NAME_RESERVED`
### `FIELD_NO_DELETE_UNLESS_NAME_RESERVED`

**Category: `WIRE_JSON`**

These check that no enum value or message field is deleted without reserving the
name. This is the JSON-equivalent of reserving the number - JSON uses field names
instead of numbers (this is optional for enum fields, but allowed). Generally you
want to reserve both the number and the name. For example:

```protobuf
enum Foo {
  // We have deleted FOO_ONE = 1
  reserved 1;
  reserved "FOO_ONE";

  FOO_UNSPECIFIED = 0;
}

message Bar {
  // We have deleted string one = 1
  reserved 1;
  reserved "one";
}
```

Note that it is significantly easier to just deprecate enum values and message fields.

### `RPC_NO_DELETE`

**Categories: `FILE`, `PACKAGE`**

This checks that no RPC is deleted from a service. Doing so is not a wire-breaking
change (although client calls fail if a server does not implement a given RPC), however
existing source code may reference a given RPC. Instead of deleting an RPC, deprecate it.

```protobuf
service BazService {
  rpc Bat(BatRequest) returns (BatResponse) {
    option deprecated = true;
  }
}
```

### `ONEOF_NO_DELETE`

**Categories: `FILE`, `PACKAGE`**

This checks that no oneof is deleted from a message. Various languages generate types
for oneofs, which should no longer be present if deleted.

### `FILE_SAME_SYNTAX`

**Categories: `FILE`, `PACKAGE`**

This checks that a file does not switch between `proto2` and `proto3`, including
going to/from unset (which assumes `proto2`) to set to `proto3`. Changing the syntax
results in differences in generated code for many languages.

### `FILE_SAME_CC_ENABLE_ARENAS`
### `FILE_SAME_CC_GENERIC_SERVICES`
### `FILE_SAME_CSHARP_NAMESPACE`
### `FILE_SAME_GO_PACKAGE`
### `FILE_SAME_JAVA_GENERIC_SERVICES`
### `FILE_SAME_JAVA_MULTIPLE_FILES`
### `FILE_SAME_JAVA_OUTER_CLASSNAME`
### `FILE_SAME_JAVA_PACKAGE`
### `FILE_SAME_JAVA_STRING_CHECK_UTF8`
### `FILE_SAME_OBJC_CLASS_PREFIX`
### `FILE_SAME_OPTIMIZE_FOR`
### `FILE_SAME_PHP_CLASS_PREFIX`
### `FILE_SAME_PHP_GENERIC_SERVICES`
### `FILE_SAME_PHP_METADATA_NAMESPACE`
### `FILE_SAME_PHP_NAMESPACE`
### `FILE_SAME_PY_GENERIC_SERVICES`
### `FILE_SAME_RUBY_PACKAGE`
### `FILE_SAME_SWIFT_PREFIX`

**Categories: `FILE`, `PACKAGE`**

These check that each of these [file options](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L318)
do not change values between versions of your Protobuf schema. Changing any of these values
results in differences in your generated source code.

Note that you may not use any or all of these languages in your own development, and that's more
than fine - if you don't set any of these options, none of these rules should ever break. You
may not have been aware some of these options existed - if so, put them in your rear view mirror.

### `ENUM_VALUE_SAME_NAME`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`**

This checks that a given enum value has the same name for each enum value number. For example
You cannot change `FOO_ONE = 1` to `FOO_TWO = 1`. Doing so results in potential JSON
incompatibilities and broken source code.

Note that for enums with `allow_alias` set, this verifies that the set of names in the
current definition covers the set of names in the previous definition. For example,
the new definition `// new` is compatible with `// old`,
but `// old` is not compatible with ` // new`:

```protobuf
// old
enum Foo {
  option allow_alias = 1;
  FOO_UNSPECIFIED = 0;
  FOO_BAR = 1;
  FOO_BARR = 1;
}

// new
enum Foo {
  option allow_alias = 1;
  FOO_UNSPECIFIED = 0;
  FOO_BAR = 1;
  FOO_BARR = 1;
  FOO_BARRR = 1;
}
```

### `FIELD_SAME_CTYPE`

**Categories: `FILE`, `PACKAGE`**

This checks that a given field has the same value for the [ctype option](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L514). This affects
the C++ generator. This is a Google-internal field option, so generally you won't have this set,
and this rule should have no effect.

### `FIELD_SAME_JSTYPE`

**Categories: `FILE`, `PACKAGE`**

This checks that a given field has the same value for the [jstype option](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L541). This affects
JavaScript generated code.

### `FIELD_SAME_TYPE`

**Categories: `FILE`, `PACKAGE`**

This checks that a field has the same type. Changing the type of a field can affect
the type in the generated source code, wire compatibility, and JSON compatibility. Note that
technically, it is possible to [interchange some scalar types](https://developers.google.com/protocol-buffers/docs/proto3#updating), however most of these result in generated source code changes anyways,
and affect JSON compatibility - instead of worrying about these, just don't change your
field types.

Note that with maps, Buf currently has an issue where you may get a weird set of error messages
when changing a field to/from a map and some other type, denoting that the type of the
field changed from "FieldNameEntry" to something else. This is due to how maps are implemented
in Protobuf, where every map is actually just a repeated field of an implicit message of name
"FieldNameEntry". Correcting these error messages isn't impossible, and it's on our roadmap,
but it just hasn't been high priority - Buf still properly detects this change and outputs
an error, so the pass/fail decision remains the same.

### `FIELD_WIRE_COMPATIBLE_TYPE`

**Categories: `WIRE`**

This rule replaces `FIELD_SAME_TYPE` for the `WIRE` category. This does the following:

* If the type changes between int32, uint32, int64, uint64, and bool, no failure is produced.
* If the type changes between sint32 and sint64, no failure is produced.
* If the type changes between fixed32 and sfixed32, no failure is produced.
* If the type changes between fixed64 and sfixed64, no failure is produced.
* If the type is changed from string to bytes, no failure is produced.
  A special message talking about string and bytes compatibility is produced if the type changed
  from bytes to string. Per the docs, you can change between string and bytes IF the data is valid
  UTF-8, but since we are only concerned with the API definition and cannot know how a user actually uses the field, we still produce a failure.
* If the previous and current types are both enums, the enums are checked to see if the (1) the
  short names are equal (2) the previous enum is a subset of the current enum. A subset is defined
  as having a subset of the name/number enum values. If the previous is a subset, no failure is
  produced. The idea here is that this covers if someone just moves where an enum is defined, but
  still allows values to be added to this enum in the same change, as adding values to an enum is
  not a breaking change.
* A link to https://developers.google.com/protocol-buffers/docs/proto3#updating is added to failures
  produced from `FIELD_WIRE_COMPATIBLE_TYPE`.

### `FIELD_WIRE_JSON_COMPATIBLE_TYPE`

**Categories: `WIRE_JSON`**

This rule replaces `FIELD_SAME_TYPE` for the `WIRE_JSON` category. This does the following:

JSON still allows for some exchanging of types, but due to how various fields are serialized, the
rules are stricter. See https://developers.google.com/protocol-buffers/docs/proto3#json - for example,
int32, sint32, uint32 can be exchanged, but 64-bit numbers have a different representation in JSON.
Since sint32 is not compatible with int32 or uint32 in `WIRE`, we have to limit this to allowing int32
and uint32 to be exchanged in JSON.

This does the following:

* If the type changes between int32 and uint32, no failure is produced.
* If the type changes between int64 and uint64, no failure is produced.
* If the type changes between fixed32 and sfixed32, no failure is produced.
* If the type changes between fixed64 and sfixed64, no failure is produced.
* If the previous and current types are both enums, the enums are checked to see if the (1) the short
  names are equal (2) the previous enum is a subset of the current enum. A subset is defined as having
  a subset of the name/number enum values. If the previous is a subset, no failure is produced. The idea
  here is that this covers if someone just moves where an enum is defined, but still allows values to be
  added to this enum in the same change, as adding values to an enum is not a breaking change.
* Links to https://developers.google.com/protocol-buffers/docs/proto3#updating and
  https://developers.google.com/protocol-buffers/docs/proto3#json are added to failures produced from `FIELD_WIRE_JSON_COMPATIBLE_TYPE`.

### `FIELD_SAME_LABEL`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`, `WIRE`**

This checks that no field changes its label. The available labels are `optional`, `required`,
and `repeated`. Changing to/from optional/required and repeated means a generated source code and
JSON breaking change. Changing to/from optional and repeated is actually not a wire-breaking change, 
however changing to/from optional and required is. Given that it's unlikely to be advisable in any
situation to change your label, and that there is only one exception, we find it best to just forbid
this entirely.

### `FIELD_SAME_ONEOF`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`, `WIRE`**

This checks that no field moves into or out of a oneof, or changes the oneof it is a part of.
Doing so is almost always a generated source code breaking change. Technically there [are
exceptions](https://developers.google.com/protocol-buffers/docs/proto3#backwards-compatibility-issues) with
regards to wire compatibility, but the rules are not something you should concern yourself with,
and it is safer to just never change a field's presence inside or outside a given oneof.

### `FIELD_SAME_NAME`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`**

This checks that the field name for a given field number does not change. For example, you
cannot change `int64 foo = 1;` to `int64 bar = 1;`. This affects generated source code,
but also affects JSON compatibility as JSON uses field names for serialization. This does
not affect wire compatibility, however we generally don't recommend changing field names.

### `FIELD_SAME_JSON_NAME`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`**

This checks that the `json_name` field option does not change, which would break
JSON compatibility. While not a generated source code breaking change in general, it is
conceivable that some Protobuf plugins may generate code based on this option, and having
this as part of the `FILE` and `PACKAGE` groups also fulfills that the `FILE/PACKAGE` categories
are supersets of the `WIRE_JSON` category.

### `RESERVED_ENUM_NO_DELETE`
### `RESERVED_MESSAGE_NO_DELETE`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`, `WIRE`**

These check that no reserved number range or reserved name is deleted from any enum or message.
Deleting a reserved value that future versions of your Protobuf schema can then use names or
numbers in these ranges, and if these ranges are reserved, it was because an enum value
or field was deleted.

Note that moving from `reserved 3 to 6;` to `reserved 2 to 8;`, for example, would technically be fine,
however Buf still fails in this case - making sure all ranges are covered is truly a pain,
we have no other excuse. We could fix this in the future. For now, just do `reserved 3 to 6, 2, 7 to
8;` to pass breaking change detection.

### `EXTENSION_MESSAGE_NO_DELETE`

**Categories: `FILE`, `PACKAGE`**

This checks that no extension range is deleted from any message. While this won't have any
effect on your generated source code, deleting an extension range can result in compile errors
for downstream Protobuf schemas, and is generally not recommended. Note that extensions are a
proto2-only construct, so this has no effect for proto3.

### `MESSAGE_SAME_MESSAGE_SET_WIRE_FORMAT`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`, `WIRE`**

This checks that the [message_set_wire_format](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L462) message option is the same. Since this is a proto1
construct, we congratulate you if you are using this for any current Protobuf schema, as you are a
champion of maintaining backwards compatible APIs over many years. Instead of failing breaking
change detection, perhaps you should get an award.

### `MESSAGE_NO_REMOVE_STANDARD_DESCRIPTOR_ACCESSOR`

**Categories: `FILE`, `PACKAGE`**

This checks that the [no_standard_descriptor_accessor](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L467) message option is not changed from
false/unset to true. Changing this option to `true` results in the `descriptor()` accessor not being
generated in certain languages, which is a generated source code breaking change. Protobuf has
issues with fields that are named "descriptor", of any capitalization and with any number of
underscores before and after "descriptor". Don't name fields this. Before v1.0, we may add a lint
rule that verifies this.

### `RPC_SAME_REQUEST_TYPE`
### `RPC_SAME_RESPONSE_TYPE`
### `RPC_SAME_CLIENT_STREAMING`
### `RPC_SAME_SERVER_STREAMING`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`, `WIRE`**

These check that RPC signatures do not change. Doing so would break both generated source code
and over-the-wire RPC calls.

### `RPC_SAME_IDEMPOTENCY_LEVEL`

**Categories: `FILE`, `PACKAGE`, `WIRE_JSON`, `WIRE`**

This checks that the [idempotency_level](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L681) RPC option does not change. Doing so
can result in different HTTP verbs being used.

## What we left out

We think the rules above represent a complete view of what is and isn't compatible with respect to Protobuf schema. We cover
every available field within a [FileDescriptorSet](https://github.com/protocolbuffers/protobuf/blob/044c766fd4777713fef2d1a9a095e4308d770c68/src/google/protobuf/descriptor.proto#L57)
as of protobuf v3.11.4, as well as additional fields as added. If we missed something, please [let us know](../contact.md).

However, we did leave out custom options. There's no way for `buf` to know the effects of your custom options, so we cannot
reliably determine their compatibility. We may add the [google.api](https://github.com/googleapis/googleapis/tree/master/google/api)
options in the future if there is sufficient demand, especially [google.api.http](https://github.com/googleapis/googleapis/blob/master/google/api/annotations.proto).
