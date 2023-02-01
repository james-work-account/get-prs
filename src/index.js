import { Octokit } from "@octokit/core";
import env from "./env.json";

const octokit = new Octokit({
  auth: env.authToken,
});

const repos = document.querySelector(".repo-list");

env.repos.map((repo) => {
  const repoEl = document.createElement("li");
  repoEl.classList.add("repo");
  repoEl.innerHTML = `<article id="${repo}">
  <h2 class="repo-name">${repo}</h2>
  <ul></ul>
</article>`;
  repos.appendChild(repoEl);
});

console.log(repos);

env.repos.map((repo) =>
  octokit
    .request("GET /repos/{owner}/{repo}/pulls{?state,head,base,sort,direction,per_page,page}", {
      owner: env.owner,
      repo: repo,
    })
    .then((result) => result.data)
    .then((prs) => {
      if (prs.length > 0) {
        prs.map((pr) => {
          const listEl = document.createElement("li");
          listEl.classList.add("pr");
          listEl.innerHTML = `<h3><a href="${pr.html_url}" target=_blank>${pr.title}</a></h3>
${pr.draft ? `<p class="draft">Draft</p>` : ""}
<p>Pull request raised by <strong>${pr.user.login}</strong> at <strong>${formatDate(pr.created_at)}</strong></p>`;
          document.querySelector(`#${repo} ul`).appendChild(listEl);
        });
      } else {
        const listEl = document.createElement("li");
        listEl.innerHTML = `<p>No pull requests 🥳</p>`;
        document.querySelector(`#${repo} ul`).appendChild(listEl);
      }
    })
    .catch((err) => {
      console.error(err);
    })
);

function formatDate(d) {
  const date = new Date(d);

  const dayOfMonth = date.getDate().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const monthOfYear = (date.getMonth() + 1).toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const year = date.getFullYear().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });

  const hourOfDay = date.getHours().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const minuteOfHour = date.getMinutes().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  const secondOfMinute = date.getSeconds().toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });

  return `${dayOfMonth}-${monthOfYear}-${year} ${hourOfDay}:${minuteOfHour}:${secondOfMinute}`;
}
