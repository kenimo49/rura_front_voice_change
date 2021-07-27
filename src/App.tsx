import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import Main from './components/Main'
import Analysis from './components/Analysis'
import TextVoiceChange from './components/TextVoiceChange'
import VoiceChangeWorker from './components/VoiceChangeWorker'
import VoiceChangeShop from './components/VoiceChangeShop'

function App() {
  return (
    <Router>
      <div>
        {/* ナビゲーション */}
        <ul>
          <li><Link to="/">音声の取得、再生</Link></li>
          <li><Link to="/analysis">音波の表示</Link></li>
          <li><Link to="/texttovoicechange">テキストボイスチェンジ</Link></li>
          <li><Link to="/voice_change_worker">テキストボイスチェンジDEMO_ワーカー</Link></li>
          <li><Link to="/voice_change_shop">テキストボイスチェンジDEMO_店舗</Link></li>
        </ul>

        {/* ここから下が実際のコンテンツに置き換わる */}
        <Switch>
          <Route exact path="/" component={Main} />
          <Route exact path="/analysis" component={Analysis} />
          <Route path="/texttovoicechange" component={TextVoiceChange} />
          <Route path="/voice_change_worker" component={VoiceChangeWorker} />
          <Route path="/voice_change_shop" component={VoiceChangeShop} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
