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
            Object.assign(state, action.payload);
        },
        clearUser(state) {
            Object.assign(state, initialState);
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
