
import { getDirectoryContent, getFileContent } from './actions/cms/fileSystem';

async function main() {
    console.log("Checking environment...");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("GITHUB_REPO:", process.env.GITHUB_REPO);
    console.log("GITHUB_REPO_DEMO:", process.env.GITHUB_REPO_DEMO);

    console.log("\nListing data/syllabus/secondary/class-9...");
    try {
        const files = await getDirectoryContent('data/syllabus/secondary/class-9');
        console.log("Files:", JSON.stringify(files, null, 2));
    } catch (e) {
        console.log("Error listing directory:", e);
    }

    console.log("\nFetching raw content of data/syllabus/secondary/class-9/assamese.json...");
    try {
        const content = await getFileContent('data/syllabus/secondary/class-9/assamese.json');
        console.log("Raw Content:", JSON.stringify(content, null, 2));
    } catch (e) {
        console.log("Error fetching raw content:", e);
    }
}

main();
