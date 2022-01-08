/*
    let's make some noise... literally, like from scratch
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

/*
    the AudioContext's createBuffer() method creates an [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) instance.
    it takes 3 arguments: number of audio channels, the length, and the sample
    rate. the sample rate is the number of samples (floats from -1 to 1) the
    buffer will have per second, and so the length of the buffer array would be
    the number of seconds * the sample rate.
*/
const noisyBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
/*
    to see the buffer array enter in the JS console: noisyBuffer.getChannelData(0)
    the "0" argument means the left channel, 1 would be the right channel.
    by default the buffer is silent (all values are 0s)
*/
