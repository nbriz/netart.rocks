/*
    OverDrive

*/
class OverDrive {
    constructor( audioContext, config ){
        this.ctx = audioContext
        this.input = new GainNode(this.ctx)
        this.output = new GainNode(this.ctx)

        let params = (config) ? config : {}
        this.threshold = params.threshold || -27 // dB
        this.headroom =  params.headroom || 21 // dB
        this._drive = params.drive || 0.5
        this._amount = params.amount || 0.5
        // this.drive = this._drive

        // fx nodes
        this.dry = new GainNode(this.ctx, {gain:1-this._amount})
        this.wet = new GainNode(this.ctx, {gain:this._amount})
        this.ovrDrive = new WaveShaperNode( this.ctx )
        let curve = new Float32Array(65536)
        console.log(curve)
        this.ovrDrive.curve = this._generateColortouchCurve(curve)

        // routing
        /*
            input ------------→ dry ---→ output
             \                   ∝        ↑
              `--→ ovrDrive --→ wet ------'
        */
        this.input.connect(this.dry)
        this.input.connect(this.ovrDrive)
        this.ovrDrive.connect(this.wet)
        this.dry.connect(this.output)
        this.wet.connect(this.output)
    }

    connect(){ this.output.connect(...arguments) }
    disconnect(){ this.output.disconnect(...arguments) }

    get drive(){ return this._drive }
    set drive(v){
        if(v < 0.01) v = 0.01
        this.input.gain.setValueAtTime(v,this.ctx.currentTime)
        this.output.gain
            .setValueAtTime(Math.pow(1/v,0.6),this.ctx.currentTime)
        this._drive = v
    }

    get amount(){ return this._amount }
    set amount(v){
        if(this.wet && this.dry){
            this.wet.gain.setValueAtTime(v,this.ctx.currentTime)
            this.dry.gain.setValueAtTime(1-v,this.ctx.currentTime)
        }
        this._amount = v
    }

    _e4(x,k){ return 1.0 - Math.exp(-k * x) }
    _dBToLinear(db){ return Math.pow(10.0, 0.05 * db) }
    _shape(x){
        let linearThreshold = this._dBToLinear(this.threshold)
        let linearHeadroom = this._dBToLinear(this.headroom)

        let maximum = 1.05 * linearHeadroom * linearThreshold
        let kk = (maximum - linearThreshold)

        let sign = x < 0 ? -1 : +1
        let absx = Math.abs(x)

        let shapedInput = absx < linearThreshold ?
            absx :
            linearThreshold + kk * this._e4(absx - linearThreshold, 1.0 / kk)
        shapedInput *= sign

        return shapedInput
    }
    _generateColortouchCurve(curve){
        let x, n = 65536
        let n2 = n / 2
        for (let i = 0; i < n2; ++i){
            x = i / n2
            x = this._shape(x)
            curve[n2 + i] = x
            curve[n2 - i - 1] = -x
        }
        console.log(curve)
        return curve
    }
}

// --------------------------

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const ovd  = new OverDrive( ctx )

src.connect(ovd.input)
ovd.connect(fft)
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
gui.add( ovd, 'threshold', -50, 0 )
gui.add( ovd, 'headroom', 0, 50 )
gui.add( ovd, 'drive', 0, 1 )
gui.add( ovd, 'amount', 0, 1 )
gui.add( src, 'stop')
