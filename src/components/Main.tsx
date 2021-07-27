import React from 'react';
import Analysis from './Analysis'


type MyState = {
  isAudio: boolean
  volume: number
};
class Main extends React.Component<{}, MyState> {
  private localAudio?: HTMLVideoElement | null
  private sound: AnalyserNode | null
  private localStream: MediaStream | null
  private micAudio: any
  constructor(props: any) {
    super(props);
    this.state = {
      isAudio: false,
      volume: 0,
    };
    this.localAudio = null
    this.sound = null
    this.micAudio = null
    this.localStream = null
  }

  setAudio = (event: 'start' | 'stop') => {
    if (event === 'start') {
      if (this.localAudio && this.localAudio.srcObject) {
        this.localAudio.srcObject = null
        this.setState({isAudio: false})
      }
      this.micAudio = navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream: MediaStream) => {
        console.warn('localStream', stream)
        this.localStream = stream
        if (this.localAudio) {
          this.setState({isAudio: true})
          this.localAudio.srcObject = stream
          this.localAudio.play()
          this.setAudioVolume(stream)
          setInterval(() => {
            if (this.sound) {
              const volume = this.getAudioVolume(this.sound)
              this.setState({volume})
            }
          }, 1000)
        }
      })
    } else {
      if (this.localAudio && this.localAudio.srcObject && this.localStream) {
        this.localStream.getTracks().forEach(function(track: any) {
          track.stop();
        });
        this.localAudio.srcObject = null
        this.setState({isAudio: false})
      };
    }
  }

  setAudioVolume = (mediaStream: MediaStream) => {
    const audioContext = new AudioContext();
    this.sound = audioContext.createAnalyser();
    this.sound.fftSize = 128;
    const source = audioContext.createMediaStreamSource(mediaStream!);
    source.connect(this.sound);
  }

  getAudioVolume = (sound: AnalyserNode ) => {
    const bit8 = new Uint8Array(sound.frequencyBinCount);
    sound.getByteFrequencyData(bit8);
    return (
      bit8.reduce((previous, current) => {
        return previous + current;
      }) / sound.frequencyBinCount
    )
  }

  // transformAudio = () => {

  // }

  render() {
    return (
      <>
        <div>
          <h1>ボイスチェンジテスト用</h1>
          <div>
            <button onClick={() => {
              this.setAudio('start')
            }}>変換開始</button>
            <button onClick={() => {
              this.setAudio('stop')
            }}>音声の取得を停止する</button>
            {this.state.isAudio ? (
              <p>再生中...</p>
            ) : (<p>音声は取得していません</p>)}
          </div>
          {this.state.volume && (<p>音量：{this.state.volume}</p>)}
          <video style={{height: '0px'}}
              ref={(video: HTMLVideoElement) => (this.localAudio = video)} />
        </div>
        <Analysis />
      </>
    );
  }
}

// クラスをexport
export default Main;