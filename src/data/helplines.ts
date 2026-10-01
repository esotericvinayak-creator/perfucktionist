// India helplines. All toll-free unless marked.
export type Helpline = { number: string; dial: string; name: string; what: string }

export const helplines: Record<string, Helpline> = {
  emergency: { number: '112', dial: '112', name: 'Emergency', what: 'Police, ambulance, fire — one number, 24×7, all of India' },
  women: { number: '1091', dial: '1091', name: 'Women Helpline (Police)', what: 'Harassment, stalking, threat — straight to police' },
  womenSupport: { number: '181', dial: '181', name: 'Women Helpline', what: 'Counselling, shelter & One Stop Centres (Sakhi)' },
  ncw: { number: '7827 170 170', dial: '7827170170', name: 'National Commission for Women', what: '24×7 helpline for women facing violence' },
  child: { number: '1098', dial: '1098', name: 'Childline', what: 'Under 18 and not safe? Call. Free & 24×7' },
  cyber: { number: '1930', dial: '1930', name: 'Cyber Crime', what: 'Online fraud, sextortion, fake profiles. Or cybercrime.gov.in' },
  mind: { number: '14416', dial: '14416', name: 'Tele-MANAS', what: 'Free mental-health support, 24×7, in 20+ languages' },
}
