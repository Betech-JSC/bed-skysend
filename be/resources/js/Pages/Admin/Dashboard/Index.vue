<template>
  <div>
    <Head title="Admin Dashboard" />
    <a-typography-title :level="2" style="margin-bottom: 24px;">Dashboard</a-typography-title>
    
    <!-- Statistics Cards -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <!-- Users Stats -->
      <a-col :xs="24" :sm="12" :md="8">
        <a-card title="Người dùng" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="Tổng số" :value="usersStats.total" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Sender" :value="usersStats.senders" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Customer" :value="usersStats.customers" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Đã khóa" :value="usersStats.banned" :value-style="{ color: '#cf1322' }" />
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- Flights Stats -->
      <a-col :xs="24" :sm="12" :md="8">
        <a-card title="Chuyến bay" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="Tổng số" :value="flightsStats.total" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Đã xác thực" :value="flightsStats.verified" :value-style="{ color: '#3f8600' }" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Chờ xác thực" :value="flightsStats.pending" :value-style="{ color: '#faad14' }" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Có đơn hàng" :value="flightsStats.with_orders" />
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- Orders Stats -->
      <a-col :xs="24" :sm="12" :md="8">
        <a-card title="Đơn hàng" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="Tổng số" :value="ordersStats.total" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Hoàn thành" :value="ordersStats.completed" :value-style="{ color: '#3f8600' }" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Đang xử lý" :value="ordersStats.in_transit" :value-style="{ color: '#faad14' }" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Doanh thu" :value="formatCurrency(ordersStats.total_revenue)" :value-style="{ color: '#3f8600' }" />
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts Section -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <!-- Orders Chart -->
      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê Đơn hàng (30 ngày)" :bordered="false">
          <div style="height: 300px;">
            <Line :data="ordersChartData" :options="chartOptions" />
          </div>
        </a-card>
      </a-col>

      <!-- Requests Chart -->
      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê Yêu cầu (30 ngày)" :bordered="false">
          <div style="height: 300px;">
            <Line :data="requestsChartData" :options="chartOptions" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-bottom: 24px;">
      <!-- Flights Chart -->
      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê Chuyến bay (30 ngày)" :bordered="false">
          <div style="height: 300px;">
            <Line :data="flightsChartData" :options="chartOptions" />
          </div>
        </a-card>
      </a-col>

      <!-- Revenue Chart -->
      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê Doanh thu (30 ngày)" :bordered="false">
          <div style="height: 300px;">
            <Bar :data="revenueChartData" :options="revenueChartOptions" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Pie Charts Section -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <!-- Orders Status Pie Chart -->
      <a-col :xs="24" :lg="8">
        <a-card title="Phân bố Đơn hàng theo Trạng thái" :bordered="false">
          <div style="height: 300px;">
            <Doughnut :data="ordersPieChartData" :options="pieChartOptions" />
          </div>
        </a-card>
      </a-col>

      <!-- Requests Status Pie Chart -->
      <a-col :xs="24" :lg="8">
        <a-card title="Phân bố Yêu cầu theo Trạng thái" :bordered="false">
          <div style="height: 300px;">
            <Doughnut :data="requestsPieChartData" :options="pieChartOptions" />
          </div>
        </a-card>
      </a-col>

      <!-- Flights Status Pie Chart -->
      <a-col :xs="24" :lg="8">
        <a-card title="Phân bố Chuyến bay theo Trạng thái" :bordered="false">
          <div style="height: 300px;">
            <Doughnut :data="flightsPieChartData" :options="pieChartOptions" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Comparison Bar Chart -->
    <a-row :gutter="16" style="margin-bottom: 24px;">
      <a-col :xs="24">
        <a-card title="So sánh Tổng quan" :bordered="false">
          <div style="height: 400px;">
            <Bar :data="comparisonChartData" :options="comparisonChartOptions" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Recent Orders -->
    <a-card title="Đơn hàng gần đây" :bordered="false">
      <a-table
        :columns="columns"
        :data-source="recentOrders"
        :pagination="false"
        :row-key="record => record.id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'tracking_code'">
            <Link :href="`/admin/orders/${record.id}`" style="color: #1890ff;">
              {{ record.tracking_code }}
            </Link>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'reward'">
            {{ formatCurrency(record.reward) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { Head, Link } from '@inertiajs/vue3'
import { computed } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import AdminLayoutAntd from '@/Shared/AdminLayoutAntd.vue'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

defineOptions({
  layout: AdminLayoutAntd,
})

const props = defineProps({
  usersStats: Object,
  flightsStats: Object,
  ordersStats: Object,
  recentOrders: Array,
  chartData: Object,
  pieChartData: Object,
  comparisonData: Object,
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
}

// Revenue chart options
const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(context.parsed.y)
        }
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact',
          }).format(value)
        }
      },
    },
  },
}

// Orders chart data
const ordersChartData = computed(() => ({
  labels: props.chartData?.labels || [],
  datasets: [
    {
      label: 'Đơn hàng',
      data: props.chartData?.orders || [],
      borderColor: 'rgb(37, 99, 235)',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

// Requests chart data
const requestsChartData = computed(() => ({
  labels: props.chartData?.labels || [],
  datasets: [
    {
      label: 'Yêu cầu',
      data: props.chartData?.requests || [],
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

// Flights chart data
const flightsChartData = computed(() => ({
  labels: props.chartData?.labels || [],
  datasets: [
    {
      label: 'Chuyến bay',
      data: props.chartData?.flights || [],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

// Revenue chart data
const revenueChartData = computed(() => ({
  labels: props.chartData?.labels || [],
  datasets: [
    {
      label: 'Doanh thu (VND)',
      data: props.chartData?.revenue || [],
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 1,
    },
  ],
}))

// Pie chart options
const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        }
      }
    },
  },
}

// Pie chart colors
const pieColors = [
  'rgba(37, 99, 235, 0.8)',   // Blue
  'rgba(16, 185, 129, 0.8)',  // Green
  'rgba(245, 158, 11, 0.8)',  // Orange
  'rgba(239, 68, 68, 0.8)',   // Red
  'rgba(139, 92, 246, 0.8)',  // Purple
  'rgba(236, 72, 153, 0.8)',  // Pink
  'rgba(59, 130, 246, 0.8)',  // Light Blue
  'rgba(34, 197, 94, 0.8)',   // Light Green
]

// Orders pie chart data
const ordersPieChartData = computed(() => ({
  labels: props.pieChartData?.orders?.labels || [],
  datasets: [
    {
      data: props.pieChartData?.orders?.data || [],
      backgroundColor: pieColors.slice(0, props.pieChartData?.orders?.data?.length || 0),
      borderColor: '#fff',
      borderWidth: 2,
    },
  ],
}))

// Requests pie chart data
const requestsPieChartData = computed(() => ({
  labels: props.pieChartData?.requests?.labels || [],
  datasets: [
    {
      data: props.pieChartData?.requests?.data || [],
      backgroundColor: pieColors.slice(0, props.pieChartData?.requests?.data?.length || 0),
      borderColor: '#fff',
      borderWidth: 2,
    },
  ],
}))

// Flights pie chart data
const flightsPieChartData = computed(() => ({
  labels: props.pieChartData?.flights?.labels || [],
  datasets: [
    {
      data: props.pieChartData?.flights?.data || [],
      backgroundColor: pieColors.slice(0, props.pieChartData?.flights?.data?.length || 0),
      borderColor: '#fff',
      borderWidth: 2,
    },
  ],
}))

// Comparison chart options
const comparisonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
}

// Comparison chart data
const comparisonChartData = computed(() => ({
  labels: props.comparisonData?.labels || [],
  datasets: [
    {
      label: 'Tổng số',
      data: props.comparisonData?.total || [],
      backgroundColor: 'rgba(37, 99, 235, 0.6)',
      borderColor: 'rgb(37, 99, 235)',
      borderWidth: 1,
    },
    {
      label: 'Hoàn thành',
      data: props.comparisonData?.completed || [],
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1,
    },
    {
      label: 'Đang xử lý',
      data: props.comparisonData?.pending || [],
      backgroundColor: 'rgba(245, 158, 11, 0.6)',
      borderColor: 'rgb(245, 158, 11)',
      borderWidth: 1,
    },
  ],
}))

const columns = [
  {
    title: 'Mã đơn',
    dataIndex: 'tracking_code',
    key: 'tracking_code',
  },
  {
    title: 'Người gửi',
    dataIndex: 'sender_name',
    key: 'sender_name',
  },
  {
    title: 'Hành khách',
    dataIndex: 'customer_name',
    key: 'customer_name',
  },
  {
    title: 'Trạng thái',
    key: 'status',
  },
  {
    title: 'Phần thưởng',
    key: 'reward',
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'created_at',
    key: 'created_at',
  },
]

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0)
}

const getStatusLabel = (status) => {
  const labels = {
    'confirmed': 'Đã xác nhận',
    'picked_up': 'Đã lấy hàng',
    'in_transit': 'Đang vận chuyển',
    'arrived': 'Đã đến nơi',
    'delivered': 'Đã giao hàng',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
  }
  return labels[status] || status
}

const getStatusColor = (status) => {
  const colors = {
    'confirmed': 'blue',
    'picked_up': 'purple',
    'in_transit': 'orange',
    'arrived': 'cyan',
    'delivered': 'green',
    'completed': 'success',
    'cancelled': 'error',
  }
  return colors[status] || 'default'
}
</script>
