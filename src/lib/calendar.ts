// Calendar integration utilities

export interface CalendarEvent {
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
}

// Format date for calendar links (YYYYMMDDTHHMMSSZ)
function formatDateForCalendar(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// Generate Google Calendar link
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForCalendar(event.startDate)}/${formatDateForCalendar(event.endDate)}`,
    details: event.description,
    location: event.location,
    trp: 'false',
    sprop: 'website'
  })
  
  return `${baseUrl}?${params.toString()}`
}

// Generate Outlook calendar link
export function generateOutlookCalendarLink(event: CalendarEvent): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose'
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    body: event.description,
    location: event.location,
    path: '/calendar/action/compose',
    rru: 'addevent'
  })
  
  return `${baseUrl}?${params.toString()}`
}

// Generate ICS file content for download
export function generateICSContent(event: CalendarEvent): string {
  const now = new Date()
  const formatDate = (date: Date) => formatDateForCalendar(date)
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Memorial Service//EN',
    'BEGIN:VEVENT',
    `UID:${now.getTime()}@memorial-service.com`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
}

// Create and download ICS file
export function downloadICSFile(event: CalendarEvent): void {
  const icsContent = generateICSContent(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'memorial-service.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Default event details for the funeral service
export const MEMORIAL_EVENT: CalendarEvent = {
  title: 'Funeral - Fríkirkjan í Hafnarfirði',
  description: 'Funeral service at Fríkirkjan í Hafnarfirði. Please join us to remember and celebrate their life. Church website: https://www.frikirkja.is/',
  location: 'Fríkirkjan í Hafnarfirði, Linnetsstígur 6, 220 Hafnarfjörður, Iceland',
  startDate: new Date('2025-06-16T13:00:00'), // June 16, 2025 at 1:00 PM
  endDate: new Date('2025-06-16T15:00:00')    // Assuming 2-hour service
}