/*
    the [Melody.js](ex/helpers/Melody.js) helper class also contains a few methods for creating random
    melodies in any root+mode. refresh this page for a new random melody
*/

// pick a random root note
let notes = ["A", "A#", "B","C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
let rn = notes[Math.floor(Math.random()*notes.length)]

// create a melody...
// inspect the 'melody' object in the console to see the various properties
let mel = new Melody(rn,'minor')
let melody = mel.createMelodyObject({root:rn,includeOctave:true})
console.log(`performing a random melody in ${rn} ${melody.mode}`)


let canvas = createMelodyCanvas({
    element:'section',
    melody: melody.steps,
    note:new Note(melody.root)
})

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx, {frequency:melody.freqs[0]})
const lvl = new GainNode( ctx, {gain:0})
osc.connect(lvl)
lvl.connect(ctx.destination)
osc.start()

const seq = new Sequencer( ctx, {
    tempo: 100,
    bars:1,
    sixteenth:function(time){
        // get frequency of the current note in the melody
        let value = melody.freqs[this.current16thNote]
        if(value!==null) { //...so long as it's not a rest
            osc.frequency.setValueAtTime(value,time)
            let t = (60/this.tempo)/4 // how many seconds between 16th notes
            adsr({
                param: lvl.gain, value: [ 0.75, 0.6 ], startTime: time,
                a:t*0.2, d:t*0.1, s:t*0.4, r:t*0.2
            })
            canvas.update({degree:this.current16thNote})
        }
    }
})

function loop(){
    requestAnimationFrame(loop)
    if(seq.isPlaying) seq.update()
} loop()

// gui -------------------------------------------------------------------------
const gui = new dat.GUI()
gui.add( seq, 'tempo', 50, 200)
gui.add( seq, 'toggle').name('play/stop')
gui.add( location, 'reload').name('new melody')
