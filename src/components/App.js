import React from "react";
import styled from "styled-components";

import logo from "../assets/logo.png";

import Recognizer from "../classes/Recognizer";
import RecordHelper from "../classes/RecordHelper";

import KeywordForm from "./KeywordComponents/KeywordForm";
import EmergencySender from "./EmergencySender";

import Swal from 'sweetalert2'


const Container = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;

  margin-bottom: 3rem;
`;

const Logo = styled.img`
  border-radius: 100%;

  margin-top: 3rem;
  margin-bottom: 0.5rem;

  height: 6rem;
`;

const Subtitle = styled.span`
  color: #707070;

  font-family: "Noto Sans KR", sans-serif;
  font-size: 0.9rem;
`;

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      keywords: []
    };

    this.recognizer = new Recognizer();
    this.recorder = new RecordHelper();

    this.startRecognition = this.startRecognition.bind(this);
    this.onKeywordUpdate = this.onKeywordUpdate.bind(this);

    this.realEmergency = this.realEmergency.bind(this);

    this.emergencySender = new EmergencySender();

    this.startRecognition();
  }

  checkDetection(input, keys) {
    var requestor = new XMLHttpRequest();

    console.log(input);
    console.log(keys);

    requestor.onreadystatechange = function() {
      if (this.readyState !== 4) return;

      if (this.status === 200) {
        const data = JSON.parse(this.responseText);
        console.log(data)
        if (data.detected) {
          Swal.fire('인식되었습니다.');
        }
      }
    }

    requestor.open("POST", 'http://127.0.0.1:5000/api/similar-sentences', true);
    requestor.setRequestHeader('Content-Type', 'application/json');
    requestor.send(JSON.stringify({
      input: input,
      keys: keys
    }));
  }

  startRecognition() {
    this.recognizer.start(async text => {
      if (text === "") return;
      this.checkDetection(text, this.state.keywords.map(keyword => keyword.content) );
      /*for (var i = 0; i < this.state.keywords.length; i++) {
        if (text.replace(/ /g, "").includes(this.state.keywords[i].content)) {
          this.emergencySender.send("OO님이 위험에 처했습니다.");

          const blob = await this.recorder.startRecording(5);
          this.downloadFile(blob, new Date().toDateString());
          return;
        }
      }*/
    });
  }

  downloadFile(blob, fileName) {
    const link = document.createElement("a");

    link.href = blob;
    link.download = fileName;

    document.body.append(link);
    link.click();
    link.remove();

    window.addEventListener("focus", e => URL.revokeObjectURL(link.href), {
      once: true
    });
  }

  onKeywordUpdate(value) {
    this.setState({
      keywords: value
    });
  }

  async realEmergency() {
    this.emergencySender.send("OO님이 위험에 처했습니다.");

    const blob = await this.recorder.startRecording(5);
    this.downloadFile(blob, new Date().toDateString());
    return;
  }

  render() {
    return (
      <Container className="App">
        <Logo src={logo} onClick={this.realEmergency} />
        <Subtitle>To prevent further rain</Subtitle>
        <KeywordForm
          keywords={this.state.keywords}
          onUpdate={this.onKeywordUpdate}
        />
      </Container>
    );
  }
}
