import fs from "fs";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "CERTIFICATE OF EXCELLENCE",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    text: "This certificate is proudly awarded by ABC Tech to:",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "{name}",
                            bold: true,
                            size: 48,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    text: "For successfully completing the program of study and demonstrating outstanding proficiency in:",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "{course}",
                            bold: true,
                            size: 32,
                            color: "1e293b"
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    text: "Duration of course: {duration}",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "Issued on: {date}",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 },
                }),
                new Paragraph({
                    text: "Authorized Signature",
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 100 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "{institutionName}",
                            bold: true,
                        }),
                        new TextRun({
                            text: " - ABC Tech",
                            bold: true,
                        })
                    ],
                    alignment: AlignmentType.RIGHT,
                }),
                new Paragraph({
                    text: "{%qr_code}",
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400 },
                })
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("ABC_Tech_Template.docx", buffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
    
    fs.writeFileSync("src/defaultTemplate.js", `export const defaultTemplate = "${dataUrl}";\n`);
    
    console.log("Template generated successfully and saved to src/defaultTemplate.js!");
}).catch(console.error);
