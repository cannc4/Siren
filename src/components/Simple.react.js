import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import { connect } from 'react-redux';

class Simple extends React.Component {
  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.cameraPosition = new THREE.Vector3(0, 0, 5);

    // construct the position vector here, because if we use 'new' within render,
    // React will think that things have changed when they have not.

    this.state = {
      cubeRotation: new THREE.Euler()
    };

    this._onAnimate = () => {
      // we will get this callback every frame

      // pretend cubeRotation is immutable.
      // this helps with updates and pure rendering.
      // React will be sure that the rotation has now updated.
      this.setState({
        cubeRotation: new THREE.Euler(
          this.state.cubeRotation.x + this.props.timer.timer[0].current/100.,
          this.state.cubeRotation.y + this.props.timer.timer[1].current/100.,
          this.state.cubeRotation.z + this.props.timer.timer[2].current/100.
        ),
      });
    };
  }

  render() {
    const {
      width,
      height,
    } = this.props;

    // or you can use:
    // width = window.innerWidth
    // height = window.innerHeight

    return (<React3
      mainCamera="camera" // this points to the perspectiveCamera below
      width={width}
      height={height}

      onAnimate={this._onAnimate}
    >
      <scene>
        <perspectiveCamera
          name="camera"
          fov={75}
          aspect={width / height}
          near={0.1}
          far={1000}

          position={this.cameraPosition}
        />
        <pointLight
            position={new THREE.Vector3(0, 2, 0)}
        />
        <mesh
          rotation={this.state.cubeRotation}
        >
          <boxGeometry
            width={1}
            height={1}
            depth={1}
          />
          <meshBasicMaterial
            color={0xffddff}
          />
        </mesh>
        <mesh
          position={new THREE.Vector3(2, 0, 0)}
          rotation={Math.sin(this.state.cubeRotation)}
        >
          <sphereGeometry
            radius={1}
          />
          <meshBasicMaterial
            color={0xffdd00}
          />
        </mesh>
      </scene>
    </React3>);
  }
}

export default connect(state => state)(Simple);
