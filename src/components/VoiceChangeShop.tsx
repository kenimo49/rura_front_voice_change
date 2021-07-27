import React from 'react';


type MyState = {
  isAudio: boolean
};
class VoiceChangeShop extends React.Component<{}, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isAudio: false,
    };
  }

  render() {
    return (
      <>
        <div>
          <h1>ボイスチェンジ_ワーカー用</h1>
          <h2>機能</h2>
          <ul>
            <li>getUserMediaを使って、ビデオと音声の取得</li>
            <li>skywayを使ってのP2Pメディア接続、P2Pデータ(指定のPeerへ接続、切断)</li>
            <li>P2Pデータで送られてきたテキストをWebTextToSpeechAPIを実行し、音声ファイルorストリームの生成</li>
            <li>音声ファイルを再生</li>
            <li>gifアニメーションを再生し、音声ファイルが新しく再生されるタイミングで、トークgifアニメーションに入れ替え</li>
          </ul>
        </div>
      </>
    );
  }
}

// クラスをexport
export default VoiceChangeShop;