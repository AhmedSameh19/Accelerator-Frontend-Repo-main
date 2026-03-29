import axios from 'axios';
import Cookies from 'js-cookie';
import { CRM_ACCESS_TOKEN_KEY } from '../../utils/tokenKeys';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';

// Remove the hardcoded API key - we'll use the user's access token
const API_URL = "https://gis-api.aiesec.org/graphql";
const API_BASE_URL = process.env.REACT_APP_FASTAPI_BASE || 'https://api-accelerator.aiesec.org.eg/api/v1';
const SERVER_URL = API_BASE_URL;


const queryAPDs = `query{allOpportunityApplication(
    filters:{
      date_approved:{from:"01/07/2024"}
    }
    page:1
    per_page:1000
  ){
    paging{
      total_items
    }
    data{
      person{
        id
        created_at
        lc_alignment {
          keywords
        }
        full_name
        email
        contact_detail{
          phone
        }
        home_lc{
          name
        }
        home_mc{
          name
        }
      }
      opportunity{
        id
        title
        sub_product{
          name
        }
        programme{
          short_name_display
        }
        host_lc{
          name
        }
        home_mc{
          name
        }
        remote_opportunity
        project_fee
        earliest_start_date
        latest_end_date
        specifics_info{
          salary
          salary_currency{
            alphabetic_code
          }
        }
        opportunity_duration_type{
          duration_type
          salary
        }
      }
      slot{
        start_date
        end_date
      }
      status
      updated_at
      date_approved
      date_realized
      experience_end_date
      standards{
        standard_option{
          meta
        }
      }
    }
  }
}`;

const queryBreaks = `query{allOpportunityApplication(
    filters:{
      last_interaction:{from:"01/07/2022"}
      statuses:["approval_broken","realization_broken"]
    }
    page:1
    per_page:1000
  ){
    data{
      person{
        id
      }
      opportunity{
        id
      }
      status
    }
  }
}`;

async function fetchData(query) {
  try {
    const accessToken = Cookies.get(CRM_ACCESS_TOKEN_KEY);

    if (!accessToken) {
      console.error('No access token found. User must be authenticated.');
      throw new Error('Authentication required. Please log in.');
    }

    console.log('Making API request with query:', query);
    console.log('API URL:', `${API_URL}?access_token=${accessToken}`);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'access_token': accessToken
    });

    const response = await axios({
      method: 'post',
      url: `${API_URL}?access_token=${accessToken}`,
      data: { query },
      headers: {
        'Content-Type': 'application/json',
        'access_token': accessToken
      }
    });

    console.log('API response status:', response.status);
    console.log('API response headers:', response.headers);
    console.log('API response data:', response.data);

    if (!response.data || !response.data.data || !response.data.data.allOpportunityApplication) {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }

    return response.data.data.allOpportunityApplication.data;
  } catch (error) {
    error.friendlyMessage = getFriendlyErrorMessage(error);
    console.error('Error fetching data:', error.friendlyMessage);
    throw error;
  }
}

function processApplicationData(data) {
  return data.map(app => {
    console.log('Processing application:', app);
    return {
      // EP ID_Opp ID
      id: `${app.person.id}_${app.opportunity?.id || ''}`,

      // Basic Information
      fullName: app.person.full_name,
      status: app.status,
      email: app.person.email,
      phone: app.person.contact_detail?.phone || "",

      // Location Information
      homeMC: app.person.home_mc.name,
      homeLC: app.person.home_lc.name,
      hostMC: app.opportunity?.home_mc?.name || "",
      hostLC: app.opportunity?.host_lc?.name || "",

      // Opportunity Information
      opportunityLink: app.opportunity ? `https://expa.aiesec.org/opportunities/${app.opportunity.id}` : "",
      programme: app.opportunity?.programme?.short_name_display || "",
      durationType: app.opportunity?.opportunity_duration_type?.duration_type || "",

      // Dates
      apdDate: app.date_approved ? app.date_approved.substring(0, 10) : app.updated_at.substring(0, 10),
      slotStartDate: app.slot?.start_date || "",
      slotEndDate: app.slot?.end_date || "",
      realizedDate: app.date_realized ? app.date_realized.substring(0, 10) : "",
      finishDate: app.experience_end_date ? app.experience_end_date.substring(0, 10) : "",
      remoteDate: app.status === "remote_realized" ? app.updated_at.substring(0, 10) : "",

      // Additional Information
      subProduct: app.opportunity?.sub_product?.name || "",
      title: app.opportunity?.title || "",
      campus: app.person.lc_alignment?.keywords || "-",
      signupDate: app.person.created_at ? app.person.created_at.substring(0, 10) : "",

      // Additional fields for display
      isRemote: app.opportunity?.remote_opportunity ? "Yes" : "No",
      lcAlignment: app.person.lc_alignment?.keywords || "-",
      createdAt: app.person.created_at
    };
  });
}

// async function getRealizations() {
//   try {
//     console.log('Starting getRealizations...');

//     // Check if user is authenticated
//     const accessToken = Cookies.get(CRM_ACCESS_TOKEN_KEY);
//     if (!accessToken) {
//       console.error('No access token found. User must be authenticated.');
//       throw new Error('Authentication required. Please log in to view realizations data.');
//     }

//     console.log('Access token found, proceeding with API request...');

//     // Fetch all applications
//     const applications = await fetchData(queryAPDs);
//     console.log('Fetched applications:', applications);

//     if (!applications || applications.length === 0) {
//       console.log('No applications found, using test data');
//       return testData;
//     }

//     // Process the data
//     const processedData = processApplicationData(applications);
//     console.log('Processed data:', processedData);

//     // List of Egyptian LCs
//     const egyptianLCs = [
//       'ain shams university',
//       'helwan',
//       'alexandria',
//       'aast in cairo',
//       'menofia',
//       'msa',
//       'suez',
//       'mc egypt',
//       '6th october university',
//       'aast alexandria',
//       'guc',
//       'galala',
//       'tanta',
//       'beni suef',
//       'cairo university',
//       'mansoura',
//       'miu',
//       'must',
//       'auc',
//       'zagazig',
//       'new capital'
//     ];

//     // Separate ICX and OGX applications with detailed logging
//     console.log('Filtering ICX applications...');
//     const icxApplications = processedData.filter(app => {
//       // Check if the hostLC is an Egyptian LC
//       const isICX = app.hostLC && egyptianLCs.some(lc =>
//         app.hostLC.toLowerCase().includes(lc.toLowerCase())
//       );
//       console.log(`Application ${app.id}:`, {
//         hostLC: app.hostLC,
//         isICX: isICX
//       });
//       return isICX;
//     });
//     console.log('ICX applications:', icxApplications);

//     console.log('Filtering OGX applications...');
//     const ogxApplications = processedData.filter(app => {
//       // Check if the homeLC is an Egyptian LC
//       const isOGX = app.homeLC && egyptianLCs.some(lc =>
//         app.homeLC.toLowerCase().includes(lc.toLowerCase())
//       );
//       console.log(`Application ${app.id}:`, {
//         homeLC: app.homeLC,
//         isOGX: isOGX
//       });
//       return isOGX;
//     });
//     console.log('OGX applications:', ogxApplications);

//     // If no applications found in either category, use test data
//     if (icxApplications.length === 0 && ogxApplications.length === 0) {
//       console.log('No applications found in either category, using test data');
//       return testData;
//     }

//     // Fetch and process breaks
//     const breaks = await fetchData(queryBreaks);
//     console.log('Fetched breaks:', breaks);

//     const breakMap = new Map(
//       breaks.map(break_ => [`${break_.person.id}_${break_.opportunity.id}`, break_.status])
//     );

//     // Update status for broken applications
//     const updateBreaks = (applications) => {
//       return applications.map(app => {
//         const breakStatus = breakMap.get(app.id);
//         if (breakStatus) {
//           return { ...app, status: breakStatus };
//         }
//         return app;
//       });
//     };

//     const result = {
//       icx: updateBreaks(icxApplications),
//       ogx: updateBreaks(ogxApplications)
//     };
//     console.log('Final result:', result);
//     return result;
//   } catch (error) {
//     console.error('Error in getRealizations:', error);

//     // If it's an authentication error, throw it to be handled by the UI
//     if (error.message.includes('Authentication required')) {
//       throw error;
//     }

//     console.log('Using test data due to error');
//     return testData;
//   }
// }
async function getRealizations({ lcCode, page = 1, limit = 50 }) {
  try {
    const response = await axios.get(`${API_BASE_URL}/realizations/`, {
      params: { home_lc_id: lcCode, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching realizations:', error);
    throw error;
  }
}
async function getStandards(epId) {
  if (!epId) throw new Error('EP ID is required');

  try {
    const response = await axios.get(`${API_BASE_URL}/realizations/standards/${epId}`);
    console.log('EP standards fetched successfully:', response.data.data);
    return response?.data?.data || response?.data || response?.items || {}; // return the object with all columns
  } catch (error) {
    console.error('Error fetching EP standards:', error);
    throw error;
  }
}

async function updateStandards(epId, standards) {
  try {
    const allowedKeys = new Set([
      'health_insurance',
      'expectation_settings',
      'visa_and_work_permit',
      'communication_10_days_before',
      'arrival_pickup',
      'accommodation',
      'ips',
      'ops',
      'pgs',
      'alignment_space',
      'first_day_of_work',
      'job_description',
      'working_hours',
      'duration',
      'opportunity_benefits',
      'value_driven_leadership_education',
      'communication_first_10_days',
      'communication_second_10_days',
      'communication_third_10_days',
      'communication_fourth_10_days',
      'departure_support',
      'debrief',
    ]);

    const legacyToApiKey = {
      // Preparation steps tab legacy keys
      healthinsurancecompleted: 'health_insurance',
      expectationsettingscompleted: 'expectation_settings',
      communicationcompleted: 'communication_10_days_before',
      accommodationcompleted: 'accommodation',
      psgcompleted: 'pgs',
      opscompleted: 'ops',
      ipscompleted: 'ips',

      // Experience tab legacy keys
      alignmentspacesdone: 'alignment_space',
      firstdayofworkdone: 'first_day_of_work',
      jobdescriptiondone: 'job_description',
      workinghoursmatchopp: 'working_hours',
      minimumdurationreached: 'duration',
      benefitsdelivered: 'opportunity_benefits',
      valuedriveneducationdelivered: 'value_driven_leadership_education',
      firsttendayscommunication: 'communication_first_10_days',
      secondtendayscommunication: 'communication_second_10_days',
      thirdtendayscommunication: 'communication_third_10_days',
      fourthtendayscommunication: 'communication_fourth_10_days',
      departuredone: 'departure_support',

      // Post experience legacy typo
      debreif: 'debrief',
    };

    const normalizePatch = (input) => {
      if (!input || typeof input !== 'object') return {};

      // Support legacy wrapper payloads: { standardName, value }
      if ('standardName' in input && 'value' in input) {
        const mappedKey = legacyToApiKey[input.standardName] || input.standardName;
        return allowedKeys.has(mappedKey) ? { [mappedKey]: input.value } : {};
      }

      const patch = {};
      for (const [key, value] of Object.entries(input)) {
        // Ignore wrapper-like keys if they appear alongside others
        if (key === 'standardName' || key === 'value' || key === 'standardKey') continue;

        const mappedKey = legacyToApiKey[key] || key;
        if (!allowedKeys.has(mappedKey)) continue;
        patch[mappedKey] = value;
      }
      return patch;
    };

    const patch = normalizePatch(standards);
    if (!Object.keys(patch).length) {
      throw new Error('No valid OGX standards fields to update');
    }

    const response = await axios.patch(`${API_BASE_URL}/realizations/standards/${epId}`, patch);
    return response.data;
  } catch (error) {
    console.error('Error in updateStandards:', error);
    throw error;
  }
}

async function bulkAssignLeads(data) {
  try {
    console.log("Lead IDs: ", data);
    const response = await axios.patch(`${API_BASE_URL}/realizations/assign/bulk/`, data);
    console.log('Bulk assign response:', response.data);
    return response.data;
  }
  catch (error) {
    console.error('Error bulk assigning leads:', error);
    throw error;
  }
}

async function getLeadAssignments() {
  try {
    const response = await axios.get(`${API_BASE_URL}/realizations/assignments/`);
    return response.data;
  }
  catch (error) {
    console.error('Error fetching lead assignments:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// iCX Realizations (DB-backed)
// Backend:
//   GET   /api/v1/icx/realizations?host_lc_id=...
//   PATCH /api/v1/icx/realizations/assign/bulk   { application_ids, member_id }
// ---------------------------------------------------------------------------

async function getICXRealizations({ hostLcId, page = 1, limit = 50 }) {
  if (hostLcId == null) throw new Error('host_lc_id is required');

  try {
    const response = await axios.get(`${API_BASE_URL}/icx/realizations/`, {
      params: { host_lc_id: String(hostLcId), page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching iCX realizations:', error);
    throw error;
  }
}

async function bulkAssignICXRealizations({ application_ids, member_id } = {}) {
  try {
    const payload = {
      application_ids: Array.isArray(application_ids) ? application_ids : [],
      member_id,
    };

    const response = await axios.patch(`${API_BASE_URL}/icx/realizations/assign/bulk/`, payload);
    return response?.data || response;
  } catch (error) {
    console.error('Error bulk assigning iCX realizations:', error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// iCX Realizations Standards (DB-backed)
// Backend:
//   GET   /api/v1/icx/realizations/standards/{application_id}
//   PATCH /api/v1/icx/realizations/standards/{application_id}
// ---------------------------------------------------------------------------

async function getICXRealizationsStandards(applicationId) {
  if (!applicationId) throw new Error('application_id is required');

  try {
    const response = await axios.get(`${API_BASE_URL}/icx/realizations/standards/${applicationId}`);
    return response?.data || {};
  } catch (error) {
    console.error('Error fetching iCX realization standards:', error);
    throw error;
  }
}

async function patchICXRealizationsStandards(applicationId, standards) {
  if (!applicationId) throw new Error('application_id is required');

  try {
    const allowedKeys = new Set([
      'health_insurance',
      'expectation_settings',
      'visa_and_work_permit',
      'communication_10_days_before',
      'arrival_pickup',
      'accommodation',
      'ips',
      'ops',
      'pgs',
      'alignment_space',
      'first_day_of_work',
      'job_description',
      'working_hours',
      'duration',
      'opportunity_benefits',
      'value_driven_leadership_education',
      'communication_first_10_days',
      'communication_second_10_days',
      'communication_third_10_days',
      'communication_fourth_10_days',
      'departure_support',
      'debrief',
    ]);

    const legacyToApiKey = {
      healthinsurancecompleted: 'health_insurance',
      expectationsettingscompleted: 'expectation_settings',
      communicationcompleted: 'communication_10_days_before',
      accommodationcompleted: 'accommodation',
      psgcompleted: 'pgs',
      opscompleted: 'ops',
      ipscompleted: 'ips',

      alignmentspacesdone: 'alignment_space',
      firstdayofworkdone: 'first_day_of_work',
      jobdescriptiondone: 'job_description',
      workinghoursmatchopp: 'working_hours',
      minimumdurationreached: 'duration',
      benefitsdelivered: 'opportunity_benefits',
      valuedriveneducationdelivered: 'value_driven_leadership_education',
      firsttendayscommunication: 'communication_first_10_days',
      secondtendayscommunication: 'communication_second_10_days',
      thirdtendayscommunication: 'communication_third_10_days',
      fourthtendayscommunication: 'communication_fourth_10_days',
      departuredone: 'departure_support',
      debreif: 'debrief',
    };

    const normalizePatch = (input) => {
      if (!input || typeof input !== 'object') return {};

      if ('standardName' in input && 'value' in input) {
        const mappedKey = legacyToApiKey[input.standardName] || input.standardName;
        return allowedKeys.has(mappedKey) ? { [mappedKey]: input.value } : {};
      }

      const patch = {};
      for (const [key, value] of Object.entries(input)) {
        if (key === 'standardName' || key === 'value' || key === 'standardKey') continue;
        const mappedKey = legacyToApiKey[key] || key;
        if (!allowedKeys.has(mappedKey)) continue;
        patch[mappedKey] = value;
      }
      return patch;
    };

    const patch = normalizePatch(standards);
    if (!Object.keys(patch).length) {
      throw new Error('No valid iCX standards fields to update');
    }

    const response = await axios.patch(
      `${API_BASE_URL}/icx/realizations/standards/${applicationId}`,
      patch,
    );
    return response?.data || response;
  } catch (error) {
    console.error('Error patching iCX realization standards:', error);
    throw error;
  }
}

export {
  getRealizations,
  updateStandards,
  getStandards,
  bulkAssignLeads,
  getLeadAssignments,
  getICXRealizations,
  bulkAssignICXRealizations,
  getICXRealizationsStandards,
  patchICXRealizationsStandards,
};
