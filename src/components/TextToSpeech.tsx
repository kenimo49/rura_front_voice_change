import React from 'react';

type MyState = {
  speechSynthesisVoiceOption: any
  selectValue: number 
};
class TextToSpeech extends React.Component<{}, MyState> {
  private textarea: HTMLInputElement | null
  private select: HTMLSelectElement | null
  private speechSynthesisVoice: SpeechSynthesisVoice | null
  private speechSynthesisVoices: SpeechSynthesisVoice[]
  constructor(props: any) {
    super(props);
    this.state = {
      speechSynthesisVoiceOption: (<></>),
      selectValue: 0
    };
    this.textarea = null
    this.select = null
    this.speechSynthesisVoice = null
    this.speechSynthesisVoices = []
  }

  componentWillMount() {
    console.log('componentWillMount')
    this.setSpeechSynthesisVoiceOptions()
  }

  startTextToSpeech = () => {
    console.log(`speech: ${this.textarea?.value}`)
    let speech = new SpeechSynthesisUtterance();
    speech.lang = "jp";
    if (speech && this.textarea && this.textarea.value) {
      speech.text = this.textarea.value
    }
    speech.rate = 1 // default
    speech.pitch = 1 // default
    speech.voice = this.speechSynthesisVoices[this.state.selectValue]
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
      <div>
        <h2>テキストTOスピーチ</h2>
        <ul>
          <li>1. テキストを取得して、音声を再生する<a href="https://www.section.io/engineering-education/text-to-speech-in-javascript/">詳細</a></li>
        </ul>
        <select
          value={this.state.selectValue}
          onChange={this.selectChange}
        >{this.state.speechSynthesisVoiceOption}</select>
        <input type="text" ref={(text: HTMLInputElement) => (this.textarea = text)} />
        <div>
          <button onClick={() => {
            this.startTextToSpeech()
          }}>再生</button>
        </div>
      </div>
    );
  }
}

// クラスをexport
export default TextToSpeech;