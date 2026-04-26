import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Calendar, Euro, LogOut } from "lucide-react";
import { changePassword, getMe, signOut } from "../../src/lib/auth";

export default function Profile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe()
      .then((user) => {
        setEmail(user.email ?? "");
        setCreatedAt(
          user.created_at
            ? new Date(user.created_at).toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—",
        );
        setLoading(false);
      })
      .catch(() => {
        navigate("/signin");
      });
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await changePassword(newPassword);
      setPasswordMsg("Password changed successfully!");
      setNewPassword("");
      setChangingPassword(false);
    } catch (err) {
      setPasswordMsg(
        err instanceof Error ? err.message : "Password update failed",
      );
    }
    setSaving(false);
  };

  const initials = email ? email[0].toUpperCase() : "U";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-6">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="w-24 h-24 rounded-full bg-linear-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white text-3xl font-semibold">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{email}</h2>
              <p className="text-gray-600">Manage your profile and settings</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-800">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Account created</p>
                <p className="font-medium text-gray-800">{createdAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Euro className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Default currency</p>
                <p className="font-medium text-gray-800">EUR</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Password</p>
                {!changingPassword ? (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Change password
                  </button>
                ) : (
                  <div className="mt-2 space-y-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    {passwordMsg && (
                      <p
                        className={`text-xs ${passwordMsg.includes("success") ? "text-green-600" : "text-red-500"}`}
                      >
                        {passwordMsg}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setChangingPassword(false);
                          setPasswordMsg("");
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Settings</h3>
          <div className="space-y-4">
            {[
              {
                label: "Email notifications",
                desc: "Receive email updates about your receipts",
                defaultOn: true,
              },
              {
                label: "Auto-categorization",
                desc: "Automatically categorize receipts with AI",
                defaultOn: true,
              },
              {
                label: "Monthly spending summary",
                desc: "Get monthly analytics via email",
                defaultOn: false,
              },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{setting.label}</p>
                  <p className="text-sm text-gray-600">{setting.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={setting.defaultOn}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
