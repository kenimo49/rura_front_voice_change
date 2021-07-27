import React from 'react';


type MyState = {
  isAudio: boolean
  volume: number
  recordingFlg: boolean
};
class Analysis extends React.Component<{}, MyState> {
  private localAudio?: HTMLVideoElement | null
  private localMediaStream: MediaStream | null
  private audioContext: AudioContext | null
  private audioData: any[]
  private audioAnalyser: any
  private canvas?: HTMLCanvasElement | null
  constructor(props: any) {
    super(props);
    this.state = {
      isAudio: false,
      volume: 0,
      recordingFlg: false,
    };
    this.localAudio = null
    this.localMediaStream = null
    this.audioContext = new AudioContext();
    this.audioData = []
    this.audioAnalyser = null
  }

  endRecording = () => {
    if (this.localMediaStream) {
      this.localMediaStream.getTracks().forEach(function(track: any) {
        track.stop();
      });
    }
    this.setState({recordingFlg: false})
  }

  startRecording = () => {
    this.setState({recordingFlg: true})
    if (this.localAudio && this.localAudio.srcObject) {
      this.localAudio.srcObject = null
      this.setState({isAudio: false})
    }
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream: MediaStream) => {
      this.localMediaStream = stream;
      const bufferSize = 1024
      if (this.audioContext) {
        let scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
        let mediastreamsource = this.audioContext.createMediaStreamSource(stream);
        mediastreamsource.connect(scriptProcessor);
        scriptProcessor.onaudioprocess = this.onAudioProcess;
        scriptProcessor.connect(this.audioContext.destination);

        // 音声解析関連
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.audioAnalyser.fftSize = 2048;
        const frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        const timeDomainData = new Uint8Array(this.audioAnalyser.frequencyBinCount);
        mediastreamsource.connect(this.audioAnalyser); 
      }
    })
  }

  onAudioProcess = (e: any) => {
    if (!this.state.recordingFlg) return;
    const bufferSize = 1024
    // 音声のバッファを作成
    var input = e.inputBuffer.getChannelData(0);
    var bufferData = new Float32Array(bufferSize);
    for (var i = 0; i < bufferSize; i++) {
        bufferData[i] = input[i];
    }
    this.audioData.push(bufferData);
    // 波形を解析
    this.analyseVoice();
  }

  analyseVoice = () => {
    if (!this.audioContext) return
    let fsDivN = this.audioContext.sampleRate / this.audioAnalyser.fftSize;
    let spectrums = new Uint8Array(this.audioAnalyser.frequencyBinCount);
    this.audioAnalyser.getByteFrequencyData(spectrums);
    if (!this.canvas) return
    const canvasContext = this.canvas.getContext('2d');
    if (!canvasContext) return
    canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    canvasContext.beginPath();
    for (let i = 0, len = spectrums.length; i < len; i++) {
      //canvasにおさまるように線を描画
      let x = (i / len) * this.canvas.width;
      let y = (1 - (spectrums[i] / 255)) * this.canvas.height;
      if (i === 0) {
        canvasContext.moveTo(x, y);
      } else {
        canvasContext.lineTo(x, y);
      }
      let f = Math.floor(i * fsDivN);  // index -> frequency;

      // 500 Hz単位にy軸の線とラベル出力
      if ((f % 500) === 0) {
        let text = (f < 1000) ? (f + ' Hz') : ((f / 1000) + ' kHz');
        // Draw grid (X)
        canvasContext.fillRect(x, 0, 1, this.canvas.height);
        // Draw text (X)
        canvasContext.fillText(text, x, this.canvas.height);
      }
    }
    canvasContext.stroke();
    // x軸の線とラベル出力
    let textYs = ['1.00', '0.50', '0.00'];
    for (let i = 0, len = textYs.length; i < len; i++) {
      let text = textYs[i];
      let gy = (1 - parseFloat(text)) * this.canvas.height;
      // Draw grid (Y)
      canvasContext.fillRect(0, gy, this.canvas.width, 1);
      // Draw text (Y)
      canvasContext.fillText(text, 0, gy);
    }
  }

  render() {
    return (
      <div>
        <h2>音声解析</h2>
        <div>
          <button onClick={() => {
            this.startRecording()
          }}>解析開始</button>
          <button onClick={() => {
            this.endRecording()
          }}>解析終了</button>
        </div>
        <canvas style={{ width: '400px', backgroundColor: "grey"}} ref={(canvas: HTMLCanvasElement) => (this.canvas = canvas)} />
        <video
          ref={(video: HTMLVideoElement) => (this.localAudio = video)} />
      </div>
    );
  }
}

// クラスをexport
export default Analysis;