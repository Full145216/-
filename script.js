document.addEventListener('DOMContentLoaded', function() {
    initFilters();
    initSmoothScroll();
    initSearch();
    initNavActive();
    initCarousel();
    initMusic();
    initPetModal();
    initPagination();
    loadUserPosts();
});

function initPetModal() {
    const petCards = document.querySelectorAll('.pet-card');
    const modal = document.getElementById('petModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const downloadBtn = document.getElementById('downloadEvolution');
    
    petCards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.dataset.name;
            const attr = this.querySelector('.pet-attr').textContent;
            const desc = this.querySelector('.pet-info p').textContent;
            const type = this.dataset.type;
            const imageSrc = this.querySelector('.pet-image img').src;
            const evolutionFile = this.dataset.evolution;
            
            document.getElementById('modalPetName').textContent = name;
            document.getElementById('modalPetAttr').textContent = attr;
            document.getElementById('modalPetDesc').textContent = desc;
            document.getElementById('modalAttr').textContent = attr;
            
            const typeMap = {
                'pve': 'PVE主力',
                'pvp': 'PVP对战',
                'explore': '探索专用',
                'mount': '代步坐骑'
            };
            document.getElementById('modalType').textContent = typeMap[type] || type;
            document.getElementById('modalPetImage').src = imageSrc;
            
            downloadBtn.href = '1/' + evolutionFile;
            downloadBtn.download = evolutionFile;
            
            modal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
    });
    
    function closeModal() {
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
}

function submitContribution() {
    const title = document.getElementById('contribTitle').value;
    const content = document.getElementById('contribContent').value;
    const categorySelect = document.querySelector('.category-select');
    const category = categorySelect.options[categorySelect.selectedIndex].text;
    const categoryShort = category.replace(/[📖⚔️🗺️🎮📝\s]/g, '');
    
    if (!title.trim()) {
        alert('请输入攻略标题');
        return;
    }
    
    if (!content.trim()) {
        alert('请输入攻略内容');
        return;
    }
    
    const newTopic = {
        id: 'user-' + Date.now(),
        title: title,
        tag: categoryShort,
        preview: content.substring(0, 50) + '...',
        content: content,
        replies: '0',
        time: '刚刚',
        isUserPost: true
    };
    
    const posts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    posts.unshift(newTopic);
    localStorage.setItem('userPosts', JSON.stringify(posts));
    
    addTopicToForum(newTopic);
    
    alert('🎉 攻略提交成功！已发布到热门话题列表。');
    
    document.getElementById('contribTitle').value = '';
    document.getElementById('contribContent').value = '';
    document.getElementById('contribContact').value = '';
    categorySelect.selectedIndex = 0;
}

function addTopicToForum(topic) {
    const forumList = document.querySelector('.forum-list');
    
    const tagColors = {
        '攻略教程': 'guide-tag',
        '阵容分享': 'discuss-tag',
        '探索发现': 'share-tag',
        '活动攻略': 'event-tag',
        '其他': 'help-tag',
        '攻略': 'guide-tag',
        '讨论': 'discuss-tag',
        '分享': 'share-tag',
        '求助': 'help-tag',
        '活动': 'event-tag'
    };
    
    const tagColorClass = tagColors[topic.tag] || 'guide-tag';
    
    const newItem = document.createElement('div');
    newItem.className = 'forum-item';
    newItem.innerHTML = `
        <span class="forum-tag ${tagColorClass}">${topic.tag}</span>
        <div class="forum-content">
            <span class="forum-title">${topic.title}</span>
            <span class="forum-preview">${topic.preview}</span>
        </div>
        <div class="forum-meta">
            <span class="reply-count">💬 ${topic.replies}</span>
            <span class="time">${topic.time}</span>
        </div>
    `;
    
    if (topic.isUserPost) {
        newItem.style.borderLeft = '3px solid #ffd700';
        newItem.onclick = function() {
            localStorage.setItem('currentTopic', JSON.stringify(topic));
            location.href = 'topic.html?id=user-post';
        };
    }
    
    forumList.insertBefore(newItem, forumList.firstChild);
    
    const items = forumList.querySelectorAll('.forum-item');
    if (items.length > 4) {
        items[items.length - 1].remove();
    }
}

function loadUserPosts() {
    const posts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    posts.forEach(post => {
        addTopicToForum(post);
    });
}

function initPagination() {
    const petCards = document.querySelectorAll('.pet-card');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    
    const itemsPerPage = 9;
    const totalPages = Math.ceil(petCards.length / itemsPerPage);
    let currentPage = 1;
    
    function showPage(page) {
        petCards.forEach((card, index) => {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            card.style.display = index >= start && index < end ? 'block' : 'none';
        });
        
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page === totalPages;
        pageIndicator.textContent = `第 ${page} / ${totalPages} 页`;
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            showPage(currentPage);
        }
    });
    
    showPage(currentPage);
}

function initMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const musicPanel = document.getElementById('musicPanel');
    const closePanel = document.getElementById('closePanel');
    const musicItems = document.querySelectorAll('.music-item');
    const currentMusic = document.getElementById('currentMusic');
    let isPlaying = false;
    let hasInteracted = false;
    let isPanelOpen = false;

    function setMusic(src, name) {
        bgMusic.src = src;
        bgMusic.volume = 0.3;
        currentMusic.textContent = '当前：' + name;
        
        musicItems.forEach(item => item.classList.remove('active'));
        const activeItem = document.querySelector(`[data-src="${src}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        if (hasInteracted) {
            bgMusic.play().catch(() => {});
            isPlaying = true;
            updateButtonState();
        }
    }

    function togglePlayPause() {
        if (!hasInteracted) {
            hasInteracted = true;
        }
        
        if (isPlaying) {
            bgMusic.pause();
        } else {
            if (!bgMusic.src) {
                const firstItem = document.querySelector('.music-item.active');
                if (firstItem) {
                    bgMusic.src = firstItem.dataset.src;
                    bgMusic.volume = 0.3;
                    currentMusic.textContent = '当前：' + firstItem.querySelector('.music-name').textContent;
                }
            }
            bgMusic.play().catch(() => {});
        }
        isPlaying = !isPlaying;
        updateButtonState();
    }

    function updateButtonState() {
        if (isPlaying) {
            musicBtn.classList.remove('muted');
            musicBtn.innerHTML = '🎵';
        } else {
            musicBtn.classList.add('muted');
            musicBtn.innerHTML = '🔇';
        }
    }

    function togglePanel() {
        isPanelOpen = !isPanelOpen;
        musicPanel.classList.toggle('visible', isPanelOpen);
    }

    musicBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isPanelOpen) {
            togglePlayPause();
        } else {
            togglePanel();
        }
    });

    closePanel.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePanel();
    });

    musicItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const src = this.dataset.src;
            const name = this.querySelector('.music-name').textContent;
            setMusic(src, name);
        });
    });

    document.addEventListener('click', function enableMusicOnInteraction(e) {
        if (!hasInteracted && e.target !== musicBtn && !musicPanel.contains(e.target)) {
            hasInteracted = true;
            const activeItem = document.querySelector('.music-item.active');
            if (activeItem) {
                bgMusic.src = activeItem.dataset.src;
                bgMusic.volume = 0.3;
                currentMusic.textContent = '当前：' + activeItem.querySelector('.music-name').textContent;
                bgMusic.play().catch(() => {});
                isPlaying = true;
                updateButtonState();
            }
        }
        document.removeEventListener('click', enableMusicOnInteraction);
    });

    document.addEventListener('click', function closePanelOnClick(e) {
        if (isPanelOpen && !musicPanel.contains(e.target) && e.target !== musicBtn) {
            togglePanel();
        }
    });
}

function initNavActive() {
    const navLinks = document.querySelectorAll('.nav a');
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY + 100;
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop;
                    const offsetHeight = targetElement.offsetHeight;
                    
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            }
        });
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initFilters() {
    const attrFilter = document.getElementById('attrFilter');
    const typeFilter = document.getElementById('typeFilter');
    const petsGrid = document.getElementById('petsGrid');
    const petCards = petsGrid.querySelectorAll('.pet-card');

    function filterPets() {
        const selectedAttr = attrFilter.value;
        const selectedType = typeFilter.value;

        petCards.forEach(card => {
            const cardAttr = card.dataset.attr;
            const cardType = card.dataset.type;
            const attrMatch = selectedAttr === 'all' || cardAttr === selectedAttr;
            const typeMatch = selectedType === 'all' || cardType === selectedType;

            if (attrMatch && typeMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    attrFilter.addEventListener('change', filterPets);
    typeFilter.addEventListener('change', filterPets);
}

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initSearch() {
    const searchBox = document.querySelector('.search-box');
    
    searchBox.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        document.querySelectorAll('.pet-card').forEach(card => {
            const petName = card.querySelector('h3').textContent.toLowerCase();
            const petDesc = card.querySelector('p').textContent.toLowerCase();
            
            if (petName.includes(searchTerm) || petDesc.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', function() {
        const titleInput = document.querySelector('.contribution-form input');
        const contentTextarea = document.querySelector('.contribution-form textarea');
        
        if (titleInput.value && contentTextarea.value) {
            alert('攻略提交成功！感谢您的贡献！');
            titleInput.value = '';
            contentTextarea.value = '';
        } else {
            alert('请填写完整的攻略标题和内容');
        }
    });
}

function initCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentIndex = 0;
    let autoPlayInterval;

    function showSlide(index) {
        items.forEach((item, i) => {
            item.classList.remove('active');
            indicators[i].classList.remove('active');
        });
        
        items[index].classList.add('active');
        indicators[index].classList.add('active');
        currentIndex = index;
    }

    function nextSlide() {
        let newIndex = (currentIndex + 1) % items.length;
        showSlide(newIndex);
    }

    function prevSlide() {
        let newIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(newIndex);
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });

    const banner = document.querySelector('.banner');
    banner.addEventListener('mouseenter', stopAutoPlay);
    banner.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
}