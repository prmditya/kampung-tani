import type React from "react";
import { MdRefresh } from "react-icons/md";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { DeviceStatusIndicator } from "@/shared/components/ui/device-status-indicator";
import type { Device, DeviceStatusHistory } from "@/shared/hooks/useApi";
import { formatDateTime } from "@/shared/lib/helpers";

interface DeviceHistoryPanelProps {
	selectedDeviceId: number | null;
	devices: Device[] | null;
	statusHistory: DeviceStatusHistory[] | null;
	loading: boolean;
	error?: string | null;
	onRefresh?: () => void;
}

const DeviceHistoryPanel: React.FC<DeviceHistoryPanelProps> = ({
	selectedDeviceId,
	devices,
	statusHistory,
	loading,
	error,
	onRefresh,
}) => {
	const selectedDevice = selectedDeviceId
		? devices?.find((device) => device.id === selectedDeviceId)
		: undefined;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Device Status History</CardTitle>
						<CardDescription>
							{selectedDevice
								? `Status history for ${selectedDevice.name} (${selectedDevice.device_type})`
								: "Select a device to view its status history"}
						</CardDescription>
					</div>
					{onRefresh && selectedDeviceId && (
						<Button
							onClick={onRefresh}
							disabled={loading}
							className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
						>
							<MdRefresh
								className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{!selectedDeviceId ? (
						<div className="text-center text-muted-foreground py-8">
							Select a device from the Device List tab to view its status
							history.
						</div>
					) : error ? (
						<div className="text-center text-red-500 py-4">
							Error loading history: {error}
							{onRefresh && (
								<button
									onClick={onRefresh}
									className="ml-2 px-2 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
								>
									Retry
								</button>
							)}
						</div>
					) : loading ? (
						<div className="text-center py-4 text-muted-foreground">
							Loading status history...
						</div>
					) : !statusHistory || statusHistory.length === 0 ? (
						<div className="text-center text-muted-foreground py-4">
							No status history available for this device.
						</div>
					) : (
						<div className="space-y-3 max-h-96 overflow-y-auto">
							{statusHistory.map((entry, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
								>
									<div className="flex items-center space-x-3">
										<DeviceStatusIndicator
											status={entry.status as "online" | "offline"}
											showLastSeen={true}
										/>
										<div>
											<div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
												{entry.status === "online"
													? "Came Online"
													: entry.status === "offline"
														? "Went Offline"
														: "Maintenance Mode"}
											</div>
											{entry.status === "offline" &&
												entry.uptime_seconds !== null && (
													<div className="text-xs text-muted-foreground mt-1 font-medium">
														Uptime: {entry.uptime_formatted}
													</div>
												)}
										</div>
									</div>
									<div className="text-sm text-muted-foreground">
										{entry.created_at
											? (() => {
													try {
														return formatDateTime(
															entry.created_at,
															"Asia/Jakarta",
														);
													} catch {
														return "Invalid";
													}
												})()
											: "Unknown"}
									</div>
								</div>
							))}
						</div>
					)}

					{selectedDevice && (
						<div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-gray-600">
							<div className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
								Current Device Status
							</div>
							<div className="flex flex-col space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<DeviceStatusIndicator
											status={
												(selectedDevice.device_status ||
													selectedDevice.status) as
													| "online"
													| "offline"
													| "restarted"
											}
											showLastSeen={false}
										/>
										<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
											{(selectedDevice.device_status ||
												selectedDevice.status) === "online"
												? "Currently Online"
												: (selectedDevice.device_status ||
															selectedDevice.status) === "offline"
													? "Currently Offline"
													: "Under Maintenance"}
										</span>
									</div>
									<div className="text-xs text-muted-foreground bg-white dark:bg-slate-800 px-2 py-1 rounded-md border">
										Last seen: {(() => {
											try {
												return formatDateTime(
													selectedDevice.last_seen || selectedDevice.updated_at,
													"Asia/Jakarta",
												);
											} catch {
												return "Invalid";
											}
										})()}
									</div>
								</div>
								{selectedDevice.current_uptime_formatted && (
									<div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600">
										<div className="flex items-center space-x-2">
											<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
												{(selectedDevice.device_status ||
													selectedDevice.status) === "online" ? (
													<span className="text-emerald-600 dark:text-emerald-400">
														System Uptime:
													</span>
												) : (
													<span className="text-red-600 dark:text-red-400">
														Offline Duration:
													</span>
												)}
											</span>
										</div>
										<div className="text-sm font-bold text-gray-900 dark:text-gray-100">
											{selectedDevice.current_uptime_formatted}
										</div>
									</div>
								)}
								{selectedDevice.uptime_description && (
									<div className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-slate-700 p-2 rounded border-l-2 border-blue-400">
										{selectedDevice.uptime_description}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default DeviceHistoryPanel;
