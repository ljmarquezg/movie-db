const IMG_URL = 'https://image.tmdb.org';
const offsetValue = 560;
let page = 1;
let maxPage;
const getLanguageSelectorValue = () => {
  return languageSelector.value;
}

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    api_key: API_KEY,
  }
});

const getFavouriteMovies = () => {
  const favouriteMovies = localStorage.getItem('favouriteMovies');
  return JSON.parse(favouriteMovies) || {};
}

const saveMovieAsFavourite = (likedButton, movie) => {
  likedButton.classList.toggle('liked');
  let favouriteMoviesList = getFavouriteMovies();

  if (favouriteMoviesList[movie.id]) {
    delete favouriteMoviesList[movie.id];
  } else {
    favouriteMoviesList[movie.id] = movie;
  }

  localStorage.setItem('favouriteMovies', JSON.stringify(favouriteMoviesList));
  renderFavouriteMovies();
}

const renderFavouriteMovies = () => {
  const favouriteMoviesList = getFavouriteMovies();
  const favouriteMovies = Object.values(favouriteMoviesList);
  generateMoviePosters(likedMovieList, favouriteMovies, { clearContent: true, liked: true });
}

const config = {
  root: null, // Sets the framing element to the viewport
  rootMargin: "0px",
  threshold: 0.5
};

const calculateLazyLoadExecution = async ({ url, params }) => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const scrollIsBottom = (scrollTop + clientHeight) >= (scrollHeight - 20);
  const isNotMaxPage = page < maxPage;

  if (scrollIsBottom && isNotMaxPage) {
    const { data } = await api.get(url,
      {
        params: {
          ...params,
          language: getLanguageSelectorValue(),
          page: page++
        }
      });
    const movies = data.results;
    generateMoviePosters(genericSection, movies);
  }
}

let lazyLoader = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const url = entry.target.getAttribute('data-img');
      entry.target.setAttribute('src', url);
    }
  });
}, config);

/** Utils for UI Elements */
calculateRatingOffset = (rating) => {
  return offsetValue - (rating * 60)
}

const calculateRating = (rating) => {
  switch (true) {
    case rating < 7.5:
      return 'info';
    case rating < 5:
      return 'warning';

    case rating < 2.5:
      return 'danger';

    default:
      return 'success';
  }
}

const generateRating = (rating) => {
  return `
  <div class="rating-container">
    <div class="rating-bar ${calculateRating(rating)}">
      <svg x="0px" y="0px" viewBox="0 0 200 200">
        <circle class="progress-bar" cx="100" cy="100" r="90"/>
        <circle class="progress-value" cx="100" cy="100" r="90" stroke-dashoffset="${calculateRatingOffset(rating)}"/>
      </svg>
      <div class="percentage">${rating.toFixed(1)}</div>
    </div>
  </div>`;
};

const generateImage = (url, alt, className, lazyLoad) => {
  const img = document.createElement('img');
  if (className) {
    img.classList.add(className);
  }
  // img.setAttribute('src', url);
  img.setAttribute(lazyLoad ? 'src' : 'src', url);
  img.setAttribute('alt', alt);

  img.addEventListener('error', (event) => {
    console.log('error', event.target);
    img.setAttribute('src', 'https://via.placeholder.com/280x420');
  });

  if (lazyLoad) {
    lazyLoader.observe(img);
  }
  return img;
}

const generateHighlightSection = (trendingMovieHighlight, movie) => {
  trendingMovieHighlight.innerHTML = '';
  const img = generateImage(
    `${IMG_URL}/t/p/original/${movie.backdrop_path}`,
    movie.title,
    'highlight-img',
    true
  );
  const movieTitle = document.createElement('h2');
  movieTitle.classList.add('highlight-title', 'h1');
  movieTitle.textContent = movie.title;

  const movieDescription = document.createElement('p');
  movieDescription.classList.add('highlight-description');
  movieDescription.textContent = movie.overview;

  const movieWrapper = document.createElement('div');
  movieWrapper.classList.add('highlight-wrapper');
  movieWrapper.appendChild(movieTitle);
  movieWrapper.appendChild(movieDescription);

  const container = document.createElement('div');
  container.classList.add('container');
  container.appendChild(movieWrapper);

  const div = document.createElement('div');
  div.classList.add('highlight-container');
  div.appendChild(img);
  div.appendChild(container);

  trendingMovieHighlight.appendChild(div);
};

const generateMoviePosters = (target, movies, { clearContent = true, size = 300, image_path = 'poster_path' } = {}) => {

  if (clearContent) {
    target.innerHTML = '';
  }
  movies.forEach(movie => {
    const poster = 'poster_path';
    const img = generateImage(
      `${IMG_URL}/t/p/w${size}${movie[image_path] || movie.poster_path}`,
      movie.title,
      'movie-img',
      true
    );

    const movieTitle = document.createElement('h3');
    movieTitle.classList.add('movie-title');
    movieTitle.innerHTML = `<span>${movie.title}</span>`;

    const likeButton = document.createElement('button');
    likeButton.classList.add('btn-like');
    const favouriteMovies = getFavouriteMovies();
    if (favouriteMovies[movie.id]) {
      likeButton.classList.add('liked');
    }

    likeButton.innerHTML = '<span class="icon material-symbols-rounded">favorite</span>';
    likeButton.addEventListener('click', () => {
      saveMovieAsFavourite(likeButton, movie);
    });

    const movieWrapper = document.createElement('div');
    movieWrapper.classList.add('movie-wrapper');
    movieWrapper.appendChild(img);
    movieWrapper.appendChild(movieTitle);
    movieWrapper.innerHTML += generateRating(movie.vote_average);
    movieWrapper.addEventListener('click', () => {
      location.hash = `#movie=${movie.id}`;
    });

    const article = document.createElement('article');
    article.classList.add('movie-container');
    article.appendChild(movieWrapper);
    article.appendChild(likeButton);
    // img.parentElement.classList.add('skeleton');
    target.appendChild(article);
  });
}

const generateCategories = (target, categories) => {
  target.innerHTML = '';
  categories.forEach(category => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryLink = document.createElement('h3');
    categoryLink.classList.add('category-title');
    categoryLink.textContent = category.name;
    categoryLink.id = category.id;
    categoryLink.addEventListener('click', () => {
      location.hash = `#category=${category.name}-${category.id}`;
    });
    categoryContainer.appendChild(categoryLink);
    target.appendChild(categoryContainer);
  });
}

const generateMovieCast = (target, cast) => {
  target.innerHTML = '';
  cast.forEach(actor => {
    const img = generateImage(
      `${IMG_URL}/t/p/w300/${actor.profile_path}`,
      actor.name,
      'actor-img',
      true
    );

    const actorName = document.createElement('h3');
    actorName.classList.add('actor-name');
    actorName.textContent = actor.name;

    const actorCharacter = document.createElement('h4');
    actorCharacter.classList.add('actor-character');
    actorCharacter.textContent = actor.character;

    const actorInfo = document.createElement('div');
    actorInfo.classList.add('actor-info');
    actorInfo.appendChild(actorName);
    actorInfo.appendChild(actorCharacter);

    const actorWrapper = document.createElement('div');
    actorWrapper.classList.add('actor-wrapper');
    actorWrapper.appendChild(img);
    actorWrapper.appendChild(actorInfo);

    const item = document.createElement('li');
    item.classList.add('actor-container');
    item.appendChild(actorWrapper);
    target.appendChild(item);
  });
}

const getMovieCastById = async (id) => {
  const { data } = await api.get(`/movie/${id}/credits`, {
    params: {
      language: getLanguageSelectorValue(),
    }
  });
  generateMovieCast(movieDetailCastList, data.cast);
}

const getMoviesById = async (id) => {
  getMovieVideoByMovieId(id);
  getMovieCastById(id);
  const { data } = await api.get(`/movie/${id}`, {
    params: {
      language: getLanguageSelectorValue(),
    }
  });
  const posterImg = `${IMG_URL}/t/p/w300${data.poster_path}`;
  const poster = generateImage(
    posterImg,
    data.title
  );

  const backdropImg = `${IMG_URL}/t/p/w500${data.backdrop_path}`;
  const headerImg = document.createElement('img');
  // headerImg.src = backdropImg;
  //headerImg.alt = data.title;

  // headerSection.innerHTML = '';
  // headerSection.append(headerImg);
  movieDetailPoster.innerHTML = '';
  movieDetailPoster.append(poster);
  movieDetailTitle.innerText = data.title;
  movieDetailDescription.innerText = data.overview;
  movieDetailScore.innerHTML = generateRating(data.vote_average);
  movieDetailVotes.innerHTML = `(${data.vote_count}) ${translateLanguage(null, 'votes')}`;
  movieDetailRecommendedTitle.innerText = translateLanguage(null, 'relatedMovies');
  generateCategories(movieDetailCategoriesList, data.genres);
  getRelatedMoviesById(id);
}

/** Fetch Trending Movies */
const getMovieVideoByMovieId = async (id) => {
  moviePlayer.innerHTML = '';
  const { data } = await api.get(`/movie/${id}/videos`, {
    params: {
      language: getLanguageSelectorValue(),
    }
  });
  const results = data.results;
  let youtubeVideo = results.find(video =>
    video.site === 'YouTube' &&
    video.type === 'Trailer' &&
    video.official === true
  );
  if (!youtubeVideo) {
    youtubeVideo = results.find(video =>
      video.site === 'YouTube' &&
      video.type === 'Trailer'
    )
  }

  if (youtubeVideo) {
    moviePlayer.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${youtubeVideo.key}?autoplay=1&mute=1&loop=0&controls=0&showinfo=0&autohide=1&modestbranding=1"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    ></iframe>
    `;
  }
}

const getCategoriesPreview = async () => {
  const { data } = await api.get('/genre/movie/list',
    {
      params: {
        language: getLanguageSelectorValue(),
      }
    });
  const categories = data.genres;
  generateCategories(categoriesPreviewList, categories);
}

const getMoviesByCategoryId = async (id) => {
  const { data } = await api.get('/discover/movie', {
    params: { with_genres: id },
    language: getLanguageSelectorValue(),
  });
  const movies = data.results;
  generateMoviePosters(genericSection, movies);
}

const getPaginatedMoviesByCategoryId = (id) => {
  return async () => {
    await calculateLazyLoadExecution({
      url: '/discover/movie',
      params: { with_genres: id },
    });
  }
}

const getMoviesByQueryParam = async (query) => {
  const { data } = await api.get('/search/movie', {
    params: { query },
    language: getLanguageSelectorValue(),
  });
  const movies = data.results;
  maxPage = data.total_pages;
  generateMoviePosters(genericSection, movies);
}

const getPaginatedMoviesByQueryParam = (query) => {
  return async () => {
    await calculateLazyLoadExecution({
      url: '/search/movie',
      params: { query },
    });
  }
}

const getTrendingMoviesPreview = async () => {
  const { data } = await api.get('/trending/movie/day',
    {
      params: {
        language: getLanguageSelectorValue(),
      }
    });
  const movies = data.results;
  const featuredMovie = movies[0];
  generateHighlightSection(trendingMovieHighlight, featuredMovie);
  movies.shift();
  generateMoviePosters(trendingMoviesPreviewList, movies);
}

const getTrendingMovies = async () => {
  const { data } = await api.get('/trending/movie/day',
    {
      params: {
        language: getLanguageSelectorValue(),
      }
    });
  const movies = data.results;
  maxPage = data.total_pages;
  generateMoviePosters(genericSection, movies);
}

const getPaginatedTrendingMovies = async () => {
  await calculateLazyLoadExecution({
    url: '/trending/movie/day',
    params: {},
  });
}

const getRelatedMoviesById = async (id) => {
  const { data } = await api.get(`/movie/${id}/similar`, {
    params: {
      language: getLanguageSelectorValue(),
    }
  });
  generateMoviePosters(movieDetailRecommendedList, data.results, { image_path: 'backdrop_path' });
}




