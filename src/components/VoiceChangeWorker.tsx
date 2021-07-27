import React from 'react';


type MyState = {
  isAudio: boolean
};
class VoiceChangeWorker extends React.Component<{}, MyState> {
  private remoteVideo?: HTMLVideoElement | null
  constructor(props: any) {
    super(props);
    this.state = {
      isAudio: false,
    };
    this.remoteVideo = null;
  }



  render() {
    return (
      <>
        <div>
          <h1>ボイスチェンジ_ワーカー用</h1>
          <h2>機能</h2>
          <ul>
            <li>skywayを使ってのP2Pメディア接続、P2Pデータ(指定のPeerへ接続、切断)</li>
            <li>仮想MediaStreamを作成して、P2Pメディアを出力、受信した動画、音声のストリームを表示する</li>
            <li>スピーチToテキストで音声をテキスト化</li>
            <li>テキスト化で固定されたら、P2Pデータでテキスト出力</li>
          </ul>
          <div>
            <video ref={(video: HTMLVideoElement) => (this.remoteVideo = video)}></video>

          </div>
        </div>
      </>
    );
  }
}

// クラスをexport
export default VoiceChangeWorker;