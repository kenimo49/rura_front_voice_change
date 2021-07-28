import Peer, { MediaConnection, DataConnection, } from "skyway-js";


class WorkerP2P {
  localStream?: void | MediaStream;
  peer?: Peer;
  dataPeer?: Peer;
  connection?: MediaConnection;
  dataConnection?: DataConnection;
  localVideo: HTMLVideoElement;

  constructor() {
    this.localVideo = document.createElement("video");
  }

  open = async ({
    peerId, dataPeerId, dataCb, remoteVideo,
  }: {
    peerId: string, dataPeerId: string, dataCb: () => void, remoteVideo: HTMLVideoElement | null | undefined
  }) => {
    console.log(`skyWay open`)
    // this.localStream = new MediaStream()
    this.localStream = await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .catch(console.error);
    const skyWayKey = process.env.REACT_APP_SKYWAY_API_KEY
    if (!skyWayKey) {
      console.error("skywayキーが設定されていません")
      return
    } else {
      console.log(`skyWayKey: ${skyWayKey}`)
    }
    this.dataPeer = new Peer(dataPeerId, { key: skyWayKey, debug: 1 });
    this.dataPeer.once("open", () => {
      console.log("data Peerの準備完了")
      dataCb()
    })

    this.peer = new Peer(peerId, { key: skyWayKey, debug: 1 });
    this.peer.once("open", () => {
      console.log("media Peerの準備完了")
    })
  }

  call = async (
    {
      targetPeerId,
      targetDataPeerId,
      streamCallback,
    }: {
        targetPeerId: string,
        targetDataPeerId: string,
        streamCallback: (stream: MediaStream) => void
    }) => {
    if (!this.localStream) return;
    if (!this.peer) return
    console.log("call", targetPeerId, targetDataPeerId);
    this.connection = this.peer.call(targetPeerId, this.localStream);
    this.connection.on("error", (error) => {
      console.log(error);
    });
    this.connection.on("stream", (stream) => {
      console.log(stream);
      return streamCallback(stream)
    });
    this.connection.on("close", () => {
      console.log("listen close");
    });
    if (!this.dataPeer) return
    this.dataConnection = this.dataPeer.connect(targetDataPeerId);
  };

  dataListener = (cb: (data: any) => void) => {
    if (this.dataConnection) {
      this.dataConnection.on("data", (data: any) => {
        // const receiveData = JSON.parse(data);
        return cb(data);
      });
    }
  };

  sendData = (data: string) => {
    if (this.dataConnection) {
      console.log("sendData");
      console.log(data);
      // const sendData = JSON.stringify(data);
      this.dataConnection.send(data);
    }
  };
}

export default WorkerP2P;