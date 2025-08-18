import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../components/SideBar'

export default function Layout() {
  return (
    <div className='grid grid-cols-9 '>
      <SideBar />
      <div className=" col-span-7 min-h-[100vh]">
        {/* <Header /> */}
        <Outlet />
      </div>

    </div>
  )
}
