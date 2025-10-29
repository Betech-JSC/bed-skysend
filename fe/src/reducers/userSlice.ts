// reducers/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: string | null;
    name: string | null;
    email: string | null;
    role: string | null;
}

const initialState: UserState = {
    id: null,
    name: null,
    email: null,
    role: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload.id;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.role = action.payload.role;
        },
        clearUser(state) {
            state.id = null;
            state.name = null;
            state.email = null;
            state.role = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
