import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

const WizardOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
`;

const WizardContainer = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 40px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 12px;
  text-align: center;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #00d9ff, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #888;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 40px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#00d9ff' : props.completed ? '#00ff88' : 'rgba(255,255,255,0.2)'};
  transition: all 0.3s ease;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusBadge = styled.span`
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  background: ${props => {
    if (props.status === 'found') return 'rgba(0, 255, 136, 0.2)';
    if (props.status === 'missing') return 'rgba(255, 100, 100, 0.2)';
    if (props.status === 'detecting') return 'rgba(0, 217, 255, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.status === 'found') return '#00ff88';
    if (props.status === 'missing') return '#ff6464';
    if (props.status === 'detecting') return '#00d9ff';
    return '#888';
  }};
`;

const PathRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const PathLabel = styled.label`
  flex: 0 0 120px;
  color: #888;
  font-size: 14px;
`;

const PathInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', monospace;

  &:focus {
    outline: none;
    border-color: #00d9ff;
  }

  &::placeholder {
    color: #555;
  }
`;

const BrowseButton = styled.button`
  padding: 10px 16px;
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 8px;
  color: #00d9ff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 217, 255, 0.2);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Button = styled.button`
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.primary ? `
    background: linear-gradient(90deg, #00d9ff, #00ff88);
    color: #000;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 217, 255, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}
`;

const DetectButton = styled(Button)`
  margin-left: auto;
  margin-bottom: 24px;
`;

const InfoBox = styled.div`
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #aaa;
  line-height: 1.6;

  a {
    color: #00d9ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const WarningBox = styled(InfoBox)`
  background: rgba(255, 200, 0, 0.1);
  border-color: rgba(255, 200, 0, 0.3);
`;

const ErrorBox = styled(InfoBox)`
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.3);
`;

const CheckList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const CheckItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #ccc;

  &:last-child {
    border-bottom: none;
  }
`;

const CheckIcon = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: ${props => {
    if (props.status === 'ok') return 'rgba(0, 255, 136, 0.2)';
    if (props.status === 'error') return 'rgba(255, 100, 100, 0.2)';
    if (props.status === 'warning') return 'rgba(255, 200, 0, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.status === 'ok') return '#00ff88';
    if (props.status === 'error') return '#ff6464';
    if (props.status === 'warning') return '#ffc800';
    return '#888';
  }};
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 217, 255, 0.3);
  border-top-color: #00d9ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

@observer
class SetupWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      detecting: false,
      paths: {
        ghcipath: '',
        sclang: '',
        scsynth: '',
        sclang_conf: '',
        tidal_boot: './config/tidal-boot-default.hs',
        scd_start: './config/scd-start-default.scd'
      },
      status: {
        ghci: 'unknown',
        sclang: 'unknown',
        tidal: 'unknown',
        superDirt: 'unknown'
      },
      error: null
    };
  }

  componentDidMount() {
    // Auto-detect on mount
    this.detectPaths();
  }

  detectPaths = async () => {
    this.setState({ detecting: true, error: null });

    try {
      const response = await fetch('http://localhost:3001/detect-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        this.setState({
          paths: {
            ...this.state.paths,
            ghcipath: data.ghcipath || '',
            sclang: data.sclang || '',
            scsynth: data.scsynth || '',
            sclang_conf: data.sclang_conf || ''
          },
          status: {
            ghci: data.ghcipath ? 'found' : 'missing',
            sclang: data.sclang ? 'found' : 'missing',
            tidal: data.tidalInstalled ? 'found' : 'missing',
            superDirt: data.superDirtInstalled ? 'found' : 'missing'
          }
        });
      }
    } catch (err) {
      // Server might not have the endpoint yet, try loading saved paths
      try {
        const pathResponse = await fetch('http://localhost:3001/paths');
        if (pathResponse.ok) {
          const pathData = await pathResponse.json();
          if (pathData.paths) {
            this.setState({
              paths: {
                ...this.state.paths,
                ...pathData.paths
              },
              status: {
                ghci: pathData.paths.ghcipath ? 'found' : 'missing',
                sclang: pathData.paths.sclang ? 'found' : 'missing',
                tidal: 'unknown',
                superDirt: 'unknown'
              }
            });
          }
        }
      } catch (e) {
        console.log('Could not load paths:', e);
      }
    }

    this.setState({ detecting: false });
  };

  handlePathChange = (key, value) => {
    this.setState({
      paths: {
        ...this.state.paths,
        [key]: value
      }
    });
  };

  handleBrowse = async (key) => {
    // Check if running in Electron
    if (window.electronAPI) {
      const path = await window.electronAPI.selectFile({
        filters: [{ name: 'All Files', extensions: ['*'] }]
      });
      if (path) {
        this.handlePathChange(key, path);
      }
    } else {
      // Fallback for browser - prompt for path
      const path = prompt(`Enter path for ${key}:`);
      if (path) {
        this.handlePathChange(key, path);
      }
    }
  };

  handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3001/paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: this.state.paths })
      });

      if (response.ok) {
        if (window.electronAPI) {
          await window.electronAPI.setSetupCompleted(true);
        }
        if (this.props.onComplete) {
          this.props.onComplete(this.state.paths);
        }
      } else {
        this.setState({ error: 'Failed to save configuration' });
      }
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  canProceed = () => {
    const { paths } = this.state;
    return paths.ghcipath && paths.sclang;
  };

  renderStep1() {
    const { detecting, status, paths } = this.state;

    return (
      <>
        <SectionTitle>
          Dependency Status
          {detecting && <Spinner />}
        </SectionTitle>

        <CheckList>
          <CheckItem>
            <CheckIcon status={status.sclang === 'found' ? 'ok' : status.sclang === 'missing' ? 'error' : 'warning'}>
              {status.sclang === 'found' ? '✓' : status.sclang === 'missing' ? '✗' : '?'}
            </CheckIcon>
            <div>
              <strong>SuperCollider</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {paths.sclang || 'Not detected'}
              </div>
            </div>
            <StatusBadge status={status.sclang}>{status.sclang}</StatusBadge>
          </CheckItem>

          <CheckItem>
            <CheckIcon status={status.ghci === 'found' ? 'ok' : status.ghci === 'missing' ? 'error' : 'warning'}>
              {status.ghci === 'found' ? '✓' : status.ghci === 'missing' ? '✗' : '?'}
            </CheckIcon>
            <div>
              <strong>GHC / Haskell</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {paths.ghcipath || 'Not detected'}
              </div>
            </div>
            <StatusBadge status={status.ghci}>{status.ghci}</StatusBadge>
          </CheckItem>

          <CheckItem>
            <CheckIcon status={status.tidal === 'found' ? 'ok' : status.tidal === 'missing' ? 'warning' : 'warning'}>
              {status.tidal === 'found' ? '✓' : '?'}
            </CheckIcon>
            <div>
              <strong>TidalCycles</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Haskell library for live coding
              </div>
            </div>
            <StatusBadge status={status.tidal}>{status.tidal}</StatusBadge>
          </CheckItem>

          <CheckItem>
            <CheckIcon status={status.superDirt === 'found' ? 'ok' : status.superDirt === 'missing' ? 'warning' : 'warning'}>
              {status.superDirt === 'found' ? '✓' : '?'}
            </CheckIcon>
            <div>
              <strong>SuperDirt</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>
                SuperCollider synth for Tidal
              </div>
            </div>
            <StatusBadge status={status.superDirt}>{status.superDirt}</StatusBadge>
          </CheckItem>
        </CheckList>

        <DetectButton onClick={this.detectPaths} disabled={detecting}>
          {detecting ? 'Detecting...' : 'Re-detect'}
        </DetectButton>

        {(status.sclang === 'missing' || status.ghci === 'missing') && (
          <WarningBox>
            <strong>Missing Dependencies</strong><br /><br />
            {status.sclang === 'missing' && (
              <>
                <strong>SuperCollider:</strong> Download from{' '}
                <a href="https://supercollider.github.io/downloads" target="_blank" rel="noopener noreferrer">
                  supercollider.github.io
                </a><br />
              </>
            )}
            {status.ghci === 'missing' && (
              <>
                <strong>GHC/Haskell:</strong> Install via{' '}
                <a href="https://www.haskell.org/ghcup/" target="_blank" rel="noopener noreferrer">
                  GHCup
                </a>
              </>
            )}
          </WarningBox>
        )}
      </>
    );
  }

  renderStep2() {
    const { paths } = this.state;

    return (
      <>
        <SectionTitle>Configure Paths</SectionTitle>

        <InfoBox>
          Configure the paths to your audio tools. These were auto-detected but you can modify them if needed.
        </InfoBox>

        <Section>
          <PathRow>
            <PathLabel>GHCi Path</PathLabel>
            <PathInput
              value={paths.ghcipath}
              onChange={(e) => this.handlePathChange('ghcipath', e.target.value)}
              placeholder="/usr/local/bin/ghci"
            />
            <BrowseButton onClick={() => this.handleBrowse('ghcipath')}>Browse</BrowseButton>
          </PathRow>

          <PathRow>
            <PathLabel>sclang Path</PathLabel>
            <PathInput
              value={paths.sclang}
              onChange={(e) => this.handlePathChange('sclang', e.target.value)}
              placeholder="/Applications/SuperCollider.app/Contents/MacOS/sclang"
            />
            <BrowseButton onClick={() => this.handleBrowse('sclang')}>Browse</BrowseButton>
          </PathRow>

          <PathRow>
            <PathLabel>scsynth Path</PathLabel>
            <PathInput
              value={paths.scsynth}
              onChange={(e) => this.handlePathChange('scsynth', e.target.value)}
              placeholder="/Applications/SuperCollider.app/Contents/Resources/scsynth"
            />
            <BrowseButton onClick={() => this.handleBrowse('scsynth')}>Browse</BrowseButton>
          </PathRow>

          <PathRow>
            <PathLabel>SC Config</PathLabel>
            <PathInput
              value={paths.sclang_conf}
              onChange={(e) => this.handlePathChange('sclang_conf', e.target.value)}
              placeholder="sclang_conf.yaml path (optional)"
            />
            <BrowseButton onClick={() => this.handleBrowse('sclang_conf')}>Browse</BrowseButton>
          </PathRow>

          <PathRow>
            <PathLabel>Tidal Boot</PathLabel>
            <PathInput
              value={paths.tidal_boot}
              onChange={(e) => this.handlePathChange('tidal_boot', e.target.value)}
              placeholder="./config/tidal-boot-default.hs"
            />
            <BrowseButton onClick={() => this.handleBrowse('tidal_boot')}>Browse</BrowseButton>
          </PathRow>

          <PathRow>
            <PathLabel>SC Start</PathLabel>
            <PathInput
              value={paths.scd_start}
              onChange={(e) => this.handlePathChange('scd_start', e.target.value)}
              placeholder="./config/scd-start-default.scd"
            />
            <BrowseButton onClick={() => this.handleBrowse('scd_start')}>Browse</BrowseButton>
          </PathRow>
        </Section>
      </>
    );
  }

  renderStep3() {
    const { status } = this.state;
    const allGood = status.sclang === 'found' && status.ghci === 'found';

    return (
      <>
        <SectionTitle>Ready to Start</SectionTitle>

        {allGood ? (
          <InfoBox>
            <strong>Configuration complete!</strong><br /><br />
            Click "Finish" to save your settings and start using Siren.
            You can always change these settings later in the Paths menu.
          </InfoBox>
        ) : (
          <WarningBox>
            <strong>Some dependencies are missing</strong><br /><br />
            Siren may not work correctly. You can still proceed, but consider
            installing the missing dependencies first.
          </WarningBox>
        )}

        <CheckList>
          <CheckItem>
            <CheckIcon status="ok">✓</CheckIcon>
            Configuration saved
          </CheckItem>
          <CheckItem>
            <CheckIcon status={status.sclang === 'found' ? 'ok' : 'warning'}>
              {status.sclang === 'found' ? '✓' : '!'}
            </CheckIcon>
            SuperCollider {status.sclang === 'found' ? 'ready' : 'not configured'}
          </CheckItem>
          <CheckItem>
            <CheckIcon status={status.ghci === 'found' ? 'ok' : 'warning'}>
              {status.ghci === 'found' ? '✓' : '!'}
            </CheckIcon>
            TidalCycles {status.ghci === 'found' ? 'ready' : 'not configured'}
          </CheckItem>
        </CheckList>
      </>
    );
  }

  render() {
    const { step, error } = this.state;

    return (
      <WizardOverlay>
        <WizardContainer>
          <Logo>SIREN</Logo>
          <Subtitle>Setup Wizard</Subtitle>

          <StepIndicator>
            <StepDot active={step === 1} completed={step > 1} />
            <StepDot active={step === 2} completed={step > 2} />
            <StepDot active={step === 3} completed={step > 3} />
          </StepIndicator>

          {error && (
            <ErrorBox>
              <strong>Error:</strong> {error}
            </ErrorBox>
          )}

          {step === 1 && this.renderStep1()}
          {step === 2 && this.renderStep2()}
          {step === 3 && this.renderStep3()}

          <ButtonRow>
            {step > 1 ? (
              <Button onClick={() => this.setState({ step: step - 1 })}>
                Back
              </Button>
            ) : (
              <Button onClick={this.props.onSkip}>
                Skip Setup
              </Button>
            )}

            {step < 3 ? (
              <Button
                primary
                onClick={() => this.setState({ step: step + 1 })}
                disabled={step === 1 && !this.canProceed()}
              >
                Continue
              </Button>
            ) : (
              <Button primary onClick={this.handleSave}>
                Finish
              </Button>
            )}
          </ButtonRow>
        </WizardContainer>
      </WizardOverlay>
    );
  }
}

export default SetupWizard;
