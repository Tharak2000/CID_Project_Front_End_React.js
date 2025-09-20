// redux/formSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_URL;

// Async thunk for fetching all users
export const fetchAllUsers = createAsyncThunk(
  "form/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/personaldetails/`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching personal details with related officials
export const fetchPersonalDetails = createAsyncThunk(
  "form/fetchPersonalDetails",
  async (personalDetailsId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE}/personaldetails/${personalDetailsId}/combined`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch personal details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating personal details
export const updatePersonalDetails = createAsyncThunk(
  "form/updatePersonalDetails",
  async ({ id, personalDetailsData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/personaldetails/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: personalDetailsData.firstName,
          last_name: personalDetailsData.lastName,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update personal details (${response.status}): ${errorText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for soft deleting personal details
// export const softDeletePersonalDetails = createAsyncThunk(
//   "form/softDeletePersonalDetails",
//   async (id, { rejectWithValue, getState }) => {
//     try {
//       // First soft delete personal details
//       const response = await fetch(`${API_BASE}/personaldetails/soft_delete/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           first_name: getState().form.user.firstName,
//           last_name: getState().form.user.lastName,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to soft delete personal details");
//       }

//       // Get all related officials for this person
//       const relatedOfficials = getState().form.relatedOfficials;

//       // Soft delete all related officials
//       for (const official of relatedOfficials) {
//         if (official.id) {
//           try {
//             await fetch(`${API_BASE}/relatedofficials/${official.id}`, {
//               method: "PUT",
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify({
//                 related_official_name: official.relatedOfficialName,
//                 related_official_nic_number: official.relatedOfficialIdNumber,
//               }),
//             });
//           } catch (error) {
//             console.error(`Failed to soft delete related official ${official.id}:`, error);
//           }
//         }
//       }

//       return id;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// Async thunk for updating related official
export const updateRelatedOfficial = createAsyncThunk(
  "form/updateRelatedOfficial",
  async ({ id, relatedOfficialData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/relatedofficials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          related_official_name: relatedOfficialData.relatedOfficialName,
          related_official_nic_number: relatedOfficialData.relatedOfficialIdNumber,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update related official (${response.status}): ${errorText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating personal details
export const createPersonalDetails = createAsyncThunk(
  "form/createPersonalDetails",
  async (personalDetailsData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/personaldetails/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: personalDetailsData.firstName,
          last_name: personalDetailsData.lastName,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create personal details (${response.status}): ${errorText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating related officials
export const createRelatedOfficial = createAsyncThunk(
  "form/createRelatedOfficial",
  async (relatedOfficialData, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE}/relatedofficials/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personal_details_id: relatedOfficialData.personalDetailsId,
            related_official_name: relatedOfficialData.relatedOfficialName,
            related_official_nic_number:
              relatedOfficialData.relatedOfficialIdNumber,
          }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create related official (${response.status}): ${errorText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const softDeletePersonalDetails = createAsyncThunk(
  "form/softDeletePersonalDetails",
  async (id, { rejectWithValue, getState }) => {
    try {
      // First get combined data to find all related records
      let combinedData;
      try {
        const combinedResponse = await fetch(`${API_BASE}/personaldetails/${id}/combined`);
        if (combinedResponse.ok) {
          combinedData = await combinedResponse.json();
        }
      } catch (error) {
        console.warn("Could not fetch combined data, proceeding with available data:", error);
      }

      // Soft delete personal details
      const response = await fetch(`${API_BASE}/personaldetails/soft_delete/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: getState().form.user.firstName,
          last_name: getState().form.user.lastName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to soft delete personal details");
      }

      // Get related officials from state or combined data
      const relatedOfficials = getState().form.relatedOfficials;
      const combinedOfficials = combinedData?.related_officials || [];

      // Create a set of all official IDs to delete (from both sources)
      const officialIdsToDelete = new Set();

      // Add IDs from Redux state
      relatedOfficials.forEach(official => {
        if (official.id) {
          officialIdsToDelete.add(official.id);
        }
      });

      // Add IDs from combined data (in case some weren't loaded in state)
      combinedOfficials.forEach(official => {
        if (official.related_officials_id && !official.ro_is_deleted) {
          officialIdsToDelete.add(official.related_officials_id);
        }
      });

      // Soft delete all related officials
      for (const officialId of officialIdsToDelete) {
        try {
          // Find the official data for the API call
          const officialFromState = relatedOfficials.find(o => o.id === officialId);
          const officialFromCombined = combinedOfficials.find(o => o.related_officials_id === officialId);

          const officialData = officialFromState || officialFromCombined;

          await fetch(`${API_BASE}/relatedofficials/soft_delete/${officialId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              related_official_name: officialData?.relatedOfficialName || officialData?.related_official_name,
              related_official_nic_number: officialData?.relatedOfficialIdNumber || officialData?.related_official_nic_number,
            }),
          });
          console.log(`Successfully soft deleted related official ${officialId}`);
        } catch (error) {
          console.error(`Failed to soft delete related official ${officialId}:`, error);
        }
      }

      // Get bank details and soft delete them
      const bankDetails = getState().bankDetails;
      const combinedBankDetails = combinedData?.bank_details || [];

      // Create a set of all bank detail IDs to delete
      const bankDetailIdsToDelete = new Set();

      // Add ID from Redux state
      if (bankDetails.bankDetailsId) {
        bankDetailIdsToDelete.add(bankDetails.bankDetailsId);
      }

      // Add IDs from combined data (in case bank details weren't loaded in state)
      combinedBankDetails.forEach(bankDetail => {
        if (bankDetail.bank_details_id && !bankDetail.bd_is_deleted) {
          bankDetailIdsToDelete.add(bankDetail.bank_details_id);
        }
      });

      // Soft delete all bank details
      for (const bankDetailId of bankDetailIdsToDelete) {
        try {
          await fetch(`${API_BASE}/bankdetails/soft_delete/${bankDetailId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log(`Successfully soft deleted bank details ${bankDetailId}`);
        } catch (error) {
          console.error(`Failed to soft delete bank details ${bankDetailId}:`, error);
        }
      }

      return {
        id,
        deletedOfficials: Array.from(officialIdsToDelete),
        deletedBankDetails: Array.from(bankDetailIdsToDelete)
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: {
    firstName: "",
    lastName: "",
  },
  relatedOfficials: [],
  loading: false,
  error: null,
  personalDetailsId: null,
  apiUsers: [], // List of all users from API
  filteredUsers: [], // Filtered users for search
  searchQuery: "", // Current search query
  loadingUsers: false,
  usersError: null,
  isEditing: false, // Flag to indicate if we're editing existing data
  hasUnsavedChanges: false, // Flag to indicate if there are unsaved changes
  originalData: null, // Store original data for comparison
  message: {
    text: '',
    type: '', // 'success' or 'error'
    visible: false
  },
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    showMessage(state, action) {
      state.message = {
        text: action.payload.text,
        type: action.payload.type,
        visible: true
      };
    },
    clearMessage(state) {
      state.message = {
        text: '',
        type: '',
        visible: false
      };
    },
    setUser(state, action) {
      state.user = {
        firstName: "",
        lastName: "",
        ...action.payload
      };
      state.hasUnsavedChanges = true;
    },
    setRelatedOfficials(state, action) {
      state.relatedOfficials = action.payload;
      state.hasUnsavedChanges = true;
    },
    addRelatedOfficial(state, action) {
      state.relatedOfficials.push({ ...action.payload, isTemporary: true });
      state.hasUnsavedChanges = true;
    },
    updateRelatedOfficialInState(state, action) {
      const { index, data } = action.payload;
      state.relatedOfficials[index] = { ...data, isTemporary: true };
      state.hasUnsavedChanges = true;
    },
    deleteRelatedOfficial(state, action) {
      state.relatedOfficials.splice(action.payload, 1);
      state.hasUnsavedChanges = true;
    },
    resetForm(state) {
      state.user = {
        firstName: "",
        lastName: "",
      };
      state.relatedOfficials = [];
      state.error = null;
      state.personalDetailsId = null;
      state.hasUnsavedChanges = false;
      state.originalData = null;
      state.isEditing = false;
    },
    setPersonalDetailsId(state, action) {
      state.personalDetailsId = action.payload;
      state.isEditing = true;
    },
    clearUsersError(state) {
      state.usersError = null;
    },
    saveOriginalData(state) {
      state.originalData = {
        user: { ...state.user },
        relatedOfficials: state.relatedOfficials.map(official => ({ ...official }))
      };
      state.hasUnsavedChanges = false;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      if (!action.payload) {
        state.filteredUsers = state.apiUsers;
      } else {
        const query = action.payload.toLowerCase().trim();
        const searchTerms = query.split(' ').filter(term => term.length > 0);

        state.filteredUsers = state.apiUsers.filter(user => {
          const fullName = `${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`;
          return searchTerms.every(term => fullName.includes(term));
        });
      }
    },
    saveOriginalData(state) {
      state.originalData = {
        user: { ...state.user },
        relatedOfficials: state.relatedOfficials.map(official => ({ ...official })),
      };
      state.hasUnsavedChanges = false;
    },
    revertChanges(state) {
      if (state.originalData) {
        state.user = { ...state.originalData.user };
        state.relatedOfficials = state.originalData.relatedOfficials.map(official => ({ ...official }));
        state.hasUnsavedChanges = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loadingUsers = true;
        state.usersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.usersError = null;
        // Filter and sort by ID to maintain order
        const sortedUsers = action.payload
          .filter((user) => !user.is_deleted)
          .sort((a, b) => a.personal_details_id - b.personal_details_id);
        state.apiUsers = sortedUsers;
        state.filteredUsers = sortedUsers;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.usersError = action.payload;
      })
      // Fetch personal details
      .addCase(fetchPersonalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.personalDetailsId = action.payload.personal_details_id;
        state.isEditing = true;

        // Map API response to our state structure
        state.user = {
          firstName: action.payload.first_name,
          lastName: action.payload.last_name,
        };

        // Map related officials to our structure and sort by ID
        state.relatedOfficials = action.payload.related_officials
          .filter((official) => !official.ro_is_deleted)
          .map((official) => ({
            relatedOfficialName: official.related_official_name,
            relatedOfficialIdNumber: official.related_official_nic_number,
            id: official.related_officials_id,
            isTemporary: false,
          }))
          .sort((a, b) => a.id - b.id);

        // Save original data for comparison
        state.originalData = {
          user: { ...state.user },
          relatedOfficials: state.relatedOfficials.map(official => ({ ...official })),
        };
        state.hasUnsavedChanges = false;
      })
      .addCase(fetchPersonalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create personal details
      .addCase(createPersonalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPersonalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // The API response should include the created personal details with ID
        if (action.payload.personal_details_id) {
          state.personalDetailsId = action.payload.personal_details_id;
        }
        // Update the user state with the created data
        state.user = {
          firstName: action.payload.first_name,
          lastName: action.payload.last_name,
        };
        // Show success message
        state.message = {
          text: 'Successfully created new record',
          type: 'success',
          visible: true
        };
      })
      .addCase(createPersonalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create related official
      .addCase(createRelatedOfficial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRelatedOfficial.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Add the newly created related official to the state
        const newOfficial = {
          relatedOfficialName: action.payload.related_official_name,
          relatedOfficialIdNumber: action.payload.related_official_nic_number,
          id: action.payload.related_officials_id || Date.now(), // fallback ID if not provided
          isTemporary: false,
        };
        state.relatedOfficials.push(newOfficial);
        // Sort to maintain order by ID
        state.relatedOfficials.sort((a, b) => a.id - b.id);
      })
      .addCase(createRelatedOfficial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update personal details
      .addCase(updatePersonalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePersonalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.hasUnsavedChanges = false;
        state.originalData = {
          user: { ...state.user },
          relatedOfficials: state.relatedOfficials.map(official => ({ ...official }))
        };
        state.message = {
          text: 'Successfully updated record',
          type: 'success',
          visible: true
        };
        state.user = {
          firstName: action.payload.first_name,
          lastName: action.payload.last_name,
        };
      })
      .addCase(updatePersonalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update related official
      .addCase(updateRelatedOfficial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRelatedOfficial.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Find and update the related official in the array
        const index = state.relatedOfficials.findIndex(
          (official) => official.id === action.payload.related_officials_id
        );
        if (index !== -1) {
          const updatedOfficial = {
            id: action.payload.related_officials_id,
            relatedOfficialName: action.payload.related_official_name,
            relatedOfficialIdNumber: action.payload.related_official_nic_number,
            isTemporary: false,
          };
          // Replace the official while maintaining array order
          state.relatedOfficials.splice(index, 1, updatedOfficial);
          // Sort to ensure order is maintained by ID
          state.relatedOfficials.sort((a, b) => a.id - b.id);
        }
      })
      .addCase(updateRelatedOfficial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Soft delete handlers
      .addCase(softDeletePersonalDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softDeletePersonalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { id, deletedOfficials, deletedBankDetails } = action.payload;

        // Remove the deleted user from both user lists
        state.apiUsers = state.apiUsers.filter(
          user => user.personal_details_id !== id
        );
        state.filteredUsers = state.filteredUsers.filter(
          user => user.personal_details_id !== id
        );

        // Reset form completely if the deleted user was being edited
        if (state.personalDetailsId === id) {
          state.user = {
            firstName: "",
            lastName: "",
          };
          state.relatedOfficials = [];
          state.personalDetailsId = null;
          state.isEditing = false;
          state.hasUnsavedChanges = false;
          state.originalData = null;
        }

        console.log(`Successfully deleted personal details ${id} and ${deletedOfficials?.length || 0} related officials and ${deletedBankDetails?.length || 0} bank details`);
      })
      .addCase(softDeletePersonalDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setUser,
  setRelatedOfficials,
  addRelatedOfficial,
  updateRelatedOfficialInState,
  deleteRelatedOfficial,
  resetForm,
  setPersonalDetailsId,
  clearUsersError,
  saveOriginalData,
  revertChanges,
  setSearchQuery,
  showMessage,
  clearMessage,
} = formSlice.actions;

export default formSlice.reducer;
