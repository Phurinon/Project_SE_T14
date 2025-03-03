import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, User, Mail, Lock, ArrowRight, ChevronsRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    general: "",
  });

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

  // Validation functions
  const validateName = (name) => {
    if (name.length < 2) return "ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร";
    if (name.length > 50) return "ชื่อผู้ใช้ต้องไม่เกิน 50 ตัวอักษร";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 6) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        general: "",
      });
      return;
    }

    setLoading(true);
    setErrors({ name: "", email: "", password: "", general: "" });

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        formData
      );
      console.log(response);
      toast.success("สมัครสมาชิกสำเร็จ");
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        {/* Logo and header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-6">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-white">สมัครสมาชิก</h2>
          <p className="mt-2 text-sm text-gray-400">
            เป็นสมาชิกอยู่แล้ว?{" "}
            <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200 inline-flex items-center">
              เข้าสู่ระบบ
              <ChevronsRight className="ml-1 h-4 w-4" />
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                ชื่อผู้ใช้
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="กรุณากรอกชื่อผู้ใช้"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <span className="mr-1">•</span> {errors.name}
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                อีเมล
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <span className="mr-1">•</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                รหัสผ่าน
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <span className="mr-1">•</span> {errors.password}
                </p>
              )}
            </div>
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
                  สมัครสมาชิก
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
          {/* <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={() => toast.error("เข้าสู่ระบบด้วย Google ล้มเหลว")}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
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
        </div>
      </div>
    </div>
  );
}