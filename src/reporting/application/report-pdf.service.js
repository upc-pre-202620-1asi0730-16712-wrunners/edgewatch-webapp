import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import {Chart} from "chart.js/auto";
import {ReportDataService} from "@/reporting/application/report-data.service.js";
import {BAND_COLORS} from "@/shared/presentation/charts/chart-theme.js";

/**
 * Renders a report template over a report context into a PDF with jsPDF.
 * Layout: brand header band, title, metadata line, sections with a two-column widget grid, optional signature block
 * and a footer with the template text and the page number.
 */
export class ReportPdfService {
    static #MARGIN = 14;

    /**
     * @param {ReportTemplate} template
     * @param {import("./report-data.service.js").ReportContext} context
     * @param {Function} t vue-i18n translator
     * @returns {{doc: jsPDF, fileName: string}}
     */
    static render(template, context, t) {
        const doc = new jsPDF({orientation: template.orientation === "LANDSCAPE" ? "landscape" : "portrait", unit: "mm", format: template.pageSize === "LETTER" ? "letter" : "a4"});
        const page = {width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight()};
        const m = this.#MARGIN;
        const primary = this.#rgb(template.primaryColor), secondary = this.#rgb(template.secondaryColor);
        const contentWidth = page.width - 2 * m;
        const bottomLimit = page.height - 18;
        let y = 0;

        const ensure = (height) => { if (y + height > bottomLimit) { doc.addPage(); y = m; } };
        const sectionTitle = (title) => {
            ensure(14);
            doc.setFillColor(...secondary); doc.rect(m, y, 2, 7, "F");
            doc.setTextColor(...primary); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
            doc.text(title, m + 5, y + 5.5);
            y += 11;
        };
        const valueBox = (x, width, label, value) => {
            doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(110, 120, 135);
            doc.text(label.toUpperCase(), x, y + 4);
            doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 30, 30);
            const lines = doc.splitTextToSize(String(value), width - 2);
            doc.text(lines, x, y + 10);
            return 12 + (lines.length - 1) * 5;
        };

        // Header band
        doc.setFillColor(...primary); doc.rect(0, 0, page.width, 22, "F");
        doc.setFillColor(...secondary); doc.rect(0, 22, page.width, 1.5, "F");
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(14);
        doc.text(template.headerText || template.name, m, 10);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        doc.text(t("reports.kind." + template.reportKind), m, 17);
        doc.text(`EdgeWatch · ${new Date().toLocaleString("es-PE", {dateStyle: "medium", timeStyle: "short"})}`, page.width - m, 17, {align: "right"});
        y = 32;

        // Title and subject line
        doc.setTextColor(...primary); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
        doc.text(template.name, m, y); y += 7;
        doc.setTextColor(90, 100, 115); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        const subject = [`${t("reports.subject.session")} #${context.session.id}`, context.system?.code, context.recuperation?.workOrderNumber, context.customer?.legalName].filter(Boolean).join("  ·  ");
        doc.text(subject, m, y); y += 9;

        for (const section of template.orderedSections) {
            sectionTitle(section.title);
            let column = 0;
            let rowHeight = 0;
            for (const widget of section.widgets) {
                const resolved = ReportDataService.resolve(widget, context, t);
                const label = widget.variableLabel || widget.variableCode;
                const isFull = widget.width === "FULL" || widget.viewType === "TREND" || widget.viewType === "TABLE";
                if (isFull && column === 1) { y += rowHeight; column = 0; rowHeight = 0; }

                if (widget.viewType === "TREND" && typeof resolved === "object") {
                    const image = this.#trendImage(resolved.rows, resolved.parameter, label, secondary);
                    const height = contentWidth * 0.32;
                    ensure(height + 8);
                    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
                    doc.text(label, m, y + 4);
                    if (image) doc.addImage(image, "PNG", m, y + 6, contentWidth, height);
                    y += height + 10;
                    continue;
                }
                if (widget.viewType === "TABLE" && typeof resolved === "object") {
                    ensure(20);
                    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(60, 60, 60);
                    doc.text(label, m, y + 4);
                    const {head, body} = this.#tableOf(widget, resolved.rows, t);
                    autoTable(doc, {
                        startY: y + 6, margin: {left: m, right: m}, head: [head], body: body.length ? body : [[t("reports.empty-table")]],
                        styles: {fontSize: 8, cellPadding: 1.6}, headStyles: {fillColor: primary, textColor: 255}, alternateRowStyles: {fillColor: [246, 247, 250]},
                        didDrawPage: (data) => { y = data.cursor.y; }
                    });
                    y = doc.lastAutoTable.finalY + 6;
                    continue;
                }

                // VALUE / MIN_MAX / TEXT in a two-column grid
                const width = isFull ? contentWidth : (contentWidth - 6) / 2;
                const x = m + column * ((contentWidth - 6) / 2 + 6);
                ensure(16);
                const h = valueBox(x, width, label, typeof resolved === "object" ? String(resolved.rows?.length ?? "–") : resolved);
                rowHeight = Math.max(rowHeight, h + 3);
                if (isFull) { y += rowHeight; column = 0; rowHeight = 0; }
                else if (column === 1) { y += rowHeight; column = 0; rowHeight = 0; }
                else column = 1;
            }
            if (column === 1) y += rowHeight;
            y += 4;
        }

        if (template.showSignatureBlock) {
            ensure(30);
            y += 10;
            const half = (contentWidth - 10) / 2;
            doc.setDrawColor(150, 150, 150);
            doc.line(m, y + 12, m + half, y + 12); doc.line(m + half + 10, y + 12, m + contentWidth, y + 12);
            doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(90, 100, 115);
            doc.text(t("reports.signature.quality"), m, y + 17);
            doc.text(t("reports.signature.supervisor"), m + half + 10, y + 17);
            doc.text(context.operatorName, m, y + 21);
        }

        // Footer on every page
        const pages = doc.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
            doc.setPage(i);
            doc.setDrawColor(...secondary); doc.line(m, page.height - 12, page.width - m, page.height - 12);
            doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
            doc.text(template.footerText || "EdgeWatch", m, page.height - 7);
            doc.text(`${i} / ${pages}`, page.width - m, page.height - 7, {align: "right"});
        }

        const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
        const fileName = `${template.reportKind.toLowerCase()}-session-${context.session.id}-${stamp}.pdf`;
        return {doc, fileName};
    }

    static #rgb(hex) {
        const v = hex.replace("#", "");
        return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
    }

    /** Rows of the deviation and fault-case tables. */
    static #tableOf(widget, rows, t) {
        const time = (ms) => new Date(ms).toLocaleTimeString("es-PE");
        const number = (v) => Number(v).toLocaleString("es-PE", {maximumFractionDigits: 1});
        if (widget.variableSource === "FAULT_CASES") {
            return {
                head: [t("fault-cases.detected-at"), t("fault-cases.parameter"), t("fault-cases.band"), t("fault-cases.value"), t("fault-cases.recommended-action"), t("fault-cases.status")],
                body: rows.map(c => [time(c.epochMillis), t("session-detail.parameter." + c.parameter, c.parameter), t("session-detail.band." + c.band), number(c.value), c.recommendedAction, t("fault-cases.status-option." + c.status)])
            };
        }
        return {
            head: [t("analysis.time"), t("analysis.parameter"), t("fault-cases.band"), t("fault-cases.value"), t("analysis.unit")],
            body: rows.map(r => [time(r.epochMillis), t("session-detail.parameter." + r.parameter, r.parameter), t("session-detail.band." + r.band), number(r.value), r.unitSymbol])
        };
    }

    /** Draws a trend with the recipe bands on an offscreen canvas and returns it as a PNG data URL. */
    static #trendImage(rows, parameter, label, accent) {
        if (!rows.length) return null;
        const canvas = document.createElement("canvas");
        canvas.width = 1400; canvas.height = 450;
        const labels = rows.map(r => new Date(r.epochMillis).toLocaleTimeString("es-PE"));
        const line = (value, color, dash) => ({label: "", data: rows.map(() => value), borderColor: color, borderDash: dash, borderWidth: 1.2, pointRadius: 0, fill: false});
        const datasets = [{label, data: rows.map(r => Number(r.value)), borderColor: `rgb(${accent.join(",")})`, backgroundColor: `rgba(${accent.join(",")},.15)`, borderWidth: 2, pointRadius: 0, fill: true, tension: .25}];
        if (parameter) {
            datasets.push(line(parameter.upperShutdown, BAND_COLORS.shutdown, [6, 4]), line(parameter.lowerShutdown, BAND_COLORS.shutdown, [6, 4]),
                line(parameter.upperWarning, BAND_COLORS.warning, [4, 4]), line(parameter.lowerWarning, BAND_COLORS.warning, [4, 4]),
                line(parameter.setpoint, "#5b6878", [2, 3]));
        }
        const chart = new Chart(canvas.getContext("2d"), {
            type: "line", data: {labels, datasets},
            options: {animation: false, responsive: false, devicePixelRatio: 1, plugins: {legend: {display: false}},
                scales: {x: {ticks: {maxTicksLimit: 10, font: {size: 18}}, grid: {display: false}}, y: {ticks: {font: {size: 18}}}}}
        });
        const image = chart.toBase64Image("image/png", 1);
        chart.destroy();
        return image;
    }
}
