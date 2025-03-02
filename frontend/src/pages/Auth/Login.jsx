<<<<<<< Updated upstream
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
import useDusthStore from "../../Global Store/DusthStore";
import { toast } from "react-toastify";
=======
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, ChevronsRight } from "lucide-react";
import useDusthStore from "../../Global Store/DusthStore";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
>>>>>>> Stashed changes

export default function Login() {
  const navigate = useNavigate();
  const actionLogin = useDusthStore((state) => state.actionLogin);
<<<<<<< Updated upstream
=======
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
>>>>>>> Stashed changes

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

<<<<<<< Updated upstream
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

=======
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      alert("Login successful!");
    }
  }, [token]);

  const googleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };
  
  // Google Login Handler
  const responseGoogle = (response) => {
    console.log(response);
    toast.success("เข้าสู่ระบบด้วย Google สำเร็จ");
    // Send the response to your backend for further processing
  };
  
>>>>>>> Stashed changes
  const handleOnChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await actionLogin(formData);
      const role = response.data.payload.role;
      roleRedirect(role);
      toast.success("เข้าสู่ระบบสำเร็จ");
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleRedirect = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "store") {
      navigate("/shop");
    } else {
      navigate("/user");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          เข้าสู่ระบบ
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          หรือ{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            สมัครสมาชิกใหม่
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                อีเมล
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.email}
                  onChange={handleOnChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                รหัสผ่าน
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.password}
                  onChange={handleOnChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
<<<<<<< Updated upstream
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </div>
          </form>
=======
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <ArrowRight className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" />
                  </span>
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">หรือเข้าสู่ระบบด้วย</span>
          </div>
        </div>

        {/* Social login */}
        <div className="mt-6">
          {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={(credentialResponse) =>{
                console.log(credentialResponse)
                console.log(jwtDecode(credentialResponse.credential))
                // navigate("/user")
              }}
              onError={() => toast.error("เข้าสู่ระบบด้วย Google ล้มเหลว")}
              auto_select={true}
              render={(renderProps) => (
                <button
                onClick={googleLogin}
                disabled={renderProps.disabled}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-600 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google Logo"
                    className="w-5 h-5"
                    />
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>
              )}
              />
          </GoogleOAuthProvider> */}
          <button 
            onClick={googleLogin}
            onSuccess={(responseGoogle)=>{
              navigate("/user")
            }}>
          <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google Logo"
              className="w-5 h-5"
              />
              <span>เข้าสู่ระบบด้วย Google</span>
          </button>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}
