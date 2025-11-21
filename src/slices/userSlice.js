import { createSlice } from "@reduxjs/toolkit";

let storedUser = null;
let storedToken = null;

try {
    storedUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;
    storedToken = localStorage.getItem("token") || null;
} catch {
    storedUser = null;
    storedToken = null;
}

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
            try {
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("token", token);
            } catch {}
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            try {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            } catch {}
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            try {
                localStorage.setItem("user", JSON.stringify(state.user));
            } catch {}
        },
    },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
