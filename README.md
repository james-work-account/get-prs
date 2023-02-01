# Get Pull Requests

Get a list of open Pull Requests for a list of repositories by a particular user/org.

## Requirements

1. NPM
2. `src/env.json` file which looks something like this:

```json
{
  "authToken": "<YOUR_TOKEN>", // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
  "owner": "james-work-account",
  "repos": ["is-ten-thousand", "tic-tac-toe", "switch-scss", "emailjs-demo"]
}
```

## To run

1. `npm install`
2. `npm run start`
3. Open http://localhost:1234
