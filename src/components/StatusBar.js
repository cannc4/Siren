import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

const StatusBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 11px;
  color: #888;
  z-index: 1000;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-right: none;
  }
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'running': return '#00ff88';
      case 'starting': return '#ffc800';
      case 'error': return '#ff6464';
      case 'stopped': return '#666';
      default: return '#444';
    }
  }};
  ${props => props.status === 'starting' && `
    animation: pulse 1s ease-in-out infinite;
  `}

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const CPUMeter = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MeterBar = styled.div`
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const MeterFill = styled.div`
  height: 100%;
  width: ${props => props.value}%;
  background: ${props => {
    if (props.value > 80) return '#ff6464';
    if (props.value > 50) return '#ffc800';
    return '#00ff88';
  }};
  transition: width 0.3s ease, background 0.3s ease;
`;

const VersionInfo = styled.span`
  color: #555;
`;

const ClickableStatus = styled(StatusItem)`
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 4px;
  margin: 0 2px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

@observer
class StatusBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scStatus: 'stopped',
      tidalStatus: 'stopped',
      audioCpu: 0,
      bpm: 120,
      connected: false
    };
    this.pollInterval = null;
  }

  componentDidMount() {
    this.pollStatus();
    this.pollInterval = setInterval(this.pollStatus, 5000);
  }

  componentWillUnmount() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  pollStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const data = await response.json();
        this.setState({
          scStatus: data.sclang === 'running' ? 'running' : 'stopped',
          tidalStatus: data.ghci === 'running' ? 'running' : 'stopped',
          connected: true
        });
      }
    } catch (err) {
      this.setState({ connected: false });
    }
  };

  handleScClick = () => {
    if (this.props.onRestartSc) {
      this.setState({ scStatus: 'starting' });
      this.props.onRestartSc();
    }
  };

  handleTidalClick = () => {
    if (this.props.onRestartTidal) {
      this.setState({ tidalStatus: 'starting' });
      this.props.onRestartTidal();
    }
  };

  render() {
    const { scStatus, tidalStatus, audioCpu, bpm, connected } = this.state;

    return (
      <StatusBarContainer>
        <ClickableStatus onClick={this.handleScClick} title="Click to restart SuperCollider">
          <StatusDot status={scStatus} />
          <span>SC: {scStatus}</span>
        </ClickableStatus>

        <ClickableStatus onClick={this.handleTidalClick} title="Click to restart TidalCycles">
          <StatusDot status={tidalStatus} />
          <span>Tidal: {tidalStatus}</span>
        </ClickableStatus>

        <StatusItem>
          <span>BPM: {bpm}</span>
        </StatusItem>

        <StatusItem>
          <CPUMeter>
            <span>CPU:</span>
            <MeterBar>
              <MeterFill value={audioCpu} />
            </MeterBar>
            <span>{audioCpu}%</span>
          </CPUMeter>
        </StatusItem>

        <Spacer />

        <StatusItem>
          <StatusDot status={connected ? 'running' : 'error'} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </StatusItem>

        <StatusItem>
          <VersionInfo>Siren v1.0.0</VersionInfo>
        </StatusItem>
      </StatusBarContainer>
    );
  }
}

export default StatusBar;
