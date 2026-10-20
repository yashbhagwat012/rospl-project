# Product Requirements Document (PRD)
## Student Notes Manager — ROSPL Mini Project

**Document status:** Project planning draft  
**Project type:** Open-source contribution / enhancement  
**Course:** Recent Open Source Project Lab (ROSPL)  
**Team size:** 4 contributors  
**Primary technologies:** HTML5, CSS3, Vanilla JavaScript  
**Persistence:** Browser Local Storage  
**Version:** 1.0

---

## 1. Project Summary

Student Notes Manager is a lightweight, responsive web application that helps students organize study notes by title and subject. The team will contribute improvements to an existing open-source notes application rather than claiming to create an unrelated application from scratch.

The planned contribution focuses on three user-facing capabilities:
1. Search notes by title.
2. Filter notes by subject.
3. Export a selected note or all notes as a plain-text (`.txt`) file.

The existing application's create, view, edit, delete, and local persistence behaviour should continue to work. The team will use Git and GitHub for feature branches, commits, issues, pull requests, code review, testing, and documentation.

### 1.1 Open-source base project

**Candidate repository:** [NoteStack — rspavithra/NOTESTACK](https://github.com/rspavithra/NOTESTACK)

The public repository describes a notes app built with HTML, CSS, and JavaScript, with create/edit/delete, search, and Local Storage support. It contains `index.html`, `style.css`, `script.js`, a README, and a LICENSE file.

**Mandatory pre-fork checks:**
- Open and read the actual LICENSE file; do not infer a license from the presence of a file.
- Confirm the license permits the intended fork, modification, and redistribution.
- Read the README and inspect the current code and existing features.
- Confirm the proposed work is not already implemented.
- Record the original repository URL, license name, date checked, and baseline commit in the project report.
- Preserve copyright and license notices. Do not replace the upstream license.
- If the license is unclear or unsuitable, choose another repository with an explicit compatible license before contributing.

Repository features may change. Treat this repository as a candidate, not as a guarantee that every planned feature is missing.

## 2. Problem Statement

Students often keep study notes across different subjects and may struggle to find a note quickly or share a readable copy. The project aims to improve an existing lightweight notes application with clear title search, subject filtering, and plain-text export while preserving the application's basic note-management behaviour.

## 3. Goals and Objectives

- Improve an existing open-source notes application through traceable contributions.
- Help users create, view, edit, and delete notes.
- Let users search notes by title without case sensitivity.
- Let users filter notes by subject and return to the full list.
- Let users export note content as a readable `.txt` file.
- Preserve notes across page reloads using Local Storage, where supported by the base app.
- Keep the interface responsive and accessible on desktop and mobile screens.
- Ensure four members make balanced, visible contributions through separate branches and pull requests.
- Document setup, testing, design decisions, and contribution history.

## 4. Target Users

- College and university students.
- Learners organizing notes for multiple subjects.
- Users who need an offline, simple notes tool without accounts or a backend.

## 5. Scope

### 5.1 In scope

- Inspect and run the upstream application.
- Retain the base app's existing create/read/update/delete (CRUD) functionality.
- Search notes by title.
- Filter notes by subject.
- Export a note or all notes to `.txt`.
- Basic input validation and useful empty states.
- Local Storage persistence if already supported by the base.
- Responsive layout and keyboard-friendly controls.
- Manual test cases, lightweight automated tests where practical, screenshots, README updates, and a contribution log.
- GitHub Issues, feature branches, Pull Requests, review, and merge.

### 5.2 Out of scope

- User registration, login, or cloud sync.
- Backend server or remote database.
- Sharing notes between different users.
- AI summarization or automatic note generation.
- PDF export, file uploads, or rich-text editing.
- Mobile native application.
- A complete rewrite of the upstream project without a clear reason.

## 6. Functional Requirements

### FR-01: Create a note
The user can create a note with a title, subject, and content.
- Title and content must not be blank after trimming whitespace.
- Subject should be selected from existing subject options or entered according to the base app's design.
- A successful save displays the new note and persists it using the base application's storage approach.

### FR-02: View notes
The application displays saved notes in a readable list or card layout.
- Each note displays at least its title and subject.
- Long content must not break the layout.
- If no notes exist, show a helpful empty state.

### FR-03: Edit a note
The user can edit a saved note and save the changes.
- Editing must update the selected note rather than create a duplicate.
- Existing title, subject, and content should be loaded into the editor.

### FR-04: Delete a note
The user can delete a saved note.
- The interface should make it clear which note is being deleted.
- Use a confirmation step if consistent with the existing application.
- The list and storage should update after deletion.

### FR-05: Search by title
The user can type in a search field to find notes by title.
- Search updates the displayed list as the user types or after a clear search action.
- Matching is case-insensitive.
- Leading/trailing spaces in the query should not cause unexpected results.
- Search must not modify or delete the underlying notes.
- A clear action or empty query restores results subject to the current subject filter.
- If no notes match, display a “No notes found” message.

### FR-06: Filter by subject
The user can select a subject to show only notes belonging to that subject.
- Include an “All subjects” option.
- Subject options should be based on the available subjects or note data.
- Search and subject filtering must work together.
- Clearing the filter returns to all subjects while preserving the search query.
- If no notes match, show a helpful empty state.

### FR-07: Export notes to a text file
The user can export either a selected note or all notes as a `.txt` file. The team may implement both if the base architecture allows; at minimum, implement export of all notes.
- The downloaded file uses a clear filename, for example `student-notes.txt` or `note-<safe-title>.txt`.
- Each exported note contains its title, subject, content, and a separator between notes.
- Text must remain readable when titles or content contain punctuation and Unicode characters.
- Export must not alter or remove saved notes.
- If there are no notes to export, show a helpful message or disable the export action.
- Use browser-native Blob and download-link functionality; no external service is required.

### FR-08: Persistence
- Notes should remain after a page refresh if the base application uses Local Storage.
- Handle missing or invalid stored data without crashing where practical.
- Do not store passwords or sensitive data; this app has no account system.

### FR-09: Responsive and accessible UI
- Main actions have visible labels.
- Inputs have associated labels or accessible names.
- Controls can be reached and used with a keyboard.
- The layout remains usable on common desktop and mobile widths.
- Colour contrast and focus indicators should be reasonable.

### FR-10: Feedback and error handling
- Give clear feedback after save, update, delete, or export.
- Do not silently fail on invalid form input.
- Avoid exposing raw internal errors to end users.

## 7. Non-Functional Requirements

- **Usability:** Common actions should be discoverable without instructions.
- **Performance:** Searching/filtering a normal student-sized collection (up to 1,000 notes) should feel responsive on a typical laptop.
- **Reliability:** Existing CRUD and storage behaviour must not regress.
- **Compatibility:** Support recent versions of Chrome, Edge, and Firefox where feasible.
- **Maintainability:** Keep code readable, use meaningful function and variable names, and avoid unnecessary dependencies.
- **Privacy:** Notes remain in the user's browser; no note content is sent to a server.
- **Accessibility:** Semantic HTML, visible focus, labels, and usable empty states.
- **Portability:** The app should run using the upstream instructions, ideally through a simple local static server or by opening the HTML file if supported.

## 8. User Stories and Acceptance Criteria

| ID | User story | Acceptance criteria |
|---|---|---|
| US-01 | As a student, I want to create a note so I can save study material. | A valid note appears in the list and persists after refresh. |
| US-02 | As a student, I want to edit a note so I can correct information. | The chosen note changes and no duplicate is created. |
| US-03 | As a student, I want to delete a note so I can remove outdated material. | The note disappears from the list and storage. |
| US-04 | As a student, I want to search by title so I can find a note quickly. | Search is case-insensitive and only matching titles appear. |
| US-05 | As a student, I want to filter by subject so I can study one subject at a time. | Only notes for the selected subject appear; “All subjects” resets it. |
| US-06 | As a student, I want search and filtering together. | Results satisfy both the title query and subject filter. |
| US-07 | As a student, I want to export notes to text. | A readable `.txt` file downloads with the expected note fields. |
| US-08 | As a contributor, I want a reviewable contribution process. | Each member opens a PR from their feature branch; PRs are reviewed before merging. |

## 9. Proposed User Interface

- **Header:** Application name and short description.
- **Action area:** “Add Note” and “Export Notes” controls.
- **Search area:** Title search input and clear action.
- **Subject filter:** Dropdown including “All subjects”.
- **Notes area:** Cards or rows with title, subject, preview, edit, and delete actions.
- **Editor:** Form for title, subject, and content.
- **Feedback:** Validation messages, success notices, and empty states.

Do not redesign the entire upstream UI unless necessary. Prefer changes that fit its existing style.

## 10. Data Model

Adapt field names to the upstream implementation. A conceptual note object is:

```js
{
  id: "unique-id",
  title: "Introduction to DBMS",
  subject: "DBMS",
  content: "Study notes...",
  createdAt: "ISO-8601 timestamp",
  updatedAt: "ISO-8601 timestamp"
}
```

- Use a stable unique ID rather than using the title as the identifier.
- If the base project already has a compatible data model, preserve it.
- Avoid changing the stored schema unnecessarily.
- If a schema change is unavoidable, document it and handle existing stored notes safely.

## 11. Technical Design

### Technology stack
- HTML5 for semantic structure.
- CSS3 for layout, responsiveness, and focus states.
- Vanilla JavaScript for note logic and DOM updates.
- Local Storage for persistence if supported by the base app.
- Git and GitHub for version control, issues, and PRs.
- Browser Blob and object URLs for `.txt` export.

### Suggested separation of responsibilities
Keep the upstream structure when possible. If the project uses a simple three-file structure:
- `index.html`: page structure and controls.
- `style.css`: styling and responsive rules.
- `script.js`: note operations, search, filtering, persistence, and export.

Do not split files or introduce a build system unless the existing project requires it.

### Search and filter behaviour
- Keep the original notes collection unchanged.
- Derive a displayed list by applying the title query and subject filter.
- Render the resulting list.
- Ensure resetting one control does not unintentionally reset the other.

### Export behaviour
- Build a plain-text representation from saved note objects.
- Create a `text/plain` Blob.
- Create a temporary object URL and trigger a download.
- Revoke the object URL after initiating the download.
- Use safe filenames and do not use HTML rendering to construct exported content.

## 12. Equal Four-Member Work Allocation

The team has four equal contributors. Each member owns one primary feature area and also shares review, integration, testing, and documentation responsibilities.

| Member | Primary ownership | Deliverables | Shared responsibilities |
|---|---|---|---|
| Member 1 | Notes CRUD and validation | Review/maintain create, edit, delete behaviour; validation and regression tests; document baseline behaviour | Review another PR, test final build, contribute report section |
| Member 2 | Title search | Search UI and logic; case-insensitive matching; clear-search and no-results states; tests | Review another PR, update README usage, contribute report section |
| Member 3 | Subject filter | Subject dropdown/options; filter logic; combined search+filter behaviour; tests | Review another PR, prepare UI screenshots, contribute report section |
| Member 4 | Text export | `.txt` export for all notes (and selected note if feasible); filename and empty-state handling; tests | Review another PR, maintain contribution log and report references |

### Equality rules
- Each member creates their own feature branch and meaningful commits.
- Each member opens at least one PR with a description, testing notes, and screenshots where relevant.
- Each member reviews at least one other member's PR.
- Each member writes one section of the report and participates in final testing.
- The merge coordinator role rotates or is shared; no one person should perform all integration work.
- If one feature is already present in the upstream project, its owner should improve, test, or document it meaningfully rather than submit a duplicate feature. Confirm the baseline before finalizing assignments.

### Suggested branch names
- `feature/crud-validation-member-1`
- `feature/title-search-member-2`
- `feature/subject-filter-member-3`
- `feature/text-export-member-4`

Use actual names or GitHub usernames in the final report only after the group confirms them.

## 13. GitHub Contribution Workflow

1. Select and verify the open-source base project and its license.
2. Fork the upstream repository into the designated group member's GitHub account or organization.
3. Add collaborators and agree on branch protection/review rules where available.
4. Clone the shared fork.
5. Pull the latest `main` before beginning each task.
6. Create a feature branch for each issue.
7. Implement a small, focused change.
8. Test locally and review the diff.
9. Commit with a descriptive message.
10. Push the branch and open a Pull Request against the group fork's `main`.
11. A different member reviews the PR and requests changes if needed.
12. Resolve comments, run regression tests, and merge only after approval.
13. Pull the updated `main` before starting another task.
14. Keep issue, PR, commit, and report references accurate.

Example commands (replace the URL with the team's actual fork):

```bash
git clone <GROUP_FORK_URL>
cd <REPOSITORY_FOLDER>
git checkout main
git pull origin main
git checkout -b feature/title-search-member-2

# Make and test your change
git add .
git commit -m "Add case-insensitive title search"
git push -u origin feature/title-search-member-2

# Open a Pull Request on GitHub and request a teammate review
```

Never commit directly to `main` for assigned feature work.

## 14. Testing Plan

| Test ID | Scenario | Expected result |
|---|---|---|
| T-01 | Create a note with valid fields | Note appears and is saved |
| T-02 | Submit a blank title or content | Validation prevents invalid save |
| T-03 | Edit an existing note | Existing note updates without duplication |
| T-04 | Delete a note | Note is removed after confirmation if confirmation exists |
| T-05 | Refresh after saving | Saved notes remain available |
| T-06 | Search with exact title | Matching note appears |
| T-07 | Search with different letter case | Same matching note appears |
| T-08 | Search with no match | No-results message appears |
| T-09 | Select a subject | Only that subject's notes appear |
| T-10 | Search and filter simultaneously | Results satisfy both conditions |
| T-11 | Reset search only | Subject filter remains active |
| T-12 | Reset subject only | Search query remains active |
| T-13 | Export all notes | `.txt` downloads and contains all expected fields |
| T-14 | Export when no notes exist | Clear message or disabled action; no crash |
| T-15 | Export text with punctuation/Unicode | Content remains readable |
| T-16 | Use app at mobile width | Controls remain usable |
| T-17 | Keyboard navigate controls | Focus is visible and controls are reachable |
| T-18 | Review integrated features | CRUD, search, filter, export work together |

Record actual results only after tests are run. Do not claim “Pass” in the final report before testing.

## 15. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| A desired feature already exists upstream | Inspect the code first and choose a meaningful enhancement or different issue |
| Unclear or incompatible license | Verify the license before forking/contributing; choose another base if necessary |
| Conflicts in shared files | Keep PRs small, coordinate changes, pull latest `main`, and review conflicts together |
| One member has less work | Balance deliverables; require PR, review, testing, and report contributions from all |
| Search breaks subject filter | Use one combined filtering pipeline and test interactions |
| Export omits notes or fields | Test with multiple subjects, empty content edge cases, punctuation, and Unicode |
| Local Storage data format differs | Preserve upstream schema and test existing saved notes |
| Unverified report claims | Keep screenshots, commit hashes, PR links, and actual test results as evidence |

## 16. Five-Week Suggested Schedule

| Week | Work | Evidence |
|---|---|---|
| 1 | Inspect upstream, verify license, run baseline, create issues, agree on coding conventions | Baseline notes, license record, GitHub issues |
| 2 | Member 1 CRUD/validation; Member 2 title search | Feature branches, first PRs, tests |
| 3 | Member 3 subject filter; Member 4 export | Feature branches, PRs, tests |
| 4 | Peer review, resolve conflicts, integrate and run regression tests | Approved PRs, test log |
| 5 | Screenshots, README, contribution log, final report and demo | Final report, repository history, demo checklist |

Adapt the schedule to the actual ROSPL deadline.

## 17. Definition of Done

A feature is complete only when:
- It works in the running application.
- Existing functionality is not broken.
- Relevant tests have been run and results recorded.
- Code is readable and follows repository conventions.
- The contributor has committed on their feature branch.
- A PR contains a clear summary and test evidence.
- At least one teammate has reviewed it.
- Required changes are addressed and the PR is merged.
- README/report documentation is updated where necessary.

The project is ready for submission when all planned features are integrated, the final test suite/checklist is recorded, all four members have visible contributions, the original license notices are preserved, and the report matches the actual repository history.

## 18. Final Deliverables

- Forked open-source repository with preserved license and upstream attribution.
- Student Notes Manager improvements.
- Four member-owned feature branches and Pull Requests.
- Review comments and merge history.
- Test checklist with actual results.
- Updated README with setup and usage instructions.
- Screenshots of the application and GitHub contribution workflow.
- ROSPL report: introduction, literature/context review, objectives, stack, architecture, implementation, team contributions, Git workflow, testing, screenshots, log book, conclusion, and references.

## 19. References

- Candidate base repository: https://github.com/rspavithra/NOTESTACK
- GitHub Docs — About pull requests: https://docs.github.com/en/pull-requests
- GitHub Docs — Fork a repository: https://docs.github.com/en/get-started/quickstart/fork-a-repo
- GitHub Docs — GitHub flow: https://docs.github.com/en/get-started/using-github/github-flow
- MDN — Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- MDN — Blob: https://developer.mozilla.org/en-US/docs/Web/API/Blob
