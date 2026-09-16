import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import { GeneratedDocument, DocumentSection } from '../types/document';

export async function exportDocumentToDocx(doc: GeneratedDocument): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  // 1. Cover / Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: doc.title,
          bold: true,
          size: 38, // 19pt
          font: 'Malgun Gothic',
          color: '1E293B',
        }),
      ],
    })
  );

  // Subtitle / Topic
  if (doc.subtitle || doc.purpose) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({
            text: doc.subtitle || doc.purpose,
            size: 24, // 12pt
            font: 'Malgun Gothic',
            color: '4F46E5', // Indigo-600
            italics: true,
          }),
        ],
      })
    );
  }

  // Metadata summary table
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: '분야 / 유형', bold: true, size: 20, font: 'Malgun Gothic', color: '334155' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 6500, type: WidthType.DXA },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${doc.customField || doc.field} | ${doc.customDocumentType || doc.documentType}`,
                  size: 20,
                  font: 'Malgun Gothic',
                  color: '1E293B',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: '대상 독자 / 작성일', bold: true, size: 20, font: 'Malgun Gothic', color: '334155' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 6500, type: WidthType.DXA },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${doc.targetAudience} | ${new Date(doc.metadata?.createdAt || Date.now()).toLocaleDateString('ko-KR')}`,
                  size: 20,
                  font: 'Malgun Gothic',
                  color: '1E293B',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: metaRows,
    })
  );

  children.push(new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }));

  // 2. Executive Summary Box
  if (doc.executiveSummary) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
        children: [
          new TextRun({
            text: '■ 핵심 요약 (Executive Summary)',
            bold: true,
            size: 26,
            font: 'Malgun Gothic',
            color: '1E3A8A',
          }),
        ],
      })
    );

    const summaryParagraphs = doc.executiveSummary.split('\n').filter((p) => p.trim().length > 0);
    const summaryCellChildren = summaryParagraphs.map(
      (p) =>
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: p.replace(/^#+\s*/, '').replace(/\*\*/g, ''),
              size: 21,
              font: 'Malgun Gothic',
              color: '1E293B',
            }),
          ],
        })
    );

    children.push(
      new Table({
        width: { size: 9000, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 9000, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: 'EEF2FF' }, // Light indigo
                margins: { top: 160, bottom: 160, left: 200, right: 200 },
                children: summaryCellChildren,
              }),
            ],
          }),
        ],
      })
    );

    children.push(new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }));
  }

  // 3. Table of Contents
  if (doc.tableOfContents && doc.tableOfContents.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: '■ 목차 (Table of Contents)',
            bold: true,
            size: 26,
            font: 'Malgun Gothic',
            color: '1E3A8A',
          }),
        ],
      })
    );

    doc.tableOfContents.forEach((toc) => {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `${toc.sectionNumber}  ${toc.title}`,
              size: 21,
              font: 'Malgun Gothic',
              color: '334155',
            }),
          ],
        })
      );
    });

    children.push(new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }));
  }

  // 4. Document Sections
  doc.sections.forEach((section: DocumentSection, index: number) => {
    // Section Header
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 140 },
        children: [
          new TextRun({
            text: `${section.sectionNumber} ${section.title}`,
            bold: true,
            size: 28, // 14pt
            font: 'Malgun Gothic',
            color: '1E293B',
          }),
        ],
      })
    );

    // Parse and render section content lines
    const rawLines = section.content.split('\n');
    rawLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        children.push(new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }));
        return;
      }

      // Markdown Sub-headings (### or ####)
      if (trimmed.startsWith('###')) {
        const subTitle = trimmed.replace(/^#+\s*/, '');
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: `▶ ${subTitle}`,
                bold: true,
                size: 23,
                font: 'Malgun Gothic',
                color: '3730A3', // Indigo-800
              }),
            ],
          })
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        // Bullet item
        const bulletText = trimmed.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '');
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: bulletText,
                size: 21,
                font: 'Malgun Gothic',
                color: '1E293B',
              }),
            ],
          })
        );
      } else {
        // Regular paragraph (strip ** bold markers for clean flow)
        const cleanText = trimmed.replace(/\*\*/g, '');
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: cleanText,
                size: 21,
                font: 'Malgun Gothic',
                color: '1E293B',
              }),
            ],
          })
        );
      }
    });

    children.push(new Paragraph({ spacing: { before: 160, after: 80 }, children: [] }));
  });

  // 5. Conclusion (if present)
  if (doc.conclusion) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 140 },
        children: [
          new TextRun({
            text: '종합 결론 및 향후 추진 과제',
            bold: true,
            size: 28,
            font: 'Malgun Gothic',
            color: '1E293B',
          }),
        ],
      })
    );

    const conclusionLines = doc.conclusion.split('\n').filter((l) => l.trim().length > 0);
    conclusionLines.forEach((l) => {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: l.replace(/\*\*/g, ''),
              size: 21,
              font: 'Malgun Gothic',
              color: '1E293B',
            }),
          ],
        })
      );
    });
  }

  // Create Docx
  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(wordDoc);
  const sanitizedTitle = (doc.title || '전문문서')
    .replace(/[^a-zA-Z0-9가-힣_-]/g, '_')
    .substring(0, 30);
  saveAs(blob, `${sanitizedTitle}.docx`);
}

export const exportDocToDocx = exportDocumentToDocx;
