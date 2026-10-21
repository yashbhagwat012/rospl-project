// DOM Elements - Inputs & Main Containers
const noteTitleInput = document.getElementById("noteTitleInput");
const noteSubjectInput = document.getElementById("noteSubjectInput");
const noteInput = document.getElementById("noteInput");
const noteValidationMsg = document.getElementById("noteValidationMsg");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesGrid = document.getElementById("notesGrid");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const exportNotesBtn = document.getElementById("exportNotesBtn");
const caseSensitiveBtn = document.getElementById("caseSensitiveBtn");
const searchScopeSelect = document.getElementById("searchScopeSelect");
const searchStatus = document.getElementById("searchStatus");
const searchStatusText = document.getElementById("searchStatusText");
const resetSearchFilterBtn = document.getElementById("resetSearchFilterBtn");
const trashGrid = document.getElementById("trashGrid");
const darkModeBtn = document.getElementById("darkModeBtn");
const labelCheckboxes = document.querySelectorAll(".label-checkbox");

// Subject Filter Elements
const subjectFilterSelect = document.getElementById("subjectFilterSelect");
const clearSubjectFilterBtn = document.getElementById("clearSubjectFilterBtn");
const subjectFilterStatus = document.getElementById("subjectFilterStatus");

// Folder Elements
const newFolderBtn = document.getElementById("newFolderBtn");
const newFolderModal = document.getElementById("newFolderModal");
const closeFolderModal = document.getElementById("closeFolderModal");
const folderNameInput = document.getElementById("folderNameInput");
const createFolderBtn = document.getElementById("createFolderBtn");
const customFoldersList = document.getElementById("customFoldersList");
const folderSelect = document.getElementById("folderSelect");

// Edit Modal Elements
const editNoteModal = document.getElementById("editNoteModal");
const closeEditModal = document.getElementById("closeEditModal");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const editNoteId = document.getElementById("editNoteId");
const editNoteTitle = document.getElementById("editNoteTitle");
const editNoteSubject = document.getElementById("editNoteSubject");
const editNoteContent = document.getElementById("editNoteContent");
const editValidationMsg = document.getElementById("editValidationMsg");

// Delete Confirmation Modal Elements
const deleteConfirmModal = document.getElementById("deleteConfirmModal");
const closeDeleteModal = document.getElementById("closeDeleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteConfirmText = document.getElementById("deleteConfirmText");

// Toast Element
const toastNotification = document.getElementById("toastNotification");

// Views and Navigation
const notesView = document.getElementById("notesView");
const trashView = document.getElementById("trashView");
const navNotes = document.getElementById("navNotes");
const navTrash = document.getElementById("navTrash");

// State
let currentFilter = "all"; // Category or folder filter
let activeSubjectFilter = ""; // Subject dropdown filter (empty = All Subjects)
let pendingDeleteNoteId = null;
let toastTimeout = null;
let isCaseSensitive = false;
let searchScope = "title"; // "title" (Title Search) or "all" (All Fields)

/* ===========================
   STORAGE & DATA MODEL
=========================== */

function loadStoredNotes() {
    try {
        const stored = localStorage.getItem("notestackNotes") || localStorage.getItem("ultimateNotes");
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse notes from storage:", e);
        return [];
    }
}

function loadStoredTrash() {
    try {
        const stored = localStorage.getItem("ultimateTrash");
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse trash from storage:", e);
        return [];
    }
}

function loadStoredFolders() {
    try {
        const stored = localStorage.getItem("noteFolders");
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse folders from storage:", e);
        return [];
    }
}

// Normalize notes to ensure schema integrity and backwards compatibility
function normalizeNote(note) {
    if (typeof note === "string") {
        const content = note;
        const title = content.split("\n")[0].substring(0, 50).trim() || "Untitled Note";
        return {
            id: String(Date.now() + Math.random()),
            title: title,
            subject: "General",
            content: content,
            text: content,
            labels: [],
            folder: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    const content = note.content !== undefined ? String(note.content) : (note.text !== undefined ? String(note.text) : "");
    const title = (note.title && String(note.title).trim())
        ? String(note.title).trim()
        : (content.split("\n")[0].substring(0, 50).trim() || "Untitled Note");
    const subject = (note.subject && String(note.subject).trim())
        ? String(note.subject).trim()
        : ((note.folder && String(note.folder).trim()) ? String(note.folder).trim() : "General");

    return {
        id: note.id ? String(note.id) : String(Date.now() + Math.random()),
        title: title,
        subject: subject,
        content: content,
        text: content, // Maintain text field for legacy compatibility
        labels: Array.isArray(note.labels) ? note.labels : [],
        folder: note.folder || (subject !== "General" ? subject : ""),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || new Date().toISOString()
    };
}

let notes = loadStoredNotes().map(normalizeNote);
let trash = loadStoredTrash().map(normalizeNote);
let folders = loadStoredFolders();

function saveNotes() {
    try {
        localStorage.setItem("notestackNotes", JSON.stringify(notes));
        // Keep ultimateNotes key synced for backwards compatibility
        localStorage.setItem("ultimateNotes", JSON.stringify(notes));
    } catch (e) {
        console.error("Failed to save notes:", e);
        showToast("Storage error: Failed to save notes.", "error");
    }
}

function saveTrash() {
    try {
        localStorage.setItem("ultimateTrash", JSON.stringify(trash));
    } catch (e) {
        console.error("Failed to save trash:", e);
    }
}

function saveFolders() {
    try {
        localStorage.setItem("noteFolders", JSON.stringify(folders));
    } catch (e) {
        console.error("Failed to save folders:", e);
    }
}

// Initial sync save
saveNotes();

/* ===========================
   SEARCH & TEXT UTILITIES
=========================== */

function escapeRegExp(string) {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function highlightMatch(rawText, query, caseSensitive = false) {
    if (!rawText) return "";
    const safeText = escapeHTML(rawText);
    const trimmedQuery = query ? query.trim() : "";
    if (!trimmedQuery) return safeText;

    try {
        const escaped = escapeRegExp(escapeHTML(trimmedQuery));
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(`(${escaped})`, flags);
        return safeText.replace(regex, '<mark class="search-highlight">$1</mark>');
    } catch {
        return safeText;
    }
}

function matchesNoteSearch(note, query, { scope = "title", caseSensitive = false } = {}) {
    const trimmed = query ? query.trim() : "";
    if (!trimmed) return true;

    // Fast-path for #label search
    if (trimmed.startsWith("#")) {
        const labelQuery = trimmed.substring(1);
        if (!labelQuery) return true;
        return Array.isArray(note.labels) && note.labels.some(label =>
            caseSensitive ? label.includes(labelQuery) : label.toLowerCase().includes(labelQuery.toLowerCase())
        );
    }

    const title = note.title || "";
    const content = note.content !== undefined ? String(note.content) : (note.text !== undefined ? String(note.text) : "");
    const subject = note.subject || "";

    if (caseSensitive) {
        if (scope === "title") {
            return title.includes(trimmed);
        } else {
            return title.includes(trimmed) || content.includes(trimmed) || subject.includes(trimmed);
        }
    } else {
        const qLower = trimmed.toLowerCase();
        if (scope === "title") {
            return title.toLowerCase().includes(qLower);
        } else {
            return title.toLowerCase().includes(qLower) ||
                   content.toLowerCase().includes(qLower) ||
                   subject.toLowerCase().includes(qLower);
        }
    }
}

/* ===========================
   UI FEEDBACK & NOTIFICATIONS
=========================== */

function showToast(message, type = "success") {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.className = `toast ${type} show`;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotification.className = "toast";
    }, 2500);
}

function formatNotesForTextExport(notesToExport) {
    const separator = "------------------------------------------------------------";
    return notesToExport.map((note, index) => {
        const rawContent = note.content !== undefined ? String(note.content) : String(note.text || "");
        const content = rawContent.replace(/\r?\n/g, "\r\n");
        return [
            `Note ${index + 1}`,
            `Title: ${note.title || "Untitled Note"}`,
            `Subject: ${note.subject || "General"}`,
            "",
            "Content:",
            content
        ].join("\r\n");
    }).join(`\r\n\r\n${separator}\r\n\r\n`);
}

function exportNotesAsText() {
    if (notes.length === 0) {
        showToast("No notes to export.", "error");
        return;
    }

    const blob = new Blob([formatNotesForTextExport(notes)], { type: "text/plain;charset=utf-8" });
    const downloadLink = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    downloadLink.href = objectUrl;
    downloadLink.download = "student-notes.txt";

    try {
        document.body.appendChild(downloadLink);
        downloadLink.click();
    } finally {
        if (downloadLink.parentNode) {
            downloadLink.parentNode.removeChild(downloadLink);
        }
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }

    showToast("Notes exported successfully!", "success");
}

if (exportNotesBtn) {
    exportNotesBtn.addEventListener("click", exportNotesAsText);
}

function showValidationMessage(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = "flex";
}

function clearValidationMessage(element) {
    if (!element) return;
    element.textContent = "";
    element.style.display = "none";
}

function showEmptyState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No notes yet</h3>
            <p>${message}</p>
            <button id="emptyAddBtn">+ Add Note</button>
        </div>
    `;

    const btn = document.getElementById("emptyAddBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            if (noteTitleInput) {
                noteTitleInput.focus();
            } else if (noteInput) {
                noteInput.focus();
            }
        });
    }
}

function formatDate(isoString) {
    if (!isoString) return "";
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
        });
    } catch {
        return "";
    }
}

/* ===========================
   NOTE CREATION & VALIDATION
=========================== */

function getSelectedLabels() {
    const selected = [];
    labelCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    return selected;
}

function addNote() {
    const title = noteTitleInput ? noteTitleInput.value.trim() : "";
    const subject = noteSubjectInput ? noteSubjectInput.value.trim() : "";
    const content = noteInput ? noteInput.value.trim() : "";
    const selectedFolder = folderSelect ? folderSelect.value : "";
    const selectedLabels = getSelectedLabels();

    // Clear previous validation error
    clearValidationMessage(noteValidationMsg);

    // Validation rules (FR-01, FR-10)
    if (!title && !content) {
        showValidationMessage(noteValidationMsg, "Please enter a note title and content.");
        if (noteTitleInput) noteTitleInput.focus();
        return;
    }

    if (!title) {
        showValidationMessage(noteValidationMsg, "Please enter a note title.");
        if (noteTitleInput) noteTitleInput.focus();
        return;
    }

    if (!content) {
        showValidationMessage(noteValidationMsg, "Please enter note content.");
        if (noteInput) noteInput.focus();
        return;
    }

    // Determine subject: subject field > folder > General
    const finalSubject = subject || selectedFolder || "General";

    const newNote = {
        id: String(Date.now()) + "-" + Math.random().toString(36).substring(2, 7),
        title: title,
        subject: finalSubject,
        content: content,
        text: content,
        labels: selectedLabels,
        folder: selectedFolder || (finalSubject !== "General" ? finalSubject : ""),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    notes.unshift(newNote); // Put newest note first
    saveNotes();
    buildSubjectDropdown(); // Refresh subject dropdown with any new subject

    // Reset inputs
    if (noteTitleInput) noteTitleInput.value = "";
    if (noteSubjectInput) noteSubjectInput.value = "";
    if (noteInput) noteInput.value = "";
    if (folderSelect) folderSelect.value = "";
    labelCheckboxes.forEach(cb => (cb.checked = false));

    // Refresh view
    if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
    } else {
        renderNotes(searchInput ? searchInput.value : "");
    }

    showToast("Note created successfully!", "success");
}

if (addNoteBtn) {
    addNoteBtn.addEventListener("click", addNote);
}

// Clear validation message when user starts typing
if (noteTitleInput) {
    noteTitleInput.addEventListener("input", () => clearValidationMessage(noteValidationMsg));
}
if (noteInput) {
    noteInput.addEventListener("input", () => clearValidationMessage(noteValidationMsg));
}

/* ===========================
   SAFE DOM NOTE CARD BUILDER
=========================== */

function createNoteCard(note, isTrash = false) {
    const card = document.createElement("div");
    card.className = "note-card";
    card.setAttribute("data-id", note.id);

    if (note.labels && note.labels.length > 0) {
        card.setAttribute("data-labels", note.labels.join(" "));
    }

    // Header container: Subject badge + Labels
    const headerDiv = document.createElement("div");
    headerDiv.className = "note-card-header";

    if (note.subject) {
        const subjectBadge = document.createElement("span");
        subjectBadge.className = "note-subject-badge";
        subjectBadge.textContent = note.subject;
        headerDiv.appendChild(subjectBadge);
    }

    if (note.labels && note.labels.length > 0) {
        const labelsDiv = document.createElement("div");
        labelsDiv.className = "note-labels";

        note.labels.forEach(label => {
            const labelSpan = document.createElement("span");
            labelSpan.className = `note-label ${label.toLowerCase()}`;
            labelSpan.textContent = label;
            labelsDiv.appendChild(labelSpan);
        });

        headerDiv.appendChild(labelsDiv);
    }

    card.appendChild(headerDiv);

    // Title (h3 with safe textContent and highlight)
    const titleEl = document.createElement("h3");
    titleEl.className = "note-title";
    const activeQuery = searchInput ? searchInput.value.trim() : "";
    if (activeQuery && !isTrash) {
        titleEl.innerHTML = highlightMatch(note.title || "Untitled Note", activeQuery, isCaseSensitive);
    } else {
        titleEl.textContent = note.title || "Untitled Note";
    }
    card.appendChild(titleEl);

    // Content (p with safe textContent)
    const contentEl = document.createElement("p");
    contentEl.className = "note-content";
    contentEl.textContent = note.content || note.text || "";
    card.appendChild(contentEl);

    // Footer container: Date + Actions
    const footerDiv = document.createElement("div");
    footerDiv.className = "note-card-footer";

    const dateSpan = document.createElement("span");
    dateSpan.className = "note-date";
    dateSpan.textContent = formatDate(note.updatedAt || note.createdAt);
    footerDiv.appendChild(dateSpan);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    if (isTrash) {
        const restoreBtn = document.createElement("button");
        restoreBtn.textContent = "Restore";
        restoreBtn.className = "edit-btn";
        restoreBtn.setAttribute("aria-label", `Restore note ${note.title}`);
        restoreBtn.onclick = () => restoreNote(note.id);

        const permDeleteBtn = document.createElement("button");
        permDeleteBtn.textContent = "Delete Forever";
        permDeleteBtn.className = "delete-btn";
        permDeleteBtn.setAttribute("aria-label", `Permanently delete note ${note.title}`);
        permDeleteBtn.onclick = () => permanentlyDelete(note.id);

        actions.appendChild(restoreBtn);
        actions.appendChild(permDeleteBtn);
    } else {
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.setAttribute("aria-label", `Edit note ${note.title}`);
        editBtn.onclick = () => openEditModal(note.id);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.setAttribute("aria-label", `Delete note ${note.title}`);
        deleteBtn.onclick = () => confirmDeleteNote(note.id);

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
    }

    footerDiv.appendChild(actions);
    card.appendChild(footerDiv);

    return card;
}

/* ===========================
   NOTE EDITING (MODAL)
=========================== */

function openEditModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    clearValidationMessage(editValidationMsg);

    editNoteId.value = note.id;
    editNoteTitle.value = note.title || "";
    editNoteSubject.value = note.subject || "";
    editNoteContent.value = note.content || note.text || "";

    editNoteModal.style.display = "flex";
    editNoteTitle.focus();
}

function closeEditNoteModal() {
    if (editNoteModal) {
        editNoteModal.style.display = "none";
        clearValidationMessage(editValidationMsg);
    }
}

function saveEditedNote() {
    const noteId = editNoteId.value;
    const title = editNoteTitle.value.trim();
    const subject = editNoteSubject.value.trim();
    const content = editNoteContent.value.trim();

    clearValidationMessage(editValidationMsg);

    if (!title && !content) {
        showValidationMessage(editValidationMsg, "Please enter a title and content.");
        editNoteTitle.focus();
        return;
    }

    if (!title) {
        showValidationMessage(editValidationMsg, "Please enter a note title.");
        editNoteTitle.focus();
        return;
    }

    if (!content) {
        showValidationMessage(editValidationMsg, "Please enter note content.");
        editNoteContent.focus();
        return;
    }

    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) {
        closeEditNoteModal();
        return;
    }

    // Update note fields cleanly without duplication
    notes[noteIndex].title = title;
    notes[noteIndex].subject = subject || "General";
    notes[noteIndex].content = content;
    notes[noteIndex].text = content;
    if (subject) notes[noteIndex].folder = subject;
    notes[noteIndex].updatedAt = new Date().toISOString();

    saveNotes();
    buildSubjectDropdown(); // Refresh subject dropdown in case subject changed
    closeEditNoteModal();

    // Re-render current view
    if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
    } else {
        renderNotes(searchInput ? searchInput.value : "");
    }

    showToast("Note updated successfully!", "success");
}

if (closeEditModal) closeEditModal.addEventListener("click", closeEditNoteModal);
if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditNoteModal);
if (saveEditBtn) saveEditBtn.addEventListener("click", saveEditedNote);

if (editNoteTitle) {
    editNoteTitle.addEventListener("input", () => clearValidationMessage(editValidationMsg));
}
if (editNoteContent) {
    editNoteContent.addEventListener("input", () => clearValidationMessage(editValidationMsg));
}

/* ===========================
   NOTE DELETION (CONFIRMATION)
=========================== */

function confirmDeleteNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    pendingDeleteNoteId = noteId;
    if (deleteConfirmText) {
        deleteConfirmText.textContent = `Are you sure you want to move "${note.title}" to Trash?`;
    }
    if (deleteConfirmModal) {
        deleteConfirmModal.style.display = "flex";
    }
}

function closeDeleteConfirmModal() {
    pendingDeleteNoteId = null;
    if (deleteConfirmModal) {
        deleteConfirmModal.style.display = "none";
    }
}

function executeDeleteNote() {
    if (!pendingDeleteNoteId) return;

    const noteIndex = notes.findIndex(n => n.id === pendingDeleteNoteId);
    if (noteIndex === -1) {
        closeDeleteConfirmModal();
        return;
    }

    const deletedNote = notes.splice(noteIndex, 1)[0];
    trash.unshift(deletedNote);

    saveNotes();
    saveTrash();
    buildSubjectDropdown(); // Refresh subject dropdown in case deleted note was sole owner of a subject
    closeDeleteConfirmModal();

    if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
    } else {
        renderNotes(searchInput ? searchInput.value : "");
    }

    showToast("Note moved to Trash.", "success");
}

if (closeDeleteModal) closeDeleteModal.addEventListener("click", closeDeleteConfirmModal);
if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeDeleteConfirmModal);
if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", executeDeleteNote);

/* ===========================
   TRASH MANAGEMENT
=========================== */

function restoreNote(noteId) {
    const trashIndex = trash.findIndex(n => n.id === noteId);
    if (trashIndex === -1) return;

    const restoredNote = trash.splice(trashIndex, 1)[0];
    notes.unshift(restoredNote);

    saveNotes();
    saveTrash();

    if (trashView.style.display === "block") {
        renderTrash();
    } else if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
    } else {
        renderNotes(searchInput ? searchInput.value : "");
    }

    showToast("Note restored successfully!", "success");
}

function permanentlyDelete(noteId) {
    const note = trash.find(n => n.id === noteId);
    const titleText = note ? `"${note.title}"` : "this note";

    if (!confirm(`Permanently delete ${titleText}? This cannot be undone.`)) {
        return;
    }

    const trashIndex = trash.findIndex(n => n.id === noteId);
    if (trashIndex !== -1) {
        trash.splice(trashIndex, 1);
        saveTrash();
        renderTrash();
        showToast("Note permanently deleted.", "success");
    }
}

function renderTrash() {
    if (!trashGrid) return;
    trashGrid.innerHTML = "";

    if (trash.length === 0) {
        trashGrid.innerHTML = `<p style="text-align:center; margin-top:20px; color:#777;">Trash is empty</p>`;
        return;
    }

    trash.forEach(note => {
        trashGrid.appendChild(createNoteCard(note, true));
    });
}

/* ===========================
   FILTERING & RENDERING
=========================== */

function getFilteredNotes({
    query = "",
    scope = searchScope,
    caseSensitive = isCaseSensitive,
    category = currentFilter,
    subjectFilter = activeSubjectFilter
} = {}) {
    const trimmed = typeof query === "string" ? query.trim() : "";
    let result = notes;

    // Apply category / folder filter if not "all"
    if (category && category !== "all") {
        result = result.filter(note =>
            (note.labels && note.labels.includes(category)) ||
            (note.folder === category) ||
            (note.subject && note.subject.toLowerCase() === category.toLowerCase())
        );
    }

    // Apply subject dropdown filter (works alongside search and category filters)
    if (subjectFilter) {
        result = result.filter(note =>
            note.subject && note.subject.toLowerCase() === subjectFilter.toLowerCase()
        );
    }

    // Apply search query filter if non-empty
    if (trimmed) {
        result = result.filter(note =>
            matchesNoteSearch(note, trimmed, { scope, caseSensitive })
        );
    }

    return result;
}

/**
 * Rebuilds the subject filter dropdown from the current notes array.
 * Preserves the currently selected subject if it still exists.
 */
function buildSubjectDropdown() {
    if (!subjectFilterSelect) return;

    // Collect unique, non-empty subjects (case-insensitive dedup, preserve original case)
    const subjectMap = new Map();
    notes.forEach(note => {
        if (note.subject && note.subject.trim()) {
            const key = note.subject.trim().toLowerCase();
            if (!subjectMap.has(key)) {
                subjectMap.set(key, note.subject.trim());
            }
        }
    });

    const subjects = Array.from(subjectMap.values()).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // Preserve current selection if it still exists in notes
    const previousSelection = activeSubjectFilter;
    const selectionStillValid = subjects.some(
        s => s.toLowerCase() === previousSelection.toLowerCase()
    );

    // Rebuild options
    subjectFilterSelect.innerHTML = '<option value="">All Subjects</option>';
    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        subjectFilterSelect.appendChild(option);
    });

    // Restore or reset selection
    if (previousSelection && selectionStillValid) {
        subjectFilterSelect.value = previousSelection;
    } else if (previousSelection && !selectionStillValid) {
        // Previously selected subject no longer exists — reset filter
        activeSubjectFilter = "";
        subjectFilterSelect.value = "";
        updateSubjectFilterUI();
    }
}

/**
 * Updates the subject filter clear button and status label to reflect
 * the current activeSubjectFilter value.
 */
function updateSubjectFilterUI() {
    if (!clearSubjectFilterBtn || !subjectFilterStatus) return;

    if (activeSubjectFilter) {
        clearSubjectFilterBtn.style.display = "inline-flex";
        subjectFilterStatus.textContent = `Filtering by: "${activeSubjectFilter}"`;
        subjectFilterStatus.style.display = "inline";
        if (subjectFilterSelect) subjectFilterSelect.classList.add("active");
    } else {
        clearSubjectFilterBtn.style.display = "none";
        subjectFilterStatus.textContent = "";
        subjectFilterStatus.style.display = "none";
        if (subjectFilterSelect) subjectFilterSelect.classList.remove("active");
    }
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }
    renderNotes("");
}

function toggleCaseSensitive(forceValue = null) {
    if (forceValue !== null) {
        isCaseSensitive = Boolean(forceValue);
    } else {
        isCaseSensitive = !isCaseSensitive;
    }

    if (caseSensitiveBtn) {
        caseSensitiveBtn.classList.toggle("active", isCaseSensitive);
        caseSensitiveBtn.setAttribute("aria-pressed", String(isCaseSensitive));
        caseSensitiveBtn.title = isCaseSensitive
            ? "Match Case (Case Sensitive) is ON [Alt+C]"
            : "Match Case (Case Sensitive Search) [Alt+C]";
    }

    showToast(
        isCaseSensitive ? "Case-sensitive title search ON" : "Case-sensitive title search OFF",
        "success"
    );
    renderNotes();
}

function filterNotesByCategory(category) {
    currentFilter = category;

    // Update active state in sidebar
    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
    });

    const builtInNav = document.getElementById(`nav${category}`);
    if (builtInNav) {
        builtInNav.classList.add("active");
    } else {
        const customNavs = document.querySelectorAll(".custom-folder-item");
        customNavs.forEach(nav => {
            if (nav.dataset.folder === category) nav.classList.add("active");
        });
    }

    renderNotes();
}

function renderNotes(filterQuery = null) {
    if (!notesGrid) return;

    const query = filterQuery !== null ? filterQuery : (searchInput ? searchInput.value : "");
    const trimmed = typeof query === "string" ? query.trim() : "";

    // Toggle clear search button visibility
    if (clearSearchBtn) {
        clearSearchBtn.style.display = trimmed ? "inline-flex" : "none";
    }

    const filteredNotes = getFilteredNotes({
        query: trimmed,
        scope: searchScope,
        caseSensitive: isCaseSensitive,
        category: currentFilter
    });

    // Update search status message
    if (searchStatus && searchStatusText) {
        if (trimmed) {
            const scopeLabel = searchScope === "title" ? "titles" : "all fields";
            const caseLabel = isCaseSensitive ? "case-sensitive" : "case-insensitive";
            const categoryLabel = currentFilter !== "all" ? ` within "${currentFilter}"` : "";
            const countText = `${filteredNotes.length} note${filteredNotes.length === 1 ? "" : "s"}`;

            searchStatusText.textContent = `Found ${countText} matching "${trimmed}" (${caseLabel}, ${scopeLabel}${categoryLabel})`;
            searchStatus.style.display = "flex";
        } else {
            searchStatus.style.display = "none";
        }
    }

    notesGrid.innerHTML = "";

    if (filteredNotes.length === 0) {
        if (trimmed) {
            const scopeDesc = searchScope === "title" ? "title" : "note";
            const caseDesc = isCaseSensitive ? "case-sensitive" : "case-insensitive";
            notesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No matching notes found</h3>
                    <p>No notes matched "<strong>${escapeHTML(trimmed)}</strong>" using ${caseDesc} ${scopeDesc} search${currentFilter !== "all" ? ` within "${escapeHTML(currentFilter)}"` : ""}.</p>
                    <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        <button id="emptyClearSearchBtn" class="sidebar-btn" type="button" style="padding: 6px 14px; background: #1a73e8; color: white;">Clear Search</button>
                        ${isCaseSensitive ? '<button id="emptyDisableCaseBtn" class="sidebar-btn" type="button" style="padding: 6px 14px; background: #f1f3f4; color: #202124;">Try Case-Insensitive</button>' : ''}
                    </div>
                </div>
            `;
            const emptyClearBtn = document.getElementById("emptyClearSearchBtn");
            if (emptyClearBtn) {
                emptyClearBtn.addEventListener("click", clearSearch);
            }
            const emptyDisableCaseBtn = document.getElementById("emptyDisableCaseBtn");
            if (emptyDisableCaseBtn) {
                emptyDisableCaseBtn.addEventListener("click", () => {
                    toggleCaseSensitive(false);
                });
            }
        } else if (currentFilter !== "all") {
            showEmptyState(
                notesGrid,
                `No ${currentFilter} notes found. Start by adding your first note!`
            );
        } else {
            showEmptyState(notesGrid, "Create your first study note using the form above!");
        }
        return;
    }

    filteredNotes.forEach(note => {
        notesGrid.appendChild(createNoteCard(note));
    });
}

// Search and filter event listeners
if (searchInput) {
    searchInput.addEventListener("input", () => {
        renderNotes(searchInput.value);
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", clearSearch);
}

if (resetSearchFilterBtn) {
    resetSearchFilterBtn.addEventListener("click", clearSearch);
}

if (caseSensitiveBtn) {
    caseSensitiveBtn.addEventListener("click", () => {
        toggleCaseSensitive();
    });
}

if (searchScopeSelect) {
    searchScopeSelect.addEventListener("change", () => {
        searchScope = searchScopeSelect.value;
        showToast(`Search scope: ${searchScope === "title" ? "Title Only" : "All Fields"}`, "success");
        renderNotes();
    });
}

// Subject filter dropdown — change event
if (subjectFilterSelect) {
    subjectFilterSelect.addEventListener("change", () => {
        activeSubjectFilter = subjectFilterSelect.value;
        updateSubjectFilterUI();
        // Preserve any active search query while applying the new subject filter
        renderNotes(searchInput ? searchInput.value : "");
        if (activeSubjectFilter) {
            showToast(`Subject filter: "${activeSubjectFilter}"`, "success");
        } else {
            showToast("Subject filter cleared", "success");
        }
    });
}

// Clear subject filter button — resets subject filter but keeps search query intact
if (clearSubjectFilterBtn) {
    clearSubjectFilterBtn.addEventListener("click", () => {
        activeSubjectFilter = "";
        if (subjectFilterSelect) subjectFilterSelect.value = "";
        updateSubjectFilterUI();
        renderNotes(searchInput ? searchInput.value : "");
        showToast("Subject filter cleared", "success");
    });
}

/* ===========================
   DARK MODE
=========================== */

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    if (darkModeBtn) darkModeBtn.textContent = "☀️ Light Mode";
}

if (darkModeBtn) {
    darkModeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        darkModeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
}

/* ===========================
   SIDEBAR & CATEGORIES
=========================== */

if (navNotes) {
    navNotes.addEventListener("click", () => {
        notesView.style.display = "block";
        trashView.style.display = "none";
        filterNotesByCategory("all");
    });
}

if (navTrash) {
    navTrash.addEventListener("click", () => {
        notesView.style.display = "none";
        trashView.style.display = "block";
        document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
        navTrash.classList.add("active");
        renderTrash();
    });
}

const catMap = {
    navImportant: "Important",
    navWork: "Work",
    navPersonal: "Personal",
    navIdeas: "Ideas"
};

Object.entries(catMap).forEach(([elemId, catName]) => {
    const el = document.getElementById(elemId);
    if (el) {
        el.addEventListener("click", () => {
            notesView.style.display = "block";
            trashView.style.display = "none";
            filterNotesByCategory(catName);
        });
    }
});

/* ===========================
   FOLDER MANAGEMENT
=========================== */

function renderFolders() {
    if (!customFoldersList || !folderSelect) return;

    customFoldersList.innerHTML = "";
    folderSelect.innerHTML = '<option value="">No Folder</option>';

    folders.forEach(folder => {
        const li = document.createElement("li");
        li.className = "custom-folder-item";
        li.dataset.folder = folder;
        li.textContent = `📁 ${folder}`;
        li.addEventListener("click", () => {
            notesView.style.display = "block";
            trashView.style.display = "none";
            filterNotesByCategory(folder);
        });
        customFoldersList.appendChild(li);

        const option = document.createElement("option");
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
    });
}

if (newFolderBtn && newFolderModal) {
    newFolderBtn.addEventListener("click", () => {
        newFolderModal.style.display = "flex";
        if (folderNameInput) folderNameInput.focus();
    });
}

if (closeFolderModal && newFolderModal) {
    closeFolderModal.addEventListener("click", () => {
        newFolderModal.style.display = "none";
    });
}

if (createFolderBtn && folderNameInput) {
    createFolderBtn.addEventListener("click", () => {
        const name = folderNameInput.value.trim();
        if (!name) return;

        if (folders.includes(name)) {
            alert("A folder with this name already exists.");
            return;
        }

        folders.push(name);
        saveFolders();
        renderFolders();

        folderNameInput.value = "";
        newFolderModal.style.display = "none";
        showToast(`Folder "${name}" created.`, "success");
    });
}

// Close modals when clicking outside modal-content
window.addEventListener("click", (e) => {
    if (e.target === editNoteModal) closeEditNoteModal();
    if (e.target === deleteConfirmModal) closeDeleteConfirmModal();
    if (e.target === newFolderModal && newFolderModal) newFolderModal.style.display = "none";
});

/* ===========================
   KEYBOARD SHORTCUTS
=========================== */

document.addEventListener("keydown", (e) => {
    // ESC -> Close modals or clear search
    if (e.key === "Escape") {
        if (editNoteModal && editNoteModal.style.display === "flex") {
            closeEditNoteModal();
            return;
        }
        if (deleteConfirmModal && deleteConfirmModal.style.display === "flex") {
            closeDeleteConfirmModal();
            return;
        }
        if (newFolderModal && newFolderModal.style.display === "flex") {
            newFolderModal.style.display = "none";
            return;
        }
        if (searchInput && searchInput.value !== "") {
            clearSearch();
            return;
        }
    }

    // ALT + N -> Focus new note title
    if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (noteTitleInput) noteTitleInput.focus();
        return;
    }

    // ALT + S -> Focus search
    if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (searchInput) searchInput.focus();
        return;
    }

    // ALT + C -> Toggle case-sensitive title search
    if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        toggleCaseSensitive();
        return;
    }

    // ALT + D -> Toggle dark mode
    if (e.altKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (darkModeBtn) darkModeBtn.click();
        return;
    }

    // ALT + T -> Open Trash
    if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        if (navTrash) navTrash.click();
        return;
    }
});

/* ===========================
   INITIALIZATION
=========================== */

renderFolders();
buildSubjectDropdown();
updateSubjectFilterUI();
renderNotes();
renderTrash();
