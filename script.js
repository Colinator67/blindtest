let songs = []
let todaySongs = []
let currentSong = 0
let hintIndex = 0
let timerInterval
let secondsElapsed = 0
let player

fetch("songs.json")
.then(r => r.json())
.then(data => {
    songs = data
    chooseSongs()
    loadYT()
})

function chooseSongs(){
    const d = new Date()
    const seed = d.getDate() + d.getMonth()*31
    todaySongs = [
        songs[seed % songs.length],
        songs[(seed+5) % songs.length]
    ]
}

function loadYT(){
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.body.appendChild(tag)
}

function onYouTubeIframeAPIReady(){
    player = new YT.Player("player",{
        height:"0",
        width:"0",
        videoId:todaySongs[0].youtube,
        host:"https://www.youtube-nocookie.com",
        playerVars:{
            controls:0,
            modestbranding:1,
            rel:0
        },
        events: { 'onStateChange': onPlayerStateChange }
    })
}

// === Barre de progression ===
function startProgress(){
    stopProgress()
    progressInterval = setInterval(()=>{
        if(player && player.getDuration){
            const duration = player.getDuration()
            const time = player.getCurrentTime()
            const percent = (time/duration)*100
            document.getElementById("progressBar").style.width = percent+"%"
        }
    },200)
}

function stopProgress(){
    clearInterval(progressInterval)
}

// === Chronomètre ===
function startTimer(){
    stopTimer()
    secondsElapsed = 0
    document.getElementById("timer").innerText = `⏱ Temps écoulé : 0s`
    timerInterval = setInterval(()=>{
        secondsElapsed++
        document.getElementById("timer").innerText = `⏱ Temps écoulé : ${secondsElapsed}s`
    },1000)
}

function stopTimer(){
    clearInterval(timerInterval)
}

// === Dynamique artistes ===
function renderArtistInputs(){
    const container = document.getElementById("artistInputs")
    container.innerHTML = '<input id="guessTitle" placeholder="Titre">'
    const song = todaySongs[currentSong]
    song.artists.forEach((_,i)=>{
        const input = document.createElement("input")
        input.id = `guessArtist${i}`
        input.placeholder = i===0 ? "Artiste principal" : `Featuring ${i}`
        container.appendChild(input)
    })
}

function resetHints(){
    hintIndex = 0
    document.getElementById("hintText").innerText = ""
}

// === Boutons ===
document.getElementById("playButton").onclick = ()=>{
    player.playVideo()
    startProgress()
    startTimer()
}

document.getElementById("pauseButton").onclick = ()=>{
    player.pauseVideo()
    stopProgress()
    stopTimer()
}

document.getElementById("nextSong").onclick = ()=>{
    currentSong++
    if(currentSong >= todaySongs.length){
        document.getElementById("result").innerText = "🎉 Blindtest terminé"
        stopProgress()
        stopTimer()
        return
    }
    player.loadVideoById(todaySongs[currentSong].youtube)
    resetHints()
    document.getElementById("songLink").innerHTML = ""
    document.getElementById("result").innerText = ""
    renderArtistInputs()
}

document.getElementById("hintButton").onclick = ()=>{
    const song = todaySongs[currentSong]
    if(hintIndex < song.hints.length){
        document.getElementById("hintText").innerText = song.hints[hintIndex]
        hintIndex++
    }
}

// === Soumission ===
document.getElementById("submit").onclick = ()=>{
    const song = todaySongs[currentSong]
    const title = document.getElementById("guessTitle").value
    const artistInputs = song.artists.map((_,i)=>document.getElementById(`guessArtist${i}`).value)
    const correctArtists = song.artists.every((a,i)=>similarity(a,artistInputs[i] || ""))
    if(similarity(title,song.title) && correctArtists){
        document.getElementById("result").innerText = `✅ Bonne réponse ! Temps écoulé : ${secondsElapsed}s`
        stopTimer()
        document.getElementById("songLink").innerHTML = `<a href="${song.link}" target="_blank">🎧 Écouter la musique complète</a>`
    } else {
        document.getElementById("result").innerText = "❌ Mauvaise réponse"
    }
}

// === Similarité ===
function similarity(a,b){
    a=a.toLowerCase()
    b=b.toLowerCase()
    return levenshtein(a,b) <= 2
}

function levenshtein(a,b){
    const matrix=[]
    for(let i=0;i<=b.length;i++){matrix[i]=[i]}
    for(let j=0;j<=a.length;j++){matrix[0][j]=j}
    for(let i=1;i<=b.length;i++){
        for(let j=1;j<=a.length;j++){
            if(b.charAt(i-1)==a.charAt(j-1)){
                matrix[i][j]=matrix[i-1][j-1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j-1]+1,
                    matrix[i][j-1]+1,
                    matrix[i-1][j]+1
                )
            }
        }
    }
    return matrix[b.length][a.length]
}

// === Événement barre + timer au changement de musique ===
function onPlayerStateChange(event){
    if(event.data == YT.PlayerState.PLAYING){
        startProgress()
        startTimer()
    } else {
        stopProgress()
        stopTimer()
    }
}

// === Initial render des inputs artistes ===
window.onload = ()=>{
    renderArtistInputs()
}
