/**
 * Seed script — populates the database with book and chapter data.
 * Run: node server/seed.js
 */
import db from './db.js';

const BOOKS = [
  {
    id: 'relationship-guide',
    title: 'How to Make a Relationship Real and True',
    subtitle: 'An Emotional & Philosophical Journey',
    author: 'Mohamed Oublal',
    description: 'A deep dive into the architecture of intimacy, focusing on honesty, safety, and the work of connection.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'rose',
    total_chapters: 20,
  },
  {
    id: 'soul-architect',
    title: 'The Architect of the Soul',
    subtitle: 'Navigating Purpose and Resilience',
    author: 'Mohamed Oublal',
    description: 'A manual for inner strength, exploring the landscapes of solitude, ambition, and existential meaning.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'indigo',
    total_chapters: 20,
  },
  {
    id: 'mindful-living',
    title: 'The Art of Mindful Living',
    subtitle: 'Presence, Peace, and the Power of Now',
    author: 'Mohamed Oublal',
    description: 'A gentle guide to cultivating awareness, finding peace in the present moment, and transforming daily life through conscious attention.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'emerald',
    total_chapters: 20,
  },
  {
    id: 'modern-stoic',
    title: 'The Modern Stoic',
    subtitle: 'Mastery of the Internal World',
    author: 'Mohamed Oublal',
    description: 'Timeless wisdom applied to 21st-century chaos. Lessons on emotional regulation and radical acceptance.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'stone',
    total_chapters: 20,
  },
  {
    id: 'mindfulness-present',
    title: 'Mindfulness and Staying Present',
    subtitle: 'A Guide to Living Fully in Every Moment',
    author: 'Mohamed Oublal',
    description: 'An immersive exploration of mindfulness practices, the art of presence, and the transformative power of living fully in the now.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'teal',
    total_chapters: 30,
  },
  {
    id: 'mental-balance',
    title: 'Mental Balance',
    subtitle: 'The Architecture of Inner Equilibrium',
    author: 'Mohamed Oublal',
    description: 'A profound journey into the mechanics of mental harmony, emotional regulation, and the delicate art of maintaining equilibrium in a world of extremes.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'violet',
    total_chapters: 30,
  },
  {
    id: 'peer-pressure',
    title: 'Handling Peer Pressure Positively',
    subtitle: 'Standing Strong While Staying Connected',
    author: 'Mohamed Oublal',
    description: 'A powerful guide to navigating social influence with integrity, turning external pressure into internal strength, and learning to belong without losing yourself.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'amber',
    total_chapters: 30,
  },
  {
    id: 'mind-body-connection',
    title: 'The Mind–Body Connection',
    subtitle: 'Bridging the Gap Between Thought and Flesh',
    author: 'Mohamed Oublal',
    description: 'An illuminating exploration of how mind and body are not separate entities but a unified system, and how understanding this connection unlocks healing, performance, and well-being.',
    price: 9.99,
    currency: 'USD',
    cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
    accent_color: 'cyan',
    total_chapters: 30,
  },
];

await db.init();

// Seed books
for (const book of BOOKS) {
  await db.prepare(`
    INSERT INTO books (id, title, subtitle, author, description, price, currency, cover_image, accent_color, total_chapters)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      author = VALUES(author),
      description = VALUES(description),
      price = VALUES(price),
      currency = VALUES(currency),
      cover_image = VALUES(cover_image),
      accent_color = VALUES(accent_color),
      total_chapters = VALUES(total_chapters)
  `).run(
    book.id,
    book.title,
    book.subtitle,
    book.author,
    book.description,
    book.price,
    book.currency,
    book.cover_image,
    book.accent_color,
    book.total_chapters
  );
}

console.log(`Seeded ${BOOKS.length} books.`);

// Note: Chapters are served from the frontend constants.tsx file
// and also inserted into the DB below for the API and PDF generation.
// The chapter content is imported from the frontend constants.

console.log('Database seeded successfully!');
console.log('Note: Chapter data is served from frontend constants and synced via the /api/books endpoints.');
console.log('To sync chapters to DB for PDF generation, run the app and call POST /api/admin/sync-chapters.');
