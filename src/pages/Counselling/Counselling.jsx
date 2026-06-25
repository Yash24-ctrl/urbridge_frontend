import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/auth-context";
import logo from "../../Icon.png";
import styles from "./Counselling.module.css";
import {
  COUNSELLOR_SELECTION_KEY,
  normalizeCounsellorSelection,
} from "../../data/counsellors";

const DEFAULT_COUNSELLOR = normalizeCounsellorSelection();
const DEFAULT_TIMEZONE = "Asia/Calcutta";
const IST_OFFSET_MINUTES = 330;
const CALENDAR_WINDOW_DAYS = 31;
const COUNSELLING_TIME_SLOTS = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"];

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function isRouteNotFound(error) {
  return error?.response?.status === 404
    || /route not found/i.test(error?.response?.data?.message || error?.message || "");
}

async function requestCounsellingApi(method, path, configOrData, maybeConfig) {
  const prefixes = [
    "/user/counseling",
    "/user/counselling",
    "/auth/counseling",
    "/auth/counselling",
    "/counseling",
    "/counselling",
    "/user",
    "/auth",
  ];
  let lastError = null;

  for (const prefix of prefixes) {
    try {
      if (method === "get") {
        return await API.get(`${prefix}${path}`, configOrData);
      }

      return await API.post(`${prefix}${path}`, configOrData, maybeConfig);
    } catch (error) {
      lastError = error;

      if (!isRouteNotFound(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return "th";
  }

  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

function formatReadableDate(dateString) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  }).format(date);

  return `${weekday}, ${day}${getOrdinalSuffix(day)} ${monthName} ${year}`;
}

function formatDateOption(dateString) {
  if (!dateString) {
    return "";
  }

  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}

function getTimeZoneDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function addDaysToDateString(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + days));

  return [
    nextDate.getUTCFullYear(),
    String(nextDate.getUTCMonth() + 1).padStart(2, "0"),
    String(nextDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getDatePartsFromString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return { year, month, day };
}

function formatWeekday(dateString) {
  const { year, month, day } = getDatePartsFromString(dateString);

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getCalendarStartOffset(dateString) {
  if (!dateString) {
    return 0;
  }

  const { year, month, day } = getDatePartsFromString(dateString);
  const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return (dayIndex + 6) % 7;
}

function formatCalendarMonthTitle(dateString) {
  if (!dateString) {
    return "Select date";
  }

  const { year, month, day } = getDatePartsFromString(dateString);

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function buildCalendarMonthDays(dateString) {
  if (!dateString) {
    return [];
  }

  const { year, month } = getDatePartsFromString(dateString);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const leadingBlanks = Array.from({ length: getCalendarStartOffset(firstDate) }, () => null);
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  });

  return [...leadingBlanks, ...monthDays];
}

function addMonthsToDateString(dateString, monthsToAdd) {
  if (!dateString) {
    return "";
  }

  const { year, month } = getDatePartsFromString(dateString);
  const nextDate = new Date(Date.UTC(year, month - 1 + monthsToAdd, 1));

  return [
    nextDate.getUTCFullYear(),
    String(nextDate.getUTCMonth() + 1).padStart(2, "0"),
    "01",
  ].join("-");
}

function buildLocalDateOptions() {
  const parts = getTimeZoneDateParts();
  const today = `${parts.year}-${parts.month}-${parts.day}`;

  return Array.from({ length: CALENDAR_WINDOW_DAYS }, (_, index) => {
    const date = addDaysToDateString(today, index);
    return buildCalendarDateOption(date, today);
  });
}

function buildCalendarDateOption(date, todayDate) {
  const parts = getTimeZoneDateParts();
  const today = todayDate || `${parts.year}-${parts.month}-${parts.day}`;
  const tomorrow = addDaysToDateString(today, 1);
  const { day } = getDatePartsFromString(date);

  return {
    label: date === today ? "Today" : date === tomorrow ? "Tomorrow" : formatWeekday(date),
    date,
    displayDate: formatDateOption(date),
    day,
    weekday: formatWeekday(date),
  };
}

function createInitialSchedulerState() {
  const dateOptions = buildLocalDateOptions();

  return {
    dateOptions,
    formData: {
      userName: "",
      userEmail: "",
      counsellorName: DEFAULT_COUNSELLOR.name,
      counsellorEmail: DEFAULT_COUNSELLOR.email,
      phone: "",
      timezone: DEFAULT_TIMEZONE,
      date: dateOptions[0]?.date || "",
      timeSlot: "",
      helpWith: "",
    },
  };
}

function parseTimeSlot(timeSlot) {
  const match = String(timeSlot || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

function isSlotPassedForFallback(dateString, timeSlot) {
  const parsedTime = parseTimeSlot(timeSlot);

  if (!dateString || !parsedTime) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const slotStartUtc = Date.UTC(
    year,
    month - 1,
    day,
    parsedTime.hours,
    parsedTime.minutes
  ) - IST_OFFSET_MINUTES * 60 * 1000;

  return slotStartUtc <= Date.now();
}

function buildFallbackSlots(dateString) {
  return COUNSELLING_TIME_SLOTS.map((timeSlot) => ({
    timeSlot,
    status: isSlotPassedForFallback(dateString, timeSlot) ? "passed" : "available",
  }));
}

function formatCalendarDate(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function buildGoogleCalendarUrl(booking, counsellor = DEFAULT_COUNSELLOR) {
  const parsedTime = parseTimeSlot(booking?.timeSlot);

  if (!booking?.date || !parsedTime) {
    return "https://calendar.google.com/calendar/u/0/r";
  }

  const [year, month, day] = booking.date.split("-").map(Number);
  const startUtc = new Date(
    Date.UTC(year, month - 1, day, parsedTime.hours, parsedTime.minutes)
    - IST_OFFSET_MINUTES * 60 * 1000
  );
  const endUtc = new Date(startUtc.getTime() + 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "AI Counselling Session",
    dates: `${formatCalendarDate(startUtc)}/${formatCalendarDate(endUtc)}`,
    details: `Session: AI Counselling\nJoin Meeting: ${booking.meetLink}\nMeeting code: ${booking.meetingCode}`,
    location: booking.meetLink || "Google Meet",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function normalizePhoneDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function getBookingMeetLink(booking) {
  return booking?.meetLink || booking?.googleMeetLink || booking?.google_meet_link || "";
}

function readStoredCounsellorSelection() {
  if (typeof window === "undefined") {
    return DEFAULT_COUNSELLOR;
  }

  try {
    return normalizeCounsellorSelection(
      JSON.parse(window.localStorage.getItem(COUNSELLOR_SELECTION_KEY) || "null")
    );
  } catch {
    return DEFAULT_COUNSELLOR;
  }
}

export default function Counselling() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [selectedCounsellor, setSelectedCounsellor] = useState(() =>
    normalizeCounsellorSelection(location.state?.selectedCounsellor || readStoredCounsellorSelection())
  );
  const [initialSchedulerState] = useState(createInitialSchedulerState);
  const [slotDates, setSlotDates] = useState(initialSchedulerState.dateOptions);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [visibleCalendarDate, setVisibleCalendarDate] = useState(initialSchedulerState.formData.date);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [formData, setFormData] = useState(initialSchedulerState.formData);

  useEffect(() => {
    if (!location.state?.selectedCounsellor) {
      return;
    }

    const normalizedSelection = normalizeCounsellorSelection(location.state.selectedCounsellor);
    setSelectedCounsellor(normalizedSelection);
    window.localStorage.setItem(COUNSELLOR_SELECTION_KEY, JSON.stringify(normalizedSelection));
  }, [location.state]);

  useEffect(() => {
    setFormData((currentForm) => ({
      ...currentForm,
      counsellorName: selectedCounsellor.name,
      counsellorEmail: selectedCounsellor.email,
    }));
  }, [selectedCounsellor]);

  useEffect(() => {
    setFormData((currentForm) => ({
      ...currentForm,
      userName: currentForm.userName || user?.username || "",
      userEmail: currentForm.userEmail || user?.email || "",
    }));
  }, [user]);

  async function loadSlotsForDate(date) {
    if (!date) {
      setSelectedSlots([]);
      return;
    }

    setSlotsLoading(true);
    setFormError("");

    try {
      const response = await requestCounsellingApi("get", "/slots", {
        params: { date: formatDateOption(date) },
      });
      const slots = response.data?.slots?.length ? response.data.slots : buildFallbackSlots(date);
      setSelectedSlots(slots);
      setFormData((currentForm) => {
        const selectedSlotStillAvailable = slots.some(
          (slot) => slot.timeSlot === currentForm.timeSlot && slot.status === "available"
        );

        return {
          ...currentForm,
          timeSlot: selectedSlotStillAvailable ? currentForm.timeSlot : "",
        };
      });
    } catch (error) {
      if (isRouteNotFound(error)) {
        const fallbackSlots = buildFallbackSlots(date);
        setSelectedSlots(fallbackSlots);
        setFormData((currentForm) => {
          const selectedSlotStillAvailable = fallbackSlots.some(
            (slot) => slot.timeSlot === currentForm.timeSlot && slot.status === "available"
          );

          return {
            ...currentForm,
            timeSlot: selectedSlotStillAvailable ? currentForm.timeSlot : "",
          };
        });
        return;
      }

      setFormError(getErrorMessage(error, "Unable to load available slots"));
      setSelectedSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function loadDateOptions() {
    setSlotsLoading(true);
    setFormError("");

    try {
      await requestCounsellingApi("get", "/slots");
      const dates = buildLocalDateOptions();
      const initialDate = dates[0]?.date || "";
      const dateToLoad = dates.some((dateOption) => dateOption.date === formData.date)
        ? formData.date
        : initialDate;

      setSlotDates(dates);
      setFormData((currentForm) => ({
        ...currentForm,
        date: dateToLoad,
      }));

      if (dateToLoad) {
        await loadSlotsForDate(dateToLoad);
      } else {
        setSelectedSlots([]);
        setSlotsLoading(false);
      }
    } catch (error) {
      if (isRouteNotFound(error)) {
        const fallbackDates = buildLocalDateOptions();
        const fallbackDate = fallbackDates.some((dateOption) => dateOption.date === formData.date)
          ? formData.date
          : fallbackDates[0]?.date || "";

        setSlotDates(fallbackDates);
        setFormData((currentForm) => ({
          ...currentForm,
          date: fallbackDate,
          timeSlot: "",
        }));
        setSelectedSlots(fallbackDate ? buildFallbackSlots(fallbackDate) : []);
        setSlotsLoading(false);
        return;
      }

      setFormError(getErrorMessage(error, "Unable to load available dates"));
      const fallbackDates = buildLocalDateOptions();
      const fallbackDate = fallbackDates.some((dateOption) => dateOption.date === formData.date)
        ? formData.date
        : fallbackDates[0]?.date || "";

      setSlotDates(fallbackDates);
      setFormData((currentForm) => ({
        ...currentForm,
        date: fallbackDate,
        timeSlot: "",
      }));
      setSelectedSlots([]);
      setSlotsLoading(false);
    }
  }

  useEffect(() => {
    loadDateOptions();
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToastMessage(""), 4000);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const selectedDateOption = useMemo(() => {
    const existingDateOption = slotDates.find((dateOption) => dateOption.date === formData.date);

    if (existingDateOption) {
      return existingDateOption;
    }

    return formData.date ? buildCalendarDateOption(formData.date, slotDates[0]?.date) : slotDates[0];
  }, [formData.date, slotDates]);
  const dateOptionMap = useMemo(
    () => new Map(slotDates.map((dateOption) => [dateOption.date, dateOption])),
    [slotDates]
  );
  const calendarMonthDays = useMemo(
    () => buildCalendarMonthDays(visibleCalendarDate || selectedDateOption?.date),
    [visibleCalendarDate, selectedDateOption]
  );
  const calendarTitle = useMemo(
    () => formatCalendarMonthTitle(visibleCalendarDate || selectedDateOption?.date),
    [visibleCalendarDate, selectedDateOption]
  );

  const hasAvailableSlots = selectedSlots.some((slot) => slot.status === "available");

  const canSubmit =
    formData.userName.trim()
    && formData.userEmail.trim()
    && formData.phone.length === 10
    && formData.date
    && formData.timeSlot
    && !isSubmitting;

  function updateFormField(field, value) {
    setFormData((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleDateSelect(date) {
    setFormData((currentForm) => ({
      ...currentForm,
      date,
      timeSlot: "",
    }));
    setVisibleCalendarDate(date);
    setDateMenuOpen(false);
    loadSlotsForDate(date);
  }

  function handleCalendarMonthChange(monthsToAdd) {
    setVisibleCalendarDate((currentDate) => addMonthsToDateString(currentDate || selectedDateOption?.date, monthsToAdd));
  }

  function handleSlotSelect(timeSlot) {
    setFormData((currentForm) => ({
      ...currentForm,
      date: currentForm.date || selectedDateOption?.date || "",
      timeSlot,
    }));
  }

  async function handleCopy(text, key) {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(key);
      window.setTimeout(() => setCopiedCode(""), 1600);
    } catch {
      setCopiedCode("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!canSubmit) {
      setFormError("Please select a date and choose an available slot before booking.");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingPayload = {
        date: formData.date,
        timeSlot: formData.timeSlot,
        message: formData.helpWith.trim(),
        userId: user?._id || user?.id || "",
        userName: formData.userName.trim(),
        userEmail: formData.userEmail.trim(),
        counsellorName: formData.counsellorName,
        counsellorEmail: formData.counsellorEmail,
        counsellorTitle: selectedCounsellor.title,
        userPhone: `+91${formData.phone}`,
        timezone: formData.timezone,
        helpWith: formData.helpWith.trim(),
      };

      console.log("Booking payload", bookingPayload);

      const response = await requestCounsellingApi("post", "/book", bookingPayload);

      setConfirmation(
        response.data?.booking
          ? {
            ...response.data.booking,
            counsellorName: formData.counsellorName,
            counsellorEmail: formData.counsellorEmail,
            counsellorTitle: selectedCounsellor.title,
            meetLinkPending: response.data?.meetLinkPending || !response.data.booking.meetLink,
          }
          : null
      );
      setToastMessage(response.data?.message || "Counselling session booked successfully.");
      setFormData((currentForm) => ({
        ...currentForm,
        timeSlot: "",
        helpWith: "",
      }));
      await loadDateOptions();
    } catch (error) {
      const rawMessage = getErrorMessage(error, "Unable to book counselling session. Please try again.");
      const detail = error?.response?.data?.detail || '';
      // Temporarily show full error detail for debugging
      setFormError(detail ? `${rawMessage} — ${detail}` : rawMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      {toastMessage && (
        <div className={styles.toast} role="status">
          {toastMessage}
        </div>
      )}
      <main className={styles.shell}>
        <nav className={styles.navLinks} aria-label="Primary navigation">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/counselling" className={styles.activeNav}>
            Career Guidance
          </Link>
        </nav>

        <section className={styles.hero}>
        <aside className={styles.sidebar}>
          <Link to="/" aria-label="Open UrBridgeAI landing page">
            <img src={logo} alt="UrBridge.ai" className={styles.logo} />
          </Link>
          <div>
            <span className={styles.sidebarLabel}>AI Counselling</span>
            <h1>Book Your Counselling Session</h1>
            <p className={styles.sidebarIntro}>
              Get personalized guidance for your career, resume, and academic growth.
            </p>
          </div>

          <div className={styles.guidanceCards} aria-label="Career guidance information">
            <section className={styles.guidanceCard}>
              <span className={`${styles.guidanceIcon} ${styles.guidanceIconBlue}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M12 12.2a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2Z" />
                  <path d="M4.2 21a7.8 7.8 0 0 1 15.6 0" />
                </svg>
              </span>
              <div>
                <h2>About Counselling</h2>
                <p>AI-powered sessions for career guidance, resume improvement, and academic support.</p>
              </div>
            </section>

            <section className={styles.guidanceCard}>
              <span className={`${styles.guidanceIcon} ${styles.guidanceIconGreen}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M7 3v4M17 3v4M4.5 9h15" />
                  <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 5 5Z" />
                  <path d="m8 14 2.2 2.2L16.5 10" />
                </svg>
              </span>
              <div>
                <h2>How It Works</h2>
                <p>Choose a slot, get a Google Meet link instantly, and join your guided session.</p>
              </div>
            </section>

            <section className={styles.guidanceCard}>
              <span className={`${styles.guidanceIcon} ${styles.guidanceIconPurple}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1-4.4-4.3 6.1-.9L12 3Z" />
                </svg>
              </span>
              <div>
                <h2>Benefits</h2>
                <p>Personalized advice, clear next steps, confidential support, and actionable insights.</p>
              </div>
            </section>

            <section className={styles.guidanceCard}>
              <span className={`${styles.guidanceIcon} ${styles.guidanceIconOrange}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M7 3v4M17 3v4M4.5 9h15" />
                  <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 5 5Z" />
                  <path d="M16 14h4M18 12v4" />
                </svg>
              </span>
              <div>
                <h2>Book a Session</h2>
                <p>Choose your preferred date and time to start your guidance journey.</p>
              </div>
            </section>
          </div>

          <div className={styles.guidanceMeta}>
            <div>
              <span>Duration</span>
              <strong>30 Minutes</strong>
            </div>
            <div>
              <span>Platform</span>
              <strong>Google Meet</strong>
            </div>
            <div>
              <span>Response</span>
              <strong>Instant Confirmation</strong>
            </div>
          </div>
        </aside>

        <section className={styles.content}>
          {confirmation ? (
            <section className={styles.confirmationPanel}>
              <div className={styles.successHeading}>
                <span className={styles.successIcon} aria-hidden="true"></span>
                <h2>Session Booked Successfully!</h2>
              </div>
              <p className={styles.successNote}>
                Your counselling session is booked. You can return to the home page and view it anytime in the Your Sessions section.
              </p>

              <div className={styles.detailsCard}>
                <div>
                  <span>Date</span>
                  <strong>{confirmation.readableDate || formatReadableDate(confirmation.date)}</strong>
                </div>
                <div>
                  <span>Time slot</span>
                  <strong>{confirmation.timeSlot}</strong>
                </div>
                <div>
                  <span>Session</span>
                  <strong>AI Career Counselling</strong>
                </div>
              </div>

              <div className={styles.reminderBox}>
                <p>
                  Your session is scheduled for {confirmation.readableDate || formatReadableDate(confirmation.date)} at {confirmation.timeSlot} IST
                </p>
                <p>Please join 5 minutes before your session time</p>
              </div>

              <div className={styles.confirmActions}>
                <a
                  href={buildGoogleCalendarUrl(confirmation, {
                    ...selectedCounsellor,
                    name: confirmation.counsellorName || selectedCounsellor.name,
                    email: confirmation.counsellorEmail || selectedCounsellor.email,
                    title: confirmation.counsellorTitle || selectedCounsellor.title,
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.secondaryAction}
                >
                  Add to Google Calendar
                </a>
                {getBookingMeetLink(confirmation) ? (
                  <a
                    href={getBookingMeetLink(confirmation)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.primaryAction}
                  >
                    Join Meeting
                  </a>
                ) : null}
              </div>

              {confirmation.meetLinkPending && (
                <div className={styles.reminderBox}>
                  <p>Your meeting link will be shared via email shortly.</p>
                </div>
              )}

              {confirmation.meetingCode ? (
                <button
                  type="button"
                  className={styles.copyBox}
                  onClick={() => handleCopy(confirmation.meetingCode, "confirmation")}
                >
                  <span>Meeting code</span>
                  <strong>{confirmation.meetingCode}</strong>
                  <em>{copiedCode === "confirmation" ? "Copied" : "Click to copy"}</em>
                </button>
              ) : null}
            </section>
          ) : (
            <form className={styles.bookingForm} onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                <span>Book Your Career Guidance</span>
                <h2>Choose your session slot</h2>
              </div>

              {formError && <div className={styles.errorBox}>{formError}</div>}

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Full name</span>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(event) => updateFormField("userName", event.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Email address</span>
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(event) => updateFormField("userEmail", event.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </label>

                <input type="hidden" value={formData.counsellorName} readOnly />
                <input type="hidden" value={formData.counsellorEmail} readOnly />

                <label className={styles.field}>
                  <span>Phone number</span>
                  <div className={styles.phoneInput}>
                    <span>+91</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => updateFormField("phone", normalizePhoneDigits(event.target.value))}
                      placeholder=""
                      inputMode="numeric"
                      required
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span>Timezone</span>
                  <select
                    value={formData.timezone}
                    onChange={(event) => updateFormField("timezone", event.target.value)}
                  >
                    <option value={DEFAULT_TIMEZONE}>Asia/Calcutta</option>
                  </select>
                </label>
              </div>

              <section className={styles.selectorSection}>
                <h3>Preferred date</h3>
                <div className={styles.datePicker}>
                  <button
                    type="button"
                    className={styles.dateSelectButton}
                    onClick={() => setDateMenuOpen((isOpen) => !isOpen)}
                    aria-haspopup="dialog"
                    aria-expanded={dateMenuOpen}
                  >
                    <span>
                      {selectedDateOption
                        ? `${selectedDateOption.displayDate || formatDateOption(selectedDateOption.date)} (${selectedDateOption.label})`
                        : "Select preferred date"}
                    </span>
                    <strong aria-hidden="true">⌄</strong>
                  </button>

                  {dateMenuOpen && (
                    <div className={styles.dateCalendar} role="dialog" aria-label="Choose preferred date">
                      <div className={styles.calendarHeader}>
                        <button type="button" onClick={() => handleCalendarMonthChange(-1)} aria-label="Previous month">
                          ‹
                        </button>
                        <span>{calendarTitle}</span>
                        <button type="button" onClick={() => handleCalendarMonthChange(1)} aria-label="Next month">
                          ›
                        </button>
                      </div>
                      <div className={styles.calendarWeekdays} aria-hidden="true">
                        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                          <span key={`${day}-${index}`}>{day}</span>
                        ))}
                      </div>
                      <div className={styles.calendarGrid}>
                        {calendarMonthDays.map((date, index) => {
                          if (!date) {
                            return <span key={`blank-${index}`} className={styles.calendarBlank} aria-hidden="true" />;
                          }

                          const dateOption = dateOptionMap.get(date) || buildCalendarDateOption(date, slotDates[0]?.date);
                          const isAvailableDate = date >= (slotDates[0]?.date || date);
                          const { day } = getDatePartsFromString(date);

                          return (
                            <button
                              key={date}
                              type="button"
                              className={`${styles.calendarDay}${formData.date === date ? ` ${styles.selectedCalendarDay}` : ""}`}
                              onClick={() => isAvailableDate && handleDateSelect(date)}
                              disabled={!isAvailableDate}
                              aria-pressed={formData.date === date}
                              aria-label={dateOption ? `${dateOption.displayDate || formatDateOption(date)} ${dateOption.label}` : date}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className={styles.selectorSection}>
                <h3>Time slot</h3>
                <div className={styles.slotLegend} aria-label="Slot status legend">
                  <span>
                    <i className={`${styles.legendDot} ${styles.availableDot}`} aria-hidden="true"></i>
                    Available
                  </span>
                  <span>
                    <i className={`${styles.legendDot} ${styles.passedDot}`} aria-hidden="true"></i>
                    Time Passed
                  </span>
                  <span>
                    <i className={`${styles.legendDot} ${styles.fullDot}`} aria-hidden="true"></i>
                    Booked
                  </span>
                </div>
                {slotsLoading ? (
                  <div className={styles.loadingBox}>Loading available slots...</div>
                ) : (
                  <div className={styles.slotGrid}>
                    {selectedSlots.map((slot) => {
                      const timeSlot = slot.timeSlot || slot.time;
                      const isAvailable = slot.status === "available";
                      const isPassed = slot.status === "passed";
                      const isBooked = slot.status === "booked";
                      const statusLabel = isAvailable
                        ? "Available"
                        : isPassed
                          ? "Time Passed"
                          : "Booked";

                      return (
                        <button
                          key={timeSlot}
                          type="button"
                          className={`${styles.slotButton}${formData.timeSlot === timeSlot ? ` ${styles.selected}` : ""}${isAvailable ? ` ${styles.slotAvailable}` : ""}${isPassed ? ` ${styles.slotPassed}` : ""}${isBooked ? ` ${styles.slotFull}` : ""}`}
                          disabled={!isAvailable}
                          onClick={() => handleSlotSelect(timeSlot)}
                        >
                          <span className={styles.slotTime}>{timeSlot}</span>
                          <span className={`${styles.slotStatus}${isAvailable ? ` ${styles.statusAvailable}` : ""}${isPassed ? ` ${styles.statusPassed}` : ""}${isBooked ? ` ${styles.statusFull}` : ""}`}>
                            {statusLabel}
                          </span>
                          {isPassed && (
                            <em className={styles.slotHelper}>Choose this slot on the next available day.</em>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {!slotsLoading && selectedSlots.length > 0 && !hasAvailableSlots && (
                  <div className={styles.noSlotsMessage}>
                    <strong>No slots available for this date.</strong>
                    <span>Please choose another available date.</span>
                  </div>
                )}
              </section>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>What do you want help with?</span>
                <textarea
                  value={formData.helpWith}
                  onChange={(event) => updateFormField("helpWith", event.target.value)}
                  placeholder="Tell us what you want guidance on (optional)"
                />
              </label>

              <button type="submit" className={styles.submitButton} disabled={!canSubmit}>
                {isSubmitting ? "Booking Session..." : "Book Counselling Session"}
              </button>
            </form>
          )}

        </section>
        </section>
      </main>
    </div>
  );
}
