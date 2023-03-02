import { graphql } from "@octokit/graphql";
import { default as env } from "./env.json"; // See README.md if you haven't got one of these

const repoList = document.querySelector(".repo-list") as Element;
const loadingEl = document.querySelector(".loading") as Element;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `bearer ${env.authToken}`,
  },
});

graphqlWithAuth(
  // query generated from https://docs.github.com/en/graphql/overview/explorer
  `{
  search(query: "${env.usertype}:${env.owner} ${env.repoSearch} in:name", type: REPOSITORY, first: 30) {
    edges {
      node {
        ... on Repository {
          name
          pullRequests(first: 30, states: OPEN) {
            nodes {
              url
              author {
                login
              }
              title
              isDraft
              createdAt
              reviewDecision
              number
            }
          }
        }
      }
    }
  }
}`
)
  .then((res: any) => {
    const repos: RepoType[] = (res as GQLResponse).search.edges.map(({ node }) => {
      return {
        name: node.name,
        pulls: node.pullRequests.nodes.map((pr) => {
          return {
            html_url: pr.url,
            user: pr.author.login,
            title: pr.title,
            created_at: formatDate(pr.createdAt),
            draft: pr.isDraft,
            reviewDecision: pr.reviewDecision,
            number: pr.number,
          };
        }),
      };
    });

    repos
      // filter out repos which match a regex if that regex is present in env.json
      .filter((repo) => (env.ignoredRepoPattern ? !repo.name.match(env.ignoredRepoPattern) : true))
      // put repos onto the page
      .map((repo) => {
        const repoEl = document.createElement("li");
        repoEl.classList.add("repo");
        repoEl.innerHTML = `<article id="${repo.name}">
      <h2 class="repo-name">${repo.name}</h2>
      <ul></ul>
    </article>`;

        const prListEl = repoEl.querySelector(`ul`) as Element;

        if (repo.pulls.length > 0) {
          repo.pulls.map((pr) => {
            const listEl = document.createElement("li");
            listEl.classList.add("pr");
            listEl.innerHTML = `<h3><a href="${pr.html_url}" target=_blank>#${pr.number} - ${pr.title}</a></h3>
          ${pr.draft ? `<p class="draft">Draft</p>` : ""}
          <p>Pull request raised by <strong>${pr.user}</strong> at <strong>${pr.created_at}</strong></p>
          ${pr.reviewDecision === null ? "" : `<p>Review status: <strong>${pr.reviewDecision}</strong></p>`}
          `;
            prListEl.appendChild(listEl);
          });
        } else {
          const listEl = document.createElement("li");
          listEl.innerHTML = `<p>No pull requests 🥳</p>`;
          prListEl.appendChild(listEl);
        }

        loadingEl.remove();
        repoList.appendChild(repoEl);
      });
  })
  .catch(console.error);

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
