const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const renderMovieMode = document.querySelector("#render-movie-mode")
const MOVIES_PER_PAGE = 12
let filterMovies = []
let currentPage = 1

axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieCard(getMoviesByPage(currentPage))
  })
  .catch((err) => console.log(err))

function renderMovieCard(data) {
  dataPanel.innerHTML = ``
  let HTMLContent = ``
  data.forEach((item) => {
    HTMLContent += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite"  data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = HTMLContent
}

function renderMovieList(data) {
  dataPanel.innerHTML = ``
  let HTMLContent = `<table class="table">
        <tbody>`

  data.forEach((item) => {
    HTMLContent += `
      <tr>
        <td>${item.title}</td>
        <td><button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite"  data-id="${item.id}">+</button> </td>
      </tr>  
    `
  })
  HTMLContent += `</tbody>
      </table>`
  dataPanel.innerHTML = HTMLContent
}

function switchMode(mode) {
  if (dataPanel.dataset.mode === mode) return
  dataPanel.dataset.mode = mode
}

renderMovieMode.addEventListener('click', function onModeClicked(event) {
  const page = Number(event.target.dataset.page)
  if (event.target.matches('.icon-th')) {
    switchMode('card-mode')
    renderMovieCard(getMoviesByPage(currentPage))
  } else if (event.target.matches('.icon-bars')) {
    switchMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  return alert('已加入收藏清單中！')
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    console.log(data)
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fuid">
    `
  })
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  filterMovies = []
  const keyword = searchInput.value.trim().toLowerCase()

  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filterMovies.push(movie)
    }
  }

  if (filterMovies.length === 0) {
    return alert('Cannot find ' + keyword)
  }

  renderPaginator(filterMovies.length)
  renderMovieCard(getMoviesByPage(currentPage))
  renderMovieList(getMoviesByPage(currentPage))
})

function getMoviesByPage(page) {
  const data = filterMovies.length ? filterMovies : movies //判斷filteredMovies有無東西，true傳filteredMovies，沒有反之
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  currentPage = page
  //更新畫面
  if (dataPanel.dataset.mode === 'card-mode') {
    renderMovieCard(getMoviesByPage(page))
  } else if (dataPanel.dataset.mode === 'list-mode') {
    renderMovieList(getMoviesByPage(page))
  }
})