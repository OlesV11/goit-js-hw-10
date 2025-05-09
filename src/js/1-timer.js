import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

const addLeadingZero = (value) => String(value).padStart(2, '0');

function convertMs(ms) {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(ms / day);
    const hours = Math.floor((ms % day) / hour);
    const minutes = Math.floor(((ms % day) % hour) / minute);
    const seconds = Math.floor((((ms % day) % hour) % minute) / second);

    return { days, hours, minutes, seconds };
}

const datetimePicker = document.getElementById('datetime-picker');
const startBtn = document.querySelector('[data-start]');
const daysValue = document.querySelector('[data-days]');
daysValue.textContent = addLeadingZero(0);
const hoursValue = document.querySelector('[data-hours]');
hoursValue.textContent = addLeadingZero(0);
const minutesValue = document.querySelector('[data-minutes]');
minutesValue.textContent = addLeadingZero(0);
const secondsValue = document.querySelector('[data-seconds]');
secondsValue.textContent = addLeadingZero(0);

let userSelectedDate = null;
let timerInterval = null;

const saveTimerToLocalStorage = () => {
    localStorage.setItem("timer-state", JSON.stringify({ deadline: userSelectedDate }));
};

const loadTimerFromLocalStorage = () => {
    const savedData = localStorage.getItem("timer-state");
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        userSelectedDate = parsedData.deadline ? new Date(parsedData.deadline) : null;
        if (userSelectedDate) {
            datetimePicker.value = userSelectedDate.toISOString().slice(0, 16);
            if (userSelectedDate > new Date()) {
                startBtn.disabled = false;
                updateTimer();
                startTimer();
            }
        }
    }
};

const options = {
    enableTime: true,
    time_24hr: true,
    defaultDate: new Date(),
    minuteIncrement: 1,
    onClose(selectedDates) {
        const selectedDate = selectedDates[0];
        if (selectedDate <= new Date()) {
            iziToast.error({
                title: 'Error',
                message: 'Please choose a date in the future',
                position: 'topRight'
            });
            startBtn.disabled = true;
            userSelectedDate = null;
            saveTimerToLocalStorage();
        } else {
            userSelectedDate = selectedDate;
            startBtn.disabled = false;
            saveTimerToLocalStorage();
        }
    },
};

flatpickr(datetimePicker, options);

const updateTimer = () => {
    const now = new Date();
    const timeDiff = userSelectedDate - now;

    if (timeDiff <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        daysValue.textContent = addLeadingZero(0);
        hoursValue.textContent = addLeadingZero(0);
        minutesValue.textContent = addLeadingZero(0);
        secondsValue.textContent = addLeadingZero(0);
        datetimePicker.disabled = false;
        startBtn.disabled = true;
        localStorage.removeItem("timer-state");
        return;
    }

    const { days, hours, minutes, seconds } = convertMs(timeDiff);
    daysValue.textContent = addLeadingZero(days);
    hoursValue.textContent = addLeadingZero(hours);
    minutesValue.textContent = addLeadingZero(minutes);
    secondsValue.textContent = addLeadingZero(seconds);
};

const startTimer = () => {
    if (!userSelectedDate || timerInterval) return;

    datetimePicker.disabled = true;
    startBtn.disabled = true;
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
};

startBtn.addEventListener('click', startTimer);
loadTimerFromLocalStorage();
