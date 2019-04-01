# user-management
Tool for managing users, roles, signups and applications for ESA and related speedrunning marathons

## You will need
- Node >= 10.3
- yarn
- mongodb
- a twitch client ID/secret
- a discord client ID/secret
- a private/public RSA256 key pair in .pem format

## Install
Clone the repository, create the files `settings.json`, `settings.frontend.json` and `settings.backend.json` 

`settings.backend.json` must contain at least:
```
{
  "auth": {
    "encryptionKey": "<encryption key (aes-256-cbc, for sensitive data like phone numbers)>"
  },
  "twitch": {
    "clientSecret": "<twitch client secret>"
  },
  "discord": {
    "clientSecret": "<discord client secret>",
    "webhooks": {
      "private": {
        "url": "<discord private webhook url>"
      },
      "public": {
        "url": "<discord public webhook url>"
      }
    }
  },
  "defaultAdmins": [<list of twitch user ID for people who should be admins from the start>]
}
```

`settings.json` must contain at least:
```
{
  "twitch": {
    "clientID": "<twitch client ID>"
  },
  "discord": {
    "clientID": "<discord client ID>",
    "invite": "<discord server invite>"
  },
  "api": {
    "baseurl": "http://127.0.0.1:8081/"
  },
  "frontend": {
    "baseurl": "http://127.0.0.1:8080/"
  },
	"vue": {
    "mode": "history"
  }
}
```

`settings.frontend.json` can be an empty JSON object, but can be used for pure frontend settings:
```
{}
```

See shared/settings.default.json for a full list of supported configuration options. Make sure to adjust `db.url` if your mongoDB server
is not running on the default port on localhost.
Please be aware that `settings.json` and `settings.frontend.json` are both included into the frontend build, therefore **DO NOT**
add secrets into either of these files.

Additionally, put the .pem files into the base folder and call them private.pem and public.pem. 

Next, run `yarn install`. For development use, run `yarn dev`, for production builds use `yarn build`.

For a production environment, it is reccomended to have the frontend files from frontend/dist served with any HTTP server. 
If you use `vue.mode = "history"`, you need to set it up to serve 404s as frontend/dist/index.html.

The backend can then be run with `node backend/dist/backend.js`. It is strongly advisable to use the aforementioned HTTP server to reverse-proxy this.
The entire setup is also docker compatible.
