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
            
            // Check if backend uses pagination (res.data.results) or raw array (res.data)
            const issues = Array.isArray(res.data) ? res.data : res.data.results || [];

            const total = issues.length;
            const solved = issues.filter((i: any) => i.status === 'resolved' || i.status === 'RESOLVED').length;
            const active = issues.filter((i: any) => ['pending', 'in_progress', 'under_review'].includes(i.status.toLowerCase())).length;
            
            const rate = total > 0 ? Math.round((solved / total) * 100) : 0;

            return {
                totalReported: total.toLocaleString(),
                totalSolved: solved.toLocaleString(),
                activeIssues: active.toLocaleString(),
                resolutionRate: `${rate}%`
            };
        } catch (error) {
            console.error("Stats Calculation Failed:", error);
            return { totalReported: "0", totalSolved: "0", activeIssues: "0", resolutionRate: "0%" };
        }
    }
};
