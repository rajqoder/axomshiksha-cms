import matter from 'gray-matter';

export function parseFrontmatter(content: string) {
    try {
        const { data, content: body } = matter(content);
        return { frontmatter: data, content: body };
    } catch (e) {
        // Fallback for empty or invalid content
        return { frontmatter: {}, content };
    }
}
