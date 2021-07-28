import React from 'react';
import SpeechRecognition from 'react-speech-recognition';
import WorkerP2P from './P2P/WorkerP2P'
import Dictaphone from './Dictaphone'


type MyState = {
  peerId: string
  dataPeerId: string
  targetPeerId: string
  targetDataPeerId: string
  dataStr: string
  videoSound: boolean
  message: string
  isLocal: boolean
};
class VoiceChangeWorker extends React.Component<{}, MyState> {
  private remoteVideo?: HTMLVideoElement | null
  private workerP2P: WorkerP2P | null
  constructor(props: any) {
    super(props);
    this.state = {
      peerId: "",
      dataPeerId: "",
      targetPeerId: "",
      targetDataPeerId: "",
      dataStr: "",
      videoSound: true,
      message: "",
      isLocal: false
    };
    this.remoteVideo = null;
    this.workerP2P = new WorkerP2P()
  }

  componentWillMount() {
    const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const randomStr = Array.from(Array(6)).map(()=>S[Math.floor(Math.random()*S.length)]).join('');
    const peerId = `${randomStr}_worker`
    const randomDataStr = Array.from(Array(6)).map(()=>S[Math.floor(Math.random()*S.length)]).join('');
    const dataPeerId = `${randomDataStr}_worker`
    this.setState({peerId, dataPeerId})
    this.workerP2P = new WorkerP2P()
    this.workerP2P.open({
      peerId: peerId,
      dataPeerId: dataPeerId,
      dataCb: this.dataListenerCallback,
      remoteVideo: this.remoteVideo,
    })
  }



  dataListenerCallback = async () => {
    if(!this.workerP2P) return
    this.workerP2P.dataListener((data: any) => {
      console.log(`受け取った : ${data}`);
    });
  };

  startReception = () => {
    if(!this.workerP2P) return
    this.workerP2P.call(
      {
        targetPeerId: this.state.targetPeerId,
        targetDataPeerId: this.state.targetDataPeerId,
        streamCallback: this.P2PStreamCallback,
      }
    )
  }

  P2PStreamCallback = (stream: MediaStream) => {
    console.log("p2p stream get");
    if (!this.remoteVideo) return
    this.remoteVideo.srcObject = stream;
    this.remoteVideo.play()
  };

  startRecording = () => {
    SpeechRecognition.startListening({ continuous: false, language: 'ja-JP' })
  }

  endRecording = () => {
    SpeechRecognition.stopListening()
  }

  setMessage = (text: string) => {
    this.setState({ message: text })
    if(!this.workerP2P) return
    this.workerP2P.sendData(text)
    this.endRecording()
    if (!this.state.isLocal) {
      setTimeout(() => {
        this.startRecording()
      },100) 
    }
    
    
  }

  commands = () => {
    return [
    {
      command: '* is my name',
      callback: (name: string) => this.setMessage(`Hi ${name}!`),
      matchInterim: true
    },
    {
      command: 'My top sports are * and *',
      callback: (sport1: string, sport2: string) => this.setMessage(`#1: ${sport1}, #2: ${sport2}`)
    },
    {
      command: 'Goodbye',
      callback: () => this.setMessage('So long!'),
      matchInterim: true
    },
    {
      command: 'Pass the salt (please)',
      callback: () => this.setMessage('My pleasure')
    }
  ]
  }

  render() {
    return (
      <>
        <div>
          <h1>ボイスチェンジ_ワーカー用</h1>
          <h2>機能(ワーカー側から店舗のPeerIDを入力して接続してください)</h2>
          <ul>
            <li>skywayを使ってのP2Pメディア接続、P2Pデータ(指定のPeerへ接続、切断)〇</li>
            <li>仮想MediaStreamを作成して、P2Pメディアを出力、受信した動画、音声のストリームを表示する〇</li>
            <li>スピーチToテキストで音声をテキスト化</li>
            <li>テキスト化で固定されたら、P2Pデータでテキスト出力</li>
          </ul>
          <div>
            <p>自身のPeerId: </p>
            <p>media: <input value={this.state.peerId} /> data: <input value={this.state.dataPeerId} /></p>
            <p>接続先PeerId: </p>
            <p>media: <input
              value={this.state.targetPeerId}
              onChange={(e: any) => {
                this.setState({targetPeerId: e.target.value})
              }}
            /> data: <input
              value={this.state.targetDataPeerId}
              onChange={(e: any) => {
                this.setState({targetDataPeerId: e.target.value})
              }}
              /> <button onClick={() => {
                this.startReception()
                console.warn('this.state.isLocal', this.state.isLocal)
                if (!this.state.isLocal) {
                  this.startRecording()
                }
              }}>接続する</button></p>
            <p>dataを送信する: <input
              value={this.state.dataStr}
              onChange={(e: any) => {
                this.setState({dataStr: e.target.value})
              }}
            /><button onClick={() => {
                if(!this.workerP2P) return
                this.workerP2P.sendData(this.state.dataStr)
              }}>dataの送信</button></p>
            <p><button onClick={() => {
              this.setState({isLocal: !this.state.isLocal})
            }}>{this.state.isLocal ? "ローカル確認モード(毎回音声認識ボタンを操作する)": "常に音声認識ON"}</button><button onClick={() => {
              this.startRecording()
            }}>音声を認識をONにする</button><button onClick={() => {
              this.endRecording()
              }}>音声を認識をOFFにする</button></p>
            
            <Dictaphone commands={this.commands} setMessage={ this.setMessage } />
            <p><button
              onClick={() => {
                this.setState({videoSound: !this.state.videoSound})
              }}
            >{this.state.videoSound ? "音声ONにする" : "音声OFFにする"}</button></p>
            <div>
              <video
                ref={(video: HTMLVideoElement) => (this.remoteVideo = video)}
                muted={this.state.videoSound}
                style={{position: "absolute", width: "480px", backgroundColor: "grey"}}
              ></video>
              <p
                style={{position: "absolute"}}
              >{this.state.message}</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}

// クラスをexport
export default VoiceChangeWorker;