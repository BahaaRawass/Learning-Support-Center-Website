import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import SideBar from "../components/SideBar";

export default function MainLayout() {
  return (
    <div className='app-shell'>
      <Header />
      <div className='layout'>
        <SideBar />

        <main className='main'>
          <Outlet />
        </main>
      </div>

      <footer className='site-footer'>
        &copy; 2026 &nbsp;<span>RHU Learning Support Center</span>&nbsp; —
        College of Arts &amp; Sciences &nbsp;|&nbsp; All rights reserved.
      </footer>
    </div>
  );
}
