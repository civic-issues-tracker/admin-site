import { MoreHorizontal, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const OrganizationAdminSettingsPage = () => {
	return (
		<section>
			<header className="mb-3 flex items-start justify-between">
				<div>
					<h2 className="text-[36px] font-black leading-tight text-[#3E2B1F]">Organization Admin Settings</h2>
					<p className="text-sm text-[#857060]">Manage dispatch preferences, shift defaults, and account controls.</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center rounded-full border border-[#DDCFC0] bg-[#F8F6F2] px-3 py-1.5">
						<Search size={14} className="mr-1 text-[#9D8A78]" />
						<input placeholder="Search settings..." className="w-56 bg-transparent text-xs outline-none" />
					</div>
					<button type="button" className="rounded-full border border-[#DDCFC0] bg-[#F8F6F2] p-2 text-[#8B7B69]" title="More options" aria-label="More options">
						<MoreHorizontal size={14} />
					</button>
				</div>
			</header>

			<div className="grid min-h-[81vh] grid-cols-1 gap-3 rounded-2xl border border-[#D8CCBD] bg-[#F6F2EC] p-3 lg:grid-cols-12">
				<div className="space-y-3 lg:col-span-7">
					<div className="rounded-2xl border border-[#DDD0C2] bg-white p-4">
						<div className="mb-3 flex items-center gap-2">
							<SlidersHorizontal size={18} className="text-[#6A4834]" />
							<h3 className="text-lg font-bold text-[#3D2A1E]">Dispatch Preferences</h3>
						</div>
						<div className="space-y-3 text-sm text-[#4F3A2A]">
							<label className="flex items-center justify-between rounded-xl border border-[#E6DACF] bg-[#FAF7F3] px-3 py-2">
								<span>Auto-assign nearest unit for High priority issues</span>
								<input type="checkbox" defaultChecked className="h-4 w-4 accent-[#6A4834]" />
							</label>
							<label className="flex items-center justify-between rounded-xl border border-[#E6DACF] bg-[#FAF7F3] px-3 py-2">
								<span>Enable district-level SMS escalation</span>
								<input type="checkbox" defaultChecked className="h-4 w-4 accent-[#6A4834]" />
							</label>
							<label className="flex items-center justify-between rounded-xl border border-[#E6DACF] bg-[#FAF7F3] px-3 py-2">
								<span>Show unresolved-only queue by default</span>
								<input type="checkbox" className="h-4 w-4 accent-[#6A4834]" />
							</label>
						</div>
					</div>

					<div className="rounded-2xl border border-[#DDD0C2] bg-white p-4">
						<h3 className="text-lg font-bold text-[#3D2A1E]">Shift Defaults</h3>
						<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
							<label className="text-sm text-[#5E4A3A]">
								<span className="mb-1 block text-xs uppercase tracking-wider text-[#8F7B69]">Default Patrol Zone</span>
								<select className="w-full rounded-xl border border-[#DECFBF] bg-[#FBF8F4] px-3 py-2 outline-none">
									<option>Bole - Central</option>
									<option>Bole - East</option>
									<option>Bole - Airport Corridor</option>
								</select>
							</label>
							<label className="text-sm text-[#5E4A3A]">
								<span className="mb-1 block text-xs uppercase tracking-wider text-[#8F7B69]">Fallback Response ETA</span>
								<select className="w-full rounded-xl border border-[#DECFBF] bg-[#FBF8F4] px-3 py-2 outline-none">
									<option>15 minutes</option>
									<option>30 minutes</option>
									<option>45 minutes</option>
								</select>
							</label>
						</div>
					</div>
				</div>

				<div className="space-y-3 lg:col-span-5">
					<div className="rounded-2xl border border-[#DDD0C2] bg-white p-4">
						<div className="mb-2 flex items-center gap-2">
							<ShieldCheck size={18} className="text-[#6A4834]" />
							<h3 className="text-lg font-bold text-[#3D2A1E]">Security</h3>
						</div>
						<button className="mt-2 w-full rounded-xl border border-[#DCCDBE] bg-[#FAF6F1] px-3 py-2 text-left text-sm text-[#4F3A2A] hover:bg-[#F2EAE0]">
							Change password
						</button>
						<button className="mt-2 w-full rounded-xl border border-[#DCCDBE] bg-[#FAF6F1] px-3 py-2 text-left text-sm text-[#4F3A2A] hover:bg-[#F2EAE0]">
							Enable 2-step verification
						</button>
					</div>

					<div className="rounded-2xl border border-[#DDD0C2] bg-white p-4">
						<h3 className="text-lg font-bold text-[#3D2A1E]">Save Changes</h3>
						<p className="mt-1 text-sm text-[#7E6A59]">Update your operational defaults and alert routing preferences.</p>
						<div className="mt-3 flex gap-2">
							<button className="rounded-full border border-[#D8CCBD] bg-[#F7F2EB] px-4 py-2 text-sm font-semibold text-[#5F4A39]">Reset</button>
							<button className="rounded-full bg-[#6A4834] px-4 py-2 text-sm font-semibold text-white">Save Settings</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default OrganizationAdminSettingsPage;