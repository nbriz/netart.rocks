/*
    you can also create Audio Buffers from base64 data, for example from the
    js files in the 'sound-fonts' folder ( files scraped from [this site](https://surikov.github.io/webaudiofontdata/sound/) ).
    as part of the [webaudiofont](https://github.com/surikov/webaudiofont) repo by Srgy Surkv
*/

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )

const sax = new AudioBufferSourceNode( ctx )
const mzkBox = new AudioBufferSourceNode( ctx )
const choir = new AudioBufferSourceNode( ctx )
const gn = new GainNode(ctx, {gain:0.5})

/*
    keep in mind this function is specific to the object format of the
    JavaScript files in the sound-font folder.
*/
function bufferFromSoundFont(fontObj,z,actx,callback){
    let zone = fontObj.zones[z]
    if(zone.file){
        let data = zone.file
        let sampleRate = zone.sampleRate
        let arraybuffer = new ArrayBuffer(data.length)
        let view = new Uint8Array(arraybuffer)
        let b, decoded = atob(data)
        for (let i = 0; i < decoded.length; i++) {
            b = decoded.charCodeAt(i)
            view[i] = b
        }
        actx.decodeAudioData( arraybuffer, (buffer)=>{
            callback(buffer)
        })
    } else {
        let decoded = atob(zone.sample)
        zone.buffer = actx.createBuffer(1, decoded.length/2, zone.sampleRate)
        let float32Array = zone.buffer.getChannelData(0)
        let b1, b2, n
        for (let i = 0; i < decoded.length/2; i++) {
            b1 = decoded.charCodeAt(i * 2)
            b2 = decoded.charCodeAt(i * 2 + 1)
            if (b1 < 0) b1 = 256 + b1
            if (b2 < 0) b2 = 256 + b2
            n = b2 * 256 + b1
            if (n >= 65536 / 2) n = n - 65536
            float32Array[i] = n / 65536.0
        }
        callback(zone.buffer)
    }

}

// these are objects loaded from the sound-font dependecies
let sf = [
    _tone_0670_Aspirin_sf2_file,
    _tone_0100_SBLive_sf2,
    _tone_0520_Soul_Ahhs_sf2_file
]

bufferFromSoundFont( sf[0], 0, ctx, (buffer)=>{
    sax.buffer = buffer
    sax.start()
})

bufferFromSoundFont( sf[1], 0, ctx, (buffer)=>{
    mzkBox.buffer = buffer
    mzkBox.start(ctx.currentTime + 2)
})

bufferFromSoundFont( sf[2], 0, ctx, (buffer)=>{
    choir.buffer = buffer
    choir.start(ctx.currentTime + 2.5)
})


sax.connect(gn)
mzkBox.connect(gn)
choir.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

createWaveCanvas({element:'section', analyser:fft })
