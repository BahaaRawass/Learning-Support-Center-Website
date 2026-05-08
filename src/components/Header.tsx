import { useState, type MouseEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import RHULogo from "/Images/rhu_logo.png";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const { Session, SignOut, Loading } = useAuth();
  const navigate = useNavigate();

  const [showLogoutNotice, setShowLogoutNotice] = useState<boolean>(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const ok = await SignOut();
    if (ok) {
      setShowLogoutNotice(true);
      setTimeout(() => setShowLogoutNotice(false), 2500);
    }
  }

  const email = Session?.user.email;

  const DisplayName: string =
    Session?.user.user_metadata?.display_name?.trim() ||
    email?.slice(0, email.indexOf("@"));

  const initials = DisplayName?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {showLogoutNotice && (
        <div className='fixed top-4 right-4 z-9999 rounded-md bg-(--success)/90 px-4 py-2 text-sm font-medium text-white shadow-lg'>
          Logged out successfully!
        </div>
      )}
      <header className='site-header'>
        <div className='header-brand relative'>
          <Link to='/'>
            <img
              src={RHULogo}
              alt='RHU Logo'
              className='w-72.5 h-18.75 object-contain p-2'
            />
          </Link>
        </div>
        <div className='header-user'>
          <div className='user-name'>{DisplayName}</div>
          <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
            {!Session ? (
              <Button
                variant='link'
                className='cursor-pointer text-[14px] text-gray-600 hover:text-orange-500 hover:underline hover:decoration-2'
                onClick={() => navigate("/login")}
                disabled={Loading}
              >
                Login
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className='cursor-pointer bg-linear-to-br from-(--navy) to-(--navy-light) rounded-[50%] border-2 border-white'>
                  <div className='size-12 bg-linear-to-br flex items-center justify-center relative text-center p-2!'>
                    <span className='text-white/30 text-2xl font-black text-center'>
                      {initials}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-full relative top-5!'>
                  <DropdownMenuItem>
                    Display Name: {DisplayName}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Email: {Session.user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Button
                      variant='destructive'
                      onClick={handleClick}
                      className='cursor-pointer'
                    >
                      LogOut
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
