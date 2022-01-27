---
id: login-to-the-bsr
title: 6 Log in to the BSR
---

You've gone over many of the primary `buf` commands, so now you'll shift gears and learn how to use
`buf` to interact with the Buf Schema Registry ([BSR]) to manage our `PetStoreService` API.

## 6.1 Log in {#login}

Visit [https://buf.build/login][login] and you'll be prompted with a few different login options,
including Google, GitHub, and traditional email and password. After you've successfully
authenticated, you'll be prompted to select a username and complete your registration. If
successful, you should see that you're logged in and that your username is rendered in the upper
right-hand corner.

Throughout this tour, you'll see references to the `BUF_USER` environment variable as your
newly created BSR username. Once you have completed registration, export this value
so that you can copy and paste commands.

```terminal
# Note this is just for the tour!
$ export BUF_USER=<YOUR_BUF_USER>
```

:::note
Any time the `$BUF_USER` placeholder is used within a file, such as [`buf.yaml`](../configuration/v1/buf-yaml.md),
you need to manually replace it with your local value of `BUF_USER`.
:::

## 6.2 Create an API Token {#create-an-api-token}

Now that you're logged in, visit the [https://buf.build/settings/user][user] page and click the
**Create New Token** button. Select an expiration time and add a note for yourself
to distinguish this token from others (we recommend that you name this `CLI`, `Development`, or something
else along those lines).

Click **Create** and copy the token to your clipboard.

## 6.3 `buf registry login` {#buf-login}

All you need to log in is the API token created above. Run this command to do so:

```terminal
$ buf registry login
```

You'll be prompted for your username and the token that you just copied.

In the future, the `buf` CLI will get its authentication credentials from your `$HOME/.netrc` file.
The `buf registry login` command automatically writes your supplied creds to that file, which should
now look like this:

```sh title="~/.netrc"
machine buf.build
    login <USERNAME>
    password <TOKEN>
machine go.buf.build
    login <USERNAME>
    password <TOKEN>
```

You can log out at any time using this command:

```terminal
$ buf registry logout
---
All existing BSR credentials removed from $HOME/.netrc.
```

For more information on `.netrc`, check out the [curl documentation](https://everything.curl.dev/usingcurl/netrc).

:::note
If you're developing on a Windows machine, the credentials file is `%HOME%/_netrc`.
:::

[bsr]: /bsr/introduction.md
[login]: https://buf.build/login
[user]: https://buf.build/settings/user