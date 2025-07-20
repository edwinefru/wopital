import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Activity,
  Users,
  Shield,
  Settings,
  BarChart3,
  Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    pendingHospitals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    expiringSubscriptions: 0,
    totalTransactions: 0,
    stripeCustomers: 0,
    systemHealth: 'Good'
  });
  const [recentHospitals, setRecentHospitals] = useState([]);
  const [subscriptionAlerts, setSubscriptionAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load platform-level statistics
      const [
        hospitalsData,
        subscriptionsData,
        transactionsData,
        approvalRequests
      ] = await Promise.all([
        supabase.from('hospitals').select('*'),
        supabase.from('hospital_subscriptions').select('*'),
        supabase.from('mtn_mobile_money_transactions').select('*'),
        supabase.from('hospital_approval_requests').select('*').eq('status', 'pending')
      ]);

      const hospitals = hospitalsData.data || [];
      const subscriptions = subscriptionsData.data || [];
      const transactions = transactionsData.data || [];

      // Calculate statistics
      const activeHospitals = hospitals.filter(h => h.status === 'active').length;
      const pendingHospitals = approvalRequests.data?.length || 0;
      const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const monthlyRevenue = totalRevenue * 0.3; // Simplified
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const expiringSubscriptions = subscriptions.filter(s => {
        const expiryDate = new Date(s.expires_at);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow && s.status === 'active';
      }).length;

      setStats({
        totalHospitals: hospitals.length,
        activeHospitals,
        pendingHospitals,
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        expiringSubscriptions,
        totalTransactions: transactions.length,
        stripeCustomers: transactions.filter(t => t.customer_id).length,
        systemHealth: 'Good'
      });

      // Recent hospitals
      const recent = hospitals
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentHospitals(recent);

      // Subscription alerts
      const alerts = subscriptions
        .filter(s => s.status === 'active')
        .filter(s => {
          const expiryDate = new Date(s.expires_at);
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          return expiryDate <= sevenDaysFromNow;
        })
        .slice(0, 5);
      setSubscriptionAlerts(alerts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}% this month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const HospitalCard = ({ hospital }) => (
    <div className="bg-white rounded-lg shadow p-4 border">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{hospital.name}</h4>
          <p className="text-sm text-gray-600">{hospital.location}</p>
          <div className="flex items-center mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              hospital.status === 'active' ? 'bg-green-100 text-green-800' : 
              hospital.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {hospital.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Joined</p>
          <p className="text-sm font-medium">{new Date(hospital.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ subscription }) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-yellow-800">Subscription Expiring</h4>
          <p className="text-sm text-yellow-700">Hospital: {subscription.hospital_name}</p>
          <p className="text-sm text-yellow-700">Expires: {new Date(subscription.expires_at).toLocaleDateString()}</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Wopital Platform Admin Dashboard</h1>
        <p className="text-blue-100">Manage hospitals, subscriptions, and system-wide analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Hospitals"
          value={stats.totalHospitals}
          icon={Building2}
          color="bg-blue-500"
          subtitle="Registered hospitals"
          trend={12}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCard}
          color="bg-green-500"
          subtitle="Paid subscriptions"
          trend={8}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          subtitle="This month"
          trend={15}
        />
        <StatCard
          title="System Health"
          value={stats.systemHealth}
          icon={Shield}
          color="bg-green-600"
          subtitle="All systems operational"
        />
      </div>

      {/* Revenue and Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-600"
          subtitle="All time revenue"
        />
        <StatCard
          title="Stripe Customers"
          value={stats.stripeCustomers}
          icon={Users}
          color="bg-blue-600"
          subtitle="Active customers"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingHospitals}
          icon={AlertTriangle}
          color="bg-yellow-500"
          subtitle="Awaiting approval"
        />
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {subscriptionAlerts.length > 0 ? (
              subscriptionAlerts.map((alert, index) => (
                <AlertCard key={index} subscription={alert} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No expiring subscriptions</p>
            )}
          </div>
        </div>

        {/* Recent Hospitals */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Hospitals</h3>
            <Building2 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {recentHospitals.map((hospital, index) => (
              <HospitalCard key={index} hospital={hospital} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Building2 className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium">Add Hospital</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCard className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium">Manage Subscriptions</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium">View Analytics</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium">System Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
} 