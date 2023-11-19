import React from "react";
import { OrbitControls, Text } from "@react-three/drei";
import { Sphere, Stars } from "@react-three/drei";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import fontFamily from "./Koulen-Regular.ttf";

const Moon = () => {
  const moonTexture = useLoader(THREE.TextureLoader, "moon.jpg"); // Load your moon texture

  // Moon's position and scale values
  const moonScale = 0.27; // The Moon is about 1/4 the size of Earth
  const distanceFromEarth = 3; // Adjust as needed for visual effect

  return (
    <mesh
      position={[distanceFromEarth, 2, 0]}
      scale={[moonScale, moonScale, moonScale]}
    >
      <sphereBufferGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={moonTexture} />
    </mesh>
  );
};

const Marker = ({ country, year }) => {
  let oldPosition = [0, 0, 0];
  const updateFrequency = 15; // Update every 10 frames
  let frameCount = 0;

  const temperature = parseFloat(country["F" + year]);
  const color = getColorForTemperature(temperature);
  const maxTemperature = 2; // Maximum expected temperature

  // Define a minimum and a maximum size for the spheres
  const minSize = 0.01; // Minimum sphere size
  const maxSize = 0.05; // Maximum sphere size

  // Calculate the sphere size based on temperature
  // The size increases linearly from minSize at 0°C to maxSize at 2°C
  const sphereSize =
    minSize + (maxSize - minSize) * (temperature);

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

      if (zoomLevel < 300) {
        textRef.current.visible = false;
      } else {
        textRef.current.visible = true;
      }

      if (zoomLevel < 100) {
        sphereRef.current.visible = false;
      } else {
        sphereRef.current.visible = true;
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
  const textOffset = 1.1; // Adjust this value as needed
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
  const [earthMap, normalMap] = useLoader(THREE.TextureLoader, [
    "/earth-texture.png", // Replace with your texture path
    "/earth-normal.png", // Update to the new PNG normal map path
  ]);

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

  return (
    <>
      <OrbitControls
        enablePan={false}
        maxZoom={1200}
        minZoom={20}
        autoRotate
        autoRotateSpeed={-0.2}
        rotateSpeed={0.3}
        zoomSpeed={0.2}
        position0={new THREE.Vector3(0, 2, 3)}
      />
      <Stars
        radius={0.5}
        depth={50}
        count={10000}
        factor={6}
        saturation={0}
        fade
        speed={1}
      />
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial
          map={earthMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(1.2, 1.2)}
        />
        {data.map((country, index) => (
          <Marker key={index} country={country} year={currentYear} />
        ))}
      </Sphere>
      <Moon />
    </>
  );
};
