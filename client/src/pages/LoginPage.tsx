import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";

type Step = "login" | "otp";

function getOrCreateDeviceId() {
  // simple stable device id per browser
  if (typeof window === "undefined") return "dev-ssr";

  let id = localStorage.getItem("securehub_deviceId");
  if (!id) {
    id =
      "dev-" +
      Math.random().toString(36).slice(2, 10) +
      "-" +
      Date.now().toString(36);
    localStorage.setItem("securehub_deviceId", id);
  }
  return id;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("admin@securehub.com"); // for dev: prefill admin
  const [password, setPassword] = useState("admin123");      // you can clear these later
  const [otp, setOtp] = useState("");
  const [deviceId] = useState(() => getOrCreateDeviceId());
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          deviceId,
          hostName: window.location.hostname,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Admin (or approved device) login success
        localStorage.setItem("securehub_token", data.token);
        localStorage.setItem("securehub_user", JSON.stringify(data.user));
        navigate("/");
      } else if (res.status === 403 && data.status === "DEVICE_OTP_REQUIRED") {
        // ✅ New device for normal user → move to OTP step
        setStep("otp");
        setMessage(
          data.message ||
            "New device detected. Enter the OTP sent to your registered email."
        );
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-device-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          deviceId,
          otpCode: otp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("securehub_token", data.token);
        localStorage.setItem("securehub_user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <Card className="w-full max-w-md p-8 bg-slate-900/70 border-slate-700 shadow-2xl rounded-2xl">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/40 mb-3">
            <Shield className="text-blue-400" size={30} />
          </div>
          <h1 className="text-3xl font-semibold text-slate-50 tracking-tight">
            SecureHub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Encrypted File Sharing System
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Device ID: <span className="font-mono">{deviceId}</span>
          </p>
        </div>

        {/* Status messages */}
        {message && (
          <div className="mb-3 rounded-md bg-blue-500/10 border border-blue-500/40 px-3 py-2 text-xs text-blue-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* LOGIN STEP */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-200">Email</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/60 border-slate-700 text-slate-50 placeholder:text-slate-500"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">Password</label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/60 border-slate-700 text-slate-50 placeholder:text-slate-500 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-100"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-base font-medium"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-slate-300">
              We&apos;ve sent a verification code to{" "}
              <span className="font-semibold">{email}</span>. Enter the OTP to
              approve this device.
            </p>

            <div className="space-y-1">
              <label className="text-sm text-slate-200">OTP Code</label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="bg-slate-900/60 border-slate-700 text-slate-50 placeholder:text-slate-500 tracking-[0.4em] text-center"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-base font-medium"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Login
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs text-slate-400 hover:text-slate-100"
              onClick={() => {
                setStep("login");
                setOtp("");
                setMessage(null);
                setError(null);
              }}
            >
              ← Back to login
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
