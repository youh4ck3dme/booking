(function () {
    'use strict';
    class BookFlowWidget {
        constructor(container) {
            this.container = container;
            this.config = JSON.parse(container.dataset.config || '{}');
            this.state = { step: 0, services: [], employees: [], slots: [], selectedService: null, selectedEmployee: null, selectedDate: null, selectedSlot: null, customerData: {} };
            this.elements = {};
            this.init();
        }

        async init() {
            try {
                this.applyTheme();
                this.cacheElements();
                await this.loadServices();
                this.showContainer();
                this.renderServices();
                this.bindEvents();
            } catch (error) { this.showError(error.message); }
        }

        applyTheme() {
            const theme = this.config.theme || 'auto';
            this.container.dataset.theme = theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
            if (this.config.primaryColor) this.container.style.setProperty('--bf-primary', this.config.primaryColor);
        }

        cacheElements() {
            this.elements = {
                loading: this.container.querySelector('.bookflow-loading'),
                content: this.container.querySelector('.bookflow-container'),
                error: this.container.querySelector('.bookflow-error-state'),
                errorMessage: this.container.querySelector('.bookflow-error-message'),
                servicesList: this.container.querySelector('.bookflow-services-list'),
                employeesList: this.container.querySelector('.bookflow-employees-list'),
                calendar: this.container.querySelector('.bookflow-calendar'),
                timeslots: this.container.querySelector('.bookflow-timeslots'),
                customerForm: this.container.querySelector('.bookflow-customer-form'),
                summary: this.container.querySelector('.bookflow-booking-summary'),
                prevBtn: this.container.querySelector('.bookflow-btn-prev'),
                nextBtn: this.container.querySelector('.bookflow-btn-next'),
                steps: this.container.querySelectorAll('.bookflow-step'),
                panels: this.container.querySelectorAll('.bookflow-panel')
            };
        }

        showContainer() { this.elements.loading.style.display = 'none'; this.elements.content.style.display = 'block'; }
        showError(message) { this.elements.loading.style.display = 'none'; this.elements.content.style.display = 'none'; this.elements.error.style.display = 'block'; this.elements.errorMessage.textContent = message; }

        bindEvents() {
            this.elements.prevBtn.addEventListener('click', () => this.prevStep());
            this.elements.nextBtn.addEventListener('click', () => this.nextStep());
            this.container.querySelector('.bookflow-btn-retry')?.addEventListener('click', () => location.reload());
            this.elements.customerForm?.addEventListener('input', () => this.validateForm());
        }

        async apiRequest(endpoint, options = {}) {
            const response = await fetch(this.config.apiUrl + endpoint, { ...options, headers: { 'X-BookFlow-API-Key': this.config.apiKey, 'Content-Type': 'application/json', ...options.headers } });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'API request failed');
            return data.data;
        }

        async loadServices() { this.state.services = await this.apiRequest('/api/v1/services'); }
        async loadEmployees(serviceId) { this.state.employees = await this.apiRequest(`/api/v1/employees?serviceId=${serviceId}`); }
        async loadSlots(date, serviceId, employeeId) {
            const params = new URLSearchParams({ date, serviceId });
            if (employeeId) params.append('employeeId', employeeId);
            this.state.slots = await this.apiRequest(`/api/v1/slots?${params}`);
        }

        async createBooking() {
            return await this.apiRequest('/api/v1/bookings', {
                method: 'POST', body: JSON.stringify({
                    serviceId: this.state.selectedService.id, employeeId: this.state.selectedEmployee.id, date: this.state.selectedDate,
                    startTime: this.state.selectedSlot.startTime, endTime: this.state.selectedSlot.endTime, ...this.state.customerData
                })
            });
        }

        renderServices() {
            this.elements.servicesList.innerHTML = this.state.services.map(s => `<div class="bookflow-service-item" data-id="${s.id}"><div class="service-info"><div class="service-name">${s.name}</div><div class="service-meta">${s.duration} min - €${s.price}</div></div></div>`).join('');
            this.elements.servicesList.querySelectorAll('.bookflow-service-item').forEach(el => el.addEventListener('click', () => this.selectService(el.dataset.id)));
        }

        renderEmployees() {
            this.elements.employeesList.innerHTML = this.state.employees.map(e => `<div class="bookflow-employee-item" data-id="${e.id}">${e.name}</div>`).join('');
            this.elements.employeesList.querySelectorAll('.bookflow-employee-item').forEach(el => el.addEventListener('click', () => this.selectEmployee(el.dataset.id)));
        }

        renderCalendar() {
            const today = new Date(), currentMonth = this.state.calendarMonth || new Date(today.getFullYear(), today.getMonth(), 1);
            const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
            const months = ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'];
            let html = `<div class="calendar-header"><button type="button" class="calendar-prev">←</button><span>${months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}</span><button type="button" class="calendar-next">→</button></div><div class="calendar-grid">`;
            ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'].forEach(d => html += `<div class="calendar-day-header">${d}</div>`);
            for (let i = 0; i < firstDay; i++) html += '<div class="calendar-day disabled"></div>';
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), dateStr = date.toISOString().split('T')[0];
                const isPast = date < new Date(today.setHours(0, 0, 0, 0)), isSelected = dateStr === this.state.selectedDate;
                html += `<div class="calendar-day${isPast ? ' disabled' : ''}${isSelected ? ' selected' : ''}" data-date="${dateStr}">${day}</div>`;
            }
            html += '</div>';
            this.elements.calendar.innerHTML = html;
            this.elements.calendar.querySelector('.calendar-prev')?.addEventListener('click', () => { this.state.calendarMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1); this.renderCalendar(); });
            this.elements.calendar.querySelector('.calendar-next')?.addEventListener('click', () => { this.state.calendarMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1); this.renderCalendar(); });
            this.elements.calendar.querySelectorAll('.calendar-day:not(.disabled)').forEach(el => el.addEventListener('click', () => this.selectDate(el.dataset.date)));
        }

        renderTimeSlots() {
            if (!this.state.slots.length) { this.elements.timeslots.innerHTML = '<p>No available slots</p>'; return; }
            this.elements.timeslots.innerHTML = this.state.slots.map(s => `<div class="timeslot${this.state.selectedSlot?.id === s.id ? ' selected' : ''}" data-id="${s.id}" data-start="${s.startTime}" data-end="${s.endTime}">${s.startTime}</div>`).join('');
            this.elements.timeslots.querySelectorAll('.timeslot').forEach(el => el.addEventListener('click', () => this.selectSlot(el)));
        }

        async selectService(id) { this.state.selectedService = this.state.services.find(s => s.id === id); this.elements.nextBtn.disabled = false; await this.loadEmployees(id); }
        async selectEmployee(id) { this.state.selectedEmployee = this.state.employees.find(e => e.id === id); this.elements.nextBtn.disabled = false; }
        async selectDate(date) { this.state.selectedDate = date; await this.loadSlots(date, this.state.selectedService.id, this.state.selectedEmployee?.id); this.renderTimeSlots(); }
        selectSlot(el) { this.state.selectedSlot = { id: el.dataset.id, startTime: el.dataset.start, endTime: el.dataset.end }; this.elements.nextBtn.disabled = false; }

        validateForm() {
            const form = this.elements.customerForm;
            const name = form.querySelector('[name="customerName"]').value.trim();
            const email = form.querySelector('[name="customerEmail"]').value.trim();
            const phone = form.querySelector('[name="customerPhone"]').value.trim();
            const isValid = name.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.length >= 6;
            this.state.customerData = { customerName: name, customerEmail: email, customerPhone: phone, notes: form.querySelector('[name="notes"]')?.value || '' };
            this.elements.nextBtn.disabled = !isValid;
        }

        async nextStep() {
            if (this.state.step === 3) { await this.createBooking(); this.state.step = 4; this.updateStepUI(); return; }
            this.state.step++;
            this.updateStepUI();
            if (this.state.step === 1) this.renderEmployees();
            if (this.state.step === 2) this.renderCalendar();
            this.elements.nextBtn.disabled = true;
        }

        prevStep() { this.state.step--; this.updateStepUI(); }

        updateStepUI() {
            this.elements.steps.forEach((s, i) => s.classList.toggle('active', i === this.state.step));
            this.elements.panels.forEach((p, i) => p.style.display = i === this.state.step ? 'block' : 'none');
            this.elements.prevBtn.style.display = (this.state.step > 0 && this.state.step < 4) ? 'block' : 'none';
        }
    }

    document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('.bookflow-widget').forEach(c => new BookFlowWidget(c)));
})();
