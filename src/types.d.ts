// Only care about these fields so only specifying these types
type RepoType = {
  name: string;
  pulls: {
    html_url: string;
    user: string;
    title: string;
    created_at: string;
    draft: boolean;
    reviewDecision: string;
    number: number;
  }[];
};

// Really lazily copied from https://docs.github.com/en/graphql/overview/explorer - there's probably a better way to type this
type GQLResponse = {
  search: {
    edges: {
      node: {
        name: string;
        pullRequests: {
          nodes: {
            url: string;
            author: {
              login: string;
            };
            title: string;
            isDraft: boolean;
            createdAt: string;
            reviewDecision: string;
            number: number;
          }[];
        };
      };
    }[];
  };
};
