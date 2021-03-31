
// initialize app namespace object

const playlistApp = {};

// declare variables for interactive inputs on page
playlistApp.popularityBox = document.getElementById('popularity');
playlistApp.submitButton = document.querySelector('button');
playlistApp.playlistBox = document.querySelector('.playlist');
// declare variable to create new element that will appear once a playlist has been generated
playlistApp.appendButton = document.createElement('button')
playlistApp.appendButton.classList.add('appendButton');
playlistApp.appendButton.textContent = "Gimme more tunes!";
// boolean variable to determine if the user wishes to create a new playlist or add to the existing one.
playlistApp.newList = true;

// this function takes in the artist name and country selected. The artist name is used to determine the artist's unique MusicBrainz ID number, which can be passed to the next API. The country parameter

playlistApp.getArtistId = (artist) => {
    // this enables the playlist to be displayed on the page
    playlistApp.playlistBox.classList.remove('off');
    // this creates a list element to let the user know the playlist is loading while they wait.
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
    // these variables correlate to different elements of the form on the page that the API can take in to generate a playlist.
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
            // this for each statement extracts the artist name and song title, creates a list element for artist and song, and appends that list item to the unordered list.
            const ulElement = document.querySelector('ul');
            playlist.forEach(function(track) {
                const artistName = track.artist_display_name; 
                const trackTitle = track.title;
                const listElement = document.createElement('li');
                listElement.textContent = `${artistName} ● ${trackTitle}`
                ulElement.appendChild(listElement);
            })
            // this adds the button to append to the existing playlist, and removes the loading class with a different font.
            ulElement.appendChild(playlistApp.appendButton);
            playlistApp.playlistBox.classList.remove('loading');
        })
        .catch(error => { 
            // in the event that the user selects an artist that the API is unable to generate a playlist for, the user receives a message displayed underneath the radio on the page.
            playlistApp.playlistBox.classList.add('loading');
            playlistApp.playlistBox.textContent = `No tunes found! Please try again.`;
    })
    
}

// app initialize function - declaring global variables, event listener for button, and for in loop to populate dropdown list of countries

playlistApp.init = function() {
    
    // these listeners affect the rotation of the popularity knob if the user uses the range slider or the text input.
    const popularityKnob = document.querySelector('.popularityKnob');
    
    popularityKnob.addEventListener('input', function (){
        playlistApp.rotate(this.value);
    })

    playlistApp.popularityBox.addEventListener('input', function() {
        playlistApp.rotate(this.value);
    })

    // event listener for when the user submits the artist name and other fields on the form.
    playlistApp.submitButton.addEventListener('click', function() {
        playlistApp.newList = true;
        playlistApp.playlistBox.textContent = "";
        const artistInput = document.getElementById('artistName');
        const artist = artistInput.value;
        playlistApp.getArtistId(artist);
    })

    // event listener for if the user wants to generate more selections from the same artist.
    playlistApp.appendButton.addEventListener('click', function() {
        playlistApp.newList = false;
        document.querySelector('ul').removeChild(playlistApp.appendButton)
        const artistInput = document.getElementById('artistName');
        const artist = artistInput.value;
        playlistApp.getArtistId(artist);
    })


}
// this function changes the css of the knob in order to make it spin!
playlistApp.rotate = (value) => {
    document.querySelector('.knob').style.transform=`rotate(${value * 1.8 }deg)`;
     document.getElementById('popularity').value = value;
}

// call initialize function to start up event listeners and kick off app
playlistApp.init();



