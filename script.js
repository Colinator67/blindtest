let songs=[]
let todaySongs=[]
let currentSong=0

let player
let playStep=0

const durations=[1,3,6,10,15]

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
playerVars:{controls:0}
})

}

document.getElementById("playButton").onclick=()=>{

let duration=durations[Math.min(playStep,durations.length-1)]

player.loadVideoById(todaySongs[currentSong].youtube,0)

player.playVideo()

setTimeout(()=>{

player.pauseVideo()

},duration*1000)

playStep++

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

currentSong++

playStep=0

}else{

document.getElementById("result").innerText="❌ Mauvaise réponse"

}

}