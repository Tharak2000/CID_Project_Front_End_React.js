"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  resetForm,
  fetchPersonalDetails,
  fetchAllUsers,
  createPersonalDetails,
  createRelatedOfficial,
  updatePersonalDetails,
  updateRelatedOfficial,
  setPersonalDetailsId,
  setSearchQuery,
  softDeletePersonalDetails,
  showMessage
} from "./slice/formSlice";
import PersonalDetails from "./components/firstButton/tabContent/PersonalDetails";
import RelatedOfficials from "./components/firstButton/tabContent/RelatedOfficials";
import Message from "./components/Message";

const tabs = [
  {
    name: "Personal Details",
    component: (props) => <PersonalDetails {...props} />,
  },
  {
    name: "Related Officials",
    component: (props) => <RelatedOfficials {...props} />,
  },
];

export default function UserManagementApp() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [formData, setFormData] = useState("");
  const [editIndex, setEditIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");

  const dispatch = useDispatch();
  // ✅ Get Redux data from the global state
  const personalDetails = useSelector((state) => state.form.user);
  const relatedOfficials = useSelector((state) => state.form.relatedOfficials);
  const personalDetailsId = useSelector((state) => state.form.personalDetailsId);
  const isEditing = useSelector((state) => state.form.isEditing);
  const hasUnsavedChanges = useSelector((state) => state.form.hasUnsavedChanges);

  // API users state
  const apiUsers = useSelector((state) => state.form.apiUsers);
  const filteredUsers = useSelector((state) => state.form.filteredUsers);
  const loadingUsers = useSelector((state) => state.form.loadingUsers);
  const usersError = useSelector((state) => state.form.usersError);
  const fetchDataFromAPI = async (id) => {
    try {
      await dispatch(fetchPersonalDetails(id)).unwrap();
      dispatch(setPersonalDetailsId(id));
    } catch (error) {
      console.error("Failed to fetch personal details:", error);
    }
  };

  // Load all users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await dispatch(fetchAllUsers()).unwrap();
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    loadUsers();
  }, [dispatch]);

  // ✅ Update all Redux data to API
  const handleDelete = async () => {
    if (!personalDetailsId) {
      alert("Please select a user to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user and all related officials? This action cannot be undone.")) {
      return;
    }

    try {
      await dispatch(softDeletePersonalDetails(personalDetailsId)).unwrap();
      dispatch(showMessage({ text: "Successfully deleted the record", type: "success" }));
    } catch (error) {
      console.error("Failed to delete:", error);
      dispatch(showMessage({ 
        text: `Failed to delete: ${error.message}`, 
        type: "error" 
      }));
    }
  };

  const updateAllData = async () => {
    if (!hasUnsavedChanges) {
      alert("No changes to update");
      return;
    }

    setSaving(true);
    try {
      // Update personal details
      await dispatch(
        updatePersonalDetails({
          id: personalDetailsId,
          personalDetailsData: {
            firstName: personalDetails.firstName,
            lastName: personalDetails.lastName,
          },
        })
      ).unwrap();

      // Update related officials
      if (relatedOfficials && relatedOfficials.length > 0) {
        for (const official of relatedOfficials) {
          if (official.isTemporary && official.id) {
            // Update existing official that has temporary changes
            try {
              await dispatch(
                updateRelatedOfficial({
                  id: official.id,
                  relatedOfficialData: {
                    relatedOfficialName: official.relatedOfficialName,
                    relatedOfficialIdNumber: official.relatedOfficialIdNumber || "",
                  },
                })
              ).unwrap();
            } catch (officialError) {
              console.error(
                "Failed to update related official:",
                official.relatedOfficialName,
                officialError
              );
            }
          } else if (official.isTemporary) {
            // Create new official
            try {
              await dispatch(
                createRelatedOfficial({
                  personalDetailsId,
                  relatedOfficialName: official.relatedOfficialName,
                  relatedOfficialIdNumber: official.relatedOfficialIdNumber || "",
                })
              ).unwrap();
            } catch (officialError) {
              console.error(
                "Failed to create related official:",
                official.relatedOfficialName,
                officialError
              );
            }
          }
        }
      }

      // Refresh the data and save it as the new original state
      await dispatch(fetchAllUsers());
      await fetchDataFromAPI(personalDetailsId);
      dispatch(showMessage({ text: "All data updated successfully!", type: "success" }));
    } catch (error) {
      console.error("Failed to update data:", error);
      dispatch(showMessage({ 
        text: `Failed to update data: ${error.message}`, 
        type: "error" 
      }));
    } finally {
      setSaving(false);
    }
  };

  // ✅ Save all Redux data to API
  const saveAllData = async () => {
    setSaving(true);
    try {
      // First create personal details
      const personalDetailsResult = await dispatch(
        createPersonalDetails({
          firstName: personalDetails.firstName,
          lastName: personalDetails.lastName,
        })
      ).unwrap();

      console.log("Personal details created:", personalDetailsResult);

      // Since the API doesn't return the ID, we need to fetch all users and find the newly created one
      const allUsersResult = await dispatch(fetchAllUsers()).unwrap();

      // Find the newly created personal details by matching first and last name
      // and taking the one with the highest ID (most recently created)
      const matchingUsers = allUsersResult.filter(
        (user) =>
          user.first_name === personalDetails.firstName &&
          user.last_name === personalDetails.lastName &&
          !user.is_deleted
      );

      if (matchingUsers.length === 0) {
        throw new Error("Could not find the newly created personal details");
      }

      // Get the user with the highest ID (most recently created)
      const newPersonalDetails = matchingUsers.reduce((prev, current) =>
        prev.personal_details_id > current.personal_details_id ? prev : current
      );

      const personalDetailsId = newPersonalDetails.personal_details_id;
      console.log(
        "Found newly created personal details with ID:",
        personalDetailsId
      );

      // Then create each related official
      if (relatedOfficials && relatedOfficials.length > 0) {
        for (const official of relatedOfficials) {
          // Skip officials without required data
          if (
            !official.relatedOfficialName ||
            !official.relatedOfficialName.trim()
          ) {
            console.warn("Skipping related official without name:", official);
            continue;
          }

          try {
            await dispatch(
              createRelatedOfficial({
                personalDetailsId: personalDetailsId,
                relatedOfficialName: official.relatedOfficialName,
                relatedOfficialIdNumber: official.relatedOfficialIdNumber || "",
              })
            ).unwrap();
            console.log(
              "Created related official:",
              official.relatedOfficialName
            );
          } catch (officialError) {
            console.error(
              "Failed to create related official:",
              official.relatedOfficialName,
              officialError
            );
            // Continue with other officials even if one fails
            alert(
              `Warning: Failed to create related official "${
                official.relatedOfficialName
              }": ${officialError.message || officialError}`
            );
          }
        }
      } else {
        console.log("No related officials to create");
      }

      console.log("All data saved to API successfully");

      // Reset form and refresh API users list
      dispatch(resetForm());
      dispatch(fetchAllUsers());
      dispatch(showMessage({ text: "Data saved successfully!", type: "success" }));
    } catch (error) {
      console.error("Failed to save data to API:", error);
      dispatch(showMessage({ 
        text: `Failed to save data: ${error.message || error}`, 
        type: "error" 
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Message />
      {/* Main content area with padding for the fixed bottom bar */}
      <div className="flex-1 overflow-hidden">
        {/* Scrollable content container */}
        <div className="h-full grid grid-cols-10 gap-4 p-4 pb-24">
          {/* Left Tabs Panel (col-span-2) */}
          <div className="col-span-2 bg-white shadow-md rounded-lg p-4 flex flex-col overflow-hidden">
            <h2 className="font-bold text-lg mb-2">Tabs</h2>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTabIndex(index)}
                  className={`w-full text-left p-2 rounded-md mb-2 font-medium ${
                    activeTabIndex === index
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area (col-span-5) */}
          <div className="col-span-5 bg-white shadow-md rounded-lg p-4 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {tabs[activeTabIndex].component({
                formData,
                setFormData,
                editIndex,
                setEditIndex,
              })}
            </div>
          </div>

          {/* User List (col-span-3) */}
          <div className="col-span-3 bg-white shadow-md rounded-lg p-4 flex flex-col overflow-hidden">
            <h2 className="font-bold text-lg mb-4 text-gray-800">Criminal Management</h2>

            {/* API Users Section */}
            <div className="flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-blue-800 text-lg">Criminals</h3>
                <button
                  onClick={() => {
                    dispatch(fetchAllUsers());
                  }}
                  disabled={loadingUsers}
                  className="text-sm min-w-[80px] px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 disabled:bg-gray-100 transition-colors"
                >
                  {loadingUsers ? "Loading..." : "Refresh"}
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchText(value);
                    dispatch(setSearchQuery(value));
                  }}
                  placeholder="Search by name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  onClick={() => dispatch(setSearchQuery(searchText))}
                  className="min-w-[100px] px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                >
                  Search
                </button>
              </div>

              {usersError && (
                <p className="text-red-600 text-sm mb-3 p-2 bg-red-50 rounded-md">Error: {usersError}</p>
              )}

              {loadingUsers ? (
                <p className="text-gray-500 italic text-sm p-4 text-center">Loading users...</p>
              ) : (
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
                  <ul className="space-y-2">
                    {filteredUsers.map((user) => (
                      <li
                        key={user.personal_details_id}
                        onClick={() => fetchDataFromAPI(user.personal_details_id)}
                        className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg cursor-pointer hover:from-blue-100 hover:to-blue-200 text-sm border-l-3 border-blue-400 shadow-sm transition-all duration-200 ease-in-out"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded-full shadow-sm">
                            ID: {user.personal_details_id}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom button bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 py-4 px-6">
        <div className="max-w-screen-2xl mx-auto flex justify-end">
          <div className="flex gap-4 shadow-lg rounded-lg bg-white p-2">
            {personalDetailsId && (
              <button
                onClick={handleDelete}
                className="min-w-[120px] h-[42px] text-white rounded-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm transition-all duration-200 font-medium"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-pulse">Deleting...</span>
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            )}
            <button
              onClick={personalDetailsId ? updateAllData : saveAllData}
              className={`min-w-[120px] h-[42px] text-white rounded-md shadow-sm transition-all duration-200 font-medium ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : personalDetailsId
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }`}
              disabled={
                !personalDetails.firstName || !personalDetails.lastName || saving
              }
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse">
                    {personalDetailsId ? "Updating..." : "Saving..."}
                  </span>
                </span>
              ) : (
                <span>{personalDetailsId ? "Update" : "Save All"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
