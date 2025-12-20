<template>
  <div>
    <Head title="Chi tiết Đơn hàng" />
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <a-typography-title :level="2" style="margin: 0;">Chi tiết Đơn hàng</a-typography-title>
      <a-button @click="$inertia.visit('/admin/orders')">Quay lại</a-button>
    </div>

    <a-row :gutter="16">
      <!-- Thông tin đơn hàng -->
      <a-col :xs="24" :md="12">
        <a-card title="Thông tin đơn hàng" :bordered="false">
          <a-form
            :model="statusForm"
            layout="vertical"
            @finish="handleUpdateStatus"
          >
            <a-form-item label="Mã đơn">
              <strong>{{ order.tracking_code }}</strong>
            </a-form-item>
            <a-form-item label="Trạng thái" name="status">
              <a-select v-model:value="statusForm.status">
                <a-select-option value="confirmed">Đã xác nhận</a-select-option>
                <a-select-option value="picked_up">Đã lấy hàng</a-select-option>
                <a-select-option value="in_transit">Đang vận chuyển</a-select-option>
                <a-select-option value="arrived">Đã đến nơi</a-select-option>
                <a-select-option value="delivered">Đã giao hàng</a-select-option>
                <a-select-option value="completed">Hoàn thành</a-select-option>
                <a-select-option value="cancelled">Đã hủy</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="Phần thưởng">
              <strong>{{ formatCurrency(order.reward) }}</strong>
            </a-form-item>
            <a-form-item label="Escrow Status">
              {{ order.escrow_status }}
            </a-form-item>
            <a-form-item label="Ghi chú (Admin)" name="note">
              <a-textarea v-model:value="statusForm.note" :rows="3" />
            </a-form-item>
            <a-form-item
              v-if="statusForm.status === 'cancelled'"
              label="Lý do hủy"
              name="cancel_reason"
              :rules="[{ required: true, message: 'Vui lòng nhập lý do hủy' }]"
            >
              <a-textarea v-model:value="statusForm.cancel_reason" :rows="3" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="statusForm.processing">
                Cập nhật trạng thái
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- Thông tin người dùng -->
      <a-col :xs="24" :md="12">
        <a-card title="Thông tin người dùng" :bordered="false">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="Người gửi">
              <div>
                <strong>{{ order.sender?.name }}</strong>
                <div style="color: #8c8c8c; font-size: 12px;">{{ order.sender?.email }}</div>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="Hành khách">
              <div>
                <strong>{{ order.customer?.name }}</strong>
                <div style="color: #8c8c8c; font-size: 12px;">{{ order.customer?.email }}</div>
              </div>
            </a-descriptions-item>
            <a-descriptions-item v-if="order.flight" label="Chuyến bay">
              <div>
                <strong>{{ order.flight.from_airport }} → {{ order.flight.to_airport }}</strong>
                <div style="color: #8c8c8c; font-size: 12px;">{{ order.flight.flight_date }}</div>
              </div>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <!-- Ảnh đơn hàng -->
    <a-row :gutter="16" style="margin-top: 16px;">
      <!-- Ảnh giao hàng (Pickup) -->
      <a-col :xs="24" :md="12" v-if="getPickupPhotos().length > 0">
        <a-card :title="`Ảnh giao hàng (${getPickupPhotos().length})`" :bordered="false">
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            <div
              v-for="(photo, index) in getPickupPhotos()"
              :key="index"
              style="position: relative; cursor: pointer;"
              @click="openImagePreview(getImageUrl(photo.url || photo))"
            >
              <img
                :src="getImageUrl(photo.url || photo)"
                :alt="`Ảnh giao hàng ${index + 1}`"
                style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #d9d9d9;"
              />
              <div style="margin-top: 4px; color: #8c8c8c; font-size: 11px; text-align: center;">
                {{ formatDateTime(photo.uploaded_at || order.picked_up_at) }}
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Ảnh nhận hàng (Delivery) -->
      <a-col :xs="24" :md="12" v-if="getDeliveryPhotos().length > 0">
        <a-card :title="`Ảnh nhận hàng (${getDeliveryPhotos().length})`" :bordered="false">
          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            <div
              v-for="(photo, index) in getDeliveryPhotos()"
              :key="index"
              style="position: relative; cursor: pointer;"
              @click="openImagePreview(getImageUrl(photo.url || photo))"
            >
              <img
                :src="getImageUrl(photo.url || photo)"
                :alt="`Ảnh nhận hàng ${index + 1}`"
                style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #d9d9d9;"
              />
              <div style="margin-top: 4px; color: #8c8c8c; font-size: 11px; text-align: center;">
                {{ formatDateTime(photo.uploaded_at || order.delivered_at) }}
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Thông báo nếu chưa có ảnh -->
      <a-col :xs="24" v-if="getPickupPhotos().length === 0 && getDeliveryPhotos().length === 0">
        <a-card :bordered="false">
          <a-empty description="Chưa có ảnh được upload" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Modal preview ảnh -->
    <a-modal
      v-model:open="imagePreviewVisible"
      :footer="null"
      :width="800"
      centered
    >
      <img
        :src="previewImageUrl"
        alt="Preview"
        style="width: 100%; height: auto;"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { Head } from '@inertiajs/vue3'
import { useForm } from '@inertiajs/vue3'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import AdminLayoutAntd from '@/Shared/AdminLayoutAntd.vue'

defineOptions({
  layout: AdminLayoutAntd,
})

const props = defineProps({
  order: Object,
})

const statusForm = useForm({
  status: props.order.status,
  note: '',
  cancel_reason: '',
})

const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

const handleUpdateStatus = () => {
  statusForm.put(`/admin/orders/${props.order.id}/status`, {
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công')
    },
    onError: () => {
      message.error('Cập nhật thất bại')
    },
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0)
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getImageUrl = (photoPath) => {
  if (!photoPath) return ''
  // Nếu đã là full URL thì trả về luôn
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath
  }
  // Nếu là relative path, thêm base URL
  if (photoPath.startsWith('/storage/')) {
    return `${window.location.origin}${photoPath}`
  }
  // Nếu là path không có /storage/, thêm vào
  return `${window.location.origin}/storage/${photoPath.replace(/^\/+/, '')}`
}

const openImagePreview = (imageUrl) => {
  previewImageUrl.value = imageUrl
  imagePreviewVisible.value = true
}

const getPickupPhotos = () => {
  if (order.pickup_photos && Array.isArray(order.pickup_photos)) {
    return order.pickup_photos
  }
  if (order.pickup_photo) {
    return [{ url: order.pickup_photo }]
  }
  return []
}

const getDeliveryPhotos = () => {
  if (order.delivery_photos && Array.isArray(order.delivery_photos)) {
    return order.delivery_photos
  }
  if (order.delivery_photo) {
    return [{ url: order.delivery_photo }]
  }
  return []
}
</script>
