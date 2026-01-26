
import { Book } from './types';

export const BOOK_TITLE = "The Universal Wisdom Library";
export const AUTHOR = "Mohamed Oublal";
export const BOOK_SUBTITLE = "Navigating the Architecture of the Human Experience";

export const BOOKS: Book[] = [
  {
    id: 'relationship-guide',
    title: "How to Make a Relationship Real and True",
    subtitle: "An Emotional & Philosophical Journey",
    author: "Mohamed Oublal",
    description: "A deep dive into the architecture of intimacy, focusing on honesty, safety, and the work of connection.",
    coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200",
    accentColor: "rose",
    systemPrompt: "You are an Emotional Companion focused on relationship depth. Core tenets: Love is a practice, honesty is foundation, conflict is growth.",
    chapters: [
      {
        id: 1,
        title: "The Truth About Love",
        subtitle: "What Nobody Tells You",
        summary: "Redefining love beyond movies, social media, and fantasies.",
        content: "We are raised on a diet of 'happily ever after,' a narrative where love is the destination rather than the journey. Real love is found in the moments when the music stops and the lights come up. It is the decision to stay when the mystery has faded and the flaws become visible. Truth in love is not about finding the 'perfect' person, but about learning to see an imperfect person perfectly. It is the courage to be seen in your own naked vulnerability, without the armor of performance.",
        reflectionPrompt: "Describe a time you prioritized a 'real' moment of connection over a romanticized ideal of love.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 2,
        title: "Attraction Is Easy, Connection Is Work",
        subtitle: "Beyond Chemistry",
        summary: "Why chemistry starts relationships, but effort keeps them alive.",
        content: "Chemistry is the biological accident that brings two people together. It is the spark, the electricity, the initial heat. But connection is a conscious architecture. It is built in the mundane gaps between the grand gestures. It is the work of listening when you're tired, of being curious when you're bored, and of choosing kindness over being right. A relationship survives not because it has the most heat, but because it has the most solid foundation of shared labor.",
        reflectionPrompt: "How have you actively worked to build a connection recently? What 'brick' did you lay today?",
        image: "https://images.unsplash.com/photo-1516589174184-c68526572af0?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 3,
        title: "Honesty Before Romance",
        subtitle: "The Foundation of Truth",
        summary: "How telling the truth early saves years of pain later.",
        content: "We often lead with our best selves, a curated version of our identity designed to attract. But true romance cannot breathe in an atmosphere of performance. Honesty is not just about not lying; it is about being radically transparent about who you are, what you fear, and what you need. When we lead with honesty, we filter for the people who can actually handle our truth. A relationship built on a lie, no matter how beautiful, is a house built on sand.",
        reflectionPrompt: "What is one truth about yourself you usually hide at the start of a relationship? What would happen if you led with it instead?",
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 4,
        title: "Learning to Communicate Without Hurting",
        subtitle: "The Art of Kind Honesty",
        summary: "Speaking honestly while staying kind. Listening without defending.",
        content: "Communication is the circulatory system of a relationship. When it stops, the connection dies. The challenge is to speak the truth without using it as a weapon. 'I' statements are not just a cliché; they are a shield for the other person's ego. To communicate well is to listen more to understand than to respond. It is the ability to hear your partner's pain without making it about your guilt. In the architecture of love, words are the mortar that holds the bricks together.",
        reflectionPrompt: "Recall your last argument. If you could redo it, how would you have expressed your needs without attacking your partner?",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 5,
        title: "Emotional Safety: The Invisible Foundation",
        subtitle: "The Sacred Space",
        summary: "How to build a relationship where both people feel safe to be themselves.",
        content: "Emotional safety is the quiet knowledge that your heart is in good hands. It is the freedom to be weak, to be wrong, and to be messy without fear of judgment or abandonment. Without safety, intimacy is impossible. We build safety through consistent reliability—showing up when we say we will, keeping secrets, and validating feelings even when we don't agree with them. A safe relationship is a sanctuary where both partners can finally stop looking over their shoulders.",
        reflectionPrompt: "What makes you feel emotionally safe? How can you create more of that feeling for your partner today?",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 6,
        title: "Consistency Over Intensity",
        subtitle: "The Power of the Mundane",
        summary: "Why showing up matters more than grand gestures.",
        content: "Society celebrates the grand proposal and the expensive anniversary, but a relationship is actually won or lost in the boring Tuesdays. Intensity is exciting, but consistency is grounding. Love is found in the way you make coffee for them, the way you remember their doctor's appointment, and the way you always answer the phone. You cannot build a lifelong home on fireworks; you build it on the steady, reliable heartbeat of small, daily acts of devotion.",
        reflectionPrompt: "What is one 'small thing' your partner (or a loved one) does consistently that you often take for granted?",
        image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 7,
        title: "Trust Is Built, Not Promised",
        subtitle: "The Currency of Connection",
        summary: "How trust grows through actions, not words.",
        content: "Trust is not a switch you flip; it is a bank account you deposit into every day. You cannot ask for trust; you must earn it through the slow accumulation of kept promises. When we fail, as we inevitably will, trust is repaired through radical accountability and changed behavior, not just through apologies. A relationship without trust is like a car without an engine—you can sit in it and look good, but you aren't going anywhere.",
        reflectionPrompt: "Think of a time trust was broken. What specific actions helped repair it, or what was missing that made repair impossible?",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 8,
        title: "Respecting Individuality Without Losing Each Other",
        subtitle: "Love Without Control",
        summary: "Freedom without distance, and union without fusion.",
        content: "A healthy relationship is two whole people walking together, not two halves completing each other. Enmeshment—where you lose your sense of self in the other—is a form of slow emotional suicide. Respecting individuality means celebrating your partner's hobbies, friendships, and goals that have nothing to do with you. The strongest bonds are those that are loose enough to allow both people to breathe, but tight enough to keep them close when the wind blows.",
        reflectionPrompt: "What part of your 'self' have you neglected lately in favor of your relationship? How can you reclaim that part today?",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 9,
        title: "Conflict Is Not the Enemy",
        subtitle: "Growth Through Friction",
        summary: "How arguments can strengthen a relationship when handled right.",
        content: "The absence of conflict is not the sign of a good relationship; it's often a sign of suppressed honesty. Friction is what creates heat, and heat is what allows for transformation. The goal is not to stop arguing, but to learn how to fight 'clean.' Conflict is an opportunity to learn something deep about your partner's needs. If you approach a disagreement with curiosity instead of defensiveness, every argument becomes a new brick in the wall of your understanding.",
        reflectionPrompt: "What is the 'real' issue behind your most common argument? (Hint: It's rarely about the dishes.)",
        image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 10,
        title: "Boundaries: Loving Without Losing Yourself",
        subtitle: "The Gates of the Soul",
        summary: "Saying no, setting limits, and protecting your identity.",
        content: "Boundaries are not walls to keep people out; they are gates to let the right things in. Without boundaries, love becomes resentment. A boundary is simply a clear statement of what you need to be okay. It is the act of saying, 'I love you, but I cannot do this.' When we respect our own boundaries, we teach others how to love us. In the architecture of intimacy, boundaries are the load-bearing pillars that prevent the roof from caving in on your soul.",
        reflectionPrompt: "Where in your life are you currently saying 'yes' when your soul is screaming 'no'? What would happen if you set a limit there?",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 11,
        title: "Growing Together, Not Apart",
        subtitle: "The Evolution of Us",
        summary: "How couples evolve through change, stress, and life transitions.",
        content: "The person you marry is not the person you will be living with in ten years. We are all dynamic, evolving creatures. The secret to a lasting relationship is to fall in love with the 'process' of your partner, not just their current 'version.' This requires a constant re-introduction. You must remain a student of your partner, always asking new questions as they change. Growing together means ensuring that your individual paths remain parallel, even as they wind through new landscapes.",
        reflectionPrompt: "How has your partner (or a close friend) changed in the last year? What is one new thing you've learned about their current 'version'?",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 12,
        title: "The Role of Effort When Love Feels Quiet",
        subtitle: "The Season of Stillness",
        summary: "What to do when passion fades but love remains.",
        content: "Every relationship has winters—seasons where the passion feels dormant and the connection feels thin. This is not a sign of failure; it is a cycle of nature. In these quiet times, effort becomes a discipline. It is the decision to be romantic even when you don't feel 'in the mood.' It is the work of finding beauty in the familiar. A quiet love is not a dead love; it is a deep love that is resting, preparing for the next spring. Patience is the bridge that gets you from one peak to the next.",
        reflectionPrompt: "When things feel 'quiet' or 'routine,' what is one intentional act you can do to invite a spark back into the room?",
        image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 13,
        title: "Choosing Each Other Every Day",
        subtitle: "The Daily Covenant",
        summary: "Why love is a daily decision, not a one-time feeling.",
        content: "We talk about 'falling' in love, as if it's an accident. But 'staying' in love is a choice. Every morning you wake up, you have to decide to be the person who loves your partner. Feelings are fickle; they come and go like the tide. But a commitment is the shore. To choose each other every day means looking at the flaws, the history, and the challenges, and saying, 'Yes, I still want this.' Love is a verb, and it must be conjugated every single day.",
        reflectionPrompt: "Today, why did you choose to stay in your current relationship (or what would make you choose a future one)? List three concrete reasons.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 14,
        title: "When Love Is Real but Not Right",
        subtitle: "The Dignity of Letting Go",
        summary: "Understanding healthy endings and letting go with grace.",
        content: "One of the hardest truths to accept is that you can love someone deeply and still not be right for them. A relationship can be 'real'—filled with true affection—and still be 'wrong'—incompatible in values, timing, or growth. Letting go in these cases is not a failure; it is an act of ultimate respect. It is the realization that both of you deserve a love that fits. Ending a relationship with dignity means honoring what was shared while making room for what must be.",
        reflectionPrompt: "Have you ever held onto something that was hurting you just because you loved it? What did that cost your soul?",
        image: "https://images.unsplash.com/photo-1505506819641-ad0b97d31132?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 15,
        title: "Building a Relationship That Lasts",
        subtitle: "Practical Habits for Connection",
        summary: "Actionable routines for long-term emotional intimacy.",
        content: "Longevity in love is built on a foundation of rituals. The 20-minute daily check-in, the weekly date night, the way you say goodbye in the morning. These habits create a predictable rhythm of connection that buffers the relationship against the chaos of life. A lasting relationship is a garden that is tended to daily, not just when the weeds become overwhelming. Intimacy is not a destination you reach; it is a path you keep clear by walking it together every day.",
        reflectionPrompt: "What is your 'daily ritual' of connection? If you don't have one, what simple habit could you start tonight?",
        image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 16,
        title: "The Quiet Signs of a True Relationship",
        subtitle: "Real Love vs. Drama",
        summary: "How to recognize real love when it doesn’t look like a movie.",
        content: "We are conditioned to look for the high drama of 'the chase' or the intense sorrow of 'the breakup.' But true love is often very quiet. It is the peace of sitting in a room together reading different books. It is the lack of anxiety when they are late. It is the shared look across a crowded room. Real love feels like coming home, not like winning a war. If your relationship is constant drama, it's not passion—it's instability. Peace is the highest indicator of a healthy union.",
        reflectionPrompt: "Think of a 'boring' moment in your relationship that actually felt incredibly peaceful. Why was that moment more valuable than a 'dramatic' one?",
        image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 17,
        title: "Love in the Real World",
        subtitle: "Survival in the Chaos",
        summary: "Work, money, distance, and family pressure.",
        content: "Love does not exist in a vacuum. It lives in the messy reality of bills, demanding bosses, and difficult in-laws. Real-world love is the ability to be a team when the world is throwing stones. It is the skill of talking about money without shame, and supporting each other's careers without jealousy. To survive the real world, a couple must have a 'unified front.' The world will try to pull you apart; your job is to use every external pressure to push yourselves closer together.",
        reflectionPrompt: "What external pressure (work, money, family) is currently putting the most strain on your relationship? How can you face it together as a team?",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 18,
        title: "Becoming the Partner You Want to Have",
        subtitle: "The Work of the Self",
        summary: "Self-awareness, healing, and emotional maturity.",
        content: "The best way to improve a relationship is to work on yourself. We often spend our time trying to 'fix' our partner, when we are the only person we have the power to change. Becoming a better partner means taking responsibility for your triggers, healing your childhood wounds, and learning how to regulate your own emotions. You cannot give what you do not have. If you want a partner who is kind, honest, and resilient, you must first become the living embodiment of those qualities.",
        reflectionPrompt: "What is one 'complaint' you have about your partner? Now, look in the mirror: how are you contributing to that dynamic?",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 19,
        title: "What a Real and True Relationship Feels Like",
        subtitle: "The Landscape of Peace",
        summary: "Peace, safety, growth, and deep companionship.",
        content: "At the end of the day, a true relationship feels like a deep, exhale. It is the one place in the world where you don't have to be 'on.' It is a partnership that challenges you to be better while loving you exactly as you are. It is a companionship that makes the good times better and the hard times bearable. When a relationship is real and true, it isn't just a part of your life—it is the stable ground upon which you build the rest of your life. It is the ultimate architecture of the human heart.",
        reflectionPrompt: "Close your eyes. If your relationship were a physical place—a beach, a forest, a home—what would it look like right now?",
        image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 20,
        title: "Final Letter to the Reader",
        subtitle: "The Journey Forward",
        summary: "A personal closing on the practice of love.",
        content: "You have walked through the 20 chambers of intimacy. You have looked at the truth, the work, and the beauty of real love. My final message to you is this: Love is not a mystery to be solved; it is a reality to be experienced. It is messy, it is difficult, and it is the most rewarding work you will ever do. Do not be afraid of the cracks. Do not be afraid of the work. Go forth and build something real. Build something true. Build something that lasts. The world is waiting for your heart to speak.",
        reflectionPrompt: "What is the one lesson from this journey that you will carry into your heart tomorrow? Write it as a promise to yourself.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
      }
    ]
  },
  {
    id: 'soul-architect',
    title: "The Architect of the Soul",
    subtitle: "Navigating Purpose and Resilience",
    author: "Mohamed Oublal",
    description: "A manual for inner strength, exploring the landscapes of solitude, ambition, and existential meaning.",
    coverImage: "https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&q=80&w=1200",
    accentColor: "indigo",
    systemPrompt: "You are a Philosophical Mentor focused on purpose and inner resilience. Core tenets: Solitude is strength, failure is data, purpose is a compass.",
    chapters: [
      {
        id: 1,
        title: "Awakening the Inner Compass",
        subtitle: "Discovering the First Spark",
        summary: "Listening to your soul’s quiet guidance amid the noise of the world.",
        content: "We often look for direction in maps drawn by others, forgetting that we carry a magnetic North within our own ribs. The inner compass does not scream; it whispers. It is the subtle pull toward certain books, certain people, and certain silences. Awakening this compass requires us to lower the volume of the world’s expectations so we can finally hear the frequency of our own truth. It is the moment you realize that your life is not a series of accidents, but a call waiting to be answered.",
        reflectionPrompt: "Close your eyes and listen. If your life were a direction, which way is your heart pulling you right now, away from everyone else's opinions?",
        image: "https://images.unsplash.com/photo-1527067829737-402993088e6b?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 2,
        title: "Understanding the Architecture of Self",
        subtitle: "The Blueprint of the Soul",
        summary: "How our thoughts, beliefs, and experiences shape our inner world.",
        content: "You are not just a tenant in your mind; you are its architect. Every thought you repeat becomes a brick. Every belief you hold becomes a load-bearing wall. Most of us live in houses built by our childhood traumas or societal pressures, never realizing we have the power to renovate. To understand your architecture is to walk through the rooms of your identity and ask: Who built this? Does this window still let in light? By mapping our internal blueprint, we begin to see where we are trapped and where we are free.",
        reflectionPrompt: "Walk through the 'rooms' of your mind. Which room is the darkest, and what new 'window' of belief could you install there today?",
        image: "https://images.unsplash.com/photo-1449156001437-3a1661dcda26?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 3,
        title: "Embracing the Unknown",
        subtitle: "The Threshold of Growth",
        summary: "Why stepping into uncertainty is essential for resilience.",
        content: "Growth and comfort are enemies that have never been seen in the same room. The unknown is the only place where something new can happen. We fear the fog not because it is dangerous, but because it hides our destination. Yet, resilience is forged in the mist. When we step into uncertainty, we are forced to develop a different kind of sight—a vision that relies on intuition rather than sight. The architect of the soul knows that the most beautiful structures are often built on ground that was once terrifyingly unfamiliar.",
        reflectionPrompt: "What is the one thing you are avoiding because you cannot see the ending? What would happen if you took one step into the fog anyway?",
        image: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 4,
        title: "The Power of Reflection",
        subtitle: "The Mirror of Wisdom",
        summary: "Learning from the past without being trapped by it.",
        content: "Reflection is the act of turning the flashlight inward. It is not rumination—which is a circular trap—but a linear progression toward understanding. To reflect is to look at your past self with the eyes of a compassionate stranger. We extract the lessons and leave the shame behind. A soul that does not reflect is like a builder who keeps making the same structural error in every house. Wisdom is simply the ability to see your own patterns before they see you.",
        reflectionPrompt: "Look back at your greatest 'failure' from last year. If it were a teacher instead of a ghost, what is the one sentence of advice it would give you?",
        image: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 5,
        title: "Identifying True Purpose",
        subtitle: "Authenticity vs. Expectation",
        summary: "Distinguishing between external pressure and authentic calling.",
        content: "Purpose is often confused with career, but it is actually a state of being. Your purpose is the intersection of your deepest hunger and the world's need. It is the thing you would do even if no one was watching. The world will try to hand you a script; your job is to burn it and speak from the gut. When your actions align with your essence, effort feels like energy. You are no longer pushing a boulder up a hill; you are the hill itself, solid and grounded in your reason for existing.",
        reflectionPrompt: "If money were no longer a currency and status was invisible, what would you spend your Tuesday afternoons doing?",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 6,
        title: "Overcoming Fear as a Guide",
        subtitle: "Fear as a Signal for Courage",
        summary: "Understanding fear not as an obstacle, but as a pointer toward growth.",
        content: "Fear is the soul's GPS. It points directly to the edge of your current self. We have been taught to run from it, but the architect knows that fear marks the spot where the next level of the foundation must be laid. If you are not afraid, you are likely repeating yourself. Courage is not the absence of fear, but the realization that something else is more important. When you feel that cold shiver of anxiety, do not turn back. It is a sign that you are approaching the border of who you were and the horizon of who you could be.",
        reflectionPrompt: "Name your biggest fear right now. If that fear were a doorway, what beautiful thing is waiting on the other side of it?",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 7,
        title: "The Discipline of Daily Growth",
        subtitle: "The Strength in Small Actions",
        summary: "How consistency builds the muscle of resilience.",
        content: "Great souls are not built in a day; they are built daily. Discipline is the highest form of self-love. It is the ability to choose your 'future self' over your 'current mood.' We often wait for a grand explosion of inspiration, but resilience is found in the quiet, boring habits. The morning meditation, the evening journal, the decision to speak kindly when you are tired—these are the small stones that eventually form a cathedral. Consistency is the glue that holds the architecture of the soul together when the storms of life arrive.",
        reflectionPrompt: "What is one tiny habit—taking less than 5 minutes—that you can commit to doing every single day to honor your soul?",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 8,
        title: "Healing the Soul’s Wounds",
        subtitle: "Transforming Pain into Fuel",
        summary: "Turning past scars into the source of your unique strength.",
        content: "Kintsugi is the Japanese art of repairing broken pottery with gold. The flaw is not hidden; it is highlighted. Our souls are the same. Our traumas, our heartbreaks, and our losses are the cracks through which our deepest light can finally shine. Healing is not about returning to who you were before the break; it is about becoming something more valuable because you were broken. Your pain is not a debt; it is an investment in your empathy, your depth, and your ultimate resilience.",
        reflectionPrompt: "Think of a 'crack' in your history. How has that specific experience made you more compassionate or stronger than you would have been without it?",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 9,
        title: "Resilience Through Adversity",
        subtitle: "The Carving of Strength",
        summary: "How challenges provide the clarity and endurance needed for destiny.",
        content: "The diamond does not complain about the pressure; the river does not apologize for the rocks. Adversity is the sculptor's chisel. Without the resistance of the world, we would remain soft and unformed. Every 'no' you receive, every door that closes, and every season of struggle is working to refine your character. Resilience is the ability to bounce back, but more importantly, it is the ability to 'bounce forward'—to use the force of the blow to propel yourself into a new way of being.",
        reflectionPrompt: "What current 'pressure' in your life is actually forcing you to become more clear about what you truly value?",
        image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 10,
        title: "Building Emotional Intelligence",
        subtitle: "The Foundation of Inner Stability",
        summary: "Mastering the weather of your internal world.",
        content: "To be the architect of your soul, you must first understand the climate of your heart. Emotions are like weather—they are real, but they are not the sky. Emotional intelligence is the ability to observe the storm without becoming the storm. It is the space between the feeling and the reaction. When we can name our emotions, we tame them. We learn that anger is often just grief in a mask, and that fear is often just excitement without breath. Stability comes from knowing that no matter how hard it rains inside, the foundation of your self remains unmoved.",
        reflectionPrompt: "What emotion have you been trying to 'evict' lately? What would happen if you sat down and had a conversation with it instead?",
        image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 11,
        title: "The Role of Silence and Solitude",
        subtitle: "The Clarity of the Quiet",
        summary: "Finding alignment in the moments when the world stops talking.",
        content: "Solitude is the furnace where the soul is forged. In silence, the noise of other people's expectations dies down, and the true voice of the self begins to echo. We often fear being alone because we fear who we might find there. But solitude is not loneliness; it is a homecoming. It is in the quiet moments that our best ideas are born, our deepest wounds are felt, and our true alignment is restored. The architect needs the drafting table of silence to see the blueprint clearly.",
        reflectionPrompt: "When was the last time you were truly alone—no phone, no music, no people? What did your soul try to say to you in that gap?",
        image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 12,
        title: "Cultivating Meaningful Connections",
        subtitle: "The Reflection of Purpose",
        summary: "How your relationships act as mirrors for your inner growth.",
        content: "No soul is an island. While our purpose is internal, it is reinforced and reflected by the people we choose to walk with. Meaningful connections are those that challenge our architecture while supporting our foundation. We should seek 'expansion partners'—people who make us feel larger, braver, and more authentic. If your relationships require you to shrink to fit, they are not connections; they are cages. A resilient soul knows how to set boundaries that protect the inner work while keeping the doors open for true intimacy.",
        reflectionPrompt: "Who in your life makes you feel like the best version of yourself? Who makes you feel like you have to hide your 'soul architecture'?",
        image: "https://images.unsplash.com/photo-1516589174184-c68526572af0?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 13,
        title: "The Art of Letting Go",
        subtitle: "Releasing the Weight",
        summary: "Why pruning is necessary for the soul to bloom.",
        content: "An architect knows when to tear down a wall that is no longer structural. Letting go is not an act of defeat; it is an act of space-making. We carry around old identities, dead relationships, and expired dreams like heavy furniture in a house we have outgrown. To evolve, we must be willing to release what we once thought we needed. Letting go is the radical trust that something new—and more aligned—is waiting to take that place. Your hands must be empty to receive the tools for your next building project.",
        reflectionPrompt: "What is one 'old piece of furniture' in your soul (a habit, a memory, or a role) that you are finally ready to carry out to the curb?",
        image: "https://images.unsplash.com/photo-1505506819641-ad0b97d31132?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 14,
        title: "Finding Joy in the Journey",
        subtitle: "Celebrating the Progress",
        summary: "Why the process is more important than the finished structure.",
        content: "We often think that joy is a reward we get only when the building is finished. But a soul is never finished. If you wait for the end to be happy, you will miss your life. Joy is the lubrication of resilience. It is the ability to find beauty in the scaffolding, the dust, and the unfinished rooms. Celebrating small victories is not a distraction from the work; it is the fuel for the work. A soul that knows how to play while it builds is a soul that can endure any delay.",
        reflectionPrompt: "What is one 'small stone' you laid today that you can be genuinely proud of, even if the whole cathedral isn't done yet?",
        image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 15,
        title: "Aligning Action with Vision",
        subtitle: "From Blueprint to Reality",
        summary: "Turning your inner truth into outer habits.",
        content: "Vision without action is just a daydream. Action without vision is a nightmare. Alignment is the bridge between the two. To be the architect of your life, you must ensure that your daily habits are in conversation with your long-term values. If you value peace but live in chaos, there is a structural misalignment. The most resilient people are those whose 'inside' and 'outside' match. When your feet move in the direction your soul is pointing, you become an unstoppable force of nature.",
        reflectionPrompt: "Look at your calendar for the last week. Do your time-logs reflect your soul's top three priorities? Where is the misalignment?",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 16,
        title: "Mastering Adaptability",
        subtitle: "The Strength of Flexibility",
        summary: "Why the most resilient structures are those that can bend.",
        content: "In an earthquake, the rigid building breaks; the flexible one survives. Adaptability is the highest form of intelligence. The world is unpredictable, and our plans will fail. Resilience is not about sticking to the original blueprint no matter what; it is about having the skill to redesign on the fly. When life changes the terrain, the architect changes the design. To master adaptability is to be fluid in your methods but solid in your principles.",
        reflectionPrompt: "Think of a plan that recently 'failed.' How can you redesign your approach right now to work with the new reality instead of fighting it?",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 17,
        title: "Anchoring in Values",
        subtitle: "The Unshakable Foundation",
        summary: "Letting your principles guide your hardest decisions.",
        content: "Values are the bedrock. When everything else is stripped away—your job, your health, your status—what remains? Those are your values. A soul anchored in virtue cannot be intimidated by circumstances. When you know what you stand for, you never have to wonder where to walk. Decisions become simpler because they are filtered through the question: Does this honor my foundation? An anchored soul is a lighthouse; it doesn't move to find the ships, it stays solid so the ships can find their way home.",
        reflectionPrompt: "What are your three 'non-negotiable' values? How did you defend or honor one of them this week?",
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 18,
        title: "The Courage to Create Your Narrative",
        subtitle: "Writing Your Own Story",
        summary: "Reclaiming the pen from your circumstances.",
        content: "You are the author of your history, not its victim. You cannot control what happens to you, but you have absolute power over the meaning you assign to it. Creating your narrative is the act of deciding that your struggles are 'origins' rather than 'endings.' When you take the pen back from your critics, your parents, or your past, you begin to write a story of triumph. A soul that owns its story can never be owned by its circumstances.",
        reflectionPrompt: "If you were writing a book about your life right now, what would this current difficult chapter be titled to reflect your future victory?",
        image: "https://images.unsplash.com/photo-1455391704245-027aeb7ef21e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 19,
        title: "Legacy of the Soul",
        subtitle: "The Ripple Effect",
        summary: "How your inner growth impacts the world around you.",
        content: "The building you are constructing is not just for you. Your resilience gives others permission to be strong; your purpose gives others permission to find theirs. We are all interconnected threads in a grand tapestry. Your growth is a gift to the collective. When you heal a wound, you heal a lineage. When you build a life of meaning, you leave a blueprint for those who come after. The architect of the soul builds for eternity, knowing that the echoes of their character will ring out long after they are gone.",
        reflectionPrompt: "What is the one quality you want people to feel when they are in your presence? How can you 'be' that quality today?",
        image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 20,
        title: "Becoming the Architect of Your Life",
        subtitle: "The Synthesis of Destiny",
        summary: "Uniting purpose, resilience, and reflection into a conscious life.",
        content: "You have walked through the landscapes of your soul. You have identified your compass, mapped your blueprint, and anchored your foundation. Now, the real work begins. To be the architect of your life is to live with intention. It is to stop reacting to the world and start creating it. You are no longer a passenger in your own existence. You are the designer, the builder, and the resident of a life that is uniquely, powerfully, and beautifully yours. Go forth and build something that only you could build.",
        reflectionPrompt: "The library doors are closing for now, but your journey is just beginning. What is the very first 'brick' you will lay tomorrow morning to design your destiny?",
        image: "https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&q=80&w=1200"
      }
    ]
  },
  {
    id: 'mindful-living',
    title: "The Art of Mindful Living",
    subtitle: "Presence, Peace, and the Power of Now",
    author: "Mohamed Oublal",
    description: "A gentle guide to cultivating awareness, finding peace in the present moment, and transforming daily life through conscious attention.",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200",
    accentColor: "emerald",
    systemPrompt: "You are a Mindfulness Guide. Core tenets: The present moment is all we have, awareness transforms suffering, peace is found within.",
    chapters: [
      {
        id: 1,
        title: "The Gateway to Presence",
        subtitle: "An Introduction to Mindful Awareness",
        summary: "Discovering the radical simplicity of being fully here, fully now.",
        content: "We spend our entire lives rehearsing for a future that never arrives or replaying a past that no longer exists, and in doing so, we miss the only moment that is ever truly ours. Presence is not a skill to be mastered; it is a homecoming. It is the quiet realization that you have been searching for peace in every corner of the world, only to discover it was waiting for you in the still center of your own breath. Mindfulness begins with a single, revolutionary act: the decision to stop running and simply be where you are. The gateway has always been open. You need only walk through.",
        reflectionPrompt: "When was the last time you were fully present without planning, worrying, or remembering? What did that moment feel like in your body?",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 2,
        title: "The Breath as an Anchor",
        subtitle: "Finding Center in the Inhale and Exhale",
        summary: "Using the breath as a bridge between chaos and calm.",
        content: "The breath is the oldest prayer, the most ancient rhythm. It was with you before your first word and will outlast your last thought. In a world that demands your attention in a thousand directions, the breath is the one thread that always leads you back to yourself. It does not judge, it does not rush, it does not ask for anything in return. When the mind scatters like leaves in a storm, the breath is the trunk of the tree that remains. To breathe consciously is to declare a quiet rebellion against the tyranny of distraction. One inhale, one exhale, one moment of arriving home.",
        reflectionPrompt: "Pause right now and take three slow, deliberate breaths. What shifts in your body or mind when you give your full attention to breathing?",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 3,
        title: "The Wandering Mind",
        subtitle: "Understanding the Nature of Mental Chatter",
        summary: "Learning to observe thoughts without becoming their prisoner.",
        content: "The mind is a brilliant storyteller, weaving narratives of catastrophe and triumph from the thinnest threads of reality. It chatters endlessly, not because it is broken, but because that is its nature. The problem is not that your mind wanders; the problem is that you believe you are your wandering mind. Mindfulness does not ask you to silence the noise. It asks you to sit beside it, like a patient elder watching children play. When you observe a thought without grabbing it, something miraculous happens: you discover a space between you and your thinking, and in that space lives your freedom.",
        reflectionPrompt: "For one minute, close your eyes and count how many separate thoughts arise. What did you notice about the nature of your mental chatter?",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 4,
        title: "The Art of Deep Listening",
        subtitle: "Truly Hearing Others and Yourself",
        summary: "Transforming conversations through the gift of undivided attention.",
        content: "We have forgotten how to listen. We hear words while composing our response. We nod while our minds are miles away. Deep listening is an act of generosity so rare that it borders on the sacred. To truly hear another person is to set down your own story long enough to enter theirs. It is the willingness to be changed by what you hear. And yet the deepest listening begins within. When was the last time you sat in silence and listened to the quiet voice beneath your thoughts, the one that knows what you need before your mind can articulate it? That voice is always speaking. The question is whether you are present enough to hear.",
        reflectionPrompt: "In your next conversation, try to listen without planning your response. What do you notice when you give someone your complete, undivided attention?",
        image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 5,
        title: "Mindful Eating",
        subtitle: "Bringing Awareness to Nourishment",
        summary: "Rediscovering the sacred ritual hidden inside every meal.",
        content: "We eat the way we live: fast, distracted, and hungry for the next thing before we have finished the first. Mindful eating is a mirror for the way we move through the world. When you slow down enough to taste the sweetness of a single grape, you are practicing the art of savoring life itself. Every meal is a small miracle of sun, soil, water, and human labor arriving on your plate. To eat with awareness is to honor that chain of being. It is to feel the warmth of the bread, to notice the texture, the color, the silence between bites. In this way, a simple meal becomes a meditation, and nourishment becomes communion.",
        reflectionPrompt: "At your next meal, put down your phone and eat the first three bites in total silence. What flavors or sensations do you notice that you usually miss?",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 6,
        title: "Walking Meditation",
        subtitle: "Finding Stillness in Movement",
        summary: "Turning every step into a prayer of presence.",
        content: "We walk to get somewhere, always leaning forward into the future. Walking meditation invites us to arrive with every step. It is the practice of feeling the earth rise to meet your foot, of noticing the subtle symphony of muscles and tendons that carry you through the world. You are not walking to reach a destination; you are walking to be alive. Each step is a small declaration: I am here. I am now. I am enough. When you walk slowly, deliberately, with nowhere to go and nothing to accomplish, you discover that the journey and the destination were never separate. The path is the point.",
        reflectionPrompt: "Take a short walk today with no destination in mind. How does your experience change when you focus on each individual step rather than where you are going?",
        image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 7,
        title: "The Body Scan",
        subtitle: "Reconnecting with Physical Sensation",
        summary: "Learning to inhabit the body you have been living above.",
        content: "Most of us live from the neck up, trapped in the echo chamber of thought while the body carries on below, unheard and unattended. The body scan is an act of radical reunion. It is the practice of moving your attention slowly from the crown of your head to the tips of your toes, listening to the quiet language of sensation. A tightness in the jaw, a warmth in the chest, a heaviness in the shoulders. These are not just physical phenomena; they are messages from a deeper intelligence. Your body has been keeping score of every emotion you have ignored. To scan the body is to finally read the letter it has been writing you for years.",
        reflectionPrompt: "Right now, close your eyes and notice where you hold tension in your body. What emotion might that tension be holding on your behalf?",
        image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 8,
        title: "Letting Go of Judgment",
        subtitle: "Practicing Non-Judgmental Awareness",
        summary: "Seeing the world as it is, rather than as you label it.",
        content: "The mind is a labeling machine. Good, bad, right, wrong, ugly, beautiful. Before we have fully perceived a thing, we have already filed it into a category. Judgment is the invisible wall between ourselves and reality. When we practice non-judgmental awareness, we begin to see the world with fresh eyes, like a traveler in a country with no name for the color of the sky. We stop deciding whether the rain is an inconvenience or a blessing and simply feel the water on our skin. This is not passivity; it is the deepest form of engagement. To suspend judgment is to give reality permission to be exactly what it is, and in that acceptance, we find a peace that no opinion can provide.",
        reflectionPrompt: "Notice a judgment you make today about yourself, another person, or a situation. What happens when you consciously set that judgment aside and simply observe?",
        image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 9,
        title: "The Power of Pausing",
        subtitle: "Creating Space Before Reacting",
        summary: "Discovering the freedom that lives in the gap between stimulus and response.",
        content: "Between the lightning of an event and the thunder of our reaction, there is a sliver of silence. Most of us never find it because we have been trained to respond instantly, to be efficient, to never waste a second. But in that tiny pause lives your entire freedom. The pause is not hesitation; it is wisdom gathering itself. It is the moment where you choose to respond from your deepest values rather than your oldest wounds. A mindful pause can save a relationship, transform a conflict, or redirect the entire trajectory of your day. The world will not fall apart if you take one breath before you speak. In fact, it is more likely to hold together.",
        reflectionPrompt: "Think of a recent situation where you reacted immediately. What might have changed if you had paused for three breaths before responding?",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 10,
        title: "Mindfulness in Relationships",
        subtitle: "Being Fully Present with Others",
        summary: "Transforming every encounter into an act of genuine connection.",
        content: "The greatest gift you can give another human being is your undistracted presence. In a world where everyone is half-listening, half-looking, half-here, full attention is an act of love so profound it can heal wounds that words cannot reach. Mindfulness in relationships means noticing the subtle shift in your partner's voice, the micro-expression that passes like a cloud across a face, the silence that speaks louder than any sentence. It is the practice of seeing the person in front of you as they are in this moment, not as the story you have written about them. When two people are truly present with each other, the ordinary space between them becomes sacred ground.",
        reflectionPrompt: "Who in your life most deserves your undivided attention right now? What would it mean to them if you were fully, completely present in your next interaction?",
        image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 11,
        title: "Digital Mindfulness",
        subtitle: "Reclaiming Attention from Screens",
        summary: "Finding sovereignty in an age designed to steal your presence.",
        content: "Our attention has become the most harvested resource on the planet. Every notification, every scroll, every ping is a small theft from the treasury of your presence. We have outsourced our boredom, our silence, and our solitude to glowing rectangles that promise connection but often deliver only its shadow. Digital mindfulness is the quiet reclamation of your most precious asset: your awareness. It is the radical act of putting the phone down and looking at the sky, of choosing the imperfect texture of a real conversation over the curated performance of a digital one. Your life is not happening on a screen. It is happening in the space your screen is distracting you from.",
        reflectionPrompt: "Track your screen time today. How many of those minutes were intentional, and how many were unconscious habit? What could you reclaim that time for?",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 12,
        title: "The Practice of Non-Attachment",
        subtitle: "Holding Life Loosely",
        summary: "Learning to love deeply without clinging desperately.",
        content: "Non-attachment is perhaps the most misunderstood teaching in all of contemplative wisdom. It does not mean not caring. It means caring deeply without demanding that life conform to your preferences. It is the art of holding everything, your relationships, your ambitions, your very identity, with open palms rather than clenched fists. A flower held loosely can breathe and bloom. A flower crushed in a tight grip will wither and die. Non-attachment is the understanding that everything in life is borrowed, every moment, every breath, every person. When we accept this impermanence, we do not love less; we love more completely, because we finally understand the preciousness of what we have been given.",
        reflectionPrompt: "What in your life are you gripping too tightly? What might blossom if you loosened your hold and trusted the process of life?",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 13,
        title: "Compassion as a Practice",
        subtitle: "Extending Kindness to Self and Others",
        summary: "Awakening the heart's natural capacity for tenderness.",
        content: "Compassion is not a feeling that descends upon the lucky or the saintly. It is a practice, as deliberate as breathing, as trainable as a muscle. It begins where all true revolutions begin: with the self. We are often our own harshest critics, speaking to ourselves in tones we would never use with a stranger. Mindful compassion asks you to place your hand over your own heart and whisper the words you have been waiting to hear. From this wellspring of self-tenderness, compassion naturally flows outward. When you have learned to be gentle with your own suffering, you develop an almost effortless capacity to sit with the suffering of others without looking away.",
        reflectionPrompt: "What is one thing you would say to comfort a dear friend going through your current struggle? Now say that exact thing to yourself. How does it feel?",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 14,
        title: "Mindful Communication",
        subtitle: "Speaking and Listening with Awareness",
        summary: "Transforming the way you use words into a practice of presence.",
        content: "Words are living things. They can build cathedrals of trust or demolish years of connection in a single sentence. Mindful communication is the practice of pausing before you speak to ask three ancient questions: Is it true? Is it necessary? Is it kind? When we speak from a place of awareness rather than reactivity, our words become bridges rather than walls. And mindful communication is not only about speaking; it is about the quality of the silence between words. It is the patience to let another person finish their thought, the humility to admit you do not understand, and the courage to say what is real even when your voice trembles.",
        reflectionPrompt: "Before your next important conversation, pause and ask: Am I about to speak from awareness or from habit? What truth am I afraid to express kindly?",
        image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 15,
        title: "The Sacred Ordinary",
        subtitle: "Finding Wonder in Daily Routine",
        summary: "Recognizing the extraordinary miracle hidden in the mundane.",
        content: "We spend our lives waiting for the extraordinary, the vacation, the promotion, the perfect sunset, while the ordinary sits at our feet, unnoticed and unloved. Mindfulness reveals that nothing is ordinary. The steam rising from your morning coffee is a small weather system. The sound of rain on a window is a symphony performed for an audience of one. The act of washing your hands is a baptism available a dozen times a day. When awareness is present, the mundane dissolves and what remains is pure wonder. The sacred does not live in temples and mountain peaks. It lives in the kitchen, in the commute, in the space between your heartbeats. You have only to open your eyes to see it.",
        reflectionPrompt: "Choose one 'ordinary' task today, washing dishes, making your bed, or pouring water, and do it as if it were a sacred ritual. What beauty do you find?",
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 16,
        title: "Dealing with Difficult Emotions Mindfully",
        subtitle: "The Alchemy of Awareness",
        summary: "Turning toward pain with presence instead of running from it with distraction.",
        content: "We are taught to avoid pain, to distract, to numb, to fix. But mindfulness offers a different path: turning toward the difficult emotion with the same gentle attention you would offer a frightened child. When anger arises, you do not become anger; you hold it. When grief floods in, you do not drown; you become the shore. Difficult emotions are not enemies to be defeated; they are messengers carrying vital information about your needs and your wounds. When you sit with sorrow without trying to make it leave, something alchemical happens. The emotion moves through you like weather, and when it passes, you discover that you are still here, perhaps more spacious, more tender, more alive than before.",
        reflectionPrompt: "What difficult emotion have you been avoiding? What might it be trying to tell you if you sat with it for just five minutes without judgment?",
        image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 17,
        title: "The Mindful Morning",
        subtitle: "Starting Each Day with Intention",
        summary: "Reclaiming the first hours of the day as a foundation for conscious living.",
        content: "The way you begin your morning is a prophecy for the rest of your day. Most of us wake into urgency, reaching for the phone before we have taken a conscious breath, letting the world's demands flood in before we have even felt our feet on the floor. A mindful morning is an act of gentle resistance. It is the practice of waking slowly, of feeling the transition from sleep to wakefulness with curiosity rather than dread. It is the commitment to sit for even one minute in silence before the noise begins. When you start your day from a place of stillness, you carry that stillness with you like a lantern into every room you enter.",
        reflectionPrompt: "Tomorrow morning, before reaching for your phone, take five slow breaths and set one simple intention for the day. How does beginning this way change your first hour?",
        image: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 18,
        title: "Nature as Teacher",
        subtitle: "Learning Presence from the Natural World",
        summary: "Discovering that the greatest mindfulness instructor has been outside your window all along.",
        content: "A tree does not hurry, yet everything is accomplished. A river does not resist the rocks in its path; it flows around them and, in time, smooths them into beauty. Nature is the original mindfulness teacher, endlessly patient, endlessly present. When you step into a forest, you step out of the frantic narrative of your life and into a deeper, slower rhythm. The birds do not sing to be productive; the flowers do not bloom for an audience. They simply are. To sit in nature is to remember what your body already knows: that you too are a natural thing, subject to seasons, rooted in earth, designed for moments of sun and moments of storm. In nature, you remember how to simply be.",
        reflectionPrompt: "Spend ten minutes outside today without any purpose. Simply observe. What does nature model for you about patience, presence, or letting go?",
        image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 19,
        title: "The Art of Doing Nothing",
        subtitle: "Embracing Stillness and Rest",
        summary: "Reclaiming the lost art of being rather than doing.",
        content: "In a culture that worships productivity, doing nothing is the most radical act of all. We have been conditioned to fill every gap with activity, every silence with noise, every stillness with motion. But rest is not the absence of work; it is the presence of peace. When you allow yourself to simply sit, with no agenda, no goal, no screen, you are not wasting time. You are composting the rich soil from which your deepest creativity and wisdom will grow. Doing nothing is not laziness. It is the art of allowing yourself to be held by the moment without needing to shape it. In stillness, the soul catches up with the body it has been chasing all day.",
        reflectionPrompt: "Can you sit for five minutes today doing absolutely nothing, no phone, no reading, no planning? What arises in the stillness, and what does it reveal about your relationship with rest?",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 20,
        title: "Living the Mindful Life",
        subtitle: "Integration and the Journey Forward",
        summary: "A closing letter on carrying presence into every corner of your existence.",
        content: "You have walked through twenty doorways of awareness. You have learned to breathe, to pause, to listen, to feel, and to be. But mindfulness is not a book to be finished; it is a life to be lived. The practice does not end when you close these pages. It begins again with your next breath, your next step, your next encounter with the beautiful, impermanent world. Do not strive for perfection in your practice. Strive for presence. There will be days when you forget, when you rush, when you fall back into the old trance of busyness. That is not failure; that is being human. The moment you notice you have drifted is the moment you have already returned. Go gently into your life. Carry this awareness like a quiet flame. The present moment is waiting for you, and it always will be.",
        reflectionPrompt: "What is the one practice from this journey that resonated most deeply with your soul? Write yourself a promise to carry it forward, one breath at a time.",
        image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=1200"
      }
    ]
  },
  {
    id: 'modern-stoic',
    title: "The Modern Stoic",
    subtitle: "Mastery of the Internal World",
    author: "Mohamed Oublal",
    description: "Timeless wisdom applied to 21st-century chaos. Lessons on emotional regulation and radical acceptance.",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200",
    accentColor: "stone",
    systemPrompt: "You are a Stoic Guide. Core tenets: Control what you can, accept what you cannot, virtue is the highest good.",
    chapters: [
      {
        id: 1,
        title: "The Dichotomy of Control",
        subtitle: "Saving Your Energy",
        summary: "How to stop wasting spirit on things outside your influence.",
        content: "Most of human suffering comes from trying to control the uncontrollable: the weather, the traffic, other people's opinions, and the past. A stoic divides the world into two baskets. In one basket are the things we control: our thoughts, our actions, and our own character. In the other is everything else. Freedom begins the moment you stop trying to fix the basket you don't own. Peace is not found in a perfect world, but in a mind that is clear about where its power ends.",
        reflectionPrompt: "List three things stressing you out. Which one is actually in your basket of control? What would happen if you let the others go?",
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 2,
        title: "Accepting What Cannot Be Changed",
        subtitle: "The Grace of Surrender",
        summary: "Finding liberation in the act of radical acceptance.",
        content: "There is a kind of courage that looks like stillness. It is the courage to stop fighting the river and let it carry you. Acceptance is not resignation—it is the refusal to waste your one life arguing with reality. The Stoics understood that the universe does not negotiate. The rain does not care about your picnic. When we accept what is, we do not become passive; we become precise. Our energy, once scattered across a thousand impossible battles, gathers into a single focused beam aimed at the only thing we can shape: our response. This is where true power lives—not in conquest, but in consent to what already is.",
        reflectionPrompt: "What reality in your life are you still arguing with? What would it feel like to lay that argument down, just for today?",
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 3,
        title: "The Art of Negative Visualization",
        subtitle: "Premeditatio Malorum",
        summary: "How imagining loss deepens gratitude and prepares the spirit.",
        content: "The ancient Stoics practiced a strange discipline: they would sit in silence and imagine losing everything they loved. Not to invite despair, but to inoculate against it. This is premeditatio malorum—the premeditation of adversity. When you picture the empty chair, the lost job, the fading health, something alchemical happens. The ordinary afternoon becomes extraordinary. The coffee in your hand becomes a gift. The voice on the phone becomes a treasure. By rehearsing loss in the theater of the mind, we do not darken our days—we illuminate them. We learn to hold everything with open hands, grateful for each moment the wind does not take it away.",
        reflectionPrompt: "Imagine one thing you love deeply was gone tomorrow. How does that thought change the way you experience it right now?",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 4,
        title: "Memento Mori",
        subtitle: "Living with Awareness of Death",
        summary: "How the remembrance of mortality sharpens the blade of living.",
        content: "You will die. Not as a punishment, but as a fact—as natural as the turning of seasons. The Stoics kept skulls on their desks, not out of morbidity, but out of clarity. Memento mori is the whisper that cuts through the noise of trivial anxieties: remember, you are mortal. When death sits at the table, petty grudges lose their appetite. Procrastination starves. The things that truly matter rise to the surface like cream. We do not meditate on death to become grim, but to become urgent. To live as though this day has weight. Because it does. Because it might be the last one you are given.",
        reflectionPrompt: "If you knew you had one year left, what would you stop doing immediately? What would you finally begin?",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 5,
        title: "Turning Obstacles into Advantages",
        subtitle: "The Alchemy of Adversity",
        summary: "Why what stands in the way becomes the way.",
        content: "Marcus Aurelius wrote that the impediment to action advances action. What stands in the way becomes the way. This is not optimism—it is engineering. The Stoic does not pretend the wall is not there. Instead, they study it, press their hands against it, and ask: what can this wall teach me? What muscle does climbing it build? Every obstacle carries a hidden curriculum. The rejection teaches resilience. The failure teaches humility. The betrayal teaches discernment. When we stop seeing hardship as interruption and start seeing it as instruction, we become students of life rather than its victims. The obstacle is not your enemy. It is your most honest teacher.",
        reflectionPrompt: "What is the biggest obstacle in your life right now? What skill or strength is it secretly forcing you to develop?",
        image: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 6,
        title: "The Inner Citadel",
        subtitle: "Protecting Your Mind",
        summary: "Building an unassailable fortress within your own consciousness.",
        content: "The Stoics spoke of an inner citadel—a fortress within the mind that no external force can breach. Empires crumble, markets crash, and lovers leave, but the citadel stands. It is built not of stone but of principle. Its walls are made of your chosen values; its moat is your practiced indifference to what does not matter. In the modern world, the siege comes daily: the outrage cycle, the comparison trap, the infinite scroll of other people's curated lives. The inner citadel is your refusal to let the noise breach the gate. It is the quiet room within you where reason still sits on the throne, undisturbed by the riot outside.",
        reflectionPrompt: "What breached your inner peace most recently? What principle could you reinforce to prevent that breach next time?",
        image: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 7,
        title: "Desire vs. Need",
        subtitle: "Simplifying Your Life",
        summary: "How wanting less becomes the ultimate form of wealth.",
        content: "Seneca warned that it is not the man who has too little who is poor, but the man who craves more. Desire is an engine without brakes—it accelerates past every milestone, never satisfied, always hungry. The Stoic practice of simplicity is not about deprivation; it is about sovereignty. When you distinguish between what you need and what you merely want, you discover that freedom lives in the gap. The fewer things you require for your peace, the fewer chains the world can bind you with. A simple life is not an empty life. It is a life with room—room to think, to breathe, to notice the extraordinary beauty hiding inside the ordinary.",
        reflectionPrompt: "Look around your life. What are you chasing that you do not actually need? What would you gain by releasing that pursuit?",
        image: "https://images.unsplash.com/photo-1527067829737-402993088e6b?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 8,
        title: "The Practice of Daily Reflection",
        subtitle: "The Evening Audit of the Soul",
        summary: "How nightly self-examination builds wisdom over a lifetime.",
        content: "Each evening, the Stoic sat with the day as one sits with a dying fire—watching, reviewing, extracting warmth and wisdom from the embers. Seneca asked himself three questions every night: What bad habit did I cure today? What virtue did I practice? Where can I improve? This is not guilt; it is gardening. You are pulling weeds before they take root and watering the flowers you planted in the morning. The unexamined life is not only not worth living—it is not truly lived at all. Reflection transforms experience into education. Without it, we repeat the same year thirty times and call it a life. With it, each day becomes a new draft of a wiser self.",
        reflectionPrompt: "Before you sleep tonight, answer honestly: Where did I act according to my values today, and where did I betray them?",
        image: "https://images.unsplash.com/photo-1449156001437-3a1661dcda26?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 9,
        title: "Emotional Detachment Without Coldness",
        subtitle: "The Warm Distance",
        summary: "How to feel deeply without being destroyed by your feelings.",
        content: "Stoicism is often mistaken for emotional suppression—a philosophy of stone-faced endurance. But this is a misreading. The Stoic feels everything; they simply refuse to be governed by it. Emotional detachment is not the absence of feeling; it is the presence of a witness. You observe the anger rise without becoming the anger. You watch the grief swell without drowning in it. This is the warm distance: close enough to feel, far enough to choose. The Stoic heart is not cold; it is disciplined. It loves fiercely, mourns deeply, and celebrates fully—but it never hands the steering wheel to any emotion that arrives uninvited at the door.",
        reflectionPrompt: "Think of a recent moment when emotion made your decision for you. What would the 'witnessing' version of you have chosen instead?",
        image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 10,
        title: "The Stoic Response to Anger",
        subtitle: "Mastering the Fire Within",
        summary: "Why anger is a confession of unmet expectations and how to dissolve it.",
        content: "Anger is a confession. It tells you that reality violated a story you were telling yourself. Seneca called anger a brief madness—a fire that burns the vessel that carries it long before it reaches its target. The Stoic does not deny anger; they interrogate it. What expectation was broken? Was that expectation reasonable? Was it even mine, or was it inherited? When we trace anger to its root, we often find not injustice but surprise—the shock of a world that did not perform according to our private script. The antidote is not suppression but revision: rewrite the script to include the possibility that things will not go your way. Then watch the anger lose its fuel.",
        reflectionPrompt: "What was the last thing that made you truly angry? Beneath that anger, what expectation was hiding—and was it fair to hold?",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 11,
        title: "Finding Virtue in Adversity",
        subtitle: "The Forge of Character",
        summary: "How suffering, rightly met, produces the highest human qualities.",
        content: "Virtue is not forged in comfort. It is hammered into shape on the anvil of adversity. Courage cannot exist without danger. Patience cannot exist without delay. Compassion cannot exist without suffering. The Stoics understood that hardship is not a flaw in the design of life—it is the design. Every difficult season is an invitation to practice the very qualities that make a human being admirable. When the storm arrives, do not ask 'why me?' Ask 'what virtue is this moment calling me to embody?' In the answer, you will find not only your strength, but your purpose. The fire that threatens to destroy you is the same fire that refines you.",
        reflectionPrompt: "What is the hardest thing you are currently enduring? What virtue—patience, courage, humility—is it asking you to practice?",
        image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 12,
        title: "The Power of Present Moment Awareness",
        subtitle: "The Only Moment That Exists",
        summary: "How anchoring in the now dissolves anxiety and regret.",
        content: "The past is a ghost. The future is a phantom. Only this moment—this breath, this heartbeat, this word—is real. And yet, we spend most of our lives living in a time zone that does not exist: replaying yesterday's failures or rehearsing tomorrow's fears. The Stoic brings the mind home to the present, not as a meditation technique, but as a philosophical commitment. Marcus Aurelius reminded himself that he could only lose the present moment, because it was the only thing he ever truly had. When you anchor your attention here—fully here—the weight of imagined burdens falls away. You discover that right now, in this exact instant, you are enough, and life is enough.",
        reflectionPrompt: "Right now, in this very moment, what is actually wrong—not in your imagination, but in the physical reality around you?",
        image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 13,
        title: "Amor Fati",
        subtitle: "Loving Your Fate",
        summary: "The radical act of embracing everything that happens as necessary and good.",
        content: "Amor fati—love of fate—is the Stoic's most audacious stance. It goes beyond acceptance. It says: I do not merely tolerate what happens to me; I embrace it. I love it. Not because everything is pleasant, but because everything is mine. The illness, the heartbreak, the failed venture—these are not interruptions to your story. They are your story. When Nietzsche later revived this idea, he asked: could you live your life exactly as it has been, infinite times, and still say yes? The Stoic says yes. Not out of masochism, but out of a deep understanding that every thread—dark and bright—is necessary to weave the tapestry of who you are becoming.",
        reflectionPrompt: "Think of the most painful chapter of your life. Can you find one way in which it was essential to who you are today?",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 14,
        title: "Building Mental Toughness",
        subtitle: "The Tempered Mind",
        summary: "How deliberate practice of discomfort creates an unshakable inner core.",
        content: "Mental toughness is not born; it is built—one uncomfortable decision at a time. The Stoics deliberately practiced hardship: cold baths, fasting, sleeping on hard ground. Not because they enjoyed suffering, but because they understood that comfort, unchecked, becomes a cage. When you regularly touch the edge of your discomfort, you expand the territory of your composure. The tough mind is not rigid; it is elastic. It stretches under pressure and returns to its shape. In a world that sells ease as the highest good, the Stoic knows better: the muscle of resilience only grows under resistance. Train it in the calm, and it will serve you in the storm.",
        reflectionPrompt: "When was the last time you deliberately chose the harder path? What did that choice teach you about your own capacity?",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 15,
        title: "The Stoic Approach to Relationships",
        subtitle: "Loving Without Clinging",
        summary: "How to hold people close without gripping them so tightly you crush the bond.",
        content: "Epictetus offered a stunning piece of advice: when you kiss your child goodnight, whisper to yourself, 'Tomorrow you may be gone.' This is not cruelty—it is the deepest form of love. The Stoic loves fully, but holds loosely. They understand that people are not possessions; they are guests. Every relationship is a loan from the universe, not a deed of ownership. When we cling, we suffocate. When we control, we corrupt. The Stoic loves with an open hand—giving freely, receiving gratefully, and releasing gracefully. This does not make love smaller; it makes it infinite. For love without attachment is love without fear, and love without fear is the purest thing the human heart can offer.",
        reflectionPrompt: "In which relationship are you gripping too tightly out of fear? What would it look like to love that person with an open hand?",
        image: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 16,
        title: "Freedom Through Voluntary Discomfort",
        subtitle: "The Chains You Choose to Break",
        summary: "How practicing hardship by choice makes you free from hardship by chance.",
        content: "The modern world is an empire of convenience. Every friction has been engineered away—same-day delivery, instant entertainment, temperature-controlled everything. But convenience has a cost: it makes us fragile. The Stoic volunteers for discomfort—not as punishment, but as inoculation. Skip a meal. Take the cold shower. Walk when you could drive. Sleep without the pillow. Each small act of voluntary hardship whispers to the soul: you do not need as much as you think. And in that whisper lies liberation. The person who has practiced going without is the person who can never truly be deprived. Freedom is not having everything; it is needing nothing.",
        reflectionPrompt: "What comfort have you become so dependent on that losing it would genuinely frighten you? Can you practice going without it this week?",
        image: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 17,
        title: "Wisdom in the Age of Information",
        subtitle: "Signal and Noise",
        summary: "How to cultivate true understanding in a world drowning in data.",
        content: "We live in the most informed era in human history, yet wisdom has never felt more scarce. Information is not knowledge. Knowledge is not understanding. Understanding is not wisdom. The Stoic does not hoard facts; they distill principles. In a world of infinite scroll, the wisest act is to stop scrolling. To sit with one idea long enough for it to take root rather than consuming a thousand ideas that blow through like wind. Seneca warned against this very trap two thousand years ago: we read so much that we have no time to think. The modern Stoic guards their attention like a sacred resource, knowing that the mind fed on noise will starve for clarity.",
        reflectionPrompt: "How much of what you consumed today—news, social media, content—actually made you wiser? What could you cut to make room for deeper thought?",
        image: "https://images.unsplash.com/photo-1527067829737-402993088e6b?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 18,
        title: "The Stoic Practice of Gratitude",
        subtitle: "Wealth of the Attentive Heart",
        summary: "How deliberate thankfulness transforms perception and dissolves dissatisfaction.",
        content: "Gratitude is not a feeling that arrives on its own—it is a discipline you practice until it becomes a lens through which you see the world. The Stoic does not wait to feel grateful; they choose to notice what is already abundant. The functioning body. The meal on the table. The friend who answered the call. These are not small things—they are everything. Epictetus, a former slave, found gratitude in his own breathing. If a man in chains can be thankful, what excuse do the rest of us carry? Gratitude does not ignore pain; it exists alongside it, reminding us that even in the darkest room, there is a crack where light enters. The practice is simple: each morning, name what you have before you name what you lack.",
        reflectionPrompt: "Name three things you completely take for granted. Now imagine they were taken from you—and then given back. How does that change their value?",
        image: "https://images.unsplash.com/photo-1449156001437-3a1661dcda26?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 19,
        title: "Living According to Nature",
        subtitle: "The Original Instruction",
        summary: "How aligning with your rational nature and the natural order brings harmony.",
        content: "The Stoics believed the highest aim of life was to live according to nature—both the nature of the universe and the nature of the human being. For us, that nature is reason. We are not meant to live as animals chasing every impulse, nor as machines grinding through obligation. We are meant to live as rational, social, purposeful creatures. To live according to nature is to honor your capacity for thought, your need for community, and your longing for meaning. It is to stop forcing yourself into shapes designed by others and to return to the original architecture of your being. The tree does not try to be a river. It simply grows upward, toward the light, following the blueprint written in its seed.",
        reflectionPrompt: "Where in your life are you living against your own nature—forcing yourself into a shape that does not fit? What would alignment look like?",
        image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=1200"
      },
      {
        id: 20,
        title: "The Integrated Stoic Life",
        subtitle: "A Closing Letter to the Reader",
        summary: "Weaving every lesson into a single, lived philosophy.",
        content: "Dear reader, you have walked through the corridors of Stoic thought—from the dichotomy of control to the love of fate, from the awareness of death to the discipline of gratitude. These are not separate lessons. They are threads of a single rope. The integrated Stoic life is one where acceptance and action coexist, where detachment and love are not opposites but partners, where discomfort is chosen and the present moment is cherished. You will not master this philosophy in a day, or a year, or perhaps even a lifetime. But mastery was never the point. The practice is the point. Each morning you wake and choose to meet reality with clarity, courage, and compassion, you are living the philosophy. Go gently. Go wisely. The internal world is yours to govern, and you are, at last, ready to rule.",
        reflectionPrompt: "If you could carry only one lesson from this journey into the rest of your life, which would it be—and how will you practice it tomorrow?",
        image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1200"
      }
    ]
  }
];
