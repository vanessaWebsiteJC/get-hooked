const gallery = document.getElementById('animalGallery');

let creations = [];

let selectedYarn = 'all';
let selectedCollection = 'all';
let galleryExpanded = false;

const INITIAL_VISIBLE = 6;


// ── LOAD JSON ──

async function loadCreations() {

  try {

    const response = await fetch('creations.json');

    if (!response.ok) {
      throw new Error('Could not load creations.json');
    }

    creations = await response.json();

    renderGallery();

  } catch (error) {

    console.error('Error loading creations:', error);

  }

}


// ── CREATE ONE CARD ──

function createCard(creation) {
  const card = document.createElement('div');
  card.className = 'animal-card';
  // Images
  const images = creation.images
    .map((image, index) => `
      <img
        src="${image}"
        alt="${creation.name}"
        class="${index === 0 ? 'active' : ''}"
      />
    `)
    .join('');

  // Dots
  const dots = creation.images
    .map((image, index) => `
      <div
        class="animal-dot ${index === 0 ? 'active' : ''}"
        data-idx="${index}">
      </div>
    `)
    .join('');
  card.innerHTML = `
    <div class="animal-img-area">
      ${images}
      <div class="animal-dots">
        ${dots}
      </div>
    </div>

    <div class="animal-name">
      ${creation.emoji} ${creation.name}
    </div>
    <div class="animal-desc">
      ${creation.description}
    </div>
  `;

  // ── IMAGE NAVIGATION ──
  const cardImages = card.querySelectorAll('img');
  const cardDots = card.querySelectorAll('.animal-dot');
  const imageArea = card.querySelector('.animal-img-area');

  let touchStartX = 0;


  // Show a specific image
  function showImage(index) {

    // Wrap around
    if (index < 0) {
      index = cardImages.length - 1;
    }

    if (index >= cardImages.length) {
      index = 0;
    }

    cardImages.forEach(img =>
      img.classList.remove('active')
    );

    cardDots.forEach(dot =>
      dot.classList.remove('active')
    );

    cardImages[index].classList.add('active');
    cardDots[index].classList.add('active');
  }


  // ── DOT CLICKS ──

  cardDots.forEach(dot => {

    dot.addEventListener('click', () => {

      showImage(
        Number(dot.dataset.idx)
      );

    });

  });


  // ── SWIPE ──

  imageArea.addEventListener('touchstart', event => {

    touchStartX =
      event.changedTouches[0].clientX;

  }, { passive: true });


  imageArea.addEventListener('touchend', event => {

    const touchEndX =
      event.changedTouches[0].clientX;

    const distance =
      touchEndX - touchStartX;


    // Ignore small movements
    if (Math.abs(distance) < 50) {
      return;
    }


    const currentIndex =
      [...cardImages].findIndex(img =>
        img.classList.contains('active')
      );


    if (distance < 0) {

      // Swipe left
      showImage(currentIndex + 1);

    } else {

      // Swipe right
      showImage(currentIndex - 1);

    }

  });
  return card;
}

// ── RENDER GALLERY ──
function renderGallery() {
  gallery.innerHTML = '';
  const filtered = creations.filter(creation => {
    const yarnMatches =
      selectedYarn === 'all' ||
      creation.yarn === selectedYarn;
    const collectionMatches =
      selectedCollection === 'all' ||
      creation.collection === selectedCollection;
    return yarnMatches && collectionMatches;
  });

  const visibleCreations = galleryExpanded
    ? filtered
    : filtered.slice(0, INITIAL_VISIBLE);
  visibleCreations.forEach(creation => {
    gallery.appendChild(
      createCard(creation)
    );
  });
  updateShowMoreButton(filtered.length);

}

// ── SHOW MORE ──
const showMoreBtn =
  document.getElementById('showMoreBtn');
function updateShowMoreButton(total) {
  if (total <= INITIAL_VISIBLE) {
    showMoreBtn.style.display = 'none';
    return;
  }

  showMoreBtn.style.display = 'block';
  showMoreBtn.textContent = galleryExpanded
    ? 'Show Less'
    : `Show More Creations (${total - INITIAL_VISIBLE})`;
}

showMoreBtn.addEventListener('click', () => {

  galleryExpanded = !galleryExpanded;
  renderGallery();
  if (!galleryExpanded) {
    document.getElementById('creations').scrollIntoView({
      behavior: 'smooth'
    });
  }
});

// ── FILTERS ──
function setupFilters(groupId, type) {
  const buttons =
    document.querySelectorAll(`#${groupId} .filter-btn`);
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn =>
        btn.classList.remove('active')
      );
      button.classList.add('active');
      if (type === 'yarn') {
        selectedYarn = button.dataset.filter;
      } else {
        selectedCollection = button.dataset.filter;
      }
      galleryExpanded = false;
      renderGallery();
    });
  });
}

setupFilters('yarnFilters', 'yarn');
setupFilters('collectionFilters', 'collection');

// ── START ──
loadCreations();