import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import { connect } from 'react-redux';
import RotatingCube from './RotatingCube';

import fragmentShaderDepth from 'raw!./shaders/depth.frag';
import vertexShaderDepth from 'raw!./shaders/depth.vert';

class Simple extends React.Component {
  constructor(props, context) {
    super(props, context);

    const N = 50;

    this.fog = new THREE.Fog(0x121231, 10, 40);
    //0x001525
    const d = 20;

    this.lightPosition = new THREE.Vector3(d, d, d);
    this.lightTarget = new THREE.Vector3(0, 0, 0);
    this.groundQuaternion = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    this.cameraPosition = new THREE.Vector3(10, 2, 0);
    this.cameraQuaternion = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

    const bodies = [];
    bodies.length = N;

    this.bodies = bodies;

    this._createBodies();

    this.state = {
      numBodies: N,
      meshStates: this._getMeshStates(),
      fragmentShaderDepth,
      vertexShaderDepth
    };

    // check if HMR is enabled
    if (module.hot) {
      // accept update of dependency
      module.hot.accept('raw!./shaders/depth.frag', () => {
        this.setState({
          fragmentShaderDepth: require('raw!./shaders/depth.frag'),
        });
      });

      module.hot.accept('raw!./shaders/depth.vert', () => {
        this.setState({
          vertexShaderDepth: require('raw!./shaders/depth.vert'),
        });
      });
    }
  }

  _getMeshStates() {
    return this.bodies.map(({ position, quaternion }) => ({
      position: new THREE.Vector3().copy(position),
      quaternion: new THREE.Quaternion().copy(quaternion),
    }));
  }

  _onAnimate = () => {
    this._updatePhysics();
    this._updateGraphics();
  };

  _updateGraphics() {
    this.setState({
      meshStates: this._getMeshStates(),
    });
  }

  _updatePhysics() {
    const time = new Date().getTime();
    const bodies = this.bodies;

    for (let i = 0; i < bodies.length; ++i) {
      const body = bodies[i];

      const sinTime = Math.sin(time * body.timeScale);

      body.quaternion.multiply(body.rotationDeltaPerFrame);

      const { movementPerFrame } = body;

      body.position.copy(body.startPosition.clone()
        .add(movementPerFrame.clone()
          .multiplyScalar(sinTime)));
    }
  }

  _createBodies() {
    const { bodies } = this;
    const N = bodies.length;

    for (let i = 0; i < N; ++i) {
      bodies[i] = this._createBody(i);
    }
  }

  _createBody() {
    const position = new THREE.Vector3(
      -2.5 + Math.random() * 5,
      0.5 + Math.random() * 5,
      -2.5 + Math.random() * 5);

    return {
      position,
      timeScale: Math.random() * 0.005,
      startPosition: position.clone(),
      movementPerFrame: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
      rotationDeltaPerFrame: new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
          Math.random() * 0.05,
          Math.random() * 0.05,
          Math.random() * 0.05)),
      quaternion: new THREE.Quaternion(),
    };
  }

  _onBodiesSelectChange = (event) => {
    const numBodies = event.target.value;

    this.bodies.length = numBodies;
    this._createBodies();

    this.setState({
      numBodies,
      meshStates: this._getMeshStates(),
    });

    this._updateGraphics();
  };

  render() {
    const {
      width,
      height,
    } = this.props;

    const {
      meshStates,
    } = this.state;

    const d = 20;

    const cubeMeshes = meshStates.map(({ position, quaternion }, i) =>
      (<RotatingCube
        key={i}

        position={position}
        quaternion={quaternion}

        bodyIndex={i}

        meshes={this.meshes}
      />));

    return (<div
      ref="container"
    >
      <React3
        antialias
        mainCamera="camera"
        width={width}
        height={height}

        onAnimate={this._onAnimate}

        clearColor={this.fog.color}

        gammaInput
        gammaOutput
        shadowMapEnabled
      >
        <resources>
          <boxGeometry
            resourceId="boxGeo"

            width={0.5}
            height={0.5}
            depth={0.5}
          />
          <shaderMaterial

            resourceId="boxMaterial"

            fragmentShader={this.state.fragmentShaderDepth}
            vertexShader={this.state.vertexShaderDepth}
          >

          </shaderMaterial>
        </resources>
        <scene
          ref="scene"
          fog={this.fog}
        >
          <perspectiveCamera
            name="camera"
            fov={30}
            aspect={width / height}
            near={0.5}
            far={100}

            position={this.cameraPosition}
            quaternion={this.cameraQuaternion}

            ref="camera"
          />
          <ambientLight
            color={0x666666}
          />
          <directionalLight
            color={0xffffff}
            intensity={1.75}

            castShadow

            shadowMapWidth={1024}
            shadowMapHeight={1024}

            shadowCameraLeft={-d}
            shadowCameraRight={d}
            shadowCameraTop={d}
            shadowCameraBottom={-d}

            shadowCameraFar={3 * d}
            shadowCameraNear={d}

            position={this.lightPosition}
            lookAt={this.lightTarget}
          />
          <mesh
            castShadow
            receiveShadow

            quaternion={this.groundQuaternion}
          >
            <planeBufferGeometry
              width={100}
              height={100}
              widthSegments={1}
              heightSegments={1}
            />
            <meshLambertMaterial
              color={0xdddd99}
            />
          </mesh>
          {cubeMeshes}
        </scene>

      </React3>
    </div>);
  }
}

export default connect(state => state)(Simple);
