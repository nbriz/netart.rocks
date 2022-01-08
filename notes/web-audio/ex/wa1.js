/*
  in order to hear stuff we need some kind of source [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode)
  these can be live [WebRTC streams](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioDestinationNode) (mic/webcam), HTML [&lt;audio&gt; or &lt;video&gt;](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode)
  elements, raw audio data with [AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode) (either generated or loaded
  from a file) or an [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode), which is probably the simplest node.

  the [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) like other source AudioNodes can be instantiated in a couple
  of different ways: the factory method or the constructor method.
  Here is the factory method:
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const C4 = ctx.createOscillator()
C4.type = 'sawtooth' // default is "sine"
C4.frequency.value = 261.63 // default 440

// then connect it to the the AudioContext destination (ie. ur speakers)
C4.connect(ctx.destination)
// then start playing it, passing an optional param for when to start
// ctx.currentTime is how many seconds have passed in seconds since the start
// it's based on the WebAudio API clock which runs on separate thread and is
// more percise then the the JS clock ( Date object, setTimeout, etc. )
C4.start(ctx.currentTime)
// the sound will play forever unless u schedule a stop time
// in this case we'll stop it a half sencond later
C4.stop(ctx.currentTime + 0.5)
