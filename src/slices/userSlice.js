import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
const storedToken = localStorage.getItem("token")
    ? localStorage.getItem("token")
    : null;

const initialState = {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedUser && !!storedToken,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem("user", JSON.stringify(state.user));
        },
    },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
