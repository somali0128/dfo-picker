import React, { useState, useEffect } from "react";
import CharacterModal from "./components/CharacterModal";
import axios from "axios";

function App() {
  const [characterName, setCharacterName] = useState("");
  const [characterData, setCharacterData] = useState(null);
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem("characters");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("characters", JSON.stringify(characters));
  }, [characters]);

  const handleInputChange = (event) => {
    setCharacterName(event.target.value);
  };

  const handleAddRole = () => {
    const apiURL = `https://dfo-picker-backend.vercel.app/characters?characterName=${characterName}`;
    axios
      .get(apiURL)
      .then((response) => {
        setCharacterData(response.data.rows[0]);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  const closeModal = () => {
    setCharacterData(null);
  };

  const saveCharacter = (character) => {
    setCharacters([...characters, { ...character, color: "" }]);
  };

  const deleteCharacter = (index) => {
    const newCharacters = [...characters];
    newCharacters.splice(index, 1);
    setCharacters(newCharacters);
  };

  const handleColorChange = (color, index) => {
    const newCharacters = [...characters];
    newCharacters[index].color = color;
    setCharacters(newCharacters);
  };

  // Calculate team data
  const teams = {
    R: { members: [], totalPower: 0 },
    B: { members: [], totalPower: 0 },
    G: { members: [], totalPower: 0 },
  };

  characters.forEach((char) => {
    if (char.color && ["R", "B", "G"].includes(char.color)) {
      teams[char.color].members.push(char);
      teams[char.color].totalPower += char.combatPower;
    }
  });

  function autoClassifyCharacters() {
    // Reset all character team assignments
    let resetChars = characters.map((char) => ({ ...char, color: "" }));

    // Initialize teams
    let teams = { R: [], B: [], G: [] };

    // Separate buffers from non-buffers
    const buffers = resetChars.filter((char) => char.isBuffer);
    const nonBuffers = resetChars.filter((char) => !char.isBuffer);

    // Randomly distribute buffers first to ensure each team gets one if available
    buffers.forEach((buffer) => {
      const possibleTeams = ["R", "B", "G"].filter(
        (team) =>
          teams[team].length < 4 && // Ensure team isn't full
          teams[team].every((c) => c.isBuffer === false) // Ensure no buffer is already assigned
      );

      if (possibleTeams.length > 0) {
        const selectedTeam =
          possibleTeams[Math.floor(Math.random() * possibleTeams.length)];
        buffer.color = selectedTeam;
        teams[selectedTeam].push(buffer);
      }
    });

    // Function to check if a team can accept more characters
    const canAddToTeam = (team, char) => {
      const futureTotalPower =
        teams[team].reduce((acc, c) => acc + c.combatPower, 0) +
        char.combatPower;
      const isBelowMax = teams[team].length < 4;
      return isBelowMax && futureTotalPower >= 3;
    };

    // Distribute non-buffers aiming to meet minimum requirements first
    nonBuffers.forEach((char) => {
      const possibleTeams = ["R", "B", "G"].filter(
        (team) => canAddToTeam(team, char) || teams[team].length < 3
      );

      // Sort teams by their need and power
      possibleTeams.sort((a, b) => teams[a].length - teams[b].length);

      if (possibleTeams.length > 0) {
        char.color = possibleTeams[0];
        teams[possibleTeams[0]].push(char);
      } else {
        console.warn(
          "Could not assign character",
          char.nickname,
          "to any team."
        );
      }
    });

    // Final pass to ensure all teams have at least 3 members, trying to redistribute if possible
    ["R", "B", "G"].forEach((team) => {
      while (teams[team].length < 3) {
        const candidate = nonBuffers.find(
          (char) => !char.color && teams[team].length < 4
        );
        if (candidate) {
          candidate.color = team;
          teams[team].push(candidate);
        } else {
          break; // No available candidates to fill the team
        }
      }
    });

    // Update state with new team assignments
    setCharacters([...buffers, ...nonBuffers]);
  }

  return (
    <div className="App bg-gray-800 min-h-screen text-white">
      <header className="p-4">
        <h1 className="text-3xl mb-4">队员分配工具</h1>
        <button
          onClick={autoClassifyCharacters}
          className="button hover:bg-blue-700 mt-4 p-2 text-white rounded"
        >
          自动分配
        </button>
        <div className="teams m-4">
          <div className="team-info bg-red-500 p-3 m-2 rounded">
            <h2>Red Team</h2>
            <p>总即战力: {teams.R.totalPower}</p>
            <ul>
              {teams.R.members.map((member) => (
                <li key={member.id}>
                  {member.characterName} ({member.nickname}){" "}
                  {member.combatPower} {member.isBuffer ? "Buffer" : "DPS"}{" "}
                </li>
              ))}
            </ul>
          </div>
          <div className="team-info bg-blue-500 p-3 m-2 rounded">
            <h2>Blue Team</h2>
            <p>总即战力: {teams.B.totalPower}</p>
            <ul>
              {teams.B.members.map((member) => (
                <li key={member.id}>
                  {member.characterName} ({member.nickname}){" "}
                  {member.combatPower} {member.isBuffer ? "Buffer" : "DPS"}{" "}
                </li>
              ))}
            </ul>
          </div>
          <div className="team-info bg-green-500 p-3 m-2 rounded">
            <h2>Green Team</h2>
            <p>总即战力: {teams.G.totalPower}</p>
            <ul>
              {teams.G.members.map((member) => (
                <li key={member.id}>
                  {member.characterName} ({member.nickname}){" "}
                  {member.combatPower} {member.isBuffer ? "Buffer" : "DPS"}{" "}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex space-x-4 my-4">
          <input
            type="text"
            value={characterName}
            onChange={handleInputChange}
            placeholder="Enter character name"
            className="p-2 rounded input"
          />
          <button
            onClick={handleAddRole}
            className="hover:bg-blue-700 text-white font-bold py-2 px-4 rounded button"
          >
            添加成员
          </button>
        </div>
        <div className="grid grid-flow-row-dense grid-cols-auto-fit min-w-[160px] gap-4">
          {characters.map((char, index) => (
            <div
              key={index}
              className="m-4 p-4 border rounded flex justify-between min-w-[182px] items-center relative"
            >
              <button
                onClick={() => deleteCharacter(index)}
                className="absolute top-1 right-1 text-red-400 hover:text-gray-400"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div className="flex flex-col space-y-2">
                <p>
                  游戏名: {char.characterName} ({char.nickname})
                </p>
                <p>职业: {char.jobGrowName}</p>
                <p>名望: {char.fame}</p>
                <p>即战力: {char.combatPower}</p>
                <p>Role: {char.isBuffer ? "Buffer" : "DPS"}</p>
                <div className="flex space-x-4 items-center mt-2">
                  <label className="flex items-center text-red-500 cursor-pointer">
                    <input
                      type="radio"
                      name={`color-${index}`}
                      checked={char.color === "R"}
                      onChange={() => handleColorChange("R", index)}
                      className="form-radio h-4 w-4"
                    />
                    <span className="ml-2">R</span>
                  </label>
                  <label className="flex items-center text-blue-500 cursor-pointer">
                    <input
                      type="radio"
                      name={`color-${index}`}
                      checked={char.color === "B"}
                      onChange={() => handleColorChange("B", index)}
                      className="form-radio h-4 w-4"
                    />
                    <span className="ml-2">B</span>
                  </label>
                  <label className="flex items-center text-green-500 cursor-pointer">
                    <input
                      type="radio"
                      name={`color-${index}`}
                      checked={char.color === "G"}
                      onChange={() => handleColorChange("G", index)}
                      className="form-radio h-4 w-4"
                    />
                    <span className="ml-2">G</span>
                  </label>
                </div>
              </div>
              {/* <button
              onClick={() => deleteCharacter(index)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              移除
            </button> */}
            </div>
          ))}
        </div>
      </header>
      {characterData && (
        <CharacterModal
          character={characterData}
          onClose={closeModal}
          onSave={saveCharacter}
        />
      )}
    </div>
  );
}

export default App;
