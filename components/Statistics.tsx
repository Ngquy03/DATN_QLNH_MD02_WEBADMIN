
import React, { useState, useEffect, useCallback } from 'react';
import { Report } from '../types';
import { DeleteIcon } from './Icons';

const API_BASE_URL = 'http://localhost:3000';

interface StatisticsProps {
  token: string;
}

const Statistics: React.FC<StatisticsProps> = ({ token }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Tải báo cáo thất bại' }));
        throw new Error(data.message || 'Tải báo cáo thất bại');
      }
      const result = await response.json();
      
      if (result && Array.isArray(result.data)) {
        setReports(result.data);
      } else {
        console.error("API response is not in the expected format:", result);
        setReports([]);
        setError("Dữ liệu báo cáo nhận được có định dạng không hợp lệ.");
      }
    } catch (err) {
      setReports([]);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + mondayOffset);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const toISO = (date: Date) => date.toISOString().split('T')[0];

    return { startDate: toISO(startDate), endDate: toISO(endDate) };
  };

  const handleCreateReport = async (type: 'daily' | 'weekly') => {
    setIsCreating(true);
    setError(null);
    try {
      let body;
      let endpoint;

      if (type === 'daily') {
        endpoint = `${API_BASE_URL}/reports/daily`;
        body = { reportDate: new Date().toISOString().split('T')[0] };
      } else {
        endpoint = `${API_BASE_URL}/reports/weekly`;
        body = getWeekRange();
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Tạo báo cáo ${type === 'daily' ? 'ngày' : 'tuần'} thất bại`);
      }
      fetchReports(); // Refresh list after creation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này không?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Xóa báo cáo thất bại');
        }
        fetchReports(); // Refresh list after deletion
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
      }
    }
  };
  
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
      });
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Thống kê Báo cáo</h2>
        <div className="flex self-end space-x-2 sm:self-auto">
          <button onClick={() => handleCreateReport('daily')} disabled={isCreating} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
            {isCreating ? 'Đang tạo...' : 'Tạo Báo cáo Hôm nay'}
          </button>
          <button onClick={() => handleCreateReport('weekly')} disabled={isCreating} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">
            {isCreating ? 'Đang tạo...' : 'Tạo Báo cáo Tuần này'}
          </button>
        </div>
      </div>
      
      {isLoading && <p className="mt-4 text-center text-gray-500">Đang tải dữ liệu báo cáo...</p>}
      {error && <p className="mt-4 p-4 text-center text-red-500 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">Lỗi: {error}</p>}
      
      {!isLoading && !error && (
         <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                          <th scope="col" className="px-6 py-3">Loại báo cáo</th>
                          <th scope="col" className="px-6 py-3">Ngày tạo</th>
                           <th scope="col" className="px-6 py-3 text-right">Tổng doanh thu</th>
                          <th scope="col" className="px-6 py-3 text-right">Tổng đơn hàng</th>
                          <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {reports.length > 0 ? (
                        reports.map((report) => (
                            <tr key={report._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white capitalize">
                                  {report.reportType.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-4">{formatDate(report.generatedAt)}</td>
                                <td className="px-6 py-4 font-mono text-right">{formatCurrency(report.totalRevenue)}</td>
                                <td className="px-6 py-4 font-mono text-right">{report.totalOrders}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDeleteReport(report._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                                        <DeleteIcon />
                                    </button>
                                </td>
                            </tr>
                        ))
                      ) : (
                        <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500">Không có báo cáo nào.</td>
                        </tr>
                      )}
                  </tbody>
              </table>
         </div>
      )}
    </div>
  );
};

export default Statistics;
