// redux/bankDetailsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Import the softDeletePersonalDetails action from formSlice to listen to it
import { softDeletePersonalDetails } from "./formSlice";

const API_BASE = import.meta.env.VITE_API_URL;

// Async thunk for fetching all bank details
export const fetchAllBankDetails = createAsyncThunk(
  "bankDetails/fetchAllBankDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/bankdetails/`);
      if (!response.ok) {
        throw new Error("Failed to fetch bank details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching bank details by ID
export const fetchBankDetailsById = createAsyncThunk(
  "bankDetails/fetchBankDetailsById",
  async (bankDetailsId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/bankdetails/${bankDetailsId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bank details");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating bank details
export const createBankDetails = createAsyncThunk(
  "bankDetails/createBankDetails",
  async (bankDetailsData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/bankdetails/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personal_details_id: bankDetailsData.personalDetailsId,
          account_details: bankDetailsData.accountDetails,
          loans: bankDetailsData.loans,
          leasing_facilities: bankDetailsData.leasingFacilities,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create bank details (${response.status}): ${errorText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating bank details
export const updateBankDetails = createAsyncThunk(
  "bankDetails/updateBankDetails",
  async ({ id, bankDetailsData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/bankdetails/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_details: bankDetailsData.accountDetails,
          loans: bankDetailsData.loans,
          leasing_facilities: bankDetailsData.leasingFacilities,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update bank details (${response.status}): ${errorText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for soft deleting bank details
export const softDeleteBankDetails = createAsyncThunk(
  "bankDetails/softDeleteBankDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/bankdetails/soft_delete/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to soft delete bank details");
      }

      const data = await response.json();
      return { id, message: data.message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  bankDetailsList: [], // List of bank details for current person (like relatedOfficials)
  allBankDetails: [], // List of all bank details from API
  filteredBankDetails: [], // Filtered bank details for search
  searchQuery: "", // Current search query
  loading: false,
  error: null,
  personalDetailsId: null, // To link with personal details
  loadingBankDetails: false,
  bankDetailsError: null,
  isEditing: false, // Flag to indicate if we're editing existing data
  hasUnsavedChanges: false, // Flag to indicate if there are unsaved changes
  originalData: null, // Store original data for comparison
  message: {
    text: '',
    type: '', // 'success' or 'error'
    visible: false
  },
};

const bankDetailsSlice = createSlice({
  name: "bankDetails",
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
    setBankDetailsList(state, action) {
      state.bankDetailsList = action.payload;
      state.hasUnsavedChanges = true;
    },
    addBankDetails(state, action) {
      state.bankDetailsList.push({ ...action.payload, isTemporary: true });
      state.hasUnsavedChanges = true;
    },
    updateBankDetailsInState(state, action) {
      const { index, data } = action.payload;
      state.bankDetailsList[index] = { ...data, isTemporary: true };
      state.hasUnsavedChanges = true;
    },
    deleteBankDetailsFromState(state, action) {
      state.bankDetailsList.splice(action.payload, 1);
      state.hasUnsavedChanges = true;
    },
    // Populate bank details from external data (like form slice)
    populateBankDetailsFromExternal(state, action) {
      const { bankDetailsData, personalDetailsId } = action.payload;
      
      state.personalDetailsId = personalDetailsId;
      
      if (bankDetailsData && bankDetailsData.length > 0) {
        // Filter out deleted bank details and map to our structure
        state.bankDetailsList = bankDetailsData
          .filter(bankDetail => !bankDetail.bd_is_deleted)
          .map(bankDetail => ({
            accountDetails: bankDetail.account_details || "",
            loans: bankDetail.loans ? bankDetail.loans.toString() : "",
            leasingFacilities: bankDetail.leasing_facilities ? bankDetail.leasing_facilities.toString() : "",
            id: bankDetail.bank_details_id,
            isTemporary: false,
          }))
          .sort((a, b) => a.id - b.id);
        
        state.isEditing = true;
        
        // Save as original data
        state.originalData = {
          bankDetailsList: state.bankDetailsList.map(bankDetail => ({ ...bankDetail }))
        };
        state.hasUnsavedChanges = false;
      } else {
        // No bank details found - reset for new entry
        state.bankDetailsList = [];
        state.isEditing = false;
        state.originalData = null;
        state.hasUnsavedChanges = false;
      }
    },
    resetBankDetails(state) {
      state.bankDetailsList = [];
      state.error = null;
      state.personalDetailsId = null;
      state.hasUnsavedChanges = false;
      state.originalData = null;
      state.isEditing = false;
    },
    setPersonalDetailsId(state, action) {
      state.personalDetailsId = action.payload;
    },
    clearBankDetailsError(state) {
      state.bankDetailsError = null;
    },
    saveOriginalData(state) {
      state.originalData = {
        bankDetailsList: state.bankDetailsList.map(bankDetail => ({ ...bankDetail }))
      };
      state.hasUnsavedChanges = false;
    },
    revertChanges(state) {
      if (state.originalData) {
        state.bankDetailsList = state.originalData.bankDetailsList.map(bankDetail => ({ ...bankDetail }));
        state.hasUnsavedChanges = false;
      }
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      if (!action.payload) {
        state.filteredBankDetails = state.allBankDetails;
      } else {
        const query = action.payload.toLowerCase().trim();
        state.filteredBankDetails = state.allBankDetails.filter(bankDetail => 
          bankDetail.account_details.toLowerCase().includes(query) ||
          bankDetail.loans.toString().includes(query) ||
          bankDetail.leasing_facilities.toString().includes(query)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bank details
      .addCase(fetchAllBankDetails.pending, (state) => {
        state.loadingBankDetails = true;
        state.bankDetailsError = null;
      })
      .addCase(fetchAllBankDetails.fulfilled, (state, action) => {
        state.loadingBankDetails = false;
        state.bankDetailsError = null;
        // Filter out deleted records and sort by ID
        const sortedBankDetails = Array.isArray(action.payload) 
          ? action.payload
              .filter((bankDetail) => !bankDetail.is_deleted)
              .sort((a, b) => a.bank_details_id - b.bank_details_id)
          : [];
        state.allBankDetails = sortedBankDetails;
        state.filteredBankDetails = sortedBankDetails;
      })
      .addCase(fetchAllBankDetails.rejected, (state, action) => {
        state.loadingBankDetails = false;
        state.bankDetailsError = action.payload;
      })
      // Fetch bank details by ID
      .addCase(fetchBankDetailsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankDetailsById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        const bankDetail = {
          accountDetails: action.payload.account_details,
          loans: action.payload.loans.toString(),
          leasingFacilities: action.payload.leasing_facilities.toString(),
          id: action.payload.bank_details_id,
          isTemporary: false,
        };
        
        // Add or update in the list
        const existingIndex = state.bankDetailsList.findIndex(bd => bd.id === bankDetail.id);
        if (existingIndex !== -1) {
          state.bankDetailsList[existingIndex] = bankDetail;
        } else {
          state.bankDetailsList.push(bankDetail);
          state.bankDetailsList.sort((a, b) => a.id - b.id);
        }
        
        state.personalDetailsId = action.payload.personal_details_id;
        state.isEditing = true;
      })
      .addCase(fetchBankDetailsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create bank details
      .addCase(createBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Add the newly created bank details to the list
        const newBankDetail = {
          accountDetails: action.payload.account_details,
          loans: action.payload.loans.toString(),
          leasingFacilities: action.payload.leasing_facilities.toString(),
          id: action.payload.bank_details_id || Date.now(), // fallback ID if not provided
          isTemporary: false,
        };
        state.bankDetailsList.push(newBankDetail);
        // Sort to maintain order by ID
        state.bankDetailsList.sort((a, b) => a.id - b.id);
      })
      .addCase(createBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update bank details
      .addCase(updateBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Find and update the bank details in the array
        const index = state.bankDetailsList.findIndex(
          (bankDetail) => bankDetail.id === action.payload.bank_details_id
        );
        if (index !== -1) {
          const updatedBankDetail = {
            id: action.payload.bank_details_id,
            accountDetails: action.payload.account_details,
            loans: action.payload.loans.toString(),
            leasingFacilities: action.payload.leasing_facilities.toString(),
            isTemporary: false,
          };
          // Replace the bank detail while maintaining array order
          state.bankDetailsList.splice(index, 1, updatedBankDetail);
          // Sort to ensure order is maintained by ID
          state.bankDetailsList.sort((a, b) => a.id - b.id);
        }
      })
      .addCase(updateBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Soft delete bank details
      .addCase(softDeleteBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softDeleteBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Remove the deleted bank details from lists
        state.allBankDetails = state.allBankDetails.filter(
          bankDetail => bankDetail.bank_details_id !== action.payload.id
        );
        state.filteredBankDetails = state.filteredBankDetails.filter(
          bankDetail => bankDetail.bank_details_id !== action.payload.id
        );
        state.bankDetailsList = state.bankDetailsList.filter(
          bankDetail => bankDetail.id !== action.payload.id
        );
        
        // Show success message
        state.message = {
          text: action.payload.message || 'Successfully deleted bank details record',
          type: 'success',
          visible: true
        };
      })
      .addCase(softDeleteBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle when personal details are deleted (from formSlice)
      .addCase(softDeletePersonalDetails.fulfilled, (state, action) => {
        const { id, deletedBankDetails } = action.payload;
        
        // If the deleted person's bank details were being edited, reset the form
        if (state.personalDetailsId === id) {
          state.bankDetailsList = [];
          state.personalDetailsId = null;
          state.isEditing = false;
          state.hasUnsavedChanges = false;
          state.originalData = null;
        }
        
        // Remove any deleted bank details from the lists
        if (deletedBankDetails && deletedBankDetails.length > 0) {
          state.allBankDetails = state.allBankDetails.filter(
            bankDetail => !deletedBankDetails.includes(bankDetail.bank_details_id)
          );
          state.filteredBankDetails = state.filteredBankDetails.filter(
            bankDetail => !deletedBankDetails.includes(bankDetail.bank_details_id)
          );
          state.bankDetailsList = state.bankDetailsList.filter(
            bankDetail => !deletedBankDetails.includes(bankDetail.id)
          );
        }
      });
  },
});

export const {
  setBankDetailsList,
  addBankDetails,
  updateBankDetailsInState,
  deleteBankDetailsFromState,
  populateBankDetailsFromExternal,
  resetBankDetails,
  setPersonalDetailsId,
  clearBankDetailsError,
  saveOriginalData,
  revertChanges,
  setSearchQuery,
  showMessage,
  clearMessage,
} = bankDetailsSlice.actions;

export default bankDetailsSlice.reducer;