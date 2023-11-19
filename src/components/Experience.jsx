import React from "react";
import { OrbitControls, Text } from "@react-three/drei";
import { Sphere, Stars } from "@react-three/drei";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import fontFamily from "../assets/Koulen-Regular.ttf";

import waterVertexShader from "./waterVertex.glsl";
import waterFragmentShader from "./waterFragment.glsl";

const Moon = () => {
  const moonTexture = useLoader(THREE.TextureLoader, "moon.jpg"); // Load your moon texture

  // Moon's position and scale values
  const moonScale = 0.27; // The Moon is about 1/4 the size of Earth
  const distanceFromEarth = 6; // Adjust as needed for visual effect

  return ( 
    <mesh
      position={[distanceFromEarth, 2, 0]}
      scale={[moonScale, moonScale, moonScale]}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={moonTexture} />
    </mesh>
  );
};

const Marker = ({ country, year }) => {
  const updateFrequency = 25; // Update every 10 frames
  let frameCount = 0;

  const temperature = parseFloat(country["F" + year]);
  const color = getColorForTemperature(temperature);
  const maxTemperature = 2; // Maximum expected temperature

  // Define a minimum and a maximum size for the spheres
  const minSize = 0.012; // Minimum sphere size
  const maxSize = 0.1; // Maximum sphere size

  // Ensure that the temperature used for calculation doesn't exceed maxTemperature
  const effectiveTemperature = Math.min(temperature, maxTemperature);

  // Calculate the sphere size
  const sphereSize =
    minSize + (maxSize - minSize) * (effectiveTemperature / maxTemperature);

  const lat = country.latitude;
  const lng = country.longitude;
  const name = country.name;

  // Adjust these formulas if needed
  const phi = (90 - lat) * (Math.PI / 180); // Convert latitude to radians
  const theta = (lng + 180) * (Math.PI / 180); // Convert longitude to radians

  // Spherical to Cartesian conversion for a unit sphere
  // I have no idea of what this means
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = -Math.sin(phi) * Math.sin(theta); // Negating Z to invert axis

  const textRef = React.useRef();
  const sphereRef = React.useRef();

  useFrame(({ camera }) => {
    frameCount++;

    if (frameCount % updateFrequency === 0) {
      const zoomLevel = camera.zoom;

      if (zoomLevel < 100) {
        sphereRef.current.visible = false;
      } else {
        sphereRef.current.visible = true;
      }

      if (zoomLevel < 300) {
        textRef.current.visible = false;
      } else {
        textRef.current.visible = true;
      }

      textRef.current.scale.set(0.02, 0.02, 0.02);
      textRef.current.lookAt(camera.position);
      frameCount = 0;
    }
  });

  function getColorForTemperature(temperature) {
    // Define your color stops with green, red, and black
    const colorStops = {
      0: { r: 0, g: 128, b: 0 }, // Green for 0°C
      1: { r: 255, g: 0, b: 0 }, // Red for 1°C
      2: { r: 0, g: 0, b: 0 }, // Black for 2°C
    };

    // Linear interpolation function
    const interpolate = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    // Convert RGB values from 0-255 range to 0-1 range
    const convertToRange01 = (value) => value / 255;

    let r, g, b;

    if (temperature <= 1) {
      // Interpolate between green and red
      const factor = temperature / 1; // Normalize factor between 0 and 1
      r = interpolate(colorStops[0].r, colorStops[1].r, factor);
      g = interpolate(colorStops[0].g, colorStops[1].g, factor);
      b = interpolate(colorStops[0].b, colorStops[1].b, factor);
    } else if (isNaN(temperature)) {
      r = 1;
      g = 1;
      b = 1;
    } else {
      // Interpolate between red and black
      const factor = (temperature - 1) / 1; // Normalize factor between 0 and 1
      r = interpolate(colorStops[1].r, colorStops[2].r, factor);
      g = interpolate(colorStops[1].g, colorStops[2].g, factor);
      b = interpolate(colorStops[1].b, colorStops[2].b, factor);
    }

    return new THREE.Color(
      convertToRange01(r),
      convertToRange01(g),
      convertToRange01(b)
    );
  }

  // Offset the text position slightly outside the globe
  const textOffset = 1.12; // Adjust this value as needed
  const textPosition = [x * textOffset, y * textOffset, z * textOffset];

  return (
    <group>
      <mesh scale={sphereSize} position={[x, y, z]} ref={sphereRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          opacity={0.75}
          transparent={true}
          polygonOffset={true}
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <Text
        scale={0.02}
        ref={textRef}
        position={textPosition}
        color="white"
        font={fontFamily}
        anchorX="center"
        strokeColor={"black"}
        strokeWidth={0.03}
        anchorY="middle"
        material-toneMapped={false}
        renderOrder={2}
        transparent={true}
        opacity={0.5}
        
      >
        {name}
      </Text>
    </group>
  );
};

export const Experience = ({ data, currentYear }) => {
  const earthTexture = useLoader(
    THREE.TextureLoader,
    "./earth-texture-no-water.png"
  );
  const [shaderMaterial, setShaderMaterial] = React.useState();
  const { size, clock } = useThree();
  const [autoRotate, setAutoRotate] = React.useState(true);

  React.useEffect(() => {
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

  React.useEffect(() => {
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
    setAutoRotate(false);
  }

  return (
    <>
      <OrbitControls
        enablePan={false}
        maxZoom={1200}
        minZoom={30}
        autoRotate
        autoRotateSpeed={-0.2}
        rotateSpeed={0.3}
        zoomSpeed={0.2}
        position0={new THREE.Vector3(0, 2, 3)}
      />
      <Stars
        radius={1}
        depth={50}
        count={10000}
        factor={6}
        saturation={1}
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
      // <Moon />
    </>
  );
};
