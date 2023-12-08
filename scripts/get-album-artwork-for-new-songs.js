import SpotifyWebApi from "spotify-web-api-node";
import fetch from "node-fetch";

import fs from "fs";

// Replace 'YOUR_SPOTIFY_CLIENT_ID' and 'YOUR_SPOTIFY_CLIENT_SECRET' with your Spotify API credentials
const clientId = "";
const clientSecret = "";

// Helper function to get Spotify access token
async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

function getJsonFile(path) {
  return fs.readFileSync(path, "utf8", function (err, data) {
    if (err) throw err;
    return data;
  });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchDataWithDelay(song, api, time) {
  try {
    await delay(time);
    const albums = await api.searchAlbums(song.album ?? song.title);
    return { ...song, artwork: albums.body.albums.items[0].images[0].url };
  } catch (error) {
    console.error(`Error fetching data for:`, song, error);
    failedSongs.push(song);
    return song;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async function () {
  const accessToken = await getAccessToken();
  const songs = JSON.parse(getJsonFile("src/list-with-picks-2.json"));
  const spotifyApi = new SpotifyWebApi({
    clientId,
    clientSecret,
    redirectUri: "http://www.example.com/callback",
  });
  spotifyApi.setAccessToken(accessToken);
  const failedSongs = [];
  const songsWithArtwork = songs.map((song, i) => {
    if (song.artwork) {
      return Promise.resolve({ value: song });
    } else {
      return fetchDataWithDelay(song, spotifyApi, i * 10);
    }
  });
  console.log("outta map");
  console.log(songsWithArtwork);
  Promise.allSettled(songsWithArtwork).then((values) => {
    fs.writeFileSync(
      "src/new-list-with-artwork.json",
      JSON.stringify(values.map((value) => value.value))
    );
    fs.writeFileSync("src/failed-songs.json", JSON.stringify(failedSongs));
  });
})();
