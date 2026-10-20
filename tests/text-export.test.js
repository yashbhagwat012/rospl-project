const assert = require("assert");

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

const notes = [
    {
        title: "Calculus: Limits & 🚀",
        subject: "Mathematics",
        content: "First line.\nSecond line with punctuation: (x + 1)!"
    },
    {
        title: "Legacy note",
        text: "Legacy content.",
        subject: "History"
    }
];
const originalNotes = JSON.stringify(notes);
const output = formatNotesForTextExport(notes);

assert(output.includes("Note 1\r\nTitle: Calculus: Limits & 🚀\r\nSubject: Mathematics"));
assert(output.includes("Content:\r\nFirst line.\r\nSecond line with punctuation: (x + 1)!"));
assert(output.includes("------------------------------------------------------------"));
assert(output.includes("Note 2\r\nTitle: Legacy note\r\nSubject: History"));
assert(output.includes("Content:\r\nLegacy content."));
assert.strictEqual(formatNotesForTextExport([]), "");
assert.strictEqual(JSON.stringify(notes), originalNotes, "Export formatting must not mutate notes");

console.log("Text export tests passed.");
