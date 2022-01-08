/*
    when it comes to scales, the [Greek modes](http://www.simplifyingtheory.com/modes-ionian-dorian-phrygian-lydian-mixolydian-aeolian-locrian/) always seems a good place to start.
    below are the 7 Greek modes. here we're also using the [Note](ex/helpers/Note.js) helper class
    which abstracts away a lot of the musical maths as well as a [melody-canvas](ex/helpers/melody-canvas.js)
    function which takes a Note instance and a melody and visualizes it onto a
    canvas.

    note that the modes are a series of values corresponding to the distance
    between the current note and the prior, essentially 2 represents a whole step
    (or tone) while 1 represents a half-step (or semi-tone). i've included here
    a couple of helper functions, mode2melody which takes a mode array and
    converts it to a melody, which i'm defining as an array of steps relative to
    a root note (rather than the previous note). there is also a deg2step
    function which takes a [degree](http://www.simplifyingtheory.com/degrees-music-intervals/) and and mode and returns how many steps from
    the root note that degree is. (try these in the console to see how they work)
*/


let mode = {type:'ionian'}
let note = new Note()
// added spaces around the 1's in the modes so that it
// would be easier to visualize the pattern/relationship
const modes = {
    'ionian':     [2,2, 1 ,2,2,2, 1 ],// major
    'dorian':     [2, 1 ,2,2,2, 1 ,2],
    'phrygian':   [ 1 ,2,2,2, 1 ,2,2],
    'lydian':     [2,2,2, 1 ,2,2, 1 ],
    'mixolydian': [2,2, 1 ,2,2, 1 ,2],
    'aeolian':    [2, 1 ,2,2, 1 ,2,2],// minor
    'locrian':    [ 1 ,2,2, 1 ,2,2,2]
}

function deg2step(degree,mode){
    let steps = 0 // how many steps from root is the given degree
    for (let i = 0; i < degree; i++) steps += mode[i]
    return steps
}

function mode2melody(mode,includeOctave){
    let melody = []
    for (let degree = 0; degree < mode.length; degree++) {
        let steps = 0
        for (let s = 0; s < degree; s++) steps += mode[s]
        melody.push(steps)
    }
    if(includeOctave) melody.push(12)
    return melody
}

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx, {frequency:note.freq})
const lvl = new GainNode( ctx, {gain:0.75})
osc.connect(lvl)
lvl.connect(ctx.destination)

let play
let d = 0 // degree, ie. current note (count/beat) in the scale
let canvas = createMelodyCanvas({
    element:'section',
    melody: mode2melody( modes[mode.type], true ),
    note:note
})

function playScale(){
    play = setTimeout(playScale, 250)

    canvas.update({
        degree:d // note to be highlighted
    })

    let s = deg2step(d,modes[mode.type])
    osc.frequency.value = note.step(s).freq

    d++; if(d>=8) d=0 // loop count 0-7
}



// gui -------------------------------------------------------------------------
const gui = new dat.GUI()
const notes = ["A", "A#", "B","C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
gui.add( note, 'note', notes)
    .onChange((val)=>{
        let oc = (notes.indexOf(val)>2) ? 5 : 4
        note.note = val+oc
        canvas.update({note:note})
    })

gui.add( mode, 'type', Object.keys(modes))
    .onChange((val)=>{
        canvas.update({ melody:mode2melody(modes[val],true) })
    })

gui.add( note, 'tuning', ['just','equal'])
    .onChange(() => { canvas.update({tuning:note.tuning}) })

let btn = gui.add( osc, 'start').onChange(() => {
    playScale()
    btn.remove()
    btn = gui.add( osc, 'stop').onChange(() => {
        btn.remove()
        clearInterval(play)
        canvas.update({})
    })
})
