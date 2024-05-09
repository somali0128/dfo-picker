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
    axios.get(apiURL)
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
        <div className="grid grid-flow-row-dense grid-cols-auto-fit min-w-[160px] gap-4">
        {characters.map((char, index) => (
          <div
            key={index}
            className="m-4 p-4 border rounded flex justify-between items-center relative"
          >
                <button
              onClick={() => deleteCharacter(index)}
              className="absolute top-1 right-1 text-red-400 hover:text-gray-400"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
            <div className="flex flex-col space-y-2">
              <p>
                游戏名: {char.characterName} ({char.nickname})
              </p>
              <p>职业: {char.jobGrowName}</p>
              <p>名望: {char.fame}</p>
              <p>即战力: {char.combatPower}</p>
              <p>Role: {char.isBuffer ? 'Buffer' : 'DPS'}</p>
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
