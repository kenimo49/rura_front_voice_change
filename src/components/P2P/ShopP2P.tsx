import Peer, { MediaConnection, DataConnection, } from "skyway-js";


class ShopP2P {
  localStream?: void | MediaStream;
  peer?: Peer;
  dataPeer?: Peer;
  connection?: MediaConnection;
  dataConnection?: DataConnection;
  remoteVideo: HTMLVideoElement | null;
  localVideo: HTMLVideoElement | null;

  constructor() {
    this.remoteVideo = document.createElement("video");
    this.localVideo = document.createElement("video");
  }

  open = async ({ peerId, dataPeerId, dataCb, }: { peerId: string, dataPeerId: string, dataCb: () => void }) => {
    console.log(`skyWay open`)
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
    this.peer = new Peer(peerId, { key: skyWayKey, debug: 1 });
    this.peer.on("open", (openPeerId: string) => {
      console.log("media Peerの準備完了", openPeerId)
    })
    this.dataPeer = new Peer(dataPeerId, { key: skyWayKey, debug: 1 });
    this.dataPeer.on("open", (openPeerId: string) => {
      console.log("data Peerの準備完了", openPeerId)
    })
    this.dataPeer.on("connection", (dataConnect: DataConnection) => {
      console.log("data Peerが接続されました", dataConnect.id)
      this.dataConnection = dataConnect
      dataCb()
    })

    this.peer.on("call", (mediaConnection: MediaConnection) => {
      console.log("受信、接続しました")
      mediaConnection.answer(this.localStream!);
      if (this.localVideo && this.localStream) {
        this.localVideo.srcObject = this.localStream;
        this.localVideo.play();
        this.localVideo.muted = true;
      }
      mediaConnection.once("close", () => {
        this.localVideo = null;
        this.remoteVideo = null;
      });
      mediaConnection.on("stream", async (stream: MediaStream) => {
        if (this.remoteVideo) {
          this.remoteVideo.srcObject = stream;
          this.remoteVideo.muted = true;
        }
      });
    })
  }

  call = async (
    {
      targetPeerId,
      targetDataPeerId,
    }: {
      targetPeerId: string,
      targetDataPeerId: string,
    }) => {
      if (!this.localStream) return;
      console.log("call");
      this.connection = this.peer!.call(targetPeerId, this.localStream);
      this.connection.on("error", (error) => {
        console.log(error);
      });
      this.connection.on("close", () => {
        console.log("listen close");
        const video: any = this.localVideo;
        if (video.srcObject) {
          video.srcObject.getTracks().forEach((track: any) => track.stop());
          video.srcObject = null;
        }
      });
  };

  dataListener = (cb: (data: any) => void) => {
    if (this.dataConnection) {
      this.dataConnection.on("data", (data: any) => {
        // const receiveData = JSON.parse(data);
        return cb(data);
      });
    }
  };
}

export default ShopP2P;