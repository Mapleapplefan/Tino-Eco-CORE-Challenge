// Initialize the Leaflet map
const defaultCenter = [37.3229978, -122.0321823]; // Cupertino, CA
const defaultZoom = 12;

const map = L.map('map');

// Tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Try to center on user's location, fallback to Cupertino
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 13);
      L.circleMarker([latitude, longitude], { radius: 6, color: '#0e7c7b' })
        .addTo(map)
        .bindPopup('You are here');
    },
    () => {
      map.setView(defaultCenter, defaultZoom);
    },
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 5000 }
  );
} else {
  map.setView(defaultCenter, defaultZoom);
}

// Community Engagement Event Locations (Tasks 19-32)
const eventLocations = [
  // Task 19: Earth Day Events
  {
    name: 'BAYCS Earth Day Event (Task 19)',
    coords: [37.4419, -122.1430], // Bay Area Youth Climate Summit area
    link: '#',
    category: 'Community Engagement',
    task: '19',
    date: 'Earth Day',
    time: 'Various times'
  },
  {
    name: 'Santa Clara Board of Education - Earth Day (Task 19)',
    coords: [37.3541, -121.9552], // Santa Clara County Office of Education
    link: '#',
    category: 'Community Engagement',
    task: '19',
    date: 'Earth Day',
    time: 'Various times'
  },
  {
    name: 'City of Cupertino - Earth Day (Task 19)',
    coords: [37.3229, -122.0322], // Cupertino City Hall
    link: '#',
    category: 'Community Engagement',
    task: '19',
    date: 'Earth Day',
    time: 'Various times'
  },
  {
    name: 'City of San Jose - Earth Day (Task 19)',
    coords: [37.3382, -121.8863], // San Jose City Hall
    link: '#',
    category: 'Community Engagement',
    task: '19',
    date: 'Earth Day',
    time: 'Various times'
  },
  
  // Task 20: Ecosystem Restoration/Maintenance Events
  {
    name: 'Byrne Preserve - Grassroots Ecology (Task 20)',
    coords: [37.365, -122.11], // Los Altos Hills at Byron Preserve
    link: 'https://www.eventbrite.com/e/volunteer-outdoors-in-los-altos-hills-at-byrne-preserve-registration-1278185339759?aff=ebdsoporgprofile',
    category: 'Community Engagement',
    task: '20',
    date: 'April 5th',
    time: '9 AM - 12 PM'
  },
  {
    name: 'Pearson-Arastradero Preserve - Women/Non-binary (Task 20)',
    coords: [37.3971, -122.1233], // Pearson-Arastradero Preserve
    link: 'https://www.eventbrite.com/e/womxn-in-the-weeds-workday-volunteer-at-pearson-arastradero-preserve-registration-1274834096099?aff=ebdsoporgprofile',
    category: 'Community Engagement',
    task: '20',
    date: 'April 12th',
    time: '9 AM - 12 PM'
  },
  {
    name: 'Cherry Springs Pond - Los Gatos (Task 20)',
    coords: [37.2266, -121.9747], // Cherry Springs Pond, Los Gatos
    link: 'https://www.eventbrite.com/e/volunteer-outdoors-in-los-gatos-at-cherry-springs-registration-1274545884049?aff=ebdsoporgprofile',
    category: 'Community Engagement',
    task: '20',
    date: 'April 20th',
    time: '9 AM - 12 PM'
  },
  {
    name: 'Cooley Landing - East Palo Alto (Task 20)',
    coords: [37.4679, -122.1308], // Cooley Landing, East Palo Alto
    link: 'https://www.eventbrite.com/e/volunteer-outdoors-in-east-palo-alto-at-cooley-landing-registration-1274825690959?aff=ebdsoporgprofile',
    category: 'Community Engagement',
    task: '20',
    date: 'April 26th',
    time: '9 AM - 12 PM'
  },
  {
    name: 'San Jose Great American Litter Pickup (Task 20)',
    coords: [37.3382, -121.8863], // San Jose City Hall area
    link: 'https://www.sanjoseca.gov/Home/Components/Calendar/Event/7397/4738?curm=4&cury=2025',
    category: 'Community Engagement',
    task: '20',
    date: '04/19',
    time: '9:00 AM - 11:00 AM'
  },
  {
    name: 'Santa Clara County Creek Cleanup (Task 20)',
    coords: [37.3541, -121.9552], // Santa Clara County area
    link: 'https://parktrust.org/event/national-river-cleanup-day-santa-clara-county/',
    category: 'Community Engagement',
    task: '20',
    date: '5/17',
    time: '9 AM to 12 PM'
  },
  {
    name: 'VTA Cleanup (Task 20)',
    coords: [37.4036, -121.9440], // VTA HQ area
    link: 'https://www.eventbrite.com/e/celebrating-earth-month-2025-volunteer-clean-up-tickets-1278430783889',
    category: 'Community Engagement',
    task: '20',
    date: '4/26',
    time: '9 to 11 AM'
  },
  
  // Task 21: Coastal Clean up Day
  {
    name: 'Coastal Clean up Day (Task 21)',
    coords: [37.5, -122.5], // General Bay Area coast
    link: 'https://cleanacreek.org/events',
    category: 'Community Engagement',
    task: '21',
    date: '9/20',
    time: '9 AM to 12 PM'
  },
  
  // Task 22: Worm Composting (location TBD, using UC extension general area)
  {
    name: 'Worm Composting Workshop (Task 22)',
    coords: [37.4419, -122.1430], // Stanford/Palo Alto area
    link: 'https://surveys.ucanr.edu/survey.cfm?surveynumber=45387',
    category: 'Community Engagement',
    task: '22',
    date: '9/6',
    time: '10 AM to 12 PM'
  },
  
  // Task 23: District 8 Park Activations - Meadowfair Park
  {
    name: 'District 8 Park Activations - Meadowfair Park (Task 23)',
    coords: [37.2608, -121.8547], // Meadowfair Park, San Jose
    link: 'https://www.sanjoseca.gov/your-government/departments-offices/mayor-and-city-council/district-8/upcoming-events',
    category: 'Community Engagement',
    task: '23',
    date: '9/19',
    time: 'Evening (time TBD)'
  },
  
  // Task 24: Night Hike and Flashlight Tour - McClellan Ranch Preserve
  {
    name: 'Night Hike & Flashlight Tour - McClellan Ranch (Task 24)',
    coords: [37.3115, -122.0553], // McClellan Ranch Preserve, Cupertino
    link: 'https://www.cupertino.gov/Parks-Recreation/Events/McClellan-Events/Join-A-Ranger-Night-Hike-and-Flashlight-Tour',
    category: 'Community Engagement',
    task: '24',
    date: '9/19 & 10/17',
    time: '7:30-8:30 PM'
  },
  
  // Task 25: Creek cleanup events (multiple locations)
  {
    name: 'Lake Solano County Park - Demonstration Garden (Task 25)',
    coords: [38.5108, -122.1372], // Lake Solano County Park
    link: 'https://www.cnps.org/event/friends-of-the-lake-solano-park-demonstration-garden',
    category: 'Community Engagement',
    task: '25',
    date: '9/2',
    time: '8:30 - 10:30 AM'
  },
  {
    name: 'Pearson Arastradero Preserve - Biodiversity Day (Task 25)',
    coords: [37.3971, -122.1233], // Pearson Arastradero Preserve, Palo Alto
    link: 'https://www.grassrootsecology.org/event-calendar/2025/09/13/ca-biodiversity-day-volunteer-at-pearson-arastradero-preserve',
    category: 'Community Engagement',
    task: '25',
    date: '9/13',
    time: '8:30-11:30 AM'
  },
  {
    name: 'Russian Ridge - Volunteer Work (Task 25)',
    coords: [37.3097, -122.2097], // Russian Ridge, La Honda
    link: 'https://www.grassrootsecology.org/event-calendar/2024/09/18/volunteer-at-russian-ridge',
    category: 'Community Engagement',
    task: '25',
    date: '9/18',
    time: '9 AM-12 PM'
  },
  {
    name: 'Foothills Nature Preserve - Volunteer Work (Task 25)',
    coords: [37.3615, -122.1364], // Foothills Nature Preserve, Los Altos
    link: 'https://www.grassrootsecology.org/event-calendar/2025/09/22/volunteer-outdoors-foothills-nature-preserve',
    category: 'Community Engagement',
    task: '25',
    date: '9/22',
    time: '9 AM-12 PM'
  },
  {
    name: 'Sunnyvale Baylands Park - Volunteer Work (Task 25)',
    coords: [37.4239, -122.0008], // Sunnyvale Baylands Park
    link: 'https://www.grassrootsecology.org/event-calendar/2025/09/22/volunteer-outdoors-at-sunnyvale-baylands-park',
    category: 'Community Engagement',
    task: '25',
    date: '9/22',
    time: '9:30-11:30 AM'
  },
  {
    name: 'Byrne Preserve - Volunteer Work (Task 25)',
    coords: [37.365, -122.11], // Byrne Preserve, Los Altos Hills
    link: 'https://www.grassrootsecology.org/event-calendar/2025/09/26/volunteer-outside-at-byrne-preserve',
    category: 'Community Engagement',
    task: '25',
    date: '9/26',
    time: '9 AM-12 PM'
  },
  {
    name: 'Mountain View Shoreline - Volunteer Work (Task 25)',
    coords: [37.4043, -122.0748], // Shoreline Park, Mountain View
    link: 'https://www.grassrootsecology.org/event-calendar/2025/09/27/volunteer-outdoors-in-mountain-view-shoreline',
    category: 'Community Engagement',
    task: '25',
    date: '9/27',
    time: '9 AM-12 PM'
  },
  {
    name: 'Kennedy Grove Nature Hike (Task 25)',
    coords: [37.9694, -122.3508], // Kennedy Grove, El Sobrante
    link: 'https://www.eventbrite.com/e/kennedy-grove-nature-hike-tickets-1542856177359',
    category: 'Community Engagement',
    task: '25',
    date: '9/7',
    time: '9 AM-12 PM'
  },
  {
    name: 'Bay Adapt Summit - San Francisco (Task 25)',
    coords: [37.7749, -122.4194], // San Francisco (Green Street area)
    link: 'https://www.eventbrite.com/e/2025-rising-together-the-bay-adapt-summit-registration-1461901971149',
    category: 'Community Engagement',
    task: '25',
    date: '9/15',
    time: '1-7:30 PM'
  },
  {
    name: 'Morning Sun Saunter - Sausalito (Task 25)',
    coords: [37.8590, -122.4852], // Morning Sun Trailhead, Sausalito
    link: 'https://www.eventbrite.com/e/morning-sun-saunter-tickets-1559951259209',
    category: 'Community Engagement',
    task: '25',
    date: '9/20',
    time: '9 AM-1 PM'
  },
  {
    name: 'Golden Gate Park Oak Woodlands Restoration (Task 25)',
    coords: [37.7694, -122.4862], // Golden Gate Park, San Francisco
    link: 'https://cnps-yerbabuena.org/calendar/',
    category: 'Community Engagement',
    task: '25',
    date: '9/13',
    time: '10 AM-12:30 PM'
  },
  {
    name: 'Rancho Corral de Tierra - Half Moon Bay (Task 25)',
    coords: [37.4636, -122.4286], // Half Moon Bay area
    link: 'https://cnps-yerbabuena.org/calendar/',
    category: 'Community Engagement',
    task: '25',
    date: '9/18 & 10/16',
    time: '9:30 AM-12:30 PM'
  },
  {
    name: 'Lakeview Ashton Outcrop - San Francisco (Task 25)',
    coords: [37.7280, -122.4530], // Lakeview District, San Francisco
    link: 'https://cnps-yerbabuena.org/calendar/',
    category: 'Community Engagement',
    task: '25',
    date: '9/20',
    time: '9:30 AM-12 PM'
  },
  {
    name: 'Eco Patch Volunteer - San Francisco (Task 25)',
    coords: [37.7515, -122.4180], // Vermont St area, San Francisco
    link: 'https://cnps-yerbabuena.org/calendar/',
    category: 'Community Engagement',
    task: '25',
    date: '9/20 & 10/18',
    time: '10 AM-12 PM'
  },
  {
    name: 'Restoration Party, Pier 94 - San Francisco (Task 25)',
    coords: [37.7580, -122.3876], // Pier 94, San Francisco
    link: 'https://cnps-yerbabuena.org/calendar/',
    category: 'Community Engagement',
    task: '25',
    date: '10/4',
    time: '10 AM-12:30 PM'
  },

  // Task 26: Workshops
  {
    name: 'Bike Safety Workshop - Sunnyvale Public Library (Task 26)',
    coords: [37.3688, -122.0363], // Sunnyvale Public Library
    link: 'https://www.sunnyvale.ca.gov/Home/Components/Calendar/Event/8759/19?curm=9&cury=2025',
    category: 'Community Engagement',
    task: '26',
    date: '9/13 & 10/11',
    time: '10 AM - 3 PM'
  },
  {
    name: 'Bay Area Youth Climate Summit (Task 26)',
    coords: [37.7749, -122.4194], // The General\'s Residence San Francisco
    link: 'https://www.baycs.org/events',
    category: 'Community Engagement',
    task: '26',
    date: '9/21',
    time: '9 AM - 3 PM'
  },

  // Task 28: Farmers Market
  {
    name: 'Meet Councilmember Candelas @ Farmer\'s Market (Task 28)',
    coords: [37.2963, -121.8006], // Evergreen Village Square
    link: 'https://www.sanjoseca.gov/your-government/departments-offices/mayor-and-city-council/district-8/upcoming-events',
    category: 'Community Engagement',
    task: '28',
    date: '9/21, 10/19',
    time: '10 AM - 12 PM'
  },
  {
    name: 'Sunnyvale Farmers Market (Task 28)',
    coords: [37.3688, -122.0363], // Sunnyvale
    link: 'https://www.sunnyvale.ca.gov/Home/Components/Calendar/Event/8580/19?curm=10&cury=2025',
    category: 'Community Engagement',
    task: '28',
    date: 'Every Saturday',
    time: '9 AM'
  },

  // Task 29: Sustainability Events
  {
    name: 'Hazardous Waste Drop-Off (Task 29)',
    coords: [37.3688, -122.0363], // Sunnyvale
    link: 'https://www.sunnyvale.ca.gov/Home/Components/Calendar/Event/7301/19?curm=10&cury=2025',
    category: 'Community Engagement',
    task: '29',
    date: '10/11',
    time: 'TBD'
  },
  {
    name: 'Family Harvest Food Giveaway Program (Task 29)',
    coords: [37.3382, -121.8863], // Columbia Middle School Parking Lot
    link: 'https://www.sunnyvale.ca.gov/Home/Components/Calendar/Event/8013/19?curm=9&cury=2025',
    category: 'Community Engagement',
    task: '29',
    date: 'Sep 24th & Oct 22nd',
    time: '4:15 - 5:15 PM'
  },

  // Task 30: Weekly events
  {
    name: 'Morning Wildcat Loop Trail Hike (Task 30)',
    coords: [37.3230, -122.0839], // Rancho San Antonio
    link: 'https://csix.org/event/morning-wildcat-loop-trail-hike-at-rancho-san-antonio-2025-08-05/',
    category: 'Community Engagement',
    task: '30',
    date: 'Weekly Tuesdays',
    time: '7 AM - 8:30 AM'
  },
  {
    name: 'FUN walking and socializing - Linda Vista Park (Task 30)',
    coords: [37.3230, -122.0322], // Linda Vista Park
    link: 'https://walkbikecupertino.org/events/teamup-calendar/',
    category: 'Community Engagement',
    task: '30',
    date: 'Weekly Thursdays',
    time: '5:45 PM - 6:45 PM'
  },
  {
    name: 'Garden 2 Table SV (Task 30)',
    coords: [37.3382, -121.8863], // 200 W Taylor St, San Jose
    link: 'https://www.garden2tablesv.org/',
    category: 'Community Engagement',
    task: '30',
    date: 'Weekly Mon/Wed/Sat',
    time: '4:00-5:00 PM / 11:00 AM-12:00 PM'
  },
  {
    name: 'Lake Chabot Reservoir Hike (Task 30)',
    coords: [37.7021, -122.1186], // Lake Chabot, Castro Valley
    link: 'https://act.sierraclub.org/events/details?formcampaignid=701Po000015SPMiIAO&mapLinkHref=',
    category: 'Community Engagement',
    task: '30',
    date: 'Weekly',
    time: '4 PM'
  },
  {
    name: 'Youth Garden - Veggielution (Task 30)',
    coords: [37.3382, -121.8863], // King Rd, San Jose
    link: 'https://veggielution.org/calendar/33gd737lx9zsj6s-5zp4p-9c4w2',
    category: 'Community Engagement',
    task: '30',
    date: 'Weekly Saturdays',
    time: '10 AM - 12:30 PM'
  },
  {
    name: 'Veggielution Farmstand (Task 30)',
    coords: [37.3382, -121.8863], // King Rd, San Jose
    link: 'https://veggielution.org/calendar/ysf5axheynnwnnt-7n6jn',
    category: 'Community Engagement',
    task: '30',
    date: 'Weekly Saturdays',
    time: 'Various times'
  },

  // Task 32: Committee meetings (in-person locations only)
  {
    name: 'Climate Action Committee Meeting - Quinlan Community Center (Task 32)',
    coords: [37.3230, -122.0322], // Quinlan Community Center, Cupertino
    link: 'https://portal.cllimate-action-committee-meeting',
    category: 'Community Engagement',
    task: '32',
    date: '9/3 & 10/1',
    time: '10:30 AM - 11:45 AM'
  }

];

const markers = L.layerGroup();
eventLocations.forEach((e) => {
  L.marker(e.coords)
    .addTo(markers)
    .bindPopup(`
      <div style="font-family: Arial, sans-serif; max-width: 250px;">
        <strong style="color: #0e7c7b; font-size: 14px;">${e.name}</strong><br/>
        <span style="color: #666; font-size: 12px;"><strong>Category:</strong> ${e.category}</span><br/>
        <span style="color: #666; font-size: 12px;"><strong>Date:</strong> ${e.date}</span><br/>
        <span style="color: #666; font-size: 12px;"><strong>Time:</strong> ${e.time}</span><br/>
        <a href="${e.link}" target="_blank" style="color: #0e7c7b; text-decoration: none; font-weight: bold; margin-top: 8px; display: inline-block;">More info & Registration →</a>
      </div>
    `);
});
markers.addTo(map);

// Fit map to markers if no geolocation was used to set view recently
if (!map._loaded || map.getZoom() === defaultZoom && map.getCenter().lat === defaultCenter[0]) {
  try {
    const bounds = L.latLngBounds(eventLocations.map((e) => e.coords));
    map.fitBounds(bounds.pad(0.15));
  } catch (_) {
    // ignore
  }
}


