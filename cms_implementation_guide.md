# CMS Implementation & Project Structure Guide

This document outlines the architecture of the **Axomshiksha** Hugo project, specifically tailored for implementing a Content Management System (CMS) like Decap CMS. It covers the data management (Admin) and content creation (Author) workflows.

## 1. Project Folder Structure

The project follows a standard Hugo structure with specific conventions for bilingual support and data-driven widgets.

```
axomshiksha/
├── content/
│   ├── class-6/                    # Class Section
│   │   ├── _index.md               # Class Metadata
│   │   └── social-science/         # Subject Section
│   │       ├── _index.md           # Subject Metadata
│   │       ├── english-medium/     # English Medium Container
│   │       │   ├── _index.md       # English Section Metadata
│   │       │   └── lesson-1.md     # Content Post
│   │       └── assamese-medium/    # Assamese Medium Container
│   │           ├── _index.md       # Assamese Section Metadata
│   │           └── lesson-1.md     # Content Post
│   └── ...
├── data/                           # Site Data (Admin Managed)
│   ├── writers.json                # Writers/Authors
│   ├── categories.json             # Main Categories
│   ├── course_descriptions.json    # Specific course text
│   ├── sub-category.json           # Sub-category metadata
│   ├── subjects.json               # Subject list & gradients
│   └── syllabus/                   # Syllabus Data
│       └── upper-primary/
│           ├── class-6/
│           │   ├── english.json
│           │   └── social-science.json
│           └── class-7/
│               └── ...
├── layouts/                        # Templates
│   ├── list.html                   # Main listing layout with Sidebar
│   └── ...
└── static/                         # Static assets (images, uploads)
```

---

## 2. Admin Guide (Data Management)

The "Admin" role is responsible for managing the site's structured data. These files populate dropdowns, sidebars, and metadata widgets.

### Updateable Data Collections

The CMS should verify and manage the following JSON files in the `data/` directory:

| Feature | File Path | Description | Fields to Manage |
| :--- | :--- | :--- | :--- |
| **Syllabus** | `data/syllabus/<group>/<class>/<subject>.json` | Defines chapters for the sidebar linking widget. | `title` (Subject Name), `title_as` (Assamese Name), `chapters` (List of objects with `title` and `title_as`) |
| **Subjects** | `data/subjects.json` | Global list of subjects and their visual styles. | Key (Subject Name), `gradient` (CSS Class), `description` |
| **Writers** | `data/writers.json` | List of content writers. | `name`, `image`, `bio`, `social_links` |
| **Categories** | `data/categories.json` | Main taxonomy terms. | `name`, `slug`, `description` |
| **Sub-Categories** | `data/sub-category.json` | Metadata for sub-categories (often Subject names). | Key (Slug), `description`, `thumbnail` |
| **Course Desc** | `data/course_descriptions.json` | Specific descriptions for Class-Subject pairings. | Key (`class-subject-slug`), `description` |

### Syllabus Data Structure Example (`english.json`)
The CMS must support creating nested folders or selecting existing ones to place these JSON files correctly.

```json
{
  "title": "Sunbeam",
  "chapters": [
    { "title": "Hobbies" },
    { "title": "The Daffodils" }
  ]
}
```

---

## 3. Author Guide (Content Creation)

The "Author" role is responsible for creating posts (Lessons, Notes). Use the following workflow to ensure content is correctly organized and linked.

### Workflow: Creating a New Lesson

#### Step 1: Check Hierarchy Existence
Before creating a post, ensure the parent folder structure exists. If not, follow the **creation path**:

1.  **Class Level**: Does `content/class-X/` exist?
    *   *If No*: Create folder `content/class-X/`. Add `_index.md` inside with `title`.
2.  **Subject Level**: Does `content/class-X/subject-name/` exist?
    *   *If No*: Create folder. Add `_index.md` with `title`.
3.  **Medium Level (For Bilingual Subjects)**:
    *   **English**: Does `content/class-X/subject-name/english-medium/` exist?
        *   *If No*: Create folder `english-medium`. Add `_index.md` (Title: "Subject (English Medium)", `weight: 10`, `params.medium: "english"`).
    *   **Assamese**: Does `content/class-X/subject-name/assamese-medium/` exist?
        *   *If No*: Create folder `assamese-medium`. Add `_index.md` (Title: "Subject (Assamese Medium)", `weight: 20`, `params.medium: "assamese"`).

#### Step 2: Create the Post
Create the markdown file inside the appropriate medium folder.

**Path**: `content/class-6/social-science/english-medium/lesson-1-our-earth.md`

**Frontmatter Requirements**:
```yaml
+++
title = "Our Earth (Class 6 Social Science)"
date = 2026-01-20
slug = "lesson-1-our-earth" 
# Critical: Must match a chapter title from the Syllabus JSON for sidebar linking
params
    [chapter_title] = "Our Earth in the Solar System"
    [medium] = "english" # or "assamese"
    [author] = "Ankur Rajbongshi"
+++
```

### CMS Configuration Logic
To automate this in Decap CMS (or similar):

1.  **Collections**: Create a **Nested Collection** for `pages` allowing users to navigate the `content/` tree.
2.  **Filter/Views**:
    *   Provide a view for **English Content** (filters for `english-medium` folder).
    *   Provide a view for **Assamese Content** (filters for `assamese-medium` folder).
3.  **Widgets**:
    *   **Chapter Title**: Use a Relation widget linked to the `data/syllabus/*` files to allow authors to select the chapter name instead of typing it. This prevents linking errors.

### Summary of Rules
*   **Always** nest content in `english-medium` or `assamese-medium` folders for bilingual subjects.
*   **Always** create `_index.md` when creating a new folder to ensure it renders correctly.
*   **Always** match `params.chapter_title` exactly to the syllabus English title.
