# Get Pull Requests

Get a list of open Pull Requests for a list of repositories by a particular user/org.

## Requirements

1. NPM
2. `src/env.json` file which looks something like this:

```json
{
  "authToken": "<YOUR_TOKEN>", // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
  "usertype": "user", // "user" or "org"
  "owner": "james-work-account", // User/org the repos belong to
  "repoSearch": "todo", // Regex to search on. Will match repo names against this search term
  "searchTerm": "ABCD", // Regex for pull requests to search on. Will match pull requests which contain this text - OPTIONAL
  "ignoredRepoPattern": ".*-(prototype|tests)$" // Regex for repos to filter out - OPTIONAL
}
```

## To run

1. `npm install`
2. `npm run start`
3. Open http://localhost:1234
