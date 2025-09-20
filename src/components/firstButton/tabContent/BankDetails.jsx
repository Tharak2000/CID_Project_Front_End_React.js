"use client";

import { useState, useEffect } from "react";
import {
  addBankDetails,
  updateBankDetailsInState,
  deleteBankDetailsFromState,
  createBankDetails,
  updateBankDetails,
  softDeleteBankDetails,
} from "../../../slice/BankDetailsSlice";
import { useDispatch, useSelector } from "react-redux";

export default function BankDetails() {
  const dispatch = useDispatch();
  const bankDetailsList = useSelector((state) => state.bankDetails.bankDetailsList);
  const loading = useSelector((state) => state.bankDetails.loading);
  const error = useSelector((state) => state.bankDetails.error);
  const personalDetailsId = useSelector((state) => state.form.personalDetailsId);

  useEffect(() => {
    console.log("[v0] BankDetails Redux state updated:", bankDetailsList);
  }, [bankDetailsList]);

  const [formData, setFormData] = useState({
    accountDetails: "",
    loans: "",
    leasingFacilities: "",
  });

  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    // Reset form fields when new bank details data is loaded
    setFormData({
      accountDetails: "",
      loans: "",
      leasingFacilities: "",
    });
    setEditIndex(null);
  }, [bankDetailsList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    if (!formData.accountDetails.trim()) {
      alert("Account Details is required");
      return;
    }

    console.log(
      "[v0] Adding/Updating bank details:",
      formData,
      "Edit index:",
      editIndex
    );

    if (editIndex !== null) {
      // Always update in local state first
      dispatch(updateBankDetailsInState({ 
        index: editIndex, 
        data: {
          ...formData,
          id: bankDetailsList[editIndex].id, // Preserve the ID if it exists
          isTemporary: true
        }
      }));
    } else {
      // Add new bank details to local state
      dispatch(addBankDetails({
        ...formData,
        isTemporary: true
      }));
    }

    setFormData({ accountDetails: "", loans: "", leasingFacilities: "" });
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setFormData(bankDetailsList[index]);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to remove this bank detail?")) {
      const bankDetail = bankDetailsList[index];
      if (bankDetail.id) {
        dispatch(softDeleteBankDetails(bankDetail.id));
      } else {
        dispatch(deleteBankDetailsFromState(index));
      }
      // Reset form if editing the deleted item
      if (editIndex === index) {
        setFormData({ accountDetails: "", loans: "", leasingFacilities: "" });
        setEditIndex(null);
      } else if (editIndex !== null && editIndex > index) {
        // Adjust edit index if needed
        setEditIndex(editIndex - 1);
      }
    }
  };

  return (
    <div className="w-full h-full">
      <h2 className="font-bold text-lg mb-4">Bank Details Form</h2>

      {/* Show loading state */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">Loading bank details...</p>
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
          {personalDetailsId && bankDetailsList.length > 0
            ? `${bankDetailsList.length} bank detail(s) loaded from API (ID: ${personalDetailsId}). You can add more directly to API or locally.`
            : bankDetailsList.length === 0
            ? personalDetailsId
              ? "No bank details found for this person. Add bank details and they will be saved directly to the API."
              : "No bank details found. Add bank details below and use 'Save to API' to save all data."
            : `${bankDetailsList.length} bank detail(s) loaded. Use 'Save to API' to save all data.`}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="accountDetails"
          placeholder="Account Details (e.g., Savings Account)"
          value={formData.accountDetails}
          onChange={handleChange}
          className="w-full border rounded-md p-2"
        />
        <input
          type="number"
          name="loans"
          placeholder="Loans (LKR)"
          value={formData.loans}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full border rounded-md p-2"
        />
        <input
          type="number"
          name="leasingFacilities"
          placeholder="Leasing Facilities (LKR)"
          value={formData.leasingFacilities}
          onChange={handleChange}
          min="0"
          step="0.01"
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
          {editIndex !== null ? "Update Bank Details" : "Add Bank Details"}
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Bank Details List:</h3>
        {bankDetailsList.length === 0 ? (
          <p className="text-gray-500 italic">No bank details added yet</p>
        ) : (
          <ul className="space-y-2">
            {bankDetailsList.map((bankDetail, index) => (
              <li
                key={index}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${
                  editIndex === index ? "bg-blue-100 border-blue-300" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1"
                    onClick={() => handleEdit(index)}
                  >
                    <div className="font-medium mb-1">
                      {bankDetail.accountDetails}
                      {bankDetail.id && (
                        <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          API ID: {bankDetail.id}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Loans:</span> 
                        {bankDetail.loans ? ` LKR ${parseFloat(bankDetail.loans).toLocaleString()}` : " LKR 0.00"}
                      </div>
                      <div>
                        <span className="font-medium">Leasing:</span> 
                        {bankDetail.leasingFacilities ? ` LKR ${parseFloat(bankDetail.leasingFacilities).toLocaleString()}` : " LKR 0.00"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index);
                    }}
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}