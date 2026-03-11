let songs=[]
let todaySongs=[]
let currentSong=0

let player

let startTime
let timerInterval
let progressInterval

let titleHintIndex=0
let artistHintIndex=0


fetch("songs.json")
.then(r=>r.json())
.then(data=>{
songs=data
chooseSongs()
renderInputs()
loadYT()
})


function chooseSongs(){

const d=new Date()
const seed=d.getDate()+d.getMonth()*31

todaySongs=[
songs[seed % songs.length],
songs[(seed+5) % songs.length]
]

}


function renderInputs(){

const container=document.getElementById("artistInputs")

container.innerHTML=`<input id="guessTitle" placeholder="Titre">`

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


function resetHints(){

titleHintIndex=0
artistHintIndex=0

document.getElementById("titleHints").innerHTML=""
document.getElementById("artistHints").innerHTML=""

}


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
playerVars:{controls:0},
events:{'onStateChange':onPlayerStateChange}
})

}


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


document.getElementById("nextSong").onclick=()=>{

currentSong++

if(currentSong>=todaySongs.length){

document.getElementById("result").innerText="🎉 Blindtest terminé"
return

}

player.loadVideoById(todaySongs[currentSong].youtube)

renderInputs()
resetHints()

document.getElementById("result").innerText=""
document.getElementById("songLink").innerHTML=""
document.getElementById("anecdote").innerText=""

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


document.getElementById("submit").onclick=()=>{

const song=todaySongs[currentSong]

let allCorrect=true


const titleInput=document.getElementById("guessTitle")

if(similarity(titleInput.value,song.title)){

titleInput.classList.add("correct")
titleInput.classList.remove("wrong")

}else{

titleInput.classList.add("wrong")
titleInput.classList.remove("correct")

allCorrect=false

}


song.mainArtists.forEach((artist,i)=>{

const input=document.getElementById(`mainArtist${i}`)

if(similarity(input.value,artist)){

input.classList.add("correct")
input.classList.remove("wrong")

}else{

input.classList.add("wrong")
input.classList.remove("correct")

allCorrect=false

}

})


song.featuring.forEach((artist,i)=>{

const input=document.getElementById(`featArtist${i}`)

if(similarity(input.value,artist)){

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

document.getElementById("result").innerText=
`✅ Bonne réponse ! Temps : ${seconds}.${centi<10?'0'+centi:centi}s`

document.getElementById("songLink").innerHTML=
`<a href="${song.link}" target="_blank">🎧 Écouter la musique</a>`

document.getElementById("anecdote").innerText=song.anecdote

}

}


function startTimer(){

startTime=Date.now()

timerInterval=setInterval(()=>{

const elapsed=Date.now()-startTime

const seconds=Math.floor(elapsed/1000)
const centi=Math.floor((elapsed%1000)/10)

document.getElementById("timer").innerText=
`⏱ Temps écoulé : ${seconds}.${centi<10?'0'+centi:centi}s`

},10)

}


function stopTimer(){

clearInterval(timerInterval)

}


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
