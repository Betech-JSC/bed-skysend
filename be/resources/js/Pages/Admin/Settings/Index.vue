<template>
  <div>
    <Head title="Cấu hình Hệ thống" />
    <a-typography-title :level="2" style="margin-bottom: 24px;">Cấu hình Hệ thống</a-typography-title>
    
    <a-card :bordered="false">
      <a-form :model="form" @finish="handleSubmit" layout="vertical">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane v-for="(group, groupName) in settings" :key="groupName" :tab="getGroupLabel(groupName)">
            <a-row :gutter="16">
              <a-col :span="groupName === 'smtp' ? 24 : 12" v-for="setting in group" :key="setting.id">
                <a-form-item 
                  :label="getSettingLabel(setting.key)" 
                  :name="`settings.${setting.key}`"
                  :rules="getValidationRules(setting)"
                >
                  <!-- SMTP Password - masked input -->
                  <a-input-password
                    v-if="setting.key === 'smtp_password'"
                    v-model:value="form.settings[setting.key]"
                    :placeholder="setting.description"
                  />
                  <!-- Notification Emails - special component -->
                  <div v-else-if="setting.key === 'smtp_notification_emails'">
                    <a-select
                      v-model:value="form.settings[setting.key]"
                      mode="tags"
                      :placeholder="setting.description"
                      style="width: 100%"
                      :token-separators="[',']"
                      @change="handleEmailListChange"
                    >
                    </a-select>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                      {{ setting.description }} (Nhập email và nhấn Enter để thêm)
                    </div>
                  </div>
                  <!-- SMTP Encryption - select -->
                  <a-select
                    v-else-if="setting.key === 'smtp_encryption'"
                    v-model:value="form.settings[setting.key]"
                    :placeholder="setting.description"
                  >
                    <a-select-option value="tls">TLS</a-select-option>
                    <a-select-option value="ssl">SSL</a-select-option>
                    <a-select-option value="">Không mã hóa</a-select-option>
                  </a-select>
                  <!-- String input -->
                  <a-input
                    v-else-if="setting.type === 'string'"
                    v-model:value="form.settings[setting.key]"
                    :placeholder="setting.description"
                    :type="setting.key === 'smtp_password' ? 'password' : 'text'"
                  />
                  <!-- Number input -->
                  <a-input-number
                    v-else-if="setting.type === 'integer' || setting.type === 'float' || setting.type === 'decimal'"
                    v-model:value="form.settings[setting.key]"
                    :placeholder="setting.description"
                    style="width: 100%"
                  />
                  <!-- Boolean switch -->
                  <a-switch
                    v-else-if="setting.type === 'boolean'"
                    v-model:checked="form.settings[setting.key]"
                  />
                  <!-- JSON textarea -->
                  <a-textarea
                    v-else-if="setting.type === 'json'"
                    v-model:value="form.settings[setting.key]"
                    :rows="3"
                    :placeholder="setting.description"
                  />
                  <div v-if="setting.description && setting.key !== 'smtp_notification_emails'" style="font-size: 12px; color: #666; margin-top: 4px;">
                    {{ setting.description }}
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
        
        <a-form-item style="margin-top: 24px;">
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting">
              Lưu cấu hình
            </a-button>
            <a-button @click="resetForm">
              Đặt lại
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AdminLayoutAntd from '@/Shared/AdminLayoutAntd.vue'
import { message } from 'ant-design-vue'

defineOptions({
  layout: AdminLayoutAntd,
})

const props = defineProps({
  settings: Object,
  admin: Object,
})

const activeTab = ref('general')
const submitting = ref(false)

const form = reactive({
  settings: {},
})

onMounted(() => {
  // Initialize form with current settings
  Object.values(props.settings).flat().forEach(setting => {
    if (setting.key === 'smtp_notification_emails') {
      // Parse JSON array for email list
      try {
        const emails = setting.value ? JSON.parse(setting.value) : []
        form.settings[setting.key] = Array.isArray(emails) ? emails : []
      } catch {
        form.settings[setting.key] = []
      }
    } else if (setting.type === 'json') {
      form.settings[setting.key] = setting.value ? JSON.stringify(setting.value) : ''
    } else if (setting.type === 'boolean') {
      form.settings[setting.key] = setting.value === '1' || setting.value === 'true'
    } else {
      form.settings[setting.key] = setting.value || ''
    }
  })
})

const getSettingLabel = (key) => {
  const labels = {
    'smtp_host': 'SMTP Host',
    'smtp_port': 'SMTP Port',
    'smtp_username': 'SMTP Username',
    'smtp_password': 'SMTP Password',
    'smtp_encryption': 'SMTP Encryption',
    'smtp_from_address': 'Email Gửi (From Address)',
    'smtp_from_name': 'Tên Người Gửi (From Name)',
    'smtp_notification_emails': 'Email Nhận Thông Báo',
    'smtp_enabled': 'Bật SMTP từ Cấu hình',
  }
  return labels[key] || key
}

const getValidationRules = (setting) => {
  const rules = []
  
  if (setting.key === 'smtp_from_address' || setting.key === 'smtp_username') {
    rules.push({ type: 'email', message: 'Email không hợp lệ' })
  }
  
  if (setting.key === 'smtp_notification_emails') {
    rules.push({
      validator: (rule, value) => {
        if (!value || value.length === 0) {
          return Promise.resolve()
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const invalidEmails = value.filter(email => !emailRegex.test(email))
        if (invalidEmails.length > 0) {
          return Promise.reject('Có email không hợp lệ: ' + invalidEmails.join(', '))
        }
        return Promise.resolve()
      }
    })
  }
  
  return rules
}

const handleEmailListChange = (value) => {
  // Ensure all emails are valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const validEmails = value.filter(email => emailRegex.test(email))
  form.settings['smtp_notification_emails'] = validEmails
}

const getGroupLabel = (groupName) => {
  const labels = {
    general: 'Chung',
    payment: 'Thanh toán',
    system: 'Hệ thống',
    notification: 'Thông báo',
    smtp: 'SMTP & Email',
    fee: 'Phí',
  }
  return labels[groupName] || groupName
}

const handleSubmit = () => {
  submitting.value = true
  
  // Prepare form data - convert email list to JSON
  const submitData = { ...form }
  if (submitData.settings.smtp_notification_emails) {
    submitData.settings.smtp_notification_emails = JSON.stringify(submitData.settings.smtp_notification_emails)
  }
  
  router.put('/admin/settings', submitData, {
    onSuccess: () => {
      message.success('Đã cập nhật cấu hình thành công')
      submitting.value = false
    },
    onError: () => {
      message.error('Có lỗi xảy ra')
      submitting.value = false
    },
  })
}

const resetForm = () => {
  router.reload({ only: ['settings'] })
}
</script>

