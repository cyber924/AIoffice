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
import { BusinessFormDocument, FormSection } from '../types/formStudio';

export async function exportFormToDocx(doc: BusinessFormDocument): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: doc.title,
          bold: true,
          size: 36, // 18pt
          font: 'Malgun Gothic',
          color: '111827',
        }),
      ],
    })
  );

  // Approval Line Table (if exists)
  if (doc.approvalLine && doc.approvalLine.length > 0) {
    const headerCells = [
      new TableCell({
        width: { size: 1000, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '결\n재', bold: true, size: 18, font: 'Malgun Gothic' })],
          }),
        ],
      }),
    ];

    const contentCells = [
      new TableCell({
        width: { size: 1000, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
        children: [new Paragraph({ children: [] })],
      }),
    ];

    doc.approvalLine.forEach((step) => {
      headerCells.push(
        new TableCell({
          width: { size: 1500, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'F9FAFB' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: step.role, bold: true, size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        })
      );

      contentCells.push(
        new TableCell({
          width: { size: 1500, type: WidthType.DXA },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 100, after: 100 },
              children: [
                new TextRun({
                  text: step.name || (step.status === 'approved' ? '승인' : ' '),
                  size: 18,
                  font: 'Malgun Gothic',
                }),
              ],
            }),
          ],
        })
      );
    });

    const approvalTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: headerCells }), new TableRow({ children: contentCells })],
    });

    children.push(approvalTable);
    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // Meta info (Doc number, Drafter, Date)
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: '문서 번호', bold: true, size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: doc.docNumber || '일반-2026', size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: '기안 일자', bold: true, size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: doc.draftDate || '', size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: '기 안 자', bold: true, size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${doc.drafter.department || ''} ${doc.drafter.name || ''} ${doc.drafter.position || ''}`.trim(),
                  size: 18,
                  font: 'Malgun Gothic',
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: '시행 일자', bold: true, size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: doc.effectiveDate || doc.draftDate, size: 18, font: 'Malgun Gothic' })],
            }),
          ],
        }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: metaRows,
    })
  );
  children.push(new Paragraph({ spacing: { after: 250 }, children: [] }));

  // Amount summary if quotation or tax invoice
  if (doc.totalAmountText || doc.totalAmountNumber) {
    children.push(
      new Paragraph({
        spacing: { before: 150, after: 150 },
        children: [
          new TextRun({ text: '합계 금액: ', bold: true, size: 22, font: 'Malgun Gothic' }),
          new TextRun({
            text: doc.totalAmountText || `일금 ${(doc.totalAmountNumber || 0).toLocaleString()}원정`,
            bold: true,
            size: 22,
            font: 'Malgun Gothic',
            color: '059669',
          }),
        ],
      })
    );
  }

  // Sections
  doc.sections.forEach((sec, sIdx) => {
    // Section Header
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: `${sIdx + 1}. ${sec.title}`,
            bold: true,
            size: 22,
            font: 'Malgun Gothic',
            color: '1F2937',
          }),
        ],
      })
    );

    // Section Content by Type
    if (sec.type === 'text' && sec.content) {
      children.push(
        new Paragraph({
          spacing: { after: 150 },
          children: [
            new TextRun({
              text: sec.content,
              size: 19,
              font: 'Malgun Gothic',
            }),
          ],
        })
      );
    } else if (sec.type === 'bullet_list' && sec.items) {
      sec.items.forEach((item) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 50 },
            children: [
              new TextRun({
                text: item,
                size: 19,
                font: 'Malgun Gothic',
              }),
            ],
          })
        );
      });
      children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
    } else if (sec.type === 'key_value' && sec.keyValues) {
      const kvRows = sec.keyValues.map(
        (kv) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.CLEAR, fill: 'F9FAFB' },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: kv.label, bold: true, size: 18, font: 'Malgun Gothic' })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: kv.value, size: 18, font: 'Malgun Gothic' })],
                  }),
                ],
              }),
            ],
          })
      );
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: kvRows }));
      children.push(new Paragraph({ spacing: { after: 150 }, children: [] }));
    } else if (sec.type === 'table' && sec.columns && sec.rows) {
      const headerCells = sec.columns.map(
        (c) =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: '1E293B' },
            children: [
              new Paragraph({
                alignment:
                  c.align === 'right'
                    ? AlignmentType.RIGHT
                    : c.align === 'center'
                    ? AlignmentType.CENTER
                    : AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: c.header,
                    bold: true,
                    size: 18,
                    font: 'Malgun Gothic',
                    color: 'FFFFFF',
                  }),
                ],
              }),
            ],
          })
      );

      const tableRows: TableRow[] = [new TableRow({ children: headerCells })];

      sec.rows.forEach((r) => {
        const rowCells = sec.columns!.map((c) => {
          const val = r.cells[c.key];
          let formattedText = val !== undefined && val !== null ? String(val) : '';
          if (c.format === 'currency' && typeof val === 'number') {
            formattedText = `${val.toLocaleString()}원`;
          }

          return new TableCell({
            shading: r.isTotal ? { type: ShadingType.CLEAR, fill: 'F1F5F9' } : undefined,
            children: [
              new Paragraph({
                alignment:
                  c.align === 'right'
                    ? AlignmentType.RIGHT
                    : c.align === 'center'
                    ? AlignmentType.CENTER
                    : AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: formattedText,
                    bold: !!r.isTotal,
                    size: 18,
                    font: 'Malgun Gothic',
                  }),
                ],
              }),
            ],
          });
        });
        tableRows.push(new TableRow({ children: rowCells }));
      });

      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows }));
      children.push(new Paragraph({ spacing: { after: 150 }, children: [] }));
    }
  });

  // Footer Note
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [
        new TextRun({
          text: '위와 같이 정히 보고/제출하오니 재가하여 주시기 바랍니다.',
          bold: true,
          size: 20,
          font: 'Malgun Gothic',
          color: '4B5563',
        }),
      ],
    })
  );

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              bottom: 1200,
              left: 1200,
              right: 1200,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(wordDoc);
  const safeFilename = `${doc.title.replace(/[\/\\?%*:|"<>]/g, '_')}.docx`;
  saveAs(blob, safeFilename);
}
