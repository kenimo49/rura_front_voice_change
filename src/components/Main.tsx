import React from 'react';


type MyState = {
};
class Main extends React.Component<{}, MyState> {
  private localAudio?: HTMLVideoElement | null;
  constructor(props: any) {
    super(props);
    this.state = {
    };
    this.localAudio = null
  }


  componentWillMount = () => {
    
  }

  transformAudio = (event: 'start' | 'stop') => {
    if (event === 'start') {
      if (this.localAudio && this.localAudio.srcObject) {
        this.localAudio.srcObject = null
      }
      navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((localStream: MediaStream) => {
        console.warn('localStream', localStream)
        if (this.localAudio) {
          this.localAudio.srcObject = localStream
          this.localAudio.play()
        }
      })
    } else {
      if (this.localAudio && this.localAudio.srcObject) {
        this.localAudio.srcObject = null
      }
    }
    
  }

  render() {
    return (
      <>
        <div>
          <h1>ボイスチェンジテスト用</h1>
          <button onClick={() => {
            this.transformAudio('start')
          }}>変換開始</button>
          <button onClick={() => {
            this.transformAudio('stop')
          }}>音声の取得を停止する</button>
          {this.localAudio?.srcObject ? (
            <p>再生中...</p>
          ) : (<>音声は取得していません</>) }
          <video
              ref={(video: HTMLVideoElement) => (this.localAudio = video)} />
        </div>
      </>
    );
  }
}

// クラスをexport
export default Main;