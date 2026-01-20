import { Octokit } from 'octokit';

const token = process.env.GITHUB_TOKEN_DEMO || process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER!;
const repo = (process.env.GITHUB_REPO_DEMO || process.env.GITHUB_REPO)!;

if (!token || !owner || !repo) {
    console.error("Missing env vars");
    process.exit(1);
}

console.log(`Fetching from ${owner}/${repo}...`);

const octokit = new Octokit({
    auth: token,
});

async function main() {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: 'data/subjects.json',
        });
        console.log("Success! Data type:", Array.isArray(data) ? "Array" : "Object");
    } catch (error) {
        console.error("Error detected:");
        console.error(error);
    }
}

main();
