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

function buildLocalDateOptions() {
  const parts = getTimeZoneDateParts();
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const tomorrow = addDaysToDateString(today, 1);
  const dayAfterTomorrow = addDaysToDateString(today, 2);

  return [
    { label: "Today", date: today, displayDate: formatDateOption(today) },
    { label: "Tomorrow", date: tomorrow, displayDate: formatDateOption(tomorrow) },
    {
      label: "Day After Tomorrow",
      date: dayAfterTomorrow,
      displayDate: formatDateOption(dayAfterTomorrow),
    },
  ];
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
    text: `Counseling Session with ${counsellor.name}`,
    dates: `${formatCalendarDate(startUtc)}/${formatCalendarDate(endUtc)}`,
    details: `Counsellor: ${counsellor.name}, ${counsellor.title}\nJoin Meeting: ${booking.meetLink}\nMeeting code: ${booking.meetingCode}`,
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
      const slots = response.data?.slots || [];
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
      const response = await requestCounsellingApi("get", "/slots");
      const dates = response.data?.dates?.length
        ? response.data.dates
        : buildLocalDateOptions();
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

  const selectedDateOption = useMemo(
    () => slotDates.find((dateOption) => dateOption.date === formData.date) || slotDates[0],
    [formData.date, slotDates]
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
    setDateMenuOpen(false);
    loadSlotsForDate(date);
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
      setFormError(getErrorMessage(error, "Unable to book counselling session. Please try again."));
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
            AI Counselling
          </Link>
        </nav>

        <aside className={styles.sidebar}>
          <Link to="/" aria-label="Open UrBridgeAI landing page">
            <img src={logo} alt="UrBridge.ai" className={styles.logo} />
          </Link>
          <div>
            <span className={styles.sidebarLabel}>AI Counselling</span>
            <h1>Book your counseling session</h1>
          </div>

          <section className={styles.profileCard} aria-label="Counsellor profile">
            <div className={styles.avatar}>{selectedCounsellor.initials}</div>
            <div>
              <h2>{selectedCounsellor.name}</h2>
              <p className={styles.profileTitle}>{selectedCounsellor.title}</p>
              <p className={styles.profileBio}>
                {selectedCounsellor.experience} helping professionals find their right career path using AI
              </p>
            </div>
          </section>

          <dl className={styles.sessionInfo}>
            <div>
              <dt>Format</dt>
              <dd>Google Meet (60 mins)</dd>
            </div>
            <div>
              <dt>Response</dt>
              <dd>Instant confirmation</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>English</dd>
            </div>
          </dl>

          <section className={styles.expectations}>
            <h2>What to expect</h2>
            <ol>
              <li>Book your preferred slot</li>
              <li>Get instant Meet link on email</li>
              <li>Join session with {selectedCounsellor.name}</li>
              <li>Get personalized career guidance</li>
            </ol>
          </section>

          <div className={styles.stats}>
            <div>
              <strong>100+</strong>
              <span>Users</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>Rating</span>
            </div>
            <div>
              <strong>Instant</strong>
              <span>Access</span>
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
                  <span>Counsellor</span>
                  <strong>{confirmation.counsellorName || selectedCounsellor.name}, {confirmation.counsellorTitle || selectedCounsellor.title}</strong>
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
                <a
                  href={getBookingMeetLink(confirmation)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.primaryAction}
                >
                  Join Meeting
                </a>
              </div>

              <button
                type="button"
                className={styles.copyBox}
                onClick={() => handleCopy(confirmation.meetingCode, "confirmation")}
              >
                <span>Meeting code</span>
                <strong>{confirmation.meetingCode}</strong>
                <em>{copiedCode === "confirmation" ? "Copied" : "Click to copy"}</em>
              </button>
            </section>
          ) : (
            <form className={styles.bookingForm} onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                <span>Book AI-Guided Counselling</span>
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

                <label className={styles.field}>
                  <span>Selected counsellor</span>
                  <input
                    type="text"
                    value={formData.counsellorName}
                    readOnly
                  />
                </label>

                <input type="hidden" value={formData.counsellorEmail} readOnly />

                <label className={styles.field}>
                  <span>Phone number</span>
                  <div className={styles.phoneInput}>
                    <span>+91</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => updateFormField("phone", normalizePhoneDigits(event.target.value))}
                      placeholder="9876543210"
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
                <div className={styles.dateDropdown}>
                  <button
                    type="button"
                    className={styles.dateSelectButton}
                    onClick={() => setDateMenuOpen((isOpen) => !isOpen)}
                    disabled={slotDates.length === 0}
                    aria-haspopup="listbox"
                    aria-expanded={dateMenuOpen}
                  >
                    <span>
                      {selectedDateOption
                        ? `${selectedDateOption.displayDate || formatDateOption(selectedDateOption.date)} (${selectedDateOption.label})`
                        : "Select preferred date"}
                    </span>
                    <strong aria-hidden="true">v</strong>
                  </button>

                  {dateMenuOpen && (
                    <div className={styles.dateMenu} role="listbox">
                      {slotDates.map((dateOption) => (
                        <button
                          key={dateOption.date}
                          type="button"
                          className={`${styles.dateMenuItem}${formData.date === dateOption.date ? ` ${styles.selectedDateItem}` : ""}`}
                          onClick={() => handleDateSelect(dateOption.date)}
                          role="option"
                          aria-selected={formData.date === dateOption.date}
                        >
                          <span>{dateOption.displayDate || formatDateOption(dateOption.date)}</span>
                          <strong>{dateOption.label}</strong>
                        </button>
                      ))}
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
                  placeholder={`Tell ${selectedCounsellor.name} what you want guidance on (optional)`}
                />
              </label>

              <button type="submit" className={styles.submitButton} disabled={!canSubmit}>
                {isSubmitting ? "Booking Session..." : "Book Counselling Session"}
              </button>
            </form>
          )}

        </section>
      </main>
    </div>
  );
}
