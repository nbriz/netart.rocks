/*
  here's an [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) instantiated using the constructor method, i prefer this
  one and will using it for all other AudioNodes moving forward

  ...but you should know that this constructor method version of the API
  hasn't been as well implemented on some browsers (like Safari... the new IE)
  so if you are working on something that requires the widest compatablity
  possible, then you should use the factory method version of the API
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const A4 = new OscillatorNode(ctx, {
  frequency: 440,
  type: 'square'
})

A4.connect(ctx.destination)
A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 0.5)
