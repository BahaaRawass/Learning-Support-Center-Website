import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { MailIcon, User2Icon } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

export default function AuthHome() {
  useDocumentTitle("Authentication");

  const { Session, SignIn } = useAuth();

  if (Session) return <Navigate to="/" />;

  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full">
      <Button className="btn-primary w-full text-[16px]">
        <Link
          to="/auth/login"
          className="flex  items-center justify-center gap-2"
        >
          <MailIcon size={16} /> Sign in with Email
        </Link>
      </Button>
      <Button
        className="btn-primary w-full text-[16px]"
        onClick={() => SignIn({ anon: true })}
      >
        <User2Icon size={16} /> Continue as Student
      </Button>
    </div>
  );
}
