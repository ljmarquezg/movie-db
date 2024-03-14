const hideSections = (sectionList) => {
  if (sectionList.length > 0) {
    sectionList.forEach(section => {
      section.classList.add('inactive');
    });
  }
}
const showSections = (sectionList) => {
  if (sectionList.length > 0) {
    sectionList.forEach(section => {
      if (section) {
        section.classList.remove('inactive');
      }
    });
  }
}

const hideMovieDetailsSection = () => {
  hideSections([movieDetailTitle, movieDetailDescription, movieDetailScore]);
}

const homePage = () => {
  /*  headerSection.classList.remove('header-container--long');
   headerSection.style.background = '';*/
  hideMovieDetailsSection();
  hideSections([arrowBtn, headerCategoryTitle, genericSection, movieDetailSection]);
  showSections([headerTitle, searchForm, trendingPreviewSection, categoriesPreviewSection])

  getTrendingMoviesPreview();
  getCategoriesPreview();
}

const trendsPage = () => {
  hideMovieDetailsSection();
  hideSections([categoriesPreviewSection, headerTitle, headerCategoryTitle, trendingPreviewSection, movieDetailSection, searchForm]);
  showSections([arrowBtn, genericSection, movieVideoContainer]);
  getTrendingMovies();
}

const categoryPage = () => {
  hideMovieDetailsSection();
  hideSections([headerTitle, searchForm, movieDetailSection, movieVideoContainer, trendingPreviewSection, categoriesPreviewSection]);
  showSections([arrowBtn, headerCategoryTitle, genericSection]);
  const [_, caetgoryData] = location.hash.split('=');

  const [categoryName, categoryId] = caetgoryData.split('-');
  headerCategoryTitle.textContent = categoryName;
  getMoviesByCategoryId(categoryId);
}

const searchPage = () => {
  hideMovieDetailsSection();
  hideSections([categoriesPreviewSection, headerTitle, headerCategoryTitle, movieDetailSection, movieVideoContainer, trendingPreviewSection]);
  showSections([arrowBtn, searchForm, genericSection]);

  const [_, searchParam] = location.hash.split('=');
  getMoviesByQueryParam(searchParam);
}

const movieDetailsPage = () => {
  hideSections([categoriesPreviewSection, headerCategoryTitle, genericSection, searchForm, trendingPreviewSection]);
  showSections([arrowBtn, headerTitle, movieDetailSection, movieDetailTitle, movieDetailDescription, movieDetailScore]);

  const [_, movieId] = location.hash.split('=');
  getMoviesById(movieId);
}

const navigator = () => {
  switch (true) {
    case location.hash.startsWith('#trends'):
      trendsPage();
      break;
    case location.hash.startsWith('#category='):
      categoryPage()
      break;
    case location.hash.startsWith('#search='):
      searchPage();
      break;
    case location.hash.startsWith('#movie='):
      movieDetailsPage();
      break;
    default:
      homePage();
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const targets = document.querySelectorAll('[data-img]');
  targets.forEach(target => {
    console.log(observer.observe(target));
  });
}

const translateLanguage = (selector, string) => {
  const lang = translations[getLanguageSelectorValue()];

  if (!selector) {
    return lang[string];
  }

  if (selector.length > 0) {
    selector.forEach(node => {
      node.textContent = lang[string];
    });
  }
}

const updateLanguage = () => {
  translateLanguage(trendingText, 'trends');
  translateLanguage(categoriesText, 'categories');
  translateLanguage(aboutText, 'about');
  translateLanguage(trendingMoviesText, 'trendsMovies');
  translateLanguage(viewAll, 'viewAll');
  translateLanguage(headerCategoryTitle, 'trendsMovies');
  translateLanguage(movieDetailCastTitle, 'cast');
  translateLanguage(headerTitle, 'movieDetail');
  navigator();
}

searchFormBtn.addEventListener('click', () => {
  location.hash = `#search=${searchFormInput.value}`;
});

trendingBtn.addEventListener('click', () => {
  location.hash = `#trends`;
});

arrowBtn.addEventListener('click', () => {
  window.history.back();
});

window.addEventListener('hashchange', navigator, false);

window.addEventListener('DOMContentLoaded', updateLanguage, false);

languageSelector.addEventListener('change', updateLanguage, false);
