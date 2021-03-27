
const playlistApp = {};









playlistApp.getArtistId = (artist, country) => {
    
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
            playlistApp.getPlaylist(artistId, country);
        });
}




// this function takes the artist ID number from the previous function, as well as any other properties defined by the user in th UI, and uses the musicovery API to generate a list of 12 similar artists and songs based on the user input values.

playlistApp.getPlaylist = (artistId, country) => {
    // API call - to avoid a CORS error, a call to the Juno proxy server must be used. 
    axios({
        method:'GET',
        url: 'https://proxy.hackeryou.com',
        responseType:'json',
        params: {
            reqUrl: `http://musicovery.com/api/V6/playlist.php?&fct=getfromartist&artistmbid=${artistId}&focusera=true`,
            listenercountry: country,
            obscureartists: true,
            focusgenre: false
            }
        }).then((res) => {
            const playlist = res.data.tracks.track;
            // add a for each statement here to extract artist name and song title, and append them to the unordered list
            playlist.forEach(function(track) {
                const artistName = track.artist_display_name; 
                const trackTitle = track.title;
                const ulElement = document.querySelector('ul');
                const listElement = document.createElement('li');
                listElement.textContent = `${artistName} - ${trackTitle}`
                ulElement.appendChild(listElement);
            })
        })
        .catch(err => { console.log('error')})
}

// app initialize function - declaring global variables, event listener for button, and for in loop to populate dropdown list of countries

playlistApp.init = function() {
    playlistApp.artistInput = document.querySelector('input');
    playlistApp.countryCodes = document.getElementById('countryCodes');
    playlistApp.submitButton = document.querySelector('button');
    playlistApp.count = 0;

    for (country in countries) {
        const listOption = document.createElement('option');
        listOption.innerText = countryNames[playlistApp.count];
        playlistApp.count++;
        listOption.value = countries[country];
        countryCodes.appendChild(listOption);
    }

    playlistApp.submitButton.addEventListener('click', function() {
        const artist = playlistApp.artistInput.value;
        const country = playlistApp.countryCodes.value;
        playlistApp.getArtistId(artist, country);
    })

}

playlistApp.init();















// function getReleaseId(artistName, trackTitle) {

//     axios({
//             method:'GET',
//             url: `http://musicbrainz.org/ws/2/release/?query=release:${trackTitle}+artist:${artistName}`,
//             // http://musicbrainz.org/ws/2/release/?query=release:breathe+artist:kylie+minogue
//             fmt: 'json',
//         })
//         .then(function(result) {
//             // this gets the release mbid number needed for the search in the next API. 
//             const artId = result.data.releases[2].id;
//             getArt(artId)

//         });

//         }




// function getArt(artistMbId) {

//             axios({
//                 method:'GET',
//                 url: `http://coverartarchive.org/release/${artistMbId}`,
//                 responseType: 'json',
//             })
//             .then(function(result) {
//                 // this gets the release mbid number needed for the search in the next API. 
//                 console.log(result.data.images[0].thumbnails['250']);
//                 const divElement = document.querySelector('.box');
//                 const imgElement = document.createElement('img');
//                 imgElement.src = result.data.images[0].thumbnails['250'];
//                 divElement.appendChild(imgElement);
//             });
//         }