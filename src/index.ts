import { graphql } from "@octokit/graphql";
import { default as env } from "./env.json"; // See README.md if you haven't got one of these

const repoList = document.querySelector(".repo-list") as Element;
const loadingEl = document.querySelector(".loading") as Element;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `bearer ${env.authToken}`,
  },
});

let searchTerm: string;

function performSearch() {
  loadingEl.classList.remove("hidden");
  repoList.innerHTML = "";

  // query generated from https://docs.github.com/en/graphql/overview/explorer
  const query = `fragment pr on PullRequest {
  url
  author {
    login
  }
  title
  isDraft
  createdAt
  reviewDecision
  number
  repository {
    name
  }
}

{
  repoSearch: search(
    query: "${env.usertype}:${env.owner} ${env.repoSearch} in:name"
    type: REPOSITORY
    first: 30
  ) {
    edges {
      node {
        ... on Repository {
          name
          pullRequests(first: 30, states: OPEN) {
            nodes {
              ...pr
            }
          }
        }
      }
    }
  }
  ${
    searchTerm?.length > 0
      ? `
  issueSearch: search(
    query: "${env.usertype}:${env.owner} ${searchTerm} in:title state:open"
    type: ISSUE
    first: 100
  ) {
    edges {
      node {
        ... on PullRequest {
          ...pr
        }
      }
    }
  }`
      : ""
  }
}`;

  graphqlWithAuth(query)
    .then((res) => res as GQLResponse)
    .then((res) => {
      // repoSearch will already match RepoType[] as the query was built around it
      const repoSearch: RepoType[] = res.repoSearch.edges.map((e) => e.node);

      // issueSearch requires some mangling to turn into RepoType[] without any duplicates.
      // This IIFE gets all issues, filters out anything already in repoSearch, then merges any duplicates.
      const issueSearch: RepoType[] = (() => {
        const issues: PullType[] = (res?.issueSearch?.edges.map(({ node }) => node) || []).filter(
          (issue) =>
            // If it can't find a match in `repoSearch`, index will be -1 and it'll be fine to keep.
            // If it finds a match, index will be >= 0 so the match will be filtered out.
            // No need to keep repos which are already there.
            repoSearch.findIndex((rs) => rs.name === issue.repository.name) < 0
        );

        let repoTypes: RepoType[] = [];

        for (const issue of issues) {
          const idx = repoTypes.findIndex((repoType) => repoType.name === issue.repository.name);
          if (idx >= 0) {
            repoTypes[idx].pullRequests.nodes = [...repoTypes[idx].pullRequests.nodes, issue];
          } else {
            repoTypes = [
              ...repoTypes,
              {
                name: issue.repository.name,
                pullRequests: {
                  nodes: [issue],
                },
              },
            ];
          }
        }

        return repoTypes;
      })();

      let repos: RepoType[] = [...repoSearch, ...issueSearch];

      repos
        // filter out repos which match a regex if that regex is present in env.json
        // .filter((repo) => (env.ignoredRepoPattern ? !repo.name.match(env.ignoredRepoPattern) : true))
        // put repos onto the page
        .map((repo) => {
          const repoEl = document.createElement("li");
          repoEl.classList.add("repo");
          repoEl.innerHTML = `<article id="${repo.name}">
        <h2 class="repo-name">${repo.name}</h2>
        <ul></ul>
        </article>`;

          const prListEl = repoEl.querySelector(`ul`) as Element;

          if (repo.pullRequests.nodes.length > 0) {
            repo.pullRequests.nodes.map((pr) => {
              const listEl = document.createElement("li");
              listEl.classList.add("pr");
              listEl.innerHTML = `<h3><a href="${pr.url}" target=_blank>#${pr.number} - ${pr.title}</a></h3>
          ${pr.isDraft ? `<p class="draft">Draft</p>` : ""}
          <p>Pull request raised by <strong>${pr.author.login}</strong> at <strong>${formatDate(
                pr.createdAt
              )}</strong></p>
          ${pr.reviewDecision === null ? "" : `<p>Review status: <strong>${pr.reviewDecision}</strong></p>`}
          `;
              prListEl.appendChild(listEl);
            });
          } else {
            const listEl = document.createElement("li");
            listEl.innerHTML = `<p>No pull requests 🥳</p>`;
            prListEl.appendChild(listEl);
          }

          loadingEl.classList.add("hidden");
          repoList.appendChild(repoEl);
        });
    })
    .catch(console.error);
}

// Homebrewing a date formatter because I don't want to look up how to do it properly
function formatDate(d: string): string {
  const date = new Date(d);

  const dayOfMonth = date.getDate().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const monthOfYear = (date.getMonth() + 1).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const year = date.getFullYear();

  const hourOfDay = date.getHours().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const minuteOfHour = date.getMinutes().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const secondOfMinute = date.getSeconds().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });

  return `${dayOfMonth}-${monthOfYear}-${year} ${hourOfDay}:${minuteOfHour}:${secondOfMinute}`;
}

const form = document.querySelector("form");

form && form.addEventListener("submit", addSearchTermAndPerformSearch);

function addSearchTermAndPerformSearch(e?: SubmitEvent) {
  e?.preventDefault();
  if (form) {
    const formData = new FormData(form);
    searchTerm = formData.get("searchTerm")?.toString() || "";
    performSearch();
  }
}

if (env.searchTerm) {
  const input = form?.querySelector("input");
  input && (input.value = env.searchTerm);

  searchTerm = env.searchTerm;
}

addSearchTermAndPerformSearch();
