import React from 'react';
import SpeechRecognition from 'react-speech-recognition';
import { DictaphoneWidgetA } from '../Dictaphone'

type MyState = {
  isAudio: boolean
  volume: number
  recordingFlg: boolean
};
class TextVoiceChange extends React.Component<{}, MyState> {
  private textarea: HTMLTextAreaElement | null
  constructor(props: any) {
    super(props);
    this.state = {
      isAudio: false,
      volume: 0,
      recordingFlg: false,
    };
    this.textarea = null
  }

  endRecording = () => {
    SpeechRecognition.stopListening()
  }

  startRecording = () => {
    this.webSpeech()
  }

  addText = (text: string) => {
    if (this.textarea) {
      this.textarea.textContent += text
    }
  }

  webSpeech = () => {
    const init = this
    SpeechRecognition.startListening({ continuous: false, language: 'ja-JP' })
  }


  render() {
    return (
      <div>
        <h2>テキストボイスチェンジ</h2>
        <ul>
          <li>1. 音声を取得して、テキスト化する。</li>
          <li>2. テキストを一定毎に音声ファイルに変換する。</li>
          <li>3. 音声を再生する</li>
        </ul>
        <textarea ref={(text: HTMLTextAreaElement) => (this.textarea = text)}></textarea>
        <div>
          <button onClick={() => {
            this.startRecording()
          }}>開始</button>
          <button onClick={() => {
            this.endRecording()
          }}>終了</button>
        </div>
        <DictaphoneWidgetA />
      </div>
    );
  }
}

// クラスをexport
export default TextVoiceChange;