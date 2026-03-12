 Figma UI Design Prompt for Chrome-Only HVNC System
Copy and paste this entire prompt to Claude to generate a comprehensive Figma design specification:

text
# REQUEST: Complete Figma UI/UX Design System for Chrome-Only HVNC Remote Access Platform

## Project Overview
I need a complete Figma design system for a remote access platform with three interfaces:
1. **Admin Dashboard** - For managing devices, users, shifts, and monitoring
2. **User Portal** - For friends to access remote Chrome browser
3. **Login/Auth Screens** - For both admin and users

## Design Style Requirements
- **Theme:** Dark mode primary (easier on eyes for long monitoring sessions)
- **Style:** Modern, clean, glass-morphism with subtle gradients
- **Colors:** 
  - Primary: Deep blue (#2563eb) for actions
  - Success: Green (#10b981) for online/active
  - Warning: Amber (#f59e0b) for warnings
  - Danger: Red (#ef4444) for offline/errors
  - Background: Dark gray scale (#0f172a → #1e293b)
  - Cards: Semi-transparent with backdrop blur
- **Font:** Inter (sans-serif) for clean readability
- **Icons:** Feather icons or Font Awesome Pro style (consistent set)
- **Animations:** Subtle transitions, loading states, hover effects

---

## SECTION A: LOGIN & AUTHENTICATION SCREENS

### A1. Admin Login Page
Create a sophisticated login page for administrators:
┌─────────────────────────────────────────────────────────────┐
│ │
│ 🔐 HVNC ADMIN PORTAL │
│ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ │ │
│ │ Email: │ │
│ │ [......................................] │ │
│ │ │ │
│ │ Password: │ │
│ │ [......................................] │ │
│ │ │ │
│ │ [✓] Remember me │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ SIGN IN │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ Need 2FA? [Enter Code] │ │
│ │ │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ System Status: ● All systems operational │ │
│ │ Last login: Today at 9:30 AM from 192.168.1.45 │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────┘

text

**Design Elements:**
- Glass-morphism card with backdrop blur
- Subtle gradient border on focus states
- Animated loading state on sign-in button
- 2FA code input (6 digits, separate boxes)
- System status bar at bottom

### A2. User Login Page
Create a simpler, friendly login for remote users (friends):
┌─────────────────────────────────────────────────────────────┐
│ │
│ 🔒 HVNC REMOTE ACCESS │
│ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ │ │
│ │ Email: │ │
│ │ [......................................] │ │
│ │ │ │
│ │ Access Code: │ │
│ │ [........] [........] (8 characters) │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ CONNECT TO REMOTE DESKTOP │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ [📧 Email me a new code] │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Your assigned PC: WORK-PC-01 │ │
│ │ Shift: 9:00 AM - 5:00 PM EST │ │
│ │ Time remaining: 2h 45m │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ [⏰] Shift ends at 5:00 PM │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────┘

text

**Design Elements:**
- Larger, friendly typography
- Access code split into two 4-character fields
- Progress bar showing shift time remaining
- Email icon for code requests
- Subtle animation when code is sent

---

## SECTION B: ADMIN DASHBOARD

### B1. Main Dashboard Overview
Create the main admin dashboard with real-time monitoring:
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🖥️ HVNC ADMIN Admin ▼ 🔔 ⏰ 14:35 👤 You │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ QUICK STATS │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ DEVICES │ │ ONLINE │ │ ACTIVE │ │ TIMERS │ │ │
│ │ │ 12 │ │ 8 │ │ SESSIONS │ │ RUNNING │ │ │
│ │ │ Total │ │ Now │ │ 5 │ │ 3 │ │ │
│ │ │ ▲ +2 today │ │ ● 67% online│ │ ▲ +1 since │ │ ⏱️ 2h avg │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ LIVE DEVICE GRID [View All ▼] │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ WORK-PC-01 │ │ WORK-PC-02 │ │ WORK-PC-03 │ │ WORK-PC-04 │ │ │
│ │ │ ● ONLINE │ │ ○ OFFLINE │ │ ● ONLINE │ │ ● ONLINE │ │ │
│ │ │ John Doe │ │ Sarah M. │ │ Mike R. │ │ Unassigned │ │ │
│ │ │ ⏱️ 2h 15m │ │ ⏸️ Stopped │ │ ⏱️ 4h 30m │ │ ⏱️ 1h 20m │ │ │
│ │ │ Chrome:● │ │ Chrome:○ │ │ Chrome:● │ │ Chrome:● │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ WORK-PC-05 │ │ WORK-PC-06 │ │ WORK-PC-07 │ │ WORK-PC-08 │ │ │
│ │ │ ○ OFFLINE │ │ ● ONLINE │ │ ● ONLINE │ │ ○ OFFLINE │ │ │
│ │ │ Lisa T. │ │ Tom H. │ │ Alex P. │ │ Emma W. │ │ │
│ │ │ Offline │ │ ⏱️ 3h 45m │ │ ⏱️ 2h 10m │ │ Offline │ │ │
│ │ │ 2d ago │ │ Chrome:● │ │ Chrome:● │ │ 5h ago │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ RECENT ACTIVITY FEED │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ 🟢 14:35 WORK-PC-01 Chrome launched by John │ │
│ │ 🔵 14:32 WORK-PC-03 Timer STARTED by Sarah │ │
│ │ 🟡 14:28 WORK-PC-02 Timer STOPPED │ │
│ │ 🟣 14:25 New device registered: WORK-PC-09 │ │
│ │ 🔴 14:20 Access code XK7M9P2R used for WORK-PC-01 (John) │ │
│ │ 🟢 14:15 WORK-PC-04 Heartbeat received │ │
│ │ 🟠 14:10 Shift started: PC-01 assigned to John │ │
│ │ [View All Logs →] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

**Design Elements:**
- Glass-morphism cards with hover effects
- Status indicators with pulsing animations for online
- Progress bars for timer durations
- Color-coded activity feed with icons
- Responsive grid that adapts to screen size

### B2. Device Management Page
┌─────────────────────────────────────────────────────────────────────────────┐
│ ◀ BACK TO DASHBOARD DEVICE MANAGEMENT [+ Add Device]│
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ FILTERS: [All Devices ▼] [All Status ▼] [All Users ▼] [Search]│ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ DEVICE LIST │ │
│ ├─────┬─────────────┬──────────┬──────────┬──────────┬───────────────┤ │
│ │ # │ PC Name │ Status │ Assigned │ Hubstaff │ Last Seen │ │
│ ├─────┼─────────────┼──────────┼──────────┼──────────┼───────────────┤ │
│ │ 1 │ WORK-PC-01 │ ● Online │ John D. │ ⏱️ 2h 15m│ Just now │ │
│ │ 2 │ WORK-PC-02 │ ○ Offline│ Sarah M. │ ⏸️ Stopped│ 2 hours ago │ │
│ │ 3 │ WORK-PC-03 │ ● Online │ Mike R. │ ⏱️ 4h 30m│ 5 min ago │ │
│ │ 4 │ WORK-PC-04 │ ● Online │ — │ ⏱️ 1h 20m│ 10 min ago │ │
│ │ 5 │ WORK-PC-05 │ ○ Offline│ Lisa T. │ ⏸️ Stopped│ 1 day ago │ │
│ └─────┴─────────────┴──────────┴──────────┴──────────┴───────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ DEVICE DETAILS: WORK-PC-01 [Edit] [Delete]│ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │ │
│ │ │ STATUS │ │ ASSIGNMENT │ │ │
│ │ │ ● Online │ │ User: John Doe │ │ │
│ │ │ Last Seen: Now │ │ Email: john@example.com │ │ │
│ │ │ IP: 203.0.113.45 │ │ Shift: 9AM - 5PM EST │ │ │
│ │ │ Local: 192.168.1.100│ │ Today: 5h 15m │ │ │
│ │ │ Uptime: 3d 4h │ │ [Change Assignment] │ │ │
│ │ └─────────────────────┘ └─────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │ │
│ │ │ HUBSTAFF │ │ ACCESS CODES │ │ │
│ │ │ Timer: ● RUNNING │ │ Active: XK7M9P2R │ │ │
│ │ │ Project: Main Work │ │ Expires: 5:00 PM │ │ │
│ │ │ Started: 9:02 AM │ │ Last Used: 9:02 AM (John) │ │ │
│ │ │ Duration: 5h 13m │ │ [Generate New] [Revoke] │ │ │
│ │ │ [STOP] [CHANGE] │ │ │ │ │
│ │ └─────────────────────┘ └─────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ RECENT ACTIVITY │ │ │
│ │ │ 14:35 ● Timer started by John │ │ │
│ │ │ 14:35 ● Access code XK7M9P2R used │ │ │
│ │ │ 09:02 ● Shift started │ │ │
│ │ │ 08:55 ● Device online │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

### B3. User Management Page
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER MANAGEMENT [+ Add User] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ USER LIST │ │
│ ├─────┬─────────────┬────────────┬──────────┬──────────┬─────────────┤ │
│ │ # │ Name │ Email │ Devices │ Status │ Last Active │ │
│ ├─────┼─────────────┼────────────┼──────────┼──────────┼─────────────┤ │
│ │ 1 │ John Doe │ john@ex.com│ PC-01 │ ● Active │ Just now │ │
│ │ 2 │ Sarah Miller│ sarah@ex.co│ PC-02 │ ● Active │ 2 min ago │ │
│ │ 3 │ Mike Ross │ mike@ex.com│ PC-03 │ ○ Inactive│ 2 days ago │ │
│ │ 4 │ Lisa Taylor │ lisa@ex.com│ PC-05 │ ● Active │ 15 min ago │ │
│ └─────┴─────────────┴────────────┴──────────┴──────────┴─────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ USER PROFILE: John Doe [Edit] [Suspend]│ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────┐ ┌─────────────────────────────────────┐ │ │
│ │ │ CONTACT │ │ STATISTICS │ │ │
│ │ │ Email: john@ex.com │ │ Total Hours: 127h │ │ │
│ │ │ Phone: +1234567890 │ │ This Week: 24h │ │ │
│ │ │ Added: Jan 15, 2026│ │ Today: 5h 15m │ │ │
│ │ │ Status: Active │ │ Avg Daily: 6.2h │ │ │
│ │ └─────────────────────┘ └─────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ ASSIGNED DEVICES [Assign New]│ │ │
│ │ ├─────────────┬──────────┬──────────┬─────────────────────────┤ │ │
│ │ │ Device │ Shift │ Last Used│ Actions │ │ │
│ │ ├─────────────┼──────────┼──────────┼─────────────────────────┤ │ │
│ │ │ WORK-PC-01 │ 9AM-5PM │ Today │ [Unassign] [View Logs] │ │ │
│ │ └─────────────┴──────────┴──────────┴─────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

### B4. Shift Scheduling Page (Calendar View)
┌─────────────────────────────────────────────────────────────────────────────┐
│ SHIFT SCHEDULING - March 2026 Month | Week | Day │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────────────────────┐ │ │
│ │ │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │ │ │ │
│ │ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤ │ │ │
│ │ │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │ [Add Shift] │ │ │
│ │ │ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐ │ │ │
│ │ │ │9-5││ │9-5││ │9-5││ │9-5││ │9-1││ │Off││ │Off│ │ │ │
│ │ │ │John││ │John││ │John││ │John││ │John││ │ ││ │ │ │ │ │
│ │ │ │PC01││ │PC01││ │PC01││ │PC01││ │PC01││ │ ││ │ │ │ │ │
│ │ │ └───┘│ └───┘│ └───┘│ └───┘│ └───┘│ └───┘│ └───┘ │ │ │
│ │ │ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐│ ┌───┐ │ │ │
│ │ │ │9-5││ │9-5││ │Off││ │9-5││ │9-5││ │Off││ │Off│ │ │ │
│ │ │ │Sarah││ │Sarah││ │ ││ │Sarah││ │Sarah││ │ ││ │ │ │ │ │
│ │ │ │PC02││ │PC02││ │ ││ │PC02││ │PC02││ │ ││ │ │ │ │ │
│ │ │ └───┘│ └───┘│ └───┘│ └───┘│ └───┘│ └───┘│ └───┘ │ │ │
│ │ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘ │ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ CREATE NEW SHIFT │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │ │
│ │ │ Device: │ │ User: │ │ Recurring: │ │ │
│ │ │ [WORK-PC-01 ▼]│ │ [John Doe ▼]│ │ [✓] Mon [✓] Tue ... │ │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │ │
│ │ │ Start Time: │ │ End Time: │ │ Timezone: │ │ │
│ │ │ [09:00 ▼]│ │ [17:00 ▼]│ │ [EST ▼] │ │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │ │
│ │ [Cancel] [Create Shift] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

### B5. Access Code Management
┌─────────────────────────────────────────────────────────────────────────────┐
│ ACCESS CODE MANAGEMENT [+ Generate] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ACTIVE CODES │ │
│ ├────────────┬──────────┬───────────┬──────────┬──────────┬──────────┤ │
│ │ Code │ Device │ User │ Expires │ Used │ Status │ │
│ ├────────────┼──────────┼───────────┼──────────┼──────────┼──────────┤ │
│ │ XK7M9P2R │ PC-01 │ John │ 5:00 PM │ 1 time │ ● Active │ │
│ │ A4B8C2D1 │ PC-02 │ Sarah │ Expired │ 1 time │ ○ Used │ │
│ │ R5T2Y9K3 │ PC-03 │ Mike │ Tomorrow │ 0 times │ ● Active │ │
│ │ M3N7B5V2 │ PC-04 │ — │ 1 hour │ 0 times │ ● Pending│ │
│ │ Z9X8C7V6 │ PC-05 │ Lisa │ 3 days │ 2 times │ ● Active │ │
│ └────────────┴──────────┴───────────┴──────────┴──────────┴──────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ GENERATE NEW CODE │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐ │ │
│ │ │ Device: │ │ User: │ │ Expires: │ │ │
│ │ │ [WORK-PC-01 ▼]│ │ [John Doe ▼]│ │ [End of shift ▼] │ │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────────┘ │ │
│ │ [Cancel] [Generate Code] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ CODE USAGE HISTORY │ │
│ ├───────────────────┬──────────┬──────────┬───────────┬──────────────┤ │
│ │ Time │ Code │ Device │ User │ IP Address │ │
│ ├───────────────────┼──────────┼──────────┼───────────┼──────────────┤ │
│ │ Today 9:02 AM │ XK7M9P2R │ PC-01 │ John │ 203.0.113.45 │ │
│ │ Yesterday 2:15 PM │ A4B8C2D1 │ PC-02 │ Sarah │ 198.51.100.78│ │
│ │ Mar 9, 9:00 AM │ R5T2Y9K3 │ PC-03 │ Mike │ 192.0.2.156 │ │
│ └───────────────────┴──────────┴──────────┴───────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

### B6. Activity Logs Page
┌─────────────────────────────────────────────────────────────────────────────┐
│ ACTIVITY LOGS [Export CSV] [🔍]│
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ FILTERS: [All Events ▼] [Last 24h ▼] [All Devices ▼] [Search] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ LOG ENTRIES │ │
│ ├──────┬──────────────────────────────────────────┬──────────┬────────┤ │
│ │ Time │ Event │ User │ Device │ │
│ ├──────┼──────────────────────────────────────────┼──────────┼────────┤ │
│ │14:35 │ ● Chrome launched │ John │ PC-01 │ │
│ │14:35 │ ● Hubstaff timer started │ John │ PC-01 │ │
│ │14:32 │ 🔵 User connected │ Sarah │ PC-02 │ │
│ │14:28 │ 🟡 Hubstaff timer stopped │ System │ PC-02 │ │
│ │14:25 │ 🟣 New device registered │ Auto │ PC-04 │ │
│ │14:20 │ 🔑 Access code generated │ Admin │ PC-03 │ │
│ │14:15 │ ⏰ Shift started │ System │ PC-01 │ │
│ │14:00 │ 👤 Admin logged in │ admin@ │ - │ │
│ │13:45 │ 🔴 Failed access attempt (wrong code) │ Unknown │ PC-02 │ │
│ │13:30 │ 🔄 Chrome navigation: gmail.com │ John │ PC-01 │ │
│ │13:15 │ 📧 Access code emailed │ System │ Sarah │ │
│ │13:00 │ ⚡ Session terminated by admin │ Admin │ PC-03 │ │
│ └──────┴──────────────────────────────────────────┴──────────┴────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ [< Prev] Page 1 of 24 [Next >] │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

---

## SECTION C: USER PORTAL (FRIEND INTERFACE)

### C1. User Dashboard (Connected View)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🖥️ HVNC REMOTE DESKTOP John Doe ▼ ⏰ │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ │ │
│ │ GOOGLE CHROME - HIDDEN SESSION │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ [https://mail.google.com] [🔍] │ │ │
│ │ ├─────────────────────────────────────────────────────────────┤ │ │
│ │ │ │ │ │
│ │ │ GMAIL INBOX │ │ │
│ │ │ │ │ │
│ │ │ ┌─────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ • From: Manager Subject: Project Update │ │ │ │
│ │ │ │ • From: HR Subject: Timesheet Due │ │ │ │
│ │ │ │ • From: Team Lead Subject: Meeting Today │ │ │ │
│ │ │ │ • From: Client Subject: Feedback │ │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │ │
│ │ │ │ │ │
│ │ │ [Compose] [Inbox] [Sent] [Drafts] [More ▼] │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ CONTROL PANEL [Hide Panel ◀] │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ ┌───────────────────┐ ┌───────────────────────────────────────┐ │ │
│ │ │ ⏱️ HUBSTAFF │ │ 🌐 BROWSER CONTROLS │ │ │
│ │ │ │ │ ┌─────────────────────────────────┐ │ │ │
│ │ │ ● RUNNING │ │ │ [←] [→] [↻] [🏠] [⭐] [⋯] │ │ │ │
│ │ │ Project: Main │ │ └─────────────────────────────────┘ │ │ │
│ │ │ 2h 15m today │ │ │ │ │
│ │ │ │ │ URL: │ │ │
│ │ │ [⏸️ STOP] │ │ [mail.google.com................] │ │ │
│ │ │ [🔄 Switch Proj] │ │ [🔍 Go] [⟳ Refresh] │ │ │
│ │ └───────────────────┘ └───────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌───────────────────┐ ┌───────────────────────────────────────┐ │ │
│ │ │ ℹ️ SESSION │ │ ⚡ QUICK ACTIONS │ │ │
│ │ │ PC: WORK-PC-01 │ │ [🔍 New Tab] [📧 Gmail] [📅 Calendar]│ │ │
│ │ │ Since: 9:02 AM │ │ [📁 Drive] [📝 Docs] [💬 Chat] │ │ │
│ │ │ Shift ends: 5:00 │ │ │ │ │
│ │ │ Data: 156 MB │ │ [🔒 Lock Session] │ │ │
│ │ └───────────────────┘ └───────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

text

### C2. User Dashboard (Mobile View - Responsive)
┌─────────────────────────────────┐
│ ☰ HVNC John ▼ │
├─────────────────────────────────┤
│ │
│ ┌───────────────────────────┐ │
│ │ │ │
│ │ CHROME VIEW │ │
│ │ [Reduced quality mode] │ │
│ │ │ │
│ │ Gmail Inbox │ │
│ │ • Manager: Update │ │
│ │ • HR: Timesheet │ │
│ │ • Team: Meeting │ │
│ │ │ │
│ └───────────────────────────┘ │
│ │
│ [Show Controls ▼] │
│ │
│ ┌───────────────────────────┐ │
│ │ ⏱️ RUNNING - 2h 15m │ │
│ │ [⏸️ STOP] [🔄 Project] │ │
│ └───────────────────────────┘ │
│ │
│ ┌───────────────────────────┐ │
│ │ 🌐 [←] [→] [↻] [🏠] │ │
│ │ URL: [mail.google.....] │ │
│ └───────────────────────────┘ │
│ │
│ Connected to WORK-PC-01 │
│ Shift ends 5:00 PM (2h left) │
└─────────────────────────────────┘

text

### C3. User Connection History
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📜 MY SESSIONS John Doe ▼ │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ SUMMARY STATS │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │
│ │ │ TODAY │ │ THIS WEEK │ │ THIS MONTH │ │ AVG DAILY │ │ │
│ │ │ 5h 15m │ │ 24h 30m │ │ 127h 45m │ │ 6.2h │ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ SESSION HISTORY │ │
│ ├──────────┬────────────┬──────────┬──────────┬──────────┬───────────┤ │
│ │ Date │ Start │ End │ Duration │ Timer │ Actions │ │
│ ├──────────┼────────────┼──────────┼──────────┼──────────┼───────────┤ │
│ │ Mar 11 │ 9:02 AM │ Now │ 5h 15m │ ⏱️ Running│ [Details]│ │
│ │ Mar 10 │ 9:05 AM │ 5:02 PM │ 7h 57m │ ✅ Completed│ [View] │ │
│ │ Mar 9 │ 9:00 AM │ 5:03 PM │ 8h 03m │ ✅ Completed│ [View] │ │
│ │ Mar 8 │ 9:10 AM │ 5:00 PM │ 7h 50m │ ✅ Completed│ [View] │ │
│ │ Mar 7 │ 9:00 AM │ 5:05 PM │ 8h 05m │ ✅ Completed│ [View] │ │
│ └──────────┴────────────┴──────────┴──────────┴──────────┴───────────┘ │
│ │
│ [Export as CSV] [1-5 of 24] [►] │
└─────────────────────────────────────────────────────────────────────────────┘

text

---

## SECTION D: MODALS & COMPONENTS

### D1. Generate Access Code Modal
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │ GENERATE ACCESS CODE │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ │ │
│ │ Device: [WORK-PC-01 ▼] │ │
│ │ │ │
│ │ User: [John Doe ▼] │ │
│ │ │ │
│ │ Expiration: │ │
│ │ ○ End of shift (5:00 PM today) │ │
│ │ ○ Custom: [2026-03-12] at [17:00] │ │
│ │ ○ Never expires │ │
│ │ │ │
│ │ Code Type: │ │
│ │ ● One-time use │ │
│ │ ○ Multi-use (max: [__] times) │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ [ Cancel ] [ Generate Code ] │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

text

### D2. New Code Display Modal
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✅ CODE GENERATED │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ │ │
│ │ Your access code for John on WORK-PC-01: │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ XK7M9P2R │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ [📋 Copy] [📧 Email] [📱 SMS] [🖨️ Print]│ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ │ │
│ │ Expires: Today at 5:00 PM (2h 15m from now) │ │
│ │ Type: One-time use │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ [ Done ] │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

text

### D3. Confirmation Modal
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ Confirm Action │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ │ │
│ │ Are you sure you want to stop the timer for │ │
│ │ John on WORK-PC-01? │ │
│ │ │ │
│ │ Current session: 2h 15m │ │
│ │ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ [ Cancel ] [ Yes, Stop Timer ] │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

text

### D4. Toast Notifications
┌─────────────────────────────────────────────────────────────┐
│ ✅ Timer started successfully │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
│ ⚠️ Session expires in 15 minutes │ │
│ └─────────────────────────────────────────────────────┘ │
│ │
│ ❌ Failed to connect: Device offline │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

text

### D5. Loading States
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │ │ │
│ │ ⏳ Connecting to WORK-PC-01... │ │
│ │ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ ███████░░░░░░░░░░░░░░░░░░░░░ │ │ │
│ │ │ 32% │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ │ │
│ │ Establishing secure connection... │ │
│ │ Validating access code... │ │
│ │ Launching Chrome in hidden desktop... │ │
│ │ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

text

---

## SECTION E: DESIGN SYSTEM COMPONENTS

### E1. Color Palette
Primary Colors:

Primary Blue: #2563EB (Buttons, links, active states)

Primary Dark: #1D4ED8 (Hover states)

Primary Light: #3B82F6 (Disabled, backgrounds)

Status Colors:

Success Green: #10B981 (Online, active, running)

Warning Amber: #F59E0B (Warning, paused)

Danger Red: #EF4444 (Offline, error, stopped)

Info Blue: #3B82F6 (Information)

Neutral Colors:

Background Dark: #0F172A (Main background)

Background Card: #1E293B (Card backgrounds)

Border: #334155 (Dividers, borders)

Text Primary: #F8FAFC (Main text)

Text Secondary: #94A3B8 (Secondary text)

Text Muted: #64748B (Disabled, hints)

Glass Effects:

Card Background: rgba(30, 41, 59, 0.7)

Card Border: rgba(255, 255, 255, 0.05)

Backdrop Blur: 12px

text

### E2. Typography
Font Family: Inter (system fallback: -apple-system, BlinkMacSystemFont)

Headings:

H1: 32px / 40px / 700 (Dashboard title)

H2: 24px / 32px / 600 (Section headers)

H3: 20px / 28px / 600 (Card titles)

H4: 18px / 24px / 600 (Sub-section)

Body:

Body Large: 16px / 24px / 400 (Regular text)

Body: 14px / 20px / 400 (UI text)

Body Small: 12px / 16px / 400 (Meta, timestamps)

Monospace: JetBrains Mono (for codes, IP addresses)

Code: 14px / 20px / 400

text

### E3. Component Library

**Buttons:**
Primary Button:

BG: #2563EB, Hover: #1D4ED8, Text: White, Radius: 8px, Padding: 10px 16px

Secondary Button:

BG: transparent, Border: 1px solid #334155, Hover: #1E293B, Text: #F8FAFC

Danger Button:

BG: #EF4444, Hover: #DC2626, Text: White

Icon Button:

Square, 36x36, Hover background, Icon only

text

**Cards:**
Standard Card:

BG: rgba(30, 41, 59, 0.7)

Backdrop Blur: 12px

Border: 1px solid rgba(255, 255, 255, 0.05)

Border Radius: 12px

Padding: 16px

Box Shadow: 0 8px 32px rgba(0, 0, 0, 0.4)

text

**Inputs:**
Text Input:

BG: #0F172A

Border: 1px solid #334155

Focus: Border #2563EB + ring

Radius: 8px

Padding: 10px 12px

Select Dropdown:

Same as input with custom arrow

text

**Tables:**
Header: #0F172A, Text: #94A3B8, Size: 12px uppercase

Row: Hover background #1E293B

Border: 1px solid #334155

text

### E4. Icons & Illustrations

Use consistent icon set (Feather Icons or Font Awesome Pro):
- Dashboard: 📊
- Devices: 💻
- Users: 👥
- Shifts: 📅
- Codes: 🔑
- Logs: 📜
- Settings: ⚙️
- Online: ●
- Offline: ○
- Timer: ⏱️
- Chrome: 🌐
- Stop: ⏸️
- Start: ▶️
- Switch: 🔄
- Edit: ✏️
- Delete: 🗑️
- Add: ➕
- Search: 🔍
- Filter: 🎛️
- Export: 📤
- Copy: 📋
- Email: 📧

---

## DELIVERABLES

Please create a complete Figma design with:

1. **Cover Page** - Project title and overview
2. **Design System Page** - Colors, typography, components
3. **Login Screens** - Admin and user login pages
4. **Admin Dashboard** - Main overview page
5. **Device Management** - List and detail views
6. **User Management** - List and profile views
7. **Shift Scheduling** - Calendar and creation
8. **Access Code Management** - List and generation
9. **Activity Logs** - Log viewer with filters
10. **User Portal** - Connected desktop view
11. **Mobile Views** - Responsive versions
12. **Modals** - All modal dialogs
13. **Loading States** - Progress indicators
14. **Empty States** - No data placeholders
15. **Error States** - Error screens

**Export Format:** Figma community link or downloadable .fig file

---

## ADDITIONAL NOTES

- Design for 1440×900 desktop first, then responsive to mobile
- Include interactive components (hover states, clickable elements)
- Show both light and dark states where appropriate
- Include prototype connections for key flows
- Use auto-layout for easy development handoff
- Name layers clearly for developer reference
- Include spacing and measurement annotations

Thank you!
📋 What This Prompt Will Give You
Section	What Claude Will Generate
A	Complete login screens for both admin and users
B	Full admin dashboard with all management pages
C	User portal interface for remote access
D	All modal dialogs and components
E	Complete design system (colors, typography, components)
Prototype	Interactive flows between screens