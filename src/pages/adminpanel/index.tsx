import {useRouter} from 'next/router';
import{useSelector} from 'react-redux';
import {useEffect,useState} from 'react';
import {RootState} from '../../store/store';
import axios from 'axios';
const AdminRoute=({children}:{children:React.ReactNode})=>{
    const router=useRouter();
    const{userInfo,isLoggedIn}=useSelector((state:RootState)=>state.user);
    useEffect(()=>{
        const isAdmin=userInfo?.email==='thanush953@gmail.com';
        if(!isLoggedIn||!isAdmin){
            router.push('/');
        }
    },[isLoggedIn,userInfo,router]);
    return<>{children}</>;
};