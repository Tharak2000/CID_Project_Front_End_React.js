"use client";

import { useState, useEffect } from "react";
import {
  addRelatedOfficial,
  updateRelatedOfficialInState,
  createRelatedOfficial,
  updateRelatedOfficial,
} from "../../../slice/formSlice";
import { useDispatch, useSelector } from "react-redux";

export default function RelatedOfficials() {
  const dispatch = useDispatch();
  const officials = useSelector((state) => state.form.relatedOfficials);
  const loading = useSelector((state) => state.form.loading);
  const error = useSelector((state) => state.form.error);
  const personalDetailsId = useSelector(
    (state) => state.form.personalDetailsId
  );

  useEffect(() => {
    console.log("[v0] RelatedOfficials Redux state updated:", officials);
  }, [officials]);

  const [formData, setFormData] = useState({
    relatedOfficialName: "",
    relatedOfficialIdNumber: "",
  });

  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    // Reset form fields when new officials data is loaded
    setFormData({
      relatedOfficialName: "",
      relatedOfficialIdNumber: "",
    });
    setEditIndex(null);
  }, [officials]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    if (!formData.relatedOfficialName.trim()) {
      alert("Name is required");
      return;
    }

    console.log(
      "[v0] Adding/Updating official:",
      formData,
      "Edit index:",
      editIndex
    );

    if (editIndex !== null) {
      // Always update in local state first
      dispatch(updateRelatedOfficialInState({ 
        index: editIndex, 
        data: {
          ...formData,
          id: officials[editIndex].id, // Preserve the ID if it exists
          isTemporary: true
        }
      }));
    } else {
      // Add new official to local state
      dispatch(addRelatedOfficial({
        ...formData,
        isTemporary: true
      }));
    }

    setFormData({ relatedOfficialName: "", relatedOfficialIdNumber: "" });
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(officials[index]);
  };

  return (
    <div className="w-full h-full">
      <h2 className="font-bold text-lg mb-4">Related Official Form</h2>

      {/* Show loading state */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">Loading related officials...</p>
        </div>
      )}

      {/* Show error state */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Status info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          {personalDetailsId && officials.length > 0
            ? `${officials.length} official(s) loaded from API (ID: ${personalDetailsId}). You can add more directly to API or locally.`
            : officials.length === 0
            ? personalDetailsId
              ? "No related officials found for this person. Add officials and they will be saved directly to the API."
              : "No related officials found. Add officials below and use 'Save to API' to save all data."
            : `${officials.length} official(s) loaded. Use 'Save to API' to save all data.`}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="relatedOfficialName"
          placeholder="Related Official Name"
          value={formData.relatedOfficialName}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
        />
        <input
          type="text"
          name="relatedOfficialIdNumber"
          placeholder="NIC Number"
          value={formData.relatedOfficialIdNumber}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div className="mt-6">
        <button
          onClick={handleAdd}
          className={`px-4 py-2 rounded-md text-white ${
            editIndex !== null ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {editIndex !== null ? "Update Official" : "Add Official"}
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Officials List:</h3>
        {officials.length === 0 ? (
          <p className="text-gray-500 italic">No officials added yet</p>
        ) : (
          <ul className="space-y-2">
            {officials.map((official, index) => (
              <li
                key={index}
                onClick={() => handleEdit(index)}
                className={`p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                  editIndex === index ? "bg-blue-100 border-blue-300" : ""
                }`}
              >
                <div className="font-medium">
                  {official.relatedOfficialName}
                  {official.id && (
                    <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                      API ID: {official.id}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {official.relatedOfficialIdNumber}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
