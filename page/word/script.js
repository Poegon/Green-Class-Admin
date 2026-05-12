document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const flashcardsContainer = document.getElementById('flashcardsContainer');
    const saveFlashcardBtn = document.getElementById('saveFlashcardBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const studyAllBtn = document.getElementById('studyAllBtn');
    const studyMode = document.getElementById('studyMode');
    const closeStudyBtn = document.getElementById('closeStudy');
    const fliStudyCardBtn = document.getElementById('flipStudyCardBtn');
    const prevCardBtn = document.getElementById('prevCardBtn');
    const nextCardBtn = document.getElementById('nextCardBtn');
    const studyCard = document.getElementById('studyCard');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const tagFilter = document.getElementById('tagFilter');
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importFile = document.getElementById('importFile');
    const statsDisplay = document.getElementById('statsDisplay');
    const toast = document.getElementById('toast');

    // State
    let flashcards = [];
    let currentStudyIndex = 0;
    let studyFlashcards = [];
    let activeTagFilter = null;
    let currentSearchTerm = '';

    // API Configuration
    const API_URL = "https://682dcaf54fae1889475791ed.mockapi.io/api/v2/speaklearn/word";

    // Initialize
    fetchFlashcards();

    // Event Listeners
    saveFlashcardBtn.addEventListener('click', saveFlashcard);
    clearFormBtn.addEventListener('click', clearForm);
    studyAllBtn.addEventListener('click', startStudySession);
    closeStudyBtn.addEventListener('click', closeStudySession);
    fliStudyCardBtn.addEventListener('click', flipStudyCard);
    prevCardBtn.addEventListener('click', showPrevCard);
    nextCardBtn.addEventListener('click', showNextCard);
    searchBtn.addEventListener('click', searchFlashcards);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') searchFlashcards();
    });
    importBtn.addEventListener('click', () => importFile.click());
    exportBtn.addEventListener('click', exportFlashcards);
    importFile.addEventListener('change', importFlashcards);

    // Functions
    async function saveFlashcard() {
        const title = document.getElementById('flashcardTitle').value.trim();
        const front = document.getElementById('flashcardFront').value.trim();
        const back = document.getElementById('flashcardBack').value.trim();
        const tags = document.getElementById('flashcardTags').value.trim();

        if (!title || !front || !back) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const newFlashcard = {
            title,
            front,
            back,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            createdAt: new Date().toISOString()
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFlashcard)
            });
            
            if (response.ok) {
                clearForm();
                fetchFlashcards();
                showToast('Flashcard saved successfully!', 'success');
            } else {
                throw new Error('Failed to save flashcard');
            }
        } catch (error) {
            console.error('Error saving flashcard:', error);
            showToast('Error saving flashcard', 'error');
        }
    }

    function clearForm() {
        document.getElementById('flashcardTitle').value = '';
        document.getElementById('flashcardFront').value = '';
        document.getElementById('flashcardBack').value = '';
        document.getElementById('flashcardTags').value = '';
    }

    async function fetchFlashcards() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            flashcards = data;
            updateFlashcardsDisplay();
            updateStats();
            updateTagFilter();
        } catch (error) {
            console.error('Error fetching flashcards:', error);
            showToast('Error loading flashcards', 'error');
        }
    }

    function updateFlashcardsDisplay() {
        let filteredFlashcards = [...flashcards];

        // Apply search filter
        if (currentSearchTerm) {
            const searchTerm = currentSearchTerm.toLowerCase();
            filteredFlashcards = filteredFlashcards.filter(card => 
                card.title.toLowerCase().includes(searchTerm) || 
                card.front.toLowerCase().includes(searchTerm) || 
                card.back.toLowerCase().includes(searchTerm) ||
                card.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Apply tag filter
        if (activeTagFilter) {
            filteredFlashcards = filteredFlashcards.filter(card => 
                card.tags.includes(activeTagFilter)
            );
        }

        if (filteredFlashcards.length === 0) {
            flashcardsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-layer-group"></i>
                    <h3>No Flashcards Found</h3>
                    <p>Try adjusting your search or create a new flashcard.</p>
                    <button class="btn btn-primary" onclick="clearFilters()">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
            `;
            return;
        }

        flashcardsContainer.innerHTML = '';
        filteredFlashcards.forEach(card => {
            const flashcardElement = document.createElement('div');
            flashcardElement.className = 'flashcard';
            flashcardElement.dataset.id = card.id;
            
            flashcardElement.innerHTML = `
                <div class="flashcard-content">
                    <div class="flashcard-front">
                        <h3 class="flashcard-title">${card.title}</h3>
                        <p class="flashcard-body">${card.front}</p>
                        ${card.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="flashcard-back">
                        <h3 class="flashcard-title">${card.title}</h3>
                        <p class="flashcard-body">${card.back}</p>
                        ${card.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="flashcard-actions">
                        <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                        <button class="study-btn" title="Study"><i class="fas fa-graduation-cap"></i></button>
                    </div>
                </div>
            `;
            
            flashcardsContainer.appendChild(flashcardElement);

            // Add event listeners to the new card
            const editBtn = flashcardElement.querySelector('.edit-btn');
            const deleteBtn = flashcardElement.querySelector('.delete-btn');
            const studyBtn = flashcardElement.querySelector('.study-btn');

            flashcardElement.addEventListener('click', function(e) {
                if (!editBtn.contains(e.target) && !deleteBtn.contains(e.target)) {
                    this.classList.toggle('flipped');
                }
            });

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editFlashcard(card.id);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFlashcard(card.id);
            });

            studyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startStudySession([card.id]);
            });
        });
    }

    async function editFlashcard(id) {
        const card = flashcards.find(card => card.id === id);
        if (!card) return;

        document.getElementById('flashcardTitle').value = card.title;
        document.getElementById('flashcardFront').value = card.front;
        document.getElementById('flashcardBack').value = card.back;
        document.getElementById('flashcardTags').value = card.tags.join(', ');

        // Delete the card being edited (will be recreated as new)
        await deleteFlashcard(id, false);

        // Scroll to form
        document.querySelector('.flashcard-form').scrollIntoView({ behavior: 'smooth' });
    }

    async function deleteFlashcard(id, showConfirm = true) {
        if (showConfirm && !confirm('Are you sure you want to delete this flashcard?')) return;
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchFlashcards();
                if (showConfirm) {
                    showToast('Flashcard deleted', 'success');
                }
            } else {
                throw new Error('Failed to delete flashcard');
            }
        } catch (error) {
            console.error('Error deleting flashcard:', error);
            showToast('Error deleting flashcard', 'error');
        }
    }

    function startStudySession(ids = null) {
        if (flashcards.length === 0) {
            showToast('No flashcards to study', 'error');
            return;
        }

        // Prepare cards for study session
        studyFlashcards = ids 
            ? flashcards.filter(card => ids.includes(card.id))
            : [...flashcards];

        if (studyFlashcards.length === 0) {
            showToast('No flashcards match your selection', 'error');
            return;
        }

        // Shuffle cards for study session
        studyFlashcards = shuffleArray(studyFlashcards);
        currentStudyIndex = 0;

        // Start study session
        studyMode.classList.add('active');
        updateStudyCard();
    }

    function closeStudySession() {
        studyMode.classList.remove('active');
        studyCard.classList.remove('flipped');
    }

    function flipStudyCard() {
        studyCard.classList.toggle('flipped');
    }

    function updateStudyCard() {
        const card = studyFlashcards[currentStudyIndex];
        document.getElementById('studyFrontTitle').textContent = card.title;
        document.getElementById('studyFrontContent').textContent = card.front;
        document.getElementById('studyBackContent').textContent = card.back;
        document.getElementById('progressIndicator').textContent = 
            `${currentStudyIndex + 1}/${studyFlashcards.length}`;
    }

    function showPrevCard() {
        if (currentStudyIndex > 0) {
            currentStudyIndex--;
            studyCard.classList.remove('flipped');
            updateStudyCard();
        }
    }

    function showNextCard() {
        if (currentStudyIndex < studyFlashcards.length - 1) {
            currentStudyIndex++;
            studyCard.classList.remove('flipped');
            updateStudyCard();
        } else {
            closeStudySession();
            showToast('Study session completed!', 'success');
        }
    }

    function searchFlashcards() {
        currentSearchTerm = searchInput.value.trim();
        updateFlashcardsDisplay();
    }

    function updateTagFilter() {
        // Get all unique tags
        const allTags = new Set();
        flashcards.forEach(card => {
            card.tags.forEach(tag => allTags.add(tag));
        });

        tagFilter.innerHTML = '';

        // Add "All" button
        const allButton = document.createElement('button');
        allButton.textContent = 'All';
        allButton.className = !activeTagFilter ? 'active' : '';
        allButton.addEventListener('click', () => {
            activeTagFilter = null;
            updateTagFilterButtons();
            updateFlashcardsDisplay();
        });
        tagFilter.appendChild(allButton);

        // Add tag buttons
        Array.from(allTags).sort().forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.textContent = tag;
            tagButton.className = activeTagFilter === tag ? 'active' : '';
            tagButton.addEventListener('click', () => {
                activeTagFilter = activeTagFilter === tag ? null : tag;
                updateTagFilterButtons();
                updateFlashcardsDisplay();
            });
            tagFilter.appendChild(tagButton);
        });
    }

    function updateTagFilterButtons() {
        const buttons = tagFilter.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.remove('active');
            if ((!activeTagFilter && button.textContent === 'All') || 
                (button.textContent === activeTagFilter)) {
                button.classList.add('active');
            }
        });
    }

    function clearFilters() {
        activeTagFilter = null;
        currentSearchTerm = '';
        searchInput.value = '';
        updateTagFilterButtons();
        updateFlashcardsDisplay();
    }

    function exportFlashcards() {
        if (flashcards.length === 0) {
            showToast('No flashcards to export', 'error');
            return;
        }

        const data = JSON.stringify(flashcards, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcards-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Flashcards exported successfully', 'success');
    }

    async function importFlashcards(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const importedCards = JSON.parse(e.target.result);
                if (!Array.isArray(importedCards)) {
                    throw new Error('Invalid file format');
                }

                let successCount = 0;
                for (const card of importedCards) {
                    try {
                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(card)
                        });
                        if (response.ok) successCount++;
                    } catch (error) {
                        console.error('Error importing card:', error);
                    }
                }

                if (successCount > 0) {
                    fetchFlashcards();
                    showToast(`Imported ${successCount} flashcards`, 'success');
                } else {
                    showToast('No flashcards were imported', 'error');
                }
            } catch (error) {
                showToast('Error importing flashcards', 'error');
                console.error(error);
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    function updateStats() {
        const count = flashcards.length;
        statsDisplay.textContent = `${count} flashcard${count !== 1 ? 's' : ''}`;
    }

    function showToast(message, type = '') {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Make clearFilters available globally for the empty state button
    window.clearFilters = clearFilters;
});