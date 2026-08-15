"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

interface PhoneOtpFormProps {
  onSuccess: () => void;
}

export function PhoneOtpForm({ onSuccess }: PhoneOtpFormProps) {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCodeHint, setDevCodeHint] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    let interval: any;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsLoading(true);
    try {
      const formatted = phone.startsWith("+91") ? phone : `+91 ${phone}`;
      const res = await sendOtp(formatted);
      if (res?.code) setDevCodeHint(res.code);
      setStep("otp");
      setResendTimer(30);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto move next
    if (value && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }

    // Auto verify when 6 digits filled
    if (newDigits.every((d) => d !== "")) {
      handleVerify(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length < 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const formatted = phone.startsWith("+91") ? phone : `+91 ${phone}`;
      await verifyOtp(formatted, code);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-semibold text-danger">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendPhoneOtp} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-foreground">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                required
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-3 pl-20 pr-4 text-sm font-medium tracking-wide text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              We&apos;ll send a 6-digit verification code via SMS.
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            loadingText="Sending OTP..."
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Get OTP Verification Code
          </Button>
        </form>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to <strong className="text-foreground">+91 {phone}</strong>
            </p>
            {devCodeHint && (
              <span className="mt-1 inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Dev Test OTP: {devCodeHint}
              </span>
            )}
          </div>

          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="h-12 w-11 rounded-xl border border-input bg-card text-center text-lg font-bold text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            ))}
          </div>

          <Button
            type="button"
            fullWidth
            onClick={() => handleVerify()}
            isLoading={isLoading}
            loadingText="Verifying OTP..."
          >
            Verify & Sign In
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="hover:underline"
            >
              Change phone number
            </button>
            <button
              type="button"
              disabled={resendTimer > 0}
              onClick={handleSendPhoneOtp}
              className="font-semibold text-brand disabled:opacity-50 hover:underline"
            >
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
