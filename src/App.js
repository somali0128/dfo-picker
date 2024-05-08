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
    // const apiURL = `/df/servers/cain/characters?characterName=${characterName}&apikey=mSegaLMyPdH6ejXGUtDDfMBfT3aFLexL`;
    const apiURL = `https://api.dfoneople.com/df/servers/cain/characters?characterName=${characterName}&apikey=mSegaLMyPdH6ejXGUtDDfMBfT3aFLexL`
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

  return (
    <div className="App bg-gray-800 min-h-screen text-white">
      <header className="p-4">
        <h1 className="text-3xl mb-4">队员分配工具</h1>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded button"
          >
            添加成员
          </button>
        </div>
        {characters.map((char, index) => (
          <div
            key={index}
            className="m-4 p-4 border rounded flex justify-between items-center"
          >
            <div>
              <p>
                游戏名: {char.characterName} ({char.nickname})
              </p>
              <p>职业: {char.jobGrowName}</p>
              <p>名望: {char.fame}</p>
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
            <button
              onClick={() => deleteCharacter(index)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              移除
            </button>
          </div>
        ))}
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
