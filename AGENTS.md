# AGENTS.md — Student Notes Manager

This file gives instructions to AI coding agents and human contributors working in this repository. Follow the upstream repository's existing conventions first. These instructions do not replace the upstream LICENSE or contribution rules.

## 1. Project mission

Improve an existing open-source student notes application using HTML, CSS, and vanilla JavaScript. The planned ROSPL contribution covers:
- Reliable note create/read/update/delete behaviour (preserve existing behaviour).
- Case-insensitive title search.
- Subject filtering.
- Plain-text `.txt` export.
- GitHub collaboration, review, tests, and documentation.

This is an enhancement project. Do not rewrite the application from scratch unless the team documents why the existing code cannot support the requirement.

## 2. Before making changes

1. Read `README.md`, `LICENSE`/`LICENSE.md`, and the current source code.
2. Verify the exact license text and retain all required copyright/attribution notices.
3. Run the application using the repository's documented instructions.
4. Record which planned features already exist. Do not implement duplicate functionality without identifying a meaningful improvement.
5. Inspect the current data model and Local Storage key. Preserve compatibility with existing saved notes.
6. Read open issues and open PRs to avoid overlapping work.
7. Ask the team before changing shared architecture, dependencies, stored data schema, or project structure.

If license terms are unclear, stop before redistributing or submitting modifications and ask the team to choose a clearly licensed alternative.

## 3. Technology and scope rules

- Prefer HTML5, CSS3, and vanilla JavaScript.
- Avoid adding frameworks, build tools, dependencies, backend services, accounts, analytics, or external APIs unless the team approves a documented need.
- Keep the application usable offline after it has loaded, within the limits of browser storage.
- Keep note data in the browser; do not send note content to remote services.
- Keep changes focused and compatible with the existing structure.
- Do not introduce unrelated features such as AI summarization, authentication, cloud sync, PDF export, or note sharing.

## 4. Functional rules

### Notes and validation
- Preserve existing create, view, edit, and delete behaviour.
- Use stable note IDs; do not identify a note only by its title.
- Trim title/subject fields where appropriate.
- Prevent saving a blank title or blank content, unless the upstream app has a documented alternative requirement agreed by the team.
- Editing must update the intended note, not create a duplicate.
- Deletion must affect only the selected note.

### Search
- Search titles case-insensitively.
- Trim the query before matching.
- Search must not mutate the saved note collection.
- Clearing the query must restore results subject to the active subject filter.
- Display a useful empty state when there are no matches.

### Subject filter
- Provide an “All subjects” option.
- Derive subject choices from the current notes or preserve the upstream subject model.
- Search and subject filtering must work together.
- Clearing the subject filter must preserve the active search query.
- Avoid duplicated or inconsistent filter logic; use a shared function to derive visible notes where practical.

### Text export
- Export at least all notes to a readable `.txt` file. Exporting one selected note is optional if it fits the base app.
- Include title, subject, content, and clear separators between notes.
- Use `Blob` with MIME type `text/plain;charset=utf-8` or an equivalent valid plain-text MIME type.
- Use a safe, understandable filename.
- Do not change or delete stored notes during export.
- Handle the no-notes case gracefully.
- Revoke temporary object URLs after the download is initiated.
- Do not use `innerHTML` to inject untrusted note text. Prefer `textContent` or safe DOM construction.

## 5. Data and browser storage

- Inspect the upstream schema and storage key before coding.
- Preserve existing fields and data wherever possible.
- Do not wipe Local Storage during normal startup.
- Handle missing or malformed storage defensively if doing so fits the existing design.
- If a schema migration is needed, explain the reason in the PR and test old saved notes.
- Do not store secrets or personal credentials.

## 6. UI and accessibility

- Reuse the upstream design language and component patterns.
- Keep the interface responsive on desktop and mobile.
- Use semantic HTML and associated labels for form fields.
- Ensure buttons and inputs have clear accessible names.
- Keep controls keyboard reachable and preserve visible focus indicators.
- Provide useful validation messages, empty states, and action feedback.
- Avoid unnecessary visual changes in feature PRs.

## 7. Four-member ownership

Use the group-approved assignments. If actual names have not been added to the README/PRD, use these neutral labels until the group confirms names:

- **Member 1 — CRUD and validation:** baseline CRUD verification, validation improvements, CRUD regression tests.
- **Member 2 — Title search:** search UI/logic, case-insensitive matching, clear-search and no-results behaviour.
- **Member 3 — Subject filter:** subject selector, filter logic, interaction tests with search.
- **Member 4 — Text export:** `.txt` export, readable formatting, filename and empty-state handling.

Each member must:
- Work on a personal feature branch.
- Commit meaningful, scoped changes.
- Open at least one Pull Request.
- Include test steps and observed results in the PR.
- Review at least one other member's PR.
- Help with final integration testing and report documentation.

If a feature is already complete upstream, its owner should first propose a distinct improvement, additional tests, accessibility enhancement, or documentation task. The team should agree on that change before coding so all four contributions remain meaningful.

## 8. Git and Pull Request rules

- Never commit assigned feature work directly to `main`.
- Pull the latest `main` before creating a branch and before beginning a new task.
- Use branch names such as:
  - `feature/crud-validation-member-1`
  - `feature/title-search-member-2`
  - `feature/subject-filter-member-3`
  - `feature/text-export-member-4`
- Use descriptive commit messages, e.g. `Add case-insensitive title search`.
- Keep PRs small and limited to one feature or related fix.
- PR descriptions must include:
  1. What changed.
  2. Why it was needed.
  3. How to test it.
  4. Actual test result.
  5. Screenshot for visible UI changes, when practical.
  6. Related issue number, if one exists.
- A different teammate should review each PR.
- Address review comments before merge.
- Resolve merge conflicts with the team; do not discard another member's changes without discussion.
- Do not claim a PR was reviewed, merged, or tested unless it actually was.

## 9. Code quality

- Use meaningful variable and function names.
- Prefer small functions with one clear responsibility.
- Avoid global state when the existing design can reasonably avoid it.
- Avoid duplicate search/filter logic.
- Avoid unrelated refactoring and large formatting-only changes.
- Handle user input as text, not executable HTML.
- Do not add a dependency for a task that can be solved safely with existing browser APIs.
- Keep comments focused on non-obvious behaviour, not every line.
- Follow the repository's existing indentation and naming conventions.

## 10. Testing expectations

At minimum, manually test relevant cases:
- Create, edit, delete, and persistence after refresh.
- Blank title/content validation.
- Search exact title and mixed-case title.
- Search with leading/trailing spaces and no matches.
- Filter by subject and reset to “All subjects”.
- Search and subject filter used together.
- Clear search without resetting subject; clear subject without resetting search.
- Export multiple notes and verify all expected fields.
- Export empty list.
- Export titles/content containing punctuation and Unicode.
- Responsive layout and keyboard focus.
- Integrated features working together.

If the repository already has a test framework, use it. Do not introduce a heavy test framework solely for this mini-project without team approval. Document manual tests clearly when automated tests are not available.

## 11. Documentation and reporting

- Update README setup/usage instructions when behaviour changes.
- Preserve upstream attribution and license information.
- Record actual contributors, branches, commits, PR links, review, screenshots, and test results.
- Do not invent performance numbers, accuracy results, completed tasks, or test passes.
- Keep the ROSPL report aligned with the final repository state.
- Add new dependencies and setup steps to documentation if approved.

## 12. Definition of done

A contribution is done only when:
- The change meets its acceptance criteria.
- Relevant tests were run and results are recorded.
- Existing functionality still works.
- The diff is focused and understandable.
- The PR includes a description and test instructions.
- A teammate reviewed the change.
- Requested changes are resolved.
- The PR is merged into the group's main branch.
- Documentation is updated where needed.

## 13. Stop and ask before

Ask the team before:
- Changing the license or removing upstream notices.
- Replacing the app architecture or adding a framework.
- Changing the Local Storage schema or key.
- Removing existing features.
- Adding a network request or sending note content externally.
- Merging a PR with failing tests or unresolved review comments.
- Claiming an upstream feature is missing before inspecting the current code.
