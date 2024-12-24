import { Link } from "react-router-dom";
export default function MainNav() {
  return (
    <nav className="bg-green-300">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">

          <div className="flex items-center gap-4">
            <Link to={"/"} className="text-2xl font-bold">LOGO</Link>
            <Link to={"/"}>Home</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to={"/register"}>Register</Link>
            <Link to={"/login"}>Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
