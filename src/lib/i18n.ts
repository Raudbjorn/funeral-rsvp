// Internationalization support for Icelandic and English

export type Language = 'is' | 'en'

export interface Translations {
  // Header
  funeral: string
  venue: string
  venueWebsite: string
  addToCalendar: string
  
  // Navigation
  rsvp: string
  carpool: string
  photos: string
  
  // RSVP Form
  rsvpTitle: string
  name: string
  email: string
  emailOptional: string
  willYouAttend: string
  yesAttend: string
  noAttend: string
  guestCount: string
  guestCountHelp: string
  message: string
  messageOptional: string
  messagePlaceholder: string
  submitRsvp: string
  submitting: string
  thankYou: string
  rsvpRecorded: string
  submitAnother: string
  
  // Carpool Form
  carpoolTitle: string
  canDrive: string
  needRide: string
  phone: string
  phoneOptional: string
  departureLocation: string
  departureLocationPlaceholder: string
  departureTime: string
  departureTimePlaceholder: string
  availableSeats: string
  registerDriver: string
  pickupLocation: string
  pickupLocationPlaceholder: string
  preferredDriver: string
  anyDriver: string
  requestRide: string
  availableDrivers: string
  hideRoute: string
  viewRoute: string
  routeFrom: string
  
  // Photos
  photosTitle: string
  sharePhoto: string
  yourName: string
  caption: string
  captionOptional: string
  captionPlaceholder: string
  photo: string
  uploading: string
  noPhotos: string
  beFirst: string
  sharedBy: string
  
  // Calendar
  googleCalendar: string
  outlookCalendar: string
  downloadIcs: string
  
  // General
  required: string
  optional: string
  from: string
  time: string
  seats: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    funeral: 'Funeral',
    venue: 'Fríkirkjan í Hafnarfirði',
    venueWebsite: 'Visit Church Website',
    addToCalendar: 'Add to Calendar',
    
    // Navigation
    rsvp: 'RSVP',
    carpool: 'Carpool',
    photos: 'Photos',
    
    // RSVP Form
    rsvpTitle: 'RSVP',
    name: 'Name',
    email: 'Email',
    emailOptional: 'Email (optional)',
    willYouAttend: 'Will you be attending?',
    yesAttend: 'Yes, I will attend',
    noAttend: 'No, I cannot attend',
    guestCount: 'Number of guests (including yourself)',
    guestCountHelp: 'Including yourself',
    message: 'Message',
    messageOptional: 'Message (optional)',
    messagePlaceholder: 'Share a memory or leave a message...',
    submitRsvp: 'Submit RSVP',
    submitting: 'Submitting...',
    thankYou: 'Thank you for responding!',
    rsvpRecorded: 'Your RSVP has been recorded.',
    submitAnother: 'Submit another response',
    
    // Carpool Form
    carpoolTitle: 'Carpool Coordination',
    canDrive: 'I can drive',
    needRide: 'I need a ride',
    phone: 'Phone',
    phoneOptional: 'Phone (optional)',
    departureLocation: 'Departure Location',
    departureLocationPlaceholder: 'e.g., Reykjavik downtown, Kópavogur, etc.',
    departureTime: 'Departure Time',
    departureTimePlaceholder: 'e.g., 2:00 PM',
    availableSeats: 'Available Seats',
    registerDriver: 'Register as Driver',
    pickupLocation: 'Pickup Location',
    pickupLocationPlaceholder: 'e.g., Reykjavik downtown, Kópavogur, etc.',
    preferredDriver: 'Preferred Driver (optional)',
    anyDriver: 'Any available driver',
    requestRide: 'Request Ride',
    availableDrivers: 'Available Drivers',
    hideRoute: 'Hide Route',
    viewRoute: 'View Route',
    routeFrom: 'Route from',
    
    // Photos
    photosTitle: 'Photo Memories',
    sharePhoto: 'Share a Photo',
    yourName: 'Your Name',
    caption: 'Caption',
    captionOptional: 'Caption (optional)',
    captionPlaceholder: 'Describe the memory...',
    photo: 'Photo',
    uploading: 'Uploading...',
    noPhotos: 'No photos have been shared yet.',
    beFirst: 'Be the first to share a memory!',
    sharedBy: 'Shared by',
    
    // Calendar
    googleCalendar: 'Google Calendar',
    outlookCalendar: 'Outlook Calendar',
    downloadIcs: 'Download (.ics)',
    
    // General
    required: '*',
    optional: '(optional)',
    from: 'From:',
    time: 'Time:',
    seats: 'Seats:'
  },
  
  is: {
    // Header
    funeral: 'Jarðarför',
    venue: 'Fríkirkjan í Hafnarfirði',
    venueWebsite: 'Fara á vefsíðu kirkjunnar',
    addToCalendar: 'Bæta í dagatal',
    
    // Navigation
    rsvp: 'Staðfesting',
    carpool: 'Samgöngur',
    photos: 'Myndir',
    
    // RSVP Form
    rsvpTitle: 'Staðfesting þátttöku',
    name: 'Nafn',
    email: 'Netfang',
    emailOptional: 'Netfang (valfrjálst)',
    willYouAttend: 'Muntu mæta?',
    yesAttend: 'Já, ég mun mæta',
    noAttend: 'Nei, ég get ekki mætt',
    guestCount: 'Fjöldi gesta (þig meðtalinn)',
    guestCountHelp: 'Þig meðtalinn',
    message: 'Skilaboð',
    messageOptional: 'Skilaboð (valfrjálst)',
    messagePlaceholder: 'Deildu minning eða skildu eftir skilaboð...',
    submitRsvp: 'Senda staðfestingu',
    submitting: 'Sendi...',
    thankYou: 'Takk fyrir að svara!',
    rsvpRecorded: 'Staðfesting þín hefur verið skráð.',
    submitAnother: 'Senda annað svar',
    
    // Carpool Form
    carpoolTitle: 'Samgöngusamræming',
    canDrive: 'Ég get keyrt',
    needRide: 'Ég þarf far',
    phone: 'Sími',
    phoneOptional: 'Sími (valfrjálst)',
    departureLocation: 'Brottfararstaður',
    departureLocationPlaceholder: 't.d., Reykjavík miðborg, Kópavogur, o.s.frv.',
    departureTime: 'Brottfarartími',
    departureTimePlaceholder: 't.d., 14:00',
    availableSeats: 'Laus sæti',
    registerDriver: 'Skrá sem ökumaður',
    pickupLocation: 'Afhendingarstaður',
    pickupLocationPlaceholder: 't.d., Reykjavík miðborg, Kópavogur, o.s.frv.',
    preferredDriver: 'Valinn ökumaður (valfrjálst)',
    anyDriver: 'Hvað sem er tiltækur ökumaður',
    requestRide: 'Biðja um far',
    availableDrivers: 'Tiltækir ökumenn',
    hideRoute: 'Fela leið',
    viewRoute: 'Skoða leið',
    routeFrom: 'Leið frá',
    
    // Photos
    photosTitle: 'Ljósmyndir í minningu',
    sharePhoto: 'Deila mynd',
    yourName: 'Þitt nafn',
    caption: 'Lýsing',
    captionOptional: 'Lýsing (valfrjálst)',
    captionPlaceholder: 'Lýstu minningunni...',
    photo: 'Mynd',
    uploading: 'Hleð upp...',
    noPhotos: 'Engar myndir hafa verið deildar ennþá.',
    beFirst: 'Vertu fyrstur til að deila minningu!',
    sharedBy: 'Deilt af',
    
    // Calendar
    googleCalendar: 'Google dagatal',
    outlookCalendar: 'Outlook dagatal',
    downloadIcs: 'Hlaða niður (.ics)',
    
    // General
    required: '*',
    optional: '(valfrjálst)',
    from: 'Frá:',
    time: 'Tími:',
    seats: 'Sæti:'
  }
}

export function useTranslation(language: Language) {
  return translations[language]
}