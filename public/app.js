// ========================================
// FoundIt - School Lost & Found
// Frontend JavaScript
// ========================================

// State
// These variables track the current page, browse filters, loaded items,
// and Chart.js instances that need to be destroyed/recreated on refresh.
let currentPage = 'home';
let currentCategory = 'all';
let searchQuery = '';
let sortBy = 'newest';
let items = [];
let categoryChartInstance = null;
let recoveryRateChartInstance = null;
let monthlyTrendsChartInstance = null;

// DOM Elements
// These cached references let the rest of the script attach listeners and update UI.
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-page]');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const reportForm = document.getElementById('report-form');
const claimForm = document.getElementById('claim-form');
const itemModal = document.getElementById('item-modal');
const claimModal = document.getElementById('claim-modal');
const toastContainer = document.getElementById('toast-container');
const languageSelect = document.getElementById('language-select');

// Stores the active language; localStorage preserves the choice across page reloads.
let currentLanguage = localStorage.getItem('vikingVaultLanguage') || 'en';

// Translation dictionary for all supported non-English languages.
// English is the source text in the HTML, so only translated values are stored here.
const translations = {
    es: {
        'Home': 'Inicio',
        'Browse Items': 'Ver Objetos',
        'Report Found': 'Reportar Encontrado',
        'Report Lost': 'Reportar Perdido',
        'Our Mission': 'Nuestra Misión',
        'Stats': 'Estadísticas',
        'Statistics': 'Estadísticas',
        'Admin': 'Admin',
        'Admin Panel': 'Panel de Admin',
        'Language': 'Idioma',
        'Select language': 'Seleccionar idioma',
        'Toggle menu': 'Abrir menú',
        'South Brunswick High School': 'South Brunswick High School',
        'Lost Something?': '¿Perdiste algo?',
        'Viking Vault Will Help!': '¡Viking Vault te ayudará!',
        "South Brunswick High School's official lost and found system. Report found items or search for your missing belongings. Let's reunite Vikings with their items!": 'El sistema oficial de objetos perdidos y encontrados de South Brunswick High School. Reporta objetos encontrados o busca tus pertenencias perdidas. ¡Ayudemos a los Vikings a recuperar sus cosas!',
        'Browse Found Items': 'Ver Objetos Encontrados',
        'Report Found Item': 'Reportar Objeto Encontrado',
        'Simple Process': 'Proceso Simple',
        'How It Works': 'Cómo Funciona',
        'Report or Search': 'Reporta o Busca',
        'Found something around SBHS? Report it with a photo. Lost something? Browse our listings or use search.': '¿Encontraste algo en SBHS? Repórtalo con una foto. ¿Perdiste algo? Revisa la lista o usa la búsqueda.',
        'Admin Review': 'Revisión del Personal',
        'SBHS staff reviews submissions to ensure accuracy and prevent misuse of the system.': 'El personal de SBHS revisa los reportes para asegurar precisión y evitar mal uso.',
        'Submit Claim': 'Enviar Reclamo',
        "Found your item? Submit a claim with details proving ownership. We'll verify and connect you.": '¿Encontraste tu objeto? Envía un reclamo con detalles que prueben que es tuyo. Lo verificaremos y te conectaremos.',
        'Reunited!': '¡Reunido!',
        'Recently Found Items': 'Objetos Encontrados Recientemente',
        'Latest Finds': 'Últimos Hallazgos',
        'View All Items': 'Ver Todos los Objetos',
        'No items yet': 'Aún no hay objetos',
        'Be the first to report a found item!': '¡Sé la primera persona en reportar un objeto encontrado!',
        'Search & Browse': 'Buscar y Explorar',
        'Found Items': 'Objetos Encontrados',
        'Browse all reported found items or use the search to find something specific.': 'Explora todos los objetos encontrados o usa la búsqueda para encontrar algo específico.',
        'Search items...': 'Buscar objetos...',
        'All': 'Todos',
        'Electronics': 'Electrónicos',
        'Clothing': 'Ropa',
        'Accessories': 'Accesorios',
        'Books': 'Libros',
        'Books & Supplies': 'Libros y Útiles',
        'Sports': 'Deportes',
        'Sports Equipment': 'Equipo Deportivo',
        'Other': 'Otro',
        'Sort by:': 'Ordenar por:',
        'Newest First': 'Más recientes primero',
        'Oldest First': 'Más antiguos primero',
        'No items found': 'No se encontraron objetos',
        'Try adjusting your search or filters.': 'Intenta cambiar la búsqueda o los filtros.',
        'Loading items...': 'Cargando objetos...',
        'Need Help Finding Something?': '¿Necesitas ayuda para encontrar algo?',
        'Report a Lost Item': 'Reportar un Objeto Perdido',
        "Fill out the form below to report an item you've lost. If it's found, we'll contact you immediately!": 'Completa el formulario para reportar un objeto perdido. Si aparece, te contactaremos de inmediato.',
        'Item Name *': 'Nombre del Objeto *',
        'Category *': 'Categoría *',
        'Select a category': 'Selecciona una categoría',
        'Location Lost *': 'Lugar donde se perdió *',
        'Date Lost *': 'Fecha en que se perdió *',
        'Description': 'Descripción',
        'Your Contact Info': 'Tu Información de Contacto',
        'Your Name *': 'Tu Nombre *',
        'Email *': 'Correo Electrónico *',
        'Phone (Optional)': 'Teléfono (Opcional)',
        'Submit Report': 'Enviar Reporte',
        'About Viking Vault': 'Acerca de Viking Vault',
        'Helping the South Brunswick High School community reunite with lost belongings.': 'Ayudamos a la comunidad de South Brunswick High School a recuperar pertenencias perdidas.',
        'Our Purpose': 'Nuestro Propósito',
        'Fast & Easy': 'Rápido y Fácil',
        'Safe & Secure': 'Seguro y Protegido',
        'Ready to Help?': '¿Listo para ayudar?',
        'Viking Vault Statistics': 'Estadísticas de Viking Vault',
        'Lost & Found Statistics': 'Estadísticas de Objetos Perdidos',
        'Items Found': 'Objetos Encontrados',
        'Items Claimed': 'Objetos Reclamados',
        'Success Rate': 'Tasa de Éxito',
        'Found This Month': 'Encontrados Este Mes',
        'Items by Category': 'Objetos por Categoría',
        'Help Others': 'Ayuda a Otros',
        'Report a Found Item': 'Reportar un Objeto Encontrado',
        "Fill out the form below to report an item you've found. Our staff will review and approve it.": 'Completa el formulario para reportar un objeto encontrado. Nuestro personal lo revisará y aprobará.',
        'Location Found *': 'Lugar donde se encontró *',
        'Date Found *': 'Fecha Encontrado *',
        'Photo (Optional)': 'Foto (Opcional)',
        'Click or drag to upload': 'Haz clic o arrastra para subir',
        'Max 5MB, JPG/PNG/GIF': 'Máx. 5MB, JPG/PNG/GIF',
        'Claim This Item': 'Reclamar Este Objeto',
        'Prove It\'s Yours *': 'Demuestra Que Es Tuyo *',
        'Cancel': 'Cancelar',
        'Submit Claim': 'Enviar Reclamo',
        'Ask Viper': 'Preguntar a Viper',
        'AI Assistant': 'Asistente de IA',
        'Virtual Item Protection and Enhanced Recovery': 'Protección Virtual de Objetos y Recuperación Mejorada',
        'Type your answer...': 'Escribe tu respuesta...',
        'Send': 'Enviar',
        'Start another report': 'Iniciar otro reporte',
        'Hi, I am Viper: Virtual Item Protection and Enhanced Recovery. I can help you report a lost item faster and search for possible matches.': 'Hola, soy Viper: Protección Virtual de Objetos y Recuperación Mejorada. Puedo ayudarte a reportar un objeto perdido más rápido y buscar posibles coincidencias.',
        'Tell me what happened in a normal sentence. For example: "I lost my blue Nike backpack near the gym yesterday after lunch, and it has a keychain."': 'Cuéntame qué pasó en una oración normal. Por ejemplo: "Perdí mi mochila Nike azul cerca del gimnasio ayer después del almuerzo y tiene un llavero."',
        'Which category fits best: electronics, clothing, accessories, books, sports, or other?': '¿Qué categoría encaja mejor: electrónicos, ropa, accesorios, libros, deportes u otro?',
        'What color is it?': '¿De qué color es?',
        'What brand is it? If you do not know, type "unknown".': '¿De qué marca es? Si no sabes, escribe "desconocida".',
        'Where did you last see it or lose it?': '¿Dónde lo viste por última vez o lo perdiste?',
        'About what time did you lose it? A class period or time range is okay.': '¿A qué hora aproximadamente lo perdiste? También sirve un periodo de clase o rango de tiempo.',
        'What date did you lose it? Use YYYY-MM-DD if you can, or type "today".': '¿En qué fecha lo perdiste? Usa AAAA-MM-DD si puedes, o escribe "hoy".',
        'What unique features, markings, contents, stickers, scratches, or other details would help identify it?': '¿Qué rasgos únicos, marcas, contenido, calcomanías, rayones u otros detalles ayudarían a identificarlo?',
        'What is your full name?': '¿Cuál es tu nombre completo?',
        'What email should staff use to contact you?': '¿Qué correo debe usar el personal para contactarte?',
        'Optional: what phone number should staff use? Type "skip" if you prefer email only.': 'Opcional: ¿qué teléfono debe usar el personal? Escribe "saltar" si prefieres solo correo.',
        'I found these details already:': 'Ya encontré estos detalles:',
        'I will only ask for what is missing.': 'Solo preguntaré lo que falta.',
        'Thanks. I am creating a detailed lost-item report and checking possible matches now.': 'Gracias. Estoy creando un reporte detallado y buscando posibles coincidencias.',
        'I could not submit the report. Please check the details and try the regular lost item form.': 'No pude enviar el reporte. Revisa los detalles e intenta usar el formulario normal.',
        'Report created:': 'Reporte creado:',
        'I included color, brand, location, time, and unique features in the description.': 'Incluí color, marca, ubicación, hora y rasgos únicos en la descripción.',
        'Viper submitted your lost item report': 'Viper envió tu reporte de objeto perdido',
        'I could not connect to the server. Please try again or use the regular lost item form.': 'No pude conectarme al servidor. Intenta de nuevo o usa el formulario normal.',
        'I did not find a strong public match yet, but your report is saved so staff can review it and contact you if one appears.': 'Todavía no encontré una coincidencia pública fuerte, pero tu reporte está guardado para que el personal lo revise.',
        'I found possible matches in the found-item database:': 'Encontré posibles coincidencias en la base de objetos encontrados:',
        'Match score': 'Puntuación de coincidencia',
        'electronics': 'electrónicos',
        'clothing': 'ropa',
        'accessories': 'accesorios',
        'books': 'libros',
        'sports': 'deportes',
        'other': 'otro'
    },
    fr: {
        'Home': 'Accueil',
        'Browse Items': 'Parcourir les Objets',
        'Report Found': 'Signaler Trouvé',
        'Report Lost': 'Signaler Perdu',
        'Our Mission': 'Notre Mission',
        'Stats': 'Stats',
        'Statistics': 'Statistiques',
        'Admin': 'Admin',
        'Admin Panel': 'Panneau Admin',
        'Language': 'Langue',
        'Select language': 'Choisir la langue',
        'Toggle menu': 'Ouvrir le menu',
        'Lost Something?': 'Vous avez perdu quelque chose ?',
        'Viking Vault Will Help!': 'Viking Vault vous aidera !',
        "South Brunswick High School's official lost and found system. Report found items or search for your missing belongings. Let's reunite Vikings with their items!": 'Le système officiel des objets perdus et trouvés de South Brunswick High School. Signalez des objets trouvés ou cherchez vos affaires perdues.',
        'Browse Found Items': 'Voir les Objets Trouvés',
        'Report Found Item': 'Signaler un Objet Trouvé',
        'Simple Process': 'Processus Simple',
        'How It Works': 'Comment ça Marche',
        'Report or Search': 'Signaler ou Chercher',
        'Admin Review': 'Révision du Personnel',
        'Submit Claim': 'Envoyer une Réclamation',
        'Reunited!': 'Réuni !',
        'Recently Found Items': 'Objets Récemment Trouvés',
        'Latest Finds': 'Dernières Trouvailles',
        'View All Items': 'Voir Tous les Objets',
        'Search & Browse': 'Chercher et Parcourir',
        'Found Items': 'Objets Trouvés',
        'Search items...': 'Chercher des objets...',
        'All': 'Tous',
        'Electronics': 'Électronique',
        'Clothing': 'Vêtements',
        'Accessories': 'Accessoires',
        'Books': 'Livres',
        'Books & Supplies': 'Livres et Fournitures',
        'Sports': 'Sports',
        'Sports Equipment': 'Équipement Sportif',
        'Other': 'Autre',
        'Sort by:': 'Trier par :',
        'Newest First': 'Plus récents',
        'Oldest First': 'Plus anciens',
        'No items found': 'Aucun objet trouvé',
        'Try adjusting your search or filters.': 'Essayez de modifier la recherche ou les filtres.',
        'Loading items...': 'Chargement...',
        'Need Help Finding Something?': 'Besoin d’aide pour retrouver quelque chose ?',
        'Report a Lost Item': 'Signaler un Objet Perdu',
        'Item Name *': 'Nom de l’Objet *',
        'Category *': 'Catégorie *',
        'Select a category': 'Choisir une catégorie',
        'Location Lost *': 'Lieu de Perte *',
        'Date Lost *': 'Date de Perte *',
        'Description': 'Description',
        'Your Contact Info': 'Vos Coordonnées',
        'Your Name *': 'Votre Nom *',
        'Email *': 'E-mail *',
        'Phone (Optional)': 'Téléphone (Facultatif)',
        'Submit Report': 'Envoyer le Rapport',
        'About Viking Vault': 'À Propos de Viking Vault',
        'Our Purpose': 'Notre But',
        'Fast & Easy': 'Rapide et Facile',
        'Safe & Secure': 'Sûr et Sécurisé',
        'Ready to Help?': 'Prêt à aider ?',
        'Viking Vault Statistics': 'Statistiques de Viking Vault',
        'Lost & Found Statistics': 'Statistiques des Objets Perdus',
        'Items Found': 'Objets Trouvés',
        'Items Claimed': 'Objets Réclamés',
        'Success Rate': 'Taux de Réussite',
        'Found This Month': 'Trouvés ce Mois-ci',
        'Items by Category': 'Objets par Catégorie',
        'Help Others': 'Aider les Autres',
        'Report a Found Item': 'Signaler un Objet Trouvé',
        'Location Found *': 'Lieu Trouvé *',
        'Date Found *': 'Date Trouvée *',
        'Photo (Optional)': 'Photo (Facultatif)',
        'Click or drag to upload': 'Cliquez ou glissez pour téléverser',
        'Claim This Item': 'Réclamer cet Objet',
        'Prove It\'s Yours *': 'Prouvez que c’est à vous *',
        'Cancel': 'Annuler',
        'Ask Viper': 'Demander à Viper',
        'AI Assistant': 'Assistant IA',
        'Virtual Item Protection and Enhanced Recovery': 'Protection Virtuelle des Objets et Récupération Améliorée',
        'Type your answer...': 'Tapez votre réponse...',
        'Send': 'Envoyer',
        'Start another report': 'Commencer un autre rapport',
        'Hi, I am Viper: Virtual Item Protection and Enhanced Recovery. I can help you report a lost item faster and search for possible matches.': 'Bonjour, je suis Viper : Protection Virtuelle des Objets et Récupération Améliorée. Je peux vous aider à signaler un objet perdu plus vite et chercher des correspondances.',
        'Tell me what happened in a normal sentence. For example: "I lost my blue Nike backpack near the gym yesterday after lunch, and it has a keychain."': 'Décrivez ce qui s’est passé en phrase normale. Par exemple : « J’ai perdu mon sac Nike bleu près du gymnase hier après le déjeuner, avec un porte-clés. »',
        'Which category fits best: electronics, clothing, accessories, books, sports, or other?': 'Quelle catégorie convient le mieux : électronique, vêtements, accessoires, livres, sports ou autre ?',
        'What color is it?': 'De quelle couleur est-il ?',
        'What brand is it? If you do not know, type "unknown".': 'Quelle est la marque ? Si vous ne savez pas, tapez « inconnu ».',
        'Where did you last see it or lose it?': 'Où l’avez-vous vu ou perdu pour la dernière fois ?',
        'About what time did you lose it? A class period or time range is okay.': 'Vers quelle heure l’avez-vous perdu ? Une période de cours ou une plage horaire convient.',
        'What date did you lose it? Use YYYY-MM-DD if you can, or type "today".': 'Quelle date ? Utilisez AAAA-MM-JJ si possible, ou tapez « aujourd’hui ».',
        'What unique features, markings, contents, stickers, scratches, or other details would help identify it?': 'Quels détails uniques, marques, autocollants, rayures ou contenus aideraient à l’identifier ?',
        'What is your full name?': 'Quel est votre nom complet ?',
        'What email should staff use to contact you?': 'Quelle adresse e-mail le personnel doit-il utiliser ?',
        'Optional: what phone number should staff use? Type "skip" if you prefer email only.': 'Facultatif : quel numéro de téléphone utiliser ? Tapez « passer » si vous préférez l’e-mail.',
        'I found these details already:': 'J’ai déjà trouvé ces détails :',
        'I will only ask for what is missing.': 'Je demanderai seulement ce qui manque.',
        'Thanks. I am creating a detailed lost-item report and checking possible matches now.': 'Merci. Je crée un rapport détaillé et cherche des correspondances.',
        'I could not submit the report. Please check the details and try the regular lost item form.': 'Je n’ai pas pu envoyer le rapport. Vérifiez les détails ou utilisez le formulaire normal.',
        'Report created:': 'Rapport créé :',
        'I included color, brand, location, time, and unique features in the description.': 'J’ai inclus la couleur, la marque, le lieu, l’heure et les détails uniques.',
        'Viper submitted your lost item report': 'Viper a envoyé votre rapport d’objet perdu',
        'I could not connect to the server. Please try again or use the regular lost item form.': 'Impossible de se connecter au serveur. Réessayez ou utilisez le formulaire normal.',
        'I did not find a strong public match yet, but your report is saved so staff can review it and contact you if one appears.': 'Je n’ai pas encore trouvé de forte correspondance publique, mais votre rapport est enregistré.',
        'I found possible matches in the found-item database:': 'J’ai trouvé des correspondances possibles dans la base des objets trouvés :',
        'Match score': 'Score de correspondance',
        'electronics': 'électronique',
        'clothing': 'vêtements',
        'accessories': 'accessoires',
        'books': 'livres',
        'sports': 'sports',
        'other': 'autre'
    },
    la: {
        'Home': 'Domus',
        'Browse Items': 'Res Inspicere',
        'Report Found': 'Inventum Nuntiare',
        'Report Lost': 'Amissum Nuntiare',
        'Our Mission': 'Missio Nostra',
        'Stats': 'Numeri',
        'Statistics': 'Numeri',
        'Admin': 'Administrator',
        'Admin Panel': 'Tabula Administratoris',
        'Language': 'Lingua',
        'Select language': 'Linguam elige',
        'Toggle menu': 'Indicem aperire',
        'Lost Something?': 'Aliquid amisisti?',
        'Viking Vault Will Help!': 'Viking Vault te adiuvabit!',
        'Browse Found Items': 'Res Inventas Inspice',
        'Report Found Item': 'Rem Inventam Nuntia',
        'Simple Process': 'Ratio Simplex',
        'How It Works': 'Quomodo Operatur',
        'Report or Search': 'Nuntia vel Quaere',
        'Admin Review': 'Recognitio Curatoris',
        'Submit Claim': 'Petitionem Mitte',
        'Reunited!': 'Redditum!',
        'Recently Found Items': 'Res Nuper Inventae',
        'Latest Finds': 'Inventiones Novissimae',
        'View All Items': 'Omnes Res Vide',
        'Search & Browse': 'Quaere et Inspice',
        'Found Items': 'Res Inventae',
        'Search items...': 'Res quaere...',
        'All': 'Omnia',
        'Electronics': 'Electronica',
        'Clothing': 'Vestimenta',
        'Accessories': 'Instrumenta',
        'Books': 'Libri',
        'Books & Supplies': 'Libri et Instrumenta',
        'Sports': 'Ludi',
        'Sports Equipment': 'Instrumenta Ludorum',
        'Other': 'Alia',
        'Sort by:': 'Ordina:',
        'Newest First': 'Recentissima Primo',
        'Oldest First': 'Vetustissima Primo',
        'No items found': 'Nullae res inventae',
        'Loading items...': 'Res onerantur...',
        'Report a Lost Item': 'Rem Amissam Nuntia',
        'Item Name *': 'Nomen Rei *',
        'Category *': 'Genus *',
        'Select a category': 'Genus elige',
        'Location Lost *': 'Locus Amissionis *',
        'Date Lost *': 'Dies Amissionis *',
        'Description': 'Descriptio',
        'Your Contact Info': 'Notitia Contactus Tui',
        'Your Name *': 'Nomen Tuum *',
        'Email *': 'Epistula Electronica *',
        'Phone (Optional)': 'Telephonum (Libitum)',
        'Submit Report': 'Nuntium Mitte',
        'Our Purpose': 'Propositum Nostrum',
        'Fast & Easy': 'Celer et Facilis',
        'Safe & Secure': 'Tutus et Securus',
        'Lost & Found Statistics': 'Numeri Rerum Amissarum',
        'Items Found': 'Res Inventae',
        'Items Claimed': 'Res Petitae',
        'Success Rate': 'Ratio Successus',
        'Found This Month': 'Hoc Mense Inventae',
        'Items by Category': 'Res per Genus',
        'Help Others': 'Alios Adiuva',
        'Report a Found Item': 'Rem Inventam Nuntia',
        'Location Found *': 'Locus Inventus *',
        'Date Found *': 'Dies Inventus *',
        'Photo (Optional)': 'Imago (Libitum)',
        'Claim This Item': 'Hanc Rem Pete',
        'Cancel': 'Cancella',
        'Ask Viper': 'Viper Roga',
        'AI Assistant': 'Adiutor Artificiosus',
        'Virtual Item Protection and Enhanced Recovery': 'Tutela Virtualis Rerum et Recuperatio Aucta',
        'Type your answer...': 'Responsum scribe...',
        'Send': 'Mitte',
        'Start another report': 'Aliud nuntium incipe',
        'Hi, I am Viper: Virtual Item Protection and Enhanced Recovery. I can help you report a lost item faster and search for possible matches.': 'Salve, ego sum Viper: Tutela Virtualis Rerum et Recuperatio Aucta. Possum rem amissam celerius nuntiare et similia quaerere.',
        'Tell me what happened in a normal sentence. For example: "I lost my blue Nike backpack near the gym yesterday after lunch, and it has a keychain."': 'Dic quid acciderit sententia communi. Exempli gratia: "Perdidi saccum caeruleum Nike prope gymnasium heri post prandium, et catenulam habet."',
        'Which category fits best: electronics, clothing, accessories, books, sports, or other?': 'Quod genus aptissimum est: electronica, vestimenta, instrumenta, libri, ludi, an alia?',
        'What color is it?': 'Qui color est?',
        'What brand is it? If you do not know, type "unknown".': 'Quae marca est? Si nescis, scribe "ignota".',
        'Where did you last see it or lose it?': 'Ubi id novissime vidisti aut amisisti?',
        'About what time did you lose it? A class period or time range is okay.': 'Qua hora fere id amisisti? Tempus classis quoque satis est.',
        'What date did you lose it? Use YYYY-MM-DD if you can, or type "today".': 'Quo die id amisisti? Utere YYYY-MM-DD si potes, aut scribe "hodie".',
        'What unique features, markings, contents, stickers, scratches, or other details would help identify it?': 'Quae signa propria, notae, contenta, pittacia, rimae, aut alia indicia id cognoscere iuvant?',
        'What is your full name?': 'Quod est nomen tuum plenum?',
        'What email should staff use to contact you?': 'Qua epistula electronica ministri te contingant?',
        'Optional: what phone number should staff use? Type "skip" if you prefer email only.': 'Libitum: quo numero telephonico utantur? Scribe "skip" si epistulam solam mavis.',
        'I found these details already:': 'Haec indicia iam inveni:',
        'I will only ask for what is missing.': 'Tantum quae desunt rogabo.',
        'Thanks. I am creating a detailed lost-item report and checking possible matches now.': 'Gratias. Nunc nuntium accuratum creo et similia quaero.',
        'I could not submit the report. Please check the details and try the regular lost item form.': 'Nuntium mittere non potui. Quaeso indicia inspice aut forma ordinaria utere.',
        'Report created:': 'Nuntium creatum:',
        'I included color, brand, location, time, and unique features in the description.': 'Colorem, marcam, locum, tempus, et signa propria in descriptione posui.',
        'Viper submitted your lost item report': 'Viper nuntium rei amissae misit',
        'I could not connect to the server. Please try again or use the regular lost item form.': 'Cum servo coniungi non potui. Iterum tenta aut forma ordinaria utere.',
        'I did not find a strong public match yet, but your report is saved so staff can review it and contact you if one appears.': 'Similem rem publicam nondum inveni, sed nuntium servatum est.',
        'I found possible matches in the found-item database:': 'Similia possibilia in tabula rerum inventarum inveni:',
        'Match score': 'Nota similitudinis',
        'electronics': 'electronica',
        'clothing': 'vestimenta',
        'accessories': 'instrumenta',
        'books': 'libri',
        'sports': 'ludi',
        'other': 'alia'
    }
};

// Extra Spanish strings that were added after the base dictionary.
Object.assign(translations.es, {
    'Viking Vault - South Brunswick High School Lost & Found': 'Viking Vault - Objetos Perdidos y Encontrados de South Brunswick High School',
    'Home page': 'Página de inicio',
    'Browse found items': 'Ver objetos encontrados',
    'Report a found item': 'Reportar un objeto encontrado',
    'Report a lost item': 'Reportar un objeto perdido',
    'Our mission': 'Nuestra misión',
    'View statistics': 'Ver estadísticas',
    'Admin panel': 'Panel de administración',
    'Mobile navigation menu': 'Menú de navegación móvil',
    'Powerful Features': 'Funciones Potentes',
    'Everything you need to': 'Todo lo que necesitas para',
    'reunite Vikings': 'reunir a los Vikings',
    'with their belongings': 'con sus pertenencias',
    'Everything you need to reunite Vikings with their belongings': 'Todo lo que necesitas para reunir a los Vikings con sus pertenencias',
    'Viking Vault makes it effortless to report, track, and recover lost items across South Brunswick High School. Browse current listings, submit a claim, or report something you found — all in just a few clicks.': 'Viking Vault facilita reportar, rastrear y recuperar objetos perdidos en South Brunswick High School. Explora la lista actual, envía un reclamo o reporta algo que encontraste, todo en pocos clics.',
    'Student Testimonials': 'Testimonios de Estudiantes',
    'What Our Students Say': 'Lo Que Dicen Nuestros Estudiantes',
    'See how Viking Vault has helped students reunite with their belongings': 'Mira cómo Viking Vault ha ayudado a estudiantes a recuperar sus pertenencias',
    'Class of 2024': 'Clase de 2024',
    'Class of 2025': 'Clase de 2025',
    'Class of 2026': 'Clase de 2026',
    '"I lost my AirPods case during lunch and thought I\'d never see it again. Two days later, I got an email that someone found it! Viking Vault made it so easy to get my stuff back. This website is a lifesaver!"': '"Perdí mi estuche de AirPods durante el almuerzo y pensé que nunca lo volvería a ver. Dos días después, recibí un correo de que alguien lo encontró. Viking Vault hizo que recuperar mis cosas fuera muy fácil. ¡Este sitio salva vidas!"',
    '"As a senior, I\'ve lost track of how many things I\'ve misplaced. Viking Vault\'s smart matching system found my lost calculator within hours. The email notifications are super helpful - no more checking the website constantly!"': '"Como estudiante de último año, ya perdí la cuenta de cuántas cosas he extraviado. El sistema inteligente de Viking Vault encontró mi calculadora perdida en horas. Las notificaciones por correo ayudan muchísimo."',
    '"I was so stressed when I lost my favorite water bottle. I reported it as lost, and the next day someone had found it! The process was so simple and the admin was really helpful. Love this system!"': '"Me estresé mucho cuando perdí mi botella favorita. La reporté como perdida y al día siguiente alguien la había encontrado. El proceso fue muy simple y el personal ayudó mucho. ¡Me encanta este sistema!"',
    '"The dark mode feature is awesome, and the website is so easy to use. I found my friend\'s lost jacket through Viking Vault. It\'s way better than the old lost and found system. Highly recommend!"': '"El sitio es muy fácil de usar. Encontré la chaqueta perdida de mi amigo con Viking Vault. Es mucho mejor que el sistema anterior de objetos perdidos. ¡Lo recomiendo!"',
    '"I lost my keys right before a big game and was panicking. Someone found them and reported it on Viking Vault. Got them back the same day! This website saved me so much stress. Thank you!"': '"Perdí mis llaves justo antes de un partido importante y estaba en pánico. Alguien las encontró y las reportó en Viking Vault. ¡Las recuperé el mismo día! Este sitio me ahorró mucho estrés."',
    '"The interface is so clean and modern. I love how you can sort items by newest or oldest. Found my lost notebook in minutes! Viking Vault makes the whole lost and found process actually enjoyable."': '"La interfaz es limpia y moderna. Me encanta poder ordenar objetos por más recientes o más antiguos. ¡Encontré mi cuaderno perdido en minutos! Viking Vault hace que el proceso sea mucho mejor."',
    'Found Something?': '¿Encontraste algo?',
    "Help a fellow Viking by reporting the item you found. It only takes a minute to make someone's day!": 'Ayuda a otro Viking reportando el objeto que encontraste. Solo toma un minuto alegrarle el día a alguien.',
    'e.g., Blue Nike Backpack': 'ej., mochila Nike azul',
    'e.g., Library 2nd Floor': 'ej., biblioteca, segundo piso',
    'Describe the item in detail (color, brand, distinguishing features, contents, etc.)': 'Describe el objeto en detalle (color, marca, rasgos distintivos, contenido, etc.)',
    'Your full name': 'Tu nombre completo',
    'your.email@school.edu': 'tu.correo@school.edu',
    'Phone number': 'Número de teléfono',
    'Submit lost item report': 'Enviar reporte de objeto perdido',
    'Viking Vault was created to help students and staff at South Brunswick High School quickly and easily reunite with their lost belongings. We believe that every lost item deserves to find its way home.': 'Viking Vault fue creado para ayudar a estudiantes y personal de South Brunswick High School a recuperar sus pertenencias de forma rápida y sencilla. Creemos que todo objeto perdido merece volver a casa.',
    "With just a few clicks, you can report a found item or search for something you've lost. Our streamlined process makes it simple for everyone to participate.": 'Con solo unos clics puedes reportar un objeto encontrado o buscar algo que perdiste. Nuestro proceso sencillo facilita la participación de todos.',
    'All submissions are reviewed by SBHS staff before being made public. We verify claims to ensure items are returned to their rightful owners.': 'Todos los reportes son revisados por el personal de SBHS antes de hacerse públicos. Verificamos los reclamos para asegurar que los objetos vuelvan a sus dueños.',
    'Our Values': 'Nuestros Valores',
    'Join us in making South Brunswick High School a place where lost items always find their way home.': 'Ayúdanos a hacer de South Brunswick High School un lugar donde los objetos perdidos siempre encuentren el camino de regreso.',
    'See how our community is helping reunite Vikings with their belongings.': 'Mira cómo nuestra comunidad ayuda a reunir a los Vikings con sus pertenencias.',
    'Item name': 'Nombre del objeto',
    'Item category': 'Categoría del objeto',
    'Describe the item in detail (color, brand, distinguishing features, etc.)': 'Describe el objeto en detalle (color, marca, rasgos distintivos, etc.)',
    'Submit found item report': 'Enviar reporte de objeto encontrado',
    'Close Viper assistant': 'Cerrar asistente Viper',
    'Open Viper lost and found assistant': 'Abrir asistente Viper de objetos perdidos',
    'Message Viper': 'Mensaje para Viper',
    'Close modal': 'Cerrar ventana',
    'Sort items': 'Ordenar objetos',
    'Search for items': 'Buscar objetos',
    'Filter: All categories': 'Filtro: todas las categorías',
    'Filter: Electronics': 'Filtro: electrónicos',
    'Filter: Clothing': 'Filtro: ropa',
    'Filter: Accessories': 'Filtro: accesorios',
    'Filter: Books': 'Filtro: libros',
    'Filter: Sports': 'Filtro: deportes',
    'Filter: Other': 'Filtro: otro'
});

Object.assign(translations.es, {
    'Heat Map': 'Mapa de Calor',
    'View lost item heat map': 'Ver mapa de calor de objetos perdidos',
    'Lost Item Heat Map': 'Mapa de Calor de Objetos Perdidos',
    'Where Items Go Missing': 'Dónde Se Pierden los Objetos',
    'Explore common lost-and-found hotspots around school. Larger, warmer spots show areas with more reports.': 'Explora las zonas de la escuela donde más se pierden o encuentran objetos. Los puntos más grandes y cálidos muestran más reportes.',
    'Low reports': 'Pocos reportes',
    'Medium reports': 'Reportes medios',
    'High reports': 'Muchos reportes',
    'Location Details': 'Detalles de Ubicación',
    'Select a hotspot': 'Selecciona un punto',
    'Hover or tap a heat spot to see the location name, total reports, and most common item types there.': 'Pasa el cursor o toca un punto para ver la ubicación, el total de reportes y los tipos de objetos más comunes.',
    'Lost item location hotspots': 'Puntos de objetos perdidos',
    'Heat map intensity legend': 'Leyenda de intensidad del mapa',
    'School floor map heat map background': 'Mapa del piso de la escuela para el mapa de calor',
    'Recovery Insights': 'Información de Recuperación',
    'Smarter Lost & Found Patterns': 'Patrones Más Inteligentes de Objetos Perdidos',
    'Use these trends to understand what gets lost, where it happens, and how often items are recovered.': 'Usa estas tendencias para entender qué se pierde, dónde ocurre y con qué frecuencia se recuperan los objetos.',
    'Most commonly lost item': 'Objeto perdido más común',
    'Most common location': 'Ubicación más común',
    'Waiting for item data...': 'Esperando datos de objetos...',
    'Waiting for location data...': 'Esperando datos de ubicación...',
    'Recovery Rate by Category': 'Tasa de recuperación por categoría',
    'Monthly Trends': 'Tendencias mensuales',
    'Chart showing recovery rate by category': 'Gráfico que muestra la tasa de recuperación por categoría',
    'Chart showing monthly lost and found trends': 'Gráfico que muestra tendencias mensuales de objetos perdidos',
    'Recovery rate by category': 'Tasa de recuperación por categoría'
});

// Extra French strings that were added after the base dictionary.
Object.assign(translations.fr, {
    'Viking Vault - South Brunswick High School Lost & Found': 'Viking Vault - Objets Perdus et Trouvés de South Brunswick High School',
    'Home page': 'Page d’accueil',
    'Browse found items': 'Parcourir les objets trouvés',
    'Report a found item': 'Signaler un objet trouvé',
    'Report a lost item': 'Signaler un objet perdu',
    'Our mission': 'Notre mission',
    'View statistics': 'Voir les statistiques',
    'Admin panel': 'Panneau d’administration',
    'Mobile navigation menu': 'Menu de navigation mobile',
    'Powerful Features': 'Fonctionnalités Puissantes',
    'Everything you need to reunite Vikings with their belongings': 'Tout ce qu’il faut pour réunir les Vikings avec leurs affaires',
    'Everything you need to': 'Tout ce qu’il faut pour',
    'reunite Vikings': 'réunir les Vikings',
    'with their belongings': 'avec leurs affaires',
    'Viking Vault makes it effortless to report, track, and recover lost items across South Brunswick High School. Browse current listings, submit a claim, or report something you found — all in just a few clicks.': 'Viking Vault facilite le signalement, le suivi et la récupération des objets perdus à South Brunswick High School. Parcourez les annonces, envoyez une réclamation ou signalez un objet trouvé en quelques clics.',
    'Student Testimonials': 'Témoignages d’Élèves',
    'What Our Students Say': 'Ce Que Disent Nos Élèves',
    'See how Viking Vault has helped students reunite with their belongings': 'Découvrez comment Viking Vault aide les élèves à retrouver leurs affaires',
    'Class of 2024': 'Promotion 2024',
    'Class of 2025': 'Promotion 2025',
    'Class of 2026': 'Promotion 2026',
    '"I lost my AirPods case during lunch and thought I\'d never see it again. Two days later, I got an email that someone found it! Viking Vault made it so easy to get my stuff back. This website is a lifesaver!"': '"J’ai perdu mon étui AirPods au déjeuner et je pensais ne jamais le revoir. Deux jours plus tard, j’ai reçu un e-mail : quelqu’un l’avait trouvé. Viking Vault a rendu la récupération très simple !"',
    '"As a senior, I\'ve lost track of how many things I\'ve misplaced. Viking Vault\'s smart matching system found my lost calculator within hours. The email notifications are super helpful - no more checking the website constantly!"': '"En terminale, je ne compte plus les choses que j’ai égarées. Le système intelligent de Viking Vault a retrouvé ma calculatrice en quelques heures. Les notifications par e-mail sont très utiles."',
    '"I was so stressed when I lost my favorite water bottle. I reported it as lost, and the next day someone had found it! The process was so simple and the admin was really helpful. Love this system!"': '"J’étais très stressée après avoir perdu ma gourde préférée. Je l’ai signalée, et le lendemain quelqu’un l’avait trouvée. Le processus était simple et l’équipe très utile."',
    '"The dark mode feature is awesome, and the website is so easy to use. I found my friend\'s lost jacket through Viking Vault. It\'s way better than the old lost and found system. Highly recommend!"': '"Le site est très facile à utiliser. J’ai retrouvé la veste perdue de mon ami grâce à Viking Vault. C’est bien mieux que l’ancien système. Je recommande !"',
    '"I lost my keys right before a big game and was panicking. Someone found them and reported it on Viking Vault. Got them back the same day! This website saved me so much stress. Thank you!"': '"J’ai perdu mes clés juste avant un grand match et je paniquais. Quelqu’un les a trouvées et signalées sur Viking Vault. Je les ai récupérées le jour même !"',
    '"The interface is so clean and modern. I love how you can sort items by newest or oldest. Found my lost notebook in minutes! Viking Vault makes the whole lost and found process actually enjoyable."': '"L’interface est claire et moderne. J’aime pouvoir trier les objets du plus récent au plus ancien. J’ai retrouvé mon cahier en quelques minutes !"',
    'Found Something?': 'Vous avez trouvé quelque chose ?',
    "Help a fellow Viking by reporting the item you found. It only takes a minute to make someone's day!": 'Aidez un autre Viking en signalant l’objet trouvé. Une minute peut changer la journée de quelqu’un.',
    'e.g., Blue Nike Backpack': 'ex. sac Nike bleu',
    'e.g., Library 2nd Floor': 'ex. bibliothèque, 2e étage',
    'Describe the item in detail (color, brand, distinguishing features, contents, etc.)': 'Décrivez l’objet en détail (couleur, marque, signes distinctifs, contenu, etc.)',
    'Your full name': 'Votre nom complet',
    'your.email@school.edu': 'votre.email@school.edu',
    'Phone number': 'Numéro de téléphone',
    'Submit lost item report': 'Envoyer le rapport d’objet perdu',
    'Viking Vault was created to help students and staff at South Brunswick High School quickly and easily reunite with their lost belongings. We believe that every lost item deserves to find its way home.': 'Viking Vault a été créé pour aider les élèves et le personnel de South Brunswick High School à retrouver rapidement leurs affaires perdues. Chaque objet perdu mérite de rentrer chez lui.',
    "With just a few clicks, you can report a found item or search for something you've lost. Our streamlined process makes it simple for everyone to participate.": 'En quelques clics, vous pouvez signaler un objet trouvé ou chercher quelque chose que vous avez perdu. Notre processus simple permet à tout le monde de participer.',
    'All submissions are reviewed by SBHS staff before being made public. We verify claims to ensure items are returned to their rightful owners.': 'Toutes les soumissions sont examinées par le personnel de SBHS avant publication. Les réclamations sont vérifiées pour rendre les objets à leurs propriétaires.',
    'Our Values': 'Nos Valeurs',
    'Join us in making South Brunswick High School a place where lost items always find their way home.': 'Aidez-nous à faire de South Brunswick High School un lieu où les objets perdus retrouvent toujours leur chemin.',
    'See how our community is helping reunite Vikings with their belongings.': 'Voyez comment notre communauté aide les Vikings à retrouver leurs affaires.',
    'Item name': 'Nom de l’objet',
    'Item category': 'Catégorie de l’objet',
    'Describe the item in detail (color, brand, distinguishing features, etc.)': 'Décrivez l’objet en détail (couleur, marque, signes distinctifs, etc.)',
    'Submit found item report': 'Envoyer le rapport d’objet trouvé',
    'Close Viper assistant': 'Fermer l’assistant Viper',
    'Open Viper lost and found assistant': 'Ouvrir l’assistant Viper des objets perdus',
    'Message Viper': 'Message à Viper',
    'Close modal': 'Fermer la fenêtre',
    'Sort items': 'Trier les objets',
    'Search for items': 'Rechercher des objets',
    'Filter: All categories': 'Filtre : toutes les catégories',
    'Filter: Electronics': 'Filtre : électronique',
    'Filter: Clothing': 'Filtre : vêtements',
    'Filter: Accessories': 'Filtre : accessoires',
    'Filter: Books': 'Filtre : livres',
    'Filter: Sports': 'Filtre : sports',
    'Filter: Other': 'Filtre : autre'
});

Object.assign(translations.fr, {
    'Heat Map': 'Carte Thermique',
    'View lost item heat map': 'Voir la carte thermique des objets perdus',
    'Lost Item Heat Map': 'Carte Thermique des Objets Perdus',
    'Where Items Go Missing': 'Où les Objets Disparaissent',
    'Explore common lost-and-found hotspots around school. Larger, warmer spots show areas with more reports.': 'Explorez les zones de l’école où les objets sont le plus souvent perdus ou trouvés. Les points plus grands et chauds indiquent plus de signalements.',
    'Low reports': 'Peu de signalements',
    'Medium reports': 'Signalements moyens',
    'High reports': 'Beaucoup de signalements',
    'Location Details': 'Détails du lieu',
    'Select a hotspot': 'Sélectionnez un point',
    'Hover or tap a heat spot to see the location name, total reports, and most common item types there.': 'Survolez ou touchez un point pour voir le lieu, le total des signalements et les types d’objets les plus courants.',
    'Lost item location hotspots': 'Points chauds des objets perdus',
    'Heat map intensity legend': 'Légende de la carte thermique',
    'School floor map heat map background': 'Plan de l’école pour la carte thermique',
    'Recovery Insights': 'Aperçus de Récupération',
    'Smarter Lost & Found Patterns': 'Tendances Plus Intelligentes',
    'Use these trends to understand what gets lost, where it happens, and how often items are recovered.': 'Utilisez ces tendances pour comprendre ce qui est perdu, où cela arrive et à quelle fréquence les objets sont récupérés.',
    'Most commonly lost item': 'Objet le plus souvent perdu',
    'Most common location': 'Lieu le plus fréquent',
    'Waiting for item data...': 'En attente des données...',
    'Waiting for location data...': 'En attente des lieux...',
    'Recovery Rate by Category': 'Taux de récupération par catégorie',
    'Monthly Trends': 'Tendances mensuelles',
    'Chart showing recovery rate by category': 'Graphique du taux de récupération par catégorie',
    'Chart showing monthly lost and found trends': 'Graphique des tendances mensuelles',
    'Recovery rate by category': 'Taux de récupération par catégorie'
});

// Extra Latin strings that were added after the base dictionary.
Object.assign(translations.la, {
    'Viking Vault - South Brunswick High School Lost & Found': 'Viking Vault - Res Amissae et Inventae Scholae South Brunswick',
    'Home page': 'Pagina Domus',
    'Browse found items': 'Res inventas inspice',
    'Report a found item': 'Rem inventam nuntia',
    'Report a lost item': 'Rem amissam nuntia',
    'Our mission': 'Missio nostra',
    'View statistics': 'Numeros vide',
    'Admin panel': 'Tabula administratoris',
    'Mobile navigation menu': 'Index mobilis',
    'South Brunswick High School': 'South Brunswick High School',
    "South Brunswick High School's official lost and found system. Report found items or search for your missing belongings. Let's reunite Vikings with their items!": 'Systema officiale rerum amissarum et inventarum apud South Brunswick High School. Res inventas nuntia aut res amissas quaere.',
    'Powerful Features': 'Munera Valida',
    'Everything you need to reunite Vikings with their belongings': 'Omnia quae opus sunt ut Vikings cum rebus suis reunias',
    'Everything you need to': 'Omnia quae opus sunt ut',
    'reunite Vikings': 'Vikings reunias',
    'with their belongings': 'cum rebus suis',
    'Viking Vault makes it effortless to report, track, and recover lost items across South Brunswick High School. Browse current listings, submit a claim, or report something you found — all in just a few clicks.': 'Viking Vault facile facit res amissas nuntiare, sequi, et recuperare per South Brunswick High School. Indicem inspice, petitionem mitte, aut rem inventam nuntia paucis cliccis.',
    'Student Testimonials': 'Testimonia Discipulorum',
    'What Our Students Say': 'Quid Discipuli Nostri Dicant',
    'See how Viking Vault has helped students reunite with their belongings': 'Vide quomodo Viking Vault discipulos cum rebus suis reuniverit',
    'Class of 2024': 'Classis MMXXIV',
    'Class of 2025': 'Classis MMXXV',
    'Class of 2026': 'Classis MMXXVI',
    '"I lost my AirPods case during lunch and thought I\'d never see it again. Two days later, I got an email that someone found it! Viking Vault made it so easy to get my stuff back. This website is a lifesaver!"': '"Capsam AirPods inter prandium amisi et putavi me eam numquam visurum. Post biduum epistulam accepi aliquem eam invenisse. Viking Vault rem recuperare facile fecit!"',
    '"As a senior, I\'ve lost track of how many things I\'ve misplaced. Viking Vault\'s smart matching system found my lost calculator within hours. The email notifications are super helpful - no more checking the website constantly!"': '"Ut senior, multas res amisi. Systema callidum Viking Vault calculatrum meum intra horas invenit. Nuntia electronica valde utilia sunt."',
    '"I was so stressed when I lost my favorite water bottle. I reported it as lost, and the next day someone had found it! The process was so simple and the admin was really helpful. Love this system!"': '"Valde sollicita eram cum lagenam aquae caram amisi. Eam nuntiavi, et postridie aliquis invenerat. Ratio simplex erat et curatores multum adiuverunt."',
    '"The dark mode feature is awesome, and the website is so easy to use. I found my friend\'s lost jacket through Viking Vault. It\'s way better than the old lost and found system. Highly recommend!"': '"Pagina facillima est usu. Tunicam amici per Viking Vault inveni. Multo melior est quam vetus ratio rerum amissarum."',
    '"I lost my keys right before a big game and was panicking. Someone found them and reported it on Viking Vault. Got them back the same day! This website saved me so much stress. Thank you!"': '"Claves ante magnum ludum amisi et timebam. Aliquis eas invenit et in Viking Vault nuntiavit. Eodem die recepi!"',
    '"The interface is so clean and modern. I love how you can sort items by newest or oldest. Found my lost notebook in minutes! Viking Vault makes the whole lost and found process actually enjoyable."': '"Species paginae clara et moderna est. Amo quod res recentes aut veteres ordinari possunt. Libellum meum intra minuta inveni!"',
    'Found Something?': 'Aliquid invenisti?',
    "Help a fellow Viking by reporting the item you found. It only takes a minute to make someone's day!": 'Adiuva Viking socium rem inventam nuntiando. Unum minutum satis est ut alium laetifices.',
    'e.g., Blue Nike Backpack': 'ex. saccus Nike caeruleus',
    'e.g., Library 2nd Floor': 'ex. bibliotheca, tabulatum secundum',
    'Describe the item in detail (color, brand, distinguishing features, contents, etc.)': 'Rem diligenter describe (color, marca, notae, contenta, etc.)',
    'Your full name': 'Nomen tuum plenum',
    'your.email@school.edu': 'tua.epistula@school.edu',
    'Phone number': 'Numerus telephonicus',
    'Submit lost item report': 'Nuntium rei amissae mitte',
    'Viking Vault was created to help students and staff at South Brunswick High School quickly and easily reunite with their lost belongings. We believe that every lost item deserves to find its way home.': 'Viking Vault creatum est ut discipuli et ministri res amissas celeriter ac facile recuperent. Credimus omnem rem amissam domum invenire debere.',
    "With just a few clicks, you can report a found item or search for something you've lost. Our streamlined process makes it simple for everyone to participate.": 'Paucis cliccis rem inventam nuntiare aut rem amissam quaerere potes. Ratio nostra omnibus facilis est.',
    'All submissions are reviewed by SBHS staff before being made public. We verify claims to ensure items are returned to their rightful owners.': 'Omnia nuntia a ministris SBHS recognoscuntur antequam publica fiant. Petitiones verificamus ut res dominis reddantur.',
    'Our Values': 'Valores Nostri',
    'Ready to Help?': 'Paratusne es adiuvare?',
    'Join us in making South Brunswick High School a place where lost items always find their way home.': 'Nobiscum fac ut South Brunswick High School locus sit ubi res amissae domum semper redeant.',
    'Viking Vault Statistics': 'Numeri Viking Vault',
    'See how our community is helping reunite Vikings with their belongings.': 'Vide quomodo communitas nostra Vikings cum rebus suis reunire adiuvet.',
    'Item name': 'Nomen rei',
    'Item category': 'Genus rei',
    'Describe the item in detail (color, brand, distinguishing features, etc.)': 'Rem diligenter describe (color, marca, notae, etc.)',
    'Submit found item report': 'Nuntium rei inventae mitte',
    'Close Viper assistant': 'Adiutorem Viper claude',
    'Open Viper lost and found assistant': 'Adiutorem Viper aperi',
    'Message Viper': 'Nuntium ad Viper',
    'Close modal': 'Fenestram claude',
    'Sort items': 'Res ordina',
    'Search for items': 'Res quaere',
    'Filter: All categories': 'Filtrum: omnia genera',
    'Filter: Electronics': 'Filtrum: electronica',
    'Filter: Clothing': 'Filtrum: vestimenta',
    'Filter: Accessories': 'Filtrum: instrumenta',
    'Filter: Books': 'Filtrum: libri',
    'Filter: Sports': 'Filtrum: ludi',
    'Filter: Other': 'Filtrum: alia',
    'Try adjusting your search or filters.': 'Quaestionem aut filtra mutare tenta.',
    'Be the first to report a found item!': 'Primus esto qui rem inventam nuntiet!'
});

Object.assign(translations.la, {
    'Heat Map': 'Tabula Caloris',
    'View lost item heat map': 'Tabulam caloris rerum amissarum vide',
    'Lost Item Heat Map': 'Tabula Caloris Rerum Amissarum',
    'Where Items Go Missing': 'Ubi Res Amittantur',
    'Explore common lost-and-found hotspots around school. Larger, warmer spots show areas with more reports.': 'Explora loca scholae ubi res saepe amittuntur aut inveniuntur. Puncta maiora et calidiora plura nuntia significant.',
    'Low reports': 'Pauca nuntia',
    'Medium reports': 'Media nuntia',
    'High reports': 'Multa nuntia',
    'Location Details': 'Singula Loci',
    'Select a hotspot': 'Punctum elige',
    'Hover or tap a heat spot to see the location name, total reports, and most common item types there.': 'Super punctum move aut tange ut nomen loci, numerum nuntiorum, et genera rerum frequentissima videas.',
    'Lost item location hotspots': 'Puncta locorum rerum amissarum',
    'Heat map intensity legend': 'Legenda intensitatis tabulae caloris',
    'School floor map heat map background': 'Imago tabulae scholae pro tabula caloris',
    'Recovery Insights': 'Intellectus Recuperationis',
    'Smarter Lost & Found Patterns': 'Formae Callidiores Rerum Amissarum',
    'Use these trends to understand what gets lost, where it happens, and how often items are recovered.': 'His inclinationibus utere ut intellegas quae res amittantur, ubi accidat, et quam saepe recuperentur.',
    'Most commonly lost item': 'Res saepissime amissa',
    'Most common location': 'Locus frequentissimus',
    'Waiting for item data...': 'Data rerum exspectantur...',
    'Waiting for location data...': 'Data locorum exspectantur...',
    'Recovery Rate by Category': 'Ratio recuperationis per genus',
    'Monthly Trends': 'Inclinationes mensuales',
    'Chart showing recovery rate by category': 'Schema rationis recuperationis per genus',
    'Chart showing monthly lost and found trends': 'Schema inclinationum mensualium',
    'Recovery rate by category': 'Ratio recuperationis per genus'
});

// ========================================
// Internationalization
// ========================================

function initI18n() {
    // Keep the dropdown in sync with the persisted language preference.
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (event) => {
            currentLanguage = event.target.value;
            localStorage.setItem('vikingVaultLanguage', currentLanguage);
            applyTranslations();
            rerenderDynamicContent();
            resetOpenViperForLanguage();
        });
    }

    applyTranslations();
}

function translate(text) {
    // If English is selected, the original page text is already correct.
    if (!text || currentLanguage === 'en') return text;
    return translations[currentLanguage]?.[text] || text;
}

function applyTranslations() {
    // Update both lang and data-language so CSS and screen readers know the active language.
    document.documentElement.lang = currentLanguage;
    document.documentElement.dataset.language = currentLanguage;
    document.title = translate('Viking Vault - South Brunswick High School Lost & Found');

    // Walk visible text nodes and translate them while preserving original English text.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('.items-grid, #modal-body, .toast-container, .viper-messages')) {
                return NodeFilter.FILTER_REJECT;
            }
            return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        if (!node._i18nOriginalText) {
            node._i18nOriginalText = node.textContent.trim();
        }
        const original = node._i18nOriginalText;
        const leading = node.textContent.match(/^\s*/)?.[0] || '';
        const trailing = node.textContent.match(/\s*$/)?.[0] || '';
        node.textContent = `${leading}${translate(original)}${trailing}`;
    });

    // Translate accessibility labels and placeholders in addition to visible text.
    document.querySelectorAll('[placeholder], [aria-label], [title], [alt]').forEach(element => {
        ['placeholder', 'aria-label', 'title', 'alt'].forEach(attribute => {
            if (!element.hasAttribute(attribute)) return;
            const dataKey = `i18nOriginal${attribute.replace(/[^a-z]/gi, '')}`;
            if (!element.dataset[dataKey]) {
                element.dataset[dataKey] = element.getAttribute(attribute);
            }
            element.setAttribute(attribute, translate(element.dataset[dataKey]));
        });
    });
}

function rerenderDynamicContent() {
    // Dynamic item cards and heat map summaries are rendered by JS, so refresh them after language changes.
    if (document.getElementById('browse')?.classList.contains('active')) {
        loadItems();
    }
    if (document.getElementById('heatmap')?.classList.contains('active')) {
        loadHeatmap();
    }
    loadRecentItems();
}

function translateCategory(category) {
    // Category keys come from the database; translate them for display only.
    return translate(category || '');
}

function resetOpenViperForLanguage() {
    // Viper messages are conversation history, so restart the chat if language changes mid-chat.
    const panel = document.getElementById('viper-panel');
    const messages = document.getElementById('viper-messages');
    if (!panel?.classList.contains('open') || !messages?.children.length) return;
    resetViperConversation();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    initNavigation();
    initPhotoUpload();
    initForms();
    initModals();
    initSearch();
    initSorting();
    initLostItemForm();
    initFeaturesShowcase();
    initViperAssistant();
    loadRecentItems();
    setDefaultDate();
});

// ========================================
// Navigation
// ========================================

function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    mobileMenuBtn?.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        mobileMenuBtn.classList.toggle('open');
    });

    // Close mobile menu when clicking a link
    mobileMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileMenuBtn.classList.remove('open');
        });
    });
}

function navigateTo(page) {
    currentPage = page;
    
    // Update active states
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page)?.classList.add('active');
    
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Load data for specific pages
    if (page === 'browse') {
        loadItems();
    } else if (page === 'stats') {
        loadStats();
    } else if (page === 'heatmap') {
        loadHeatmap();
    } else if (page === 'lost') {
        setDefaultDate('lost-item-date');
    } else if (page === 'mission') {
        // Mission page doesn't need data loading
        initMissionButtons();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile menu
    mobileMenu?.classList.remove('open');
}

// ========================================
// Items Loading
// ========================================

async function loadItems() {
    const grid = document.getElementById('browse-items-grid');
    const loading = document.getElementById('loading-items');
    const empty = document.getElementById('no-items-found');

    if (loading) loading.style.display = 'block';
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'none';

    try {
        const params = new URLSearchParams();
        if (currentCategory !== 'all') params.append('category', currentCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort', sortBy);

        const response = await fetch(`/api/items?${params}`);
        items = await response.json();

        if (loading) loading.style.display = 'none';

        if (items.length === 0) {
            if (empty) empty.style.display = 'block';
        } else {
            if (grid) renderItems(grid, items);
        }
    } catch (error) {
        if (loading) loading.style.display = 'none';
        showToast('Failed to load items', 'error');
    }
}

async function loadRecentItems() {
    const grid = document.getElementById('recent-items-grid');
    const empty = document.getElementById('no-recent-items');

    try {
        const response = await fetch('/api/items');
        const items = await response.json();
        const recentItems = items.slice(0, 4);

        if (recentItems.length === 0) {
            empty.style.display = 'block';
        } else {
            renderItems(grid, recentItems);
        }
    } catch (error) {
        console.error('Failed to load recent items:', error);
    }
}

function renderItems(container, items) {
    container.innerHTML = items.map(item => `
        <article class="item-card" data-id="${item.id}">
            <div class="item-image">
                ${item.photo 
                    ? `<img src="${item.photo}" alt="${escapeHtml(item.title)}" loading="lazy">`
                    : `<span class="placeholder-icon">${getCategoryIcon(item.category)}</span>`
                }
            </div>
            <div class="item-content">
                <span class="item-category">${escapeHtml(translateCategory(item.category))}</span>
                <h3 class="item-title">${escapeHtml(item.title)}</h3>
                <div class="item-meta">
                    <span>📍 ${escapeHtml(item.location)}</span>
                    <span>📅 ${formatDate(item.date_found)}</span>
                </div>
            </div>
        </article>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => openItemModal(card.dataset.id));
    });
}

function getCategoryIcon(category) {
    const icons = {
        electronics: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
        clothing: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l1.2 7a2 2 0 0 0 2 1.67h12.24a2 2 0 0 0 2-1.67l1.2-7a2 2 0 0 0-1.34-2.23z"/><path d="M12 9v13"/><path d="M8 9h8"/></svg>',
        accessories: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
        books: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        sports: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
        other: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
    };
    return icons[category] || icons.other;
}

// ========================================
// Search & Filters
// ========================================

function initSearch() {
    // Search input with debounce
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            loadItems();
        }, 300);
    });

    // Category filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            loadItems();
        });
    });
}

// ========================================
// Photo Upload
// ========================================

function initPhotoUpload() {
    const photoInput = document.getElementById('item-photo');
    const placeholder = document.getElementById('upload-placeholder');
    const preview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    const removeBtn = document.getElementById('remove-photo');

    photoInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                photoInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                placeholder.style.display = 'none';
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        photoInput.value = '';
        previewImage.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
    });

    // Drag and drop
    const uploadArea = document.getElementById('photo-upload');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-primary)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                photoInput.files = dataTransfer.files;
                photoInput.dispatchEvent(new Event('change'));
            }
        });
    }
}

// ========================================
// Forms
// ========================================

function initForms() {
    // Report form
    reportForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(reportForm);
        const submitBtn = reportForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        console.debug('Submitting found item report:', Object.fromEntries(formData));
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Submitting...</span>';

        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({ error: `Server error: ${response.status} ${response.statusText}` }));
                console.error('Found item report failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    request: Object.fromEntries(formData),
                    response: result
                });
                showToast(result.error || `Failed to submit item (${response.status})`, 'error');
                console.error('Server response:', result);
                return;
            }

            const result = await response.json();
            showToast(result.message, 'success');
            reportForm.reset();
            const preview = document.getElementById('upload-preview');
            const placeholder = document.getElementById('upload-placeholder');
            if (preview) preview.style.display = 'none';
            if (placeholder) placeholder.style.display = 'block';
            setDefaultDate();
        } catch (error) {
            console.error('Found item report network error:', {
                request: Object.fromEntries(formData),
                error
            });
            showToast(`Failed to submit item: ${error.message || 'Network error. Is the server running?'}`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // Claim form
    claimForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(claimForm);
        const data = Object.fromEntries(formData);
        const submitBtn = claimForm.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            const response = await fetch('/api/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showToast(result.message, 'success');
                closeClaimModal();
                claimForm.reset();
            } else {
                showToast(result.error || 'Failed to submit claim', 'error');
            }
        } catch (error) {
            showToast('Failed to submit claim', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Claim';
        }
    });
}

function setDefaultDate(inputId = 'item-date') {
    const dateInput = document.getElementById(inputId);
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// ========================================
// Modals
// ========================================

function initModals() {
    // Item modal
    document.getElementById('modal-close')?.addEventListener('click', closeItemModal);
    document.querySelector('#item-modal .modal-backdrop')?.addEventListener('click', closeItemModal);

    // Claim modal
    document.getElementById('claim-modal-close')?.addEventListener('click', closeClaimModal);
    document.getElementById('cancel-claim')?.addEventListener('click', closeClaimModal);
    document.querySelector('#claim-modal .modal-backdrop')?.addEventListener('click', closeClaimModal);

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeItemModal();
            closeClaimModal();
        }
    });
}

async function openItemModal(itemId) {
    const modal = document.getElementById('item-modal');
    const body = document.getElementById('modal-body');

    try {
        const response = await fetch(`/api/items/${itemId}`);
        const item = await response.json();

        if (response.ok) {
            body.innerHTML = `
                <div class="item-detail">
                    <div class="item-detail-image">
                        ${item.photo 
                            ? `<img src="${item.photo}" alt="${escapeHtml(item.title)}">`
                            : `<span class="placeholder-icon">${getCategoryIcon(item.category)}</span>`
                        }
                    </div>
                    <div class="item-detail-header">
                        <div>
                            <span class="item-category">${escapeHtml(translateCategory(item.category))}</span>
                            <h2 class="item-detail-title">${escapeHtml(item.title)}</h2>
                        </div>
                    </div>
                    <div class="item-detail-info">
                        <div class="info-row">
                                <span class="info-label">📍 ${escapeHtml(translate('Location Found *').replace(' *', ''))}:</span>
                            <span class="info-value">${escapeHtml(item.location)}</span>
                        </div>
                        <div class="info-row">
                                <span class="info-label">📅 ${escapeHtml(translate('Date Found *').replace(' *', ''))}:</span>
                            <span class="info-value">${formatDate(item.date_found)}</span>
                        </div>
                        ${item.description ? `
                            <div class="info-row">
                                <span class="info-label">📝 ${escapeHtml(translate('Description'))}:</span>
                                <span class="info-value">${escapeHtml(item.description)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="item-detail-actions">
                        <button class="btn btn-primary btn-large" onclick="openClaimModal('${item.id}', '${escapeHtml(item.title).replace(/'/g, "\\'")}')">
                            <span>${escapeHtml(translate('Claim This Item'))}</span>
                        </button>
                        <button class="btn btn-secondary" onclick="closeItemModal()">${escapeHtml(translate('Cancel'))}</button>
                    </div>
                </div>
            `;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        showToast('Failed to load item details', 'error');
    }
}

function closeItemModal() {
    document.getElementById('item-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function openClaimModal(itemId, itemTitle) {
    closeItemModal();
    document.getElementById('claim-item-id').value = itemId;
    document.getElementById('claim-item-name').textContent = itemTitle;
    document.getElementById('claim-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeClaimModal() {
    document.getElementById('claim-modal').classList.remove('open');
    document.body.style.overflow = '';
}

// ========================================
// Toast Notifications
// ========================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close">×</button>
    `;

    toastContainer.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });

    setTimeout(() => removeToast(toast), 5000);
}

function removeToast(toast) {
    toast.style.animation = 'toastSlideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
}

// ========================================
// Utility Functions
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// ========================================
// Sorting
// ========================================

function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            loadItems();
        });
    }
}

// ========================================
// Dark Mode
// ========================================


// ========================================
// Lost Item Form
// ========================================

function initLostItemForm() {
    const lostForm = document.getElementById('lost-form');
    if (lostForm) {
        lostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(lostForm);
            const rawData = Object.fromEntries(formData);
            const locationLost = (rawData.location_lost || rawData.locationLost || '').trim();
            const dateLost = (rawData.date_lost || rawData.dateLost || '').trim();
            const email = (rawData.owner_email || rawData.ownerEmail || rawData.email || '').trim();
            const phone = (rawData.owner_phone || rawData.ownerPhone || rawData.phone || '').trim();
            const description = (rawData.description || '').trim();
            const data = {
                title: (rawData.title || '').trim(),
                category: (rawData.category || '').trim(),
                location_lost: locationLost,
                locationLost,
                date_lost: dateLost,
                dateLost,
                owner_name: (rawData.owner_name || rawData.ownerName || rawData.name || '').trim(),
                owner_email: email,
                email,
                owner_phone: phone,
                phone,
                description
            };

            console.debug('Submitting lost item report:', data);

            try {
                const response = await fetch('/api/lost-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json().catch(() => ({}));
                if (response.ok) {
                    showToast(result.message || 'Report submitted successfully', 'success');
                    lostForm.reset();
                    setDefaultDate('lost-item-date');
                } else {
                    console.error('Lost item report failed:', {
                        status: response.status,
                        statusText: response.statusText,
                        request: data,
                        response: result
                    });
                    showToast(result.error || 'Failed to submit report', 'error');
                }
            } catch (error) {
                console.error('Lost item report network error:', {
                    request: data,
                    error
                });
                showToast('Failed to submit report. Please try again.', 'error');
            }
        });
    }
}

// ========================================
// Viper AI Chat Assistant
// ========================================

// Conversation script for Viper.
// Each object represents one answer Viper needs before submitting a lost-item report.
const viperQuestions = [
    {
        key: 'title',
        question: 'Tell me what happened in a normal sentence. For example: "I lost my blue Nike backpack near the gym yesterday after lunch, and it has a keychain."'
    },
    {
        key: 'category',
        question: 'Which category fits best: electronics, clothing, accessories, books, sports, or other?',
        transform: normalizeViperCategory
    },
    {
        key: 'color',
        question: 'What color is it?'
    },
    {
        key: 'brand',
        question: 'What brand is it? If you do not know, type "unknown".'
    },
    {
        key: 'location_lost',
        question: 'Where did you last see it or lose it?'
    },
    {
        key: 'time_lost',
        question: 'About what time did you lose it? A class period or time range is okay.'
    },
    {
        key: 'date_lost',
        question: 'What date did you lose it? Use YYYY-MM-DD if you can, or type "today".',
        transform: normalizeViperDate
    },
    {
        key: 'features',
        question: 'What unique features, markings, contents, stickers, scratches, or other details would help identify it?'
    },
    {
        key: 'owner_name',
        question: 'What is your full name?'
    },
    {
        key: 'owner_email',
        question: 'What email should staff use to contact you?'
    },
    {
        key: 'owner_phone',
        question: 'Optional: what phone number should staff use? Type "skip" if you prefer email only.',
        transform: value => /^(skip|none|no|saltar|omitir|passer|ignorer|nihil)$/i.test(value.trim()) ? '' : value.trim()
    }
];

// Mutable state for the current Viper conversation.
let viperState = {
    step: 0,
    answers: {},
    submitted: false
};

// Common color words Viper can extract from a user's natural-language description.
const viperColors = [
    'black', 'white', 'gray', 'grey', 'silver', 'blue', 'red', 'green', 'yellow', 'orange',
    'purple', 'pink', 'brown', 'tan', 'beige', 'gold', 'navy', 'teal', 'maroon', 'clear'
];

// Common brands students may mention when describing lost items.
const viperKnownBrands = [
    'nike', 'adidas', 'apple', 'samsung', 'sony', 'jbl', 'under armour', 'north face',
    'jansport', 'herschel', 'stanley', 'hydro flask', 'yeti', 'casio', 'ti', 'texas instruments'
];

// Synonym groups help Viper match reports that use different words for the same idea.
const viperSynonymGroups = [
    ['phone', 'cell', 'cellphone', 'iphone', 'android', 'mobile'],
    ['laptop', 'computer', 'macbook', 'chromebook'],
    ['earbuds', 'airpods', 'headphones', 'earphones'],
    ['backpack', 'bag', 'bookbag', 'knapsack'],
    ['hoodie', 'sweatshirt', 'jacket', 'coat'],
    ['water', 'bottle', 'thermos', 'flask', 'stanley', 'hydro'],
    ['calculator', 'calc', 'casio', 'ti'],
    ['keys', 'key', 'keychain', 'lanyard'],
    ['notebook', 'binder', 'folder', 'book'],
    ['gym', 'locker', 'athletic', 'sports'],
    ['cafeteria', 'lunchroom', 'commons'],
    ['library', 'media', 'books']
];

function initViperAssistant() {
    // Cache all chatbox controls before wiring click and submit events.
    const toggle = document.getElementById('viper-toggle');
    const close = document.getElementById('viper-close');
    const panel = document.getElementById('viper-panel');
    const form = document.getElementById('viper-form');
    const input = document.getElementById('viper-input');

    if (!toggle || !panel || !form || !input) return;

    toggle.addEventListener('click', () => {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            startViperConversation();
            input.focus();
        }
    });

    close?.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message || viperState.submitted) return;

        input.value = '';
        addViperMessage(message, 'user');
        await handleViperAnswer(message);
    });
}

function startViperConversation() {
    // Avoid duplicating the welcome message if the user opens/closes Viper repeatedly.
    const messages = document.getElementById('viper-messages');
    if (!messages || messages.children.length > 0) return;

    addViperMessage(translate('Hi, I am Viper: Virtual Item Protection and Enhanced Recovery. I can help you report a lost item faster and search for possible matches.'), 'bot');
    addViperMessage(translate(viperQuestions[0].question), 'bot');
}

async function handleViperAnswer(message) {
    // The first answer is treated as a natural-language description.
    // Viper extracts details from it and skips questions that were already answered.
    const currentQuestion = viperQuestions[viperState.step];
    if (viperState.step === 0) {
        const parsedDetails = parseViperNaturalLanguage(message);
        viperState.answers = { ...viperState.answers, ...parsedDetails };

        const summary = summarizeViperExtractedDetails(parsedDetails);
        if (summary) {
            addViperMessage(`${translate('I found these details already:')} ${summary}. ${translate('I will only ask for what is missing.')}`, 'bot');
        }
    } else {
        const value = currentQuestion.transform ? currentQuestion.transform(message) : message.trim();
        viperState.answers[currentQuestion.key] = value;
    }

    viperState.step = getNextViperQuestionIndex(viperState.step + 1);

    if (viperState.step !== -1) {
        addViperMessage(translate(viperQuestions[viperState.step].question), 'bot');
        return;
    }

    viperState.submitted = true;
    addViperMessage(translate('Thanks. I am creating a detailed lost-item report and checking possible matches now.'), 'bot');
    await submitViperReport();
}

async function submitViperReport() {
    // Convert the conversation answers into the same JSON shape used by the lost-item form.
    const report = buildViperReport(viperState.answers);

    try {
        const response = await fetch('/api/lost-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            addViperMessage(result.error || translate('I could not submit the report. Please check the details and try the regular lost item form.'), 'bot');
            resetViperAfterDelay();
            return;
        }

        addViperMessage(`${translate('Report created:')} ${report.title}. ${translate('I included color, brand, location, time, and unique features in the description.')}`, 'bot');
        const matches = await findViperMatches(report);
        renderViperMatches(matches);
        showToast(translate('Viper submitted your lost item report'), 'success');
    } catch (error) {
        addViperMessage(translate('I could not connect to the server. Please try again or use the regular lost item form.'), 'bot');
        resetViperAfterDelay();
    }
}

function buildViperReport(answers) {
    // The backend accepts a single description field, so Viper combines structured details there.
    const description = [
        `Color: ${answers.color || 'Not specified'}`,
        `Brand: ${answers.brand || 'Not specified'}`,
        `Time lost: ${answers.time_lost || 'Not specified'}`,
        `Unique features: ${answers.features || 'Not specified'}`,
        `Original description: ${answers.natural_description || 'Not specified'}`,
        `Generated by Viper AI assistant.`
    ].join('\n');

    return {
        title: answers.title,
        category: answers.category,
        location_lost: answers.location_lost,
        date_lost: answers.date_lost,
        owner_name: answers.owner_name,
        owner_email: answers.owner_email,
        owner_phone: answers.owner_phone || '',
        description
    };
}

async function findViperMatches(report) {
    // Search public approved/claimed found items and score likely matches locally.
    const response = await fetch('/api/items');
    const foundItems = await response.json();
    const reportText = [
        report.title,
        report.category,
        report.location_lost,
        report.description
    ].join(' ').toLowerCase();

    return foundItems
        .map(item => {
            const itemText = [
                item.title,
                item.category,
                item.location,
                item.description
            ].join(' ').toLowerCase();
            const score = scoreViperMatch(report, reportText, item, itemText);
            return { item, score };
        })
        .filter(match => match.score >= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

function scoreViperMatch(report, reportText, item, itemText) {
    // Score higher when category, location, or synonym-expanded keywords overlap.
    let score = 0;
    const keywords = expandViperSearchTerms(reportText
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !['the', 'and', 'for', 'not', 'lost', 'item', 'viper', 'generated', 'assistant', 'color', 'brand', 'time', 'unique', 'features', 'specified'].includes(word)));

    if (item.category === report.category) score += 3;
    if (sameViperMeaning(item.category, report.category)) score += 2;
    if (item.location && report.location_lost && locationsViperOverlap(item.location, report.location_lost)) score += 3;
    keywords.forEach(word => {
        if (itemText.includes(word)) score += 1;
    });

    return score;
}

function expandViperSearchTerms(words) {
    // Add synonyms to the search term set so wording differences still match.
    const expandedTerms = new Set(words);

    words.forEach(word => {
        viperSynonymGroups.forEach(group => {
            if (group.includes(word)) {
                group.forEach(term => expandedTerms.add(term));
            }
        });
    });

    return [...expandedTerms];
}

function sameViperMeaning(valueA = '', valueB = '') {
    // Compares two text values directly and by synonym group membership.
    if (!valueA || !valueB) return false;
    const a = valueA.toLowerCase();
    const b = valueB.toLowerCase();
    if (a === b || a.includes(b) || b.includes(a)) return true;

    return viperSynonymGroups.some(group => group.some(term => a.includes(term)) && group.some(term => b.includes(term)));
}

function locationsViperOverlap(locationA, locationB) {
    // Treats similar location wording as overlap, such as "cafeteria" and "lunchroom".
    const termsA = expandViperSearchTerms(locationA.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word.length > 2));
    const termsB = expandViperSearchTerms(locationB.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word.length > 2));
    return termsA.some(term => termsB.includes(term));
}

function renderViperMatches(matches) {
    // Show either a no-match message or clickable found-item candidates.
    if (!matches.length) {
        addViperMessage(translate('I did not find a strong public match yet, but your report is saved so staff can review it and contact you if one appears.'), 'bot');
        resetViperAfterDelay();
        return;
    }

    const matchList = matches.map(({ item, score }) => `
        <button type="button" class="viper-match" data-id="${escapeHtml(item.id)}">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(translateCategory(item.category))} • ${escapeHtml(item.location)} • ${formatDate(item.date_found)}</span>
            <em>${escapeHtml(translate('Match score'))}: ${score}</em>
        </button>
    `).join('');

    addViperMessage(`${translate('I found possible matches in the found-item database:')} ${matches.length}`, 'bot');
    addViperMessage(`<div class="viper-matches">${matchList}</div>`, 'bot', true);

    document.querySelectorAll('.viper-match').forEach(button => {
        button.addEventListener('click', () => openItemModal(button.dataset.id));
    });

    resetViperAfterDelay();
}

function parseViperNaturalLanguage(message) {
    // Lightweight NLP-style parsing: infer category, color, brand, date, time, location, title, and features.
    const original = message.trim();
    const lower = original.toLowerCase();
    const category = inferViperCategory(lower);
    const color = viperColors.find(candidate => new RegExp(`\\b${candidate}\\b`, 'i').test(lower)) || '';
    const brand = viperKnownBrands.find(candidate => new RegExp(`\\b${candidate.replace(/\s+/g, '\\s+')}\\b`, 'i').test(lower)) || '';
    const date_lost = inferViperDate(lower);
    const time_lost = inferViperTime(original);
    const location_lost = inferViperLocation(original);
    const title = inferViperTitle(original, category, color, brand);
    const features = inferViperFeatures(original);

    return {
        natural_description: original,
        title,
        category,
        color,
        brand,
        location_lost,
        time_lost,
        date_lost,
        features
    };
}

function getNextViperQuestionIndex(startIndex) {
    // Finds the next unanswered question after natural-language extraction.
    for (let i = startIndex; i < viperQuestions.length; i++) {
        const key = viperQuestions[i].key;
        const answer = viperState.answers[key];
        if (!answer || String(answer).trim() === '') return i;
    }
    return -1;
}

function summarizeViperExtractedDetails(details) {
    // Builds a readable summary of what Viper understood from the first sentence.
    const summaryParts = [
        details.title ? `item: ${details.title}` : '',
        details.category ? `category: ${details.category}` : '',
        details.color ? `color: ${details.color}` : '',
        details.brand ? `brand: ${details.brand}` : '',
        details.location_lost ? `location: ${details.location_lost}` : '',
        details.date_lost ? `date: ${details.date_lost}` : '',
        details.time_lost ? `time: ${details.time_lost}` : '',
        details.features ? `features: ${details.features}` : ''
    ].filter(Boolean);

    return summaryParts.join(', ');
}

function inferViperCategory(text) {
    // Maps common item words to the database category values expected by the backend.
    const categoryHints = {
        electronics: ['phone', 'cell', 'iphone', 'android', 'laptop', 'computer', 'chromebook', 'airpods', 'earbuds', 'headphones', 'calculator', 'charger', 'tablet'],
        clothing: ['hoodie', 'sweatshirt', 'jacket', 'coat', 'shirt', 'pants', 'shorts', 'hat', 'gloves'],
        accessories: ['keys', 'keychain', 'lanyard', 'wallet', 'purse', 'watch', 'glasses', 'id', 'badge'],
        books: ['book', 'textbook', 'notebook', 'binder', 'folder', 'planner'],
        sports: ['ball', 'cleats', 'bat', 'glove', 'helmet', 'jersey', 'racket', 'water bottle', 'bottle']
    };

    for (const [category, hints] of Object.entries(categoryHints)) {
        if (hints.some(hint => text.includes(hint))) return category;
    }

    return '';
}

function inferViperDate(text) {
    // Supports ISO dates plus natural words like today/yesterday.
    const isoDate = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (isoDate) return isoDate[0];
    if (/\btoday\b/.test(text)) return normalizeViperDate('today');
    if (/\byesterday\b/.test(text)) return normalizeViperDate('yesterday');

    const weekday = text.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (weekday) return weekday[0];

    return '';
}

function inferViperTime(text) {
    // Extracts clock times and school-day phrases like "after lunch" or "during period 2".
    const clockTime = text.match(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i);
    if (clockTime) return clockTime[0];

    const timePhrase = text.match(/\b(before|after|during)\s+(school|lunch|practice|class|dismissal|period\s+\d+|[a-z]+\s+period)\b/i);
    if (timePhrase) return timePhrase[0];

    const generalTime = text.match(/\b(morning|afternoon|evening|lunch|dismissal)\b/i);
    return generalTime ? generalTime[0] : '';
}

function inferViperLocation(text) {
    // Looks for prepositions and known school places to infer the loss location.
    const locationMatch = text.match(/\b(?:near|by|at|in|inside|outside|around)\s+([^,.!?]+?)(?:\s+(?:today|yesterday|before|after|during|with|has|and it|but)|[,.!?]|$)/i);
    if (locationMatch) return locationMatch[1].trim();

    const knownPlaces = ['gym', 'library', 'cafeteria', 'main office', 'bus', 'hallway', 'locker room', 'auditorium', 'classroom', 'parking lot'];
    return knownPlaces.find(place => text.toLowerCase().includes(place)) || '';
}

function inferViperTitle(text, category, color, brand) {
    // Creates a concise item title from detected color, brand, and item noun.
    const lower = text.toLowerCase();
    const itemWords = [
        'backpack', 'bookbag', 'bag', 'phone', 'iphone', 'laptop', 'chromebook', 'calculator',
        'airpods', 'earbuds', 'headphones', 'hoodie', 'jacket', 'coat', 'keys', 'wallet',
        'water bottle', 'bottle', 'notebook', 'binder', 'textbook', 'folder', 'glasses'
    ];
    const itemWord = itemWords.find(word => lower.includes(word));
    if (!itemWord) return text.slice(0, 70);

    return [color, brand, itemWord]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function inferViperFeatures(text) {
    // Pulls identifying details such as stickers, scratches, keychains, cases, or names.
    const featureMatch = text.match(/\b(?:with|has|had|containing|that has)\s+([^.!?]+)$/i);
    if (featureMatch) return featureMatch[1].trim();

    const uniqueHints = ['sticker', 'scratch', 'keychain', 'case', 'initials', 'name', 'logo', 'dent', 'crack'];
    const lower = text.toLowerCase();
    return uniqueHints
        .filter(hint => lower.includes(hint))
        .join(', ');
}

function addViperMessage(message, sender, isHtml = false) {
    // Appends one chat bubble and scrolls the conversation to the newest message.
    const messages = document.getElementById('viper-messages');
    if (!messages) return;

    const bubble = document.createElement('div');
    bubble.className = `viper-message ${sender}`;
    if (isHtml) {
        bubble.innerHTML = message;
    } else {
        bubble.textContent = message;
    }
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
}

function resetViperAfterDelay() {
    // Offers a restart button after Viper finishes submitting/searching.
    const input = document.getElementById('viper-input');
    if (input) input.placeholder = translate('Start another report');
    addViperMessage(`<button type="button" class="viper-restart" id="viper-restart">${escapeHtml(translate('Start another report'))}</button>`, 'bot', true);
    document.getElementById('viper-restart')?.addEventListener('click', resetViperConversation);
}

function resetViperConversation() {
    // Clears the current conversation and starts a fresh report flow.
    const messages = document.getElementById('viper-messages');
    const input = document.getElementById('viper-input');

    viperState = {
        step: 0,
        answers: {},
        submitted: false
    };

    if (messages) messages.innerHTML = '';
    if (input) {
        input.value = '';
        input.placeholder = translate('Type your answer...');
        input.focus();
    }
    startViperConversation();
}

function normalizeViperCategory(value) {
    const cleaned = value.toLowerCase().trim();
    const categoryMap = {
        electronics: 'electronics',
        electronic: 'electronics',
        electrónicos: 'electronics',
        electronicos: 'electronics',
        électronique: 'electronics',
        electronica: 'electronics',
        phone: 'electronics',
        laptop: 'electronics',
        clothing: 'clothing',
        clothes: 'clothing',
        ropa: 'clothing',
        vêtements: 'clothing',
        vetements: 'clothing',
        vestimenta: 'clothing',
        jacket: 'clothing',
        accessories: 'accessories',
        accessory: 'accessories',
        accesorios: 'accessories',
        accessoires: 'accessories',
        instrumenta: 'accessories',
        keys: 'accessories',
        books: 'books',
        book: 'books',
        libros: 'books',
        livres: 'books',
        libri: 'books',
        supplies: 'books',
        sports: 'sports',
        sport: 'sports',
        deportes: 'sports',
        ludi: 'sports',
        other: 'other'
    };
    return categoryMap[cleaned] || 'other';
}

function normalizeViperDate(value) {
    const cleaned = value.trim().toLowerCase();
    if (['today', 'hoy', 'aujourd’hui', "aujourd'hui", 'hodie'].includes(cleaned)) return new Date().toISOString().split('T')[0];
    if (['yesterday', 'ayer', 'hier', 'heri'].includes(cleaned)) {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
}

// ========================================
// Statistics
// ========================================

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        // Update stat cards
        const totalEl = document.getElementById('stat-total-found');
        const claimedEl = document.getElementById('stat-claimed');
        const rateEl = document.getElementById('stat-success-rate');
        const monthEl = document.getElementById('stat-this-month');
        
        if (totalEl) totalEl.textContent = stats.totalFoundItems || 0;
        if (claimedEl) claimedEl.textContent = stats.claimedItems || 0;
        if (rateEl) rateEl.textContent = `${stats.successRate || 0}%`;
        if (monthEl) monthEl.textContent = stats.itemsThisMonth || 0;

        // Create category chart
        const ctx = document.getElementById('category-chart');
        if (ctx && typeof Chart !== 'undefined') {
            if (categoryChartInstance) categoryChartInstance.destroy();
            categoryChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(stats.categoryCounts || {}),
                    datasets: [{
                        data: Object.values(stats.categoryCounts || {}),
                        backgroundColor: [
                            '#ffe2eb',
                            '#fadbcc',
                            '#fae2f5',
                            '#ffdada',
                            '#fffbea',
                            '#d88a7b'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        await loadRecoveryInsights();
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadRecoveryInsights() {
    // Recovery insights reuse the approved public item list so no new frontend data source is needed.
    try {
        const response = await fetch('/api/items');
        const foundItems = await response.json();
        const insights = buildRecoveryInsights(foundItems);
        renderRecoveryInsightCards(insights);
        renderRecoveryCharts(insights);
    } catch (error) {
        console.error('Failed to load recovery insights:', error);
    }
}

function buildRecoveryInsights(foundItems) {
    // Aggregates found items into counts by item type, location, category recovery rate, and month.
    const itemTypeCounts = {};
    const locationCounts = {};
    const categoryStats = {};
    const monthlyStats = {};

    foundItems.forEach(item => {
        const itemType = normalizeInsightItemType(item.title || item.category || 'Unknown');
        itemTypeCounts[itemType] = (itemTypeCounts[itemType] || 0) + 1;

        const location = normalizeInsightLabel(item.location || 'Unknown');
        locationCounts[location] = (locationCounts[location] || 0) + 1;

        const category = item.category || 'other';
        if (!categoryStats[category]) {
            categoryStats[category] = { total: 0, claimed: 0 };
        }
        categoryStats[category].total += 1;
        if (item.status === 'claimed') {
            categoryStats[category].claimed += 1;
        }

        const month = getInsightMonth(item.date_found || item.created_at);
        if (!monthlyStats[month]) {
            monthlyStats[month] = { total: 0, claimed: 0 };
        }
        monthlyStats[month].total += 1;
        if (item.status === 'claimed') {
            monthlyStats[month].claimed += 1;
        }
    });

    return {
        commonItem: getTopInsightEntry(itemTypeCounts),
        commonLocation: getTopInsightEntry(locationCounts),
        categoryRates: Object.entries(categoryStats).map(([category, data]) => ({
            category,
            total: data.total,
            claimed: data.claimed,
            rate: data.total ? Math.round((data.claimed / data.total) * 100) : 0
        })).sort((a, b) => b.rate - a.rate || b.total - a.total),
        monthlyTrends: Object.entries(monthlyStats)
            .map(([month, data]) => ({ month, total: data.total, claimed: data.claimed }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6)
    };
}

function renderRecoveryInsightCards(insights) {
    // Updates the two summary cards above the recovery charts.
    const commonItemEl = document.getElementById('insight-common-item');
    const commonItemDetailEl = document.getElementById('insight-common-item-detail');
    const commonLocationEl = document.getElementById('insight-common-location');
    const commonLocationDetailEl = document.getElementById('insight-common-location-detail');

    if (commonItemEl) commonItemEl.textContent = insights.commonItem.label || translate('No items found');
    if (commonItemDetailEl) commonItemDetailEl.textContent = insights.commonItem.count
        ? `${insights.commonItem.count} ${translate('Items Found').toLowerCase()}`
        : translate('Waiting for item data...');

    if (commonLocationEl) commonLocationEl.textContent = insights.commonLocation.label || translate('No items found');
    if (commonLocationDetailEl) commonLocationDetailEl.textContent = insights.commonLocation.count
        ? `${insights.commonLocation.count} ${translate('Items Found').toLowerCase()}`
        : translate('Waiting for location data...');
}

function renderRecoveryCharts(insights) {
    // Draws Chart.js visualizations for category recovery rate and month-by-month trends.
    if (typeof Chart === 'undefined') return;

    const recoveryCtx = document.getElementById('recovery-rate-chart');
    if (recoveryCtx) {
        if (recoveryRateChartInstance) recoveryRateChartInstance.destroy();
        recoveryRateChartInstance = new Chart(recoveryCtx, {
            type: 'bar',
            data: {
                labels: insights.categoryRates.map(item => translateCategory(item.category)),
                datasets: [{
                    label: translate('Recovery rate by category'),
                    data: insights.categoryRates.map(item => item.rate),
                    backgroundColor: ['#ffe2eb', '#fadbcc', '#fae2f5', '#ffdada', '#d88a7b', '#fffbea'],
                    borderColor: '#17120a',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        }
                    }
                }
            }
        });
    }

    const monthlyCtx = document.getElementById('monthly-trends-chart');
    if (monthlyCtx) {
        if (monthlyTrendsChartInstance) monthlyTrendsChartInstance.destroy();
        monthlyTrendsChartInstance = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: insights.monthlyTrends.map(item => formatInsightMonth(item.month)),
                datasets: [
                    {
                        label: translate('Items Found'),
                        data: insights.monthlyTrends.map(item => item.total),
                        borderColor: '#7b3f32',
                        backgroundColor: '#ffe2eb',
                        tension: 0.35
                    },
                    {
                        label: translate('Items Claimed'),
                        data: insights.monthlyTrends.map(item => item.claimed),
                        borderColor: '#b86b5e',
                        backgroundColor: '#fae2f5',
                        tension: 0.35
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
}

function normalizeInsightItemType(title) {
    // Converts a free-text title like "Blue Nike Backpack" into a reusable type like "Backpack".
    const lower = title.toLowerCase();
    const knownTypes = ['backpack', 'phone', 'keys', 'key', 'airpods', 'earbuds', 'headphones', 'calculator', 'jacket', 'hoodie', 'water bottle', 'bottle', 'notebook', 'binder', 'wallet', 'glasses', 'laptop', 'book'];
    const match = knownTypes.find(type => lower.includes(type));
    return normalizeInsightLabel(match || title.split(/\s+/).slice(-2).join(' '));
}

function normalizeInsightLabel(value) {
    // Normalizes labels into title case for cleaner display.
    return value
        .toString()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

function getTopInsightEntry(counts) {
    // Returns the most frequent label/count pair from a count object.
    const [label = '', count = 0] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    return { label, count };
}

function getInsightMonth(dateValue) {
    // Converts dates into YYYY-MM buckets so monthly trend data groups consistently.
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatInsightMonth(monthValue) {
    // Converts a YYYY-MM bucket into a user-friendly label such as "Jun 2026".
    if (monthValue === 'Unknown') return monthValue;
    const [year, month] = monthValue.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

// ========================================
// Lost Item Heat Map
// ========================================

const locationCoordinates = {
    // Percent coordinates position each known location on top of the floor map image.
    'Library': { x: 52, y: 76 }, // Updated from map debug click.
    'Auditorium': { x: 74, y: 71 },
    'Main Gym': { x: 38, y: 37 },
    'Main Entrance': { x: 47, y: 74 },
    'Red Cafeteria': { x: 39, y: 60 },
    'Blue Cafeteria': { x: 40, y: 70 },
    'Annex Gym': { x: 44, y: 18 },
    'Auxillary Gym': { x: 30, y: 30 },
    'Freshman Cafeteria': { x: 57, y: 30 },
    'Guidance': { x: 56, y: 68 },
    'Guidance Office': { x: 56, y: 68 },
    'Court Yard': { x: 55, y: 58 },
    'Main Entrance': { x: 50, y: 85 },
    'Athletics Entrance': { x: 13, y: 50 },
    'Annex Entrance': { x: 86, y: 32 },
    'Music Room': { x: 76, y: 18 },
    'Music Wing': { x: 76, y: 18 },
    'Other': { x: 50, y: 50 },
};

const locationAliases = {
    'Cafeteria': 'Red Cafeteria',
    'Gym': 'Main Gym',
    'Office': 'Main Office',
    'Entrance': 'Main Entrance'
};

async function loadHeatmap() {
    // Fetch aggregated location data and render responsive hotspots over the map.
    const map = document.getElementById('heatmap-map');
    const hotspotLayer = document.getElementById('heatmap-hotspots');
    const detailList = document.getElementById('heatmap-detail-list');
    if (!hotspotLayer || !detailList) return;

    initHeatmapDebugMode(map);

    hotspotLayer.innerHTML = '<div class="heatmap-loading">Loading heat map data...</div>';
    detailList.innerHTML = '';

    try {
        const response = await fetch('/api/heatmap');
        if (!response.ok) {
            throw new Error(`Heat map request failed with status ${response.status}`);
        }

        const data = await response.json();
        const locations = data.locations || [];
        renderHeatmap(locations);
    } catch (error) {
        console.error('Failed to load heat map data:', error);
        hotspotLayer.innerHTML = '<div class="heatmap-loading">Unable to load heat map data.</div>';
    }
}

function initHeatmapDebugMode(map) {
    // Debug helper: click anywhere on the map to print percentage coordinates.
    if (!map || map.dataset.debugCoordinatesReady === 'true') return;
    map.dataset.debugCoordinatesReady = 'true';

    map.addEventListener('click', (event) => {
        const bounds = map.getBoundingClientRect();
        const x = Number((((event.clientX - bounds.left) / bounds.width) * 100).toFixed(2));
        const y = Number((((event.clientY - bounds.top) / bounds.height) * 100).toFixed(2));

        console.log('Heat map coordinate:', { x, y });
        console.log(`"Location Name": { x: ${x}, y: ${y} },`);
    });
}

function renderHeatmap(locations) {
    // Converts heat map data into buttons positioned over the map image.
    const hotspotLayer = document.getElementById('heatmap-hotspots');
    const detailList = document.getElementById('heatmap-detail-list');
    const combinedLocations = combineHeatmapLocations(locations);
    const maxCount = Math.max(1, ...combinedLocations.map(location => location.count));

    hotspotLayer.innerHTML = '';
    detailList.innerHTML = combinedLocations.length
        ? combinedLocations
            .sort((a, b) => b.count - a.count)
            .map(location => `
                <button class="heatmap-list-item" type="button" data-location="${escapeHtml(location.location)}">
                    <strong>${escapeHtml(location.location)}</strong>
                    <span>${location.count} reports</span>
                </button>
            `).join('')
        : '<p>No report locations yet.</p>';

    if (!combinedLocations.length) {
        hotspotLayer.innerHTML = '<div class="heatmap-loading">No report locations yet.</div>';
        return;
    }

    combinedLocations.forEach(location => {
        const coordinates = locationCoordinates[location.location] || locationCoordinates.Other;
        const intensity = getHeatmapIntensity(location.count, maxCount);
        const size = 28 + Math.round((location.count / maxCount) * 32);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `heatmap-hotspot ${intensity}`;
        button.style.left = `${coordinates.x}%`;
        button.style.top = `${coordinates.y}%`;
        button.style.width = `${size}px`;
        button.style.height = `${size}px`;
        button.setAttribute('aria-label', `${location.location}: ${location.count} reports`);
        button.innerHTML = `<span>${location.count}</span>`;
        button.addEventListener('mouseenter', () => showHeatmapDetails(location));
        button.addEventListener('focus', () => showHeatmapDetails(location));
        button.addEventListener('click', () => showHeatmapDetails(location));
        hotspotLayer.appendChild(button);
    });

    detailList.querySelectorAll('.heatmap-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const location = combinedLocations.find(entry => entry.location === item.dataset.location);
            if (location) showHeatmapDetails(location);
        });
    });

    showHeatmapDetails(combinedLocations.sort((a, b) => b.count - a.count)[0]);
}

function combineHeatmapLocations(locations) {
    // Combine repeated reports for the same saved coordinate into one hotspot.
    const groupedLocations = {};

    locations.forEach(location => {
        const coordinateName = locationAliases[location.location] || location.location;
        const locationName = locationCoordinates[coordinateName] ? coordinateName : 'Other';

        if (!groupedLocations[locationName]) {
            groupedLocations[locationName] = {
                location: locationName,
                count: 0,
                foundCount: 0,
                lostCount: 0,
                itemTypeCounts: {}
            };
        }

        const bucket = groupedLocations[locationName];
        bucket.count += Number(location.count) || 0;
        bucket.foundCount += Number(location.foundCount) || 0;
        bucket.lostCount += Number(location.lostCount) || 0;

        (location.commonItemTypes || []).forEach(item => {
            bucket.itemTypeCounts[item.type] = (bucket.itemTypeCounts[item.type] || 0) + item.count;
        });
    });

    return Object.values(groupedLocations).map(location => ({
        location: location.location,
        count: location.count,
        foundCount: location.foundCount,
        lostCount: location.lostCount,
        commonItemTypes: Object.entries(location.itemTypeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type, count]) => ({ type, count }))
    }));
}

function showHeatmapDetails(location) {
    // Updates the details panel when a hotspot or list item is hovered/focused/clicked.
    const detailPanel = document.getElementById('heatmap-details');
    if (!detailPanel) return;

    const itemTypeText = location.commonItemTypes?.length
        ? location.commonItemTypes.map(item => `${item.type} (${item.count})`).join(', ')
        : 'No common item types yet';

    detailPanel.querySelector('h2').textContent = location.location;
    detailPanel.querySelector('p').textContent = `${location.count} total reports: ${location.lostCount} lost, ${location.foundCount} found.`;

    const detailList = document.getElementById('heatmap-detail-list');
    const summary = document.getElementById('heatmap-selected-summary') || document.createElement('div');
    summary.id = 'heatmap-selected-summary';
    summary.className = 'heatmap-selected-summary';
    summary.innerHTML = `
        <h3>Most common item types</h3>
        <p>${escapeHtml(itemTypeText)}</p>
    `;
    detailList?.prepend(summary);
}

function getHeatmapIntensity(count, maxCount) {
    // Maps relative count intensity to visual classes used by CSS.
    const ratio = count / maxCount;
    if (ratio >= 0.67) return 'high';
    if (ratio >= 0.34) return 'medium';
    return 'low';
}

// ========================================
// Mission Page Buttons
// ========================================

function initMissionButtons() {
    // Mission page buttons are handled by navigation system via data-page attribute
    // This function is called when mission page is loaded
    const missionButtons = document.querySelectorAll('#mission button[data-page]');
    missionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-page');
            if (page) {
                navigateTo(page);
            }
        });
    });
}

// ========================================
// Feature Showcase (Grid Layout)
// ========================================

function initFeaturesShowcase() {
    const showcase = document.querySelector('.features-showcase');
    if (!showcase) return;
    
    // Scroll-triggered animation for features text
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const fullText = typingText.textContent;
        typingText.textContent = '';
        typingText.style.borderRight = '4px solid #8b5cf6';
        
        let i = 0;
        let hasAnimated = false;
        const typeSpeed = 80; // milliseconds per character
        
        function typeCharacter() {
            if (i < fullText.length) {
                typingText.textContent += fullText.charAt(i);
                i++;
                setTimeout(typeCharacter, typeSpeed);
            } else {
                typingText.classList.add('typing-complete');
                typingText.style.borderRight = 'none';
            }
        }
        
        // Scroll-triggered animation observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    // Add scroll animation class
                    typingText.classList.add('animate-in');
                    // Start typing animation
                    setTimeout(() => {
                        typeCharacter();
                    }, 300);
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(typingText);
    }
    
    // Also animate the image on scroll
    const featuresImage = document.querySelector('.features-img');
    if (featuresImage) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0.7';
                    entry.target.style.transform = 'scale(1)';
                }
            });
        }, { threshold: 0.2 });
        
        imageObserver.observe(featuresImage);
    }
}

// Make functions available globally for inline handlers
window.openClaimModal = openClaimModal;
window.closeItemModal = closeItemModal;

