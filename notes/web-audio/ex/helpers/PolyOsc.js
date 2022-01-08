/*
    let poly = new PolyOsc( audioContext, {
        amount:3, // optional
        type:'sine' // optional
    })
*/

class PolyOsc {
    constructor(audioContext,amt){
        if(!audioContext) throw new Error('PolyOsc: requires first argument '+
        'be an instance of an AudioContext')

        let opts
        if( typeof amt == "number") opts = { amount:amt }
        else if(typeof amt == "object") opts = amt
        else if(typeof amt == "undefined") opts = {amount:3}
        else throw new Error('PolyOsc: second argument should either be a '+
        'number (the amount of oscillators), or an options object')

        this.actx = audioContext
        this.notes = []

        // create oscillators
        let amount = opts.amount || 3
        let type = opts.type || 'sine'
        for (let i = 0; i < amount; i++) this.notes.push({
            osc:new OscillatorNode( this.actx, {type:type}),
            lvl:new GainNode( this.actx, {gain:1/amount})
        })
        // connect oscillators
        this.output = new GainNode(this.actx, {gain:0})
        for (let n = 0; n < this.notes.length; n++) {
            this.notes[n].osc.connect( this.notes[n].lvl )
            this.notes[n].lvl.connect( this.output )
            this.notes[n].osc.start()
        }
    }

    connect(){ this.output.connect(...arguments) }

    disconnect(){ this.output.disconnect(...arguments) }

    set(freqArray){
        if( !(freqArray instanceof Array) || typeof freqArray[0] !== "number" )
            throw new Error('PolyOsc.set: is expecting an array of frequencies')
        else if( freqArray.length < this.notes.length )
            console.warn('PolyOsc.set: you\'ve passed an array smaller than '+
            'the nmber of internal oscillators (will repeat root note)')
        else if( freqArray.length > this.notes.length )
            console.warn('PolyOsc.set: you\'ve passed an array larger than '+
            'the nmber of internal oscillators (the extra values are ignored)')

        for (let n = 0; n < this.notes.length; n++) {
            let freq = freqArray[n] || freqArray[0]
            this.notes[n].osc.frequency.value = freq
        }
    }
}
