<template>
  <div>
    <Head title="Quản lý Phân quyền" />
    <a-typography-title :level="2" style="margin-bottom: 24px;">Quản lý Phân quyền</a-typography-title>
    
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="Danh sách Roles" :bordered="false">
          <a-list :data-source="roles" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <strong>{{ item.name }}</strong>
                  </template>
                  <template #description>
                    <div>{{ item.description || 'Không có mô tả' }}</div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      
      <a-col :span="12">
        <a-card title="Danh sách Admins" :bordered="false">
          <a-list :data-source="admins" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <strong>{{ item.name }}</strong>
                    <a-tag v-if="item.super_admin" color="red" style="margin-left: 8px;">
                      Super Admin
                    </a-tag>
                  </template>
                  <template #description>
                    <div>{{ item.email }}</div>
                    <div style="margin-top: 8px;">
                      <a-tag v-for="role in item.roles" :key="role" style="margin-right: 4px;">
                        {{ role }}
                      </a-tag>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { Head } from '@inertiajs/vue3'
import AdminLayoutAntd from '@/Shared/AdminLayoutAntd.vue'

defineOptions({
  layout: AdminLayoutAntd,
})

const props = defineProps({
  roles: Array,
  admins: Array,
  admin: Object,
})
</script>

