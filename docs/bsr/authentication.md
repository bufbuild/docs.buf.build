---
id: authentication
title: Authentication
---

Authentication is required for the majority of the `buf` CLI commands
that interact with the BSR.

## Create an API token

Sign up or log in at [https://buf.build/login](https://buf.build/login) and navigate to your
account settings at [https://buf.build/settings](https://buf.build/settings/user) or by selecting
"Settings" from the avatar dropdown at the top-right corner of the page.

On the settings page, click the `Create New Token` button, select an
expiration time, and add a note for yourself to distinguish this token from others.
Click `Create` and copy the token to your clipboard.

> This token identifies you to the BSR and must be kept secret.

### Revoking an API token

An API token can be revoked from the same user settings page. Simply find the name
of the token in the list and delete it. It will immediately cease to be a valid
authentication method.

## Authenticating the CLI

The order of precedence for CLI authentication is:

1. The `BUF_TOKEN` environment variable, if set, will be used.
2. The `.netrc` file.

### BUF_TOKEN

An environment variable that holds the API token, used for authentication.

### netrc file

The `buf` CLI reads its authentication credentials from your
[.netrc](https://www.gnu.org/software/inetutils/manual/html_node/The-_002enetrc-file.html)
file. There is a `buf` command that manages the `.netrc` file for you, run the following command:

```terminal
$ buf registry login
```

You'll be prompted for your username, as well as the token and you'll end up with the following:

```sh title="~/.netrc"
machine buf.build
    login <USERNAME>
    password <TOKEN>
```

You can logout at any time with the following command:

```terminal
$ buf registry logout
```

All existing BSR credentials removed from `$HOME/.netrc`.

For more information on `.netrc`, check out the [curl documentation](https://everything.curl.dev/usingcurl/netrc).

> If you're developing on a Windows machine, the credentials file is `%HOME%/_netrc`.

## CI authentication

If you wish to add authentication to your continuous integration jobs, we recommend storing the token in your providers secret storage, if possible. Such as:
[GitHub Actions](https://docs.github.com/en/actions/reference/encrypted-secrets#about-encrypted-secrets),
[Travis CI](https://docs.travis-ci.com/user/environment-variables/#defining-encrypted-variables-in-travisyml),
[CircleCI](https://circleci.com/docs/2.0/env-vars/).

Access the secret token as specified by your CI provider and make it available as an environment variable: [`BUF_TOKEN`](#buf_token)

If this is not possible, you can also login via the CLI (assuming `BUF_API_TOKEN` and `BUF_USER` are set):

```terminal
$ echo ${BUF_API_TOKEN} | buf registry login --username ${BUF_USER} --token-stdin
```

You can now use any of the authenticated `buf` commands, such as `buf push`.

> Note that we have [official GitHub Actions](../ci-cd/github-actions.md) which makes it easy to configure authentication for CI jobs.
