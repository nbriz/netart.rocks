/*
    Slapback Delay Effect class
    remixed from: https://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/
*/
class SlapbackDelay {
    constructor( audioContext, config ){
        this.ctx = audioContext
        this.input = new GainNode(this.ctx)
        this.output = new GainNode(this.ctx)

        let params = (config) ? config : {}
        this.delayTime = params.delayTime || 0.15
        this._feedback = params.feedback || 0.5
        this._amount = params.amount || 0.5

        // fx nodes
        this.delayNode = new DelayNode(this.ctx,{delayTime: this.delayTime})
        this.feedbackNode = new GainNode(this.ctx, {gain:this._feedback})
        this.wet = new GainNode(this.ctx, {gain:this._amount})

        // routing
        /*
            input ----------------------→ output
             \                               ↑
              `-----→ delay ------→ wet -----'
                      ↓ ↑
                    feedback
        */
        this.input.connect( this.delayNode )
        this.input.connect( this.output )
        this.delayNode.connect( this.feedbackNode )
        this.delayNode.connect( this.wet )
        this.feedbackNode.connect( this.delayNode )
        this.wet.connect( this.output )
    }

    connect(){ this.output.connect(...arguments) }
    disconnect(){ this.output.disconnect(...arguments) }

    get delayTime(){ return this._delayTime }
    set delayTime(v){
        if(this.delayNode)
            this.delayNode.delayTime.setValueAtTime(v,this.ctx.currentTime)
        this._delayTime = v
    }

    get feedback(){ return this._feedback }
    set feedback(v){
        if(this.feedbackNode)
            this.feedbackNode.gain.setValueAtTime(v,this.ctx.currentTime)
        this._feedback = v
    }

    get amount(){ return this._amount }
    set amount(v){
        if(this.wet)
            this.wet.gain.setValueAtTime(v,this.ctx.currentTime)
        this._amount = v
    }
}

// --------------------------

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const slap = new SlapbackDelay( ctx )

src.connect(slap.input)
slap.connect(fft)
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
gui.add( slap, 'delayTime', 0, 1 )
gui.add( slap, 'feedback', 0, 1 )
gui.add( slap, 'amount', 0, 1 )
gui.add( src, 'stop')
