
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
      }
    ]
  }
];
