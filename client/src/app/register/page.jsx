"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/axios";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", form);
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    border: "0.5px solid #e2e8f0",
    outline: "none",
    marginTop: "6px",
    transition: "border-color 0.2s",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "16px",
          animation: "fadeInUp 0.5s ease both",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#EEEDFE",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "22px",
            }}
          >
            🧠
          </div>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              marginBottom: "6px",
            }}
          >
            Create account
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Join BrainBlitz and start quizzing!
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#FCEBEB",
              border: "0.5px solid #F7C1C1",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#A32D2D",
              fontSize: "13px",
              marginBottom: "20px",
              animation: "popIn 0.3s ease",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
              }}
            >
              Name
            </label>
            <input
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
              }}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
              }}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
              }}
            >
              Role
            </label>
            <select
              name="role"
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                border: "0.5px solid #e2e8f0",
                outline: "none",
                marginTop: "6px",
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#7c3aed",
              color: "white",
              border: "none",
              padding: "11px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s, transform 0.15s",
              marginTop: "4px",
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "13px",
            color: "var(--color-text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#7c3aed",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
