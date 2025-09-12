"use client";

import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../slice/formSlice";

export default function PersonalDetails() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.form.user) || { firstName: "", lastName: "" };
  const loading = useSelector((state) => state.form.loading);
  const error = useSelector((state) => state.form.error);
  const personalDetailsId = useSelector(
    (state) => state.form.personalDetailsId
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedUser = {
      ...user,
      [name]: value || ""  // Ensure value is never undefined
    };
    dispatch(setUser(updatedUser));
  };

  return (
    <>
      <h2 className="font-bold text-lg mb-4">Personal Details</h2>

      {/* Show loading state */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">Loading personal details...</p>
        </div>
      )}

      {/* Show error state */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Show API data info */}
      {personalDetailsId && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">
            <strong>API Data Loaded:</strong> ID {personalDetailsId}
          </p>
        </div>
      )}

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={user.firstName || ""}
        onChange={handleChange}
        className="w-full border rounded-md p-2 mb-2"
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={user.lastName || ""}
        onChange={handleChange}
        className="w-full border rounded-md p-2 mb-4"
      />
    </>
  );
}
