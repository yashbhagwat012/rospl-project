/**
 * CRUD and Validation Regression Tests for NoteStack
 * Member 1 - ROSPL Project
 * Zero-dependency standalone test runner using Node.js built-in assertion module.
 */

const assert = require("assert");

// Mock LocalStorage for headless testing
class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = String(value);
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
}

const localStorage = new MockLocalStorage();

// Core logic functions under test
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
        text: content,
        labels: Array.isArray(note.labels) ? note.labels : [],
        folder: note.folder || (subject !== "General" ? subject : ""),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || new Date().toISOString()
    };
}

function validateAndCreateNote(state, { title, subject, content, folder = "", labels = [] }) {
    const trimmedTitle = title ? title.trim() : "";
    const trimmedSubject = subject ? subject.trim() : "";
    const trimmedContent = content ? content.trim() : "";

    if (!trimmedTitle && !trimmedContent) {
        return { success: false, error: "Please enter a note title and content." };
    }
    if (!trimmedTitle) {
        return { success: false, error: "Please enter a note title." };
    }
    if (!trimmedContent) {
        return { success: false, error: "Please enter note content." };
    }

    const finalSubject = trimmedSubject || folder || "General";
    const newNote = {
        id: String(Date.now()) + "-" + Math.random().toString(36).substring(2, 7),
        title: trimmedTitle,
        subject: finalSubject,
        content: trimmedContent,
        text: trimmedContent,
        labels: labels,
        folder: folder || (finalSubject !== "General" ? finalSubject : ""),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    state.notes.unshift(newNote);
    localStorage.setItem("notestackNotes", JSON.stringify(state.notes));
    localStorage.setItem("ultimateNotes", JSON.stringify(state.notes));

    return { success: true, note: newNote };
}

function validateAndEditNote(state, noteId, { title, subject, content }) {
    const trimmedTitle = title ? title.trim() : "";
    const trimmedSubject = subject ? subject.trim() : "";
    const trimmedContent = content ? content.trim() : "";

    if (!trimmedTitle && !trimmedContent) {
        return { success: false, error: "Please enter a title and content." };
    }
    if (!trimmedTitle) {
        return { success: false, error: "Please enter a note title." };
    }
    if (!trimmedContent) {
        return { success: false, error: "Please enter note content." };
    }

    const index = state.notes.findIndex(n => n.id === noteId);
    if (index === -1) {
        return { success: false, error: "Note not found." };
    }

    state.notes[index].title = trimmedTitle;
    state.notes[index].subject = trimmedSubject || "General";
    state.notes[index].content = trimmedContent;
    state.notes[index].text = trimmedContent;
    if (trimmedSubject) state.notes[index].folder = trimmedSubject;
    state.notes[index].updatedAt = new Date().toISOString();

    localStorage.setItem("notestackNotes", JSON.stringify(state.notes));
    localStorage.setItem("ultimateNotes", JSON.stringify(state.notes));

    return { success: true, note: state.notes[index] };
}

function deleteNoteToTrash(state, noteId) {
    const index = state.notes.findIndex(n => n.id === noteId);
    if (index === -1) return { success: false, error: "Note not found" };

    const deletedNote = state.notes.splice(index, 1)[0];
    state.trash.unshift(deletedNote);

    localStorage.setItem("notestackNotes", JSON.stringify(state.notes));
    localStorage.setItem("ultimateTrash", JSON.stringify(state.trash));

    return { success: true, note: deletedNote };
}

function restoreFromTrash(state, noteId) {
    const index = state.trash.findIndex(n => n.id === noteId);
    if (index === -1) return { success: false, error: "Note not in trash" };

    const restoredNote = state.trash.splice(index, 1)[0];
    state.notes.unshift(restoredNote);

    localStorage.setItem("notestackNotes", JSON.stringify(state.notes));
    localStorage.setItem("ultimateTrash", JSON.stringify(state.trash));

    return { success: true, note: restoredNote };
}

function permanentlyDeleteNote(state, noteId) {
    const index = state.trash.findIndex(n => n.id === noteId);
    if (index === -1) return { success: false, error: "Note not in trash" };

    const deleted = state.trash.splice(index, 1)[0];
    localStorage.setItem("ultimateTrash", JSON.stringify(state.trash));
    return { success: true, note: deleted };
}

function defensiveLoadNotes() {
    try {
        const stored = localStorage.getItem("notestackNotes") || localStorage.getItem("ultimateNotes");
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// ----------------- TEST RUNNER -----------------

let totalTests = 0;
let passedTests = 0;

function runTest(testId, description, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  [PASS] ${testId}: ${description}`);
    } catch (err) {
        console.error(`  [FAIL] ${testId}: ${description}`);
        console.error(`         ${err.message}`);
    }
}

console.log("\n========================================================");
console.log("RUNNING CRUD & VALIDATION REGRESSION TEST SUITE");
console.log("========================================================\n");

// Setup clean state
const state = { notes: [], trash: [] };
localStorage.clear();

// T-01: Create note with valid fields
runTest("T-01", "Create note with valid title, subject, and content", () => {
    const res = validateAndCreateNote(state, {
        title: "Database Normalization",
        subject: "DBMS",
        content: "1NF, 2NF, 3NF and BCNF guidelines."
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(state.notes.length, 1);
    assert.strictEqual(state.notes[0].title, "Database Normalization");
    assert.strictEqual(state.notes[0].subject, "DBMS");
    assert.strictEqual(state.notes[0].content, "1NF, 2NF, 3NF and BCNF guidelines.");
    assert(state.notes[0].id.length > 0, "Note must have stable ID");
});

// T-02: Prevent blank title creation
runTest("T-02", "Reject saving note with blank title", () => {
    const res = validateAndCreateNote(state, {
        title: "   ",
        subject: "DBMS",
        content: "Content without title"
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "Please enter a note title.");
    assert.strictEqual(state.notes.length, 1, "Notes count must not change");
});

// T-03: Prevent blank content creation
runTest("T-03", "Reject saving note with blank content", () => {
    const res = validateAndCreateNote(state, {
        title: "Only Title",
        subject: "DBMS",
        content: "   "
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "Please enter note content.");
    assert.strictEqual(state.notes.length, 1);
});

// T-04: Prevent both blank title and content
runTest("T-04", "Reject saving note with both title and content blank", () => {
    const res = validateAndCreateNote(state, {
        title: "",
        subject: "",
        content: ""
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "Please enter a note title and content.");
});

// T-05: Edit existing note
runTest("T-05", "Edit an existing note by ID without duplication", () => {
    const noteId = state.notes[0].id;
    const initialCount = state.notes.length;
    const res = validateAndEditNote(state, noteId, {
        title: "Database Normalization & BCNF",
        subject: "DBMS Advanced",
        content: "Updated content with Boyce-Codd details."
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(state.notes.length, initialCount, "Editing must not create a duplicate");
    assert.strictEqual(state.notes[0].title, "Database Normalization & BCNF");
    assert.strictEqual(state.notes[0].subject, "DBMS Advanced");
    assert.strictEqual(state.notes[0].content, "Updated content with Boyce-Codd details.");
    assert.strictEqual(state.notes[0].text, "Updated content with Boyce-Codd details.");
});

// T-06: Edit validation
runTest("T-06", "Edit validation prevents blank title or content", () => {
    const noteId = state.notes[0].id;
    const res = validateAndEditNote(state, noteId, {
        title: "",
        subject: "DBMS",
        content: "Some content"
    });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "Please enter a note title.");
});

// T-07: Delete note to trash by ID
runTest("T-07", "Delete moves specific note by ID to trash", () => {
    const noteId = state.notes[0].id;
    const res = deleteNoteToTrash(state, noteId);
    assert.strictEqual(res.success, true);
    assert.strictEqual(state.notes.length, 0);
    assert.strictEqual(state.trash.length, 1);
    assert.strictEqual(state.trash[0].id, noteId);
});

// T-08: Restore note from trash
runTest("T-08", "Restore brings note back from trash to active notes", () => {
    const noteId = state.trash[0].id;
    const res = restoreFromTrash(state, noteId);
    assert.strictEqual(res.success, true);
    assert.strictEqual(state.trash.length, 0);
    assert.strictEqual(state.notes.length, 1);
    assert.strictEqual(state.notes[0].id, noteId);
});

// T-09: Permanent deletion
runTest("T-09", "Permanently delete removes note from trash forever", () => {
    const noteId = state.notes[0].id;
    deleteNoteToTrash(state, noteId);
    assert.strictEqual(state.trash.length, 1);
    const res = permanentlyDeleteNote(state, noteId);
    assert.strictEqual(res.success, true);
    assert.strictEqual(state.trash.length, 0);
});

// T-10: Persistence sync between notestackNotes and ultimateNotes
runTest("T-10", "Storage persistence synchronizes both storage keys", () => {
    validateAndCreateNote(state, {
        title: "Operating Systems",
        subject: "OS",
        content: "Virtual Memory & Paging"
    });
    const key1 = JSON.parse(localStorage.getItem("notestackNotes"));
    const key2 = JSON.parse(localStorage.getItem("ultimateNotes"));
    assert.strictEqual(key1.length, 1);
    assert.strictEqual(key2.length, 1);
    assert.strictEqual(key1[0].title, "Operating Systems");
    assert.strictEqual(key2[0].title, "Operating Systems");
});

// T-11: Legacy data migration
runTest("T-11", "Legacy note string and partial objects normalize properly", () => {
    const legacyString = "Old note plain text line 1\nSecond line";
    const normalized1 = normalizeNote(legacyString);
    assert.strictEqual(normalized1.title, "Old note plain text line 1");
    assert.strictEqual(normalized1.content, legacyString);
    assert.strictEqual(normalized1.subject, "General");

    const legacyObj = { text: "Note without title", folder: "Work" };
    const normalized2 = normalizeNote(legacyObj);
    assert.strictEqual(normalized2.title, "Note without title");
    assert.strictEqual(normalized2.subject, "Work");
});

// T-12: Defensive storage handling on malformed JSON
runTest("T-12", "Defensively handle malformed Local Storage JSON", () => {
    localStorage.setItem("notestackNotes", "{ malformed json ..");
    localStorage.setItem("ultimateNotes", "{ also malformed");
    const loaded = defensiveLoadNotes();
    assert.deepStrictEqual(loaded, [], "Must return empty array without throwing");
});

console.log("\n--------------------------------------------------------");
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${totalTests - passedTests} Failed)`);
console.log("========================================================\n");

if (passedTests !== totalTests) {
    process.exit(1);
}
