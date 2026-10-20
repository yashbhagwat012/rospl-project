# Student Notes Manager — ROSPL Project

A lightweight, responsive web application designed for students to organize, manage, and study course notes categorized by title, subject, and labels.

**Repository:** [https://github.com/yashbhagwat012/rospl-project](https://github.com/yashbhagwat012/rospl-project)  
**Course:** Recent Open Source Project Lab (ROSPL)  
**Maintainer:** Yash Bhagwat ([@yashbhagwat012](https://github.com/yashbhagwat012))  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (Zero External Dependencies)

---

## 🌟 Key Features

### 1. Robust Note Management (CRUD)
- **Create:** Create notes with mandatory **Title** and **Content**, plus subject categorization and color labels.
- **View:** Clean card layout displaying note subject badges, title, content, color labels, and timestamp.
- **Edit:** Dedicated interactive **Edit Modal** to update titles, subjects, and contents in-place without duplicating records.
- **Delete & Trash Protection:** Safe deletion with confirmation dialog moving notes to **Trash**, allowing easy restoration or permanent deletion.

### 2. Validation & User Feedback
- Comprehensive client-side validation requiring non-blank titles and note contents with whitespace trimming.
- Non-intrusive inline validation banners and animated toast notifications for all user actions.

### 3. Organization & Filtering
- Categorize by subjects (e.g., DBMS, Operating Systems, Mathematics).
- Color-coded labels: 🔴 Important, 🟡 Work, 🔵 Personal, 🟢 Ideas.
- Custom folder creation for semester or course segregation.
- Quick search across titles, contents, and subjects.

### 4. Title Search (Member 2 — FR-05)
- **Case-insensitive by default** — matches "calculus", "Calculus", "CALCULUS" equally.
- **Case-sensitive toggle** — activate the **Aa** button in the search bar (or press `Alt + C`) for exact-case matching.
- **Search scope selector** — choose *Title Only* (default) or *All Fields* from the dropdown next to the search bar.
- **Live results** — notes filter as you type; a status bar shows match count, mode, and scope.
- **Clear button** — ✕ button appears during search; click it or press `Esc` to reset instantly.
- **Smart empty state** — "No matches" message includes a "Try Case-Insensitive" fallback button when case-sensitive mode is on.
- **Title highlighting** — matched text in note card titles is visually highlighted in yellow.
- **Label search** — prefix query with `#` (e.g. `#work`) to filter by label instead of title.
- **Search does not mutate saved notes** — underlying data is never modified during search.

### 5. Accessibility & UI
- Fully responsive across desktop and mobile screens.
- **Dark Mode** toggle with local storage persistence.
- Safe DOM construction (`textContent`) to prevent XSS.

### 6. Keyboard Shortcuts
- `Alt + N` — Focus new note title input
- `Alt + S` — Focus search bar
- `Alt + C` — Toggle case-sensitive title search *(new)*
- `Alt + D` — Toggle Dark / Light mode
- `Alt + T` — Navigate to Trash view
- `Esc` — Close open modals or clear search query

---

## 🚀 Getting Started

NoteStack runs directly in modern web browsers without requiring Node packages, build tools, or backend setups.

### Method 1: Direct Browser Launch (Fastest)
Simply double-click `index.html` in your file explorer, or execute:
```powershell
Start-Process index.html
```

### Method 2: Local HTTP Server
Using VS Code Live Server:
1. Open the project folder in VS Code.
2. Right-click `index.html` and click **"Open with Live Server"**.

Or using Python / Node:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```
Navigate to `http://localhost:8000`.

---

## 🧪 Testing & Verification

The project includes automated regression test suites covering CRUD operations, validation, title search logic, and edge cases.

### 1. Run CRUD Regression Tests (Node.js)
```bash
node tests/crud-regression.test.js
```
*Executes 12 CRUD and validation regression tests — 100% pass rate.*

### 2. Run Title Search Tests (Node.js)
```bash
node tests/title-search.test.js
```
*Executes 18 title search tests: case-insensitive/sensitive, scope selector, category filter, labels, Unicode, mutation safety, and edge cases — 100% pass rate.*

### 3. Run In-Browser Test Suite
Open `tests.html` in your browser:
```powershell
Start-Process tests.html
```
Provides visual pass/fail badges and interactive test re-execution.

---

## 📁 Project Structure

```text
rospl-project/
├── index.html                  # Semantic UI structure and modals
├── style.css                   # Responsive layouts, themes, and animations
├── script.js                   # Application logic, CRUD, search, and LocalStorage
├── tests.html                  # Interactive browser test runner
├── tests/
│   ├── crud-regression.test.js # Headless CRUD regression tests — 12 cases (Member 1)
│   └── title-search.test.js    # Headless title search tests — 18 cases (Member 2)
├── PRD.md                      # Product Requirements Document
├── AGENTS.md                   # Collaboration and agent contribution guide
├── README.md                   # Project documentation
└── LICENSE                     # MIT License
```

---

## 📜 License & Acknowledgments

This project is licensed under the [MIT License](LICENSE).

**Base Attribution:** This project originated from the open-source [NoteStack](https://github.com/rspavithra/NOTESTACK) project by Pavithra R S and was significantly enhanced, tested, and maintained by Yash Bhagwat for the Recent Open Source Project Lab (ROSPL).
