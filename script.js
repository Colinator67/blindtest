let songs=[]
let todaySongs=[]
let currentSong=0

let player

let startTime
let timerInterval=null
let progressInterval=null

let elapsedBeforePause=0

let titleHintIndex=0
let artistHintIndex=0


// =====================
// CHARGEMENT GOOGLE SHEET
// =====================

const GOOGLE_SHEET_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vR-b_MeNGPDlDnVvrzqKuwVgEVpa8ma-N5Ei1_jZskk-1rYC3DTQI75zqpEE6pq9uJS3tpPygTm8_1k/pub?output=csv"

fetch(GOOGLE_SHEET_URL)
.then(res=>res.text())
.then(csv=>{

const rows=csv.split("\n").slice(1)

songs=rows.map(row=>{

const cols=row.split(",")

return{

date:cols[0],

title:cols[1],

mainArtists:cols[2].split(";"),

featuring:cols[3]?cols[3].split(";"):[],

youtube:cols[4],

link:cols[5],

titleHints:cols[6].split(";"),

artistHints:cols[7].split(";"),

anecdote:cols[8]

}

})

chooseSongs()

renderInputs()

loadYouTubeAPI()

})


// =====================
// CHOIX MUSIQUES DU JOUR
// =====================

function chooseSongs(){

const today=new Date().toISOString().slice(0,10)

todaySongs=songs.filter(song=>song.date===today)

}


// =====================
// INPUTS DYNAMIQUES
// =====================

function renderInputs(){

const container=document.getElementById("artistInputs")

container.innerHTML=""

const title=document.createElement("input")
title.id="guessTitle"
title.placeholder="Titre"

container.appendChild(title)

const song=todaySongs[currentSong]

song.mainArtists.forEach((a,i)=>{

const input=document.createElement("input")
input.id=`mainArtist${i}`
input.placeholder=`Artiste ${i+1}`

container.appendChild(input)

})

song.featuring.forEach((a,i)=>{

const input=document.createElement("input")
input.id=`featArtist${i}`
input.placeholder=`Featuring ${i+1}`

container.appendChild(input)

})

}


// =====================
// YOUTUBE
// =====================

function loadYouTubeAPI(){

const tag=document.createElement("script")
tag.src="https://www.youtube.com/iframe_api"

document.body.appendChild(tag)
document.getElementById("anecdote").innerText = song.anecdote

}

window.onYouTubeIframeAPIReady=function(){

player=new YT.Player("player",{

height:"0",
width:"0",

videoId:todaySongs[0].youtube,

playerVars:{
controls:0,
modestbranding:1,
rel:0
}

})

}


// =====================
// CONTROLES
// =====================

document.getElementById("playButton").onclick=()=>{

player.playVideo()

startTimer()

startProgress()

}

document.getElementById("pauseButton").onclick=()=>{

player.pauseVideo()

stopTimer()

stopProgress()

}



// =====================
// MUSIQUE SUIVANTE
// =====================

document.getElementById("nextSong").onclick=()=>{

currentSong++

if(currentSong>=todaySongs.length){

document.getElementById("result").innerText="🎉 Blindtest terminé"

stopTimer()
stopProgress()

return

}

player.loadVideoById(todaySongs[currentSong].youtube)

elapsedBeforePause=0

document.getElementById("timer").innerText="⏱ Temps : 0.00s"

renderInputs()

resetHints()

}


// =====================
// ABANDON
// =====================

document.getElementById("giveUp").onclick=()=>{

const song=todaySongs[currentSong]

stopTimer()

document.getElementById("result").innerText=
`❌ Réponse : ${song.title} - ${song.mainArtists.join(", ")}`

document.getElementById("songLink").innerHTML=
`<a href="${song.link}" target="_blank">🎧 Écouter la musique</a>`

document.getElementById("anecdote").innerText=song.anecdote

}


// =====================
// INDICES
// =====================

function resetHints(){

titleHintIndex=0
artistHintIndex=0

document.getElementById("titleHints").innerHTML=""
document.getElementById("artistHints").innerHTML=""

}

document.getElementById("titleHintButton").onclick=()=>{

const song=todaySongs[currentSong]

if(titleHintIndex<song.titleHints.length){

const div=document.createElement("div")
div.innerText=song.titleHints[titleHintIndex]

document.getElementById("titleHints").appendChild(div)

titleHintIndex++

}

}

document.getElementById("artistHintButton").onclick=()=>{

const song=todaySongs[currentSong]

if(artistHintIndex<song.artistHints.length){

const div=document.createElement("div")
div.innerText=song.artistHints[artistHintIndex]

document.getElementById("artistHints").appendChild(div)

artistHintIndex++

}

}


// =====================
// TIMER
// =====================

function startTimer(){

if(timerInterval)return

startTime=Date.now()-elapsedBeforePause

timerInterval=setInterval(()=>{

const elapsed=Date.now()-startTime

const seconds=Math.floor(elapsed/1000)
const centi=Math.floor((elapsed%1000)/10)

document.getElementById("timer").innerText=
`⏱ Temps : ${seconds}.${centi<10?'0'+centi:centi}s`

},10)

}

function stopTimer(){

if(!timerInterval)return

elapsedBeforePause=Date.now()-startTime

clearInterval(timerInterval)

timerInterval=null

}


// =====================
// PROGRESSION
// =====================

function startProgress(){

if(progressInterval)return

progressInterval=setInterval(()=>{

const duration=player.getDuration()
const time=player.getCurrentTime()

const percent=(time/duration)*100

document.getElementById("progressBar").style.width=percent+"%"

},200)

}

function stopProgress(){

clearInterval(progressInterval)

progressInterval=null

}

// =====================
// VALIDATION REPONSE
// =====================

// A supprimer, cest un test
document.getElementById("submit").onclick = () => {
console.log("clic détecté")
}

document.getElementById("submit").onclick = () => {

const song = todaySongs[currentSong]

let allCorrect = true


// ----- TITRE -----

const titleInput = document.getElementById("guessTitle")

if(similarity(titleInput.value, song.title)){

titleInput.classList.add("correct")
titleInput.classList.remove("wrong")

}else{

titleInput.classList.add("wrong")
titleInput.classList.remove("correct")

allCorrect = false

}


// ----- ARTISTES -----

song.mainArtists.forEach((artist,i)=>{

const input = document.getElementById(`mainArtist${i}`)

if(similarity(input.value, artist)){

input.classList.add("correct")
input.classList.remove("wrong")

}else{

input.classList.add("wrong")
input.classList.remove("correct")

allCorrect = false

}

})


// ----- FEAT -----

song.featuring.forEach((artist,i)=>{

const input = document.getElementById(`featArtist${i}`)

if(similarity(input.value, artist)){

input.classList.add("correct")
input.classList.remove("wrong")

}else{

input.classList.add("wrong")
input.classList.remove("correct")

allCorrect = false

}

})


// ----- SI TOUT EST BON -----

if(allCorrect){

stopTimer()

const elapsed = Date.now() - startTime

const seconds = Math.floor(elapsed/1000)
const centi = Math.floor((elapsed%1000)/10)

document.getElementById("result").innerText =
`✅ Bonne réponse ! Temps : ${seconds}.${centi<10?'0'+centi:centi}s`

document.getElementById("songLink").innerHTML =
`<a href="${song.link}" target="_blank">🎧 Écouter la musique</a>`



}

}

// =====================
// SIMILARITE
// =====================

function similarity(a,b){

if(!a) return false

a = a.toLowerCase().trim()
b = b.toLowerCase().trim()

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

}else{

matrix[i][j]=Math.min(
matrix[i-1][j-1]+1,
matrix[i][j-1]+1,
matrix[i-1][j]+1
)

}

}

}

return matrix[b.length][a.length]

}
