/*
    Ring Modulator
    take a look at [pizzicato](https://github.com/alemangui/pizzicato/blob/master/src/Effects/RingModulator.js)'s ring mode for something a little fancier
*/
class RingMod {
    constructor( audioContext, config ){
        this.ctx = audioContext
        this.input = new GainNode(this.ctx)
        this.output = new GainNode(this.ctx)

        let params = (config) ? config : {}
        this._frequency = params.frequency || 11
        this._amount = params.amount || 0.5

        // fx nodes
        this.dry = new GainNode(this.ctx, {gain:1-this._amount})
        this.wet = new GainNode(this.ctx, {gain:this._amount})
        this.fxNode = new GainNode(this.ctx)
        this.oscNode = new OscillatorNode(this.ctx,
            {frequency:Math.pow(2,this._frequency)})
        this.oscNode.start()

        // routing
        /*
            input ------→ dry ---→ output
             \             ∝        ↑
              `--→ fx --→ wet ------'
                    ↑[gain]
                   osc
        */
        this.input.connect(this.dry)
        this.input.connect(this.fxNode)
        this.oscNode.connect(this.fxNode.gain)
        this.fxNode.connect(this.wet)
        this.dry.connect(this.output)
        this.wet.connect(this.output)
    }

    connect(){ this.output.connect(...arguments) }
    disconnect(){ this.output.disconnect(...arguments) }

    get frequency(){ return this._frequency }
    set frequency(v){
        if(this.oscNode)
            this.oscNode.frequency
                .setValueAtTime(Math.pow(2,v),this.ctx.currentTime)
        this._frequency = v
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
const rm  = new RingMod( ctx )

src.connect(rm.input)
rm.connect(fft)
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
gui.add( rm, 'frequency', 4, 14 )
gui.add( rm, 'amount', 0, 1 )
gui.add( src, 'stop')
