console.log("Lets Write JavaScript")

let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return "00:00";
    }

    totalSeconds = Math.floor(Number(totalSeconds)); // ensures proper number

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    return formattedMinutes + ":" + formattedSeconds;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`${folder}/tracks.json`)
    songs = await a.json();

    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        let li = document.createElement("li");
        li.dataset.track = song;

        li.innerHTML = `<img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div></div>
                            <div>Mobi</div>
                        </div>
                        <div class="playnow">
                            <span>Play now</span>
                            <img class="invert" src="img/play.svg" alt="">
                        </div>`;
        li.querySelector(".info").firstElementChild.textContent = song;
        songUL.appendChild(li);
    }

    // Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.dataset.track);
        })
    });

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + encodeURIComponent(track)
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songInfo").textContent = track
    document.querySelector(".songTime").innerHTML = '00:00 / 00:00'
}

async function displayAlbums() {
    let foldersResponse = await fetch(`songs/songs.json`)
    let folders = await foldersResponse.json()
    let cardContainer = document.querySelector(".cardContainer")

    for (const folder of folders) {

        // Get the metadata of the folder
        let a = await fetch(`songs/${folder}/info.json`)
        let response = await a.json();
        console.log(response)
        cardContainer.innerHTML = cardContainer.innerHTML + `
              <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
                                <circle cx="32" cy="32" r="28" fill="#1fdf64" />
                                <path d="M24 20 L24 44 L44 32 Z" fill="black" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpg">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
            `
    }


// Load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        playMusic(songs[0])
    })
})
}

async function main() {
    // Get the list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()


    // Attach an event listner to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })

    // Add an event listener for hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listner to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    // Add an event listner to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add event listener to mute track
    document.querySelector(".volume>img").addEventListener("click", e => {
        // console.log("Changing:" ,e.target.src)
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}
main()
