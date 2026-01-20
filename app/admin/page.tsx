export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-2">Wait Actions</h3>
                    <p className="text-gray-500">Select an option from the sidebar to manage content.</p>
                </div>
            </div>
        </div>
    );
}
