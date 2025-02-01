import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./regis.css"; // Import CSS file

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="register-container">
      <div className="register-header">
        <h2>สมัครสมาชิก</h2>
        <p>
          หรือ{" "}
          <Link to="/login" className="register-link">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>

      <div className="register-form-container">
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Name field */}
          <div>
            <label htmlFor="name">ชื่อผู้ใช้</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="กรุณากรอกชื่อผู้ใช้"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* Password field */}
          <div className="password-container">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
            {errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          {/* Submit button */}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? <Loader2 className="loader" /> : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="social-login">
          {/* Google Login Button */}
          <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={() => toast.error("เข้าสู่ระบบด้วย Google ล้มเหลว")}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  className="google-login-button"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google Logo"
                    width="16"
                    height="16"
                  />
                  เข้าสู่ระบบด้วย Google
                </button>
              )}
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
}
