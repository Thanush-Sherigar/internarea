import {createSlice,PayloadAction} from '@reduxjs/toolkit';
interface UserState{
    userInfo:any|null;
    isLoggedIn:boolean;
    loading:boolean;
}
const initialState:UserState={
    userInfo:null,
    isLoggedIn:false,
    loading:true
};
export const userSlice=createSlice({
    name:'user',
    initialState,
    reducers:{
        //deposit function
        login:(state,action:PayloadAction<any>)=>{
            state.userInfo=action.payload;
            state.isLoggedIn=true;
            state.loading=false;
        },
        logout:(state)=>{
            state.userInfo=null;
            state.isLoggedIn=false;
            state.loading=false;
        },
    },
});
export const{login,logout}=userSlice.actions;
export default userSlice.reducer;