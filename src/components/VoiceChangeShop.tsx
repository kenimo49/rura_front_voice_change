import React from 'react';
import ShopP2P from './P2P/ShopP2P'
import idleImage from "../images/idle.gif";
import talkImage from "../images/Talk.gif";

type MyState = {
  peerId: string
  dataPeerId: string
  targetPeerId: string
  targetDataPeerId: string
  speechSynthesisVoiceOption: any
  selectValue: number
  robotImage: string
};
class VoiceChangeShop extends React.Component<{}, MyState> {
  private shopP2P: ShopP2P | null
  private speechSynthesisVoices: SpeechSynthesisVoice[]
  constructor(props: any) {
    super(props);
    this.state = {
      peerId: "",
      dataPeerId: "",
      targetPeerId: "",
      targetDataPeerId: "",
      speechSynthesisVoiceOption: (<></>),
      selectValue: 0,
      robotImage: idleImage,
    };
    this.shopP2P = null
    this.speechSynthesisVoices = []
  }

  componentWillMount() {
    this.setSpeechSynthesisVoiceOptions()
    const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const randomStr = Array.from(Array(6)).map(()=>S[Math.floor(Math.random()*S.length)]).join('');
    const peerId = `${randomStr}_shop`
    const randomDataStr = Array.from(Array(6)).map(() => S[Math.floor(Math.random() * S.length)]).join('');
    const dataPeerId = `${randomDataStr}_shop`
    this.setState({peerId, dataPeerId})
    this.shopP2P = new ShopP2P()
    this.shopP2P.open({peerId: peerId, dataPeerId: dataPeerId, dataCb: this.dataListenerCallback})
  }

  startReception = () => {
    if(!this.shopP2P) return
    this.shopP2P.call(
      {
        targetPeerId: this.state.targetPeerId,
        targetDataPeerId: this.state.targetDataPeerId,
      }
    )
  }

  dataListenerCallback = async () => {
    if(!this.shopP2P) return
    this.shopP2P.dataListener((data: string) => {
      console.log(`受け取った : ${data}`);
      
      this.startTextToSpeech(data)
    });
  };

  startTextToSpeech = (text: string) => {
    const init = this
    console.log(`speech: ${text}`)
    let speech = new SpeechSynthesisUtterance();
    speech.lang = "jp";
    speech.text = text
    speech.rate = 1 // default
    speech.pitch = 1 // default
    speech.voice = this.speechSynthesisVoices[this.state.selectValue]
    speech.onstart = function (event) {
        init.setState({robotImage: talkImage})
    };
    speech.onend = function (event) {
        init.setState({robotImage: idleImage})
    };
    window.speechSynthesis.speak(speech);
  }

  setSpeechSynthesisVoiceOptions = () => {
    const options: any[] = []
    let voices = [];
    console.log('setSpeechSynthesisVoiceOptions')
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      console.log('voices', voices)
      this.speechSynthesisVoices = voices;
      console.log('speechSynthesisVoices', this.speechSynthesisVoices)
      this.speechSynthesisVoices.forEach((speechSynthesisVoice: SpeechSynthesisVoice, index: number) => {
        options.push(
          <option value={index}>{speechSynthesisVoice.name} / </option>
        )
      })
      console.log('options', options)
      this.setState({speechSynthesisVoiceOption: options})
    };
  }

  selectChange = (e: any) => {
    this.setState({selectValue: e.target.value});
  }



  render() {
    return (
      <>
        <div>
          <h1>ボイスチェンジ_店舗用</h1>
          <h2>機能</h2>
          <ul>
            <li>getUserMediaを使って、ビデオと音声の取得〇</li>
            <li>skywayを使ってのP2Pメディア接続、P2Pデータ(指定のPeerへ接続、切断)〇</li>
            <li>P2Pデータで送られてきたテキストをWebTextToSpeechAPIを実行し、音声ファイルorストリームの生成〇</li>
            <li>gifアニメーションを再生し、音声ファイルが新しく再生されるタイミングで、トークgifアニメーションに入れ替え</li>
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
            />data: <input
              value={this.state.targetDataPeerId}
              onChange={(e: any) => {
                this.setState({targetDataPeerId: e.target.value})
              }}
            /><button onClick={this.startReception}>接続</button></p>
            <select
              value={this.state.selectValue}
              onChange={this.selectChange}
            >{this.state.speechSynthesisVoiceOption}</select>
            <img src={this.state.robotImage} style={{width: "400px"}} />
          </div>
        </div>
      </>
    );
  }
}

// クラスをexport
export default VoiceChangeShop;