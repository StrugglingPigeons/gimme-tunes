
// initialize app namespace object

const playlistApp = {};

// this function takes in the artist name and country selected. The artist name is used to determine the artist's unique MusicBrainz ID number, which can be passed to the next API. The country parameter

playlistApp.getArtistId = (artist) => {
    
    playlistApp.playlistBox.classList.remove('off');
    playlistApp.playlistBox.textContent = "Loading playlist...";
    playlistApp.playlistBox.classList.add('loading');
    // this is a fetch request to return an artist's mbID number, which is necessary to complete the musicovery API request.
    const url = new URL('http://musicbrainz.org/ws/2/artist');
    // this api defaults to XML delivery - the 'fmt: json' is necessary to receive the data in JSON format. 
    url.search = new URLSearchParams({
        fmt: 'json',
        query: artist
    });

    fetch(url)
        .then( (res) => {
            return res.json();
        }).then( (data) => {
            // this data point gathers the MusicBrainz ID number for the artist, which is passed to the musicovery API in the next function to generate the playlist.
            const artistId = data.artists[0].id;
            playlistApp.getPlaylist(artistId);
        });
}




// this function takes the artist ID number from the previous function, as well as any other properties defined by the user in th UI, and uses the musicovery API to generate a list of 12 similar artists and songs based on the user input values.

playlistApp.getPlaylist = (artistId) => {
    const country = playlistApp.countryCodes.value;
    const popularity = playlistApp.popularityBox.value;
    const simGenre = playlistApp.similarGenres.checked; 
    const obscArt = playlistApp.obscureArtists.checked;
    // API call - to avoid a CORS error, a call to the Juno proxy server must be used. 
    axios({
        method:'GET',
        url: 'https://proxy.hackeryou.com',
        responseType:'json',
        params: {
            // after much trial, the only way to get a successful call from this API was to include these fields in the reqUrl value. The other values were able to be appended in key values and used appropriately.
            reqUrl: `http://musicovery.com/api/V6/playlist.php?&fct=getfromartist&artistmbid=${artistId}&focusera=true`,
            listenercountry: country,
            obscureartists: obscArt,
            focusgenre: simGenre,
            popularitymin: popularity
            }
        }).then((res) => {
            // this data point correlates to the array of track objects, which we will need to extract from to display our playlist.
            const playlist = res.data.tracks.track;
            playlistApp.playlistBox.textContent = "";
            // add a for each statement here to extract artist name and song title, create a list element for artist and song, and append that list item to the unordered list.
            playlist.forEach(function(track) {
                const artistName = track.artist_display_name; 
                const trackTitle = track.title;
                const ulElement = document.querySelector('ul');
                const listElement = document.createElement('li');
                listElement.textContent = `${artistName} ● ${trackTitle}`
                ulElement.appendChild(listElement);
            })
            playlistApp.playlistBox.classList.remove('loading');
        })
        .catch(err => { console.log('error')})
}

// app initialize function - declaring global variables, event listener for button, and for in loop to populate dropdown list of countries

playlistApp.init = function() {
    playlistApp.popularityKnob = document.querySelector('.popularityKnob')
    playlistApp.popularityBox = document.getElementById('popularity');
    playlistApp.artistInput = document.querySelector('.artistName');
    playlistApp.countryCodes = document.getElementById('countryCodes');
    playlistApp.submitButton = document.querySelector('button');
    playlistApp.similarGenres = document.getElementById('similarGenres');
    playlistApp.obscureArtists = document.getElementById('obscureArtists');
    playlistApp.count = 0;
    playlistApp.playlistBox = document.querySelector('.playlist');

    for (country in countries) {
        const listOption = document.createElement('option');
        listOption.innerText = countryNames[playlistApp.count];
        playlistApp.count++;
        listOption.value = countries[country];
        countryCodes.appendChild(listOption);
    }

    playlistApp.submitButton.addEventListener('click', function() {
        const artist = playlistApp.artistInput.value;
        playlistApp.getArtistId(artist);
        
    })

    playlistApp.rotate = (value) => {
        document.querySelector('.knob').style.transform=`rotate(${value * 1.8 }deg)`;
         document.getElementById('popularity').value = value;
    }

}



playlistApp.init();



