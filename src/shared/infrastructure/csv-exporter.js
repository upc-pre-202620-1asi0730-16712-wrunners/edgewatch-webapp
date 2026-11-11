/**
 * Builds and downloads CSV files in the browser. Uses a BOM and the `;` separator so Excel (es-PE) opens them directly.
 */
export const CSV_SEPARATOR = ";";

const escape = (value) => {
    if (value === null || value === undefined) return "";
    const text = typeof value === "number" ? String(value).replace(".", ",") : String(value);
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * @param {Array<Object>} rows
 * @param {Array<{key: string, header: string}>} columns
 * @returns {string}
 */
export function toCsv(rows, columns) {
    const header = columns.map(c => escape(c.header)).join(CSV_SEPARATOR);
    const lines = rows.map(row => columns.map(c => escape(typeof c.value === "function" ? c.value(row) : row[c.key])).join(CSV_SEPARATOR));
    return [header, ...lines].join("\r\n");
}

/** Triggers the browser download of a CSV text. */
export function downloadCsv(filename, csv) {
    const blob = new Blob(["﻿" + csv], {type: "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
