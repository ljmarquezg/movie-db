const IMG_URL = 'https://image.tmdb.org';
const offsetValue = 560;
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

let lazyLoader = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    console.log(entry);
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.img;
      observer.unobserve(entry.target);
    }
  });
});

/** Utils for UI Elements */
calculateOffset = (rating) => {
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
        <circle class="progress-value" cx="100" cy="100" r="90" stroke-dashoffset="${calculateOffset(rating)}"/>
      </svg>
      <div class="percentage">${rating.toFixed(1)}</div>
    </div>
  </div>`;
};

const imageLoaded = (e) => {
  console.log(e.target);
  e.target.classList.add('loaded');
  // console.log(e.target);
  // e.target.parentElement.classList.remove('skeleton');
};

const generateHighlightSection = (trendingMovieHighlight, movie) => {
  trendingMovieHighlight.innerHTML = '';
  const img = document.createElement('img');
  img.classList.add('highlight-img');
  img.src = `${IMG_URL}/t/p/original/${movie.backdrop_path}`;
  img.alt = movie.title;
  img.addEventListener('load', imageLoaded)

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

const generateMoviePosters = (target, movies, horizontal = false, size = 300) => {
  target.innerHTML = '';
  movies.forEach(movie => {
    const poster = horizontal ? 'backdrop_path' : 'poster_path';
    const img = document.createElement('img');
    img.classList.add('movie-img');
    img.src = `${IMG_URL}/t/p/w${size}/${movie[poster] || movie.poster_path}`;
    img.alt = movie.title;
    img.addEventListener('load', imageLoaded)
    img.addEventListener('error', () => {
      alert('error')
    })

    const movieTitle = document.createElement('h3');
    movieTitle.classList.add('movie-title');
    movieTitle.innerHTML = `<span>${movie.title}</span>`;

    const movieWrapper = document.createElement('div');
    movieWrapper.classList.add('movie-wrapper');
    movieWrapper.appendChild(img);
    movieWrapper.appendChild(movieTitle);
    movieWrapper.innerHTML += generateRating(movie.vote_average);

    const article = document.createElement('article');
    article.classList.add('movie-container');
    article.appendChild(movieWrapper);
    article.addEventListener('click', () => {
      location.hash = `#movie=${movie.id}`;
    });
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
    const img = document.createElement('img');
    img.classList.add('actor-img');
    img.src = `${IMG_URL}/t/p/w300/${actor.profile_path}`;
    img.alt = actor.name;
    img.addEventListener('load', imageLoaded)

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

/** Fetch Trending Movies */
const getMovieVideoByMovieId = async (id) => {
  const { data } = await api.get(`/movie/${id}/videos`, {
    params: {
      language: getLanguageSelectorValue(),
    }
  });
  const results = data.results;
  const youtubeVideo = results.find(video =>
    video.site === 'YouTube' &&
    video.type === 'Trailer' &&
    video.official === true
  );
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

const getMoviesByQueryParam = async (query) => {
  const { data } = await api.get('/search/movie', {
    params: { query },
    language: getLanguageSelectorValue(),
  });
  const movies = data.results;
  generateMoviePosters(genericSection, movies);
}

const getTrendingMovies = async () => {
  const { data } = await api.get('/trending/movie/day',
    {
      params: {
        language: getLanguageSelectorValue(),
      }
    });
  const movies = data.results;
  generateMoviePosters(genericSection, movies);
  getMovieVideoByMovieId(data.id);
}

const getRelatedMoviesById = async (id) => {
  const { data } = await api.get(`/movie/${id}/similar`, {
    params: {
      language: getLanguageSelectorValue(),
    }
  });
  generateMoviePosters(movieDetailRecommendedList, data.results, true);
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
  const posterImg = `${IMG_URL}/t/p/w500${data.poster_path}`;
  const poster = document.createElement('img');
  poster.src = posterImg;
  poster.alt = data.title;

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


