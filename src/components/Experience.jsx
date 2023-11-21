import React, { useState, useEffect, useRef } from "react";
import { Sphere, Stars, OrbitControls } from "@react-three/drei";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Marker } from "./Marker";

import waterVertexShader from "./waterVertex.glsl";
import waterFragmentShader from "./waterFragment.glsl";

export const Experience = ({ data, currentYear }) => {
  const earthTexture = useLoader(
    THREE.TextureLoader,
    // "./earth-texture-no-water.png"
    "./nasa-earth-no-water.png"
  );
  const [shaderMaterial, setShaderMaterial] = useState();
  const { size, clock } = useThree();
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        earthTexture: { value: earthTexture },
        iResolution: { value: new THREE.Vector2(size.width, size.height) },
        iTime: { value: 0 },
      },
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
    });

    setShaderMaterial(material);
  }, [earthTexture, size.width, size.height]);

  useFrame(() => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.iTime.value = clock.getElapsedTime();
      shaderMaterial.uniforms.iResolution.value.set(size.width, size.height);
    }
  });

  const { scene } = useThree();

  useEffect(() => {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Cleanup
    return () => {
      scene.remove(ambientLight);
      scene.remove(directionalLight);
    };
  }, [scene]);

  const stopAutoRotateHandler = () => {
    if (autoRotate) setAutoRotate(false);
  };

  return (
    <group onPointerDown={stopAutoRotateHandler}>
      <OrbitControls
        enablePan={false}
        maxZoom={1300}
        minZoom={30}
        autoRotate={autoRotate}
        autoRotateSpeed={-0.2}
        rotateSpeed={0.3}
        zoomSpeed={0.4}
        position0={new THREE.Vector3(0, 2, 3)}
      />
      <Stars
        radius={1}
        depth={50}
        count={10000}
        factor={6}
        saturation={2}
        fade
        speed={1}
      />
      <Sphere args={[1, 32, 32]}>
        {shaderMaterial && (
          <primitive object={shaderMaterial} attach="material" />
        )}
        {data.map((country, index) => (
          <Marker key={index} country={country} year={currentYear} />
        ))}
      </Sphere>
    </group>
  );
};
