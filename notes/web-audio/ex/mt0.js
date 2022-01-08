/*
    The Web Audio API exposes access to the audio subsystem’s hardware clock
    ( the “audio clock” via .currentTime ). This is used for precisely scheduling
    parameters and events, much more precise than the JavaScript clock ( ie.
    Date.now(), setTimeout() ). However, once scheduled audio parameters and
    events can not be modified ( ex. you can’t change the tempo or pitch when
    something has already been scheduled... even if it hasn't started playing ).

    the Sequencer class  below is a collaboration between the audio clock and the
    JavaScript clock based on Chris Wilson’s article, [A Tale of Two Clocks](http://www.html5rocks.com/en/tutorials/audio/scheduling/) which
    solves this problem.
*/
class Sequencer {
    constructor(audioContext, config){
        this.ctx = audioContext
        let params = (config) ? config : {}

        this.isPlaying = (params.autoplay) ? params.autoplay : false
        this.tempo = (params.tempo) ? params.tempo : 120
        this.bars = (params.bars) ? params.bars : 1
        this.scheduleAheadTime = (params.scheduleAheadTime) ? // How far ahead
            params.scheduleAheadTime : 0.1 // to schedule, see link above.
        this.noteResolution     = (params.noteResolution) ? // 0, 1 or 2
            params.noteResolution : 0 // see _scheduleNote() for how its used.
        this.multitrack = (params.multitrack) ? // Whether or not to play more
            params.multitrack : true            // than one sample each beat.

        this.currentBar = 0
        this.current16thNote = 0 // last scheduled note
        this.nextNoteTime = 0.0 // when the next note is due (in ctx time)

        // scheduling functions
        if(params.whole) this.whole = params.whole
        if(params.half) this.half = params.half
        if(params.quarter) this.quarter = params.quarter
        if(params.sixth) this.sixth = params.sixth
        if(params.eigth) this.eigth = params.eigth
        if(params.sixteenth) this.sixteenth = params.sixteenth
    }

    _scheduleNote(bn, t){
        // bn = beat number (current16thNote), t = scheduled time
        // if noteResolution is 1, don't play non-8th 16th notes
        if ( (this.noteResolution==1) && (bn%2) ) return
        // if noteResolution is 2, don't play non-quarter 8th notes
        if ( (this.noteResolution==2) && (bn%4) ) return
        // otherwise call the previously defined scheduling functions
        if(this.multitrack){ // schedule all appropriate functions
            if (bn === 0 && this.whole) this.whole(t)
            if (bn % 2 === 0 && this.half) this.half(t)
            if (bn % 4 === 0 && this.quarter) this.quarter(t)
            if (bn % 6 === 0 && this.sixth) this.sixth(t)
            if (bn % 8 === 0 && this.eighth) this.eighth(t)
            if (this.sixteenth) this.sixteenth(t)
        } else { // schedule only one of the functions
            if (bn === 0 && this.whole ) this.whole(t)
            else if (bn % 2 === 0 && this.half) this.half(t)
            else if (bn % 4 === 0 && this.quarter) this.quarter(t)
            else if (bn % 6 === 0 && this.sixth) this.sixth(t)
            else if (bn % 8 === 0 && this.eighth) this.eighth(t)
            else if (typeof this.sixteenth) this.sixteenth(t)
        }
    }

    _nextNote(){
        let secondsPerBeat = 60.0 / this.tempo
        // Add beat length to last beat time
        this.nextNoteTime += 0.25 * secondsPerBeat
        // Advance the beat number...
        this.current16thNote++
        if(this.current16thNote == 16){ //...loop back to start
            this.current16thNote = 0
            this.currentBar++
            if(this.currentBar == this.bars) this.currentBar = 0
        }
    }

    update(){
        /*
        "This function just gets the current audio hardware time, and compares it
        against the time for the next note in the sequence - most of the time in
        this precise scenario this will do nothing (as there are no metronome
        “notes” waiting to be scheduled, but when it succeeds it will schedule
        that note using the Web Audio API, and advance to the next note."
                                                                  --Chris Wilson
        */
        while(this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime){
            this._scheduleNote( this.current16thNote, this.nextNoteTime )
            this._nextNote()
        }
    }

    toggle( type ){
        this.isPlaying = !this.isPlaying
        if (this.isPlaying) { // start playing
            // if not 'paused' reset to beggining of sequence
            if(type!=="pause") this.current16thNote = 0
            this.nextNoteTime = this.ctx.currentTime
            this.update() // kick off scheduling
        }
    }
}


/*
    below we use the Sequencer class defined above to play a bass line and a
    melody with two Oscillators
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc1 = new OscillatorNode( ctx, {type:'sine'} )
const gn1 = new GainNode( ctx, {gain:1.0} )
const osc2 = new OscillatorNode( ctx, {type:'square'} )
const gn2 = new GainNode( ctx, {gain:0.0} )
const fft = new AnalyserNode( ctx )

osc1.connect(gn1)
gn1.connect(fft)
osc1.start()
osc2.connect(gn2)
gn2.connect(fft)
osc2.start()
fft.connect(ctx.destination)

function playBass(time){
    // change bass Oscillator frequency depending on the measure we're at
    switch(this.currentBar){
        case 0: osc1.frequency.value = 130.81; break; // C3
        case 1: osc1.frequency.value = 164.81; break; // E3
        case 2: osc1.frequency.value = 196.00; break; // G3
        case 3: osc1.frequency.value = 164.81; break; // E3
    }
}

function playMelody(time){
    // change melody Oscillator frequency depending on the measure we're at...
    switch(this.current16thNote){
        case  0: osc2.frequency.value = 261.63; break; // C4
        case  4: osc2.frequency.value = 329.63; break; // E4
        case  8: osc2.frequency.value = 392.00; break; // G4
        case 12: osc2.frequency.value = 329.63; break; // E4
    }
    // ...and then play the note w/an ADSR envelope
    adsr({
        param: gn2.gain,
        value: [0.3,0.2],
        a:0.05,d:0.05,s:0.1,r:0.05,
        startTime: time
    })
}

const seq = new Sequencer( ctx, {
    tempo: 140, // 140 beats per minute tempo
    autoplay:true, // start playing by default
    bars:4, // create a 4 measure long loop
    whole:playBass, // run the "playBass" function every whole note
    quarter:playMelody // run the "playMelody" function every quarter note
})

// for more control, rather than creating an internal loop
// we call the Sequencer's .update() method in a our own loop
function loop(){
    requestAnimationFrame(loop)
    if(seq.isPlaying) seq.update()
}

loop()
createWaveCanvas({element:'section', analyser:fft })
