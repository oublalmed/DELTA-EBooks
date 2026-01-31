import { Router } from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// All AI generation routes require admin authentication
router.use(requireAdmin);

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// ══════════════════════════════════════════════════════════════════
// AI EBOOK GENERATION
// ══════════════════════════════════════════════════════════════════

// Generate a full ebook draft
router.post('/ebook', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });
  }

  try {
    const { title, topic, chapters = 10, style, target_audience, linked_book_id } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ error: 'Title and topic are required' });
    }

    // Create AI generation record
    const prompt = `Generate a complete ebook outline and content for:
Title: "${title}"
Topic: ${topic}
Number of Chapters: ${chapters}
Style: ${style || 'Professional and engaging'}
Target Audience: ${target_audience || 'General readers'}

For each chapter, provide:
1. Chapter title
2. Brief summary (2-3 sentences)
3. Main content (500-800 words)
4. Key takeaways (3-5 bullet points)

Format the response as JSON with the following structure:
{
  "title": "...",
  "description": "...",
  "chapters": [
    {
      "number": 1,
      "title": "...",
      "summary": "...",
      "content": "...",
      "takeaways": ["...", "..."]
    }
  ]
}`;

    const genRecord = db.prepare(`
      INSERT INTO ai_generations (type, prompt, model, status)
      VALUES (?, ?, ?, ?)
    `).run('ebook', prompt, 'gemini-pro', 'processing');

    const generationId = genRecord.lastInsertRowid;

    // Generate with Gemini
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse as JSON, or store as raw text
      let parsedContent;
      try {
        // Extract JSON from response (may have markdown code blocks)
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          parsedContent = { raw: text };
        }
      } catch {
        parsedContent = { raw: text };
      }

      // Create internal ebook
      const ebookResult = db.prepare(`
        INSERT INTO internal_ebooks (title, subtitle, description, content, category, status, linked_book_id, ai_generated, ai_model, ai_prompt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        parsedContent.title || title,
        parsedContent.subtitle || null,
        parsedContent.description || topic,
        JSON.stringify(parsedContent),
        'ai_draft',
        'draft',
        linked_book_id || null,
        1,
        'gemini-pro',
        prompt
      );

      const internalEbookId = ebookResult.lastInsertRowid;

      // Create chapters if parsed successfully
      if (parsedContent.chapters && Array.isArray(parsedContent.chapters)) {
        for (const chapter of parsedContent.chapters) {
          db.prepare(`
            INSERT INTO internal_ebook_chapters (ebook_id, chapter_number, title, content, notes, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            internalEbookId,
            chapter.number || parsedContent.chapters.indexOf(chapter) + 1,
            chapter.title || `Chapter ${chapter.number}`,
            chapter.content || '',
            chapter.takeaways ? JSON.stringify(chapter.takeaways) : null,
            'draft'
          );
        }
      }

      // Update generation record
      db.prepare(`
        UPDATE ai_generations SET
          result = ?,
          status = 'completed',
          internal_ebook_id = ?,
          completed_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(parsedContent), internalEbookId, generationId);

      res.json({
        success: true,
        generation_id: generationId,
        internal_ebook_id: internalEbookId,
        title: parsedContent.title || title,
        chapters_generated: parsedContent.chapters?.length || 0
      });

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      db.prepare(`
        UPDATE ai_generations SET
          status = 'failed',
          error_message = ?,
          completed_at = datetime('now')
        WHERE id = ?
      `).run(aiError.message, generationId);

      res.status(500).json({ error: 'AI generation failed', details: aiError.message });
    }

  } catch (error) {
    console.error('Generate ebook error:', error);
    res.status(500).json({ error: 'Failed to generate ebook' });
  }
});

// Generate a single chapter
router.post('/chapter', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });
  }

  try {
    const { internal_ebook_id, chapter_number, topic, style, word_count = 800 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Write a chapter for an ebook:
Topic: ${topic}
Style: ${style || 'Professional and engaging'}
Target Word Count: ${word_count}

Include:
1. An engaging opening paragraph
2. Main content with clear sections
3. Practical examples or stories
4. A compelling conclusion
5. 3-5 key takeaways

Write in a flowing, narrative style that keeps readers engaged.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // If linked to an internal ebook, save the chapter
    if (internal_ebook_id) {
      const existingChapter = db.prepare(`
        SELECT id FROM internal_ebook_chapters 
        WHERE ebook_id = ? AND chapter_number = ?
      `).get(internal_ebook_id, chapter_number || 1);

      if (existingChapter) {
        db.prepare(`
          UPDATE internal_ebook_chapters SET
            content = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(content, existingChapter.id);
      } else {
        db.prepare(`
          INSERT INTO internal_ebook_chapters (ebook_id, chapter_number, title, content, status)
          VALUES (?, ?, ?, ?, ?)
        `).run(internal_ebook_id, chapter_number || 1, `Chapter ${chapter_number || 1}`, content, 'draft');
      }
    }

    // Log generation
    db.prepare(`
      INSERT INTO ai_generations (type, prompt, model, result, status, internal_ebook_id, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run('chapter', prompt, 'gemini-pro', content, 'completed', internal_ebook_id || null);

    res.json({
      success: true,
      content,
      word_count: content.split(/\s+/).length
    });

  } catch (error) {
    console.error('Generate chapter error:', error);
    res.status(500).json({ error: 'Failed to generate chapter' });
  }
});

// Improve/rewrite content
router.post('/improve', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });
  }

  try {
    const { content, instruction } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const prompt = `${instruction || 'Improve and enhance the following content, making it more engaging and professional:'}

Original Content:
${content}

Provide the improved version:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improved = response.text();

    res.json({
      success: true,
      original: content,
      improved,
      word_count: improved.split(/\s+/).length
    });

  } catch (error) {
    console.error('Improve content error:', error);
    res.status(500).json({ error: 'Failed to improve content' });
  }
});

// Generate book outline
router.post('/outline', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });
  }

  try {
    const { title, topic, chapters = 10, style } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Create a detailed ebook outline for:
Title: ${title || 'TBD'}
Topic: ${topic}
Number of Chapters: ${chapters}
Style: ${style || 'Professional self-help'}

For each chapter provide:
1. Title
2. Summary (2-3 sentences)
3. Key topics to cover (5-7 bullet points)
4. Estimated word count

Format as JSON:
{
  "suggested_title": "...",
  "description": "...",
  "target_audience": "...",
  "chapters": [
    {
      "number": 1,
      "title": "...",
      "summary": "...",
      "topics": ["...", "..."],
      "estimated_words": 800
    }
  ]
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let outline;
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outline = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        outline = { raw: text };
      }
    } catch {
      outline = { raw: text };
    }

    res.json({
      success: true,
      outline
    });

  } catch (error) {
    console.error('Generate outline error:', error);
    res.status(500).json({ error: 'Failed to generate outline' });
  }
});

export default router;
