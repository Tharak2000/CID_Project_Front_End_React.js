// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import formReducer from "../slice/formSlice";
import bankDetailsReducer from '../slice/BankDetailsSlice';

const store = configureStore({
  reducer: {
    form: formReducer,
    bankDetails: bankDetailsReducer,
  },
});

export default store;
