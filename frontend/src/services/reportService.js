import api from './api';

export const reportService = {
  getReport: async (reportType, startDate = '', endDate = '', extraParams = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    Object.keys(extraParams).forEach((key) => {
      if (extraParams[key]) params.append(key, extraParams[key]);
    });

    const response = await api.get(`/reports/${reportType}?${params.toString()}`);
    return response.data;
  },

  downloadPDF: async (reportType, startDate = '', endDate = '') => {
    const params = new URLSearchParams();
    params.append('reportType', reportType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });

    // Create a Blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_Report_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadExcel: async (reportType, startDate = '', endDate = '') => {
    const params = new URLSearchParams();
    params.append('reportType', reportType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/reports/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_Report_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
