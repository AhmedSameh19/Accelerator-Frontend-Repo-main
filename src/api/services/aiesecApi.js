import axios from 'axios';
import Cookies from 'js-cookie';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';

// AIESEC API Access Token
const ACCESS_TOKEN = "BKueT_b0BFOqRiIEbGVKtYf2D9E-Pg2EUSOVC8NPt84";
const API_URL = "https://gis-api.aiesec.org/graphql";
const lcCodes = {
  2820: "6th October University",
  1788: "AAST Alexandria",
  1322: "AAST in Cairo",
  1789: "Ain Shams University",
  899: "Alexandria",
  1489: "AUC",
  2126: "Beni Suef",
  1064: "Cairo University",
  109: "Damietta",
  5688: "Galala",
  257: "GUC",
  2124: "Helwan",
  171: "Mansoura",
  1727: "Menofia",
  2125: "MIU",
  2817: "MSA",
  2818: "MUST",
  15: "Suez",
  1725: "Tanta",
  1114: "Zagazig",
  6683: "New Capital",
  1609: "MC Egypt"
};

// Convert product code to readable name
export const changeProductCode = (num) => {
  const strNum = String(num);
  switch (strNum) {
    case "7": return "GV New";
    case "8": return "GTa";
    case "9": return "GTe";
    case "1": return "GV Old";
    case "2": return "GT";
    case "5": return "GE";
    default: return "-";
  }
};

// Fetch signups from AIESEC API
export const fetchSignups = async (startDate = "2025-08-01", lcCode = Cookies.get('userLC')) => {
  // Helper to get YYYY-MM-DD string
  const formatDate = (date) => date.toISOString().split('T')[0];

  // If MC Egypt, split into 6-month chunks to avoid 10k cap
  if (lcCode === 1609) {
    let allLeads = [];
    let from = new Date(startDate);
    const today = new Date();
    while (from < today) {
      let to = new Date(from);
      to.setMonth(to.getMonth() + 6);
      if (to > today) to = today;
      // Use chunked date range
      const querySignups = `query {
        people(
          filters: {
            home_committee: 1609,
            registered: { from: "${formatDate(from)}", to: "${formatDate(to)}" },
            sort: created_at
          },
          per_page: 3,
          page: 1
        ) {
          data {
            created_at
            id
            full_name
            email
            phone
            gender
            dob
            status
            academic_experiences {
              backgrounds {
                name
              }
            }
            person_profile {
              selected_programmes
            }
            home_lc {
              name
            }
            home_mc {
              name
            }
            is_aiesecer
            referral_type
            lc_alignment {
              keywords
            }
            latest_graduation_date
            opportunity_applications_count
          }
        }
      }`;
      const response = await axios.post(
        `${API_URL}?access_token=${ACCESS_TOKEN}`,
        { query: querySignups },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const responseData = response.data;
      if (responseData.errors) {
        console.error("API Error:", responseData.errors);
        break;
      }
      const peopleData = responseData.data.people;
      if (peopleData && peopleData.data && peopleData.data.length > 0) {
        allLeads = allLeads.concat(peopleData.data.map(data => {
          const backgrounds = (data.academic_experiences?.[0]?.backgrounds?.map(bg => bg.name) || []).join(",");
          return {
            id: data.id,
            created_at: data.created_at.substring(0, 10),
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            dob: data.dob,
            status: data.status,
            product: data.person_profile ? changeProductCode(data.person_profile.selected_programmes) : "-",
            background: backgrounds,
            lc: data.home_lc?.name || "-",
            mc: data.home_mc?.name || "-",
            keywords: data.lc_alignment?.keywords || "-",
            is_aiesecer: data.is_aiesecer === false ? "No" : "Yes",
            referral: data.referral_type || "-",
            applications: data.opportunity_applications_count || 0,
            graduation: data.latest_graduation_date ? data.latest_graduation_date.substring(0, 10) : "-"
          };
        }));
      }
      // Next chunk
      from = to;
      from.setDate(from.getDate() + 1); // Avoid overlap
    }
    return allLeads;
  }

  // Allow MC Egypt (1609) even if not in lcCodes
  if (!lcCodes[lcCode]) {
    console.error("No LC name found for this LC code.");
    return [];
  }

  try {
    let allLeads = [];
    let page = 1;
    const perPage = 100;
    let keepFetching = true;
    while (keepFetching) {
      const querySignups = `query {
      people(
        filters: {
          home_committee: ${lcCode},
          registered: { from: "${startDate}" },
          sort: created_at
        },
          per_page: ${perPage},
          page: ${page}
      ) {
        data {
          created_at
          id
          full_name
          email
          phone
          gender
          dob
          status
          academic_experiences {
            backgrounds {
              name
            }
          }
          person_profile {
            selected_programmes
          }
          home_lc {
            name
          }
          home_mc {
            name
          }
          is_aiesecer
          referral_type
          lc_alignment {
            keywords
          }
          latest_graduation_date
          opportunity_applications_count
        }
      }
    }`;

      const response = await axios.post(
        `${API_URL}?access_token=${ACCESS_TOKEN}`,
        { query: querySignups },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const responseData = response.data;

      if (responseData.errors) {
        console.error("API Error:", responseData.errors);
        break;
      }

      const peopleData = responseData.data.people;
      if (!peopleData || !peopleData.data || peopleData.data.length === 0) {
        keepFetching = false;
        break;
      }

      const formattedData = peopleData.data.map(data => {
        const backgrounds = (data.academic_experiences?.[0]?.backgrounds?.map(bg => bg.name) || []).join(",");
        return {
          id: data.id,
          created_at: data.created_at.substring(0, 10),
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          dob: data.dob,
          status: data.status,
          product: data.person_profile ? changeProductCode(data.person_profile.selected_programmes) : "-",
          background: backgrounds,
          lc: data.home_lc?.name || "-",
          mc: data.home_mc?.name || "-",
          keywords: data.lc_alignment?.keywords || "-",
          is_aiesecer: data.is_aiesecer === false ? "No" : "Yes",
          referral: data.referral_type || "-",
          applications: data.opportunity_applications_count || 0,
          graduation: data.latest_graduation_date ? data.latest_graduation_date.substring(0, 10) : "-"
        };
      });

      allLeads = allLeads.concat(formattedData);
      if (formattedData.length < perPage) {
        keepFetching = false;
      } else {
        page += 1;
      }
    }
    return allLeads;
  } catch (error) {
    error.friendlyMessage = getFriendlyErrorMessage(error);
    console.error('Error fetching AIESEC signups:', error.friendlyMessage);
    return [];
  }
};

// Fetch opportunity applications for a lead
export const fetchOpportunityApplications = async (personId, startDate = "2025-08-01") => {
  const query = `query {
    allOpportunityApplication(
      filters: {
        sort: created_at
        person_id: ${personId}
        created_at: { from: "${startDate}" }
      }
      page: 1
      per_page: 1000
    ) {
      data {
        id
        person {
          created_at
          full_name
          id
          contact_detail { phone }
          home_lc { name }
          home_mc { name }
          cvs { url }
        }
        opportunity {
          id
          title
          programme { short_name_display }
          host_lc { name }
          home_mc { name }
        }
        created_at
        date_matched
        date_approved
        date_approval_broken
        date_realized
        experience_end_date
        status
      }
    }
  }`;

  try {
    console.log('Fetching applications for person ID:', personId); // Add logging
    const response = await axios.post(
      `${API_URL}?access_token=${ACCESS_TOKEN}`,
      { query },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data.errors) {
      console.error("API Error:", response.data.errors);
      return [];
    }

    const applications = response.data.data.allOpportunityApplication.data || [];
    console.log('Fetched applications:', applications); // Debug logging
    return applications;
  } catch (error) {
    error.friendlyMessage = getFriendlyErrorMessage(error);
    console.error("Error fetching opportunity applications:", error.friendlyMessage);
    return [];
  }
};

// Fetch detailed person information
export const fetchPersonDetails = async (personId,access_token) => {
  try {
    console.log('🔍 [aiesecApi] Fetching person details for ID:', personId);

    const response = await fetch(`https://gis-api.aiesec.org/v2/people/${personId}?access_token=${access_token}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      console.error('❌ [aiesecApi] Failed to fetch person details:', response.status);
      throw new Error(`Failed to fetch person details: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 [aiesecApi] Person details received:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('❌ [aiesecApi] Error fetching person details:', error);
    throw error;
  }
};

// Fetch current person with detailed information
export const fetchCurrentPersonDetails = async (access_token) => {
  try {
    console.log('🔍 [aiesecApi] Fetching current person details');

    const response = await fetch(`https://gis-api.aiesec.org/v2/current_person?access_token=${access_token}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      console.error('❌ [aiesecApi] Failed to fetch current person details:', response.status);
      throw new Error(`Failed to fetch current person details: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 [aiesecApi] Current person details received:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('❌ [aiesecApi] Error fetching current person details:', error);
    throw error;
  }
};

// Fetch parent details for a person
export const fetchParentDetails = async (personId,access_token) => {
  try {
    console.log('🔍 [aiesecApi] Fetching parent details for person ID:', personId);

    const response = await fetch(`https://gis-api.aiesec.org/v2/people/${personId}/parent?access_token=${access_token}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      console.error('❌ [aiesecApi] Failed to fetch parent details:', response.status);
      throw new Error(`Failed to fetch parent details: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 [aiesecApi] Parent details received:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('❌ [aiesecApi] Error fetching parent details:', error);
    throw error;
  }
};

// Fetch person's manager details
export const fetchManagerDetails = async (personId,access_token) => {
  try {
    console.log('🔍 [aiesecApi] Fetching manager details for person ID:', personId);

    const response = await fetch(`https://gis-api.aiesec.org/v2/people/${personId}/manager?access_token=${access_token}`, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      console.error('❌ [aiesecApi] Failed to fetch manager details:', response.status);
      throw new Error(`Failed to fetch manager details: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 [aiesecApi] Manager details received:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('❌ [aiesecApi] Error fetching manager details:', error);
    throw error;
  }
};
