let songs=[]
let todaySongs=[]
let currentSong=0
let hintIndex=0

let player

fetch("songs.json")
.then(r=>r.json())
.then(data=>{
songs=data
chooseSongs()
loadYT()
})

function chooseSongs(){

const d=new Date()
const seed=d.getDate()+d.getMonth()*31

todaySongs=[
songs[seed%songs.length],
songs[(seed+5)%songs.length]
]

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
host:"https://www.youtube-nocookie.com",
playerVars:{
controls:0,
modestbranding:1,
rel:0
}
})

}

document.getElementById("playButton").onclick=()=>{

player.loadVideoById(todaySongs[currentSong].youtube)
player.playVideo()

}

document.getElementById("pauseButton").onclick=()=>{

player.pauseVideo()

}

document.getElementById("nextSong").onclick=()=>{

currentSong++

if(currentSong>=todaySongs.length){

document.getElementById("result").innerText="🎉 Blindtest terminé"
return

}

player.loadVideoById(todaySongs[currentSong].youtube)

resetHints()

document.getElementById("songLink").innerHTML=""
document.getElementById("result").innerText=""

}

document.getElementById("hintButton").onclick=()=>{

const song=todaySongs[currentSong]

if(hintIndex<song.hints.length){

document.getElementById("hintText").innerText=song.hints[hintIndex]
hintIndex++

}

}

function resetHints(){

hintIndex=0
document.getElementById("hintText").innerText=""

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

document.getElementById("submit").onclick=()=>{

const title=document.getElementById("guessTitle").value
const artist=document.getElementById("guessArtist").value

const song=todaySongs[currentSong]

if(similarity(title,song.title)&&similarity(artist,song.artist)){

document.getElementById("result").innerText="✅ Bonne réponse"

document.getElementById("songLink").innerHTML=
`<a href="${song.link}" target="_blank">🎧 Écouter la musique</a>`

}else{

document.getElementById("result").innerText="❌ Mauvaise réponse"

}

}
