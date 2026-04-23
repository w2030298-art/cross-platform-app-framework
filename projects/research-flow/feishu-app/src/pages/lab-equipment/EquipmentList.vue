<template>
  <div class="equipment-page">
    <div class="page-header">
      <h2>设备预约</h2>
    </div>

    <div v-if="equipmentList.length" class="equipment-grid">
      <div v-for="eq in equipmentList" :key="eq.id" class="equipment-card card">
        <div class="eq-header">
          <h3>{{ eq.name }}</h3>
          <span :class="getEqStatusClass(eq.status)">{{ EQ_STATUS[eq.status] }}</span>
        </div>
        <div class="eq-meta">
          <span v-if="eq.model">{{ eq.model }}</span>
          <span v-if="eq.location"> · {{ eq.location }}</span>
        </div>
        <p v-if="eq.description" class="eq-desc">{{ eq.description }}</p>

        <div v-if="eq.bookings?.length" class="eq-bookings">
          <h4>近期预约</h4>
          <div v-for="booking in eq.bookings.slice(0, 3)" :key="booking.id" class="booking-item">
            <span class="booking-user">{{ booking.user?.name }}</span>
            <span class="booking-time">{{ formatDateTime(booking.startTime) }} ~ {{ formatDateTime(booking.endTime) }}</span>
            <span :class="getBookingStatusClass(booking.status)">{{ BOOKING_STATUS[booking.status] }}</span>
          </div>
        </div>

        <button class="btn btn-primary btn-sm" @click="openBooking(eq)">预约</button>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">🔧</div>
      <div class="empty-state-text">暂无设备（请联系管理员添加）</div>
    </div>

    <div v-if="bookingModal" class="modal-overlay" @click.self="bookingModal = false">
      <div class="modal card">
        <h3>预约 {{ bookingEquip?.name }}</h3>
        <div class="form-group">
          <label class="form-label">开始时间</label>
          <input v-model="bookingForm.startTime" type="datetime-local" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">结束时间</label>
          <input v-model="bookingForm.endTime" type="datetime-local" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">用途说明</label>
          <textarea v-model="bookingForm.purpose" class="form-textarea" rows="2" placeholder="简述使用目的"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="bookingModal = false">取消</button>
          <button class="btn btn-primary" @click="submitBooking" :disabled="submitting">{{ submitting ? '提交中...' : '提交预约' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import type { Equipment } from '@/services/types';
import dayjs from 'dayjs';

const EQ_STATUS: Record<string, string> = { AVAILABLE: '可用', IN_USE: '使用中', MAINTENANCE: '维护中', RETIRED: '已报废' };
const BOOKING_STATUS: Record<string, string> = { PENDING: '待审批', APPROVED: '已批准', REJECTED: '已拒绝', CANCELLED: '已取消' };

const equipmentList = ref<Equipment[]>([]);

const EQ_STATUS: Record<string, string> = { AVAILABLE: '可用', IN_USE: '使用中', MAINTENANCE: '维护中', RETIRED: '已报废' };
const BOOKING_STATUS: Record<string, string> = { PENDING: '待审批', APPROVED: '已批准', REJECTED: '已拒绝', CANCELLED: '已取消' };

const equipmentList = ref<Equipment[]>([]);
const bookingModal = ref(false);
const bookingEquip = ref<Equipment | null>(null);
const submitting = ref(false);
const bookingForm = ref({ startTime: '', endTime: '', purpose: '' });

async function fetchEquipment() {
  const stored = localStorage.getItem('rf_user');
  const labId = stored ? JSON.parse(stored).labId : '';
  if (!labId) return;
  const { data } = await api.get('/equipment', { params: { labId } });
  equipmentList.value = data;
}

function openBooking(eq: Equipment) {
  bookingEquip.value = eq;
  bookingForm.value = {
    startTime: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    endTime: dayjs().add(1, 'day').add(2, 'hour').format('YYYY-MM-DDTHH:mm'),
    purpose: '',
  };
  bookingModal.value = true;
}

async function submitBooking() {
  if (!bookingEquip.value) return;
  submitting.value = true;
  try {
    await api.post(`/equipment/${bookingEquip.value.id}/book`, {
      equipmentId: bookingEquip.value.id,
      startTime: bookingForm.value.startTime,
      endTime: bookingForm.value.endTime,
      purpose: bookingForm.value.purpose,
    });
    bookingModal.value = false;
    await fetchEquipment();
  } finally {
    submitting.value = false;
  }
}

function getEqStatusClass(status: string) {
  const map: Record<string, string> = { AVAILABLE: 'tag tag-success', IN_USE: 'tag tag-warning', MAINTENANCE: 'tag tag-danger', RETIRED: 'tag' };
  return map[status] || 'tag';
}

function getBookingStatusClass(status: string) {
  const map: Record<string, string> = { PENDING: 'tag tag-warning', APPROVED: 'tag tag-success', REJECTED: 'tag tag-danger', CANCELLED: 'tag' };
  return map[status] || 'tag';
}

function formatDateTime(d: string) {
  return dayjs(d).format('MM-DD HH:mm');
}

onMounted(fetchEquipment);
</script>

<style scoped>
.equipment-page { max-width: 960px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 600; }
.equipment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
.equipment-card { padding: 16px; }
.eq-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.eq-header h3 { font-size: 15px; font-weight: 500; }
.eq-meta { font-size: 13px; color: var(--color-text-3); margin-bottom: 6px; }
.eq-desc { font-size: 13px; color: var(--color-text-2); margin-bottom: 10px; }
.eq-bookings { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border-light); }
.eq-bookings h4 { font-size: 13px; font-weight: 500; margin-bottom: 6px; }
.booking-item { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 4px 0; }
.booking-user { font-weight: 500; }
.booking-time { color: var(--color-text-3); }
.btn-sm { padding: 6px 12px; font-size: 13px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { width: 440px; padding: 24px; }
.modal h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.form-group { margin-bottom: 12px; }
.form-label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: var(--color-text-2); }
.form-input, .form-textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: var(--color-primary); }
.form-textarea { resize: vertical; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
</style>