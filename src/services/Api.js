import axios from "./AxiosOrder";

//.......... getting loadHistoryData.........
export const getReportData = async (reportId) => {
    const response = await axios.post(`/ViewReport?proj=${reportId}`);
    return response.data;
};
  