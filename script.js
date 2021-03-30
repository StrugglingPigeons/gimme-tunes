
// initialize app namespace object

const playlistApp = {};

playlistApp.popularityBox = document.getElementById('popularity');
playlistApp.submitButton = document.querySelector('button');
playlistApp.playlistBox = document.querySelector('.playlist');
playlistApp.appendButton = document.createElement('button')
playlistApp.appendButton.classList.add('appendButton');
playlistApp.appendButton.textContent = "Add to Playlist";
playlistApp.newList = true;

// this function takes in the artist name and country selected. The artist name is used to determine the artist's unique MusicBrainz ID number, which can be passed to the next API. The country parameter

playlistApp.getArtistId = (artist) => {
    
    playlistApp.playlistBox.classList.remove('off');
    playlistApp.loading = document.createElement('li');
    playlistApp.loading.classList.add('loading');
    playlistApp.loading.textContent = "Loading playlist...";
    document.querySelector('ul').appendChild(playlistApp.loading);
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
    
    const countryCodes = document.getElementById('countryCodes');
    const similarEras = document.getElementById('similarEras');
    const similarGenre = document.getElementById('similarGenre');
    const apiKey = 'x0f621n9';
    const country = countryCodes.value;
    const popularity = playlistApp.popularityBox.value;
    const simEra = similarEras.checked; 
    const simGenre = similarGenre.checked;
    // API call - to avoid a CORS error, a call to the Juno proxy server must be used. 
    axios({
        method:'GET',
        url: 'https://proxy.hackeryou.com',
        responseType:'json',
        params: {
            // after much trial, the only way to get a successful call from this API was to include these fields in the reqUrl value. The other values were able to be appended in key values and used appropriately.
            reqUrl: `http://musicovery.com/api/V6/playlist.php?&fct=getfromartist&artistmbid=${artistId}&focusera=${simEra}`,
            apikey: apiKey,
            listenercountry: country,
            similargenres: simGenre,
            popularitymax: popularity
            }
        }).then((res) => {
            document.querySelector('ul').removeChild(playlistApp.loading);
            // this data point correlates to the array of track objects, which we will need to extract from to display our playlist.
            const playlist = res.data.tracks.track;
            // if (playlistApp.newList) {
                
            // }
            
            // add a for each statement here to extract artist name and song title, create a list element for artist and song, and append that list item to the unordered list.
            const ulElement = document.querySelector('ul');
            playlist.forEach(function(track) {
                const artistName = track.artist_display_name; 
                const trackTitle = track.title;
                const listElement = document.createElement('li');
                listElement.textContent = `${artistName} ● ${trackTitle}`
                ulElement.appendChild(listElement);
            })
            ulElement.appendChild(playlistApp.appendButton);
            playlistApp.playlistBox.classList.remove('loading');
        })
        .catch(error => { 
            playlistApp.playlistBox.classList.add('loading');
            playlistApp.playlistBox.textContent = `No tunes found! Please check spelling or select a new artist.`;
    })
    
}

// app initialize function - declaring global variables, event listener for button, and for in loop to populate dropdown list of countries

playlistApp.init = function() {
    
    const popularityKnob = document.querySelector('.popularityKnob');
    

    popularityKnob.addEventListener('input', function (){
        playlistApp.rotate(this.value);
    })

    playlistApp.popularityBox.addEventListener('input', function() {
        playlistApp.rotate(this.value);
    })


    playlistApp.submitButton.addEventListener('click', function() {
        playlistApp.newList = true;
        playlistApp.playlistBox.textContent = "";
        const artistInput = document.querySelector('.artistName');
        const artist = artistInput.value;
        playlistApp.getArtistId(artist);
    })


    playlistApp.appendButton.addEventListener('click', function() {
        playlistApp.newList = false;
        document.querySelector('ul').removeChild(playlistApp.appendButton)
        const artistInput = document.querySelector('.artistName');
        const artist = artistInput.value;
        playlistApp.getArtistId(artist);
    })


}

playlistApp.rotate = (value) => {
    document.querySelector('.knob').style.transform=`rotate(${value * 1.8 }deg)`;
     document.getElementById('popularity').value = value;
}

// call initialize function to start up event listeners and kick off app
playlistApp.init();



