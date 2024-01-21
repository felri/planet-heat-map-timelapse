import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { csv } from "d3-fetch";
import "./index.css";

// svgs
import PlaySvg from "./svgs/play";
import PauseSvg from "./svgs/pause";
import RepeatSvg from "./svgs/repeat";
import GithubSvg from "./svgs/github";

function App() {
  const [countries, setCountries] = useState([]);
  const [currentYear, setCurrentYear] = useState(1962);
  const [isPlaying, setIsPlaying] = useState(false);
  const yearsRef = useRef(null);
  const [bottomPosition, setBottomPosition] = useState("0px");

  const endYear = new Date().getFullYear() - 2;
  const years = Array.from({ length: endYear - 1962 + 1 }, (_, i) => 1962 + i);

  function getAverageByYear(data, year) {
    let total = 0;
    let count = 0;

    for (const country of data) {
      const temperature = parseFloat(country["F" + year]);
      if (!isNaN(temperature)) {
        total += temperature;
        count++;
      }
    }

    return total / count;
  }

  const togglePlay = () => setIsPlaying(!isPlaying);

  const resetYears = () => {
    setCurrentYear(1962);
    scrollToCurrentYear(1962);

    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    csv("./merged_country_data.csv").then((data) => {
      setCountries(data);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Adjust the position based on the new viewport height
      // Add your logic here to calculate the position
      setBottomPosition("0px"); // Example adjustment
    };

    window.addEventListener("resize", handleResize);

    // Call the handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYear((prevYear) => {
          const newYear = prevYear + 1;
          if (newYear > endYear) {
            clearInterval(interval);
            return prevYear;
          }
          scrollToCurrentYear(newYear);
          return newYear;
        });
      }, 1500);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, endYear]);

  const scrollToCurrentYear = (year) => {
    const yearElement = yearsRef.current?.querySelector(`#year-${year}`);
    if (yearElement) {
      yearElement.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  };

  useEffect(() => {
    scrollToCurrentYear(currentYear);
  }, [currentYear]);

  // list to enter key to stop and play
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === " ") {
        setIsPlaying((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          zIndex: 1,
          top: "0px",
          left: "0px",
          color: "white",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          flexDirection: "column",
        }}
      >
        {/* color code, green to yellow to red to black */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            marginTop: "0px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "30px",
              background: `linear-gradient(to right, #00b000, #ffff00, #ff0000, #000000)`,
            }}
          ></div>
          <div className="temperature-tooltip">
            <div>0°C</div>
            <div>1°C</div>
            <div>2°C</div>
          </div>
        </div>
        <div style={{ fontSize: "1rem", whiteSpace: "nowrap" }}>
          Earth's average temperature above pre-industrial era
        </div>
        <div style={{ fontSize: "2rem" }}>
          {getAverageByYear(countries, currentYear).toFixed(2)}°C
        </div>
      </div>
      <Canvas
        style={{ height: "100vh", width: "100vw" }}
        shadows
        camera={{
          position: [1, 1, 1],
          fov: 30,
          zoom: 350,
          near: 0.00001,
          far: 1000,
        }}
        orthographic
      >
        <Experience data={countries} currentYear={currentYear} />
      </Canvas>
      <div style={{ bottom: bottomPosition }} className="controls">
        <div className="play-button" onClick={togglePlay}>
          {isPlaying ? (
            <PauseSvg width={50} height={50} fill="white" />
          ) : (
            <PlaySvg width={50} height={50} fill="white" />
          )}
        </div>
        <div className="repeat-button" onClick={resetYears}>
          <RepeatSvg width={50} height={50} color="white" />
        </div>
        <a
          href="https://github.com/felri/planet-heat-map-timelapse"
          target="_blank"
          rel="noreferrer"
          className="github-button"
        >
          <GithubSvg width={25} height={25} color="white" />
        </a>
      </div>
      <div
        ref={yearsRef}
        className="container-year"
        style={{ bottom: bottomPosition }}
      >
        {years.map((year) => (
          <span
            onClick={() => {
              setCurrentYear(year);
              scrollToCurrentYear(year);
            }}
            key={year}
            id={`year-${year}`}
            style={{
              cursor: "pointer",
              display: "inline-block",
              marginRight: "15px",
              marginLeft: "5px",
              color: year === currentYear ? "white" : "grey",
              fontWeight: year === currentYear ? "bold" : "normal",
              fontSize: year === currentYear ? "3rem" : "2rem",
            }}
          >
            {year}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
