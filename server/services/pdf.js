import PDFDocument from 'pdfkit';

/**
 * Generate a full-book PDF from chapter data.
 * Returns a Buffer containing the PDF.
 *
 * @param {Object} options
 * @param {string} options.title - Book title
 * @param {string} options.subtitle - Book subtitle
 * @param {string} options.author - Author name
 * @param {Array} options.chapters - Array of chapter objects
 * @param {string} [options.watermarkEmail] - Optional email to watermark pages
 */
export function generateBookPDF({ title, subtitle, author, chapters, watermarkEmail }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        info: {
          Title: title,
          Author: author,
          Subject: subtitle,
          Creator: 'DELTA EBooks',
        },
        permissions: {
          printing: 'lowResolution',
          modifying: false,
          copying: false,
          annotating: false,
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Title Page ──
      doc.moveDown(6);
      doc.fontSize(32).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).font('Helvetica-Oblique').fillColor('#666666').text(subtitle || '', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(14).font('Helvetica').fillColor('#999999').text(`By ${author}`, { align: 'center' });
      doc.moveDown(4);
      doc.fontSize(10).fillColor('#bbbbbb').text('Published by DELTA EBooks', { align: 'center' });
      doc.text('www.delta-ebooks.com', { align: 'center' });

      if (watermarkEmail) {
        doc.moveDown(2);
        doc.fontSize(8).fillColor('#cccccc').text(`Licensed to: ${watermarkEmail}`, { align: 'center' });
      }

      // ── Table of Contents ──
      doc.addPage();
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000').text('Table of Contents', { align: 'center' });
      doc.moveDown(2);

      chapters.forEach((chapter, i) => {
        doc.fontSize(12).font('Helvetica').fillColor('#333333')
          .text(`${i + 1}. ${chapter.title}`, {
            continued: false,
          });
        doc.fontSize(10).fillColor('#888888').text(`     ${chapter.subtitle || ''}`, { indent: 20 });
        doc.moveDown(0.3);
      });

      // ── Chapters ──
      chapters.forEach((chapter, i) => {
        doc.addPage();

        // Watermark on each page
        if (watermarkEmail) {
          doc.save();
          doc.fontSize(8).fillColor('#eeeeee').fillOpacity(0.3);
          doc.text(watermarkEmail, 72, doc.page.height - 40, { align: 'center' });
          doc.restore();
        }

        // Chapter header
        doc.fontSize(10).font('Helvetica').fillColor('#999999')
          .text(`Chapter ${i + 1}`, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#000000')
          .text(chapter.title, { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(14).font('Helvetica-Oblique').fillColor('#666666')
          .text(chapter.subtitle || '', { align: 'center' });
        doc.moveDown(2);

        // Chapter content
        const paragraphs = chapter.content.split('\n\n');
        paragraphs.forEach((para) => {
          doc.fontSize(11).font('Helvetica').fillColor('#333333')
            .text(para.trim(), {
              align: 'justify',
              lineGap: 4,
              paragraphGap: 8,
            });
          doc.moveDown(0.8);
        });

        // Reflection prompt
        if (chapter.reflection_prompt || chapter.reflectionPrompt) {
          doc.moveDown(1);
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#666666')
            .text('Reflection', { underline: true });
          doc.moveDown(0.3);
          doc.fontSize(11).font('Helvetica-Oblique').fillColor('#555555')
            .text(chapter.reflection_prompt || chapter.reflectionPrompt, {
              align: 'left',
              lineGap: 3,
            });
        }
      });

      // ── Final page ──
      doc.addPage();
      doc.moveDown(8);
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000')
        .text('Thank You for Reading', { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(12).font('Helvetica').fillColor('#666666')
        .text(`"${title}" by ${author}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#999999')
        .text('Published by DELTA EBooks — The Universal Wisdom Library', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#bbbbbb')
        .text('This PDF is for personal use only. Do not distribute.', { align: 'center' });

      if (watermarkEmail) {
        doc.moveDown(0.5);
        doc.fontSize(8).fillColor('#cccccc')
          .text(`Licensed to: ${watermarkEmail}`, { align: 'center' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate a PDF from journal entries.
 *
 * @param {Array} entries - Array of journal entry objects
 * @param {string} documentTitle - Title for the PDF
 * @returns {Promise<Buffer>} PDF buffer
 */
export function generateJournalPDF(entries, documentTitle = 'My Journal') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        info: {
          Title: documentTitle,
          Author: 'DELTA EBooks User',
          Creator: 'DELTA EBooks',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Title Page ──
      doc.moveDown(6);
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#1c1917')
        .text(documentTitle, { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(12).font('Helvetica').fillColor('#78716c')
        .text(`${entries.length} entries`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#a8a29e')
        .text(`Exported on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
      doc.moveDown(4);
      doc.fontSize(10).fillColor('#d6d3d1')
        .text('Generated by DELTA EBooks', { align: 'center' });

      // ── Entries ──
      for (const entry of entries) {
        doc.addPage();

        // Date + mood header
        doc.fontSize(9).font('Helvetica').fillColor('#a8a29e')
          .text(entry.date, { continued: true });
        if (entry.mood) {
          doc.text(`  •  ${entry.mood}`, { continued: true });
        }
        if (entry.category && entry.category !== 'general') {
          doc.text(`  •  ${entry.category}`);
        } else {
          doc.text('');
        }

        doc.moveDown(0.5);

        // Title
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#1c1917')
          .text(entry.title);
        doc.moveDown(0.3);

        // Book reference
        if (entry.book_title) {
          doc.fontSize(10).font('Helvetica-Oblique').fillColor('#78716c')
            .text(`Book: ${entry.book_title}`);
          doc.moveDown(0.3);
        }

        // Mood rating stars
        if (entry.mood_rating) {
          const stars = '★'.repeat(entry.mood_rating) + '☆'.repeat(5 - entry.mood_rating);
          doc.fontSize(12).fillColor('#d4a853').text(stars);
          doc.moveDown(0.5);
        }

        // Divider
        doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#e7e5e4').stroke();
        doc.moveDown(1);

        // Content
        const paragraphs = entry.content.split('\n');
        for (const para of paragraphs) {
          if (para.trim()) {
            doc.fontSize(11).font('Helvetica').fillColor('#44403c')
              .text(para.trim(), { align: 'left', lineGap: 4 });
            doc.moveDown(0.6);
          }
        }

        // Tags
        if (entry.tags && entry.tags.length > 0) {
          doc.moveDown(0.5);
          doc.fontSize(9).font('Helvetica').fillColor('#a8a29e')
            .text(entry.tags.map(t => `#${t}`).join('  '));
        }
      }

      // ── Final page ──
      doc.addPage();
      doc.moveDown(8);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#1c1917')
        .text('End of Journal', { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica').fillColor('#a8a29e')
        .text('This journal is private and for personal use only.', { align: 'center' });
      doc.moveDown(0.5);
      doc.text('Generated by DELTA EBooks — The Universal Wisdom Library', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
