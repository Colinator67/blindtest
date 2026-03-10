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

// === YouTube ===
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
        playerVars:{ controls:0, modestbranding:1, rel:0 },
        events: { 'onStateChange': onPlayerStateChange }
    })
}

// === Barre de progression ===
let progressInterval
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
function stopProgress(){ clearInterval(progressInterval) }

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
function stopTimer(){ clearInterval(timerInterval) }

// === Champs dynamiques artistes / featuring ===
function renderArtistInputs(){
    const container = document.getElementById("artistInputs")
    container.innerHTML = '<input id="guessTitle" placeholder="Titre">'
    const song = todaySongs[currentSong]
    song.mainArtists.forEach((_,i)=>{
        const input = document.createElement("input")
        input.id = `mainArtist${i}`
        input.placeholder = i===0 ? "Artiste principal" : `Artiste principal ${i+1}`
        container.appendChild(input)
    })
    song.featuring.forEach((_,i)=>{
        const input = document.createElement("input")
        input.id = `featArtist${i}`
        input.placeholder = `Featuring ${i+1}`
        container.appendChild(input)
    })
}

// === Réinitialisation indices ===
function resetHints(){
    hintIndex = 0
    document.getElementById("hintText").innerText = ""
    document.getElementById("anecdote").innerText = ""
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

    const mainInputs = song.mainArtists.map((_,i)=>document.getElementById(`mainArtist${i}`).value)
    const featInputs = song.featuring.map((_,i)=>document.getElementById(`featArtist${i}`).value)

    const correctMain = song.mainArtists.every((a,i)=>similarity(a,mainInputs[i]||""))
    const correctFeat = song.featuring.every((a,i)=>similarity(a,featInputs[i]||""))

    if(similarity(title,song.title) && correctMain && correctFeat){
        stopTimer()
        document.getElementById("result").innerText = `✅ Bonne réponse ! Temps écoulé : ${secondsElapsed}s`
        document.getElementById("songLink").innerHTML = `<a href="${song.link}" target="_blank">🎧 Écouter la musique complète</a>`
        document.getElementById("anecdote").innerText = song.anecdote || ""
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

// === Événements player ===
function onPlayerStateChange(event){
    if(event.data == YT.PlayerState.PLAYING){
        startProgress()
        startTimer()
    } else {
        stopProgress()
        stopTimer()
    }
}

// === Initialisation ===
window.onload = ()=>{ renderArtistInputs() }
