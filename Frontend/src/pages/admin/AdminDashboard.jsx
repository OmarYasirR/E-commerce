import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  IoWallet, IoCart, IoPeople, IoCube, IoArrowUp, IoArrowDown,
  IoRefresh, IoDownload 
} from 'react-icons/io5';
import adminService from '../../services/adminService';
import { showToast } from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, revenueRes, productsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRevenueReport({ period }),
        adminService.getTopProducts({ limit: 5, period })
      ]);
      
      setStats(statsRes.data);
      setRevenueData(revenueRes.data.data);
      setTopProducts(productsRes.data);
    } catch (error) {
      showToast('error', error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? <IoArrowUp size={12} /> : <IoArrowDown size={12} />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.revenue?.total?.toLocaleString() || 0}`}
          icon={<IoWallet size={24} className="text-white" />}
          color="bg-primary-500"
          trend={12.5}
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders?.total || 0}
          icon={<IoCart size={24} className="text-white" />}
          color="bg-green-500"
          trend={8.2}
        />
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={<IoPeople size={24} className="text-white" />}
          color="bg-blue-500"
          trend={5.1}
        />
        <StatCard
          title="Total Products"
          value={stats?.products?.total || 0}
          icon={<IoCube size={24} className="text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('week')}
                className={`px-3 py-1 text-sm rounded ${period === 'week' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
              >
                Week
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 text-sm rounded ${period === 'month' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
              >
                Month
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-3 py-1 text-sm rounded ${period === 'year' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
              >
                Year
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" name="Revenue ($)" />
              <Line type="monotone" dataKey="orders" stroke="#10b981" name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">Sold: {product.totalSold}</p>
                  </div>
                </div>
                <p className="font-semibold">${product.totalRevenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pending', value: stats?.orders?.pending || 0 },
                  { name: 'Processing', value: stats?.orders?.processing || 0 },
                  { name: 'Shipped', value: stats?.orders?.shipped || 0 },
                  { name: 'Delivered', value: stats?.orders?.delivered || 0 },
                  { name: 'Cancelled', value: stats?.orders?.cancelled || 0 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats?.orders && Object.keys(stats.orders).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <button onClick={fetchDashboardData} className="text-gray-500 hover:text-gray-700">
              <IoRefresh size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <Link to="/admin/products" className="block text-center w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition">

              Add New Product
            </Link>
            <Link to="/admin/orders" className="block text-center w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
              
              View All Orders
            </Link>
            <Link to="/admin/users" className="block text-center w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              Manage Users
            </Link>
            <Link to="/admin/coupons" className="block text-center w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition">
              Create Coupon
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;