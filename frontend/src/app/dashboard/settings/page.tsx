export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <div>
          <p className="font-medium">Account Settings</p>
        </div>

        <div>
          <p className="font-medium">API Keys</p>
        </div>

        <div>
          <p className="font-medium">Security</p>
        </div>
      </div>
    </div>
  );
}
