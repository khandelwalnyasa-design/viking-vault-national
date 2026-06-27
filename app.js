// ========================================
// FoundIt - School Lost & Found
// Frontend JavaScript
// This root copy is used when previewing index.html directly.
// It controls page navigation, item browsing, forms, modals, stats,
// language switching, and the Viper assistant.
// ========================================

// State
// Tracks the active page, current browse filters, and the latest item list.
let currentPage = 'home';
let currentCategory = 'all';
let searchQuery = '';
let sortBy = 'newest';
let items = [];

// DOM Elements
// Cache frequently used DOM elements so the rest of the script can update them quickly.
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

// Persist the active language across page refreshes.
let currentLanguage = localStorage.getItem('vikingVaultLanguage') || 'en';

// Client-side translations. English text remains the source text in the HTML.
const translations = {
    es: {
        'Viking Vault - South Brunswick High School Lost & Found': 'Viking Vault - Objetos Perdidos y Encontrados de South Brunswick High School',
        'Home': 'Inicio',
        'Browse Items': 'Ver Objetos',
        'Report Found': 'Reportar Encontrado',
        'Admin': 'Admin',
        'Lost Something?': '¿Perdiste algo?',
        'Viking Vault Will Help!': '¡Viking Vault te ayudará!',
        'Browse Found Items': 'Ver Objetos Encontrados',
        'Report Found Item': 'Reportar Objeto Encontrado',
        'How It Works': 'Cómo Funciona',
        'Search items...': 'Buscar objetos...',
        'Type your answer...': 'Escribe tu respuesta...',
        'Send': 'Enviar',
        'Ask Viper': 'Preguntar a Viper',
        'AI Assistant': 'Asistente de IA',
        'Virtual Item Protection and Enhanced Recovery': 'Protección Virtual de Objetos y Recuperación Mejorada'
    },
    fr: {
        'Viking Vault - South Brunswick High School Lost & Found': 'Viking Vault - Objets Perdus et Trouvés de South Brunswick High School',
        'Home': 'Accueil',
        'Browse Items': 'Parcourir les Objets',
        'Report Found': 'Signaler Trouvé',
        'Admin': 'Admin',
        'Lost Something?': 'Vous avez perdu quelque chose ?',
        'Viking Vault Will Help!': 'Viking Vault vous aidera !',
        'Browse Found Items': 'Voir les Objets Trouvés',
        'Report Found Item': 'Signaler un Objet Trouvé',
        'How It Works': 'Comment ça Marche',
        'Search items...': 'Chercher des objets...',
        'Type your answer...': 'Tapez votre réponse...',
        'Send': 'Envoyer',
        'Ask Viper': 'Demander à Viper',
        'AI Assistant': 'Assistant IA',
        'Virtual Item Protection and Enhanced Recovery': 'Protection Virtuelle des Objets et Récupération Améliorée'
    },
    la: {
        'Viking Vault - South Brunswick High School Lost & Found': 'Viking Vault - Res Amissae et Inventae Scholae South Brunswick',
        'Home': 'Domus',
        'Browse Items': 'Res Inspicere',
        'Report Found': 'Inventum Nuntiare',
        'Admin': 'Administrator',
        'Lost Something?': 'Aliquid amisisti?',
        'Viking Vault Will Help!': 'Viking Vault te adiuvabit!',
        'Browse Found Items': 'Res Inventas Inspice',
        'Report Found Item': 'Rem Inventam Nuntia',
        'How It Works': 'Quomodo Operatur',
        'Search items...': 'Res quaere...',
        'Type your answer...': 'Responsum scribe...',
        'Send': 'Mitte',
        'Ask Viper': 'Viper Roga',
        'AI Assistant': 'Adiutor Artificiosus',
        'Virtual Item Protection and Enhanced Recovery': 'Tutela Virtualis Rerum et Recuperatio Aucta'
    }
};

// Initialize
// Wait for the HTML document to be ready before attaching event listeners.
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

function initI18n() {
    // Keep the language dropdown in sync with the saved language preference.
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (event) => {
            currentLanguage = event.target.value;
            localStorage.setItem('vikingVaultLanguage', currentLanguage);
            applyTranslations();
        });
    }
    applyTranslations();
}

function translate(text) {
    // English does not need dictionary lookup because it is already in the HTML.
    if (!text || currentLanguage === 'en') return text;
    return translations[currentLanguage]?.[text] || text;
}

function applyTranslations() {
    // Update language metadata for accessibility and language-specific CSS rules.
    document.documentElement.lang = currentLanguage;
    document.documentElement.dataset.language = currentLanguage;
    document.title = translate('Viking Vault - South Brunswick High School Lost & Found');
    // Walk visible text nodes so static page text can change instantly.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const parent = node.parentElement;
            if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
            if (parent.closest('.items-grid, #modal-body, .toast-container, .viper-messages')) return NodeFilter.FILTER_REJECT;
            return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    // Store nodes first so changing text does not interfere with the TreeWalker.
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    // Save original English text on the node so switching languages stays reversible.
    nodes.forEach(node => {
        if (!node._i18nOriginalText) {
            node._i18nOriginalText = node.textContent.trim();
        }
        const original = node._i18nOriginalText;
        const leading = node.textContent.match(/^\s*/)?.[0] || '';
        const trailing = node.textContent.match(/\s*$/)?.[0] || '';
        node.textContent = `${leading}${translate(original)}${trailing}`;
    });

    // Translate placeholders and aria-labels because they are not normal text nodes.
    document.querySelectorAll('[placeholder], [aria-label]').forEach(element => {
        ['placeholder', 'aria-label'].forEach(attribute => {
            if (!element.hasAttribute(attribute)) return;
            const dataKey = `i18nOriginal${attribute.replace(/[^a-z]/gi, '')}`;
            if (!element.dataset[dataKey]) element.dataset[dataKey] = element.getAttribute(attribute);
            element.setAttribute(attribute, translate(element.dataset[dataKey]));
        });
    });
}

// ========================================
// Navigation
// ========================================

function initNavigation() {
    // Convert all data-page links into single-page app navigation.
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    // Toggle the mobile menu button and menu panel together.
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
    // Remember the current page so later logic knows what view is active.
    currentPage = page;
    
    // Update active states
    // Hide every page section, then reveal the requested one.
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page)?.classList.add('active');
    
    // Highlight the matching nav link in both desktop and mobile navigation.
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Load data for specific pages
    if (page === 'browse') {
        loadItems();
    } else if (page === 'stats') {
        loadStats();
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
    // Load the browse page item grid using the active category/search/sort filters.
    const grid = document.getElementById('browse-items-grid');
    const loading = document.getElementById('loading-items');
    const empty = document.getElementById('no-items-found');

    // Show loading UI and clear older results while the request runs.
    if (loading) loading.style.display = 'block';
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'none';

    try {
        // Build query parameters only for filters that are currently active.
        const params = new URLSearchParams();
        if (currentCategory !== 'all') params.append('category', currentCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort', sortBy);

        // Ask the backend for approved public items.
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
    // Load a smaller set of items for the homepage "Recently Found" section.
    const grid = document.getElementById('recent-items-grid');
    const empty = document.getElementById('no-recent-items');

    try {
        const response = await fetch('/api/items');
        const items = await response.json();
        // The homepage only needs the first four latest items.
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
    // Render each found item into a reusable card layout.
    container.innerHTML = items.map(item => `
        <article class="item-card" data-id="${item.id}">
            <div class="item-image">
                ${item.photo 
                    ? `<img src="${item.photo}" alt="${escapeHtml(item.title)}" loading="lazy">`
                    : `<span class="placeholder-icon">${getCategoryIcon(item.category)}</span>`
                }
            </div>
            <div class="item-content">
                <span class="item-category">${escapeHtml(item.category)}</span>
                <h3 class="item-title">${escapeHtml(item.title)}</h3>
                <div class="item-meta">
                    <span>📍 ${escapeHtml(item.location)}</span>
                    <span>📅 ${formatDate(item.date_found)}</span>
                </div>
            </div>
        </article>
    `).join('');

    // Add click handlers after the HTML exists so each card opens its details modal.
    container.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => openItemModal(card.dataset.id));
    });
}

function getCategoryIcon(category) {
    // Return inline SVG icons so categories have visual labels without extra image files.
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
    // Debouncing waits briefly before searching so every keystroke does not call the API.
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            loadItems();
        }, 300);
    });

    // Category filters update the active button and reload the browse results.
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
    // References for the custom photo picker and image preview.
    const photoInput = document.getElementById('item-photo');
    const placeholder = document.getElementById('upload-placeholder');
    const preview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    const removeBtn = document.getElementById('remove-photo');

    // Validate and preview the selected image before the found-item form is submitted.
    photoInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Keep uploads below the backend's 5MB limit.
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                photoInput.value = '';
                return;
            }

            // FileReader displays a local preview without uploading the file yet.
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                placeholder.style.display = 'none';
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Remove the chosen photo and return the upload area to its placeholder state.
    removeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        photoInput.value = '';
        previewImage.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
    });

    // Drag and drop support lets students place an image directly on the upload box.
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
            // Convert the dropped image into the hidden file input's FileList.
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
        // Stop the browser from reloading the page on submit.
        e.preventDefault();
        
        // FormData includes normal fields and the optional uploaded image.
        const formData = new FormData(reportForm);
        const submitBtn = reportForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        console.debug('Submitting found item report:', Object.fromEntries(formData));
        
        // Disable the button while submitting to prevent duplicate reports.
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Submitting...</span>';

        try {
            // Send the found-item report to the backend for admin review.
            const response = await fetch('/api/items', {
                method: 'POST',
                body: formData
            });

            // Show the backend's error message when validation or upload fails.
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

            // On success, clear the form and reset the photo preview.
            const result = await response.json();
            showToast(result.message, 'success');
            reportForm.reset();
            const preview = document.getElementById('upload-preview');
            const placeholder = document.getElementById('upload-placeholder');
            if (preview) preview.style.display = 'none';
            if (placeholder) placeholder.style.display = 'block';
            setDefaultDate();
        } catch (error) {
            // Network failures are reported separately from server validation errors.
            console.error('Found item report network error:', {
                request: Object.fromEntries(formData),
                error
            });
            showToast(`Failed to submit item: ${error.message || 'Network error. Is the server running?'}`, 'error');
        } finally {
            // Restore the submit button no matter how the request ended.
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // Claim form
    claimForm?.addEventListener('submit', async (e) => {
        // Submit ownership claims from the modal without navigating away.
        e.preventDefault();
        
        // Claims are JSON because they do not include file uploads.
        const formData = new FormData(claimForm);
        const data = Object.fromEntries(formData);
        const submitBtn = claimForm.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Send the claim details to staff for review.
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
    // Fill date inputs with today's date unless the user already selected a date.
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
    // Wire item modal close controls.
    document.getElementById('modal-close')?.addEventListener('click', closeItemModal);
    document.querySelector('#item-modal .modal-backdrop')?.addEventListener('click', closeItemModal);

    // Claim modal
    // Wire claim modal close controls.
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
    // Fetch and display one found item's full details when a card is clicked.
    const modal = document.getElementById('item-modal');
    const body = document.getElementById('modal-body');

    try {
        // Request the item details from the backend by item ID.
        const response = await fetch(`/api/items/${itemId}`);
        const item = await response.json();

        if (response.ok) {
            // Render the detail modal with metadata and a claim button.
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
                            <span class="item-category">${escapeHtml(item.category)}</span>
                            <h2 class="item-detail-title">${escapeHtml(item.title)}</h2>
                        </div>
                    </div>
                    <div class="item-detail-info">
                        <div class="info-row">
                            <span class="info-label">📍 Location:</span>
                            <span class="info-value">${escapeHtml(item.location)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📅 Date Found:</span>
                            <span class="info-value">${formatDate(item.date_found)}</span>
                        </div>
                        ${item.description ? `
                            <div class="info-row">
                                <span class="info-label">📝 Description:</span>
                                <span class="info-value">${escapeHtml(item.description)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="item-detail-actions">
                        <button class="btn btn-primary btn-large" onclick="openClaimModal('${item.id}', '${escapeHtml(item.title).replace(/'/g, "\\'")}')">
                            <span>Claim This Item</span>
                        </button>
                        <button class="btn btn-secondary" onclick="closeItemModal()">Close</button>
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
    // Close the item detail modal and restore normal page scrolling.
    document.getElementById('item-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function openClaimModal(itemId, itemTitle) {
    // Open the claim modal after copying the selected item ID/title into the form.
    closeItemModal();
    document.getElementById('claim-item-id').value = itemId;
    document.getElementById('claim-item-name').textContent = itemTitle;
    document.getElementById('claim-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeClaimModal() {
    // Close the claim modal and restore page scrolling.
    document.getElementById('claim-modal').classList.remove('open');
    document.body.style.overflow = '';
}

// ========================================
// Toast Notifications
// ========================================

function showToast(message, type = 'info') {
    // Create a temporary notification for success, error, and info messages.
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Pick a simple symbol that matches the toast type.
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

    // Add the toast to the page and let users dismiss it manually.
    toastContainer.appendChild(toast);

    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto-dismiss toasts so they do not pile up.
    setTimeout(() => removeToast(toast), 5000);
}

function removeToast(toast) {
    // Reverse the slide animation before removing the toast from the DOM.
    toast.style.animation = 'toastSlideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
}

// ========================================
// Utility Functions
// ========================================

function escapeHtml(text) {
    // Escape user-provided text before inserting it into HTML templates.
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    // Convert stored date strings into short readable dates for item cards.
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
    // Sorting dropdown reloads browse results in newest/oldest order.
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
    // Lost-item reports are submitted separately from found-item reports.
    const lostForm = document.getElementById('lost-form');
    if (lostForm) {
        lostForm.addEventListener('submit', async (e) => {
            // Prevent page reload and submit the lost report through the API.
            e.preventDefault();
            // Convert the lost-item form into a JSON-ready object.
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
                // Save the lost report so staff can match it to found items.
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

// Scripted conversation flow for the Viper assistant.
// Each question fills one field needed for a lost-item report.
const viperQuestions = [
    { key: 'title', question: 'Tell me what happened in a normal sentence. For example: "I lost my blue Nike backpack near the gym yesterday after lunch, and it has a keychain."' },
    { key: 'category', question: 'Which category fits best: electronics, clothing, accessories, books, sports, or other?', transform: normalizeViperCategory },
    { key: 'color', question: 'What color is it?' },
    { key: 'brand', question: 'What brand is it? If you do not know, type "unknown".' },
    { key: 'location_lost', question: 'Where did you last see it or lose it?' },
    { key: 'time_lost', question: 'About what time did you lose it? A class period or time range is okay.' },
    { key: 'date_lost', question: 'What date did you lose it? Use YYYY-MM-DD if you can, or type "today".', transform: normalizeViperDate },
    { key: 'features', question: 'What unique features, markings, contents, stickers, scratches, or other details would help identify it?' },
    { key: 'owner_name', question: 'What is your full name?' },
    { key: 'owner_email', question: 'What email should staff use to contact you?' },
    { key: 'owner_phone', question: 'Optional: what phone number should staff use? Type "skip" if you prefer email only.', transform: value => /^(skip|none|no|saltar|omitir|passer|ignorer|nihil)$/i.test(value.trim()) ? '' : value.trim() }
];

// Current Viper conversation state.
// step points at the next question, answers stores collected details,
// and submitted prevents duplicate submissions after the report is sent.
let viperState = {
    step: 0,
    answers: {},
    submitted: false
};

// Color terms Viper can pull out of natural-language descriptions.
const viperColors = [
    'black', 'white', 'gray', 'grey', 'silver', 'blue', 'red', 'green', 'yellow', 'orange',
    'purple', 'pink', 'brown', 'tan', 'beige', 'gold', 'navy', 'teal', 'maroon', 'clear'
];

// Common school-item brands Viper can recognize from free-form text.
const viperKnownBrands = [
    'nike', 'adidas', 'apple', 'samsung', 'sony', 'jbl', 'under armour', 'north face',
    'jansport', 'herschel', 'stanley', 'hydro flask', 'yeti', 'casio', 'ti', 'texas instruments'
];

// Synonym groups let Viper match similar words such as "backpack" and "bookbag".
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
    // Cache chat controls before wiring open, close, and submit handlers.
    const toggle = document.getElementById('viper-toggle');
    const close = document.getElementById('viper-close');
    const panel = document.getElementById('viper-panel');
    const form = document.getElementById('viper-form');
    const input = document.getElementById('viper-input');

    // If the page copy does not include Viper markup, do nothing safely.
    if (!toggle || !panel || !form || !input) return;

    toggle.addEventListener('click', () => {
        // Opening Viper starts the conversation only once.
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            startViperConversation();
            input.focus();
        }
    });

    // Close only hides the panel; it preserves the conversation history.
    close?.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    form.addEventListener('submit', async (e) => {
        // Send each user message through the conversation handler.
        e.preventDefault();
        const message = input.value.trim();
        if (!message || viperState.submitted) return;

        input.value = '';
        addViperMessage(message, 'user');
        await handleViperAnswer(message);
    });
}

function startViperConversation() {
    // Add the greeting and first prompt if the chat is still empty.
    const messages = document.getElementById('viper-messages');
    if (!messages || messages.children.length > 0) return;

    addViperMessage('Hi, I am Viper: Virtual Item Protection and Enhanced Recovery. I can help you report a lost item faster and search for possible matches.', 'bot');
    addViperMessage(viperQuestions[0].question, 'bot');
}

async function handleViperAnswer(message) {
    // The first message can be a full natural-language item description.
    const currentQuestion = viperQuestions[viperState.step];
    if (viperState.step === 0) {
        // Extract category, color, brand, date, time, location, title, and features.
        const parsedDetails = parseViperNaturalLanguage(message);
        viperState.answers = { ...viperState.answers, ...parsedDetails };

        // Tell users what Viper already understood, then skip answered questions.
        const summary = summarizeViperExtractedDetails(parsedDetails);
        if (summary) {
            addViperMessage(`I found these details already: ${summary}. I will only ask for what is missing.`, 'bot');
        }
    } else {
        // Later answers map directly to the current question key.
        const value = currentQuestion.transform ? currentQuestion.transform(message) : message.trim();
        viperState.answers[currentQuestion.key] = value;
    }

    // Jump to the next missing answer rather than asking unnecessary questions.
    viperState.step = getNextViperQuestionIndex(viperState.step + 1);

    if (viperState.step !== -1) {
        addViperMessage(viperQuestions[viperState.step].question, 'bot');
        return;
    }

    // Once all fields are gathered, submit the report and search matches.
    viperState.submitted = true;
    addViperMessage('Thanks. I am creating a detailed lost-item report and checking possible matches now.', 'bot');
    await submitViperReport();
}

async function submitViperReport() {
    // Convert the chat answers into the same shape as the normal lost-item form.
    const report = buildViperReport(viperState.answers);

    try {
        // Save the generated lost-item report through the backend API.
        const response = await fetch('/api/lost-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            addViperMessage(result.error || 'I could not submit the report. Please check the details and try the regular lost item form.', 'bot');
            resetViperAfterDelay();
            return;
        }

        // After saving, search public found items for possible matches.
        addViperMessage(`Report created: ${report.title}. I included color, brand, location, time, and unique features in the description.`, 'bot');
        const matches = await findViperMatches(report);
        renderViperMatches(matches);
        showToast('Viper submitted your lost item report', 'success');
    } catch (error) {
        addViperMessage('I could not connect to the server. Please try again or use the regular lost item form.', 'bot');
        resetViperAfterDelay();
    }
}

function buildViperReport(answers) {
    // Combine structured answers into a detailed description for staff review.
    const description = [
        `Color: ${answers.color || 'Not specified'}`,
        `Brand: ${answers.brand || 'Not specified'}`,
        `Time lost: ${answers.time_lost || 'Not specified'}`,
        `Unique features: ${answers.features || 'Not specified'}`,
        `Original description: ${answers.natural_description || 'Not specified'}`,
        `Generated by Viper AI assistant.`
    ].join('\n');

    // Return the exact field names expected by /api/lost-items.
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
    // Load public found items and score each one against the lost-item report.
    const response = await fetch('/api/items');
    const foundItems = await response.json();
    const reportText = [report.title, report.category, report.location_lost, report.description].join(' ').toLowerCase();

    // Keep only likely matches and sort strongest matches first.
    return foundItems
        .map(item => {
            const itemText = [item.title, item.category, item.location, item.description].join(' ').toLowerCase();
            const score = scoreViperMatch(report, reportText, item, itemText);
            return { item, score };
        })
        .filter(match => match.score >= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

function scoreViperMatch(report, reportText, item, itemText) {
    // Award points for category, location, and synonym-aware text overlap.
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
    // Expand each word with synonyms so different wording can still match.
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
    // Compare exact terms first, then compare synonym group membership.
    if (!valueA || !valueB) return false;
    const a = valueA.toLowerCase();
    const b = valueB.toLowerCase();
    if (a === b || a.includes(b) || b.includes(a)) return true;

    return viperSynonymGroups.some(group => group.some(term => a.includes(term)) && group.some(term => b.includes(term)));
}

function locationsViperOverlap(locationA, locationB) {
    // Compare expanded location words so "cafeteria" can match "lunchroom".
    const termsA = expandViperSearchTerms(locationA.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word.length > 2));
    const termsB = expandViperSearchTerms(locationB.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word.length > 2));
    return termsA.some(term => termsB.includes(term));
}

function renderViperMatches(matches) {
    // Display either a no-match note or clickable possible found-item matches.
    if (!matches.length) {
        addViperMessage('I did not find a strong public match yet, but your report is saved so staff can review it and contact you if one appears.', 'bot');
        resetViperAfterDelay();
        return;
    }

    const matchList = matches.map(({ item, score }) => `
        <button type="button" class="viper-match" data-id="${escapeHtml(item.id)}">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.category)} • ${escapeHtml(item.location)} • ${formatDate(item.date_found)}</span>
            <em>Match score: ${score}</em>
        </button>
    `).join('');

    addViperMessage(`I found ${matches.length} possible match${matches.length === 1 ? '' : 'es'} in the found-item database:`, 'bot');
    addViperMessage(`<div class="viper-matches">${matchList}</div>`, 'bot', true);

    document.querySelectorAll('.viper-match').forEach(button => {
        button.addEventListener('click', () => openItemModal(button.dataset.id));
    });

    resetViperAfterDelay();
}

function parseViperNaturalLanguage(message) {
    // Lightweight parser that extracts useful report fields from one sentence.
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
    // Find the next required Viper answer that has not been collected yet.
    for (let i = startIndex; i < viperQuestions.length; i++) {
        const key = viperQuestions[i].key;
        const answer = viperState.answers[key];
        if (!answer || String(answer).trim() === '') return i;
    }
    return -1;
}

function summarizeViperExtractedDetails(details) {
    // Build a short summary of details Viper understood from the first message.
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
    // Map common nouns to the app's supported lost-and-found categories.
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
    // Understand exact dates plus words like today and yesterday.
    const isoDate = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (isoDate) return isoDate[0];
    if (/\btoday\b/.test(text)) return normalizeViperDate('today');
    if (/\byesterday\b/.test(text)) return normalizeViperDate('yesterday');

    const weekday = text.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (weekday) return weekday[0];

    return '';
}

function inferViperTime(text) {
    // Pull out clock times or school-day phrases like "after lunch".
    const clockTime = text.match(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i);
    if (clockTime) return clockTime[0];

    const timePhrase = text.match(/\b(before|after|during)\s+(school|lunch|practice|class|dismissal|period\s+\d+|[a-z]+\s+period)\b/i);
    if (timePhrase) return timePhrase[0];

    const generalTime = text.match(/\b(morning|afternoon|evening|lunch|dismissal)\b/i);
    return generalTime ? generalTime[0] : '';
}

function inferViperLocation(text) {
    // Look for location phrases after words such as near, at, in, or around.
    const locationMatch = text.match(/\b(?:near|by|at|in|inside|outside|around)\s+([^,.!?]+?)(?:\s+(?:today|yesterday|before|after|during|with|has|and it|but)|[,.!?]|$)/i);
    if (locationMatch) return locationMatch[1].trim();

    const knownPlaces = ['gym', 'library', 'cafeteria', 'main office', 'bus', 'hallway', 'locker room', 'auditorium', 'classroom', 'parking lot'];
    return knownPlaces.find(place => text.toLowerCase().includes(place)) || '';
}

function inferViperTitle(text, category, color, brand) {
    // Create a concise item title from detected color, brand, and item word.
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
    // Pull out identifying details such as stickers, scratches, cases, or keychains.
    const featureMatch = text.match(/\b(?:with|has|had|containing|that has)\s+([^.!?]+)$/i);
    if (featureMatch) return featureMatch[1].trim();

    const uniqueHints = ['sticker', 'scratch', 'keychain', 'case', 'initials', 'name', 'logo', 'dent', 'crack'];
    const lower = text.toLowerCase();
    return uniqueHints
        .filter(hint => lower.includes(hint))
        .join(', ');
}

function addViperMessage(message, sender, isHtml = false) {
    // Add one chat bubble to the Viper conversation and scroll to it.
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
    // Offer a restart button after the current report flow finishes.
    const input = document.getElementById('viper-input');
    if (input) input.placeholder = 'Start another report when ready';
    addViperMessage('<button type="button" class="viper-restart" id="viper-restart">Start another report</button>', 'bot', true);
    document.getElementById('viper-restart')?.addEventListener('click', resetViperConversation);
}

function resetViperConversation() {
    // Clear Viper state and restart the conversation from the beginning.
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
        input.placeholder = 'Type your answer...';
        input.focus();
    }
    startViperConversation();
}

function normalizeViperCategory(value) {
    // Convert translated/common category words into backend category keys.
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
    // Normalize natural date answers into YYYY-MM-DD for the backend.
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
    // Load public stats for the statistics page cards and category chart.
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        // Update stat cards with totals returned by /api/stats.
        const totalEl = document.getElementById('stat-total-found');
        const claimedEl = document.getElementById('stat-claimed');
        const rateEl = document.getElementById('stat-success-rate');
        const monthEl = document.getElementById('stat-this-month');
        
        if (totalEl) totalEl.textContent = stats.totalFoundItems || 0;
        if (claimedEl) claimedEl.textContent = stats.claimedItems || 0;
        if (rateEl) rateEl.textContent = `${stats.successRate || 0}%`;
        if (monthEl) monthEl.textContent = stats.itemsThisMonth || 0;

        // Create category chart when Chart.js is available on the page.
        const ctx = document.getElementById('category-chart');
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
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
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
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

