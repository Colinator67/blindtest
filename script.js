let songs = []
let todaySongs = []
let currentSong = 0

let hintTitleIndex = 0
let hintArtistIndex = 0

let startTime
let timerInterval
let progressInterval

let player

// Chargement des chansons
fetch("songs.json")
.then(r=>r.json())
.then(data=>{
songs=data
chooseSongs()
renderArtistInputs()
loadYT()
loadHistory()
})

function chooseSongs(){
const d=new Date()
const seed=d.getDate()+d.getMonth()*31

todaySongs=[
songs[seed % songs.length],
songs[(seed+7) % songs.length]
]
}

// Création champs artistes
function renderArtistInputs(){

const container=document.getElementById("artistInputs")
container.innerHTML=""

const title=document.createElement("input")
title.id="guessTitle"
title.placeholder="Titre"
container.appendChild(title)

const song=todaySongs[currentSong]

song.mainArtists.forEach((a,i)=>{
const input=document.createElement("input")
input.id="mainArtist"+i
input.placeholder="Artiste "+(i+1)
container.appendChild(input)
})

song.featuring.forEach((a,i)=>{
const input=document.createElement("input")
input.id="featArtist"+i
input.placeholder="Feat "+(i+1)
container.appendChild(input)
})

}

// Indices
document.getElementById("titleHintButton").onclick=()=>{
const song=todaySongs[currentSong]

if(hintTitleIndex<song.titleHints.length){

const div=document.createElement("div")
div.innerText=song.titleHints[hintTitleIndex]

document.getElementById("titleHints").appendChild(div)

hintTitleIndex++
}
}

document.getElementById("artistHintButton").onclick=()=>{
const song=todaySongs[currentSong]

if(hintArtistIndex<song.artistHints.length){

const div=document.createElement("div")
div.innerText=song.artistHints[hintArtistIndex]

document.getElementById("artistHints").appendChild(div)

hintArtistIndex++
}
}

function resetHints(){

hintTitleIndex=0
hintArtistIndex=0

document.getElementById("titleHints").innerHTML=""
document.getElementById("artistHints").innerHTML=""

}

// Chrono
function startTimer(){

startTime=Date.now()

timerInterval=setInterval(()=>{

const elapsed=Date.now()-startTime

const seconds=Math.floor(elapsed/1000)
const centi=Math.floor((elapsed%1000)/10)

document.getElementById("timer").innerText=
`⏱ ${seconds}.${centi<10?"0"+centi:centi}s`

},10)

}

function stopTimer(){
clearInterval(timerInterval)
}

// Barre progression
function startProgress(){

progressInterval=setInterval(()=>{

if(player && player.getDuration){

const duration=player.getDuration()
const time=player.getCurrentTime()

const percent=(time/duration)*100

document.getElementById("progressBar").style.width=percent+"%"

}

},200)

}

function stopProgress(){
clearInterval(progressInterval)
}

// Youtube
function loadYT(){
const tag=document.createElement("script")
tag.src="https://www.youtube.com/iframe_api"
document.body.appendChild(tag)
}

function onYouTubeIframeAPIReady(){

player=new YT.Player("player",{
height:"0",
width:"0",
videoId:todaySongs[0].youtube,
host:"https://www.youtube-nocookie.com",
playerVars:{
controls:0,
modestbranding:1,
rel:0
}
})

}

// Lecture
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

// Validation
document.getElementById("submit").onclick=()=>{

const song=todaySongs[currentSong]

let allCorrect=true

// titre
const title=document.getElementById("guessTitle")

if(similarity(title.value,song.title)){
title.classList.add("correct")
title.classList.remove("wrong")
}else{
title.classList.add("wrong")
title.classList.remove("correct")
allCorrect=false
}

// artistes
song.mainArtists.forEach((a,i)=>{

const input=document.getElementById("mainArtist"+i)

if(similarity(input.value,a)){
input.classList.add("correct")
input.classList.remove("wrong")
}else{
input.classList.add("wrong")
input.classList.remove("correct")
allCorrect=false
}

})

// feat
song.featuring.forEach((a,i)=>{

const input=document.getElementById("featArtist"+i)

if(similarity(input.value,a)){
input.classList.add("correct")
input.classList.remove("wrong")
}else{
input.classList.add("wrong")
input.classList.remove("correct")
allCorrect=false
}

})

if(allCorrect){

stopTimer()

const elapsed=Date.now()-startTime
const seconds=Math.floor(elapsed/1000)
const centi=Math.floor((elapsed%1000)/10)

const time=`${seconds}.${centi<10?"0"+centi:centi}s`

document.getElementById("result").innerText=
`✅ Trouvé en ${time}`

document.getElementById("songLink").innerHTML=
`<a href="${song.link}" target="_blank">🎧 Écouter la musique</a>`

document.getElementById("anecdote").innerText=song.anecdote||""

saveScore(time)

}

}

// Similarité
function similarity(a,b){

a=a.toLowerCase()
b=b.toLowerCase()

return levenshtein(a,b)<=2
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

// Historique
function saveScore(time){

const today=new Date().toISOString().slice(0,10)

let history=JSON.parse(localStorage.getItem("blindtestHistory")||"{}")

if(!history[today]) history[today]=[]

history[today].push({
song:currentSong+1,
time:time
})

localStorage.setItem("blindtestHistory",JSON.stringify(history))

loadHistory()

}

// Affichage historique
function loadHistory(){

const history=JSON.parse(localStorage.getItem("blindtestHistory")||"{}")

const container=document.getElementById("history")

container.innerHTML=""

Object.keys(history).sort().reverse().forEach(date=>{

const div=document.createElement("div")

let html=`<b>${date}</b><br>`

history[date].forEach(s=>{
html+=`🎵 Musique ${s.song} : ${s.time}<br>`
})

div.innerHTML=html+"<br>"

container.appendChild(div)

})

}

// chanson suivante
document.getElementById("nextSong").onclick=()=>{

currentSong++

if(currentSong>=todaySongs.length){

document.getElementById("result").innerText="Blindtest terminé 🎉"
return

}

player.loadVideoById(todaySongs[currentSong].youtube)

renderArtistInputs()
resetHints()

document.getElementById("result").innerText=""
document.getElementById("songLink").innerHTML=""
document.getElementById("anecdote").innerText=""

}

// lancement initial historique
function loadHistory(){
const history=JSON.parse(localStorage.getItem("blindtestHistory")||"{}")

const container=document.getElementById("history")
if(!container) return

container.innerHTML=""

Object.keys(history).sort().reverse().forEach(date=>{

const div=document.createElement("div")

let html=`<b>${date}</b><br>`

history[date].forEach(s=>{
html+=`🎵 Musique ${s.song} : ${s.time}<br>`
})

div.innerHTML=html+"<br>"
container.appendChild(div)

})
}
