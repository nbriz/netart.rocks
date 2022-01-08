/*
    Chorus
*/
class Chorus {
    constructor( audioContext, config ){
        this.ctx = audioContext
        this.input = new GainNode(this.ctx)
        this.output = new GainNode(this.ctx)

        let params = (config) ? config : {}
        this._delayTime = params.delayTime || 0.03
        this._depth = params.depth || 0.002 // cgain's gain
        this._speed = params.speed || 3.5 // osc's frequency
        this._amount = params.amount || 0.5

        // fx nodes
        this.dry = new GainNode(this.ctx, {gain:1-this._amount})
        this.wet = new GainNode(this.ctx, {gain:this._amount})
        this.delay = new DelayNode(this.ctx,
            {maxDelayTime:2, delayTime:this._delayTime})
        this.cgain = new GainNode(this.ctx, {gain:this._depth})
        this.osc = new OscillatorNode(this.ctx, {frequency:this._speed})
        this.osc.start(0)

        // routing
        /*
            input ---------→ dry ---→ output
             \                ∝        ↑
              `--→ delay --→ wet ------'
                    ↑[time]
                  cgain
                    ↑
                   osc
        */
        this.input.connect(this.dry)
        this.input.connect(this.delay)
        this.delay.connect(this.wet)
        this.cgain.connect(this.delay.delayTime)
        this.osc.connect(this.cgain)
        this.dry.connect(this.output)
        this.wet.connect(this.output)
    }

    connect(){ this.output.connect(...arguments) }
    disconnect(){ this.output.disconnect(...arguments) }

    get speed(){ return this._speed }
    set speed(v){
        if(this.osc)
            this.osc.frequency.setValueAtTime(v,this.ctx.currentTime)
        this._speed = v
    }

    get delayTime(){ return this._delayTime }
    set delayTime(v){
        if(this.delay)
            this.delay.delayTime.setValueAtTime(v,this.ctx.currentTime)
        this._delayTime = v
    }

    get depth(){ return this._depth }
    set depth(v){
        if(this.cgain)
            this.cgain.gain.setValueAtTime(v,this.ctx.currentTime)
        this._depth = v
    }

    get amount(){ return this._amount }
    set amount(v){
        if(this.wet && this.dry){
            this.wet.gain.setValueAtTime(v,this.ctx.currentTime)
            this.dry.gain.setValueAtTime(1-v,this.ctx.currentTime)
        }
        this._amount = v
    }
}

// --------------------------

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const ch  = new Chorus( ctx )

src.connect(ch.input)
ch.connect(fft)
fft.connect(ctx.destination)

fetch('ex/media/katy.ogg')
.then(res => res.arrayBuffer() )
.then(data => {
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        src.start()
    })
}).catch(err => { console.error(err) })

createWaveCanvas({element:'section', analyser:fft })

// gui ----------------------
const gui = new dat.GUI()
gui.add( ch, 'speed', 0.5, 15 )
gui.add( ch, 'delayTime', 0.005, 0.055 )
gui.add( ch, 'depth', 0.0005, 0.004 )
gui.add( ch, 'amount', 0, 1 )
gui.add( src, 'stop')
