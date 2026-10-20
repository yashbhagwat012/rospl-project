/**
 * Title Search Tests for NoteStack
 * Member 2 - ROSPL Project
 * Tests: case-insensitive (default), case-sensitive toggle, scope, edge cases.
 * Zero-dependency standalone test runner using Node.js built-in assert module.
 */

const assert = require("assert");

/* =====================
   CORE LOGIC UNDER TEST
===================== */

function escapeRegExp(string) {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function getFilteredNotes(notes, {
    query = "",
    scope = "title",
    caseSensitive = false,
    category = "all"
} = {}) {
    const trimmed = typeof query === "string" ? query.trim() : "";
    let result = notes;

    if (category && category !== "all") {
        result = result.filter(note =>
            (note.labels && note.labels.includes(category)) ||
            (note.folder === category) ||
            (note.subject && note.subject.toLowerCase() === category.toLowerCase())
        );
    }

    if (trimmed) {
        result = result.filter(note =>
            matchesNoteSearch(note, trimmed, { scope, caseSensitive })
        );
    }

    return result;
}

/* =====================
   TEST SUITE
===================== */

const sampleNotes = [
    { id: "1", title: "Operating Systems Overview", subject: "CS", content: "Processes and threads.", labels: ["Work"] },
    { id: "2", title: "Data Structures", subject: "CS", content: "Stacks, queues, linked lists.", labels: [] },
    { id: "3", title: "Calculus Basics", subject: "Mathematics", content: "Derivatives and integrals.", labels: ["Important"] },
    { id: "4", title: "operating systems deep dive", subject: "OS", content: "Kernel internals.", labels: [] },
    { id: "5", title: "DBMS Concepts", subject: "Database", content: "Normalization and SQL.", labels: ["Work"] },
    { id: "6", title: "Linear Algebra", subject: "Mathematics", content: "Matrices and vectors.", labels: [] },
    { id: "7", title: "  Spaced Title  ", subject: "Misc", content: "Content here.", labels: [] },
    { id: "8", title: "Unicode: émojis 🚀 & accents", subject: "Special", content: "Unicode content.", labels: [] },
];

let passed = 0;
let failed = 0;

function test(id, desc, fn) {
    try {
        fn();
        console.log(`  [PASS] ${id}: ${desc}`);
        passed++;
    } catch (e) {
        console.error(`  [FAIL] ${id}: ${desc}`);
        console.error(`         ${e.message}`);
        failed++;
    }
}

console.log("\n========================================================");
console.log("RUNNING TITLE SEARCH TEST SUITE — Member 2");
console.log("========================================================\n");

// --- TS-01: Case-insensitive title search (default) ---
test("TS-01", "Case-insensitive search returns both exact and mixed-case matches", () => {
    const results = getFilteredNotes(sampleNotes, { query: "operating systems", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, 2, `Expected 2, got ${results.length}`);
    const ids = results.map(n => n.id).sort();
    assert.deepStrictEqual(ids, ["1", "4"]);
});

// --- TS-02: Case-sensitive title search – exact case only ---
test("TS-02", "Case-sensitive search returns only exact-case match", () => {
    const results = getFilteredNotes(sampleNotes, { query: "Operating Systems", scope: "title", caseSensitive: true });
    assert.strictEqual(results.length, 1, `Expected 1, got ${results.length}`);
    assert.strictEqual(results[0].id, "1");
});

// --- TS-03: Case-sensitive misses lowercase when query is uppercase ---
test("TS-03", "Case-sensitive with uppercase query skips lowercase title", () => {
    const results = getFilteredNotes(sampleNotes, { query: "operating systems", scope: "title", caseSensitive: true });
    assert.strictEqual(results.length, 1, `Expected 1, got ${results.length}`);
    assert.strictEqual(results[0].id, "4");
});

// --- TS-04: Trimmed whitespace in query ---
test("TS-04", "Leading/trailing whitespace in query is trimmed before matching", () => {
    const results = getFilteredNotes(sampleNotes, { query: "  calculus  ", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "3");
});

// --- TS-05: Empty query returns all notes ---
test("TS-05", "Empty query returns all notes without filtering", () => {
    const results = getFilteredNotes(sampleNotes, { query: "", scope: "title" });
    assert.strictEqual(results.length, sampleNotes.length);
});

// --- TS-06: Whitespace-only query treated as empty ---
test("TS-06", "Whitespace-only query is treated as empty and returns all notes", () => {
    const results = getFilteredNotes(sampleNotes, { query: "   ", scope: "title" });
    assert.strictEqual(results.length, sampleNotes.length);
});

// --- TS-07: No match shows empty results ---
test("TS-07", "Query with no matching title returns empty array", () => {
    const results = getFilteredNotes(sampleNotes, { query: "ZZZnoMatchXXX", scope: "title" });
    assert.strictEqual(results.length, 0);
});

// --- TS-08: Title scope excludes content-only matches ---
test("TS-08", "Title-only scope does NOT match query found only in content", () => {
    const results = getFilteredNotes(sampleNotes, { query: "Normalization", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, 0, "Should not match content-only terms");
});

// --- TS-09: All-fields scope includes content matches ---
test("TS-09", "All-fields scope matches query found only in content", () => {
    const results = getFilteredNotes(sampleNotes, { query: "Normalization", scope: "all", caseSensitive: false });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "5");
});

// --- TS-10: Search + category filter combined ---
test("TS-10", "Search and category filter work together correctly", () => {
    const results = getFilteredNotes(sampleNotes, { query: "calculus", scope: "title", caseSensitive: false, category: "Mathematics" });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "3");
});

// --- TS-11: Search with category filter, no match ---
test("TS-11", "Search within category filter returns empty when no notes match both", () => {
    const results = getFilteredNotes(sampleNotes, { query: "DBMS", scope: "title", caseSensitive: false, category: "Mathematics" });
    assert.strictEqual(results.length, 0);
});

// --- TS-12: #label search ---
test("TS-12", "#label prefix searches labels instead of title", () => {
    const results = getFilteredNotes(sampleNotes, { query: "#Work", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, 2);
    const ids = results.map(n => n.id).sort();
    assert.deepStrictEqual(ids, ["1", "5"]);
});

// --- TS-13: Search does not mutate notes array ---
test("TS-13", "Search does not mutate the original notes array", () => {
    const original = JSON.stringify(sampleNotes);
    getFilteredNotes(sampleNotes, { query: "calculus", scope: "title" });
    assert.strictEqual(JSON.stringify(sampleNotes), original, "Notes array was mutated");
});

// --- TS-14: Unicode and special characters in query ---
test("TS-14", "Unicode characters in titles are searchable", () => {
    const results = getFilteredNotes(sampleNotes, { query: "émojis", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "8");
});

// --- TS-15: Partial title match ---
test("TS-15", "Partial title match returns the correct note", () => {
    const results = getFilteredNotes(sampleNotes, { query: "algebra", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "6");
});

// --- TS-16: Case-sensitive full match ---
test("TS-16", "Case-sensitive exact match finds the note precisely", () => {
    const results = getFilteredNotes(sampleNotes, { query: "DBMS Concepts", scope: "title", caseSensitive: true });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "5");
});

// --- TS-17: Case-insensitive label search ---
test("TS-17", "#label search is case-insensitive by default", () => {
    const results = getFilteredNotes(sampleNotes, { query: "#important", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, "3");
});

// --- TS-18: Empty #label prefix returns all ---
test("TS-18", "Lone # with no label text returns all notes", () => {
    const results = getFilteredNotes(sampleNotes, { query: "#", scope: "title", caseSensitive: false });
    assert.strictEqual(results.length, sampleNotes.length);
});

console.log("\n--------------------------------------------------------");
const total = passed + failed;
console.log(`TEST SUMMARY: ${passed}/${total} Passed (${failed} Failed)`);
console.log("========================================================\n");

if (failed > 0) {
    process.exit(1);
}
