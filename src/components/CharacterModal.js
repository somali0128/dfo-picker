import React, { useState } from "react";

const CharacterModal = ({ character, onClose, onSave }) => {
  const [nickname, setNickname] = useState("");
  const [combatPower, setCombatPower] = useState("");
  const [isBuffer, setIsBuffer] = useState(false);

  const handleSave = () => {
    onSave({ ...character, nickname, combatPower, isBuffer });
    onClose();
  };

  function handleCombatPowerChange(e) {
    const value = e.target.value;
    setCombatPower(value === '' ? '' : Math.max(0, Number(value)));
  }
  
  function handleCombatPowerBlur(e) {
    if (e.target.value === '') {
      setCombatPower(0);  // Set to 0 if input is empty on blur
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="modal-content p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex flex-col items-center space-y-4 text-black">
          <h2>{character.characterName}</h2>
          <p>等级: {character.level}</p>
          <p>名望: {character.fame}</p>
          <p>职业: {character.jobGrowName}</p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="取一个昵称"
            className="border rounded p-1 w-full"
          />
          <input
            type="number"
            value={combatPower}
            onChange={handleCombatPowerChange}
            onBlur={handleCombatPowerBlur}
            placeholder="即战力"
            className="border rounded p-1 w-full"
            min="0"
          />
          <div>
            <label>
              <input
                type="checkbox"
                checked={isBuffer}
                onChange={(e) => setIsBuffer(e.target.checked)}
              />{" "}
              Buffer?
            </label>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              确认
            </button>
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterModal;
