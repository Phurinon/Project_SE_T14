import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
import useDusthStore from "../../Global Store/DusthStore";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "./Login.css"; // Import CSS file

export default function Login() {
  const navigate = useNavigate();
  const actionLogin = useDusthStore((state) => state.actionLogin);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Google Login Handler
  const responseGoogle = (response) => {
    console.log(response);
    toast.success("เข้าสู่ระบบด้วย Google สำเร็จ");
    // Send the response to your backend for further processing
  };

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="login-container">
      <div className="login-header">
        <h2>เข้าสู่ระบบ</h2>
        <p>
          หรือ{" "}
          <Link to="/register" className="login-link">
            สมัครสมาชิกใหม่
          </Link>
        </p>
      </div>

      <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleOnChange}
              disabled={loading}
            />
          </div>

          <div className="password-container">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleOnChange}
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading && <Loader className="loader" />}
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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
