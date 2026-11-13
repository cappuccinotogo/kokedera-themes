// Where each generated port is published.
//
// Every port is generated into ports/<repository> of this monorepo and is
// installed from there. There are no standalone port repositories.
export const owner = 'cappuccinotogo';
export const monorepo = 'kokedera-themes';
export const monorepoUrl = `https://github.com/${owner}/${monorepo}`;

export const portPath = repo => `ports/${repo}`;

// The page where people find and install a port.
export const homeUrl = repo => `${monorepoUrl}/tree/main/${portPath(repo)}`;
