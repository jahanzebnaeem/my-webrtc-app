let divSelectRoom = document.getElementById("selectRoom");
let divConsultingRoom = document.getElementById("consultingRoom");
let inputRoomNumber = document.getElementById("roomNumber");
let btnGoRoom = document.getElementById("goRoom");
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");

let roomNumber, localStream, remoteStreem, rtcPeerConnection, isCaller

const iceServers = {
  'iceServer': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'}
  ]
}

const streamConstraints = {
  audio: true,
  video: true
}

btnGoRoom.onclick = () => {
  if(inputRoomNumber.value === '') {
    alert("Please type a room name")
  } else {
    navigator.mediaDevices.getUserMedia(streamConstraints)
      .then(stream => {
        localStream = stream
        localVideo.srcObject = stream
      })
      .catch(err => {
        console.log('An error occured', err)
      })
    divSelectRoom.style = "display: none"
    divConsultingRoom.style = "display: block"
  }
}