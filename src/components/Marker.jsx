import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import fontFamily from "../assets/Koulen-Regular.ttf";

export const Marker = ({ country, year }) => {
  let frameCount = 0;
  const updateFrequency = 25; // Update every 25 frames
  const animationRef = useRef();
  const textRef = useRef();
  const sphereRef = useRef();

  let temperature = parseFloat(country["F" + year]);
  const maxTemperature = 2;

  if (temperature < 0 || isNaN(temperature)) {
    temperature = 0;
  }

  const getColorForTemperature = useCallback((temperature) => {
    // Define your color stops with green, red, darker red, and black
    const colorStops = {
      0: { r: 0, g: 128, b: 0 }, // Green for 0°C
      0.5: { r: 255, g: 0, b: 0 }, // Red for 0.5°C
      1: { r: 139, g: 0, b: 0 }, // Darker Red for 1°C
      2: { r: 0, g: 0, b: 0 }, // Black for 2°C
    };

    // Linear interpolation function
    const interpolate = (start, end, factor) => {
      return start + (end - start) * factor;
    };

    // Convert RGB values from 0-255 range to 0-1 range
    const convertToRange01 = (value) => value / 255;

    let r, g, b;

    if (temperature <= 0.5) {
      // Interpolate between green and red
      const factor = temperature / 0.5; // Normalize factor between 0 and 0.5
      r = interpolate(colorStops[0].r, colorStops[0.5].r, factor);
      g = interpolate(colorStops[0].g, colorStops[0.5].g, factor);
      b = interpolate(colorStops[0].b, colorStops[0.5].b, factor);
    } else if (temperature <= 1) {
      // Interpolate between red and darker red
      const factor = (temperature - 0.5) / 0.5; // Normalize factor between 0.5 and 1
      r = interpolate(colorStops[0.5].r, colorStops[1].r, factor);
      g = interpolate(colorStops[0.5].g, colorStops[1].g, factor);
      b = interpolate(colorStops[0.5].b, colorStops[1].b, factor);
    } else if (isNaN(temperature)) {
      r = 1;
      g = 1;
      b = 1;
    } else {
      // Interpolate between darker red and black
      const factor = (temperature - 1) / 1; // Normalize factor between 1 and 2
      r = interpolate(colorStops[1].r, colorStops[2].r, factor);
      g = interpolate(colorStops[1].g, colorStops[2].g, factor);
      b = interpolate(colorStops[1].b, colorStops[2].b, factor);
    }

    return new THREE.Color(
      convertToRange01(r),
      convertToRange01(g),
      convertToRange01(b)
    );
  }, []);

  const color = useMemo(
    () => getColorForTemperature(temperature),
    [temperature]
  );
  const effectiveTemperature = Math.min(temperature, maxTemperature);
  const minSize = 0.018;
  const maxSize = 0.05;
  const sphereSize = useMemo(
    () =>
      minSize + (maxSize - minSize) * (effectiveTemperature / maxTemperature),
    [effectiveTemperature]
  );

  const [currentSize, setCurrentSize] = useState(sphereSize);
  const [currentColor, setCurrentColor] = useState(color);

  const lat = country.latitude;
  const lng = country.longitude;
  const name = country.name;

  const phi = useMemo(() => (90 - lat) * (Math.PI / 180), [lat]);
  const theta = useMemo(() => (lng + 180) * (Math.PI / 180), [lng]);

  const x = useMemo(() => Math.sin(phi) * Math.cos(theta), [phi, theta]);
  const y = useMemo(() => Math.cos(phi), [phi]);
  const z = useMemo(() => -Math.sin(phi) * Math.sin(theta), [phi, theta]);

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

  useEffect(() => {
    const startSize = currentSize;
    const endSize = sphereSize;

    const startColor = currentColor;
    const endColor = getColorForTemperature(temperature);

    let startTime;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / 1000; // 1 second transition

      // Animate size
      const newSize = startSize + (endSize - startSize) * progress;
      setCurrentSize(newSize);

      // Animate color
      const newColor = startColor.clone().lerp(endColor, progress);
      setCurrentColor(newColor);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentSize(endSize); // Ensure the final size is set
        setCurrentColor(endColor); // Ensure the final color is set
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [year]);

  // Offset the text position slightly outside the globe
  const textPosition = useMemo(() => {
    const textOffset = 1.12;
    return [x * textOffset, y * textOffset, z * textOffset];
  }, [x, y, z]);

  return (
    <group>
      <mesh scale={currentSize} position={[x, y, z]} ref={sphereRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={currentColor}
          opacity={0.7}
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
