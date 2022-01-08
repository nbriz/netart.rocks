/*
    let's make some noise... literally, like from scratch
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const noisyBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)

// loop through all the channels
for (let ch = 0; ch < noisyBuffer.numberOfChannels; ch++) {
    // get channel buffer
    let samples = noisyBuffer.getChannelData(ch)
    // fill up the bufer with noise...
    for (let s = 0; s < noisyBuffer.length; s++){
        // ...ie, random values between -1 and 1
        samples[s] = Math.random()*2-1
    }
}
// ...now checkout noisyBuffer.getChannelData(0) in the console
