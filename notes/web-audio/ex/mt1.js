/*
    When the buffer is loaded, a play/stop toggle button will appear in the gui
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const gn = new GainNode(ctx, {gain:0.5})
const fft = new AnalyserNode( ctx )
gn.connect(fft)
fft.connect(ctx.destination)

let song_buffer
// create a new AudioBufferSourceNode with the song_buffer,
// set to play a specific sample from that buffer at a given time
// dictated by the Sequencer
function playSample( time, offset, duration ){
    let src = new AudioBufferSourceNode( ctx )
        src.connect(gn)
        src.buffer = song_buffer
        src.start(time, offset, duration)
}

// here we instatiate the Sequencer
const seq = new Sequencer( ctx, {
    tempo: 140,
    bars:4,
    whole:function(time){
        switch(this.currentBar%2){ // even or odd bars?
            case 0: playSample(time,0.925,0.5); break; // kick
            case 1: playSample(time,0,0.5); break; // snare
        }
    },
    eighth:function(time){
        if(this.currentBar%2==0){
            switch(this.current16thNote){
                case 4: playSample(time,4.242,0.1); break;
                case 6: playSample(time,2.392,0.1); break;
                case 12: playSample(time,1.749,0.1); break;
                case 13: playSample(time,1.749,0.1); break;
            }
        } else {
            switch(this.current16thNote){
                case 0: playSample(time,1.749,0.1); break;
                case 4: playSample(time,4.242,0.1); break;
                case 6: playSample(time,2.392,0.1); break;
                case 12: playSample(time,6.130,0.1); break;
                case 14: playSample(time,8.744,0.1); break;
            }
        }
    },
    sixteenth:function(time){
        if(this.currentBar%2==0){
            switch(this.current16thNote){ // even or odd bars?
                case 6: playSample(time,0,0.5); break; // snare
                case 7: playSample(time,0,0.5); break; // snare
                case 8: playSample(time,0,0.5); break; // snare
                case 9: playSample(time,0,0.5); break; // snare
            }
        }
    }
})

function loop(){
    requestAnimationFrame(loop)
    if(seq.isPlaying) seq.update() // always need to call update in a loop
}

fetch('ex/media/heart_grenade.mp3')
.then(res => res.arrayBuffer() )
.then(data => {
    ctx.decodeAudioData(data, (buffer)=>{
        song_buffer = buffer // set the song_buffer to reuse
        loop() // start the sequencer loop
        gui.add( seq, 'toggle').name('play/stop')
    })
}).catch(err => { console.error(err) })

createWaveCanvas({element:'section', analyser:fft })

// gui ----------------------
const gui = new dat.GUI()
gui.add( seq, 'tempo', 50, 200)
// gui.add( seq, 'bars', 0, 4).step(1)
gui.add( seq, 'scheduleAheadTime', 0.0, 1.0)
gui.add( seq, 'noteResolution', [0,1,2])
gui.add( seq, 'multitrack')
