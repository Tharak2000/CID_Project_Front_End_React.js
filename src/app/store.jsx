// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import formReducer from "../slice/formSlice";

const store = configureStore({
  reducer: {
    form: formReducer,
  },
});

export default store;
