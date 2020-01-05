var links = document.getElementsByClassName('tile tile-link');
const icon = document.getElementById('searchIcon');
const div = document.getElementById('searchDiv');
const submit = document.getElementById('submit-btn');
const searchContainer = document.getElementById('searchContainer');
const searchBar = document.getElementById('searchBar');

function tagFilter() {
    var tag = (window.location.hash.length > 0) ? window.location.hash.replace('#',''): "";
    var links = document.getElementsByClassName('tile tile-link'); 
        for (item of links) {
            if (tag.length === 0 || !tag.trim()) {
                item.style.display = '';
                searchContainer.innerHTML = '';
            }
            else if (item.hasAttribute("data-groups")) {
                let hidden = (item.getAttribute('data-groups').includes(tag)) ? true : false
                if (hidden == false) {
                    item.style.display = 'none';
                    searchContainer.innerHTML = '';
                } else {
                    item.style.display = '';
                }
            } else {
                item.style.display = 'none';
            }
        }

    let navItems = document.querySelectorAll("body > div.nav-panel > nav > ul > li");
    for (item of navItems) {
        console.log(item.lastChild.href.split('/').pop());
        if (item.lastChild.href.split('/').pop() == window.location.hash) {
            item.lastChild.lastChild.classList.contains('is-active');
            item.lastChild.lastChild.classList.add('is-active');
            item.classList.add('is-active');
        } else {
            item.lastChild.lastChild.classList.contains('is-active');
            item.lastChild.lastChild.classList.remove('is-active');
            item.classList.remove('is-active');
            if (item.lastChild.href.split('/').pop() === '#' && window.location.hash.length === 0) {
                item.lastChild.lastChild.classList.contains('is-active');
                item.lastChild.lastChild.classList.add('is-active');
                item.classList.add('is-active');
            }
        }
    }
}

function beAwesome() {
    // Get value of input
    let filterValue = searchBar.value.toUpperCase();
    var links = document.getElementsByClassName('tile tile-link'); 
    if (filterValue.slice(0,7) == 'REDDIT ') {
        changeSearch('Reddit');
        for (item of links) {
            item.style.display = 'none';
        }
        rustMode(false);
    } else if (filterValue.slice(0,5) == 'RUST ') {
        changeSearch('Rust');
        for (item of links) {
            item.style.display = 'none';
        } 
        rustMode(true);
    } else {
        changeSearch('Search')
        for (item of links) {
            item.style.display = '';
        }
        rustMode(false);
    }
}

function changeSearch(provider) {
    if (div.classList.contains('search' + provider)) {
        console.log('No Change');
    } else {
        if (icon.classList.contains('fa', 'fa-search')) {
            icon.classList.remove('fa', 'fa-search');
        }
        if (icon.classList.contains('icon-reddit')) {
            icon.classList.remove('icon-reddit');
        }
        if (icon.classList.contains('icon-rust')) {
            icon.classList.remove('icon-rust');
        }
        (provider === "Search") ? icon.classList.add('fa', 'fa-search') : icon.classList.add('icon-' + provider.toLowerCase());
        if (div.classList.contains('inputSearch')) {
            div.classList.remove('inputSearch');
        }
        if (div.classList.contains('inputReddit')) {
            div.classList.remove('inputReddit');
        }
        if (div.classList.contains('inputRust')) {
            div.classList.remove('inputRust');
        }
        div.classList.add('input' + provider);
    }
}

function searchReddit(searchTerm, searchLimit, sortBy) {
    let navItems = document.querySelectorAll("body > div.nav-panel > nav > ul > li");
    for (item of navItems) {
            item.lastChild.lastChild.classList.contains('is-active');
            item.lastChild.lastChild.classList.remove('is-active');
            item.classList.remove('is-active');
        }
    // Get Reddit Data Promise
    let search = (searchTerm.includes(':')) ? redditData(searchTerm.slice(0, searchTerm.indexOf(',')), searchLimit, sortBy, searchTerm.slice(searchTerm.lastIndexOf(',')+1)) : redditData(searchTerm, searchLimit, sortBy);
    search.then(results => {
        let output = '<section class="cards">';
        results.forEach(post => {
            let reddit_image = post.preview ? `<img src="${post.preview.images[0].source.url}" alt="${post.title}">` : `<img src="logos/reddit.svg" alt="${post.title}" style="background-color: #ff4500;">`;
            let score = (post.ups > post.downs) ? `<span class="score"><i class="fa fa-thumbs-up" aria-hidden="true"></i> ${post.score}</span>` : `<span class="score"><i class="fa fa-thumbs-down" aria-hidden="true"></i> ${post.score}</span>`
                output += `
                <article class="card">                
                    <a href="${post.url}">
                        <picture class="thumbnail">
                            ${reddit_image}
                        </picture>
                    </a>
                    <div class="card-header">
                        <a class="subreddit" href="https://reddit.com/r/${post.subreddit}">${post.subreddit}</a>
                        <span class="postedBy">• Posted by</span>
                        <a class="author" href="https://reddit.com/u/${post.author}"> ${post.author}</a>
                        ${score}
                    </div>
                    <div class="card-content">
                        <p class="card-title">${post.title}</p>
                        <h5 class="card-text">${truncateText(post.selftext, 100)}</h5>
                    </div>
                </article>
                `;
        });
        output += '</section>';
        searchContainer.innerHTML = output;
        console.log(results);
    });

    // Stay in Reddit mode
    searchBar.value = 'reddit ';
}

function redditData(searchTerm, searchLimit, sortBy, searchSubReddit) {
    // Search Reddit and get data
    if (searchSubReddit) {
        var searchSplit = searchTerm.split(":"); 
        return fetch(`http://www.reddit.com/r/${searchSplit[0]}/search.json?q=${searchSplit[1]}&sort=${sortBy}&limit=${searchLimit}`)
        .then(res => res.json())
        .then(data => data.data.children.map(data => data.data))
        .catch(err => console.log(err));
    } else {
        return fetch(`http://www.reddit.com/search.json?q=${searchTerm}&sort=${sortBy}&limit=${searchLimit}`)
        .then(res => res.json())
        .then(data => data.data.children.map(data => data.data))
        .catch(err => console.log(err));
    }
}

function searchCrates(searchTerm) {
    cratesData(searchTerm)
    /*.then(results => {
        results.forEach(post => {

        });
    });*/

    // Stay in Rust Mode
    searchBar.value = 'rust ';
}

function cratesData(searchTerm) {
    return fetch(`http://crates.io/api/v1/crates?q=${searchTerm}`)
    .then(res => res.json())
    .then(data => data.map(crates))
    .catch(err => console.log(err));
}

function truncateText(text, limit) {
    const shortend = text.indexOf(' ', limit);
    if(shortend == -1) return text;
    return text.substring(0, shortend);
}

function rustMode(bool) {
    var rustyTiles = document.getElementsByClassName('rust');
    for (item of rustyTiles) {
        if (bool === true) {
            item.style.display = '';
            console.log('Rust Mode Activated')
        } else {
            item.style.display = 'none';
        }  
    }
}

window.addEventListener("hashchange",tagFilter);
submit.addEventListener('click', e => {
    let filterValue = searchBar.value;
    if (filterValue.slice(0,7).toUpperCase() == 'REDDIT ') {
        console.log("Reddit Click")
        if (filterValue.length > 7) {
            let searchTerm = filterValue.slice(7);
            let searchLimit = 20;
            let sortBy = 'relevance';
            console.log(searchTerm);
            searchReddit(searchTerm);
        }
    } else if (filterValue.slice(0,5).toUpperCase()  == 'RUST ') {
        console.log("Rust Click")
        if (filterValue.length > 5) {
            let searchTerm = filterValue.slice(5);
            searchCrates(searchTerm);
        }
    } else {
        changeSearch('Search')
        for (item of links) {
            item.style.display = '';
            window.location.assign("https://duckduckgo.com/?q=" + filterValue);
        }
    }
    e.preventDefault();
})
