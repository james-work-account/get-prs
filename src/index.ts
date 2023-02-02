import { Octokit } from "@octokit/core";
import env from "./env.json"; // See README.md if you haven't got one of these

// Only care about these fields so only specifying these types
type RepoPullsType = {
  html_url: string;
  user: {
    login: string;
  };
  title: string;
  created_at: string;
  draft: boolean;
};

const octokit = new Octokit({
  auth: env.authToken,
});

const repos = document.querySelector(".repo-list") as Element;

// Populate the page with a list of repositories
env.repos.map((repo) => {
  const repoEl = document.createElement("li");
  repoEl.classList.add("repo");
  repoEl.innerHTML = `<article id="${repo}">
  <h2 class="repo-name">${repo}</h2>
  <ul></ul>
</article>`;
  repos.appendChild(repoEl);

  // For each repository, fetch pull request data and populate the page with it
  octokit
    .request("GET /repos/{owner}/{repo}/pulls{?state,head,base,sort,direction,per_page,page}", {
      owner: env.owner,
      repo: repo,
    })
    .then((result) => {
      const prs = result.data as RepoPullsType[];
      const prListEl = document.querySelector(`#${repo} ul`) as Element;

      if (prs.length > 0) {
        prs.map((pr) => {
          const listEl = document.createElement("li");
          listEl.classList.add("pr");
          listEl.innerHTML = `<h3><a href="${pr.html_url}" target=_blank>${pr.title}</a></h3>
${pr.draft ? `<p class="draft">Draft</p>` : ""}
<p>Pull request raised by <strong>${pr.user.login}</strong> at <strong>${formatDate(pr.created_at)}</strong></p>`;
          prListEl.appendChild(listEl);
        });
      } else {
        const listEl = document.createElement("li");
        listEl.innerHTML = `<p>No pull requests 🥳</p>`;
        prListEl.appendChild(listEl);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

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
