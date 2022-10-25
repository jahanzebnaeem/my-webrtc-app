// getting dom elements
let divSelectRoom = document.getElementById("selectRoom");
let divConsultingRoom = document.getElementById("consultingRoom");
let inputRoomNumber = document.getElementById("roomNumber");
let btnGoRoom = document.getElementById("goRoom");
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
let h2CallName = document.getElementById("callName")
let inputCallName = document.getElementById("inputCallName")
let btnSetName = document.getElementById("setName")

// variables
let roomNumber, localStream, remoteStream, rtcPeerConnection, isCaller, dataChannel
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

const socket = io()

btnGoRoom.onclick = () => {
  if (inputRoomNumber.value === '') {
    alert("Please type a room name")
  } else {
    roomNumber = inputRoomNumber.value
    socket.emit('create or join', roomNumber)
    divSelectRoom.style = "display: none;"
    divConsultingRoom.style = "display: block;"
  }
}

btnSetName.onclick = () => {
  if (inputCallName.value === '') {
    alert("Please type a call name")
  } else {
    dataChannel.send(inputCallName.value)
    h2CallName.innerText = inputCallName.value
  }
}

// message handlers
socket.on('created', (room) => {
  navigator.mediaDevices.getUserMedia(streamConstraints)
    .then((stream) => {
      localStream = stream
      localVideo.srcObject = stream
      isCaller = true
    })
    .catch((error) => {
      console.log('An error occured when accessing media devices', error)
    })
})

socket.on('joined', (room) => {
  navigator.mediaDevices.getUserMedia(streamConstraints)
    .then((stream) => {
      localStream = stream
      localVideo.srcObject = stream
      socket.emit('ready', roomNumber)
    })
    .catch((err) => {
      console.log('An error occured when accessing media devices', err)
    })
})

socket.on('candidate',  (event) => {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate
  })
  console.log('received candidate', candidate)
  rtcPeerConnection.addIceCandidate(candidate)
})

socket.on('ready',  () => {
  if(isCaller) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = onIceCandidate
    rtcPeerConnection.ontrack = onAddStream
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
    rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
    rtcPeerConnection.createOffer()
      .then(sessionDescription => {
        console.log('sending offer', sessionDescription)
        rtcPeerConnection.setLocalDescription(sessionDescription)
        socket.emit('offer', {
          type: 'offer',
          sdp: sessionDescription,
          room: roomNumber
        })
      })
      .catch(error => {
        console.log(error)
      })
    dataChannel = rtcPeerConnection.createDataChannel(roomNumber)
    dataChannel.onmessage = event => { h2CallName.innerText = event.data }
  }
})

socket.on('offer', function (event) {
  if(!isCaller) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = onIceCandidate
    rtcPeerConnection.ontrack = onAddStream
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
    rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
    console.log('received offer', event)
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    rtcPeerConnection.createAnswer()
      .then(sessionDescription => {
        console.log('sending answer', sessionDescription)
        rtcPeerConnection.setLocalDescription(sessionDescription)
        socket.emit('answer', {
          type: 'answer',
          sdp: sessionDescription,
          room: roomNumber
        })
      })
      .catch(error => {
        console.log(error)
      })
    rtcPeerConnection.ondatachannel = event => {
      dataChannel = event.channel
      dataChannel.onmessage = event => { h2CallName.innerText = event.data }
    }
  }
})

socket.on('answer', function (event) {
  console.log('received answer', event)
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

// handler functions
function onAddStream(event) {
  remoteVideo.srcObject = event.streams[0]
  remoteStream = event.streams[0]
}

function onIceCandidate (event) {
  if(event.candidate) {
    console.log('sending ice candidate', event.candidate)
    socket.emit('candidate', {
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      room: roomNumber
    })
  }
}