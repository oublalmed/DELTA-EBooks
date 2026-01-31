/**
 * Internationalization (i18n) Translations
 * 
 * Supported languages: English (en), French (fr)
 * 
 * Usage:
 * import { translations } from './i18n';
 * const t = translations[language];
 * console.log(t.common.save); // "Save" or "Enregistrer"
 */

export type Language = 'en' | 'fr';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    search: string;
    filter: string;
    sort: string;
    all: string;
    none: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    more: string;
    less: string;
    view: string;
    download: string;
    export: string;
    import: string;
    refresh: string;
    retry: string;
    submit: string;
    send: string;
    reply: string;
    share: string;
    copy: string;
    paste: string;
    select: string;
    clear: string;
    reset: string;
    apply: string;
    update: string;
    create: string;
    add: string;
    remove: string;
    settings: string;
    profile: string;
    logout: string;
    login: string;
    register: string;
    email: string;
    password: string;
    name: string;
    language: string;
    theme: string;
    light: string;
    dark: string;
    sepia: string;
    english: string;
    french: string;
  };
  auth: {
    welcome_back: string;
    create_account: string;
    sign_in: string;
    sign_up: string;
    sign_out: string;
    forgot_password: string;
    reset_password: string;
    enter_email: string;
    enter_password: string;
    enter_name: string;
    confirm_password: string;
    password_min_length: string;
    passwords_dont_match: string;
    invalid_credentials: string;
    account_exists: string;
    account_created: string;
    reset_link_sent: string;
    password_updated: string;
    continue_with_google: string;
    or_continue_with_email: string;
    dont_have_account: string;
    already_have_account: string;
    enter_reset_code: string;
    new_password: string;
  };
  shelf: {
    title: string;
    library: string;
    total_books: string;
    books_unlocked: string;
    reading_streak: string;
    current_streak: string;
    longest_streak: string;
    days: string;
    view_dashboard: string;
    sign_in_to_sync: string;
    expression_space: string;
    reading_journey: string;
    explore_books: string;
    start_reading: string;
    continue_reading: string;
    read_again: string;
    unlock_with_ad: string;
    chapters: string;
    completed: string;
    free_preview: string;
    premium: string;
    all_books: string;
    my_books: string;
    favorites: string;
    recently_read: string;
    recommendations: string;
    popular: string;
    new_releases: string;
    categories: string;
    search_books: string;
    no_books_found: string;
    optimism_quote: string;
  };
  reader: {
    chapter: string;
    progress: string;
    search_chapter: string;
    no_results: string;
    mark_complete: string;
    marked_complete: string;
    reflection: string;
    reflection_prompt: string;
    save_reflection: string;
    saved_to_journal: string;
    commit_to_journal: string;
    previous_chapter: string;
    next_chapter: string;
    table_of_contents: string;
    font_size: string;
    increase: string;
    decrease: string;
    reading_time: string;
    minutes: string;
    words: string;
    unlock_chapter: string;
    watch_ad_unlock: string;
    chapter_locked: string;
    free_chapters_remaining: string;
  };
  dashboard: {
    title: string;
    my_books: string;
    my_downloads: string;
    my_account: string;
    reading_progress: string;
    total_chapters_read: string;
    total_time_spent: string;
    achievements: string;
    badges: string;
    statistics: string;
    recent_activity: string;
    download_pdf: string;
    download_progress: string;
    ads_watched: string;
    ads_remaining: string;
    premium_status: string;
    premium_active: string;
    premium_expired: string;
    upgrade_premium: string;
    watch_ad: string;
    export_journal: string;
    export_reflections: string;
    format: string;
    pdf: string;
    txt: string;
    markdown: string;
  };
  journal: {
    title: string;
    my_journal: string;
    new_entry: string;
    edit_entry: string;
    delete_entry: string;
    entry_title: string;
    entry_content: string;
    category: string;
    mood: string;
    tags: string;
    date: string;
    time: string;
    save_entry: string;
    update_entry: string;
    entry_saved: string;
    entry_updated: string;
    entry_deleted: string;
    confirm_delete: string;
    no_entries: string;
    start_journaling: string;
    calendar_view: string;
    timeline_view: string;
    analytics: string;
    mood_tracker: string;
    weekly_summary: string;
    monthly_summary: string;
    yearly_summary: string;
    export_journal: string;
    make_public: string;
    keep_private: string;
    public_entries: string;
    private_entries: string;
    likes: string;
    comments: string;
    add_comment: string;
    categories: {
      reflection: string;
      gratitude: string;
      goals: string;
      ideas: string;
      memories: string;
      dreams: string;
      other: string;
    };
    moods: {
      happy: string;
      sad: string;
      neutral: string;
      excited: string;
      anxious: string;
      calm: string;
      frustrated: string;
      grateful: string;
      motivated: string;
      tired: string;
    };
  };
  expression: {
    title: string;
    my_space: string;
    write_reflection: string;
    philosophical_prompts: string;
    daily_prompt: string;
    save_reflection: string;
    reflection_saved: string;
    delete_reflection: string;
    no_reflections: string;
    start_reflecting: string;
    categories: {
      philosophy: string;
      wisdom: string;
      growth: string;
      relationships: string;
      creativity: string;
      mindfulness: string;
    };
  };
  contact: {
    title: string;
    contact_us: string;
    send_message: string;
    message_sent: string;
    subject: string;
    message: string;
    your_email: string;
    feedback: string;
    support: string;
    book_ideas: string;
    suggest_book: string;
    book_title: string;
    book_description: string;
    book_category: string;
    idea_submitted: string;
    my_messages: string;
    my_ideas: string;
    status: string;
    pending: string;
    reviewing: string;
    approved: string;
    rejected: string;
  };
  admin: {
    dashboard: string;
    overview: string;
    users: string;
    clients: string;
    ebooks: string;
    internal_ebooks: string;
    ads: string;
    messages: string;
    ideas: string;
    analytics: string;
    ai_generator: string;
    settings: string;
    total_users: string;
    active_users: string;
    total_books: string;
    total_reads: string;
    revenue: string;
    impressions: string;
    clicks: string;
    ctr: string;
    manage_users: string;
    manage_ebooks: string;
    manage_ads: string;
    view_messages: string;
    view_ideas: string;
    generate_content: string;
    suspend_user: string;
    activate_user: string;
    create_ad: string;
    edit_ad: string;
    delete_ad: string;
    publish: string;
    unpublish: string;
    draft: string;
    active: string;
    paused: string;
  };
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    forbidden: string;
    not_found: string;
    server_error: string;
    validation: string;
    required_field: string;
    invalid_email: string;
    invalid_password: string;
    try_again: string;
    contact_support: string;
  };
  premium: {
    unlock: string;
    watch_ad: string;
    premium_content: string;
    free_trial: string;
    trial_ended: string;
    upgrade_now: string;
    already_premium: string;
    premium_until: string;
    unlock_all: string;
    ads_required: string;
    ad_progress: string;
    download_unlocked: string;
    feature_locked: string;
    unlock_with_ad: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      all: "All",
      none: "None",
      yes: "Yes",
      no: "No",
      or: "or",
      and: "and",
      more: "More",
      less: "Less",
      view: "View",
      download: "Download",
      export: "Export",
      import: "Import",
      refresh: "Refresh",
      retry: "Retry",
      submit: "Submit",
      send: "Send",
      reply: "Reply",
      share: "Share",
      copy: "Copy",
      paste: "Paste",
      select: "Select",
      clear: "Clear",
      reset: "Reset",
      apply: "Apply",
      update: "Update",
      create: "Create",
      add: "Add",
      remove: "Remove",
      settings: "Settings",
      profile: "Profile",
      logout: "Log Out",
      login: "Log In",
      register: "Register",
      email: "Email",
      password: "Password",
      name: "Name",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      sepia: "Sepia",
      english: "English",
      french: "French",
    },
    auth: {
      welcome_back: "Welcome Back",
      create_account: "Create Account",
      sign_in: "Sign In",
      sign_up: "Sign Up",
      sign_out: "Sign Out",
      forgot_password: "Forgot Password?",
      reset_password: "Reset Password",
      enter_email: "Enter your email",
      enter_password: "Enter your password",
      enter_name: "Enter your name",
      confirm_password: "Confirm password",
      password_min_length: "Password must be at least 6 characters",
      passwords_dont_match: "Passwords don't match",
      invalid_credentials: "Invalid email or password",
      account_exists: "An account with this email already exists",
      account_created: "Account created successfully",
      reset_link_sent: "Password reset link has been sent to your email",
      password_updated: "Password updated successfully",
      continue_with_google: "Continue with Google",
      or_continue_with_email: "Or continue with email",
      dont_have_account: "Don't have an account?",
      already_have_account: "Already have an account?",
      enter_reset_code: "Enter reset code",
      new_password: "New password",
    },
    shelf: {
      title: "Library",
      library: "Library",
      total_books: "Total Books",
      books_unlocked: "Books Unlocked",
      reading_streak: "Reading Streak",
      current_streak: "Current",
      longest_streak: "Longest",
      days: "days",
      view_dashboard: "View Dashboard",
      sign_in_to_sync: "Sign in to sync your progress",
      expression_space: "My Expression Space",
      reading_journey: "My Reading Journey",
      explore_books: "Explore All Books",
      start_reading: "Start Reading",
      continue_reading: "Continue Reading",
      read_again: "Read Again",
      unlock_with_ad: "Unlock with Ad",
      chapters: "chapters",
      completed: "completed",
      free_preview: "Free Preview",
      premium: "Premium",
      all_books: "All Books",
      my_books: "My Books",
      favorites: "Favorites",
      recently_read: "Recently Read",
      recommendations: "Recommendations",
      popular: "Popular",
      new_releases: "New Releases",
      categories: "Categories",
      search_books: "Search books...",
      no_books_found: "No books found",
      optimism_quote: "Optimism is a force multiplier.",
    },
    reader: {
      chapter: "Chapter",
      progress: "Progress",
      search_chapter: "Search in this chapter...",
      no_results: "No results found",
      mark_complete: "Mark as Complete",
      marked_complete: "Completed",
      reflection: "Reflection",
      reflection_prompt: "What did this chapter make you think or feel?",
      save_reflection: "Save Reflection",
      saved_to_journal: "Saved to Journal",
      commit_to_journal: "Commit to Journal",
      previous_chapter: "Previous Chapter",
      next_chapter: "Next Chapter",
      table_of_contents: "Table of Contents",
      font_size: "Font Size",
      increase: "Increase",
      decrease: "Decrease",
      reading_time: "Reading time",
      minutes: "min",
      words: "words",
      unlock_chapter: "Unlock Chapter",
      watch_ad_unlock: "Watch ad to unlock",
      chapter_locked: "This chapter is locked",
      free_chapters_remaining: "free chapters remaining",
    },
    dashboard: {
      title: "Dashboard",
      my_books: "My Books",
      my_downloads: "My Downloads",
      my_account: "My Account",
      reading_progress: "Reading Progress",
      total_chapters_read: "Chapters Read",
      total_time_spent: "Time Spent Reading",
      achievements: "Achievements",
      badges: "Badges",
      statistics: "Statistics",
      recent_activity: "Recent Activity",
      download_pdf: "Download PDF",
      download_progress: "Download Progress",
      ads_watched: "Ads Watched",
      ads_remaining: "Ads Remaining",
      premium_status: "Premium Status",
      premium_active: "Premium Active",
      premium_expired: "Premium Expired",
      upgrade_premium: "Upgrade to Premium",
      watch_ad: "Watch Ad",
      export_journal: "Export Journal",
      export_reflections: "Export Reflections",
      format: "Format",
      pdf: "PDF",
      txt: "Text",
      markdown: "Markdown",
    },
    journal: {
      title: "Journal",
      my_journal: "My Journal",
      new_entry: "New Entry",
      edit_entry: "Edit Entry",
      delete_entry: "Delete Entry",
      entry_title: "Title",
      entry_content: "Content",
      category: "Category",
      mood: "Mood",
      tags: "Tags",
      date: "Date",
      time: "Time",
      save_entry: "Save Entry",
      update_entry: "Update Entry",
      entry_saved: "Entry saved",
      entry_updated: "Entry updated",
      entry_deleted: "Entry deleted",
      confirm_delete: "Are you sure you want to delete this entry?",
      no_entries: "No journal entries yet",
      start_journaling: "Start your journal",
      calendar_view: "Calendar View",
      timeline_view: "Timeline View",
      analytics: "Analytics",
      mood_tracker: "Mood Tracker",
      weekly_summary: "Weekly Summary",
      monthly_summary: "Monthly Summary",
      yearly_summary: "Yearly Summary",
      export_journal: "Export Journal",
      make_public: "Make Public",
      keep_private: "Keep Private",
      public_entries: "Public Entries",
      private_entries: "Private Entries",
      likes: "Likes",
      comments: "Comments",
      add_comment: "Add Comment",
      categories: {
        reflection: "Reflection",
        gratitude: "Gratitude",
        goals: "Goals",
        ideas: "Ideas",
        memories: "Memories",
        dreams: "Dreams",
        other: "Other",
      },
      moods: {
        happy: "Happy",
        sad: "Sad",
        neutral: "Neutral",
        excited: "Excited",
        anxious: "Anxious",
        calm: "Calm",
        frustrated: "Frustrated",
        grateful: "Grateful",
        motivated: "Motivated",
        tired: "Tired",
      },
    },
    expression: {
      title: "Expression Space",
      my_space: "My Expression Space",
      write_reflection: "Write your reflection...",
      philosophical_prompts: "Philosophical Prompts",
      daily_prompt: "Daily Prompt",
      save_reflection: "Save Reflection",
      reflection_saved: "Reflection saved",
      delete_reflection: "Delete Reflection",
      no_reflections: "No reflections yet",
      start_reflecting: "Start reflecting on your thoughts",
      categories: {
        philosophy: "Philosophy",
        wisdom: "Wisdom",
        growth: "Personal Growth",
        relationships: "Relationships",
        creativity: "Creativity",
        mindfulness: "Mindfulness",
      },
    },
    contact: {
      title: "Contact",
      contact_us: "Contact Us",
      send_message: "Send Message",
      message_sent: "Message sent successfully",
      subject: "Subject",
      message: "Message",
      your_email: "Your email",
      feedback: "Feedback",
      support: "Support",
      book_ideas: "Book Ideas",
      suggest_book: "Suggest a Book",
      book_title: "Book Title",
      book_description: "Description",
      book_category: "Category",
      idea_submitted: "Thank you! Your idea has been submitted.",
      my_messages: "My Messages",
      my_ideas: "My Ideas",
      status: "Status",
      pending: "Pending",
      reviewing: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
    },
    admin: {
      dashboard: "Admin Dashboard",
      overview: "Overview",
      users: "Users",
      clients: "Clients",
      ebooks: "Ebooks",
      internal_ebooks: "Internal Ebooks",
      ads: "Ads",
      messages: "Messages",
      ideas: "Ideas",
      analytics: "Analytics",
      ai_generator: "AI Generator",
      settings: "Settings",
      total_users: "Total Users",
      active_users: "Active Users",
      total_books: "Total Books",
      total_reads: "Total Reads",
      revenue: "Revenue",
      impressions: "Impressions",
      clicks: "Clicks",
      ctr: "CTR",
      manage_users: "Manage Users",
      manage_ebooks: "Manage Ebooks",
      manage_ads: "Manage Ads",
      view_messages: "View Messages",
      view_ideas: "View Ideas",
      generate_content: "Generate Content",
      suspend_user: "Suspend User",
      activate_user: "Activate User",
      create_ad: "Create Ad",
      edit_ad: "Edit Ad",
      delete_ad: "Delete Ad",
      publish: "Publish",
      unpublish: "Unpublish",
      draft: "Draft",
      active: "Active",
      paused: "Paused",
    },
    errors: {
      generic: "Something went wrong",
      network: "Network error. Please check your connection.",
      unauthorized: "Please log in to continue",
      forbidden: "You don't have permission to access this",
      not_found: "Not found",
      server_error: "Server error. Please try again later.",
      validation: "Please check your input",
      required_field: "This field is required",
      invalid_email: "Please enter a valid email",
      invalid_password: "Invalid password",
      try_again: "Please try again",
      contact_support: "If the problem persists, contact support",
    },
    premium: {
      unlock: "Unlock",
      watch_ad: "Watch Ad",
      premium_content: "Premium Content",
      free_trial: "Free Trial",
      trial_ended: "Free trial ended",
      upgrade_now: "Upgrade Now",
      already_premium: "You're already premium!",
      premium_until: "Premium until",
      unlock_all: "Unlock All",
      ads_required: "ads required",
      ad_progress: "Ad Progress",
      download_unlocked: "Download Unlocked",
      feature_locked: "This feature requires premium",
      unlock_with_ad: "Unlock with Ad",
    },
  },
  fr: {
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      close: "Fermer",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      delete: "Supprimer",
      edit: "Modifier",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      confirm: "Confirmer",
      search: "Rechercher",
      filter: "Filtrer",
      sort: "Trier",
      all: "Tout",
      none: "Aucun",
      yes: "Oui",
      no: "Non",
      or: "ou",
      and: "et",
      more: "Plus",
      less: "Moins",
      view: "Voir",
      download: "Télécharger",
      export: "Exporter",
      import: "Importer",
      refresh: "Actualiser",
      retry: "Réessayer",
      submit: "Soumettre",
      send: "Envoyer",
      reply: "Répondre",
      share: "Partager",
      copy: "Copier",
      paste: "Coller",
      select: "Sélectionner",
      clear: "Effacer",
      reset: "Réinitialiser",
      apply: "Appliquer",
      update: "Mettre à jour",
      create: "Créer",
      add: "Ajouter",
      remove: "Supprimer",
      settings: "Paramètres",
      profile: "Profil",
      logout: "Déconnexion",
      login: "Connexion",
      register: "S'inscrire",
      email: "Email",
      password: "Mot de passe",
      name: "Nom",
      language: "Langue",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
      sepia: "Sépia",
      english: "Anglais",
      french: "Français",
    },
    auth: {
      welcome_back: "Bon retour",
      create_account: "Créer un compte",
      sign_in: "Se connecter",
      sign_up: "S'inscrire",
      sign_out: "Se déconnecter",
      forgot_password: "Mot de passe oublié ?",
      reset_password: "Réinitialiser le mot de passe",
      enter_email: "Entrez votre email",
      enter_password: "Entrez votre mot de passe",
      enter_name: "Entrez votre nom",
      confirm_password: "Confirmez le mot de passe",
      password_min_length: "Le mot de passe doit contenir au moins 6 caractères",
      passwords_dont_match: "Les mots de passe ne correspondent pas",
      invalid_credentials: "Email ou mot de passe invalide",
      account_exists: "Un compte avec cet email existe déjà",
      account_created: "Compte créé avec succès",
      reset_link_sent: "Un lien de réinitialisation a été envoyé à votre email",
      password_updated: "Mot de passe mis à jour avec succès",
      continue_with_google: "Continuer avec Google",
      or_continue_with_email: "Ou continuer avec email",
      dont_have_account: "Vous n'avez pas de compte ?",
      already_have_account: "Vous avez déjà un compte ?",
      enter_reset_code: "Entrez le code de réinitialisation",
      new_password: "Nouveau mot de passe",
    },
    shelf: {
      title: "Bibliothèque",
      library: "Bibliothèque",
      total_books: "Total des livres",
      books_unlocked: "Livres débloqués",
      reading_streak: "Série de lecture",
      current_streak: "Actuelle",
      longest_streak: "La plus longue",
      days: "jours",
      view_dashboard: "Voir le tableau de bord",
      sign_in_to_sync: "Connectez-vous pour synchroniser votre progression",
      expression_space: "Mon Espace d'Expression",
      reading_journey: "Mon Parcours de Lecture",
      explore_books: "Explorer tous les livres",
      start_reading: "Commencer la lecture",
      continue_reading: "Continuer la lecture",
      read_again: "Relire",
      unlock_with_ad: "Débloquer avec pub",
      chapters: "chapitres",
      completed: "terminé",
      free_preview: "Aperçu gratuit",
      premium: "Premium",
      all_books: "Tous les livres",
      my_books: "Mes livres",
      favorites: "Favoris",
      recently_read: "Lu récemment",
      recommendations: "Recommandations",
      popular: "Populaire",
      new_releases: "Nouveautés",
      categories: "Catégories",
      search_books: "Rechercher des livres...",
      no_books_found: "Aucun livre trouvé",
      optimism_quote: "L'optimisme est un multiplicateur de force.",
    },
    reader: {
      chapter: "Chapitre",
      progress: "Progrès",
      search_chapter: "Rechercher dans ce chapitre...",
      no_results: "Aucun résultat",
      mark_complete: "Marquer comme terminé",
      marked_complete: "Terminé",
      reflection: "Réflexion",
      reflection_prompt: "Qu'est-ce que ce chapitre vous a fait penser ou ressentir ?",
      save_reflection: "Enregistrer la réflexion",
      saved_to_journal: "Enregistré dans le journal",
      commit_to_journal: "Ajouter au journal",
      previous_chapter: "Chapitre précédent",
      next_chapter: "Chapitre suivant",
      table_of_contents: "Table des matières",
      font_size: "Taille de police",
      increase: "Augmenter",
      decrease: "Diminuer",
      reading_time: "Temps de lecture",
      minutes: "min",
      words: "mots",
      unlock_chapter: "Débloquer le chapitre",
      watch_ad_unlock: "Regarder une pub pour débloquer",
      chapter_locked: "Ce chapitre est verrouillé",
      free_chapters_remaining: "chapitres gratuits restants",
    },
    dashboard: {
      title: "Tableau de bord",
      my_books: "Mes livres",
      my_downloads: "Mes téléchargements",
      my_account: "Mon compte",
      reading_progress: "Progression de lecture",
      total_chapters_read: "Chapitres lus",
      total_time_spent: "Temps de lecture",
      achievements: "Réalisations",
      badges: "Badges",
      statistics: "Statistiques",
      recent_activity: "Activité récente",
      download_pdf: "Télécharger PDF",
      download_progress: "Progression du téléchargement",
      ads_watched: "Pubs regardées",
      ads_remaining: "Pubs restantes",
      premium_status: "Statut Premium",
      premium_active: "Premium actif",
      premium_expired: "Premium expiré",
      upgrade_premium: "Passer à Premium",
      watch_ad: "Regarder une pub",
      export_journal: "Exporter le journal",
      export_reflections: "Exporter les réflexions",
      format: "Format",
      pdf: "PDF",
      txt: "Texte",
      markdown: "Markdown",
    },
    journal: {
      title: "Journal",
      my_journal: "Mon Journal",
      new_entry: "Nouvelle entrée",
      edit_entry: "Modifier l'entrée",
      delete_entry: "Supprimer l'entrée",
      entry_title: "Titre",
      entry_content: "Contenu",
      category: "Catégorie",
      mood: "Humeur",
      tags: "Tags",
      date: "Date",
      time: "Heure",
      save_entry: "Enregistrer l'entrée",
      update_entry: "Mettre à jour l'entrée",
      entry_saved: "Entrée enregistrée",
      entry_updated: "Entrée mise à jour",
      entry_deleted: "Entrée supprimée",
      confirm_delete: "Êtes-vous sûr de vouloir supprimer cette entrée ?",
      no_entries: "Aucune entrée de journal",
      start_journaling: "Commencez votre journal",
      calendar_view: "Vue calendrier",
      timeline_view: "Vue chronologique",
      analytics: "Analytiques",
      mood_tracker: "Suivi de l'humeur",
      weekly_summary: "Résumé hebdomadaire",
      monthly_summary: "Résumé mensuel",
      yearly_summary: "Résumé annuel",
      export_journal: "Exporter le journal",
      make_public: "Rendre public",
      keep_private: "Garder privé",
      public_entries: "Entrées publiques",
      private_entries: "Entrées privées",
      likes: "J'aime",
      comments: "Commentaires",
      add_comment: "Ajouter un commentaire",
      categories: {
        reflection: "Réflexion",
        gratitude: "Gratitude",
        goals: "Objectifs",
        ideas: "Idées",
        memories: "Souvenirs",
        dreams: "Rêves",
        other: "Autre",
      },
      moods: {
        happy: "Heureux",
        sad: "Triste",
        neutral: "Neutre",
        excited: "Excité",
        anxious: "Anxieux",
        calm: "Calme",
        frustrated: "Frustré",
        grateful: "Reconnaissant",
        motivated: "Motivé",
        tired: "Fatigué",
      },
    },
    expression: {
      title: "Espace d'Expression",
      my_space: "Mon Espace d'Expression",
      write_reflection: "Écrivez votre réflexion...",
      philosophical_prompts: "Réflexions philosophiques",
      daily_prompt: "Réflexion du jour",
      save_reflection: "Enregistrer la réflexion",
      reflection_saved: "Réflexion enregistrée",
      delete_reflection: "Supprimer la réflexion",
      no_reflections: "Aucune réflexion",
      start_reflecting: "Commencez à réfléchir sur vos pensées",
      categories: {
        philosophy: "Philosophie",
        wisdom: "Sagesse",
        growth: "Développement personnel",
        relationships: "Relations",
        creativity: "Créativité",
        mindfulness: "Pleine conscience",
      },
    },
    contact: {
      title: "Contact",
      contact_us: "Nous contacter",
      send_message: "Envoyer le message",
      message_sent: "Message envoyé avec succès",
      subject: "Sujet",
      message: "Message",
      your_email: "Votre email",
      feedback: "Commentaires",
      support: "Support",
      book_ideas: "Idées de livres",
      suggest_book: "Suggérer un livre",
      book_title: "Titre du livre",
      book_description: "Description",
      book_category: "Catégorie",
      idea_submitted: "Merci ! Votre idée a été soumise.",
      my_messages: "Mes messages",
      my_ideas: "Mes idées",
      status: "Statut",
      pending: "En attente",
      reviewing: "En cours d'examen",
      approved: "Approuvé",
      rejected: "Rejeté",
    },
    admin: {
      dashboard: "Tableau de bord Admin",
      overview: "Aperçu",
      users: "Utilisateurs",
      clients: "Clients",
      ebooks: "Ebooks",
      internal_ebooks: "Ebooks internes",
      ads: "Publicités",
      messages: "Messages",
      ideas: "Idées",
      analytics: "Analytiques",
      ai_generator: "Générateur IA",
      settings: "Paramètres",
      total_users: "Total utilisateurs",
      active_users: "Utilisateurs actifs",
      total_books: "Total livres",
      total_reads: "Total lectures",
      revenue: "Revenus",
      impressions: "Impressions",
      clicks: "Clics",
      ctr: "CTR",
      manage_users: "Gérer les utilisateurs",
      manage_ebooks: "Gérer les ebooks",
      manage_ads: "Gérer les publicités",
      view_messages: "Voir les messages",
      view_ideas: "Voir les idées",
      generate_content: "Générer du contenu",
      suspend_user: "Suspendre l'utilisateur",
      activate_user: "Activer l'utilisateur",
      create_ad: "Créer une publicité",
      edit_ad: "Modifier la publicité",
      delete_ad: "Supprimer la publicité",
      publish: "Publier",
      unpublish: "Dépublier",
      draft: "Brouillon",
      active: "Actif",
      paused: "En pause",
    },
    errors: {
      generic: "Une erreur s'est produite",
      network: "Erreur réseau. Vérifiez votre connexion.",
      unauthorized: "Veuillez vous connecter pour continuer",
      forbidden: "Vous n'avez pas la permission d'accéder à ceci",
      not_found: "Non trouvé",
      server_error: "Erreur serveur. Veuillez réessayer plus tard.",
      validation: "Veuillez vérifier vos données",
      required_field: "Ce champ est requis",
      invalid_email: "Veuillez entrer un email valide",
      invalid_password: "Mot de passe invalide",
      try_again: "Veuillez réessayer",
      contact_support: "Si le problème persiste, contactez le support",
    },
    premium: {
      unlock: "Débloquer",
      watch_ad: "Regarder une pub",
      premium_content: "Contenu Premium",
      free_trial: "Essai gratuit",
      trial_ended: "Essai gratuit terminé",
      upgrade_now: "Passer à Premium",
      already_premium: "Vous êtes déjà Premium !",
      premium_until: "Premium jusqu'au",
      unlock_all: "Tout débloquer",
      ads_required: "pubs requises",
      ad_progress: "Progression des pubs",
      download_unlocked: "Téléchargement débloqué",
      feature_locked: "Cette fonctionnalité nécessite Premium",
      unlock_with_ad: "Débloquer avec pub",
    },
  },
};

// Helper function to get translation
export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en;
}

// Helper function to get a specific key with fallback
export function t(language: Language, key: string): string {
  const keys = key.split('.');
  let result: any = translations[language];
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // Fallback to English
      result = translations.en;
      for (const fk of keys) {
        if (result && typeof result === 'object' && fk in result) {
          result = result[fk];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }
  
  return typeof result === 'string' ? result : key;
}
