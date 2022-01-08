/*
    Flanger
*/
class Flanger {
    constructor( audioContext, config ){
        this.ctx = audioContext
        this.input = new GainNode(this.ctx)
        this.output = new GainNode(this.ctx)

        let params = (config) ? config : {}
        this._delayTime = params.delayTime || 0.005
        this._depth = params.depth || 0.002 // fgain's gain
        this._speed = params.speed || 0.25 // oscNode's frequency
        this._feedback = params.feedback || 0.5
        this._amount = params.amount || 0.5

        // fx nodes
        this.dry = new GainNode(this.ctx, {gain:1-this._amount})
        this.wet = new GainNode(this.ctx, {gain:this._amount})
        this.delay = new DelayNode(this.ctx,{delayTime:this._delayTime})
        this.fgain = new GainNode(this.ctx,{gain:this._depth})
        this.osc = new OscillatorNode(this.ctx,{frequency:this._speed})
        this.feedbck = new GainNode(this.ctx,{gain:this._feedback})
        this.osc.start(0)

        // routing
        /*
            input ---------→ dry ---→ output
            ↑\                ∝        ↑
            | `--→ delay --→ wet ------'
            |      ↓   ↑[time]
            feedback  depth
                       ↑
                      osc
        */
        this.input.connect(this.dry)
        this.input.connect(this.delay)
        this.delay.connect(this.feedbck)
        this.delay.connect(this.wet)
        this.feedbck.connect(this.input)
        this.fgain.connect(this.delay.delayTime)
        this.osc.connect(this.fgain)
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
        if(this.fgain)
            this.fgain.gain.setValueAtTime(v,this.ctx.currentTime)
        this._depth = v
    }

    get feedback(){ return this._feedback }
    set feedback(v){
        if(this.feedbck)
            this.feedbck.gain.setValueAtTime(v,this.ctx.currentTime)
        this._feedback = v
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
const fgr  = new Flanger( ctx )

src.connect(fgr.input)
fgr.connect(fft)
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
gui.add( fgr, 'speed', 0.5, 15 )
gui.add( fgr, 'delayTime', 0.001, 0.02 )
gui.add( fgr, 'depth', 0.0005, 0.005 )
gui.add( fgr, 'feedback', 0, 1 )
gui.add( fgr, 'amount', 0, 1 )
gui.add( src, 'stop')
