import { privateApi } from "../../auth/services/authService";

export const AdminStatsOverview = {
    // getTotalReportedIssues : async (): Promise<number> => {
    //     try {
    //         const res = await privateApi.get('/api/v1/admin/stats/total-reported/');
    //         return res.data.count || 0;
    //     } catch (error) {
    //         console.error("Error fetching total reported issues:", error);
    //         return 0;
    //     }
    // },

    // getActiveIssues : async (): Promise<string |number> => {
    //     try {
    //         const res = await privateApi.get('/api/v1/admin/stats/active-issues/');
    //         return res.data.count || 0;
    //     } catch (error) {
    //         console.error("Error fetching active issues:", error);
    //         return 0;
    //     }
    // },

    // getTotalSolvedIssues : async (): Promise<number> => {
    //     try {
    //         const res = await privateApi.get('/api/v1/admin/stats/total-solved/');
    //         return res.data.count || 0;
    //     } catch (error) {
    //         console.error("Error fetching total solved issues:", error);
    //         return 0;
    //     }
    // },

    // getResolutionRate : async (): Promise<string> => {
    //     try {
    //         const res = await privateApi.get('/api/v1/admin/stats/resolution-rate/');
    //         const rate = res.data.rate || 0;
    //         return `${rate}%`;
    //     } catch (error) {
    //         console.error("Error fetching resolution rate:", error);
    //         return "0%";
    //     }
    // },

    getDashboardStats: async () => {
    try {
        const res = await privateApi.get('/issues/');
        const issues = Array.isArray(res.data) ? res.data : res.data.results || [];

        const total = issues.length;

        // Helper function to extract status text cleanly regardless of backend format
        const getStatusText = (item: any): string => {
            const statusField = item.status || item.issue_status || item.current_status;
            
            if (!statusField) return 'pending'; // Fallback default
            
            // If backend returned it as a nested object: status: { label: 'Resolved' } or status: { value: 'resolved' }
            if (typeof statusField === 'object') {
                return (statusField.value || statusField.label || statusField.name || '').toLowerCase();
            }
            
            return String(statusField).toLowerCase();
        };

        // Calculate counts using the safe extractor
        const solved = issues.filter((i: any) => getStatusText(i) === 'resolved').length;
        const rejected = issues.filter((i: any) => getStatusText(i) === 'rejected').length;
        
        // Active is explicitly whatever is left over
        const active = total - (solved + rejected);
        const rate = total > 0 ? Math.round((solved / total) * 100) : 0;

        return {
            totalReported: total.toLocaleString(),
            totalSolved: solved.toLocaleString(),
            activeIssues: active < 0 ? "0" : active.toLocaleString(),
            resolutionRate: `${rate}%`
        };
    } catch (error) {
        console.error("Stats Calculation Failed:", error);
        return { totalReported: "0", totalSolved: "0", activeIssues: "0", resolutionRate: "0%" };
    }
}
};
