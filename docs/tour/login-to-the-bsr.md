---
id: login-to-the-bsr
title: 6 Login to the BSR
---

We've gone over a lot of the primary `buf` commands, so we'll shift gears and learn how we can use `buf` to
interact with the [BSR](../bsr/introduction.md) to manage our `PetStoreService` API.

## 6.1 Login {#login}

Visit [https://buf.build/login](https://buf.build/login) and you will be prompted with a few
different login options, including Google, Github, and traditional email and password.
After you have successfully authenticated, you'll be prompted to select a username
and complete your registration. If successful, you should see that you're logged-in
and your username will be rendered in the upper right-hand corner.

Throughout this tour, we reference the environment variable `$BUF_USER` as your
newly-created BSR username. Once you have completed registration, export this value
so that you can copy and paste commands.

```terminal
# Note this is just for the tour!
$ export BUF_USER=<YOUR_BUF_USER>
```

> Any time the `$BUF_USER` placeholder is used within a file, such as the [`buf.yaml`](../configuration/v1/buf-yaml.md),
> you'll need to manually replace it with what `$BUF_USER` is set to.

## 6.2 Create an API Token {#create-an-api-token}

Now that you're logged in, visit the [https://buf.build/settings/user](https://buf.build/settings/user)
page, and click the `Create New Token` button. Select an expiration time, and add a note for yourself
to distinguish this token from others (we recommend that you name this `CLI`, `Development`, or something
else along those lines).

Click `Create` and copy the token to your clipboard.

## 6.3 `buf registry login` {#buf-login}

The `buf` CLI reads its authentication credentials from your `$HOME/.netrc` file.
All you'll need is the value of the API token created above, which can be used to
add a new `machine` entry, then you can set it with the following command:

```terminal
$ buf registry login
```

You'll be prompted for your username, as well as the token and you'll end up with the following:

```sh title="~/.netrc"
machine buf.build
    login <USERNAME>
    password <TOKEN>
machine go.buf.build
    login <USERNAME>
    password <TOKEN>
```

You can logout at any time with the following command:

```terminal
$ buf registry logout
All existing BSR credentials removed from $HOME/.netrc.
```

For more information on `.netrc`, check out the [curl documentation](https://everything.curl.dev/usingcurl/netrc).

> If you're developing on a Windows machine, the credentials file is `%HOME%/_netrc`.
