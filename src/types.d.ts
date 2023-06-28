// Only care about these fields so only specifying these types
type RepoType = {
  name: string;
  pullRequests: {
    nodes: PullType[];
  };
};

// As above
type PullType = {
  url: string;
  author: {
    login: string;
  };
  title: string;
  isDraft: boolean;
  createdAt: string;
  reviewDecision: string;
  number: number;
  assignees: {
    edges: {
      node: {
        login: string;
      };
    }[];
  };
  repository: {
    name: string;
  };
};

// Really lazily copied from https://docs.github.com/en/graphql/overview/explorer - there's probably a better way to type this
type GQLResponse = {
  repoSearch: {
    edges: {
      node: RepoType;
    }[];
  };
  issueSearch?: {
    edges: {
      node: PullType;
    }[];
  };
};

type EnvType = {
  authToken: string;
  usertype: string;
  owner: string;
  repoSearch: string;
  searchTerm?: string;
  ignoredRepoPattern?: string;
};
